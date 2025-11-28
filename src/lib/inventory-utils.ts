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
    console.log('🔍 [validarStockReparacion] Iniciando validación para ticket:', ticketId);
    
    // Obtener la reparación del ticket
    const reparacion = await prisma.reparaciones.findFirst({
      where: { ticket_id: ticketId }
    });

    console.log('🔍 [validarStockReparacion] Reparación encontrada:', reparacion?.id || 'ninguna');

    if (!reparacion) {
      // Si no hay reparación, validar stock basándose en los conceptos del presupuesto
      console.log('ℹ️  [validarStockReparacion] No se encontró la reparación, validando stock basado en conceptos del presupuesto...');
      
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

      console.log('🔍 [validarStockReparacion] Conceptos encontrados:', conceptos.length);

      if (conceptos.length === 0) {
        // Si no hay conceptos, no hay stock que validar
        console.log('ℹ️  [validarStockReparacion] No hay conceptos en el presupuesto');
        return {
          success: true,
          errors: [],
          missingStock: []
        };
      }

      // Validar stock para cada concepto
      const errors: string[] = [];
      const missingStock: Array<{
        piezaId: number;
        piezaNombre: string;
        cantidadNecesaria: number;
        stockDisponible: number;
      }> = [];

      // Lista de conceptos que no requieren validación de stock (servicios)
      const conceptosSinStock = ['Mano de Obra', 'Diagnostico', 'Diagnóstico', 'Servicio'];

      for (const concepto of conceptos) {
        // Verificar si es un servicio que no requiere stock
        const esServicio = conceptosSinStock.some(conceptoServicio => 
          concepto.descripcion.toLowerCase().includes(conceptoServicio.toLowerCase())
        );
        
        if (esServicio) {
          console.log(`⏭️  [validarStockReparacion] Saltando servicio: "${concepto.descripcion}"`);
          continue;
        }

        // Buscar producto por nombre
        let producto = await prisma.productos.findFirst({
          where: {
            nombre: {
              equals: concepto.descripcion.trim(),
              mode: 'insensitive'
            },
            tipo: 'PRODUCTO'
          },
          include: {
            marcas: true,
            modelos: true
          }
        });
        
        // Si no se encuentra con búsqueda exacta, intentar búsqueda parcial
        if (!producto) {
          producto = await prisma.productos.findFirst({
            where: {
              nombre: {
                contains: concepto.descripcion.trim(),
                mode: 'insensitive'
              },
              tipo: 'PRODUCTO'
            },
            include: {
              marcas: true,
              modelos: true
            }
          });
        }

        if (producto) {
          // Verificar que el producto sea de tipo PRODUCTO, no SERVICIO
          if (producto.tipo === 'SERVICIO') {
            console.log(`⏭️  [validarStockReparacion] Saltando servicio encontrado en productos: "${producto.nombre}" (tipo: SERVICIO)`);
            continue;
          }
          
          console.log(`🔍 [validarStockReparacion] Verificando concepto: ${producto.nombre} (cantidad: ${concepto.cantidad}, stock: ${producto.stock})`);
          
          if (producto.stock < concepto.cantidad) {
            const marcaNombre = producto.marcas?.nombre || 'N/A';
            const modeloNombre = producto.modelos?.nombre || 'N/A';
            const productoNombre = `${producto.nombre} (${marcaNombre} ${modeloNombre})`;
            
            console.log(`❌ [validarStockReparacion] Stock insuficiente para ${productoNombre}: necesitas ${concepto.cantidad}, tienes ${producto.stock}`);
            
            missingStock.push({
              piezaId: producto.id,
              piezaNombre: productoNombre,
              cantidadNecesaria: concepto.cantidad,
              stockDisponible: producto.stock
            });
            
            errors.push(
              `Stock insuficiente para ${productoNombre}: necesitas ${concepto.cantidad}, tienes ${producto.stock}`
            );
          } else {
            console.log(`✅ [validarStockReparacion] Stock suficiente para ${producto.nombre}`);
          }
        } else {
          console.log(`⚠️  [validarStockReparacion] No se encontró producto para concepto: "${concepto.descripcion}" - se asume que es un servicio o producto no inventariable`);
          // No agregar error si no se encuentra el producto, puede ser un servicio o producto no inventariable
        }
      }

      console.log(`📊 [validarStockReparacion] Validación de conceptos completada. Éxito: ${errors.length === 0}, Errores: ${errors.length}`);
      
      return {
        success: errors.length === 0,
        errors,
        missingStock
      };
    }

    // Obtener las piezas de la reparación (solo productos, no servicios)
    // Primero intentar en la tabla nueva
    console.log('🔍 [validarStockReparacion] Buscando piezas en tabla nueva (piezas_reparacion_productos)...');
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

    console.log('🔍 [validarStockReparacion] Piezas encontradas en tabla nueva:', piezasReparacion.length);

    // Si no hay datos en la tabla nueva, buscar en la tabla antigua
    if (piezasReparacion.length === 0) {
      console.log('🔍 [validarStockReparacion] No se encontraron piezas en tabla nueva, buscando en tabla antigua...');
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
      console.log('ℹ️  [validarStockReparacion] No hay piezas de reparación para validar stock');
      return {
        success: true,
        errors: [],
        missingStock: []
      };
    }

    console.log(`🔍 [validarStockReparacion] Validando stock para ${piezasReparacion.length} piezas...`);

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
      
      console.log(`🔍 [validarStockReparacion] Verificando pieza: ${producto.nombre} (cantidad: ${piezaRep.cantidad}, stock: ${producto.stock}, tipo: ${producto.tipo})`);
      
      // Verificar primero si es un servicio por tipo
      if (producto.tipo === 'SERVICIO') {
        console.log(`⏭️  [validarStockReparacion] Saltando servicio por tipo: ${producto.nombre} (tipo: SERVICIO)`);
        continue;
      }
      
      // Lista de conceptos que no requieren validación de stock (servicios)
      const conceptosSinStock = ['Mano de Obra', 'Diagnostico', 'Diagnóstico', 'Servicio'];
      
      // Verificar si es un servicio que no requiere stock (por nombre)
      const esServicio = conceptosSinStock.some(concepto => 
        producto.nombre?.includes(concepto)
      );
      
      if (esServicio) {
        console.log(`⏭️  [validarStockReparacion] Saltando servicio por nombre: ${producto.nombre}`);
        continue;
      }
      
      // Solo validar stock para productos físicos, no para servicios
      if (producto.stock < piezaRep.cantidad) {
        const marcaNombre = producto.marcas?.nombre || 'N/A';
        const modeloNombre = producto.modelos?.nombre || 'N/A';
        const productoNombre = `${producto.nombre} (${marcaNombre} ${modeloNombre})`;
        
        console.log(`❌ [validarStockReparacion] Stock insuficiente para ${productoNombre}: necesitas ${piezaRep.cantidad}, tienes ${producto.stock}`);
        
        missingStock.push({
          piezaId: producto.id,
          piezaNombre: productoNombre,
          cantidadNecesaria: piezaRep.cantidad,
          stockDisponible: producto.stock
        });
        
        errors.push(
          `Stock insuficiente para ${productoNombre}: necesitas ${piezaRep.cantidad}, tienes ${producto.stock}`
        );
      } else {
        console.log(`✅ [validarStockReparacion] Stock suficiente para ${producto.nombre}`);
      }
    }

    console.log(`📊 [validarStockReparacion] Validación completada. Éxito: ${errors.length === 0}, Errores: ${errors.length}`);
    
    return {
      success: errors.length === 0,
      errors,
      missingStock
    };
  } catch (error) {
    console.error('❌ [validarStockReparacion] Error al validar stock de reparación:', error);
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
export async function procesarDescuentoInventario(
  ticketId: number, 
  usuarioId: number, 
  prismaClient?: PrismaClient,
  reparacionId?: number
): Promise<InventoryTransaction> {
  const db = prismaClient || prisma;
  
  try {
    console.log('🔍 Procesando descuento de inventario para ticket:', ticketId);
    
    // Obtener la reparación del ticket (usar reparacionId si se proporciona)
    let reparacion;
    if (reparacionId) {
      reparacion = await db.reparaciones.findUnique({
        where: { id: reparacionId }
      });
    } else {
      reparacion = await db.reparaciones.findFirst({
        where: { ticket_id: ticketId }
      });
    }

    if (!reparacion) {
      throw new Error('No se encontró la reparación para este ticket');
    }
    
    console.log('✅ Reparación encontrada:', reparacion.id);

    // Si ya estamos dentro de una transacción (prismaClient proporcionado), usar ese cliente directamente
    // Si no, crear una nueva transacción
    const procesarPiezas = async (tx: PrismaClient) => {
      // Obtener las piezas de la reparación dentro de la transacción
      // Primero intentar en la tabla nueva
      let piezasReparacion = await tx.piezas_reparacion_productos.findMany({
        where: { reparacion_id: reparacion.id },
        include: {
          productos: true
        }
      });

      // Si no hay datos en la tabla nueva, buscar en la tabla antigua
      if (piezasReparacion.length === 0) {
        console.log('Procesando descuento: No se encontraron piezas en tabla nueva, buscando en tabla antigua...');
        const piezasAntiguas = await tx.piezas_reparacion.findMany({
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
      for (const piezaRep of piezasReparacion) {
        const producto = piezaRep.productos;
        
        console.log(`🔍 Procesando pieza: ${producto.nombre} (cantidad: ${piezaRep.cantidad}, tipo: ${producto.tipo})`);
        
        // Verificar primero si es un servicio por tipo
        if (producto.tipo === 'SERVICIO') {
          console.log(`⏭️  Saltando servicio por tipo: ${producto.nombre} (tipo: SERVICIO)`);
          continue;
        }
        
        // Lista de conceptos que no requieren descuento de stock (servicios)
        const conceptosSinStock = ['Mano de Obra', 'Diagnostico', 'Diagnóstico', 'Servicio'];
        
        // Verificar si es un servicio que no requiere stock (por nombre)
        const esServicio = conceptosSinStock.some(concepto => 
          producto.nombre?.toLowerCase().includes(concepto.toLowerCase())
        );
        
        if (esServicio) {
          console.log(`⏭️  Saltando servicio por nombre: ${producto.nombre}`);
          continue;
        }
        
        // Solo procesar descuento de stock para productos físicos, no para servicios
        console.log(`📦 Procesando producto físico: ${producto.nombre} (stock actual: ${producto.stock})`);
        
        // Verificar stock nuevamente (por si cambió desde la validación)
        if (producto.stock < piezaRep.cantidad) {
          const error = `Stock insuficiente para ${producto.nombre}: necesitas ${piezaRep.cantidad}, tienes ${producto.stock}`;
          console.error(`❌ ${error}`);
          throw new Error(error);
        }

        // Verificar si ya existe una salida para este producto en este ticket
        const salidaExistente = await tx.salidas_almacen.findFirst({
          where: {
            referencia: `Ticket-${ticketId}`,
            producto_id: producto.id,
            tipo: 'REPARACION'
          }
        });

        if (salidaExistente) {
          console.log(`⚠️  Salida ya existe para ${producto.nombre} (ID: ${salidaExistente.id})`);
          console.log(`⚠️  NO se creará nueva salida ni se descontará stock (ya fue descontado)`);
          // NO actualizar la cantidad ni el stock porque ya fue procesado
          // Simplemente continuar con el siguiente producto
          continue;
        }
        
        // Crear nueva salida de almacén solo si NO existe
        console.log(`📤 Creando salida de almacén para ${producto.nombre}...`);
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
        console.log(`✅ Salida creada con ID: ${salida.id}`);

        // Actualizar stock del producto (solo si se creó nueva salida)
        console.log(`📉 Actualizando stock de ${producto.nombre} de ${producto.stock} a ${producto.stock - piezaRep.cantidad}...`);
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
        
        console.log(`✅ Pieza procesada exitosamente: ${producto.nombre}`);
      }
      
      return salidas;
    };

    // Si ya estamos dentro de una transacción, usar el cliente directamente
    // Si no, crear una nueva transacción
    let salidas: Array<{
      productoId: number;
      cantidad: number;
      razon: string;
      referencia: string;
    }>;
    
    if (prismaClient) {
      // Ya estamos dentro de una transacción, usar el cliente directamente
      salidas = await procesarPiezas(db);
    } else {
      // Crear una nueva transacción
      salidas = await prisma.$transaction(async (tx) => {
        return await procesarPiezas(tx);
      });
    }

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
export async function convertirConceptosAPiezas(
  ticketId: number, 
  reparacionId: number, 
  prismaClient?: PrismaClient
) {
  const db = prismaClient || prisma;
  
  try {
    console.log('🔄 Convirtiendo conceptos del presupuesto a piezas de reparación...');
    
    // Obtener conceptos del presupuesto
    const conceptos = await db.conceptos_presupuesto.findMany({
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
      console.log(`🔍 Buscando producto para concepto: "${concepto.descripcion}"`);
      
      // Lista de conceptos que no requieren conversión (servicios)
      const conceptosSinStock = ['Mano de Obra', 'Diagnostico', 'Diagnóstico', 'Servicio'];
      
      // Verificar si es un servicio que no requiere stock
      const esServicio = conceptosSinStock.some(conceptoServicio => 
        concepto.descripcion.toLowerCase().includes(conceptoServicio.toLowerCase())
      );
      
      if (esServicio) {
        console.log(`⏭️  Saltando servicio: "${concepto.descripcion}"`);
        continue;
      }
      
      // Buscar producto por nombre (más preciso)
      let producto = await db.productos.findFirst({
        where: {
          nombre: {
            equals: concepto.descripcion.trim(),
            mode: 'insensitive'
          },
          tipo: 'PRODUCTO'
        }
      });
      
      // Si no se encuentra con búsqueda exacta, intentar búsqueda parcial
      if (!producto) {
        console.log(`🔍 Búsqueda exacta falló, intentando búsqueda parcial...`);
        producto = await db.productos.findFirst({
          where: {
            nombre: {
              contains: concepto.descripcion.trim(),
              mode: 'insensitive'
            },
            tipo: 'PRODUCTO'
          }
        });
      }
      
      // Si aún no se encuentra, intentar búsqueda más flexible
      if (!producto) {
        console.log(`🔍 Búsqueda parcial falló, intentando búsqueda flexible...`);
        const palabrasClave = concepto.descripcion.trim().split(' ').filter(p => p.length > 2);
        
        for (const palabra of palabrasClave) {
          producto = await db.productos.findFirst({
            where: {
              nombre: {
                contains: palabra,
                mode: 'insensitive'
              },
              tipo: 'PRODUCTO'
            }
          });
          
          if (producto) {
            console.log(`✅ Producto encontrado usando palabra clave "${palabra}"`);
            break;
          }
        }
      }

      if (producto) {
        // Verificar que el producto sea de tipo PRODUCTO, no SERVICIO
        if (producto.tipo === 'SERVICIO') {
          console.log(`⏭️  Saltando servicio encontrado: "${producto.nombre}" (tipo: SERVICIO)`);
          continue;
        }
        
        console.log(`✅ Producto encontrado para "${concepto.descripcion}": ${producto.nombre} (ID: ${producto.id})`);
        
        // Verificar si ya existe una pieza para este producto en esta reparación
        const piezaExistente = await db.piezas_reparacion_productos.findFirst({
          where: {
            reparacion_id: reparacionId,
            producto_id: producto.id
          }
        });
        
        if (piezaExistente) {
          console.log(`⚠️  Pieza ya existe para ${producto.nombre}, actualizando cantidad...`);
          await db.piezas_reparacion_productos.update({
            where: { id: piezaExistente.id },
            data: {
              cantidad: piezaExistente.cantidad + concepto.cantidad,
              total: (piezaExistente.cantidad + concepto.cantidad) * concepto.precio_unitario,
              updated_at: new Date()
            }
          });
        } else {
          // Crear nueva pieza de reparación
          await db.piezas_reparacion_productos.create({
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
        }
        
        console.log(`✅ Pieza de reparación creada/actualizada para ${producto.nombre}`);
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