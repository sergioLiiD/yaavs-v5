# Referencia de Base de Datos

Este documento sirve como referencia para mantener la consistencia en los nombres de tablas, modelos y relaciones en la base de datos.

## Tablas y Modelos

### Marcas y Modelos

| Entidad | Nombre en Prisma | Nombre en DB | Relaciones |
|---------|------------------|--------------|------------|
| Marca | `Marca` | `marcas` | - `Modelo[]` (relación con modelos) |
| Modelo | `Modelo` | `modelos` | - `marca: Marca` (relación con marca) |

### Checklist

| Entidad | Nombre en Prisma | Nombre en DB | Relaciones |
|---------|------------------|--------------|------------|
| Checklist Item | `checklist_items` | `checklist_items` | - Sin relaciones directas |

### Uso en Código

```typescript
// Consultas con Prisma
const modelos = await prisma.modelo.findMany({
  include: {
    marcas: true  // Usar 'marcas' para la relación
  }
});

// Creación de registros
const modelo = await prisma.modelo.create({
  data: {
    nombre: "Nombre del Modelo",
    marcaId: 1
  }
});

// Consulta de items de checklist
const items = await prisma.checklist_items.findMany({
  orderBy: {
    nombre: 'asc'
  }
});
```

## Convenciones de Nombres

1. **Tablas en Base de Datos**: Nombres en plural y minúsculas
   - Ejemplo: `marcas`, `modelos`, `checklist_items`

2. **Modelos en Prisma**: Nombres en singular y PascalCase
   - Ejemplo: `Marca`, `Modelo`
   - Excepción: `checklist_items` (mantiene el nombre de la tabla)

3. **Relaciones en Prisma**:
   - Relaciones uno a muchos: nombre en plural
   - Relaciones muchos a uno: nombre en singular
   - Ejemplo: `marca: Marca` (en Modelo), `Modelo[]` (en Marca)

## Notas Importantes

- Siempre usar `marcas` (plural) al hacer consultas con `include` en Prisma
- Los campos `createdAt` y `updatedAt` son manejados automáticamente por Prisma
- Las relaciones deben seguir el patrón definido en el esquema de Prisma
- Para el checklist, usar `checklist_items` (con guión bajo) en lugar de `checklistItem` (camelCase)

## Ejemplos de Uso

### Consulta de Modelos por Marca
```typescript
const modelos = await prisma.modelo.findMany({
  where: {
    marcaId: marcaId
  },
  include: {
    marcas: true  // ✅ Correcto
    // marca: true  // ❌ Incorrecto
  }
});
```

### Creación de Modelo
```typescript
const modelo = await prisma.modelo.create({
  data: {
    nombre: "Nuevo Modelo",
    marcaId: marcaId
  },
  include: {
    marcas: true  // ✅ Correcto
  }
});
```

### Consulta de Checklist
```typescript
// ✅ Correcto
const items = await prisma.checklist_items.findMany({
  orderBy: {
    nombre: 'asc'
  }
});

// ❌ Incorrecto
const items = await prisma.checklistItem.findMany({
  orderBy: {
    nombre: 'asc'
  }
});
```

## Lecciones Aprendidas

### Caso 1: Confusión en nombres de relaciones (2024-03-19)
**Problema**: Confusión entre `marca` y `marcas` en las consultas de Prisma.
**Solución**: 
- En el esquema de Prisma, la relación se define como `marca: Marca` en el modelo `Modelo`
- Sin embargo, en las consultas con `include`, debemos usar `marcas: true`
- Esto es porque Prisma genera el nombre de la relación basado en el nombre de la tabla en la base de datos (`marcas`)

**Código que NO funciona**:
```typescript
const modelos = await prisma.modelo.findMany({
  include: {
    marca: true  // ❌ Error: Unknown field 'marca'
  }
});
```

**Código que SÍ funciona**:
```typescript
const modelos = await prisma.modelo.findMany({
  include: {
    marcas: true  // ✅ Correcto
  }
});
```

### Caso 2: Campos automáticos de Prisma (2024-03-19)
**Problema**: Error de TypeScript sobre campo `updatedAt` faltante.
**Solución**: 
- Los campos `createdAt` y `updatedAt` son manejados automáticamente por Prisma
- No es necesario incluirlos en el objeto `data` al crear registros
- Prisma los establecerá automáticamente con los valores correctos

