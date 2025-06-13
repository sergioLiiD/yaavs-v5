-- Crear tabla Cliente
CREATE TABLE IF NOT EXISTS "Cliente" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla Usuario
CREATE TABLE IF NOT EXISTS "Usuario" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla TipoServicio
CREATE TABLE IF NOT EXISTS "TipoServicio" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla EstatusReparacion
CREATE TABLE IF NOT EXISTS "EstatusReparacion" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla Modelo
CREATE TABLE IF NOT EXISTS "Modelo" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla Ticket
CREATE TABLE IF NOT EXISTS "Ticket" (
    "id" SERIAL PRIMARY KEY,
    "numero_ticket" TEXT NOT NULL,
    "fecha_recepcion" TIMESTAMP(3) NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "tipo_servicio_id" INTEGER NOT NULL,
    "creador_id" INTEGER NOT NULL,
    "estatus_reparacion_id" INTEGER NOT NULL,
    "modelo_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ticket_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ticket_tipo_servicio_id_fkey" FOREIGN KEY ("tipo_servicio_id") REFERENCES "TipoServicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ticket_creador_id_fkey" FOREIGN KEY ("creador_id") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ticket_estatus_reparacion_id_fkey" FOREIGN KEY ("estatus_reparacion_id") REFERENCES "EstatusReparacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ticket_modelo_id_fkey" FOREIGN KEY ("modelo_id") REFERENCES "Modelo"("id") ON DELETE RESTRICT ON UPDATE CASCADE
); 