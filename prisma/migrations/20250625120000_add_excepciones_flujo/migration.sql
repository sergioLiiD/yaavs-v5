-- CreateEnum
CREATE TYPE "TipoExcepcionFlujo" AS ENUM (
  'SIN_TECNICO_ASIGNADO',
  'SIN_DIAGNOSTICO',
  'ENTREGA_SIN_PAGO_COMPLETO',
  'CAMBIO_ESTADO_MANUAL',
  'REPARACION_SIN_REQUISITOS'
);

-- CreateTable
CREATE TABLE "excepciones_flujo" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "tipo" "TipoExcepcionFlujo" NOT NULL,
    "razon" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "excepciones_flujo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "excepciones_flujo_ticket_id_idx" ON "excepciones_flujo"("ticket_id");

-- CreateIndex
CREATE INDEX "excepciones_flujo_usuario_id_idx" ON "excepciones_flujo"("usuario_id");

-- AddForeignKey
ALTER TABLE "excepciones_flujo" ADD CONSTRAINT "excepciones_flujo_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "excepciones_flujo" ADD CONSTRAINT "excepciones_flujo_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
