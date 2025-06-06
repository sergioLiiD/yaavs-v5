import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

// Agregar manejador de errores para la conexión
pool.on('error', (err) => {
  console.error('Error inesperado en la conexión a la base de datos:', err);
});

// Función para probar la conexión
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Conexión a la base de datos exitosa');
    client.release();
    return true;
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    return false;
  }
}

export async function getAllPrecios() {
  return db.precioVenta.findMany({
    orderBy: {
      created_at: 'desc'
    }
  });
}

export async function getPrecioById(id: string) {
  return db.precioVenta.findUnique({
    where: { id }
  });
}

export async function createPrecio(precio: any) {
  return db.precioVenta.create({
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
  return db.precioVenta.update({
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
  return db.precioVenta.findMany({
    where: {
      precio_venta: 0
    },
    orderBy: {
      created_at: 'desc'
    }
  });
}

export async function searchPrecios(query: string) {
  return db.precioVenta.findMany({
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
  return db.precioVenta.findMany({
    where: { tipo },
    orderBy: {
      created_at: 'desc'
    }
  });
} 