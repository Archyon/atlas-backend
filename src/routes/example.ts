import {CustomRequest, Routing} from "./routing";
import express from "express";

export class Example extends Routing {
    getOne(req: CustomRequest, res: express.Response) {
        const result = {
            method: "getOne",
        };

        return res.status(200).json(result);
    }

    getAll(req: CustomRequest, res: express.Response) {
        console.log("test")
        const result = {
                    method: "getAll",
        };

        return res.status(200).json(result);
    }

    redirect(req: CustomRequest, res: express.Response) {
        const result = {
            method: "redirect",
        };

        return res.status(200).json(result);
    }
}
