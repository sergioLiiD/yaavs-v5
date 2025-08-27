const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Función para actualizar precios de venta en la tabla correcta
async function updatePreciosVentaCorrecto() {
  try {
    console.log('🚀 Iniciando actualización de precios de venta en tabla correcta...\n');

    // Obtener todos los productos
    const productos = await prisma.productos.findMany({
      include: {
        marcas: true,
        modelos: true
      }
    });

    console.log(`📦 Total de productos encontrados: ${productos.length}`);

    let actualizados = 0;
    let creados = 0;
    let errores = 0;

    for (const producto of productos) {
      try {
        // Buscar si ya existe un precio de venta para este producto
        let precioVenta = await prisma.precios_venta.findFirst({
          where: {
            producto_id: producto.id,
            tipo: 'PRODUCTO'
          }
        });

        if (precioVenta) {
          // Actualizar precio existente
          await prisma.precios_venta.update({
            where: { id: precioVenta.id },
            data: {
              precio_venta: producto.precio_promedio || 0,
              updated_at: new Date(),
              updated_by: 'SISTEMA'
            }
          });
          actualizados++;
          console.log(`✅ Actualizado: ${producto.sku} - $${producto.precio_promedio || 0}`);
        } else {
          // Crear nuevo precio de venta
          await prisma.precios_venta.create({
            data: {
              tipo: 'PRODUCTO',
              nombre: producto.nombre,
              marca: producto.marcas?.nombre || '',
              modelo: producto.modelos?.nombre || '',
              precio_compra_promedio: producto.precio_promedio || 0,
              precio_venta: producto.precio_promedio || 0,
              producto_id: producto.id,
              created_by: 'SISTEMA',
              updated_by: 'SISTEMA',
              created_at: new Date(),
              updated_at: new Date()
            }
          });
          creados++;
          console.log(`🆕 Creado: ${producto.sku} - $${producto.precio_promedio || 0}`);
        }

      } catch (error) {
        console.error(`❌ Error con ${producto.sku}: ${error.message}`);
        errores++;
      }
    }

    console.log('\n📊 RESUMEN:');
    console.log('='.repeat(50));
    console.log(`📦 Total productos: ${productos.length}`);
    console.log(`✅ Precios actualizados: ${actualizados}`);
    console.log(`🆕 Precios creados: ${creados}`);
    console.log(`❌ Errores: ${errores}`);

    if (actualizados > 0 || creados > 0) {
      console.log(`\n🎉 ¡Proceso completado! Ahora los precios aparecerán en /dashboard/costos/precios-venta`);
    }

  } catch (error) {
    console.error('❌ Error fatal:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
updatePreciosVentaCorrecto();
