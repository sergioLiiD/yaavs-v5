import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPermisos() {
  try {
    console.log('Verificando permisos disponibles...');
    
    const permisos = await prisma.permisos.findMany({
      select: {
        id: true,
        codigo: true,
        nombre: true,
        categoria: true
      },
      orderBy: {
        id: 'asc'
      }
    });

    console.log(`Total de permisos encontrados: ${permisos.length}`);
    console.log('\nPermisos disponibles:');
    permisos.forEach(permiso => {
      console.log(`ID: ${permiso.id}, Código: ${permiso.codigo}, Nombre: ${permiso.nombre}, Categoría: ${permiso.categoria}`);
    });

    // Verificar roles existentes
    console.log('\n--- Roles existentes ---');
    const roles = await prisma.roles.findMany({
      select: {
        id: true,
        nombre: true,
        descripcion: true
      }
    });

    console.log(`Total de roles encontrados: ${roles.length}`);
    roles.forEach(rol => {
      console.log(`ID: ${rol.id}, Nombre: ${rol.nombre}, Descripción: ${rol.descripcion}`);
    });

  } catch (error) {
    console.error('Error al verificar permisos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPermisos(); 