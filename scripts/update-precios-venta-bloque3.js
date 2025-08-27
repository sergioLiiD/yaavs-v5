const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de precios - Tercer bloque desde el archivo .txt
const PRECIOS_BLOQUE_3 = [
  { sku: 'AL503', precio: 558 },
  { sku: 'AL524', precio: 595 },
  { sku: 'AL528', precio: 561 },
  { sku: 'A0550', precio: 653 },
  { sku: 'A0005', precio: 681 },
  { sku: 'A0230', precio: 601 },
  { sku: 'A0220', precio: 587 },
  { sku: 'A0444', precio: 650 },
  { sku: 'A0060', precio: 581 },
  { sku: 'A0411', precio: 587 },
  { sku: 'A0555', precio: 653 },
  { sku: 'A0611', precio: 725 },
  { sku: 'A0511', precio: 644 },
  { sku: 'A0610', precio: 763 },
  { sku: 'A0310', precio: 601 },
  { sku: 'A0066', precio: 775 },
  { sku: 'H0505', precio: 675 },
  { sku: 'A0055', precio: 607 },
  { sku: 'A0050', precio: 687 },
  { sku: 'A0040', precio: 601 },
  { sku: 'A0030', precio: 587 },
  { sku: 'W0805', precio: 561 },
  { sku: 'W0070', precio: 1745 },
  { sku: 'W1199+F', precio: 3450 },
  { sku: 'W0090+F', precio: 3625 },
  { sku: 'W0066+F', precio: 720 },
  { sku: 'W0090', precio: 2675 },
  { sku: 'W0077+F', precio: 650 },
  { sku: 'W1100+F', precio: 855 },
  { sku: 'W0066', precio: 530 },
  { sku: 'W0909+F', precio: 975 },
  { sku: 'W1177+F', precio: 980 },
  { sku: 'W1188+F', precio: 2950 },
  { sku: 'W1177', precio: 700 },
  { sku: 'W0606+F', precio: 705 },
  { sku: 'W0505+F', precio: 688 },
  { sku: 'W1188', precio: 1995 },
  { sku: 'W1199', precio: 2700 },
  { sku: 'W1818+F', precio: 1275 },
  { sku: 'W0088+F', precio: 995 },
  { sku: 'W0505', precio: 552 },
  { sku: 'W9090+F/g', precio: 2288 },
  { sku: 'W9090+F/S', precio: 2288 },
  { sku: 'W9090+F', precio: 2300 },
  { sku: 'W0088-COG', precio: 558 },
  { sku: 'W9090', precio: 1880 },
  { sku: 'W1818', precio: 638 },
  { sku: 'W0077', precio: 544 },
  { sku: 'W1010', precio: 601 },
  { sku: 'W1100-COF', precio: 663 },
  { sku: 'W1100-COG', precio: 572 },
  { sku: 'W0550', precio: 780 },
  { sku: 'W0909', precio: 663 },
  { sku: 'W8000+F', precio: 1113 },
  { sku: 'W0707+F', precio: 758 },
  { sku: 'W0606', precio: 550 },
  { sku: 'W8000', precio: 687 },
  { sku: 'W0707', precio: 527 },
  { sku: 'W0088-COF', precio: 710 },
  { sku: 'W0999+F', precio: 875 },
  { sku: 'W0099', precio: 1213 },
  { sku: 'W0222', precio: 995 },
  { sku: 'W0010', precio: 975 },
  { sku: 'W0999', precio: 750 },
  { sku: 'W0101', precio: 558 },
  { sku: 'W0200', precio: 1163 },
  { sku: 'W0002+F', precio: 715 },
  { sku: 'W0012+F', precio: 1013 },
  { sku: 'W0002', precio: 512 },
  { sku: 'W0012', precio: 604 },
  { sku: 'KL-HD067-M11', precio: 401 },
  { sku: 'W0121+F', precio: 963 },
  { sku: 'W0100+F', precio: 2625 },
  { sku: 'W1212+F', precio: 1040 },
  { sku: 'W0100', precio: 2050 },
  { sku: 'W0888+F', precio: 1975 },
  { sku: 'W0300+F', precio: 800 },
  { sku: 'W1414+F', precio: 1030 },
  { sku: 'W0150', precio: 1620 },
  { sku: 'W0011', precio: 1725 },
  { sku: 'W1414', precio: 660 },
  { sku: 'W1212-COG', precio: 693 },
  { sku: 'W0121-COF', precio: 695 },
  { sku: 'W0121-COG', precio: 687 },
  { sku: 'W0911', precio: 1845 },
  { sku: 'W0888', precio: 1750 },
  { sku: 'W0004+F', precio: 663 },
  { sku: 'W0020+F', precio: 663 },
  { sku: 'W0300', precio: 538 },
  { sku: 'W0020', precio: 510 },
  { sku: 'W0004', precio: 572 },
  { sku: 'W0666+F', precio: 720 },
  { sku: '02352HTF', precio: 850 },
  { sku: '02352PJP', precio: 1025 },
  { sku: 'W0030', precio: 2670 },
  { sku: 'W0202+F', precio: 2700 },
  { sku: 'W0029+F', precio: 638 },
  { sku: 'W0666-COF', precio: 487 },
  { sku: 'W0040-COG', precio: 535 },
  { sku: 'W0202', precio: 870 },
  { sku: 'W0029-COG', precio: 558 },
  { sku: 'W0333-COG', precio: 510 },
  { sku: 'W0035', precio: 1575 },
  { sku: 'W0023+F', precio: 800 },
  { sku: 'W0040+F', precio: 913 },
  { sku: 'W0333+F', precio: 875 },
  { sku: 'W0022', precio: 688 },
  { sku: 'W0040-COF', precio: 683 },
  { sku: 'W0029-COF', precio: 710 },
  { sku: 'W0333-COF', precio: 680 },
  { sku: 'W0023', precio: 567 },
  { sku: 'W6000-COF', precio: 544 },
  { sku: 'W0006+F/A', precio: 980 },
  { sku: 'KL-HD065-9X', precio: 429 },
  { sku: 'W0777+F', precio: 701 },
  { sku: 'W0600+F', precio: 673 },
  { sku: 'W0178+F', precio: 653 },
  { sku: 'W0006-COG+F', precio: 675 },
  { sku: 'W0006-COF', precio: 680 },
  { sku: 'W0009-COG', precio: 664 },
  { sku: 'W0019-COG', precio: 510 },
  { sku: 'W0019+F', precio: 925 },
  { sku: 'W0006-COG', precio: 510 },
  { sku: 'W6000+F', precio: 668 },
  { sku: 'W0006+F', precio: 963 },
  { sku: 'W0027+F', precio: 688 },
  { sku: 'W0069+F', precio: 678 },
  { sku: 'W0045+F', precio: 763 },
  { sku: 'W0009+F', precio: 1005 },
  { sku: 'W0007+F', precio: 950 },
  { sku: 'W0808+F', precio: 805 },
  { sku: 'W0007-COG', precio: 527 },
  { sku: 'W0009-COF', precio: 695 },
  { sku: 'W0718', precio: 447 },
  { sku: 'W0600', precio: 481 },
  { sku: 'W0027', precio: 492 },
  { sku: 'W0045', precio: 544 },
  { sku: 'W0808', precio: 584 },
  { sku: 'W6000-COG', precio: 510 },
  { sku: 'W0019-COF', precio: 675 },
  { sku: 'W0007-COF', precio: 675 },
  { sku: 'W0777', precio: 424 },
  { sku: 'W0069', precio: 464 },
  { sku: 'X0688', precio: 601 },
  { sku: 'X0678+F', precio: 963 },
  { sku: 'X0678', precio: 795 },
  { sku: 'X0031+F', precio: 800 },
  { sku: 'X0065+F', precio: 658 },
  { sku: 'X0011+F', precio: 725 },
  { sku: 'X0669+F', precio: 701 },
  { sku: 'X0065', precio: 472 },
  { sku: 'X0669', precio: 504 },
  { sku: 'X0011-X2186', precio: 693 },
  { sku: 'X0031', precio: 653 },
  { sku: 'H0422', precio: 535 },
  { sku: 'H0512', precio: 510 },
  { sku: 'H0909', precio: 527 },
  { sku: 'H0777', precio: 492 },
  { sku: 'H0551', precio: 501 },
  { sku: 'H0998', precio: 510 },
  { sku: 'F1414', precio: 530 },
  { sku: 'KL-HD065-E32', precio: 452 },
  { sku: 'KL-HD065-E7+F', precio: 501 },
  { sku: 'KL-HD065-E7', precio: 387 },
  { sku: 'F1313', precio: 478 },
  { sku: 'F1414+F', precio: 638 },
  { sku: 'F0824+F', precio: 715 },
  { sku: 'F0296+F', precio: 687 },
  { sku: 'F0125+F', precio: 638 },
  { sku: 'F0127+F', precio: 687 },
  { sku: 'F0702+F', precio: 630 },
  { sku: 'A0044+F', precio: 675 },
  { sku: 'F6011+F', precio: 715 },
  { sku: 'F0855-O', precio: 458 },
  { sku: 'F0855-N', precio: 458 },
  { sku: 'F6011', precio: 481 },
  { sku: 'F0127', precio: 487 },
  { sku: 'F0125', precio: 524 }
];

