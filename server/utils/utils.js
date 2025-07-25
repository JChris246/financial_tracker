const http = require("http");
const https = require("https");

const logger = require("../logger").setup();

const isNumber = (value) => {
    return (typeof value === "number" || (typeof value === "string" && value !== "" && isFinite(Number(value)))) && !isNaN(value);
};

const isValidArray = (value) => {
    return isDefined(value) && Array.isArray(value) && value.length > 0;
};

const isDefined = (value) => {
    return value !== undefined && value !== null;
};

const isValidString = (value) => {
    return isDefined(value) && typeof value === "string" && value.trim() !== "";
};

const makeBool = (value) => {
    if (!isDefined(value)) {
        return false;
    }

    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "number") {
        return value !== 0;
    }

    if (typeof value !== "string") {
        return false;
    }

    return value.toUpperCase() === "TRUE" || value === "1" || value.toUpperCase() === "YES";
};

const positiveNumberOrZero = (value) => {
    if (!isNumber(value)) {
        return 0;
    }

    return value > 0 ? value : 0;
}

// Note: rounding on the server AND client can result in a higher loss of precision
const toPrecision = (value, precision=4) => {
    if (!isNumber(value)) {
        return value;
    }

    return Number(value.toFixed(precision));
}

// here is where code sharing would be useful
const pad = (v, n = 2) => {
    v = v + ""; // convert to string
    if (v.length >= n)
        return v;
    for (let i = 0; i < n; i++) {
        v = "0" + v;
        if (v.length >= n)
            break;
    }
    return v;
};

const padRight = (v, n, c) => {
    v = v + ""; // convert to string
    if (v.length >= n) {
        return v;
    }

    for (let i = 0; i < n; i++) {
        v = v + c;
        if (v.length >= n) {
            break;
        }
    }
    return v;
}

const formatDate = (d) => {
    if (typeof d === "string") {
        d = d.trim();
    }

    if (!d) {
        return "";
    }

    if (typeof d === "string" || typeof d === "number") {
        d = new Date(d);
    } else if (!(d instanceof Date)) {
        return "";
    }

    if (d.toString() === "Invalid Date") {
        return "";
    }

    const date = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    const time = pad(d.getHours()) + ":" + pad(d.getMinutes());

    return date + " " + time; // YYYY-MM-DD hh:mm - 2022-01-07 23:43
};

const format = (str, args) => {
    // use replace to iterate over the string
    // select the match and check if the related argument is present
    // if yes, replace the match with the argument
    return str.replace(/{([0-9]+)}/g, function (match, index) {
        // check if the argument is present
        return typeof args[index] == "undefined" ? match : args[index];
    });
};

const parseDate = d => {
    if (typeof d === "string") {
        d = d.trim();

        const dateRegex = /^(?<year>\d{4})[-/](?<month>\d{2})[-/](?<day>\d{2})(?:\s+(?<hr>\d{1,2})[:_](?<min>\d{2})(?:[:_](?<sec>\d{2}))?)?$/;
        const reverseDateRegex = /^(?<day>\d{2})[-/](?<month>\d{2})[-/](?<year>\d{4})(?:\s+(?<hr>\d{1,2})[:_](?<min>\d{2})(?:[:_](?<sec>\d{2}))?)?$/;
        let match = d.match(dateRegex);

        if (match) {
            if (match.groups.sec) {
                return new Date(Number(match[1]), match[2] - 1, Number(match[3]), Number(match[4]), Number(match[5]), Number(match[6]))
            }

            if (match.groups.min) {
                return new Date(Number(match[1]), match[2] - 1, Number(match[3]), Number(match[4]), Number(match[5]))
            }

            if (match.groups.day) {
                return new Date(Number(match[1]), match[2] - 1, Number(match[3]))
            }
        }

        match = d.match(reverseDateRegex);
        if (match) {
            if (match.groups.sec) {
                return new Date(Number(match[3]), match[2] - 1, Number(match[1]), Number(match[4]), Number(match[5]), Number(match[6]))
            }

            if (match.groups.min) {
                return new Date(Number(match[3]), match[2] - 1, Number(match[1]), Number(match[4]), Number(match[5]))
            }

            if (match.groups.day) {
                return new Date(Number(match[3]), match[2] - 1, Number(match[1]))
            }
        }
    }

    if (typeof d === "string" || typeof d === "number") {
        d = new Date(d);
    } else if (!(d instanceof Date)) {
        return null;
    }

    if (d.toString() === "Invalid Date") {
        return null;
    }

    return d;
};

// adapted from
// https://github.com/JabbR/JabbR/blob/eb5b4e2f1e5bdbb1ea91230f1884716170a6976d/JabbR/Chat.utility.js#L50
const generateId = () => {
    const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4() + "-" + new Date().getTime());
};

// this is meant to run on an array of strings, but probably will work with other array elements types as well
const distinctCaseIgnore = (arr) => {
    if (!isValidArray(arr)) {
        return arr;
    }

    const itemSet = new Set();

    // sqlite doesn't seem to be great at ignoring case
    for (let i = 0; i < arr.length; i++) {
        const lowerInvariant = isValidString(arr[i]) ? arr[i].toLowerCase() : arr[i];
        if (!itemSet.has(lowerInvariant)) {
            itemSet.add(lowerInvariant);
        }
    }

    return Array.from(itemSet);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const request = ({ site, port, path, method="POST", body="", headers={} }) => {
    const options = {
        port,
        path,
        method,
        headers: {
            "Content-Type": "application/json",
            ...headers
        }
    };

    if (!site) {
        logger.error("No site string provided");
        throw new Error("Bad Site String");
    }

    const match = site.match("https?://([^/]+)/?");
    if (!match) {
        logger.error("Bad site string provided: " + site);
        throw new Error("Bad Site String");
    }

    options.hostname = match[1];

    const requester = site.startsWith("https") ? https : http;
    logger.debug("using " + (site.startsWith("https") ? "https" : "http"));

    return new Promise((resolve, reject) => {
        const req = requester.request(options, (response) => {
            let chunks = [];

            response.on("data", fragments => chunks.push(fragments));
            response.on("end", () => resolve({
                data: Buffer.concat(chunks).toString(),
                statusCode: response.statusCode,
                headers: response.headers
            }));
            response.on("error", (error) => reject(error));
        });
        req.on("error", (error) => reject(error));
        if (body && body.length > 0)
            req.write(body);
        req.end();
    });
};

module.exports = { isNumber, request, sleep, makeBool, isDefined, format, isValidArray,
    positiveNumberOrZero, toPrecision, formatDate, pad, isValidString, padRight, parseDate, generateId, distinctCaseIgnore };