/*
  Warnings:

  - Added the required column `banco` to the `proveedores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clabeInterbancaria` to the `proveedores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cuentaBancaria` to the `proveedores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rfc` to the `proveedores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "proveedores" ADD COLUMN     "banco" TEXT NOT NULL,
ADD COLUMN     "clabeInterbancaria" TEXT NOT NULL,
ADD COLUMN     "cuentaBancaria" TEXT NOT NULL,
ADD COLUMN     "rfc" TEXT NOT NULL,
ADD COLUMN     "tipo" TEXT NOT NULL DEFAULT 'FISICA';
