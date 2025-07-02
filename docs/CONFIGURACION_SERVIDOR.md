# Configuración del Servidor YAAVS v5

## Información del Servidor
- **IP del Servidor**: 187.189.131.119
- **Dominio**: arregla.mx
- **Puerto de Acceso**: 80 (HTTP)
- **Directorio de Instalación**: `/opt/yaavs-v5`

## Estructura de Archivos de Configuración

### 1. Variables de Entorno (.env)

**Ubicación**: `/opt/yaavs-v5/.env`

```bash
# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB.
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

# Configuración de base de datos
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/yaavs_db?schema=public"

# Configuración de NextAuth.js
NEXTAUTH_URL=https://arregla.mx:4001
NEXTAUTH_SECRET="VmORqdMzXGWIxScCjg0OpmWygm9XPHj/Ph+xHHTnrT0="

# Otras variables de entorno
NODE_ENV="production"

# Google API (hoommarketing@gmail.com)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAVFwtUyzGo7mS4HDHcxQ9gBeWAepsEDl0

# JWT Secret
JWT_SECRET=bpOv5tBdGrDP05n5FuY4dpKpHXtxzw8ZQtiSRKjg1b/2RSNhYive9rkexvDSrbv/yOXlbDB/RXMu26lpANfbZA==

# API URL
NEXT_PUBLIC_API_URL=https://arregla.mx:4001/api
```

### 2. Docker Compose (docker-compose.yml)

**Ubicación**: `/opt/yaavs-v5/docker-compose.yml`

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
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: yaavs_db
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/docker-entrypoint-initdb.d:ro
    ports:
      - "5432:5432"
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
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/yaavs_db?schema=public
      - NEXTAUTH_URL=https://arregla.mx:4001
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - JWT_SECRET=${JWT_SECRET}
      - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-https://arregla.mx:4001/api}
      - PORT=4001
      - NEXTAUTH_DEBUG=false
    ports:
      - "4001:4001"
    volumes:
      # Volumen para archivos de uploads si existen
      - uploads_data:/app/public/uploads
      # Volumen para logs
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
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/yaavs_db?schema=public
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

### 3. Configuración de Nginx

**Ubicación**: `/etc/nginx/sites-available/yaavs-v5`

```nginx
server {
    listen 80;
    server_name 187.189.131.119;
    
    # Configuración de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Configuración de compresión
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    
    # Configuración de logs
    access_log /var/log/nginx/yaavs-access.log;
    error_log /var/log/nginx/yaavs-error.log;
    
    # Configuración de archivos estáticos
    location /_next/static {
        alias /opt/yaavs-v5/.next/static;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, immutable";
    }
    
    location /public {
        alias /opt/yaavs-v5/public;
        expires 30d;
        access_log off;
    }
    
    # Configuración de la API
    location /api {
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Configuración principal de la aplicación
    location / {
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Configuración para archivos grandes
    client_max_body_size 100M;
    
    # Configuración de timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
```

**Enlace simbólico**: `/etc/nginx/sites-enabled/yaavs-v5`

## Comandos de Instalación y Configuración

### 0. Configuración Automática (Recomendado)

```bash
# Ejecutar script de configuración automática
chmod +x scripts/setup-server.sh
./scripts/setup-server.sh
```

### 1. Instalación de Dependencias del Sistema

```bash
# Actualizar el sistema
sudo apt update
sudo apt upgrade -y

# Instalar Docker y Docker Compose
sudo apt install docker.io docker-compose -y
sudo systemctl enable docker
sudo systemctl start docker

# Instalar Nginx
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx

# Instalar herramientas adicionales
sudo apt install net-tools curl -y
```

### 2. Configuración del Proyecto

```bash
# Navegar al directorio del proyecto
cd /opt/yaavs-v5

# Crear archivo .env con las variables de entorno
sudo nano .env
# (Copiar el contenido del archivo .env mostrado arriba)

# Verificar permisos
sudo chown -R $USER:$USER /opt/yaavs-v5
sudo chmod -R 755 /opt/yaavs-v5
```

### 3. Configuración de Nginx

```bash
# Crear configuración del sitio
sudo nano /etc/nginx/sites-available/yaavs-v5
# (Copiar el contenido de la configuración de Nginx mostrado arriba)

# Habilitar el sitio
sudo ln -s /etc/nginx/sites-available/yaavs-v5 /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

### 4. Despliegue con Docker

```bash
# Parar contenedores existentes
sudo docker-compose down

