-- CreateEnum
CREATE TYPE "NivelUsuario" AS ENUM ('ADMINISTRADOR', 'TECNICO', 'ATENCION_CLIENTE');

-- CreateEnum
CREATE TYPE "TipoProveedor" AS ENUM ('FISICA', 'MORAL');

-- CreateEnum
CREATE TYPE "TipoSalida" AS ENUM ('VENTA', 'DANO', 'MERMA', 'OTRO');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'PAGO_ENTREGA');

-- CreateEnum
CREATE TYPE "NivelUsuarioPunto" AS ENUM ('ADMINISTRADOR', 'OPERADOR');

-- CreateEnum
CREATE TYPE "TipoEntrega" AS ENUM ('OFICINA', 'DOMICILIO');

-- CreateEnum
CREATE TYPE "TipoProducto" AS ENUM ('PRODUCTO', 'SERVICIO');

-- CreateTable
CREATE TABLE "tipos_servicio" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipos_servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marcas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marcas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" SERIAL NOT NULL,
    "numeroTicket" TEXT NOT NULL,
    "fechaRecepcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" INTEGER NOT NULL,
    "tipoServicioId" INTEGER NOT NULL,
    "modeloId" INTEGER NOT NULL,
    "descripcionProblema" TEXT,
    "estatusReparacionId" INTEGER NOT NULL,
    "creadorId" INTEGER NOT NULL,
    "tecnicoAsignadoId" INTEGER,
    "recogida" BOOLEAN NOT NULL DEFAULT false,
    "fechaEntrega" TIMESTAMP(3),
    "entregado" BOOLEAN NOT NULL DEFAULT false,
    "cancelado" BOOLEAN NOT NULL DEFAULT false,
    "motivoCancelacion" TEXT,
    "fechaInicioDiagnostico" TIMESTAMP(3),
    "fechaFinDiagnostico" TIMESTAMP(3),
    "fechaInicioReparacion" TIMESTAMP(3),
    "fechaFinReparacion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fechaCancelacion" TIMESTAMP(3),
    "direccionId" INTEGER,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "banco" TEXT NOT NULL,
    "clabeInterbancaria" TEXT NOT NULL,
    "cuentaBancaria" TEXT NOT NULL,
    "rfc" TEXT NOT NULL,
    "tipo" "TipoProveedor" NOT NULL DEFAULT 'FISICA',

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" SERIAL NOT NULL,
    "sku" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "notasInternas" TEXT,
    "garantiaValor" INTEGER NOT NULL DEFAULT 0,
    "garantiaUnidad" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoriaId" INTEGER,
    "marcaId" INTEGER,
    "modeloId" INTEGER,
    "proveedorId" INTEGER,
    "precioPromedio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "tipoServicioId" INTEGER NOT NULL,
    "stockMaximo" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER NOT NULL DEFAULT 0,
    "tipo" "TipoProducto" NOT NULL DEFAULT 'PRODUCTO',

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entradas_almacen" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioCompra" DOUBLE PRECISION NOT NULL,
    "notas" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "proveedorId" INTEGER,

    CONSTRAINT "entradas_almacen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salidas_almacen" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "razon" TEXT NOT NULL,
    "tipo" "TipoSalida" NOT NULL,
    "referencia" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salidas_almacen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT,
    "telefonoCelular" TEXT NOT NULL,
    "telefonoContacto" TEXT,
    "email" TEXT NOT NULL,
    "calle" TEXT,
    "numeroExterior" TEXT,
    "numeroInterior" TEXT,
    "colonia" TEXT,
    "ciudad" TEXT,
    "estado" TEXT,
    "codigoPostal" TEXT,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "fuenteReferencia" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rfc" TEXT,
    "passwordHash" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "tipoRegistro" TEXT NOT NULL DEFAULT 'Registro en tienda',

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EstatusReparacion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL,
    "color" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EstatusReparacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Modelo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "marcaId" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Modelo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Presupuesto" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "manoDeObra" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "iva" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "aprobado" BOOLEAN NOT NULL DEFAULT false,
    "fechaAprobacion" TIMESTAMP(3),
    "pagado" BOOLEAN NOT NULL DEFAULT false,
    "metodoPago" "MetodoPago",
    "comprobantePago" TEXT,
    "fechaPago" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "anticipo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cuponDescuento" TEXT,
    "descuento" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "saldo" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Presupuesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemaModelo" (
    "id" SERIAL NOT NULL,
    "modeloId" INTEGER NOT NULL,
    "problemaFrecuenteId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProblemaModelo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reparacion" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "tecnicoId" INTEGER NOT NULL,
    "observaciones" TEXT,
    "fechaInicio" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "checklist" JSONB,
    "fechaPausa" TIMESTAMP(3),
    "fechaReanudacion" TIMESTAMP(3),
    "fotos" TEXT[],
    "videos" TEXT[],
    "diagnostico" TEXT,
    "saludBateria" INTEGER,
    "versionSO" TEXT,

    CONSTRAINT "Reparacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketProblema" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "problemaFrecuenteId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketProblema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT,
    "passwordHash" TEXT NOT NULL,
    "nivel" "NivelUsuario" NOT NULL DEFAULT 'TECNICO',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_item_models" (
    "id" SERIAL NOT NULL,
    "catalogItemId" INTEGER NOT NULL,
    "modelId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_item_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_items" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_diagnostico" (
    "id" SERIAL NOT NULL,
    "reparacionId" INTEGER NOT NULL,
    "item" TEXT NOT NULL,
    "respuesta" BOOLEAN NOT NULL,
    "observacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_diagnostico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_items" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "paraDiagnostico" BOOLEAN NOT NULL DEFAULT false,
    "paraReparacion" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conceptos_presupuesto" (
    "id" SERIAL NOT NULL,
    "presupuestoId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conceptos_presupuesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direcciones" (
    "id" SERIAL NOT NULL,
    "calle" TEXT NOT NULL,
    "numeroExterior" TEXT NOT NULL,
    "numeroInterior" TEXT,
    "colonia" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "codigoPostal" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION,
    "longitud" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "direcciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispositivos" (
    "id" SERIAL NOT NULL,
    "capacidad" TEXT,
    "color" TEXT,
    "fechaCompra" TIMESTAMP(3),
    "codigoDesbloqueo" TEXT,
    "redCelular" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ticketId" INTEGER,

    CONSTRAINT "dispositivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entregas" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "tipoEntrega" "TipoEntrega" NOT NULL,
    "fechaEntrega" TIMESTAMP(3),
    "entregado" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "direccionEntregaId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entregas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fotos_producto" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productoId" INTEGER NOT NULL,

    CONSTRAINT "fotos_producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventarios_minimos" (
    "id" SERIAL NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidadMinima" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventarios_minimos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "models" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "brandId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" SERIAL NOT NULL,
    "ticketId" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "comprobante" TEXT,
    "metodoPago" TEXT NOT NULL,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pasos_reparacion_frecuente" (
    "id" SERIAL NOT NULL,
    "reparacionFrecuenteId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "orden" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pasos_reparacion_frecuente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "piezas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "sku" TEXT,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "precioCompra" DOUBLE PRECISION NOT NULL,
    "precioVenta" DOUBLE PRECISION NOT NULL,
    "unidadMedida" TEXT,
    "ubicacion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "marcaId" INTEGER,
    "modeloId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "piezas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "piezas_reparacion" (
    "id" SERIAL NOT NULL,
    "reparacionId" INTEGER NOT NULL,
    "piezaId" INTEGER,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "conceptoExtra" TEXT,
    "precioConceptoExtra" DOUBLE PRECISION,

    CONSTRAINT "piezas_reparacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "precios_venta" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "precio_compra_promedio" DOUBLE PRECISION NOT NULL,
    "precio_venta" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,
    "producto_id" INTEGER,
    "servicio_id" INTEGER,

    CONSTRAINT "precios_venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problemas_frecuentes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "modeloId" INTEGER NOT NULL,

    CONSTRAINT "problemas_frecuentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos_reparacion_frecuente" (
    "id" SERIAL NOT NULL,
    "reparacionFrecuenteId" INTEGER NOT NULL,
    "productoId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioVenta" DOUBLE PRECISION NOT NULL,
    "conceptoExtra" TEXT,
    "precioConceptoExtra" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_reparacion_frecuente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "providers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "puntos_recoleccion" (
    "id" TEXT NOT NULL,
    "nombreComercial" TEXT NOT NULL,
    "nombreResponsable" TEXT NOT NULL,
    "apellidoPaterno" TEXT NOT NULL,
    "apellidoMaterno" TEXT,
    "telefono" TEXT NOT NULL,
    "celular" TEXT,
    "email" TEXT NOT NULL,
    "urlNegocio" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "puntos_recoleccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reparaciones_frecuentes" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reparaciones_frecuentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_puntos_recoleccion" (
    "id" TEXT NOT NULL,
    "puntoRecoleccionId" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "nivel" "NivelUsuarioPunto" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_puntos_recoleccion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipos_servicio_nombre_key" ON "tipos_servicio"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "marcas_nombre_key" ON "marcas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_numeroTicket_key" ON "tickets"("numeroTicket");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_direccionId_key" ON "tickets"("direccionId");

-- CreateIndex
CREATE UNIQUE INDEX "productos_sku_key" ON "productos"("sku");

-- CreateIndex
CREATE INDEX "salidas_almacen_productoId_idx" ON "salidas_almacen"("productoId");

-- CreateIndex
CREATE INDEX "salidas_almacen_usuarioId_idx" ON "salidas_almacen"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EstatusReparacion_nombre_key" ON "EstatusReparacion"("nombre");

-- CreateIndex
CREATE INDEX "Modelo_marcaId_idx" ON "Modelo"("marcaId");

-- CreateIndex
CREATE UNIQUE INDEX "Presupuesto_ticketId_key" ON "Presupuesto"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "ProblemaModelo_modeloId_problemaFrecuenteId_key" ON "ProblemaModelo"("modeloId", "problemaFrecuenteId");

-- CreateIndex
CREATE UNIQUE INDEX "Reparacion_ticketId_key" ON "Reparacion"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "TicketProblema_ticketId_problemaFrecuenteId_key" ON "TicketProblema"("ticketId", "problemaFrecuenteId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_nombre_key" ON "categorias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "dispositivos_ticketId_key" ON "dispositivos"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "entregas_ticketId_key" ON "entregas"("ticketId");

-- CreateIndex
CREATE UNIQUE INDEX "entregas_direccionEntregaId_key" ON "entregas"("direccionEntregaId");

-- CreateIndex
CREATE UNIQUE INDEX "inventarios_minimos_productoId_key" ON "inventarios_minimos"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "piezas_sku_key" ON "piezas"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "providers_name_key" ON "providers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "puntos_recoleccion_email_key" ON "puntos_recoleccion"("email");

-- CreateIndex
CREATE UNIQUE INDEX "service_types_name_key" ON "service_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_puntos_recoleccion_puntoRecoleccionId_usuarioId_key" ON "usuarios_puntos_recoleccion"("puntoRecoleccionId", "usuarioId");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_direccionId_fkey" FOREIGN KEY ("direccionId") REFERENCES "direcciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "Modelo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_tipoServicioId_fkey" FOREIGN KEY ("tipoServicioId") REFERENCES "tipos_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entradas_almacen" ADD CONSTRAINT "entradas_almacen_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entradas_almacen" ADD CONSTRAINT "entradas_almacen_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entradas_almacen" ADD CONSTRAINT "entradas_almacen_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salidas_almacen" ADD CONSTRAINT "salidas_almacen_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salidas_almacen" ADD CONSTRAINT "salidas_almacen_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modelo" ADD CONSTRAINT "Modelo_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presupuesto" ADD CONSTRAINT "Presupuesto_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemaModelo" ADD CONSTRAINT "ProblemaModelo_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "Modelo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemaModelo" ADD CONSTRAINT "ProblemaModelo_problemaFrecuenteId_fkey" FOREIGN KEY ("problemaFrecuenteId") REFERENCES "problemas_frecuentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reparacion" ADD CONSTRAINT "Reparacion_tecnicoId_fkey" FOREIGN KEY ("tecnicoId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reparacion" ADD CONSTRAINT "Reparacion_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketProblema" ADD CONSTRAINT "TicketProblema_problemaFrecuenteId_fkey" FOREIGN KEY ("problemaFrecuenteId") REFERENCES "problemas_frecuentes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketProblema" ADD CONSTRAINT "TicketProblema_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_item_models" ADD CONSTRAINT "catalog_item_models_catalogItemId_fkey" FOREIGN KEY ("catalogItemId") REFERENCES "catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_item_models" ADD CONSTRAINT "catalog_item_models_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "models"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_diagnostico" ADD CONSTRAINT "checklist_diagnostico_reparacionId_fkey" FOREIGN KEY ("reparacionId") REFERENCES "Reparacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conceptos_presupuesto" ADD CONSTRAINT "conceptos_presupuesto_presupuestoId_fkey" FOREIGN KEY ("presupuestoId") REFERENCES "Presupuesto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispositivos" ADD CONSTRAINT "dispositivos_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_direccionEntregaId_fkey" FOREIGN KEY ("direccionEntregaId") REFERENCES "direcciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fotos_producto" ADD CONSTRAINT "fotos_producto_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventarios_minimos" ADD CONSTRAINT "inventarios_minimos_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "models" ADD CONSTRAINT "models_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pasos_reparacion_frecuente" ADD CONSTRAINT "pasos_reparacion_frecuente_reparacionFrecuenteId_fkey" FOREIGN KEY ("reparacionFrecuenteId") REFERENCES "reparaciones_frecuentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piezas" ADD CONSTRAINT "piezas_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piezas" ADD CONSTRAINT "piezas_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "Modelo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piezas_reparacion" ADD CONSTRAINT "piezas_reparacion_piezaId_fkey" FOREIGN KEY ("piezaId") REFERENCES "piezas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piezas_reparacion" ADD CONSTRAINT "piezas_reparacion_reparacionId_fkey" FOREIGN KEY ("reparacionId") REFERENCES "Reparacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_reparacion_frecuente" ADD CONSTRAINT "productos_reparacion_frecuente_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos_reparacion_frecuente" ADD CONSTRAINT "productos_reparacion_frecuente_reparacionFrecuenteId_fkey" FOREIGN KEY ("reparacionFrecuenteId") REFERENCES "reparaciones_frecuentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_puntos_recoleccion" ADD CONSTRAINT "usuarios_puntos_recoleccion_puntoRecoleccionId_fkey" FOREIGN KEY ("puntoRecoleccionId") REFERENCES "puntos_recoleccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_puntos_recoleccion" ADD CONSTRAINT "usuarios_puntos_recoleccion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
