import "express";
import { CustomRequest, Routing } from "./routing";
import express from "express";
import { APIError } from "../errors/api_error";
import { APIErrorCode } from "../errors/api_error_codes";
import { changeValues, parse, retrievePaths, StateView } from "../parser";
import { WarningRouting } from "./warning";
import e from "express";

export class StatusRouting extends Routing {
    private states: StateView = {};
    private warningRouting: WarningRouting;

    constructor(warningRouting: WarningRouting) {
        super();
        this.warningRouting = warningRouting;
    }

    getAll = (req: CustomRequest, res: express.Response) => {
        const container: string = req.query["container"];

        if (container === undefined) {
            return res.status(200).json(this.states);
        } else if (container in this.states) {
            if ("values" in req.query) {
                // Only show the requested values
                let values = req.query["values"];
                values = values.substring(1, values.length - 1).split(",");
                const states = retrievePaths(this.states[container], values);
                return res.status(200).json(states);
            }
            return res.status(200).json(this.states[container]);
        } else {
            throw new APIError(APIErrorCode.NOT_FOUND);
        }
    };

    create = async (req: CustomRequest, res: express.Response) => {
        const type = req.body["type"];
        const container = req.body["container"];

        if (container in this.states) {
            // The container already exists in the tracked states
            const existing = this.states[container];

            // check if new data is different from existing data
            const result = changeValues(existing, req.body["data"]);
            this.states[container] = result.states;

            // send changed data through socket
            if (Object.keys(result.changed).length > 0) {
                const changed = parse(result.changed, container);
                console.log("changed: " + JSON.stringify(changed));
                for (const statusWs of this.statusWebSockets) {
                    statusWs.sendData(changed);
                }
            }

            // If type is warning, send warning message through socket
            if (type === "warning") {
                await this.handleWarning(req, res);
            }

            return res.status(201).json({});
        } else {
            // The container does not exist yet in the states so it needs to be added, along with its new values
            const data = req.body["data"];

            // Parse data and put in dict states
            let parsed = parse(data, container);
            this.states = Object.assign({}, this.states, parsed);

            // Send the new data through the socket
            for (const statusWs of this.statusWebSockets) {
                statusWs.sendData(parsed);
            }

            // If type is warning, send warning message through socket
            if (type === "warning") {
                await this.handleWarning(req, res);
            }

            return res.status(201).json({});
        }
    };

    async handleWarning(req: CustomRequest, res: express.Response) {
        // redirect the warning to the warning endpoint
        const warning = {
            origin: req.body["origin"],
            message: req.body["message"],
            ref: req.body["ref"],
        };
        await this.warningRouting.createWarning(warning);
    }

    deleteAll = (req: CustomRequest, res: express.Response) => {
        this.states = {};
        return res.status(200).json(this.states);
    };

    toRouter(): e.Router {
        const router = super.toRouter();
        router.delete("/", this.deleteAll);
        return router;
    }
}
