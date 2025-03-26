/*
  Warnings:

  - Made the column `tipoServicioId` on table `productos` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "productos" DROP CONSTRAINT "productos_categoriaId_fkey";

-- DropForeignKey
ALTER TABLE "productos" DROP CONSTRAINT "productos_tipoServicioId_fkey";

-- AlterTable
ALTER TABLE "productos" ALTER COLUMN "categoriaId" DROP NOT NULL,
ALTER COLUMN "tipoServicioId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_tipoServicioId_fkey" FOREIGN KEY ("tipoServicioId") REFERENCES "tipos_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
