const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de precios - Sexto bloque desde el archivo .txt
const PRECIOS_BLOQUE_6 = [
  { sku: 'Z012T', precio: 2115 },
  { sku: 'Z0789', precio: 805 },
  { sku: 'Z0670', precio: 1263 },
  { sku: 'Z0234', precio: 1625 },
  { sku: 'Z0640', precio: 1870 },
  { sku: 'Z0999+F', precio: 687 },
  { sku: 'Z0444', precio: 487 },
  { sku: 'Z0999', precio: 467 },
  { sku: 'Z0717', precio: 492 },
  { sku: 'Z0667', precio: 793 },
  { sku: 'Z0128', precio: 2325 },
  { sku: 'Z0675+F', precio: 730 },
  { sku: 'Z0666', precio: 1700 },
  { sku: 'Z0551', precio: 644 },
  { sku: 'Z0334', precio: 3750 },
  { sku: 'Z0021', precio: 675 },
  { sku: 'KL-HD064-N8P', precio: 432 },
  { sku: 'KL-HD064-N11', precio: 550 },
  { sku: 'Z3456', precio: 1530 },
  { sku: 'KL-HD065-N9', precio: 372 },
  { sku: 'Z0417+F', precio: 1500 },
  { sku: 'Z1133+F/O', precio: 2700 },
  { sku: 'Z1133+F/0', precio: 2875 },
  { sku: 'Z1133+F/V', precio: 2800 },
  { sku: 'Z1133+F/A', precio: 2800 },
  { sku: 'Z1133+F', precio: 2575 },
  { sku: 'Z0105', precio: 624 },
  { sku: 'Z1133', precio: 1763 },
  { sku: 'Z0021+F', precio: 740 },
  { sku: 'Z0675', precio: 630 },
  { sku: 'Z7878', precio: 1650 },
  { sku: 'Z1279', precio: 1720 },
  { sku: 'Z1313', precio: 687 },
  { sku: 'Z0044', precio: 2175 },
  { sku: 'Z0887+F', precio: 830 },
  { sku: 'Z0022+F', precio: 700 },
  { sku: 'Z0088', precio: 510 },
  { sku: 'Z3690+F', precio: 788 },
  { sku: 'Z0091+F', precio: 630 },
  { sku: 'Z0535+F', precio: 1490 },
  { sku: 'Z1120+F', precio: 658 },
  { sku: 'Z1212+F', precio: 810 },
  { sku: 'Z1212', precio: 673 },
  { sku: 'Z1120', precio: 492 },
  { sku: 'Z0179+F', precio: 675 },
  { sku: 'Z0330', precio: 687 },
  { sku: 'Z0345', precio: 630 },
  { sku: 'Z1110', precio: 1725 },
  { sku: 'Z0690+F', precio: 638 },
  { sku: 'Z0690', precio: 464 },
  { sku: 'Z0092', precio: 407 },
  { sku: 'Z1122', precio: 673 },
  { sku: 'Z8877', precio: 1408 },
  { sku: 'Z0091', precio: 527 },
  { sku: 'Z0535', precio: 1430 },
  { sku: 'Z0022', precio: 515 },
  { sku: 'Z7000', precio: 700 },
  { sku: 'Z0155', precio: 607 },
  { sku: 'Z0123-Z0887', precio: 664 },
  { sku: 'Z0120', precio: 550 },
  { sku: 'Z0010', precio: 595 },
  { sku: 'ZT202+F', precio: 708 },
  { sku: 'ZT502+F', precio: 720 },
  { sku: 'ZT072+F', precio: 745 },
  { sku: 'ZT540+F', precio: 788 },
  { sku: 'ZT533+F', precio: 800 },
  { sku: 'ZT700+F', precio: 750 },
  { sku: 'ZT522+F', precio: 788 },
  { sku: 'ZT720+F', precio: 775 },
  { sku: 'ZT053+F', precio: 770 },
  { sku: 'ZT505+F', precio: 720 },
  { sku: 'ZT207', precio: 615 },
  { sku: 'ZT031', precio: 630 },
  { sku: 'ZT720', precio: 664 },
  { sku: 'ZT540', precio: 587 },
  { sku: 'ZT533', precio: 705 },
  { sku: 'ZT053', precio: 615 },
  { sku: 'ZT520', precio: 644 },
  { sku: 'ZT522', precio: 615 },
  { sku: 'ZT505', precio: 658 },
  { sku: 'ZT702', precio: 604 },
  { sku: 'ZT502', precio: 615 },
  { sku: 'ZT202', precio: 601 },
  { sku: 'AX60', precio: 1300 },
  { sku: 'AX60lite', precio: 704 },
  { sku: 'AX040', precio: 3125 },
  { sku: 'AX20', precio: 2450 },
  { sku: 'AX40pro', precio: 2320 },
  { sku: 'AX11', precio: 1850 },
  { sku: 'AX30', precio: 3500 },
  { sku: 'AX30pro', precio: 3450 },
  { sku: 'AX50lite', precio: 715 },
  { sku: 'AX40lite', precio: 650 },
  { sku: 'ZT222', precio: 675 },
  { sku: 'ZT200', precio: 567 },
  { sku: 'ZT046+F', precio: 775 },
  { sku: 'ZT044+F', precio: 810 },
  { sku: 'ZT400+F', precio: 725 },
  { sku: 'ZT030+F', precio: 850 },
  { sku: 'ZT004', precio: 1345 },
  { sku: 'ZT500', precio: 704 },
  { sku: 'ZT020', precio: 670 },
  { sku: 'ZT022', precio: 615 },
  { sku: 'ZT002', precio: 624 },
  { sku: 'ZT441', precio: 615 },
  { sku: 'ZT001', precio: 838 },
  { sku: 'ZT009', precio: 687 },
  { sku: 'ZT010', precio: 550 },
  { sku: 'ZT099', precio: 601 },
  { sku: 'ZT030', precio: 695 },
  { sku: 'ZT400', precio: 630 },
  { sku: 'ZT801', precio: 615 },
  { sku: 'ZT205', precio: 624 },
  { sku: 'ZT046', precio: 615 },
  { sku: 'ZT044', precio: 615 },
  { sku: 'ZT056', precio: 624 }
];

async function updatePreciosVentaBloque6() {
  const result = {
    totalProductos: PRECIOS_BLOQUE_6.length,
    actualizados: 0,
    creados: 0,
    noEncontrados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando actualización de precios de venta - Bloque 6...\n');
    console.log(`📦 Productos a procesar: ${result.totalProductos}`);

    for (const item of PRECIOS_BLOQUE_6) {
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
    console.log('\n📊 RESUMEN DE ACTUALIZACIÓN - BLOQUE 6:');
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
updatePreciosVentaBloque6();
