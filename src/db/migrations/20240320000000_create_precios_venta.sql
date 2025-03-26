-- Crear tabla de precios de venta
CREATE TABLE IF NOT EXISTS precios_venta (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('PRODUCTO', 'SERVICIO')),
    nombre VARCHAR(255) NOT NULL,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    precio_compra_promedio DECIMAL(10,2) NOT NULL,
    precio_venta DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) DEFAULT 'system',
    updated_by VARCHAR(255) DEFAULT 'system'
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_precios_venta_tipo ON precios_venta(tipo);
CREATE INDEX idx_precios_venta_nombre ON precios_venta(nombre);
CREATE INDEX idx_precios_venta_marca ON precios_venta(marca);
CREATE INDEX idx_precios_venta_modelo ON precios_venta(modelo);

-- Crear función para actualizar el timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar el timestamp
CREATE TRIGGER update_precios_venta_updated_at
    BEFORE UPDATE ON precios_venta
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 