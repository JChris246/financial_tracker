const { describe, expect, test } = require("@jest/globals");
const supertest = require("supertest");
const server = require("../financial_tracker_server.js");
const superTestRequest = supertest(server);

const { PAYMENT_FREQUENCY } = require("../utils/constants.js");
const { isNumber } = require("../utils/utils.js");

describe("calculator endpoints", () => {
    describe("calculateCompound", () => {
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
        ];

        test.each(badCases)("should return bad request when request body is invalid", async ({ input, expectedMsg }) => {
            // Act
            const response = await superTestRequest.post("/api/calculator/compound-interest").send(input);

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual(expectedMsg);
        });

        test("should return ok when request body is valid", async () => {
            // Act
            const response = await superTestRequest.post("/api/calculator/compound-interest").send(
                { initial: 10000, interest: 0.016, contribute: 400, months: 12, frequency: PAYMENT_FREQUENCY.MONTHLY }
            );

            // Assert
            expect(response.status).toBe(200);
            expect(isNumber(response.body.profit)).toEqual(true);
            expect(response.body.profit).toBeGreaterThan(0);
            expect(isNumber(response.body.totalContrib)).toEqual(true);
            expect(response.body.totalContrib).toBeGreaterThan(0);
            expect(isNumber(response.body.balance)).toEqual(true);
            expect(response.body.balance).toBeGreaterThan(0);
        });
    });

    describe("calculateStockCompound", () => {
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
            }
        ];

        const goodCases = [
            { initial: 10000, price: 15, divAmount: .24, contribute: 500, months: 12, frequency: PAYMENT_FREQUENCY.MONTHLY },
            { shares: 667, symbol: "ARR", divAmount: .24, contribute: 500, months: 12, frequency: PAYMENT_FREQUENCY.MONTHLY },
            { initial: 10000, symbol: "ARR", divAmount: .24, contribute: 500, months: 12, frequency: PAYMENT_FREQUENCY.MONTHLY }
        ];

        test.each(badCases)("should return bad request when request body is invalid", async ({ input, expectedMsg }) => {
            // Act
            const response = await superTestRequest.post("/api/calculator/compound-stock").send(input);

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual(expectedMsg);
        });

        test.each(goodCases)("should return ok when request body is valid", async (input) => {
            // Act
            const response = await superTestRequest.post("/api/calculator/compound-stock").send(input);

            // Assert
            expect(response.status).toBe(200);
            expect(isNumber(response.body.profit)).toEqual(true);
            expect(response.body.profit).toBeGreaterThan(0);
            expect(isNumber(response.body.totalContrib)).toEqual(true);
            expect(response.body.totalContrib).toBeGreaterThan(0);
            expect(isNumber(response.body.balance)).toEqual(true);
            expect(response.body.balance).toBeGreaterThan(0);
        });
    })

    describe("calculateAmortization", () => {
        const goodCases = [
            { price: 435_000, down: 90_000, months: 180, interest: 6.667 / 100 },
            { price: 35_000, down: 0, months: 36, interest: 6.667 / 100 }
        ];

        const badCases = [
            {
                input: { down: 10_000, months: 20, interest: 6.667 / 100 },
                expectedMsg: "Invalid price value"
            },
            {
                input: { price: 35_000, months: 20, interest: 6.667 / 100 },
                expectedMsg: "Invalid deposit value"
            },
            {
                input: { price: 35_000, down: 10_000, interest: 6.667 / 100 },
                expectedMsg: "Invalid period"
            },
            {
                input: { price: 35_000, down: 10_000, months: 20 },
                expectedMsg: "Invalid interest rate"
            },
            {
                input: { price: 0, down: 10_000, months: 20, interest: 6.667 / 100 },
                expectedMsg: "Price value should be more than 0"
            },
            {
                input: { price: -4000, down: 10_000, months: 20, interest: 6.667 / 100 },
                expectedMsg: "Price value should be more than 0"
            },
        ];

        test.each(badCases)("should return bad request when request body is invalid", async ({ input, expectedMsg }) => {
            // Act
            const response = await superTestRequest.post("/api/calculator/amortization").send(input);

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual(expectedMsg);
        });

        test.each(goodCases)("should return ok when request body is valid", async (input) => {
            // Act
            const response = await superTestRequest.post("/api/calculator/amortization").send(input);

            // Assert
            expect(response.status).toBe(200);
            expect(isNumber(response.body.loanAmount)).toEqual(true);
            expect(response.body.loanAmount).toBeGreaterThan(0);
            expect(isNumber(response.body.interestPaid)).toEqual(true);
            expect(response.body.interestPaid).toBeGreaterThan(0);
            expect(isNumber(response.body.monthly)).toEqual(true);
            expect(response.body.monthly).toBeGreaterThan(0);
            expect(isNumber(response.body.totalPaid)).toEqual(true);
            expect(response.body.totalPaid).toBeGreaterThan(0);
        });
    })
});
