# Instrucciones para Migración: Sistema de Cancelación y Devoluciones

## 📋 Resumen de Cambios

Este documento describe los pasos necesarios para implementar el sistema de cancelación de tickets y manejo de devoluciones de anticipos.

## ⚠️ IMPORTANTE: Antes de Empezar

1. **Hacer backup completo de la base de datos**
2. **Ejecutar en horario de bajo tráfico** (preferiblemente fuera de horario laboral)
3. **Tener acceso de administrador a la base de datos**
4. **Verificar que tienes permisos para crear tablas y modificar esquemas**

---

## 📝 Paso 1: Backup de Base de Datos

**Ejecutar en el servidor:**

### Opción A: Backup en directorio específico (RECOMENDADO)

```bash
# Navegar al directorio del proyecto
cd /opt/yaavs-v5

# Crear directorio de backups si no existe
mkdir -p backups

# Crear backup con ruta absoluta
sudo -u postgres pg_dump yaavs_db > /opt/yaavs-v5/backups/backup_antes_migracion_$(date +%Y%m%d_%H%M%S).sql

# Verificar que se creó el archivo
ls -lh /opt/yaavs-v5/backups/backup_antes_migracion_*.sql
```

### Opción B: Backup con verificación de errores

```bash
cd /opt/yaavs-v5
mkdir -p backups

# Crear backup y capturar errores
sudo -u postgres pg_dump yaavs_db > /opt/yaavs-v5/backups/backup_antes_migracion_$(date +%Y%m%d_%H%M%S).sql 2>&1

# Verificar tamaño del archivo (debe ser mayor a 0)
ls -lh /opt/yaavs-v5/backups/backup_antes_migracion_*.sql

# Verificar que el archivo no está vacío
head -20 /opt/yaavs-v5/backups/backup_antes_migracion_*.sql
```

### Opción C: Si el archivo se creó en el home de postgres

```bash
# Verificar en el home de postgres
sudo ls -lh /var/lib/postgresql/backup_antes_migracion_*.sql

# Si está ahí, moverlo a tu directorio
sudo mv /var/lib/postgresql/backup_antes_migracion_*.sql /opt/yaavs-v5/backups/
sudo chown administrador:administrador /opt/yaavs-v5/backups/backup_antes_migracion_*.sql
```

### Opción D: Con contraseña explícita

```bash
cd /opt/yaavs-v5
mkdir -p backups

PGPASSWORD=postgres pg_dump -U postgres -h localhost yaavs_db > backups/backup_antes_migracion_$(date +%Y%m%d_%H%M%S).sql

# Verificar
ls -lh backups/backup_antes_migracion_*.sql
```

---

## 📝 Paso 2: Ejecutar Script SQL de Migración

**Ubicación del script:** `/opt/yaavs-v5/migrations/001_add_cancelacion_devoluciones.sql`

### Opción A: Usando sudo con usuario postgres (recomendado)

```bash
# Navegar al directorio del proyecto
cd /opt/yaavs-v5

# Verificar que el archivo existe
ls -lh migrations/001_add_cancelacion_devoluciones.sql

# Ejecutar el script usando usuario postgres
sudo -u postgres psql -d yaavs_db -f migrations/001_add_cancelacion_devoluciones.sql

# Verificar que no hubo errores (debe mostrar mensajes de éxito)
```

### Opción B: Con contraseña explícita

```bash
cd /opt/yaavs-v5

# Ejecutar con contraseña en variable de entorno
PGPASSWORD=postgres psql -U postgres -h localhost -d yaavs_db -f migrations/001_add_cancelacion_devoluciones.sql
```

### Opción C: Ejecutar línea por línea desde psql

```bash
# Conectarse a PostgreSQL
sudo -u postgres psql -d yaavs_db

# Dentro de psql, ejecutar:
\i /opt/yaavs-v5/migrations/001_add_cancelacion_devoluciones.sql

# O copiar y pegar el contenido del archivo directamente
```

### Opción D: Desde pgAdmin o cliente gráfico

1. Abrir pgAdmin o tu cliente de PostgreSQL
2. Conectarse a la base de datos `yaavs_db`
3. Abrir el archivo `/opt/yaavs-v5/migrations/001_add_cancelacion_devoluciones.sql`
4. Ejecutar el script completo

---

## 📝 Paso 3: Verificar que la Migración se Ejecutó Correctamente

**Ejecutar estos queries para verificar:**

```bash
# Conectarse a PostgreSQL
sudo -u postgres psql -d yaavs_db
```

Dentro de psql, ejecutar:

```sql
-- 1. Verificar que el campo 'estado' se agregó a pagos
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'pagos' AND column_name = 'estado';

-- Debe mostrar: estado | character varying | 'ACTIVO'

-- 2. Verificar que el campo 'cancelado_por_id' se agregó a tickets
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tickets' AND column_name = 'cancelado_por_id';

-- Debe mostrar: cancelado_por_id | integer

-- 3. Verificar que la tabla 'devoluciones' se creó
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'devoluciones';

-- Debe mostrar: devoluciones

-- 4. Verificar que todos los pagos existentes tienen estado ACTIVO
SELECT estado, COUNT(*) 
FROM pagos 
GROUP BY estado;

-- Debe mostrar solo: ACTIVO | [número de pagos]

-- Salir de psql
\q
```

---

## 📝 Paso 4: Actualizar Prisma Schema (Ya está hecho en el código)

