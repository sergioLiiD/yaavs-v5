/*
  Warnings:

  - Made the column `precioPromedio` on table `productos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `stock` on table `productos` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "productos" ALTER COLUMN "precioPromedio" SET NOT NULL,
ALTER COLUMN "precioPromedio" SET DEFAULT 0,
ALTER COLUMN "stock" SET NOT NULL,
ALTER COLUMN "stock" SET DEFAULT 0;
