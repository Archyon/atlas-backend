import { emptyDatabase, initialiseDatabase } from "./database";

async function main() {
    console.log("Emptying database...");
    await emptyDatabase();
    console.log("Initialising database...");
    await initialiseDatabase();
}

// Actually call main
main().then(() => console.log("Mock data generation finished."));
