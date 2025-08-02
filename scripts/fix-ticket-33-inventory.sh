#!/bin/bash

echo "🔧 Arreglando inventario para Ticket #33..."

echo ""
echo "📋 Paso 1: Crear producto 'Batería iPhone 16 Pro' si no existe..."
docker exec yaavs_app psql $DATABASE_URL -c "
INSERT INTO productos (
    sku,
    nombre,
    descripcion,
    marca_id,
    modelo_id,
    stock,
    precio_promedio,
    tipo,
    created_at,
    updated_at
)
SELECT 
    'BATERIA-IPHONE-16-PRO',
    'Batería iPhone 16 Pro',
    'Batería de repuesto para iPhone 16 Pro',
    m.id,
    mo.id,
    10,
    3200.00,
    'PRODUCTO',
    NOW(),
    NOW()
FROM marcas m, modelos mo
WHERE m.nombre = 'Apple' AND mo.nombre = 'iPhone 16 Pro'
AND NOT EXISTS (
    SELECT 1 FROM productos WHERE nombre = 'Batería iPhone 16 Pro'
);
"

echo ""
echo "📋 Paso 2: Obtener IDs necesarios..."
PRODUCTO_ID=$(docker exec yaavs_app psql $DATABASE_URL -t -c "
SELECT id FROM productos WHERE nombre = 'Batería iPhone 16 Pro' LIMIT 1;
" | xargs)

REPARACION_ID=$(docker exec yaavs_app psql $DATABASE_URL -t -c "
SELECT id FROM reparaciones WHERE ticket_id = 33 LIMIT 1;
" | xargs)

echo "Producto ID: $PRODUCTO_ID"
echo "Reparación ID: $REPARACION_ID"

echo ""
echo "📋 Paso 3: Crear registro en piezas_reparacion_productos..."
docker exec yaavs_app psql $DATABASE_URL -c "
INSERT INTO piezas_reparacion_productos (
    reparacion_id,
    producto_id,
    cantidad,
    precio,
    total,
    created_at,
    updated_at
)
VALUES (
    $REPARACION_ID,
    $PRODUCTO_ID,
    1,
    3200.00,
    3200.00,
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;
"

echo ""
echo "📋 Paso 4: Crear salida de almacén..."
docker exec yaavs_app psql $DATABASE_URL -c "
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
VALUES (
    $PRODUCTO_ID,
    1,
    'REPARACION',
    'Reparación completada - Ticket #33',
    'Ticket-33',
    17,
    NOW(),
    NOW(),
    NOW()
);
"

echo ""
echo "📋 Paso 5: Actualizar stock del producto..."
docker exec yaavs_app psql $DATABASE_URL -c "
UPDATE productos 
SET stock = stock - 1, updated_at = NOW()
WHERE id = $PRODUCTO_ID;
"

echo ""
echo "📋 Paso 6: Verificar resultados..."
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    'Producto' as tipo,
    nombre,
    stock,
    precio_promedio
FROM productos 
WHERE nombre = 'Batería iPhone 16 Pro'
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
echo "✅ Inventario arreglado para Ticket #33."
echo "💡 Ahora deberías ver el descuento en /dashboard/inventario/stock" 