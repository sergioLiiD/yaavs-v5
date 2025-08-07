import axios from '@/lib/axios';

export interface Producto {
  id: number;
  sku: string;
  nombre: string;
  descripcion?: string;
  stock: number;
  precio_promedio: number;
  tipo: 'PRODUCTO' | 'SERVICIO';
  categoria_id?: number;
  marca_id?: number;
  modelo_id?: number;
  categoria?: {
    id: number;
    nombre: string;
  };
  marca?: {
    id: number;
    nombre: string;
  };
  modelo?: {
    id: number;
    nombre: string;
  };
}

export interface ProductoVenta {
  id: number;
  nombre: string;
  descripcion?: string;
  stock: number;
  precio: number;
  sku: string;
}

export class ProductoService {
  // Obtener todos los productos disponibles para venta
  static async getProductosVenta(): Promise<ProductoVenta[]> {
    try {
      const response = await axios.get('/api/productos');
      return response.data;
    } catch (error) {
      console.error('Error al obtener productos para venta:', error);
      throw new Error('Error al obtener los productos');
    }
  }

  // Buscar productos por nombre o SKU
  static async buscarProductos(termino: string): Promise<ProductoVenta[]> {
    try {
      const response = await axios.get(`/api/productos?search=${encodeURIComponent(termino)}`);
      return response.data;
    } catch (error) {
      console.error('Error al buscar productos:', error);
      throw new Error('Error al buscar productos');
    }
  }

  // Obtener un producto por ID
  static async getById(id: number): Promise<ProductoVenta | null> {
    try {
      const producto = await prisma.productos.findUnique({
        where: { id },
        select: {
          id: true,
          nombre: true,
          descripcion: true,
          stock: true,
          precio_promedio: true,
          sku: true,
          categoria: {
            select: {
              id: true,
              nombre: true
            }
          },
          marca: {
            select: {
              id: true,
              nombre: true
            }
          },
          modelo: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      });

      if (!producto) return null;

      return {
        ...producto,
        precio: producto.precio_promedio
      };
    } catch (error) {
      console.error('Error al obtener producto por ID:', error);
      throw new Error('Error al obtener el producto');
    }
  }

  // Verificar stock disponible
  static async verificarStock(productoId: number, cantidad: number): Promise<boolean> {
    try {
      const producto = await prisma.productos.findUnique({
        where: { id: productoId },
        select: { stock: true }
      });

      if (!producto) return false;

      return producto.stock >= cantidad;
    } catch (error) {
      console.error('Error al verificar stock:', error);
      throw new Error('Error al verificar el stock');
    }
  }

  // Actualizar stock después de venta
  static async actualizarStock(productoId: number, cantidad: number, usuarioId: number, razon: string = 'VENTA'): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        // Actualizar stock del producto
        await tx.productos.update({
          where: { id: productoId },
          data: {
            stock: {
              decrement: cantidad
            }
          }
        });

        // Registrar salida de almacén
        await tx.salidas_almacen.create({
          data: {
            producto_id: productoId,
            cantidad,
            razon,
            tipo: 'VENTA',
            usuario_id: usuarioId,
            fecha: new Date()
          }
        });
      });
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      throw new Error('Error al actualizar el stock');
    }
  }
} 