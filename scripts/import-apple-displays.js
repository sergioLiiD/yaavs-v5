const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Datos de displays de Apple (formato del archivo .txt)
const APPLE_DISPLAYS = [
  'V003        6S PLUS        AAA S/M        NEGRO',
  'V004-B        7G        AAA        BLANCO',
  'V004-N        7G        AAA        NEGRO',
  'V0092-B        8G/SE 2020        AAA S/M        BLANCO',
  'V0092-N        8G/SE 2020        AAA S/M        NEGRO',
  'V0015-B        6G        AAA S/M        BLANCO',
  'V0015-N        6G        AAA S/M        NEGRO',
  'V0091-B        8PLUS        AAA        BLANCO',
  'V0091-N        8PLUS        AAA        NEGRO',
  'V005-B        7PLUS        AAA        BLANCO',
  'V005-N        7PLUS        AAA        NEGRO',
  'I014        HG X        FHD S/M(BOUTIQUE)        NEGRO',
  'I023        HG X11(MOVIL IC)        FHD S/M(BOUTIQUE)        NEGRO',
  'I031        HG X14PLUS(MOVIL IC)        FHD S/M(BOUTIQUE)        NEGRO',
  'I027        HG X13PRO(MOVIL IC)        FHD S/M(BOUTIQUE)        NEGRO',
  'I016        HG XR        FHD S/M(BOUTIQUE)        NEGRO',
  'I029        HG X14(MOVIL IC)        FHD S/M(BOUTIQUE)        NEGRO',
  'I028        HG X13PRO MAX(MOVIL IC)        FHD S/M(BOUTIQUE)        NEGRO',
  'I015        HG XS        FHD S/M(BOUTIQUE)        NEGRO',
  'I017        HG XS MAX        FHD S/M(BOUTIQUE)        NEGRO',
  'I019        HG X11PRO MAX(MOVIL IC)        FHD S/M(BOUTIQUE)        NEGRO',
  'I021        HG X12/12PRO(MOVIL IC)        FHD S/M(BOUTIQUE)        NEGRO',
  'I022        HG X12PRO MAX(MOVIL IC)        FHD S/M(BOUTIQUE)        NEGRO',
  'I034        HG X15PRO        FHD S/M(BOUTIQUE)        NEGRO',
  'I030        HG X14PRO(MOVIL IC)        FHD S/M(BOUTIQUE)        NEGRO',
  'I024        HG X13(MOVIL IC)        FHD S/M(BOUTIQUE)        NEGRO',
  'I018        HG X11PRO(MOVIL IC)        FHD S/M(BOUTIQUE)        NEGRO',
  'JKI-FHD0670-C8        JK 13 PRO MAX(MOVIL IC)        FHD S/M        NEGRO',
  'JKI-FHD0550-M2        JK 13MINI(MOVIL IC)        FHD S/M        NEGRO',
  'JKI-FHD0550-M1        JK 12MINI(MOVIL IC)        FHD S/M        NEGRO',
  'JKI-FHD0600-H4        JK X15(MOVIL IC)        FHD S/M        NEGRO',
  'JKI-FHD0670-C6        JK X12PRO MAX        FHD S/M        NEGRO',
  'JKI-FHD0650-L2        JK X11PRO MAX        FHD S/M        NEGRO',
  'JKI-FHD0650-L1        JK XS MAX        FHD S/M        NEGRO',
  'JKI-FHD0600-H3        JK X14        FHD S/M        NEGRO',
  'JKI-FHD0600-H2        JK X13        FHD S/M        NEGRO',
  'JKI-FHD0600-H1        JK X12/X12PRO        FHD S/M        NEGRO',
  'JKI-FHD0610-S2        JK X11(MOVIL IC)        FHD S/M        NEGRO',
  'JKI-FHD0610-S1        JK XR        FHD S/M        NEGRO',
  'JKI-FHD0580-Z3        JK X11PRO        FHD S/M        NEGRO',
  'JKI-FHD0580-Z2        JK XS        FHD S/M        NEGRO',
  'JKI-FHD0580-Z1        JK X        FHD S/M        NEGRO',
  'JKI-HD0580-Z3        MS X11PRO        INCELL HD+ S/M        NEGRO',
  'JKI-HD0650-L2        MS X11PRO MAX(MOVIL IC)        INCELL HD+ S/M        NEGRO',
  'JKI-HD0650-L1        MS XS MAX        INCELL HD+ S/M        NEGRO',
  'JKI-HD0610-S2        MS X11(MOVIL IC)        INCELL HD+ S/M        NEGRO',
  'JKI-HD0610-S1        MS XR        INCELL HD+ S/M        NEGRO',
  'JKI-HD0580-Z2        MS XS        INCELL HD+ S/M        NEGRO',
  'JKI-HD0580-Z1        MS X        INCELL HD+ S/M        NEGRO',
  'X15PRO MAX INCELL-IC        X15PRO MAX(MOVIL IC)        INCELL S/M        NEGRO',
  'X15PRO INCELL-IC        X15PRO(MOVIL IC)        INCELL S/M        NEGRO',
  'X12MINI INCELL        12 MINI        INCELL S/M        NEGRO',
  'V0037        X        HD INCELL S/M        NEGRO',
  'V0035        XR        HD INCELL S/M        NEGRO',
  'V0038        XS        HD INCELL S/M        NEGRO',
  'XS INCELL        XS        INCELL S/M        NEGRO',
  'X11PRO INCELL-IC        11PRO(MOVIL IC)        INCELL S/M        NEGRO',
  'X11PRO MAX INCELL-IC        11PRO MAX(MOVIL IC)        INCELL S/M(BOUTIQUE)        NEGRO',
  'X12PRO INCELL-IC        12/12PRO(MOVIL IC)        INCELL S/M(BOUTIQUE)        NEGRO',
  'XS MAX INCELL        XS MAX        INCELL S/M        NEGRO',
  'X11 INCELL-IC        X11(MOVIL IC)        INCELL S/M        NEGRO',
  'X13MINI INCELL        13 MINI        INCELL S/M        NEGRO',
  'XR INCELL        XR        INCELL S/M        NEGRO',
  'X INCELL        X(CARTAN)        INCELL S/M        NEGRO',
  'RF-6715PM-F        HG X15PRO MAX        SOFT OLED(ORIG BOUTIQUE)        NEGRO',
  'RF-6714PM-F        HG X14PRO MAX        SOFT OLED(ORIG BOUTIQUE)        NEGRO',
  'RF-6713PM-F        HG X13PRO MAX        SOFT OLED(ORIG BOUTIQUE)        NEGRO',
  'LF-6712PM-F        HG X12PRO MAX        SOFT OLED(ORIG BOUTIQUE)        NEGRO',
  'X15 OLED-IC        X15(MOVIL IC)        AMOLED S/M        NEGRO',
  'X13PRO MAX OLED-IC        X13PRO MAX(MOVIL IC)        OLED S/M(BOUTIQUE)        NEGRO',
  'JKO-FHD0600-C1        JK X12/12PRO(MOVIL IC)        OLED S/M        NEGRO',
  'JKO-FHD0600-C3        JK X14(MOVIL IC)        SOFT OLED S/M        NEGRO',
  'JKO-FHD0600-C2        JK X13(MOVIL IC)        SOFT OLED S/M        NEGRO',
  'JKO-FHD0650-L3        JK X11PRO MAX(MOVIL IV)        SOFT OLED S/M        NEGRO',
  'JKO-FHD0650-L4        JK XS MAX        SOFTOLED S/M        NEGRO',
  'X14 OLED-IC        14(MOVIL IC)        AMOLED S/M        NEGRO',
  'X14PRO OLED-IC        14PRO(MOVIL IC)        AMOLED S/M        NEGRO',
  'X13PRO OLED-IC        13PRO(MOVIL IC)        OLED S/M(BOUTIQUE)        NEGRO',
  'X13 OLED        13        OLED S/M        NEGRO',
  'X12PRO MAX OLED-IC        12PRO MAX(MOVIL IC)        OLED S/M(BOUTIQUE)        NEGRO',
  'X11PRO OLED-IC        11PRO(MOVIL IC)        OLED S/M(BOUTIQUE)        NEGRO',
  'X13 OLED-IC        13(MOVIL IC)        OLED S/M (BOUTIQUE)        NEGRO',
  'X11PRO MAX OLED-IC        11PRO MAX (MOVIL IC)        OLED S/M        NEGRO',
  'X12PRO OLED-IC        12/12PRO        OLED S/M(MOVIL IC)        NEGRO',
  'X12PRO MAX OLED        12PRO MAX        AMOLED S/M(BOUTIQUE)        NEGRO',
  'XS MAX OLED        XS MAX        OLED S/M(BOUTIQUE)        NEGRO',
  'XS OLED        XS        OLED S/M(BOUTIQUE)        NEGRO',
  'X OLED        X        OLED S/M(BOUTIQUE)        NEGRO'
];

async function importAppleDisplays() {
  const result = {
    marca: 'APPLE',
    totalProductos: APPLE_DISPLAYS.length,
    creados: 0,
    duplicados: 0,
    errores: []
  };

  try {
    console.log('🚀 Iniciando importación de displays Apple...\n');
    console.log(`🏷️  Marca: ${result.marca}`);
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
    for (const productoLinea of APPLE_DISPLAYS) {
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
        const nombre = `Display Apple ${modelo} ${calidad} ${color}`;

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
      console.log(`\n🎉 ¡Importación completada! Se crearon ${result.creados} displays nuevos de Apple.`);
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
importAppleDisplays();
