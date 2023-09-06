import { describe, test } from "@jest/globals";
import request from "supertest";
import app from "../../main";

describe("Tests for Market endpoint", () => {
    let session: request.SuperTest<request.Test>;

    beforeAll(() => {
        session = request(app);
    });
    afterAll(() => {
        app.close();
    });

    describe("Tests that should succeed", () => {
        test("GET /market from microservice", async () => {
            const result = await session
                .get("/market")
                .set({ authorization: process.env.API_TOKEN });
            expect(result.status).toEqual(200);
            console.log("result: " + JSON.stringify(result.body));
        });
    });
});
