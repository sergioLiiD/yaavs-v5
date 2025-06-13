-- DropForeignKey
ALTER TABLE "checklist_items" DROP CONSTRAINT "checklist_items_checklist_diagnostico_id_fkey";

-- AlterTable
ALTER TABLE "checklist_items" ALTER COLUMN "checklist_diagnostico_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_checklist_diagnostico_id_fkey" FOREIGN KEY ("checklist_diagnostico_id") REFERENCES "checklist_diagnostico"("id") ON DELETE SET NULL ON UPDATE CASCADE;
