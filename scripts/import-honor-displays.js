const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de displays de Honor (formato del archivo .txt)
const HONOR_DISPLAYS = [
  'W0805        X8A 5G/X6        ORIG S/M        NEGRO',
  'W0070        70        ORIG OLED S/M        NEGRO',
  'W1199+F        X9B        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0090+F        90        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0066+F        X6A        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0090        90        ORIG S/M        NEGRO',
  'W0077+F        X7A        ORIG C/M(BOUTIQUE)        NEGRO',
  'W1100+F        10 LITE        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0066        X6A/X50 PRO/X5 PLUS        ORIG S/M        NEGRO',
  'W0909+F        X9        ORIG C/M(BOUTIQUE)        NEGRO',
  'W1177+F        X7B        ORIG C/M(BOUTIQUE)        NEGRO',
  'W1188+F        X8B        ORIG C/M(BOUTIQUE)        NEGRO',
  'W1177        X7B        ORIG S/M        NEGRO',
  'W0606+F        X6        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0505+F        X5        ORIG C/M(BOUTIQUE)        NEGRO',
  'W1188        X8B        ORIG S/M        NEGRO',
  'W1199        X9B/Magic 6        ORIG S/M        NEGRO',
  'W1818+F        X8A        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0088+F        8X/9X LITE        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0505        X5        ORIG S/M        NEGRO',
  'W9090+F/g        X9A        ORIG C/M(BOUTIQUE)        VERDE',
  'W9090+F/S        X9A        ORIG C/M(BOUTIQUE)        PLATEADO',
  'W9090+F        X9A        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0088-COG        8X/9X LITE        COG S/M        NEGRO',
  'W9090        X9A/MAGIC5 LITE        ORIG S/M        NEGRO',
  'W1818        X8A 4G/X50i/90 LITE        ORIG S/M        NEGRO',
  'W0077        X7A        ORIG S/M        NEGRO',
  'W1010        10        ORIG S/M        NEGRO',
  'W1100-COF        10 LITE        ORIG COF S/M        NEGRO',
  'W1100-COG        10 LITE        COG S/M        NEGRO',
  'W0550        50 LITE/NOVA 8i        ORIG S/M        NEGRO',
  'W0909        X9        ORIG S/M        NEGRO',
  'W8000+F        X8        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0707+F        X7        ORIG C/M(BOUTIGUE)        NEGRO',
  'W0606        X6/X8A 5G        ORIG S/M        NEGRO',
  'W8000        X8        ORIG S/M        NEGRO',
  'W0707        X7        ORIG S/M        NEGRO',
  'W0088-COF        8X/9X LITE        COF S/M        NEGRO'
];

async function importHonorDisplays() {
  const result = {
    marca: 'Honor',
    totalProductos: HONOR_DISPLAYS.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de displays Honor...\n');
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
    for (const productoLinea of HONOR_DISPLAYS) {
      try {
        // Separar SKU, modelo, calidad y color (separados por espacios/tabs)
        const partes = productoLinea.trim().split(/\s+/);
        const sku = partes[0];
        const modelo = partes[1];
        const calidad = partes[2];
        const color = partes[3];

        if (!sku || !modelo || !calidad || !color) {
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

        // Generar nombre del producto con modelo, calidad y color
        const nombre = `Display Honor ${modelo} ${calidad} ${color}`;

        // Generar descripción con el modelo
        const descripcion = `Display compatible con: ${modelo}`;

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
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} displays nuevos de Honor.`);
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
importHonorDisplays();
