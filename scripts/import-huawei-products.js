const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de productos de Huawei (formato del archivo .txt)
const HUAWEI_PRODUCTS = [
  '24022756        HUAWEI P20/Honor 10',
  '24022735        HONOR 8X/HONOR 9X Lite',
  '24022915(HB446486ECW)        "HUAWEI-Y9 PRIME 2019/Y9s / P SMART Z /P20 LITE /NOVA 5i /HONOR 9X/HONOR 9X PRO / P SMART PRO"',
  '24023214        HUAWEI P smart S/HUAWEI Y8p/HONOR 30i',
  '24022744        "HUAWEI MatePad SE/HUAWEI MediaPad T5/HUAWEI MatePad C5e/HUAWEI MatePad C3"',
  '24023562        HUAWEI WATCH D/HUAWEI WATCH GT Runner',
  '24022368        HUAWEI P20 lite/HUAWEI nova 3e/',
  '24022872        HUAWEI P30 lite/HONOR 20S/HONOR 20 Lite',
  '24022698(HB356687ECW)        "HUAWEI-P30 lite / HUAWEI nova 2 Plus / HUAWEI P10 Selfie / HUAWEI nova 3i/HUAWEI P smart+/HUAW"',
  '24023342        HUAWEI P smart 2021/HUAWEI Y7a/HONOR 10X Lite',
  '24023020        HUAWEI MatePad Pro/HUAWEI MatePad Pro 5G',
  '24022688        "HUAWEI MediaPad M5 Pro/HUAWEI MediaPad M5/HUAWEI MediaPad M5 lite/HUAWEI MediaPad M6"',
  '24022610        HUAWEI Y5 2018/Honor 7A/HUAWEI Y5p/HONOR 9S',
  '24023514        "HUAWEI WATCH GT 2/HUAWEI WATCH GT 2e/HUAWEI WATCH GT 2 Pro/HUAWEI WATCH GT 3"',
  '24022376        "HUAWEI Y7s/HUAWEI Y7 Prime 2018/HUAWEI nova 2 lite/Honor 7C/Honor 7C Pro/HUAWEI Y7 2018"',
  '24022182        HUAWEI P10',
  '24022215        HUAWEI P9 lite 2017/Honor 6C Pro',
  '02354HFN        HUAWEI P50 Pro',
  '02355AVL        HUAWEI nova Y90',
  '02354MQA        HUAWEI P50/P50E',
  '24022946        HUAWEI P30 Pro/MATE20 PRO',
  '24023690        HUAWEI nova Y70/HUAWEI nova Y70 Plus',
  '24022804        HUAWEI P30',
  '02354NUU        HUAWEI nova 9',
  '24023024(HB406689ECW)        HUAWEI-Y9 2019/Y8s/P40 lite E /Y7P',
  '24022732(HB386589ECW)        HUAWEI-NOVA 5T /Mate20 lite /P10 Plus/NOVA3 /NOVA4/HONOR 20',
  '24023533        HUAWEI nova 8i/HUAWEI P50 lite',
  '24022981(HB406689ECW)        HUAWEI-Y7 2019 /Y9 2018 /Y9 2019 /Y7 Prime/Y8s',
  '24022342        HUAWEI Mate 10 Pro/HUAWEI Mate 10',
  '02353XXA        HUAWEI Mate 40 Pro/HUAWEI Mate 40 Pro+/HUAWEI Mate 40E Pro',
  '24022157        HUAWEI nova 3e/HUAWEI P20 lite',
  '24022102        HUAWEI Mate 9',
  '24022844        "HUAWEI MediaPad M5/HUAWEI MediaPad M5 Pro/HUAWEI MediaPad M5 lite/HUAWEI MediaPad M6/HUAWEI Ma"',
  '02354KEL        HUAWEI nova 8',
  '02353MET        HUAWEI P40 Pro',
  '02354UVQ        HUAWEI nova 9 SE',
  '24022919        "HUAWEI Y9 2019/HUAWEI P smart 2019/HONOR 20 Lite/HONOR 20i/HUAWEI P smart 2020"',
  '24022209        HUAWEI P10 Plus',
  '24023099        HUAWEI nova 6 SE/P40 LITE',
  '24023085        HUAWEI Y6p/HUAWEI nova Y60/',
  '24023184        HONOR 10X/HUAWEI Y9a'
];

