/*
  Warnings:

  - You are about to drop the column `activo` on the `piezas` table. All the data in the column will be lost.
  - You are about to drop the column `cantidad` on the `piezas` table. All the data in the column will be lost.
  - You are about to drop the column `sku` on the `piezas` table. All the data in the column will be lost.
  - You are about to drop the column `ubicacion` on the `piezas` table. All the data in the column will be lost.
  - You are about to drop the column `unidadMedida` on the `piezas` table. All the data in the column will be lost.
  - You are about to drop the column `activo` on the `puntos_recoleccion` table. All the data in the column will be lost.
  - You are about to drop the column `isRepairPoint` on the `puntos_recoleccion` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `puntos_recoleccion` table. All the data in the column will be lost.
  - You are about to drop the `Cliente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reparacion` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `marcaId` on table `piezas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `piezaId` on table `piezas_reparacion` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `nombre` to the `puntos_recoleccion` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `location` on the `puntos_recoleccion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `nivel` to the `usuarios_puntos_recoleccion` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Reparacion" DROP CONSTRAINT "Reparacion_tecnicoId_fkey";

-- DropForeignKey
ALTER TABLE "Reparacion" DROP CONSTRAINT "Reparacion_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "checklist_diagnostico" DROP CONSTRAINT "checklist_diagnostico_reparacionId_fkey";

-- DropForeignKey
ALTER TABLE "piezas" DROP CONSTRAINT "piezas_marcaId_fkey";

-- DropForeignKey
ALTER TABLE "piezas_reparacion" DROP CONSTRAINT "piezas_reparacion_piezaId_fkey";

-- DropForeignKey
ALTER TABLE "piezas_reparacion" DROP CONSTRAINT "piezas_reparacion_reparacionId_fkey";

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_clienteId_fkey";

-- DropIndex
DROP INDEX "piezas_sku_key";

-- DropIndex
DROP INDEX "usuarios_puntos_recoleccion_puntoRecoleccionId_idx";

-- DropIndex
DROP INDEX "usuarios_puntos_recoleccion_rolId_idx";

-- DropIndex
DROP INDEX "usuarios_puntos_recoleccion_usuarioId_idx";

-- DropIndex
DROP INDEX "usuarios_puntos_recoleccion_usuarioId_puntoRecoleccionId_key";

-- AlterTable
ALTER TABLE "piezas" DROP COLUMN "activo",
DROP COLUMN "cantidad",
DROP COLUMN "sku",
DROP COLUMN "ubicacion",
DROP COLUMN "unidadMedida",
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "marcaId" SET NOT NULL;

-- AlterTable
ALTER TABLE "piezas_reparacion" ALTER COLUMN "piezaId" SET NOT NULL;

-- AlterTable
ALTER TABLE "puntos_recoleccion" DROP COLUMN "activo",
DROP COLUMN "isRepairPoint",
DROP COLUMN "name",
ADD COLUMN     "nombre" TEXT NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
DROP COLUMN "location",
ADD COLUMN     "location" JSONB NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "url" DROP NOT NULL,
ALTER COLUMN "schedule" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "puntoRecoleccionId" INTEGER;

-- AlterTable
ALTER TABLE "usuarios_puntos_recoleccion" ADD COLUMN     "nivel" "NivelUsuarioPunto" NOT NULL;

-- DropTable
DROP TABLE "Cliente";

-- DropTable
DROP TABLE "Reparacion";

-- CreateTable
CREATE TABLE "cliente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT,
    "telefonoCelular" TEXT NOT NULL,
    "telefonoContacto" TEXT,
    "email" TEXT NOT NULL,
    "calle" TEXT,
    "numeroExterior" TEXT,
    "numeroInterior" TEXT,
    "colonia" TEXT,
    "ciudad" TEXT,
    "estado" TEXT,
    "codigoPostal" TEXT,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "fuenteReferencia" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rfc" TEXT,
    "passwordHash" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "tipoRegistro" TEXT NOT NULL DEFAULT 'Registro en tienda',
    "puntoRecoleccionId" INTEGER,

    CONSTRAINT "cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reparaciones" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "tecnicoId" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFin" TIMESTAMP(3),
    "descripcion" TEXT,
    "observaciones" TEXT,
    "costoTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "versionSO" TEXT,

    CONSTRAINT "reparaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cliente_email_key" ON "cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "reparaciones_ticketId_key" ON "reparaciones"("ticketId");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cliente" ADD CONSTRAINT "cliente_puntoRecoleccionId_fkey" FOREIGN KEY ("puntoRecoleccionId") REFERENCES "puntos_recoleccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reparaciones" ADD CONSTRAINT "reparaciones_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reparaciones" ADD CONSTRAINT "reparaciones_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_puntoRecoleccionId_fkey" FOREIGN KEY ("puntoRecoleccionId") REFERENCES "puntos_recoleccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_diagnostico" ADD CONSTRAINT "checklist_diagnostico_reparacionId_fkey" FOREIGN KEY ("reparacionId") REFERENCES "reparaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piezas" ADD CONSTRAINT "piezas_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piezas_reparacion" ADD CONSTRAINT "piezas_reparacion_piezaId_fkey" FOREIGN KEY ("piezaId") REFERENCES "piezas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piezas_reparacion" ADD CONSTRAINT "piezas_reparacion_reparacionId_fkey" FOREIGN KEY ("reparacionId") REFERENCES "reparaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
