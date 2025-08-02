-- Script para migrar piezas a productos
-- Este script convierte las piezas existentes en productos y actualiza las referencias

-- 1. Insertar piezas como productos (solo las que no existan ya)
INSERT INTO productos (
    sku,
    nombre,
    descripcion,
    marca_id,
    modelo_id,
    stock,
    precio_promedio,
    tipo,
    created_at,
    updated_at
)
SELECT 
    CONCAT('PIEZA-', p.id) as sku,
    p.nombre,
    CONCAT('Pieza migrada desde sistema anterior: ', p.nombre) as descripcion,
    p.marca_id,
    p.modelo_id,
    p.stock,
    p.precio as precio_promedio,
    'PRODUCTO' as tipo,
    p.created_at,
    p.updated_at
FROM piezas p
WHERE NOT EXISTS (
    SELECT 1 FROM productos prod 
    WHERE prod.nombre = p.nombre 
    AND prod.marca_id = p.marca_id 
    AND prod.modelo_id = p.modelo_id
);

-- 2. Crear tabla temporal para mapear IDs
CREATE TEMP TABLE pieza_to_producto_mapping AS
SELECT 
    p.id as pieza_id,
    prod.id as producto_id
FROM piezas p
JOIN productos prod ON (
    prod.nombre = p.nombre 
    AND prod.marca_id = p.marca_id 
    AND prod.modelo_id = p.modelo_id
);

-- 3. Actualizar piezas_reparacion para usar productos en lugar de piezas
-- Primero, agregar columnas temporales
ALTER TABLE piezas_reparacion ADD COLUMN producto_id_temp INT;

-- Actualizar con los IDs de productos correspondientes
UPDATE piezas_reparacion 
SET producto_id_temp = (
    SELECT producto_id 
    FROM pieza_to_producto_mapping 
    WHERE pieza_id = piezas_reparacion.pieza_id
)
WHERE pieza_id IN (SELECT pieza_id FROM pieza_to_producto_mapping);

-- 4. Crear nueva tabla piezas_reparacion_productos
CREATE TABLE IF NOT EXISTS piezas_reparacion_productos (
    id SERIAL PRIMARY KEY,
    reparacion_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio FLOAT NOT NULL,
    total FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reparacion_id) REFERENCES reparaciones(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- 5. Migrar datos a la nueva tabla
INSERT INTO piezas_reparacion_productos (
    reparacion_id,
    producto_id,
    cantidad,
    precio,
    total,
    created_at,
    updated_at
)
SELECT 
    pr.reparacion_id,
    pr.producto_id_temp,
    pr.cantidad,
    pr.precio,
    pr.total,
    pr.created_at,
    pr.updated_at
FROM piezas_reparacion pr
WHERE pr.producto_id_temp IS NOT NULL;

-- 6. Mostrar resumen de la migración
SELECT 
    'Piezas migradas' as tipo,
    COUNT(*) as cantidad
FROM pieza_to_producto_mapping
UNION ALL
SELECT 
    'Piezas reparación migradas' as tipo,
    COUNT(*) as cantidad
FROM piezas_reparacion_productos;

-- 7. Limpiar columnas temporales
ALTER TABLE piezas_reparacion DROP COLUMN producto_id_temp;

-- Nota: Las tablas piezas y piezas_reparacion se pueden eliminar después de verificar que todo funciona correctamente 