-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "stockMaximo" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stockMinimo" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tipo" "TipoProducto" NOT NULL DEFAULT 'PRODUCTO';
