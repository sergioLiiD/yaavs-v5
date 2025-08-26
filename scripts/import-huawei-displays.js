const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de displays de Huawei (formato del archivo .txt)
const HUAWEI_DISPLAYS = [
  'W0999+F        MATE 9        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0099        MATE20 PRO        INCELL S/M        NEGRO',
  'W0222        MATE20        INCELL S/M        NEGRO',
  'W0010        MATE 10        ORIG S/M        NEGRO',
  'W0999        MATE 9        ORIG S/M        NEGRO',
  'W0101        MATE10 PRO        INCELL S/M        NEGRO',
  'W0200        MATE20 PRO        INCELL S/M        NEGRO',
  'W0002+F        MATE10 LITE        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0012+F        MATE20 LITE        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0002        MATE10 LITE        ORIG S/M        NEGRO',
  'W0012        MATE20 LITE        ORIG S/M        NEGRO',
  'KL-HD067-M11        NOVA Y70/Y71        INCELL300+ S/M        NEGRO',
  'W0121+F        NOVA 5T        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0100+F        NOVA10 SE        ORIG C/M(BOUTIQUE)        NEGRO',
  'W1212+F        NOVA9 SE        COG C/M(BOUTIQUE)        NEGRO',
  'W0100        NOVA10 SE/NOVA11 SE/NOVA12 SE        ORIG S/M        NEGRO',
  'W0888+F        NOVA 8        AMOLED C/M(ROUTIQUE)        NEGRO',
  'W0300+F        NOVA3        ORIG C/M(BOUTIQUE)        NEGRO',
  'W1414+F        NOVA Y90        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0150        NOVA9/HONOR 50        ORIG S/M        NEGRO',
  'W0011        NOVA 10        ORIG S/M        NEGRO',
  'W1414        NOVA Y90        ORIG S/M        NEGRO',
  'W1212-COG        NOVA9 SE/N0VA 11i        COG S/M        NEGRO',
  'W0121-COF        NOVA5T/HONOR20        ORIG COF S/M        NEGRO',
  'W0121-COG        NOVA5T/HONOR20        COG S/M        NEGRO',
  'W0911        NOVA9/HONOR50        AMOLED S/M(CURVO)        NEGRO',
  'W0888        NOVA8        AMOLED S/M(CURVO)        NEGRO',
  'W0004+F        NOVA Y60        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0020+F        NOVA Y70        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0300        NOVA3        INCELL S/M        NEGRO',
  'W0020        NOVA Y70        ORIG S/M        NEGRO',
  'W0004        NOVA Y60        ORIG S/M        NEGRO',
  'W0666+F        P SMART 2018        ORIG C/M        NEGRO',
  '02352HTF        P smart 2019        ORIG C/M C/PILAS        NEGRO',
  '02352PJP        P30 LITE(128G)        ORIG C/M C/PILAS        AZUL',
  'W0030        P30 PRO        OLED S/M        NEGRO',
  'W0202+F        P20 PRO        OLED C/M(BOUTIQUE)        NEGRO',
  'W0029+F        P SMART 2019        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0666-COF        P SMART 2018        ORIG COF S/M        NEGRO',
  'W0040-COG        P40 LITE        COG S/M        NEGRO',
  'W0202        P20 PRO        COG S/M        NEGRO',
  'W0029-COG        P SMART 2019        COG S/M        NEGRO',
  'W0333-COG        P30 LITE        COG S/M        NEGRO',
  'W0035        P30        OLED S/M        NEGRO',
  'W0023+F        P20 LITE        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0040+F        P40 LITE        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0333+F        P30 LITE        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0022        P30        INCELL S/M        NEGRO',
  'W0040-COF        P40 LITE        ORIG COF S/M        NEGRO',
  'W0029-COF        P SMART 2019        ORIG COF S/M        NEGRO',
  'W0333-COF        P30 LITE        ORIG COF S/M        NEGRO',
  'W0023        P20 LITE/ANE LX3        INCELL S/M        NEGRO',
  'W6000-COF        Y6P/HONOR9A/10E/HONOR9S PRIME        COF S/M        NEGRO',
  'W0006+F/A        Y9S        ORIG C/M(BOUTIQUE)        AZUL',
  'KL-HD065-9X        Y9S/HONOR 9X        INCELL300+ S/M        NEGRO',
  'W0777+F        Y7 2019        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0600+F        Y6 2018        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0178+F        Y7 2018        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0006-COG+F        Y9S        COG C/M(BOUTIQUE)        NEGRO',
  'W0006-COF        Y9S/HONOR 9X        ORIG COF S/M        NEGRO',
  'W0009-COG        Y9A        COG S/M        NEGRO',
  'W0019-COG        Y9 2019/Y8S        COG S/M        NEGRO',
  'W0019+F        Y9 2019/Y8S        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0006-COG        Y9S/HONOR 9X        COG S/M        NEGRO',
  'W6000+F        Y6P/HONOR9A/HONOR9S PRIME        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0006+F        Y9S        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0027+F        Y7P        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0069+F        Y6 2019        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0045+F        Y7A        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0009+F        Y9A        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0007+F        Y9 PRIME        ORIG C/M(BOUTIQUE)        NEGRO',
  'W0808+F        Y8P        INCELL C/M(BOUTIQUE)        NEGRO',
  'W0007-COG        Y9 PRIME        COG S/M        NEGRO',
  'W0009-COF        Y9A        ORIG COF S/M        NEGRO',
  'W0718        Y7 2018        ORIG S/M        NEGRO',
  'W0600        Y6 2018        ORIG S/M        NEGRO',
  'W0027        Y7P/P40 LITE E        ORIG S/M        NEGRO',
  'W0045        Y7A/P SMART 2021/HONOR 10X LITE        ORIG S/M        NEGRO',
  'W0808        Y8P/Honor 20 lite        INCELL S/M        NEGRO',
  'W6000-COG        Y6P/HONOR9A/10E/HONOR9S PRIME        COG S/M        NEGRO',
  'W0019-COF        Y9 2019/Y8S        ORIG COF S/M        NEGRO',
  'W0007-COF        Y9 PRIME        ORIG COF S/M        NEGRO',
  'W0777        Y7 2019        ORIG S/M        NEGRO',
  'W0069        Y6 2019/Y6S/HONOR 8A        ORIG S/M        NEGRO'
];

async function importHuaweiDisplays() {
  const result = {
    marca: 'Huawei',
    totalProductos: HUAWEI_DISPLAYS.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de displays Huawei...\n');
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📦 Productos a importar: ${result.totalProductos}`);

    // Buscar la marca Huawei en la base de datos
    const marca = await prisma.marcas.findFirst({
      where: {
        nombre: {
          equals: 'Huawei',
          mode: 'insensitive'
        }
      }
    });

    if (!marca) {
      throw new Error('La marca "Huawei" no existe en la base de datos. Por favor, créala primero.');
    }

    console.log(`✅ Marca encontrada: ${marca.nombre} (ID: ${marca.id})`);

    // Procesar cada producto
    for (const productoLinea of HUAWEI_DISPLAYS) {
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
        const nombre = `Display Huawei ${modelo} ${calidad} ${color}`;

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
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} displays nuevos de Huawei.`);
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
importHuaweiDisplays();
