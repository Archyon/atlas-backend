import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function initialiseMarket() {
    const markets = [
        { name: "ATOMUSDT" },
        { name: "BTCUSDT" },
        { name: "ENJUSDT" },
    ];

    for (const market of markets) {
        await prisma.market.create({
            data: market,
        });
    }
}
