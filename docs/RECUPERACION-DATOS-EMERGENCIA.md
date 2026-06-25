# Guía de recuperación de datos — Servidor YAAVS (emergencia)

**Fecha:** 25 de junio de 2026  
**Servidor:** `yaavsarreglamx` — `/opt/yaavs-v5`  
**Situación:** Se recreó accidentalmente el volumen Docker de PostgreSQL. Los datos de producción pueden seguir en el disco pero ya no son accesibles de forma normal.

**Objetivo:** Recuperar la carpeta de datos de PostgreSQL que estaba en:
`var/lib/docker/volumes/yaavs-v5_postgres_data/`

**Importante:** Esta guía debe ejecutarse **antes** de volver a levantar Docker o restaurar backups SQL en el mismo disco.

---

## Quién hace qué

| Rol | Responsabilidad |
|-----|-----------------|
| **Técnico en sitio (México)** | Apagar PC, USB live, ejecutar comandos, copiar archivos recuperados |
| **Sergio (remoto, Alemania)** | Guía por videollamada, valida resultados, indica siguientes pasos |

**Tiempo estimado:** 1 a 3 horas (más si se clona el disco completo).

---

## Materiales necesarios

### Obligatorio
- [ ] Memoria USB de **8 GB o más** (se borrará su contenido)
- [ ] Otra computadora con internet para crear el USB booteable
- [ ] Celular con buena cámara para videollamada (WhatsApp / Meet / Zoom)
- [ ] Acceso físico al servidor (teclado, monitor o NoMachine local)

### Muy recomendado
- [ ] Disco duro externo USB de **130 GB o más** (para clonar el disco antes de tocar nada)
- [ ] Cable USB del disco externo

### Opcional
- [ ] Impresión de esta guía

---

## ADVERTENCIAS (leer antes de empezar)

1. **NO encender el servidor y usarlo normalmente** hasta terminar o fallar este proceso.
2. **NO ejecutar** `docker compose up`, restaurar backups `.sql`, ni instalar programas en el servidor antes de intentar la recuperación.
3. **NO instalar Ubuntu en el disco del servidor** — solo usar “Probar Ubuntu” desde USB.
4. Si algo no está claro, **detenerse y llamar a Sergio** antes de continuar.
5. Anotar la hora de inicio y cualquier mensaje de error (foto o captura).

---

## Parte A — Crear USB booteable con Ubuntu (puede hacerse antes)

En cualquier PC con Windows, Mac o Linux:

1. Descargar **Ubuntu Desktop 24.04 LTS** desde:  
   https://ubuntu.com/download/desktop

2. Descargar **Rufus** (Windows) o usar **Etcher** (Mac/Linux):  
   - Windows: https://rufus.ie  
   - Etcher: https://etcher.balena.io

3. Insertar la memoria USB (mínimo 8 GB).

4. En Rufus / Etcher:
   - Dispositivo: la memoria USB
   - Imagen: el archivo `.iso` de Ubuntu descargado
   - Clic en **Iniciar** / **Flash**

5. Cuando termine, **expulsar el USB con seguridad**.

---

## Parte B — Arrancar el servidor desde USB

1. **Apagar completamente** el servidor (no reiniciar desde NoMachine; apagado real).

2. Insertar la memoria USB en el servidor.

3. Encender el servidor y **pulsar repetidamente** una de estas teclas al arrancar (depende del fabricante):
   - `F12` (más común — menú de arranque)
   - `F2` o `Del` (BIOS/UEFI)
   - `F10`, `Esc`

4. En el menú de arranque, elegir la opción que diga **USB** o el nombre del fabricante del USB (ej. “SanDisk”, “Kingston”).

5. Aparecerá la pantalla de Ubuntu. Elegir:
   - **“Try Ubuntu”** / **“Probar Ubuntu”**
   - **NO** elegir “Install Ubuntu” / “Instalar Ubuntu”

6. Esperar a que cargue el escritorio de Ubuntu.

7. Abrir **Terminal** (icono negro o buscar “Terminal”).

8. **Conectar videollamada con Sergio** antes de ejecutar comandos.

---

