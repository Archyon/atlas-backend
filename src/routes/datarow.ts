import express from "express";
import { PrismaClient } from "@prisma/client";
import { CustomRequest, Routing } from "./routing";

const prisma = new PrismaClient();

export class DataRowRouting extends Routing {
    async getAll(req: CustomRequest, res: express.Response) {
        const result = await prisma.dataRow.findMany();

        return res.status(200).json(result);
    }

    async getOne(req: CustomRequest, res: express.Response) {
        const time = req.params["id"];

        const result = await prisma.dataRow.findUniqueOrThrow({
            where: {
                time: time,
            },
        });

        return res.status(200).json(result);
    }

    async createOne(req: CustomRequest, res: express.Response) {
        const datarow = {
            time: Number(req.body["time"]),
            open: Number(req.body["open"]),
            high: Number(req.body["high"]),
            low: Number(req.body["low"]),
            close: Number(req.body["close"]),
            market_name: req.body["market"],
        };

        const result = await prisma.dataRow.create({
            data: datarow,
        });

        return res.status(201).json(result);
    }

    async redirect(req: CustomRequest, res: express.Response) {
        const result = {
            method: "redirect",
        };
        return res.status(300).json(result);
    }
}
