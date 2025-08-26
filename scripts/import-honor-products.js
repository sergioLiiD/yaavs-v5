const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de productos de Honor (formato del archivo .txt)
const HONOR_PRODUCTS = [
  'HB476586ECW        HONOR 10X',
  'HB299418ECW        "MediaPad M5 Pro/HUAWEI MediaPad M5/HUAWEI MediaPad M5 lite/HUAWEI MediaPad M6"',
  'HB2899C0ECW        MediaPad T5',
  'HB28D8C8ECW-12        MatePad Pro/HUAWEI MatePad Pro 5G',
  'HB386280ECW        P10',
  'HB486486EEW        MATE20 PRO/P30 PRO',
  'HB396689ECW        MATE 9',
  'HB486586ECW        P40 LITE 4G /NOVA6 SE',
  'HB356687ECW        P30 LITE/NOVA4E/MATE10 LITE',
  'HB436380ECW        P30',
  'HB436486ECW        P20 PRO/MATE 10/MATE10 PRO/MATE20',
  'HB486686ECW        Y9A',
  'HB446486ECW        Y9S/HONOR 9X/HONOR 9X LITE/Y9 prime 2019',
  'HB426389EEW        HN-HONOR20 LITE',
  'HB426489EEW        Y8P / Y9P',
  'HB406689ECW        Y7Prime / P40 LITE E/Y7 2019 / Y9 2019 / Y8S',
  'HB526488EEW        Y7A/P SMART 2021/HONOR 10X LITE',
  'HB405979ECW        Y6 2019/Y6S/HONOR 8A/Y6 2019/Y5 2018/Y5 2019',
  'HB366481ECW        Y6 2018 / Y7 2018 /P SMART 2018 / P20 LITE/ ANE LX3',
  'HB536896EFW        NOVA Y70',
  'HB526489EEW        NOVA Y60 / Y6P/HONOR9A/HONOR9S PRIME',
  'HB396286ECW        HONOR 10 LITE/P SMART 2019',
  'HB396285ECW        HONOR 10',
  'HB416492EFW        HONOR X8',
  'HB5066A1EGW        HONOR X7A',
  'HB496590EFW-F        HONOR X6 / HONOR X7',
  'HB386589ECW        HONOR 8X / NOVA3 / NOVA 5T/HONOR 20/ MATE20 LITE'
];

async function importHonorProducts() {
  const result = {
    marca: 'Honor',
    totalProductos: HONOR_PRODUCTS.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de productos Honor...\n');
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📦 Productos a importar: ${result.totalProductos}`);

    // Buscar la marca Honor en la base de datos
    const marca = await prisma.marcas.findFirst({
      where: {
        nombre: {
          equals: 'Honor',
          mode: 'insensitive'
        }
      }
    });

    if (!marca) {
      throw new Error('La marca "Honor" no existe en la base de datos. Por favor, créala primero.');
    }

    console.log(`✅ Marca encontrada: ${marca.nombre} (ID: ${marca.id})`);

    // Procesar cada producto
    for (const productoLinea of HONOR_PRODUCTS) {
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

        // Generar nombre del producto
        const nombre = `Batería Honor ${modelosTexto.split('/')[0].trim()}`;

        // Generar descripción con todos los modelos
        const modelos = modelosTexto.split('/').map(m => m.trim());
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
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} productos nuevos de Honor.`);
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
importHonorProducts();
