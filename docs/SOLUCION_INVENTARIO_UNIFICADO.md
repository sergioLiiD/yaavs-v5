# Solución: Unificación del Sistema de Inventario

## 🎯 Problema Identificado

El usuario reportó que al completar una reparación, no se veía el descuento en `/dashboard/inventario/stock`. Esto se debía a que el sistema tenía **dos inventarios separados**:

1. **`productos`** - Inventario general (mostrado en `/dashboard/inventario/stock`)
2. **`piezas`** - Piezas de reparación (usado para reparaciones pero sin interfaz)

## 🔧 Solución Implementada

### 1. Migración de Datos
- **Script**: `scripts/migrate-piezas-to-productos.sql`
- **Ejecución**: `scripts/execute-migration-piezas.sh`
- **Resultado**: Las piezas se convierten en productos con SKU `PIEZA-{id}`

### 2. Nueva Estructura de Datos
```sql
-- Nueva tabla para relacionar reparaciones con productos
CREATE TABLE piezas_reparacion_productos (
    id SERIAL PRIMARY KEY,
    reparacion_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio FLOAT NOT NULL,
    total FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reparacion_id) REFERENCES reparaciones(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);
```

### 3. Código Actualizado
- **`src/lib/inventory-utils.ts`**: Modificado para usar `productos` en lugar de `piezas`
- **`prisma/schema.prisma`**: Agregada nueva tabla y relaciones
- **Endpoints**: Actualizados para usar el nuevo sistema

## 🚀 Beneficios de la Solución

### ✅ Unificación Completa
- **Un solo inventario**: Todo se gestiona desde `/dashboard/inventario/stock`
- **Trazabilidad completa**: Los descuentos se ven inmediatamente
- **Consistencia de datos**: No hay duplicación entre sistemas

### ✅ Funcionalidad Mantenida
- **Validación de stock**: Sigue funcionando igual
- **Transacciones**: Garantizan integridad de datos
- **Referenciación**: Los movimientos siguen referenciados al ticket

### ✅ Mejoras Adicionales
- **Interfaz unificada**: Todo se ve en una sola página
- **Reportes unificados**: Un solo lugar para ver stock
- **Gestión simplificada**: Un solo sistema para mantener

## 📋 Pasos para Aplicar la Solución

### 1. Ejecutar Migración
```bash
# En el servidor de producción
./scripts/execute-migration-piezas.sh
```

### 2. Reconstruir Docker
```bash
# Después de hacer pull de los cambios
docker stop yaavs_app
docker rm yaavs_app
docker build -t yaavs_app .
docker run -d --name yaavs_app --network yaavs_network -p 4001:3000 [variables de entorno]
```

### 3. Verificar Funcionamiento
```bash
# Probar el sistema
./scripts/test-inventory-system.sh
```

## 🔍 Verificación

### Antes de la Migración
- ❌ Descuentos no visibles en `/dashboard/inventario/stock`
- ❌ Dos sistemas separados
- ❌ Confusión sobre dónde ver el inventario

### Después de la Migración
- ✅ Descuentos visibles inmediatamente en `/dashboard/inventario/stock`
- ✅ Un solo sistema unificado
- ✅ Interfaz clara y consistente

## 📊 Estructura Final

```
Sistema Unificado de Inventario
├── /dashboard/inventario/stock
│   ├── Productos generales
│   ├── Piezas de reparación (migradas)
│   └── Movimientos de stock
├── API Endpoints
│   ├── /api/inventario/productos
│   ├── /api/inventario/stock/salidas
│   └── /api/tickets/[id]/inventario/descuentos
└── Base de Datos
    ├── productos (unificado)
    ├── salidas_almacen (tipo: REPARACION)
    └── piezas_reparacion_productos (nueva relación)
```

## 🚨 Consideraciones Importantes

1. **Migración Segura**: Los datos existentes se preservan
2. **Compatibilidad**: El sistema sigue funcionando igual
3. **Rollback**: Se pueden revertir los cambios si es necesario
4. **Testing**: Probar en desarrollo antes de producción

## 🎉 Resultado Final

Ahora cuando completes una reparación:
1. ✅ Se valida el stock en productos
2. ✅ Se descuenta del inventario general
3. ✅ Se ve inmediatamente en `/dashboard/inventario/stock`
4. ✅ Se registra en `salidas_almacen` con referencia al ticket
5. ✅ Todo en una transacción segura 