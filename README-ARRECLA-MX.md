# 📦 Archivo arregla.mx - YAAVS v5

## 📋 Descripción

El archivo `arregla.mx.tar.gz` contiene **TODO** el código fuente y configuración necesaria para instalar y ejecutar el sistema YAAVS v5 en un servidor nuevo.

## 📁 Contenido del Archivo

### 🏗️ **Código Fuente Completo**
- **Frontend**: Next.js con TypeScript y React
- **Backend**: API Routes con Prisma ORM
- **Base de Datos**: Esquema PostgreSQL completo
- **Componentes**: UI components con Tailwind CSS
- **Servicios**: Lógica de negocio y APIs

### 🐳 **Configuración Docker**
- `Dockerfile` - Imagen de la aplicación
- `docker-compose.yml` - Orquestación de servicios
- `docker-compose.example.yml` - Configuración de ejemplo
- `docker-init.sh` - Script de inicialización

### 🗄️ **Base de Datos**
- `prisma/schema.prisma` - Esquema completo
- `prisma/migrations/` - Todas las migraciones
- `prisma/seed.ts` - Datos iniciales
- Scripts de configuración y verificación

### 📚 **Documentación Completa**
- `MANUAL-INSTALACION.md` - Guía de instalación detallada
- `README-INSTALACION.md` - Guía rápida
- `manual-tecnico.md` - Manual técnico
- `docs/` - Documentación adicional

### 🔧 **Scripts de Automatización**
- `scripts/install.sh` - Instalación automática
- `scripts/create-admin-user.sh` - Creación de usuarios administradores
- Scripts de backup, migración y mantenimiento

### ⚙️ **Configuración del Proyecto**
- `package.json` - Dependencias y scripts
- `tsconfig.json` - Configuración TypeScript
- `tailwind.config.js` - Configuración CSS
- Archivos de configuración de entorno

## 🚀 Instalación Rápida

### 1. **Extraer el Archivo**
```bash
# Crear directorio para el proyecto
mkdir yaavs-v5
cd yaavs-v5

# Extraer el archivo
tar -xzf arregla.mx.tar.gz
```

### 2. **Instalación Automática (Recomendado)**
```bash
# Dar permisos de ejecución
chmod +x scripts/install.sh

# Ejecutar instalación automática
./scripts/install.sh
```

### 3. **Instalación Manual**
```bash
# 1. Instalar Docker y Docker Compose
# 2. Configurar variables de entorno
cp docker-compose.example.yml docker-compose.yml
# Editar docker-compose.yml con tus configuraciones

# 3. Iniciar servicios
docker-compose up -d

# 4. Crear usuario administrador
./scripts/create-admin-user.sh
```

## 📋 Requisitos del Sistema

### **Mínimos**
- **Sistema Operativo**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM**: 2GB mínimo, 4GB recomendado
- **Almacenamiento**: 10GB espacio libre
- **CPU**: 2 cores mínimo

### **Software Requerido**
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Git**: Para clonar repositorios (opcional)

## 🔧 Configuración

### **Variables de Entorno Principales**
```bash
# Base de datos
POSTGRES_PASSWORD=tu_password_seguro
POSTGRES_DB=yaavs_db

# Aplicación
NEXTAUTH_SECRET=tu_secret_generado
NEXTAUTH_URL=http://tu-dominio:4001

# Base de datos
DATABASE_URL=postgresql://postgres:tu_password_seguro@yaavs_postgres:5432/yaavs_db
```

### **Puertos Utilizados**
- **4001**: Aplicación web (Next.js)
- **5432**: Base de datos (PostgreSQL)

## 🎯 Funcionalidades Incluidas

### **Sistema de Gestión**
- ✅ Gestión de tickets de reparación
- ✅ Sistema de inventario unificado
- ✅ Gestión de clientes
- ✅ Puntos de recolección
- ✅ Sistema de presupuestos
- ✅ Gestión de usuarios y roles

### **Características Técnicas**
- ✅ Autenticación JWT
- ✅ API REST completa
- ✅ Base de datos PostgreSQL
- ✅ Interfaz responsive
- ✅ Sistema de permisos
- ✅ Backup automático

## 📖 Documentación Incluida

### **Manuales Principales**
1. **`MANUAL-INSTALACION.md`** - Guía completa de instalación
2. **`README-INSTALACION.md`** - Guía rápida
3. **`manual-tecnico.md`** - Manual técnico del sistema

### **Documentación Adicional**
- `docs/CONFIGURACION_SERVIDOR.md` - Configuración de servidor
- `docs/ErroresComunes.md` - Solución de problemas
- `docs/ESTANDARIZACION.md` - Estándares del proyecto

## 🔒 Seguridad

### **Características de Seguridad**
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Autenticación JWT segura
- ✅ Validación de entrada
- ✅ Protección CSRF
- ✅ Headers de seguridad

### **Recomendaciones**
1. **Cambiar contraseñas por defecto**
2. **Configurar SSL/TLS en producción**
3. **Usar firewall para proteger puertos**
4. **Hacer backups regulares**

## 🛠️ Mantenimiento

### **Comandos Útiles**
```bash
# Verificar estado de servicios
docker-compose ps

# Ver logs de la aplicación
docker-compose logs yaavs_app

# Hacer backup de la base de datos
docker exec yaavs_postgres pg_dump -U postgres yaavs_db > backup.sql

# Restaurar backup
docker exec -i yaavs_postgres psql -U postgres yaavs_db < backup.sql

# Actualizar aplicación
git pull
docker-compose down
docker-compose up -d --build
```

### **Scripts de Mantenimiento**
- `scripts/backup-db.sh` - Backup de base de datos
- `scripts/check-data.ts` - Verificación de datos
- `scripts/update-admin.ts` - Actualización de administradores

## 🆘 Soporte

### **Recursos de Ayuda**
1. **Manual Técnico**: `manual-tecnico.md`
2. **Errores Comunes**: `docs/ErroresComunes.md`
3. **Configuración**: `docs/CONFIGURACION_SERVIDOR.md`

### **Contacto**
- **Desarrollador**: Sergio Velazco
- **Versión**: 5.1
- **Última actualización**: Agosto 2025

## 📝 Notas Importantes

### **Antes de Instalar**
1. **Verificar requisitos del sistema**
2. **Tener Docker instalado**
3. **Preparar contraseñas seguras**
4. **Configurar dominio/IP**

### **Después de Instalar**
1. **Crear usuario administrador**
2. **Configurar SSL (producción)**
3. **Hacer backup inicial**
4. **Probar todas las funcionalidades**

---

**🎉 ¡El archivo arregla.mx contiene todo lo necesario para una instalación completa y funcional del sistema YAAVS v5!** 