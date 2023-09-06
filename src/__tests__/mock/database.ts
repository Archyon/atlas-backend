import { initialiseMarket } from "./market";
import { initialiseDatarow } from "./datarow";
import { initialiseWarning } from "./warning";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function emptyDatabase() {
    await prisma.dataRow.deleteMany();
    await prisma.market.deleteMany();
    await prisma.warning.deleteMany();
}

export async function initialiseDatabase() {
    await initialiseMarket();
    await initialiseDatarow();
    await initialiseWarning();
}
