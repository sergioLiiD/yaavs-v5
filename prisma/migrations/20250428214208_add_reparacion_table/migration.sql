/*
  Warnings:

  - You are about to drop the `Reparacion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PiezaReparacion" DROP CONSTRAINT "PiezaReparacion_reparacionId_fkey";

-- DropForeignKey
ALTER TABLE "Reparacion" DROP CONSTRAINT "Reparacion_tecnicoId_fkey";

-- DropForeignKey
ALTER TABLE "Reparacion" DROP CONSTRAINT "Reparacion_ticketId_fkey";

-- DropTable
DROP TABLE "Reparacion";

-- CreateTable
CREATE TABLE "reparacion" (
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
    "checklist" TEXT,
    "saludBateria" INTEGER,
    "versionSO" TEXT,

    CONSTRAINT "reparacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reparacion_ticketId_key" ON "reparacion"("ticketId");

-- AddForeignKey
ALTER TABLE "reparacion" ADD CONSTRAINT "reparacion_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reparacion" ADD CONSTRAINT "reparacion_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PiezaReparacion" ADD CONSTRAINT "PiezaReparacion_reparacionId_fkey" FOREIGN KEY ("reparacionId") REFERENCES "reparacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
