#!/bin/bash

echo "🔧 Arreglando inventario para Ticket #34..."

echo ""
echo "📋 Paso 1: Obtener información del ticket y presupuesto..."
TICKET_ID=34
REPARACION_ID=$(docker exec yaavs_app psql $DATABASE_URL -t -c "
SELECT id FROM reparaciones WHERE ticket_id = $TICKET_ID LIMIT 1;
" | xargs)

echo "Reparación ID: $REPARACION_ID"

echo ""
echo "📋 Paso 2: Obtener conceptos del presupuesto..."
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    cp.descripcion,
    cp.cantidad,
    cp.precio_unitario,
    cp.total
FROM conceptos_presupuesto cp
JOIN presupuestos p ON cp.presupuesto_id = p.id
WHERE p.ticket_id = $TICKET_ID;
"

echo ""
echo "📋 Paso 3: Buscar productos correspondientes..."
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
echo "📋 Paso 4: Crear piezas de reparación desde conceptos del presupuesto..."
docker exec yaavs_app psql $DATABASE_URL -c "
-- Obtener el producto de batería
WITH producto_bateria AS (
    SELECT id, nombre, stock, precio_promedio
    FROM productos 
    WHERE nombre ILIKE '%batería%' OR nombre ILIKE '%bateria%' OR nombre ILIKE '%pila%'
    LIMIT 1
),
concepto_bateria AS (
    SELECT 
        cp.cantidad,
        cp.precio_unitario,
        cp.total
    FROM conceptos_presupuesto cp
    JOIN presupuestos p ON cp.presupuesto_id = p.id
    WHERE p.ticket_id = $TICKET_ID
    AND cp.descripcion ILIKE '%batería%' OR cp.descripcion ILIKE '%bateria%' OR cp.descripcion ILIKE '%pila%'
    LIMIT 1
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
    $REPARACION_ID,
    pb.id,
    cb.cantidad,
    cb.precio_unitario,
    cb.total,
    NOW(),
    NOW()
FROM producto_bateria pb, concepto_bateria cb
WHERE pb.id IS NOT NULL AND cb.cantidad IS NOT NULL
ON CONFLICT DO NOTHING;
"

echo ""
echo "📋 Paso 5: Crear salida de almacén..."
docker exec yaavs_app psql $DATABASE_URL -c "
WITH producto_bateria AS (
    SELECT id, nombre
    FROM productos 
    WHERE nombre ILIKE '%batería%' OR nombre ILIKE '%bateria%' OR nombre ILIKE '%pila%'
    LIMIT 1
),
concepto_bateria AS (
    SELECT cantidad
    FROM conceptos_presupuesto cp
    JOIN presupuestos p ON cp.presupuesto_id = p.id
    WHERE p.ticket_id = $TICKET_ID
    AND (cp.descripcion ILIKE '%batería%' OR cp.descripcion ILIKE '%bateria%' OR cp.descripcion ILIKE '%pila%')
    LIMIT 1
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
    pb.id,
    cb.cantidad,
    'REPARACION',
    'Reparación completada - Ticket #34',
    'Ticket-34',
    17,
    NOW(),
    NOW(),
    NOW()
FROM producto_bateria pb, concepto_bateria cb
WHERE pb.id IS NOT NULL AND cb.cantidad IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM salidas_almacen sa 
    WHERE sa.referencia = 'Ticket-34'
);
"

echo ""
echo "📋 Paso 6: Actualizar stock del producto..."
docker exec yaavs_app psql $DATABASE_URL -c "
WITH concepto_bateria AS (
    SELECT cantidad
    FROM conceptos_presupuesto cp
    JOIN presupuestos p ON cp.presupuesto_id = p.id
    WHERE p.ticket_id = $TICKET_ID
    AND (cp.descripcion ILIKE '%batería%' OR cp.descripcion ILIKE '%bateria%' OR cp.descripcion ILIKE '%pila%')
    LIMIT 1
)
UPDATE productos 
SET stock = stock - cb.cantidad, updated_at = NOW()
FROM concepto_bateria cb
WHERE productos.nombre ILIKE '%batería%' OR productos.nombre ILIKE '%bateria%' OR productos.nombre ILIKE '%pila%'
AND NOT EXISTS (
    SELECT 1 FROM salidas_almacen sa 
    WHERE sa.referencia = 'Ticket-34'
);
"

echo ""
echo "📋 Paso 7: Verificar resultados..."
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
WHERE referencia = 'Ticket-34';
"

echo ""
echo "✅ Inventario arreglado para Ticket #34."
echo "💡 Ahora deberías ver el descuento en /dashboard/inventario/stock" 