async function importHuaweiProducts() {
  const result = {
    marca: 'Huawei',
    totalProductos: HUAWEI_PRODUCTS.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de productos Huawei...\n');
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📦 Productos a importar: ${result.totalProductos}`);

    // Buscar la marca Huawei en la base de datos
    const marca = await prisma.marcas.findFirst({
      where: {
        nombre: {
          equals: 'Huawei',
          mode: 'insensitive'
        }
      }
    });

    if (!marca) {
      throw new Error('La marca "Huawei" no existe en la base de datos. Por favor, créala primero.');
    }

    console.log(`✅ Marca encontrada: ${marca.nombre} (ID: ${marca.id})`);

    // Procesar cada producto
    for (const productoLinea of HUAWEI_PRODUCTS) {
      try {
        // Separar SKU y modelos (asumiendo que están separados por espacios/tabs)
        const partes = productoLinea.trim().split(/\s+/);
        const sku = partes[0];
        const modelosTexto = partes.slice(1).join(' ').replace(/"/g, ''); // Remover comillas

        if (!sku || !modelosTexto) {
          throw new Error(`Formato inválido en línea: ${productoLinea}`);
        }

        // Verificar si el producto ya existe
        const productoExistente = await prisma.productos.findFirst({
          where: {
            sku: {
              equals: sku,
              mode: 'insensitive'
            }
          }
        });

        if (productoExistente) {
          console.log(`⚠️  Producto duplicado: ${sku}`);
          result.duplicados++;
          continue;
        }

        // Generar nombre del producto con todos los modelos
        const modelos = modelosTexto.split('/').map(m => m.trim());
        const nombre = `Batería Huawei ${modelos.join(' / ')}`;

        // Generar descripción con todos los modelos
        const descripcion = `Batería compatible con: ${modelos.join(', ')}`;

        // Crear el producto
        const nuevoProducto = await prisma.productos.create({
          data: {
            sku: sku,
            nombre: nombre,
            descripcion: descripcion,
            marca_id: marca.id,
            modelo_id: null, // Sin modelo específico
            precio_promedio: 0, // Se configurará después
            stock: 0,
            stock_minimo: 1,
            stock_maximo: 10,
            tipo: 'PRODUCTO',
            updated_at: new Date()
          }
        });

        console.log(`✅ Producto creado: ${sku} - ${nombre} (ID: ${nuevoProducto.id})`);
        console.log(`   📝 Descripción: ${descripcion}`);
        result.creados++;

      } catch (error) {
        const errorMsg = `Error al crear producto "${productoLinea}": ${error.message || 'Error desconocido'}`;
        console.error(`❌ ${errorMsg}`);
        result.errores.push(errorMsg);
      }
    }

    // Mostrar resumen
    console.log('\n📊 RESUMEN DE IMPORTACIÓN:');
    console.log('='.repeat(50));
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📦 Total de productos: ${result.totalProductos}`);
    console.log(`✅ Productos creados: ${result.creados}`);
    console.log(`⚠️  Productos duplicados: ${result.duplicados}`);
    console.log(`❌ Errores: ${result.errores.length}`);

    if (result.errores.length > 0) {
      console.log('\n❌ ERRORES DETALLADOS:');
      result.errores.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (result.creados > 0) {
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} productos nuevos de Huawei.`);
      console.log('📋 Próximo paso: Configurar precios de venta en /dashboard/costos/precios-venta');
    } else {
      console.log('\n⚠️  No se crearon nuevos productos (posiblemente todos eran duplicados).');
    }

  } catch (error) {
    console.error('❌ Error fatal:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
importHuaweiProducts();
