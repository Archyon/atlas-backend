import express from "express";
import { PrismaClient } from "@prisma/client";
import { CustomRequest, Routing } from "./routing";

const prisma = new PrismaClient();

export class MarketRouting extends Routing {
    async getAll(req: CustomRequest, res: express.Response) {
        const result = await prisma.market.findMany();

        return res.status(200).json(result);
    }

    async getOne(req: CustomRequest, res: express.Response) {
        const name = req.params["id"];

        const result = await prisma.market.findUniqueOrThrow({
            where: {
                name: name,
            },
        });
        console.log(result);

        return res.status(200).json(result);
    }

    create = async (req: CustomRequest, res: express.Response) => {
        const name = req.body["name"];

        // send the new added data to the websocket listeners
        for (const ws of this.marketWebSockets) {
            ws.sendData({ name: name });
        }

        const result = await prisma.market.create({
            data: {
                name: name,
            },
        });

        return res.status(201).json(result);
    };

    async redirect(req: CustomRequest, res: express.Response) {
        const result = {
            method: "redirect",
        };

        return res.status(300).json(result);
    }
}
