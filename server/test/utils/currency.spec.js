const { describe, expect, test } = require("@jest/globals");

const { getConversionRate, generateFiatConversionMap, getConversionCoinGecko } = require("../../utils/currency");
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

        test("should 1 when currencies are the same", async () => {
            const result = await getConversionRate(["USD", "USD"]);
            expect(result).toBe(1);
        })
    });

    describe.skip("generateFiatConversionMap", () => { // this is an expensive test
        test("should return non empty map of fiat conversion rates", async () => {
            const result = await generateFiatConversionMap();
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
        ];

        test.each(pairs)("should return rates for valid pairs: %s", async ({ crypto, fiat }) => {
            const result = await getConversionCoinGecko(crypto, fiat);
            expect(result).toBeDefined();
        });

        test.each(invalidPairs)("should return null for invalid pairs: %s", async ({ crypto, fiat }) => {
            const result = await getConversionCoinGecko(crypto, fiat);
            expect(isNumber(result)).toBeFalsy();
        });
    });
});