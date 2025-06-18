/*
  Warnings:

  - You are about to drop the column `is_repair_point` on the `puntos_recoleccion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "puntos_recoleccion" DROP COLUMN "is_repair_point",
ADD COLUMN     "isRepairPoint" BOOLEAN NOT NULL DEFAULT false;
