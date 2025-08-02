import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTicket37Reparacion() {
  try {
    console.log('🔧 Solucionando reparación faltante para ticket 37...');
    
    // Verificar si ya existe una reparación
    const reparacionExistente = await prisma.reparaciones.findFirst({
      where: { ticket_id: 37 }
    });

    if (reparacionExistente) {
      console.log('✅ Reparación ya existe:', reparacionExistente.id);
    } else {
      // Crear la reparación
      console.log('📝 Creando reparación para ticket 37...');
      const reparacion = await prisma.reparaciones.create({
        data: {
          ticket_id: 37,
          observaciones: 'Reparación creada automáticamente - cambio de pantalla',
          fecha_inicio: new Date('2025-08-02T10:06:18.693Z'),
          fecha_fin: new Date('2025-08-02T10:07:09.139Z'),
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log('✅ Reparación creada:', reparacion.id);
    }

    // Obtener la reparación (nueva o existente)
    const reparacion = await prisma.reparaciones.findFirst({
      where: { ticket_id: 37 }
    });

    if (!reparacion) {
      throw new Error('No se pudo crear/obtener la reparación');
    }

    // Convertir conceptos del presupuesto a piezas de reparación
    console.log('🔄 Convirtiendo conceptos del presupuesto...');
    await convertirConceptosAPiezas(37, reparacion.id);
    console.log('✅ Conceptos convertidos');

    // Procesar descuento de inventario
    console.log('🔄 Procesando descuento de inventario...');
    await procesarDescuentoInventario(37, 17); // Usuario ID 17 (Montserrat)
    console.log('✅ Descuento de inventario procesado');

    console.log('🎉 Ticket 37 solucionado exitosamente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Función para convertir conceptos del presupuesto a piezas de reparación
async function convertirConceptosAPiezas(ticketId: number, reparacionId: number) {
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

// Función para procesar descuento de inventario
async function procesarDescuentoInventario(ticketId: number, usuarioId: number) {
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
    let piezasReparacion = await prisma.piezas_reparacion_productos.findMany({
      where: { reparacion_id: reparacion.id },
      include: {
        productos: true
      }
    });

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
        
        // Verificar stock
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

        console.log(`✅ Descontado ${piezaRep.cantidad} unidades de ${producto.nombre}`);
      }
    });

    console.log('✅ Descuento de inventario completado');
    return {
      ticketId,
      salidas
    };
  } catch (error) {
    console.error('Error al procesar descuento de inventario:', error);
    throw error;
  }
}

fixTicket37Reparacion(); 