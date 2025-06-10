const { describe, expect, test, afterAll } = require("@jest/globals");
const supertest = require("supertest");
const server = require("../financial_tracker_server.js");
const superTestRequest = supertest(server);

const { getDatabase } = require("../db/index");

describe("ping", () => {
    afterAll(async () => {
        getDatabase().wipeDb();
    });

    test("ping", async () => {
        // Act
        const response = await superTestRequest.get("/api/ping");

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.msg).toEqual("Pong");
    });
});
