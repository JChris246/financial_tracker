const { describe, expect, test } = require("@jest/globals");

const { isNumber, makeBool, isDefined } = require("../utils");

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

    describe("makeBool", () => {
        test("returns true when given a boolean value", () => {
            expect(makeBool(true)).toBe(true);
            expect(makeBool(false)).toBe(false);
        });

        test.each([
            [{}], // Object
            [[]], // Object/Array
            [null], // Null
            [undefined], // undefined
        ])("returns false for non-boolean inputs that are not strings or numbers: '%s'", (input) => {
            expect(makeBool(input)).toBe(false);
        });

        test.each([
            { input: 0, expected: false },
            { input: 1, expected: true },
            { input: 2, expected: true },
        ])("converts numeric values to boolean based on their value '%s'", ({ input, expected }) => {
            expect(makeBool(input)).toBe(expected);
        });

        test.each([
            { input: "true", expected: true },
            { input: "True", expected: true },
            { input: "TRUE", expected: true },
            { input: "1", expected: true },
            { input: "yes", expected: true },
            { input: "Yes", expected: true },
            { input: "YES", expected: true },
            { input: "false", expected: false },
            { input: "l", expected: false },
        ])("converts strings to boolean based on their content: '%s'", ({ input, expected }) => {
            expect(makeBool(input)).toBe(expected);
        });
    });

    describe("isDefined", () => {
        test.each([
            { value: undefined, expected: false },
            { value: null, expected: false },
            { expected: false },
            { value: 0, expected: true },
            { value: 1, expected: true },
            { value: "", expected: true },
            { value: "a", expected: true },
            { value: {}, expected: true },
            { value: [], expected: true },
        ])("returns true if the input is defined and not null or undefined: '%s'", ({ value, expected }) => {
            expect(isDefined(value)).toBe(expected);
        });
    });
});