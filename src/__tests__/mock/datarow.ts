import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function initialiseDatarow() {
    const datarow1 = {
        time: new Date(Date.UTC(2023, 0, 1, 12, 0, 0)),
        market_name: "ATOMUSDT",
        open: 0.274,
        high: 0.284,
        low: 0.268,
        close: 0.268,
    };

    const datarow2 = {
        time: new Date(Date.UTC(2023, 1, 1, 12, 0, 0)),
        market_name: "BTCUSDT",
        open: 4294757.286,
        high: 4294757.286,
        low: 4294757.286,
        close: 4294757.286,
    };

    const datarow3 = {
        time: new Date(Date.UTC(2023, 2, 1, 12, 0, 0)),
        market_name: "ATOMUSDT",
        open: 0.258,
        high: 0.265,
        low: 0.258,
        close: 0.262,
    };

    const datarow4 = {
        time: new Date(Date.UTC(2023, 3, 1, 12, 0, 0)),
        market_name: "BTCUSDT",
        open: 4294803.736,
        high: 4294803.736,
        low: 4294803.736,
        close: 4294803.736,
    };

    const datarows = [datarow1, datarow2, datarow3, datarow4];

    for (const datarow of datarows) {
        await prisma.dataRow.create({
            data: datarow,
        });
    }
}
