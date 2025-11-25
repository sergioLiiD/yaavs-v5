# 📋 Instrucciones para Backup de Base de Datos

## ⚠️ IMPORTANTE: Backup Antes de Migración

Antes de hacer cualquier cambio en la base de datos, es **CRÍTICO** hacer un backup completo.

---

## 📝 Paso 1: Verificar Estado de Docker

Ejecuta primero el script de verificación:

```bash
./verificar-docker.sh
```

Este script verifica:
- ✅ Que Docker esté instalado
- ✅ Que el contenedor `yaavs_postgres` esté corriendo
- ✅ Que PostgreSQL esté respondiendo
- ✅ Que el directorio de backups exista

**Si algo falla, NO continúes hasta solucionarlo.**

---

## 💾 Paso 2: Crear Backup Completo

Una vez que todo esté verificado, ejecuta el backup:

```bash
./backup-db-docker.sh
```

Este script:
1. ✅ Verifica que el contenedor esté corriendo
2. ✅ Verifica que PostgreSQL esté listo
3. ✅ Crea el backup completo de la BD
4. ✅ Verifica la integridad del backup
5. ✅ Comprime el archivo
6. ✅ Muestra información del backup creado

**El backup se guardará en:** `./backups/yaavs_backup_pre_migracion_YYYYMMDD_HHMMSS.sql.gz`

---

## ✅ Paso 3: Verificar el Backup

Después de crear el backup, verifica que:

1. **El archivo existe:**
   ```bash
   ls -lh ./backups/yaavs_backup_pre_migracion_*.sql.gz
   ```

2. **El archivo no está vacío:**
   ```bash
   # Debe mostrar un tamaño mayor a 0
   du -h ./backups/yaavs_backup_pre_migracion_*.sql.gz
   ```

3. **El backup contiene datos:**
   ```bash
   # Descomprimir temporalmente para verificar
   gunzip -c ./backups/yaavs_backup_pre_migracion_*.sql.gz | head -20
   ```
   
   Deberías ver algo como:
   ```
   --
   -- PostgreSQL database dump
   --
   SET statement_timeout = 0;
   ...
   ```

---

## 🔄 Paso 4: (Opcional) Probar Restauración

**⚠️ SOLO HAZ ESTO EN UN CONTENEDOR DE PRUEBA, NO EN PRODUCCIÓN**

Si quieres estar 100% seguro de que el backup funciona, puedes probar restaurarlo en un contenedor de prueba:

```bash
# Crear un contenedor de prueba
docker run -d --name postgres_test -e POSTGRES_PASSWORD=test postgres:14-alpine

# Esperar que esté listo
sleep 5

# Crear la base de datos de prueba
docker exec postgres_test psql -U postgres -c "CREATE DATABASE yaavs_db_test;"

# Restaurar el backup
gunzip -c ./backups/yaavs_backup_pre_migracion_*.sql.gz | \
  docker exec -i postgres_test psql -U postgres yaavs_db_test

# Verificar que se restauró
docker exec postgres_test psql -U postgres -d yaavs_db_test -c "\dt"

# Limpiar contenedor de prueba
docker stop postgres_test && docker rm postgres_test
```

---

## 📦 Guardar el Backup de Forma Segura

Una vez creado y verificado el backup:

1. **Copia el backup a un lugar seguro** (fuera del servidor):
   ```bash
   # Ejemplo: copiar a tu máquina local si estás trabajando remotamente
   scp ./backups/yaavs_backup_pre_migracion_*.sql.gz usuario@tu-maquina:/ruta/segura/
   ```

2. **Guarda el nombre del archivo** para referencia:
   ```bash
   ls -lh ./backups/yaavs_backup_pre_migracion_*.sql.gz > backup_info.txt
   cat backup_info.txt
   ```

---

## 🚨 En Caso de Problemas

### El contenedor no está corriendo:

```bash
# Verificar contenedores
docker ps -a

# Iniciar PostgreSQL
docker-compose up -d postgres

# Verificar que esté corriendo
docker ps | grep yaavs_postgres
```

### PostgreSQL no responde:

```bash
# Ver logs del contenedor
docker logs yaavs_postgres

# Reiniciar el contenedor
docker-compose restart postgres

# Esperar y verificar de nuevo
sleep 5
docker exec yaavs_postgres pg_isready -U postgres
```

### Error de permisos:

```bash
# Dar permisos de ejecución a los scripts
chmod +x verificar-docker.sh
chmod +x backup-db-docker.sh

# Verificar permisos del directorio de backups
mkdir -p backups
chmod 755 backups
```

---

## ✅ Checklist Antes de Proceder con la Migración

Antes de hacer cambios en la base de datos, confirma:

- [ ] Backup completado exitosamente
- [ ] Backup verificado (archivo existe y no está vacío)
- [ ] Backup guardado en lugar seguro
- [ ] Tienes el nombre del archivo de backup guardado
- [ ] Sabes cómo restaurar el backup si es necesario

**Solo cuando TODOS los items estén marcados, procede con la migración.**

---

## 📞 Restaurar Backup (Por si acaso)

Si necesitas restaurar el backup:

```bash
# Descomprimir y restaurar
gunzip -c ./backups/yaavs_backup_pre_migracion_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i yaavs_postgres psql -U postgres yaavs_db

# O si ya está descomprimido:
docker exec -i yaavs_postgres psql -U postgres yaavs_db < ./backups/yaavs_backup_pre_migracion_YYYYMMDD_HHMMSS.sql
```

---

**Última actualización:** $(date)

