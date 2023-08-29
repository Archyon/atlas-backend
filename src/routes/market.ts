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

    async createOne(req: CustomRequest, res: express.Response) {
        const name = req.body["name"];
        console.log("name: " + name);

        await prisma.market.create({
            data: {
                name: name,
            },
        });

        return res.status(201);
    }

    async redirect(req: CustomRequest, res: express.Response) {
        const result = {
            method: "redirect",
        };

        return res.status(300).json(result);
    }
}
