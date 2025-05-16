/*
  Warnings:

  - Made the column `activo` on table `Cliente` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Cliente" ALTER COLUMN "activo" SET NOT NULL;
