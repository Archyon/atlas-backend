import { PrismaClient } from "@prisma/client";
import { initialiseMarket } from "./market";
import { initialiseDatarow } from "./datarow";
import { initialiseWarning } from "./warning";

const prisma = new PrismaClient();

async function main() {
    console.log("Emptying database...");
    await emptyDatabase();
    console.log("Initialising database...");
    await initialiseDatabase();
}

async function emptyDatabase() {
    await prisma.dataRow.deleteMany();
    await prisma.market.deleteMany();
    await prisma.warning.deleteMany();
}

async function initialiseDatabase() {
    await initialiseMarket();
    await initialiseDatarow();
    await initialiseWarning();
}

// Actually call main
main().then(() => console.log("Mock data generation finished."));
