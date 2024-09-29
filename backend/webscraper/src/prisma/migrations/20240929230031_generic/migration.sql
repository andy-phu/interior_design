/*
  Warnings:

  - You are about to drop the `Couch` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Couch";

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "productLink" TEXT NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");
