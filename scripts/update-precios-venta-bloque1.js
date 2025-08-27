const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de precios - Primer bloque desde el archivo .txt
const PRECIOS_BLOQUE_1 = [
  { sku: 'LPN385300', precio: 347.00 },
  { sku: 'LPN440450', precio: 487.00 },
  { sku: 'LPN385400A', precio: 487.00 },
  { sku: 'HB476586ECW', precio: 431.00 },
  { sku: 'HB299418ECW', precio: 582.00 },
  { sku: 'HB2899C0ECW', precio: 508.00 },
  { sku: 'HB28D8C8ECW-12', precio: 649.00 },
  { sku: 'HB386280ECW', precio: 371.00 },
  { sku: 'HB486486EEW', precio: 453.00 },
  { sku: 'HB396689ECW', precio: 347.00 },
  { sku: 'HB486586ECW', precio: 431.00 },
  { sku: 'HB356687ECW', precio: 403.00 },
  { sku: 'HB436380ECW', precio: 385.00 },
  { sku: 'HB436486ECW', precio: 420.00 },
  { sku: 'HB486686ECW', precio: 490.00 },
  { sku: 'HB446486ECW', precio: 403.00 },
  { sku: 'HB426389EEW', precio: 431.00 },
  { sku: 'HB426489EEW', precio: 431.00 },
  { sku: 'HB406689ECW', precio: 403.00 },
  { sku: 'HB526488EEW', precio: 385.00 },
  { sku: 'HB405979ECW', precio: 392.00 },
  { sku: 'HB366481ECW', precio: 368.00 },
  { sku: 'HB536896EFW', precio: 431.00 },
  { sku: 'HB526489EEW', precio: 431.00 },
  { sku: 'HB396286ECW', precio: 385.00 },
  { sku: 'HB396285ECW', precio: 347.00 },
  { sku: 'HB416492EFW', precio: 490.00 },
  { sku: 'HB5066A1EGW', precio: 473.00 },
  { sku: 'HB496590EFW-F', precio: 462.00 },
  { sku: 'HB386589ECW', precio: 403.00 },
  { sku: '24022756', precio: 570.00 },
  { sku: '24022735', precio: 555.00 },
  { sku: '24022915(HB446486ECW)', precio: 403.00 },
  { sku: '24023214', precio: 486.00 },
  { sku: '24022744', precio: 465.00 },
  { sku: '24023562', precio: 495.00 },
  { sku: '24022368', precio: 525.00 },
  { sku: '24022872', precio: 508.00 },
  { sku: '24022698(HB356687ECW)', precio: 462.00 },
  { sku: '24023342', precio: 455.00 },
  { sku: '24023020', precio: 490.00 },
  { sku: '24022688', precio: 438.00 },
  { sku: '24022610', precio: 298.00 },
  { sku: '24023514', precio: 298.00 },
  { sku: '24022376', precio: 263.00 },
  { sku: '24022182', precio: 182.00 },
  { sku: '24022215', precio: 175.00 },
  { sku: '02354HFN', precio: 725.00 },
  { sku: '02355AVL', precio: 725.00 },
  { sku: '02354MQA', precio: 600.00 },
  { sku: '24022946', precio: 385.00 },
  { sku: '24023690', precio: 357.00 },
  { sku: '24022804', precio: 495.00 },
  { sku: '02354NUU', precio: 473.00 },
  { sku: '24023024(HB406689ECW)', precio: 480.00 },
  { sku: '24022732(HB386589ECW)', precio: 420.00 },
  { sku: '24023533', precio: 525.00 },
  { sku: '24022981(HB406689ECW)', precio: 534.00 },
  { sku: '24022342', precio: 490.00 },
  { sku: '02353XXA', precio: 350.00 },
  { sku: '24022157', precio: 245.00 },
  { sku: '24022102', precio: 252.00 },
  { sku: '24022844', precio: 455.00 },
  { sku: '02354KEL', precio: 420.00 },
  { sku: '02353MET', precio: 333.00 },
  { sku: '02354UVQ', precio: 420.00 },
  { sku: '24022919', precio: 420.00 },
  { sku: '24022209', precio: 315.00 },
  { sku: '24023099', precio: 263.00 },
  { sku: '24023085', precio: 210.00 },
  { sku: '24023184', precio: 210.00 },
  { sku: 'PC50', precio: 420.00 },
  { sku: 'QF50', precio: 438.00 },
  { sku: 'NP44', precio: 662.00 },
  { sku: 'NA50', precio: 413.00 },
  { sku: 'MT45', precio: 413.00 },
  { sku: 'MB40', precio: 431.00 },
  { sku: 'NT50', precio: 385.00 },
  { sku: 'NF50', precio: 385.00 },
  { sku: 'JS40', precio: 371.00 },
  { sku: 'HZ40', precio: 371.00 },
  { sku: 'GL40', precio: 403.00 },
  { sku: 'HX40', precio: 347.00 },
  { sku: 'KP50', precio: 413.00 },
  { sku: 'KG50', precio: 347.00 },
  { sku: 'LG50', precio: 385.00 },
  { sku: 'MB50', precio: 413.00 },
  { sku: 'LZ50', precio: 385.00 },
  { sku: 'LK50', precio: 392.00 },
  { sku: 'ND40', precio: 371.00 },
  { sku: 'NE50', precio: 413.00 },
  { sku: 'MS50', precio: 385.00 },
  { sku: 'NG50', precio: 385.00 },
  { sku: 'NC50', precio: 406.00 },
  { sku: 'ND50', precio: 403.00 },
  { sku: 'MG50', precio: 347.00 },
  { sku: 'KZ50', precio: 403.00 },
  { sku: 'KD40', precio: 403.00 },
  { sku: 'KR40', precio: 385.00 },
  { sku: 'JG40', precio: 368.00 },
  { sku: 'JE40', precio: 347.00 },
  { sku: 'JT40', precio: 371.00 },
  { sku: 'BL270', precio: 403.00 },
  { sku: 'HG30', precio: 357.00 },
  { sku: 'MD50', precio: 347.00 },
  { sku: 'NT40', precio: 431.00 },
  { sku: 'NH50', precio: 413.00 },
  { sku: 'KG40', precio: 403.00 },
  { sku: 'JK50', precio: 403.00 },
  { sku: 'MC50', precio: 385.00 },
  { sku: 'KS40', precio: 403.00 },
  { sku: 'KC40', precio: 326.00 },
  { sku: 'HE50', precio: 403.00 },
  { sku: 'JE30', precio: 326.00 },
  { sku: 'BLP819', precio: 504.00 },
  { sku: 'BLP779', precio: 385.00 },
  { sku: 'BLP915', precio: 518.00 },
  { sku: 'BLP727', precio: 385.00 },
  { sku: 'BLP851', precio: 431.00 },
  { sku: 'BLP907', precio: 462.00 },
  { sku: 'BLP729', precio: 385.00 },
  { sku: 'BLP781', precio: 410.00 },
  { sku: 'BLP805', precio: 410.00 },
  { sku: 'BLP673', precio: 385.00 },
  { sku: 'BLP835', precio: 431.00 },
  { sku: 'BLP817', precio: 385.00 },
  { sku: 'EB-BS906ABY', precio: 431.00 },
  { sku: 'EB-BS908ABY', precio: 431.00 },
  { sku: 'EB-BS901ABY', precio: 403.00 },
  { sku: 'EB-BG996ABY', precio: 462.00 },
  { sku: 'EB-BG998ABY', precio: 385.00 },
  { sku: 'EB-BG985ABY', precio: 406.00 },
  { sku: 'EB-BG988ABY', precio: 406.00 },
  { sku: 'EB-BG965ABE', precio: 385.00 },
  { sku: 'EB-BG960ABE', precio: 403.00 },
  { sku: 'EB-BG955ABA', precio: 403.00 },
  { sku: 'EB-BG950ABE', precio: 403.00 },
  { sku: 'EB-BN985ABY', precio: 431.00 },
  { sku: 'EB-BN980ABY', precio: 403.00 },
  { sku: 'EB-BN972ABU', precio: 434.00 },
  { sku: 'EB-BN770ABY', precio: 371.00 },
  { sku: 'EB-BJ730ABE', precio: 312.00 },
  { sku: 'EB-BJ800ABE', precio: 312.00 },
  { sku: 'EB-BJ530ABE', precio: 312.00 },
  { sku: 'EB-BG570ABE', precio: 312.00 },
  { sku: 'EB-BG610ABE', precio: 228.00 },
  { sku: 'EB-BJ700BBC', precio: 263.00 },
  { sku: 'EB-BA730ABE', precio: 326.00 },
  { sku: 'EB-BA715ABY', precio: 403.00 },
  { sku: 'EB-BA705ABU', precio: 371.00 },
  { sku: 'EB-BG781ABY', precio: 403.00 },
  { sku: 'EB-BA515ABY', precio: 403.00 },
  { sku: 'EB-BA546ABY', precio: 347.00 },
  { sku: 'EB-BA336ABY', precio: 347.00 },
  { sku: 'EB-BA245ABY', precio: 403.00 },
  { sku: 'SCUD-WT-W1', precio: 371.00 },
  { sku: 'EB-BA315ABY', precio: 347.00 },
  { sku: 'EB-A505ABU', precio: 347.00 },
  { sku: 'EB-BG580ABU', precio: 347.00 },
  { sku: 'EB-BA146ABY', precio: 403.00 },
  { sku: 'EB-BA217ABY', precio: 347.00 },
  { sku: 'EB-BM526ABY', precio: 347.00 },
  { sku: 'HQ-70N', precio: 403.00 },
  { sku: 'EB-BA202ABU', precio: 347.00 },
  { sku: 'SCUD-WT-N6', precio: 403.00 },
  { sku: 'EB-BA750ABU', precio: 371.00 },
  { sku: 'SCUD-WT-N28', precio: 403.00 },
  { sku: 'EB-BA136ABY', precio: 347.00 },
  { sku: 'WT-S-W1', precio: 385.00 },
  { sku: 'SLC-50', precio: 371.00 },
  { sku: 'HQ-50SD', precio: 403.00 },
  { sku: 'HQ-50S', precio: 385.00 },
  { sku: 'EB-BA426ABY', precio: 347.00 },
  { sku: 'QL1695', precio: 347.00 },
  { sku: 'EB-BG530BBE', precio: 238.00 },
  { sku: 'BP4K', precio: 564.00 },
  { sku: 'BN5M', precio: 501.00 },
  { sku: 'BN5J', precio: 525.00 },
  { sku: 'BM5G', precio: 564.00 },
  { sku: 'BN5D', precio: 453.00 },
  { sku: 'BN5C', precio: 480.00 },
  { sku: 'BN52', precio: 410.00 },
  { sku: 'BN5E', precio: 504.00 },
  { sku: 'BM57', precio: 504.00 },
  { sku: 'BN59', precio: 511.00 },
  { sku: 'BN55', precio: 385.00 },
  { sku: 'BM4J', precio: 403.00 },
  { sku: 'BN46', precio: 403.00 },
  { sku: 'BN4A', precio: 385.00 },
  { sku: 'BN5K', precio: 438.00 },
  { sku: 'BN5G', precio: 473.00 },
  { sku: 'BN5H', precio: 431.00 },
  { sku: 'BN5A', precio: 413.00 },
  { sku: 'BN57', precio: 480.00 },
  { sku: 'BN61', precio: 508.00 },
  { sku: 'BN62', precio: 473.00 },
  { sku: 'BN56', precio: 385.00 },
  { sku: 'BN54', precio: 403.00 },
  { sku: 'BN51', precio: 385.00 },
  { sku: 'BM5J', precio: 671.00 },
  { sku: 'BM58', precio: 801.00 },
  { sku: 'BM59', precio: 634.00 },
  { sku: 'BP42', precio: 473.00 },
  { sku: 'BM52', precio: 543.00 },
  { sku: 'BM4R', precio: 490.00 },
  { sku: 'BM53', precio: 480.00 },
  { sku: 'BP40', precio: 403.00 },
  { sku: 'BP41', precio: 403.00 },
  { sku: 'BM3L', precio: 347.00 },
  { sku: 'BM4F', precio: 347.00 },
  { sku: 'BN31', precio: 392.00 },
  { sku: 'BP49', precio: 525.00 },
  { sku: 'BM4Y', precio: 567.00 },
  { sku: 'LI3951T44P8H956656', precio: 455.00 },
  { sku: 'LI3939T44P8H756547', precio: 371.00 },
  { sku: 'E6539ZTE-B', precio: 347.00 },
  { sku: 'Li3949T44P8h906450', precio: 459.00 },
  { sku: 'LI3839T44P8H866445', precio: 431.00 },
  { sku: 'LI3839T43P8H826348', precio: 413.00 },
  { sku: 'LI3931T44P8H806139', precio: 371.00 },
  { sku: 'LI3826T43P4H695950', precio: 277.00 }
];

async function updatePreciosVentaBloque1() {
  const result = {
    totalProductos: PRECIOS_BLOQUE_1.length,
    actualizados: 0,
    creados: 0,
    noEncontrados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando actualización de precios de venta - Bloque 1...\n');
    console.log(`📦 Productos a procesar: ${result.totalProductos}`);

    for (const item of PRECIOS_BLOQUE_1) {
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
    console.log('\n📊 RESUMEN DE ACTUALIZACIÓN - BLOQUE 1:');
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
updatePreciosVentaBloque1();
