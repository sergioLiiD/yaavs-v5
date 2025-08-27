const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de precios Apple desde el archivo .txt
const PRECIOS_APPLE = [
  { sku: 'BT-IP-12MINI', precio: 516.00 },
  { sku: 'BT-IP-13', precio: 516.00 },
  { sku: 'BT-IP-13MINI', precio: 465.00 },
  { sku: 'BT-IP-12 MINI', precio: 540.00 },
  { sku: 'BT-IP-12PRO MAX', precio: 709.00 },
  { sku: 'BT-IP-12/12PRO', precio: 546.00 },
  { sku: 'BT-IP-11PRO MAX', precio: 640.00 },
  { sku: 'BT-IP-11PRO', precio: 646.00 },
  { sku: 'BT-IP-11', precio: 537.00 },
  { sku: 'BT-IP-XS MAX', precio: 453.00 },
  { sku: 'BT-IP-XR', precio: 487.00 },
  { sku: 'BT-IP-XS', precio: 546.00 },
  { sku: 'BT-IP-X', precio: 501.00 },
  { sku: 'BT-IP-8PLUS', precio: 459.00 },
  { sku: 'BT-IP-SE 2020', precio: 406.00 },
  { sku: 'BT-IP-8G', precio: 389.00 },
  { sku: 'BT-IP-7PLUS', precio: 406.00 },
  { sku: 'BT-IP-7G', precio: 361.00 },
  { sku: 'BT-IP-6S PLUS', precio: 385.00 },
  { sku: 'BT-IP-6G', precio: 361.00 },
  { sku: 'V003', precio: 447 },
  { sku: 'V004-B', precio: 401 },
  { sku: 'V004-N', precio: 409 },
  { sku: 'V0092-B', precio: 418 },
  { sku: 'V0092-N', precio: 401 },
  { sku: 'V0015-B', precio: 372 },
  { sku: 'V0015-N', precio: 372 },
  { sku: 'V0091-B', precio: 481 },
  { sku: 'V0091-N', precio: 481 },
  { sku: 'V005-B', precio: 444 },
  { sku: 'V005-N', precio: 444 },
  { sku: 'I014', precio: 725 },
  { sku: 'I023', precio: 738 },
  { sku: 'I031', precio: 1300 },
  { sku: 'I027', precio: 1980 },
  { sku: 'I016', precio: 738 },
  { sku: 'I029', precio: 1275 },
  { sku: 'I028', precio: 2200 },
  { sku: 'I015', precio: 738 },
  { sku: 'I017', precio: 870 },
  { sku: 'I019', precio: 955 },
  { sku: 'I021', precio: 945 },
  { sku: 'I022', precio: 1150 },
  { sku: 'I034', precio: 2800 },
  { sku: 'I030', precio: 2700 },
  { sku: 'I024', precio: 1150 },
  { sku: 'I018', precio: 870 },
  { sku: 'JKI-FHD0670-C8', precio: 4175 },
  { sku: 'JKI-FHD0550-M2', precio: 1625 },
  { sku: 'JKI-FHD0550-M1', precio: 1625 },
  { sku: 'JKI-FHD0600-H4', precio: 3850 },
  { sku: 'JKI-FHD0670-C6', precio: 1375 },
  { sku: 'JKI-FHD0650-L2', precio: 963 },
  { sku: 'JKI-FHD0650-L1', precio: 913 },
  { sku: 'JKI-FHD0600-H3', precio: 1300 },
  { sku: 'JKI-FHD0600-H2', precio: 1320 },
  { sku: 'JKI-FHD0600-H1', precio: 980 },
  { sku: 'JKI-FHD0610-S2', precio: 725 },
  { sku: 'JKI-FHD0610-S1', precio: 715 },
  { sku: 'JKI-FHD0580-Z3', precio: 875 },
  { sku: 'JKI-FHD0580-Z2', precio: 738 },
  { sku: 'JKI-FHD0580-Z1', precio: 730 },
  { sku: 'JKI-HD0580-Z3', precio: 638 },
  { sku: 'JKI-HD0650-L2', precio: 730 },
  { sku: 'JKI-HD0650-L1', precio: 700 },
  { sku: 'JKI-HD0610-S2', precio: 644 },
  { sku: 'JKI-HD0610-S1', precio: 630 },
  { sku: 'JKI-HD0580-Z2', precio: 630 },
  { sku: 'JKI-HD0580-Z1', precio: 630 },
  { sku: 'X15PRO MAX INCELL-IC', precio: 3625 },
  { sku: 'X15PRO INCELL-IC', precio: 2400 },
  { sku: 'X12MINI INCELL', precio: 1425 },
  { sku: 'V0037', precio: 595 },
  { sku: 'V0035', precio: 653 },
  { sku: 'V0038', precio: 595 },
  { sku: 'XS INCELL', precio: 715 },
  { sku: 'X11PRO INCELL-IC', precio: 750 },
  { sku: 'X11PRO MAX INCELL-IC', precio: 780 },
  { sku: 'X12PRO INCELL-IC', precio: 888 },
  { sku: 'XS MAX INCELL', precio: 775 },
  { sku: 'X11 INCELL-IC', precio: 663 },
  { sku: 'X13MINI INCELL', precio: 1450 },
  { sku: 'XR INCELL', precio: 638 },
  { sku: 'X INCELL', precio: 715 },
  { sku: 'RF-6715PM-F', precio: 13250 },
  { sku: 'RF-6714PM-F', precio: 12000 },
  { sku: 'RF-6713PM-F', precio: 8750 },
  { sku: 'LF-6712PM-F', precio: 4250 },
  { sku: 'X15 OLED-IC', precio: 5800 },
  { sku: 'X13PRO MAX OLED-IC', precio: 6250 },
  { sku: 'JKO-FHD0600-C1', precio: 1950 },
  { sku: 'JKO-FHD0600-C3', precio: 3125 },
  { sku: 'JKO-FHD0600-C2', precio: 3125 },
  { sku: 'JKO-FHD0650-L3', precio: 1813 },
  { sku: 'JKO-FHD0650-L4', precio: 1688 },
  { sku: 'X14 OLED-IC', precio: 2625 },
  { sku: 'X14PRO OLED-IC', precio: 6700 },
  { sku: 'X13PRO OLED-IC', precio: 3850 },
  { sku: 'X13 OLED', precio: 2475 },
  { sku: 'X12PRO MAX OLED-IC', precio: 3525 },
  { sku: 'X11PRO OLED-IC', precio: 1425 },
  { sku: 'X13 OLED-IC', precio: 2638 },
  { sku: 'X11PRO MAX OLED-IC', precio: 1965 },
  { sku: 'X12PRO OLED-IC', precio: 1950 },
  { sku: 'X12PRO MAX OLED', precio: 2625 },
  { sku: 'XS MAX OLED', precio: 1755 },
  { sku: 'XS OLED', precio: 1330 },
  { sku: 'X OLED', precio: 1370 }
];