El archivo `prisma/schema.prisma` ya fue actualizado con:
- Campo `estado` en modelo `pagos`
- Campo `cancelado_por_id` en modelo `tickets`
- Nuevo modelo `devoluciones`

**Si necesitas regenerar el cliente de Prisma:**

```bash
# En el servidor o máquina de desarrollo
cd /opt/yaavs-v5
npx prisma generate
```

---

## 📝 Paso 5: Reiniciar la Aplicación

Después de ejecutar la migración SQL:

1. **Detener la aplicación** (si está corriendo)
   ```bash
   # Si usas PM2
   pm2 stop yaavs-v5
   
   # O si usas systemd
   sudo systemctl stop yaavs-v5
   ```

2. **Regenerar el cliente de Prisma** (si es necesario):
   ```bash
   cd /opt/yaavs-v5
   npx prisma generate
   ```

3. **Reiniciar la aplicación**
   ```bash
   # Si usas PM2
   pm2 restart yaavs-v5
   
   # O si usas systemd
   sudo systemctl restart yaavs-v5
   ```

---

## 📝 Paso 6: Verificar Funcionamiento

### 6.1 Verificar que los reportes financieros funcionan

1. Ir a `/dashboard/reportes`
2. Generar un reporte financiero
3. Verificar que los totales sean correctos
4. Los pagos de tickets cancelados NO deben aparecer en los reportes

### 6.2 Probar cancelación de ticket

1. Iniciar sesión como ADMINISTRADOR
2. Ir a `/dashboard/tickets`
3. Seleccionar un ticket que tenga pagos registrados
4. Hacer clic en el botón de cancelar (icono de basura)
5. Completar el formulario con motivo de cancelación
6. Verificar que:
   - El ticket se marca como cancelado
   - Los pagos se marcan como CANCELADO
   - Se crean registros en la tabla `devoluciones`

### 6.3 Verificar permisos

1. Iniciar sesión como usuario NO administrador
2. Verificar que NO aparece el botón de cancelar tickets
3. Intentar acceder directamente al endpoint DELETE (debe fallar con 403)

---

## 🔍 Troubleshooting

### Error: "column 'estado' already exists"
**Solución:** El campo ya existe. Verificar si la migración se ejecutó parcialmente. Puedes continuar con el siguiente paso.

### Error: "table 'devoluciones' already exists"
**Solución:** La tabla ya existe. Verificar su estructura y continuar.

### Error: "permission denied"
**Solución:** Necesitas permisos de superusuario o propietario de la base de datos. Ejecutar como usuario con permisos adecuados.

### Los reportes muestran valores incorrectos
**Solución:** Verificar que los pagos tienen el estado correcto:
```sql
-- Ver pagos sin estado
SELECT * FROM pagos WHERE estado IS NULL;

-- Si hay pagos sin estado, actualizarlos:
UPDATE pagos SET estado = 'ACTIVO' WHERE estado IS NULL;
```

### El backup no aparece en el directorio actual
**Solución:** El archivo puede haberse creado en el directorio home de postgres. Verificar:
```bash
# Buscar el archivo
sudo find / -name "backup_antes_migracion_*.sql" 2>/dev/null

# O verificar en el home de postgres
sudo ls -lh /var/lib/postgresql/backup_antes_migracion_*.sql
```

---

## 📊 Estructura de Datos Creada

### Tabla: `devoluciones`
- `id`: ID único
- `pago_id`: Referencia al pago
- `ticket_id`: Referencia al ticket cancelado
- `monto`: Monto a devolver
- `motivo`: Motivo de la cancelación
- `estado`: PENDIENTE, COMPLETADA, CANCELADA
- `fecha_devolucion`: Fecha en que se completó la devolución
- `usuario_id`: Usuario que creó el registro
- `observaciones`: Notas adicionales
- `created_at`, `updated_at`: Timestamps

### Campo agregado: `pagos.estado`
- Valores: `ACTIVO`, `CANCELADO`, `DEVUELTO`
- Default: `ACTIVO`

### Campo agregado: `tickets.cancelado_por_id`
- Referencia al usuario que canceló el ticket
- Nullable (puede ser NULL si se canceló antes de esta migración)

---

## ✅ Checklist de Verificación

- [ ] Backup de base de datos creado y verificado
- [ ] Script SQL ejecutado sin errores
- [ ] Campo `estado` existe en tabla `pagos`
- [ ] Campo `cancelado_por_id` existe en tabla `tickets`
- [ ] Tabla `devoluciones` creada
- [ ] Todos los pagos existentes tienen estado `ACTIVO`
- [ ] Cliente de Prisma regenerado (si es necesario)
- [ ] Aplicación reiniciada
- [ ] Reportes financieros funcionan correctamente
- [ ] Cancelación de tickets funciona
- [ ] Permisos funcionan correctamente

---

## 📞 Soporte

Si encuentras algún problema durante la migración:

1. **NO continuar** si hay errores críticos
2. **Restaurar el backup** si es necesario
3. Revisar los logs de la aplicación
4. Verificar los permisos de usuario de la base de datos

---

## 🎯 Próximos Pasos (Opcional)

Después de que todo funcione correctamente, puedes:

1. Crear un endpoint para marcar devoluciones como completadas
2. Crear un reporte de devoluciones pendientes
3. Agregar notificaciones cuando se cancelen tickets con pagos
4. Crear dashboard de devoluciones pendientes

---

**Fecha de creación:** 2025-01-XX
**Versión:** 1.0
