import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProductos() {
  try {
    const productos = await prisma.producto.findMany({
      where: {
        nombre: {
          contains: 'Pantalla iPhone 16',
          mode: 'insensitive'
        }
      },
      include: {
        marca: true,
        modelo: true,
        proveedor: true,
        inventarioMinimo: true
      }
    });

    console.log('Productos encontrados:', JSON.stringify(productos, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductos(); 