**Código que NO funciona**:
```typescript
const modelo = await prisma.modelo.create({
  data: {
    nombre: "Nuevo Modelo",
    marcaId: 1,
    updatedAt: new Date()  // ❌ No es necesario
  }
});
```

**Código que SÍ funciona**:
```typescript
const modelo = await prisma.modelo.create({
  data: {
    nombre: "Nuevo Modelo",
    marcaId: 1
    // ✅ Prisma maneja updatedAt automáticamente
  }
});
```

### Caso 3: Nombres de modelos con guiones bajos (2024-03-20)
**Problema**: Error al intentar acceder a `checklistItem` cuando el modelo se llama `checklist_items`.
**Solución**: 
- Algunos modelos mantienen el nombre exacto de la tabla en la base de datos
- En estos casos, usar el nombre con guiones bajos en lugar de camelCase
- Ejemplo: `checklist_items` en lugar de `checklistItem`

**Código que NO funciona**:
```typescript
const items = await prisma.checklistItem.findMany();  // ❌ Error: Cannot read properties of undefined
```

**Código que SÍ funciona**:
```typescript
const items = await prisma.checklist_items.findMany();  // ✅ Correcto
```

### Caso 4: Relaciones del modelo Producto (2024-03-21)
**Problema**: Confusión en los nombres de las relaciones al consultar productos.
**Solución**: 
- Las relaciones en el modelo Producto deben usar los nombres exactos definidos en el esquema
- Los nombres correctos son:
  - `marcas` (no `marca`)
  - `Modelo` (no `modelo`)
  - `proveedores` (no `proveedor`)
  - `categorias` (no `categoria`)
  - `fotos_producto` (no `fotos`)
  - `inventarios_minimos` (no `inventarioMinimo`)

**Código que NO funciona**:
```typescript
// En el frontend (TypeScript/React)
interface Producto {
  marca: { nombre: string };  // ❌ Incorrecto
  modelo: { nombre: string }; // ❌ Incorrecto
}

// En el componente
<div>{producto.marca.nombre} - {producto.modelo.nombre}</div>  // ❌ Error: Cannot read properties of undefined
```

**Código que SÍ funciona**:
```typescript
// En el frontend (TypeScript/React)
interface Producto {
  marcas: { nombre: string };  // ✅ Correcto
  Modelo: { nombre: string };  // ✅ Correcto
}

// En el componente
<div>{producto.marcas.nombre} - {producto.Modelo.nombre}</div>  // ✅ Correcto
```

**Nota**: Este error es común cuando se trabaja con el modelo Producto en el frontend, ya que los nombres de las relaciones en la interfaz TypeScript deben coincidir exactamente con los nombres que vienen de la API, que a su vez coinciden con los nombres definidos en el esquema de Prisma.

### Caso 5: Relación faltante en el modelo Ticket (2024-06-01)
**Problema**: Error 500 al intentar cargar tickets debido a una relación faltante con `TipoServicio`.
**Solución**: 
- El modelo `Ticket` tenía un campo `tipoServicioId` pero no tenía definida la relación con `TipoServicio`
- Se agregó la relación en ambos modelos:
  ```prisma
  model Ticket {
    // ... otros campos ...
    tipoServicioId         Int
    tipoServicio           TipoServicio      @relation(fields: [tipoServicioId], references: [id])
  }

  model TipoServicio {
    // ... otros campos ...
    tickets     Ticket[]
  }
  ```
- Se generó y aplicó la migración correspondiente
- Se regeneró el cliente de Prisma

**Código que NO funciona**:
```typescript
const tickets = await prisma.ticket.findMany({
  include: {
    tipoServicio: true  // ❌ Error: Unknown field 'tipoServicio'
  }
});
```

**Código que SÍ funciona**:
```typescript
const tickets = await prisma.ticket.findMany({
  include: {
    tipoServicio: true  // ✅ Correcto después de agregar la relación
  }
});
```

**Nota**: Este error es común cuando se agrega un campo de ID para una relación pero se olvida definir la relación en el esquema de Prisma. Siempre asegurarse de definir ambas partes de la relación: el campo de ID y la relación en sí.

