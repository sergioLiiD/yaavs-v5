-- ===========================================
-- SCRIPT DE LIMPIEZA - DATOS DE PRUEBA
-- FECHA: 2025-09-02
-- OBJETIVO: Eliminar tickets y clientes anteriores al 31/08/2025
-- ===========================================

BEGIN;

-- Mostrar estado ANTES de la limpieza
\echo '=== ESTADO ANTES DE LA LIMPIEZA ==='
SELECT 'Tickets totales' as tipo, COUNT(*) as cantidad FROM tickets
UNION ALL
SELECT 'Clientes totales', COUNT(*) FROM clientes
UNION ALL
SELECT 'Tickets a eliminar', COUNT(*) FROM tickets WHERE created_at < '2025-08-31'
UNION ALL
SELECT 'Clientes a eliminar', COUNT(*) FROM clientes WHERE created_at < '2025-08-31'
UNION ALL
SELECT 'Tickets a conservar', COUNT(*) FROM tickets WHERE created_at >= '2025-08-31'
UNION ALL
SELECT 'Clientes a conservar', COUNT(*) FROM clientes WHERE created_at >= '2025-08-31';

-- ===========================================
-- LIMPIEZA DE DATOS DE PRUEBA
-- ===========================================

-- PASO 1: Eliminar tickets anteriores al 31/08/2025
DELETE FROM tickets WHERE created_at < '2025-08-31';

-- PASO 2: Eliminar clientes anteriores al 31/08/2025
DELETE FROM clientes WHERE created_at < '2025-08-31';

-- Mostrar estado DESPUÉS de la limpieza
\echo '=== ESTADO DESPUÉS DE LA LIMPIEZA ==='
SELECT 'Tickets restantes' as tipo, COUNT(*) as cantidad FROM tickets
UNION ALL
SELECT 'Clientes restantes', COUNT(*) FROM clientes;

-- Confirmar transacción
COMMIT;

\echo '=== LIMPIEZA COMPLETADA EXITOSAMENTE ==='