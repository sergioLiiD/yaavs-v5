import axios from '@/lib/axios';

export interface ItemVenta {
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface VentaData {
  cliente_id: number;
  usuario_id: number;
  total: number;
  productos: ItemVenta[];
}

export interface Venta {
  id: number;
  cliente_id: number;
  usuario_id: number;
  fecha: string;
  total: number;
  estado: string;
  created_at: string;
  updated_at: string;
  detalle_ventas: DetalleVenta[];
}

export interface DetalleVenta {
  id: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  created_at: string;
  updated_at: string;
}

export class VentaService {
  static async crearVenta(ventaData: VentaData): Promise<Venta> {
    try {
      const response = await axios.post('/api/ventas', ventaData);
      return response.data;
    } catch (error: any) {
      console.error('Error al crear venta:', error);
      throw new Error(error.response?.data?.error || 'Error al crear la venta');
    }
  }

  static async obtenerVentas(): Promise<Venta[]> {
    try {
      const response = await axios.get('/api/ventas');
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener ventas:', error);
      throw new Error(error.response?.data?.error || 'Error al obtener las ventas');
    }
  }

  static async obtenerVenta(id: number): Promise<Venta> {
    try {
      const response = await axios.get(`/api/ventas/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener venta:', error);
      throw new Error(error.response?.data?.error || 'Error al obtener la venta');
    }
  }
} 