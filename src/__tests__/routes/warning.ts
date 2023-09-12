import { describe, test } from "@jest/globals";
import request from "supertest";
import app from "../../main";
import { emptyDatabase, initialiseDatabase } from "../mock/database";
import { authorizationMS, authorizationUser, getAuth } from "../auth";
import e from "express";

describe("Tests for Warning endpoint that should succeed", () => {
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

    const warning1 = {
        time: "2023-01-01T12:00:00.000Z",
        origin: "engine/market/ATOMUSDT",
        message: "Warning 1",
        ref: JSON.stringify({ "socket1/delay": "" }),
    };

    const warning2 = {
        time: "2023-02-01T12:00:00.000Z",
        origin: "engine/market/ATOMUSDT",
        message: "Warning 2",
        ref: JSON.stringify({ "socket2/delay": "" }),
    };

    const warning3 = {
        time: "2023-03-01T12:00:00.000Z",
        origin: "engine/market/BTCUSDT",
        message: "Warning 3",
        ref: JSON.stringify({ "socket1/delay": "" }),
    };

    const warning4 = {
        time: "2023-04-01T12:00:00.000Z",
        origin: "engine/market/BTCUSDT",
        message: "Warning 4",
        ref: JSON.stringify({ "socket2/delay": "" }),
    };

    const warnings = [warning1, warning2, warning3, warning4];

    test("GET /warning", async () => {
        const token = await getAuth();

        // get all warnings
        const result1 = await session.get("/warning").set(authorizationMS);

        expect(result1.status).toEqual(200);

        const result1Body = result1.body.filter((element: any) => {
            delete element["id"];
            return true;
        });
        expect(result1Body).toEqual(warnings);

        // get warnings with specific message
        const result2 = await session
            .get("/warning?message=1")
            .set(authorizationUser(token));

        expect(result2.status).toEqual(200);

        const result2Body = result2.body.filter((element: any) => {
            delete element["id"];
            return true;
        });
        expect(result2Body).toEqual([warning1]);

        // get warnings within specific time range
        const result3 = await session
            .get(
                "/warning?before=2023-03-20T12:00:00.000Z&after=2023-01-20T12:00:00.000Z",
            )
            .set(authorizationMS);

        expect(result3.status).toEqual(200);

        const result3Body = result3.body.filter((element: any) => {
            delete element["id"];
            return true;
        });
        expect(result3Body).toEqual([warning2, warning3]);

        // get warnings from a specified origin
        const result4 = await session
            .get("/warning?origin=BTCUSDT")
            .set(authorizationUser(token));

        expect(result4.status).toEqual(200);

        const result4Body = result4.body.filter((element: any) => {
            delete element["id"];
            return true;
        });
        expect(result4Body).toEqual([warning3, warning4]);
    });

    test("GET /warning/:id", async () => {
        // get an existing entry
        const resultGet = await session.get("/warning").set(authorizationMS);

        expect(resultGet.status).toEqual(200);
        expect(resultGet.body.length).toBeGreaterThan(0);

        console.log(resultGet.body);
        const warning = resultGet.body[0];
        const id = warning.id;
        console.log(`id ${id}`);

        // as microservice
        const resultMicroservice = await session
            .get(`/warning/${id}`)
            .set(authorizationMS);

        expect(resultMicroservice.status).toEqual(200);
        expect(resultMicroservice.body).toEqual(warning);

        // as a user
        const token = await getAuth();
        const resultUser = await session
            .get(`/warning/${id}`)
            .set(authorizationUser(token));

        expect(resultUser.status).toEqual(200);
        expect(resultUser.body).toEqual(warning);
    });

    test("POST /warning as microservice", async () => {
        const warning = {
            origin: "dir/origin",
            message: "Message of new warning",
            ref: {
                "dir1/data1": 10,
                "dir1/data2": "fail",
            },
        };

        const expected: { origin: string; message: string; ref: string }[] =
            warnings.filter((element: any) => {
                delete element.time;
                return true;
            });
        expected.push({
            origin: warning.origin,
            message: warning.message,
            ref: JSON.stringify({
                dir1: {
                    data1: 10,
                    data2: "fail",
                },
            }),
        });

        const result = await session
            .post("/warning")
            .send(warning)
            .set(authorizationMS);

        expect(result.status).toEqual(201);
        expect(result.body).toEqual({});

        const resultGet = await session.get("/warning").set(authorizationMS);

        const body = resultGet.body.filter((element: any) => {
            delete element.id;
            delete element.time;
            return true;
        });

        expect(resultGet.status).toEqual(200);
        expect(body).toEqual(expected);
    });

    test("POST /warning as a user", async () => {
        const warning = {
            origin: "dir/origin",
            message: "Message of new warning",
            ref: {
                "dir1/data1": 10,
                "dir1/data2": "fail",
            },
        };

        const expected: { origin: string; message: string; ref: string }[] =
            warnings.filter((element: any) => {
                delete element.time;
                return true;
            });
        expected.push({
            origin: warning.origin,
            message: warning.message,
            ref: JSON.stringify({
                dir1: {
                    data1: 10,
                    data2: "fail",
                },
            }),
        });

        const token = await getAuth();

        const result = await session
            .post("/warning")
            .send(warning)
            .set(authorizationUser(token));

        expect(result.status).toEqual(201);
        expect(result.body).toEqual({});

        const resultGet = await session
            .get("/warning")
            .set(authorizationUser(token));

        const body = resultGet.body.filter((element: any) => {
            delete element.id;
            delete element.time;
            return true;
        });

        expect(resultGet.status).toEqual(200);
        expect(body).toEqual(expected);
    });

    test("Check createWarning from Warning Router", async () => {
        const data = {
            type: "warning",
            container: "new container",
            data: {
                data: "value",
            },
            message: "Message of new warning",
            origin: "dir/origin",
            ref: {
                "dir1/data1": 10,
                "dir1/data2": "fail",
            },
        };

        const expected: { origin: string; message: string; ref: string }[] =
            warnings.filter((element: any) => {
                delete element.time;
                return true;
            });
        expected.push({
            origin: data.origin,
            message: data.message,
            ref: JSON.stringify({
                dir1: {
                    data1: 10,
                    data2: "fail",
                },
            }),
        });

        // send a status with a warning to the Status endpoint
        const resultStatus = await session
            .post("/status")
            .send(data)
            .set(authorizationMS);

        expect(resultStatus.status).toEqual(201);

        // check if a new warning entry is added to the database (which should be done in the function createWarning)
        const resultWarning = await session
            .get("/warning")
            .set(authorizationMS);

        const body = resultWarning.body.filter((element: any) => {
            delete element.id;
            delete element.time;
            return true;
        });

        expect(resultWarning.status).toEqual(200);
        expect(body).toEqual(expected);
    });
});

