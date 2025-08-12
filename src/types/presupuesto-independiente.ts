export interface PresupuestoIndependiente {
  id: number;
  nombre: string;
  descripcion?: string;
  cliente_nombre?: string;
  usuario_id: number;
  total: number;
  created_at: string;
  updated_at: string;
  usuarios?: {
    id: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string;
  };
  productos_presupuesto_independiente?: ProductoPresupuestoIndependiente[];
}

export interface ProductoPresupuestoIndependiente {
  id: number;
  presupuesto_independiente_id: number;
  producto_id?: number;
  cantidad: number;
  precio_venta: number;
  concepto_extra?: string;
  precio_concepto_extra?: number;
  created_at: string;
  updated_at: string;
  productos?: {
    id: number;
    nombre: string;
    precio_promedio: number;
    tipo: string;
    sku: string;
    stock: number;
    marca?: { nombre: string };
    modelo?: { nombre: string };
  };
}

export interface PresupuestoIndependienteCompleto {
  id: number;
  nombre: string;
  descripcion?: string;
  cliente_nombre?: string;
  usuario_id: number;
  total: number;
  created_at: string;
  updated_at: string;
  usuarios: {
    id: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string;
  };
  productos_presupuesto_independiente: ProductoPresupuestoIndependiente[];
}

export interface CreatePresupuestoIndependienteRequest {
  nombre: string;
  descripcion?: string;
  cliente_nombre?: string;
  productos: Array<{
    productoId: number;
    cantidad: number;
    precioVenta: number;
    conceptoExtra?: string;
    precioConceptoExtra?: number;
  }>;
}

export interface UpdatePresupuestoIndependienteRequest {
  nombre: string;
  descripcion?: string;
  cliente_nombre?: string;
  productos: Array<{
    id?: string;
    productoId: number;
    cantidad: number;
    precioVenta: number;
    conceptoExtra?: string;
    precioConceptoExtra?: number;
  }>;
}
