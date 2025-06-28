# Log de Diagnóstico: Error Prisma `enableTracing` en Docker

## 📋 Resumen del Problema

**Error Principal:** `Failed to deserialize constructor options. missing field 'enableTracing'`  
**Contexto:** Implementación de YAAVS v5 en Docker  
**Síntoma:** Login devuelve `ERR_EMPTY_RESPONSE` en el navegador  
**Fecha Inicio:** 27 de junio 2025  

## 🎯 Objetivo
Implementar correctamente YAAVS v5 en contenedores Docker con autenticación funcional.

---

## 📚 Historial de Cambios y Diagnósticos

### **FASE 1: Identificación del Problema (Inicial)**

#### **Estado Inicial:**
- ✅ Sistema funcionando en desarrollo local
- ✅ GitHub actualizado con correcciones de errores 500
- ❌ Error `ERR_EMPTY_RESPONSE` en login con Docker

#### **Configuración Docker Existente:**
```yaml
# docker-compose.yml original
services:
  app:
    environment:
      - NODE_ENV=production
      - NEXTAUTH_URL=http://localhost:3100
```

#### **Primer Diagnóstico:**
- **Síntoma:** Login devuelve `POST http://localhost:3100/api/auth/callback/credentials net::ERR_EMPTY_RESPONSE`
- **Tiempo construcción:** 42 minutos (2522 segundos)
- **Contenedores creados:** yaavs_postgres, yaavs_app, yaavs_migrations

---

### **FASE 2: Investigación de Conectividad**

#### **Pruebas de Conectividad:**
```bash
# Health check
curl http://localhost:3100/api/health
# Resultado: ✅ {"status":"ok","timestamp":"...","uptime":...}

# NextAuth providers
curl http://localhost:3100/api/auth/providers
# Resultado: ✅ Respuesta correcta con configuración credentials
```

#### **Diagnóstico:**
- ✅ Aplicación Next.js funcionando
- ✅ NextAuth configurado correctamente
- ❌ Problema específico en endpoint de autenticación

---

### **FASE 3: Descubrimiento del Error Prisma**

#### **Prueba Directa de Login:**
```bash
curl -X POST http://localhost:3100/api/auth/signin/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=sergio@hoom.mx&password=whoS5un0%&redirect=false"
```

#### **Resultado Critical:**
```
HTTP/1.1 302 Found
location: http://localhost:3100/api/auth/signin?csrf=true
```

#### **Error en Logs:**
```
thread '<unnamed>' panicked at query-engine/query-engine-node-api/src/engine.rs:76:45:
Failed to deserialize constructor options.
missing field `enableTracing`
```

#### **Diagnóstico:**
- ❌ Prisma crashea al intentar conectar a BD
- ❌ NextAuth redirige por problemas CSRF debido a Prisma fallando
- ✅ Base de datos accesible (usuario existe: sergio@hoom.mx activo)

---

### **FASE 4: Corrección de Variables de Entorno**

#### **Problema Identificado:**
```bash
docker exec yaavs_app printenv | grep NODE_ENV
# NODE_ENV=production  <-- Problema: Producción con URL local
```

#### **Cambio Realizado:**
```yaml
# docker-compose.yml
environment:
  - NODE_ENV=development  # Cambiado de production
  - NEXTAUTH_DEBUG=true   # Agregado para debug
```

#### **Resultado:**
- ❌ Error de Prisma persiste
- ❌ Misma respuesta `ERR_EMPTY_RESPONSE`

---

### **FASE 5: Corrección de Configuración Prisma (Intento 1)**

#### **Problema Detectado:**
```typescript
// src/lib/auth.ts - ANTES
const prisma = new PrismaClient(); // Instancia duplicada
```

#### **Cambio Realizado:**
```typescript
// src/lib/auth.ts - DESPUÉS
import { db } from '@/lib/db'; // Usar instancia compartida
```

#### **Configuración Prisma Agregada:**
```yaml
# docker-compose.yml
environment:
  - PRISMA_CLI_QUERY_ENGINE_TYPE=binary
  - PRISMA_CLIENT_ENGINE_TYPE=binary
```

#### **Error Resultante:**
```
Invalid client engine type, please use 'library' or 'binary'
```

#### **Diagnóstico:**
- ❌ Variables de entorno Prisma causaron conflicto
- ❌ Configuración incorrecta de engine type

---

### **FASE 6: Simplificación Configuración Prisma**

