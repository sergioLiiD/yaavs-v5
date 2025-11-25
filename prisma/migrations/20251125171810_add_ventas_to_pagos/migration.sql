-- Migration: Agregar soporte para pagos de ventas
-- Fecha: 2025-11-25
-- Descripción: Permite que la tabla pagos se relacione con ventas además de tickets

-- Paso 1: Hacer ticket_id nullable (opcional)
-- Primero verificamos que todos los registros actuales tienen ticket_id (debería ser siempre true)
-- Pero lo hacemos seguro eliminando el NOT NULL constraint
ALTER TABLE "pagos" ALTER COLUMN "ticket_id" DROP NOT NULL;

-- Paso 2: Agregar columna venta_id como nullable
ALTER TABLE "pagos" ADD COLUMN "venta_id" INTEGER;

-- Paso 3: Agregar foreign key a la tabla ventas
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_venta_id_fkey" 
  FOREIGN KEY ("venta_id") REFERENCES "ventas"("id") 
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Paso 4: Agregar constraint CHECK para asegurar que tiene ticket_id O venta_id (no ambos, no ninguno)
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_ticket_or_venta_check" 
  CHECK (
    ("ticket_id" IS NOT NULL AND "venta_id" IS NULL) OR
    ("ticket_id" IS NULL AND "venta_id" IS NOT NULL)
  );

-- Paso 5: Crear índice para mejorar performance de queries por venta_id
CREATE INDEX "pagos_venta_id_idx" ON "pagos"("venta_id");

