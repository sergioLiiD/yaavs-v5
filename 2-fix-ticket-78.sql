-- =====================================================
-- PASO 2: CORREGIR EL STOCK DEL TICKET 78
-- =====================================================
-- ADVERTENCIA: Este script MODIFICA datos
-- Ejecuta PRIMERO el script 1-check-ticket-78.sql para verificar

-- Comenzar transacción
BEGIN;

-- Mostrar salidas que se van a eliminar
SELECT 
  '========== SALIDAS QUE SE ELIMINARÁN ==========' as info;

SELECT 
  sa.id as salida_id,
  p.nombre as producto,
  sa.cantidad as cantidad_a_restaurar,
  p.stock as stock_actual,
  (p.stock + sa.cantidad) as stock_despues_restaurar
FROM salidas_almacen sa
JOIN productos p ON p.id = sa.producto_id
WHERE sa.referencia = 'Ticket-78'
  AND sa.tipo = 'REPARACION';

-- Restaurar el stock para cada salida (suma la cantidad de vuelta)
UPDATE productos p
SET stock = stock + sa.cantidad,
    updated_at = NOW()
FROM salidas_almacen sa
WHERE sa.referencia = 'Ticket-78'
  AND sa.producto_id = p.id
  AND sa.tipo = 'REPARACION';

-- Mostrar stock después de la restauración
SELECT 
  '========== STOCK DESPUÉS DE RESTAURAR ==========' as info;

SELECT 
  id,
  nombre,
  stock
FROM productos 
WHERE id IN (
  SELECT DISTINCT producto_id 
  FROM salidas_almacen 
  WHERE referencia = 'Ticket-78'
);

-- Eliminar las salidas de almacén del ticket 78
DELETE FROM salidas_almacen
WHERE referencia = 'Ticket-78'
  AND tipo = 'REPARACION';

-- Mostrar resultado de la eliminación
SELECT 
  '========== SALIDAS ELIMINADAS ==========' as info,
  COUNT(*) as total_eliminadas
FROM salidas_almacen
WHERE referencia = 'Ticket-78'
  AND tipo = 'REPARACION';

-- Si todo se ve bien, ejecuta COMMIT
-- Si algo está mal, ejecuta ROLLBACK en su lugar

-- DESCOMENTAR UNA DE ESTAS LÍNEAS:
-- COMMIT;   -- Confirmar los cambios
ROLLBACK;  -- Deshacer los cambios (por defecto, por seguridad)

-- Verificación final (solo si hiciste COMMIT)
-- SELECT 
--   '========== VERIFICACIÓN FINAL - STOCK DEL PRODUCTO 303 ==========' as info;
-- 
-- SELECT 
--   id,
--   nombre,
--   stock,
--   tipo
-- FROM productos 
-- WHERE id = 303;