#### **Cambios Realizados:**
```prisma
// prisma/schema.prisma - ANTES
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
  binaryTargets   = ["native", "rhel-openssl-1.0.x", "linux-musl-arm64-openssl-1.1.x"]
}

// DESPUÉS
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]
}
```

#### **Variables Removidas:**
```yaml
# Removido de docker-compose.yml
- PRISMA_CLI_QUERY_ENGINE_TYPE=binary
- PRISMA_CLIENT_ENGINE_TYPE=binary
```

#### **Resultado:**
- ❌ Error `enableTracing` persiste
- ❌ Tiempo construcción: ~15 minutos

---

### **FASE 7: Corrección Versión Node.js**

#### **Error Descubierto:**
```
npm WARN EBADENGINE Unsupported engine {
  package: 'prisma@6.10.1',
  required: { node: '>=18.18' },
  current: { node: 'v18.17.0', npm: '9.6.7' }
}
```

#### **Cambio Realizado:**
```dockerfile
# Dockerfile - ANTES
FROM node:18.17.0-alpine AS base

# DESPUÉS
FROM node:18.20.2-alpine AS base
```

#### **Unificación de Versiones:**
```dockerfile
# Todas las etapas usan la misma versión
FROM node:18.20.2-alpine AS base
FROM node:18.20.2-alpine AS runner
```

#### **Resultado:**
- ✅ Construcción exitosa sin errores de versión
- ❌ Error `enableTracing` aún persiste

---

### **FASE 8: Prueba con Cliente Prisma Optimizado**

#### **Archivo Creado:**
```typescript
// src/lib/prisma-docker.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error'],
  errorFormat: 'minimal',
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
export { prisma as db }
```

#### **Endpoint de Prueba Creado:**
```typescript
// src/app/api/auth/test-login/route.ts
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  const user = await db.usuarios.findUnique({
    where: { email: email, activo: true }
  });
  // ... validación de contraseña
}
```

#### **Resultado de Prueba:**
```bash
curl -X POST http://localhost:3100/api/auth/test-login
# Resultado: curl: (52) Empty reply from server
```

#### **Logs Confirmaron:**
```
=== TEST LOGIN DIRECTO ===
Email: sergio@hoom.mx

thread '<unnamed>' panicked at query-engine/query-engine-node-api/src/engine.rs:76:45:
Failed to deserialize constructor options.
missing field `enableTracing`
```

#### **Diagnóstico Critical:**
- ❌ Problema NO es NextAuth
- ❌ Problema ES específicamente Prisma Query Engine
- ❌ Cualquier operación de BD crashea la aplicación

---

### **FASE 9: Cambio de Alpine a Debian**

#### **Hipótesis:**
Incompatibilidad entre Prisma Query Engine y Alpine Linux.

#### **Cambio Drástico Realizado:**
```dockerfile
# Dockerfile - ANTES
FROM node:18.20.2-alpine AS base
RUN apk add --no-cache libc6-compat openssl python3 make g++

# DESPUÉS  
FROM node:18.20.2-bullseye-slim AS base
RUN apt-get update && apt-get install -y \
    openssl ca-certificates postgresql-client python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
```

#### **Tiempo de Construcción:**
- ~22 minutos (1332 segundos)

#### **Resultado:**
- ✅ Construcción exitosa sin errores de compilación
- ✅ NextJS inicia correctamente
- ✅ Health check funciona
- ❌ **ERROR `enableTracing` PERSISTE**

#### **Logs Finales:**
```
Email: sergio@hoom.mx

thread '<unnamed>' panicked at query-engine/query-engine-node-api/src/engine.rs:76:45:
Failed to deserialize constructor options.
missing field `enableTracing`
```

---

## 🔍 Estado Actual del Diagnóstico

### **Lo que SÍ funciona:**
✅ **Docker Environment:** Debian bullseye-slim  
✅ **Node.js:** 18.20.2 (compatible con Prisma 6.10.1)  
✅ **Base de datos:** PostgreSQL conecta y responde  
✅ **Next.js:** Aplicación inicia sin errores  
✅ **NextAuth:** Configuración correcta  
✅ **Health Check:** API responde correctamente  

### **Lo que NO funciona:**
❌ **Cualquier operación Prisma:** Crash inmediato con `enableTracing`  
❌ **Login:** `ERR_EMPTY_RESPONSE` debido a crash de Prisma  
❌ **Query Engine:** Falla al deserializar opciones del constructor  

### **Versiones Confirmadas:**
```
@prisma/client: 5.22.0
prisma: 6.10.1 (instalado automáticamente)
Node.js: 18.20.2
PostgreSQL: 14-alpine
```