### Caso 6: Modelo de Puntos de Recolección (2024-06-02)
**Problema**: Necesidad de manejar puntos de recolección con sucursales y puntos de reparación.
**Solución**: 
- Se creó el modelo `puntos_recoleccion` con soporte para:
  - Puntos principales y sucursales
  - Horarios en formato JSON
  - Ubicación con coordenadas
  - Puntos de reparación
  - Relaciones jerárquicas entre puntos

```prisma
model puntos_recoleccion {
  id            String                        @id @default(uuid())
  name          String
  phone         String
  email         String                        @unique
  url           String?
  schedule      Json                          // Array de horarios
  location      Json                          // {address, latitude, longitude}
  isHeadquarters Boolean                      @default(false)
  isRepairPoint Boolean                       @default(false)
  parentId      String?                       // ID del punto principal
  parent        puntos_recoleccion?           @relation("BranchToHeadquarters", fields: [parentId], references: [id])
  branches      puntos_recoleccion[]          @relation("BranchToHeadquarters")
  activo        Boolean                       @default(true)
  createdAt     DateTime                      @default(now())
  updatedAt     DateTime                      @updatedAt
  usuarios_puntos_recoleccion usuarios_puntos_recoleccion[]
}
```

**Código que NO funciona**:
```typescript
// En el frontend
interface CollectionPoint {
  location: string;  // ❌ Incorrecto
  schedule: string;  // ❌ Incorrecto
}

// En el backend
const punto = await prisma.puntos_recoleccion.create({
  data: {
    location: "Av. Reforma 123",  // ❌ Error: Expected JSON
    schedule: "9:00-18:00"        // ❌ Error: Expected JSON
  }
});
```

**Código que SÍ funciona**:
```typescript
// En el frontend
interface CollectionPoint {
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  schedule: Array<{
    day: string;
    openTime: string;
    closeTime: string;
  }>;
}

// En el backend
const punto = await prisma.puntos_recoleccion.create({
  data: {
    location: {
      address: "Av. Reforma 123",
      latitude: 19.4326,
      longitude: -99.1332
    },
    schedule: [
      {
        day: "Lunes",
        openTime: "09:00",
        closeTime: "18:00"
      }
    ]
  }
});
```

**Notas importantes**:
1. Los campos `schedule` y `location` son de tipo `Json` en Prisma, por lo que deben enviarse como objetos JavaScript
2. La relación `BranchToHeadquarters` permite crear una jerarquía de puntos
3. El campo `isRepairPoint` indica si el punto realiza reparaciones
4. Los usuarios se asocian a través de la tabla `usuarios_puntos_recoleccion`

## Actualizaciones

Este documento debe actualizarse cada vez que:
1. Se agreguen nuevas tablas o modelos
2. Se modifiquen relaciones existentes
3. Se cambien nombres de tablas o modelos
4. Se agreguen nuevas convenciones de nombres
5. Se encuentren nuevos casos de uso o problemas que resolver 

## Nombres de Campos y Relaciones en Prisma

### Campos en el Modelo Producto
| Campo en Prisma | Nombre en el Código | Descripción |
|----------------|-------------------|-------------|
| `marcas` | `marcas` | Relación con la marca del producto |
| `Modelo` | `Modelo` | Relación con el modelo del producto |
| `proveedores` | `proveedores` | Relación con el proveedor del producto |
| `inventarios_minimos` | `inventarios_minimos` | Relación con el inventario mínimo del producto |

### Campos en el Modelo Inventarios Mínimos
| Campo en Prisma | Nombre en el Código | Descripción |
|----------------|-------------------|-------------|
| `productoId` | `productoId` | ID del producto asociado |
| `cantidadMinima` | `cantidadMinima` | Cantidad mínima de inventario |
| `createdAt` | `createdAt` | Fecha de creación (requerido) |
| `updatedAt` | `updatedAt` | Fecha de actualización (requerido) |

### Ejemplo de Consulta Correcta
```typescript
const producto = await prisma.producto.findUnique({
  where: { id: productoId },
  include: {
    marcas: true,
    Modelo: true,
    proveedores: true,
    inventarios_minimos: true,
  },
});
```

