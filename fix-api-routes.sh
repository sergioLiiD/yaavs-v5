#!/bin/bash

echo "🔧 Agregando export const dynamic = 'force-dynamic' a todas las rutas API..."

# Encontrar todos los archivos route.ts en src/app/api
find src/app/api -name "route.ts" -type f | while read -r file; do
    echo "📝 Procesando: $file"
    
    # Verificar si ya tiene export const dynamic
    if grep -q "export const dynamic" "$file"; then
        echo "   ✅ Ya tiene dynamic configurado"
    else
        # Obtener la primera línea de import
        first_import=$(grep -n "^import" "$file" | head -1 | cut -d: -f1)
        
        if [ -n "$first_import" ]; then
            # Buscar el final de todos los imports
            last_import=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
            insert_line=$((last_import + 1))
            
            # Crear archivo temporal
            temp_file=$(mktemp)
            
            # Insertar la línea después del último import
            head -n "$last_import" "$file" > "$temp_file"
            echo "" >> "$temp_file"
            echo "export const dynamic = 'force-dynamic';" >> "$temp_file"
            tail -n +"$insert_line" "$file" >> "$temp_file"
            
            # Reemplazar el archivo original
            mv "$temp_file" "$file"
            echo "   ✅ Agregado dynamic = 'force-dynamic'"
        else
            echo "   ⚠️ No se encontraron imports en $file"
        fi
    fi
done

echo "✅ Proceso completado" 