# 🚀 Instalación Rápida - YAAVS v5

## ⚡ Instalación Automatizada (Recomendada)

### Opción 1: Script Automatizado

```bash
# Descargar el script de instalación
curl -fsSL https://raw.githubusercontent.com/sergioLiiD/yaavs-v5/main/scripts/install.sh -o install.sh

# Dar permisos de ejecución
chmod +x install.sh

# Ejecutar instalación automatizada
./install.sh
```

### Opción 2: Instalación Manual

```bash
# 1. Clonar repositorio
sudo git clone https://github.com/sergioLiiD/yaavs-v5.git /opt/yaavs-v5
sudo chown -R $USER:$USER /opt/yaavs-v5
cd /opt/yaavs-v5

# 2. Configurar variables de entorno
cp .env.example .env
nano .env

# 3. Configurar Docker Compose
cp docker-compose.example.yml docker-compose.yml
nano docker-compose.yml

# 4. Desplegar
docker-compose up -d --build
```

## 📋 Requisitos Previos

- **Sistema**: Ubuntu 20.04+ / Debian 11+
- **RAM**: 4GB mínimo, 8GB recomendado
- **Almacenamiento**: 50GB SSD mínimo
- **Docker**: Versión 20.10+
- **Docker Compose**: Versión 2.0+

## ⚙️ Configuración Rápida

### 1. Variables de Entorno (.env)

```env
# OBLIGATORIO: Cambiar estos valores
DATABASE_URL=postgresql://postgres:TU_PASSWORD@postgres:5432/yaavs_db?schema=public
NEXTAUTH_URL=https://TU_DOMINIO:PUERTO
NEXTAUTH_SECRET=TU_SECRET_MUY_SEGURO
JWT_SECRET=TU_JWT_SECRET

# OPCIONAL: Configurar si usas mapas
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=TU_API_KEY
```

### 2. Docker Compose (docker-compose.yml)

```yaml
# Cambiar estos valores obligatorios:
POSTGRES_PASSWORD: TU_PASSWORD_AQUI
NEXTAUTH_URL: https://TU_DOMINIO:PUERTO
ports:
  - "PUERTO_EXTERNO:4001"  # Cambiar puerto si es necesario
```

## 🔧 Comandos Útiles

```bash
# Ver estado de servicios
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f app

# Reiniciar servicios
docker-compose restart

# Actualizar aplicación
git pull && docker-compose up -d --build

# Backup de base de datos
docker exec yaavs_postgres pg_dump -U postgres yaavs_db > backup.sql

# Restaurar backup
docker exec -i yaavs_postgres psql -U postgres yaavs_db < backup.sql
```

## 🌐 Acceso a la Aplicación

- **URL**: http://localhost:4001
- **Base de datos**: localhost:5432
- **Usuario BD**: postgres
- **Contraseña**: La que configuraste en POSTGRES_PASSWORD

## 👤 Crear Usuario Administrador

Después de la instalación, necesitas crear un usuario administrador para acceder al sistema:

```bash
# Navegar al directorio del proyecto
cd /opt/yaavs-v5

# Crear usuario administrador (modo interactivo)
./scripts/create-admin-user.sh

# O modo rápido con valores por defecto
./scripts/create-admin-user.sh --quick
```

**El script te guiará para:**
- Ingresar información del administrador
- Crear contraseña segura (o generar automáticamente)
- Asignar rol de administrador
- Verificar la creación exitosa

**Ejemplo de uso:**
```bash
================================
Crear Usuario Administrador - YAAVS v5
================================
[INFO] Verificando conexión a la base de datos...
[INFO] Conexión a la base de datos exitosa

Ingresa la información del usuario administrador:

Email del administrador: admin@miempresa.com
Nombre: Juan
Apellido paterno: Pérez
Contraseña: ********

[INFO] Usuario creado exitosamente
✅ Usuario configurado exitosamente

Información del usuario:
- Email: admin@miempresa.com
- Contraseña: ********
- Rol: Administrador
```

## 🔒 Configuración de Seguridad

### 1. Cambiar Contraseñas por Defecto

```bash
# Generar contraseña segura
openssl rand -base64 32

# Editar docker-compose.yml y .env
nano docker-compose.yml
nano .env
```

### 2. Configurar SSL (Recomendado)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d TU_DOMINIO
```

### 3. Configurar Firewall

```bash
# Instalar UFW
sudo apt install ufw

# Configurar reglas básicas
sudo ufw allow ssh
sudo ufw allow 4001
sudo ufw enable
```

## 📊 Monitoreo

### Verificar Estado del Sistema

```bash
# Estado de contenedores
docker-compose ps

# Uso de recursos
docker stats

# Logs de errores
docker-compose logs --tail=100 app | grep ERROR
```

### Script de Monitoreo

```bash
#!/bin/bash
# Crear script de monitoreo
cat > /opt/yaavs/monitor.sh << 'EOF'
#!/bin/bash
echo "=== Estado de YAAVS v5 ==="
echo "Fecha: $(date)"
echo "Uptime: $(uptime)"
echo
echo "=== Contenedores ==="
docker-compose ps
echo
echo "=== Recursos ==="
docker stats --no-stream
echo
echo "=== Logs Recientes ==="
docker-compose logs --tail=20 app
EOF

chmod +x /opt/yaavs/monitor.sh
```

## 🆘 Solución de Problemas

### Problema: Contenedor no inicia

```bash
# Verificar logs
docker-compose logs app

# Verificar configuración
docker-compose config

# Reiniciar contenedor
docker-compose restart app
```

### Problema: Base de datos no conecta

```bash
# Verificar conexión
docker exec yaavs_app npx prisma db push

# Reiniciar base de datos
docker-compose restart postgres
```

### Problema: Migraciones fallan

```bash
# Ejecutar migraciones manualmente
docker-compose run --rm migrations

# Verificar estado
docker exec yaavs_app npx prisma migrate status
```

## 📚 Documentación Completa

Para información detallada, consulta:
- [Manual de Instalación Completo](MANUAL-INSTALACION.md)
- [Manual Técnico](manual-tecnico.md)

## 🆘 Soporte

- **Issues**: [GitHub Issues](https://github.com/sergioLiiD/yaavs-v5/issues)
- **Documentación**: [Wiki del Proyecto](https://github.com/sergioLiiD/yaavs-v5/wiki)
- **Contacto**: Sergio Velazco

---

**Versión**: 5.1  
**Última actualización**: Agosto 2025  
**Desarrollado por**: Sergio Velazco 