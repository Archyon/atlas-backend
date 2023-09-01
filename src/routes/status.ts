import "express";
import { CustomRequest, Routing } from "./routing";
import express from "express";
import { APIError } from "../errors/api_error";
import { APIErrorCode } from "../errors/api_error_codes";
import { changeValues, parse, StateView } from "../parser";

export class StatusRouting extends Routing {
    private states: StateView = {};

    getAll = (req: CustomRequest, res: express.Response) => {
        const container: string = req.query["container"];

        if (container === undefined) {
            return res.status(200).json(this.states);
        } else if (container in this.states) {
            // TODO only show the requested values
            return res.status(200).json(this.states[container]);
        } else {
            throw new APIError(APIErrorCode.NOT_FOUND);
        }
    };

    create = async (req: CustomRequest, res: express.Response) => {
        const type = req.body["type"];
        const container = req.body["container"];

        // console.log("states: " + JSON.stringify(this.states));

        if (container in this.states) {
            const existing = this.states[container];

            // TODO check if new data is different from existing data
            const result = changeValues(existing, req.body["data"]);
            const changed = result.changed;
            this.states[container] = result.states;

            // TODO send changed data through socket

            // TODO if type == warning, send warning message through socket

            return res.status(201).json(this.states);
        } else {
            const data = req.body["data"];

            // parse data and put in dict states
            let parsed = parse(data, container);
            this.states = Object.assign({}, this.states, parsed);

            // Send the new data through the socket
            for (const websocket of this.statusWebSockets) {
                websocket.sendData(parsed);
            }

            if (type === "warning") {
                const warning = {
                    origin: req.body["origin"],
                    message: req.body["message"],
                    ref: req.body["ref"],
                };
                // TODO send origin, message and ref to warning endpoint
            }
            return res.status(201).json(parsed);
        }
        throw new APIError(APIErrorCode.NOT_IMPLEMENTED);
    };
}
