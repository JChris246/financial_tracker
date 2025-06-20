const { describe, expect, test, beforeEach, afterAll } = require("@jest/globals");
const supertest = require("supertest");
const server = require("../financial_tracker_server.js");
const superTestRequest = supertest(server);

const { getDatabase } = require("../db/index");
const { addTransaction } = require("./helpers");

describe("transaction endpoints", () => {
    beforeEach(async () => {
        getDatabase().init(); // this is not awaited as we expect the test db to be the json implementation
    });

    afterAll(async () => {
        getDatabase().wipeDb();
    });

    describe("Add Transaction", () => {
        test("should return bad request when no amount is provided", async () => {
            // Act
            const response = await superTestRequest.post("/api/transaction").send({ name: "Test Transaction", date: "2022-01-01" });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual("You need to have the transaction amount");
        });

        test("should return bad request when amount 0", async () => {
            // Act
            const response = await superTestRequest.post("/api/transaction").send({ name: "Test Transaction", date: "2022-01-01", amount: 0 });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual("You need to have a valid transaction amount");
        });

        test("should return bad request when transaction name not provided", async () => {
            // Act
            const response = await superTestRequest.post("/api/transaction").send({ date: "2022-01-01", amount: 50 });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual("You need to have the transaction name");
        });

        test("should return bad request when transaction asset type is not provided", async () => {
            // Act
            const response = await superTestRequest.post("/api/transaction").send({ date: "2022-01-01", amount: 50, name: "Test Transaction" });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual("You need to have the transaction asset type");
        });

        test("should return bad request when transaction currency is not provided", async () => {
            // Act
            const response = await superTestRequest
                .post("/api/transaction")
                .send({ date: "2022-01-01", amount: 50, name: "Test Transaction", assetType: "cash" });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual("You need to have the transaction currency");
        });

        test("should return bad request when invalid transaction asset type is provided", async () => {
            // Act
            const response = await superTestRequest
                .post("/api/transaction")
                .send({ date: "2022-01-01", amount: 50, name: "Test Transaction", assetType: "junk" });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual("You need to have a valid transaction asset type");
        });

        test("should return bad request when invalid transaction asset currency is provided", async () => {
            // Act
            const response = await superTestRequest
                .post("/api/transaction")
                .send({ date: "2022-01-01", amount: 50, name: "Test Transaction", assetType: "cash", currency: "btc" });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual("Asset currency not supported");
        });

        test("should return success response and transaction payload when transaction added successfully (without category)", async () => {
            // Act
            const response = await superTestRequest
                .post("/api/transaction")
                .send({ name: "Test Transaction", amount: 100, assetType: "cash", currency: "usd" });

            // Assert
            expect(response.status).toBe(201);
            expect(response.body.msg).toEqual("Transaction added successfully");
            expect(response.body.amount).toEqual(100);
            expect(response.body.name).toEqual("Test Transaction");
            expect(response.body.type).toEqual(true);
            expect(response.body.assetType).toEqual("cash");
            expect(response.body.currency).toEqual("usd");
            expect(response.body.category).toBeUndefined();
        });

        test("should return success response and transaction payload when transaction added successfully", async () => {
            // Act
            const response = await superTestRequest
                .post("/api/transaction")
                .send({ name: "Test Transaction", amount: -100, assetType: "cash", currency: "usd", category: "Groceries" });

            // Assert
            expect(response.status).toBe(201);
            expect(response.body.msg).toEqual("Transaction added successfully");
            expect(response.body.amount).toEqual(-100);
            expect(response.body.name).toEqual("Test Transaction");
            expect(response.body.type).toEqual(false);
            expect(response.body.assetType).toEqual("cash");
            expect(response.body.currency).toEqual("usd");
            expect(response.body.category).toEqual("Groceries");
        });

        test("should return success response and transaction payload when transaction added successfully (crypto)", async () => {
            // Act
            const response = await superTestRequest
                .post("/api/transaction")
                .send({ name: "Test Transaction", amount: -1, assetType: "crypto", currency: "btc", category: "Groceries" });

            // Assert
            expect(response.status).toBe(201);
            expect(response.body.msg).toEqual("Transaction added successfully");
            expect(response.body.amount).toEqual(-1);
            expect(response.body.name).toEqual("Test Transaction");
            expect(response.body.type).toEqual(false);
            expect(response.body.assetType).toEqual("crypto");
            expect(response.body.currency).toEqual("btc");
            expect(response.body.category).toEqual("Groceries");
        });

        // should we add a test to verify the value was inserted into the db?
    });

    describe("Get Transactions", () => {
        test.each(["", "/spend", "/income"])("should return empty list when no transactions have occurred", async (type) => {
            // Act
            const response = await superTestRequest.get("/api/transaction" + type);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toEqual([]);
        });

        test("should return the correct number of transactions per type", async () => {
            // Arrange
            await addTransaction(superTestRequest, { name: "Test Transaction 1", amount: 10, date: "2022-01-01" });
            await addTransaction(superTestRequest, { name: "Test Transaction 2", amount: -10, date: "2022-01-02" });
            await addTransaction(superTestRequest, { name: "Test Transaction 3", amount: -10, date: "2022-01-03" });
            await addTransaction(superTestRequest, { name: "Test Transaction 4", amount: 60, date: "2022-02-04" });
            await addTransaction(superTestRequest, { name: "Test Transaction 5", amount: 20, date: "2022-01-07" });

            const cases = [
                { type: "", expected: 5 },
                { type: "/spend", expected: 2 },
                { type: "/income", expected: 3 },
            ];


            for (let i = 0; i < cases.length; i++) {
                // Act
                const response = await superTestRequest.get("/api/transaction" + cases[i].type);

                // Assert
                expect(response.status).toBe(200);
                expect(response.body.length).toEqual(cases[i].expected);
            }
        });
    });
});
