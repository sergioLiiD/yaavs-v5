#!/bin/bash

echo "🔍 Debuggeando estructura de productos..."

# Verificar la estructura de productos con sus relaciones
echo "📋 Productos con marcas y modelos:"
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    p.id,
    p.nombre,
    p.tipo,
    m.nombre as marca_nombre,
    mo.nombre as modelo_nombre
FROM productos p
LEFT JOIN marcas m ON p.marca_id = m.id
LEFT JOIN modelos mo ON p.modelo_id = mo.id
ORDER BY p.id
LIMIT 10;
"

echo ""
echo "📋 Verificando si hay productos sin marca o modelo:"
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    p.id,
    p.nombre,
    p.tipo,
    CASE WHEN p.marca_id IS NULL THEN 'SIN MARCA' ELSE 'CON MARCA' END as tiene_marca,
    CASE WHEN p.modelo_id IS NULL THEN 'SIN MODELO' ELSE 'CON MODELO' END as tiene_modelo
FROM productos p
WHERE p.marca_id IS NULL OR p.modelo_id IS NULL
ORDER BY p.id;
"

echo ""
echo "📋 Total de productos por tipo:"
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    tipo,
    COUNT(*) as total,
    COUNT(CASE WHEN marca_id IS NOT NULL THEN 1 END) as con_marca,
    COUNT(CASE WHEN modelo_id IS NOT NULL THEN 1 END) as con_modelo
FROM productos
GROUP BY tipo;
"

echo "✅ Debug completado. Revisa los logs del navegador para ver la estructura de datos." 