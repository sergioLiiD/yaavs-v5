import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:0soNv75*@postgres:5432/yaavs_db'
    }
  }
});

async function fixTicketsInventario() {
  try {
    console.log('🔧 Iniciando corrección de tickets con problemas de inventario...\n');

    // Tickets problemáticos identificados en el diagnóstico
    const ticketsProblematicos = [15, 14, 12]; // IDs de los tickets con problemas

    for (const ticketId of ticketsProblematicos) {
      console.log(`\n🎫 Procesando Ticket #${ticketId}...`);
      
      // Obtener el ticket
      const ticket = await prisma.tickets.findUnique({
        where: { id: ticketId },
        include: {
          reparaciones: true,
          presupuestos: {
            include: {
              conceptos_presupuesto: true
            }
          }
        }
      });

      if (!ticket) {
        console.log(`❌ Ticket #${ticketId} no encontrado`);
        continue;
      }

      console.log(`   Estado: ${ticket.estatus_reparacion_id}`);
      console.log(`   Conceptos: ${ticket.presupuestos?.conceptos_presupuesto.length || 0}`);

      if (!ticket.reparaciones) {
        console.log(`❌ Ticket #${ticketId} no tiene reparación registrada`);
        continue;
      }

      // Verificar si ya tiene piezas registradas
      const piezasExistentes = await prisma.piezas_reparacion_productos.findMany({
        where: { reparacion_id: ticket.reparaciones.id },
        include: { productos: true }
      });

      console.log(`   Piezas existentes: ${piezasExistentes.length}`);

      // Si no tiene piezas, convertir conceptos
      if (piezasExistentes.length === 0 && ticket.presupuestos) {
        console.log(`   🔄 Convirtiendo conceptos a piezas...`);
        
        for (const concepto of ticket.presupuestos.conceptos_presupuesto) {
          console.log(`      Procesando: ${concepto.descripcion}`);
          
          // Buscar producto
          let producto = await prisma.productos.findFirst({
            where: {
              nombre: {
                equals: concepto.descripcion.trim(),
                mode: 'insensitive'
              },
              tipo: 'PRODUCTO'
            }
          });

          if (!producto) {
            producto = await prisma.productos.findFirst({
              where: {
                nombre: {
                  contains: concepto.descripcion.trim(),
                  mode: 'insensitive'
                },
                tipo: 'PRODUCTO'
              }
            });
          }

          if (producto) {
            console.log(`      ✅ Producto encontrado: ${producto.nombre}`);
            
            // Crear pieza de reparación
            await prisma.piezas_reparacion_productos.create({
              data: {
                reparacion_id: ticket.reparaciones.id,
                producto_id: producto.id,
                cantidad: concepto.cantidad,
                precio: concepto.precio_unitario,
                total: concepto.total,
                created_at: new Date(),
                updated_at: new Date()
              }
            });
            
            console.log(`      ✅ Pieza creada para ${producto.nombre}`);
          } else {
            console.log(`      ❌ No se encontró producto para: ${concepto.descripcion}`);
          }
        }
      }

      // Verificar si tiene salidas de almacén
      const salidasExistentes = await prisma.salidas_almacen.findMany({
        where: {
          referencia: `Ticket-${ticketId}`,
          tipo: 'REPARACION'
        }
      });

      console.log(`   Salidas existentes: ${salidasExistentes.length}`);

      // Si no tiene salidas pero tiene piezas, crear salidas
      if (salidasExistentes.length === 0 && piezasExistentes.length > 0) {
        console.log(`   🔄 Creando salidas de almacén...`);
        
        for (const pieza of piezasExistentes) {
          const producto = pieza.productos;
          
          // Verificar si es un servicio
          const conceptosSinStock = ['Mano de Obra', 'Diagnostico', 'Diagnóstico', 'Servicio'];
          const esServicio = conceptosSinStock.some(concepto => 
            producto.nombre?.toLowerCase().includes(concepto.toLowerCase())
          );
          
          if (esServicio) {
            console.log(`      ⏭️  Saltando servicio: ${producto.nombre}`);
            continue;
          }

          // Verificar stock
          if (producto.stock < pieza.cantidad) {
            console.log(`      ⚠️  Stock insuficiente para ${producto.nombre}: ${producto.stock} < ${pieza.cantidad}`);
            continue;
          }

          // Crear salida de almacén
          await prisma.salidas_almacen.create({
            data: {
              producto_id: producto.id,
              cantidad: pieza.cantidad,
              tipo: 'REPARACION',
              razon: `Reparación completada - Ticket #${ticketId}`,
              referencia: `Ticket-${ticketId}`,
              usuario_id: 1, // Usuario por defecto
              fecha: new Date(),
              created_at: new Date(),
              updated_at: new Date()
            }
          });

          // Actualizar stock
          await prisma.productos.update({
            where: { id: producto.id },
            data: {
              stock: {
                decrement: pieza.cantidad
              },
              updated_at: new Date()
            }
          });

          console.log(`      ✅ Salida creada y stock actualizado para ${producto.nombre}`);
        }
      }

      console.log(`✅ Ticket #${ticketId} procesado`);
    }

    console.log('\n🎉 Corrección completada');

  } catch (error) {
    console.error('❌ Error en corrección:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTicketsInventario();
