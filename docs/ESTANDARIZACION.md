# Estandarización de Nombres y Estructura

## Índice
1. [Introducción](#introducción)
2. [Convenciones de Nombrado](#convenciones-de-nombrado)
3. [Diccionario de Mapeo](#diccionario-de-mapeo)
4. [Proceso de Migración](#proceso-de-migración)
5. [Reglas de Validación](#reglas-de-validación)
6. [Plan de Estandarización para Usuarios, Roles y Autenticación](#plan-de-estandarización-para-usuarios-roles-y-autenticación)

## Introducción
Este documento sirve como guía para mantener la consistencia en el nombrado y la estructura del proyecto. Se actualizará continuamente a medida que se realicen cambios significativos.

## Convenciones de Nombrado

### Base de Datos (PostgreSQL)
- Tablas y columnas en **snake_case**
- Nombres de tablas en plural
- Ejemplo: `tickets`, `checklist_diagnostico`, `checklist_items`, `presupuestos`, `conceptos_presupuesto`, `piezas`

### Schema de Prisma
- Modelos en **PascalCase**
- Campos en **camelCase**
- Mapeo a snake_case en la base de datos usando `@@map`
- Ejemplo:
```prisma
model Presupuesto {
  id Int @id
  ticketId Int @unique @map("ticket_id")
  total Float
  descuento Float @default(0)
  totalFinal Float @map("total_final")
  @@map("presupuestos")
}
```

### APIs REST
- Rutas en **kebab-case**
- Ejemplo: `/api/tickets`, `/api/checklist-diagnostico`, `/api/presupuestos`

### Frontend (TypeScript/React)
- Componentes en **PascalCase**
- Variables, funciones y props en **camelCase**
- Ejemplo:
```typescript
interface Presupuesto {
  id: number;
  ticketId: number;
  total: number;
  descuento: number;
  totalFinal: number;
  conceptos: ConceptoPresupuesto[];
}
```

### Servicios (TypeScript)
- Clases de servicio en **PascalCase** con sufijo `Service`
- Métodos en **camelCase**
- Uso de tipos/interfaces para los parámetros y retornos
- Ejemplo:
```typescript
export class ChecklistService {
  static async getAll(): Promise<ChecklistItem[]> {
    try {
      return await prisma.checklistItem.findMany({
        orderBy: {
          descripcion: 'asc'
        }
      });
    } catch (error) {
      console.error('Error en getAll:', error);
      throw new Error('Error al obtener los items del checklist');
    }
  }
}

## Diccionario de Mapeo

### Modelo Ticket
| Capa | Nombre | Ejemplo |
|------|---------|---------|
| Base de Datos | `tickets` | `numero_ticket`, `descripcion_problema` |
| Prisma | `Ticket` | `numeroTicket`, `descripcionProblema` |
| API | `/api/tickets` | `POST /api/tickets` |
| Frontend | `Ticket` | `numeroTicket`, `descripcionProblema` |

### Modelo Modelo
| Capa | Nombre | Ejemplo |
|------|---------|---------|
| Base de Datos | `modelos` | `nombre`, `marca_id` |
| Prisma | `Modelo` | `nombre`, `marcaId` |
| API | `/api/catalogo/modelos` | `GET /api/catalogo/modelos` |
| Frontend | `Modelo` | `nombre`, `marcaId` |

### Modelo ChecklistDiagnostico
| Capa | Nombre | Ejemplo |
|------|---------|---------|
| Base de Datos | `checklist_diagnostico` | `reparacion_id`, `created_at` |
| Prisma | `ChecklistDiagnostico` | `reparacionId`, `createdAt` |
| API | `/api/checklist-diagnostico` | `POST /api/checklist-diagnostico` |
| Frontend | `ChecklistDiagnostico` | `reparacionId`, `createdAt` |

### Modelo ChecklistItem
| Capa | Nombre | Ejemplo |
|------|---------|---------|
| Base de Datos | `checklist_items` | `checklist_diagnostico_id`, `descripcion`, `completado`, `notas` |
| Prisma | `ChecklistItem` | `checklistDiagnosticoId`, `descripcion`, `completado`, `notas` |
| API | `/api/checklist` | `POST /api/checklist` |
| Frontend | `ChecklistItem` | `checklistDiagnosticoId`, `descripcion`, `completado`, `notas` |

### Modelo Presupuesto
| Capa | Nombre | Ejemplo |
|------|---------|---------|
| Base de Datos | `presupuestos` | `ticket_id`, `total`, `descuento`, `total_final` |
| Prisma | `Presupuesto` | `ticketId`, `total`, `descuento`, `totalFinal` |
| API | `/api/presupuestos` | `POST /api/presupuestos` |
| Frontend | `Presupuesto` | `ticketId`, `total`, `descuento`, `totalFinal` |

### Modelo ConceptoPresupuesto
| Capa | Nombre | Ejemplo |
|------|---------|---------|
| Base de Datos | `conceptos_presupuesto` | `presupuesto_id`, `descripcion`, `cantidad`, `precio_unitario`, `total` |
| Prisma | `ConceptoPresupuesto` | `presupuestoId`, `descripcion`, `cantidad`, `precioUnitario`, `total` |
| API | `/api/presupuestos/conceptos` | `POST /api/presupuestos/conceptos` |
| Frontend | `ConceptoPresupuesto` | `presupuestoId`, `descripcion`, `cantidad`, `precioUnitario`, `total` |

### Modelo Pieza
| Capa | Nombre | Ejemplo |
|------|---------|---------|
| Base de Datos | `piezas` | `nombre`, `marca_id`, `modelo_id`, `stock`, `precio` |
| Prisma | `Pieza` | `nombre`, `marcaId`, `modeloId`, `stock`, `precio` |
| API | `/api/piezas` | `POST /api/piezas` |
| Frontend | `Pieza` | `nombre`, `marcaId`, `modeloId`, `stock`, `precio` |

### Modelo Producto
| Capa         | Nombre                        | Ejemplo                                  |
|--------------|-------------------------------|------------------------------------------|
| Base de Datos| `productos`                   | `nombre`, `marca_id`, `modelo_id`, `proveedor_id`, `categoria_id`, `precio_promedio`, `stock`, `tipo_servicio_id`, `stock_maximo`, `stock_minimo`, `tipo` |
| Prisma       | `Producto`                    | `nombre`, `marcaId`, `modeloId`, `proveedorId`, `categoriaId`, `precioPromedio`, `stock`, `tipoServicioId`, `stockMaximo`, `stockMinimo`, `tipo` |
| API          | `/api/inventario/productos`   | `GET /api/inventario/productos`          |
| Frontend     | `Producto`                    | `nombre`, `marcaId`, `modeloId`, `proveedorId`, `categoriaId`, `precioPromedio`, `stock`, `tipoServicioId`, `stockMaximo`, `stockMinimo`, `tipo` |

### Modelo PuntoRecoleccion
| Capa | Nombre | Ejemplo |
|------|---------|---------|
| Base de Datos | `puntos_recoleccion` | `nombre`, `phone`, `schedule`, `location`, `is_headquarters`, `parent_id` |
| Prisma | `PuntoRecoleccion` | `nombre`, `telefono`, `horario`, `ubicacion`, `esSedePrincipal`, `sedePrincipalId` |
| API | `/api/puntos-recoleccion` | `GET /api/puntos-recoleccion` |
| Frontend | `PuntoRecoleccion` | `nombre`, `telefono`, `horario`, `ubicacion`, `esSedePrincipal`, `sedePrincipalId` |

#### Relaciones de PuntoRecoleccion
| Relación | Descripción | Ejemplo |
|----------|-------------|---------|
| `sedePrincipal` | Referencia a la sede principal (si es sucursal) | `punto.sedePrincipal.nombre` |
| `sucursales` | Lista de sucursales (si es sede principal) | `punto.sucursales.map(s => s.nombre)` |

#### Reglas de Validación
1. Un punto debe ser o sede principal o sucursal, no ambos
2. Las sucursales deben tener una sede principal asignada
3. Las sedes principales no pueden tener una sede principal asignada
4. El horario y la ubicación deben ser objetos JSON válidos

### Modelo Proveedor
| Capa | Nombre | Ejemplo |
|------|---------|---------|
| Base de Datos | `proveedores` | `nombre`, `contacto`, `telefono`, `email`, `direccion`, `notas`, `banco`, `clabe_interbancaria`, `cuenta_bancaria`, `rfc`, `tipo` |
| Prisma | `Proveedor` | `nombre`, `contacto`, `telefono`, `email`, `direccion`, `notas`, `banco`, `clabeInterbancaria`, `cuentaBancaria`, `rfc`, `tipo` |
| API | `/api/catalogo/proveedores` | `POST /api/catalogo/proveedores` |
| Frontend | `Proveedor` | `nombre`, `contacto`, `telefono`, `email`, `direccion`, `notas`, `banco`, `clabeInterbancaria`, `cuentaBancaria`, `rfc`, `tipo` |

#### Reglas de Validación
1. Los campos `nombre`, `contacto`, `telefono`, `rfc`, `banco`, `cuentaBancaria` y `clabeInterbancaria` son obligatorios
2. El campo `tipo` debe ser uno de: `FISICA` o `MORAL`
3. El campo `email` debe ser un email válido si se proporciona
4. El campo `clabeInterbancaria` debe tener 18 caracteres

### Relaciones
| Modelo | Campo | Tipo | Ejemplo |
|--------|-------|------|---------|
| `Modelo` | `marca` | Relación | `modelo.marca.nombre` |
| `Ticket` | `modelo` | Relación | `ticket.modelo.nombre` |
| `ChecklistItem` | `checklistDiagnostico` | Relación | `checklistItem.checklistDiagnostico.id` |
| `ChecklistDiagnostico` | `reparacion` | Relación | `checklistDiagnostico.reparacion.id` |
| `Presupuesto` | `ticket` | Relación | `presupuesto.ticket.id` |
| `ConceptoPresupuesto` | `presupuesto` | Relación | `conceptoPresupuesto.presupuesto.id` |
| `Pieza` | `marca` | Relación | `pieza.marca.nombre` |
| `Pieza` | `modelo` | Relación | `pieza.modelo.nombre` |

### Relaciones de Producto
| Relación en Prisma | Relación en DB         | Ejemplo de uso en include                |
|--------------------|-----------------------|------------------------------------------|
| `marcas`           | `marcas`              | `include: { marcas: true }`              |
| `Modelo`           | `modelos`             | `include: { Modelo: true }`              |
| `proveedores`      | `proveedores`         | `include: { proveedores: true }`         |
| `categorias`       | `categorias`          | `include: { categorias: true }`          |
| `fotos_producto`   | `fotos_producto`      | `include: { fotos_producto: true }`      |
| `inventarios_minimos` | `inventarios_minimos` | `include: { inventarios_minimos: true }` |

## Proceso de Migración

### Fase 1: Schema de Prisma ✅
- [x] Actualizar modelo `Ticket` en `schema.prisma`
- [x] Agregar mapeos (`@map`) para todos los campos
- [x] Estandarizar nombres de relaciones
- [x] Mantener consistencia entre snake_case en DB y camelCase en código

### Fase 2: APIs
- [x] Actualizar API de tickets
- [x] Actualizar API de modelos
- [x] Actualizar API de checklist diagnóstico
- [x] Actualizar API de presupuestos
- [x] Actualizar API de piezas

### Fase 3: Frontend
- [ ] Actualizar componentes de tickets
- [ ] Actualizar componentes de modelos
- [ ] Actualizar componentes de checklist
- [ ] Actualizar componentes de presupuestos
- [ ] Actualizar componentes de piezas

## Reglas de Validación

### Schema de Prisma
```prisma
model Presupuesto {
  id Int @id @default(autoincrement())
  ticketId Int @unique @map("ticket_id")
  total Float
  descuento Float @default(0)
  totalFinal Float @map("total_final")
  aprobado Boolean @default(false)
  fechaAprobacion DateTime? @map("fecha_aprobacion")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  ticket Ticket @relation(fields: [ticketId], references: [id])
  conceptos ConceptoPresupuesto[]
  @@map("presupuestos")
}

model ConceptoPresupuesto {
  id Int @id @default(autoincrement())
  presupuestoId Int @map("presupuesto_id")
  descripcion String
  cantidad Int
  precioUnitario Float @map("precio_unitario")
  total Float
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  presupuesto Presupuesto @relation(fields: [presupuestoId], references: [id])
  @@map("conceptos_presupuesto")
}

model Pieza {
  id Int @id @default(autoincrement())
  nombre String
  marcaId Int @map("marca_id")
  modeloId Int @map("modelo_id")
  stock Int @default(0)
  precio Float
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  marca Marca @relation(fields: [marcaId], references: [id])
  modelo Modelo @relation(fields: [modeloId], references: [id])
  reparaciones PiezaReparacion[]
  @@map("piezas")
}
```

### API Routes
```typescript
// GET /api/presupuestos
const presupuestos = await prisma.presupuesto.findMany({
  include: {
    conceptos: true,
    ticket: true
  }
});

// POST /api/presupuestos
const presupuesto = await prisma.presupuesto.create({
  data: {
    ticketId: id,
    total: 1000,
    descuento: 0,
    totalFinal: 1000,
    conceptos: {
      create: [
        {
          descripcion: "Cambio de pantalla",
          cantidad: 1,
          precioUnitario: 1000,
          total: 1000
        }
      ]
    }
  }
});

// GET /api/piezas
const piezas = await prisma.pieza.findMany({
  include: {
    marca: true,
    modelo: true
  }
});
```

### Frontend Components
```typescript
interface Presupuesto {
  id: number;
  ticketId: number;
  total: number;
  descuento: number;
  totalFinal: number;
  aprobado: boolean;
  fechaAprobacion: Date | null;
  createdAt: Date;
  updatedAt: Date;
  conceptos: ConceptoPresupuesto[];
}

interface ConceptoPresupuesto {
  id: number;
  presupuestoId: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Pieza {
  id: number;
  nombre: string;
  marcaId: number;
  modeloId: number;
  stock: number;
  precio: number;
  createdAt: Date;
  updatedAt: Date;
  marca: {
    id: number;
    nombre: string;
  };
  modelo: {
    id: number;
    nombre: string;
  };
}
```

## Plan de Estandarización para Usuarios, Roles y Autenticación

### 1. Modelos y Diccionario de Mapeo

- **Base de datos:** Tablas `usuarios`, `roles`, `permisos`, `usuarios_roles`, `roles_permisos`
- **Prisma:** Modelos `Usuario`, `Rol`, `Permiso`, `UsuarioRol`, `RolPermiso`
- **API:** Rutas `/api/usuarios`, `/api/roles`, `/api/permisos`, `/api/auth/login`
- **Frontend:** Interfaces y formularios para registro, login, gestión de roles y permisos

### 2. Convenciones y Reglas

- **Nombres de campos:** 
  - DB: snake_case (`usuario_roles`)
  - Prisma: camelCase (`usuarioRoles`)
  - API/Frontend: camelCase (`usuarioRoles`)
- **Relaciones:** 
  - Un usuario puede tener varios roles (`usuarioRoles`)
  - Un rol puede tener varios permisos (`rolPermisos`)
- **Autenticación:** 
  - Login y registro deben usar los nombres y relaciones estandarizadas
  - El payload de sesión debe incluir roles y permisos en el formato definido

### 3. Proceso de Migración

- [ ] Revisar y actualizar modelos en `schema.prisma` para asegurar consistencia de nombres y relaciones
- [ ] Actualizar servicios y APIs de usuarios para:
  - Crear usuarios con roles usando la relación `usuarioRoles`
  - Actualizar roles de usuario de forma transaccional y estandarizada
  - Consultar usuarios incluyendo roles y permisos correctamente anidados
- [ ] Actualizar lógica de autenticación (login) para:
  - Validar usuario y contraseña usando los campos correctos
  - Incluir roles y permisos en el objeto de sesión
- [ ] Actualizar el frontend para:
  - Usar los nuevos nombres y estructuras en formularios y vistas
  - Validar y mostrar roles/permisos correctamente

### 4. Validación

- [ ] Pruebas de registro y login con diferentes combinaciones de roles
- [ ] Pruebas de asignación y actualización de roles
- [ ] Pruebas de acceso a rutas protegidas según permisos

### 5. Ejemplo de Mapeo

| Capa         | Nombre/Relación         | Ejemplo                                 |
|--------------|------------------------|-----------------------------------------|
| DB           | `usuarios_roles`       | `usuario_id`, `rol_id`                  |
| Prisma       | `usuarioRoles`         | `usuarioRoles: UsuarioRol[]`            |
| API/Frontend | `usuarioRoles`