#!/bin/bash

echo "🔍 Verificando y arreglando Ticket #33..."

echo ""
echo "📋 Paso 1: Verificar si hay piezas registradas en la reparación..."
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    'Piezas en tabla antigua' as tabla,
    COUNT(*) as cantidad
FROM piezas_reparacion pr
WHERE pr.reparacion_id = (SELECT id FROM reparaciones WHERE ticket_id = 33)
UNION ALL
SELECT 
    'Piezas en tabla nueva' as tabla,
    COUNT(*) as cantidad
FROM piezas_reparacion_productos prp
WHERE prp.reparacion_id = (SELECT id FROM reparaciones WHERE ticket_id = 33);
"

echo ""
echo "📋 Paso 2: Verificar si existe el producto 'Batería iPhone 16 Pro'..."
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    id,
    nombre,
    sku,
    stock,
    precio_promedio
FROM productos 
WHERE nombre ILIKE '%batería%' OR nombre ILIKE '%bateria%' OR nombre ILIKE '%pila%';
"

echo ""
echo "📋 Paso 3: Si no hay piezas registradas, crear el registro..."
docker exec yaavs_app psql $DATABASE_URL -c "
-- Obtener IDs necesarios
WITH datos AS (
    SELECT 
        (SELECT id FROM reparaciones WHERE ticket_id = 33) as reparacion_id,
        (SELECT id FROM productos WHERE nombre ILIKE '%batería%' OR nombre ILIKE '%bateria%' OR nombre ILIKE '%pila%' LIMIT 1) as producto_id
)
INSERT INTO piezas_reparacion_productos (
    reparacion_id,
    producto_id,
    cantidad,
    precio,
    total,
    created_at,
    updated_at
)
SELECT 
    d.reparacion_id,
    d.producto_id,
    1,
    3200.00,
    3200.00,
    NOW(),
    NOW()
FROM datos d
WHERE d.reparacion_id IS NOT NULL 
AND d.producto_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM piezas_reparacion_productos prp 
    WHERE prp.reparacion_id = d.reparacion_id
);
"

echo ""
echo "📋 Paso 4: Crear salida de almacén si no existe..."
docker exec yaavs_app psql $DATABASE_URL -c "
WITH datos AS (
    SELECT 
        (SELECT id FROM productos WHERE nombre ILIKE '%batería%' OR nombre ILIKE '%bateria%' OR nombre ILIKE '%pila%' LIMIT 1) as producto_id
)
INSERT INTO salidas_almacen (
    producto_id,
    cantidad,
    tipo,
    razon,
    referencia,
    usuario_id,
    fecha,
    created_at,
    updated_at
)
SELECT 
    d.producto_id,
    1,
    'REPARACION',
    'Reparación completada - Ticket #33',
    'Ticket-33',
    17,
    NOW(),
    NOW(),
    NOW()
FROM datos d
WHERE d.producto_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM salidas_almacen sa 
    WHERE sa.referencia = 'Ticket-33'
);
"

echo ""
echo "📋 Paso 5: Actualizar stock del producto..."
docker exec yaavs_app psql $DATABASE_URL -c "
UPDATE productos 
SET stock = stock - 1, updated_at = NOW()
WHERE id = (
    SELECT id FROM productos 
    WHERE nombre ILIKE '%batería%' OR nombre ILIKE '%bateria%' OR nombre ILIKE '%pila%' 
    LIMIT 1
)
AND NOT EXISTS (
    SELECT 1 FROM salidas_almacen sa 
    WHERE sa.referencia = 'Ticket-33'
);
"

echo ""
echo "📋 Paso 6: Verificar resultados finales..."
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    'Producto' as tipo,
    nombre,
    stock,
    precio_promedio
FROM productos 
WHERE nombre ILIKE '%batería%' OR nombre ILIKE '%bateria%' OR nombre ILIKE '%pila%'
UNION ALL
SELECT 
    'Salida' as tipo,
    razon,
    cantidad,
    NULL
FROM salidas_almacen 
WHERE referencia = 'Ticket-33';
"

echo ""
echo "✅ Verificación y arreglo completado."
echo "💡 Ahora deberías ver el descuento en /dashboard/inventario/stock" 