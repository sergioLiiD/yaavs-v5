import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Verificando permisos del rol TECNICO...');

    // 1. Buscar el rol TECNICO existente (ID 18 según tu log)
    const tecnicoRole = await prisma.rol.findUnique({
      where: { id: 18 },
      include: {
        permisos: {
          include: {
            permiso: true
          }
        }
      }
    });

    if (!tecnicoRole) {
      console.log('❌ No se encontró el rol TECNICO con ID 18');
      return;
    }

    console.log('✅ Rol TECNICO encontrado:', tecnicoRole.nombre);
    console.log('\n📋 Permisos actuales del rol TECNICO:');
    tecnicoRole.permisos.forEach((rp) => {
      console.log(`  - ${rp.permiso.nombre} (${rp.permiso.codigo})`);
    });

    // 2. Definir los permisos que debe tener un técnico
    const permisosNecesarios = [
      'DASHBOARD_VIEW',
      'TICKETS_VIEW',
      'TICKETS_VIEW_DETAIL',
      'TICKETS_EDIT',
      'TICKETS_ASSIGN',
      'REPAIRS_VIEW',
      'REPAIRS_EDIT',
      'CLIENTS_VIEW' // Este es el permiso que faltaba
    ];

    console.log('\n🎯 Permisos necesarios para técnico:');
    permisosNecesarios.forEach(permiso => {
      console.log(`  - ${permiso}`);
    });

    // 3. Verificar qué permisos faltan
    const permisosActuales = tecnicoRole.permisos.map(rp => rp.permiso.codigo);
    const permisosFaltantes = permisosNecesarios.filter(permiso => !permisosActuales.includes(permiso));

    if (permisosFaltantes.length === 0) {
      console.log('\n✅ El rol TECNICO ya tiene todos los permisos necesarios');
      return;
    }

    console.log('\n❌ Permisos faltantes:');
    permisosFaltantes.forEach(permiso => {
      console.log(`  - ${permiso}`);
    });

    // 4. Buscar los permisos faltantes en la base de datos
    const permisosDB = await prisma.permiso.findMany({
      where: {
        codigo: {
          in: permisosFaltantes
        }
      }
    });

    console.log('\n🔍 Permisos encontrados en la base de datos:');
    permisosDB.forEach(permiso => {
      console.log(`  - ${permiso.nombre} (${permiso.codigo})`);
    });

    // 5. Asignar los permisos faltantes al rol
    if (permisosDB.length > 0) {
      console.log('\n➕ Asignando permisos faltantes al rol TECNICO...');
      
      for (const permiso of permisosDB) {
        try {
          await prisma.rolPermiso.create({
            data: {
              rolId: tecnicoRole.id,
              permisoId: permiso.id
            }
          });
          console.log(`  ✅ Asignado: ${permiso.nombre} (${permiso.codigo})`);
        } catch (error: any) {
          if (error.code === 'P2002') {
            console.log(`  ⚠️  Ya existe: ${permiso.nombre} (${permiso.codigo})`);
          } else {
            console.log(`  ❌ Error al asignar ${permiso.nombre}:`, error.message);
          }
        }
      }
    }

    // 6. Verificar el resultado final
    const rolFinal = await prisma.rol.findUnique({
      where: { id: 18 },
      include: {
        permisos: {
          include: {
            permiso: true
          }
        }
      }
    });

    if (rolFinal) {
      console.log('\n🎉 Permisos finales del rol TECNICO:');
      rolFinal.permisos.forEach((rp) => {
        console.log(`  - ${rp.permiso.nombre} (${rp.permiso.codigo})`);
      });

      // Verificar si tiene todos los permisos necesarios
      const permisosFinales = rolFinal.permisos.map(rp => rp.permiso.codigo);
      const todosLosPermisos = permisosNecesarios.every(permiso => permisosFinales.includes(permiso));
      
      if (todosLosPermisos) {
        console.log('\n✅ ¡El rol TECNICO ahora tiene todos los permisos necesarios!');
        console.log('\n📝 Ahora puedes:');
        console.log('  - Ver el dashboard');
        console.log('  - Ver y editar tickets');
        console.log('  - Asignar tickets a técnicos');
        console.log('  - Ver y editar reparaciones');
        console.log('  - Ver la lista de clientes');
      } else {
        console.log('\n⚠️  Aún faltan algunos permisos. Revisa la lista anterior.');
      }
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 