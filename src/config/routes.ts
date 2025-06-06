export const routePermissions: Record<string, string[]> = {
  // Costos
  '/dashboard/costos': ['COSTS_VIEW'],
  '/dashboard/costos/precios-venta': ['COSTS_VIEW'],
  '/dashboard/costos/precios-compra': ['COSTS_VIEW'],
  '/dashboard/costos/margenes': ['COSTS_VIEW'],
  '/dashboard/costos/historial': ['COSTS_VIEW'],

  // Catálogo
  '/dashboard/catalogo': ['CATALOG_VIEW'],
  '/dashboard/catalogo/tipo-servicio': ['CATALOG_VIEW'],
  '/dashboard/catalogo/status-reparacion': ['CATALOG_VIEW'],
  '/dashboard/catalogo/proveedores': ['CATALOG_VIEW'],
  '/dashboard/catalogo/reparaciones-frecuentes': ['CATALOG_VIEW'],
  '/dashboard/catalogo/check-list': ['CATALOG_VIEW'],

  // Inventario
  '/dashboard/inventario': ['INVENTORY_VIEW'],
  '/dashboard/inventario/catalogo': ['INVENTORY_VIEW'],
  '/dashboard/inventario/minimos': ['INVENTORY_VIEW'],
  '/dashboard/inventario/stock': ['INVENTORY_VIEW'],
  '/dashboard/inventario/movimientos': ['INVENTORY_VIEW'],

  // Clientes
  '/dashboard/clientes': ['CLIENTS_VIEW'],
  '/dashboard/clientes/[id]': ['CLIENTS_VIEW'],
  '/dashboard/clientes/new': ['CLIENTS_CREATE'],
  '/dashboard/clientes/[id]/edit': ['CLIENTS_EDIT'],
  '/dashboard/clientes/[id]/delete': ['CLIENTS_DELETE'],

  // Tickets
  '/dashboard/tickets': ['TICKETS_VIEW'],
  '/dashboard/tickets/[id]': ['TICKETS_VIEW_DETAIL'],
  '/dashboard/tickets/new': ['TICKETS_CREATE'],
  '/dashboard/tickets/[id]/edit': ['TICKETS_EDIT'],
  '/dashboard/tickets/[id]/delete': ['TICKETS_DELETE'],
  '/dashboard/tickets/[id]/assign': ['TICKETS_ASSIGN'],

  // Reparaciones
  '/dashboard/reparaciones': ['REPAIRS_VIEW'],
  '/dashboard/reparaciones/[id]': ['REPAIRS_VIEW'],
  '/dashboard/reparaciones/new': ['REPAIRS_CREATE'],
  '/dashboard/reparaciones/[id]/edit': ['REPAIRS_EDIT'],
  '/dashboard/reparaciones/[id]/delete': ['REPAIRS_DELETE'],

  // Usuarios
  '/dashboard/usuarios': ['USERS_VIEW'],
  '/dashboard/usuarios/[id]': ['USERS_VIEW'],
  '/dashboard/usuarios/new': ['USERS_CREATE'],
  '/dashboard/usuarios/[id]/edit': ['USERS_EDIT'],
  '/dashboard/usuarios/[id]/delete': ['USERS_DELETE'],

  // Roles
  '/dashboard/roles': ['ROLES_VIEW'],
  '/dashboard/roles/[id]': ['ROLES_VIEW'],
  '/dashboard/roles/new': ['ROLES_CREATE'],
  '/dashboard/roles/[id]/edit': ['ROLES_EDIT'],
  '/dashboard/roles/[id]/delete': ['ROLES_DELETE'],

  // Puntos de Recolección
  '/dashboard/puntos-recoleccion': ['COLLECTION_POINTS_VIEW'],
  '/dashboard/collection-points': ['COLLECTION_POINTS_VIEW'],
  '/dashboard/puntos-recoleccion/[id]': ['COLLECTION_POINTS_VIEW'],
  '/dashboard/puntos-recoleccion/new': ['COLLECTION_POINTS_CREATE'],
  '/dashboard/puntos-recoleccion/[id]/edit': ['COLLECTION_POINTS_EDIT'],
  '/dashboard/puntos-recoleccion/[id]/delete': ['COLLECTION_POINTS_DELETE']
}; 