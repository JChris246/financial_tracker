const { describe, expect, test } = require("@jest/globals");
const fs = require("fs");

const { calculateCompound, calculateStockCompound } = require("../../services/Calculator");
const { PAYMENT_FREQUENCY } = require("../../utils/constants");

describe("currency", () => {
    describe("calculateCompound", () => {
        const goodCases = [
            {
                input: { initial: 0, interest: 0.016, contribute: 0, months: 12, frequency: PAYMENT_FREQUENCY.MONTHLY },
                output: { profit: 0, balance: 0, totalContrib: 0 }
            },
            {
                input: { initial: 0, interest: 0.016, contribute: 1500, months: 12, frequency: PAYMENT_FREQUENCY.MONTHLY },
                output: { profit: 1671.6, balance: 18171.6, totalContrib: 16500 }
            },
            {
                input: { initial: 10000, interest: 0.016, contribute: 0, months: 12, frequency: PAYMENT_FREQUENCY.MONTHLY },
                output: { profit: 2098.3, balance: 12098.3, totalContrib: 0 }
            },
            {
                input: { initial: 10000, interest: 0.016, contribute: 400, months: 12, frequency: PAYMENT_FREQUENCY.MONTHLY },
                output: { profit: 2544.06, balance: 16944.06, totalContrib: 4400 }
            },
            {
                input: { initial: 10000, interest: 0.047, contribute: 350, months: 24, frequency: PAYMENT_FREQUENCY.QUARTERLY },
                output: { profit: 4946.75, balance: 17396.75, totalContrib: 2450 }
            },
            {
                input: { initial: 15000, interest: 0.038, contribute: 750, months: 12, frequency: PAYMENT_FREQUENCY.BIMONTHLY },
                output: { profit: 4211.62, balance: 22961.62, totalContrib: 3750 }
            },
            {
                input: { initial: 8000, interest: 0.01475, contribute: 1500, months: 48, frequency: PAYMENT_FREQUENCY.SEMIANNUALLY },
                output: { profit: 1632.31, balance: 20132.31, totalContrib: 10500 }
            },
            {
                input: { initial: 5000, interest: 0.0285, contribute: 1500, months: 48, frequency: PAYMENT_FREQUENCY.ANNUALLY },
                output: { profit: 856.24, balance: 10356.24, totalContrib: 4500 }
            }
        ];

        const badCases = [
            {
                input: { interest: 0.016, contribute: 0, months: 12, frequency: PAYMENT_FREQUENCY.MONTHLY },
                expectedMsg: "Invalid investment value"
            },
            {
                input: { initial: 1000, contribute: 0, months: 12, frequency: PAYMENT_FREQUENCY.MONTHLY },
                expectedMsg: "Invalid interest rate"
            },
            {
                input: { initial: 1000, interest: 0.016, months: 12, frequency: PAYMENT_FREQUENCY.MONTHLY },
                expectedMsg: "Invalid contribution value"
            },
            {
                input: { initial: 1000, interest: 0.016, contribute: 0, frequency: PAYMENT_FREQUENCY.MONTHLY },
                expectedMsg: "Invalid period"
            },
            {
                input: { initial: 1000, interest: 0.016, contribute: 0, months: 12 },
                expectedMsg: "Payout frequency not recognized"
            },
            {
                input: { initial: 5000, interest: 0.0285, contribute: 1500, months: 48, frequency: "daily" },
                expectedMsg: "Payout frequency not recognized"
            }
        ]

        test.each(goodCases)("should return success value with correct profit and balance for good cases: %s", ({ input, output }) => {
            const { initial, interest, contribute, months, frequency } = input;

            const result = calculateCompound({ initial, interest, contribute, months, frequency });
            expect(result.success).toEqual(true);
            expect(result.balance).toBe(output.balance);
            expect(result.profit).toBe(output.profit);
            expect(result.totalContrib).toBe(output.totalContrib);
        });

        test.each(badCases)("should return failure value with appropriate message for bad cases: %s", ({ input, expectedMsg }) => {
            const { initial, interest, contribute, months, frequency } = input;

            const result = calculateCompound({ initial, interest, contribute, months, frequency });
            expect(result.success).toEqual(false);
            expect(result.msg).toBe(expectedMsg);
        });
    });

    describe("calculateStockCompound", () => {
        // should I clear this after the test completes?
        global.DB_PATH = "test_db_unit"
        global.ACTIVE_DB_TYPE = "json";
        const sampleCache = fs.readFileSync("./test/assets/sampleCache.json");
        fs.mkdirSync(global.DB_PATH + "/data", { recursive: true });
        fs.writeFileSync(global.DB_PATH + "/data/db-cache.json", sampleCache);

        const goodCases = [
            {
                input: { initial: 10000, price: 15, divAmount: .24, contribute: 500, months: 12, frequency: PAYMENT_FREQUENCY.MONTHLY },
                output: { profit: 2655.5, balance: 18155.5, totalContrib: 5500 }
            },
            {
                input: { initial: 10000, price: 15, divAmount: .24, contribute: 500, months: 12, frequency: PAYMENT_FREQUENCY.QUARTERLY },
                output: { profit: 704.04, balance: 12204.04, totalContrib: 1500 }
            },
            {
                input: { initial: 10000, symbol: "ARR", divAmount: .24, contribute: 500, months: 12, frequency: PAYMENT_FREQUENCY.MONTHLY },
                output: { profit: 2655.5, balance: 18155.5, totalContrib: 5500 }
            },
            {
                input: { initial: 10000, symbol: "ARR", divAmount: .24, contribute: 500, months: 12, frequency: PAYMENT_FREQUENCY.QUARTERLY },
                output: { profit: 704.04, balance: 12204.04, totalContrib: 1500 }
            },
            {
                input: { shares: 667, symbol: "ARR", divAmount: .24, contribute: 500, months: 12, frequency: PAYMENT_FREQUENCY.MONTHLY },
                output: { profit: 2656.55, balance: 18161.55, totalContrib: 5500 }
            },
            {
                input: { shares: 667, symbol: "ARR", divAmount: .24, contribute: 500, months: 12, frequency: PAYMENT_FREQUENCY.QUARTERLY },
                output: { profit: 704.37, balance: 12209.37, totalContrib: 1500 }
            },
            {
                input: { initial: 10000, price: 15, divAmount: .24, contribute: 500, months: 12, frequency: PAYMENT_FREQUENCY.BIMONTHLY },
                output: { profit: 1121.82, balance: 13621.82, totalContrib: 2500 }
            },
            {
                input: { initial: 10000, price: 15, divAmount: .24, contribute: 500, months: 12, frequency: PAYMENT_FREQUENCY.SEMIANNUALLY },
                output: { profit: 330.56, balance: 10830.56, totalContrib: 500 }
            },
            {
                input: { initial: 10000, price: 15, divAmount: .24, contribute: 500, months: 12, frequency: PAYMENT_FREQUENCY.ANNUALLY },
                output: { profit: 160, balance: 10160, totalContrib: 0 }
            },
        ];

        const badCases = [
            {
                input: { initial: 10000, price: 15, contribute: 500, months: 12, frequency: PAYMENT_FREQUENCY.MONTHLY },
                expectedMsg: "You must provide the dividend amount per share"
            },
            {
                input: { price: 15, divAmount: .24, contribute: 500, months: 12, frequency: PAYMENT_FREQUENCY.MONTHLY },
                expectedMsg: "Must provide the initial amount either as share count or total worth"
            },
            {
                input: { shares: 50, divAmount: .24, contribute: 500, months: 12, frequency: PAYMENT_FREQUENCY.MONTHLY },
                expectedMsg: "You must provide either stock symbol or price"
            },
            {
                input: { price: 0, initial: 5000, divAmount: .24, contribute: 500, months: 12, frequency: PAYMENT_FREQUENCY.MONTHLY },
                expectedMsg: "Stock price cannot be 0"
            },
        ];

        test.each(goodCases)("should return success value with correct profit and balance for good cases: %s", async ({ input, output }) => {
            const { initial, price, contribute, divAmount, months, frequency, symbol, shares } = input;

            const result = await calculateStockCompound({ initial, price, divAmount, contribute, months, frequency, symbol, shares });
            expect(result.success).toEqual(true);
            expect(result.balance).toBe(output.balance);
            expect(result.profit).toBe(output.profit);
            expect(result.totalContrib).toBe(output.totalContrib);
            expect(result.price).toBeGreaterThan(0);
        });

        test.each(badCases)("should return failure value with appropriate message for bad cases: %s", async ({ input, expectedMsg }) => {
            const { initial, price, contribute, divAmount, months, frequency, symbol, shares } = input;

            const result = await calculateStockCompound({ initial, price, divAmount, contribute, months, frequency, symbol, shares });
            expect(result.success).toEqual(false);
            expect(result.msg).toBe(expectedMsg);
        });
    });
});