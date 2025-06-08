const { describe, expect, test } = require("@jest/globals");

const { isNumber } = require("../utils");

describe("utils", () => {
    describe("isNumber", () => {
        const validNumbers = [
            { input: 1, expected: true },
            { input: 2.5, expected: true },
            { input: "2.5", expected: true },
            { input: "1", expected: true }
        ];

        const invalidNumbers = [
            { input: "a", expected: false },
            { input: null, expected: false },
            { input: undefined, expected: false },
            { input: {}, expected: false },
            { input: [], expected: false }
        ];

        test.each(validNumbers)("should return true for numbers when valid: '%s'", ({ input, expected }) => {
            expect(isNumber(input)).toBe(expected);
        });

        test.each(invalidNumbers)("should return false for non-numbers: %s", ({ input, expected }) => {
            expect(isNumber(input)).toBe(expected);
        });

        test("should handle edge cases", () => {
            // add test for Number.MIN_SAFE_INTEGER and Number.MAX_SAFE_INTEGER
            expect(isNumber(Number.MIN_SAFE_INTEGER)).toBe(true);
            expect(isNumber(Number.MAX_SAFE_INTEGER)).toBe(true);

            expect(isNumber(Infinity)).toBe(true);
            expect(isNumber(-Infinity)).toBe(true);

            // const bigInt = 123456789012345678901234567890n;
            // expect(isNumber(bigInt)).toBe(true);

            const symbol = Symbol();
            expect(isNumber(symbol)).toBe(false);

            // add test for NaN
            expect(isNumber(NaN)).toBe(false); // changed to return false
        });
    });
});