## Parte C — Verificar el disco (Terminal en Ubuntu Live)

Copiar y pegar cada bloque. Enviar foto de la salida a Sergio.

```bash
# Ver discos conectados
lsblk
```

**Qué debe verse (aproximado):**
- `sda` — disco interno del servidor (~127 GB)
  - `sda1` — partición EFI (~1 GB)
  - `sda2` — partición del sistema (~126 GB)
- `sdb` — puede ser el USB o disco externo (si está conectado)

```bash
# NO montar sda2 en escritura todavía
# Solo verificar que existe
sudo fdisk -l /dev/sda
```

---

## Parte D — Clonar el disco (MUY RECOMENDADO)

**Solo si hay disco externo conectado** (≥130 GB libres).

> Esto tarda 1–3 horas pero protege contra errores. Si no hay disco externo, saltar a **Parte E**.

1. Conectar disco externo USB.

2. Verificar nombre del disco externo:

```bash
lsblk
```

Buscar el disco externo (ej. `sdb` con una partición `sdb1`). **Confirmar con Sergio el nombre correcto** — equivocarse puede borrar el disco equivocado.

3. Clonar (sustituir `sdb` por el disco externo correcto):

```bash
# CUIDADO: "of=/dev/sdb" debe ser el disco EXTERNO, no sda
sudo dd if=/dev/sda of=/dev/sdb bs=4M status=progress
```

4. Esperar a que termine (puede tardar horas). No apagar.

5. Avisar a Sergio: “Clonación terminada”.

---

## Parte E — Recuperar archivos borrados con extundelete

Ejecutar en la Terminal de Ubuntu Live:

```bash
# Instalar herramienta de recuperación
sudo apt-get update
sudo apt-get install -y extundelete

# Crear carpeta de recuperación en el USB o en /tmp
sudo mkdir -p /recovery
cd /recovery

# Recuperar la carpeta del volumen de PostgreSQL borrado
sudo extundelete /dev/sda2 --restore-directory var/lib/docker/volumes/yaavs-v5_postgres_data/
```

**Nota:** En Ubuntu Live, `/dev/sda2` **no** está montado como sistema en uso. Si pregunta “Would you like to continue? (y/n)”, responder **`y`**.

Esto puede tardar **10 minutos a 2 horas**. No apagar.

---

## Parte F — Verificar si se recuperó algo

```bash
# Buscar archivo que confirma datos de PostgreSQL
sudo find /recovery -name "PG_VERSION" 2>/dev/null

# Buscar carpetas de datos
sudo find /recovery -type d -name "base" 2>/dev/null

# Ver tamaño de lo recuperado
sudo du -sh /recovery/RECOVERED_FILES 2>/dev/null
sudo find /recovery -type f 2>/dev/null | wc -l
```

### Resultados posibles

| Resultado | Significado | Acción |
|-----------|-------------|--------|
| Aparece `PG_VERSION` y carpetas `base/` con tamaño > 0 | **Éxito probable** | Ir a Parte G |
| Carpeta `RECOVERED_FILES` vacía o casi vacía | Recuperación parcial o fallida | Ir a Parte H (PhotoRec) |
| Error de extundelete | Problema técnico | Llamar a Sergio, enviar foto del error |

Enviar a Sergio **fotos o capturas** de toda la salida de estos comandos.

---

## Parte G — Copiar datos recuperados a disco externo o USB

Si la recuperación encontró archivos:

```bash
# Montar disco externo (ajustar sdb1 según lsblk)
sudo mkdir -p /mnt/backup
sudo mount /dev/sdb1 /mnt/backup

# Copiar todo lo recuperado
sudo mkdir -p /mnt/backup/yaavs-recuperacion-$(date +%Y%m%d)
sudo cp -a /recovery/RECOVERED_FILES/* /mnt/backup/yaavs-recuperacion-$(date +%Y%m%d)/

# Verificar copia
sudo du -sh /mnt/backup/yaavs-recuperacion-*
sudo find /mnt/backup/yaavs-recuperacion-* -name "PG_VERSION"

# Desmontar con seguridad
sudo umount /mnt/backup
```

