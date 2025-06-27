# Mapeo entre Base de Datos (Prisma) y Código (TypeScript/JS)

## 1. Usuario

### Base de Datos (Prisma schema)
```prisma
model Usuario {
  id                Int      @id @default(autoincrement())
  email             String   @unique
  nombre            String
  apellidoPaterno   String
  apellidoMaterno   String?
  passwordHash      String
  nivel             NivelUsuario @default(TECNICO)
  activo            Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime
  // ...relaciones
}
```

### Código (TypeScript/JS)
- **Modelo Prisma:** `prisma.usuario`
- **Tipo:** `Usuario` (en `src/types/usuario.ts`)
- **DTO de creación:** `CreateUsuarioDTO`
- **Campos usados en código:**
  - `id`
  - `email`
  - `nombre`
  - `apellidoPaterno`
  - `apellidoMaterno`
  - `passwordHash`
  - `nivel` (a veces mapeado a `role` en NextAuth)
  - `activo`
  - `createdAt`
  - `updatedAt`

### Notas
- En formularios y DTOs se usa `password` (texto plano), pero en la BD siempre es `passwordHash`.
- En NextAuth, el campo `nivel` a veces se mapea a `role` en el objeto de sesión o JWT.

---

## 2. Cliente

### Base de Datos (Prisma schema)
```prisma
model Cliente {
  id               Int      @id @default(autoincrement())
  nombre           String
  apellidoPaterno  String
  apellidoMaterno  String?
  telefonoCelular  String
  telefonoContacto String?
  email            String   @unique
  calle            String?
  numeroExterior   String?
  numeroInterior   String?
  colonia          String?
  ciudad           String?
  estado           String?
  codigoPostal     String?
  latitud          Float?
  longitud         Float?
  fuenteReferencia String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime
  rfc              String?
  passwordHash     String?
  activo           Boolean  @default(true)
  tipoRegistro     String   @default("Registro en tienda")
  tickets          Ticket[]
}
```

### Código (TypeScript/JS)
- **Modelo Prisma:** `prisma.cliente`
- **Tipo:** `Cliente` (en `src/types/cliente.ts`)
- **DTO de creación:** `CreateClienteDTO`
- **Campos usados en código:**
  - `id`
  - `nombre`
  - `apellidoPaterno`
  - `apellidoMaterno`
  - `telefonoCelular`
  - `telefonoContacto`
  - `email`
  - `calle`
  - `numeroExterior`
  - `numeroInterior`
  - `colonia`
  - `ciudad`
  - `estado`
  - `codigoPostal`
  - `latitud`
  - `longitud`
  - `fuenteReferencia`
  - `createdAt`
  - `updatedAt`
  - `rfc`
  - `passwordHash`
  - `activo`
  - `tipoRegistro`

### Notas
- `passwordHash` es opcional en la BD, pero en el código se usa para autenticación de clientes.
- `tipoRegistro` tiene un valor por defecto en la BD.

---

## 3. Ticket

### Base de Datos (Prisma schema)
```prisma
model Ticket {
  id                Int      @id @default(autoincrement())
  folio             String   @unique
  fechaCreacion     DateTime @default(now())
  estatus           String   // RECIBIDO, EN_DIAGNOSTICO, PRESUPUESTO_GENERADO, EN_REPARACION, COMPLETADO
  cliente           Cliente
  tecnico           Usuario
  presupuesto       Presupuesto?
  reparacion        Reparacion?
  pagos             Pago[]
}
```

### Código (TypeScript/JS)
- **Modelo Prisma:** `prisma.ticket`
- **Tipo:** `Ticket` (en `src/types/ticket.ts`)
- **DTO de creación:** `CreateTicketDTO`
- **Campos usados en código:**
  - `id`
  - `folio`
  - `fechaCreacion`
  - `estatus`
  - `cliente`
  - `tecnico`
  - `presupuesto`
  - `reparacion`
  - `pagos`

### Notas
- `estatus` es un string que representa el estado del ticket (RECIBIDO, EN_DIAGNOSTICO, etc.).
- `cliente` y `tecnico` son relaciones a los modelos Cliente y Usuario.

---

## 4. Presupuesto

### Base de Datos (Prisma schema)
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

