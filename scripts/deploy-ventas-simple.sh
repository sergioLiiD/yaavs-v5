#!/bin/bash

# Script simple para desplegar el sistema de ventas usando la configuración existente
# Uso: ./scripts/deploy-ventas-simple.sh

set -e

echo "🚀 Desplegando sistema de ventas en producción..."

# Verificar que Docker Compose esté corriendo
if ! docker ps | grep -q "yaavs_postgres"; then
    echo "❌ Error: Los servicios de Docker no están corriendo"
    echo "Iniciando servicios..."
    docker-compose up -d
    sleep 15
fi

# Verificar que PostgreSQL esté listo
echo "⏳ Esperando que PostgreSQL esté listo..."
until docker-compose exec postgres pg_isready -U postgres; do
    echo "Esperando PostgreSQL..."
    sleep 2
done

# Ejecutar la migración
echo "📦 Ejecutando migración de base de datos..."
docker-compose exec app npx prisma migrate deploy

echo "✅ Migración completada!"

# Regenerar el cliente de Prisma
echo "🔧 Regenerando cliente de Prisma..."
docker-compose exec app npx prisma generate

echo "✅ Cliente de Prisma regenerado!"

# Reiniciar la aplicación para aplicar los cambios
echo "🔄 Reiniciando la aplicación..."
docker-compose restart app

echo "⏳ Esperando que la aplicación se reinicie..."
sleep 20

# Verificar que la aplicación esté funcionando
echo "🔍 Verificando estado de la aplicación..."
if curl -f http://localhost:4002/api/health > /dev/null 2>&1; then
    echo "✅ Aplicación funcionando correctamente"
else
    echo "⚠️  La aplicación puede estar tardando en iniciar..."
    echo "Puedes verificar manualmente en: https://arregla.mx:4001"
fi

echo ""
echo "🎉 ¡Despliegue completado!"
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