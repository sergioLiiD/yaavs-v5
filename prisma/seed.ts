import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de la base de datos...');

  try {
    // Nombres de tablas según mapping en schema.prisma
    const tablesToTruncate = [
      'usuarios_roles',
      'roles_permisos',
      'permisos',
      'roles',
      'checklist_diagnostico',
      'piezas_reparacion',
      'reparaciones',
      'presupuestos',
      'tickets',
      'piezas',
      'modelos',
      'marcas',
      'proveedores'
    ];

    for (const table of tablesToTruncate) {
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`);
        console.log(`Tabla ${table} truncada exitosamente`);
      } catch (error) {
        console.warn(`Advertencia al truncar ${table}:`, error);
      }
    }

    console.log('Datos existentes eliminados');

    // Crear permisos básicos
    const permisos = [
      // Permisos de Tickets
      {
        nombre: 'Ver Tickets',
        descripcion: 'Permite ver la lista de tickets',
        codigo: 'TICKETS_VIEW',
        categoria: 'TICKETS'
      },
      {
        nombre: 'Ver Ticket Detalle',
        descripcion: 'Permite ver los detalles de un ticket específico',
        codigo: 'TICKETS_VIEW_DETAIL',
        categoria: 'TICKETS'
      },
      {
        nombre: 'Crear Ticket',
        descripcion: 'Permite crear nuevos tickets',
        codigo: 'TICKETS_CREATE',
        categoria: 'TICKETS'
      },
      {
        nombre: 'Editar Ticket',
        descripcion: 'Permite editar tickets existentes',
        codigo: 'TICKETS_EDIT',
        categoria: 'TICKETS'
      },
      {
        nombre: 'Eliminar Ticket',
        descripcion: 'Permite eliminar tickets',
        codigo: 'TICKETS_DELETE',
        categoria: 'TICKETS'
      },
      {
        nombre: 'Asignar Ticket',
        descripcion: 'Permite asignar tickets a técnicos',
        codigo: 'TICKETS_ASSIGN',
        categoria: 'TICKETS'
      },

      // Permisos de Costos
      {
        nombre: 'Ver Costos',
        descripcion: 'Permite ver los costos',
        codigo: 'COSTS_VIEW',
        categoria: 'COSTS'
      },
      {
        nombre: 'Crear Costo',
        descripcion: 'Permite crear nuevos costos',
        codigo: 'COSTS_CREATE',
        categoria: 'COSTS'
      },
      {
        nombre: 'Editar Costo',
        descripcion: 'Permite editar costos existentes',
        codigo: 'COSTS_EDIT',
        categoria: 'COSTS'
      },
      {
        nombre: 'Eliminar Costo',
        descripcion: 'Permite eliminar costos',
        codigo: 'COSTS_DELETE',
        categoria: 'COSTS'
      },

      // Permisos de Catálogo
      {
        nombre: 'Ver Catálogo',
        descripcion: 'Permite ver el catálogo',
        codigo: 'CATALOG_VIEW',
        categoria: 'CATALOG'
      },
      {
        nombre: 'Crear Item Catálogo',
        descripcion: 'Permite crear nuevos items en el catálogo',
        codigo: 'CATALOG_CREATE',
        categoria: 'CATALOG'
      },
      {
        nombre: 'Editar Item Catálogo',
        descripcion: 'Permite editar items del catálogo',
        codigo: 'CATALOG_EDIT',
        categoria: 'CATALOG'
      },
      {
        nombre: 'Eliminar Item Catálogo',
        descripcion: 'Permite eliminar items del catálogo',
        codigo: 'CATALOG_DELETE',
        categoria: 'CATALOG'
      },

      // Permisos de Inventario
      {
        nombre: 'Ver Inventario',
        descripcion: 'Permite ver el inventario',
        codigo: 'INVENTORY_VIEW',
        categoria: 'INVENTORY'
      },
      {
        nombre: 'Crear Item Inventario',
        descripcion: 'Permite crear nuevos items en el inventario',
        codigo: 'INVENTORY_CREATE',
        categoria: 'INVENTORY'
      },
      {
        nombre: 'Editar Item Inventario',
        descripcion: 'Permite editar items del inventario',
        codigo: 'INVENTORY_EDIT',
        categoria: 'INVENTORY'
      },
      {
        nombre: 'Eliminar Item Inventario',
        descripcion: 'Permite eliminar items del inventario',
        codigo: 'INVENTORY_DELETE',
        categoria: 'INVENTORY'
      },

      // Permisos de Clientes
      {
        nombre: 'Ver Clientes',
        descripcion: 'Permite ver la lista de clientes',
        codigo: 'CLIENTS_VIEW',
        categoria: 'CLIENTS'
      },
      {
        nombre: 'Crear Cliente',
        descripcion: 'Permite crear nuevos clientes',
        codigo: 'CLIENTS_CREATE',
        categoria: 'CLIENTS'
      },
      {
        nombre: 'Editar Cliente',
        descripcion: 'Permite editar clientes existentes',
        codigo: 'CLIENTS_EDIT',
        categoria: 'CLIENTS'
      },
      {
        nombre: 'Eliminar Cliente',
        descripcion: 'Permite eliminar clientes',
        codigo: 'CLIENTS_DELETE',
        categoria: 'CLIENTS'
      },

      // Permisos de Reparaciones
      {
        nombre: 'Ver Reparaciones',
        descripcion: 'Permite ver las reparaciones',
        codigo: 'REPAIRS_VIEW',
        categoria: 'REPAIRS'
      },
      {
        nombre: 'Crear Reparación',
        descripcion: 'Permite crear nuevas reparaciones',
        codigo: 'REPAIRS_CREATE',
        categoria: 'REPAIRS'
      },
      {
        nombre: 'Editar Reparación',
        descripcion: 'Permite editar reparaciones existentes',
        codigo: 'REPAIRS_EDIT',
        categoria: 'REPAIRS'
      },
      {
        nombre: 'Eliminar Reparación',
        descripcion: 'Permite eliminar reparaciones',
        codigo: 'REPAIRS_DELETE',
        categoria: 'REPAIRS'
      },

      // Permisos de Usuarios
      {
        nombre: 'Ver Usuarios',
        descripcion: 'Permite ver la lista de usuarios',
        codigo: 'USERS_VIEW',
        categoria: 'USERS'
      },
      {
        nombre: 'Crear Usuario',
        descripcion: 'Permite crear nuevos usuarios',
        codigo: 'USERS_CREATE',
        categoria: 'USERS'
      },
      {
        nombre: 'Editar Usuario',
        descripcion: 'Permite editar usuarios existentes',
        codigo: 'USERS_EDIT',
        categoria: 'USERS'
      },
      {
        nombre: 'Eliminar Usuario',
        descripcion: 'Permite eliminar usuarios',
        codigo: 'USERS_DELETE',
        categoria: 'USERS'
      },

      // Permisos de Roles
      {
        nombre: 'Ver Roles',
        descripcion: 'Permite ver la lista de roles',
        codigo: 'ROLES_VIEW',
        categoria: 'ROLES'
      },
      {
        nombre: 'Crear Rol',
        descripcion: 'Permite crear nuevos roles',
        codigo: 'ROLES_CREATE',
        categoria: 'ROLES'
      },
      {
        nombre: 'Editar Rol',
        descripcion: 'Permite editar roles existentes',
        codigo: 'ROLES_EDIT',
        categoria: 'ROLES'
      },
      {
        nombre: 'Eliminar Rol',
        descripcion: 'Permite eliminar roles',
        codigo: 'ROLES_DELETE',
        categoria: 'ROLES'
      },

      // Permisos de Puntos de Recolección
      {
        nombre: 'Ver Puntos de Recolección',
        descripcion: 'Permite ver los puntos de recolección',
        codigo: 'COLLECTION_POINTS_VIEW',
        categoria: 'COLLECTION_POINTS'
      },
      {
        nombre: 'Crear Punto de Recolección',
        descripcion: 'Permite crear nuevos puntos de recolección',
        codigo: 'COLLECTION_POINTS_CREATE',
        categoria: 'COLLECTION_POINTS'
      },
      {
        nombre: 'Editar Punto de Recolección',
        descripcion: 'Permite editar puntos de recolección existentes',
        codigo: 'COLLECTION_POINTS_EDIT',
        categoria: 'COLLECTION_POINTS'
      },
      {
        nombre: 'Eliminar Punto de Recolección',
        descripcion: 'Permite eliminar puntos de recolección',
        codigo: 'COLLECTION_POINTS_DELETE',
        categoria: 'COLLECTION_POINTS'
      }
    ];

    // Crear roles básicos con sus descripciones actualizadas
    const roles = [
      {
        nombre: 'ADMINISTRADOR',
        descripcion: 'Acceso total al sistema con todos los permisos'
      },
      {
        nombre: 'TECNICO',
        descripcion: 'Acceso a tickets y reparaciones asignadas'
      },
      {
        nombre: 'ATENCION_CLIENTE',
        descripcion: 'Acceso a tickets y puntos de recolección'
      }
    ];

    // Crear permisos
    for (const permiso of permisos) {
      await prisma.permiso.upsert({
        where: { codigo: permiso.codigo },
        update: {},
        create: permiso
      });
    }

    // Crear roles y asignar permisos
    for (const rol of roles) {
      const rolCreado = await prisma.rol.upsert({
        where: { nombre: rol.nombre },
        update: {},
        create: rol
      });

      // Asignar permisos según el rol
      if (rol.nombre === 'ADMINISTRADOR') {
        // El administrador tiene todos los permisos
        const todosLosPermisos = await prisma.permiso.findMany();
        for (const permiso of todosLosPermisos) {
          await prisma.rolPermiso.upsert({
            where: {
              rolId_permisoId: {
                rolId: rolCreado.id,
                permisoId: permiso.id
              }
            },
            update: {},
            create: {
              rolId: rolCreado.id,
              permisoId: permiso.id
            }
          });
        }
      } else if (rol.nombre === 'TECNICO') {
        // El técnico solo puede ver y gestionar tickets y reparaciones asignadas
        const permisosTecnico = await prisma.permiso.findMany({
          where: {
            OR: [
              { codigo: 'TICKETS_VIEW' },
              { codigo: 'TICKETS_VIEW_DETAIL' },
              { codigo: 'REPAIRS_VIEW' },
              { codigo: 'REPAIRS_EDIT' }
            ]
          }
        });
        for (const permiso of permisosTecnico) {
          await prisma.rolPermiso.upsert({
            where: {
              rolId_permisoId: {
                rolId: rolCreado.id,
                permisoId: permiso.id
              }
            },
            update: {},
            create: {
              rolId: rolCreado.id,
              permisoId: permiso.id
            }
          });
        }
      } else if (rol.nombre === 'ATENCION_CLIENTE') {
        // El personal de atención al cliente puede ver tickets y puntos de recolección
        const permisosAtencionCliente = await prisma.permiso.findMany({
          where: {
            OR: [
              { codigo: 'TICKETS_VIEW' },
              { codigo: 'TICKETS_VIEW_DETAIL' },
              { codigo: 'COLLECTION_POINTS_VIEW' },
              { codigo: 'CLIENTS_VIEW' }
            ]
          }
        });
        for (const permiso of permisosAtencionCliente) {
          await prisma.rolPermiso.upsert({
            where: {
              rolId_permisoId: {
                rolId: rolCreado.id,
                permisoId: permiso.id
              }
            },
            update: {},
            create: {
              rolId: rolCreado.id,
              permisoId: permiso.id
            }
          });
        }
      }
    }

    // Crear usuario administrador
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.usuario.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        nombre: 'Administrador',
        apellidoPaterno: 'Admin',
        apellidoMaterno: '',
        passwordHash: adminPassword,
        activo: true,
        roles: {
          create: {
            rol: {
              connect: {
                nombre: 'ADMINISTRADOR'
              }
            }
          }
        }
      }
    });

    console.log('Usuario administrador creado:', admin.email);

    // Buscar el rol de administrador
    const adminRole = await prisma.rol.findUnique({ where: { nombre: 'ADMINISTRADOR' } });
    if (!adminRole) throw new Error('No se encontró el rol ADMINISTRADOR');

    const passwordSergio = await bcrypt.hash('whoS5un0%', 10);
    await prisma.usuario.upsert({
      where: { email: 'sergio@hoom.mx' },
      update: {
        nombre: 'Sergio',
        apellidoPaterno: 'Velazco',
        apellidoMaterno: '',
        passwordHash: passwordSergio,
        activo: true,
        roles: {
          deleteMany: {},
          create: {
            rolId: adminRole.id
          }
        }
      },
      create: {
        nombre: 'Sergio',
        apellidoPaterno: 'Velazco',
        apellidoMaterno: '',
        email: 'sergio@hoom.mx',
        passwordHash: passwordSergio,
        activo: true,
        roles: {
          create: {
            rolId: adminRole.id
          }
        }
      }
    });
    console.log('Usuario Sergio Velazco creado/actualizado: sergio@hoom.mx');

    // Crear usuario técnico
    const tecnicoPassword = await bcrypt.hash('tecnico123', 10);
    const tecnico = await prisma.usuario.upsert({
      where: { email: 'tecnico@example.com' },
      update: {},
      create: {
        email: 'tecnico@example.com',
        nombre: 'Técnico',
        apellidoPaterno: 'Técnico',
        apellidoMaterno: '',
        passwordHash: tecnicoPassword,
        activo: true,
        roles: {
          create: {
            rol: {
              connect: {
                nombre: 'TECNICO'
              }
            }
          }
        }
      }
    });

    console.log('Usuario técnico creado:', tecnico.email);

    // Crear usuario de atención al cliente
    const atencionClientePassword = await bcrypt.hash('atencion123', 10);
    const atencionCliente = await prisma.usuario.upsert({
      where: { email: 'atencion@example.com' },
      update: {},
      create: {
        email: 'atencion@example.com',
        nombre: 'Atención al Cliente',
        apellidoPaterno: 'Cliente',
        apellidoMaterno: '',
        passwordHash: atencionClientePassword,
        activo: true,
        roles: {
          create: {
            rol: {
              connect: {
                nombre: 'ATENCION_CLIENTE'
              }
            }
          }
        }
      }
    });

    console.log('Usuario de atención al cliente creado:', atencionCliente.email);

    // Crear estados de reparación si no existen
    const estadosReparacion = [
      { nombre: 'Recibido', descripcion: 'El dispositivo ha sido recibido y está pendiente de diagnóstico', orden: 1 },
      { nombre: 'En Diagnóstico', descripcion: 'El dispositivo está siendo diagnosticado', orden: 2 },
      { nombre: 'Diagnóstico Completado', descripcion: 'El diagnóstico ha sido completado', orden: 3 },
      { nombre: 'En Reparación', descripcion: 'El dispositivo está siendo reparado', orden: 4 },
      { nombre: 'Reparación Completada', descripcion: 'La reparación ha sido completada', orden: 5 },
      { nombre: 'Listo para Entrega', descripcion: 'El dispositivo está listo para ser entregado', orden: 6 },
      { nombre: 'Entregado', descripcion: 'El dispositivo ha sido entregado al cliente', orden: 7 },
      { nombre: 'Cancelado', descripcion: 'El ticket ha sido cancelado', orden: 8 },
    ];

    for (const estado of estadosReparacion) {
      await prisma.estatusReparacion.upsert({
        where: { nombre: estado.nombre },
        update: {},
        create: {
          ...estado,
          updatedAt: new Date(),
        },
      });
    }

    console.log('Estados de reparación creados');

    // Crear marcas
    const marcas = [
      { nombre: 'Apple' },
      { nombre: 'Samsung' },
      { nombre: 'Xiaomi' },
      { nombre: 'Huawei' },
      { nombre: 'Motorola' },
      { nombre: 'LG' },
      { nombre: 'Sony' },
      { nombre: 'OnePlus' },
      { nombre: 'Google' }
    ];

    console.log('Creando marcas...');
    const marcasCreadas = await Promise.all(
      marcas.map(marca => 
        prisma.marca.upsert({
          where: { nombre: marca.nombre },
          update: {},
          create: marca
        })
      )
    );

    // Crear modelos
    const modelos = [
      { nombre: 'iPhone 15 Pro', marcaNombre: 'Apple' },
      { nombre: 'iPhone 15', marcaNombre: 'Apple' },
      { nombre: 'iPhone 14 Pro', marcaNombre: 'Apple' },
      { nombre: 'iPhone 14', marcaNombre: 'Apple' },
      { nombre: 'Galaxy S24 Ultra', marcaNombre: 'Samsung' },
      { nombre: 'Galaxy S24+', marcaNombre: 'Samsung' },
      { nombre: 'Galaxy S24', marcaNombre: 'Samsung' },
      { nombre: 'Galaxy Z Fold 5', marcaNombre: 'Samsung' },
      { nombre: 'Galaxy Z Flip 5', marcaNombre: 'Samsung' },
      { nombre: 'Xiaomi 14 Ultra', marcaNombre: 'Xiaomi' },
      { nombre: 'Xiaomi 14 Pro', marcaNombre: 'Xiaomi' },
      { nombre: 'Xiaomi 14', marcaNombre: 'Xiaomi' },
      { nombre: 'P60 Pro', marcaNombre: 'Huawei' },
      { nombre: 'P60', marcaNombre: 'Huawei' },
      { nombre: 'Mate 60 Pro', marcaNombre: 'Huawei' },
      { nombre: 'Edge 40 Pro', marcaNombre: 'Motorola' },
      { nombre: 'Edge 40', marcaNombre: 'Motorola' },
      { nombre: 'G8', marcaNombre: 'LG' },
      { nombre: 'V60', marcaNombre: 'LG' },
      { nombre: 'Xperia 1 V', marcaNombre: 'Sony' },
      { nombre: 'Xperia 5 V', marcaNombre: 'Sony' },
      { nombre: 'OnePlus 12', marcaNombre: 'OnePlus' },
      { nombre: 'OnePlus Open', marcaNombre: 'OnePlus' },
      { nombre: 'Pixel 8 Pro', marcaNombre: 'Google' },
      { nombre: 'Pixel 8', marcaNombre: 'Google' }
    ];

    console.log('Creando modelos...');
    for (const modelo of modelos) {
      const marca = marcasCreadas.find(m => m.nombre === modelo.marcaNombre);
      if (marca) {
        await prisma.modelo.upsert({
          where: { 
            id: -1 // Forzar creación ya que no tenemos una clave única compuesta
          },
          update: {},
          create: {
            nombre: modelo.nombre,
            marcaId: marca.id
          }
        });
      }
    }

    console.log('Seed completado exitosamente');
  } catch (error) {
    console.error('Error durante el seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 