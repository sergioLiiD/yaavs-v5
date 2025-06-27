#!/bin/bash

# Script de Backup Completo YAAVS v5
# Fecha: $(date +"%Y-%m-%d %H:%M:%S")

# Configuración
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backup_completo_${TIMESTAMP}"
DB_NAME="yaavs_db"
DB_URL="postgresql://postgres:postgres@localhost:5432/yaavs_db"
PROJECT_ROOT="$(pwd)"

echo "🔄 Iniciando backup completo de YAAVS v5..."
echo "📅 Timestamp: ${TIMESTAMP}"
echo "📁 Directorio: ${BACKUP_DIR}"

# Crear directorio de backup
mkdir -p "${BACKUP_DIR}"

# 1. Backup del código fuente (excluyendo node_modules y .next)
echo "📦 Respaldando código fuente..."
rsync -av \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude 'backup_*' \
    --exclude '*.log' \
    "${PROJECT_ROOT}/" "${BACKUP_DIR}/codigo_fuente/"

# 2. Backup de archivos de configuración importantes
echo "⚙️ Respaldando configuraciones..."
mkdir -p "${BACKUP_DIR}/configuraciones"

# Variables de entorno (sin valores sensibles)
if [ -f ".env" ]; then
    echo "# Variables de entorno (estructura solamente)" > "${BACKUP_DIR}/configuraciones/env_structure.txt"
    grep -E '^[A-Z_]+=.*' .env | sed 's/=.*/=***VALOR_OCULTO***/' >> "${BACKUP_DIR}/configuraciones/env_structure.txt"
fi

if [ -f ".env.local" ]; then
    echo "# Variables de entorno locales (estructura solamente)" > "${BACKUP_DIR}/configuraciones/env_local_structure.txt"
    grep -E '^[A-Z_]+=.*' .env.local | sed 's/=.*/=***VALOR_OCULTO***/' >> "${BACKUP_DIR}/configuraciones/env_local_structure.txt"
fi

# Configuración de Prisma
cp -r prisma/ "${BACKUP_DIR}/configuraciones/" 2>/dev/null || echo "⚠️ No se encontró directorio prisma"

# Package.json y lockfiles
cp package.json "${BACKUP_DIR}/configuraciones/" 2>/dev/null
cp package-lock.json "${BACKUP_DIR}/configuraciones/" 2>/dev/null
cp yarn.lock "${BACKUP_DIR}/configuraciones/" 2>/dev/null
cp pnpm-lock.yaml "${BACKUP_DIR}/configuraciones/" 2>/dev/null

# 3. Backup de la base de datos
echo "🗄️ Respaldando base de datos..."
mkdir -p "${BACKUP_DIR}/base_datos"

# Intentar backup con diferentes métodos según lo que esté disponible
if command -v pg_dump &> /dev/null; then
    echo "   Usando pg_dump..."
    # Intenta con diferentes configuraciones comunes
    pg_dump "${DB_NAME}" > "${BACKUP_DIR}/base_datos/db_backup_${TIMESTAMP}.sql" 2>/dev/null || \
    pg_dump -h localhost -U postgres "${DB_NAME}" > "${BACKUP_DIR}/base_datos/db_backup_${TIMESTAMP}.sql" 2>/dev/null || \
    PGPASSWORD=postgres pg_dump -h localhost -U postgres "${DB_NAME}" > "${BACKUP_DIR}/base_datos/db_backup_${TIMESTAMP}.sql" 2>/dev/null || \
    echo "⚠️ No se pudo hacer backup con pg_dump automáticamente. Puedes ejecutar manualmente:"
    echo "     pg_dump -h localhost -U postgres ${DB_NAME} > backup_db_manual.sql"
else
    echo "⚠️ pg_dump no está disponible. Para backup manual de PostgreSQL:"
    echo "     pg_dump -h localhost -U postgres ${DB_NAME} > backup_db_manual.sql"
fi

# Backup usando Prisma si está disponible
if [ -f "prisma/schema.prisma" ] && command -v npx &> /dev/null; then
    echo "   Intentando backup con Prisma..."
    npx prisma db pull --force 2>/dev/null || echo "⚠️ No se pudo actualizar schema con Prisma"
fi

# 4. Backup de archivos de datos y uploads
echo "📄 Respaldando archivos de datos..."
mkdir -p "${BACKUP_DIR}/datos"

