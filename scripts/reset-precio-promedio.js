const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Función para resetear precio_promedio a 0
async function resetPrecioPromedio() {
  try {
    console.log('🚀 Iniciando reseteo de precio_promedio a 0...\n');

    // Obtener todos los productos
    const productos = await prisma.productos.findMany({
      select: {
        id: true,
        sku: true,
        nombre: true,
        precio_promedio: true
      }
    });

    console.log(`📦 Total de productos encontrados: ${productos.length}`);

    let actualizados = 0;
    let errores = 0;

    for (const producto of productos) {
      try {
        // Actualizar precio_promedio a 0
        await prisma.productos.update({
          where: { id: producto.id },
          data: {
            precio_promedio: 0,
            updated_at: new Date()
          }
        });
        
        actualizados++;
        console.log(`✅ Reseteado: ${producto.sku} - Precio anterior: $${producto.precio_promedio} → $0`);

      } catch (error) {
        console.error(`❌ Error con ${producto.sku}: ${error.message}`);
        errores++;
      }
    }

    console.log('\n📊 RESUMEN:');
    console.log('='.repeat(50));
    console.log(`📦 Total productos: ${productos.length}`);
    console.log(`✅ Precios reseteados: ${actualizados}`);
    console.log(`❌ Errores: ${errores}`);

    if (actualizados > 0) {
      console.log(`\n🎉 ¡Reseteo completado! Todos los precio_promedio ahora son $0`);
    }

  } catch (error) {
    console.error('❌ Error fatal:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
resetPrecioPromedio();
