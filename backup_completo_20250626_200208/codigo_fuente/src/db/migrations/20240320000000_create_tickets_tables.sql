-- Crear tabla de tickets
CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    tipo_reparacion_id INTEGER NOT NULL REFERENCES tipos_reparacion(id),
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    imei VARCHAR(50) NOT NULL,
    capacidad VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    fecha_compra DATE,
    tipo_desbloqueo VARCHAR(20) NOT NULL CHECK (tipo_desbloqueo IN ('pin', 'patron')),
    codigo_desbloqueo VARCHAR(50),
    patron_desbloqueo INTEGER[],
    red_celular VARCHAR(50) NOT NULL,
    tecnico_id INTEGER REFERENCES usuarios(id),
    fecha_entrega TIMESTAMP,
    prioridad VARCHAR(20) NOT NULL CHECK (prioridad IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('PENDING', 'IN_DIAGNOSIS', 'IN_REPAIR', 'COMPLETED', 'CANCELLED')),
    fecha_inicio_diagnostico TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por INTEGER REFERENCES usuarios(id),
    actualizado_por INTEGER REFERENCES usuarios(id)
);

-- Crear tabla de checklist_recepcion
CREATE TABLE IF NOT EXISTS checklist_recepcion (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id),
    enciende VARCHAR(10) CHECK (enciende IN ('yes', 'no')),
    pantalla VARCHAR(10) CHECK (pantalla IN ('yes', 'no')),
    boton_inicio VARCHAR(10) CHECK (boton_inicio IN ('yes', 'no')),
    botones_volumen VARCHAR(10) CHECK (botones_volumen IN ('yes', 'no')),
    camara VARCHAR(10) CHECK (camara IN ('yes', 'no')),
    microfono VARCHAR(10) CHECK (microfono IN ('yes', 'no')),
    altavoz VARCHAR(10) CHECK (altavoz IN ('yes', 'no')),
    wifi VARCHAR(10) CHECK (wifi IN ('yes', 'no')),
    bluetooth VARCHAR(10) CHECK (bluetooth IN ('yes', 'no')),
    gps VARCHAR(10) CHECK (gps IN ('yes', 'no')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por INTEGER REFERENCES usuarios(id),
    actualizado_por INTEGER REFERENCES usuarios(id)
);

-- Crear tabla de checklist_post_reparacion
CREATE TABLE IF NOT EXISTS checklist_post_reparacion (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id),
    enciende VARCHAR(10) CHECK (enciende IN ('yes', 'no')),
    pantalla VARCHAR(10) CHECK (pantalla IN ('yes', 'no')),
    boton_inicio VARCHAR(10) CHECK (boton_inicio IN ('yes', 'no')),
    botones_volumen VARCHAR(10) CHECK (botones_volumen IN ('yes', 'no')),
    camara VARCHAR(10) CHECK (camara IN ('yes', 'no')),
    microfono VARCHAR(10) CHECK (microfono IN ('yes', 'no')),
    altavoz VARCHAR(10) CHECK (altavoz IN ('yes', 'no')),
    wifi VARCHAR(10) CHECK (wifi IN ('yes', 'no')),
    bluetooth VARCHAR(10) CHECK (bluetooth IN ('yes', 'no')),
    gps VARCHAR(10) CHECK (gps IN ('yes', 'no')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creado_por INTEGER REFERENCES usuarios(id),
    actualizado_por INTEGER REFERENCES usuarios(id)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_tickets_cliente_id ON tickets(cliente_id);
CREATE INDEX IF NOT EXISTS idx_tickets_tipo_reparacion_id ON tickets(tipo_reparacion_id);
CREATE INDEX IF NOT EXISTS idx_tickets_tecnico_id ON tickets(tecnico_id);
CREATE INDEX IF NOT EXISTS idx_tickets_estado ON tickets(estado);
CREATE INDEX IF NOT EXISTS idx_checklist_recepcion_ticket_id ON checklist_recepcion(ticket_id);
CREATE INDEX IF NOT EXISTS idx_checklist_post_reparacion_ticket_id ON checklist_post_reparacion(ticket_id);

-- Crear función para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para actualizar fecha_actualizacion
CREATE TRIGGER actualizar_fecha_tickets
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER actualizar_fecha_checklist_recepcion
    BEFORE UPDATE ON checklist_recepcion
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER actualizar_fecha_checklist_post_reparacion
    BEFORE UPDATE ON checklist_post_reparacion
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion(); 