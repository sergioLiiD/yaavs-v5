# Filtrado de Usuarios por Punto de Recolección

Este documento explica cómo funciona el sistema unificado de autenticación y el filtrado de datos por punto de recolección.

## Autenticación

El sistema utiliza un sistema de autenticación unificado basado en NextAuth.js. Los usuarios pueden tener diferentes roles y estar asociados a puntos de recolección específicos.

### Roles de Usuario

- `ADMINISTRADOR`: Acceso total al sistema
- `ADMINISTRADOR_PUNTO`: Administrador de un punto de recolección específico
- `USUARIO_PUNTO`: Usuario operativo de un punto de recolección
- Otros roles del sistema central

### Información de Sesión

La sesión del usuario incluye:
- Datos básicos (id, email, nombre)
- Rol
- Permisos
- Punto de recolección asignado (si aplica)

## Filtrado de Datos

### Tickets

Los tickets se filtran automáticamente según el rol y punto de recolección del usuario:

1. **Administradores del Sistema**:
   - Pueden ver todos los tickets
   - Pueden crear tickets para cualquier punto de recolección

2. **Usuarios de Punto de Recolección**:
   - Solo ven tickets de su punto de recolección
   - Solo pueden crear tickets asociados a su punto
   - No pueden ver tickets de otros puntos

### Clientes

Los clientes también se filtran según el rol y punto de recolección:

1. **Administradores del Sistema**:
   - Pueden ver todos los clientes
   - Pueden crear clientes y asignarlos a cualquier punto

2. **Usuarios de Punto de Recolección**:
   - Solo ven clientes de su punto de recolección
   - Solo pueden crear clientes asociados a su punto
   - No pueden ver clientes de otros puntos

## Redirección y Acceso

1. **Rutas Protegidas**:
   - `/dashboard/*`: Sistema central
   - `/repair-point/*`: Puntos de recolección

2. **Redirección Automática**:
   - Usuarios de punto de recolección son redirigidos a `/repair-point`
   - Usuarios del sistema central son redirigidos a `/dashboard`
   - Se valida el acceso en cada ruta

## Implementación Técnica

### Middleware

El middleware (`src/middleware.ts`) verifica:
- Autenticación del usuario
- Acceso a rutas protegidas
- Redirección según rol y punto de recolección

### Endpoints de API

Los endpoints implementan filtrado automático:
- Verifican el rol y punto de recolección del usuario
- Aplican filtros en consultas a la base de datos
- Validan permisos y acceso

### Interfaz de Usuario

- Muestra solo datos relevantes según el rol
- Adapta la navegación según permisos
- Oculta opciones no disponibles

## Consideraciones de Seguridad

1. **Validación Multinivel**:
   - Validación en el cliente
   - Validación en el middleware
   - Validación en endpoints de API

2. **Aislamiento de Datos**:
   - Filtrado a nivel de base de datos
   - Verificación de permisos en cada operación
   - Tokens de sesión con información de punto de recolección

3. **Auditoría**:
   - Registro de creador en tickets y clientes
   - Trazabilidad de operaciones por punto de recolección 