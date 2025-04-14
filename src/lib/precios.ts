import { db } from './db';

export async function getAllPrecios() {
  const result = await db.query(
    'SELECT * FROM precio_venta ORDER BY created_at DESC'
  );
  return result.rows;
}

export async function getPrecioById(id: string) {
  const result = await db.query(
    'SELECT * FROM precio_venta WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

export async function createPrecio(precio: any) {
  const result = await db.query(
    `INSERT INTO precio_venta 
     (tipo, nombre, marca, modelo, precio_compra_promedio, precio_venta, 
      producto_id, servicio_id, created_by, updated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      precio.tipo,
      precio.nombre,
      precio.marca,
      precio.modelo,
      precio.precio_compra_promedio,
      precio.precio_venta,
      precio.producto_id || null,
      precio.servicio_id || null,
      'system',
      'system'
    ]
  );
  return result.rows[0];
}

export async function updatePrecio(precio: any) {
  const result = await db.query(
    `UPDATE precio_venta 
     SET tipo = $1, nombre = $2, marca = $3, modelo = $4,
         precio_compra_promedio = $5, precio_venta = $6,
         producto_id = $7, servicio_id = $8, updated_by = $9
     WHERE id = $10
     RETURNING *`,
    [
      precio.tipo,
      precio.nombre,
      precio.marca,
      precio.modelo,
      precio.precio_compra_promedio,
      precio.precio_venta,
      precio.producto_id || null,
      precio.servicio_id || null,
      'system',
      precio.id
    ]
  );
  return result.rows[0];
}

export async function getPreciosSinVenta() {
  const result = await db.query(
    'SELECT * FROM precio_venta WHERE precio_venta = 0 ORDER BY created_at DESC'
  );
  return result.rows;
}

export async function searchPrecios(query: string) {
  const result = await db.query(
    `SELECT * FROM precio_venta 
     WHERE LOWER(nombre) LIKE LOWER($1) 
     OR LOWER(marca) LIKE LOWER($1) 
     OR LOWER(modelo) LIKE LOWER($1)
     ORDER BY created_at DESC`,
    [`%${query}%`]
  );
  return result.rows;
}

export async function getPreciosByTipo(tipo: 'PRODUCTO' | 'SERVICIO') {
  const result = await db.query(
    'SELECT * FROM precio_venta WHERE tipo = $1 ORDER BY created_at DESC',
    [tipo]
  );
  return result.rows;
} 