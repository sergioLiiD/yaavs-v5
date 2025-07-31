#!/bin/bash

echo "🔧 Aplicando migración para puntos de recolección..."

# Conectar a la base de datos PostgreSQL y ejecutar la migración
docker exec yaavs_app psql $DATABASE_URL -c "ALTER TABLE \"puntos_recoleccion\" ALTER COLUMN \"updated_at\" SET DEFAULT NOW();"

if [ $? -eq 0 ]; then
    echo "✅ Migración aplicada exitosamente"
    
    # Verificar que el cambio se aplicó
    echo "🔍 Verificando cambios..."
    docker exec yaavs_app psql $DATABASE_URL -c "SELECT column_name, column_default, is_nullable FROM information_schema.columns WHERE table_name = 'puntos_recoleccion' AND column_name = 'updated_at';"
else
    echo "❌ Error al aplicar la migración"
    exit 1
fi

echo "🎉 Migración completada. Ahora puedes crear puntos de recolección sin problemas." 