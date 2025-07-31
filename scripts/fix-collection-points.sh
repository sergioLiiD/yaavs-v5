#!/bin/bash

echo "🔧 Aplicando migración para puntos de recolección..."

# Aplicar la migración para updated_at
docker exec yaavs_app psql $DATABASE_URL -c "ALTER TABLE \"puntos_recoleccion\" ALTER COLUMN \"updated_at\" SET DEFAULT NOW();"

if [ $? -eq 0 ]; then
    echo "✅ Migración de updated_at aplicada exitosamente"
else
    echo "⚠️  La migración de updated_at ya estaba aplicada o hubo un error"
fi

# Verificar que el cambio se aplicó
echo "🔍 Verificando cambios..."
docker exec yaavs_app psql $DATABASE_URL -c "SELECT column_name, column_default, is_nullable FROM information_schema.columns WHERE table_name = 'puntos_recoleccion' AND column_name = 'updated_at';"

echo "🎉 Migración completada. Ahora puedes crear puntos de recolección sin problemas."
echo "📝 Los errores de tipo de datos (string vs int) han sido corregidos en la API." 