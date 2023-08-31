import express from "express";
import { MarketWs } from "../websockets/marketWs";
import { DatarowWs } from "../websockets/datarowWs";

export type CustomRequest = express.Request<any, any, any, any, any>;

/**
 * The Routing class provides some skeleton code for a basic endpoint.
 *
 * HTTP GET     "/"     => getAll
 * HTTP GET     "/:id"  => getOne
 * HTTP POST    "/"     => createOne
 * HTTP NOTIFY  "/"     => redirect
 *
 * All functions take in an express.Request object and can manipulate an
 * express.Response object. The functions can be asynchronous.
 */
export abstract class Routing {
    protected marketWebSockets: MarketWs[] = [];
    protected datarowWebSockets: DatarowWs[] = [];

    setMarketWs(marketWs: MarketWs) {
        this.marketWebSockets.push(marketWs);
    }

    setDatarowWs(datarowWs: DatarowWs) {
        this.datarowWebSockets.push(datarowWs);
    }

    getAll(req: CustomRequest, res: express.Response) {
        throw new Error("Not implemented");
    }

    getOne(req: CustomRequest, res: express.Response) {
        throw new Error("Not implemented");
    }

    createOne(req: CustomRequest, res: express.Response) {
        throw new Error("Not implemented");
    }

    redirect(req: CustomRequest, res: express.Response) {
        throw new Error("Not implemented");
    }

    // Construct a new router which contains all the mentioned functions.
    toRouter(): express.Router {
        const router = express.Router();
        router.get("/", this.getAll);
        router.get("/:id", this.getOne);
        router.post("/", this.createOne);
        router.notify("/", this.redirect);
        return router;
    }
}
