import { PrismaClient, NivelUsuario } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de la base de datos...');

  try {
    // Primero eliminar registros en orden inverso de dependencias
    console.log('Eliminando registros existentes...');
    const tablesToTruncate = [
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
        await prisma.$executeRaw`TRUNCATE TABLE "${table}" CASCADE`;
        console.log(`Tabla ${table} truncada exitosamente`);
      } catch (error) {
        console.warn(`Advertencia al truncar ${table}:`, error);
        // Continuamos con la siguiente tabla
      }
    }

    console.log('Datos existentes eliminados');

    // Crear proveedores
    const proveedores = await Promise.all([
      prisma.proveedor.create({
        data: {
          nombre: 'Proveedor 1',
          email: 'proveedor1@example.com',
          telefono: '1234567890',
          direccion: 'Dirección 1',
          contacto: 'Contacto 1',
          banco: 'Banco 1',
          clabeInterbancaria: '123456789012345678',
          cuentaBancaria: '1234567890',
          rfc: 'XAXX010101000',
          notas: 'Notas del proveedor 1',
          createdAt: new Date(),
          updatedAt: new Date()
        },
      }),
      prisma.proveedor.create({
        data: {
          nombre: 'Proveedor 2',
          email: 'proveedor2@example.com',
          telefono: '0987654321',
          direccion: 'Dirección 2',
          contacto: 'Contacto 2',
          banco: 'Banco 2',
          clabeInterbancaria: '098765432109876543',
          cuentaBancaria: '0987654321',
          rfc: 'XAXX010101001',
          notas: 'Notas del proveedor 2',
          createdAt: new Date(),
          updatedAt: new Date()
        },
      }),
    ]);
    console.log('Proveedores creados:', proveedores.length);

    // Crear marcas
    const apple = await prisma.marca.create({
      data: {
        nombre: 'Apple',
        descripcion: 'Productos Apple',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    });

    const samsung = await prisma.marca.create({
      data: {
        nombre: 'Samsung',
        descripcion: 'Productos Samsung',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    });
    console.log('Marcas creadas');

    // Crear modelos
    const iphone16Pro = await prisma.modelo.create({
      data: {
        nombre: 'iPhone 16 Pro',
        descripcion: 'iPhone 16 Pro - 2024',
        marcaId: apple.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    });

    const galaxyS24 = await prisma.modelo.create({
      data: {
        nombre: 'Galaxy S24',
        descripcion: 'Samsung Galaxy S24 - 2024',
        marcaId: samsung.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    });
    console.log('Modelos creados');

    // Crear piezas
    const piezasData = [
      {
        nombre: 'Pantalla iPhone 16 Pro',
        descripcion: 'Pantalla OLED para iPhone 16 Pro',
        sku: 'IP16P-SCREEN',
        cantidad: 5,
        precioCompra: 199.99,
        precioVenta: 299.99,
        unidadMedida: 'pieza',
        ubicacion: 'A1',
        marcaId: apple.id,
        modeloId: iphone16Pro.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Batería iPhone 16 Pro',
        descripcion: 'Batería original para iPhone 16 Pro',
        sku: 'IP16P-BAT',
        cantidad: 10,
        precioCompra: 49.99,
        precioVenta: 89.99,
        unidadMedida: 'pieza',
        ubicacion: 'B1',
        marcaId: apple.id,
        modeloId: iphone16Pro.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Pantalla Galaxy S24',
        descripcion: 'Pantalla AMOLED para Galaxy S24',
        sku: 'GS24-SCREEN',
        cantidad: 5,
        precioCompra: 149.99,
        precioVenta: 249.99,
        unidadMedida: 'pieza',
        ubicacion: 'A2',
        marcaId: samsung.id,
        modeloId: galaxyS24.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Batería Galaxy S24',
        descripcion: 'Batería original para Galaxy S24',
        sku: 'GS24-BAT',
        cantidad: 8,
        precioCompra: 39.99,
        precioVenta: 79.99,
        unidadMedida: 'pieza',
        ubicacion: 'B2',
        marcaId: samsung.id,
        modeloId: galaxyS24.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    const piezas = await Promise.all(
      piezasData.map(pieza => prisma.piezas.create({ data: pieza }))
    );
    console.log('Piezas creadas:', piezas.length);

    // Crear usuario administrador
    const passwordHash = await bcrypt.hash('whoSuno%', 10);
    const admin = await prisma.usuario.create({
      data: {
        email: 'sergio@hoom.mx',
        nombre: 'Sergio',
        apellidoPaterno: 'Velazco',
        passwordHash,
        nivel: NivelUsuario.ADMINISTRADOR,
        activo: true,
        updatedAt: new Date()
      }
    });

    console.log('Usuario administrador creado:', admin);

    // Crear estados de reparación por defecto
    const estadosReparacion = [
      {
        nombre: 'Recibido',
        descripcion: 'El dispositivo ha sido recibido y está pendiente de diagnóstico',
        orden: 1,
        color: '#FFA500',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'En Diagnóstico',
        descripcion: 'El dispositivo está siendo diagnosticado',
        orden: 2,
        color: '#FFD700',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Diagnóstico Completado',
        descripcion: 'El diagnóstico ha sido completado y se ha generado el presupuesto',
        orden: 3,
        color: '#87CEEB',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Diagnóstico Pendiente',
        descripcion: 'El diagnóstico está pendiente de aprobación del cliente',
        orden: 4,
        color: '#FFB6C1',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Diagnóstico Aprobado',
        descripcion: 'El cliente ha aprobado el diagnóstico',
        orden: 5,
        color: '#98FB98',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Presupuesto Aprobado',
        descripcion: 'El cliente ha aprobado el presupuesto',
        orden: 6,
        color: '#90EE90',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'En Reparación',
        descripcion: 'El dispositivo está siendo reparado',
        orden: 7,
        color: '#FF69B4',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Reparación Completada',
        descripcion: 'La reparación ha sido completada',
        orden: 8,
        color: '#00FF00',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Listo para Entrega',
        descripcion: 'El dispositivo está listo para ser entregado al cliente',
        orden: 9,
        color: '#008000',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Entregado',
        descripcion: 'El dispositivo ha sido entregado al cliente',
        orden: 10,
        color: '#006400',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Cancelado',
        descripcion: 'El ticket ha sido cancelado',
        orden: 11,
        color: '#FF0000',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    console.log('Creando estados de reparación...');
    
    // Usar upsert para cada estado para evitar duplicados
    for (const estado of estadosReparacion) {
      await prisma.estatusReparacion.upsert({
        where: { nombre: estado.nombre },
        update: estado,
        create: estado
      });
    }

    console.log('Estados de reparación creados exitosamente');

    // Crear el estado "Presupuesto Generado"
    const presupuestoGenerado = await prisma.estatusReparacion.upsert({
      where: { nombre: 'Presupuesto Generado' },
      update: {},
      create: {
        nombre: 'Presupuesto Generado',
        descripcion: 'El presupuesto ha sido generado y está pendiente de aprobación',
        orden: 3,
        color: '#FFA500',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    });

    console.log('Estado creado:', presupuestoGenerado);

    // Crear permisos base
    const permisos = [
      // Usuarios
      { codigo: 'usuarios.crear', nombre: 'Crear Usuarios', categoria: 'Usuarios', descripcion: 'Permite crear nuevos usuarios en el sistema' },
      { codigo: 'usuarios.leer', nombre: 'Ver Usuarios', categoria: 'Usuarios', descripcion: 'Permite ver la lista de usuarios' },
      { codigo: 'usuarios.actualizar', nombre: 'Actualizar Usuarios', categoria: 'Usuarios', descripcion: 'Permite modificar usuarios existentes' },
      { codigo: 'usuarios.eliminar', nombre: 'Eliminar Usuarios', categoria: 'Usuarios', descripcion: 'Permite eliminar usuarios' },
      
      // Tickets
      { codigo: 'tickets.crear', nombre: 'Crear Tickets', categoria: 'Tickets', descripcion: 'Permite crear nuevos tickets' },
      { codigo: 'tickets.leer', nombre: 'Ver Tickets', categoria: 'Tickets', descripcion: 'Permite ver la lista de tickets' },
      { codigo: 'tickets.actualizar', nombre: 'Actualizar Tickets', categoria: 'Tickets', descripcion: 'Permite modificar tickets existentes' },
      { codigo: 'tickets.eliminar', nombre: 'Eliminar Tickets', categoria: 'Tickets', descripcion: 'Permite eliminar tickets' },
      { codigo: 'tickets.aprobar', nombre: 'Aprobar Tickets', categoria: 'Tickets', descripcion: 'Permite aprobar tickets' },
      
      // Inventario
      { codigo: 'inventario.crear', nombre: 'Crear Productos', categoria: 'Inventario', descripcion: 'Permite crear nuevos productos' },
      { codigo: 'inventario.leer', nombre: 'Ver Inventario', categoria: 'Inventario', descripcion: 'Permite ver el inventario' },
      { codigo: 'inventario.actualizar', nombre: 'Actualizar Inventario', categoria: 'Inventario', descripcion: 'Permite modificar el inventario' },
      { codigo: 'inventario.eliminar', nombre: 'Eliminar Productos', categoria: 'Inventario', descripcion: 'Permite eliminar productos' },
      { codigo: 'inventario.exportar', nombre: 'Exportar Inventario', categoria: 'Inventario', descripcion: 'Permite exportar el inventario' },
      
      // Catálogos
      { codigo: 'catalogos.crear', nombre: 'Crear Catálogos', categoria: 'Catálogos', descripcion: 'Permite crear nuevos catálogos' },
      { codigo: 'catalogos.leer', nombre: 'Ver Catálogos', categoria: 'Catálogos', descripcion: 'Permite ver los catálogos' },
      { codigo: 'catalogos.actualizar', nombre: 'Actualizar Catálogos', categoria: 'Catálogos', descripcion: 'Permite modificar catálogos' },
      { codigo: 'catalogos.eliminar', nombre: 'Eliminar Catálogos', categoria: 'Catálogos', descripcion: 'Permite eliminar catálogos' },
    ];

    // Crear permisos en la base de datos
    for (const permiso of permisos) {
      await prisma.permiso.upsert({
        where: { codigo: permiso.codigo },
        update: permiso,
        create: permiso,
      });
    }

    // Crear roles predefinidos
    const roles = [
      {
        nombre: 'Administrador',
        descripcion: 'Acceso total al sistema',
        permisos: permisos.map(p => p.codigo), // Todos los permisos
      },
      {
        nombre: 'Gerente',
        descripcion: 'Acceso a la mayoría de las funciones excepto gestión de usuarios',
        permisos: permisos
          .filter(p => !p.codigo.startsWith('usuarios.'))
          .map(p => p.codigo),
      },
      {
        nombre: 'Técnico',
        descripcion: 'Acceso a tickets e inventario',
        permisos: permisos
          .filter(p => 
            p.codigo.startsWith('tickets.') || 
            p.codigo.startsWith('inventario.')
          )
          .map(p => p.codigo),
      },
      {
        nombre: 'Atención al Cliente',
        descripcion: 'Acceso básico a tickets',
        permisos: permisos
          .filter(p => 
            p.codigo === 'tickets.crear' ||
            p.codigo === 'tickets.leer'
          )
          .map(p => p.codigo),
      },
    ];

    // Crear roles y asignar permisos
    for (const rol of roles) {
      const { permisos: permisosRol, ...rolData } = rol;
      const rolCreado = await prisma.rol.upsert({
        where: { nombre: rolData.nombre },
        update: rolData,
        create: rolData,
      });

      // Asignar permisos al rol
      for (const codigoPermiso of permisosRol) {
        const permiso = await prisma.permiso.findUnique({
          where: { codigo: codigoPermiso },
        });
        if (permiso) {
          await prisma.rolPermiso.upsert({
            where: {
              rolId_permisoId: {
                rolId: rolCreado.id,
                permisoId: permiso.id,
              },
            },
            update: {},
            create: {
              rolId: rolCreado.id,
              permisoId: permiso.id,
            },
          });
        }
      }
    }

    // Crear usuario administrador por defecto si no existe
    const adminEmail = 'admin@hoom.mx';
    const adminExists = await prisma.usuario.findUnique({
      where: { email: adminEmail },
    });

    if (!adminExists) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      const admin = await prisma.usuario.create({
        data: {
          email: adminEmail,
          nombre: 'Administrador',
          apellidoPaterno: 'Sistema',
          passwordHash,
          nivel: 'ADMINISTRADOR',
          activo: true,
        },
      });

      // Asignar rol de administrador al usuario
      const rolAdmin = await prisma.rol.findUnique({
        where: { nombre: 'Administrador' },
      });

      if (rolAdmin) {
        await prisma.usuarioRol.create({
          data: {
            usuarioId: admin.id,
            rolId: rolAdmin.id,
          },
        });
      }
    }

    console.log('Datos de ejemplo creados exitosamente');
  } catch (error) {
    console.error('Error en el seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 