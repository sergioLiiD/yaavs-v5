import { prisma } from '@/lib/db/prisma';

export interface StockValidationResult {
  success: boolean;
  errors: string[];
  missingStock: Array<{
    piezaId: number;
    piezaNombre: string;
    cantidadNecesaria: number;
    stockDisponible: number;
  }>;
}

export interface InventoryTransaction {
  ticketId: number;
  salidas: Array<{
    productoId: number;
    cantidad: number;
    razon: string;
    referencia: string;
  }>;
}

/**
 * Valida si hay suficiente stock para completar una reparación
 */
export async function validarStockReparacion(ticketId: number): Promise<StockValidationResult> {
  try {
    // Obtener la reparación del ticket
    const reparacion = await prisma.reparaciones.findFirst({
      where: { ticket_id: ticketId }
    });

    if (!reparacion) {
      return {
        success: false,
        errors: ['No se encontró la reparación para este ticket'],
        missingStock: []
      };
    }

    // Obtener las piezas de la reparación (solo productos, no servicios)
    // Primero intentar en la tabla nueva
    let piezasReparacion = await prisma.piezas_reparacion_productos.findMany({
      where: { reparacion_id: reparacion.id },
      include: {
        productos: {
          include: {
            marcas: true,
            modelos: true
          }
        }
      }
    });

    // Si no hay datos en la tabla nueva, buscar en la tabla antigua
    if (piezasReparacion.length === 0) {
      console.log('No se encontraron piezas en tabla nueva, buscando en tabla antigua...');
      const piezasAntiguas = await prisma.piezas_reparacion.findMany({
        where: { reparacion_id: reparacion.id },
        include: {
          piezas: {
            include: {
              marcas: true,
              modelos: true
            }
          }
        }
      });

      // Convertir datos de la tabla antigua al formato nuevo
      piezasReparacion = piezasAntiguas.map(pa => ({
        id: pa.id,
        reparacion_id: pa.reparacion_id,
        producto_id: pa.pieza_id,
        cantidad: pa.cantidad,
        precio: pa.precio,
        total: pa.total,
        created_at: pa.created_at,
        updated_at: pa.updated_at,
        productos: pa.piezas
      }));
    }

    const errors: string[] = [];
    const missingStock: Array<{
      piezaId: number;
      piezaNombre: string;
      cantidadNecesaria: number;
      stockDisponible: number;
    }> = [];

    // Verificar stock para cada pieza
    for (const piezaRep of piezasReparacion) {
      const producto = piezaRep.productos;
      
      if (producto.stock < piezaRep.cantidad) {
        const productoNombre = `${producto.nombre} (${producto.marcas?.nombre || 'N/A'} ${producto.modelos?.nombre || 'N/A'})`;
        
        missingStock.push({
          piezaId: producto.id,
          piezaNombre: productoNombre,
          cantidadNecesaria: piezaRep.cantidad,
          stockDisponible: producto.stock
        });
        
        errors.push(
          `Stock insuficiente para ${productoNombre}: necesitas ${piezaRep.cantidad}, tienes ${producto.stock}`
        );
      }
    }

    return {
      success: errors.length === 0,
      errors,
      missingStock
    };
  } catch (error) {
    console.error('Error al validar stock de reparación:', error);
    return {
      success: false,
      errors: ['Error interno al validar stock'],
      missingStock: []
    };
  }
}

/**
 * Procesa el descuento de inventario para una reparación completada
 */
export async function procesarDescuentoInventario(ticketId: number, usuarioId: number): Promise<InventoryTransaction> {
  try {
    // Obtener la reparación del ticket
    const reparacion = await prisma.reparaciones.findFirst({
      where: { ticket_id: ticketId }
    });

    if (!reparacion) {
      throw new Error('No se encontró la reparación para este ticket');
    }

    // Obtener las piezas de la reparación
    // Primero intentar en la tabla nueva
    let piezasReparacion = await prisma.piezas_reparacion_productos.findMany({
      where: { reparacion_id: reparacion.id },
      include: {
        productos: true
      }
    });

    // Si no hay datos en la tabla nueva, buscar en la tabla antigua
    if (piezasReparacion.length === 0) {
      console.log('Procesando descuento: No se encontraron piezas en tabla nueva, buscando en tabla antigua...');
      const piezasAntiguas = await prisma.piezas_reparacion.findMany({
        where: { reparacion_id: reparacion.id },
        include: {
          piezas: true
        }
      });

      // Convertir datos de la tabla antigua al formato nuevo
      piezasReparacion = piezasAntiguas.map(pa => ({
        id: pa.id,
        reparacion_id: pa.reparacion_id,
        producto_id: pa.pieza_id,
        cantidad: pa.cantidad,
        precio: pa.precio,
        total: pa.total,
        created_at: pa.created_at,
        updated_at: pa.updated_at,
        productos: pa.piezas
      }));
    }

    const salidas: Array<{
      productoId: number;
      cantidad: number;
      razon: string;
      referencia: string;
    }> = [];

    // Procesar cada pieza en una transacción
    await prisma.$transaction(async (tx) => {
      for (const piezaRep of piezasReparacion) {
        const producto = piezaRep.productos;
        
        // Verificar stock nuevamente (por si cambió desde la validación)
        if (producto.stock < piezaRep.cantidad) {
          throw new Error(
            `Stock insuficiente para ${producto.nombre}: necesitas ${piezaRep.cantidad}, tienes ${producto.stock}`
          );
        }

        // Crear salida de almacén
        const salida = await tx.salidas_almacen.create({
          data: {
            producto_id: producto.id,
            cantidad: piezaRep.cantidad,
            tipo: 'REPARACION',
            razon: `Reparación completada - Ticket #${ticketId}`,
            referencia: `Ticket-${ticketId}`,
            usuario_id: usuarioId,
            fecha: new Date(),
            created_at: new Date(),
            updated_at: new Date()
          }
        });

        // Actualizar stock del producto
        await tx.productos.update({
          where: { id: producto.id },
          data: {
            stock: {
              decrement: piezaRep.cantidad
            },
            updated_at: new Date()
          }
        });

        salidas.push({
          productoId: producto.id,
          cantidad: piezaRep.cantidad,
          razon: `Reparación completada - Ticket #${ticketId}`,
          referencia: `Ticket-${ticketId}`
        });
      }
    });

    return {
      ticketId,
      salidas
    };
  } catch (error) {
    console.error('Error al procesar descuento de inventario:', error);
    throw error;
  }
}

/**
 * Obtiene el resumen de productos descontados para un ticket
 */
export async function obtenerResumenDescuentos(ticketId: number) {
  try {
    const salidas = await prisma.salidas_almacen.findMany({
      where: {
        referencia: `Ticket-${ticketId}`,
        tipo: 'REPARACION'
      },
      include: {
        productos: {
          include: {
            marcas: true,
            modelos: true
          }
        }
      },
      orderBy: {
        fecha: 'desc'
      }
    });

    return salidas.map(salida => ({
      id: salida.id,
      producto: salida.productos.nombre,
      marca: salida.productos.marcas.nombre,
      modelo: salida.productos.modelos.nombre,
      cantidad: salida.cantidad,
      fecha: salida.fecha,
      razon: salida.razon
    }));
  } catch (error) {
    console.error('Error al obtener resumen de descuentos:', error);
    return [];
  }
} 