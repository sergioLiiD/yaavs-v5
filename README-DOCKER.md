# 🐳 YAAVS v5 - Configuración Docker

## 📋 Requisitos Previos

- Docker Engine 20.0+
- Docker Compose 2.0+
- 4GB RAM mínimo
- 10GB espacio libre en disco

## 🚀 Inicio Rápido

### 1. Preparación

```bash
# Clonar/descargar el proyecto
cd yaavs-v5

# Ejecutar script de inicialización
./docker-init.sh
```

### 2. Configuración

Edita el archivo `.env` con tus configuraciones:

```env
# Base de datos
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/yaavs_db?schema=public

# Autenticación
NEXTAUTH_URL=http://localhost:3100
NEXTAUTH_SECRET=tu_secreto_aqui

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key
```

### 3. Ejecución

```bash
# Construir y ejecutar en background
docker-compose up --build -d

# Ver logs en tiempo real
docker-compose logs -f

# Verificar servicios
docker-compose ps
```

## 📚 Comandos Útiles

### Gestión de Servicios

```bash
# Iniciar servicios
docker-compose up -d

# Parar servicios
docker-compose down

# Reiniciar servicios
docker-compose restart

# Reconstruir después de cambios
docker-compose up --build -d
```

### Base de Datos

```bash
# Backup
docker-compose exec postgres pg_dump -U postgres yaavs_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose exec -T postgres psql -U postgres yaavs_db < backup_file.sql

# Conectar a PostgreSQL
docker-compose exec postgres psql -U postgres -d yaavs_db

# Ver logs de la BD
docker-compose logs postgres
```

### Aplicación

```bash
# Ver logs de la app
docker-compose logs app

# Ejecutar migraciones manualmente
docker-compose exec app npx prisma migrate deploy

# Regenerar Prisma Client
docker-compose exec app npx prisma generate

# Entrar al contenedor
docker-compose exec app sh
```

## 🔧 Solución de Problemas

### Error de Conexión a BD

```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps postgres

# Revisar logs de PostgreSQL
docker-compose logs postgres

# Reiniciar solo la BD
docker-compose restart postgres
```

### Error de Build

```bash
# Limpiar cache y reconstruir
docker-compose down
docker system prune -f
docker-compose up --build -d
```

### Problemas de Permisos

```bash
# En Linux/Mac, asegurar permisos correctos
sudo chown -R $USER:$USER .
chmod +x docker-init.sh
```

## 📁 Estructura de Volúmenes

```
/var/lib/docker/volumes/
├── yaavs-v5_postgres_data/     # Datos de PostgreSQL
├── yaavs-v5_uploads_data/      # Archivos subidos
└── ./logs/                     # Logs de la aplicación
```

## 🌐 URLs de Acceso

- **Aplicación:** http://localhost:3100
- **PostgreSQL:** localhost:5432
- **Health Check:** http://localhost:3100/api/health

## 🔄 Migración desde Instalación Local

### 1. Backup de Datos Existentes

```bash
# Si tienes datos locales
pg_dump -h localhost -U postgres yaavs_db > migration_backup.sql
```

### 2. Importar a Docker

```bash
# Iniciar contenedores
docker-compose up -d postgres

# Esperar que PostgreSQL esté listo
sleep 10

# Importar datos
docker-compose exec -T postgres psql -U postgres yaavs_db < migration_backup.sql
```

## 📊 Monitoreo

### Health Checks

```bash
# Verificar salud de servicios
docker-compose ps

# Health check manual de la app
curl http://localhost:3100/api/health

# Health check de PostgreSQL
docker-compose exec postgres pg_isready -U postgres
```

### Logs

```bash
# Todos los servicios
docker-compose logs

# Solo app
docker-compose logs app

# Solo BD
docker-compose logs postgres

# Seguir logs en tiempo real
docker-compose logs -f
```

## 🚀 Producción

### Variables de Entorno

Para producción, edita `.env`:

```env
NODE_ENV=production
NEXTAUTH_URL=https://tu-dominio.com
DATABASE_URL=postgresql://usuario:password@tu-servidor:5432/yaavs_db
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:3100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### SSL/HTTPS

```bash
# Con Let's Encrypt
sudo certbot --nginx -d tu-dominio.com
```

## 🔐 Seguridad

### Recomendaciones

1. **Cambiar credenciales por defecto**
2. **Usar secretos fuertes**
3. **Configurar firewall**
4. **Backups regulares**
5. **Monitoreo de logs**

### Firewall (Ubuntu)

```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw deny 3100  # Solo acceso local
sudo ufw deny 5432  # Solo acceso local
sudo ufw enable
```

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs`
2. Verifica el estado: `docker-compose ps`
3. Consulta esta documentación
4. Contacta al equipo de desarrollo 