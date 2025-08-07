import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSaldo() {
  try {
    console.log('Verificando presupuestos y pagos...\n');

    // Obtener el número de ticket del argumento de línea de comandos
    const numeroTicket = process.argv[2];
    
    if (!numeroTicket) {
      console.log('Uso: npx ts-node check-saldo.ts <numero_ticket>');
      console.log('Ejemplo: npx ts-node check-saldo.ts TICK-1754504915967');
      return;
    }

    console.log(`\n=== Verificando ticket: ${numeroTicket} ===`);
    
    const ticket = await prisma.tickets.findFirst({
      where: { numero_ticket: numeroTicket },
      include: {
        presupuestos: {
          include: {
            conceptos_presupuesto: true
          }
        },
        pagos: true
      }
    });

    if (!ticket) {
      console.log(`Ticket ${numeroTicket} no encontrado`);
      return;
    }

    console.log(`Ticket ID: ${ticket.id}`);
    console.log(`Número: ${ticket.numero_ticket}`);
    
    if (ticket.presupuestos) {
      console.log(`Presupuesto:`);
      console.log(`  Total: $${ticket.presupuestos.total}`);
      console.log(`  Descuento: $${ticket.presupuestos.descuento}`);
      console.log(`  Total Final: $${ticket.presupuestos.total_final}`);
      console.log(`  Saldo actual en BD: $${ticket.presupuestos.saldo}`);
      
      const totalPagos = ticket.pagos.reduce((sum: number, pago: any) => sum + pago.monto, 0);
      const saldoCalculado = ticket.presupuestos.total - totalPagos;
      
      console.log(`Pagos:`);
      console.log(`  Total de pagos: $${totalPagos}`);
      console.log(`  Saldo calculado (total - pagos): $${saldoCalculado}`);
      console.log(`  Saldo final (máx 0): $${Math.max(0, saldoCalculado)}`);
      console.log(`  Número de pagos: ${ticket.pagos.length}`);
      
      if (ticket.pagos.length > 0) {
        console.log('  Detalle de pagos:');
        ticket.pagos.forEach((pago: any, index: number) => {
          console.log(`    ${index + 1}. $${pago.monto} (${pago.metodo}) - ${pago.created_at.toISOString()}`);
        });
      }
    } else {
      console.log('Sin presupuesto');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSaldo(); 