# Limpiar imágenes
sudo docker system prune -f

# Construir imágenes
sudo docker-compose build --no-cache

# Levantar servicios
sudo docker-compose up -d

# Verificar estado
sudo docker-compose ps
```

## Comandos de Mantenimiento

### Verificar Estado de los Servicios

```bash
# Estado de Docker
sudo docker-compose ps
sudo docker-compose logs app

# Estado de Nginx
sudo systemctl status nginx
sudo nginx -t

# Verificar puertos
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :4001
```

### Reiniciar Servicios

```bash
# Reiniciar Docker
sudo docker-compose restart

# Reiniciar Nginx
sudo systemctl restart nginx

# Reiniciar todo el sistema
sudo reboot
```

### Actualizar Aplicación

```bash
# Parar servicios
sudo docker-compose down

# Obtener cambios (si usas Git)
git pull origin main

# Reconstruir y levantar
sudo docker-compose build --no-cache
sudo docker-compose up -d

# Verificar logs
sudo docker-compose logs app
```

### Backup de Base de Datos

```bash
# Crear backup
sudo docker exec yaavs_postgres pg_dump -U postgres yaavs_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
sudo docker exec -i yaavs_postgres psql -U postgres yaavs_db < backup_file.sql
```

## Solución de Problemas Comunes

### Error 502 Bad Gateway
- Verificar que la aplicación Docker esté corriendo: `sudo docker-compose ps`
- Verificar logs de la aplicación: `sudo docker-compose logs app`
- Verificar que el puerto 4001 esté libre: `sudo netstat -tlnp | grep 4001`

### Error de Conexión a Base de Datos
- Verificar que PostgreSQL esté corriendo: `sudo docker-compose ps postgres`
- Verificar logs de PostgreSQL: `sudo docker-compose logs postgres`
- Verificar migraciones: `sudo docker-compose logs migrations`

### Error de Nginx
- Verificar configuración: `sudo nginx -t`
- Verificar logs de Nginx: `sudo tail -f /var/log/nginx/error.log`
- Verificar estado del servicio: `sudo systemctl status nginx`

### Problemas de Permisos
```bash
# Corregir permisos del directorio
sudo chown -R $USER:$USER /opt/yaavs-v5
sudo chmod -R 755 /opt/yaavs-v5

# Corregir permisos de Docker
sudo usermod -aG docker $USER
```

## Información de Acceso

- **URL de Acceso**: http://arregla.mx
- **Puerto de Aplicación**: 4001 (interno Docker)
- **Puerto de Acceso Público**: 80 (HTTP)
- **Base de Datos**: PostgreSQL en puerto 5432
- **Logs de Nginx**: `/var/log/nginx/yaavs-access.log` y `/var/log/nginx/yaavs-error.log`
- **Logs de Docker**: `sudo docker-compose logs [servicio]`

## Notas Importantes

1. **Variables de Entorno**: Asegúrate de que todas las variables en `.env` estén configuradas correctamente
2. **Puertos**: El puerto 4001 es interno de Docker, Nginx escucha en el puerto 80
3. **SSL/HTTPS**: Actualmente configurado para HTTP. Para HTTPS, necesitarás configurar certificados SSL
4. **Backups**: Realizar backups regulares de la base de datos
5. **Logs**: Monitorear logs regularmente para detectar problemas
6. **Git**: Los archivos de configuración del servidor están excluidos del repositorio Git para evitar conflictos

## Archivos Excluidos del Git

Los siguientes archivos NO se suben al repositorio Git para evitar conflictos entre entornos:

- `.env` - Variables de entorno específicas del servidor
- `docker-compose.yml` - Configuración de Docker específica del servidor
- `nginx.conf` - Configuración de Nginx específica del servidor

### Archivos de Ejemplo en Git

- `.env.example` - Ejemplo de variables de entorno
- `docker-compose.example.yml` - Ejemplo de configuración de Docker
- `scripts/setup-server.sh` - Script de configuración automática

## Contacto de Soporte

- **Desarrollador**: Sergio
- **Fecha de Configuración**: Julio 2025
- **Versión**: YAAVS v5 