import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPagosData() {
  try {
    console.log('Verificando y corrigiendo datos de pagos...\n');

    // Obtener todos los pagos
    const pagos = await prisma.pagos.findMany({
      include: {
        tickets: {
          include: {
            presupuestos: true
          }
        }
      }
    });

    console.log(`Encontrados ${pagos.length} pagos`);

    for (const pago of pagos) {
      console.log(`\n=== Pago ID: ${pago.id} ===`);
      console.log(`Ticket: ${pago.tickets.numero_ticket}`);
      console.log(`Monto: $${pago.monto}`);
      console.log(`Método: ${pago.metodo}`);
      console.log(`Referencia: ${pago.referencia || 'N/A'}`);
      console.log(`Created at: ${pago.created_at}`);
      console.log(`Updated at: ${pago.updated_at}`);

      // Verificar si hay presupuesto asociado
      if (pago.tickets.presupuestos) {
        const presupuesto = pago.tickets.presupuestos;
        console.log(`Presupuesto:`);
        console.log(`  Total: $${presupuesto.total}`);
        console.log(`  Saldo en BD: $${presupuesto.saldo}`);
        
        // Calcular saldo real
        const totalPagos = pagos
          .filter(p => p.ticket_id === pago.ticket_id)
          .reduce((sum, p) => sum + p.monto, 0);
        
        const saldoCalculado = presupuesto.total - totalPagos;
        console.log(`  Total de pagos: $${totalPagos}`);
        console.log(`  Saldo calculado: $${saldoCalculado}`);
        console.log(`  Saldo final (máx 0): $${Math.max(0, saldoCalculado)}`);
        
        // Actualizar el saldo si es diferente
        if (Math.abs(presupuesto.saldo - Math.max(0, saldoCalculado)) > 0.01) {
          console.log(`  ⚠️  Actualizando saldo de $${presupuesto.saldo} a $${Math.max(0, saldoCalculado)}`);
          
          await prisma.presupuestos.update({
            where: { id: presupuesto.id },
            data: {
              saldo: Math.max(0, saldoCalculado),
              updated_at: new Date()
            }
          });
          
          console.log(`  ✅ Saldo actualizado`);
        } else {
          console.log(`  ✅ Saldo correcto`);
        }
      } else {
        console.log(`  ⚠️  Sin presupuesto asociado`);
      }
    }

    console.log('\n=== Resumen ===');
    console.log(`Total de pagos procesados: ${pagos.length}`);
    console.log('Verificación completada');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPagosData(); 