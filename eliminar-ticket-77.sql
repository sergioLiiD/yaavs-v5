-- ============================================
-- SCRIPT PARA ELIMINAR TICKET 77
-- ============================================

BEGIN;

-- 1. Revertir stock
UPDATE productos p
SET stock = stock + sa.cantidad,
    updated_at = NOW()
FROM salidas_almacen sa
WHERE p.id = sa.producto_id
AND sa.referencia = 'Ticket-77'
AND sa.tipo = 'REPARACION';

-- 2. Eliminar checklists de diagnóstico
DELETE FROM checklist_respuesta_diagnostico
WHERE checklist_diagnostico_id IN (
  SELECT cd.id FROM checklist_diagnostico cd
  JOIN reparaciones r ON cd.reparacion_id = r.id
  WHERE r.ticket_id = 77
);

DELETE FROM checklist_diagnostico
WHERE reparacion_id IN (
  SELECT id FROM reparaciones WHERE ticket_id = 77
);

-- 3. Eliminar checklists de reparación
DELETE FROM checklist_respuesta_reparacion
WHERE checklist_reparacion_id IN (
  SELECT cr.id FROM checklist_reparacion cr
  JOIN reparaciones r ON cr.reparacion_id = r.id
  WHERE r.ticket_id = 77
);

DELETE FROM checklist_reparacion
WHERE reparacion_id IN (
  SELECT id FROM reparaciones WHERE ticket_id = 77
);

-- 4. Eliminar piezas de reparación
DELETE FROM piezas_reparacion_productos
WHERE reparacion_id IN (
  SELECT id FROM reparaciones WHERE ticket_id = 77
);

DELETE FROM piezas_reparacion
WHERE reparacion_id IN (
  SELECT id FROM reparaciones WHERE ticket_id = 77
);

-- 5. Eliminar reparaciones
DELETE FROM reparaciones WHERE ticket_id = 77;

-- 6. Eliminar conceptos de presupuesto
DELETE FROM conceptos_presupuesto
WHERE presupuesto_id IN (
  SELECT id FROM presupuestos WHERE ticket_id = 77
);

-- 7. Eliminar presupuestos
DELETE FROM presupuestos WHERE ticket_id = 77;

-- 8. Eliminar pagos
DELETE FROM pagos WHERE ticket_id = 77;

-- 9. Eliminar salidas de almacén
DELETE FROM salidas_almacen
WHERE referencia = 'Ticket-77'
AND tipo = 'REPARACION';

-- 10. Eliminar otras relaciones
DELETE FROM ticket_problemas WHERE ticket_id = 77;
DELETE FROM usos_cupon WHERE ticket_id = 77;
DELETE FROM dispositivos WHERE ticket_id = 77;
DELETE FROM entregas WHERE ticket_id = 77;

-- 11. Eliminar el ticket
DELETE FROM tickets WHERE id = 77;

COMMIT;

-- Verificar
SELECT COUNT(*) as tickets_restantes FROM tickets WHERE id = 77;

