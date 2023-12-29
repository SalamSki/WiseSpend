/*
  Warnings:

  - A unique constraint covering the columns `[name,ownerId]` on the table `Budget` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Budget_name_ownerId_key" ON "Budget"("name", "ownerId");
