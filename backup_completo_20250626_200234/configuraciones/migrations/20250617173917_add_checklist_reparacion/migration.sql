/*
  Warnings:

  - You are about to drop the column `isRepairPoint` on the `puntos_recoleccion` table. All the data in the column will be lost.
  - You are about to drop the `ChecklistRespuestaDiagnostico` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `checklist_respuestas_reparacion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChecklistRespuestaDiagnostico" DROP CONSTRAINT "ChecklistRespuestaDiagnostico_checklistDiagnosticoId_fkey";

-- DropForeignKey
ALTER TABLE "ChecklistRespuestaDiagnostico" DROP CONSTRAINT "ChecklistRespuestaDiagnostico_checklistItemId_fkey";

-- DropForeignKey
ALTER TABLE "checklist_respuestas_reparacion" DROP CONSTRAINT "checklist_respuestas_reparacion_checklist_item_id_fkey";

-- DropForeignKey
ALTER TABLE "checklist_respuestas_reparacion" DROP CONSTRAINT "checklist_respuestas_reparacion_reparacion_id_fkey";

-- AlterTable
ALTER TABLE "puntos_recoleccion" DROP COLUMN "isRepairPoint",
ADD COLUMN     "is_repair_point" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "reparaciones" ALTER COLUMN "fecha_inicio" DROP NOT NULL;

-- DropTable
DROP TABLE "ChecklistRespuestaDiagnostico";

-- DropTable
DROP TABLE "checklist_respuestas_reparacion";

-- CreateTable
CREATE TABLE "checklist_reparacion" (
    "id" SERIAL NOT NULL,
    "reparacion_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_reparacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_respuesta_diagnostico" (
    "id" SERIAL NOT NULL,
    "checklist_diagnostico_id" INTEGER NOT NULL,
    "checklist_item_id" INTEGER NOT NULL,
    "respuesta" BOOLEAN NOT NULL,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_respuesta_diagnostico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_respuesta_reparacion" (
    "id" SERIAL NOT NULL,
    "checklist_reparacion_id" INTEGER NOT NULL,
    "checklist_item_id" INTEGER NOT NULL,
    "respuesta" BOOLEAN NOT NULL,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_respuesta_reparacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "checklist_reparacion_reparacion_id_key" ON "checklist_reparacion"("reparacion_id");

-- AddForeignKey
ALTER TABLE "checklist_reparacion" ADD CONSTRAINT "checklist_reparacion_reparacion_id_fkey" FOREIGN KEY ("reparacion_id") REFERENCES "reparaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_respuesta_diagnostico" ADD CONSTRAINT "checklist_respuesta_diagnostico_checklist_diagnostico_id_fkey" FOREIGN KEY ("checklist_diagnostico_id") REFERENCES "checklist_diagnostico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_respuesta_diagnostico" ADD CONSTRAINT "checklist_respuesta_diagnostico_checklist_item_id_fkey" FOREIGN KEY ("checklist_item_id") REFERENCES "checklist_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_respuesta_reparacion" ADD CONSTRAINT "checklist_respuesta_reparacion_checklist_reparacion_id_fkey" FOREIGN KEY ("checklist_reparacion_id") REFERENCES "checklist_reparacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_respuesta_reparacion" ADD CONSTRAINT "checklist_respuesta_reparacion_checklist_item_id_fkey" FOREIGN KEY ("checklist_item_id") REFERENCES "checklist_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
