import express from "express";
import { PrismaClient } from "@prisma/client";
import { CustomRequest, Routing } from "./routing";
import { parse, StateView } from "../parser";

const prisma = new PrismaClient();

export class WarningRouting extends Routing {
    async getAll(req: CustomRequest, res: express.Response) {
        const result = await prisma.warning.findMany({
            where: {
                time: {
                    lte: req.query["before"],
                    gte: req.query["after"],
                },
                message: {
                    contains: req.query["message"],
                },
                origin: {
                    contains: req.query["origin"],
                },
            },
        });

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
        const ref = parse(req.body["ref"], "temp")["temp"];
        const data = {
            time: new Date(),
            origin: req.body["origin"],
            message: req.body["message"],
            ref: JSON.stringify(ref),
        };

        const result = await prisma.warning.create({
            data: data,
        });

        for (const warningWs of this.warningWebSockets) {
            warningWs.sendData(result);
        }

        return res.status(201).json(result);
    };

    createWarning = async (warning: StateView) => {
        const ref = parse(warning.ref, "temp")["temp"];
        const data = {
            time: new Date(),
            origin: warning.origin,
            message: warning.message,
            ref: JSON.stringify(ref),
        };

        const result = await prisma.warning.create({
            data: data,
        });

        for (const warningWs of this.warningWebSockets) {
            warningWs.sendData(result);
        }
    };
}
