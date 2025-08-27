const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de baterías Apple desde el archivo (formato: SKU + nombre)
const BATERIAS_APPLE = [
  'BT-IP-12MINI        12MINI',
  'BT-IP-13        13',
  'BT-IP-13MINI        13MINI',
  'BT-IP-12 MINI        12 MINI',
  'BT-IP-12PRO MAX        12PRO MAX',
  'BT-IP-12/12PRO        12/12PRO',
  'BT-IP-11PRO MAX        11PRO MAX',
  'BT-IP-11PRO        11PRO',
  'BT-IP-11        11',
  'BT-IP-XS MAX        XS MAX',
  'BT-IP-XR        XR',
  'BT-IP-XS        XS',
  'BT-IP-X        X',
  'BT-IP-8PLUS        8PLUS',
  'BT-IP-SE 2020        SE 2020',
  'BT-IP-8G        8G',
  'BT-IP-7PLUS        7PLUS',
  'BT-IP-7G        7G',
  'BT-IP-6S PLUS        6S PLUS',
  'BT-IP-6G        6G'
];

async function importBateriasApple() {
  const result = {
    marca: 'APPLE',
    categoria: 'BATERIAS',
    totalProductos: BATERIAS_APPLE.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de baterías Apple...\n');
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📂 Categoría: ${result.categoria}`);
    console.log(`📦 Productos a importar: ${result.totalProductos}`);

    // Buscar la marca APPLE en la base de datos
    const marca = await prisma.marcas.findFirst({
      where: {
        nombre: {
          equals: 'APPLE',
          mode: 'insensitive'
        }
      }
    });

    if (!marca) {
      throw new Error('La marca "APPLE" no existe en la base de datos. Por favor, créala primero.');
    }

    console.log(`✅ Marca encontrada: ${marca.nombre} (ID: ${marca.id})`);

    // Procesar cada producto
    for (const productoLinea of BATERIAS_APPLE) {
      try {
        // Separar SKU y nombre (separados por espacios/tabs)
        const partes = productoLinea.trim().split(/\s+/);
        const sku = partes[0];
        const nombreModelo = partes.slice(1).join(' '); // El resto es el nombre del modelo

        if (!sku || !nombreModelo) {
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
        const nombre = `Batería Apple iPhone ${nombreModelo}`;

        // Generar descripción
        const descripcion = `Batería original Apple para iPhone ${nombreModelo}`;

        // Crear el producto
        const nuevoProducto = await prisma.productos.create({
          data: {
            sku: sku,
            nombre: nombre,
            descripcion: descripcion,
            categoria: result.categoria,
            marca: result.marca,
            precio_promedio: 0, // Se configurará después
            stock: 0,
            stock_minimo: 1,
            stock_maximo: 10,
            tipo: 'PRODUCTO',
            created_at: new Date(),
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
    console.log(`📂 Categoría: ${result.categoria}`);
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
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} baterías nuevas de Apple.`);
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
importBateriasApple();
