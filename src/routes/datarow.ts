import express from "express";
import { PrismaClient } from "@prisma/client";
import { CustomRequest, Routing } from "./routing";

const prisma = new PrismaClient();

export class DataRowRouting extends Routing {
    async getOne(req: CustomRequest, res: express.Response) {
        const id = req.params["id"];

        const result = await prisma.dataRow.findUniqueOrThrow({
            where: {
                id: id,
            },
        });

        return res.status(200).json(result);
    }

    async getAll(req: CustomRequest, res: express.Response) {
        const result = await prisma.dataRow.findMany();

        return res.status(200).json(result);
    }

    async redirect(req: CustomRequest, res: express.Response) {
        const result = {
            method: "redirect",
        };
        return res.status(300).json(result);
    }
}
