/*
  Warnings:

  - The `tipo` column on the `proveedores` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TipoProveedor" AS ENUM ('FISICA', 'MORAL');

-- CreateEnum
CREATE TYPE "TipoProducto" AS ENUM ('PRODUCTO', 'SERVICIO');

-- DropIndex
DROP INDEX "productos_sku_key";

-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "tipo" "TipoProducto" NOT NULL DEFAULT 'PRODUCTO',
ALTER COLUMN "sku" DROP NOT NULL,
ALTER COLUMN "descripcion" DROP NOT NULL;

-- AlterTable
ALTER TABLE "proveedores" DROP COLUMN "tipo",
ADD COLUMN     "tipo" "TipoProveedor" NOT NULL DEFAULT 'FISICA';
