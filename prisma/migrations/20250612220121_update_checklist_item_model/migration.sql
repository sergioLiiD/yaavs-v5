/*
  Warnings:

  - You are about to drop the column `completado` on the `checklist_items` table. All the data in the column will be lost.
  - You are about to drop the column `notas` on the `checklist_items` table. All the data in the column will be lost.
  - Added the required column `nombre` to the `checklist_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "checklist_items" DROP COLUMN "completado",
DROP COLUMN "notas",
ADD COLUMN     "nombre" TEXT NOT NULL,
ADD COLUMN     "para_diagnostico" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "para_reparacion" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "descripcion" DROP NOT NULL;
