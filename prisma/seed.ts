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

    // === PERMISOS DEL SISTEMA ===
    const permisosSistema = [
      // Dashboard
      { codigo: 'DASHBOARD_VIEW', nombre: 'Ver Dashboard', descripcion: 'Permite ver el dashboard principal', categoria: 'DASHBOARD' },

      // Costos
      { codigo: 'COSTS_VIEW', nombre: 'Ver Costos', descripcion: 'Permite ver la sección de costos', categoria: 'COSTS' },
      { codigo: 'COSTS_EDIT', nombre: 'Editar Costos', descripcion: 'Permite editar información de costos', categoria: 'COSTS' },

      // Catálogo
      { codigo: 'CATALOG_VIEW', nombre: 'Ver Catálogo', descripcion: 'Permite ver el catálogo', categoria: 'CATALOG' },
      { codigo: 'CATALOG_CREATE', nombre: 'Crear Catálogo', descripcion: 'Permite crear elementos en el catálogo', categoria: 'CATALOG' },
      { codigo: 'CATALOG_EDIT', nombre: 'Editar Catálogo', descripcion: 'Permite editar elementos del catálogo', categoria: 'CATALOG' },
      { codigo: 'CATALOG_DELETE', nombre: 'Eliminar Catálogo', descripcion: 'Permite eliminar elementos del catálogo', categoria: 'CATALOG' },

      // Inventario
      { codigo: 'INVENTORY_VIEW', nombre: 'Ver Inventario', descripcion: 'Permite ver el inventario', categoria: 'INVENTORY' },
      { codigo: 'INVENTORY_CREATE', nombre: 'Crear Inventario', descripcion: 'Permite crear elementos en el inventario', categoria: 'INVENTORY' },
      { codigo: 'INVENTORY_EDIT', nombre: 'Editar Inventario', descripcion: 'Permite editar elementos del inventario', categoria: 'INVENTORY' },
      { codigo: 'INVENTORY_DELETE', nombre: 'Eliminar Inventario', descripcion: 'Permite eliminar elementos del inventario', categoria: 'INVENTORY' },

      // Clientes
      { codigo: 'CLIENTS_VIEW', nombre: 'Ver Clientes', descripcion: 'Permite ver la lista de clientes', categoria: 'CLIENTS' },
      { codigo: 'CLIENTS_CREATE', nombre: 'Crear Cliente', descripcion: 'Permite crear nuevos clientes', categoria: 'CLIENTS' },
      { codigo: 'CLIENTS_EDIT', nombre: 'Editar Cliente', descripcion: 'Permite editar clientes existentes', categoria: 'CLIENTS' },
      { codigo: 'CLIENTS_DELETE', nombre: 'Eliminar Cliente', descripcion: 'Permite eliminar clientes', categoria: 'CLIENTS' },

      // Tickets
      { codigo: 'TICKETS_VIEW', nombre: 'Ver Tickets', descripcion: 'Permite ver la lista de tickets', categoria: 'TICKETS' },
      { codigo: 'TICKETS_VIEW_DETAIL', nombre: 'Ver Detalle de Ticket', descripcion: 'Permite ver el detalle de un ticket', categoria: 'TICKETS' },
      { codigo: 'TICKETS_CREATE', nombre: 'Crear Ticket', descripcion: 'Permite crear nuevos tickets', categoria: 'TICKETS' },
      { codigo: 'TICKETS_EDIT', nombre: 'Editar Ticket', descripcion: 'Permite editar tickets existentes', categoria: 'TICKETS' },
      { codigo: 'TICKETS_DELETE', nombre: 'Eliminar Ticket', descripcion: 'Permite eliminar tickets', categoria: 'TICKETS' },
      { codigo: 'TICKETS_ASSIGN', nombre: 'Asignar Ticket', descripcion: 'Permite asignar tickets a técnicos', categoria: 'TICKETS' },

      // Reparaciones
      { codigo: 'REPAIRS_VIEW', nombre: 'Ver Reparaciones', descripcion: 'Permite ver las reparaciones', categoria: 'REPAIRS' },
      { codigo: 'REPAIRS_CREATE', nombre: 'Crear Reparación', descripcion: 'Permite crear nuevas reparaciones', categoria: 'REPAIRS' },
      { codigo: 'REPAIRS_EDIT', nombre: 'Editar Reparación', descripcion: 'Permite editar reparaciones existentes', categoria: 'REPAIRS' },
      { codigo: 'REPAIRS_DELETE', nombre: 'Eliminar Reparación', descripcion: 'Permite eliminar reparaciones', categoria: 'REPAIRS' },

      // Usuarios
      { codigo: 'USERS_VIEW', nombre: 'Ver Usuarios', descripcion: 'Permite ver la lista de usuarios', categoria: 'USERS' },
      { codigo: 'USERS_CREATE', nombre: 'Crear Usuario', descripcion: 'Permite crear nuevos usuarios', categoria: 'USERS' },
      { codigo: 'USERS_EDIT', nombre: 'Editar Usuario', descripcion: 'Permite editar usuarios existentes', categoria: 'USERS' },
      { codigo: 'USERS_DELETE', nombre: 'Eliminar Usuario', descripcion: 'Permite eliminar usuarios', categoria: 'USERS' },

      // Roles
      { codigo: 'ROLES_VIEW', nombre: 'Ver Roles', descripcion: 'Permite ver la lista de roles', categoria: 'ROLES' },
      { codigo: 'ROLES_CREATE', nombre: 'Crear Rol', descripcion: 'Permite crear nuevos roles', categoria: 'ROLES' },
      { codigo: 'ROLES_EDIT', nombre: 'Editar Rol', descripcion: 'Permite editar roles existentes', categoria: 'ROLES' },
      { codigo: 'ROLES_DELETE', nombre: 'Eliminar Rol', descripcion: 'Permite eliminar roles', categoria: 'ROLES' },

      // Permisos
      { codigo: 'PERMISSIONS_VIEW', nombre: 'Ver Permisos', descripcion: 'Permite ver la lista de permisos', categoria: 'PERMISSIONS' },

      // Puntos de Recolección
      { codigo: 'COLLECTION_POINTS_VIEW', nombre: 'Ver Puntos de Recolección', descripcion: 'Permite ver los puntos de recolección', categoria: 'COLLECTION_POINTS' },
      { codigo: 'COLLECTION_POINTS_CREATE', nombre: 'Crear Punto de Recolección', descripcion: 'Permite crear nuevos puntos de recolección', categoria: 'COLLECTION_POINTS' },
      { codigo: 'COLLECTION_POINTS_EDIT', nombre: 'Editar Punto de Recolección', descripcion: 'Permite editar puntos de recolección existentes', categoria: 'COLLECTION_POINTS' },
      { codigo: 'COLLECTION_POINTS_DELETE', nombre: 'Eliminar Punto de Recolección', descripcion: 'Permite eliminar puntos de recolección', categoria: 'COLLECTION_POINTS' },
    ];

    // Crear todos los permisos
    for (const permiso of permisosSistema) {
      await prisma.permiso.upsert({
        where: { codigo: permiso.codigo },
        update: {},
        create: permiso
      });
    }

    // Obtener el rol ADMINISTRADOR
    const adminRole = await prisma.rol.upsert({
      where: { nombre: 'ADMINISTRADOR' },
      update: {},
      create: {
        nombre: 'ADMINISTRADOR',
        descripcion: 'Acceso total al sistema con todos los permisos'
      }
    });

    // Asignar todos los permisos al rol ADMINISTRADOR
    const todosLosPermisos = await prisma.permiso.findMany();
    for (const permiso of todosLosPermisos) {
      await prisma.rolPermiso.upsert({
        where: {
          rolId_permisoId: {
            rolId: adminRole.id,
            permisoId: permiso.id
          }
        },
        update: {},
        create: {
          rolId: adminRole.id,
          permisoId: permiso.id
        }
      });
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
      }
    });
    console.log('Usuario administrador creado:', admin.email);

    // Asignar rol al usuario admin
    await prisma.usuarioRol.create({
      data: {
        usuarioId: admin.id,
        rolId: adminRole.id
      }
    });

    // Crear usuario Sergio Velazco
    const passwordSergio = await bcrypt.hash('whoS5un0%', 10);
    const sergio = await prisma.usuario.upsert({
      where: { email: 'sergio@hoom.mx' },
      update: {
        nombre: 'Sergio',
        apellidoPaterno: 'Velazco',
        apellidoMaterno: '',
        passwordHash: passwordSergio,
        activo: true,
      },
      create: {
        nombre: 'Sergio',
        apellidoPaterno: 'Velazco',
        apellidoMaterno: '',
        email: 'sergio@hoom.mx',
        passwordHash: passwordSergio,
        activo: true,
      }
    });
    // Asignar rol a Sergio
    await prisma.usuarioRol.create({
      data: {
        usuarioId: sergio.id,
        rolId: adminRole.id
      }
    });
    console.log('Usuario Sergio Velazco creado/actualizado: sergio@hoom.mx');

    // Crear usuario técnico
    const tecnicoPassword = await bcrypt.hash('tecnico123', 10);
    const tecnicoRol = await prisma.rol.findUnique({ where: { nombre: 'TECNICO' } });
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
      }
    });
    if (tecnicoRol) {
      await prisma.usuarioRol.create({
        data: {
          usuarioId: tecnico.id,
          rolId: tecnicoRol.id
        }
      });
    }
    console.log('Usuario técnico creado:', tecnico.email);

    // Crear usuario de atención al cliente
    const atencionClientePassword = await bcrypt.hash('atencion123', 10);
    const atencionRol = await prisma.rol.findUnique({ where: { nombre: 'ATENCION_CLIENTE' } });
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
      }
    });
    if (atencionRol) {
      await prisma.usuarioRol.create({
        data: {
          usuarioId: atencionCliente.id,
          rolId: atencionRol.id
        }
      });
    }
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

    // Permisos específicos para puntos de reparación
    const permisosPuntoReparacion = [
      {
        codigo: 'PUNTO_USERS_VIEW',
        nombre: 'Ver Usuarios del Punto',
        descripcion: 'Permite ver los usuarios asociados al punto de reparación',
        categoria: 'Punto de Reparación'
      },
      {
        codigo: 'PUNTO_USERS_CREATE',
        nombre: 'Crear Usuarios del Punto',
        descripcion: 'Permite crear nuevos usuarios en el punto de reparación',
        categoria: 'Punto de Reparación'
      },
      {
        codigo: 'PUNTO_USERS_EDIT',
        nombre: 'Editar Usuarios del Punto',
        descripcion: 'Permite editar usuarios del punto de reparación',
        categoria: 'Punto de Reparación'
      },
      {
        codigo: 'PUNTO_USERS_DELETE',
        nombre: 'Eliminar Usuarios del Punto',
        descripcion: 'Permite eliminar usuarios del punto de reparación',
        categoria: 'Punto de Reparación'
      },
      {
        codigo: 'PUNTO_TICKETS_VIEW',
        nombre: 'Ver Tickets del Punto',
        descripcion: 'Permite ver los tickets del punto de reparación',
        categoria: 'Punto de Reparación'
      },
      {
        codigo: 'PUNTO_TICKETS_CREATE',
        nombre: 'Crear Tickets del Punto',
        descripcion: 'Permite crear tickets en el punto de reparación',
        categoria: 'Punto de Reparación'
      },
      {
        codigo: 'PUNTO_TICKETS_EDIT',
        nombre: 'Editar Tickets del Punto',
        descripcion: 'Permite editar tickets del punto de reparación',
        categoria: 'Punto de Reparación'
      },
      {
        codigo: 'PUNTO_TICKETS_DELETE',
        nombre: 'Eliminar Tickets del Punto',
        descripcion: 'Permite eliminar tickets del punto de reparación',
        categoria: 'Punto de Reparación'
      }
    ];

    // Roles específicos para puntos de reparación
    const rolesPuntoReparacion = [
      {
        nombre: 'ADMINISTRADOR_PUNTO',
        descripcion: 'Administrador del punto de reparación',
        permisos: [
          'PUNTO_USERS_VIEW',
          'PUNTO_USERS_CREATE',
          'PUNTO_USERS_EDIT',
          'PUNTO_USERS_DELETE',
          'PUNTO_TICKETS_VIEW',
          'PUNTO_TICKETS_CREATE',
          'PUNTO_TICKETS_EDIT',
          'PUNTO_TICKETS_DELETE'
        ]
      },
      {
        nombre: 'OPERADOR_PUNTO',
        descripcion: 'Operador del punto de reparación',
        permisos: [
          'PUNTO_TICKETS_VIEW',
          'PUNTO_TICKETS_CREATE',
          'PUNTO_TICKETS_EDIT'
        ]
      }
    ];

    // Crear permisos de punto de reparación
    console.log('Creando permisos de punto de reparación...');
    for (const permiso of permisosPuntoReparacion) {
      await prisma.permiso.create({
        data: permiso
      });
    }

    // Crear roles de punto de reparación
    console.log('Creando roles de punto de reparación...');
    for (const rol of rolesPuntoReparacion) {
      const rolCreado = await prisma.rol.create({
        data: {
          nombre: rol.nombre,
          descripcion: rol.descripcion
        }
      });

      // Asignar permisos al rol
      for (const codigoPermiso of rol.permisos) {
        const permiso = await prisma.permiso.findUnique({
          where: { codigo: codigoPermiso }
        });
        if (permiso) {
          await prisma.rolPermiso.create({
            data: {
              rolId: rolCreado.id,
              permisoId: permiso.id
            }
          });
        }
      }
    }

    // Crear tipos de servicio
    const tiposServicio = [
      {
        nombre: 'Reparación de Pantalla',
        descripcion: 'Servicio de reparación o reemplazo de pantallas de dispositivos móviles'
      },
      {
        nombre: 'Cambio de Batería',
        descripcion: 'Servicio de reemplazo de baterías en dispositivos móviles'
      },
      {
        nombre: 'Reparación de Cámara',
        descripcion: 'Servicio de reparación o reemplazo de cámaras en dispositivos móviles'
      },
      {
        nombre: 'Reparación de Placa',
        descripcion: 'Servicio de reparación de placas base en dispositivos móviles'
      },
      {
        nombre: 'Desbloqueo',
        descripcion: 'Servicio de desbloqueo de dispositivos móviles'
      }
    ];

    for (const tipo of tiposServicio) {
      await prisma.tipoServicio.upsert({
        where: { nombre: tipo.nombre },
        update: {},
        create: tipo
      });
    }

    console.log('Tipos de servicio creados exitosamente');

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