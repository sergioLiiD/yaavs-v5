# Sistema de Permisos

## Descripción General

El sistema de permisos está diseñado para controlar el acceso a diferentes partes de la aplicación de manera granular. Cada usuario tiene un rol y un conjunto de permisos que determinan qué acciones puede realizar.

## Roles

- **ADMINISTRATOR**: Tiene acceso completo a todas las funcionalidades del sistema.
- **TECHNICIAN**: Acceso limitado a funcionalidades relacionadas con tickets y reparaciones.
- **CUSTOMER_SERVICE**: Acceso a funcionalidades de atención al cliente.

## Permisos

### Dashboard
- `DASHBOARD_VIEW`: Permite ver el dashboard principal.

### Tickets
- `TICKETS_VIEW`: Ver lista de tickets.
- `TICKETS_CREATE`: Crear nuevos tickets.
- `TICKETS_EDIT`: Editar tickets existentes.
- `TICKETS_DELETE`: Eliminar tickets.
- `TICKETS_ASSIGN`: Asignar tickets a técnicos.

### Clientes
- `CLIENTS_VIEW`: Ver lista de clientes.
- `CLIENTS_CREATE`: Crear nuevos clientes.
- `CLIENTS_EDIT`: Editar clientes existentes.
- `CLIENTS_DELETE`: Eliminar clientes.

### Catálogos
- `CATALOG_VIEW`: Acceso a la sección de catálogos.
- `CATALOG_CREATE`: Crear nuevos elementos en catálogos.
- `CATALOG_EDIT`: Editar elementos de catálogos.
- `CATALOG_DELETE`: Eliminar elementos de catálogos.

### Inventario
- `INVENTORY_VIEW`: Ver inventario.
- `INVENTORY_CREATE`: Crear nuevos elementos en inventario.
- `INVENTORY_EDIT`: Editar elementos del inventario.
- `INVENTORY_DELETE`: Eliminar elementos del inventario.

### Costos
- `COSTS_VIEW`: Ver información de costos.
- `COSTS_EDIT`: Editar información de costos.

### Administración
- `USERS_VIEW`: Ver lista de usuarios.
- `USERS_CREATE`: Crear nuevos usuarios.
- `USERS_EDIT`: Editar usuarios existentes.
- `USERS_DELETE`: Eliminar usuarios.
- `ROLES_VIEW`: Ver lista de roles.
- `ROLES_CREATE`: Crear nuevos roles.
- `ROLES_EDIT`: Editar roles existentes.
- `ROLES_DELETE`: Eliminar roles.
- `PERMISSIONS_VIEW`: Ver lista de permisos.

### Puntos de Recolección
- `COLLECTION_POINTS_VIEW`: Ver puntos de recolección.
- `COLLECTION_POINTS_CREATE`: Crear nuevos puntos de recolección.
- `COLLECTION_POINTS_EDIT`: Editar puntos de recolección existentes.
- `COLLECTION_POINTS_DELETE`: Eliminar puntos de recolección.

## Implementación

### Componentes

1. **RouteGuard**: Componente principal para proteger rutas basadas en permisos.
```tsx
<RouteGuard requiredPermissions={['TICKETS_VIEW']} section="Tickets">
  <TicketsPage />
</RouteGuard>
```

2. **Middleware**: Verifica permisos a nivel de ruta.
```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  // Verificación de permisos
}
```

### Configuración de Rutas

Las rutas y sus permisos requeridos están definidos en `src/config/routes.ts`:

```typescript
export const routePermissions: Record<string, string[]> = {
  '/dashboard/tickets': ['TICKETS_VIEW'],
  '/dashboard/clientes': ['CLIENTS_VIEW'],
  // ...
};
```

## Mejores Prácticas

1. **Principio de Mínimo Privilegio**: Asignar solo los permisos necesarios para cada rol.
2. **Verificación en Múltiples Niveles**: Implementar verificaciones tanto en el frontend como en el backend.
3. **Logging**: Registrar intentos de acceso y cambios en permisos.
4. **Documentación**: Mantener actualizada la documentación de permisos y roles.

## Ejemplos de Uso

### Protección de Rutas
```tsx
// Página protegida
export default function TicketsPage() {
  return (
    <RouteGuard requiredPermissions={['TICKETS_VIEW']} section="Tickets">
      <div>Tickets Page Content</div>
    </RouteGuard>
  );
}
```

### Verificación en API
```typescript
// API endpoint
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (session.user.role !== 'ADMINISTRATOR' && 
      !session.user.permissions.includes('TICKETS_VIEW')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  // Continuar con la lógica de la API
}
```

## Mantenimiento

1. Revisar periódicamente los permisos asignados a cada rol.
2. Actualizar la documentación cuando se agreguen nuevos permisos.
3. Realizar auditorías de seguridad periódicas.
4. Mantener un registro de cambios en el sistema de permisos. 