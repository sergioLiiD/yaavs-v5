# Instalación de YAAVS v5

## 🚀 Instalación Rápida

### Opción 1: Instalación Automática (Recomendada)

Si tienes todos los archivos del proyecto:

```bash
# 1. Navegar al directorio del proyecto
cd /ruta/donde/estan/los/archivos/yaavs-v5

# 2. Ejecutar instalador automático
./scripts/install-yaavs.sh
```

### Opción 2: Instalación Manual

Si prefieres control total del proceso:

```bash
# 1. Seguir el MANUAL-INSTALACION.md paso a paso
# 2. Omitir la sección "Clonar el Repositorio"
# 3. Usar los archivos que ya tienes
```

## 📋 ¿Qué necesitas?

- ✅ **Archivos del proyecto** (que ya tienes)
- ✅ **Servidor Ubuntu/Debian** con acceso root
- ✅ **Conexión a internet** para descargar Docker
- ✅ **Conocimientos básicos de Linux** (opcional)

## 🔧 ¿Qué hace el instalador automático?

El script `install-yaavs.sh` realiza automáticamente:

1. **Actualización del sistema**
2. **Instalación de Docker**
3. **Configuración de zona horaria**
4. **Preparación del directorio del proyecto**
5. **Configuración de variables de entorno**
6. **Generación de secrets seguros**
7. **Construcción y despliegue de servicios**
8. **Ejecución de migraciones de base de datos**
9. **Verificación de la instalación**

## ⚠️ Notas Importantes

- **NO necesitas un repositorio de GitHub** - todos los archivos están incluidos
- **NO necesitas credenciales de Git** - el proyecto es autónomo
- **El instalador funciona con los archivos locales** que ya tienes
- **Puedes ejecutar el script desde cualquier directorio** que contenga los archivos del proyecto

## 🆘 Si tienes problemas

1. **Verifica que todos los archivos estén presentes**:
   ```bash
   ls -la
   # Deberías ver: docker-compose.yml, Dockerfile, scripts/, src/, etc.
   ```

2. **Verifica permisos del script**:
   ```bash
   chmod +x scripts/install-yaavs.sh
   ```

3. **Ejecuta con logs detallados**:
   ```bash
   bash -x scripts/install-yaavs.sh
   ```

4. **Consulta el manual completo**: `MANUAL-INSTALACION.md`

## 📞 Soporte

Si tienes problemas con la instalación:

1. Revisa la sección "Solución de Problemas" en el manual
2. Verifica que tu servidor cumpla con los requisitos mínimos
3. Asegúrate de tener conexión a internet para descargar Docker

---

**Desarrollado por**: Sergio Velazco  
**Versión**: 5.1  
**Fecha**: Agosto 2025 