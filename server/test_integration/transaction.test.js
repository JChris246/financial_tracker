const { describe, expect, test, beforeEach, afterAll } = require("@jest/globals");
const supertest = require("supertest");
const server = require("../financial_tracker_server.js");
const superTestRequest = supertest(server);

const { getDatabase } = require("../db/index");
const { addTransaction } = require("./helpers");

const fs = require("fs");

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
            expect(response.body.currency).toEqual("USD");
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
            expect(response.body.currency).toEqual("USD");
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
            expect(response.body.currency).toEqual("BTC");
            expect(response.body.category).toEqual("Groceries");
        });

        test("should return success response and transaction payload when transaction added successfully (stock)", async () => {
            // Act
            const response = await superTestRequest
                .post("/api/transaction")
                .send({ name: "Test Transaction", amount: -1, assetType: "stock", currency: "AAPL", category: "Investment" });

            // Assert
            expect(response.status).toBe(201);
            expect(response.body.msg).toEqual("Transaction added successfully");
            expect(response.body.amount).toEqual(-1);
            expect(response.body.name).toEqual("Test Transaction");
            expect(response.body.type).toEqual(false);
            expect(response.body.assetType).toEqual("stock");
            expect(response.body.currency).toEqual("AAPL");
            expect(response.body.category).toEqual("Investment");
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

    describe("Add Transactions", () => {
        test.each(["", null, undefined, []])("should return bad request when no transactions are provided: %s", async (payload) => {
            // Act
            const response = await superTestRequest.post("/api/transaction/all").send(payload);

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual("You need to have at least one transaction");
        });

        test("should return bad request when no transactions are provided", async () => {
            // Act
            const response = await superTestRequest.post("/api/transaction/all").send([
                { name: "Test Transaction", date: "2022-01-01" }, // invalid
                { name: "Test Transaction", date: "2022-01-01", amount: 0 }, // invalid
                { date: "2022-01-01", amount: 50 }, // invalid
                { date: "2022-01-01", amount: 50, name: "Test Transaction" }, // invalid
                { date: "2022-01-01", amount: 50, name: "Test Transaction", assetType: "cash" }, // invalid
                { date: "2022-01-01", amount: 50, name: "Test Transaction", assetType: "junk" }, // invalid
                { date: "2022-01-01", amount: 50, name: "Test Transaction", assetType: "cash", currency: "btc" }, // invalid
                { name: "Test Transaction", amount: 100, assetType: "cash", currency: "usd" }, // valid
                { name: "Test Transaction", amount: -100, assetType: "cash", currency: "usd", category: "Groceries" }, // valid
                { name: "Test Transaction", amount: -1, assetType: "crypto", currency: "btc", category: "Groceries" } // valid
            ]);

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual("You have 7 invalid transactions");
        });

        test("should return success response and all transaction payloads when transactions added successfully", async () => {
            // Act
            const response = await superTestRequest.post("/api/transaction/all").send([
                { name: "Test cash transaction", amount: 100, assetType: "cash", currency: "usd", date: "2022-01-01", category: "Groceries" },
                { name: "Test crypto transaction", amount: -1, assetType: "crypto", currency: "btc", date: "2023-01-01" },
                { name: "Test stock transaction", amount: 5.2, assetType: "stock", currency: "AAPL", category: "Investment", date: "2024-01-01" }
            ]);

            // Assert
            expect(response.status).toBe(201);
            expect(response.body.msg).toEqual("Transactions added successfully");
            expect(response.body.addedTransactions).toEqual([
                { name: "Test cash transaction", amount: 100, assetType: "cash", currency: "USD",
                    date: 1640995200000, type: true, category: "Groceries" },
                { name: "Test crypto transaction", amount: -1, assetType: "crypto", currency: "BTC", date: 1672531200000, type: false },
                { name: "Test stock transaction", amount: 5.2, assetType: "stock", currency: "AAPL",
                    date: 1704067200000, type: true, category: "Investment" },
            ]);
        });
    });

    describe("processCSV", () => {
        test.each([
            { payload: "", msg: "CSV data cannot be empty" },
            { payload: " ", msg: "CSV data cannot be empty" },
            { payload: null, msg: "You need to provide CSV data" },
            { payload: undefined, msg: "You need to provide CSV data" },
            { payload: 23, msg: "CSV data must be a string" },
            { payload: { amount: 23, name: "Test Transaction" }, msg: "CSV data must be a string" }
        ])("should return bad request when no data / invalid data is provided: %s", async ({ payload, msg }) => {
            // Act
            const response = await superTestRequest.post("/api/transaction/csv").send({ csv: payload });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual(msg);
        });

        test("should return bad request when only the csv header is provided", async () => {
            // Act
            const response = await superTestRequest.post("/api/transaction/csv")
                .send({ csv: "name, amount, type, date, category, assetType, currency" });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual("Expected at least one csv row along with the csv header");
        });

        // TODO: update this test when I start to use AI
        test("should return bad request when header is missing required fields", async () => {
            // Arrange
            const data = fs.readFileSync("./test/assets/missingHeaderFieldsTransactions.csv", "utf-8");

            // Act
            const response = await superTestRequest.post("/api/transaction/csv").send({ csv: data });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual("Invalid CSV header missing fields: amount,currency");
        });

        test("should return bad request when transaction are missing required fields", async () => {
            // Arrange
            const data = fs.readFileSync("./test/assets/missingRequiredFieldsTransactions.csv", "utf-8");

            // Act
            const response = await superTestRequest.post("/api/transaction/csv").send({ csv: data });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual("Invalid CSV");
            expect(response.body.invalid).toEqual({
                0: "You need to have the transaction asset type",
                3: "You need to have a valid transaction amount",
                5: "You need to have the transaction name",
                6: "You need to have a valid transaction amount",
            });
        });

        test("should return successful response with interpreted transactions when csv contains all expected fields", async () => {
            // Arrange
            const data = fs.readFileSync("./test/assets/fiveFullGoodTransactions.csv", "utf-8");

            // Act
            const response = await superTestRequest.post("/api/transaction/csv").send({ csv: data });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.msg).toEqual("CSV processed successfully");
            expect(response.body.transactions).toEqual([
                { amount: 4, assetType: "stock", category: "Investment", currency: "NVDA",
                    date: 1711929600000, name: "Test transaction", type: true, valid: true },
                { amount: 760, assetType: "cash", category: "Side job", currency: "USD",
                    date: 1743552000000, name: "Test transaction 2", type: true, valid: true },
                { amount: 4, assetType: "crypto", category: "Smart contracts", currency: "ETH",
                    date: 1711929600000, name: "Test transaction 3", type: true, valid: true },
                { amount: 0.3, assetType: "crypto", category: "", currency: "BTC",
                    date: 1714521600000, name: "Test transaction 4", type: true, valid: true },
                { amount: 50, assetType: "crypto", category: "", currency: "ADA",
                    date: 1722470400000, name: "Test transaction 5", type: true, valid: true }
            ]);
        });

        test("should return successful response with interpreted transactions when csv contains all expected fields (except type)", async () => {
            // Arrange
            const data = fs.readFileSync("./test/assets/fiveGoodTransactions.csv", "utf-8");

            // Act
            const response = await superTestRequest.post("/api/transaction/csv").send({ csv: data });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.msg).toEqual("CSV processed successfully");
            expect(response.body.transactions).toEqual([
                { amount: 4, assetType: "stock", category: "Investment", currency: "NVDA",
                    date: 1711929600000, name: "Test transaction", type: true, valid: true },
                { amount: 760, assetType: "cash", category: "Other", currency: "USD",
                    date: 1743552000000, name: "Test transaction 2", type: true, valid: true },
                { amount: 4, assetType: "crypto", category: "Other", currency: "ETH",
                    date: 1711929600000, name: "Test transaction 3", type: true, valid: true },
                { amount: 0.3, assetType: "crypto", category: "", currency: "BTC",
                    date: 1714521600000, name: "Test transaction 4", type: true, valid: true },
                { amount: 50, assetType: "crypto", category: "", currency: "ADA",
                    date: 1722470400000, name: "Test transaction 5", type: true, valid: true }
            ]);
        });
    });

    describe("exportTransactions", () => {
        test("should return bad request when an invalid format is provided", async () => {
            // Act
            const response = await superTestRequest.get("/api/transaction/export/xls");

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toBe("Invalid export format");
        });

        test("should return success response and all transactions as json when transactions added successfully", async () => {
            // Arrange
            await superTestRequest.post("/api/transaction/all").send([
                { name: "Test cash transaction", amount: 100, assetType: "cash", currency: "usd", date: "2022-01-01", category: "Groceries" },
                { name: "Test crypto transaction", amount: -1, assetType: "crypto", currency: "btc", date: "2023-01-01" },
                { name: "Test stock transaction", amount: 5.2, assetType: "stock", currency: "AAPL", category: "Investment", date: "2024-01-01" }
            ]);

            // Act
            const response = await superTestRequest.get("/api/transaction/export/json");

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(3);
        });

        test("should return success response and all transactions as csv when transactions added successfully", async () => {
            // Arrange
            await superTestRequest.post("/api/transaction/all").send([
                { name: "Test cash transaction", amount: 100, assetType: "cash", currency: "usd", date: "2022-01-01", category: "Groceries" },
                { name: "Test crypto transaction", amount: -1, assetType: "crypto", currency: "btc", date: "2023-01-01" },
                { name: "Test stock transaction", amount: 5.2, assetType: "stock", currency: "AAPL", category: "Investment", date: "2024-01-01" }
            ]);

            // Act
            const response = await superTestRequest.get("/api/transaction/export/csv");

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.csv.split("\n").length).toBe(4);
        });
    });
});
