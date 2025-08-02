#!/bin/bash

echo "🔍 Debuggeando Ticket #33..."

echo ""
echo "📋 Información del ticket:"
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    t.id,
    t.numero_ticket,
    t.descripcion_problema,
    es.nombre as estatus,
    t.fecha_fin_reparacion
FROM tickets t
JOIN estatus_reparacion es ON t.estatus_reparacion_id = es.id
WHERE t.id = 33;
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
WHERE p.ticket_id = 33;
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
JOIN piezas p ON pr.pieza_id = p.id
WHERE pr.reparacion_id = (SELECT id FROM reparaciones WHERE ticket_id = 33);
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
    p.nombre as producto_nombre
FROM piezas_reparacion_productos prp
JOIN productos p ON prp.producto_id = p.id
WHERE prp.reparacion_id = (SELECT id FROM reparaciones WHERE ticket_id = 33);
"

echo ""
echo "📋 Productos existentes (búsqueda por batería):"
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    id,
    nombre,
    sku,
    stock,
    tipo
FROM productos 
WHERE nombre ILIKE '%batería%' OR nombre ILIKE '%bateria%' OR nombre ILIKE '%pila%';
"

echo ""
echo "📋 Salidas de almacén para ticket 33:"
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    id,
    producto_id,
    cantidad,
    tipo,
    razon,
    referencia,
    fecha
FROM salidas_almacen 
WHERE referencia = 'Ticket-33';
"

echo "✅ Debug completado." 