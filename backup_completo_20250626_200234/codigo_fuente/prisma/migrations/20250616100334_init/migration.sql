-- CreateEnum
CREATE TYPE "TipoProveedor" AS ENUM ('FISICA', 'MORAL');

-- CreateEnum
CREATE TYPE "TipoSalida" AS ENUM ('VENTA', 'REPARACION', 'PERDIDA', 'AJUSTE');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA');

-- CreateEnum
CREATE TYPE "NivelUsuarioPunto" AS ENUM ('ADMIN', 'OPERADOR');

-- CreateEnum
CREATE TYPE "TipoEntrega" AS ENUM ('DOMICILIO', 'PUNTO_RECOLECCION');

-- CreateEnum
CREATE TYPE "TipoProducto" AS ENUM ('PRODUCTO', 'SERVICIO');

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido_paterno" TEXT NOT NULL,
    "apellido_materno" TEXT,
    "telefono_celular" TEXT NOT NULL,
    "telefono_contacto" TEXT,
    "email" TEXT NOT NULL,
    "calle" TEXT,
    "numero_exterior" TEXT,
    "numero_interior" TEXT,
    "colonia" TEXT,
    "ciudad" TEXT,
    "estado" TEXT,
    "codigo_postal" TEXT,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "fuente_referencia" TEXT,
    "rfc" TEXT,
    "password_hash" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "creado_por_id" INTEGER,
    "tipo_registro" TEXT,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido_paterno" TEXT NOT NULL,
    "apellido_materno" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "telefono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" SERIAL NOT NULL,
    "numero_ticket" TEXT NOT NULL,
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
    "direccion_id" INTEGER,
    "imei" TEXT,
    "capacidad" TEXT,
    "color" TEXT,
    "fecha_compra" TIMESTAMP(3),
    "codigo_desbloqueo" TEXT,
    "red_celular" TEXT,
    "patron_desbloqueo" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_servicio" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipos_servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estatus_reparacion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "activo" BOOLEAN,
    "color" TEXT,
    "orden" INTEGER NOT NULL,

    CONSTRAINT "estatus_reparacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modelos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "marca_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "modelos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marcas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marcas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "presupuestos" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "descuento" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_final" DOUBLE PRECISION NOT NULL,
    "aprobado" BOOLEAN NOT NULL DEFAULT false,
    "fecha_aprobacion" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "iva_incluido" BOOLEAN NOT NULL DEFAULT true,
    "saldo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pagado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "presupuestos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conceptos_presupuesto" (
    "id" SERIAL NOT NULL,
    "presupuesto_id" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conceptos_presupuesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reparaciones" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "diagnostico" TEXT,
    "solucion" TEXT,
    "observaciones" TEXT,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "capacidad" TEXT,
    "codigo_desbloqueo" TEXT,
    "red_celular" TEXT,
    "salud_bateria" INTEGER,
    "version_so" TEXT,

    CONSTRAINT "reparaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "piezas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "marca_id" INTEGER NOT NULL,
    "modelo_id" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "precio" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "piezas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "piezas_reparacion" (
    "id" SERIAL NOT NULL,
    "reparacion_id" INTEGER NOT NULL,
    "pieza_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "piezas_reparacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_diagnostico" (
    "id" SERIAL NOT NULL,
    "reparacion_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_diagnostico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_items" (
    "id" SERIAL NOT NULL,
    "checklist_diagnostico_id" INTEGER,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "nombre" TEXT NOT NULL,
    "para_diagnostico" BOOLEAN NOT NULL DEFAULT false,
    "para_reparacion" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_problemas" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "problema_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_problemas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problemas_frecuentes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problemas_frecuentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispositivos" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "serie" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispositivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direcciones" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "calle" TEXT NOT NULL,
    "numero_exterior" TEXT NOT NULL,
    "numero_interior" TEXT,
    "colonia" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "codigo_postal" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "direcciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entregas" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "tipo" "TipoEntrega" NOT NULL,
    "direccion" TEXT,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entregas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" SERIAL NOT NULL,
    "ticket_id" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "metodo" "MetodoPago" NOT NULL,
    "referencia" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puntos_recoleccion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "is_headquarters" BOOLEAN NOT NULL DEFAULT false,
    "location" JSONB NOT NULL,
    "parent_id" INTEGER,
    "phone" TEXT,
    "schedule" JSONB NOT NULL,
    "url" TEXT,

    CONSTRAINT "puntos_recoleccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_puntos_recoleccion" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "punto_recoleccion_id" INTEGER NOT NULL,
    "nivel" "NivelUsuarioPunto" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_puntos_recoleccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" SERIAL NOT NULL,
    "sku" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "notas_internas" TEXT,
    "garantia_valor" INTEGER,
    "garantia_unidad" TEXT,
    "categoria_id" INTEGER,
    "marca_id" INTEGER,
    "modelo_id" INTEGER,
    "proveedor_id" INTEGER,
    "precio_promedio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "tipo_servicio_id" INTEGER,
    "stock_maximo" INTEGER,
    "stock_minimo" INTEGER,
    "tipo" "TipoProducto" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "contacto" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "direccion" TEXT,
    "notas" TEXT,
    "banco" TEXT NOT NULL,
    "clabe_interbancaria" TEXT NOT NULL,
    "cuenta_bancaria" TEXT NOT NULL,
    "rfc" TEXT NOT NULL,
    "tipo" "TipoProveedor" NOT NULL DEFAULT 'FISICA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entradas_almacen" (
    "id" SERIAL NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_compra" DOUBLE PRECISION NOT NULL,
    "notas" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" INTEGER NOT NULL,
    "proveedor_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entradas_almacen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salidas_almacen" (
    "id" SERIAL NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "razon" TEXT NOT NULL,
    "tipo" "TipoSalida" NOT NULL,
    "referencia" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salidas_almacen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fotos_producto" (
    "id" SERIAL NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fotos_producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permisos" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_roles" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles_permisos" (
    "id" SERIAL NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "permiso_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "precios_venta" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoProducto" NOT NULL,
    "nombre" TEXT NOT NULL,
    "marca" TEXT,
    "modelo" TEXT,
    "precio_compra_promedio" DOUBLE PRECISION NOT NULL,
    "precio_venta" DOUBLE PRECISION NOT NULL,
    "producto_id" INTEGER,
    "servicio_id" INTEGER,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "precios_venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reparaciones_frecuentes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reparaciones_frecuentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pasos_reparacion_frecuente" (
    "id" SERIAL NOT NULL,
    "reparacion_frecuente_id" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pasos_reparacion_frecuente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos_reparacion_frecuente" (
    "id" SERIAL NOT NULL,
    "reparacion_frecuente_id" INTEGER NOT NULL,
    "producto_id" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_venta" DOUBLE PRECISION NOT NULL,
    "concepto_extra" TEXT,
    "precio_concepto_extra" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_reparacion_frecuente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_numero_ticket_key" ON "tickets"("numero_ticket");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_direccion_id_key" ON "tickets"("direccion_id");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_imei_key" ON "tickets"("imei");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_servicio_nombre_key" ON "tipos_servicio"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "estatus_reparacion_nombre_key" ON "estatus_reparacion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "marcas_nombre_key" ON "marcas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "presupuestos_ticket_id_key" ON "presupuestos"("ticket_id");

-- CreateIndex
CREATE UNIQUE INDEX "reparaciones_ticket_id_key" ON "reparaciones"("ticket_id");

-- CreateIndex
CREATE UNIQUE INDEX "checklist_diagnostico_reparacion_id_key" ON "checklist_diagnostico"("reparacion_id");

-- CreateIndex
CREATE UNIQUE INDEX "dispositivos_ticket_id_key" ON "dispositivos"("ticket_id");

-- CreateIndex
CREATE UNIQUE INDEX "entregas_ticket_id_key" ON "entregas"("ticket_id");

-- CreateIndex
CREATE UNIQUE INDEX "productos_sku_key" ON "productos"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_key" ON "categorias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_codigo_key" ON "permisos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_roles_usuario_id_rol_id_key" ON "usuarios_roles"("usuario_id", "rol_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_permisos_rol_id_permiso_id_key" ON "roles_permisos"("rol_id", "permiso_id");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_creador_id_fkey" FOREIGN KEY ("creador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_direccion_id_fkey" FOREIGN KEY ("direccion_id") REFERENCES "direcciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_estatus_reparacion_id_fkey" FOREIGN KEY ("estatus_reparacion_id") REFERENCES "estatus_reparacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_modelo_id_fkey" FOREIGN KEY ("modelo_id") REFERENCES "modelos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_punto_recoleccion_id_fkey" FOREIGN KEY ("punto_recoleccion_id") REFERENCES "puntos_recoleccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_tecnico_asignado_id_fkey" FOREIGN KEY ("tecnico_asignado_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_tipo_servicio_id_fkey" FOREIGN KEY ("tipo_servicio_id") REFERENCES "tipos_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modelos" ADD CONSTRAINT "modelos_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "presupuestos" ADD CONSTRAINT "presupuestos_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conceptos_presupuesto" ADD CONSTRAINT "conceptos_presupuesto_presupuesto_id_fkey" FOREIGN KEY ("presupuesto_id") REFERENCES "presupuestos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reparaciones" ADD CONSTRAINT "reparaciones_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piezas" ADD CONSTRAINT "piezas_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piezas" ADD CONSTRAINT "piezas_modelo_id_fkey" FOREIGN KEY ("modelo_id") REFERENCES "modelos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piezas_reparacion" ADD CONSTRAINT "piezas_reparacion_pieza_id_fkey" FOREIGN KEY ("pieza_id") REFERENCES "piezas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piezas_reparacion" ADD CONSTRAINT "piezas_reparacion_reparacion_id_fkey" FOREIGN KEY ("reparacion_id") REFERENCES "reparaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_diagnostico" ADD CONSTRAINT "checklist_diagnostico_reparacion_id_fkey" FOREIGN KEY ("reparacion_id") REFERENCES "reparaciones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_checklist_diagnostico_id_fkey" FOREIGN KEY ("checklist_diagnostico_id") REFERENCES "checklist_diagnostico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_problemas" ADD CONSTRAINT "ticket_problemas_problema_id_fkey" FOREIGN KEY ("problema_id") REFERENCES "problemas_frecuentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_problemas" ADD CONSTRAINT "ticket_problemas_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispositivos" ADD CONSTRAINT "dispositivos_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direcciones" ADD CONSTRAINT "direcciones_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "puntos_recoleccion" ADD CONSTRAINT "puntos_recoleccion_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "puntos_recoleccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_puntos_recoleccion" ADD CONSTRAINT "usuarios_puntos_recoleccion_punto_recoleccion_id_fkey" FOREIGN KEY ("punto_recoleccion_id") REFERENCES "puntos_recoleccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_puntos_recoleccion" ADD CONSTRAINT "usuarios_puntos_recoleccion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marcas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_modelo_id_fkey" FOREIGN KEY ("modelo_id") REFERENCES "modelos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_tipo_servicio_id_fkey" FOREIGN KEY ("tipo_servicio_id") REFERENCES "tipos_servicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entradas_almacen" ADD CONSTRAINT "entradas_almacen_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entradas_almacen" ADD CONSTRAINT "entradas_almacen_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entradas_almacen" ADD CONSTRAINT "entradas_almacen_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salidas_almacen" ADD CONSTRAINT "salidas_almacen_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salidas_almacen" ADD CONSTRAINT "salidas_almacen_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos_producto" ADD CONSTRAINT "fotos_producto_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_roles" ADD CONSTRAINT "usuarios_roles_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_roles" ADD CONSTRAINT "usuarios_roles_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_permisos" ADD CONSTRAINT "roles_permisos_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "permisos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_permisos" ADD CONSTRAINT "roles_permisos_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "precios_venta" ADD CONSTRAINT "precios_venta_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "precios_venta" ADD CONSTRAINT "precios_venta_servicio_id_fkey" FOREIGN KEY ("servicio_id") REFERENCES "tipos_servicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pasos_reparacion_frecuente" ADD CONSTRAINT "pasos_reparacion_frecuente_reparacion_frecuente_id_fkey" FOREIGN KEY ("reparacion_frecuente_id") REFERENCES "reparaciones_frecuentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_reparacion_frecuente" ADD CONSTRAINT "productos_reparacion_frecuente_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_reparacion_frecuente" ADD CONSTRAINT "productos_reparacion_frecuente_reparacion_frecuente_id_fkey" FOREIGN KEY ("reparacion_frecuente_id") REFERENCES "reparaciones_frecuentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
