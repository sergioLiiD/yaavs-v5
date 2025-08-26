const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de productos de Motorola (formato del archivo .txt)
const MOTOROLA_PRODUCTS = [
  'PC50        G54',
  'QF50        G04/G34',
  'NP44        EDGE 40/EDGE 2023',
  'NA50        EDGE30 PRO',
  'MT45        EDGE20 PRO',
  'MB40        EDGE 20',
  'NT50        EDGE 20 LITE',
  'NF50        EDGE',
  'JS40        Z3 PLAY',
  'HZ40        Z2 PLAY',
  'GL40        Z PLAY',
  'HX40        X4',
  'KP50        ONE ZOOM/XT2010',
  'KG50        ONE HYPER/XT2027',
  'LG50        ONE FUSION/ONE FUSION PLUS',
  'MB50        G200 5G',
  'LZ50        G100/EDGE S/ONE',
  'LK50        G60S',
  'ND40        EDGE30',
  'NE50        G52/G82/G72',
  'MS50        G50 5G',
  'NG50        G71/G71S/G62',
  'NC50        G32/G41',
  'ND50        G31/G42',
  'MG50        G9 PLUS',
  'KZ50        G8 POWER',
  'KD40        G8 PLUS',
  'KR40        G8/ONE VISION/ONE ATION',
  'JG40        G7 PLUS',
  'JE40        G7 PLAY / G7',
  'JT40        G6 PLUS',
  'BL270        G6 PLAY/E5',
  'HG30        G6',
  'MD50        G STYLUS 2022',
  'NT40        E20/XT2155',
  'NH50        G53/XT2335-3/G22/XT2231-2/E13/E22i/E22S/E32/E32S',
  'KG40        G8 PLAY/ONE MACRO',
  'JK50        "E7/E7i/E7 POWER/E7i POWER/E7PLUS/G9PLAY/E40/ G7 POWER/G8 POWER LITE/G9 PLAY/G10/G20/G30/G50"',
  'MC50        G9 / G9POWER / G40FUSION / G60',
  'KS40        E6 PLAY / E6I',
  'KC40        E6S / E6 PLUS',
  'HE50        E5 PLUS',
  'JE30        E5 PLAY GO'
];

async function importMotorolaProducts() {
  const result = {
    marca: 'Motorola',
    totalProductos: MOTOROLA_PRODUCTS.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de productos Motorola...\n');
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📦 Productos a importar: ${result.totalProductos}`);

    // Buscar la marca Motorola en la base de datos
    const marca = await prisma.marcas.findFirst({
      where: {
        nombre: {
          equals: 'Motorola',
          mode: 'insensitive'
        }
      }
    });

    if (!marca) {
      throw new Error('La marca "Motorola" no existe en la base de datos. Por favor, créala primero.');
    }

    console.log(`✅ Marca encontrada: ${marca.nombre} (ID: ${marca.id})`);

    // Procesar cada producto
    for (const productoLinea of MOTOROLA_PRODUCTS) {
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
        const nombre = `Batería Motorola ${modelos.join(' / ')}`;

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
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} productos nuevos de Motorola.`);
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
importMotorolaProducts();
