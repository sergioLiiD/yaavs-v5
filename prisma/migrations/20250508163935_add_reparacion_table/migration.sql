/*
  Warnings:

  - You are about to drop the `reparacion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PiezaReparacion" DROP CONSTRAINT "PiezaReparacion_reparacionId_fkey";

-- DropForeignKey
ALTER TABLE "checklist_diagnostico" DROP CONSTRAINT "checklist_diagnostico_reparacionId_fkey";

-- DropForeignKey
ALTER TABLE "reparacion" DROP CONSTRAINT "reparacion_tecnicoId_fkey";

-- DropForeignKey
ALTER TABLE "reparacion" DROP CONSTRAINT "reparacion_ticketId_fkey";

-- DropTable
DROP TABLE "reparacion";

-- CreateTable
CREATE TABLE "Reparacion" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "tecnicoId" INTEGER NOT NULL,
    "diagnostico" TEXT,
    "observaciones" TEXT,
    "fechaInicio" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fechaDiagnostico" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),
    "fechaPresupuesto" TIMESTAMP(3),
    "piezasNecesarias" TEXT,
    "presupuesto" DOUBLE PRECISION,
    "saludBateria" INTEGER,
    "versionSO" TEXT,

    CONSTRAINT "Reparacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reparacion_ticketId_key" ON "Reparacion"("ticketId");

-- AddForeignKey
ALTER TABLE "Reparacion" ADD CONSTRAINT "Reparacion_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reparacion" ADD CONSTRAINT "Reparacion_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_diagnostico" ADD CONSTRAINT "checklist_diagnostico_reparacionId_fkey" FOREIGN KEY ("reparacionId") REFERENCES "Reparacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PiezaReparacion" ADD CONSTRAINT "PiezaReparacion_reparacionId_fkey" FOREIGN KEY ("reparacionId") REFERENCES "Reparacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
