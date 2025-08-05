import { PrismaClient } from '@prisma/client';
import { validarStockReparacion } from '../src/lib/inventory-utils';

const prisma = new PrismaClient();

async function debugTicket47() {
  try {
    console.log('🔍 Debuggeando Ticket 47...');
    
    // Verificar si el ticket existe
    const ticket = await prisma.tickets.findUnique({
      where: { id: 47 },
      include: {
        reparaciones: true,
        presupuestos: {
          include: {
            conceptos_presupuesto: true
          }
        },
        pagos: true
      }
    });

    if (!ticket) {
      console.log('❌ Ticket 47 no encontrado');
      return;
    }

    console.log('✅ Ticket encontrado:', {
      id: ticket.id,
      estado: ticket.estatus_reparacion_id,
      fecha_creacion: ticket.created_at,
      reparaciones_count: ticket.reparaciones?.length || 0,
      presupuestos_count: ticket.presupuestos?.length || 0,
      pagos_count: ticket.pagos?.length || 0
    });

    // Verificar reparación
    if (ticket.reparaciones && ticket.reparaciones.length > 0) {
      const reparacion = ticket.reparaciones[0];
      console.log('🔧 Reparación:', {
        id: reparacion.id,
        fecha_inicio: reparacion.fecha_inicio,
        fecha_fin: reparacion.fecha_fin,
        observaciones: reparacion.observaciones
      });

      // Verificar piezas de reparación en tabla nueva
      const piezasNuevas = await prisma.piezas_reparacion_productos.findMany({
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

      console.log('📦 Piezas en tabla nueva:', piezasNuevas.length);
      piezasNuevas.forEach((pieza, index) => {
        console.log(`  ${index + 1}. ${pieza.productos.nombre} - Cantidad: ${pieza.cantidad}, Stock: ${pieza.productos.stock}`);
      });

      // Verificar piezas de reparación en tabla antigua
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

      console.log('📦 Piezas en tabla antigua:', piezasAntiguas.length);
      piezasAntiguas.forEach((pieza, index) => {
        console.log(`  ${index + 1}. ${pieza.piezas.nombre} - Cantidad: ${pieza.cantidad}, Stock: ${pieza.piezas.stock}`);
      });

      // Probar validación de stock
      console.log('🔍 Probando validación de stock...');
      try {
        const validacionStock = await validarStockReparacion(47);
        console.log('✅ Validación de stock:', {
          success: validacionStock.success,
          errors: validacionStock.errors,
          missingStock: validacionStock.missingStock
        });
      } catch (error) {
        console.error('❌ Error en validación de stock:', error);
      }
    } else {
      console.log('❌ No hay reparación para el ticket 47');
    }

    // Verificar presupuesto
    if (ticket.presupuestos && ticket.presupuestos.length > 0) {
      const presupuesto = ticket.presupuestos[0];
      console.log('💰 Presupuesto:', {
        id: presupuesto.id,
        total: presupuesto.total,
        conceptos_count: presupuesto.conceptos_presupuesto?.length || 0
      });

      if (presupuesto.conceptos_presupuesto) {
        console.log('📋 Conceptos del presupuesto:');
        presupuesto.conceptos_presupuesto.forEach((concepto, index) => {
          console.log(`  ${index + 1}. ${concepto.descripcion} - Cantidad: ${concepto.cantidad}, Precio: $${concepto.precio_unitario}`);
        });
      }
    }

    // Verificar productos disponibles
    console.log('🔍 Verificando productos disponibles...');
    const productos = await prisma.productos.findMany({
      take: 10,
      include: {
        marcas: true,
        modelos: true
      }
    });

    console.log('📦 Productos disponibles (primeros 10):');
    productos.forEach((producto, index) => {
      console.log(`  ${index + 1}. ${producto.nombre} - Stock: ${producto.stock}, Marca: ${producto.marcas?.nombre || 'N/A'}, Modelo: ${producto.modelos?.nombre || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugTicket47(); 