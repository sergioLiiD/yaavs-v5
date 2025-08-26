const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de displays de ZTE (formato del archivo .txt)
const ZTE_DISPLAYS = [
  'ZT202+F        A3 2020        ORIG C/M(BOUTIQUE)        NEGRO',
  'ZT502+F        A5 2020        ORIG C/M(BOUTIQUE)        NEGRO',
  'ZT072+F        A72 4G        ORIG C/M(BOUTIQUE)        NEGRO',
  'ZT540+F        A54        ORIG C/M(BOUTIQUE)        NEGRO',
  'ZT533+F        A53PLUS        ORIG C/M(BOUTIQUE)        NEGRO',
  'ZT700+F        A71        ORIG C/M(BOUTIQUE)        NEGRO',
  'ZT522+F        A52        ORIG C/M(BOUTIQUE)        NEGRO',
  'ZT720+F        A72S 5G        ORIG C/M(BOUTIQUE)        NEGRO',
  'ZT053+F        A53        ORIG C/M(BOUTIQUE)        NEGRO',
  'ZT505+F        A51        ORIG C/M(BOUTIQUE)        NEGRO',
  'ZT207        A7S 2020        ORIG S/M        NEGRO',
  'ZT031        A31        ORIG S/M        NEGRO',
  'ZT720        A72S 5G        ORIG S/M        NEGRO',
  'ZT540        A34/A54        ORIG S/M        NEGRO',
  'ZT533        A53PLUS        ORIG S/M        NEGRO',
  'ZT053        A53        ORIG S/M        NEGRO',
  'ZT520        A52 LITE        ORIG S/M        NEGRO',
  'ZT522        A52/A72        ORIG S/M        NEGRO',
  'ZT505        A51/A71/NOBIA N41        ORIG S/M        NEGRO',
  'ZT702        A7 2020        ORIG S/M        NEGRO',
  'ZT502        A5 2020        ORIG S/M        NEGRO',
  'ZT202        A3 2020        ORIG S/M        NEGRO',
  'AX60        AXON 60        ORIG S/M        NEGRO',
  'AX60lite        AXON 60 LITE        ORIG S/M        NEGRO',
  'AX040        AXON 40SE        ORIG S/N        NEGRO',
  'AX20        AXON 20        ORIG S/M        NEGRO',
  'AX40pro        AXON 40 PRO        ORIG S/M        NEGRO',
  'AX11        AXON 11        ORIG S/M        NEGRO',
  'AX30        AXON 30        ORIG S/M        NEGRO',
  'AX30pro        AXON 30 PRO        ORIG S/M        NEGRO',
  'AX50lite        AXON 50 LITE        ORIG S/M        NEGRO',
  'AX40lite        AXON 40 LITE        ORIG S/M        NEGRO',
  'ZT222        L220        ORIG S/M        NEGRO',
  'ZT200        L210        ORIG S/M        NEGRO',
  'ZT046+F        V30 VITA        ORIG C/M(BOUTIQUE)        NEGRO',
  'ZT044+F        V40 SMART        ORIG C/M(BOUTIQUE)        NEGRO',
  'ZT400+F        V40 VITA        ORIG C/M        NEGRO',
  'ZT030+F        V30        ORIG C/M(BOUTIQUE)        NEGRO',
  'ZT004        V40 PRO        ORIG S/M        NEGRO',
  'ZT500        V50 SMART        ORIG S/M        NEGRO',
  'ZT020        V2020 5G        ORIG S/M        NEGRO',
  'ZT022        V2020 VITA        ORIG S/M        NEGRO',
  'ZT002        V20        ORIG S/M        NEGRO',
  'ZT441        V41 SMART        ORIG S/M        NEGRO',
  'ZT001        V10        ORIG S/M        NEGRO',
  'ZT009        V9        ORIG S/M        ORO',
  'ZT010        V10 VITA        ORIG S/M        NEGRO',
  'ZT099        V9 LITE        ORIG S/M        NEGRO',
  'ZT030        V30/V40        ORIG S/M        NEGRO',
  'ZT400        V40 VITA/V40S SMART/V41S SMART        ORIG S/M        NEGRO',
  'ZT801        V20 SMART 8010        ORIG S/M        NEGRO',
  'ZT205        V20 SMART 2050        ORIG S/M        NEGRO',
  'ZT046        V30 VITA        ORIG S/M        NEGRO',
  'ZT044        V40 SMART        ORIG S/M        NEGRO',
  'ZT056        V SMART/2050        ORIG S/M        NEGRO'
];

async function importZteDisplays() {
  const result = {
    marca: 'ZTE',
    totalProductos: ZTE_DISPLAYS.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de displays ZTE...\n');
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
    for (const productoLinea of ZTE_DISPLAYS) {
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
        const nombre = `Display ZTE ${modelo} ${calidad} ${color}`;

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
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} displays nuevos de ZTE.`);
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
importZteDisplays();