Si no hay disco externo, copiar a otro USB:

```bash
# Identificar el USB live (partición montada, ej. /media/ubuntu/...)
lsblk
# Copiar a una carpeta visible en el escritorio o USB adicional
```

**Avisar a Sergio:** “Datos copiados, listos para revisión remota”.

---

## Parte H — Plan alternativo: PhotoRec (si extundelete no recuperó nada)

Solo si la Parte E no encontró `PG_VERSION`:

```bash
sudo apt-get install -y testdisk

sudo mkdir -p /recovery-photorec
cd /recovery-photorec

# Modo no interactivo (puede tardar MUCHAS horas)
sudo photorec /log /d /recovery-photorec /cmd /dev/sda2 partition_none,options,mode_ext2,search
```

Al terminar:

```bash
sudo find /recovery-photorec -name "PG_VERSION" 2>/dev/null
sudo find /recovery-photorec -type d -name "base" 2>/dev/null | head -20
```

Avisar a Sergio. Puede requerir análisis remoto de archivos recuperados.

---

## Parte I — Después de la recuperación

### Si HUBO datos recuperados (`PG_VERSION` encontrado)

1. **NO apagar** hasta hablar con Sergio.
2. Dejar el disco externo con la copia en lugar seguro.
3. Sergio indicará cómo montar esos datos en PostgreSQL y exportar un nuevo backup.
4. **No volver a arrancar el servidor normal** hasta que Sergio lo autorice.

### Si NO hubo datos recuperados

1. Avisar a Sergio con las capturas de todos los comandos.
2. Se procederá a restaurar el **último backup SQL disponible** (octubre/noviembre 2025).
3. El técnico puede entonces apagar, quitar el USB y arrancar el servidor normalmente para que Sergio continúe por NoMachine.

---

## Comandos que NO debe ejecutar el técnico

```bash
# NO ejecutar estos comandos sin autorización de Sergio:
docker compose up
docker volume rm
rm -rf /var/lib/docker
mkfs.ext4
fdisk /dev/sda    # (reparticionar)
# "Install Ubuntu" desde el USB
```

---

## Checklist rápido para el técnico

- [ ] Servidor apagado antes de insertar USB
- [ ] Arranque desde USB → “Probar Ubuntu” (no instalar)
- [ ] Videollamada con Sergio activa
- [ ] `lsblk` ejecutado y revisado con Sergio
- [ ] (Opcional) Disco clonado a externo
- [ ] `extundelete` ejecutado
- [ ] `find PG_VERSION` ejecutado
- [ ] Resultados fotografiados y enviados a Sergio
- [ ] Datos copiados a disco externo (si hubo recuperación)
- [ ] Sergio autorizó apagar o continuar

---

## Datos de referencia del servidor

| Dato | Valor |
|------|--------|
| Hostname | `yaavsarreglamx` |
| Ruta del proyecto | `/opt/yaavs-v5` |
| Volumen Docker borrado | `yaavs-v5_postgres_data` |
| Ruta de datos en disco | `var/lib/docker/volumes/yaavs-v5_postgres_data/` |
| Disco interno | `/dev/sda` (~127 GB) |
| Partición del sistema | `/dev/sda2` |
| Base de datos | `yaavs_db` |
| Usuario PostgreSQL | `postgres` |

---

## Contacto durante la recuperación

- **Sergio (remoto):** coordinar por videollamada antes de cada parte crítica.
- Ante cualquier duda sobre qué disco es `sda` vs `sdb`: **parar y llamar**.

---

## Para Sergio — pasos posteriores (si la recuperación funciona)

Cuando el técnico entregue archivos con `PG_VERSION` y `base/`:

1. Montar los archivos recuperados en un contenedor PostgreSQL temporal.
2. Verificar: `SELECT COUNT(*) FROM tickets;`
3. Si hay datos: `pg_dump` completo inmediato a archivo seguro.
4. Restaurar ese dump en el entorno de producción Docker.
5. Configurar backups automáticos diarios (`pg_dump` + copia fuera del servidor).

---

*Documento generado para recuperación de emergencia — YAAVS v5*
