const { describe, expect, test } = require("@jest/globals");

const { isNumber, makeBool, isDefined, isValidArray, positiveNumberOrZero, toPrecision } = require("../../utils/utils");

describe("utils", () => {
    describe("isNumber", () => {
        const validNumbers = [
            { input: 1, expected: true },
            { input: 2.5, expected: true },
            { input: 0, expected: true },
            { input: -1, expected: true },
            { input: -2.5, expected: true },
            { input: "2.5", expected: true },
            { input: "1", expected: true },
            { input: "-1", expected: true },
            { input: "-1.25", expected: true },
            { input: "1.25", expected: true },
            { input: "0", expected: true },
        ];

        const invalidNumbers = [
            { input: "a", expected: false },
            { input: null, expected: false },
            { input: undefined, expected: false },
            { input: {}, expected: false },
            { input: [], expected: false },
            { input: "", expected: false }
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
        ])("returns true if the input is defined and not null or undefined (false otherwise): '%s'", ({ value, expected }) => {
            expect(isDefined(value)).toBe(expected);
        });
    });

    describe("isValidArray", () => {
        test.each([
            { value: undefined, expected: false },
            { value: null, expected: false },
            { expected: false },
            { value: {}, expected: false },
            { value: 1, expected: false },
            { value: "", expected: false },
            { value: true, expected: false },
            { value: false, expected: false },
            { value: [], expected: false },
            { value: [""], expected: true },
            { value: [1], expected: true },
            { value: ["a", 1], expected: true },
        ])("returns true if the input is an array with at least one element (false otherwise): '%s'", ({ value, expected }) => {
            expect(isValidArray(value)).toBe(expected);
        });
    });

    describe("positiveNumberOrZero", () => {
        test.each([
            { value: undefined, expected: 0 },
            { value: null, expected: 0 },
            { expected: 0 },
            { value: {}, expected: 0 },
            { value: "", expected: 0 },
            { value: true, expected: 0 },
            { value: false, expected: 0 },
            { value: [], expected: 0 },
            { value: 0, expected: 0 },
            { value: -1, expected: 0 },
            { value: -12.45, expected: 0 },
            { value: -.45, expected: 0 },
            { value: -0.45, expected: 0 },
            { value: 1, expected: 1 },
            { value: 12, expected: 12 },
            { value: 12.67, expected: 12.67 },
        ])("returns the number as is if it is a positive number and 0 otherwise: '%s'", ({ value, expected }) => {
            expect(positiveNumberOrZero(value)).toBe(expected);
        });
    });

    describe("toPrecision", () => {
        test.each([
            { value: undefined, places: 1, expected: undefined },
            { value: null, places: 2, expected: null },
            { expected: undefined },
            { value: {}, expected: {} },
            { value: "", expected: "" },
            { value: true, expected: true },
            { value: false, expected: false },
            { value: [], expected: [] },
            { value: 0, expected: 0 },
            { value: 0, places: 2, expected: 0 },
            { value: -1, expected: -1 },
            { value: -12.45, expected: -12.45 },
            { value: -.45, places: 2, expected: -.45 },
            { value: 1, expected: 1 },
            { value: 12, places: 2, expected: 12 },
            { value: 12.67546232, expected: 12.6755 },
            { value: 0.30000000000000004, expected: 0.3 },
        ])("returns the number to n decimal places (sig figs) or as is if is not a number '%s'", ({ value, places, expected }) => {
            expect(toPrecision(value, places)).toEqual(expected);
        });
    });
});