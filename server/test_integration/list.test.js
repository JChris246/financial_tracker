const { describe, expect, test } = require("@jest/globals");
const supertest = require("supertest");
const server = require("../financial_tracker_server.js");
const superTestRequest = supertest(server);

const { ASSET_TYPE, DEFAULT_CATEGORIES, ASSET_CURRENCIES } = require("../utils/constants");

describe("list endpoints", () => {
    test("getAssetTypes - should return asset type list", async () => {
        // Act
        const response = await superTestRequest.get("/api/list/asset-type");

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual(Object.values(ASSET_TYPE));
    });

    test("getTransactionCategories - should return list of categories", async () => {
        // Act
        const response = await superTestRequest.get("/api/list/category");

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual(DEFAULT_CATEGORIES);
    });

    describe("getCurrencies", () => {
        test.each([
            { assetType: ASSET_TYPE.CASH, currencies: ASSET_CURRENCIES[ASSET_TYPE.CASH] },
            { assetType: ASSET_TYPE.STOCK, currencies: ASSET_CURRENCIES[ASSET_TYPE.STOCK] },
            { assetType: ASSET_TYPE.CRYPTO, currencies: ASSET_CURRENCIES[ASSET_TYPE.CRYPTO] }
        ])("should return list of currencies per asset type", async ({ assetType, currencies }) => {
            // Act
            const response = await superTestRequest.get("/api/list/currency/" + assetType);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toEqual(currencies);
        });

        test("should return bad request when invalid asset type is provided", async () => {
            // Act
            const response = await superTestRequest.get("/api/list/currency/junk");

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.msg).toEqual("Invalid asset type");
        })

        test("should return all asset currencies when non provided", async () => {
            // Act
            const response = await superTestRequest.get("/api/list/currency");

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toEqual(ASSET_CURRENCIES);
        })
    })
});
