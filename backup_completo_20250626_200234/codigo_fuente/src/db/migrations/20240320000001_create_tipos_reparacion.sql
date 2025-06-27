-- Crear tabla de tipos de reparación
CREATE TABLE IF NOT EXISTS tipos_reparacion (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por INTEGER REFERENCES usuarios(id),
    actualizado_por INTEGER REFERENCES usuarios(id)
);

-- Crear índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_tipos_reparacion_nombre ON tipos_reparacion(nombre);

-- Crear trigger para actualizar fecha_actualizacion
CREATE TRIGGER actualizar_fecha_tipos_reparacion
    BEFORE UPDATE ON tipos_reparacion
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- Insertar datos iniciales
INSERT INTO tipos_reparacion (nombre, descripcion) VALUES
    ('Cambio de Cámara', 'Reparación o reemplazo de la cámara del dispositivo'),
    ('Cambio de Batería', 'Reemplazo de la batería del dispositivo'),
    ('Cambio de Pantalla', 'Reemplazo de la pantalla del dispositivo'),
    ('Cambio de Micrófono', 'Reemplazo del micrófono del dispositivo'),
    ('Cambio de Altavoz', 'Reemplazo del altavoz del dispositivo'),
    ('Cambio de Botón de Inicio', 'Reemplazo del botón de inicio del dispositivo'),
    ('Cambio de Botones de Volumen', 'Reemplazo de los botones de volumen del dispositivo'),
    ('Cambio de Conector de Carga', 'Reemplazo del conector de carga del dispositivo'),
    ('Reparación de Placa', 'Reparación de la placa base del dispositivo'),
    ('Otro', 'Otro tipo de reparación no especificada')
ON CONFLICT DO NOTHING; 