/*
  Warnings:

  - You are about to drop the column `address` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `Customer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('INDIVIDUAL', 'BUSINESS', 'GOVERNMENT', 'NON_PROFIT');

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "address",
DROP COLUMN "createdBy",
DROP COLUMN "deletedAt",
DROP COLUMN "updatedBy",
ADD COLUMN     "type" "CustomerType" NOT NULL DEFAULT 'INDIVIDUAL';

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
