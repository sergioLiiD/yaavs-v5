#!/bin/bash

echo "🔧 Aplicando migración para puntos de recolección..."

# Ejecutar la migración dentro del contenedor
docker exec yaavs_app bash -c "
echo 'Conectando a la base de datos...'
psql \$DATABASE_URL -c \"ALTER TABLE \\\"puntos_recoleccion\\\" ALTER COLUMN \\\"updated_at\\\" SET DEFAULT NOW();\"

if [ \$? -eq 0 ]; then
    echo '✅ Migración aplicada exitosamente'
    
    echo '🔍 Verificando cambios...'
    psql \$DATABASE_URL -c \"SELECT column_name, column_default, is_nullable FROM information_schema.columns WHERE table_name = 'puntos_recoleccion' AND column_name = 'updated_at';\"
else
    echo '❌ Error al aplicar la migración'
    exit 1
fi
"

echo "🎉 Migración completada. Ahora puedes crear puntos de recolección sin problemas." 