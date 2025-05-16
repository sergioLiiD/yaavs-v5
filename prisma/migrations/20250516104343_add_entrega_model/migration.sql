/*
  Warnings:

  - You are about to drop the column `ticketId` on the `direcciones` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[direccionId]` on the table `tickets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TipoEntrega" AS ENUM ('OFICINA', 'DOMICILIO');

-- DropForeignKey
ALTER TABLE "direcciones" DROP CONSTRAINT "direcciones_ticketId_fkey";

-- DropIndex
DROP INDEX "direcciones_ticketId_key";

-- AlterTable
ALTER TABLE "direcciones" DROP COLUMN "ticketId",
ALTER COLUMN "latitud" DROP NOT NULL,
ALTER COLUMN "longitud" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "direccionId" INTEGER;

-- CreateTable
CREATE TABLE "entregas" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "tipoEntrega" "TipoEntrega" NOT NULL,
    "fechaEntrega" TIMESTAMP(3),
    "entregado" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "direccionEntregaId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entregas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "entregas_ticketId_key" ON "entregas"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "entregas_direccionEntregaId_key" ON "entregas"("direccionEntregaId");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_direccionId_key" ON "tickets"("direccionId");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_direccionId_fkey" FOREIGN KEY ("direccionId") REFERENCES "direcciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_direccionEntregaId_fkey" FOREIGN KEY ("direccionEntregaId") REFERENCES "direcciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;
