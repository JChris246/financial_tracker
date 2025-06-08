import { pad, formatDate, DATE_TYPE } from "./utils";

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
            expect(formatDate(input, DATE_TYPE.INPUT)).toMatch(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})$/);
        });

        test.each(validDateCases)("should format date to string as YYYY-MM-DDThh:mm for '%s'", input => {
            expect(formatDate(input, DATE_TYPE.DISPLAY)).toMatch(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2})$/);
        });

        test("should return blank string if provided date is falsy", () => {
            expect(formatDate(null, DATE_TYPE.INPUT)).toBe("");
            expect(formatDate(undefined, DATE_TYPE.DISPLAY)).toBe("");
            expect(formatDate("", DATE_TYPE.DISPLAY)).toBe("");
        });
    });
});