### Código (TypeScript/JS)
- **Modelo Prisma:** `prisma.presupuesto`
- **Tipo:** `Presupuesto` (en `src/types/presupuesto.ts`)
- **DTO de creación:** `CreatePresupuestoDTO`
- **Campos usados en código:**
  - `id`
  - `fecha`
  - `total`
  - `items`
  - `ticket`
  - `ticketId`

### Notas
- `ticketId` es una relación única a Ticket.

---

## 5. Reparacion

### Base de Datos (Prisma schema)
```prisma
model Reparacion {
  id          Int       @id @default(autoincrement())
  ticketId    Int       @unique
  tecnicoId   Int
  observaciones String?
  fechaInicio DateTime?
  fechaFin    DateTime?
  ticket      Ticket    @relation(fields: [ticketId], references: [id])
  tecnico     Usuario   @relation(fields: [tecnicoId], references: [id])
}
```

### Código (TypeScript/JS)
- **Modelo Prisma:** `prisma.reparacion`
- **Tipo:** `Reparacion` (en `src/types/reparacion.ts`)
- **DTO de creación:** `CreateReparacionDTO`
- **Campos usados en código:**
  - `id`
  - `ticketId`
  - `tecnicoId`
  - `observaciones`
  - `fechaInicio`
  - `fechaFin`
  - `ticket`
  - `tecnico`

### Notas
- `ticketId` y `tecnicoId` son relaciones a Ticket y Usuario.

---

## 6. Pago

### Base de Datos (Prisma schema)
```prisma
model Pago {
  id          Int       @id @default(autoincrement())
  ticketId    Int
  monto       Float
  fecha       DateTime
  comprobante String?
  metodoPago  String
  ticket      Ticket    @relation(fields: [ticketId], references: [id])
}
```

### Código (TypeScript/JS)
- **Modelo Prisma:** `prisma.pago`
- **Tipo:** `Pago` (en `src/types/pago.ts`)
- **DTO de creación:** `CreatePagoDTO`
- **Campos usados en código:**
  - `id`
  - `ticketId`
  - `monto`
  - `fecha`
  - `comprobante`
  - `metodoPago`
  - `ticket`

### Notas
- `ticketId` es una relación a Ticket.

---

## 7. Otros Modelos

### EstatusReparacion
- **Base de Datos:** `model EstatusReparacion`
- **Código:** `prisma.estatusReparacion`

### Modelo
- **Base de Datos:** `model Modelo`
- **Código:** `prisma.modelo`

### Proveedor
- **Base de Datos:** `model Proveedor`
- **Código:** `prisma.proveedor`

### Producto
- **Base de Datos:** `model Producto`
- **Código:** `prisma.producto`

### EntradaAlmacen
- **Base de Datos:** `model EntradaAlmacen`
- **Código:** `prisma.entradaAlmacen`

### SalidaAlmacen
- **Base de Datos:** `model SalidaAlmacen`
- **Código:** `prisma.salidaAlmacen`

---

## 8. Inconsistencias Detectadas

- **`password` vs `passwordHash`:**  
  En la base de datos y modelo Prisma siempre debe ser `passwordHash`. En formularios y DTOs, el usuario ingresa `password` (texto plano), pero nunca se guarda así en la BD.

- **`nivel` vs `role`:**  
  En NextAuth, el campo `nivel` a veces se mapea a `role` en el objeto de sesión o JWT.

- **`apellidoMaterno` puede ser null:**  
  En la BD es opcional, en el código a veces se omite o se espera como string vacío.

- **Nombres en español vs inglés:**  
  Algunos modelos usan nombres en español (ej. `Usuario`, `Cliente`) y otros en inglés (ej. `Ticket`, `Presupuesto`). Es importante mantener consistencia en la convención de nombres.

---

## 9. Recomendaciones

- **Estandarizar nombres:**  
  Decidir si se usan nombres en español o inglés para todos los modelos y campos.

- **Documentar cambios:**  
  Mantener un registro de cambios en nombres o estructuras para evitar problemas en migraciones y deployments.

- **Revisar DTOs y formularios:**  
  Asegurarse de que los DTOs y formularios usen los nombres correctos de la base de datos.

- **Pruebas de integración:**  
  Realizar pruebas de integración para verificar que los cambios no afecten la funcionalidad existente.

---

## 10. Conclusión

Este mapeo ayudará a mantener consistencia entre la base de datos y el código, evitando errores en migraciones y deployments. Es importante revisar y actualizar este documento cada vez que se realicen cambios en el esquema de la base de datos o en el código. 