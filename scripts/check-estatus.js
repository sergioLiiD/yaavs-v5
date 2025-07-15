const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkEstatusReparacion() {
  try {
    console.log('🔍 Verificando estatus de reparación en la base de datos...\n');

    const estatusReparacion = await prisma.estatus_reparacion.findMany({
      orderBy: {
        orden: 'asc'
      }
    });

    console.log('📋 Estatus de reparación encontrados:');
    console.log('ID | Nombre | Descripción | Orden | Activo | Color');
    console.log('---|--------|-------------|-------|--------|------');
    
    estatusReparacion.forEach(estatus => {
      console.log(`${estatus.id} | ${estatus.nombre} | ${estatus.descripcion || 'N/A'} | ${estatus.orden} | ${estatus.activo} | ${estatus.color || 'N/A'}`);
    });

    console.log('\n✅ Verificación completada');
  } catch (error) {
    console.error('❌ Error al verificar estatus de reparación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEstatusReparacion(); 