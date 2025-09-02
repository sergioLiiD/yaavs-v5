-- ===========================================
-- SCRIPT DE LIMPIEZA V7 - INTEGRIDAD REFERENCIAL COMPLETA
-- FECHA: 2025-09-02
-- OBJETIVO: Eliminar datos de prueba anteriores al 31/08/2025
-- ===========================================

BEGIN;

-- Mostrar estado ANTES de la limpieza
\echo '=== ESTADO ANTES DE LA LIMPIEZA ==='
SELECT 'Tickets totales' as tipo, COUNT(*) as cantidad FROM tickets
UNION ALL
SELECT 'Clientes totales', COUNT(*) FROM clientes
UNION ALL
SELECT 'Dispositivos totales', COUNT(*) FROM dispositivos
UNION ALL
SELECT 'Pagos totales', COUNT(*) FROM pagos
UNION ALL
SELECT 'Presupuestos totales', COUNT(*) FROM presupuestos
UNION ALL
SELECT 'Conceptos Presupuesto totales', COUNT(*) FROM conceptos_presupuesto
UNION ALL
SELECT 'Reparaciones totales', COUNT(*) FROM reparaciones
UNION ALL
SELECT 'Checklist Diagnostico totales', COUNT(*) FROM checklist_diagnostico
UNION ALL
SELECT 'Checklist Respuesta totales', COUNT(*) FROM checklist_respuesta_diagnostico
UNION ALL
SELECT 'Checklist Reparacion totales', COUNT(*) FROM checklist_reparacion
UNION ALL
SELECT 'Checklist Respuesta Reparacion totales', COUNT(*) FROM checklist_respuesta_reparacion;

-- ===========================================
-- LIMPIEZA EN ORDEN CORRECTO DE REFERENCIAS
-- ===========================================

-- PASO 1: Limpiar usos_cupon (SET NULL)
UPDATE usos_cupon SET ticket_id = NULL WHERE ticket_id IN (SELECT id FROM tickets WHERE created_at < '2025-08-31');

-- PASO 2: Eliminar conceptos_presupuesto asociados a presupuestos antiguos
DELETE FROM conceptos_presupuesto WHERE presupuesto_id IN (SELECT id FROM presupuestos WHERE ticket_id IN (SELECT id FROM tickets WHERE created_at < '2025-08-31'));

-- PASO 3: Eliminar checklist_respuesta_diagnostico asociados a checklist antiguos
DELETE FROM checklist_respuesta_diagnostico WHERE checklist_diagnostico_id IN (SELECT id FROM checklist_diagnostico WHERE reparacion_id IN (SELECT id FROM reparaciones WHERE ticket_id IN (SELECT id FROM tickets WHERE created_at < '2025-08-31')));

-- PASO 4: Eliminar checklist_diagnostico asociados a reparaciones antiguas
DELETE FROM checklist_diagnostico WHERE reparacion_id IN (SELECT id FROM reparaciones WHERE ticket_id IN (SELECT id FROM tickets WHERE created_at < '2025-08-31'));

-- PASO 5: Eliminar checklist_respuesta_reparacion asociados a checklist de reparación antiguos
DELETE FROM checklist_respuesta_reparacion WHERE checklist_reparacion_id IN (SELECT id FROM checklist_reparacion WHERE reparacion_id IN (SELECT id FROM reparaciones WHERE ticket_id IN (SELECT id FROM tickets WHERE created_at < '2025-08-31')));

-- PASO 6: Eliminar checklist_reparacion asociados a reparaciones antiguas
DELETE FROM checklist_reparacion WHERE reparacion_id IN (SELECT id FROM reparaciones WHERE ticket_id IN (SELECT id FROM tickets WHERE created_at < '2025-08-31'));

-- PASO 7: Eliminar dispositivos asociados a tickets antiguos
DELETE FROM dispositivos WHERE ticket_id IN (SELECT id FROM tickets WHERE created_at < '2025-08-31');

-- PASO 8: Eliminar pagos asociados a tickets antiguos
DELETE FROM pagos WHERE ticket_id IN (SELECT id FROM tickets WHERE created_at < '2025-08-31');

-- PASO 9: Eliminar presupuestos asociados a tickets antiguos
DELETE FROM presupuestos WHERE ticket_id IN (SELECT id FROM tickets WHERE created_at < '2025-08-31');

-- PASO 10: Eliminar reparaciones asociadas a tickets antiguos
DELETE FROM reparaciones WHERE ticket_id IN (SELECT id FROM tickets WHERE created_at < '2025-08-31');

-- PASO 11: Eliminar tickets anteriores al 31/08/2025
DELETE FROM tickets WHERE created_at < '2025-08-31';

-- PASO 12: Eliminar clientes anteriores al 31/08/2025
DELETE FROM clientes WHERE created_at < '2025-08-31';

-- Mostrar estado DESPUÉS de la limpieza
\echo '=== ESTADO DESPUÉS DE LA LIMPIEZA ==='
SELECT 'Tickets restantes' as tipo, COUNT(*) as cantidad FROM tickets
UNION ALL
SELECT 'Clientes restantes', COUNT(*) FROM clientes
UNION ALL
SELECT 'Dispositivos restantes', COUNT(*) FROM dispositivos
UNION ALL
SELECT 'Pagos restantes', COUNT(*) FROM pagos
UNION ALL
SELECT 'Presupuestos restantes', COUNT(*) FROM presupuestos
UNION ALL
SELECT 'Conceptos Presupuesto restantes', COUNT(*) FROM conceptos_presupuesto
UNION ALL
SELECT 'Reparaciones restantes', COUNT(*) FROM reparaciones
UNION ALL
SELECT 'Checklist Diagnostico restantes', COUNT(*) FROM checklist_diagnostico
UNION ALL
SELECT 'Checklist Respuesta restantes', COUNT(*) FROM checklist_respuesta_diagnostico
UNION ALL
SELECT 'Checklist Reparacion restantes', COUNT(*) FROM checklist_reparacion
UNION ALL
SELECT 'Checklist Respuesta Reparacion restantes', COUNT(*) FROM checklist_respuesta_reparacion;

-- Confirmar transacción
COMMIT;

\echo '=== LIMPIEZA COMPLETADA EXITOSAMENTE ==='