### Notas Importantes
1. Los nombres de los campos son sensibles a mayúsculas y minúsculas
2. Las relaciones se nombran en plural cuando representan una colección
3. Algunos campos como `Modelo` mantienen la primera letra en mayúscula
4. Los campos `createdAt` y `updatedAt` son requeridos al crear nuevos registros

### Errores Comunes
1. Usar `marca` en lugar de `marcas`
2. Usar `modelo` en lugar de `Modelo`
3. Usar `proveedor` en lugar de `proveedores`
4. Usar `inventarioMinimo` en lugar de `inventarios_minimos`
5. Olvidar incluir `createdAt` y `updatedAt` al crear nuevos registros

## Tipos y Relaciones en el Frontend

### Tipo ProductoConInventarioMinimo
```typescript
type ProductoConInventarioMinimo = Producto & {
  inventarios_minimos: inventarios_minimos | null;
  marcas: { nombre: string };
  Modelo: { nombre: string };
  proveedores: { nombre: string };
};
```

### Campos en el Frontend
| Campo en el Frontend | Tipo | Descripción |
|---------------------|------|-------------|
| `inventarios_minimos` | `inventarios_minimos \| null` | Inventario mínimo del producto |
| `marcas` | `{ nombre: string }` | Información de la marca |
| `Modelo` | `{ nombre: string }` | Información del modelo |
| `proveedores` | `{ nombre: string }` | Información del proveedor |

### Ejemplo de Uso en Componentes
```typescript
// Filtrado de productos
const filteredProductos = productos?.filter((producto) => {
  const searchLower = searchTerm.toLowerCase();
  return (
    producto.tipo === 'PRODUCTO' && (
      (producto.marcas?.nombre?.toLowerCase() || '').includes(searchLower) ||
      (producto.Modelo?.nombre?.toLowerCase() || '').includes(searchLower) ||
      (producto.nombre?.toLowerCase() || '').includes(searchLower)
    )
  );
});

// Acceso a datos
<td>{producto.marcas?.nombre || '-'}</td>
<td>{producto.Modelo?.nombre || '-'}</td>
<td>{producto.inventarios_minimos?.cantidadMinima || 0}</td>
```

### Notas de Implementación
1. Siempre usar el operador opcional `?.` al acceder a propiedades anidadas
2. Proporcionar valores por defecto usando `||` para campos opcionales
3. Mantener consistencia en el uso de los nombres de campos
4. Validar la existencia de datos antes de mostrarlos 

## Modelos y Relaciones

### Reparaciones Frecuentes

| Entidad | Nombre en Prisma | Nombre en DB | Relaciones |
|---------|------------------|--------------|------------|
| Reparación Frecuente | `reparaciones_frecuentes` | `reparaciones_frecuentes` | - `pasos_reparacion_frecuente[]` (relación con pasos) - `productos_reparacion_frecuente[]` (relación con productos) |
| Paso de Reparación | `pasos_reparacion_frecuente` | `pasos_reparacion_frecuente` | - `reparacionFrecuenteId` (relación con reparación frecuente) |
| Producto de Reparación | `productos_reparacion_frecuente` | `productos_reparacion_frecuente` | - `reparacionFrecuenteId` (relación con reparación frecuente) - `productoId` (relación con producto) |

### Uso en Código para Reparaciones Frecuentes

```typescript
// Consulta de reparaciones frecuentes
const reparaciones = await prisma.reparaciones_frecuentes.findMany({
  include: {
    pasos_reparacion_frecuente: {
      orderBy: {
        orden: 'asc'
      }
    },
    productos_reparacion_frecuente: {
      include: {
        productos: true
      }
    }
  }
});

// Creación de reparación frecuente
const reparacion = await prisma.reparaciones_frecuentes.create({
  data: {
    nombre: "Nombre de la Reparación",
    descripcion: "Descripción",
    activo: true,
    pasos_reparacion_frecuente: {
      create: [
        {
          descripcion: "Paso 1",
          orden: 1
        }
      ]
    },
    productos_reparacion_frecuente: {
      create: [
        {
          productoId: 1,
          cantidad: 1,
          precioVenta: 100
        }
      ]
    }
  }
});

// Actualización de reparación frecuente
const reparacionActualizada = await prisma.reparaciones_frecuentes.update({
  where: { id: 1 },
  data: {
    nombre: "Nuevo Nombre",
    pasos_reparacion_frecuente: {
      deleteMany: {},
      create: [
        {
          descripcion: "Nuevo Paso",
          orden: 1
        }
      ]
    }
  }
});

// Eliminación de reparación frecuente
await prisma.reparaciones_frecuentes.delete({
  where: { id: 1 }
});
```

