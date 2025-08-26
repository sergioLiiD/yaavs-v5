const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de displays de Hisense (formato del archivo .txt)
const HISENSE_DISPLAYS = [
  'A0550        E50S        ORIG S/M        NEGRO',
  'A0005        E50i        ORIG S/M        NEGRO',
  'A0230        F23        ORIG S/M        NEGRO',
  'A0220        F20        ORIG S/M        NEGRO',
  'A0444        H40        ORIG S/M        NEGRO',
  'A0060        E60 LITE        ORIG S/M        NEGRO',
  'A0411        V40S        ORIG S/M        NEGRO',
  'A0555        H50        ORIG S/M        NEGRO',
  'A0611        V60/E60        ORIG S/M        NEGRO',
  'A0511        V50        ORIG S/M        NEGRO',
  'A0610        E60        ORIG S/M        NEGRO',
  'A0310        E30        ORIGS/M        NEGRO',
  'A0066        H60 LITE        ORIG S/M        NEGRO',
  'H0505        U50 4G        ORIG S/M        NEGRO',
  'A0055        E50 LITE        ORIG S/M        NEGRO',
  'A0050        H50 LITE/E50        ORIG S/M        NEGRO',
  'A0040        H40 LITE/E40/V40        ORIG S/M        NEGRO',
  'A0030        H30 LITE        ORIG S/M        NEGRO'
];

async function importHisenseDisplays() {
  const result = {
    marca: 'Hisense',
    totalProductos: HISENSE_DISPLAYS.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de displays Hisense...\n');
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📦 Productos a importar: ${result.totalProductos}`);

    // Buscar la marca Hisense en la base de datos
    const marca = await prisma.marcas.findFirst({
      where: {
        nombre: {
          equals: 'Hisense',
          mode: 'insensitive'
        }
      }
    });

    if (!marca) {
      throw new Error('La marca "Hisense" no existe en la base de datos. Por favor, créala primero.');
    }

    console.log(`✅ Marca encontrada: ${marca.nombre} (ID: ${marca.id})`);

    // Procesar cada producto
    for (const productoLinea of HISENSE_DISPLAYS) {
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
        const nombre = `Display Hisense ${modelo} ${calidad} ${color}`;

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
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} displays nuevos de Hisense.`);
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
importHisenseDisplays();
