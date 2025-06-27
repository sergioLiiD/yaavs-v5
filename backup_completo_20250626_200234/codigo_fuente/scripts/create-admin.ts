import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Verificar si el usuario ya existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: 'sergio@hoom.mx' }
    });

    if (usuarioExistente) {
      console.log('El usuario ya existe');
      return;
    }

    // Crear el rol de administrador si no existe
    const rolAdmin = await prisma.rol.upsert({
      where: { nombre: 'ADMINISTRADOR' },
      update: {},
      create: {
        nombre: 'ADMINISTRADOR',
        descripcion: 'Rol con acceso total al sistema'
      }
    });

    // Crear los permisos básicos si no existen
    const permisos = await Promise.all([
      prisma.permiso.upsert({
        where: { nombre: 'GESTIONAR_USUARIOS' },
        update: {},
        create: {
          nombre: 'GESTIONAR_USUARIOS',
          descripcion: 'Permite gestionar usuarios del sistema'
        }
      }),
      prisma.permiso.upsert({
        where: { nombre: 'GESTIONAR_TICKETS' },
        update: {},
        create: {
          nombre: 'GESTIONAR_TICKETS',
          descripcion: 'Permite gestionar tickets'
        }
      }),
      prisma.permiso.upsert({
        where: { nombre: 'GESTIONAR_PRESUPUESTOS' },
        update: {},
        create: {
          nombre: 'GESTIONAR_PRESUPUESTOS',
          descripcion: 'Permite gestionar presupuestos'
        }
      })
    ]);

    // Asignar permisos al rol de administrador
    await Promise.all(
      permisos.map(permiso =>
        prisma.rolPermiso.upsert({
          where: {
            rolId_permisoId: {
              rolId: rolAdmin.id,
              permisoId: permiso.id
            }
          },
          update: {},
          create: {
            rolId: rolAdmin.id,
            permisoId: permiso.id
          }
        })
      )
    );

    // Crear el usuario administrador
    const passwordHash = await bcrypt.hash('whoS5un0%', 10);
    const usuario = await prisma.usuario.create({
      data: {
        email: 'sergio@hoom.mx',
        nombre: 'Sergio',
        apellidoPaterno: 'Velazco',
        passwordHash,
        activo: true,
        usuarioRoles: {
          create: {
            rolId: rolAdmin.id
          }
        }
      },
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
    });

    console.log('Usuario administrador creado:', {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellidoPaterno: usuario.apellidoPaterno,
      roles: usuario.usuarioRoles.map(ur => ur.rol.nombre)
    });
  } catch (error) {
    console.error('Error al crear el usuario administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 