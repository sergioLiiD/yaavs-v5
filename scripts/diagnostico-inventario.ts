import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnosticarInventario() {
  try {
    console.log('🔍 Iniciando diagnóstico de inventario...\n');

    // 1. Verificar tickets con reparaciones completadas recientemente
    console.log('📋 Buscando tickets con reparaciones completadas...');
    const ticketsReparados = await prisma.tickets.findMany({
      where: {
        estatus_reparacion: {
          nombre: 'Reparado'
        },
        fecha_fin_reparacion: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 días
        }
      },
      include: {
        estatus_reparacion: true,
        reparaciones: true,
        presupuestos: {
          include: {
            conceptos_presupuesto: true
          }
        }
      },
      orderBy: {
        fecha_fin_reparacion: 'desc'
      },
      take: 10
    });

    console.log(`✅ Encontrados ${ticketsReparados.length} tickets reparados recientemente\n`);

    for (const ticket of ticketsReparados) {
      console.log(`\n🎫 Ticket #${ticket.numero_ticket} (ID: ${ticket.id})`);
      console.log(`   Estado: ${ticket.estatus_reparacion?.nombre}`);
      console.log(`   Fecha reparación: ${ticket.fecha_fin_reparacion}`);
      
      // 2. Verificar si tiene reparación
      if (ticket.reparaciones) {
        console.log(`   ✅ Tiene reparación registrada (ID: ${ticket.reparaciones.id})`);
        
        // 3. Verificar piezas en tabla nueva
        const piezasNuevas = await prisma.piezas_reparacion_productos.findMany({
          where: { reparacion_id: ticket.reparaciones.id },
          include: {
            productos: true
          }
        });
        
        console.log(`   📦 Piezas en tabla nueva: ${piezasNuevas.length}`);
        
        // 4. Verificar piezas en tabla antigua
        const piezasAntiguas = await prisma.piezas_reparacion.findMany({
          where: { reparacion_id: ticket.reparaciones.id },
          include: {
            piezas: true
          }
        });
        
        console.log(`   📦 Piezas en tabla antigua: ${piezasAntiguas.length}`);
        
        // 5. Verificar conceptos del presupuesto
        if (ticket.presupuestos) {
          console.log(`   💰 Conceptos del presupuesto: ${ticket.presupuestos.conceptos_presupuesto.length}`);
          
          for (const concepto of ticket.presupuestos.conceptos_presupuesto) {
            console.log(`      - ${concepto.descripcion} (${concepto.cantidad}x $${concepto.precio_unitario})`);
            
            // Buscar producto correspondiente
            const producto = await prisma.productos.findFirst({
              where: {
                nombre: {
                  contains: concepto.descripcion,
                  mode: 'insensitive'
                }
              }
            });
            
            if (producto) {
              console.log(`        ✅ Producto encontrado: ${producto.nombre} (Stock: ${producto.stock})`);
            } else {
              console.log(`        ❌ No se encontró producto para: ${concepto.descripcion}`);
            }
          }
        }
        
        // 6. Verificar salidas de almacén
        const salidas = await prisma.salidas_almacen.findMany({
          where: {
            referencia: `Ticket-${ticket.id}`,
            tipo: 'REPARACION'
          },
          include: {
            productos: true
          }
        });
        
        console.log(`   📤 Salidas de almacén: ${salidas.length}`);
        
        for (const salida of salidas) {
          console.log(`      - ${salida.productos.nombre}: ${salida.cantidad} unidades`);
        }
        
        // 7. Verificar si debería haber descuento
        const totalPiezas = piezasNuevas.length + piezasAntiguas.length;
        const totalSalidas = salidas.length;
        
        if (totalPiezas > 0 && totalSalidas === 0) {
          console.log(`   ⚠️  PROBLEMA: Tiene ${totalPiezas} piezas pero 0 salidas de almacén`);
        } else if (totalPiezas === 0 && ticket.presupuestos?.conceptos_presupuesto.length > 0) {
          console.log(`   ⚠️  PROBLEMA: Tiene conceptos pero no se convirtieron a piezas`);
        } else {
          console.log(`   ✅ Estado correcto: ${totalPiezas} piezas, ${totalSalidas} salidas`);
        }
        
      } else {
        console.log(`   ❌ No tiene reparación registrada`);
      }
    }

    // 8. Verificar productos con stock bajo
    console.log('\n📊 Productos con stock bajo:');
    const productosStockBajo = await prisma.productos.findMany({
      where: {
        stock: {
          lte: 5
        },
        tipo: 'PRODUCTO'
      },
      include: {
        marcas: true,
        modelos: true
      },
      orderBy: {
        stock: 'asc'
      },
      take: 10
    });

    for (const producto of productosStockBajo) {
      console.log(`   - ${producto.nombre} (${producto.marcas?.nombre} ${producto.modelos?.nombre}): ${producto.stock} unidades`);
    }

    // 9. Verificar salidas de almacén recientes
    console.log('\n📤 Últimas salidas de almacén:');
    const ultimasSalidas = await prisma.salidas_almacen.findMany({
      where: {
        created_at: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 días
        }
      },
      include: {
        productos: true
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 10
    });

    for (const salida of ultimasSalidas) {
      console.log(`   - ${salida.productos.nombre}: ${salida.cantidad} unidades (${salida.tipo}) - ${salida.created_at}`);
    }

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnosticoInventario();
