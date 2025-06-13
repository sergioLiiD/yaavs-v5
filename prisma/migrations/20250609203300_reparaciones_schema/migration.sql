-- Crear tablas de reparaciones y presupuestos
CREATE TABLE "presupuestos" (
    "id" SERIAL PRIMARY KEY,
    "ticket_id" INTEGER UNIQUE NOT NULL,
    "total" FLOAT NOT NULL,
    "descuento" FLOAT NOT NULL DEFAULT 0,
    "total_final" FLOAT NOT NULL,
    "aprobado" BOOLEAN NOT NULL DEFAULT false,
    "fecha_aprobacion" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "conceptos_presupuesto" (
    "id" SERIAL PRIMARY KEY,
    "presupuesto_id" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" FLOAT NOT NULL,
    "total" FLOAT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("presupuesto_id") REFERENCES "presupuestos"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "reparaciones" (
    "id" SERIAL PRIMARY KEY,
    "ticket_id" INTEGER UNIQUE NOT NULL,
    "diagnostico" TEXT,
    "solucion" TEXT,
    "observaciones" TEXT,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "piezas" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "marca_id" INTEGER NOT NULL,
    "modelo_id" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "precio" FLOAT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("marca_id") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("modelo_id") REFERENCES "modelos"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "piezas_reparacion" (
    "id" SERIAL PRIMARY KEY,
    "reparacion_id" INTEGER NOT NULL,
    "pieza_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio" FLOAT NOT NULL,
    "total" FLOAT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("reparacion_id") REFERENCES "reparaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("pieza_id") REFERENCES "piezas"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "checklist_diagnostico" (
    "id" SERIAL PRIMARY KEY,
    "reparacion_id" INTEGER UNIQUE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("reparacion_id") REFERENCES "reparaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "checklist_items" (
    "id" SERIAL PRIMARY KEY,
    "checklist_diagnostico_id" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("checklist_diagnostico_id") REFERENCES "checklist_diagnostico"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "problemas_frecuentes" (
    "id" SERIAL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ticket_problemas" (
    "id" SERIAL PRIMARY KEY,
    "ticket_id" INTEGER NOT NULL,
    "problema_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("problema_id") REFERENCES "problemas_frecuentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Crear índices
CREATE INDEX "presupuestos_ticket_id_idx" ON "presupuestos"("ticket_id");
CREATE INDEX "conceptos_presupuesto_presupuesto_id_idx" ON "conceptos_presupuesto"("presupuesto_id");
CREATE INDEX "reparaciones_ticket_id_idx" ON "reparaciones"("ticket_id");
CREATE INDEX "piezas_marca_id_idx" ON "piezas"("marca_id");
CREATE INDEX "piezas_modelo_id_idx" ON "piezas"("modelo_id");
CREATE INDEX "piezas_reparacion_reparacion_id_idx" ON "piezas_reparacion"("reparacion_id");
CREATE INDEX "piezas_reparacion_pieza_id_idx" ON "piezas_reparacion"("pieza_id");
CREATE INDEX "checklist_diagnostico_reparacion_id_idx" ON "checklist_diagnostico"("reparacion_id");
CREATE INDEX "checklist_items_checklist_diagnostico_id_idx" ON "checklist_items"("checklist_diagnostico_id");
CREATE INDEX "ticket_problemas_ticket_id_idx" ON "ticket_problemas"("ticket_id");
CREATE INDEX "ticket_problemas_problema_id_idx" ON "ticket_problemas"("problema_id"); 