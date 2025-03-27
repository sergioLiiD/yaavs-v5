-- DropForeignKey
ALTER TABLE "productos" DROP CONSTRAINT "productos_marcaId_fkey";

-- DropForeignKey
ALTER TABLE "productos" DROP CONSTRAINT "productos_modeloId_fkey";

-- DropForeignKey
ALTER TABLE "productos" DROP CONSTRAINT "productos_proveedorId_fkey";

-- AlterTable
ALTER TABLE "productos" ALTER COLUMN "marcaId" DROP NOT NULL,
ALTER COLUMN "modeloId" DROP NOT NULL,
ALTER COLUMN "proveedorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "modelos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
