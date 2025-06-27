# 🚀 Guía de Despliegue - YAAVS v5

Esta guía te ayudará a desplegar la aplicación YAAVS v5 en el servidor Ubuntu del cliente.

## 📋 Requisitos Previos

- Acceso al servidor Ubuntu via NoMachine
- IP: 187.189.131.119:4000
- Usuario: administrador
- Contraseña: (proporcionada por WhatsApp)

## 🛠️ Pasos de Despliegue

### 1. Preparación del Proyecto

Antes de subir al servidor, asegúrate de tener todos los archivos necesarios:

```bash
# En tu máquina local, crear un archivo .env para producción
cp env.production.example .env.production
```

**IMPORTANTE**: Edita el archivo `.env.production` y cambia:
- `NEXTAUTH_SECRET` por una clave segura
- `DATABASE_URL` si es necesario
- Cualquier otra variable específica del entorno

### 2. Conexión al Servidor

1. Conéctate al servidor usando NoMachine
2. Abre una terminal
3. Ejecuta: `sudo su` para obtener permisos de root

### 3. Subir Archivos al Servidor

Tienes varias opciones:

#### Opción A: Usando SCP (desde tu máquina local)
```bash
# Comprimir el proyecto
tar -czf yaavs-v5.tar.gz --exclude=node_modules --exclude=.next --exclude=.git .

# Subir al servidor
scp yaavs-v5.tar.gz administrador@187.189.131.119:/tmp/
```

#### Opción B: Usando Git (recomendado)
```bash
# En el servidor, clonar el repositorio
cd /tmp
git clone <tu-repositorio-git>
```

### 4. Ejecutar Script de Despliegue Base

```bash
# En el servidor, ejecutar el script de despliegue
chmod +x deploy.sh
sudo ./deploy.sh
```

Este script instalará:
- Node.js 18.x
- PostgreSQL
- Nginx
- PM2
- Configurará la base de datos
- Creará el usuario de la aplicación

### 5. Configurar la Aplicación

```bash
# Copiar archivos de la aplicación
cp -r /tmp/yaavs-v5/* /opt/yaavs-v5/
chown -R yaavs:yaavs /opt/yaavs-v5

# Copiar archivo de variables de entorno
cp .env.production /opt/yaavs-v5/.env
chown yaavs:yaavs /opt/yaavs-v5/.env

# Ejecutar script de configuración
chmod +x setup-app.sh
sudo ./setup-app.sh
```

### 6. Verificar el Despliegue

```bash
# Verificar estado de PM2
pm2 status

# Verificar logs
pm2 logs yaavs-v5

# Verificar Nginx
systemctl status nginx

# Verificar PostgreSQL
systemctl status postgresql
```

## 🌐 Acceso a la Aplicación

Una vez completado el despliegue, la aplicación estará disponible en:
- **URL**: http://187.189.131.119
- **Puerto**: 80 (HTTP)

## 🔧 Comandos Útiles

### Gestión de la Aplicación
```bash
# Ver estado de la aplicación
pm2 status

# Ver logs en tiempo real
pm2 logs yaavs-v5

# Reiniciar aplicación
pm2 restart yaavs-v5

# Detener aplicación
pm2 stop yaavs-v5

# Iniciar aplicación
pm2 start yaavs-v5
```

### Gestión de la Base de Datos
```bash
# Hacer respaldo
sudo ./backup-db.sh

# Restaurar respaldo (si es necesario)
sudo -u postgres psql yaavs_db < backup_file.sql
```

### Actualización de la Aplicación
```bash
# Actualizar aplicación
sudo ./update-app.sh
```

### Gestión de Nginx
```bash
# Verificar configuración
nginx -t

# Reiniciar Nginx
systemctl restart nginx

# Ver logs de Nginx
tail -f /var/log/nginx/yaavs-access.log
tail -f /var/log/nginx/yaavs-error.log
```

## 🔒 Configuración de Seguridad

### Firewall
El script de despliegue configura automáticamente:
- Puerto 22 (SSH)
- Puerto 80 (HTTP)
- Puerto 443 (HTTPS) - si configuras SSL

### Base de Datos
- Usuario: `yaavs_user`
- Contraseña: `yaavs_password_2024`
- Base de datos: `yaavs_db`

**IMPORTANTE**: Cambia estas credenciales en producción.

## 📁 Estructura de Directorios

```
/opt/yaavs-v5/          # Directorio principal de la aplicación
├── .next/              # Archivos construidos de Next.js
├── backups/            # Respaldos de la base de datos
├── logs/               # Logs de la aplicación
├── node_modules/       # Dependencias
├── prisma/             # Configuración de Prisma
├── public/             # Archivos públicos
├── src/                # Código fuente
└── .env                # Variables de entorno
```

## 🚨 Solución de Problemas

### La aplicación no inicia
```bash
# Verificar logs
pm2 logs yaavs-v5

# Verificar variables de entorno
cat /opt/yaavs-v5/.env

# Verificar base de datos
sudo -u postgres psql -d yaavs_db -c "\dt"
```

### Error de conexión a la base de datos
```bash
# Verificar estado de PostgreSQL
systemctl status postgresql

# Verificar conexión
sudo -u postgres psql -d yaavs_db
```

### Error de Nginx
```bash
# Verificar configuración
nginx -t

# Ver logs
tail -f /var/log/nginx/error.log
```

## 📞 Soporte

Si encuentras problemas durante el despliegue:

1. Revisa los logs: `pm2 logs yaavs-v5`
2. Verifica la configuración de Nginx: `nginx -t`
3. Revisa el estado de los servicios: `systemctl status nginx postgresql`
4. Contacta al equipo de desarrollo

## 🔄 Actualizaciones Futuras

Para actualizar la aplicación en el futuro:

1. Sube los nuevos archivos al servidor
2. Ejecuta: `sudo ./update-app.sh`
3. Verifica que todo funcione correctamente

---

**¡Despliegue completado! 🎉**

La aplicación YAAVS v5 debería estar funcionando en http://187.189.131.119 