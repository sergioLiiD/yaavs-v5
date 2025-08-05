import { prisma } from '@/lib/db/prisma';
import { PrismaClient } from '@prisma/client';

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
      // Si no hay reparación, no hay piezas que validar, por lo que retornamos éxito
      console.log('No se encontró la reparación para este ticket, pero esto es normal para reparaciones nuevas');
      return {
        success: true,
        errors: [],
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
        productos: {
          id: pa.piezas.id,
          created_at: pa.piezas.created_at,
          updated_at: pa.piezas.updated_at,
          nombre: pa.piezas.nombre,
          marca_id: pa.piezas.marca_id,
          modelo_id: pa.piezas.modelo_id,
          stock: pa.piezas.stock,
          sku: pa.piezas.nombre, // Usar nombre como SKU para piezas antiguas
          descripcion: null,
          notas_internas: null,
          garantia_valor: null,
          garantia_unidad: null,
          categoria_id: null,
          proveedor_id: null,
          precio_promedio: pa.piezas.precio,
          stock_maximo: null,
          stock_minimo: null,
          tipo_servicio_id: null,
          tipo: 'PRODUCTO' as const,
          marcas: pa.piezas.marcas,
          modelos: pa.piezas.modelos
        }
      }));
    }

    // Si no hay piezas de reparación, no hay stock que validar
    if (piezasReparacion.length === 0) {
      console.log('No hay piezas de reparación para validar stock');
      return {
        success: true,
        errors: [],
        missingStock: []
      };
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
      
      // Lista de conceptos que no requieren validación de stock (servicios)
      const conceptosSinStock = ['Mano de Obra', 'Diagnostico', 'Diagnóstico', 'Servicio'];
      
      // Verificar si es un servicio que no requiere stock
      const esServicio = conceptosSinStock.some(concepto => 
        producto.nombre?.includes(concepto)
      );
      
      // Solo validar stock para productos físicos, no para servicios
      if (!esServicio && producto.stock < piezaRep.cantidad) {
        const marcaNombre = producto.marcas?.nombre || 'N/A';
        const modeloNombre = producto.modelos?.nombre || 'N/A';
        const productoNombre = `${producto.nombre} (${marcaNombre} ${modeloNombre})`;
        
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
    console.log('🔍 Procesando descuento de inventario para ticket:', ticketId);
    
    // Obtener la reparación del ticket
    const reparacion = await prisma.reparaciones.findFirst({
      where: { ticket_id: ticketId }
    });

    if (!reparacion) {
      throw new Error('No se encontró la reparación para este ticket');
    }
    
    console.log('✅ Reparación encontrada:', reparacion.id);

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

      console.log('Piezas encontradas en tabla antigua:', piezasAntiguas.length);

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
        productos: {
          id: pa.piezas.id,
          created_at: pa.piezas.created_at,
          updated_at: pa.piezas.updated_at,
          nombre: pa.piezas.nombre,
          marca_id: pa.piezas.marca_id,
          modelo_id: pa.piezas.modelo_id,
          stock: pa.piezas.stock,
          sku: pa.piezas.nombre, // Usar nombre como SKU para piezas antiguas
          descripcion: null,
          notas_internas: null,
          garantia_valor: null,
          garantia_unidad: null,
          categoria_id: null,
          proveedor_id: null,
          precio_promedio: pa.piezas.precio,
          stock_maximo: null,
          stock_minimo: null,
          tipo_servicio_id: null,
          tipo: 'PRODUCTO' as const
        }
      }));
    }
    
    console.log('Total de piezas a procesar:', piezasReparacion.length);

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
        
        // Lista de conceptos que no requieren descuento de stock (servicios)
        const conceptosSinStock = ['Mano de Obra', 'Diagnostico', 'Diagnóstico', 'Servicio'];
        
        // Verificar si es un servicio que no requiere stock
        const esServicio = conceptosSinStock.some(concepto => 
          producto.nombre?.includes(concepto)
        );
        
        // Solo procesar descuento de stock para productos físicos, no para servicios
        if (!esServicio) {
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
      marca: salida.productos.marcas?.nombre || 'N/A',
      modelo: salida.productos.modelos?.nombre || 'N/A',
      cantidad: salida.cantidad,
      fecha: salida.fecha,
      razon: salida.razon
    }));
  } catch (error) {
    console.error('Error al obtener resumen de descuentos:', error);
    return [];
  }
} 

/**
 * Convierte conceptos del presupuesto en piezas de reparación
 */
export async function convertirConceptosAPiezas(ticketId: number, reparacionId: number) {
  try {
    console.log('🔄 Convirtiendo conceptos del presupuesto a piezas de reparación...');
    
    // Obtener conceptos del presupuesto
    const conceptos = await prisma.conceptos_presupuesto.findMany({
      where: {
        presupuestos: {
          ticket_id: ticketId
        }
      },
      include: {
        presupuestos: true
      }
    });

    console.log('Conceptos encontrados:', conceptos.length);

    // Para cada concepto, buscar el producto correspondiente
    for (const concepto of conceptos) {
      // Buscar producto por nombre (aproximado)
      const producto = await prisma.productos.findFirst({
        where: {
          nombre: {
            contains: concepto.descripcion,
            mode: 'insensitive'
          }
        }
      });

      if (producto) {
        console.log(`✅ Producto encontrado para "${concepto.descripcion}": ${producto.nombre}`);
        
        // Crear pieza de reparación
        await prisma.piezas_reparacion_productos.create({
          data: {
            reparacion_id: reparacionId,
            producto_id: producto.id,
            cantidad: concepto.cantidad,
            precio: concepto.precio_unitario,
            total: concepto.total,
            created_at: new Date(),
            updated_at: new Date()
          }
        });
        
        console.log(`✅ Pieza de reparación creada para ${producto.nombre}`);
      } else {
        console.log(`❌ No se encontró producto para "${concepto.descripcion}"`);
      }
    }
    
    console.log('✅ Conversión de conceptos completada');
  } catch (error) {
    console.error('❌ Error al convertir conceptos:', error);
    throw error;
  }
} 