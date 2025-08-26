const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de productos de ZTE (formato del archivo .txt)
const ZTE_PRODUCTS = [
  'LI3951T44P8H956656        V40 SMART',
  'LI3939T44P8H756547        V2020 5G',
  'E6539ZTE-B        A53',
  'Li3949T44P8h906450        A52/A72 / V20 SMART 2050 / V20 SMART 8010',
  'LI3839T44P8H866445        A71',
  'LI3839T43P8H826348        A7 2020',
  'LI3931T44P8H806139        A5 2020 / A51 / V9 / V9 LITE / V10 / V10 VITA',
  'LI3826T43P4H695950        A3 2020 / L210'
];

async function importZteProducts() {
  const result = {
    marca: 'ZTE',
    totalProductos: ZTE_PRODUCTS.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de productos ZTE...\n');
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📦 Productos a importar: ${result.totalProductos}`);

    // Buscar la marca ZTE en la base de datos
    const marca = await prisma.marcas.findFirst({
      where: {
        nombre: {
          equals: 'ZTE',
          mode: 'insensitive'
        }
      }
    });

    if (!marca) {
      throw new Error('La marca "ZTE" no existe en la base de datos. Por favor, créala primero.');
    }

    console.log(`✅ Marca encontrada: ${marca.nombre} (ID: ${marca.id})`);

    // Procesar cada producto
    for (const productoLinea of ZTE_PRODUCTS) {
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
        const nombre = `Batería ZTE ${modelos.join(' / ')}`;

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
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} productos nuevos de ZTE.`);
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
importZteProducts();
