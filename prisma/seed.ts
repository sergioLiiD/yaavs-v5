import { PrismaClient } from '@prisma/client';

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
        },
      }),
    ]);
    console.log('Proveedores creados:', proveedores.length);

    // Crear marcas
    const apple = await prisma.marca.create({
      data: {
        nombre: 'Apple',
        descripcion: 'Productos Apple',
      },
    });

    const samsung = await prisma.marca.create({
      data: {
        nombre: 'Samsung',
        descripcion: 'Productos Samsung',
      },
    });
    console.log('Marcas creadas');

    // Crear modelos
    const iphone16Pro = await prisma.modelo.create({
      data: {
        nombre: 'iPhone 16 Pro',
        descripcion: 'iPhone 16 Pro - 2024',
        marcaId: apple.id,
      },
    });

    const galaxyS24 = await prisma.modelo.create({
      data: {
        nombre: 'Galaxy S24',
        descripcion: 'Samsung Galaxy S24 - 2024',
        marcaId: samsung.id,
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
      },
    ];

    const piezas = await Promise.all(
      piezasData.map(pieza => prisma.pieza.create({ data: pieza }))
    );
    console.log('Piezas creadas:', piezas.length);

    console.log('Datos de ejemplo creados exitosamente');
  } catch (error) {
    console.error('Error en el seed:', error);
    throw error;
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