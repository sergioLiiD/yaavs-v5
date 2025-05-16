/*
  Warnings:

  - You are about to drop the column `solucion` on the `ProblemaFrecuente` table. All the data in the column will be lost.
  - You are about to drop the `modelos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tickets` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `costoEstimado` to the `ProblemaFrecuente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modeloId` to the `ProblemaFrecuente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `ProblemaFrecuente` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Presupuesto" DROP CONSTRAINT "Presupuesto_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "ProblemaModelo" DROP CONSTRAINT "ProblemaModelo_modeloId_fkey";

-- DropForeignKey
ALTER TABLE "Reparacion" DROP CONSTRAINT "Reparacion_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "TicketProblema" DROP CONSTRAINT "TicketProblema_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "dispositivos" DROP CONSTRAINT "dispositivos_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "modelos" DROP CONSTRAINT "modelos_marcaId_fkey";

-- DropForeignKey
ALTER TABLE "pagos" DROP CONSTRAINT "pagos_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "piezas" DROP CONSTRAINT "piezas_modeloId_fkey";

-- DropForeignKey
ALTER TABLE "productos" DROP CONSTRAINT "productos_modeloId_fkey";

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_creadorId_fkey";

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_estatusReparacionId_fkey";

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_modeloId_fkey";

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_tecnicoAsignadoId_fkey";

-- DropForeignKey
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_tipoServicioId_fkey";

-- AlterTable
ALTER TABLE "ProblemaFrecuente" DROP COLUMN "solucion",
ADD COLUMN     "costoEstimado" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "modeloId" INTEGER NOT NULL,
ADD COLUMN     "nombre" TEXT NOT NULL,
ALTER COLUMN "descripcion" DROP NOT NULL;

-- DropTable
DROP TABLE "modelos";

-- DropTable
DROP TABLE "tickets";

-- CreateTable
CREATE TABLE "Modelo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "marcaId" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Modelo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "modeloId" INTEGER NOT NULL,
    "problemaFrecuenteId" INTEGER,
    "imei" TEXT NOT NULL,
    "capacidad" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "fechaCompra" TIMESTAMP(3) NOT NULL,
    "redCelular" TEXT NOT NULL,
    "codigoDesbloqueo" TEXT NOT NULL,
    "descripcionProblema" TEXT NOT NULL,
    "estatus" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "direccionId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creadorId" INTEGER NOT NULL,
    "tecnicoAsignadoId" INTEGER,
    "tipoServicioId" INTEGER NOT NULL,
    "estatusReparacionId" INTEGER NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Direccion" (
    "id" SERIAL NOT NULL,
    "calle" TEXT NOT NULL,
    "numeroExterior" TEXT NOT NULL,
    "numeroInterior" TEXT,
    "estado" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "colonia" TEXT NOT NULL,
    "codigoPostal" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Direccion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Modelo_marcaId_idx" ON "Modelo"("marcaId");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_direccionId_key" ON "Ticket"("direccionId");

-- CreateIndex
CREATE INDEX "Ticket_clienteId_idx" ON "Ticket"("clienteId");

-- CreateIndex
CREATE INDEX "Ticket_modeloId_idx" ON "Ticket"("modeloId");

-- CreateIndex
CREATE INDEX "Ticket_problemaFrecuenteId_idx" ON "Ticket"("problemaFrecuenteId");

-- CreateIndex
CREATE INDEX "Ticket_direccionId_idx" ON "Ticket"("direccionId");

-- CreateIndex
CREATE INDEX "Ticket_creadorId_idx" ON "Ticket"("creadorId");

-- CreateIndex
CREATE INDEX "Ticket_tecnicoAsignadoId_idx" ON "Ticket"("tecnicoAsignadoId");

-- CreateIndex
CREATE INDEX "Ticket_tipoServicioId_idx" ON "Ticket"("tipoServicioId");

-- CreateIndex
CREATE INDEX "Ticket_estatusReparacionId_idx" ON "Ticket"("estatusReparacionId");

-- CreateIndex
CREATE INDEX "ProblemaFrecuente_modeloId_idx" ON "ProblemaFrecuente"("modeloId");

-- AddForeignKey
ALTER TABLE "Modelo" ADD CONSTRAINT "Modelo_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemaFrecuente" ADD CONSTRAINT "ProblemaFrecuente_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "Modelo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemaModelo" ADD CONSTRAINT "ProblemaModelo_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "Modelo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piezas" ADD CONSTRAINT "piezas_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "Modelo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "Modelo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_problemaFrecuenteId_fkey" FOREIGN KEY ("problemaFrecuenteId") REFERENCES "ProblemaFrecuente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_direccionId_fkey" FOREIGN KEY ("direccionId") REFERENCES "Direccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_tecnicoAsignadoId_fkey" FOREIGN KEY ("tecnicoAsignadoId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_tipoServicioId_fkey" FOREIGN KEY ("tipoServicioId") REFERENCES "tipos_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_estatusReparacionId_fkey" FOREIGN KEY ("estatusReparacionId") REFERENCES "EstatusReparacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketProblema" ADD CONSTRAINT "TicketProblema_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reparacion" ADD CONSTRAINT "Reparacion_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presupuesto" ADD CONSTRAINT "Presupuesto_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "Modelo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispositivos" ADD CONSTRAINT "dispositivos_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
