import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  try {
    // Eliminar modelos sin marca
    const modelosSinMarca = await prisma.modelo.findMany({
      where: {
        NOT: {
          marcaId: {
            in: (await prisma.marca.findMany()).map(m => m.id)
          }
        }
      }
    });
    await prisma.modelo.deleteMany({
      where: {
        id: {
          in: modelosSinMarca.map(m => m.id)
        }
      }
    });
    console.log(`Se eliminaron ${modelosSinMarca.length} modelos sin marca`);

    // Eliminar problemas de modelo sin modelo
    const problemasSinModelo = await prisma.problemaModelo.findMany({
      where: {
        NOT: {
          modeloId: {
            in: (await prisma.modelo.findMany()).map(m => m.id)
          }
        }
      }
    });
    await prisma.problemaModelo.deleteMany({
      where: {
        id: {
          in: problemasSinModelo.map(p => p.id)
        }
      }
    });
    console.log(`Se eliminaron ${problemasSinModelo.length} problemas sin modelo`);

    // Eliminar problemas de modelo sin problema frecuente
    const problemasSinProblemaFrecuente = await prisma.problemaModelo.findMany({
      where: {
        NOT: {
          problemaFrecuenteId: {
            in: (await prisma.problemaFrecuente.findMany()).map(p => p.id)
          }
        }
      }
    });
    await prisma.problemaModelo.deleteMany({
      where: {
        id: {
          in: problemasSinProblemaFrecuente.map(p => p.id)
        }
      }
    });
    console.log(`Se eliminaron ${problemasSinProblemaFrecuente.length} problemas sin problema frecuente`);

    // Eliminar tickets sin cliente
    const ticketsSinCliente = await prisma.ticket.findMany({
      where: {
        NOT: {
          clienteId: {
            in: (await prisma.cliente.findMany()).map(c => c.id)
          }
        }
      }
    });
    await prisma.ticket.deleteMany({
      where: {
        id: {
          in: ticketsSinCliente.map(t => t.id)
        }
      }
    });
    console.log(`Se eliminaron ${ticketsSinCliente.length} tickets sin cliente`);

    // Eliminar tickets sin tipo de servicio
    const ticketsSinTipoServicio = await prisma.ticket.findMany({
      where: {
        NOT: {
          tipoServicioId: {
            in: (await prisma.tipoServicio.findMany()).map(t => t.id)
          }
        }
      }
    });
    await prisma.ticket.deleteMany({
      where: {
        id: {
          in: ticketsSinTipoServicio.map(t => t.id)
        }
      }
    });
    console.log(`Se eliminaron ${ticketsSinTipoServicio.length} tickets sin tipo de servicio`);

    // Eliminar tickets sin modelo
    const ticketsSinModelo = await prisma.ticket.findMany({
      where: {
        NOT: {
          modeloId: {
            in: (await prisma.modelo.findMany()).map(m => m.id)
          }
        }
      }
    });
    await prisma.ticket.deleteMany({
      where: {
        id: {
          in: ticketsSinModelo.map(t => t.id)
        }
      }
    });
    console.log(`Se eliminaron ${ticketsSinModelo.length} tickets sin modelo`);

    // Eliminar tickets sin estatus de reparación
    const ticketsSinEstatus = await prisma.ticket.findMany({
      where: {
        NOT: {
          estatusReparacionId: {
            in: (await prisma.estatusReparacion.findMany()).map(e => e.id)
          }
        }
      }
    });
    await prisma.ticket.deleteMany({
      where: {
        id: {
          in: ticketsSinEstatus.map(t => t.id)
        }
      }
    });
    console.log(`Se eliminaron ${ticketsSinEstatus.length} tickets sin estatus de reparación`);

    // Eliminar tickets sin creador
    const ticketsSinCreador = await prisma.ticket.findMany({
      where: {
        NOT: {
          creadorId: {
            in: (await prisma.usuario.findMany()).map(u => u.id)
          }
        }
      }
    });
    await prisma.ticket.deleteMany({
      where: {
        id: {
          in: ticketsSinCreador.map(t => t.id)
        }
      }
    });
    console.log(`Se eliminaron ${ticketsSinCreador.length} tickets sin creador`);

    // Eliminar reparaciones sin ticket
    const reparacionesSinTicket = await prisma.reparacion.findMany({
      where: {
        NOT: {
          ticketId: {
            in: (await prisma.ticket.findMany()).map(t => t.id)
          }
        }
      }
    });
    await prisma.reparacion.deleteMany({
      where: {
        id: {
          in: reparacionesSinTicket.map(r => r.id)
        }
      }
    });
    console.log(`Se eliminaron ${reparacionesSinTicket.length} reparaciones sin ticket`);

    // Eliminar reparaciones sin técnico
    const reparacionesSinTecnico = await prisma.reparacion.findMany({
      where: {
        NOT: {
          tecnicoId: {
            in: (await prisma.usuario.findMany()).map(u => u.id)
          }
        }
      }
    });
    await prisma.reparacion.deleteMany({
      where: {
        id: {
          in: reparacionesSinTecnico.map(r => r.id)
        }
      }
    });
    console.log(`Se eliminaron ${reparacionesSinTecnico.length} reparaciones sin técnico`);

    // Eliminar piezas de reparación sin reparación
    const piezasSinReparacion = await prisma.piezaReparacion.findMany({
      where: {
        NOT: {
          reparacionId: {
            in: (await prisma.reparacion.findMany()).map(r => r.id)
          }
        }
      }
    });
    await prisma.piezaReparacion.deleteMany({
      where: {
        id: {
          in: piezasSinReparacion.map(p => p.id)
        }
      }
    });
    console.log(`Se eliminaron ${piezasSinReparacion.length} piezas sin reparación`);

    // Eliminar piezas de reparación sin pieza
    const piezasSinPieza = await prisma.piezaReparacion.findMany({
      where: {
        NOT: {
          piezaId: {
            in: (await prisma.pieza.findMany()).map(p => p.id)
          }
        }
      }
    });
    await prisma.piezaReparacion.deleteMany({
      where: {
        id: {
          in: piezasSinPieza.map(p => p.id)
        }
      }
    });
    console.log(`Se eliminaron ${piezasSinPieza.length} piezas sin pieza`);

    // Eliminar presupuestos sin ticket
    const presupuestosSinTicket = await prisma.presupuesto.findMany({
      where: {
        NOT: {
          ticketId: {
            in: (await prisma.ticket.findMany()).map(t => t.id)
          }
        }
      }
    });
    await prisma.presupuesto.deleteMany({
      where: {
        id: {
          in: presupuestosSinTicket.map(p => p.id)
        }
      }
    });
    console.log(`Se eliminaron ${presupuestosSinTicket.length} presupuestos sin ticket`);

    console.log('Limpieza completada exitosamente');
  } catch (error) {
    console.error('Error durante la limpieza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup(); 