-- =====================================================
-- PASO 1: INVESTIGAR EL PROBLEMA DEL TICKET 78
-- =====================================================
-- Este script SOLO consulta datos, no modifica nada

-- Ver las salidas de almacén para el ticket 78
SELECT '========== SALIDAS DE ALMACÉN PARA TICKET-78 ==========' as info;

SELECT 
  sa.id as salida_id,
  sa.producto_id,
  p.nombre as producto,
  sa.cantidad as cantidad_descontada,
  sa.tipo,
  sa.fecha,
  p.stock as stock_actual
FROM salidas_almacen sa
JOIN productos p ON p.id = sa.producto_id
WHERE sa.referencia = 'Ticket-78'
ORDER BY sa.fecha DESC;

-- Ver el stock actual del producto 303
SELECT '========== STOCK DEL PRODUCTO 303 (Display Honor X6/X8A 5G ORIG) ==========' as info;

SELECT 
  id,
  nombre,
  stock as stock_actual,
  tipo
FROM productos 
WHERE id = 303;

-- Ver las piezas de reparación del ticket 78
SELECT '========== PIEZAS DE REPARACIÓN PARA TICKET 78 ==========' as info;

SELECT 
  prp.id,
  prp.reparacion_id,
  prp.producto_id,
  p.nombre as producto,
  prp.cantidad as cantidad_necesaria,
  p.stock as stock_disponible,
  (p.stock - prp.cantidad) as stock_resultante
FROM piezas_reparacion_productos prp
JOIN productos p ON p.id = prp.producto_id
WHERE prp.reparacion_id = (
  SELECT id FROM reparaciones WHERE ticket_id = 78
);

