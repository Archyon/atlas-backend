import { describe, test } from "@jest/globals";
import request from "supertest";
import app from "../../main";
import { emptyDatabase, initialiseDatabase } from "../mock/database";
import { authorizationMS, authorizationUser, getAuth } from "../auth";

const states = {
    container1: {
        data1: 1,
        subdata: {
            sub1: "val1",
            sub2: true,
        },
    },
    container2: {
        data1: "value",
        data2: 2.5,
    },
};

async function initialiseStates(session: request.SuperTest<request.Test>) {
    // delete all existing states
    const resultDelete = await session.delete("/status").set(authorizationMS);
    expect(resultDelete.status).toEqual(200);
    expect(resultDelete.body).toEqual({});

    // add new states
    const data1 = {
        type: "info",
        container: "container1",
        data: {
            "data1": 1,
            "subdata/sub1": "val1",
            "subdata/sub2": true,
        },
    };

    const result1 = await session
        .post("/status")
        .send(data1)
        .set(authorizationMS);

    expect(result1.status).toEqual(201);
    expect(result1.body).toEqual({});

    const data2 = {
        type: "info",
        container: "container2",
        data: {
            data1: "value",
            data2: 2.5,
        },
    };

    const result2 = await session
        .post("/status")
        .send(data2)
        .set(authorizationMS);

    expect(result2.status).toEqual(201);
    expect(result2.body).toEqual({});
}

describe("Tests for Status endpoint that should succeed", () => {
    let session: request.SuperTest<request.Test>;

    beforeAll(() => {
        session = request(app);
    });

    beforeEach(async () => {
        await emptyDatabase();
        await initialiseDatabase();
        await initialiseStates(session);
    });

    afterAll(() => {
        app.close();
    });

    test("GET /status without specified container", async () => {
        // as microservice
        const resultMicroservice = await session
            .get("/status")
            .set(authorizationMS);

        expect(resultMicroservice.status).toEqual(200);
        expect(resultMicroservice.body).toEqual(states);

        // as a user
        const token = await getAuth();
        const resultUser = await session
            .get("/status")
            .set(authorizationUser(token));

        expect(resultUser.status).toEqual(200);
        expect(resultUser.body).toEqual(states);
    });

    test("GET /status with specific container", async () => {
        // as microservice
        const resultMicroservice = await session
            .get("/status?container=container1")
            .set(authorizationMS);

        expect(resultMicroservice.status).toEqual(200);
        expect(resultMicroservice.body).toEqual(states.container1);

        // as a user
        const token = await getAuth();
        const resultUser = await session
            .get("/status?container=container2")
            .set(authorizationUser(token));

        expect(resultUser.status).toEqual(200);
        expect(resultUser.body).toEqual(states.container2);
    });

    test("GET /status with specific container and values", async () => {
        // as microservice
        const resultMicroservice = await session
            .get("/status?container=container1&values=[data1,subdata/sub2]")
            .set(authorizationMS);

        const expected = {
            data1: states.container1.data1,
            subdata: {
                sub2: states.container1.subdata.sub2,
            },
        };

        expect(resultMicroservice.status).toEqual(200);
        expect(resultMicroservice.body).toEqual(expected);

        // as a user
        const token = await getAuth();
        const resultUser = await session
            .get("/status?container=container2&values=[data2]")
            .set(authorizationUser(token));

        expect(resultUser.status).toEqual(200);
        expect(resultUser.body).toEqual({ data2: states.container2.data2 });
    });

    test("POST /status with new container", async () => {
        const data = {
            type: "info",
            container: "newContainer",
            data: {
                "delay": 1.5,
                "dir/data1": "value",
                "dir/data2": true,
                "data1": 2,
            },
        };

        const expected = {
            ...states,
            newContainer: {
                delay: 1.5,
                dir: {
                    data1: "value",
                    data2: true,
                },
                data1: 2,
            },
        };

        // as microservice
        const resultMicroservice = await session
            .post("/status")
            .send(data)
            .set(authorizationMS);

        expect(resultMicroservice.status).toEqual(201);
        expect(resultMicroservice.body).toEqual({});

        const getMicroservice = await session
            .get("/status")
            .set(authorizationMS);

        expect(getMicroservice.status).toEqual(200);
        expect(getMicroservice.body).toEqual(expected);

        // as a user
        await initialiseStates(session);
        const token = await getAuth();
        const resultUser = await session
            .post("/status")
            .send(data)
            .set(authorizationUser(token));

        expect(resultUser.status).toEqual(201);
        expect(resultUser.body).toEqual({});

        const getUser = await session
            .get("/status")
            .set(authorizationUser(token));

        expect(getUser.status).toEqual(200);
        expect(getUser.body).toEqual(expected);
    });

    test("POST /status with existing container", async () => {
        const data = {
            type: "info",
            container: "container1",
            data: {
                "dir/data1": "value",
                "dir/data2": true,
                "data2": 2,
                "subdata/sub2": "val2",
            },
        };

        const expected = {
            container1: {
                data1: 1,
                data2: 2,
                dir: {
                    data1: "value",
                    data2: true,
                },
                subdata: {
                    sub1: "val1",
                    sub2: "val2",
                },
            },
            container2: {
                data1: "value",
                data2: 2.5,
            },
        };

        // as microservice
        const resultMicroservice = await session
            .post("/status")
            .send(data)
            .set(authorizationMS);

        expect(resultMicroservice.status).toEqual(201);
        expect(resultMicroservice.body).toEqual({});

        const getMicroservice = await session
            .get("/status")
            .set(authorizationMS);

        expect(getMicroservice.status).toEqual(200);
        expect(getMicroservice.body).toEqual(expected);

        // as a user
        await initialiseStates(session);
        const token = await getAuth();
        const resultUser = await session
            .post("/status")
            .send(data)
            .set(authorizationUser(token));

        expect(resultUser.status).toEqual(201);
        expect(resultUser.body).toEqual({});

        const getUser = await session
            .get("/status")
            .set(authorizationUser(token));

        expect(getUser.status).toEqual(200);
        expect(getUser.body).toEqual(expected);
    });
});

