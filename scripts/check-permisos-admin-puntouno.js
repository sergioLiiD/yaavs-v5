const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Verificando permisos del usuario...');
    
    const userEmail = 'admin@puntouno.com';
    
    const user = await prisma.usuarios.findUnique({
      where: { email: userEmail },
      include: {
        usuarios_roles: {
          include: {
            roles: {
              include: {
                roles_permisos: {
                  include: {
                    permisos: true
                  }
                }
              }
            }
          }
        },
        usuarios_puntos_recoleccion: {
          include: {
            puntos_recoleccion: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }

    console.log(`\n👤 Usuario: ${user.nombre} (${user.email})`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🆔 ID: ${user.id}`);
    console.log(`✅ Activo: ${user.activo}`);

    // Mostrar roles
    console.log('\n🎭 Roles:');
    user.usuarios_roles.forEach(ur => {
      console.log(`  - ${ur.roles.nombre}: ${ur.roles.descripcion}`);
    });

    // Mostrar puntos de recolección
    console.log('\n📍 Puntos de recolección:');
    user.usuarios_puntos_recoleccion.forEach(up => {
      console.log(`  - ${up.puntos_recoleccion.nombre} (Nivel: ${up.nivel})`);
    });

    // Mostrar permisos
    console.log('\n🔑 Permisos:');
    const allPermissions = user.usuarios_roles.flatMap(ur => 
      ur.roles.roles_permisos.map(rp => rp.permisos)
    );
    
    allPermissions.forEach(permiso => {
      console.log(`  - ${permiso.codigo}: ${permiso.nombre}`);
    });

    // Verificar permisos específicos de repair-point
    const requiredPermissions = [
      'PUNTO_DIAGNOSTICO_CREATE',
      'PUNTO_DIAGNOSTICO_EDIT', 
      'PUNTO_DIAGNOSTICO_VIEW',
      'PUNTO_CHECKLIST_DIAGNOSTICO_CREATE',
      'PUNTO_CHECKLIST_DIAGNOSTICO_EDIT',
      'PUNTO_CHECKLIST_DIAGNOSTICO_VIEW',
      'PUNTO_CHECKLIST_REPARACION_CREATE',
      'PUNTO_CHECKLIST_REPARACION_EDIT',
      'PUNTO_CHECKLIST_REPARACION_VIEW',
      'PUNTO_REPARACION_CREATE',
      'PUNTO_REPARACION_EDIT',
      'PUNTO_REPARACION_VIEW'
    ];

    console.log('\n🔍 Verificando permisos de repair-point:');
    const userPermissionCodes = allPermissions.map(p => p.codigo);
    
    const missingPermissions = requiredPermissions.filter(perm => 
      !userPermissionCodes.includes(perm)
    );

    if (missingPermissions.length > 0) {
      console.log('❌ Permisos faltantes:');
      missingPermissions.forEach(perm => {
        console.log(`  - ${perm}`);
      });
    } else {
      console.log('✅ Todos los permisos de repair-point están presentes');
    }

    console.log('\n🎉 Verificación completada!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 