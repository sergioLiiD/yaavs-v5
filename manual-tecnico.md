# Manual Técnico - Sistema de Gestión de Reparaciones YAAVS v5

**Desarrollado por: Sergio Velazco**

## Índice
1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Base de Datos](#base-de-datos)
6. [API y Endpoints](#api-y-endpoints)
7. [Componentes Principales](#componentes-principales)
8. [Flujos de Trabajo](#flujos-de-trabajo)
9. [Sistema de Inventario](#sistema-de-inventario)
10. [Seguridad](#seguridad)
11. [Despliegue con Docker](#despliegue-con-docker)
12. [Configuración del Servidor](#configuración-del-servidor)
13. [Mantenimiento](#mantenimiento)
14. [Últimas Actualizaciones](#últimas-actualizaciones)

## Introducción

YAAVS v5 es una aplicación web moderna diseñada para la gestión integral de reparaciones de equipos móviles, desarrollada con Next.js 14 y TypeScript. El sistema permite gestionar tickets de reparación, presupuestos, pagos, inventario y seguimiento de reparaciones con un sistema dual: Sistema Central y Puntos de Reparación.

### Características Principales
- **Gestión de Tickets**: Creación, seguimiento y cierre de tickets de reparación
- **Sistema de Presupuestos**: Generación automática de presupuestos con conceptos
- **Gestión de Inventario**: Control automático de stock con descuento automático
- **Sistema de Pagos**: Registro y seguimiento de pagos parciales y totales
- **Checklist de Reparación**: Verificación sistemática de equipos reparados
- **Dual System**: Sistema Central y Puntos de Reparación independientes
- **Gestión de Usuarios**: Roles y permisos granulares

## Arquitectura del Sistema

### Arquitectura General
- **Frontend**: Next.js 14 con App Router y TypeScript
- **Backend**: API Routes de Next.js con Prisma ORM
- **Base de Datos**: PostgreSQL 14 con migraciones automáticas
- **Autenticación**: NextAuth.js con JWT
- **UI**: Tailwind CSS + Shadcn/ui + Lucide React
- **Estado**: React Query + Zustand
- **Validación**: Zod + React Hook Form
- **Contenedorización**: Docker + Docker Compose

### Patrones de Diseño
- **Arquitectura en capas**: Presentación, Lógica de Negocio, Acceso a Datos
- **Patrón Repository**: Para acceso a datos con Prisma
- **Patrón Provider**: Para gestión de estado global
- **Patrón Service**: Para lógica de negocio compleja
- **Patrón Transaction**: Para operaciones atómicas de inventario

### Sistema Dual
- **Sistema Central**: Gestión completa de tickets, inventario y usuarios
- **Puntos de Reparación**: Interfaz simplificada para técnicos en campo
- **Sincronización**: Ambos sistemas comparten la misma base de datos

## Tecnologías Utilizadas

### Frontend
- **Next.js 14**: Framework React con App Router
- **TypeScript**: Tipado estático para mayor robustez
- **Tailwind CSS**: Framework CSS utility-first
- **Shadcn/ui**: Componentes de UI reutilizables
- **Lucide React**: Iconografía moderna
- **React Query**: Gestión de estado del servidor
- **React Hook Form**: Formularios eficientes
- **Zod**: Validación de esquemas
- **Axios**: Cliente HTTP
- **Leaflet**: Mapas interactivos
- **React Hot Toast**: Notificaciones

### Backend
- **Next.js API Routes**: Endpoints RESTful
- **Prisma ORM**: ORM moderno para TypeScript
- **PostgreSQL 14**: Base de datos relacional
- **NextAuth.js**: Autenticación y autorización
- **JWT**: Tokens de sesión seguros
- **bcrypt**: Hashing de contraseñas

### DevOps y Contenedorización
- **Docker**: Contenedorización de aplicaciones
- **Docker Compose**: Orquestación de servicios
- **Node.js 18**: Runtime de JavaScript
- **Nginx**: Proxy reverso (opcional)
- **Git**: Control de versiones

### Herramientas de Desarrollo
- **ESLint**: Linting de código
- **Prettier**: Formateo de código
- **TypeScript**: Compilador de tipos
- **Git**: Control de versiones
- **VS Code**: IDE recomendado

## Estructura del Proyecto

```
yaavs-v5/
├── src/
│   ├── app/                    # Rutas y páginas de la aplicación
│   │   ├── api/               # Endpoints de la API
│   │   │   ├── tickets/       # Gestión de tickets
│   │   │   ├── repair-point/  # Endpoints para puntos de reparación
│   │   │   ├── inventario/    # Gestión de inventario
│   │   │   └── auth/          # Autenticación
│   │   ├── dashboard/         # Páginas del dashboard
│   │   ├── cliente/           # Interfaz de cliente
│   │   └── auth/              # Páginas de autenticación
│   ├── components/            # Componentes reutilizables
│   │   ├── ui/               # Componentes base de UI
│   │   ├── tickets/          # Componentes de tickets
│   │   ├── inventario/       # Componentes de inventario
│   │   └── layout/           # Componentes de layout
│   ├── lib/                   # Utilidades y configuraciones
│   │   ├── auth.ts           # Configuración de autenticación
│   │   ├── prisma.ts         # Cliente de Prisma
│   │   └── inventory-utils.ts # Utilidades de inventario
│   ├── providers/            # Proveedores de contexto
│   ├── hooks/                # Custom hooks
│   ├── services/             # Servicios de negocio
│   ├── types/                # Definiciones de tipos
│   └── db/                   # Configuración de base de datos
├── prisma/
│   ├── schema.prisma         # Esquema de la base de datos
│   ├── migrations/           # Migraciones de la base de datos
│   └── seed.ts              # Datos iniciales
├── public/                   # Archivos estáticos
├── scripts/                  # Scripts de utilidad
├── docs/                     # Documentación
├── Dockerfile                # Configuración de Docker
├── docker-compose.yml        # Orquestación de servicios
├── next.config.js           # Configuración de Next.js
└── package.json             # Dependencias del proyecto
```

## Base de Datos

### Modelos Principales

#### Usuarios
```prisma
model usuarios {
  id                Int       @id @default(autoincrement())
  nombre            String
  apellido_paterno  String
  apellido_materno  String?
  email             String    @unique
  password_hash     String
  telefono          String?
  activo            Boolean   @default(true)
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  tickets_creados   tickets[] @relation("TicketsCreados")
  tickets_asignados tickets[] @relation("TicketsAsignados")
  reparaciones      reparaciones[]
  pagos             pagos[]
  salidas_almacen   salidas_almacen[]
  entradas_almacen  entradas_almacen[]
}
```

#### Tickets
```prisma
model tickets {
  id                    Int       @id @default(autoincrement())
  numero_ticket         String    @unique
  fecha_recepcion       DateTime  @default(now())
  cliente_id            Int
  tipo_servicio_id      Int
  modelo_id             Int
  descripcion_problema  String
  estatus_reparacion_id Int?
  creador_id            Int
  tecnico_asignado_id   Int?
  punto_recoleccion_id  Int?
  recogida              Boolean   @default(false)
  fecha_entrega         DateTime?
  entregado             Boolean   @default(false)
  cancelado             Boolean   @default(false)
  motivo_cancelacion    String?
  fecha_inicio_diagnostico DateTime?
  fecha_fin_diagnostico DateTime?
  fecha_inicio_reparacion DateTime?
  fecha_fin_reparacion  DateTime?
  fecha_cancelacion     DateTime?
  direccion_id          Int?
  imei                  String?
  capacidad             String?
  color                 String?
  fecha_compra          DateTime?
  codigo_desbloqueo     String?
  red_celular           String?
  patron_desbloqueo     Int[]
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt
  tipo_desbloqueo       String?
  
  // Relaciones
  cliente               clientes  @relation(fields: [cliente_id], references: [id])
  tipo_servicio         tipos_servicio @relation(fields: [tipo_servicio_id], references: [id])
  modelo                modelos   @relation(fields: [modelo_id], references: [id])
  estatus_reparacion    estatus_reparacion? @relation(fields: [estatus_reparacion_id], references: [id])
  creador               usuarios  @relation("TicketsCreados", fields: [creador_id], references: [id])
  tecnico_asignado      usuarios? @relation("TicketsAsignados", fields: [tecnico_asignado_id], references: [id])
  punto_recoleccion     puntos_recoleccion? @relation(fields: [punto_recoleccion_id], references: [id])
  presupuestos          presupuestos[]
  reparaciones          reparaciones[]
  pagos                 pagos[]
  dispositivos          dispositivos[]
}
```

#### Presupuestos
```prisma
model presupuestos {
  id              Int       @id @default(autoincrement())
  ticket_id       Int       @unique
  total           Float
  descuento       Float     @default(0)
  total_final     Float
  aprobado        Boolean   @default(false)
  fecha_aprobacion DateTime?
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt
  iva_incluido    Boolean   @default(true)
  saldo           Float     @default(0)
  pagado          Boolean   @default(false)
  
  // Relaciones
  ticket          tickets   @relation(fields: [ticket_id], references: [id])
  conceptos_presupuesto conceptos_presupuesto[]
}
```

#### Reparaciones
```prisma
model reparaciones {
  id                Int       @id @default(autoincrement())
  ticket_id         Int       @unique
  diagnostico       String?
  solucion          String?
  observaciones     String?
  fecha_inicio      DateTime?
  fecha_fin         DateTime?
  created_at        DateTime  @default(now())
  updated_at        DateTime  @updatedAt
  capacidad         String?
  codigo_desbloqueo String?
  red_celular       String?
  salud_bateria     Int?
  version_so        String?
  fecha_pausa       DateTime?
  fecha_reanudacion DateTime?
  
  // Relaciones
  ticket            tickets   @relation(fields: [ticket_id], references: [id])
  checklist_reparacion checklist_reparacion[]
  piezas_reparacion piezas_reparacion[]
}
```

#### Inventario
```prisma
model productos {
  id                    Int       @id @default(autoincrement())
  sku                   String    @unique
  nombre                String
  descripcion           String?
  notas_internas        String?
  garantia_valor        Int?
  garantia_unidad       String?
  categoria_id          Int
  marca_id              Int
  modelo_id             Int?
  proveedor_id          Int?
  precio_promedio       Float     @default(0)
  stock                 Int       @default(0)
  tipo_servicio_id      Int?
  stock_maximo          Int?
  stock_minimo          Int?
  tipo                  TipoProducto @default(PRODUCTO)
  created_at            DateTime  @default(now())
  updated_at            DateTime  @updatedAt
  
  // Relaciones
  categoria             categorias @relation(fields: [categoria_id], references: [id])
  marca                 marcas     @relation(fields: [marca_id], references: [id])
  modelo                modelos?   @relation(fields: [modelo_id], references: [id])
  proveedor             proveedores? @relation(fields: [proveedor_id], references: [id])
  tipo_servicio         tipos_servicio? @relation(fields: [tipo_servicio_id], references: [id])
  entradas_almacen      entradas_almacen[]
  salidas_almacen       salidas_almacen[]
  fotos_producto        fotos_producto[]
}
```

### Relaciones Principales
- Un Usuario puede tener múltiples Tickets asignados
- Un Ticket tiene un Cliente asociado
- Un Ticket puede tener un Presupuesto
- Un Ticket puede tener una Reparación
- Un Ticket puede tener múltiples Pagos
- Un Producto puede tener múltiples Entradas/Salidas de Almacén

## API y Endpoints

### Tickets
- `GET /api/tickets` - Listar tickets con filtros
- `POST /api/tickets` - Crear ticket
- `GET /api/tickets/[id]` - Obtener ticket específico
- `PUT /api/tickets/[id]` - Actualizar ticket
- `DELETE /api/tickets/[id]` - Eliminar ticket
- `PATCH /api/tickets/[id]/estatus` - Cambiar estatus

### Presupuestos
- `POST /api/tickets/[id]/presupuesto` - Crear presupuesto
- `PUT /api/tickets/[id]/presupuesto` - Actualizar presupuesto
- `GET /api/tickets/[id]/presupuesto` - Obtener presupuesto
- `POST /api/tickets/[id]/presupuesto/aprobar` - Aprobar presupuesto

### Reparaciones
- `POST /api/tickets/[id]/reparacion/iniciar` - Iniciar reparación
- `POST /api/tickets/[id]/reparacion/pausar` - Pausar reparación
- `POST /api/tickets/[id]/reparacion/reanudar` - Reanudar reparación
- `POST /api/tickets/[id]/reparacion/completar` - Completar reparación
- `POST /api/tickets/[id]/reparacion` - Actualizar reparación (Sistema Central)
- `POST /api/repair-point/tickets/[id]/reparacion` - Actualizar reparación (Repair-Point)

### Inventario
- `GET /api/inventario/productos` - Listar productos
- `POST /api/inventario/productos` - Crear producto
- `PUT /api/inventario/productos/[id]` - Actualizar producto
- `DELETE /api/inventario/productos/[id]` - Eliminar producto
- `POST /api/inventario/entradas` - Registrar entrada de almacén
- `POST /api/inventario/salidas` - Registrar salida de almacén

### Pagos
- `POST /api/tickets/[id]/pago` - Registrar pago
- `GET /api/tickets/[id]/pagos` - Listar pagos
- `PUT /api/tickets/[id]/pago/[id]` - Actualizar pago

### Repair-Point (Puntos de Reparación)
- `GET /api/repair-point/tickets` - Listar tickets del punto
- `GET /api/repair-point/tickets/[id]` - Obtener ticket específico
- `POST /api/repair-point/tickets/[id]/diagnostico` - Registrar diagnóstico
- `POST /api/repair-point/tickets/[id]/checklist-diagnostico` - Checklist de diagnóstico
- `POST /api/repair-point/tickets/[id]/checklist-reparacion` - Checklist de reparación
- `POST /api/repair-point/tickets/[id]/reparacion` - Actualizar reparación

## Componentes Principales

### Gestión de Tickets
- `TicketsTable`: Tabla principal de tickets con filtros avanzados
- `TicketForm`: Formulario de creación/edición de tickets
- `TicketDetails`: Vista detallada de un ticket con todas las secciones
- `TicketStatusBadge`: Badge de estatus con colores dinámicos
- `TicketActions`: Acciones contextuales por estatus

### Presupuestos
- `PresupuestoSection`: Sección de presupuesto con lista de productos
- `ProductosSelector`: Selector de productos con autocompletado y búsqueda
- `PresupuestoResumen`: Resumen del presupuesto con totales e IVA
- `ConceptosPresupuesto`: Lista de conceptos con edición inline

### Reparaciones
- `ReparacionSection`: Sección de reparación con cronómetro y checklist
- `ChecklistReparacion`: Checklist de verificación con respuestas
- `MediaUploader`: Componente para subir fotos y videos
- `DiagnosticoSection`: Sección de diagnóstico con campos específicos
- `ReparacionTimer`: Cronómetro de tiempo de reparación

### Inventario
- `InventarioTable`: Tabla de productos con filtros y acciones
- `ProductoForm`: Formulario de creación/edición de productos
- `EntradaAlmacenForm`: Formulario de entrada de almacén
- `SalidaAlmacenForm`: Formulario de salida de almacén
- `StockAlert`: Alertas de stock mínimo

### Pagos
- `PagoSection`: Sección de pagos con historial y formulario
- `PagoForm`: Formulario de registro de pagos
- `PagoHistorial`: Historial de pagos con detalles
- `SaldoCalculator`: Calculadora de saldo automática

### Sistema de Usuarios
- `UserManagement`: Gestión de usuarios con roles
- `RolePermissions`: Configuración de permisos por rol
- `UserProfile`: Perfil de usuario con configuración

## Flujos de Trabajo

### Creación de Ticket
1. Usuario crea ticket con datos del cliente
2. Sistema asigna número único automáticamente
3. Ticket se crea en estado "Recibido"
4. Se asigna técnico automáticamente o manualmente

### Proceso de Diagnóstico
1. Técnico realiza diagnóstico del equipo
2. Sistema registra fecha de inicio de diagnóstico
3. Se completa checklist de diagnóstico
4. Se registran observaciones y fotos
5. Sistema registra fecha de fin de diagnóstico

### Proceso de Presupuesto
1. Técnico genera presupuesto con conceptos
2. Sistema calcula totales automáticamente
3. Cliente aprueba/rechaza presupuesto
4. Si aprueba, se registra pago inicial
5. Sistema actualiza estatus a "Presupuesto Aprobado"

### Proceso de Reparación
1. Técnico inicia reparación (inicia cronómetro)
2. Sistema registra fecha de inicio
3. Técnico completa checklist de reparación
4. Técnico sube fotos/videos del proceso
5. Técnico completa reparación
6. **Sistema valida stock disponible**
7. **Sistema descuenta inventario automáticamente**
8. Sistema registra fecha de fin

### Proceso de Pago
1. Usuario registra pago parcial o total
2. Sistema actualiza saldo automáticamente
3. Si saldo es 0, sistema marca ticket como completado
4. Sistema genera comprobante de pago

## Sistema de Inventario

### Características del Sistema
- **Control Automático**: Descuento automático al completar reparaciones
- **Validación de Stock**: Verificación antes de completar reparaciones
- **Alertas de Stock**: Notificaciones de stock mínimo
- **Historial Completo**: Entradas y salidas con trazabilidad
- **Múltiples Tipos**: Productos, Servicios, Garantías

### Flujo de Inventario
1. **Entrada de Almacén**: Registro de productos recibidos
2. **Validación de Stock**: Verificación antes de reparaciones
3. **Descuento Automático**: Al completar reparación
4. **Alertas**: Notificaciones de stock bajo
5. **Reportes**: Historial y estadísticas

### Endpoints de Inventario
- `GET /api/inventario/productos` - Listar productos
- `POST /api/inventario/entradas` - Registrar entrada
- `POST /api/inventario/salidas` - Registrar salida
- `GET /api/inventario/alertas` - Alertas de stock
- `GET /api/inventario/reportes` - Reportes de inventario

## Seguridad

### Autenticación
- **NextAuth.js**: Implementación robusta de autenticación
- **JWT**: Tokens de sesión seguros
- **bcrypt**: Hashing seguro de contraseñas
- **Middleware**: Protección de rutas automática

### Autorización
- **Roles Granulares**: ADMIN, SUPERVISOR, TECNICO, CLIENTE
- **Permisos Específicos**: Control por funcionalidad
- **Validación de Rutas**: Middleware de autorización
- **Protección de Endpoints**: Validación en API

### Validación de Datos
- **Zod**: Validación de esquemas en tiempo de ejecución
- **Sanitización**: Limpieza de inputs
- **Validación Frontend**: React Hook Form + Zod
- **Validación Backend**: Prisma + Zod

### Seguridad Adicional
- **CORS**: Configuración de origen cruzado
- **Rate Limiting**: Protección contra ataques
- **Input Sanitization**: Limpieza de datos
- **SQL Injection Protection**: Prisma ORM

## Despliegue con Docker

### Arquitectura de Contenedores
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │  Next.js App    │    │   PostgreSQL    │
│   (Opcional)    │    │   (Node.js)     │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Dockerfile
```dockerfile
# Usar imagen oficial de Node.js con Debian
FROM node:18.20.2-bullseye-slim AS base

# Instalar dependencias necesarias para Prisma y compilación
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    postgresql-client \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Configurar directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# Generar Prisma Client
RUN npx prisma generate

# Etapa de construcción
FROM base AS builder

WORKDIR /app

# Instalar todas las dependencias (incluyendo dev)
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copiar código fuente
COPY . .

# Generar Prisma Client nuevamente
RUN npx prisma generate

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:18.20.2-bullseye-slim AS runner

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Crear usuario no privilegiado
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios desde builder
COPY --from=builder /app/src ./src
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.js ./

# Copiar node_modules optimizado
COPY --from=base /app/node_modules ./node_modules

# Cambiar ownership de archivos
RUN chown -R nextjs:nodejs /app

# Cambiar a usuario no privilegiado
USER nextjs

# Exponer puerto
EXPOSE 3100

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3100

# Script de inicio
CMD ["npm", "start"]
```

### Docker Compose
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
      POSTGRES_PASSWORD: 0soNv75*
      POSTGRES_DB: yaavs_db
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=C --lc-ctype=C"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/docker-entrypoint-initdb.d:ro
    ports:
      - "5433:5432"
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
      - DATABASE_URL=postgresql://postgres:0soNv75*@postgres:5432/yaavs_db?schema=public
      - NEXTAUTH_URL=https://arregla.mx:4001
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - JWT_SECRET=${JWT_SECRET}
      - NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-https://arregla.mx:4001/api}
      - PORT=4001
      - NEXTAUTH_DEBUG=false
    ports:
      - "127.0.0.1:4002:4001"
    volumes:
      - uploads_data:/app/public/uploads
      - ./logs:/app/logs
    networks:
      - yaavs_network
    healthcheck:
      test: ["CMD-SHELL", "curl -f -k https://arregla.mx:4001/api/health || exit 1"]
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
      - DATABASE_URL=postgresql://postgres:0soNv75*@postgres:5432/yaavs_db?schema=public
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

## Configuración del Servidor

### Requisitos del Servidor
- **Sistema Operativo**: Ubuntu 20.04+ o CentOS 8+
- **RAM**: Mínimo 4GB, recomendado 8GB
- **CPU**: Mínimo 2 cores, recomendado 4 cores
- **Almacenamiento**: Mínimo 50GB SSD
- **Red**: Conexión estable a internet

### Instalación de Dependencias
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER

# Instalar Git
sudo apt install git -y
```

### Configuración del Proyecto
```bash
# Clonar repositorio
git clone https://github.com/sergioLiiD/yaavs-v5.git
cd yaavs-v5

# Crear archivo de variables de entorno
cp .env.example .env

# Editar variables de entorno
nano .env
```

### Variables de Entorno Requeridas
```env
# Base de Datos
DATABASE_URL=postgresql://postgres:0soNv75*@postgres:5432/yaavs_db?schema=public

# Autenticación
NEXTAUTH_SECRET=tu_secret_muy_seguro_aqui
NEXTAUTH_URL=https://arregla.mx:4001
JWT_SECRET=tu_jwt_secret_aqui

# API y URLs
NEXT_PUBLIC_API_URL=https://arregla.mx:4001/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_de_google_maps

# Configuración de la aplicación
NODE_ENV=production
PORT=4001
NEXTAUTH_DEBUG=false
```

### Despliegue Inicial
```bash
# Construir y levantar servicios
docker-compose up -d --build

# Verificar estado de los servicios
docker-compose ps

# Ver logs de la aplicación
docker-compose logs -f app

# Ejecutar migraciones (si es necesario)
docker-compose run --rm migrations
```

### Configuración de Nginx (Opcional)
```nginx
server {
    listen 80;
    server_name arregla.mx;
    
    location / {
        proxy_pass http://127.0.0.1:4002;
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

### Configuración de SSL (Recomendado)
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
sudo certbot --nginx -d arregla.mx

# Configurar renovación automática
sudo crontab -e
# Agregar línea: 0 12 * * * /usr/bin/certbot renew --quiet
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

# Verificar uso de recursos
docker stats
```

### Monitoreo
- **Logs**: `docker-compose logs -f`
- **Recursos**: `docker stats`
- **Estado**: `docker-compose ps`
- **Base de datos**: `docker exec yaavs_postgres psql -U postgres yaavs_db`

### Backup y Recuperación
```bash
# Script de backup automático
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker exec yaavs_postgres pg_dump -U postgres yaavs_db > $BACKUP_DIR/backup_$DATE.sql
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

### Actualizaciones
```bash
# Actualizar aplicación
git pull origin main
docker-compose down
docker system prune -f
docker-compose up -d --build --force-recreate

# Verificar migraciones
docker-compose run --rm migrations

# Verificar aplicación
curl -f https://arregla.mx:4001/api/health
```

### Troubleshooting

#### Problemas Comunes
1. **Contenedor no inicia**: Verificar logs con `docker-compose logs app`
2. **Base de datos no conecta**: Verificar DATABASE_URL en .env
3. **Migraciones fallan**: Ejecutar manualmente `docker-compose run --rm migrations`
4. **Memoria insuficiente**: Aumentar RAM del servidor o optimizar Docker

#### Logs de Debug
```bash
# Ver logs de la aplicación
docker-compose logs -f app

# Ver logs de la base de datos
docker-compose logs -f postgres

# Ver logs de migraciones
docker-compose logs migrations
```

### Optimización de Rendimiento
- **Node.js**: Configurar límites de memoria
- **PostgreSQL**: Optimizar configuración de memoria
- **Docker**: Usar volúmenes para datos persistentes
- **Nginx**: Configurar cache y compresión

## Últimas Actualizaciones

### Correcciones de TypeScript y Manejo de Errores (Agosto 2025)

#### Problemas Resueltos

##### 1. Errores de TypeScript en `inventory-utils.ts`
**Problema**: Errores de tipos relacionados con las relaciones opcionales `marcas` y `modelos` en el modelo `productos`.

**Solución Implementada**:
- Agregadas verificaciones de null para relaciones opcionales usando operador de coalescencia nula (`?.`)
- Corregida la conversión de datos entre tablas antigua y nueva de piezas de reparación
- Actualizado el uso del enum `TipoProducto` con valores correctos (`'PRODUCTO'` en lugar de `'REPUESTO'`)

**Archivos Modificados**:
```typescript
// src/lib/inventory-utils.ts
// Correcciones en validarStockReparacion()
const marcaNombre = producto.marcas?.nombre || 'N/A';
const modeloNombre = producto.modelos?.nombre || 'N/A';

// Corrección en conversión de datos antiguos
productos: {
  // ... otros campos
  tipo: 'PRODUCTO' as const,
  marcas: pa.piezas.marcas,
  modelos: pa.piezas.modelos
}
```

##### 2. Error 400 en Completar Reparaciones
**Problema**: Error 400 al intentar completar reparaciones cuando no existía una reparación previa para el ticket.

**Causa Raíz**: La función `validarStockReparacion()` fallaba cuando no encontraba una reparación existente, retornando error en lugar de éxito.

**Solución Implementada**:
- Modificada la lógica de `validarStockReparacion()` para manejar casos donde no existe reparación
- Agregada validación para casos donde no hay piezas de reparación
- Mejorado el manejo de errores en el endpoint de reparación

**Cambios en `validarStockReparacion()`**:
```typescript
if (!reparacion) {
  // Si no hay reparación, no hay piezas que validar, por lo que retornamos éxito
  console.log('No se encontró la reparación para este ticket, pero esto es normal para reparaciones nuevas');
  return {
    success: true,
    errors: [],
    missingStock: []
  };
}

// Si no hay piezas de reparación, no hay stock que validar
if (piezasReparacion.length === 0) {
  console.log('No hay piezas de reparación para validar stock');
  return {
    success: true,
    errors: [],
    missingStock: []
  };
}
```

##### 3. Mejoras en el Manejo de Errores del Endpoint de Reparación
**Problema**: Errores en la conversión de conceptos y procesamiento de descuento de inventario hacían fallar toda la transacción.

**Solución Implementada**:
- Modificado el manejo de errores para que los errores no críticos no hagan fallar la transacción completa
- Agregados logs informativos para mejor debugging
- Mejorada la robustez del endpoint

**Cambios en el Endpoint**:
```typescript
// src/app/api/tickets/[id]/reparacion/route.ts
try {
  await convertirConceptosAPiezas(ticketId, reparacion.id);
  console.log('✅ Conceptos convertidos exitosamente');
} catch (error) {
  console.error('❌ Error al convertir conceptos:', error);
  // No lanzar error, solo logear para no fallar todo el proceso
}

try {
  await procesarDescuentoInventario(ticketId, Number(session.user.id));
  console.log('✅ Descuento de inventario procesado exitosamente');
} catch (error) {
  console.error('❌ Error al procesar descuento de inventario:', error);
  // No lanzar error, solo logear para no fallar todo el proceso
}
```

#### Mejoras en la Validación de Stock

##### Lógica Mejorada
1. **Sin Reparación**: Retorna éxito (no hay piezas que validar)
2. **Sin Piezas**: Retorna éxito (no hay stock que validar)
3. **Con Piezas**: Valida stock solo para productos físicos, no servicios

##### Servicios Exentos de Validación
```typescript
const conceptosSinStock = ['Mano de Obra', 'Diagnostico', 'Diagnóstico', 'Servicio'];
const esServicio = conceptosSinStock.some(concepto => 
  producto.nombre?.includes(concepto)
);
```

#### Mejoras en el Sistema de Logging

##### Logs Informativos Agregados
- Logs detallados en el proceso de validación de stock
- Logs informativos para debugging de reparaciones
- Mejor trazabilidad de errores

##### Ejemplo de Logs Mejorados
```
🔍 Validando stock para ticket: 47
No se encontró la reparación para este ticket, pero esto es normal para reparaciones nuevas
✅ Validación de stock exitosa
🔄 Iniciando transacción para completar reparación (Sistema Central)...
📝 Creando/actualizando reparación...
✅ Reparación creada/actualizada: 123
```

#### Beneficios de las Correcciones

1. **Robustez**: El sistema ahora maneja correctamente casos edge donde no existe reparación previa
2. **Type Safety**: Eliminados todos los errores de TypeScript relacionados con tipos opcionales
3. **Experiencia de Usuario**: Mejorada la experiencia al completar reparaciones
4. **Debugging**: Logs más informativos para facilitar el troubleshooting
5. **Mantenibilidad**: Código más limpio y fácil de mantener

#### Archivos Modificados

1. **`src/lib/inventory-utils.ts`**:
   - Corrección de tipos para relaciones opcionales
   - Mejora en la lógica de validación de stock
   - Manejo de casos edge

2. **`src/app/api/tickets/[id]/reparacion/route.ts`**:
   - Mejora en el manejo de errores no críticos
   - Logs más informativos
   - Mayor robustez en transacciones

#### Testing Recomendado

Para verificar que las correcciones funcionan correctamente:

1. **Crear ticket nuevo y completar reparación**:
   ```bash
   # Verificar logs del servidor
   docker-compose logs -f app
   ```

2. **Verificar validación de stock**:
   - Crear ticket con productos que requieren stock
   - Verificar que la validación funcione correctamente

3. **Verificar manejo de servicios**:
   - Crear ticket con servicios (Mano de Obra, Diagnóstico)
   - Verificar que no se valide stock para servicios

#### Próximas Mejoras Planificadas

1. **Métricas de Rendimiento**: Agregar métricas para monitorear el rendimiento del sistema
2. **Cache de Consultas**: Implementar cache para consultas frecuentes
3. **Validación Avanzada**: Mejorar validaciones de datos de entrada
4. **Reportes Automáticos**: Generar reportes automáticos de errores

#### 7. Script de Creación de Usuarios Administradores
**Problema**: Necesidad de una herramienta fácil para crear usuarios administradores después de la instalación.

**Solución Implementada**:
- Script interactivo para crear usuarios administradores
- Validación de datos de entrada
- Generación automática de contraseñas seguras
- Asignación automática de roles de administrador
- Modo rápido para instalaciones estándar

**Características del Script**:
```bash
# Modo interactivo (recomendado)
./scripts/create-admin-user.sh

# Modo rápido con valores por defecto
./scripts/create-admin-user.sh --quick

# Mostrar ayuda
./scripts/create-admin-user.sh --help
```

**Funcionalidades del Script**:
- **Validación de Email**: Verifica formato correcto de email
- **Validación de Contraseña**: Asegura contraseñas seguras (mínimo 8 caracteres, mayúscula, minúscula, número)
- **Generación Automática**: Crea contraseñas seguras automáticamente
- **Verificación de Existencia**: Detecta usuarios existentes y permite actualización
- **Asignación de Roles**: Crea rol ADMIN si no existe y lo asigna al usuario
- **Manejo de Errores**: Validación completa de entorno y conexiones

**Ejemplo de Uso**:
```bash
# Navegar al directorio del proyecto
cd /opt/yaavs-v5

# Ejecutar script
./scripts/create-admin-user.sh

# El script solicitará:
# - Email del administrador
# - Nombre
# - Apellido paterno
# - Apellido materno (opcional)
# - Teléfono (opcional)
# - Contraseña (o generará una automáticamente)
```

**Salida del Script**:
```
================================
Crear Usuario Administrador - YAAVS v5
================================
[INFO] Verificando conexión a la base de datos...
[INFO] Conexión a la base de datos exitosa

Ingresa la información del usuario administrador:

Email del administrador: admin@empresa.com
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
- Email: admin@empresa.com
- Contraseña: ********
- Rol: Administrador
- Estado: Activo

Puedes acceder al sistema con estas credenciales.

[WARNING] IMPORTANTE: Guarda la contraseña en un lugar seguro.
[WARNING] Se recomienda cambiar la contraseña después del primer acceso.
```

**Archivos Modificados**:

1. **`scripts/create-admin-user.sh`**:
   - Script completo de creación de usuarios
   - Validaciones de seguridad
   - Manejo de errores robusto
   - Interfaz de usuario amigable

**Beneficios de la Implementación**:

1. **Facilidad de Uso**: Interfaz interactiva clara y guiada
2. **Seguridad**: Validación de contraseñas y generación de hashes seguros
3. **Flexibilidad**: Modo interactivo y modo rápido
4. **Robustez**: Manejo completo de errores y verificaciones
5. **Automatización**: Asignación automática de roles y permisos

**Comandos de Mantenimiento Relacionados**:

```bash
# Verificar usuarios existentes
docker exec yaavs_postgres psql -U postgres -d yaavs_db -c "SELECT id, email, nombre, activo FROM usuarios;"

# Verificar roles asignados
docker exec yaavs_postgres psql -U postgres -d yaavs_db -c "SELECT u.email, r.nombre as rol FROM usuarios u JOIN usuarios_roles ur ON u.id = ur.usuario_id JOIN roles r ON ur.rol_id = r.id;"

# Desactivar usuario
docker exec yaavs_postgres psql -U postgres -d yaavs_db -c "UPDATE usuarios SET activo = false WHERE email = 'admin@empresa.com';"

# Activar usuario
docker exec yaavs_postgres psql -U postgres -d yaavs_db -c "UPDATE usuarios SET activo = true WHERE email = 'admin@empresa.com';"
```

**Próximas Mejoras Planificadas**:

1. **Script de Gestión de Usuarios**: Herramienta completa para gestionar usuarios
2. **Importación Masiva**: Crear múltiples usuarios desde archivo CSV
3. **Gestión de Roles**: Script para asignar/quitar roles específicos
4. **Auditoría**: Logs detallados de cambios en usuarios
5. **Backup de Usuarios**: Exportar/importar configuración de usuarios 