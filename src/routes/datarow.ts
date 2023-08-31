import express from "express";
import { PrismaClient } from "@prisma/client";
import { CustomRequest, Routing } from "./routing";

const prisma = new PrismaClient();

export class DataRowRouting extends Routing {
    async getAll(req: CustomRequest, res: express.Response) {
        const result = await prisma.dataRow.findMany({
            where: {
                time: {
                    lte: req.query["before"],
                    gte: req.query["after"],
                },
                market_name: req.query["market"],
            },
        });

        return res.status(200).json(result);
    }

    async getOne(req: CustomRequest, res: express.Response) {
        const time = req.params["id"];

        const result = await prisma.dataRow.findUniqueOrThrow({
            where: {
                // @ts-ignore
                time_market_name: {
                    time: new Date(time),
                    market_name: req.body["market"],
                },
            },
        });

        return res.status(200).json(result);
    }

    createOne = async (req: CustomRequest, res: express.Response) => {
        // send the new added data to the websocket listeners
        this.datarowWs?.sendData(req.body);

        for (let datarow of req.body) {
            // convert UNIX timestamp to Date
            let time = new Date();
            const unixtime = time.valueOf();
            time = new Date(unixtime);

            const data = {
                time: time,
                open: datarow.open,
                high: datarow.high,
                low: datarow.low,
                close: datarow.close,
                market_name: datarow.market,
            };
            const result = await prisma.dataRow.create({
                data: data,
            });
        }

        return res.status(201).json({});
    };

    async redirect(req: CustomRequest, res: express.Response) {
        const result = {
            method: "redirect",
        };
        return res.status(300).json(result);
    }
}
