const { describe, expect, test, beforeEach, afterAll } = require("@jest/globals");
const supertest = require("supertest");
const server = require("../financial_tracker_server.js");
const superTestRequest = supertest(server);

const { getDatabase } = require("../db/index");
const { addTransaction } = require("./helpers");
const { isValidString, isNumber } = require("../utils/utils");

const fs = require("fs");

describe("transaction endpoints", () => {
    beforeEach(async () => {
        await (await getDatabase()).init();
    });

    afterAll(async () => {
        await (await getDatabase()).wipeDb();
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
            expect(response.body.assetType).toEqual("cash");
            expect(response.body.currency).toEqual("USD");
            expect(response.body.category).toEqual("other");
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
                // TODO: re-add new cases when this endpoint is updated for filtering and pagination
                // { type: "/spend", expected: 2 },
                // { type: "/income", expected: 3 },
            ];


            for (let i = 0; i < cases.length; i++) {
                // Act
                const response = await superTestRequest.get("/api/transaction" + cases[i].type);

                // Assert
                expect(response.status).toBe(200);
                expect(response.body.length).toEqual(cases[i].expected);
            }
        });

        test("should return the transactions with expected fields", async () => {
            // Arrange
            await addTransaction(superTestRequest, { name: "Test Transaction 1", amount: 10, date: "2022-01-01" });

            // Act
            const response = await superTestRequest.get("/api/transaction");

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.length).toBe(1);
            expect(isValidString(response.body[0].id) || isNumber(response.body[0].id)).toBe(true);
            response.body[0].id = undefined;
            expect(response.body).toEqual([
                {
                    name: "Test Transaction 1",
                    amount: 10,
                    date: 1641009600000,
                    assetType: "cash",
                    currency: "USD",
                    category: "Groceries"
                }
            ]);
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

        test("should return bad request when invalid format provided to add transactions", async () => {
            // Act
            const response = await superTestRequest.post("/api/transaction/xml").send([
                { name: "Test Transaction", amount: -1, assetType: "crypto", currency: "btc", category: "Groceries" } // valid
            ]);

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual("Unsupported format: xml");
        });

        test("should return success response and transaction payload when transactions added successfully", async () => {
            // Act
            const response = await superTestRequest.post("/api/transaction/json").send([
                { name: "Test Transaction", amount: -1, assetType: "crypto", currency: "btc", category: "Groceries", date: "2024-01-01" }
            ]);

            // Assert
            expect(response.status).toBe(201);
            expect(response.body.msg).toEqual("Transactions added successfully");
            expect(response.body.addedTransactions.every(({ id }) => isValidString(id) || isNumber(id))).toBe(true);
            response.body.addedTransactions.map(t => { t.id = undefined; return t });
            expect(response.body.addedTransactions).toEqual([
                { name: "Test Transaction", amount: -1, assetType: "crypto", currency: "BTC", date: 1704081600000, category: "Groceries" },
            ]);
        });

        test("should return bad request when some invalid transactions are provided", async () => {
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
            expect(response.body.addedTransactions.every(({ id }) => isValidString(id) || isNumber(id))).toBe(true);
            response.body.addedTransactions.map(t => { t.id = undefined; return t });
            expect(response.body.addedTransactions).toEqual([
                { name: "Test cash transaction", amount: 100, assetType: "cash", currency: "USD", date: 1641009600000, category: "Groceries" },
                { name: "Test crypto transaction", amount: -1, assetType: "crypto", currency: "BTC", date: 1672545600000, category: "other" },
                { name: "Test stock transaction", amount: 5.2, assetType: "stock", currency: "AAPL", date: 1704081600000, category: "Investment" },
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
                .send({ csv: "name, amount, date, category, assetType, currency" });

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
                3: "You need to have the transaction amount",
                5: "You need to have the transaction name",
                6: "You need to have the transaction amount",
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
                    date: 1711944000000, name: "Test transaction", valid: true },
                { amount: 760, assetType: "cash", category: "Side job", currency: "usd",
                    date: 1743566400000, name: "Test transaction 2", valid: true },
                { amount: 4, assetType: "crypto", category: "Smart contracts", currency: "ETH",
                    date: 1711944000000, name: "Test transaction 3", valid: true },
                { amount: 0.3, assetType: "crypto", category: "", currency: "BTC",
                    date: 1714536000000, name: "Test transaction 4", valid: true },
                { amount: 50, assetType: "crypto", category: "", currency: "ADA",
                    date: 1722484800000, name: "Test transaction 5", valid: true }
            ]);
        });

        test("should return successful response with interpreted transactions when csv contains all expected fields (except category)", async () => {
            // Arrange
            const data = fs.readFileSync("./test/assets/fiveGoodTransactions.csv", "utf-8");

            // Act
            const response = await superTestRequest.post("/api/transaction/csv").send({ csv: data });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.msg).toEqual("CSV processed successfully");
            expect(response.body.transactions).toEqual([
                { amount: 4, assetType: "stock", category: "other", currency: "NVDA",
                    date: 1711944000000, name: "Test transaction", valid: true },
                { amount: 760, assetType: "cash", category: "other", currency: "usd",
                    date: 1743566400000, name: "Test transaction 2", valid: true },
                { amount: 4, assetType: "crypto", category: "other", currency: "ETH",
                    date: 1711944000000, name: "Test transaction 3", valid: true },
                { amount: 0.3, assetType: "crypto", category: "other", currency: "BTC",
                    date: 1714536000000, name: "Test transaction 4", valid: true },
                { amount: 50, assetType: "crypto", category: "other", currency: "ADA",
                    date: 1722484800000, name: "Test transaction 5", valid: true }
            ]);
        });

        test("should return successful response with interpreted transactions when csv contains expected fields and ignore blank rows", async () => {
            // Arrange
            const data = fs.readFileSync("./test/assets/transactionsWithBlankRecords.csv", "utf-8");

            // Act
            const response = await superTestRequest.post("/api/transaction/csv").send({ csv: data });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.msg).toEqual("CSV processed successfully");
            expect(response.body.transactions).toEqual([
                { amount: 10, assetType: "cash", category: "other", currency: "usd",
                    date: 1709352000000, name: "Descriptive Deposit Subscription Rebate", valid: true },
                { amount: 6.77, assetType: "cash", category: "other", currency: "usd",
                    date: 1709352000000, name: "Descriptive Deposit CC Cashback Rebate", valid: true },
                { amount: 2171.45, assetType: "cash", category: "income", currency: "usd",
                    date: 1710475200000, name: "ACH Deposit APPL - EDIPAYMENT", valid: true },
                { amount: 138, assetType: "cash", category: "other", currency: "usd",
                    date: 1711512000000, name: "ACH Deposit IRS TREAS 310 - TAX REF", valid: true },
                { amount: 2171.43, assetType: "cash", category: "income", currency: "usd",
                    date: 1743220800000, name: "ACH Deposit APPL - EDIPAYMENT", valid: true },
                { amount: 0.09, assetType: "cash", category: "other", currency: "usd",
                    date: 1743393600000, name: "Credit Dividend", valid: true }
            ]);
        });
    });

    describe("processMd", () => {
        test.each([
            { payload: "", msg: "payload cannot be empty" },
            { payload: " ", msg: "payload cannot be empty" },
            { payload: null, msg: "You need to provide a valid markdown table" },
            { payload: undefined, msg: "You need to provide a valid markdown table" },
            { payload: 23, msg: "payload must be a string" },
            { payload: { amount: 23, name: "Test Transaction" }, msg: "payload must be a string" },
            { payload: "| Name | Amount | Date |", msg: "invalid markdown format detected" }
        ])("should return bad request when no data / invalid data is provided: %s", async ({ payload, msg }) => {
            // Act
            const response = await superTestRequest.post("/api/transaction/md").send({ md: payload });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual(msg);
        });

        test("should return bad request when only the markdown table header is provided", async () => {
            // Act
            const response = await superTestRequest.post("/api/transaction/md")
                .send({ md: "| Name | Amount | Date |\n| ---- | ----- | ----- |" });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual("Expected at least one markdown table row along with the headers");
        });

        // TODO: update this test when I start to use AI
        test("should return bad request when header is missing required fields", async () => {
            // Arrange
            const data = fs.readFileSync("./test/assets/missingHeaderFieldsTransactions.md", "utf-8");

            // Act
            const response = await superTestRequest.post("/api/transaction/md").send({ md: data });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual("Invalid markdown table header, missing fields: amount,currency");
        });

        test("should return bad request when transaction are missing required fields", async () => {
            // Arrange
            const data = fs.readFileSync("./test/assets/missingRequiredFieldsTransactions.md", "utf-8");

            // Act
            const response = await superTestRequest.post("/api/transaction/md").send({ md: data });

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual("Invalid markdown table");
            expect(response.body.invalid).toEqual({
                0: "You need to have a valid transaction asset type",
                3: "You need to have the transaction amount",
                5: "You need to have the transaction name",
                6: "You need to have the transaction amount",
            });
        });

        test("should return successful response with interpreted transactions when markdown table contains all expected fields", async () => {
            // Arrange
            const data = fs.readFileSync("./test/assets/fiveFullGoodTransactions.md", "utf-8");

            // Act
            const response = await superTestRequest.post("/api/transaction/md").send({ md: data });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.msg).toEqual("Markdown table processed successfully");
            expect(response.body.transactions).toEqual([
                { amount: 4, assetType: "stock", category: "Investment", currency: "NVDA",
                    date: 1711944000000, name: "Test transaction", valid: true },
                { amount: 12760, assetType: "cash", category: "Side job", currency: "usd",
                    date: 1743566400000, name: "Test transaction 2", valid: true },
                { amount: 4, assetType: "crypto", category: "Smart contracts", currency: "ETH",
                    date: 1711944000000, name: "Test transaction 3", valid: true },
                { amount: 0.3, assetType: "crypto", category: "", currency: "BTC",
                    date: 1714536000000, name: "Test transaction 4", valid: true },
                { amount: 50, assetType: "crypto", category: "", currency: "ADA",
                    date: 1722484800000, name: "Test transaction 5", valid: true }
            ]);
        });

        test("should return successful response with interpreted transactions when table contains all expected fields (except category)",async () =>{
            // Arrange
            const data = fs.readFileSync("./test/assets/fiveGoodTransactions.md", "utf-8");

            // Act
            const response = await superTestRequest.post("/api/transaction/md").send({ md: data });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.msg).toEqual("Markdown table processed successfully");
            expect(response.body.transactions).toEqual([
                { amount: 4, assetType: "stock", category: "other", currency: "NVDA", date: 1711944000000, name: "Test transaction", valid: true },
                { amount: 760, assetType: "cash", category: "other", currency: "usd", date: 1743566400000, name: "Test transaction 2", valid: true },
                { amount: 4, assetType: "crypto", category: "other", currency: "ETH", date: 1711944000000, name: "Test transaction 3", valid: true },
                { amount: 0.3, assetType: "crypto", category: "other", currency: "BTC", date: 1714536000000,
                    name: "Test transaction 4", valid: true },
                { amount: 50, assetType: "crypto", category: "other", currency: "ADA", date: 1722484800000, name: "Test transaction 5", valid: true }
            ]);
        });

        test("should return successful response with interpreted transactions when markdown table contains expected fields and ignore blank rows",
                async () => {
            // Arrange
            const data = fs.readFileSync("./test/assets/transactionsWithBlankRecords.md", "utf-8");

            // Act
            const response = await superTestRequest.post("/api/transaction/md").send({ md: data });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.msg).toEqual("Markdown table processed successfully");
            expect(response.body.transactions).toEqual([
                { amount: 10, assetType: "cash", category: "other", currency: "usd",
                    date: 1709352000000, name: "Descriptive Deposit Subscription Rebate", valid: true },
                { amount: 6.77, assetType: "cash", category: "other", currency: "usd",
                    date: 1709352000000, name: "Descriptive Deposit CC Cashback Rebate", valid: true },
                { amount: 2171.45, assetType: "cash", category: "income", currency: "usd",
                    date: 1710475200000, name: "ACH Deposit APPL - EDIPAYMENT", valid: true },
                { amount: 138, assetType: "cash", category: "other", currency: "usd",
                    date: 1711512000000, name: "ACH Deposit IRS TREAS 310 - TAX REF", valid: true },
                { amount: 2171.43, assetType: "cash", category: "income", currency: "usd",
                    date: 1743220800000, name: "ACH Deposit APPL - EDIPAYMENT", valid: true },
                { amount: 0.09, assetType: "cash", category: "other", currency: "usd",
                    date: 1743393600000, name: "Credit Dividend", valid: true }
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

        test("should return success response and all transactions as json when transactions exist", async () => {
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

        test("should return success response and all transactions as csv when transactions exist", async () => {
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

        test("should return success response and all transactions as a markdown table when transactions exist", async () => {
            // Arrange
            await superTestRequest.post("/api/transaction/all").send([
                { name: "Test cash transaction", amount: 100, assetType: "cash", currency: "usd", date: "2022-01-01", category: "Groceries" },
                { name: "Test crypto transaction", amount: -1, assetType: "crypto", currency: "btc", date: "2023-01-01" },
                { name: "Test stock transaction", amount: 5.2, assetType: "stock", currency: "AAPL", category: "Investment", date: "2024-01-01" }
            ]);

            // Act
            const response = await superTestRequest.get("/api/transaction/export/md");

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.md.split("\n").length).toBe(5);
        });
    });

    describe("Update transaction", () => {
        test.each([
            { name: "Test Transaction", amount: -100, assetType: "cash", currency: "usd", category: "Groceries" },
            { name: "Test Transaction", amount: -100, assetType: "cash", currency: "usd", date: "2023-05-12" },
            { name: "Test Transaction", amount: -100, assetType: "cash", currency: "usd" },
            { amount: -100, assetType: "cash", currency: "usd", category: "Groceries", date: "2023-05-12" },
            { name: "Test Transaction", amount: -100, category: "Groceries", date: "2023-05-12" },
            {}
        ])
        ("should return bad request if all transaction fields not specified", async (payload) => {
            // Act
            const response = await superTestRequest.put("/api/transaction/68840d10473e26e9961d50fc").send(payload);

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual("update request missing fields");
        });

        test("should return not found if no transactions exist", async () => {
            // Act
            const response = await superTestRequest.put("/api/transaction/68840d10473e26e9961d50fc")
                .send({ name: "Test Transaction", amount: -100, assetType: "cash", currency: "usd", category: "Groceries", date: "2023-05-12" });
            const getResponse = await superTestRequest.get("/api/transaction");

            // Assert
            expect(response.status).toBe(404);
            expect(getResponse.status).toBe(200);
            expect(getResponse.body.length).toEqual(0);
        });

        test("should return not found if transaction update target does not exist", async () => {
            // Arrange
            await superTestRequest.post("/api/transaction/all").send([
                { name: "Test Transaction", amount: 100, assetType: "cash", currency: "usd", category: "other", date: "2023-05-12" },
                { name: "Test Transaction", amount: -100, assetType: "cash", currency: "usd", category: "Groceries", date: "2023-05-12" },
                { name: "Test Transaction", amount: -1, assetType: "crypto", currency: "btc", category: "Groceries", date: "2023-05-12" }
            ]);

            // Act
            const response = await superTestRequest.put("/api/transaction/68840d10473e26e9961d50fc")
                .send({ name: "Test Transaction", amount: -100, assetType: "cash", currency: "usd", category: "Groceries", date: "2025-06-12" });
            const getResponse = await superTestRequest.get("/api/transaction");

            // Assert
            expect(response.status).toBe(404);
            expect(getResponse.status).toBe(200);
            expect(getResponse.body.length).toEqual(3);
        });

        test("should update transaction when it exist", async () => {
            // Arrange
            const { body: { addedTransactions: transactions } } = await superTestRequest.post("/api/transaction/all").send([
                { name: "transaction to update", amount: 100, assetType: "cash", currency: "usd", date: "2023-05-12", category: "other" },
                { name: "Test Transaction", amount: -100, assetType: "cash", currency: "usd", category: "Groceries", date: "2024-05-12" },
                { name: "Test Transaction", amount: -1, assetType: "crypto", currency: "btc", category: "Groceries", date: "2025-06-15" }
            ]);

            // Act
            const response = await superTestRequest.put("/api/transaction/" + transactions[0].id)
                .send({ name: "updated transaction", amount: 500, assetType: "cash", currency: "cad", category: "Groceries", date: "2026-06-03" });
            const getResponse = await superTestRequest.get("/api/transaction");

            // Assert
            expect(response.status).toBe(200);
            expect(getResponse.status).toBe(200);
            expect(getResponse.body.length).toEqual(3);
            expect(isValidString(response.body.transaction.id) || isNumber(response.body.transaction.id)).toBe(true);
            response.body.transaction.id = undefined;
            expect(response.body.transaction).toEqual({
                amount: 500,
                assetType: "cash",
                category: "Groceries",
                currency: "cad",
                date: 1780459200000,
                name: "updated transaction"
            })
            expect(getResponse.body.every(({ id }) => isValidString(id) || isNumber(id))).toBe(true);
            getResponse.body.map(t => { t.id = undefined; return t });
            expect(getResponse.body).toEqual([
                {
                    amount: 500,
                    assetType: "cash",
                    category: "Groceries",
                    currency: "cad",
                    date: 1780459200000,
                    name: "updated transaction"
                },
                {
                    amount: -100,
                    assetType: "cash",
                    category: "Groceries",
                    currency: "USD",
                    date: 1715486400000,
                    name: "Test Transaction"
                },
                {
                    amount: -1,
                    assetType: "crypto",
                    category: "Groceries",
                    currency: "BTC",
                    date: 1749960000000,
                    name: "Test Transaction"
                }
            ]);
        });
    });

    describe("Delete transaction", () => {
        test("should return not found if no transactions exist", async () => {
            // Act
            const response = await superTestRequest.delete("/api/transaction/68840d10473e26e9961d50fc");
            const getResponse = await superTestRequest.get("/api/transaction");

            // Assert
            expect(response.status).toBe(404);
            expect(getResponse.status).toBe(200);
            expect(getResponse.body.length).toEqual(0);
        });

        test("should return not found if transaction delete target does not exist", async () => {
            // Arrange
            await superTestRequest.post("/api/transaction/all").send([
                { name: "Test Transaction", amount: 100, assetType: "cash", currency: "usd" },
                { name: "Test Transaction", amount: -100, assetType: "cash", currency: "usd", category: "Groceries" },
                { name: "Test Transaction", amount: -1, assetType: "crypto", currency: "btc", category: "Groceries" }
            ]);

            // Act
            const response = await superTestRequest.delete("/api/transaction/68840d10473e26e9961d50fc");
            const getResponse = await superTestRequest.get("/api/transaction");

            // Assert
            expect(response.status).toBe(404);
            expect(getResponse.status).toBe(200);
            expect(getResponse.body.length).toEqual(3);
        });

        test("should delete transaction when it exist", async () => {
            // Arrange
            const { body: { addedTransactions: transactions } } = await superTestRequest.post("/api/transaction/all").send([
                { name: "transaction to delete", amount: 100, assetType: "cash", currency: "usd" },
                { name: "Test Transaction", amount: -100, assetType: "cash", currency: "usd", category: "Groceries" },
                { name: "Test Transaction", amount: -1, assetType: "crypto", currency: "btc", category: "Groceries" }
            ]);

            // Act
            const response = await superTestRequest.delete("/api/transaction/" + transactions[0].id);
            const getResponse = await superTestRequest.get("/api/transaction");

            // Assert
            expect(response.status).toBe(204);
            expect(getResponse.status).toBe(200);
            expect(getResponse.body.length).toEqual(2);
            expect(getResponse.body.filter(t => t.name === "transaction to delete").length).toBe(0);
        });
    });
});
