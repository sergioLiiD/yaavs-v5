#!/bin/bash

echo "🧪 Probando sistema de inventario..."

# Verificar estructura de datos
echo "📋 Verificando estructura de datos..."
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    'Piezas' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN stock > 0 THEN 1 END) as con_stock,
    COUNT(CASE WHEN stock = 0 THEN 1 END) as sin_stock
FROM piezas
UNION ALL
SELECT 
    'Piezas Reparación' as tabla,
    COUNT(*) as total_registros,
    COUNT(DISTINCT reparacion_id) as reparaciones_con_piezas,
    COUNT(DISTINCT pieza_id) as piezas_diferentes
FROM piezas_reparacion;
"

echo ""
echo "📋 Verificando tickets con reparaciones..."
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    t.id as ticket_id,
    t.numero_ticket,
    t.estatus_reparacion_id,
    es.nombre as estatus,
    r.id as reparacion_id,
    r.fecha_fin,
    COUNT(pr.id) as piezas_usadas
FROM tickets t
LEFT JOIN estatus_reparacion es ON t.estatus_reparacion_id = es.id
LEFT JOIN reparaciones r ON t.id = r.ticket_id
LEFT JOIN piezas_reparacion pr ON r.id = pr.reparacion_id
WHERE r.fecha_fin IS NOT NULL
GROUP BY t.id, t.numero_ticket, t.estatus_reparacion_id, es.nombre, r.id, r.fecha_fin
ORDER BY r.fecha_fin DESC
LIMIT 10;
"

echo ""
echo "📋 Verificando salidas de almacén por reparaciones..."
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    sa.id,
    sa.producto_id,
    p.nombre as producto,
    sa.cantidad,
    sa.tipo,
    sa.razon,
    sa.referencia,
    sa.fecha,
    u.nombre || ' ' || u.apellido_paterno as usuario
FROM salidas_almacen sa
JOIN piezas p ON sa.producto_id = p.id
JOIN usuarios u ON sa.usuario_id = u.id
WHERE sa.tipo = 'REPARACION'
ORDER BY sa.fecha DESC
LIMIT 10;
"

echo ""
echo "📋 Verificando stock actual de piezas..."
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    p.id,
    p.nombre,
    m.nombre as marca,
    mo.nombre as modelo,
    p.stock,
    CASE 
        WHEN p.stock = 0 THEN 'SIN STOCK'
        WHEN p.stock <= 5 THEN 'STOCK BAJO'
        ELSE 'STOCK OK'
    END as estado_stock
FROM piezas p
JOIN marcas m ON p.marca_id = m.id
JOIN modelos mo ON p.modelo_id = mo.id
WHERE p.stock <= 10
ORDER BY p.stock ASC;
"

echo ""
echo "✅ Pruebas completadas. Revisa los resultados arriba."
echo "💡 Para probar el sistema en vivo, intenta completar una reparación desde la interfaz." 