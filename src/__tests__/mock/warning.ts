import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function initialiseWarning() {
    const warning1 = {
        time: new Date(Date.UTC(2023, 0, 1, 12, 0, 0)),
        origin: "engine/market/ATOMUSDT",
        message: "Warning 1",
        ref: JSON.stringify({ "socket1/delay": "" }),
    };

    const warning2 = {
        time: new Date(Date.UTC(2023, 1, 1, 12, 0, 0)),
        origin: "engine/market/ATOMUSDT",
        message: "Warning 2",
        ref: JSON.stringify({ "socket2/delay": "" }),
    };

    const warning3 = {
        time: new Date(Date.UTC(2023, 2, 1, 12, 0, 0)),
        origin: "engine/market/BTCUSDT",
        message: "Warning 3",
        ref: JSON.stringify({ "socket1/delay": "" }),
    };

    const warning4 = {
        time: new Date(Date.UTC(2023, 3, 1, 12, 0, 0)),
        origin: "engine/market/BTCUSDT",
        message: "Warning 4",
        ref: JSON.stringify({ "socket2/delay": "" }),
    };

    const warnings = [warning1, warning2, warning3, warning4];

    for (const warning of warnings) {
        await prisma.warning.create({
            data: warning,
        });
    }
}
