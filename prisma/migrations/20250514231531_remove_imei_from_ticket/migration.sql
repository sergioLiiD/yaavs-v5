/*
  Warnings:

  - You are about to drop the column `imei` on the `dispositivos` table. All the data in the column will be lost.
  - You are about to drop the column `concepto` on the `pagos` table. All the data in the column will be lost.
  - You are about to drop the `Direccion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProblemaFrecuente` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Ticket` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `metodoPago` on the `pagos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Presupuesto" DROP CONSTRAINT "Presupuesto_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "ProblemaFrecuente" DROP CONSTRAINT "ProblemaFrecuente_modeloId_fkey";

-- DropForeignKey
ALTER TABLE "ProblemaModelo" DROP CONSTRAINT "ProblemaModelo_problemaFrecuenteId_fkey";

-- DropForeignKey
ALTER TABLE "Reparacion" DROP CONSTRAINT "Reparacion_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_creadorId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_direccionId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_estatusReparacionId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_modeloId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_problemaFrecuenteId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_tecnicoAsignadoId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_tipoServicioId_fkey";

-- DropForeignKey
ALTER TABLE "TicketProblema" DROP CONSTRAINT "TicketProblema_problemaFrecuenteId_fkey";

-- DropForeignKey
ALTER TABLE "TicketProblema" DROP CONSTRAINT "TicketProblema_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "dispositivos" DROP CONSTRAINT "dispositivos_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "pagos" DROP CONSTRAINT "pagos_ticketId_fkey";

-- AlterTable
ALTER TABLE "dispositivos" DROP COLUMN "imei";

-- AlterTable
ALTER TABLE "pagos" DROP COLUMN "concepto",
ADD COLUMN     "comprobante" TEXT,
ALTER COLUMN "fecha" DROP DEFAULT,
DROP COLUMN "metodoPago",
ADD COLUMN     "metodoPago" TEXT NOT NULL;

-- DropTable
DROP TABLE "Direccion";

-- DropTable
DROP TABLE "ProblemaFrecuente";

-- DropTable
DROP TABLE "Ticket";

-- CreateTable
CREATE TABLE "problemas_frecuentes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "modeloId" INTEGER NOT NULL,

    CONSTRAINT "problemas_frecuentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" SERIAL NOT NULL,
    "numeroTicket" TEXT NOT NULL,
    "fechaRecepcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" INTEGER NOT NULL,
    "tipoServicioId" INTEGER NOT NULL,
    "modeloId" INTEGER NOT NULL,
    "descripcionProblema" TEXT,
    "estatusReparacionId" INTEGER NOT NULL,
    "creadorId" INTEGER NOT NULL,
    "tecnicoAsignadoId" INTEGER,
    "recogida" BOOLEAN NOT NULL DEFAULT false,
    "fechaEntrega" TIMESTAMP(3),
    "entregado" BOOLEAN NOT NULL DEFAULT false,
    "cancelado" BOOLEAN NOT NULL DEFAULT false,
    "motivoCancelacion" TEXT,
    "fechaInicioDiagnostico" TIMESTAMP(3),
    "fechaFinDiagnostico" TIMESTAMP(3),
    "fechaInicioReparacion" TIMESTAMP(3),
    "fechaFinReparacion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direcciones" (
    "id" SERIAL NOT NULL,
    "calle" TEXT NOT NULL,
    "numeroExterior" TEXT NOT NULL,
    "numeroInterior" TEXT,
    "colonia" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "codigoPostal" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "direcciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tickets_numeroTicket_key" ON "tickets"("numeroTicket");

-- CreateIndex
CREATE UNIQUE INDEX "direcciones_ticketId_key" ON "direcciones"("ticketId");

-- AddForeignKey
ALTER TABLE "problemas_frecuentes" ADD CONSTRAINT "problemas_frecuentes_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "Modelo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemaModelo" ADD CONSTRAINT "ProblemaModelo_problemaFrecuenteId_fkey" FOREIGN KEY ("problemaFrecuenteId") REFERENCES "problemas_frecuentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_tipoServicioId_fkey" FOREIGN KEY ("tipoServicioId") REFERENCES "tipos_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "Modelo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_estatusReparacionId_fkey" FOREIGN KEY ("estatusReparacionId") REFERENCES "EstatusReparacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_tecnicoAsignadoId_fkey" FOREIGN KEY ("tecnicoAsignadoId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketProblema" ADD CONSTRAINT "TicketProblema_problemaFrecuenteId_fkey" FOREIGN KEY ("problemaFrecuenteId") REFERENCES "problemas_frecuentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketProblema" ADD CONSTRAINT "TicketProblema_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reparacion" ADD CONSTRAINT "Reparacion_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presupuesto" ADD CONSTRAINT "Presupuesto_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispositivos" ADD CONSTRAINT "dispositivos_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direcciones" ADD CONSTRAINT "direcciones_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