# Buscar directorios comunes de uploads
for dir in "public/uploads" "uploads" "storage" "files"; do
    if [ -d "$dir" ]; then
        cp -r "$dir" "${BACKUP_DIR}/datos/"
        echo "   ✅ Copiado: $dir"
    fi
done

# 5. Información del sistema
echo "🖥️ Recopilando información del sistema..."
mkdir -p "${BACKUP_DIR}/sistema"

# Información del proyecto
echo "# Información del Proyecto YAAVS v5" > "${BACKUP_DIR}/sistema/info_proyecto.txt"
echo "Fecha del backup: $(date)" >> "${BACKUP_DIR}/sistema/info_proyecto.txt"
echo "Usuario: $(whoami)" >> "${BACKUP_DIR}/sistema/info_proyecto.txt"
echo "Directorio: $(pwd)" >> "${BACKUP_DIR}/sistema/info_proyecto.txt"
echo "Sistema: $(uname -a)" >> "${BACKUP_DIR}/sistema/info_proyecto.txt"

# Versiones de herramientas
echo "" >> "${BACKUP_DIR}/sistema/info_proyecto.txt"
echo "## Versiones de Herramientas:" >> "${BACKUP_DIR}/sistema/info_proyecto.txt"
node --version &>> "${BACKUP_DIR}/sistema/info_proyecto.txt" || echo "Node.js: No instalado" >> "${BACKUP_DIR}/sistema/info_proyecto.txt"
npm --version &>> "${BACKUP_DIR}/sistema/info_proyecto.txt" || echo "npm: No instalado" >> "${BACKUP_DIR}/sistema/info_proyecto.txt"
echo "Git: $(git --version 2>/dev/null || echo 'No instalado')" >> "${BACKUP_DIR}/sistema/info_proyecto.txt"

# Estado de Git
if [ -d ".git" ]; then
    echo "" >> "${BACKUP_DIR}/sistema/info_proyecto.txt"
    echo "## Estado de Git:" >> "${BACKUP_DIR}/sistema/info_proyecto.txt"
    git status >> "${BACKUP_DIR}/sistema/info_proyecto.txt"
    echo "" >> "${BACKUP_DIR}/sistema/info_proyecto.txt"
    echo "## Último commit:" >> "${BACKUP_DIR}/sistema/info_proyecto.txt"
    git log -1 --oneline >> "${BACKUP_DIR}/sistema/info_proyecto.txt"
fi

# Lista de archivos del proyecto
find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.md" | head -100 > "${BACKUP_DIR}/sistema/estructura_archivos.txt"

# 6. Crear archivo comprimido
echo "📦 Comprimiendo backup..."
tar -czf "backup_completo_yaavs_v5_${TIMESTAMP}.tar.gz" "${BACKUP_DIR}"

# 7. Generar checksum para verificación
echo "🔐 Generando checksum..."
shasum -a 256 "backup_completo_yaavs_v5_${TIMESTAMP}.tar.gz" > "backup_completo_yaavs_v5_${TIMESTAMP}.sha256"

# 8. Resumen
echo ""
echo "✅ BACKUP COMPLETADO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 Directorio de backup: ${BACKUP_DIR}"
echo "📦 Archivo comprimido: backup_completo_yaavs_v5_${TIMESTAMP}.tar.gz"
echo "🔐 Checksum: backup_completo_yaavs_v5_${TIMESTAMP}.sha256"
echo "📊 Tamaño: $(du -h "backup_completo_yaavs_v5_${TIMESTAMP}.tar.gz" | cut -f1)"
echo ""
echo "📋 Contenido del backup:"
echo "   ├── codigo_fuente/     (Todo el código sin node_modules)"
echo "   ├── configuraciones/   (package.json, prisma, env structure)"
echo "   ├── base_datos/        (Dump SQL si está disponible)"
echo "   ├── datos/             (Archivos uploads si existen)"
echo "   └── sistema/           (Info del sistema y proyecto)"
echo ""
echo "🎯 Para restaurar:"
echo "   tar -xzf backup_completo_yaavs_v5_${TIMESTAMP}.tar.gz"
echo ""
echo "⚠️  IMPORTANTE: Guarda este backup en un lugar seguro antes de proceder con Docker" 