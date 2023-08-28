-- CreateTable
CREATE TABLE "Market" (
    "id" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "DataRow" (
    "id" INTEGER NOT NULL,
    "var1" TEXT NOT NULL,
    "var2" TEXT NOT NULL,
    "var3" TEXT NOT NULL,
    "market_id" INTEGER NOT NULL,
    CONSTRAINT "DataRow_market_id_fkey" FOREIGN KEY ("market_id") REFERENCES "Market" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Market_id_key" ON "Market"("id");

-- CreateIndex
CREATE UNIQUE INDEX "DataRow_id_key" ON "DataRow"("id");
