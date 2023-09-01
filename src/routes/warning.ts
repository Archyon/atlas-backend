import express from "express";
import { PrismaClient } from "@prisma/client";
import { CustomRequest, Routing } from "./routing";

const prisma = new PrismaClient();

export class WarningRouting extends Routing {
    async getAll(req: CustomRequest, res: express.Response) {
        const result = await prisma.warning.findMany();

        return res.status(200).json(result);
    }

    async getOne(req: CustomRequest, res: express.Response) {
        const result = await prisma.warning.findUniqueOrThrow({
            where: {
                id: Number(req.params["id"]),
            },
        });

        return res.status(200).json(result);
    }

    create = async (req: CustomRequest, res: express.Response) => {
        const data = {
            origin: req.body["origin"],
            message: req.body["message"],
            ref: JSON.stringify(req.body["ref"]),
        };
        const result = await prisma.warning.create({
            data: data,
        });

        for (const warningWs of this.warningWebSockets) {
            warningWs.sendData(result);
        }

        return res.status(201).json(result);
    };
}
