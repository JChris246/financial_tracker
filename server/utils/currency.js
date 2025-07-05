const { request, format, isDefined, sleep } = require("./utils");
const { FIAT_CURRENCIES, CRYPTO_CURRENCIES, CRYPTO_CURRENCY_NAMES } = require("./constants");

const logger = require("../logger").setup();

const GOOGLE_URL = "https://www.google.com";
const GOOGLE_FINANCE_URL_PATH = "/finance/quote/{0}-{1}"; // this can work for fiat and crypto
const COIN_GECKO_URL = "https://api.coingecko.com"
const COIN_GECKO_API_PATH = "/api/v3/simple/price?ids={0}&vs_currencies={1}"

const FIAT_BASE = "usd";
const BUFFER_SIZE = 15;

// note: this api endpoint can return non values as a rate limit feature
const getConversionRate = async ([from, to], retry=3) => {
    if (from === to) {
        logger.warn("Same currency: " + from);
        return 1;
    }

    if (!FIAT_CURRENCIES.includes(from.toLowerCase()) || !FIAT_CURRENCIES.includes(to.toLowerCase())) {
        logger.error("Invalid currency: " + from + " - " + to);
        return null;
    }

    const { data, statusCode } = await request({ site: GOOGLE_URL, path: format(GOOGLE_FINANCE_URL_PATH, [from, to]), method: "GET" });

    if (statusCode !== 200) {
        logger.error("Conversion rate request failed with status code: " + statusCode);
        return null;
    }

    const [sourceMatch, targetMatch, priceMatch] =
        [data.match(/data-source="([a-zA-Z]+)"/), data.match(/data-target="([a-zA-Z]+)"/), data.match(/data-last-price="([0-9.]+)"/)];

    if (!sourceMatch || !targetMatch || !priceMatch) {
        if (retry > 0) {
            logger.warn("Could not find conversion rate: " + from + " to " + to + " - retrying");
            await sleep(2000);
            return getConversionRate([from, to], retry - 1);
        }
        logger.error("Could not find conversion rate: " + from + " to " + to);
        return null;
    }

    if (sourceMatch.length < 2 || targetMatch.length < 2 || priceMatch.length < 2) {
        logger.error("Currency match not found");
        return null;
    }

    if (sourceMatch[1].toLowerCase() !== from.toLowerCase() || targetMatch[1].toLowerCase() !== to.toLowerCase()) {
        logger.error("Conversion rate mismatch: " + sourceMatch[1] + " to " + targetMatch[1]);
        return null;
    }

    return Number(priceMatch[1]);
}

// note: this api endpoint does suffer from 429
// crypto must be the full name, while fiat is the code
const getConversionCoinGecko = async (crypto, fiat) => {
    if (!isDefined(crypto) && !isDefined(fiat)) {
        return null;
    }

    if (crypto.length === 0 || fiat.length === 0) {
        logger.error("No currencies were provided");
        return null;
    }

    const fiatSet = new Set(FIAT_CURRENCIES.map((x) => x.toLowerCase()));
    for (let i = 0; i < fiat.length; i++) {
        if (!fiatSet.has(fiat[i].toLowerCase())) {
            logger.error("Invalid fiat currency: " + fiat[i]);
            return null;
        }
    }

    const cryptoSet = new Set(Object.entries(CRYPTO_CURRENCY_NAMES).map((x) => x[1].toLowerCase()));
    for (let i = 0; i < crypto.length; i++) {
        if (!cryptoSet.has(crypto[i].toLowerCase())) {
            logger.error("Invalid crypto currency: " + crypto[i]);
            return null;
        }
    }

    const { data, statusCode } = await request({
        site: COIN_GECKO_URL,
        path: format(COIN_GECKO_API_PATH, [crypto.join(","), fiat.join(",")]),
        method: "GET"
    });

    if (statusCode !== 200) {
        logger.error("Coin gecko request failed with status code: " + statusCode);
        return null;
    }

    return JSON.parse(data);
}

const generateFiatConversionMap = async () => {
    const map = {};
    // maybe this could run concurrently?
    for (let i = 0; i < FIAT_CURRENCIES.length; i++) {
        if (FIAT_CURRENCIES[i] === FIAT_BASE) {
            map[FIAT_CURRENCIES[i]] = 1;
            continue;
        }

        const rate = await getConversionRate([FIAT_CURRENCIES[i], FIAT_BASE]);
        if (rate !== null) {
            map[FIAT_CURRENCIES[i]] = rate;
        }
    }

    return map;
};

const generateCryptoConversionMap = async () => {
    const map = {};

    let buffer = [];
    for (let i = 0; i < CRYPTO_CURRENCIES.length; i++) {
        buffer.push({ name: CRYPTO_CURRENCY_NAMES[CRYPTO_CURRENCIES[i]], symbol: CRYPTO_CURRENCIES[i] });

        if (buffer.length < BUFFER_SIZE) {
            continue;
        }

        const result = await getConversionCoinGecko(buffer.map((x) => x.name), [FIAT_BASE]);
        if (result !== null) {
            for (let j = 0; j < buffer.length; j++) {
                map[buffer[j].symbol] = result[buffer[j].name.toLowerCase()][FIAT_BASE];
            }
            buffer = []; // is there better way than this memory reallocation?
        }
    }

    if (buffer.length > 0) {
        const result = await getConversionCoinGecko(buffer.map((x) => x.name), [FIAT_BASE]);
        if (result !== null) {
            for (let j = 0; j < buffer.length; j++) {
                map[buffer[j].symbol] = result[buffer[j].name.toLowerCase()][FIAT_BASE];
            }
        }
    }

    return map;
}

module.exports = { getConversionRate, generateFiatConversionMap, getConversionCoinGecko, generateCryptoConversionMap };