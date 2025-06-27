/*
  Warnings:

  - You are about to drop the column `checklist_diagnostico_id` on the `checklist_items` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "checklist_items" DROP CONSTRAINT "checklist_items_checklist_diagnostico_id_fkey";

-- AlterTable
ALTER TABLE "checklist_items" DROP COLUMN "checklist_diagnostico_id";

-- CreateTable
CREATE TABLE "checklist_respuestas_diagnostico" (
    "id" SERIAL NOT NULL,
    "checklist_diagnostico_id" INTEGER NOT NULL,
    "checklist_item_id" INTEGER NOT NULL,
    "respuesta" TEXT NOT NULL,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_respuestas_diagnostico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_respuestas_reparacion" (
    "id" SERIAL NOT NULL,
    "reparacion_id" INTEGER NOT NULL,
    "checklist_item_id" INTEGER NOT NULL,
    "respuesta" TEXT NOT NULL,
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_respuestas_reparacion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "checklist_respuestas_diagnostico" ADD CONSTRAINT "checklist_respuestas_diagnostico_checklist_diagnostico_id_fkey" FOREIGN KEY ("checklist_diagnostico_id") REFERENCES "checklist_diagnostico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_respuestas_diagnostico" ADD CONSTRAINT "checklist_respuestas_diagnostico_checklist_item_id_fkey" FOREIGN KEY ("checklist_item_id") REFERENCES "checklist_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_respuestas_reparacion" ADD CONSTRAINT "checklist_respuestas_reparacion_reparacion_id_fkey" FOREIGN KEY ("reparacion_id") REFERENCES "reparaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_respuestas_reparacion" ADD CONSTRAINT "checklist_respuestas_reparacion_checklist_item_id_fkey" FOREIGN KEY ("checklist_item_id") REFERENCES "checklist_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
