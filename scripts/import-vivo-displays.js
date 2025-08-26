const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de displays de Vivo (formato del archivo .txt)
const VIVO_DISPLAYS = [
  'KL-HD065-Y50        Y50/1935        INCELL300+ S/M        NEGRO',
  'KL-HD065-Y30        Y30/Y30i        INCELL300+ S/M        NEGRO',
  'KL-HD065-Y33        Y33/Y33S        INCELL300+ S/M        NEGRO',
  'KL-HD062-Y93        Y1S/Y90/Y91/Y91I/Y91C/Y93/Y93S/Y95/U1        INCELL300+ S/M        NEGRO',
  'KL-HD060-Y71-N        Y71/Y73        INCELL300+ S/M        NEGRO',
  'KL-HD060-Y71-B        Y71/Y73        INCELL300+ S/M        BLANCO',
  'ZT021        V21/V25/T1 5G/T1PRO/S9E        OLED S/M        NEGRO',
  'K0027+F        V27E        ORIG C/M        NEGRO',
  'K0305+F        V30LITE 5G        ORIG C/M(BOUTIQUE)        NEGRO',
  'K0365+F        Y36 4G        ORIG C/M(BOUTIQUE)        NEGRO',
  'K0017+F        Y17S        ORIG C/M(BOUTIQUE)        NEGRO',
  'K0113+F        Y3        ORIG C/M(BOUTIQUE)        NEGRO',
  'K0033+F        Y33S 5G        ORIG C/M(BOUTIQUE)        NEGRO',
  'K2020+F        Y20/Y20 2021        ORIG C/M(BOUTIQUE)        NEGRO',
  'K0364        Y36 5G        ORIG S/M        NEGRO',
  'K0217        Y17S/Y22/Y22S        ORIG S/M        NEGRO',
  'K0365        Y36 4G        ORIG S/M        NEGRO',
  'K0025        V21/V25/T1 5G/T1 PRO        OLED S/M        NEGRO',
  'K033S        Y33S/Y76S/Y76 5G/Y74S/Y33T/X2058(UNIVERSAL)        ORIG S/M        NEGRO',
  'K0093        Y1S/Y90/Y91/Y91I/Y91C/Y93/Y93S/Y95/U1        ORIG S/M        NEGRO',
  'K0015        "Y01/Y02S/Y15S/Y15A/Y16/Y21/Y21A/Y21E/Y21G/Y21T/Y31S/Y32/Y33 E/Y33S"        ORIG S/M        NEGRO',
  'K0053        "Y3S 2020/Y31 2020/Y31S/Y51 2020/Y52S/Y53S/Y72 5G/Y74S/Y76S/V2058"        ORIG S/M        NEGRO',
  'K0030        Y30/Y30I        ORIG S/M        NEGRO',
  'K0071        Y71/Y73        ORIG S/M        NEGRO',
  'K0113        Y3/Y3S/Y11/Y12/Y15/Y17/U3X/U10        ORIG S/M        NEGRO',
  'K2020        "Y20/Y20 2021/Y20i/Y20S/Y20sg/Y15A/Y15s/Y11s/Y12s/V12A/V12s 2021/Y3s 2021/Y30/30G/Y31S"        ORIG S/M        NEGRO',
  'K0033        Y33S/Y74S 5G/Y76S 5G/Y33T/Y21T        ORIG S/M        NEGRO'
];

async function importVivoDisplays() {
  const result = {
    marca: 'Vivo',
    totalProductos: VIVO_DISPLAYS.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de displays Vivo...\n');
    console.log(`🏷️  Marca: ${result.marca}`);
    console.log(`📦 Productos a importar: ${result.totalProductos}`);

    // Buscar la marca Vivo en la base de datos
    const marca = await prisma.marcas.findFirst({
      where: {
        nombre: {
          equals: 'Vivo',
          mode: 'insensitive'
        }
      }
    });

    if (!marca) {
      throw new Error('La marca "Vivo" no existe en la base de datos. Por favor, créala primero.');
    }

    console.log(`✅ Marca encontrada: ${marca.nombre} (ID: ${marca.id})`);

    // Procesar cada producto
    for (const productoLinea of VIVO_DISPLAYS) {
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
        const nombre = `Display Vivo ${modelo} ${calidad} ${color}`;

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
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} displays nuevos de Vivo.`);
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
importVivoDisplays();
