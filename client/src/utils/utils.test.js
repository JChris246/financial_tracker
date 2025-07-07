import { describe, expect, test } from "@jest/globals";

import { pad, formatDate, DATE_TYPE, formatMoney } from "./utils";

describe("utils", () => {
    describe("pad", () => {
        const testCases = [
            { input: 123, n: 2, expected: "123" },
            { input: 12345, n: 3, expected: "12345" },
            { input: 1, n: 3, expected: "001" },
            { input: "abcde", n: 2, expected: "abcde" },
            { input: "1234", n: 5, expected: "01234" },
            { input: "01", n: 2, expected: "01" },
            { input: "1", n: 2, expected: "01" },
        ];

        test.each(testCases)("should pad string with zeros until length reaches n: '%s'", ({ input, n, expected }) => {
            expect(pad(input, n)).toBe(expected);
        });
    });

    describe("formatDate", () => {
        const validDateCases = [new Date(), new Date().getTime(), new Date().toISOString(), new Date("2023-01-07"), 1749348549650];

        test.each(validDateCases)("should format date to string as YYYY-MM-DDThh:mm for '%s'", input => {
            expect(formatDate(input, DATE_TYPE.INPUT)).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
        });

        test.each(validDateCases)("should format date to string as YYYY-MM-DDThh:mm for '%s'", input => {
            expect(formatDate(input, DATE_TYPE.DISPLAY_FULL)).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
        });

        test.each(validDateCases)("should format date to string as YYYY-MM-DD for '%s'", input => {
            expect(formatDate(input, DATE_TYPE.DISPLAY_DATE)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });

        test("should return blank string if provided date is falsy", () => {
            expect(formatDate(null, DATE_TYPE.INPUT)).toBe("");
            expect(formatDate(undefined, DATE_TYPE.DISPLAY_DATE)).toBe("");
            expect(formatDate("", DATE_TYPE.DISPLAY_DATE)).toBe("");
            expect(formatDate("", DATE_TYPE.DISPLAY_FULL)).toBe("");
        });
    });

    describe("formatMoney", () => {
        const testCases = [
            { input: 0, expected: "0.00" },
            { input: 100, expected: "100.00" },
            { input: 1000, expected: "1,000.00" },
            { input: 10000, expected: "10,000.00" },
            { input: 100000, expected: "100,000.00" },
            { input: 1000000, expected: "1,000,000.00" },
            { input: 10000000, expected: "10,000,000.00" },

            { input: .45, expected: "0.45" },
            { input: 100.56, expected: "100.56" },
            { input: 1000.43, expected: "1,000.43" },
            { input: 10000.64, expected: "10,000.64" },
            { input: 100000.546676, expected: "100,000.55" },
            { input: 1000000.6, expected: "1,000,000.60" },
            { input: 10000000.1, expected: "10,000,000.10" },
        ];

        test.each(testCases)("should format number with 2 decimal places and group with commas for every 3 digits: '%s'", ({ input, expected }) => {
            expect(formatMoney(input)).toBe(expected);
        });
    });
});