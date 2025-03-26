/*
  Warnings:

  - Added the required column `usuarioId` to the `entradas_almacen` table without a default value. This is not possible if the table is not empty.

*/
-- Primero agregamos la columna usuarioId como nullable
ALTER TABLE "entradas_almacen" ADD COLUMN "usuarioId" INTEGER;

-- Actualizamos los registros existentes con un usuario administrador (ID 1)
UPDATE "entradas_almacen" SET "usuarioId" = 1 WHERE "usuarioId" IS NULL;

-- Hacemos la columna NOT NULL después de actualizar los datos
ALTER TABLE "entradas_almacen" ALTER COLUMN "usuarioId" SET NOT NULL;

-- Agregamos la foreign key
ALTER TABLE "entradas_almacen" ADD CONSTRAINT "entradas_almacen_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "TipoSalida" AS ENUM ('VENTA', 'DANO', 'MERMA', 'OTRO');

-- CreateTable
CREATE TABLE "salidas_almacen" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "razon" TEXT NOT NULL,
    "tipo" "TipoSalida" NOT NULL,
    "referencia" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salidas_almacen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "salidas_almacen_productoId_idx" ON "salidas_almacen"("productoId");

-- CreateIndex
CREATE INDEX "salidas_almacen_usuarioId_idx" ON "salidas_almacen"("usuarioId");

-- AddForeignKey
ALTER TABLE "salidas_almacen" ADD CONSTRAINT "salidas_almacen_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salidas_almacen" ADD CONSTRAINT "salidas_almacen_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
