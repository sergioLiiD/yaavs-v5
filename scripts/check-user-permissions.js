const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Verificando permisos del usuario...');
    
    // Email del usuario a verificar (cambiar por el email correcto)
    const userEmail = 'admin@puntouno.com'; // Cambiar por el email correcto
    
    // Buscar el usuario
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

      console.log('\n🔧 Agregando permisos faltantes...');
      
      // Buscar los permisos faltantes en la base de datos
      const permisosFaltantes = await prisma.permisos.findMany({
        where: {
          codigo: { in: missingPermissions }
        }
      });

      if (permisosFaltantes.length > 0) {
        // Obtener el rol ADMINISTRADOR_PUNTO
        const rolAdminPunto = await prisma.roles.findFirst({
          where: { nombre: 'ADMINISTRADOR_PUNTO' }
        });

        if (rolAdminPunto) {
          for (const permiso of permisosFaltantes) {
            await prisma.roles_permisos.upsert({
              where: {
                rol_id_permiso_id: {
                  rol_id: rolAdminPunto.id,
                  permiso_id: permiso.id
                }
              },
              update: {},
              create: {
                rol_id: rolAdminPunto.id,
                permiso_id: permiso.id,
                updated_at: new Date()
              }
            });
            console.log(`  ✅ Permiso ${permiso.codigo} agregado al rol ADMINISTRADOR_PUNTO`);
          }
        } else {
          console.log('❌ Rol ADMINISTRADOR_PUNTO no encontrado');
        }
      } else {
        console.log('❌ No se encontraron los permisos faltantes en la base de datos');
      }
    } else {
      console.log('✅ Todos los permisos de repair-point están presentes');
    }

    console.log('\n🎉 Verificación completada!');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main(); 