export type TipoPrecioVenta = 'PRODUCTO' | 'SERVICIO';

export interface PrecioVenta {
  id: string;
  tipo: TipoPrecioVenta;
  nombre: string;
  marca: string;
  modelo: string;
  precio_compra_promedio: number;
  precio_venta: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface PrecioVentaInput {
  tipo: TipoPrecioVenta;
  nombre: string;
  marca: string;
  modelo: string;
  precio_compra_promedio: number;
  precio_venta: number;
}

export interface PrecioVentaUpdate extends Partial<PrecioVentaInput> {
  id: string;
} 