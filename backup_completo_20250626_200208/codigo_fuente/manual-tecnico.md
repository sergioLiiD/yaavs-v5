# Manual Técnico - Sistema de Gestión de Reparaciones

## Índice
1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Base de Datos](#base-de-datos)
6. [API y Endpoints](#api-y-endpoints)
7. [Componentes Principales](#componentes-principales)
8. [Flujos de Trabajo](#flujos-de-trabajo)
9. [Seguridad](#seguridad)
10. [Despliegue](#despliegue)

## Introducción

Este sistema es una aplicación web moderna diseñada para la gestión de reparaciones de equipos, desarrollada con Next.js 14 y TypeScript. El sistema permite gestionar tickets de reparación, presupuestos, pagos y seguimiento de reparaciones.

## Arquitectura del Sistema

### Arquitectura General
- Frontend: Next.js 14 con App Router
- Backend: API Routes de Next.js
- Base de Datos: PostgreSQL con Prisma ORM
- Autenticación: NextAuth.js
- UI: Tailwind CSS + Shadcn/ui

### Patrones de Diseño
- Arquitectura en capas (Presentación, Lógica de Negocio, Acceso a Datos)
- Patrón Repository para acceso a datos
- Patrón Provider para gestión de estado
- Patrón Service para lógica de negocio

## Tecnologías Utilizadas

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn/ui
- React Query
- React Hook Form
- Zod (validación)
- Axios

### Backend
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- NextAuth.js
- JWT

### Herramientas de Desarrollo
- ESLint
- Prettier
- TypeScript
- Git

## Estructura del Proyecto

```
src/
├── app/                    # Rutas y páginas de la aplicación
│   ├── api/               # Endpoints de la API
│   ├── dashboard/         # Páginas del dashboard
│   └── auth/              # Páginas de autenticación
├── components/            # Componentes reutilizables
├── lib/                   # Utilidades y configuraciones
├── providers/            # Proveedores de contexto
├── hooks/                # Custom hooks
├── services/             # Servicios de negocio
├── types/                # Definiciones de tipos
└── db/                   # Configuración de base de datos

prisma/
├── schema.prisma         # Esquema de la base de datos
├── migrations/           # Migraciones de la base de datos
└── seed.ts              # Datos iniciales
```

## Base de Datos

### Modelos Principales

#### Usuario
```prisma
model Usuario {
  id              Int       @id @default(autoincrement())
  nombre          String
  apellidoPaterno String
  apellidoMaterno String?
  email           String    @unique
  password        String
  nivel           String    // ADMIN, SUPERVISOR, TECNICO
  activo          Boolean   @default(true)
  tickets         Ticket[]
  reparaciones    Reparacion[]
}
```

#### Ticket
```prisma
model Ticket {
  id                Int       @id @default(autoincrement())
  folio             String    @unique
  fechaCreacion     DateTime  @default(now())
  estatus           String    // RECIBIDO, EN_DIAGNOSTICO, PRESUPUESTO_GENERADO, EN_REPARACION, COMPLETADO
  cliente           Cliente
  tecnico           Usuario
  presupuesto       Presupuesto?
  reparacion        Reparacion?
  pagos             Pago[]
}
```

#### Presupuesto
```prisma
model Presupuesto {
  id          Int       @id @default(autoincrement())
  fecha       DateTime  @default(now())
  total       Float
  items       PresupuestoItem[]
  ticket      Ticket    @relation(fields: [ticketId], references: [id])
  ticketId    Int       @unique
}
```

#### Reparación
```prisma
model Reparacion {
  id            Int       @id @default(autoincrement())
  fechaInicio   DateTime?
  fechaFin      DateTime?
  observaciones String?
  checklist     Json?
  fotos         String[]
  videos        String[]
  ticket        Ticket    @relation(fields: [ticketId], references: [id])
  ticketId      Int       @unique
  tecnico       Usuario   @relation(fields: [tecnicoId], references: [id])
  tecnicoId     Int
}
```

### Relaciones Principales
- Un Usuario puede tener múltiples Tickets asignados
- Un Ticket tiene un Cliente asociado
- Un Ticket puede tener un Presupuesto
- Un Ticket puede tener una Reparación
- Un Ticket puede tener múltiples Pagos

## API y Endpoints

### Tickets
- `GET /api/tickets` - Listar tickets
- `POST /api/tickets` - Crear ticket
- `GET /api/tickets/[id]` - Obtener ticket específico
- `PUT /api/tickets/[id]` - Actualizar ticket
- `DELETE /api/tickets/[id]` - Eliminar ticket

### Presupuestos
- `POST /api/tickets/[id]/presupuesto` - Crear presupuesto
- `PUT /api/tickets/[id]/presupuesto` - Actualizar presupuesto
- `GET /api/tickets/[id]/presupuesto` - Obtener presupuesto

### Reparaciones
- `POST /api/tickets/[id]/reparacion/iniciar` - Iniciar reparación
- `POST /api/tickets/[id]/reparacion/pausar` - Pausar reparación
- `POST /api/tickets/[id]/reparacion/reanudar` - Reanudar reparación
- `POST /api/tickets/[id]/reparacion` - Completar reparación

### Pagos
- `POST /api/tickets/[id]/pago` - Registrar pago
- `GET /api/tickets/[id]/pagos` - Listar pagos

## Componentes Principales

### Gestión de Tickets
- `TicketsTable`: Tabla principal de tickets con filtros y acciones
- `TicketForm`: Formulario de creación/edición de tickets
- `TicketDetails`: Vista detallada de un ticket

### Presupuestos
- `PresupuestoSection`: Sección de presupuesto con lista de productos
- `ProductosSelector`: Selector de productos con autocompletado
- `PresupuestoResumen`: Resumen del presupuesto con totales

### Reparaciones
- `ReparacionSection`: Sección de reparación con cronómetro y checklist
- `ChecklistReparacion`: Checklist de verificación
- `MediaUploader`: Componente para subir fotos y videos

### Pagos
- `PagoSection`: Sección de pagos con historial y formulario
- `PagoForm`: Formulario de registro de pagos
- `PagoHistorial`: Historial de pagos

## Flujos de Trabajo

### Creación de Ticket
1. Usuario crea ticket con datos del cliente
2. Sistema asigna folio único
3. Ticket se crea en estado "Recibido"

### Proceso de Presupuesto
1. Técnico realiza diagnóstico
2. Sistema genera presupuesto
3. Cliente aprueba/rechaza presupuesto
4. Si aprueba, se registra pago inicial

### Proceso de Reparación
1. Técnico inicia reparación (inicia cronómetro)
2. Sistema registra fecha de inicio
3. Técnico completa checklist
4. Técnico sube fotos/videos
5. Técnico completa reparación
6. Sistema registra fecha de fin

### Proceso de Pago
1. Usuario registra pago
2. Sistema actualiza saldo
3. Si saldo es 0, sistema marca ticket como completado

## Seguridad

### Autenticación
- Implementación con NextAuth.js
- JWT para tokens de sesión
- Protección de rutas con middleware

### Autorización
- Niveles de usuario (ADMIN, SUPERVISOR, TECNICO)
- Validación de permisos por ruta
- Protección de endpoints API

### Validación de Datos
- Zod para validación de esquemas
- Sanitización de inputs
- Validación en frontend y backend

## Despliegue

### Requisitos
- Node.js 18+
- PostgreSQL 14+
- Variables de entorno configuradas

### Configuración
1. Clonar repositorio
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno
4. Ejecutar migraciones: `npx prisma migrate deploy`
5. Ejecutar seed: `npx prisma db seed`
6. Iniciar servidor: `npm run dev`

### Variables de Entorno
```env
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
NEXT_PUBLIC_API_URL=
```

### Comandos Principales
- `npm run dev`: Desarrollo local
- `npm run build`: Construir producción
- `npm run start`: Iniciar producción
- `npm run lint`: Linting
- `npm run format`: Formatear código 