async function updatePreciosVentaBloque3() {
  const result = {
    totalProductos: PRECIOS_BLOQUE_3.length,
    actualizados: 0,
    creados: 0,
    noEncontrados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando actualización de precios de venta - Bloque 3...\n');
    console.log(`📦 Productos a procesar: ${result.totalProductos}`);

    for (const item of PRECIOS_BLOQUE_3) {
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

        // Buscar si ya existe un precio de venta para este producto
        const precioVentaExistente = await prisma.precios_venta.findFirst({
          where: {
            producto_id: producto.id
          }
        });

        if (precioVentaExistente) {
          // Actualizar precio de venta existente
          await prisma.precios_venta.update({
            where: { id: precioVentaExistente.id },
            data: {
              precio_venta: item.precio,
              updated_at: new Date(),
              updated_by: 'system'
            }
          });

          console.log(`✅ Precio actualizado: ${item.sku} - $${item.precio} (ID: ${precioVentaExistente.id})`);
          result.actualizados++;
        } else {
          // Crear nuevo precio de venta
          const nuevoPrecioVenta = await prisma.precios_venta.create({
            data: {
              tipo: 'PRODUCTO',
              nombre: producto.nombre,
              marca: producto.marca || 'N/A',
              modelo: producto.modelo || 'N/A',
              precio_compra_promedio: producto.precio_promedio || 0,
              precio_venta: item.precio,
              producto_id: producto.id,
              created_by: 'system',
              updated_by: 'system',
              created_at: new Date(),
              updated_at: new Date()
            }
          });

          console.log(`✅ Precio creado: ${item.sku} - $${item.precio} (ID: ${nuevoPrecioVenta.id})`);
          result.creados++;
        }

      } catch (error) {
        const errorMsg = `Error al procesar ${item.sku}: ${error.message || 'Error desconocido'}`;
        console.error(`❌ ${errorMsg}`);
        result.errores.push(errorMsg);
      }
    }

    // Mostrar resumen
    console.log('\n📊 RESUMEN DE ACTUALIZACIÓN - BLOQUE 3:');
    console.log('='.repeat(50));
    console.log(`📦 Total de productos: ${result.totalProductos}`);
    console.log(`✅ Precios actualizados: ${result.actualizados}`);
    console.log(`🆕 Precios creados: ${result.creados}`);
    console.log(`⚠️  Productos no encontrados: ${result.noEncontrados}`);
    console.log(`❌ Errores: ${result.errores.length}`);

    if (result.errores.length > 0) {
      console.log('\n❌ ERRORES DETALLADOS:');
      result.errores.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (result.actualizados > 0 || result.creados > 0) {
      console.log(`\n🎉 ¡Actualización completada! Se procesaron ${result.actualizados + result.creados} precios de venta.`);
      console.log('📋 Los precios están disponibles en /dashboard/costos/precios-venta');
    } else {
      console.log('\n⚠️  No se procesaron precios.');
    }

  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
updatePreciosVentaBloque3();
