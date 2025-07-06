const { describe, expect, test } = require("@jest/globals");
const supertest = require("supertest");
const server = require("../financial_tracker_server.js");
const superTestRequest = supertest(server);

const { ASSET_TYPE } = require("../utils/constants");

describe.only("price endpoints", () => {
    describe("getCurrencies", () => {
        test("should return bad request if invalid asset type is provided", async () => {
            // Act
            const response = await superTestRequest.get("/api/price/cash");

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual("Asset type not supported");
        });

        test("should return bad request if invalid stock type is provided", async () => {
            // Act
            const response = await superTestRequest.get("/api/price/stock/notAStock");

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual("Stock not supported");
        });

        test("should return bad request if invalid crypto type is provided", async () => {
            // Act
            const response = await superTestRequest.get("/api/price/crypto/notACrypto");

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual("Crypto currency not supported");
        });

        // expected values based on test assets `server/test/assets/*`
        test.each([
            { assetType: ASSET_TYPE.CRYPTO, currency: "btc", expectedValue: 107576 },
            { assetType: ASSET_TYPE.CRYPTO, currency: "eth", expectedValue: 2487.09 },
            { assetType: ASSET_TYPE.STOCK, currency: "amd", expectedValue: 137.91 },
            { assetType: ASSET_TYPE.STOCK, currency: "nvda", expectedValue: 159.34 }
        ])("should return price of given currency: %s", async ({ assetType, currency, expectedValue }) => {
            // Act
            const response = await superTestRequest.get("/api/price/" + assetType + "/" + currency);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body[Object.keys(response.body)[0]]).toEqual(expectedValue);
        });

        test("should return a list of the prices of stock", async () => {
            // Act
            const response = await superTestRequest.get("/api/price/stock");

            // Assert
            expect(response.status).toBe(200);
            console.log(response.body);
            // expect(Object.keys(response.body).length).toBeGreaterThan(1);
            expect(response.body[Object.keys(response.body)[0]]).toBeGreaterThan(0);
        });

        test("should return a list of the prices of crypto currencies", async () => {
            // Act
            const response = await superTestRequest.get("/api/price/crypto");

            // Assert
            expect(response.status).toBe(200);
            // expect(Object.keys(response.body).length).toBeGreaterThan(1);
            expect(response.body[Object.keys(response.body)[0]]).toBeGreaterThan(0);
        });
    })
});
