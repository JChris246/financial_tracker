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
            expect(response.body).toEqual({ balance: 0, totalCrypto: 0, totalIncome: 0, totalSpend: 0, totalStock: 0 });
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
            expect(response.body).toEqual({ balance: 70, totalCrypto: 0, totalIncome: 90, totalSpend: -20, totalStock: 0 });
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
            expect(response.body).toEqual({ balance: 34036.9263318, totalCrypto: 31488.570348,
                totalIncome: 74.1614838, totalSpend: -21.5555, totalStock: 2495.75 });
        });
    });

    describe("Get All Balances", () => {
        test("should return correct balance for each asset and currency based on existing transactions", async () => {
            // Arrange
            await addTransaction(superTestRequest, { name: "Test Transaction 1", amount: 10, currency: "USD", date: "2022-01-01" });
            await addTransaction(superTestRequest, { name: "Test Transaction 2", amount: -10, currency: "USD", date: "2022-01-02" });
            await addTransaction(superTestRequest, { name: "Test Transaction 3", amount: -10, currency: "EUR", date: "2022-01-03" });
            await addTransaction(superTestRequest, { name: "Test Transaction 4", amount: 60,currency: "CAD", date: "2022-02-04" });
            await addTransaction(superTestRequest, { name: "Test Transaction 5", amount: 20, currency: "USD", date: "2022-01-07" });

            await addTransaction(superTestRequest, { name: "Test Transaction 6", amount: 0.2, currency: "btc", assetType: "crypto" });
            await addTransaction(superTestRequest, { name: "Test Transaction 7", amount: 4, currency: "eth", assetType: "crypto" });
            await addTransaction(superTestRequest, { name: "Test Transaction 8", amount: 50, currency: "ada", assetType: "crypto" });
            await addTransaction(superTestRequest, { name: "Test Transaction 9", amount: -6, currency: "ada", assetType: "crypto" });

            await addTransaction(superTestRequest, { name: "Test Transaction 10", amount: 15, currency: "AMD", assetType: "stock" });
            await addTransaction(superTestRequest, { name: "Test Transaction 11", amount: 2, currency: "AAPL", assetType: "stock" });

            // Act
            const response = await superTestRequest.get("/api/balance/all");

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                crypto: { BTC: 0.2, ETH: 4, ADA: 44 },
                stock: { AMD: 15, AAPL: 2 },
                cash: { USD: 20, EUR: -10, CAD: 60 }
            });
        });
    });
});
