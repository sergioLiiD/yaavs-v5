const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de productos de Samsung (formato del archivo .txt)
const SAMSUNG_PRODUCTS = [
  'EB-BS906ABY        S22 PLUS',
  'EB-BS908ABY        S22 ULTRA',
  'EB-BS901ABY        S22',
  'EB-BG996ABY        S21 PLUS',
  'EB-BG998ABY        S21 ULTRA',
  'EB-BG985ABY        S20 PLUS',
  'EB-BG988ABY        S20 ULTRA',
  'EB-BG965ABE        S9 PLUS',
  'EB-BG960ABE        S9',
  'EB-BG955ABA        S8PLUS',
  'EB-BG950ABE        S8',
  'EB-BN985ABY        NOTE20 ULTRA',
  'EB-BN980ABY        NOTE20',
  'EB-BN972ABU        NOTE10 PLUS',
  'EB-BN770ABY        NOTE10 LITE',
  'EB-BJ730ABE        J730/J7PRO',
  'EB-BJ800ABE        J6',
  'EB-BJ530ABE        J530/J5 PRO',
  'EB-BG570ABE        J5 PRIME',
  'EB-BG610ABE        J4CORE/J4PLUS/J6 PLUS/J610',
  'EB-BJ700BBC        J4/J7/J701/J7NEO',
  'EB-BA730ABE        A730/A8PLUS',
  'EB-BA715ABY        A71/A715',
  'EB-BA705ABU        A70/A70S',
  'EB-BG781ABY        A52/A52S/A525 4G/A525 5G/S20FE',
  'EB-BA515ABY        A51/A515',
  'EB-BA546ABY        A34 5G/A546/A54',
  'EB-BA336ABY        A33/A336/A53/A536',
  'EB-BA245ABY        A24',
  'SCUD-WT-W1        A22 5G',
  'EB-BA315ABY        A22 4G/A31/A315/A325/A32 4G/A325 4G',
  'EB-A505ABU        A20/A30/A50/A50S/A30S/A505',
  'EB-BG580ABU        M30',
  'EB-BA146ABY        A14 5G/A146B',
  'EB-BA217ABY        A13/A13 4G/A13 lite/A21S/A217/A04S/A02/A12/M02/M127/A04S',
  'EB-BM526ABY        A23 4G/M23/M23 5G/M33/M33 5G/a23 lite/A73 5G',
  'HQ-70N        A11 / A115',
  'EB-BA202ABU        A10E',
  'SCUD-WT-N6        A10S/A107/A20S/A207',
  'EB-BA750ABU        SAMA10/M10',
  'WT-S-N28        A05',
  'EB-BA136ABY        A13 5G/A136B',
  'WT-S-W1        A04 / A045  / A04E  / A14 4G / A145P',
  'SLC-50        A03 CORE',
  'HQ-50SD        A03',
  'HQ-50S        A02S/A03S',
  'EB-BA426ABY        A32 5G / A72  / A725',
  'QL1695        A01 M',
  'EB-BG530BBE        G532 / G530/J5'
];

async function importSamsungProducts() {
  const result = {
    marca: 'Samsung',
    totalProductos: SAMSUNG_PRODUCTS.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de productos Samsung...\n');
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📦 Productos a importar: ${result.totalProductos}`);

    // Buscar la marca Samsung en la base de datos
    const marca = await prisma.marcas.findFirst({
      where: {
        nombre: {
          equals: 'Samsung',
          mode: 'insensitive'
        }
      }
    });

    if (!marca) {
      throw new Error('La marca "Samsung" no existe en la base de datos. Por favor, créala primero.');
    }

    console.log(`✅ Marca encontrada: ${marca.nombre} (ID: ${marca.id})`);

    // Procesar cada producto
    for (const productoLinea of SAMSUNG_PRODUCTS) {
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
        const nombre = `Batería Samsung ${modelos.join(' / ')}`;

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
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} productos nuevos de Samsung.`);
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
importSamsungProducts();