describe("Tests for Warning endpoint that should fail", () => {
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
        test("GET /warning without a token", async () => {
            const result = await session.get(
                "/warning?message=Warning&origin=engine?before=2024-01-01&after=2022-1-1",
            );

            expect(result.status).toEqual(401);
            expect(result.unauthorized).toBeTruthy();
            expect(result.body).toEqual({ message: "Unauthorized" });
        });

        test("GET /warning/:id without a token", async () => {
            // retrieve an id to run test with
            const resultGetAll = await session
                .get("/warning")
                .set(authorizationMS);

            expect(resultGetAll.status).toEqual(200);
            expect(resultGetAll.body.length).toBeGreaterThan(0);

            const id = resultGetAll.body[0].id;

            // try to GET /warning/:id
            const resultGetOne = await session.get(`/warning/${id}`);

            expect(resultGetOne.status).toEqual(401);
            expect(resultGetOne.unauthorized).toBeTruthy();
            expect(resultGetOne.body).toEqual({ message: "Unauthorized" });
        });

        test("POST /warning without a token", async () => {
            const warning = {
                message: "message of warning",
                origin: "dir/origin",
                ref: {
                    data: "value",
                },
            };

            const result = await session.post("/warning").send(warning);

            expect(result.status).toEqual(401);
            expect(result.unauthorized).toBeTruthy();
            expect(result.body).toEqual({ message: "Unauthorized" });
        });
    });

    describe("Access endpoint with an unauthenticated token", () => {
        const authorization = { authorization: "unauthenticated token" };

        test("GET /warning with un unauthenticated token", async () => {
            const result = await session
                .get(
                    "/warning?message=Warning&origin=engine?before=2024-01-01&after=2022-1-1",
                )
                .set(authorization);

            expect(result.status).toEqual(401);
            expect(result.unauthorized).toBeTruthy();
            expect(result.body).toEqual({ message: "Unauthorized" });
        });

        test("GET /warning/:id with an unauthenticated token", async () => {
            // retrieve an id to run test with
            const resultGetAll = await session
                .get("/warning")
                .set(authorizationMS);

            expect(resultGetAll.status).toEqual(200);
            expect(resultGetAll.body.length).toBeGreaterThan(0);

            const id = resultGetAll.body[0].id;

            // try to GET /warning/:id
            const resultGetOne = await session
                .get(`/warning/${id}`)
                .set(authorization);

            expect(resultGetOne.status).toEqual(401);
            expect(resultGetOne.unauthorized).toBeTruthy();
            expect(resultGetOne.body).toEqual({ message: "Unauthorized" });
        });

        test("POST /warning with an unauthenticated token", async () => {
            const warning = {
                message: "message of warning",
                origin: "dir/origin",
                ref: {
                    data: "value",
                },
            };

            const result = await session
                .post("/warning")
                .send(warning)
                .set(authorization);

            expect(result.status).toEqual(401);
            expect(result.unauthorized).toBeTruthy();
            expect(result.body).toEqual({ message: "Unauthorized" });
        });
    });

    describe("Access endpoint using wrong data", () => {
        test("GET /warning using wrong types", async () => {
            // number instead of date
            const result1 = await session
                .get("/warning?after=1")
                .set(authorizationMS);

            expect(result1.status).toEqual(400);
            expect(result1.badRequest).toBeTruthy();
            expect(result1.body).toEqual({ message: "Bad Request" });

            // string instead of date
            const token = await getAuth();
            const result2 = await session
                .get("/warning?before=today")
                .set(authorizationUser(token));

            expect(result2.status).toEqual(400);
            expect(result2.badRequest).toBeTruthy();
            expect(result2.body).toEqual({ message: "Bad Request" });
        });

        test("GET /warning/:id with unexisting id", async () => {
            const result = await session.get("/warning/0").set(authorizationMS);

            expect(result.status).toEqual(404);
            expect(result.notFound).toBeTruthy();
            expect(result.body).toEqual({
                message: "Not Found",
                detail: "Resource does not exist",
            });
        });

        test("GET /warning/:id with wrong type of id", async () => {
            const token = await getAuth();

            const result = await session
                .get("/warning/wrongtype")
                .set(authorizationUser(token));

            expect(result.status).toEqual(400);
            expect(result.badRequest).toBeTruthy();
            expect(result.body).toEqual({ message: "Bad Request" });
        });

        test("POST /warning with wrong types", async () => {
            // boolean instead of string
            const warning1 = {
                message: false,
                origin: "dir/origin",
                ref: {
                    data: "value",
                },
            };

            const result1 = await session
                .post("/warning")
                .send(warning1)
                .set(authorizationMS);

            expect(result1.status).toEqual(400);
            expect(result1.badRequest).toBeTruthy();
            expect(result1.body).toEqual({ message: "Bad Request" });

            // number instead of JSON
            const token = await getAuth();

            const warning2 = {
                message: "Message of warning",
                origin: "dir/origin",
                ref: 1,
            };

            const result2 = await session
                .post("/warning")
                .send(warning2)
                .set(authorizationUser(token));

            expect(result2.status).toEqual(400);
            expect(result2.badRequest).toBeTruthy();
            expect(result2.body).toEqual({ message: "Bad Request" });

            // empty json
            const warning3 = {
                message: "Message of warning",
                origin: "dir/origin",
                ref: {},
            };

            const result3 = await session
                .post("/warning")
                .send(warning3)
                .set(authorizationUser(token));

            expect(result3.status).toEqual(400);
            expect(result3.badRequest).toBeTruthy();
            expect(result3.body).toEqual({ message: "Bad Request" });
        });
    });
});
