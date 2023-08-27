import {CustomRequest, Routing} from "./routing";
import express from "express";

export class Example extends Routing {
    getOne(req: CustomRequest, res: express.Response) {
        super.getOne(req, res);
    }

    getAll(req: CustomRequest, res: express.Response) {
        super.getAll(req, res);
    }

    redirect(req: CustomRequest, res: express.Response) {
        super.redirect(req, res);
    }
}
