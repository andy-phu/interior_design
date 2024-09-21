/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Couch` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Couch_name_key" ON "Couch"("name");
