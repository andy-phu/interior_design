/*
  Warnings:

  - You are about to drop the column `productLink` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `productType` on the `Product` table. All the data in the column will be lost.
  - Added the required column `product_link` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_type` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `style` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "productLink",
DROP COLUMN "productType",
ADD COLUMN     "product_link" TEXT NOT NULL,
ADD COLUMN     "product_type" TEXT NOT NULL,
ADD COLUMN     "style" TEXT NOT NULL;
