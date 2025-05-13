/*
  Warnings:

  - You are about to drop the column `checklistCompletado` on the `Reparacion` table. All the data in the column will be lost.
  - You are about to drop the column `checklistPostReparacion` on the `Reparacion` table. All the data in the column will be lost.
  - You are about to drop the column `checklistRecepcion` on the `Reparacion` table. All the data in the column will be lost.
  - You are about to drop the column `fechaFinalizacion` on the `Reparacion` table. All the data in the column will be lost.
  - You are about to drop the column `fotosEvidencia` on the `Reparacion` table. All the data in the column will be lost.
  - You are about to drop the column `garantiaDias` on the `Reparacion` table. All the data in the column will be lost.
  - You are about to drop the column `solucion` on the `Reparacion` table. All the data in the column will be lost.
  - You are about to drop the column `videosEvidencia` on the `Reparacion` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Reparacion" DROP CONSTRAINT "Reparacion_ticketId_fkey";

-- DropIndex
DROP INDEX "PiezaReparacion_reparacionId_piezaId_key";

-- AlterTable
ALTER TABLE "Reparacion" DROP COLUMN "checklistCompletado",
DROP COLUMN "checklistPostReparacion",
DROP COLUMN "checklistRecepcion",
DROP COLUMN "fechaFinalizacion",
DROP COLUMN "fotosEvidencia",
DROP COLUMN "garantiaDias",
DROP COLUMN "solucion",
DROP COLUMN "videosEvidencia",
ADD COLUMN     "fechaDiagnostico" TIMESTAMP(3),
ADD COLUMN     "fechaFin" TIMESTAMP(3),
ADD COLUMN     "fechaPresupuesto" TIMESTAMP(3),
ADD COLUMN     "piezasNecesarias" TEXT,
ADD COLUMN     "presupuesto" DOUBLE PRECISION,
ALTER COLUMN "diagnostico" DROP NOT NULL,
ALTER COLUMN "fechaInicio" DROP NOT NULL,
ALTER COLUMN "fechaInicio" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Reparacion" ADD CONSTRAINT "Reparacion_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