---

## 🚨 Análisis de Causa Raíz

### **Teorías Descartadas:**
1. ❌ **Problema de puertos/networking**
2. ❌ **Incompatibilidad Alpine/Debian** 
3. ❌ **Versión de Node.js**
4. ❌ **Configuración NextAuth**
5. ❌ **Variables de entorno**
6. ❌ **Configuración Docker**

### **Causa Raíz Probable:**
**Incompatibilidad entre versiones de Prisma Client (5.22.0) y Prisma CLI (6.10.1)**

El error `missing field 'enableTracing'` sugiere que:
- El Query Engine espera un campo `enableTracing` en las opciones del constructor
- El Prisma Client 5.22.0 no proporciona este campo
- Prisma CLI 6.10.1 genera un Query Engine incompatible

---

## 📋 Próximos Pasos Propuestos

### **Opción A: Downgrade Prisma (RECOMENDADA)**
1. Fijar versión específica de Prisma Client y CLI
2. Usar versión estable anterior (5.19.x)
3. Regenerar completamente el cliente

### **Opción B: Upgrade Completo Prisma**
1. Actualizar a la última versión estable
2. Verificar breaking changes
3. Ajustar configuración según nueva versión

### **Opción C: Diagnóstico Externo**
1. Probar sistema localmente sin Docker
2. Comparar comportamiento local vs Docker
3. Identificar diferencias específicas del entorno

---

## 📊 Métricas del Proceso

| Métrica | Valor |
|---------|--------|
| **Tiempo total diagnóstico** | ~3 horas |
| **Intentos de corrección** | 9 fases |
| **Reconstrucciones Docker** | 8 veces |
| **Tiempo total construcción** | ~120 minutos |
| **Líneas de código modificadas** | ~150 líneas |
| **Archivos afectados** | 6 archivos |

---

## 📝 Notas Técnicas

### **Comando para Reproducir Error:**
```bash
# Construir y ejecutar
docker-compose up --build -d

# Probar endpoint directo
curl -X POST http://localhost:3100/api/auth/test-login \
  -H "Content-Type: application/json" \
  -d '{"email":"sergio@hoom.mx","password":"whoS5un0%"}'

# Verificar logs
docker-compose logs app --tail=20
```

### **Error Signature:**
```
thread '<unnamed>' panicked at query-engine/query-engine-node-api/src/engine.rs:76:45:
Failed to deserialize constructor options.
missing field `enableTracing`
```

---

---

## ✅ **SOLUCIÓN ENCONTRADA Y IMPLEMENTADA**

### **FASE 10: Solución Definitiva - Sincronización de Versiones Prisma**

#### **Diagnóstico Final:**
```bash
# Verificación local vs Docker
Local:  prisma CLI 5.22.0 + @prisma/client 5.22.0 = ✅ FUNCIONA
Docker: prisma CLI 6.10.1 + @prisma/client 5.22.0 = ❌ FALLA
```

#### **Causa Raíz Confirmada:**
- **Prisma CLI** estaba en `devDependencies` 
- **Docker** no instala `devDependencies` en producción
- **NPX** descargaba automáticamente la última versión (6.10.1)
- **Incompatibilidad** entre CLI 6.10.1 y Client 5.22.0

#### **Solución Implementada:**
```json
// package.json - CAMBIO
"dependencies": {
  "@prisma/client": "5.22.0",
  "prisma": "5.22.0"  // ← Movido desde devDependencies
}
```

#### **Resultado:**
```bash
# Verificación post-solución
docker exec yaavs_app npx prisma --version
prisma CLI:         5.22.0  ✅
@prisma/client:     5.22.0  ✅

# Prueba de login
curl -X POST http://localhost:3100/api/auth/test-login
{"success":true,"user":{"id":2,"email":"sergio@hoom.mx","nombre":"Sergio"}}
```

#### **Estado Final:**
- ✅ **Error `enableTracing`:** RESUELTO
- ✅ **Login funcional:** Autenticación exitosa
- ✅ **Sistema Docker:** Completamente operativo
- ✅ **Logs limpios:** Sin errores de Prisma

#### **Tiempo de Construcción Final:**
- ~22 minutos (1302 segundos)

---

**Documento actualizado:** 27 de junio 2025  
**Estado:** ✅ **RESUELTO EXITOSAMENTE**  
**Solución:** Sincronización de versiones Prisma (5.22.0) 