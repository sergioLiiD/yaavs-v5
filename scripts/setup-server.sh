#!/bin/bash

# Script de configuración del servidor YAAVS v5
# Este script configura automáticamente el servidor con las configuraciones correctas

echo "🚀 Configurando servidor YAAVS v5..."

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# Crear archivo .env si no existe
if [ ! -f ".env" ]; then
    echo "📝 Creando archivo .env..."
    cp .env.example .env
    echo "✅ Archivo .env creado. Por favor, edita las variables de entorno según tu configuración."
else
    echo "✅ Archivo .env ya existe."
fi

# Crear docker-compose.yml si no existe
if [ ! -f "docker-compose.yml" ]; then
    echo "📝 Creando archivo docker-compose.yml..."
    cp docker-compose.example.yml docker-compose.yml
    echo "✅ Archivo docker-compose.yml creado. Por favor, edita la configuración según tu servidor."
else
    echo "✅ Archivo docker-compose.yml ya existe."
fi

# Crear directorio de logs si no existe
if [ ! -d "logs" ]; then
    echo "📁 Creando directorio de logs..."
    mkdir -p logs
    echo "✅ Directorio de logs creado."
fi

# Crear directorio de backups si no existe
if [ ! -d "backups" ]; then
    echo "📁 Creando directorio de backups..."
    mkdir -p backups
    echo "✅ Directorio de backups creado."
fi

# Verificar permisos
echo "🔧 Configurando permisos..."
sudo chown -R $USER:$USER .
sudo chmod -R 755 .

echo "✅ Configuración del servidor completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Edita el archivo .env con tus variables de entorno"
echo "2. Edita el archivo docker-compose.yml si es necesario"
echo "3. Ejecuta: sudo docker-compose up -d"
echo "4. Configura Nginx según la documentación"
echo ""
echo "📖 Consulta docs/CONFIGURACION_SERVIDOR.md para más detalles." 