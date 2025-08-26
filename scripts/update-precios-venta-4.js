const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de precios - Cuarto bloque
const PRECIOS_BLOQUE_4 = [
  { sku: 'F0055', precio: 444 },
  { sku: 'F0296', precio: 487 },
  { sku: 'F0702', precio: 435 },
  { sku: 'F0037', precio: 427 },
  { sku: 'F0456', precio: 487 },
  { sku: 'F0500', precio: 3125 },
  { sku: 'F5555', precio: 2700 },
  { sku: 'F0400+F/g', precio: 3250 },
  { sku: 'F0400+F/L', precio: 3250 },
  { sku: 'F0400+F', precio: 3200 },
  { sku: 'F0105/F0400', precio: 2625 },
  { sku: 'F1133', precio: 3000 },
  { sku: 'F0776', precio: 3625 },
  { sku: 'F2002', precio: 1775 },
  { sku: 'F2002+F', precio: 1995 },
  { sku: 'F6767', precio: 1950 },
  { sku: 'F0279', precio: 2250 },
  { sku: 'F0814', precio: 2120 },
  { sku: 'F5223+F', precio: 865 },
  { sku: 'F5023', precio: 900 },
  { sku: 'F5223', precio: 644 },
  { sku: 'KL-HD065-G9+F', precio: 530 },
  { sku: 'KL-HD065-G10+F', precio: 535 },
  { sku: 'KL-HD065-G8M+F', precio: 472 },
  { sku: 'KL-HD065-G31', precio: 424 },
  { sku: 'F2215+F', precio: 1450 },
  { sku: 'F0040+F', precio: 680 },
  { sku: 'F2224+F', precio: 687 },
  { sku: 'F2225+F', precio: 1425 },
  { sku: 'F5222+F', precio: 673 },
  { sku: 'F0009+F', precio: 850 },
  { sku: 'F0040', precio: 653 },
  { sku: 'F0388', precio: 510 },
  { sku: 'F2225', precio: 763 },
  { sku: 'F2215', precio: 805 },
  { sku: 'F0009', precio: 653 },
  { sku: 'F2224', precio: 504 },
  { sku: 'F5222', precio: 495 },
  { sku: 'F0034', precio: 544 },
  { sku: 'F0444+F', precio: 650 },
  { sku: 'F0024+F', precio: 638 },
  { sku: 'F0024', precio: 535 },
  { sku: 'F0733', precio: 572 },
  { sku: 'F0042+F', precio: 695 },
  { sku: 'F0733+F', precio: 663 },
  { sku: 'F0177+F', precio: 648 },
  { sku: 'F1411+F', precio: 648 },
  { sku: 'F0808', precio: 561 },
  { sku: 'F4455+F/H', precio: 650 },
  { sku: 'F4455+F', precio: 650 },
  { sku: 'F5544+F', precio: 813 },
  { sku: 'F8844', precio: 2425 },
  { sku: 'F7373+F', precio: 875 },
  { sku: 'F1144', precio: 701 },
  { sku: 'F1144+F', precio: 788 },
  { sku: 'F044', precio: 601 },
  { sku: 'F0522+F', precio: 738 },
  { sku: 'F0929', precio: 650 },
  { sku: 'F0808+F', precio: 700 },
  { sku: 'F0506+F', precio: 688 },
  { sku: 'F0233+F', precio: 673 },
  { sku: 'F0059-N', precio: 478 },
  { sku: 'F5040+F', precio: 650 },
  { sku: 'F5040', precio: 510 },
  { sku: 'F0230+F', precio: 900 },
  { sku: 'F0456+F', precio: 681 },
  { sku: 'F0819+F', precio: 630 },
  { sku: 'F4455', precio: 458 },
  { sku: 'F0002+F', precio: 780 },
  { sku: 'F4027+F', precio: 655 },
  { sku: 'F1010+F', precio: 675 },
  { sku: 'F0949+F', precio: 858 },
  { sku: 'F6767+F', precio: 2200 },
  { sku: 'F4027', precio: 538 },
  { sku: 'F3785+F', precio: 701 },
  { sku: 'F2397+F', precio: 1500 },
  { sku: 'F0470+F', precio: 1545 },
  { sku: 'F0310+F', precio: 1545 },
  { sku: 'F0279+F', precio: 2200 },
  { sku: 'F3874+F', precio: 1563 },
  { sku: 'F0840+F', precio: 975 },
  { sku: 'F1022+F', precio: 758 },
  { sku: 'F3874', precio: 1355 },
  { sku: 'F6062', precio: 653 },
  { sku: 'F0532', precio: 675 },
  { sku: 'F0310', precio: 1338 },
  { sku: 'F0230', precio: 607 },
  { sku: 'F0013', precio: 530 },
  { sku: 'F0025', precio: 544 },
  { sku: 'F0200', precio: 813 },
  { sku: 'F0725', precio: 988 },
  { sku: 'F1022', precio: 658 },
  { sku: 'F3785', precio: 492 },
  { sku: 'F0949', precio: 715 },
  { sku: 'F0819', precio: 581 },
  { sku: 'F1010', precio: 492 },
  { sku: 'F0840', precio: 630 },
  { sku: 'F7777', precio: 550 },
  { sku: 'F0233', precio: 478 },
  { sku: 'F0014', precio: 590 },
  { sku: 'F0059-O', precio: 478 },
  { sku: 'F0506', precio: 429 },
  { sku: 'F0066', precio: 492 },
  { sku: 'F0001-N', precio: 567 },
  { sku: 'F0410+F', precio: 720 },
  { sku: 'F0666', precio: 1218 },
  { sku: 'F0862', precio: 492 },
  { sku: 'F0909', precio: 595 },
  { sku: 'F0720', precio: 1750 },
  { sku: 'F0001-B', precio: 567 },
  { sku: 'F0410', precio: 492 },
  { sku: 'F0404', precio: 687 },
  { sku: 'F0750-B', precio: 938 },
  { sku: 'F0333', precio: 1300 },
  { sku: 'F0750-N', precio: 938 },
  { sku: 'F0097', precio: 850 },
  { sku: 'N0100', precio: 521 },
  { sku: 'E0100', precio: 740 },
  { sku: 'E0100+F', precio: 845 },
  { sku: 'TC100', precio: 730 },
  { sku: 'KL-HD065-A16', precio: 424 },
  { sku: 'KL-HD064-R7', precio: 595 },
  { sku: 'KL-HD062-A12', precio: 372 },
  { sku: 'KL-HD065-A57', precio: 415 },
  { sku: 'KL-HD065-A92', precio: 467 },
  { sku: 'KL-HD065-C21', precio: 372 },
  { sku: 'KL-HD067-C53', precio: 429 },
  { sku: 'KL-HD065-P32', precio: 429 },
  { sku: 'KL-HD065-A11', precio: 352 },
  { sku: 'P0934', precio: 655 },
  { sku: 'P0015+F', precio: 687 },
  { sku: 'C0011+F', precio: 664 },
  { sku: 'P0157+F', precio: 704 },
  { sku: 'C3003+F', precio: 687 },
  { sku: 'P0092+F', precio: 638 },
  { sku: 'P0935+F', precio: 700 },
  { sku: 'C0303+F', precio: 658 },
  { sku: 'P0053+F', precio: 665 },
  { sku: 'P0016+F', precio: 630 },
  { sku: 'P0054+F', precio: 720 },
  { sku: 'P0584+F', precio: 870 },
  { sku: 'C0035+F', precio: 687 },
  { sku: 'C0021+F', precio: 658 },
  { sku: 'C0750', precio: 630 },
  { sku: 'C0008', precio: 630 },
  { sku: 'C0053', precio: 478 },
  { sku: 'C3003', precio: 487 },
  { sku: 'P1212', precio: 464 },
  { sku: 'C3300/C0303', precio: 492 },
  { sku: 'C0021', precio: 492 },
  { sku: 'C0035', precio: 444 },
  { sku: 'C0011', precio: 492 },
  { sku: 'C0055/P0584', precio: 648 },
  { sku: 'C0003', precio: 492 },
  { sku: 'P0935', precio: 687 },
  { sku: 'P0092', precio: 515 },
  { sku: 'C0077', precio: 615 },
  { sku: 'P0157', precio: 521 },
  { sku: 'P0054', precio: 515 },
  { sku: 'P0053', precio: 492 },
  { sku: 'P0016', precio: 492 },
  { sku: 'P0015', precio: 492 },
  { sku: 'P0076', precio: 710 },
  { sku: 'P0055', precio: 615 },
  { sku: 'P0074+F', precio: 2575 },
  { sku: 'P0066+F', precio: 2075 },
  { sku: 'P0095+F', precio: 2418 },
  { sku: 'P0074', precio: 2200 },
  { sku: 'P0066', precio: 2000 },
  { sku: 'P0095', precio: 1975 },
  { sku: 'P0075', precio: 1950 },
  { sku: 'P0115', precio: 2625 },
  { sku: 'P0010', precio: 2600 },
  { sku: 'C0088', precio: 1175 },
  { sku: 'T1166+F', precio: 723 },
  { sku: 'T1166', precio: 587 },
  { sku: 'T0555+F', precio: 2393 },
  { sku: 'T0035+F', precio: 2300 },
  { sku: 'T0055', precio: 1170 },
  { sku: 'KL-HD064-A15', precio: 601 },
  { sku: 'KL-HD064-A24', precio: 567 },
  { sku: 'T3377+F', precio: 638 },
  { sku: 'T4444+F', precio: 630 },
  { sku: 'T1012+F', precio: 678 },
  { sku: 'T0424', precio: 687 },
  { sku: 'KL-HD064-A11+F', precio: 501 },
  { sku: 'KL-HD062-A30S+F', precio: 510 },
  { sku: 'KL-HD062-A10+F', precio: 444 },
  { sku: 'KL-HD065-A03+F', precio: 521 },
  { sku: 'KL-HD065-A02S+F', precio: 538 },
  { sku: 'KL-HD064-A11', precio: 415 },
  { sku: 'KL-HD062-A30', precio: 429 },
  { sku: 'T0424+F', precio: 638 },
  { sku: 'KL-HD065-M12+F', precio: 458 },
  { sku: 'KL-HD066-A21', precio: 444 },
  { sku: 'KL-HD066-A72', precio: 458 },
  { sku: 'KL-HD066-A71', precio: 484 },
  { sku: 'KL-HD062-A30S', precio: 367 },
  { sku: 'KL-HD062-A10', precio: 338 },
  { sku: 'T2255+F', precio: 1700 }
];

async function updatePreciosBloque4() {
  const result = {
    totalProductos: PRECIOS_BLOQUE_4.length,
    actualizados: 0,
    noEncontrados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando actualización de precios - Bloque 4...\n');
    console.log(`📦 Productos a actualizar: ${result.totalProductos}`);

    for (const item of PRECIOS_BLOQUE_4) {
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
    console.log('\n📊 RESUMEN DE ACTUALIZACIÓN - BLOQUE 4:');
    console.log('='.repeat(50));
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
      console.log(`\n🎉 ¡Actualización completada! Se actualizaron ${result.actualizados} precios.`);
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
updatePreciosBloque4();
