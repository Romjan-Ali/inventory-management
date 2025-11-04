/*
  Warnings:

  - You are about to drop the column `sequenceCounter` on the `inventories` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "inventories" DROP COLUMN "sequenceCounter";

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "sequenceNumber" INTEGER;
