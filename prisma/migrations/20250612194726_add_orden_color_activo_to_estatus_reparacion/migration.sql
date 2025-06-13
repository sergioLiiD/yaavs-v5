/*
  Warnings:

  - Added the required column `orden` to the `estatus_reparacion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "estatus_reparacion" ADD COLUMN     "activo" BOOLEAN,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "orden" INTEGER NOT NULL;
