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
});
