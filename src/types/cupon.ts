export type TipoCupon = 'GENERAL' | 'PERSONALIZADO'
export type TipoDescuento = 'PORCENTAJE' | 'MONTO_FIJO'

export interface Cupon {
  id: number
  codigo: string
  nombre: string
  descripcion?: string
  tipo: TipoCupon
  tipo_descuento: TipoDescuento
  valor_descuento: number
  monto_minimo?: number
  fecha_inicio: string
  fecha_expiracion: string
  limite_usos?: number
  usos_actuales: number
  activo: boolean
  created_at: string
  updated_at: string
}

export interface UsoCupon {
  id: number
  cupon_id: number
  ticket_id?: number
  venta_id?: number
  usuario_id: number
  monto_descuento: number
  created_at: string
  updated_at: string
  cupon?: Cupon
  usuario?: {
    id: number
    nombre: string
    apellido_paterno: string
    email: string
  }
  ticket?: {
    id: number
    numero_ticket: string
  }
  venta?: {
    id: number
    total: number
  }
}

export interface CreateCuponData {
  codigo: string
  nombre: string
  descripcion?: string
  tipo: TipoCupon
  tipo_descuento: TipoDescuento
  valor_descuento: number
  monto_minimo?: number
  fecha_inicio: string
  fecha_expiracion: string
  limite_usos?: number
}

export interface UpdateCuponData extends Partial<CreateCuponData> {
  activo?: boolean
}

export interface CuponFilters {
  search?: string
  tipo?: TipoCupon
  activo?: boolean
  fecha_desde?: string
  fecha_hasta?: string
}

export interface GenerateCuponesData {
  cantidad: number
  prefijo?: string
  nombre: string
  descripcion?: string
  tipo_descuento: TipoDescuento
  valor_descuento: number
  monto_minimo?: number
  fecha_inicio: string
  fecha_expiracion: string
  limite_usos?: number
}
