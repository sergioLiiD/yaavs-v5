import axios from '@/lib/axios';

export interface Producto {
  id: number;
  sku: string;
  nombre: string;
  descripcion?: string;
  precio_promedio: number;
  precio_venta?: number;
  stock: number;
  tipo: 'PRODUCTO' | 'SERVICIO';
  categoria_id?: number;
  marca_id?: number;
  modelo_id?: number;
  created_at: string;
  updated_at: string;
  precios_venta?: Array<{
    precio_venta: number;
    created_at: string;
  }>;
}

export class ProductoService {
  static async obtenerProductos(): Promise<Producto[]> {
    try {
      const response = await axios.get('/api/productos');
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener productos:', error);
      throw new Error(error.response?.data?.error || 'Error al obtener los productos');
    }
  }

  static async buscarProductos(termino: string): Promise<Producto[]> {
    try {
      const response = await axios.get(`/api/productos?search=${encodeURIComponent(termino)}`);
      return response.data;
    } catch (error: any) {
      console.error('Error al buscar productos:', error);
      throw new Error(error.response?.data?.error || 'Error al buscar productos');
    }
  }

  static async obtenerProducto(id: number): Promise<Producto> {
    try {
      const response = await axios.get(`/api/productos/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener producto:', error);
      throw new Error(error.response?.data?.error || 'Error al obtener el producto');
    }
  }

  static async verificarStock(productoId: number, cantidad: number): Promise<boolean> {
    try {
      const producto = await this.obtenerProducto(productoId);
      return producto.stock >= cantidad;
    } catch (error) {
      console.error('Error al verificar stock:', error);
      return false;
    }
  }
} 