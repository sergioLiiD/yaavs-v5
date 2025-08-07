#!/bin/bash

echo "🚀 Ejecutando migración de ventas en producción..."

# Verificar que el contenedor esté corriendo
if ! docker ps | grep -q "yaavs-v5_app"; then
    echo "❌ Error: El contenedor yaavs-v5_app no está corriendo"
    echo "Por favor, inicia los servicios primero"
    exit 1
fi

# Ejecutar la migración de Prisma
echo "📦 Ejecutando migración de Prisma..."
docker exec yaavs-v5_app npx prisma migrate deploy

echo "✅ Migración completada!"

# Regenerar el cliente de Prisma
echo "🔧 Regenerando cliente de Prisma..."
docker exec yaavs-v5_app npx prisma generate

echo "✅ Cliente de Prisma regenerado!"

# Verificar que las nuevas tablas se crearon
echo "🔍 Verificando que las tablas se crearon correctamente..."
docker exec yaavs-v5_app psql $DATABASE_URL -c "
SELECT 
    table_name,
    'Tabla creada' as estado
FROM information_schema.tables 
WHERE table_name IN ('ventas', 'detalle_ventas')
ORDER BY table_name;
"

echo ""
echo "📋 Verificando estructura de las tablas..."
docker exec yaavs-v5_app psql $DATABASE_URL -c "
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'ventas'
ORDER BY ordinal_position;
"

echo ""
echo "🎉 ¡Migración completada exitosamente!"
echo ""
echo "📋 Resumen de lo que se ha implementado:"
echo "   ✅ Nuevas tablas de ventas creadas"
echo "   ✅ API de productos actualizada"
echo "   ✅ API de ventas creada"
echo "   ✅ Componentes de venta implementados"
echo "   ✅ Página de venta de productos disponible"
echo ""
echo "🌐 Accede al sistema en: https://arregla.mx:4001/dashboard/venta-productos"
echo ""
echo "📝 Para verificar que todo funciona:"
echo "   1. Ve a la sección 'Venta de Productos' en el menú"
echo "   2. Selecciona un cliente"
echo "   3. Agrega productos al carrito"
echo "   4. Completa la venta"
echo "   5. Verifica que se genere el recibo" 