describe("Tests for Status endpoint that should fail", () => {
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
        test("GET /status without a token", async () => {
            // without a specified container
            const result1 = await session.get("/status");

            expect(result1.status).toEqual(401);
            expect(result1.unauthorized).toBeTruthy();
            expect(result1.body).toEqual({ message: "Unauthorized" });

            // with a specified container
            const result2 = await session.get("/status?container=container1");

            expect(result2.status).toEqual(401);
            expect(result2.unauthorized).toBeTruthy();
            expect(result2.body).toEqual({ message: "Unauthorized" });

            // with a specified container and values
            const result3 = await session.get(
                "/status?container=container1&values=[data,subdata/sub1]",
            );

            expect(result3.status).toEqual(401);
            expect(result3.unauthorized).toBeTruthy();
            expect(result3.body).toEqual({ message: "Unauthorized" });
        });

        test("POST /status without a token", async () => {
            const data = {
                type: "info",
                container: "container1",
                data: {
                    "subdata/sub2": "val2",
                    "dir/data1": 1.3,
                    "dir/data2": 8.1,
                    "data2": "value",
                },
            };

            const result = await session.post("/status").send(data);

            expect(result.status).toEqual(401);
            expect(result.unauthorized).toBeTruthy();
            expect(result.body).toEqual({ message: "Unauthorized" });
        });
    });

    describe("Access endpoint with an unauthenticated token", () => {
        const authorization = { authorization: "unauthenticated token" };

        test("GET /status with an unauthenticated token", async () => {
            // without a specified container
            const result1 = await session.get("/status").set(authorization);

            expect(result1.status).toEqual(401);
            expect(result1.unauthorized).toBeTruthy();
            expect(result1.body).toEqual({ message: "Unauthorized" });

            // with a specified container
            const result2 = await session
                .get("/status?container=container1")
                .set(authorization);

            expect(result2.status).toEqual(401);
            expect(result2.unauthorized).toBeTruthy();
            expect(result2.body).toEqual({ message: "Unauthorized" });

            // with a specified container and values
            const result3 = await session
                .get("/status?container=container1&values=[data,subdata/sub1]")
                .set(authorization);

            expect(result3.status).toEqual(401);
            expect(result3.unauthorized).toBeTruthy();
            expect(result3.body).toEqual({ message: "Unauthorized" });
        });

        test("POST /status with an unauthenticated token", async () => {
            const data = {
                type: "info",
                container: "container1",
                data: {
                    "subdata/sub2": "val2",
                    "dir/data1": 1.3,
                    "dir/data2": 8.1,
                    "data2": "value",
                },
            };

            const result = await session
                .post("/status")
                .send(data)
                .set(authorization);

            expect(result.status).toEqual(401);
            expect(result.unauthorized).toBeTruthy();
            expect(result.body).toEqual({ message: "Unauthorized" });
        });
    });

    describe("Access endpoint using wrong data", () => {
        test("GET /status with unexisting container", async () => {
            const result1 = await session
                .get("/status?container=unexisting")
                .set(authorizationMS);

            expect(result1.status).toEqual(404);
            expect(result1.notFound).toBeTruthy();
            expect(result1.body).toEqual({ message: "Not Found" });
        });
    });
});