### Notas Importantes para Reparaciones Frecuentes

1. Los nombres de las relaciones deben ser exactamente:
   - `pasos_reparacion_frecuente` (no `pasos`)
   - `productos_reparacion_frecuente` (no `productos`)
   - `productos` (no `producto`) en la relación de inclusión

2. Los campos requeridos son:
   - `nombre`
   - `descripcion` (opcional)
   - `activo` (por defecto true)
   - `createdAt` y `updatedAt` (manejados por Prisma)

3. Al actualizar, es necesario usar `deleteMany` antes de `create` para las relaciones anidadas.

### Precios de Venta

| Entidad | Nombre en Prisma | Nombre en DB | Relaciones |
|---------|------------------|--------------|------------|
| Precio Venta | `precios_venta` | `precios_venta` | - Sin relaciones directas |

### Campos en el Modelo Precios Venta
| Campo en Prisma | Nombre en el Código | Descripción |
|----------------|-------------------|-------------|
| `id` | `id` | UUID generado automáticamente |
| `tipo` | `tipo` | Tipo de precio ('PRODUCTO' o 'SERVICIO') |
| `nombre` | `nombre` | Nombre del producto o servicio |
| `marca` | `marca` | Marca del producto |
| `modelo` | `modelo` | Modelo del producto |
| `precio_compra_promedio` | `precio_compra_promedio` | Precio promedio de compra |
| `precio_venta` | `precio_venta` | Precio de venta |
| `producto_id` | `producto_id` | ID del producto (opcional) |
| `servicio_id` | `servicio_id` | ID del servicio (opcional) |
| `created_at` | `created_at` | Fecha de creación |
| `updated_at` | `updated_at` | Fecha de actualización |
| `created_by` | `created_by` | Usuario que creó el registro |
| `updated_by` | `updated_by` | Usuario que actualizó el registro |

### Ejemplo de Consulta de Precios de Venta
```typescript
// Consulta de precios de venta
const precios = await prisma.precios_venta.findMany({
  orderBy: {
    created_at: 'desc'
  }
});

// Creación de precio de venta
const precio = await prisma.precios_venta.create({
  data: {
    tipo: 'PRODUCTO',
    nombre: 'Nombre del Producto',
    marca: 'Marca',
    modelo: 'Modelo',
    precio_compra_promedio: 100.00,
    precio_venta: 150.00,
    producto_id: 1,
    created_by: 'system',
    updated_by: 'system'
  }
});

// Actualización de precio de venta
const precioActualizado = await prisma.precios_venta.update({
  where: { id: 'uuid-del-precio' },
  data: {
    precio_venta: 160.00,
    updated_by: 'system'
  }
});
```

### Caso 5: Manejo de UUID en Precios de Venta (2024-03-22)
**Problema**: Confusión en el manejo de IDs UUID en la tabla de precios de venta.
**Solución**: 
- Los IDs en la tabla `precios_venta` son UUIDs generados automáticamente
- En el frontend, los IDs deben manejarse como strings
- Al crear o actualizar precios, no es necesario proporcionar el ID

**Código que NO funciona**:
```typescript
// En el frontend (TypeScript/React)
interface PrecioVenta {
  id: number;  // ❌ Incorrecto
}

// En la API
const precio = await prisma.precios_venta.create({
  data: {
    id: 1,  // ❌ No es necesario y causará error
    // ... otros campos
  }
});
```

**Código que SÍ funciona**:
```typescript
// En el frontend (TypeScript/React)
interface PrecioVenta {
  id: string;  // ✅ Correcto
}

// En la API
const precio = await prisma.precios_venta.create({
  data: {
    // ✅ Prisma generará el UUID automáticamente
    tipo: 'PRODUCTO',
    nombre: 'Nombre del Producto',
    // ... otros campos
  }
});
``` 