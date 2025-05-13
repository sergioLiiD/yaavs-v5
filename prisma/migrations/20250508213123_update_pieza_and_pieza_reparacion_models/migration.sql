/*
  Warnings:

  - You are about to drop the `Pieza` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PiezaReparacion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PiezaReparacion" DROP CONSTRAINT "PiezaReparacion_piezaId_fkey";

-- DropForeignKey
ALTER TABLE "PiezaReparacion" DROP CONSTRAINT "PiezaReparacion_reparacionId_fkey";

-- DropTable
DROP TABLE "Pieza";

-- DropTable
DROP TABLE "PiezaReparacion";

-- CreateTable
CREATE TABLE "piezas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "sku" TEXT,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "precioCompra" DOUBLE PRECISION NOT NULL,
    "precioVenta" DOUBLE PRECISION NOT NULL,
    "unidadMedida" TEXT,
    "ubicacion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "marcaId" INTEGER,
    "modeloId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "piezas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "piezas_reparacion" (
    "id" SERIAL NOT NULL,
    "reparacionId" INTEGER NOT NULL,
    "piezaId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "piezas_reparacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "piezas_sku_key" ON "piezas"("sku");

-- AddForeignKey
ALTER TABLE "piezas" ADD CONSTRAINT "piezas_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piezas" ADD CONSTRAINT "piezas_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "modelos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piezas_reparacion" ADD CONSTRAINT "piezas_reparacion_piezaId_fkey" FOREIGN KEY ("piezaId") REFERENCES "piezas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piezas_reparacion" ADD CONSTRAINT "piezas_reparacion_reparacionId_fkey" FOREIGN KEY ("reparacionId") REFERENCES "Reparacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
