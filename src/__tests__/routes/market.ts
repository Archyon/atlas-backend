import { describe, test } from "@jest/globals";
import request from "supertest";
import app from "../../main";
import { emptyDatabase, initialiseDatabase } from "../mock/database";
import { authorizationMS, authorizationUser, getAuth } from "../auth";

describe("Tests for Market endpoint that should succeed", () => {
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

    const markets = [
        { name: "ATOMUSDT" },
        { name: "BTCUSDT" },
        { name: "ENJUSDT" },
    ];

    test("GET /market as microservice", async () => {
        const result = await session.get("/market").set(authorizationMS);

        expect(result.status).toEqual(200);
        expect(result.body).toEqual(markets);
    });

    test("GET /market/:id as microservice", async () => {
        const market = { name: "ATOMUSDT" };
        const result = await session
            .get("/market/ATOMUSDT")
            .set(authorizationMS);

        expect(result.status).toEqual(200);
        expect(result.body).toEqual(market);
    });

    test("POST /market as microservice", async () => {
        const market = { name: "FTMUSDT" };
        const result = await session
            .post("/market")
            .send(market)
            .set(authorizationMS);

        expect(result.status).toEqual(201);
        expect(result.body).toEqual({});

        const expected = [
            { name: "ATOMUSDT" },
            { name: "BTCUSDT" },
            { name: "ENJUSDT" },
            { name: "FTMUSDT" },
        ];
        const checkData = await session.get("/market").set(authorizationMS);

        expect(checkData.status).toEqual(200);
        expect(checkData.body).toEqual(expected);
    });

    test("GET /market as a user", async () => {
        const token = await getAuth();
        const result = await session
            .get("/market")
            .set(authorizationUser(token));

        expect(result.status).toEqual(200);
        expect(result.body).toEqual(markets);
    });

    test("GET /market/:id as a user", async () => {
        const token = await getAuth();
        const result = await session
            .get("/market/ATOMUSDT")
            .set(authorizationUser(token));

        expect(result.status).toEqual(200);
        expect(result.body).toEqual({ name: "ATOMUSDT" });
    });

    test("POST /market as a user", async () => {
        const market = { name: "FTMUSDT" };
        const token = await getAuth();
        const result = await session
            .post("/market")
            .send(market)
            .set(authorizationUser(token));

        expect(result.status).toEqual(201);
        expect(result.body).toEqual({});

        const expected = [
            { name: "ATOMUSDT" },
            { name: "BTCUSDT" },
            { name: "ENJUSDT" },
            { name: "FTMUSDT" },
        ];
        const checkData = await session
            .get("/market")
            .set(authorizationUser(token));

        expect(checkData.status).toEqual(200);
        expect(checkData.body).toEqual(expected);
    });
});

describe("Tests for Market endpoint that should fail", () => {
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

    describe("Access endpoint without an authentication token", () => {
        test("GET /market without a token", async () => {
            const result = await session.get("/market");

            expect(result.status).toEqual(401);
            expect(result.unauthorized).toEqual(true);
        });

        test("GET /market/:id without a token", async () => {
            const result = await session.get("/market/ATOMUSDT");

            expect(result.status).toEqual(401);
            expect(result.unauthorized).toEqual(true);
        });

        test("POST /market without a token", async () => {
            const market = { name: "FTMUSDT" };
            const result = await session.post("/market").send(market);

            expect(result.status).toEqual(401);
            expect(result.unauthorized).toEqual(true);
        });
    });

    describe("Access endpoint with an unauthenticated token", () => {
        const authorization = { authorization: "unauthenticated token" };

        test("GET /market with an unauthenticated token", async () => {
            const result = await session.get("/market").set({ authorization });

            expect(result.status).toEqual(401);
            expect(result.unauthorized).toEqual(true);
        });

        test("GET /market/:id with an unauthenticated token", async () => {
            const result = await session
                .get("/market/ATOMUSDT")
                .set({ authorization });

            expect(result.status).toEqual(401);
            expect(result.unauthorized).toEqual(true);
        });

        test("POST /market with an unauthenticated token", async () => {
            const market = { name: "FTMUSDT" };
            const result = await session
                .post("/market")
                .send(market)
                .set({ authorization });

            expect(result.status).toEqual(401);
            expect(result.unauthorized).toEqual(true);
        });
    });

    describe("Use wrong types", () => {
        test("GET /market/:id with non existing id", async () => {
            // as the microservice
            const resultMicroservice = await session
                .get("/market/FTMUSDT")
                .set(authorizationMS);

            expect(resultMicroservice.status).toEqual(404);
            expect(resultMicroservice.notFound).toEqual(true);

            // as a user
            const token = await getAuth();
            const resultUser = await session
                .get("/market/2")
                .set(authorizationUser(token));

            expect(resultUser.status).toEqual(404);
            expect(resultUser.notFound).toEqual(true);
        });

        test("POST /market/ with wrong type", async () => {
            // as the microservice
            const resultMicroservice = await session
                .post("/market")
                .send({ name: 3 })
                .set(authorizationMS);

            expect(resultMicroservice.status).toEqual(400);
            expect(resultMicroservice.badRequest).toEqual(true);

            // as a user
            const token = await getAuth();
            const resultUser = await session
                .post("/market")
                .send({ name: true })
                .set(authorizationUser(token));

            expect(resultUser.status).toEqual(400);
            expect(resultUser.badRequest).toEqual(true);
        });
    });
});
