#!/bin/bash

echo "🚀 Reconstruyendo Docker en producción..."

# Detener el contenedor actual
echo "📦 Deteniendo contenedor actual..."
docker stop yaavs_app

# Eliminar el contenedor anterior
echo "🗑️ Eliminando contenedor anterior..."
docker rm yaavs_app

# Reconstruir la imagen
echo "🔨 Reconstruyendo imagen Docker..."
docker build -t yaavs_app .

# Ejecutar el nuevo contenedor
echo "▶️ Iniciando nuevo contenedor..."
docker run -d \
  --name yaavs_app \
  --network yaavs_network \
  -p 4001:3000 \
  -e DATABASE_URL="$DATABASE_URL" \
  -e NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
  -e NEXTAUTH_URL="$NEXTAUTH_URL" \
  -e GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" \
  -e GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET" \
  yaavs_app

# Verificar que el contenedor esté corriendo
echo "✅ Verificando estado del contenedor..."
docker ps | grep yaavs_app

echo ""
echo "🎉 Reconstrucción completada!"
echo "📱 La aplicación debería estar disponible en http://arregla.mx:4001"
echo ""
echo "📋 Para ver los logs: docker logs -f yaavs_app"
echo "🔍 Para debuggear proveedores: ./scripts/debug-proveedores.sh" 