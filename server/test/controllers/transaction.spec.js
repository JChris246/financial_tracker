const { describe, expect, test } = require("@jest/globals");
const { validateAddTransactionRequest, expectedHeader, csv, md, isEmptyRow } = require("../../services/Transactions");
const { isNumber } = require("../../utils/utils");

describe("Transactions", () => {
    // some of these may be very similar to the integration tests
    describe("validateAddTransactionRequest", () => {
        const invalidTransactionPayloads = [
            { input: { name: "Test Transaction", date: "2022-01-01" }, expected: { valid: false, msg: "You need to have the transaction amount" } },
            { input: { name: "Test Transaction", amount: 0 }, expected: { valid: false, msg: "You need to have a valid transaction amount" } },
            { input: { amount: 50 }, expected: { valid: false, msg: "You need to have the transaction name" } },
            { input: { amount: 50, name: "Test" }, expected: { valid: false, msg: "You need to have the transaction asset type" } },
            { input: { amount: 50, name: "Test", assetType: "test" },
                expected: { valid: false, msg: "You need to have a valid transaction asset type" } },
            { input: { amount: 50, name: "Test", assetType: "cash" },
                expected: { valid: false, msg: "You need to have the transaction currency" } },
            { input: { amount: 50, name: "Test", assetType: "cash", currency: "BTC" },
                expected: { valid: false, msg: "Asset currency not supported" } },
        ];

        const validTransactionPayloads = [
            // name,amount,date?,category?,assetType,currency
            { input: { amount: 50, name: "Test", assetType: "cash", currency: "USD" },
                expected: { valid: true, amount: 50, name: "Test", assetType: "cash", currency: "usd", category: "other" } },
            { input: { amount: 50, name: "Test", assetType: "cash", currency: "USD", date: "2022-01-01" },
                expected: { valid: true, amount: 50, name: "Test", assetType: "cash", currency: "usd",
                    date: 1641009600000, category: "other" } },
            { input: { amount: 50, name: "Test", assetType: "cash", currency: "USD", category: "Groceries" },
                expected: { valid: true, amount: 50, name: "Test", assetType: "cash", currency: "usd", category: "Groceries" } },
            { input: { amount: 50, name: "Test", assetType: "cash", currency: "USD", category: "Groceries" },
                expected: { valid: true, amount: 50, name: "Test", assetType: "cash", currency: "usd", category: "Groceries" } },
            { input: { amount: 50, name: "Test", assetType: "cash", currency: "USD", category: "Groceries", date: 1640995200000 },
                expected: { valid: true, amount: 50, name: "Test", assetType: "cash", currency: "usd",
                    category: "Groceries", date: 1640995200000 } },
            { input: { amount: 50, name: "Test", assetType: "crypto", currency: "BTC", category: "Groceries", date: 1640995200000 },
                expected: { valid: true, amount: 50, name: "Test", assetType: "crypto", currency: "BTC",
                    category: "Groceries", date: 1640995200000 } },
            { input: { amount: 50, name: "Test", assetType: "stock", currency: "MSFT", category: "Groceries", date: 1640995200000 },
                expected: { valid: true, amount: 50, name: "Test", assetType: "stock", currency: "MSFT",
                    category: "Groceries", date: 1640995200000 } },
        ];

        test.each(invalidTransactionPayloads)("should return false for invalid transaction payloads: '%s'", ({ input, expected }) => {
            expect(validateAddTransactionRequest(input)).toEqual(expected);
        });

        test.each(validTransactionPayloads)("should return true for valid transaction payloads: %s", ({ input, expected }) => {
            const result = validateAddTransactionRequest(input);

            if (!input.date) {
                expect(isNumber(result.date)).toEqual(true);
                expect({ ...validateAddTransactionRequest(input), date: undefined }).toEqual(expected);
            } else {
                expect(result).toEqual(expected);
            }
        });
    });

    describe("expectedHeader", () => {
        const invalidCsvHeaders = [
            { input: "", expected: { valid: false, missingFields: ["name", "amount", "date", "category", "assettype", "currency"] } },
            { input: "name", expected: { valid: false, missingFields: ["amount", "date", "category", "assettype", "currency"] } },
            { input: "name,amount", expected: { valid: false, missingFields: ["date", "category", "assettype", "currency"] } },
            { input: "name,date,amount", expected: { valid: false, missingFields: ["category", "assettype", "currency"] } },
            { input: "name,date,amount,category", expected: { valid: false, missingFields: ["assettype", "currency"] } },
            { input: "name,date,amount,category,assetType", expected: { valid: false, missingFields: ["currency"] } },
        ];

        const invalidMdHeaders = [
            { input: "", expected: { valid: false, missingFields: ["name", "amount", "date", "category", "assettype", "currency"] } },
            { input: "name", expected: { valid: false, missingFields: ["amount", "date", "category", "assettype", "currency"] } },
            { input: "|name|", expected: { valid: false, missingFields: ["amount", "date", "category", "assettype", "currency"] } },
            { input: "name|amount", expected: { valid: false, missingFields: ["date", "category", "assettype", "currency"] } },
            { input: "|name|amount|", expected: { valid: false, missingFields: ["date", "category", "assettype", "currency"] } },
            { input: "name|date|amount", expected: { valid: false, missingFields: ["category", "assettype", "currency"] } },
            { input: "|name|date|amount|", expected: { valid: false, missingFields: ["category", "assettype", "currency"] } },
            { input: "name|date|amount|category", expected: { valid: false, missingFields: ["assettype", "currency"] } },
            { input: "|name|date|amount|category|", expected: { valid: false, missingFields: ["assettype", "currency"] } },
            { input: "name|date|amount|category|assetType", expected: { valid: false, missingFields: ["currency"] } },
            { input: "|name|date|amount|category|assetType|", expected: { valid: false, missingFields: ["currency"] } },
        ];

        const validCsvHeaders = [
            { input: "name,date,amount,category,currency,assetType",
                expected: { valid: true, map: { name: 0, date: 1, amount: 2, category: 3, assettype: 5, currency: 4 } } },
            { input: "currency,name,date,amount,assetType,category",
                expected: { valid: true, map: { name: 1, date: 2, amount: 3, category: 5, assettype: 4, currency: 0 } } },
            { input: "name,amount,currency,category,assettype,date",
                expected: { valid: true, map: { name: 0, date: 5, amount: 1, category: 3, assettype: 4, currency: 2 } } },
            { input: "name,amount,currency,assettype,date",
                expected: { valid: true, map: { name: 0, date: 4, amount: 1, category: null, assettype: 3, currency: 2 } } }
        ];

        const validMdHeaders = [
            { input: "name|date|amount|category|currency|assetType",
                expected: { valid: true, map: { name: 0, date: 1, amount: 2, category: 3, assettype: 5, currency: 4 } } },
            { input: "|name|date|amount|category|currency|assetType|",
                expected: { valid: true, map: { name: 1, date: 2, amount: 3, category: 4, assettype: 6, currency: 5 } } },
            { input: "currency|name|date|amount|assetType|category",
                expected: { valid: true, map: { name: 1, date: 2, amount: 3, category: 5, assettype: 4, currency: 0 } } },
            { input: "|currency|name|date|amount|assetType|category|",
                expected: { valid: true, map: { name: 2, date: 3, amount: 4, category: 6, assettype: 5, currency: 1 } } },
            { input: "name|amount|currency|category|assettype|date",
                expected: { valid: true, map: { name: 0, date: 5, amount: 1, category: 3, assettype: 4, currency: 2 } } },
            { input: "|name|amount|currency|category|assettype|date|",
                expected: { valid: true, map: { name: 1, date: 6, amount: 2, category: 4, assettype: 5, currency: 3 } } },
            { input: "name|amount|currency|assettype|date",
                expected: { valid: true, map: { name: 0, date: 4, amount: 1, category: null, assettype: 3, currency: 2 } } },
            { input: "|name|amount|currency|assettype|date|",
                expected: { valid: true, map: { name: 1, date: 5, amount: 2, category: null, assettype: 4, currency: 3 } } }
        ];

        test.each(invalidCsvHeaders)("should return false for invalid csv headers: '%s'", ({ input, expected }) => {
            expect(expectedHeader(input, ",")).toEqual(expected);
        });

        test.each(invalidMdHeaders)("should return false for invalid markdown table headers: '%s'", ({ input, expected }) => {
            expect(expectedHeader(input, "|")).toEqual(expected);
        });

        test.each(validCsvHeaders)("should return true for valid csv transaction payloads: %s", ({ input, expected }) => {
            expect(expectedHeader(input, ",")).toEqual(expected);
        });

        test.each(validMdHeaders)("should return true for valid md transaction payloads: %s", ({ input, expected }) => {
            expect(expectedHeader(input, "|")).toEqual(expected);
        });
    });

    describe("csv", () => {
        test("should return csv for provided json transactions", () => {
            const input = [{ name: "Test", amount: 50, type: true, date: 1640995200000, category: "Groceries", assetType: "cash", currency: "USD" }];
            const expected = /Name,Amount,Date,Category,Asset Type,Currency\nTest,50,\d{4}-\d{2}-\d{2} \d{2}:\d{2},Groceries,cash,USD/;

            expect(csv(input)).toMatch(expected);
        });
    });

    describe("md", () => {
        test("should return markdown table for provided json transactions", () => {
            const input = [{ name: "Test", amount: 50, type: true, date: 1640995200000, category: "Groceries", assetType: "cash", currency: "USD" }];
            const header = "| Name | Amount | Date             | Category  | Asset Type | Currency |";
            const headerSeparator = "| ---- | ------ | ---------------- | --------- | ---------- | -------- |";
            const body = "| Test | 50     | \d{4}-\d{2}-\d{2} \d{2}:\d{2} | Groceries | cash       | USD      |"
            const expected = new RegExp(header + "\n" + headerSeparator + "\n" + body);

            expect(md(input)).toMatch(expected);
        });
    });

    describe("isEmptyRow", () => {
        const testCases = [
            { input: "name,amount,date,category,type".split(","), expected: false },
            { input: "name|amount|date|category|type".split("|"), expected: false },
            { input: "|name|amount|date|category|type|".split("|"), expected: false },
            { input: "|name| amount |date|category| type |".split("|"), expected: false },
            { input: "name,amount,date,,type".split(","), expected: false },
            { input: "name,,date, ,type".split(","), expected: false },
            { input: "| ---- | ------ | ---------------- | --------- | ---------- | -------- |".split("|"), expected: true },
            { input: "|----|------|----------------|---------| ---------- | -------- |".split("|"), expected: true },
            { input: " ----|------|----------------|---------| ---------- | -------- ".split("|"), expected: true },
            { input: ",,, ,".split(","), expected: true },
            { input: " , , , , ".split(","), expected: true },
            { input: "-,-,-,-,-".split(","), expected: true },
            { input: "-|-|-|-|-".split("|"), expected: true },
            { input: " |          | |       | ".split("|"), expected: true },
        ];

        test.each(testCases)("should return true if the row is only 'empty values' and false otherwise: '%s'", ({ input, expected }) => {
            expect(isEmptyRow(input)).toBe(expected);
        });
    })
});