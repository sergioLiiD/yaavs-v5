import axios from '@/lib/axios';
import { ProductoService } from './productoService';

export interface ItemVenta {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface VentaData {
  clienteId: number;
  items: ItemVenta[];
  total: number;
  usuarioId: number;
}

export interface Venta {
  id: number;
  cliente_id: number;
  fecha: Date;
  total: number;
  estado: string;
  cliente?: {
    id: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string;
    email: string;
  };
  items?: VentaItem[];
}

export interface VentaItem {
  id: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto?: {
    id: number;
    nombre: string;
    sku: string;
    descripcion?: string;
  };
}

export class VentaService {
  // Crear una nueva venta
  static async crearVenta(data: VentaData): Promise<Venta> {
    try {
      // Verificar stock para todos los productos
      for (const item of data.items) {
        const hayStock = await ProductoService.verificarStock(item.productoId, item.cantidad);
        if (!hayStock) {
          throw new Error(`Stock insuficiente para el producto ID: ${item.productoId}`);
        }
      }

      const response = await axios.post('/api/ventas', {
        clienteId: data.clienteId,
        items: data.items,
        total: data.total
      });

      return response.data;
    } catch (error) {
      console.error('Error al crear venta:', error);
      throw error;
    }
  }

  // Obtener una venta por ID con detalles
  static async getVentaById(id: number): Promise<Venta | null> {
    try {
      const venta = await prisma.ventas.findUnique({
        where: { id },
        include: {
          clientes: {
            select: {
              id: true,
              nombre: true,
              apellido_paterno: true,
              apellido_materno: true,
              email: true
            }
          },
          detalle_ventas: {
            include: {
              productos: {
                select: {
                  id: true,
                  nombre: true,
                  sku: true,
                  descripcion: true
                }
              }
            }
          }
        }
      });

      return venta;
    } catch (error) {
      console.error('Error al obtener venta por ID:', error);
      throw new Error('Error al obtener la venta');
    }
  }

  // Obtener todas las ventas
  static async getVentas(): Promise<Venta[]> {
    try {
      const ventas = await prisma.ventas.findMany({
        include: {
          clientes: {
            select: {
              id: true,
              nombre: true,
              apellido_paterno: true,
              apellido_materno: true,
              email: true
            }
          }
        },
        orderBy: {
          fecha: 'desc'
        }
      });

      return ventas;
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      throw new Error('Error al obtener las ventas');
    }
  }

  // Generar número de recibo
  static generarNumeroRecibo(): string {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    const hora = String(fecha.getHours()).padStart(2, '0');
    const minuto = String(fecha.getMinutes()).padStart(2, '0');
    const segundo = String(fecha.getSeconds()).padStart(2, '0');
    
    return `REC-${año}${mes}${dia}-${hora}${minuto}${segundo}`;
  }
} 