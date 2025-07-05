const { describe, expect, test } = require("@jest/globals");

const { getConversionRate, generateFiatConversionMap, getConversionCoinGecko, generateCryptoConversionMap,
    getYahooFinanceInfo, getStockPriceGoogle, generateStockPriceMap
} = require("../../utils/currency");
const { DEFAULT_CURRENCIES } = require("../../utils/constants");
const { isNumber } = require("../../utils/utils");

describe("currency", () => {
    describe("getConversionRate", () => {
        // these tests rely on an external api (and the internet)
        const pairs = [
            { from: "USD", to: "EUR" },
            { from: "EUR", to: "USD" },
            // { from: "GBP", to: "USD" }
            // { from: "CAD", to: "USD" }
        ];

        const invalidPairs = [
            { from: "USD", to: "EU" },
            { from: "EU", to: "US" },
        ];

        test.each(pairs)("should return a number for valid pairs: %s", async ({ to, from }) => {
            const result = await getConversionRate([to, from]);
            expect(isNumber(result)).toBeTruthy();
        });

        test.each(invalidPairs)("should return null for invalid pairs: %s", async ({ to, from }) => {
            const result = await getConversionRate([to, from]);
            expect(isNumber(result)).toBeFalsy();
        });

        test("should return 1 when currencies are the same", async () => {
            const result = await getConversionRate(["USD", "USD"]);
            expect(result).toBe(1);
        })
    });

    describe("generateFiatConversionMap", () => { // this is an expensive test
        test("should return non empty map of fiat conversion rates", async () => {
            const result = await generateFiatConversionMap(DEFAULT_CURRENCIES.cash);
            expect(Object.keys(result).length).toBeGreaterThan(0);
        });
    });

    describe("getConversionCoinGecko", () => {
        // these tests rely on an external api (and the internet)
        const pairs = [
            { crypto: ["bitcoin"], fiat: ["usd"] },
            { crypto: ["bitcoin"], fiat: ["usd", "eur"] },
            { crypto: ["bitcoin", "ethereum", "solana", "cardano"], fiat: ["usd", "eur"] },
        ];

        const invalidPairs = [
            { crypto: null, fiat: undefined },
            { crypto: [], fiat: [] },
            { crypto: ["btc"], fiat: [] },
            { crypto: [], fiat: ["usd"] },
            { crypto: ["usd"], fiat: ["bitcoin"] },
            { crypto: ["btc"], fiat: ["usd"] },
        ];

        test.each(pairs)("should return rates for valid pairs: %s", async ({ crypto, fiat }) => {
            const result = await getConversionCoinGecko(crypto, fiat);
            expect(result).toBeDefined();
        });

        test.each(invalidPairs)("should return null for invalid pairs: %s", async ({ crypto, fiat }) => {
            const result = await getConversionCoinGecko(crypto, fiat);
            expect(result).toBeNull();
        });
    });

    describe("generateCryptoConversionMap", () => {
        // these tests rely on an external api (and the internet)
        test("should return non empty map of crypto conversion rates", async () => { // expensive test
            const result = await generateCryptoConversionMap(DEFAULT_CURRENCIES.crypto);
            const resultLength = Object.keys(result).length;
            expect(resultLength).toBeGreaterThan(0);
            expect(resultLength).toBe(DEFAULT_CURRENCIES.crypto.length);
        });
    });

    describe.skip("getYahooFinanceInfo", () => {
        // these tests rely on an external api (and the internet)
        const symbols = ["AAPL", "NVDA", "MSFT", "AMD"];

        test.each(symbols)("should return basic stock info for: %s", async (symbol) => {
            // act
            const result = await getYahooFinanceInfo(symbol);

            // assert
            expect(isNumber(result.price)).toBeTruthy();
            expect(isNumber(result.change)).toBeTruthy();
            expect(result.changePercent).toMatch(/^[+-][0-9.]+%$/);
            expect(result.price).toBeGreaterThan(0);
        });

        test("should return null for invalid symbol", async () => {
            // act
            const result = await getYahooFinanceInfo("DEFINITELYNOTASYMBOL");

            // assert
            expect(result).toBeNull();
        });
    });

    describe("getStockPriceGoogle", () => {
        // these tests rely on an external api (and the internet)
        const symbols = ["AAPL", "NVDA", "MSFT", "AMD"];

        test.each(symbols)("should return basic stock info for: %s", async (symbol) => {
            // act
            const result = await getStockPriceGoogle(symbol);

            // assert
            expect(isNumber(result)).toBeTruthy();
            expect(result).toBeGreaterThan(0);
        });

        test("should return null for invalid symbol", async () => {
            // act
            const result = await getStockPriceGoogle("DEFINITELYNOTASYMBOL", 1);

            // assert
            expect(result).toBeNull();
        });
    });

    describe("generateStockPriceMap", () => { // this is an expensive test
        test("should return non empty map of stock prices", async () => {
            const result = await generateStockPriceMap(DEFAULT_CURRENCIES.stock);
            expect(Object.keys(result).length).toBeGreaterThan(0);
        });
    });
});