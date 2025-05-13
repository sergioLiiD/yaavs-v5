/*
  Warnings:

  - You are about to drop the column `checklist` on the `reparacion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "reparacion" DROP COLUMN "checklist";

-- CreateTable
CREATE TABLE "checklist_diagnostico" (
    "id" SERIAL NOT NULL,
    "reparacionId" INTEGER NOT NULL,
    "item" TEXT NOT NULL,
    "respuesta" BOOLEAN NOT NULL,
    "observacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_diagnostico_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "checklist_diagnostico" ADD CONSTRAINT "checklist_diagnostico_reparacionId_fkey" FOREIGN KEY ("reparacionId") REFERENCES "reparacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
