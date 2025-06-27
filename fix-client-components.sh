#!/bin/bash

echo "🔧 Agregando 'use client' a componentes que usan hooks..."

# Lista de hooks que requieren cliente
hooks=("useState" "useEffect" "useRouter" "useSearchParams" "usePathname" "useMemo" "useCallback" "useContext" "useReducer")

# Encontrar todos los archivos .tsx en src/app (excluyendo layout.tsx y page.tsx que pueden ser server)
find src/app -name "*.tsx" -type f | while read -r file; do
    echo "📝 Verificando: $file"
    
    # Verificar si ya tiene "use client"
    if grep -q "\"use client\"" "$file" || grep -q "'use client'" "$file"; then
        echo "   ✅ Ya tiene 'use client'"
        continue
    fi
    
    # Verificar si usa algún hook
    needs_client=false
    for hook in "${hooks[@]}"; do
        if grep -q "$hook" "$file"; then
            needs_client=true
            echo "   🔍 Encontrado: $hook"
            break
        fi
    done
    
    if [ "$needs_client" = true ]; then
        # Crear archivo temporal
        temp_file=$(mktemp)
        
        # Agregar "use client" al inicio del archivo
        echo "\"use client\";" > "$temp_file"
        echo "" >> "$temp_file"
        cat "$file" >> "$temp_file"
        
        # Reemplazar el archivo original
        mv "$temp_file" "$file"
        echo "   ✅ Agregado 'use client'"
    else
        echo "   ⚠️ No usa hooks del cliente"
    fi
done

echo "✅ Proceso completado" 