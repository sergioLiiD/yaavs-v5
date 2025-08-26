const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de productos de Xiaomi (formato del archivo .txt)
const XIAOMI_PRODUCTS = [
  'BP4K        REDMI NOTE12 PRO 5G',
  'BN5M        REDMI NOTE12 4G',
  'BN5J        REDMI NOTE12 5G  / POCO X5',
  'BM5G        REDMI NOTE11T PRO/ POCO X4 GT',
  'BN5D        REDMI NOTE11S / POCO M4PRO 4G/note11/12s',
  'BN5C        REDMI NOTE11 5G / POCO M4 PRO 5G',
  'BN52        REDMI NOTE10PRO MAX',
  'BN5E        REDMI NOTE11PRO/NOTE11PLUS /POCO X4 PRO / REDMI NOTE12PRO 4G',
  'BM57        POCO X3 GT',
  'BN59        REDMI NOTE10 4G/10S/POCO M5S',
  'BN55        REDMI NOTE9S',
  'BM4J        REDMI NOTE8 PRO',
  'BN46        REDMI NOTE8',
  'BN4A        REDMI NOTE7/NOTE7 PRO',
  'BN5K        REDMI 12C',
  'BN5G        REDMI 10C',
  'BN5H        REDMI 10 5G',
  'BN5A        REDMI 10 4G / REDMI NOTE11 4G',
  'BN57        POCO X3 PRO',
  'BN61        POCO X3',
  'BN62        REDMI 9T/NOTE9 4G/POCO M3',
  'BN56        REDMI 9A/9AT/9I/9C/10A/POCO C3/POCO C31',
  'BN54        REDMI 9 / REDMI NOTE9 /REDMI  10X',
  'BN51        REDMI 8/8A',
  'BM5J        MI 12T / MI 12T PRO',
  'BM58        MI11T PRO',
  'BM59        MI 11T',
  'BP42        MI 11 LITE 4G/5G',
  'BM52        MI NOTE10/NOTE10LITE/NOTE10PRO/ CC9PRO',
  'BM4R        MI 10 LITE',
  'BM53        MI 10T/10T PRO/K30S',
  'BP40        MI9T PRO',
  'BP41        MI 9T',
  'BM3L        MI 9',
  'BM4F        MI A3',
  'BN31        MI A1/5X',
  'BP49        POCO F4',
  'BM4Y        POCO F3/ MI11 i/ MI11 X'
];

async function importXiaomiProducts() {
  const result = {
    marca: 'Xiaomi',
    totalProductos: XIAOMI_PRODUCTS.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de productos Xiaomi...\n');
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📦 Productos a importar: ${result.totalProductos}`);

    // Buscar la marca Xiaomi en la base de datos
    const marca = await prisma.marcas.findFirst({
      where: {
        nombre: {
          equals: 'Xiaomi',
          mode: 'insensitive'
        }
      }
    });

    if (!marca) {
      throw new Error('La marca "Xiaomi" no existe en la base de datos. Por favor, créala primero.');
    }

    console.log(`✅ Marca encontrada: ${marca.nombre} (ID: ${marca.id})`);

    // Procesar cada producto
    for (const productoLinea of XIAOMI_PRODUCTS) {
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
        const nombre = `Batería Xiaomi ${modelos.join(' / ')}`;

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
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} productos nuevos de Xiaomi.`);
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
importXiaomiProducts();
