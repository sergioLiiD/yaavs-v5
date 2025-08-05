# Manual de Instalación - Sistema YAAVS v5

**Versión**: 5.1  
**Fecha**: Agosto 2025  
**Desarrollado por**: Sergio Velazco

## Índice
1. [Requisitos del Sistema](#requisitos-del-sistema)
2. [Preparación del Servidor](#preparación-del-servidor)
3. [Instalación de Docker](#instalación-de-docker)
4. [Configuración del Proyecto](#configuración-del-proyecto)
5. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
6. [Configuración de Docker](#configuración-de-docker)
7. [Despliegue](#despliegue)
8. [Verificación de la Instalación](#verificación-de-la-instalación)
9. [Configuración de SSL (Opcional)](#configuración-de-ssl-opcional)
10. [Mantenimiento](#mantenimiento)
11. [Solución de Problemas](#solución-de-problemas)

## Requisitos del Sistema

### Requisitos Mínimos
- **Sistema Operativo**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM**: 4GB mínimo, 8GB recomendado
- **CPU**: 2 cores mínimo, 4 cores recomendado
- **Almacenamiento**: 50GB SSD mínimo
- **Red**: Conexión estable a internet

### Requisitos de Software
- **Docker**: Versión 20.10+
- **Docker Compose**: Versión 2.0+
- **Git**: Para clonar el repositorio
- **Nginx** (opcional): Para proxy reverso

## Preparación del Servidor

### 1. Actualizar el Sistema

```bash
# Actualizar lista de paquetes
sudo apt update && sudo apt upgrade -y

# Instalar paquetes básicos
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
```

### 2. Configurar Zona Horaria

```bash
# Configurar zona horaria (ejemplo para México)
sudo timedatectl set-timezone America/Mexico_City

# Verificar configuración
timedatectl status
```

### 3. Crear Usuario para la Aplicación (Opcional pero Recomendado)

```bash
# Crear usuario para la aplicación
sudo adduser yaavs
sudo usermod -aG sudo yaavs

# Cambiar al usuario
su - yaavs
```

## Instalación de Docker

### 1. Instalar Docker

```bash
# Agregar repositorio oficial de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Actualizar e instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verificar instalación
sudo docker --version
sudo docker compose version
```

### 2. Configurar Docker

```bash
# Agregar usuario actual al grupo docker
sudo usermod -aG docker $USER

# Habilitar Docker en el arranque
sudo systemctl enable docker
sudo systemctl start docker

# Verificar que Docker funciona
sudo docker run hello-world
```

### 3. Instalar Docker Compose (si no está incluido)

```bash
# Descargar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Dar permisos de ejecución
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker-compose --version
```

## Configuración del Proyecto

### 1. Clonar el Repositorio

```bash
# Navegar al directorio donde se instalará la aplicación
cd /opt

# Clonar el repositorio
sudo git clone https://github.com/sergioLiiD/yaavs-v5.git
sudo chown -R $USER:$USER yaavs-v5
cd yaavs-v5
```

### 2. Verificar Estructura del Proyecto

```bash
# Verificar que todos los archivos necesarios estén presentes
ls -la

# Verificar archivos de Docker
ls -la Dockerfile docker-compose.yml
```

## Configuración de Variables de Entorno

### 1. Crear Archivo de Variables de Entorno

```bash
# Crear archivo .env
cp .env.example .env
nano .env
```

### 2. Configurar Variables de Entorno

**IMPORTANTE**: Reemplaza los valores con tu configuración específica.

```env
# ===========================================
# CONFIGURACIÓN DE BASE DE DATOS
# ===========================================
DATABASE_URL=postgresql://postgres:TU_PASSWORD_AQUI@postgres:5432/yaavs_db?schema=public

# ===========================================
# CONFIGURACIÓN DE AUTENTICACIÓN
# ===========================================
NEXTAUTH_SECRET=TU_SECRET_MUY_SEGURO_AQUI_MINIMO_32_CARACTERES
NEXTAUTH_URL=https://TU_DOMINIO:PUERTO
JWT_SECRET=TU_JWT_SECRET_AQUI_MINIMO_32_CARACTERES

# ===========================================
# CONFIGURACIÓN DE LA APLICACIÓN
# ===========================================
NODE_ENV=production
PORT=4001
NEXTAUTH_DEBUG=false

# ===========================================
# CONFIGURACIÓN DE API Y URLs
# ===========================================
NEXT_PUBLIC_API_URL=https://TU_DOMINIO:PUERTO/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=TU_API_KEY_DE_GOOGLE_MAPS

# ===========================================
# CONFIGURACIÓN DE CORREO (OPCIONAL)
# ===========================================
# EMAIL_SERVER_HOST=smtp.gmail.com
# EMAIL_SERVER_PORT=587
# EMAIL_SERVER_USER=tu_email@gmail.com
# EMAIL_SERVER_PASSWORD=tu_password_de_aplicacion
```

### 3. Generar Secrets Seguros

```bash
# Generar NEXTAUTH_SECRET
openssl rand -base64 32

# Generar JWT_SECRET
openssl rand -base64 32
```

## Configuración de Docker

### 1. Personalizar Docker Compose

Editar el archivo `docker-compose.yml` para tu configuración específica:

```bash
nano docker-compose.yml
```

**Configuración Recomendada**:

```yaml
version: '3.8'

services:
  # Base de datos PostgreSQL
  postgres:
    image: postgres:14-alpine
    container_name: yaavs_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: TU_PASSWORD_AQUI  # Cambiar esto
      POSTGRES_DB: yaavs_db
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/docker-entrypoint-initdb.d:ro
    ports:
      - "5432:5432"  # Cambiar puerto si es necesario
    networks:
      - yaavs_network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d yaavs_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Aplicación Next.js
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: yaavs_app
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:TU_PASSWORD_AQUI@postgres:5432/yaavs_db?schema=public
      - NEXTAUTH_URL=https://TU_DOMINIO:PUERTO
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - JWT_SECRET=${JWT_SECRET}
      - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-https://TU_DOMINIO:PUERTO/api}
      - PORT=4001
      - NEXTAUTH_DEBUG=false
    ports:
      - "4001:4001"  # Cambiar puerto externo si es necesario
    volumes:
      - uploads_data:/app/public/uploads
      - ./logs:/app/logs
    networks:
      - yaavs_network
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:4001/api/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Servicio de migración de base de datos
  migrations:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: yaavs_migrations
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - DATABASE_URL=postgresql://postgres:TU_PASSWORD_AQUI@postgres:5432/yaavs_db?schema=public
    command: sh -c "npx prisma migrate deploy && npx prisma db seed"
    volumes:
      - ./prisma:/app/prisma
    networks:
      - yaavs_network
    restart: "no"

volumes:
  postgres_data:
    driver: local
  uploads_data:
    driver: local

networks:
  yaavs_network:
    driver: bridge
```

### 2. Verificar Dockerfile

El `Dockerfile` ya está configurado correctamente, pero puedes verificar su contenido:

```bash
cat Dockerfile
```

## Despliegue

### 1. Construir y Levantar los Servicios

```bash
# Construir las imágenes
docker-compose build

# Levantar los servicios en segundo plano
docker-compose up -d

# Verificar el estado de los servicios
docker-compose ps
```

### 2. Verificar Logs

```bash
# Ver logs de todos los servicios
docker-compose logs

# Ver logs de la aplicación en tiempo real
docker-compose logs -f app

# Ver logs de la base de datos
docker-compose logs -f postgres
```

### 3. Ejecutar Migraciones

```bash
# Ejecutar migraciones manualmente si es necesario
docker-compose run --rm migrations
```

## Verificación de la Instalación

### 1. Verificar Servicios

```bash
# Verificar que todos los contenedores estén corriendo
docker-compose ps

# Verificar recursos utilizados
docker stats
```

### 2. Verificar Base de Datos

```bash
# Conectar a la base de datos
docker exec -it yaavs_postgres psql -U postgres -d yaavs_db

# Verificar tablas
\dt

# Salir de PostgreSQL
\q
```

### 3. Verificar Aplicación

```bash
# Verificar que la aplicación responda
curl -f http://localhost:4001/api/health

# Verificar endpoint de salud
curl -f http://localhost:4001/api/health
```

### 4. Verificar Puertos

```bash
# Verificar puertos en uso
sudo netstat -tlnp | grep -E "(4001|5432)"

# O usar ss
sudo ss -tlnp | grep -E "(4001|5432)"
```

## Creación de Usuario Administrador

### 1. Script Automatizado (Recomendado)

Después de la instalación, necesitas crear un usuario administrador para acceder al sistema:

```bash
# Navegar al directorio del proyecto
cd /opt/yaavs-v5

# Ejecutar script de creación de usuario administrador
./scripts/create-admin-user.sh
```

**Opciones del Script**:
```bash
# Modo interactivo (recomendado)
./scripts/create-admin-user.sh

# Modo rápido con valores por defecto
./scripts/create-admin-user.sh --quick

# Mostrar ayuda
./scripts/create-admin-user.sh --help
```

### 2. Proceso Interactivo

El script te guiará a través del proceso:

1. **Verificación del Entorno**: El script verifica que Docker y los servicios estén corriendo
2. **Información del Usuario**: Solicita datos del administrador:
   - Email (validado)
   - Nombre
   - Apellido paterno
   - Apellido materno (opcional)
   - Teléfono (opcional)
   - Contraseña (o genera una automáticamente)
3. **Creación en Base de Datos**: Crea el usuario con hash seguro de contraseña
4. **Asignación de Roles**: Asigna automáticamente el rol de administrador
5. **Confirmación**: Muestra la información del usuario creado

### 3. Ejemplo de Ejecución

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
Apellido materno (opcional): 
Teléfono (opcional): 5551234567

[WARNING] La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.
Contraseña: ********
Confirmar contraseña: ********

[INFO] Verificando si el usuario ya existe...
[INFO] Creando nuevo usuario administrador...
[INFO] Generando hash de la contraseña...
[INFO] Creando usuario en la base de datos.
[INFO] Usuario creado exitosamente en la base de datos.
[INFO] Configurando rol de administrador...
[INFO] Asignando rol de administrador al usuario...
[INFO] Rol de administrador asignado exitosamente.

================================
Usuario Administrador Creado/Actualizado
================================
✅ Usuario configurado exitosamente

Información del usuario:
- Email: admin@miempresa.com
- Contraseña: ********
- Rol: Administrador
- Estado: Activo

Puedes acceder al sistema con estas credenciales.

[WARNING] IMPORTANTE: Guarda la contraseña en un lugar seguro.
[WARNING] Se recomienda cambiar la contraseña después del primer acceso.
```

### 4. Acceso al Sistema

Una vez creado el usuario administrador:

1. **Abrir navegador** y ir a: `http://localhost:4001`
2. **Iniciar sesión** con las credenciales creadas
3. **Cambiar contraseña** después del primer acceso (recomendado)

### 5. Verificación de Usuarios

```bash
# Verificar usuarios existentes
docker exec yaavs_postgres psql -U postgres -d yaavs_db -c "SELECT id, email, nombre, activo FROM usuarios;"

# Verificar roles asignados
docker exec yaavs_postgres psql -U postgres -d yaavs_db -c "SELECT u.email, r.nombre as rol FROM usuarios u JOIN usuarios_roles ur ON u.id = ur.usuario_id JOIN roles r ON ur.rol_id = r.id;"
```

## Configuración de SSL (Opcional)

### 1. Instalar Certbot

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d TU_DOMINIO

# Configurar renovación automática
sudo crontab -e
# Agregar línea: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Configurar Nginx (Opcional)

```bash
# Instalar Nginx
sudo apt install -y nginx

# Crear configuración
sudo nano /etc/nginx/sites-available/yaavs
```

**Configuración de Nginx**:

```nginx
server {
    listen 80;
    server_name TU_DOMINIO;
    
    location / {
        proxy_pass http://127.0.0.1:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/yaavs /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

## Mantenimiento

### Comandos de Mantenimiento

```bash
# Verificar estado de servicios
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f app

# Reiniciar servicios
docker-compose restart

# Actualizar aplicación
git pull
docker-compose down
docker-compose up -d --build --force-recreate

# Backup de base de datos
docker exec yaavs_postgres pg_dump -U postgres yaavs_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker exec -i yaavs_postgres psql -U postgres yaavs_db < backup_file.sql

# Limpiar recursos Docker
docker system prune -f
docker volume prune -f
```

### Script de Backup Automático

```bash
# Crear script de backup
sudo nano /opt/yaavs/backup.sh
```

**Contenido del script**:

```bash
#!/bin/bash
BACKUP_DIR="/opt/yaavs/backups"
DATE=$(date +%Y%m%d_%H%M%S)
cd /opt/yaavs

# Crear backup de base de datos
docker exec yaavs_postgres pg_dump -U postgres yaavs_db > $BACKUP_DIR/db_backup_$DATE.sql

# Crear backup de archivos
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz public/uploads logs

# Eliminar backups antiguos (más de 7 días)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completado: $DATE"
```

```bash
# Dar permisos de ejecución
chmod +x /opt/yaavs/backup.sh

# Configurar backup automático
sudo crontab -e
# Agregar línea: 0 2 * * * /opt/yaavs/backup.sh
```

## Solución de Problemas

### Problemas Comunes

#### 1. Contenedor no inicia
```bash
# Verificar logs
docker-compose logs app

# Verificar variables de entorno
docker-compose config

# Reiniciar contenedor
docker-compose restart app
```

#### 2. Base de datos no conecta
```bash
# Verificar conexión a base de datos
docker exec yaavs_app npx prisma db push

# Verificar variables de entorno
echo $DATABASE_URL

# Reiniciar base de datos
docker-compose restart postgres
```

#### 3. Migraciones fallan
```bash
# Ejecutar migraciones manualmente
docker-compose run --rm migrations

# Verificar estado de migraciones
docker exec yaavs_app npx prisma migrate status
```

#### 4. Memoria insuficiente
```bash
# Verificar uso de memoria
docker stats

# Limpiar recursos Docker
docker system prune -f
docker volume prune -f

# Reiniciar Docker
sudo systemctl restart docker
```

### Logs de Debug

```bash
# Ver logs de la aplicación
docker-compose logs -f app

# Ver logs de la base de datos
docker-compose logs -f postgres

# Ver logs de migraciones
docker-compose logs migrations
```

### Verificación de Red

```bash
# Verificar conectividad entre contenedores
docker exec yaavs_app ping postgres

# Verificar puertos
sudo netstat -tlnp | grep docker
```

### Comandos de Emergencia

```bash
# Detener todos los servicios
docker-compose down

# Eliminar volúmenes (CUIDADO: esto elimina datos)
docker-compose down -v

# Reconstruir desde cero
docker-compose down
docker system prune -f
docker-compose up -d --build --force-recreate
```

---

**Notas Importantes**:

1. **Seguridad**: Cambia todas las contraseñas por defecto
2. **Backups**: Configura backups automáticos
3. **Monitoreo**: Configura alertas de sistema
4. **Actualizaciones**: Mantén el sistema actualizado
5. **Documentación**: Mantén registro de cambios

**Soporte**: Para soporte técnico, contacta al desarrollador.

---

**Versión del Manual**: 1.0  
**Última actualización**: Agosto 2025  
**Desarrollado por**: Sergio Velazco 