/*
  Warnings:

  - You are about to drop the column `stockMaximo` on the `productos` table. All the data in the column will be lost.
  - You are about to drop the column `stockMinimo` on the `productos` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `productos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sku]` on the table `productos` will be added. If there are existing duplicate values, this will fail.
  - Made the column `sku` on table `productos` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "productos" DROP CONSTRAINT "productos_categoriaId_fkey";

-- AlterTable
ALTER TABLE "productos" DROP COLUMN "stockMaximo",
DROP COLUMN "stockMinimo",
DROP COLUMN "tipo",
ADD COLUMN     "tipoServicioId" INTEGER,
ALTER COLUMN "sku" SET NOT NULL,
ALTER COLUMN "garantiaValor" SET DEFAULT 0,
ALTER COLUMN "precioPromedio" DROP NOT NULL,
ALTER COLUMN "precioPromedio" DROP DEFAULT,
ALTER COLUMN "stock" DROP NOT NULL,
ALTER COLUMN "stock" DROP DEFAULT;

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_key" ON "categorias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "productos_sku_key" ON "productos"("sku");

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_tipoServicioId_fkey" FOREIGN KEY ("tipoServicioId") REFERENCES "tipos_servicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
