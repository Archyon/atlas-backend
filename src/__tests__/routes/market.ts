import { describe, test } from "@jest/globals";
import request from "supertest";
import app from "../../main";
import { emptyDatabase, initialiseDatabase } from "../mock/database";
import { authorizationMS, authorizationUser, getAuth } from "../auth";

describe("Tests for Market endpoint", () => {
    let session: request.SuperTest<request.Test>;

    beforeAll(() => {
        session = request(app);
    });

    beforeEach(async () => {
        await emptyDatabase();
        await initialiseDatabase();
    });

    afterAll(() => {
        app.close();
    });

    describe("Tests that should succeed", () => {
        const markets = [
            { name: "ATOMUSDT" },
            { name: "BTCUSDT" },
            { name: "ENJUSDT" },
        ];

        test("GET /market from microservice", async () => {
            const result = await session.get("/market").set(authorizationMS);

            expect(result.status).toEqual(200);
            expect(result.body).toEqual(markets);
        });

        test("GET /market/:id from microservice", async () => {
            const market = { name: "ATOMUSDT" };
            const result = await session
                .get("/market/ATOMUSDT")
                .set(authorizationMS);

            expect(result.status).toEqual(200);
            expect(result.body).toEqual(market);
        });

        test("POST /market from microservice", async () => {
            const market = { name: "FTMUSDT" };
            const result = await session
                .post("/market")
                .send(market)
                .set(authorizationMS);

            expect(result.status).toEqual(201);
            expect(result.body).toEqual(market);
        });

        test("NOTIFY /market from microservice", async () => {
            const result = await session.notify("/market").set(authorizationMS);

            expect(result.status).toEqual(300);
            expect(result.body).toEqual({ method: "redirect" });
        });

        test("GET /market from a user", async () => {
            const token = await getAuth();
            const result = await session
                .get("/market")
                .set(authorizationUser(token));

            expect(result.status).toEqual(200);
            expect(result.body).toEqual(markets);
        });

        test("GET /market/:id from a user", async () => {
            const token = await getAuth();
            const result = await session
                .get("/market/ATOMUSDT")
                .set(authorizationUser(token));

            expect(result.status).toEqual(200);
            expect(result.body).toEqual({ name: "ATOMUSDT" });
        });

        test("POST /market from a user", async () => {
            const market = { name: "FTMUSDT" };
            const token = await getAuth();
            const result = await session
                .post("/market")
                .send(market)
                .set(authorizationUser(token));

            expect(result.status).toEqual(201);
            expect(result.body).toEqual(market);
        });

        test("NOTIFY /market from a user", async () => {
            const token = await getAuth();
            const result = await session
                .notify("/market")
                .set(authorizationUser(token));

            expect(result.status).toEqual(300);
            expect(result.body).toEqual({ method: "redirect" });
        });
    });
});
