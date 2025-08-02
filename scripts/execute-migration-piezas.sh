#!/bin/bash

echo "🔄 Ejecutando migración de piezas a productos..."

# Ejecutar el script de migración
echo "📋 Ejecutando script de migración..."
docker exec yaavs_app psql $DATABASE_URL -f /app/scripts/migrate-piezas-to-productos.sql

echo ""
echo "📋 Verificando resultados de la migración..."
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    'Productos totales' as tipo,
    COUNT(*) as cantidad
FROM productos
UNION ALL
SELECT 
    'Piezas reparación productos' as tipo,
    COUNT(*) as cantidad
FROM piezas_reparacion_productos;
"

echo ""
echo "📋 Verificando stock de productos migrados..."
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    p.id,
    p.nombre,
    p.sku,
    p.stock,
    m.nombre as marca,
    mo.nombre as modelo
FROM productos p
LEFT JOIN marcas m ON p.marca_id = m.id
LEFT JOIN modelos mo ON p.modelo_id = mo.id
WHERE p.sku LIKE 'PIEZA-%'
ORDER BY p.id;
"

echo ""
echo "✅ Migración completada."
echo "💡 Ahora el sistema de inventario para reparaciones usará la tabla productos."
echo "📱 Los descuentos se verán reflejados en /dashboard/inventario/stock" 