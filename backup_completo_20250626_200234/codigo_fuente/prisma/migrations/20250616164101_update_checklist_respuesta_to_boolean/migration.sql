/*
  Warnings:

  - You are about to drop the `checklist_respuestas_diagnostico` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "checklist_respuestas_diagnostico" DROP CONSTRAINT "checklist_respuestas_diagnostico_checklist_diagnostico_id_fkey";

-- DropForeignKey
ALTER TABLE "checklist_respuestas_diagnostico" DROP CONSTRAINT "checklist_respuestas_diagnostico_checklist_item_id_fkey";

-- DropTable
DROP TABLE "checklist_respuestas_diagnostico";

-- CreateTable
CREATE TABLE "ChecklistRespuestaDiagnostico" (
    "id" SERIAL NOT NULL,
    "checklistDiagnosticoId" INTEGER NOT NULL,
    "checklistItemId" INTEGER NOT NULL,
    "respuesta" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecklistRespuestaDiagnostico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChecklistRespuestaDiagnostico_checklistDiagnosticoId_idx" ON "ChecklistRespuestaDiagnostico"("checklistDiagnosticoId");

-- CreateIndex
CREATE INDEX "ChecklistRespuestaDiagnostico_checklistItemId_idx" ON "ChecklistRespuestaDiagnostico"("checklistItemId");

-- AddForeignKey
ALTER TABLE "ChecklistRespuestaDiagnostico" ADD CONSTRAINT "ChecklistRespuestaDiagnostico_checklistDiagnosticoId_fkey" FOREIGN KEY ("checklistDiagnosticoId") REFERENCES "checklist_diagnostico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistRespuestaDiagnostico" ADD CONSTRAINT "ChecklistRespuestaDiagnostico_checklistItemId_fkey" FOREIGN KEY ("checklistItemId") REFERENCES "checklist_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
