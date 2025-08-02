# Sistema de Inventario para Reparaciones

## 📋 Descripción General

Este sistema automáticamente descuenta productos del inventario cuando se completa una reparación. Solo se descuentan los productos (piezas) registrados en `piezas_reparacion`, no los servicios.

## 🔧 Componentes Implementados

### 1. Función Helper (`src/lib/inventory-utils.ts`)

#### `validarStockReparacion(ticketId: number)`
- Valida si hay suficiente stock para completar una reparación
- Retorna errores detallados si falta stock
- Incluye información específica de cada producto faltante

#### `procesarDescuentoInventario(ticketId: number, usuarioId: number)`
- Procesa el descuento de inventario en una transacción
- Crea registros en `salidas_almacen` con tipo `REPARACION`
- Actualiza el stock de los productos
- Referencia el ticket en el campo `referencia`

#### `obtenerResumenDescuentos(ticketId: number)`
- Obtiene el historial de descuentos para un ticket específico
- Incluye detalles de productos, cantidades y fechas

### 2. Endpoints Modificados

#### `POST /api/tickets/[id]/reparacion/completar`
- **Antes**: Solo completaba la reparación
- **Ahora**: 
  - Valida stock antes de completar
  - Procesa descuento de inventario
  - Retorna error si no hay suficiente stock
  - Todo en una transacción

#### `POST /api/repair-point/tickets/[id]/reparacion`
- **Antes**: Solo actualizaba la reparación
- **Ahora**:
  - Si `completar = true`, valida stock
  - Procesa descuento de inventario
  - Retorna error si no hay suficiente stock

### 3. Nuevo Endpoint

#### `GET /api/tickets/[id]/inventario/descuentos`
- Obtiene el resumen de productos descontados para un ticket
- Incluye totales y detalles de cada descuento

## 🚀 Flujo de Funcionamiento

### 1. Usuario Intenta Completar Reparación
```
Usuario → Completa Reparación → Sistema
```

### 2. Validación de Stock
```
Sistema → Verifica Stock → ¿Suficiente?
├─ Sí → Continúa
└─ No → Error con detalles
```

### 3. Procesamiento de Inventario
```
Sistema → Transacción → 
├─ Actualizar Reparación
├─ Actualizar Ticket
├─ Crear Salidas de Almacén
└─ Actualizar Stock de Productos
```

### 4. Respuesta al Usuario
```
Sistema → Usuario
├─ Éxito: "Reparación completada y inventario actualizado"
└─ Error: "No se puede completar por falta de stock"
```

## 📊 Estructura de Datos

### Tablas Principales
- **`piezas_reparacion`**: Productos usados en cada reparación
- **`salidas_almacen`**: Registro de descuentos con tipo `REPARACION`
- **`piezas`**: Inventario de productos con campo `stock`

### Campos Clave
- **`salidas_almacen.tipo`**: `REPARACION`
- **`salidas_almacen.referencia`**: `Ticket-{ticketId}`
- **`salidas_almacen.razon`**: `Reparación completada - Ticket #{ticketId}`

## 🛡️ Validaciones y Seguridad

### Validaciones Implementadas
1. **Stock Suficiente**: Verifica que haya stock antes de procesar
2. **Transacciones**: Todo se procesa en una transacción
3. **Autorización**: Solo usuarios autenticados
4. **Existencia de Datos**: Verifica que existan ticket y reparación

### Manejo de Errores
- **Stock Insuficiente**: Error 400 con detalles específicos
- **Datos Faltantes**: Error 404/500 según el caso
- **Transacciones**: Rollback automático si algo falla

## 🧪 Scripts de Prueba

### `scripts/test-inventory-system.sh`
- Verifica estructura de datos
- Muestra tickets con reparaciones
- Lista salidas de almacén por reparaciones
- Identifica productos con stock bajo

## 📈 Beneficios del Sistema

1. **Control Automático**: Descuento automático al completar reparaciones
2. **Trazabilidad**: Registro completo de qué productos se usaron
3. **Prevención de Errores**: No permite completar sin stock suficiente
4. **Auditoría**: Historial completo de movimientos de inventario
5. **Consistencia**: Transacciones aseguran integridad de datos

## 🔄 Próximos Pasos

1. **Notificaciones**: Alertas cuando el stock esté bajo
2. **Interfaz de Usuario**: Mostrar descuentos en la vista del ticket
3. **Reportes**: Reportes de movimientos de inventario
4. **Reabastecimiento**: Alertas automáticas para reabastecer

## 🚨 Consideraciones Importantes

- Solo se descuentan **productos** (piezas), no servicios
- El descuento ocurre **solo al completar** la reparación
- Si no hay stock suficiente, **no se puede completar** la reparación
- Todos los movimientos quedan **referenciados al ticket** 