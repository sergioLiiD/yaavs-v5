import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTicket37() {
  try {
    console.log('🔍 Verificando ticket 37...');
    
    // Verificar si el ticket existe
    const ticket = await prisma.tickets.findUnique({
      where: { id: 37 },
      include: {
        presupuestos: {
          include: {
            conceptos_presupuesto: true
          }
        },
        reparaciones: {
          include: {
            piezas_reparacion_productos: {
              include: {
                productos: true
              }
            },
            piezas_reparacion: {
              include: {
                piezas: true
              }
            }
          }
        }
      }
    });

    if (!ticket) {
      console.log('❌ Ticket 37 no encontrado');
      return;
    }

    console.log('✅ Ticket encontrado:', {
      id: ticket.id,
      numero_ticket: ticket.numero_ticket,
      estatus_reparacion_id: ticket.estatus_reparacion_id,
      fecha_fin_reparacion: ticket.fecha_fin_reparacion
    });

    // Verificar presupuesto
    if (ticket.presupuestos) {
      console.log('📋 Presupuesto encontrado:', {
        id: ticket.presupuestos.id,
        total: ticket.presupuestos.total,
        conceptos_count: ticket.presupuestos.conceptos_presupuesto.length
      });

      console.log('📝 Conceptos del presupuesto:');
      ticket.presupuestos.conceptos_presupuesto.forEach((concepto, index) => {
        console.log(`  ${index + 1}. ${concepto.descripcion} - Cantidad: ${concepto.cantidad}, Precio: $${concepto.precio_unitario}`);
      });
    } else {
      console.log('❌ No hay presupuesto para este ticket');
    }

    // Verificar reparación
    if (ticket.reparaciones && ticket.reparaciones.length > 0) {
      const reparacion = ticket.reparaciones[0];
      console.log('🔧 Reparación encontrada:', {
        id: reparacion.id,
        fecha_inicio: reparacion.fecha_inicio,
        fecha_fin: reparacion.fecha_fin
      });

      // Verificar piezas de reparación (nueva tabla)
      if (reparacion.piezas_reparacion_productos && reparacion.piezas_reparacion_productos.length > 0) {
        console.log('📦 Piezas de reparación (nueva tabla):');
        reparacion.piezas_reparacion_productos.forEach((pieza, index) => {
          console.log(`  ${index + 1}. ${pieza.productos.nombre} - Cantidad: ${pieza.cantidad}, Precio: $${pieza.precio}`);
        });
      } else {
        console.log('❌ No hay piezas de reparación en la nueva tabla');
      }

      // Verificar piezas de reparación (tabla antigua)
      if (reparacion.piezas_reparacion && reparacion.piezas_reparacion.length > 0) {
        console.log('📦 Piezas de reparación (tabla antigua):');
        reparacion.piezas_reparacion.forEach((pieza, index) => {
          console.log(`  ${index + 1}. ${pieza.piezas.nombre} - Cantidad: ${pieza.cantidad}, Precio: $${pieza.precio}`);
        });
      } else {
        console.log('❌ No hay piezas de reparación en la tabla antigua');
      }
    } else {
      console.log('❌ No hay reparación para este ticket');
    }

    // Verificar salidas de almacén
    const salidas = await prisma.salidas_almacen.findMany({
      where: {
        referencia: 'Ticket-37',
        tipo: 'REPARACION'
      },
      include: {
        productos: true
      }
    });

    console.log('📤 Salidas de almacén para este ticket:', salidas.length);
    salidas.forEach((salida, index) => {
      console.log(`  ${index + 1}. ${salida.productos.nombre} - Cantidad: ${salida.cantidad}, Fecha: ${salida.fecha}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTicket37(); 