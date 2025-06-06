/*
  Warnings:

  - A unique constraint covering the columns `[imei]` on the table `tickets` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "imei" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tickets_imei_key" ON "tickets"("imei");
