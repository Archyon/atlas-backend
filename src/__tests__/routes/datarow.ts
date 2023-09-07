import { describe, test } from "@jest/globals";
import request from "supertest";
import app from "../../main";
import { emptyDatabase, initialiseDatabase } from "../mock/database";
import { authorizationMS, authorizationUser, getAuth } from "../auth";

describe("Tests for Datarow endpoint that should succeed", () => {
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

    const datarow1 = {
        time: "2023-01-01T12:00:00.000Z",
        market_name: "ATOMUSDT",
        open: 0.274,
        high: 0.284,
        low: 0.268,
        close: 0.268,
    };

    const datarow2 = {
        time: "2023-02-01T12:00:00.000Z",
        market_name: "BTCUSDT",
        open: 4294757.286,
        high: 4294757.286,
        low: 4294757.286,
        close: 4294757.286,
    };

    const datarow3 = {
        time: "2023-03-01T12:00:00.000Z",
        market_name: "ATOMUSDT",
        open: 0.258,
        high: 0.265,
        low: 0.258,
        close: 0.262,
    };

    const datarow4 = {
        time: "2023-04-01T12:00:00.000Z",
        market_name: "BTCUSDT",
        open: 4294803.736,
        high: 4294803.736,
        low: 4294803.736,
        close: 4294803.736,
    };

    const datarows = [datarow1, datarow2, datarow3, datarow4];

    // TODO GET with filters
    test("GET /datarow as microservice", async () => {
        const result = await session.get("/datarow").set(authorizationMS);

        expect(result.status).toEqual(200);
        expect(result.body).toEqual(datarows);
    });

    test("GET /datarow/:id as microservice", async () => {
        const time = new Date(Date.UTC(2023, 0, 1, 12, 0, 0));
        const result = await session
            .get(`/datarow/${time}`)
            .send({ market: "ATOMUSDT" })
            .set(authorizationMS);

        expect(result.status).toEqual(200);
        expect(result.body).toEqual(datarow1);
    });

    test("POST /datarow as microservice", async () => {
        const datarow = [
            {
                time: 1683021600,
                market: "ATOMUSDT",
                open: 1.5,
                high: 1.5,
                low: 1.5,
                close: 1.5,
            },
        ];
        const result = await session
            .post("/datarow")
            .send(datarow)
            .set(authorizationMS);

        expect(result.status).toEqual(201);
        expect(result.body).toEqual({});
    });

    test("NOTIFY /datarow as microservice", async () => {
        const result = await session.notify("/datarow").set(authorizationMS);

        expect(result.status).toEqual(300);
        expect(result.body).toEqual({ method: "redirect" });
    });

    test("GET /datarow as a user", async () => {
        const token = await getAuth();
        const result = await session
            .get("/datarow")
            .set(authorizationUser(token));

        expect(result.status).toEqual(200);
        expect(result.body).toEqual(datarows);
    });

    test("GET /datarow/:id as a user", async () => {
        const time = new Date(Date.UTC(2023, 0, 1, 12, 0, 0));
        const token = await getAuth();
        const result = await session
            .get(`/datarow/${time}`)
            .send({ market: "ATOMUSDT" })
            .set(authorizationUser(token));

        expect(result.status).toEqual(200);
        expect(result.body).toEqual(datarow1);
    });

    test("POST /datarow as a user", async () => {
        const datarow = [
            {
                time: 1683021600,
                market: "ATOMUSDT",
                open: 1.5,
                high: 1.5,
                low: 1.5,
                close: 1.5,
            },
        ];
        const token = await getAuth();
        const result = await session
            .post("/datarow")
            .send(datarow)
            .set(authorizationUser(token));

        expect(result.status).toEqual(201);
        expect(result.body).toEqual({});
    });

    test("NOTIFY /datarow as a user", async () => {
        const token = await getAuth();
        const result = await session
            .notify("/datarow")
            .set(authorizationUser(token));

        expect(result.status).toEqual(300);
        expect(result.body).toEqual({ method: "redirect" });
    });
});

