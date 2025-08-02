#!/bin/bash

echo "🔍 Debuggeando Ticket #35..."

echo ""
echo "📋 Información del ticket:"
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    t.id,
    t.numero_ticket,
    t.estatus_reparacion_id,
    es.nombre as estatus
FROM tickets t
LEFT JOIN estatus_reparacion es ON t.estatus_reparacion_id = es.id
WHERE t.id = 35;
"

echo ""
echo "📋 Conceptos del presupuesto:"
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    cp.descripcion,
    cp.cantidad,
    cp.precio_unitario,
    cp.total
FROM conceptos_presupuesto cp
JOIN presupuestos p ON cp.presupuesto_id = p.id
WHERE p.ticket_id = 35;
"

echo ""
echo "📋 Reparación:"
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    id,
    ticket_id,
    observaciones,
    fecha_fin,
    created_at,
    updated_at
FROM reparaciones 
WHERE ticket_id = 35;
"

echo ""
echo "📋 Piezas de reparación (tabla antigua):"
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    pr.id,
    pr.reparacion_id,
    pr.pieza_id,
    pr.cantidad,
    pr.precio,
    pr.total,
    p.nombre as pieza_nombre
FROM piezas_reparacion pr
LEFT JOIN piezas p ON pr.pieza_id = p.id
WHERE pr.reparacion_id = (SELECT id FROM reparaciones WHERE ticket_id = 35);
"

echo ""
echo "📋 Piezas de reparación productos (tabla nueva):"
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    prp.id,
    prp.reparacion_id,
    prp.producto_id,
    prp.cantidad,
    prp.precio,
    prp.total,
    prod.nombre as producto_nombre
FROM piezas_reparacion_productos prp
LEFT JOIN productos prod ON prp.producto_id = prod.id
WHERE prp.reparacion_id = (SELECT id FROM reparaciones WHERE ticket_id = 35);
"

echo ""
echo "📋 Productos existentes (búsqueda por batería):"
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
echo "📋 Salidas de almacén para ticket 35:"
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    id,
    producto_id,
    cantidad,
    razon,
    tipo,
    referencia,
    fecha
FROM salidas_almacen 
WHERE referencia = 'Ticket-35';
"

echo ""
echo "✅ Debug completado." 