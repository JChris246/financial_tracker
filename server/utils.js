const http = require("http");
const https = require("https");

const logger = require("./logger").setup();

const isNumber = (value) => {
    return (typeof value === "number" || (typeof value === "string" && isFinite(Number(value)))) && !isNaN(value);
};

const isDefined = (value) => {
    return value !== undefined && value !== null;
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
            response.on("end", () => resolve({ data: Buffer.concat(chunks).toString(), statusCode: response.statusCode }));
            response.on("error", (error) => reject(error));
        });
        req.on("error", (error) => reject(error));
        if (body && body.length > 0)
            req.write(body);
        req.end();
    });
};

module.exports = { isNumber, request, sleep, makeBool, isDefined };