describe("Tests for Datarow endpoint that should fail", () => {
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
        test("GET /datarow without a token", async () => {
            const result = await session.get("/datarow");

            expect(result.status).toEqual(401);
            expect(result.unauthorized).toBeTruthy();
        });

        test("GET /datarow/:id without a token", async () => {
            const time = new Date(Date.UTC(2023, 0, 1, 12, 0, 0));
            const result = await session
                .get(`/datarow/${time}`)
                .send({ market: "ATOMUSDT" });

            expect(result.status).toEqual(401);
            expect(result.unauthorized).toBeTruthy();
        });

        test("POST /datarow without a token", async () => {
            const datarow = [
                {
                    time: 1683021600,
                    market: "ATOMUSDT",
                    open: 1.5,
                    high: 1.5,
                    low: 1.5,
                    close: 1.5,
                },
            ];
            const result = await session.post("/datarow").send(datarow);

            expect(result.status).toEqual(401);
            expect(result.unauthorized).toEqual(true);
        });

        test("NOTIFY /datarow without a token", async () => {
            const result = await session.notify("/datarow");

            expect(result.status).toEqual(401);
            expect(result.unauthorized).toBeTruthy();
        });
    });

    describe("Access endpoint with an unauthenticated token", () => {
        const authorization = { authorization: "unauthenticated token" };

        test("GET /datarow with an unauthenticated token", async () => {
            const result = await session.get("/datarow").set({ authorization });

            expect(result.status).toEqual(401);
            expect(result.unauthorized).toBeTruthy();
        });

        test("GET /datarow/:id with an unauthenticated token", async () => {
            const time = new Date(Date.UTC(2023, 0, 1, 12, 0, 0));
            const result = await session
                .get(`/datarow/${time}`)
                .send({ market: "ATOMUSDT" })
                .set(authorization);

            expect(result.status).toEqual(401);
            expect(result.unauthorized).toBeTruthy();
        });

        test("POST /datarow with an unauthenticated token", async () => {
            const datarow = [
                {
                    time: 1683021600,
                    market: "ATOMUSDT",
                    open: 1.5,
                    high: 1.5,
                    low: 1.5,
                    close: 1.5,
                },
            ];
            const result = await session
                .post("/datarow")
                .send(datarow)
                .set({ authorization });

            expect(result.status).toEqual(401);
            expect(result.unauthorized).toBeTruthy();
        });

        test("NOTIFY /datarow with an unauthenticated token", async () => {
            const result = await session
                .notify("/datarow")
                .set({ authorization });

            expect(result.status).toEqual(401);
            expect(result.unauthorized).toBeTruthy();
        });
    });

    describe("Use wrong types", () => {
        test("GET /datarow with wrong types", async () => {
            const token = await getAuth();

            // string instead of date
            const result1 = await session
                .get("/datarow?before=time")
                .set(authorizationMS);

            expect(result1.status).toEqual(400);
            expect(result1.badRequest).toBeTruthy();

            // int instead of date
            const result2 = await session
                .get("/datarow?after=1")
                .set(authorizationUser(token));

            expect(result2.status).toEqual(400);
            expect(result2.badRequest).toBeTruthy();
        });

        test("GET /datarow/:id with non existing id", async () => {
            const time = new Date(Date.UTC(2023, 0, 1, 12, 0, 0));

            // as the microservice
            const resultMicroservice = await session
                .get(`/datarow/${time}`)
                .send({ market: "FTMUSDT" })
                .set(authorizationMS);

            expect(resultMicroservice.status).toEqual(404);
            expect(resultMicroservice.notFound).toBeTruthy();

            // as a user
            const token = await getAuth();
            const resultUser = await session
                .get(`/datarow/3`)
                .send({ market: "FTMUSDT" })
                .set(authorizationUser(token));

            expect(resultUser.status).toEqual(404);
            expect(resultUser.notFound).toBeTruthy();
        });

        test("GET /datarow/:id with wrong type", async () => {
            const time = new Date(Date.UTC(2023, 0, 1, 12, 0, 0));

            // as the microservice
            const resultMicroservice = await session
                .get(`/datarow/${time}`)
                .send({ market: 3 })
                .set(authorizationMS);

            expect(resultMicroservice.status).toEqual(400);
            expect(resultMicroservice.badRequest).toBeTruthy();

            // as a user
            const token = await getAuth();
            const resultUser = await session
                .get(`/datarow/${time}`)
                .send({ market: true })
                .set(authorizationUser(token));

            expect(resultUser.status).toEqual(400);
            expect(resultUser.badRequest).toBeTruthy();
        });

        test("POST /datarow with wrong types", async () => {
            const token = await getAuth();

            // string instead of int
            const result1 = await session
                .post("/datarow")
                .send([
                    {
                        time: "10",
                        open: 1,
                        high: 1,
                        low: 1,
                        close: 1,
                        market: "ATOMUSDT",
                    },
                ])
                .set(authorizationMS);

            expect(result1.status).toEqual(400);
            expect(result1.badRequest).toBeTruthy();

            // boolean instead of int
            const result2 = await session
                .post("/datarow")
                .send([
                    {
                        time: false,
                        open: 1,
                        high: 1,
                        low: 1,
                        close: 1,
                        market: "ATOMUSDT",
                    },
                ])
                .set(authorizationMS);

            expect(result2.status).toEqual(400);
            expect(result2.badRequest).toBeTruthy();

            // date instead of float
            const result3 = await session
                .post("/datarow")
                .send([
                    {
                        time: 1000000,
                        open: new Date(),
                        high: 1,
                        low: 1,
                        close: 1,
                        market: "ATOMUSDT",
                    },
                ])
                .set(authorizationUser(token));

            expect(result3.status).toEqual(400);
            expect(result3.badRequest).toBeTruthy();

            // string instead of float
            const result4 = await session
                .post("/datarow")
                .send([
                    {
                        time: 1000000,
                        open: "1",
                        high: 1,
                        low: 1,
                        close: 1,
                        market: "ATOMUSDT",
                    },
                ])
                .set(authorizationUser(token));

            expect(result4.status).toEqual(400);
            expect(result4.badRequest).toBeTruthy();

            // non existing market
            const result5 = await session
                .post("/datarow")
                .send([
                    {
                        time: 1000000,
                        open: 1,
                        high: 1,
                        low: 1,
                        close: 1,
                        market: "nonexisting",
                    },
                ])
                .set(authorizationUser(token));

            expect(result5.status).toEqual(400);
            expect(result5.badRequest).toBeTruthy();
        });
    });
});
