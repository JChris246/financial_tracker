const { describe, expect, test } = require("@jest/globals");
const { validateAddTransactionRequest, expectedCsvHeader} = require("../../controllers/Transactions");
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
            // name,amount,type?,date?,category?,assetType,currency
            { input: { amount: 50, name: "Test", assetType: "cash", currency: "USD" },
                expected: { valid: true, amount: 50, name: "Test", assetType: "cash", currency: "USD", type: true } },
            { input: { amount: 50, name: "Test", assetType: "cash", currency: "USD", date: "2022-01-01" },
                expected: { valid: true, amount: 50, name: "Test", assetType: "cash", currency: "USD", type: true, date: 1640995200000 } },
            { input: { amount: 50, name: "Test", assetType: "cash", currency: "USD", category: "Groceries" },
                expected: { valid: true, amount: 50, name: "Test", assetType: "cash", currency: "USD", type: true, category: "Groceries" } },
            { input: { amount: 50, name: "Test", assetType: "cash", currency: "USD", category: "Groceries", type: true },
                expected: { valid: true, amount: 50, name: "Test", assetType: "cash", currency: "USD", type: true, category: "Groceries" } },
            { input: { amount: 50, name: "Test", assetType: "cash", currency: "USD", category: "Groceries", type: true, date: 1640995200000 },
                expected: { valid: true, amount: 50, name: "Test", assetType: "cash", currency: "USD",
                    type: true, category: "Groceries", date: 1640995200000 } },
            { input: { amount: 50, name: "Test", assetType: "crypto", currency: "BTC", category: "Groceries", type: true, date: 1640995200000 },
                expected: { valid: true, amount: 50, name: "Test", assetType: "crypto", currency: "BTC",
                    type: true, category: "Groceries", date: 1640995200000 } },
            { input: { amount: 50, name: "Test", assetType: "stock", currency: "MSFT", category: "Groceries", type: true, date: 1640995200000 },
                expected: { valid: true, amount: 50, name: "Test", assetType: "stock", currency: "MSFT",
                    type: true, category: "Groceries", date: 1640995200000 } },
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

    describe("expectedCsvHeader", () => {
        const invalidCsvHeaders = [
            { input: "", expected: { valid: false, missingFields: ["name", "amount", "type", "date", "category", "assettype", "currency"] } },
            { input: "name", expected: { valid: false, missingFields: ["amount", "type", "date", "category", "assettype", "currency"] } },
            { input: "name,amount", expected: { valid: false, missingFields: ["type", "date", "category", "assettype", "currency"] } },
            { input: "name,amount,type", expected: { valid: false, missingFields: ["date", "category", "assettype", "currency"] } },
            { input: "name,date,amount,type", expected: { valid: false, missingFields: ["category", "assettype", "currency"] } },
            { input: "name,date,amount,category,type", expected: { valid: false, missingFields: ["assettype", "currency"] } },
            { input: "name,date,amount,category,type,assetType", expected: { valid: false, missingFields: ["currency"] } },
        ];

        const validCsvHeaders = [
            { input: "name,date,amount,category,type,currency,assetType",
                expected: { valid: true, map: { name: 0, date: 1, amount: 2, category: 3, type: 4, assettype: 6, currency: 5 } } },
            { input: "currency,name,date,amount,type,assetType,category",
                expected: { valid: true, map: { name: 1, date: 2, amount: 3, category: 6, type: 4, assettype: 5, currency: 0 } } },
            { input: "name,amount,currency,category,type,assettype,date",
                expected: { valid: true, map: { name: 0, date: 6, amount: 1, category: 3, type: 4, assettype: 5, currency: 2 } } },
            { input: "name,amount,currency,category,assettype,date",
                expected: { valid: true, map: { name: 0, date: 5, amount: 1, category: 3, type: null, assettype: 4, currency: 2 } } },
        ];

        test.each(invalidCsvHeaders)("should return false for invalid csv headers: '%s'", ({ input, expected }) => {
            expect(expectedCsvHeader(input)).toEqual(expected);
        });

        test.each(validCsvHeaders)("should return true for valid transaction payloads: %s", ({ input, expected }) => {
            expect(expectedCsvHeader(input)).toEqual(expected);
        });
    });
});