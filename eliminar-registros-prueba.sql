-- ============================================
-- SCRIPT PARA ELIMINAR REGISTROS DE PRUEBA
-- Tickets: 71-76
-- Ventas: 13-15
-- ============================================
-- IMPORTANTE: Ejecutar en el servidor de producción
-- Este script revierte el stock automáticamente
-- ============================================

BEGIN;

-- ============================================
-- PASO 1: REVERTIR STOCK DE TICKETS (71-76)
-- ============================================
-- Revertir stock de productos usados en reparaciones
UPDATE productos p
SET stock = stock + sa.cantidad,
    updated_at = NOW()
FROM salidas_almacen sa
WHERE p.id = sa.producto_id
AND sa.referencia IN ('Ticket-71', 'Ticket-72', 'Ticket-73', 'Ticket-74', 'Ticket-75', 'Ticket-76')
AND sa.tipo = 'REPARACION';

-- Ver resumen de stock revertido (OPCIONAL - comentar si no necesitas verlo)
-- SELECT p.nombre, sa.cantidad, p.stock as stock_actual
-- FROM salidas_almacen sa
-- JOIN productos p ON sa.producto_id = p.id
-- WHERE sa.referencia IN ('Ticket-71', 'Ticket-72', 'Ticket-73', 'Ticket-74', 'Ticket-75', 'Ticket-76')
-- AND sa.tipo = 'REPARACION';

-- ============================================
-- PASO 2: ELIMINAR RELACIONES DE TICKETS
-- ============================================

-- 2.1: Eliminar respuestas de checklist de diagnóstico
DELETE FROM checklist_respuesta_diagnostico
WHERE checklist_diagnostico_id IN (
  SELECT cd.id FROM checklist_diagnostico cd
  JOIN reparaciones r ON cd.reparacion_id = r.id
  WHERE r.ticket_id BETWEEN 71 AND 76
);

-- 2.2: Eliminar checklist de diagnóstico
DELETE FROM checklist_diagnostico
WHERE reparacion_id IN (
  SELECT id FROM reparaciones WHERE ticket_id BETWEEN 71 AND 76
);

-- 2.3: Eliminar respuestas de checklist de reparación
DELETE FROM checklist_respuesta_reparacion
WHERE checklist_reparacion_id IN (
  SELECT cr.id FROM checklist_reparacion cr
  JOIN reparaciones r ON cr.reparacion_id = r.id
  WHERE r.ticket_id BETWEEN 71 AND 76
);

-- 2.4: Eliminar checklist de reparación
DELETE FROM checklist_reparacion
WHERE reparacion_id IN (
  SELECT id FROM reparaciones WHERE ticket_id BETWEEN 71 AND 76
);

-- 2.5: Eliminar piezas de reparación (tabla nueva)
DELETE FROM piezas_reparacion_productos
WHERE reparacion_id IN (
  SELECT id FROM reparaciones WHERE ticket_id BETWEEN 71 AND 76
);

-- 2.6: Eliminar piezas de reparación (tabla antigua)
DELETE FROM piezas_reparacion
WHERE reparacion_id IN (
  SELECT id FROM reparaciones WHERE ticket_id BETWEEN 71 AND 76
);

-- 2.7: Eliminar reparaciones
DELETE FROM reparaciones WHERE ticket_id BETWEEN 71 AND 76;

-- 2.8: Eliminar conceptos de presupuesto
DELETE FROM conceptos_presupuesto
WHERE presupuesto_id IN (
  SELECT id FROM presupuestos WHERE ticket_id BETWEEN 71 AND 76
);

-- 2.9: Eliminar presupuestos
DELETE FROM presupuestos WHERE ticket_id BETWEEN 71 AND 76;

-- 2.10: Eliminar pagos
DELETE FROM pagos WHERE ticket_id BETWEEN 71 AND 76;

-- 2.11: Eliminar salidas de almacén
DELETE FROM salidas_almacen
WHERE referencia IN ('Ticket-71', 'Ticket-72', 'Ticket-73', 'Ticket-74', 'Ticket-75', 'Ticket-76')
AND tipo = 'REPARACION';

-- 2.12: Eliminar ticket_problemas
DELETE FROM ticket_problemas WHERE ticket_id BETWEEN 71 AND 76;

-- 2.13: Eliminar usos de cupones
DELETE FROM usos_cupon WHERE ticket_id BETWEEN 71 AND 76;

-- 2.14: Eliminar dispositivos
DELETE FROM dispositivos WHERE ticket_id BETWEEN 71 AND 76;

-- 2.15: Eliminar entregas
DELETE FROM entregas WHERE ticket_id BETWEEN 71 AND 76;

-- 2.16: FINALMENTE eliminar los tickets
DELETE FROM tickets WHERE id BETWEEN 71 AND 76;

-- ============================================
-- PASO 3: REVERTIR STOCK DE VENTAS (13-15)
-- ============================================
-- Revertir stock de productos vendidos
UPDATE productos p
SET stock = stock + sa.cantidad,
    updated_at = NOW()
FROM salidas_almacen sa
WHERE p.id = sa.producto_id
AND sa.referencia IN ('Venta #13', 'Venta #14', 'Venta #15')
AND sa.tipo = 'VENTA';

-- Ver resumen de stock revertido (OPCIONAL - comentar si no necesitas verlo)
-- SELECT p.nombre, sa.cantidad, p.stock as stock_actual
-- FROM salidas_almacen sa
-- JOIN productos p ON sa.producto_id = p.id
-- WHERE sa.referencia IN ('Venta #13', 'Venta #14', 'Venta #15')
-- AND sa.tipo = 'VENTA';

-- ============================================
-- PASO 4: ELIMINAR RELACIONES DE VENTAS
-- ============================================

-- 4.1: Eliminar usos de cupones
DELETE FROM usos_cupon WHERE venta_id BETWEEN 13 AND 15;

-- 4.2: Eliminar salidas de almacén
DELETE FROM salidas_almacen
WHERE referencia IN ('Venta #13', 'Venta #14', 'Venta #15')
AND tipo = 'VENTA';

-- 4.3: Eliminar detalles de venta
DELETE FROM detalle_ventas WHERE venta_id BETWEEN 13 AND 15;

-- 4.4: FINALMENTE eliminar las ventas
DELETE FROM ventas WHERE id BETWEEN 13 AND 15;

-- ============================================
-- CONFIRMAR O REVERTIR
-- ============================================
-- Si todo salió bien, ejecuta:
COMMIT;

-- Si algo salió mal, ejecuta:
-- ROLLBACK;

-- ============================================
-- VERIFICACIÓN DESPUÉS DE EJECUTAR
-- ============================================
-- Verificar que se eliminaron los tickets
-- SELECT COUNT(*) FROM tickets WHERE id BETWEEN 71 AND 76;
-- Debe retornar: 0

-- Verificar que se eliminaron las ventas
-- SELECT COUNT(*) FROM ventas WHERE id BETWEEN 13 AND 15;
-- Debe retornar: 0

-- Verificar que no quedaron registros huérfanos
-- SELECT COUNT(*) FROM pagos WHERE ticket_id BETWEEN 71 AND 76;
-- SELECT COUNT(*) FROM detalle_ventas WHERE venta_id BETWEEN 13 AND 15;
-- Ambos deben retornar: 0

