const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de displays de Motorola (formato del archivo .txt)
const MOTOROLA_DISPLAYS = [
  'F1414        E30/E40        ORIG S/M        NEGRO',
  'KL-HD065-E32        E32/E22/E32S/G22        INCELL300+ S/M        NEGRO',
  'KL-HD065-E7+F        E7        INCELL300+ C/M        NEGRO',
  'KL-HD065-E7        E7/E7i/E7power/E7ipower        INCELL300+ S/M        NEGRO',
  'F1313        E13        ORIG S/M        NEGRO',
  'F1414+F        E30/E40        ORIG C/M(BOUTIQUE)        NEGRO',
  'F0824+F        E7POWER        ORIG C/M(BOUTIQUE)        NEGRO',
  'F0296+F        E7        ORIG C/M(BOUTIQUE)        NEGRO',
  'F0125+F        E6S        ORIG C/M(BOUTIQUE)        NEGRO',
  'F0127+F        E20        ORIG C/M (BOUTIQUE)        NEGRO',
  'F0702+F        E6PLUS        ORIG C/M(BOUTIQUE)        NEGRO',
  'A0044+F        E40        ORIG C/M(BOUTIQUE)        NEGRO',
  'F6011+F        E22        ORIG C/M(BOUTIQUE)        NEGRO',
  'F0855-O        E5PLUS        ORIG S/M        ORO',
  'F0855-N        E5PLUS        ORIG S/M        NEGRO',
  'F6011        E22/E22i        ORIG S/M        NEGRO',
  'F0127        E20/XT2155        ORIG S/M        NEGRO',
  'F0125        E6S/E6i        ORIG S/M        NEGRO',
  'F0055        E5 PLAY GO        ORIG S/M        NEGRO',
  'F0296        E7/E7POWER/E7I/ E7IPOWER        ORIG S/M        NEGRO',
  'F0702        E6PLUS        ORIG S/M        NEGRO',
  'F0037        E6PLAY        ORIG S/M        NEGRO',
  'F0456        E7PLUS/G9/G9PLAY        ORIG S/M        NEGRO',
  'F0500        EDGE50 PRO        AMOLED S/M        NEGRO',
  'F5555        G85/S50 NEO/EDGE 50 FUSION        AMOLED S/M        NEGRO',
  'F0400+F/g        EDGE 40 NEO        AMOLED C/M(BOUTIQUE)        VERDE',
  'F0400+F/L        EDGE 40 NEO        AMOLED C/M(BOUTIQUE)        AZUL',
  'F0400+F        EDGE 40 NEO        AMOLED C/M(BOUTIQUE)        NEGRO',
  'F0105/F0400        EDGE 40/EDGE 40 NEO/EDGE 2023        ORIG S/M        NEGRO',
  'F1133        EDGE30 NEO        OLED S/M        NEGRO',
  'F0776        EDGE        ORIG S/M        NEGRO',
  'F2002        EDGE20 LITE        AMOLED S/M        NEGRO',
  'F2002+F        EDGE20 LITE        AMOLED C/M(BOUTIQUE)        NEGRO',
  'F6767        G72/G52/G71S/G82/EDGE30        AMOLED S/M        NEGRO',
  'F0279        G52/G71S/G82/EDGE30        AMOLED (BOUTIQUE) S/M        NEGRO',
  'F0814        EDGE20/EDGE20 PRO/EDGE30 PRO        OLED S/M(BOUTIQUE)        NEGRO',
  'F5223+F        G5G 2023        ORIG C/M(BOUTIQUE)        NEGRO',
  'F5023        G STYLUS 5G 2023 ORIG S/M        NEGRO',
  'F5223        G5G 2023        ORIG S/M        NEGRO',
  'KL-HD065-G9+F        G9 PLAY        INCELL300+ C/M        NEGRO',
  'KL-HD065-G10+F        G10/G20/G30        INCELL300+ C/M        NEGRO',
  'KL-HD065-G8M+F        G8POWER LITE        INCELL300+ C/M        NEGRO',
  'KL-HD065-G31        G31/G41/G71        INCELL300+ S/M        NEGRO',
  'F2215+F        G STYLUS 2021 5G        ORIG C/M(BOUTIQUE)        NEGRO',
  'F0040+F        G PURE 4G        ORIG C/M(BOUTIQUE)        NEGRO',
  'F2224+F        G POWER 2022 4G        ORIG C/M(BOUTIQUE)        NEGRO',
  'F2225+F        G STYLUS 2022 4G/5G        ORIG C/M(BOUTIQUE)        NEGRO',
  'F5222+F        G5G 2022 4G        ORIG C/M(BOUTIQUE)        NEGRO',
  'F0009+F        G5G        ORIG C/M(BOUTIQUE)        NEGRO',
  'F0040        G PURE 4G        ORIG S/M        NEGRO',
  'F0388        G PLAY 2021 4G        ORIG S/M        NEGRO',
  'F2225        G STYLUS 2022 4G/5G        ORIG S/M        NEGRO',
  'F2215        G STYLUS 2021 5G/XT2131        ORIG S/M        NEGRO',
  'F0009        G5G/ONE 5G ACE        ORIG S/M        NEGRO',
  'F2224        G POWER 2022 4G        ORIG S/M        NEGRO',
  'F5222        G5G 2022 4G        ORIG S/M        NEGRO',
  'F0034        G34        ORIG S/M        NEGRO',
  'F0444+F        G04/G04S/E14        ORIG C/M(BOUTIQUE)        NEGRO',
  'F0024+F        G24/G24 POWER        ORIG C/M(BOUTIQUE)        NEGRO',
  'F0024        E14/G04/G04S/G24/G24 POWER        ORIG S/M        NEGRO',
  'F0733        G31/G41/G71        INCELL S/M        NEGRO',
  'F0042+F        G42        INCELL C/M(BOUTIQUE)        NEGRO',
  'F0733+F        G31        INCELL C/M(BOUTIQUE)        NEGRO',
  'F0177+F        G71        INCELL BOUTIQUE C/M        NEGRO',
  'F1411+F        G41        INCELL C/M(BOUTIQUE)        NEGRO',
  'F0808        G53        ORIG S/M        NEGRO',
  'F4455+F/H        G8 PLAY/ONE MACRO        ORI C/M (BOUTIQUE)        ROJO',
  'F4455+F        G8 PLAY/ONE MACRO        ORI C/M (BOUTIQUE)        NEGRO',
  'F5544+F        G54/G55/G64        ORIG C/M(BOUTIQUE)        NEGRO',
  'F8844        G84        AMOLED ORIG S/M        NEGRO',
  'F7373+F        G73 5G        ORIG C/M(BOUTIQUE)        NEGRO',
  'F1144        G14/G54/G55/G64        ORIG S/M        NEGRO',
  'F1144+F        G14        ORIG C/M(BOUTIQUE)        NEGRO',
  'F044        G6        ORIG S/M        NEGRO',
  'F0522+F        G52/G71S/G82        INCELL C/M(BOUTIGUE)        NEGRO',
  'F0929        G10 PLAY/G POWER 2021        ORIG S/M        NEGRO',
  'F0808+F        G53        ORIG C/M(BOUTIQUE)        NEGRO',
  'F0506+F        G7PLAY        ORIG C/M(BOUTIQUE)        NEGRO',
  'F0233+F        G8POWER LITE        ORIG C/M(BOUTIQUE)        NEGRO',
  'F0059-N        G6PLAY/E5        ORIG S/M        NEGRO',
  'F5040+F        G50 4G        ORIG C/M（BOUTIQUE)        NEGRO',
  'F5040        G50 4G        ORIG S/M        NEGRO',
  'F0230+F        G8PLUS        ORIG C/M(BOUTIQUE)        NEGRO',
  'F0456+F        G9PLAY/E7PLUS        ORIG C/M(BOUTIQUE)        NEGRO',
  'F0819+F        G22        ORIG C/M(BOUTIQUE)        NEGRO',
  'F4455        G8PLAY/ONE MACRO        ORIG S/M        NEGRO',
  'F0002+F        G60S        ORIG C/M(BOUTIQUE)        NEGRO',
  'F4027+F        G13/G23        ORIG C/M(BOUTIQUE)        NEGRO',
  'F1010+F        G10/G20/G30        ORIG C/M(BOUTIQUE)        NEGRO',
  'F0949+F        G9PLUS        ORIG C/M(BOUTIQUE)        NEGRO',
  'F6767+F        G72        AMOLED C/M        NEGRO',
  'F4027        G13/G23        ORIG S/M        NEGRO',
  'F3785+F        G50 5G        ORIG C/M（BOUTIQUE)        NEGRO',
  'F2397+F        G71        OLED C/M（BOUTIQUE）        NEGRO',
  'F0470+F        G41        OLED C/M(BOUTIGUE)        NEGRO',
  'F0310+F        G31        OLED C/M(BOUTIQUE)        NEGRO',
  'F0279+F        G52        AMOLED C/M (BOUTIQUE)        NEGRO',
  'F3874+F        G42        OLED C/M(BOUTIQUE)        NEGRO',
  'F0840+F        G8POWER        ORIG C/M（BOUTIQUE）        AZUL',
  'F1022+F        G60        ORIG C/M(BOUTIQUE)        NEGRO',
  'F3874        G42        OLED S/M        NEGRO',
  'F6062        G62        ORIG S/M        NEGRO',
  'F0532        G32/G73        ORIG S/M        NEGRO',
  'F0310        G31/G41/G71        OLED S/M        NEGRO',
  'F0230        G8PLUS        ORIG S/M        NEGRO',
  'F0013        G8        ORIG S/M        NEGRO',
  'F0025        G6PLUS        ORIG S/M        NEGRO',
  'F0200        G200 5G/EDGE 2021        ORIG S/M        NEGRO',
  'F0725        G100/EDGE S        ORIG S/M        NEGRO',
  'F1022        G60/G60S/G51 5G/G40FUSION        ORIG S/M (UNIVESAL)        NEGRO',
  'F3785        G50 5G        ORIG S/M        NEGRO',
  'F0949        G9PLUS        ORIG S/M        NEGRO',
  'F0819        G22/E22S/E32/E32S        ORIG S/M        NEGRO',
  'F1010        G20/G10/G30        ORIG S/M (UNIVERSAL)        NEGRO',
  'F0840        G8POWER        ORIG S/M        NEGRO',
  'F7777        G9POWER        ORIG S/M        NEGRO',
  'F0233        G8POWER LITE        ORIG S/M        NEGRO',
  'F0014        G7/G7PLUS        ORIG S/M        NEGRO',
  'F0059-O        G6PLAY/E5        ORIG S/M        ORO',
  'F0506        G7PLAY        ORIG S/M        NEGRO',
  'F0066        G7POWER        ORIG S/M        NEGRO',
  'F0001-N        ONE FUSION PLUS        ORIG S/M        NEGRO',
  'F0410+F        ONE        ORIG C/M(BOUTIQUE)        NEGRO',
  'F0666        ONE ZOOM/XT2010        OLED S/M        NEGRO',
  'F0862        ONE FUSION        ORIG S/M        NEGRO',
  'F0909        ONE HYPER/XT2027        ORIG S/M        NEGRO',
  'F0720        ONE VISION/ONE ATION        ORIG S/M        NEGRO',
  'F0001-B        ONE FUSION PLUS        ORIG S/M        BLANCO',
  'F0410        ONE        ORIG S/M        NEGRO',
  'F0404        X4        ORIG S/M        NEGRO',
  'F0750-B        Z2 PLAY        OLED S/M        BLANCO',
  'F0333        Z3 PLAY        OLED S/M        NEGRO',
  'F0750-N        Z2 PLAY        OLED S/M        NEGRO',
  'F0097        Z PLAY        OLED S/M        NEGRO'
];

async function importMotorolaDisplays() {
  const result = {
    marca: 'Motorola',
    totalProductos: MOTOROLA_DISPLAYS.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de displays Motorola...\n');
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
    for (const productoLinea of MOTOROLA_DISPLAYS) {
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
        const nombre = `Display Motorola ${modelo} ${calidad} ${color}`;

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
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} displays nuevos de Motorola.`);
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
importMotorolaDisplays();
