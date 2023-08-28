import express from "express";

export type CustomRequest = express.Request<any, any, any>;

/**
 * The Routing class provides some skeleton code for a basic endpoint.
 *
 * HTTP GET    "/"    => getAll
 * HTTP GET    "/:id" => getOne
 * HTTP POST   "/"    => createOne
 *
 * All functions take in an express.Request object and can manipulate an
 * express.Response object. The functions can be asynchronous.
 */
export abstract class Routing {
    getAll(req: CustomRequest, res: express.Response) {
        throw new Error("Not implemented");
    }

    getOne(req: CustomRequest, res: express.Response) {
        throw new Error("Not implemented");
    }

    redirect(req: CustomRequest, res: express.Response) {
        throw new Error("Not implemented");
    }

    // Construct a new router which contains all the mentioned functions.
    toRouter(): express.Router {
        const router = express.Router();
        router.notify("/", this.redirect);
        router.get("/", this.getAll);
        router.get("/:id", this.getOne);
        return router;
    }
}
