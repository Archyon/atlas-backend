import {CustomRequest, Routing} from "./routing";
import e from "express";

export class Example extends Routing {
    getOne(req: CustomRequest, res: e.Response) {
        super.getOne(req, res);
    }

    getAll(req: CustomRequest, res: e.Response) {
        super.getAll(req, res);
    }

    redirect(req: CustomRequest, res: e.Response) {
        super.redirect(req, res);
    }
}