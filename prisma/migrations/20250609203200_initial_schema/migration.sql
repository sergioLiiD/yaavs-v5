-- Crear enums
CREATE TYPE "TipoProveedor" AS ENUM ('FISICA', 'MORAL');
CREATE TYPE "TipoSalida" AS ENUM ('VENTA', 'REPARACION', 'PERDIDA', 'AJUSTE');
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA');
CREATE TYPE "NivelUsuarioPunto" AS ENUM ('ADMIN', 'OPERADOR');
CREATE TYPE "TipoEntrega" AS ENUM ('DOMICILIO', 'PUNTO_RECOLECCION');
CREATE TYPE "TipoProducto" AS ENUM ('PRODUCTO', 'SERVICIO');

-- Crear tablas principales
CREATE TABLE "clientes" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "apellido_paterno" TEXT NOT NULL,
    "apellido_materno" TEXT,
    "telefono_celular" TEXT NOT NULL,
    "telefono_contacto" TEXT,
    "email" TEXT UNIQUE NOT NULL,
    "calle" TEXT,
    "numero_exterior" TEXT,
    "numero_interior" TEXT,
    "colonia" TEXT,
    "ciudad" TEXT,
    "estado" TEXT,
    "codigo_postal" TEXT,
    "latitud" FLOAT,
    "longitud" FLOAT,
    "fuente_referencia" TEXT,
    "rfc" TEXT,
    "password_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "usuarios" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "apellido_paterno" TEXT NOT NULL,
    "apellido_materno" TEXT,
    "email" TEXT UNIQUE NOT NULL,
    "password_hash" TEXT NOT NULL,
    "telefono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "tipos_servicio" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT UNIQUE NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "estatus_reparacion" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT UNIQUE NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "marcas" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT UNIQUE NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "modelos" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "marca_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("marca_id") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "tickets" (
    "id" SERIAL PRIMARY KEY,
    "numero_ticket" TEXT UNIQUE NOT NULL,
    "fecha_recepcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cliente_id" INTEGER NOT NULL,
    "tipo_servicio_id" INTEGER NOT NULL,
    "modelo_id" INTEGER NOT NULL,
    "descripcion_problema" TEXT,
    "estatus_reparacion_id" INTEGER NOT NULL,
    "creador_id" INTEGER NOT NULL,
    "tecnico_asignado_id" INTEGER,
    "punto_recoleccion_id" INTEGER,
    "recogida" BOOLEAN NOT NULL DEFAULT false,
    "fecha_entrega" TIMESTAMP(3),
    "entregado" BOOLEAN NOT NULL DEFAULT false,
    "cancelado" BOOLEAN NOT NULL DEFAULT false,
    "motivo_cancelacion" TEXT,
    "fecha_inicio_diagnostico" TIMESTAMP(3),
    "fecha_fin_diagnostico" TIMESTAMP(3),
    "fecha_inicio_reparacion" TIMESTAMP(3),
    "fecha_fin_reparacion" TIMESTAMP(3),
    "fecha_cancelacion" TIMESTAMP(3),
    "direccion_id" INTEGER UNIQUE,
    "imei" TEXT UNIQUE,
    "capacidad" TEXT,
    "color" TEXT,
    "fecha_compra" TIMESTAMP(3),
    "codigo_desbloqueo" TEXT,
    "red_celular" TEXT,
    "patron_desbloqueo" INTEGER[] DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("tipo_servicio_id") REFERENCES "tipos_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("modelo_id") REFERENCES "modelos"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("estatus_reparacion_id") REFERENCES "estatus_reparacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("creador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("tecnico_asignado_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Crear índices
CREATE INDEX "tickets_cliente_id_idx" ON "tickets"("cliente_id");
CREATE INDEX "tickets_tipo_servicio_id_idx" ON "tickets"("tipo_servicio_id");
CREATE INDEX "tickets_modelo_id_idx" ON "tickets"("modelo_id");
CREATE INDEX "tickets_estatus_reparacion_id_idx" ON "tickets"("estatus_reparacion_id");
CREATE INDEX "tickets_creador_id_idx" ON "tickets"("creador_id");
CREATE INDEX "tickets_tecnico_asignado_id_idx" ON "tickets"("tecnico_asignado_id");
CREATE INDEX "modelos_marca_id_idx" ON "modelos"("marca_id"); 