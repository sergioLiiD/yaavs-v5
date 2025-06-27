import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSaldo() {
  try {
    console.log('Verificando presupuestos y pagos...\n');

    // Buscar tickets específicos
    const ticketsEspecificos = [
      'TICK-1750205963674',
      'TICK-1750197265171'
    ];

    for (const numeroTicket of ticketsEspecificos) {
      console.log(`\n=== Verificando ticket: ${numeroTicket} ===`);
      
      const ticket = await prisma.ticket.findFirst({
        where: { numeroTicket },
        include: {
          presupuesto: {
            include: {
              conceptos: true
            }
          },
          pagos: true
        }
      });

      if (!ticket) {
        console.log(`Ticket ${numeroTicket} no encontrado`);
        continue;
      }

      console.log(`Ticket ID: ${ticket.id}`);
      console.log(`Número: ${ticket.numeroTicket}`);
      
      if (ticket.presupuesto) {
        console.log(`Presupuesto:`);
        console.log(`  Total: $${ticket.presupuesto.total}`);
        console.log(`  Descuento: $${ticket.presupuesto.descuento}`);
        console.log(`  Total Final: $${ticket.presupuesto.totalFinal}`);
        console.log(`  Saldo actual en BD: $${ticket.presupuesto.saldo}`);
        
        const totalPagos = ticket.pagos.reduce((sum, pago) => sum + pago.monto, 0);
        const saldoCalculado = ticket.presupuesto.total - totalPagos;
        
        console.log(`Pagos:`);
        console.log(`  Total de pagos: $${totalPagos}`);
        console.log(`  Saldo calculado (total - pagos): $${saldoCalculado}`);
        console.log(`  Saldo final (máx 0): $${Math.max(0, saldoCalculado)}`);
        console.log(`  Número de pagos: ${ticket.pagos.length}`);
        
        if (ticket.pagos.length > 0) {
          console.log('  Detalle de pagos:');
          ticket.pagos.forEach((pago, index) => {
            console.log(`    ${index + 1}. $${pago.monto} (${pago.metodo}) - ${pago.createdAt.toISOString()}`);
          });
        }
      } else {
        console.log('Sin presupuesto');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSaldo(); 