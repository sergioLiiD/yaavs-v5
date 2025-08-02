import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugReparacionEndpoint() {
  try {
    console.log('🔍 Debuggeando endpoint de reparación...');
    
    // Verificar el último ticket completado
    const ultimoTicket = await prisma.tickets.findFirst({
      where: {
        estatus_reparacion_id: 32 // Reparado
      },
      orderBy: {
        updated_at: 'desc'
      },
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
            }
          }
        }
      }
    });

    if (!ultimoTicket) {
      console.log('❌ No se encontró ningún ticket reparado');
      return;
    }

    console.log('📋 Ticket encontrado:', {
      id: ultimoTicket.id,
      numero_ticket: ultimoTicket.numero_ticket,
      estatus_reparacion_id: ultimoTicket.estatus_reparacion_id,
      fecha_fin_reparacion: ultimoTicket.fecha_fin_reparacion
    });

    // Verificar presupuesto
    if (ultimoTicket.presupuestos) {
      console.log('📋 Presupuesto:', {
        id: ultimoTicket.presupuestos.id,
        total: ultimoTicket.presupuestos.total,
        conceptos_count: ultimoTicket.presupuestos.conceptos_presupuesto.length
      });

      console.log('📝 Conceptos del presupuesto:');
      ultimoTicket.presupuestos.conceptos_presupuesto.forEach((concepto, index) => {
        console.log(`  ${index + 1}. ${concepto.descripcion} - Cantidad: ${concepto.cantidad}, Precio: $${concepto.precio_unitario}`);
      });
    }

    // Verificar reparación
    if (ultimoTicket.reparaciones && ultimoTicket.reparaciones.length > 0) {
      const reparacion = ultimoTicket.reparaciones[0];
      console.log('🔧 Reparación:', {
        id: reparacion.id,
        fecha_inicio: reparacion.fecha_inicio,
        fecha_fin: reparacion.fecha_fin,
        piezas_count: reparacion.piezas_reparacion_productos.length
      });

      if (reparacion.piezas_reparacion_productos.length > 0) {
        console.log('📦 Piezas de reparación:');
        reparacion.piezas_reparacion_productos.forEach((pieza, index) => {
          console.log(`  ${index + 1}. ${pieza.productos.nombre} - Cantidad: ${pieza.cantidad}, Precio: $${pieza.precio}`);
        });
      } else {
        console.log('❌ No hay piezas de reparación');
      }
    } else {
      console.log('❌ No hay reparación');
    }

    // Verificar salidas de almacén
    const salidas = await prisma.salidas_almacen.findMany({
      where: {
        referencia: `Ticket-${ultimoTicket.id}`,
        tipo: 'REPARACION'
      },
      include: {
        productos: true
      }
    });

    console.log('📤 Salidas de almacén:', salidas.length);
    salidas.forEach((salida, index) => {
      console.log(`  ${index + 1}. ${salida.productos.nombre} - Cantidad: ${salida.cantidad}, Fecha: ${salida.fecha}`);
    });

    // Verificar productos disponibles
    console.log('🔍 Verificando productos disponibles...');
    const productos = await prisma.productos.findMany({
      where: {
        nombre: {
          contains: 'pantalla',
          mode: 'insensitive'
        }
      }
    });

    console.log('📦 Productos de pantalla disponibles:', productos.length);
    productos.forEach((producto, index) => {
      console.log(`  ${index + 1}. ${producto.nombre} - Stock: ${producto.stock}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugReparacionEndpoint(); 