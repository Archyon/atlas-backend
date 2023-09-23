import express from "express";
import { APIError } from "../errors/api_error";
import { APIErrorCode } from "../errors/api_error_codes";

export type CustomRequest = express.Request<any, any, any, any, any>;

export class CommandRouting {
    redirect(req: CustomRequest, res: express.Response) {
        const platform = req.query["platform"];
        const exec = req.query["exec"];

        if (platform === undefined || exec === undefined) {
            throw new APIError(APIErrorCode.BAD_REQUEST);
        }

        if (platform === "prometheus") {
            // TODO send the execution command (exec) to the engine
        }

        return res.status(200).json({});
    }

    toRouter(): express.Router {
        const router = express.Router();
        router.notify("/", this.redirect);
        return router;
    }
}
