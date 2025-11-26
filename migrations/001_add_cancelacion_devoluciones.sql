-- ============================================
-- MIGRACIÓN: Sistema de Cancelación y Devoluciones
-- Fecha: 2025-01-XX
-- Descripción: Agrega campos y tablas necesarias para manejar cancelaciones
--              de tickets y devoluciones de anticipos
-- ============================================

BEGIN;

-- PASO 1: Agregar campo 'estado' a la tabla pagos
-- Valores posibles: 'ACTIVO', 'CANCELADO', 'DEVUELTO'
ALTER TABLE pagos 
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'ACTIVO';

-- Actualizar todos los pagos existentes como ACTIVO
UPDATE pagos 
SET estado = 'ACTIVO' 
WHERE estado IS NULL;

-- Agregar constraint para validar valores permitidos
ALTER TABLE pagos 
ADD CONSTRAINT check_estado_pago 
CHECK (estado IN ('ACTIVO', 'CANCELADO', 'DEVUELTO'));

-- PASO 2: Agregar campo 'cancelado_por_id' a la tabla tickets
-- Para registrar qué usuario canceló el ticket
ALTER TABLE tickets 
ADD COLUMN IF NOT EXISTS cancelado_por_id INT;

-- Agregar foreign key constraint
ALTER TABLE tickets 
ADD CONSTRAINT fk_tickets_cancelado_por 
FOREIGN KEY (cancelado_por_id) 
REFERENCES usuarios(id) 
ON DELETE SET NULL;

-- PASO 3: Crear tabla de devoluciones
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

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_devoluciones_pago_id ON devoluciones(pago_id);
CREATE INDEX IF NOT EXISTS idx_devoluciones_ticket_id ON devoluciones(ticket_id);
CREATE INDEX IF NOT EXISTS idx_devoluciones_estado ON devoluciones(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos(estado);
CREATE INDEX IF NOT EXISTS idx_tickets_cancelado_por ON tickets(cancelado_por_id);

-- PASO 4: Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at en devoluciones
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

