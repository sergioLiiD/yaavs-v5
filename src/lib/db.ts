import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAllPrecios() {
  return prisma.precioVenta.findMany({
    orderBy: {
      created_at: 'desc'
    }
  });
}

export async function getPrecioById(id: string) {
  return prisma.precioVenta.findUnique({
    where: { id }
  });
}

export async function createPrecio(precio: any) {
  return prisma.precioVenta.create({
    data: {
      tipo: precio.tipo,
      nombre: precio.nombre,
      marca: precio.marca,
      modelo: precio.modelo,
      precio_compra_promedio: precio.precio_compra_promedio,
      precio_venta: precio.precio_venta,
      producto_id: precio.producto_id || null,
      servicio_id: precio.servicio_id || null,
      created_by: 'system',
      updated_by: 'system'
    }
  });
}

export async function updatePrecio(precio: any) {
  return prisma.precioVenta.update({
    where: { id: precio.id },
    data: {
      tipo: precio.tipo,
      nombre: precio.nombre,
      marca: precio.marca,
      modelo: precio.modelo,
      precio_compra_promedio: precio.precio_compra_promedio,
      precio_venta: precio.precio_venta,
      producto_id: precio.producto_id || null,
      servicio_id: precio.servicio_id || null,
      updated_by: 'system'
    }
  });
}

export async function getPreciosSinVenta() {
  return prisma.precioVenta.findMany({
    where: {
      precio_venta: 0
    },
    orderBy: {
      created_at: 'desc'
    }
  });
}

export async function searchPrecios(query: string) {
  return prisma.precioVenta.findMany({
    where: {
      OR: [
        { nombre: { contains: query, mode: 'insensitive' } },
        { marca: { contains: query, mode: 'insensitive' } },
        { modelo: { contains: query, mode: 'insensitive' } }
      ]
    },
    orderBy: {
      created_at: 'desc'
    }
  });
}

export async function getPreciosByTipo(tipo: 'PRODUCTO' | 'SERVICIO') {
  return prisma.precioVenta.findMany({
    where: { tipo },
    orderBy: {
      created_at: 'desc'
    }
  });
} 