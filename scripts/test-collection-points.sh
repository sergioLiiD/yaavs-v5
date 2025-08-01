#!/bin/bash

echo "🧪 Probando funcionalidad de puntos de recolección..."

# Verificar que la migración se aplicó correctamente
echo "📋 Verificando migración de updated_at..."
docker exec yaavs_app psql $DATABASE_URL -c "SELECT column_name, column_default, is_nullable FROM information_schema.columns WHERE table_name = 'puntos_recoleccion' AND column_name = 'updated_at';"

# Verificar que hay puntos de recolección en la base de datos
echo "📋 Verificando puntos de recolección existentes..."
docker exec yaavs_app psql $DATABASE_URL -c "SELECT id, nombre, is_headquarters, parent_id FROM puntos_recoleccion ORDER BY id;"

# Verificar las relaciones padre-hijo
echo "📋 Verificando relaciones padre-hijo..."
docker exec yaavs_app psql $DATABASE_URL -c "
SELECT 
    p1.id as punto_id,
    p1.nombre as punto_nombre,
    p1.is_headquarters,
    p2.id as parent_id,
    p2.nombre as parent_nombre
FROM puntos_recoleccion p1
LEFT JOIN puntos_recoleccion p2 ON p1.parent_id = p2.id
ORDER BY p1.id;
"

echo "✅ Pruebas completadas. Revisa los logs del navegador para ver los datos del parent." 