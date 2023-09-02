import express from "express";
import { MarketWs } from "../websockets/marketWs";
import { DatarowWs } from "../websockets/datarowWs";
import { StatusWs } from "../websockets/status";
import { WarningWs } from "../websockets/warning";
import { APIError } from "../errors/api_error";
import { APIErrorCode } from "../errors/api_error_codes";

// authentication of the microservice (Prometheus-engine)
const jwt = require("jsonwebtoken");

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
    protected statusWebSockets: StatusWs[] = [];
    protected warningWebSockets: WarningWs[] = [];

    // add a new market websocket to the list
    setMarketWs(marketWs: MarketWs) {
        this.marketWebSockets.push(marketWs);
    }

    // add a new datarow websocket to the list
    setDatarowWs(datarowWs: DatarowWs) {
        this.datarowWebSockets.push(datarowWs);
    }

    // add a new status websocket to the list
    setStatusWs(statusWs: StatusWs) {
        this.statusWebSockets.push(statusWs);
    }

    // add a new warning websocket to the list
    setWarningWs(warningWs: WarningWs) {
        this.warningWebSockets.push(warningWs);
    }

    // Check api key for authentication of the microservice
    authenticate(
        req: CustomRequest,
        res: express.Response,
        next: express.NextFunction,
    ) {
        const token = req.headers["authorization"];

        if (token == null) {
            throw new APIError(APIErrorCode.FORBIDDEN);
        }

        jwt.verify(
            token,
            process.env.TOKEN_SECRET as string,
            (err: any, user: any) => {
                console.log("err: " + err);
                if (err) {
                    // TODO check for user authentication
                    throw new APIError(APIErrorCode.FORBIDDEN);
                }
                console.log("user: " + user);
                next();
            },
        );
    }

    getAll(req: CustomRequest, res: express.Response) {
        throw new APIError(APIErrorCode.NOT_IMPLEMENTED);
    }

    getOne(req: CustomRequest, res: express.Response) {
        throw new APIError(APIErrorCode.NOT_IMPLEMENTED);
    }

    create(req: CustomRequest, res: express.Response) {
        throw new APIError(APIErrorCode.NOT_IMPLEMENTED);
    }

    redirect(req: CustomRequest, res: express.Response) {
        throw new APIError(APIErrorCode.NOT_IMPLEMENTED);
    }

    // Construct a new router which contains all the mentioned functions.
    toRouter(): express.Router {
        const router = express.Router();
        router.get("/", this.authenticate, this.getAll);
        router.get("/:id", this.authenticate, this.getOne);
        router.post("/", this.authenticate, this.create);
        router.notify("/", this.authenticate, this.redirect);
        return router;
    }
}
