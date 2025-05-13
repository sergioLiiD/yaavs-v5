/*
  Warnings:

  - You are about to drop the `Ticket` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Presupuesto" DROP CONSTRAINT "Presupuesto_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "Reparacion" DROP CONSTRAINT "Reparacion_ticketId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_creadorId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_estatusReparacionId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_modeloId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_tecnicoAsignadoId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_tipoServicioId_fkey";

-- DropForeignKey
ALTER TABLE "TicketProblema" DROP CONSTRAINT "TicketProblema_ticketId_fkey";

-- DropTable
DROP TABLE "Ticket";

-- CreateTable
CREATE TABLE "tickets" (
    "id" SERIAL NOT NULL,
    "numeroTicket" TEXT NOT NULL,
    "fechaRecepcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" INTEGER NOT NULL,
    "tipoServicioId" INTEGER NOT NULL,
    "modeloId" INTEGER NOT NULL,
    "descripcion" TEXT,
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
CREATE TABLE "dispositivos" (
    "id" SERIAL NOT NULL,
    "imei" TEXT,
    "capacidad" TEXT,
    "color" TEXT,
    "fechaCompra" TIMESTAMP(3),
    "codigoDesbloqueo" TEXT,
    "redCelular" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ticketId" INTEGER,

    CONSTRAINT "dispositivos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tickets_numeroTicket_key" ON "tickets"("numeroTicket");

-- CreateIndex
CREATE UNIQUE INDEX "dispositivos_ticketId_key" ON "dispositivos"("ticketId");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_estatusReparacionId_fkey" FOREIGN KEY ("estatusReparacionId") REFERENCES "EstatusReparacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "modelos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_tecnicoAsignadoId_fkey" FOREIGN KEY ("tecnicoAsignadoId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_tipoServicioId_fkey" FOREIGN KEY ("tipoServicioId") REFERENCES "tipos_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketProblema" ADD CONSTRAINT "TicketProblema_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reparacion" ADD CONSTRAINT "Reparacion_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presupuesto" ADD CONSTRAINT "Presupuesto_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispositivos" ADD CONSTRAINT "dispositivos_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
