const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de precios - Quinto bloque desde el archivo .txt
const PRECIOS_BLOQUE_5 = [
  { sku: 'T1155+F', precio: 1700 },
  { sku: 'T2222+F', precio: 701 },
  { sku: 'T3333+F', precio: 638 },
  { sku: 'T0185+F', precio: 644 },
  { sku: 'T0344+F', precio: 572 },
  { sku: 'T0055+F', precio: 1270 },
  { sku: 'T0335+F/', precio: 1625 },
  { sku: 'T0901+F/', precio: 1625 },
  { sku: 'T0147+F', precio: 687 },
  { sku: 'T1440', precio: 481 },
  { sku: 'T1212+F', precio: 630 },
  { sku: 'T0550', precio: 507 },
  { sku: 'T0606', precio: 701 },
  { sku: 'T0015+F', precio: 644 },
  { sku: 'T9181+F', precio: 1725 },
  { sku: 'T0048', precio: 1275 },
  { sku: 'T1350', precio: 481 },
  { sku: 'T0190', precio: 510 },
  { sku: 'T7360+F', precio: 1675 },
  { sku: 'T0977+F', precio: 1355 },
  { sku: 'T0023+F', precio: 1355 },
  { sku: 'T0066+F', precio: 1350 },
  { sku: 'T0211+F', precio: 710 },
  { sku: 'T0069', precio: 429 },
  { sku: 'T0069+F', precio: 658 },
  { sku: 'T0756+F', precio: 1320 },
  { sku: 'T1022+F', precio: 1320 },
  { sku: 'T4607+F', precio: 1913 },
  { sku: 'T0102', precio: 484 },
  { sku: 'T9090+F', precio: 2150 },
  { sku: 'T0115+F', precio: 738 },
  { sku: 'T1460+F', precio: 675 },
  { sku: 'T0334+F', precio: 1725 },
  { sku: 'T6660+F', precio: 401 },
  { sku: 'T0006+F', precio: 670 },
  { sku: 'T5555+F', precio: 693 },
  { sku: 'T3014+F', precio: 678 },
  { sku: 'T1305+F', precio: 713 },
  { sku: 'T0725+F', precio: 1900 },
  { sku: 'T0335+F', precio: 2068 },
  { sku: 'T7799+F', precio: 1730 },
  { sku: 'T1460', precio: 595 },
  { sku: 'T0006', precio: 624 },
  { sku: 'T3014', precio: 435 },
  { sku: 'T5555', precio: 478 },
  { sku: 'T6660', precio: 492 },
  { sku: 'T0002+F', precio: 681 },
  { sku: 'T0333+F', precio: 1655 },
  { sku: 'T0987', precio: 900 },
  { sku: 'T0987+F', precio: 1820 },
  { sku: 'T0901+F', precio: 2113 },
  { sku: 'T1032+F', precio: 1495 },
  { sku: 'T0005+F', precio: 687 },
  { sku: 'T0234+F', precio: 601 },
  { sku: 'T0115', precio: 604 },
  { sku: 'T0015', precio: 478 },
  { sku: 'T0180', precio: 424 },
  { sku: 'T0052', precio: 401 },
  { sku: 'T2222', precio: 478 },
  { sku: 'T0211', precio: 492 },
  { sku: 'T4111', precio: 481 },
  { sku: 'T1212', precio: 444 },
  { sku: 'KL-HD057-SJ6', precio: 407 },
  { sku: 'KL-HD055-J7PA/N', precio: 321 },
  { sku: 'KL-HD055-J7PA/B', precio: 315 },
  { sku: 'KL-HD050-J5P-B', precio: 286 },
  { sku: 'KL-HD050-J5P-N', precio: 286 },
  { sku: 'KL-HD060-J8', precio: 347 },
  { sku: 'T0790-N', precio: 478 },
  { sku: 'T0790-B', precio: 478 },
  { sku: 'T0028', precio: 435 },
  { sku: 'T0209-O', precio: 510 },
  { sku: 'T0209-N', precio: 510 },
  { sku: 'T0089', precio: 1045 },
  { sku: 'T0907', precio: 1425 },
  { sku: 'T0092', precio: 1450 },
  { sku: 'T0043', precio: 900 },
  { sku: 'T0540-B', precio: 464 },
  { sku: 'T0540-N', precio: 464 },
  { sku: 'T0819', precio: 435 },
  { sku: 'T0262', precio: 407 },
  { sku: 'T7373-O', precio: 510 },
  { sku: 'T0019-O', precio: 838 },
  { sku: 'T7001-O', precio: 444 },
  { sku: 'T0101-O', precio: 850 },
  { sku: 'T0001-O', precio: 407 },
  { sku: 'T0380-O', precio: 850 },
  { sku: 'T7373-N', precio: 510 },
  { sku: 'T0019-N', precio: 838 },
  { sku: 'T7001-N', precio: 444 },
  { sku: 'T0101-N', precio: 850 },
  { sku: 'T0001-N', precio: 407 },
  { sku: 'T0380-N', precio: 968 },
  { sku: 'KL-HD062-M2', precio: 387 },
  { sku: 'KL-HD062-M30+F', precio: 538 },
  { sku: 'KL-HD062-M30', precio: 427 },
  { sku: 'T1199+F', precio: 730 },
  { sku: 'T1199', precio: 644 },
  { sku: 'T5699+F', precio: 1965 },
  { sku: 'T0988', precio: 1145 },
  { sku: 'T0926', precio: 535 },
  { sku: 'T0008+F', precio: 705 },
  { sku: 'SA056 WF', precio: 3700 },
  { sku: 'SA130 WF', precio: 5750 },
  { sku: 'T2344+F', precio: 4800 },
  { sku: 'T3230+F', precio: 3550 },
  { sku: 'T2750+F', precio: 4125 },
  { sku: 'T9898+F', precio: 4875 },
  { sku: 'TG035', precio: 358 },
  { sku: 'SA128 WF', precio: 5700 },
  { sku: 'E013 WF', precio: 5100 },
  { sku: 'E011+ WF', precio: 3700 },
  { sku: 'SA129 WF', precio: 5750 },
  { sku: 'E014+ WF', precio: 3713 },
  { sku: 'E015 WF', precio: 5100 },
  { sku: 'SA131 WF', precio: 4300 },
  { sku: 'T2244+F', precio: 8750 },
  { sku: 'T2323/S', precio: 5875 },
  { sku: 'T2323', precio: 5875 },
  { sku: 'T0022/S', precio: 6450 },
  { sku: 'T1100', precio: 5875 },
  { sku: 'T1010', precio: 8250 },
  { sku: 'T2233+F', precio: 5750 },
  { sku: 'T4595+F', precio: 3550 },
  { sku: 'T6600+F', precio: 4800 },
  { sku: 'T0022', precio: 6450 },
  { sku: 'T0828+F', precio: 5050 },
  { sku: 'T9999', precio: 4625 },
  { sku: 'T2220+F', precio: 3575 },
  { sku: 'T8888+F', precio: 4375 },
  { sku: 'T0999+F', precio: 4625 },
  { sku: 'T7686+F', precio: 4625 },
  { sku: 'T2211+F', precio: 4300 },
  { sku: 'T0888', precio: 4200 },
  { sku: 'T2110+F', precio: 2113 },
  { sku: 'TC002', precio: 607 },
  { sku: 'TC300+F', precio: 1625 },
  { sku: 'TC010+F', precio: 663 },
  { sku: 'TC020+F', precio: 725 },
  { sku: 'TC200+F', precio: 638 },
  { sku: 'TC030+F', precio: 715 },
  { sku: 'TC408+F', precio: 687 },
  { sku: 'TC010', precio: 524 },
  { sku: 'TC408', precio: 521 },
  { sku: 'TC030', precio: 558 },
  { sku: 'TC300', precio: 1375 },
  { sku: 'TC020', precio: 630 },
  { sku: 'TC200', precio: 584 },
  { sku: 'K0200+F', precio: 2800 },
  { sku: 'KL-HD065-Y50', precio: 401 },
  { sku: 'KL-HD065-Y30', precio: 415 },
  { sku: 'KL-HD065-Y33', precio: 481 },
  { sku: 'KL-HD062-Y93', precio: 344 },
  { sku: 'KL-HD060-Y71-N', precio: 315 },
  { sku: 'KL-HD060-Y71-B', precio: 315 },
  { sku: 'ZT021', precio: 1230 },
  { sku: 'K0027+F', precio: 2365 },
  { sku: 'K0305+F', precio: 2550 },
  { sku: 'K0365+F', precio: 713 },
  { sku: 'K0017+F', precio: 687 },
  { sku: 'K0113+F', precio: 687 },
  { sku: 'K0033+F', precio: 687 },
  { sku: 'K2020+F', precio: 710 },
  { sku: 'K0364', precio: 673 },
  { sku: 'K0217', precio: 498 },
  { sku: 'K0365', precio: 561 },
  { sku: 'K0025', precio: 1270 },
  { sku: 'K033S', precio: 601 },
  { sku: 'K0093', precio: 418 },
  { sku: 'K0015', precio: 492 },
  { sku: 'K0053', precio: 567 },
  { sku: 'K0030', precio: 515 },
  { sku: 'K0071', precio: 418 },
  { sku: 'K0113', precio: 444 },
  { sku: 'K2020', precio: 487 },
  { sku: 'K0033', precio: 558 },
  { sku: 'M0050', precio: 825 },
  { sku: 'M0010', precio: 681 },
  { sku: 'KL-HD065-A1+', precio: 424 },
  { sku: 'Z6988+F', precio: 687 },
  { sku: 'Z6988', precio: 504 },
  { sku: 'Z0202', precio: 527 },
  { sku: 'Z0003+F', precio: 638 },
  { sku: 'Z0003', precio: 492 },
  { sku: 'Z0011', precio: 429 },
  { sku: 'Z0949', precio: 587 },
  { sku: 'Z0634', precio: 1545 },
  { sku: 'Z0014+F', precio: 705 },
  { sku: 'Z0014', precio: 587 },
  { sku: 'KL-HD067-13C', precio: 344 },
  { sku: 'KL-HD065-9B', precio: 344 },
  { sku: 'Z3232', precio: 653 },
  { sku: 'Z1202+F', precio: 687 },
  { sku: 'Z3311', precio: 481 },
  { sku: 'Z1202', precio: 492 },
  { sku: 'Z0303', precio: 3000 },
  { sku: 'Z2520', precio: 2550 },
  { sku: 'Z0404', precio: 444 },
  { sku: 'Z0717+F', precio: 715 },
  { sku: 'Z1012', precio: 1495 }
];

async function updatePreciosVentaBloque5() {
  const result = {
    totalProductos: PRECIOS_BLOQUE_5.length,
    actualizados: 0,
    creados: 0,
    noEncontrados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando actualización de precios de venta - Bloque 5...\n');
    console.log(`📦 Productos a procesar: ${result.totalProductos}`);

    for (const item of PRECIOS_BLOQUE_5) {
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
    console.log('\n📊 RESUMEN DE ACTUALIZACIÓN - BLOQUE 5:');
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
updatePreciosVentaBloque5();
