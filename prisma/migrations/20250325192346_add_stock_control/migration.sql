-- AlterTable
ALTER TABLE "productos" ADD COLUMN     "precioPromedio" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stockMaximo" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stockMinimo" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "entradas_almacen" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioCompra" DOUBLE PRECISION NOT NULL,
    "notas" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entradas_almacen_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "entradas_almacen" ADD CONSTRAINT "entradas_almacen_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
