-- ============================================
-- MIGRACIÓN: Sistema de Cancelación y Devoluciones (Versión 2 - Idempotente)
-- Fecha: 2025-01-XX
-- Descripción: Agrega campos y tablas necesarias para manejar cancelaciones
--              de tickets y devoluciones de anticipos
--              Esta versión es idempotente (se puede ejecutar múltiples veces)
-- ============================================

BEGIN;

-- PASO 1: Agregar campo 'estado' a la tabla pagos (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pagos' AND column_name = 'estado'
    ) THEN
        ALTER TABLE pagos ADD COLUMN estado VARCHAR(20) DEFAULT 'ACTIVO';
        RAISE NOTICE 'Campo estado agregado a tabla pagos';
    ELSE
        RAISE NOTICE 'Campo estado ya existe en tabla pagos, omitiendo...';
    END IF;
END $$;

-- Actualizar todos los pagos existentes como ACTIVO (si tienen NULL)
UPDATE pagos 
SET estado = 'ACTIVO' 
WHERE estado IS NULL;

-- Agregar constraint para validar valores permitidos (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_estado_pago'
    ) THEN
        ALTER TABLE pagos 
        ADD CONSTRAINT check_estado_pago 
        CHECK (estado IN ('ACTIVO', 'CANCELADO', 'DEVUELTO'));
        RAISE NOTICE 'Constraint check_estado_pago agregado';
    ELSE
        RAISE NOTICE 'Constraint check_estado_pago ya existe, omitiendo...';
    END IF;
END $$;

-- PASO 2: Agregar campo 'cancelado_por_id' a la tabla tickets (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tickets' AND column_name = 'cancelado_por_id'
    ) THEN
        ALTER TABLE tickets ADD COLUMN cancelado_por_id INT;
        RAISE NOTICE 'Campo cancelado_por_id agregado a tabla tickets';
    ELSE
        RAISE NOTICE 'Campo cancelado_por_id ya existe en tabla tickets, omitiendo...';
    END IF;
END $$;

-- Agregar foreign key constraint (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_tickets_cancelado_por'
    ) THEN
        ALTER TABLE tickets 
        ADD CONSTRAINT fk_tickets_cancelado_por 
        FOREIGN KEY (cancelado_por_id) 
        REFERENCES usuarios(id) 
        ON DELETE SET NULL;
        RAISE NOTICE 'Foreign key fk_tickets_cancelado_por agregado';
    ELSE
        RAISE NOTICE 'Foreign key fk_tickets_cancelado_por ya existe, omitiendo...';
    END IF;
END $$;

-- PASO 3: Crear tabla de devoluciones (si no existe)
CREATE TABLE IF NOT EXISTS devoluciones (
  id SERIAL PRIMARY KEY,
  pago_id INT NOT NULL,
  ticket_id INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  motivo TEXT,
  estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
  fecha_devolucion DATE,
  usuario_id INT NOT NULL,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign keys
  CONSTRAINT fk_devoluciones_pago 
    FOREIGN KEY (pago_id) 
    REFERENCES pagos(id) 
    ON DELETE RESTRICT,
    
  CONSTRAINT fk_devoluciones_ticket 
    FOREIGN KEY (ticket_id) 
    REFERENCES tickets(id) 
    ON DELETE RESTRICT,
    
  CONSTRAINT fk_devoluciones_usuario 
    FOREIGN KEY (usuario_id) 
    REFERENCES usuarios(id) 
    ON DELETE RESTRICT,
    
  -- Constraint para validar estado
  CONSTRAINT check_estado_devolucion 
    CHECK (estado IN ('PENDIENTE', 'COMPLETADA', 'CANCELADA'))
);

-- Crear índices para mejorar rendimiento (si no existen)
CREATE INDEX IF NOT EXISTS idx_devoluciones_pago_id ON devoluciones(pago_id);
CREATE INDEX IF NOT EXISTS idx_devoluciones_ticket_id ON devoluciones(ticket_id);
CREATE INDEX IF NOT EXISTS idx_devoluciones_estado ON devoluciones(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos(estado);
CREATE INDEX IF NOT EXISTS idx_tickets_cancelado_por ON tickets(cancelado_por_id);

-- PASO 4: Crear función para actualizar updated_at automáticamente (si no existe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at en devoluciones (si no existe)
DROP TRIGGER IF EXISTS update_devoluciones_updated_at ON devoluciones;
CREATE TRIGGER update_devoluciones_updated_at
    BEFORE UPDATE ON devoluciones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecutar estos queries para verificar que todo se creó correctamente:

-- Ver estructura de pagos
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'pagos' AND column_name = 'estado';

-- Ver estructura de tickets
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'tickets' AND column_name = 'cancelado_por_id';

-- Ver estructura de devoluciones
-- SELECT table_name 
-- FROM information_schema.tables 
-- WHERE table_name = 'devoluciones';

-- Verificar que todos los pagos tienen estado ACTIVO
-- SELECT estado, COUNT(*) 
-- FROM pagos 
-- GROUP BY estado;

