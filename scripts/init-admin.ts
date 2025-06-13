import { PrismaClient, Usuario, UsuarioRol, Rol, RolPermiso, Permiso } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Iniciando creación del administrador...');

    // 1. Crear el rol ADMINISTRADOR si no existe
    const adminRole = await prisma.rol.upsert({
      where: { nombre: 'ADMINISTRADOR' },
      update: {},
      create: {
        nombre: 'ADMINISTRADOR',
        descripcion: 'Rol con acceso total al sistema'
      }
    });

    console.log('✅ Rol ADMINISTRADOR creado/verificado');

    // 2. Crear permisos básicos
    const permisos = [
      {
        codigo: 'USERS_VIEW',
        nombre: 'Ver Usuarios',
        descripcion: 'Permite ver la lista de usuarios',
        categoria: 'USERS'
      },
      {
        codigo: 'USERS_CREATE',
        nombre: 'Crear Usuarios',
        descripcion: 'Permite crear nuevos usuarios',
        categoria: 'USERS'
      },
      {
        codigo: 'USERS_EDIT',
        nombre: 'Editar Usuarios',
        descripcion: 'Permite editar usuarios existentes',
        categoria: 'USERS'
      },
      {
        codigo: 'USERS_DELETE',
        nombre: 'Eliminar Usuarios',
        descripcion: 'Permite eliminar usuarios',
        categoria: 'USERS'
      },
      {
        codigo: 'ROLES_VIEW',
        nombre: 'Ver Roles',
        descripcion: 'Permite ver la lista de roles',
        categoria: 'ROLES'
      },
      {
        codigo: 'ROLES_CREATE',
        nombre: 'Crear Roles',
        descripcion: 'Permite crear nuevos roles',
        categoria: 'ROLES'
      },
      {
        codigo: 'ROLES_EDIT',
        nombre: 'Editar Roles',
        descripcion: 'Permite editar roles existentes',
        categoria: 'ROLES'
      },
      {
        codigo: 'ROLES_DELETE',
        nombre: 'Eliminar Roles',
        descripcion: 'Permite eliminar roles',
        categoria: 'ROLES'
      }
    ];

    // Crear los permisos
    for (const permiso of permisos) {
      await prisma.permiso.upsert({
        where: { codigo: permiso.codigo },
        update: {},
        create: permiso
      });
    }

    console.log('✅ Permisos básicos creados/verificados');

    // 3. Asignar todos los permisos al rol ADMINISTRADOR
    for (const permiso of permisos) {
      const permisoCreado = await prisma.permiso.findUnique({
        where: { codigo: permiso.codigo }
      });

      if (permisoCreado) {
        await prisma.rolPermiso.upsert({
          where: {
            rolId_permisoId: {
              rolId: adminRole.id,
              permisoId: permisoCreado.id
            }
          },
          update: {},
          create: {
            rolId: adminRole.id,
            permisoId: permisoCreado.id
          }
        });
      }
    }

    console.log('✅ Permisos asignados al rol ADMINISTRADOR');

    // 4. Crear el usuario administrador
    const passwordHash = await hash('whoS5un0%', 10);
    
    const adminUser = await prisma.usuario.upsert({
      where: { email: 'sergio@hoom.mx' },
      update: {
        nombre: 'Sergio',
        apellidoPaterno: 'Velazco',
        passwordHash,
        activo: true
      },
      create: {
        email: 'sergio@hoom.mx',
        nombre: 'Sergio',
        apellidoPaterno: 'Velazco',
        passwordHash,
        activo: true
      }
    });

    console.log('✅ Usuario administrador creado/actualizado');

    // 5. Asignar el rol ADMINISTRADOR al usuario
    await prisma.usuarioRol.upsert({
      where: {
        usuarioId_rolId: {
          usuarioId: adminUser.id,
          rolId: adminRole.id
        }
      },
      update: {},
      create: {
        usuarioId: adminUser.id,
        rolId: adminRole.id
      }
    });

    console.log('✅ Rol ADMINISTRADOR asignado al usuario');

    // 6. Verificar la creación
    const usuarioVerificado = await prisma.usuario.findUnique({
      where: { email: 'sergio@hoom.mx' },
      include: {
        usuarioRoles: {
          include: {
            rol: {
              include: {
                permisos: {
                  include: {
                    permiso: true
                  }
                }
              }
            }
          }
        }
      }
    }) as (Usuario & {
      usuarioRoles: (UsuarioRol & {
        rol: Rol & {
          permisos: (RolPermiso & {
            permiso: Permiso
          })[]
        }
      })[]
    }) | null;

    if (usuarioVerificado) {
      console.log('\n🎉 Proceso completado exitosamente!');
      console.log('\nCredenciales de acceso:');
      console.log('Email: sergio@hoom.mx');
      console.log('Contraseña: whoS5un0%');
      console.log('\nRoles asignados:');
      usuarioVerificado.usuarioRoles.forEach((ur) => {
        console.log(`- ${ur.rol.nombre}`);
        console.log('  Permisos:');
        ur.rol.permisos.forEach((rp) => {
          console.log(`  - ${rp.permiso.nombre} (${rp.permiso.codigo})`);
        });
      });
    }

  } catch (error) {
    console.error('❌ Error durante la inicialización:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 