async function updatePreciosApple() {
  const result = {
    marca: 'APPLE',
    totalProductos: PRECIOS_APPLE.length,
    actualizados: 0,
    noEncontrados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando actualización de precios Apple...\n');
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📦 Productos a actualizar: ${result.totalProductos}`);

    for (const item of PRECIOS_APPLE) {
      try {
        // Buscar el producto por SKU
        const producto = await prisma.productos.findFirst({
          where: {
            sku: {
              equals: item.sku,
              mode: 'insensitive'
            }
          }
        });

        if (!producto) {
          console.log(`⚠️  Producto no encontrado: ${item.sku}`);
          result.noEncontrados++;
          continue;
        }

        // Actualizar el precio
        await prisma.productos.update({
          where: { id: producto.id },
          data: {
            precio_promedio: item.precio,
            updated_at: new Date()
          }
        });

        console.log(`✅ Precio actualizado: ${item.sku} - $${item.precio} (ID: ${producto.id})`);
        result.actualizados++;

      } catch (error) {
        const errorMsg = `Error al actualizar ${item.sku}: ${error.message || 'Error desconocido'}`;
        console.error(`❌ ${errorMsg}`);
        result.errores.push(errorMsg);
      }
    }

    // Mostrar resumen
    console.log('\n📊 RESUMEN DE ACTUALIZACIÓN APPLE:');
    console.log('='.repeat(50));
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📦 Total de productos: ${result.totalProductos}`);
    console.log(`✅ Precios actualizados: ${result.actualizados}`);
    console.log(`⚠️  Productos no encontrados: ${result.noEncontrados}`);
    console.log(`❌ Errores: ${result.errores.length}`);

    if (result.errores.length > 0) {
      console.log('\n❌ ERRORES DETALLADOS:');
      result.errores.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (result.actualizados > 0) {
      console.log(`\n🎉 ¡Actualización completada! Se actualizaron ${result.actualizados} precios de Apple.`);
      console.log('📋 Los precios están disponibles en /dashboard/costos/precios-venta');
    } else {
      console.log('\n⚠️  No se actualizaron precios.');
    }

  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
updatePreciosApple();
