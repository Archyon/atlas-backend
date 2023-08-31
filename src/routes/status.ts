import "express";
import { CustomRequest, Routing } from "./routing";
import express from "express";
import { APIError } from "../errors/api_error";
import { APIErrorCode } from "../errors/api_error_codes";
import { parse, StateView } from "../parser";

export class StatusRouting extends Routing {
    private states: StateView = {};

    getAll = (req: CustomRequest, res: express.Response) => {
        const container: string = req.query["container"];

        if (container in this.states) {
            return res.status(200).json(this.states[container]);
        } else {
            throw new APIError(APIErrorCode.NOT_FOUND);
        }
    };

    create = async (req: CustomRequest, res: express.Response) => {
        const type = req.body["type"];
        const container = req.body["container"];

        console.log("states: " + JSON.stringify(this.states));

        if (container in this.states) {
            const existing = this.states[container];

            // TODO check if new data is different from existing data

            // TODO send changed data through socket

            // TODO if type == warning, send warning message through socket
        } else {
            const data = req.body;
            delete data.type;
            delete data.container;

            console.log("data: " + JSON.stringify(data));

            // TODO parse data and put in dict states
            let result = parse(data, container);
            console.log("result: " + JSON.stringify(result));

            if (type != "info") {
                // TODO send data through socket
            }
            // return res.status(201);
        }
        throw new APIError(APIErrorCode.NOT_IMPLEMENTED);
    };
}
