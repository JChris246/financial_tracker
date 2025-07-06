const { describe, expect, test, beforeEach, afterAll } = require("@jest/globals");
const supertest = require("supertest");
const server = require("../financial_tracker_server.js");
const superTestRequest = supertest(server);

const { getDatabase } = require("../db/index");
const { addTransaction } = require("./helpers");

describe("balance endpoints", () => {
    beforeEach(async () => {
        getDatabase().init(); // this is not awaited as we expect the test db to be the json implementation
    });

    afterAll(async () => {
        getDatabase().wipeDb();
    });

    describe("Get Balance", () => {
        test("should return 0 balance when no transactions have occurred", async () => {
            // Act
            const response = await superTestRequest.get("/api/balance");

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                balance: 0, totalCrypto: 0, totalIncome: 0, totalSpend: 0, totalStock: 0, totalCash: 0,
                crypto: {}, stock: {}, cash: {}
            });
        });

        test("should return correct balance when based on existing transactions", async () => {
            // Arrange
            await addTransaction(superTestRequest, { name: "Test Transaction 1", amount: 10, date: "2022-01-01" });
            await addTransaction(superTestRequest, { name: "Test Transaction 2", amount: -10, date: "2022-01-02" });
            await addTransaction(superTestRequest, { name: "Test Transaction 3", amount: -10, date: "2022-01-03" });
            await addTransaction(superTestRequest, { name: "Test Transaction 4", amount: 60, date: "2022-02-04" });
            await addTransaction(superTestRequest, { name: "Test Transaction 5", amount: 20, date: "2022-01-07" });

            // Act
            const response = await superTestRequest.get("/api/balance");

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                balance: 70, totalCrypto: 0, totalIncome: 90, totalSpend: -20, totalStock: 0, totalCash: 70,
                crypto: {}, stock: {}, cash: { USD: { amount: 70, allocation: 1, assetAllocation: 1 } }
            });
        });

        test("should return correct balance when based on existing transactions with various currencies", async () => {
            // Arrange
            await addTransaction(superTestRequest, { name: "Test Transaction 1", amount: 10, currency: "USD", date: "2022-01-01" }); // 10 usd
            await addTransaction(superTestRequest, { name: "Test Transaction 2", amount: -10, currency: "USD", date: "2022-01-02" }); // 0 usd
            await addTransaction(superTestRequest, { name: "Test Transaction 3", amount: -10, currency: "EUR", date: "2022-01-03" }); // -11.5555 usd

            await addTransaction(superTestRequest,
                { name: "Test Transaction 4", amount: 60,currency: "CAD", date: "2022-02-04" }); // 44.1614838 +- 11.5555 = 32.6059838 usd
            await addTransaction(superTestRequest,
                { name: "Test Transaction 5", amount: 20, currency: "USD", date: "2022-01-07" }); // 52.6059838 usd
            await addTransaction(superTestRequest,
                { name: "Test Transaction 6", amount: 0.2, currency: "btc", assetType: "crypto", date: "2022-01-07" }); // 21515.2 usd (crypto)
            await addTransaction(superTestRequest,
                { name: "Test Transaction 7", amount: 4, currency: "eth", assetType: "crypto", date: "2022-01-07" }); // 31463.56 usd (crypto)
            await addTransaction(superTestRequest,
                { name: "Test Transaction 8", amount: 50, currency: "ada", assetType: "crypto", date: "2022-01-07" }); // 31491.98085 usd (crypto)
            await addTransaction(superTestRequest,
                { name: "Test Transaction 9", amount: -6, currency: "ada", assetType: "crypto", date: "2022-01-07" }); // 31488.570348 usd (crypto)

            await addTransaction(superTestRequest,
                { name: "Test Transaction 10", amount: 15, currency: "AMD", assetType: "stock" }); // 2068.65 usd (stock)
            await addTransaction(superTestRequest,
                { name: "Test Transaction 11", amount: 2, currency: "AAPL", assetType: "stock" }); // 427.1 usd (stock)

            // assuming mock values:

            // cad -> usd = .73602473
            // eur -> usd = 1.1555499999999999
            // btc -> usd = 107576
            // eth -> usd = 2487.09
            // ada -> usd = 0.568417

            // amd -> usd = 137.91
            // aapl -> usd = 213.55

            // Act
            const response = await superTestRequest.get("/api/balance");

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                balance: 34036.9263, totalCrypto: 31488.5703, totalIncome: 74.1615,
                totalSpend: -21.5555, totalStock: 2495.75, totalCash: 52.606,
                crypto: {
                    BTC: { amount: 0.2, allocation: 0.6321, assetAllocation: 0.6833 },
                    ETH: { amount: 4, allocation: 0.2923, assetAllocation: 0.3159 },
                    ADA: { amount: 44, allocation: 0.0007, assetAllocation: 0.0008 }
                },
                stock: {
                    AMD: { amount: 15, allocation: 0.0608, assetAllocation: 0.8289 },
                    AAPL: { amount: 2, allocation: 0.0125, assetAllocation: 0.1711 }
                },
                cash: {
                    USD: { amount: 20, allocation: 0.0006, assetAllocation: 0.3802 },
                    // because there is a negative balance, the total allocation will be more than 1 (>100%)
                    // I'm sure this will break something, no matter how you handle it
                    // you can't have negative values without affecting the other currencies (and balance)
                    // please give back the people dem money so the app can work correctly
                    EUR: { amount: -10, allocation: 0, assetAllocation: 0 },
                    CAD: { amount: 60, allocation: 0.0013, assetAllocation: 0.8395 }
                }
            });
        });
    });
});