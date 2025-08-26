const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de productos de Oppo (formato del archivo .txt)
const OPPO_PRODUCTS = [
  'BLP819        RENO5',
  'BLP779        A93 4G',
  'BLP915        A17/A17K/A57/A57S/A57E / A58 4G A78 5G/K10 5G/N20SE',
  'BLP727        A5 2020/A11/A11X/A9-2020/realme5/realme5i/realme5s/realmeC3',
  'BLP851        RENO6 LITE',
  'BLP907        RENO7 4G',
  'BLP729        C21/C11',
  'BLP781        A52/A72/A92',
  'BLP805        "A16K / A16E / A16 / A16S / A54S / A56/A53 2020 / A32 /A33/A53S/A11S  / A54 4G / A55 4G / A9"',
  'BLP673        A12/A15',
  'BLP835        RENO5 LITE',
  'BLP817        A15/A15S/ A35/A54'
];

async function importOppoProducts() {
  const result = {
    marca: 'Oppo',
    totalProductos: OPPO_PRODUCTS.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de productos Oppo...\n');
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📦 Productos a importar: ${result.totalProductos}`);

    // Buscar la marca Oppo en la base de datos
    const marca = await prisma.marcas.findFirst({
      where: {
        nombre: {
          equals: 'Oppo',
          mode: 'insensitive'
        }
      }
    });

    if (!marca) {
      throw new Error('La marca "Oppo" no existe en la base de datos. Por favor, créala primero.');
    }

    console.log(`✅ Marca encontrada: ${marca.nombre} (ID: ${marca.id})`);

    // Procesar cada producto
    for (const productoLinea of OPPO_PRODUCTS) {
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
        const nombre = `Batería Oppo ${modelos.join(' / ')}`;

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
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} productos nuevos de Oppo.`);
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
importOppoProducts();
