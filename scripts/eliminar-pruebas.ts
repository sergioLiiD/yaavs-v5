/**
 * Script para eliminar registros de prueba
 * Tickets: 71-76
 * Ventas: 13-15
 * 
 * USO: npx ts-node scripts/eliminar-pruebas.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function eliminarRegistrosPrueba() {
  try {
    console.log('🗑️  Iniciando eliminación de registros de prueba...\n');

    // Confirmar antes de proceder
    console.log('⚠️  ADVERTENCIA: Este script eliminará:');
    console.log('   - Tickets del 71 al 76');
    console.log('   - Ventas del 13 al 15');
    console.log('   - Y todos sus registros relacionados');
    console.log('   - Revertirá el stock automáticamente\n');

    // Usar transacción para todo
    await prisma.$transaction(async (tx) => {
      
      // ============================================
      // TICKETS (71-76)
      // ============================================
      console.log('📋 Procesando tickets 71-76...\n');

      // 1. Revertir stock de tickets
      console.log('🔄 Revirtiendo stock de tickets...');
      const salidasTickets = await tx.salidas_almacen.findMany({
        where: {
          referencia: { in: ['Ticket-71', 'Ticket-72', 'Ticket-73', 'Ticket-74', 'Ticket-75', 'Ticket-76'] },
          tipo: 'REPARACION'
        },
        include: { productos: true }
      });

      for (const salida of salidasTickets) {
        await tx.productos.update({
          where: { id: salida.producto_id },
          data: {
            stock: { increment: salida.cantidad },
            updated_at: new Date()
          }
        });
        console.log(`   ✅ Revertido: ${salida.cantidad}x ${salida.productos.nombre}`);
      }

      // 2. Obtener reparaciones para eliminar checklists
      const reparaciones = await tx.reparaciones.findMany({
        where: { ticket_id: { gte: 71, lte: 76 } }
      });

      for (const rep of reparaciones) {
        // Checklists de diagnóstico
        const checkDiag = await tx.checklist_diagnostico.findFirst({
          where: { reparacion_id: rep.id }
        });
        if (checkDiag) {
          await tx.checklist_respuesta_diagnostico.deleteMany({
            where: { checklist_diagnostico_id: checkDiag.id }
          });
          await tx.checklist_diagnostico.delete({
            where: { id: checkDiag.id }
          });
        }

        // Checklists de reparación
        const checkRep = await tx.checklist_reparacion.findFirst({
          where: { reparacion_id: rep.id }
        });
        if (checkRep) {
          await tx.checklist_respuesta_reparacion.deleteMany({
            where: { checklist_reparacion_id: checkRep.id }
          });
          await tx.checklist_reparacion.delete({
            where: { id: checkRep.id }
          });
        }

        // Piezas de reparación
        await tx.piezas_reparacion_productos.deleteMany({
          where: { reparacion_id: rep.id }
        });
        await tx.piezas_reparacion.deleteMany({
          where: { reparacion_id: rep.id }
        });
      }

      // 3. Eliminar reparaciones
      const countRep = await tx.reparaciones.deleteMany({
        where: { ticket_id: { gte: 71, lte: 76 } }
      });
      console.log(`   🗑️  Reparaciones eliminadas: ${countRep.count}`);

      // 4. Eliminar conceptos de presupuesto
      const presupuestos = await tx.presupuestos.findMany({
        where: { ticket_id: { gte: 71, lte: 76 } }
      });
      for (const pres of presupuestos) {
        await tx.conceptos_presupuesto.deleteMany({
          where: { presupuesto_id: pres.id }
        });
      }

      // 5. Eliminar presupuestos
      const countPres = await tx.presupuestos.deleteMany({
        where: { ticket_id: { gte: 71, lte: 76 } }
      });
      console.log(`   🗑️  Presupuestos eliminados: ${countPres.count}`);

      // 6. Eliminar pagos
      const countPagos = await tx.pagos.deleteMany({
        where: { ticket_id: { gte: 71, lte: 76 } }
      });
      console.log(`   🗑️  Pagos eliminados: ${countPagos.count}`);

      // 7. Eliminar salidas de almacén
      const countSalidas = await tx.salidas_almacen.deleteMany({
        where: {
          referencia: { in: ['Ticket-71', 'Ticket-72', 'Ticket-73', 'Ticket-74', 'Ticket-75', 'Ticket-76'] },
          tipo: 'REPARACION'
        }
      });
      console.log(`   🗑️  Salidas de almacén eliminadas: ${countSalidas.count}`);

      // 8. Eliminar otras relaciones
      await tx.ticket_problemas.deleteMany({ where: { ticket_id: { gte: 71, lte: 76 } } });
      await tx.usos_cupon.deleteMany({ where: { ticket_id: { gte: 71, lte: 76 } } });
      await tx.dispositivos.deleteMany({ where: { ticket_id: { gte: 71, lte: 76 } } });
      await tx.entregas.deleteMany({ where: { ticket_id: { gte: 71, lte: 76 } } });

      // 9. Eliminar tickets
      const countTickets = await tx.tickets.deleteMany({
        where: { id: { gte: 71, lte: 76 } }
      });
      console.log(`   🗑️  Tickets eliminados: ${countTickets.count}\n`);

      // ============================================
      // VENTAS (13-15)
      // ============================================
      console.log('💰 Procesando ventas 13-15...\n');

      // 1. Revertir stock de ventas
      console.log('🔄 Revirtiendo stock de ventas...');
      const salidasVentas = await tx.salidas_almacen.findMany({
        where: {
          referencia: { in: ['Venta #13', 'Venta #14', 'Venta #15'] },
          tipo: 'VENTA'
        },
        include: { productos: true }
      });

      for (const salida of salidasVentas) {
        await tx.productos.update({
          where: { id: salida.producto_id },
          data: {
            stock: { increment: salida.cantidad },
            updated_at: new Date()
          }
        });
        console.log(`   ✅ Revertido: ${salida.cantidad}x ${salida.productos.nombre}`);
      }

      // 2. Eliminar usos de cupones
      await tx.usos_cupon.deleteMany({ where: { venta_id: { gte: 13, lte: 15 } } });

      // 3. Eliminar salidas de almacén
      const countSalidasVentas = await tx.salidas_almacen.deleteMany({
        where: {
          referencia: { in: ['Venta #13', 'Venta #14', 'Venta #15'] },
          tipo: 'VENTA'
        }
      });
      console.log(`   🗑️  Salidas de almacén eliminadas: ${countSalidasVentas.count}`);

      // 4. Eliminar detalles de venta
      const countDetalles = await tx.detalle_ventas.deleteMany({
        where: { venta_id: { gte: 13, lte: 15 } }
      });
      console.log(`   🗑️  Detalles de venta eliminados: ${countDetalles.count}`);

      // 5. Eliminar ventas
      const countVentas = await tx.ventas.deleteMany({
        where: { id: { gte: 13, lte: 15 } }
      });
      console.log(`   🗑️  Ventas eliminadas: ${countVentas.count}\n`);

    });

    console.log('✅ ¡Registros de prueba eliminados exitosamente!');
    console.log('✅ Stock revertido correctamente');

  } catch (error) {
    console.error('❌ Error al eliminar registros:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
eliminarRegistrosPrueba()
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });

