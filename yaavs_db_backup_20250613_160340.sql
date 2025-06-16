--
-- PostgreSQL database dump
--

-- Dumped from database version 14.17 (Homebrew)
-- Dumped by pg_dump version 14.17 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: MetodoPago; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MetodoPago" AS ENUM (
    'EFECTIVO',
    'TRANSFERENCIA',
    'TARJETA'
);


ALTER TYPE public."MetodoPago" OWNER TO postgres;

--
-- Name: NivelUsuarioPunto; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NivelUsuarioPunto" AS ENUM (
    'ADMIN',
    'OPERADOR'
);


ALTER TYPE public."NivelUsuarioPunto" OWNER TO postgres;

--
-- Name: TipoEntrega; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TipoEntrega" AS ENUM (
    'DOMICILIO',
    'PUNTO_RECOLECCION'
);


ALTER TYPE public."TipoEntrega" OWNER TO postgres;

--
-- Name: TipoProducto; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TipoProducto" AS ENUM (
    'PRODUCTO',
    'SERVICIO'
);


ALTER TYPE public."TipoProducto" OWNER TO postgres;

--
-- Name: TipoProveedor; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TipoProveedor" AS ENUM (
    'FISICA',
    'MORAL'
);


ALTER TYPE public."TipoProveedor" OWNER TO postgres;

--
-- Name: TipoSalida; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TipoSalida" AS ENUM (
    'VENTA',
    'REPARACION',
    'PERDIDA',
    'AJUSTE'
);


ALTER TYPE public."TipoSalida" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: categorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias (
    id integer NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.categorias OWNER TO postgres;

--
-- Name: categorias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categorias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.categorias_id_seq OWNER TO postgres;

--
-- Name: categorias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categorias_id_seq OWNED BY public.categorias.id;


--
-- Name: checklist_diagnostico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checklist_diagnostico (
    id integer NOT NULL,
    reparacion_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.checklist_diagnostico OWNER TO postgres;

--
-- Name: checklist_diagnostico_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.checklist_diagnostico_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.checklist_diagnostico_id_seq OWNER TO postgres;

--
-- Name: checklist_diagnostico_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.checklist_diagnostico_id_seq OWNED BY public.checklist_diagnostico.id;


--
-- Name: checklist_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checklist_items (
    id integer NOT NULL,
    checklist_diagnostico_id integer,
    descripcion text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    nombre text NOT NULL,
    para_diagnostico boolean DEFAULT false NOT NULL,
    para_reparacion boolean DEFAULT false NOT NULL
);


ALTER TABLE public.checklist_items OWNER TO postgres;

--
-- Name: checklist_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.checklist_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.checklist_items_id_seq OWNER TO postgres;

--
-- Name: checklist_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.checklist_items_id_seq OWNED BY public.checklist_items.id;


--
-- Name: clientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientes (
    id integer NOT NULL,
    nombre text NOT NULL,
    apellido_paterno text NOT NULL,
    apellido_materno text,
    telefono_celular text NOT NULL,
    telefono_contacto text,
    email text NOT NULL,
    calle text,
    numero_exterior text,
    numero_interior text,
    colonia text,
    ciudad text,
    estado text,
    codigo_postal text,
    latitud double precision,
    longitud double precision,
    fuente_referencia text,
    rfc text,
    password_hash text,
    tipo_registro text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    creado_por_id integer
);


ALTER TABLE public.clientes OWNER TO postgres;

--
-- Name: clientes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clientes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.clientes_id_seq OWNER TO postgres;

--
-- Name: clientes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clientes_id_seq OWNED BY public.clientes.id;


--
-- Name: conceptos_presupuesto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conceptos_presupuesto (
    id integer NOT NULL,
    presupuesto_id integer NOT NULL,
    descripcion text NOT NULL,
    cantidad integer NOT NULL,
    precio_unitario double precision NOT NULL,
    total double precision NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.conceptos_presupuesto OWNER TO postgres;

--
-- Name: conceptos_presupuesto_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conceptos_presupuesto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.conceptos_presupuesto_id_seq OWNER TO postgres;

--
-- Name: conceptos_presupuesto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conceptos_presupuesto_id_seq OWNED BY public.conceptos_presupuesto.id;


--
-- Name: direcciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.direcciones (
    id integer NOT NULL,
    cliente_id integer NOT NULL,
    calle text NOT NULL,
    numero_exterior text NOT NULL,
    numero_interior text,
    colonia text NOT NULL,
    ciudad text NOT NULL,
    estado text NOT NULL,
    codigo_postal text NOT NULL,
    latitud double precision,
    longitud double precision,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.direcciones OWNER TO postgres;

--
-- Name: direcciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.direcciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.direcciones_id_seq OWNER TO postgres;

--
-- Name: direcciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.direcciones_id_seq OWNED BY public.direcciones.id;


--
-- Name: dispositivos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dispositivos (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    tipo text NOT NULL,
    marca text NOT NULL,
    modelo text NOT NULL,
    serie text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.dispositivos OWNER TO postgres;

--
-- Name: dispositivos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.dispositivos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.dispositivos_id_seq OWNER TO postgres;

--
-- Name: dispositivos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.dispositivos_id_seq OWNED BY public.dispositivos.id;


--
-- Name: entradas_almacen; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.entradas_almacen (
    id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad integer NOT NULL,
    precio_compra double precision NOT NULL,
    notas text,
    fecha timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usuario_id integer NOT NULL,
    proveedor_id integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.entradas_almacen OWNER TO postgres;

--
-- Name: entradas_almacen_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.entradas_almacen_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.entradas_almacen_id_seq OWNER TO postgres;

--
-- Name: entradas_almacen_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.entradas_almacen_id_seq OWNED BY public.entradas_almacen.id;


--
-- Name: entregas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.entregas (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    tipo public."TipoEntrega" NOT NULL,
    direccion text,
    notas text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.entregas OWNER TO postgres;

--
-- Name: entregas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.entregas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.entregas_id_seq OWNER TO postgres;

--
-- Name: entregas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.entregas_id_seq OWNED BY public.entregas.id;


--
-- Name: estatus_reparacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estatus_reparacion (
    id integer NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    activo boolean,
    color text,
    orden integer NOT NULL
);


ALTER TABLE public.estatus_reparacion OWNER TO postgres;

--
-- Name: estatus_reparacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estatus_reparacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.estatus_reparacion_id_seq OWNER TO postgres;

--
-- Name: estatus_reparacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estatus_reparacion_id_seq OWNED BY public.estatus_reparacion.id;


--
-- Name: fotos_producto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fotos_producto (
    id integer NOT NULL,
    producto_id integer NOT NULL,
    url text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.fotos_producto OWNER TO postgres;

--
-- Name: fotos_producto_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fotos_producto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.fotos_producto_id_seq OWNER TO postgres;

--
-- Name: fotos_producto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fotos_producto_id_seq OWNED BY public.fotos_producto.id;


--
-- Name: marcas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marcas (
    id integer NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.marcas OWNER TO postgres;

--
-- Name: marcas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.marcas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.marcas_id_seq OWNER TO postgres;

--
-- Name: marcas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.marcas_id_seq OWNED BY public.marcas.id;


--
-- Name: modelos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modelos (
    id integer NOT NULL,
    nombre text NOT NULL,
    marca_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    descripcion text
);


ALTER TABLE public.modelos OWNER TO postgres;

--
-- Name: modelos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.modelos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.modelos_id_seq OWNER TO postgres;

--
-- Name: modelos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.modelos_id_seq OWNED BY public.modelos.id;


--
-- Name: pagos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pagos (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    monto double precision NOT NULL,
    metodo public."MetodoPago" NOT NULL,
    referencia text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.pagos OWNER TO postgres;

--
-- Name: pagos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pagos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pagos_id_seq OWNER TO postgres;

--
-- Name: pagos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pagos_id_seq OWNED BY public.pagos.id;


--
-- Name: pasos_reparacion_frecuente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pasos_reparacion_frecuente (
    id integer NOT NULL,
    reparacion_frecuente_id integer NOT NULL,
    descripcion text NOT NULL,
    orden integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.pasos_reparacion_frecuente OWNER TO postgres;

--
-- Name: pasos_reparacion_frecuente_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pasos_reparacion_frecuente_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pasos_reparacion_frecuente_id_seq OWNER TO postgres;

--
-- Name: pasos_reparacion_frecuente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pasos_reparacion_frecuente_id_seq OWNED BY public.pasos_reparacion_frecuente.id;


--
-- Name: permisos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permisos (
    id integer NOT NULL,
    codigo text NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    categoria text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.permisos OWNER TO postgres;

--
-- Name: permisos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permisos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.permisos_id_seq OWNER TO postgres;

--
-- Name: permisos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permisos_id_seq OWNED BY public.permisos.id;


--
-- Name: piezas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.piezas (
    id integer NOT NULL,
    nombre text NOT NULL,
    marca_id integer NOT NULL,
    modelo_id integer NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    precio double precision NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.piezas OWNER TO postgres;

--
-- Name: piezas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.piezas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.piezas_id_seq OWNER TO postgres;

--
-- Name: piezas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.piezas_id_seq OWNED BY public.piezas.id;


--
-- Name: piezas_reparacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.piezas_reparacion (
    id integer NOT NULL,
    reparacion_id integer NOT NULL,
    pieza_id integer NOT NULL,
    cantidad integer NOT NULL,
    precio double precision NOT NULL,
    total double precision NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.piezas_reparacion OWNER TO postgres;

--
-- Name: piezas_reparacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.piezas_reparacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.piezas_reparacion_id_seq OWNER TO postgres;

--
-- Name: piezas_reparacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.piezas_reparacion_id_seq OWNED BY public.piezas_reparacion.id;


--
-- Name: precios_venta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.precios_venta (
    id integer NOT NULL,
    tipo public."TipoProducto" NOT NULL,
    nombre text NOT NULL,
    marca text,
    modelo text,
    precio_compra_promedio double precision NOT NULL,
    precio_venta double precision NOT NULL,
    producto_id integer,
    servicio_id integer,
    created_by text NOT NULL,
    updated_by text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.precios_venta OWNER TO postgres;

--
-- Name: precios_venta_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.precios_venta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.precios_venta_id_seq OWNER TO postgres;

--
-- Name: precios_venta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.precios_venta_id_seq OWNED BY public.precios_venta.id;


--
-- Name: presupuestos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.presupuestos (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    total double precision NOT NULL,
    descuento double precision DEFAULT 0 NOT NULL,
    total_final double precision NOT NULL,
    aprobado boolean DEFAULT false NOT NULL,
    fecha_aprobacion timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.presupuestos OWNER TO postgres;

--
-- Name: presupuestos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.presupuestos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.presupuestos_id_seq OWNER TO postgres;

--
-- Name: presupuestos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.presupuestos_id_seq OWNED BY public.presupuestos.id;


--
-- Name: problemas_frecuentes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.problemas_frecuentes (
    id integer NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.problemas_frecuentes OWNER TO postgres;

--
-- Name: problemas_frecuentes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.problemas_frecuentes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.problemas_frecuentes_id_seq OWNER TO postgres;

--
-- Name: problemas_frecuentes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.problemas_frecuentes_id_seq OWNED BY public.problemas_frecuentes.id;


--
-- Name: productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos (
    id integer NOT NULL,
    nombre text NOT NULL,
    marca_id integer NOT NULL,
    modelo_id integer NOT NULL,
    proveedor_id integer NOT NULL,
    categoria_id integer NOT NULL,
    precio_promedio double precision NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    tipo_servicio_id integer,
    stock_maximo integer NOT NULL,
    stock_minimo integer NOT NULL,
    tipo public."TipoProducto" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.productos OWNER TO postgres;

--
-- Name: productos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.productos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.productos_id_seq OWNER TO postgres;

--
-- Name: productos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.productos_id_seq OWNED BY public.productos.id;


--
-- Name: productos_reparacion_frecuente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos_reparacion_frecuente (
    id integer NOT NULL,
    reparacion_frecuente_id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad integer NOT NULL,
    precio_venta double precision NOT NULL,
    concepto_extra text,
    precio_concepto_extra double precision,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.productos_reparacion_frecuente OWNER TO postgres;

--
-- Name: productos_reparacion_frecuente_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.productos_reparacion_frecuente_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.productos_reparacion_frecuente_id_seq OWNER TO postgres;

--
-- Name: productos_reparacion_frecuente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.productos_reparacion_frecuente_id_seq OWNED BY public.productos_reparacion_frecuente.id;


--
-- Name: proveedores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proveedores (
    id integer NOT NULL,
    nombre text NOT NULL,
    contacto text NOT NULL,
    telefono text NOT NULL,
    email text,
    direccion text,
    notas text,
    banco text NOT NULL,
    clabe_interbancaria text NOT NULL,
    cuenta_bancaria text NOT NULL,
    rfc text NOT NULL,
    tipo public."TipoProveedor" DEFAULT 'FISICA'::public."TipoProveedor" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.proveedores OWNER TO postgres;

--
-- Name: proveedores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.proveedores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.proveedores_id_seq OWNER TO postgres;

--
-- Name: proveedores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.proveedores_id_seq OWNED BY public.proveedores.id;


--
-- Name: puntos_recoleccion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.puntos_recoleccion (
    id integer NOT NULL,
    nombre text NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    email text,
    is_headquarters boolean DEFAULT false NOT NULL,
    location jsonb NOT NULL,
    parent_id integer,
    phone text,
    schedule jsonb NOT NULL,
    url text
);


ALTER TABLE public.puntos_recoleccion OWNER TO postgres;

--
-- Name: puntos_recoleccion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.puntos_recoleccion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.puntos_recoleccion_id_seq OWNER TO postgres;

--
-- Name: puntos_recoleccion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.puntos_recoleccion_id_seq OWNED BY public.puntos_recoleccion.id;


--
-- Name: reparaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reparaciones (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    diagnostico text,
    solucion text,
    observaciones text,
    fecha_inicio timestamp(3) without time zone NOT NULL,
    fecha_fin timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.reparaciones OWNER TO postgres;

--
-- Name: reparaciones_frecuentes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reparaciones_frecuentes (
    id integer NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.reparaciones_frecuentes OWNER TO postgres;

--
-- Name: reparaciones_frecuentes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reparaciones_frecuentes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reparaciones_frecuentes_id_seq OWNER TO postgres;

--
-- Name: reparaciones_frecuentes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reparaciones_frecuentes_id_seq OWNED BY public.reparaciones_frecuentes.id;


--
-- Name: reparaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reparaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reparaciones_id_seq OWNER TO postgres;

--
-- Name: reparaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reparaciones_id_seq OWNED BY public.reparaciones.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: roles_permisos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles_permisos (
    id integer NOT NULL,
    rol_id integer NOT NULL,
    permiso_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.roles_permisos OWNER TO postgres;

--
-- Name: roles_permisos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_permisos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_permisos_id_seq OWNER TO postgres;

--
-- Name: roles_permisos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_permisos_id_seq OWNED BY public.roles_permisos.id;


--
-- Name: salidas_almacen; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salidas_almacen (
    id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad integer NOT NULL,
    razon text NOT NULL,
    tipo public."TipoSalida" NOT NULL,
    referencia text,
    fecha timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usuario_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.salidas_almacen OWNER TO postgres;

--
-- Name: salidas_almacen_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.salidas_almacen_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.salidas_almacen_id_seq OWNER TO postgres;

--
-- Name: salidas_almacen_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.salidas_almacen_id_seq OWNED BY public.salidas_almacen.id;


--
-- Name: ticket_problemas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket_problemas (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    problema_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.ticket_problemas OWNER TO postgres;

--
-- Name: ticket_problemas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ticket_problemas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ticket_problemas_id_seq OWNER TO postgres;

--
-- Name: ticket_problemas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ticket_problemas_id_seq OWNED BY public.ticket_problemas.id;


--
-- Name: tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets (
    id integer NOT NULL,
    numero_ticket text NOT NULL,
    fecha_recepcion timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    cliente_id integer NOT NULL,
    tipo_servicio_id integer NOT NULL,
    modelo_id integer NOT NULL,
    descripcion_problema text,
    estatus_reparacion_id integer NOT NULL,
    creador_id integer NOT NULL,
    tecnico_asignado_id integer,
    punto_recoleccion_id integer,
    recogida boolean DEFAULT false NOT NULL,
    fecha_entrega timestamp(3) without time zone,
    entregado boolean DEFAULT false NOT NULL,
    cancelado boolean DEFAULT false NOT NULL,
    motivo_cancelacion text,
    fecha_inicio_diagnostico timestamp(3) without time zone,
    fecha_fin_diagnostico timestamp(3) without time zone,
    fecha_inicio_reparacion timestamp(3) without time zone,
    fecha_fin_reparacion timestamp(3) without time zone,
    fecha_cancelacion timestamp(3) without time zone,
    direccion_id integer,
    imei text,
    capacidad text,
    color text,
    fecha_compra timestamp(3) without time zone,
    codigo_desbloqueo text,
    red_celular text,
    patron_desbloqueo integer[] DEFAULT ARRAY[]::integer[],
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tickets OWNER TO postgres;

--
-- Name: tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tickets_id_seq OWNER TO postgres;

--
-- Name: tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tickets_id_seq OWNED BY public.tickets.id;


--
-- Name: tipos_servicio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipos_servicio (
    id integer NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tipos_servicio OWNER TO postgres;

--
-- Name: tipos_servicio_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tipos_servicio_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tipos_servicio_id_seq OWNER TO postgres;

--
-- Name: tipos_servicio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipos_servicio_id_seq OWNED BY public.tipos_servicio.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre text NOT NULL,
    apellido_paterno text NOT NULL,
    apellido_materno text,
    email text NOT NULL,
    password_hash text NOT NULL,
    telefono text,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: usuarios_puntos_recoleccion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios_puntos_recoleccion (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    punto_recoleccion_id integer NOT NULL,
    nivel public."NivelUsuarioPunto" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.usuarios_puntos_recoleccion OWNER TO postgres;

--
-- Name: usuarios_puntos_recoleccion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_puntos_recoleccion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.usuarios_puntos_recoleccion_id_seq OWNER TO postgres;

--
-- Name: usuarios_puntos_recoleccion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_puntos_recoleccion_id_seq OWNED BY public.usuarios_puntos_recoleccion.id;


--
-- Name: usuarios_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios_roles (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    rol_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.usuarios_roles OWNER TO postgres;

--
-- Name: usuarios_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.usuarios_roles_id_seq OWNER TO postgres;

--
-- Name: usuarios_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_roles_id_seq OWNED BY public.usuarios_roles.id;


--
-- Name: categorias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias ALTER COLUMN id SET DEFAULT nextval('public.categorias_id_seq'::regclass);


--
-- Name: checklist_diagnostico id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_diagnostico ALTER COLUMN id SET DEFAULT nextval('public.checklist_diagnostico_id_seq'::regclass);


--
-- Name: checklist_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_items ALTER COLUMN id SET DEFAULT nextval('public.checklist_items_id_seq'::regclass);


--
-- Name: clientes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes ALTER COLUMN id SET DEFAULT nextval('public.clientes_id_seq'::regclass);


--
-- Name: conceptos_presupuesto id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conceptos_presupuesto ALTER COLUMN id SET DEFAULT nextval('public.conceptos_presupuesto_id_seq'::regclass);


--
-- Name: direcciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.direcciones ALTER COLUMN id SET DEFAULT nextval('public.direcciones_id_seq'::regclass);


--
-- Name: dispositivos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispositivos ALTER COLUMN id SET DEFAULT nextval('public.dispositivos_id_seq'::regclass);


--
-- Name: entradas_almacen id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entradas_almacen ALTER COLUMN id SET DEFAULT nextval('public.entradas_almacen_id_seq'::regclass);


--
-- Name: entregas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entregas ALTER COLUMN id SET DEFAULT nextval('public.entregas_id_seq'::regclass);


--
-- Name: estatus_reparacion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estatus_reparacion ALTER COLUMN id SET DEFAULT nextval('public.estatus_reparacion_id_seq'::regclass);


--
-- Name: fotos_producto id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fotos_producto ALTER COLUMN id SET DEFAULT nextval('public.fotos_producto_id_seq'::regclass);


--
-- Name: marcas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marcas ALTER COLUMN id SET DEFAULT nextval('public.marcas_id_seq'::regclass);


--
-- Name: modelos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modelos ALTER COLUMN id SET DEFAULT nextval('public.modelos_id_seq'::regclass);


--
-- Name: pagos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos ALTER COLUMN id SET DEFAULT nextval('public.pagos_id_seq'::regclass);


--
-- Name: pasos_reparacion_frecuente id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasos_reparacion_frecuente ALTER COLUMN id SET DEFAULT nextval('public.pasos_reparacion_frecuente_id_seq'::regclass);


--
-- Name: permisos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos ALTER COLUMN id SET DEFAULT nextval('public.permisos_id_seq'::regclass);


--
-- Name: piezas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.piezas ALTER COLUMN id SET DEFAULT nextval('public.piezas_id_seq'::regclass);


--
-- Name: piezas_reparacion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.piezas_reparacion ALTER COLUMN id SET DEFAULT nextval('public.piezas_reparacion_id_seq'::regclass);


--
-- Name: precios_venta id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.precios_venta ALTER COLUMN id SET DEFAULT nextval('public.precios_venta_id_seq'::regclass);


--
-- Name: presupuestos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuestos ALTER COLUMN id SET DEFAULT nextval('public.presupuestos_id_seq'::regclass);


--
-- Name: problemas_frecuentes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problemas_frecuentes ALTER COLUMN id SET DEFAULT nextval('public.problemas_frecuentes_id_seq'::regclass);


--
-- Name: productos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos ALTER COLUMN id SET DEFAULT nextval('public.productos_id_seq'::regclass);


--
-- Name: productos_reparacion_frecuente id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos_reparacion_frecuente ALTER COLUMN id SET DEFAULT nextval('public.productos_reparacion_frecuente_id_seq'::regclass);


--
-- Name: proveedores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedores ALTER COLUMN id SET DEFAULT nextval('public.proveedores_id_seq'::regclass);


--
-- Name: puntos_recoleccion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntos_recoleccion ALTER COLUMN id SET DEFAULT nextval('public.puntos_recoleccion_id_seq'::regclass);


--
-- Name: reparaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reparaciones ALTER COLUMN id SET DEFAULT nextval('public.reparaciones_id_seq'::regclass);


--
-- Name: reparaciones_frecuentes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reparaciones_frecuentes ALTER COLUMN id SET DEFAULT nextval('public.reparaciones_frecuentes_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: roles_permisos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles_permisos ALTER COLUMN id SET DEFAULT nextval('public.roles_permisos_id_seq'::regclass);


--
-- Name: salidas_almacen id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salidas_almacen ALTER COLUMN id SET DEFAULT nextval('public.salidas_almacen_id_seq'::regclass);


--
-- Name: ticket_problemas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_problemas ALTER COLUMN id SET DEFAULT nextval('public.ticket_problemas_id_seq'::regclass);


--
-- Name: tickets id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets ALTER COLUMN id SET DEFAULT nextval('public.tickets_id_seq'::regclass);


--
-- Name: tipos_servicio id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_servicio ALTER COLUMN id SET DEFAULT nextval('public.tipos_servicio_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: usuarios_puntos_recoleccion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_puntos_recoleccion ALTER COLUMN id SET DEFAULT nextval('public.usuarios_puntos_recoleccion_id_seq'::regclass);


--
-- Name: usuarios_roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_roles ALTER COLUMN id SET DEFAULT nextval('public.usuarios_roles_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
f7b44872-f6fe-4de0-8bd1-a2cb680604aa	4688fa15c1c2452a61ba2f58312ad2fe2d2535be66a5ed78ae3ba9cbc16a0196	2025-06-13 13:10:49.983975+02	20250609203100_initial_schema	\N	\N	2025-06-13 13:10:49.973794+02	1
296c01f0-9f09-4b4e-9363-de6cbd6c6fb6	1b72bc824f43afc5ab390d1d7eef2777258312286eb3489d5933d3ec9d99d164	2025-06-13 13:10:50.003203+02	20250609203200_initial_schema	\N	\N	2025-06-13 13:10:49.984486+02	1
5e217a0c-19a6-4309-8a9b-8eba0f8908d4	0bd4e4114ff9092046ebab29b71c2eaf8739be521fc9f2dc375cc80d635cec03	2025-06-13 13:10:50.020363+02	20250609203300_reparaciones_schema	\N	\N	2025-06-13 13:10:50.003733+02	1
e64cd177-10de-4cd0-b857-638f0fbdcfda	9fe1475ab1d5200ac4e5d97eb7eaa42eb45bf721d67a9308aad5ef7bf7c56b78	2025-06-13 13:10:50.063262+02	20250610014311_add_unique_constraints	\N	\N	2025-06-13 13:10:50.021196+02	1
6ed008c7-6d11-479b-af50-123088c2bc94	4fa9e49047158abbba76484ddc9e50ded9f8c6c3ba29795c58027e937716dc82	2025-06-13 13:10:50.064496+02	20250612194726_add_orden_color_activo_to_estatus_reparacion	\N	\N	2025-06-13 13:10:50.063683+02	1
606e2947-9871-406c-89c5-fd7723e63a45	7c86f33152ed328afaedee9fb110fc460cc38829bbbeddb30d895e5577ff4099	2025-06-13 13:10:50.066583+02	20250612203207_add_descripcion_to_modelo	\N	\N	2025-06-13 13:10:50.065117+02	1
7670fb64-5f8d-4888-939e-7961cbb5117d	8c5736265986bd1f61ff8d6f450cc93643667fb485d9b48c638eb2393c7c3c05	2025-06-13 13:10:50.068292+02	20250612220121_update_checklist_item_model	\N	\N	2025-06-13 13:10:50.067117+02	1
ccbccc41-5f28-4ca8-9908-dcbdf5823f35	5711ccf6ae8b79ef8ea17dfda1a70227d33e04399956af8bd69c089cceea284e	2025-06-13 13:10:50.069918+02	20250613004309_make_checklist_diagnostico_optional	\N	\N	2025-06-13 13:10:50.068648+02	1
cf99056c-fde5-4af0-a6f6-1918b72e6935	146df6cb3f561d8331738f9aa36ad4a1486c9a8d6e43b40242da597ba6966af6	2025-06-13 13:10:50.073273+02	20250613010228_add_precios_venta	\N	\N	2025-06-13 13:10:50.070245+02	1
3eb29967-32ed-48da-bc3c-56b9b6e265f6	27da7e7351f8a314e4afd5a70f8d34960025154112139b26afd407fc7b248b28	2025-06-13 13:10:50.077451+02	20250613094202_update_punto_recoleccion	\N	\N	2025-06-13 13:10:50.07361+02	1
9dae329c-94b5-425a-86ba-5436f7af4009	42ebdb71440aa1131f75666df3fcad4b7e06f6167769ab5a3f21ce0a3f9d3f9e	2025-06-13 13:10:50.078913+02	20250613104854_add_creado_por_to_cliente	\N	\N	2025-06-13 13:10:50.077775+02	1
f732366e-167a-41d3-92c6-79e703eb80c4	4396595fe8aa171bc83317cef8c5330506252c16bb8570c0d7562b862b9a1a8b	2025-06-13 13:26:40.764844+02	20250613112640_add_tipo_registro_to_cliente	\N	\N	2025-06-13 13:26:40.762446+02	1
\.


--
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categorias (id, nombre, descripcion, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: checklist_diagnostico; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checklist_diagnostico (id, reparacion_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: checklist_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checklist_items (id, checklist_diagnostico_id, descripcion, created_at, updated_at, nombre, para_diagnostico, para_reparacion) FROM stdin;
1	\N		2025-06-13 12:27:03.749	2025-06-13 12:27:03.749	¿Golpes visibles?	t	t
2	\N		2025-06-13 12:27:16.241	2025-06-13 12:27:16.241	¿Botón de encendido funcionando?	t	t
3	\N		2025-06-13 12:27:28.935	2025-06-13 12:27:28.935	¿Cámara frontal funcionando?	t	t
4	\N		2025-06-13 12:27:37.76	2025-06-13 12:27:37.76	¿Pantalla funcionando?	t	t
\.


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clientes (id, nombre, apellido_paterno, apellido_materno, telefono_celular, telefono_contacto, email, calle, numero_exterior, numero_interior, colonia, ciudad, estado, codigo_postal, latitud, longitud, fuente_referencia, rfc, password_hash, tipo_registro, created_at, updated_at, creado_por_id) FROM stdin;
\.


--
-- Data for Name: conceptos_presupuesto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conceptos_presupuesto (id, presupuesto_id, descripcion, cantidad, precio_unitario, total, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: direcciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.direcciones (id, cliente_id, calle, numero_exterior, numero_interior, colonia, ciudad, estado, codigo_postal, latitud, longitud, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: dispositivos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dispositivos (id, ticket_id, tipo, marca, modelo, serie, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: entradas_almacen; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.entradas_almacen (id, producto_id, cantidad, precio_compra, notas, fecha, usuario_id, proveedor_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: entregas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.entregas (id, ticket_id, tipo, direccion, notas, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: estatus_reparacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estatus_reparacion (id, nombre, descripcion, created_at, updated_at, activo, color, orden) FROM stdin;
1	Recibido	El dispositivo ha sido recibido y está pendiente de diagnóstico	2025-06-13 11:10:52.333	2025-06-13 11:10:52.331	\N	\N	1
2	En Diagnóstico	El dispositivo está siendo diagnosticado	2025-06-13 11:10:52.337	2025-06-13 11:10:52.336	\N	\N	2
3	Diagnóstico Completado	El diagnóstico ha sido completado	2025-06-13 11:10:52.339	2025-06-13 11:10:52.338	\N	\N	3
4	En Reparación	El dispositivo está siendo reparado	2025-06-13 11:10:52.343	2025-06-13 11:10:52.342	\N	\N	4
5	Reparación Completada	La reparación ha sido completada	2025-06-13 11:10:52.344	2025-06-13 11:10:52.344	\N	\N	5
6	Listo para Entrega	El dispositivo está listo para ser entregado	2025-06-13 11:10:52.346	2025-06-13 11:10:52.345	\N	\N	6
7	Entregado	El dispositivo ha sido entregado al cliente	2025-06-13 11:10:52.347	2025-06-13 11:10:52.346	\N	\N	7
8	Cancelado	El ticket ha sido cancelado	2025-06-13 11:10:52.349	2025-06-13 11:10:52.348	\N	\N	8
\.


--
-- Data for Name: fotos_producto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fotos_producto (id, producto_id, url, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: marcas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marcas (id, nombre, descripcion, created_at, updated_at) FROM stdin;
10	Apple	\N	2025-06-13 12:10:55.169	2025-06-13 12:10:55.169
11	Xiaomi	\N	2025-06-13 12:10:55.169	2025-06-13 12:10:55.169
12	Samsung	\N	2025-06-13 12:10:55.169	2025-06-13 12:10:55.169
13	OnePlus	\N	2025-06-13 12:10:55.169	2025-06-13 12:10:55.169
14	Motorola	\N	2025-06-13 12:10:55.169	2025-06-13 12:10:55.169
15	Huawei	\N	2025-06-13 12:10:55.169	2025-06-13 12:10:55.169
16	Google	\N	2025-06-13 12:10:55.169	2025-06-13 12:10:55.169
17	Sony	\N	2025-06-13 12:10:55.169	2025-06-13 12:10:55.169
18	LG	\N	2025-06-13 12:10:55.169	2025-06-13 12:10:55.169
\.


--
-- Data for Name: modelos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modelos (id, nombre, marca_id, created_at, updated_at, descripcion) FROM stdin;
26	iPhone 15 Pro	10	2025-06-13 12:10:55.196	2025-06-13 12:10:55.196	\N
27	iPhone 15	10	2025-06-13 12:10:55.198	2025-06-13 12:10:55.198	\N
28	iPhone 14 Pro	10	2025-06-13 12:10:55.199	2025-06-13 12:10:55.199	\N
29	iPhone 14	10	2025-06-13 12:10:55.199	2025-06-13 12:10:55.199	\N
30	Galaxy S24 Ultra	12	2025-06-13 12:10:55.2	2025-06-13 12:10:55.2	\N
31	Galaxy S24+	12	2025-06-13 12:10:55.2	2025-06-13 12:10:55.2	\N
32	Galaxy S24	12	2025-06-13 12:10:55.201	2025-06-13 12:10:55.201	\N
33	Galaxy Z Fold 5	12	2025-06-13 12:10:55.202	2025-06-13 12:10:55.202	\N
34	Galaxy Z Flip 5	12	2025-06-13 12:10:55.203	2025-06-13 12:10:55.203	\N
35	Xiaomi 14 Ultra	11	2025-06-13 12:10:55.203	2025-06-13 12:10:55.203	\N
36	Xiaomi 14 Pro	11	2025-06-13 12:10:55.204	2025-06-13 12:10:55.204	\N
37	Xiaomi 14	11	2025-06-13 12:10:55.205	2025-06-13 12:10:55.205	\N
38	P60 Pro	15	2025-06-13 12:10:55.207	2025-06-13 12:10:55.207	\N
39	P60	15	2025-06-13 12:10:55.207	2025-06-13 12:10:55.207	\N
40	Mate 60 Pro	15	2025-06-13 12:10:55.208	2025-06-13 12:10:55.208	\N
41	Edge 40 Pro	14	2025-06-13 12:10:55.209	2025-06-13 12:10:55.209	\N
42	Edge 40	14	2025-06-13 12:10:55.21	2025-06-13 12:10:55.21	\N
43	G8	18	2025-06-13 12:10:55.21	2025-06-13 12:10:55.21	\N
44	V60	18	2025-06-13 12:10:55.211	2025-06-13 12:10:55.211	\N
45	Xperia 1 V	17	2025-06-13 12:10:55.211	2025-06-13 12:10:55.211	\N
46	Xperia 5 V	17	2025-06-13 12:10:55.212	2025-06-13 12:10:55.212	\N
47	OnePlus 12	13	2025-06-13 12:10:55.213	2025-06-13 12:10:55.213	\N
48	OnePlus Open	13	2025-06-13 12:10:55.213	2025-06-13 12:10:55.213	\N
49	Pixel 8 Pro	16	2025-06-13 12:10:55.214	2025-06-13 12:10:55.214	\N
50	Pixel 8	16	2025-06-13 12:10:55.214	2025-06-13 12:10:55.214	\N
51	iPhone 16	10	2025-06-13 12:13:08.039	2025-06-13 12:13:08.039	\N
52	iPhone 16 Ultra	10	2025-06-13 12:13:13.944	2025-06-13 12:13:13.944	\N
53	iPhone 16 Pro	10	2025-06-13 12:13:18.678	2025-06-13 12:13:18.678	\N
54	iPhone 16 Pro Max	10	2025-06-13 12:13:26.154	2025-06-13 12:13:26.154	\N
\.


--
-- Data for Name: pagos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pagos (id, ticket_id, monto, metodo, referencia, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: pasos_reparacion_frecuente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pasos_reparacion_frecuente (id, reparacion_frecuente_id, descripcion, orden, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: permisos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permisos (id, codigo, nombre, descripcion, categoria, created_at, updated_at) FROM stdin;
47	DASHBOARD_VIEW	Ver Dashboard	Permite ver el dashboard principal	DASHBOARD	2025-06-13 12:10:54.807	2025-06-13 12:10:54.807
48	COSTS_VIEW	Ver Costos	Permite ver la sección de costos	COSTS	2025-06-13 12:10:54.826	2025-06-13 12:10:54.826
49	COSTS_EDIT	Editar Costos	Permite editar información de costos	COSTS	2025-06-13 12:10:54.828	2025-06-13 12:10:54.828
50	CATALOG_VIEW	Ver Catálogo	Permite ver el catálogo	CATALOG	2025-06-13 12:10:54.828	2025-06-13 12:10:54.828
51	CATALOG_CREATE	Crear Catálogo	Permite crear elementos en el catálogo	CATALOG	2025-06-13 12:10:54.829	2025-06-13 12:10:54.829
52	CATALOG_EDIT	Editar Catálogo	Permite editar elementos del catálogo	CATALOG	2025-06-13 12:10:54.83	2025-06-13 12:10:54.83
53	CATALOG_DELETE	Eliminar Catálogo	Permite eliminar elementos del catálogo	CATALOG	2025-06-13 12:10:54.831	2025-06-13 12:10:54.831
54	INVENTORY_VIEW	Ver Inventario	Permite ver el inventario	INVENTORY	2025-06-13 12:10:54.831	2025-06-13 12:10:54.831
55	INVENTORY_CREATE	Crear Inventario	Permite crear elementos en el inventario	INVENTORY	2025-06-13 12:10:54.832	2025-06-13 12:10:54.832
56	INVENTORY_EDIT	Editar Inventario	Permite editar elementos del inventario	INVENTORY	2025-06-13 12:10:54.833	2025-06-13 12:10:54.833
57	INVENTORY_DELETE	Eliminar Inventario	Permite eliminar elementos del inventario	INVENTORY	2025-06-13 12:10:54.833	2025-06-13 12:10:54.833
58	CLIENTS_VIEW	Ver Clientes	Permite ver la lista de clientes	CLIENTS	2025-06-13 12:10:54.834	2025-06-13 12:10:54.834
59	CLIENTS_CREATE	Crear Cliente	Permite crear nuevos clientes	CLIENTS	2025-06-13 12:10:54.834	2025-06-13 12:10:54.834
60	CLIENTS_EDIT	Editar Cliente	Permite editar clientes existentes	CLIENTS	2025-06-13 12:10:54.835	2025-06-13 12:10:54.835
61	CLIENTS_DELETE	Eliminar Cliente	Permite eliminar clientes	CLIENTS	2025-06-13 12:10:54.835	2025-06-13 12:10:54.835
62	TICKETS_VIEW	Ver Tickets	Permite ver la lista de tickets	TICKETS	2025-06-13 12:10:54.836	2025-06-13 12:10:54.836
63	TICKETS_VIEW_DETAIL	Ver Detalle de Ticket	Permite ver el detalle de un ticket	TICKETS	2025-06-13 12:10:54.836	2025-06-13 12:10:54.836
64	TICKETS_CREATE	Crear Ticket	Permite crear nuevos tickets	TICKETS	2025-06-13 12:10:54.837	2025-06-13 12:10:54.837
65	TICKETS_EDIT	Editar Ticket	Permite editar tickets existentes	TICKETS	2025-06-13 12:10:54.837	2025-06-13 12:10:54.837
66	TICKETS_DELETE	Eliminar Ticket	Permite eliminar tickets	TICKETS	2025-06-13 12:10:54.838	2025-06-13 12:10:54.838
67	TICKETS_ASSIGN	Asignar Ticket	Permite asignar tickets a técnicos	TICKETS	2025-06-13 12:10:54.838	2025-06-13 12:10:54.838
68	REPAIRS_VIEW	Ver Reparaciones	Permite ver las reparaciones	REPAIRS	2025-06-13 12:10:54.839	2025-06-13 12:10:54.839
69	REPAIRS_CREATE	Crear Reparación	Permite crear nuevas reparaciones	REPAIRS	2025-06-13 12:10:54.84	2025-06-13 12:10:54.84
70	REPAIRS_EDIT	Editar Reparación	Permite editar reparaciones existentes	REPAIRS	2025-06-13 12:10:54.84	2025-06-13 12:10:54.84
71	REPAIRS_DELETE	Eliminar Reparación	Permite eliminar reparaciones	REPAIRS	2025-06-13 12:10:54.841	2025-06-13 12:10:54.841
72	USERS_VIEW	Ver Usuarios	Permite ver la lista de usuarios	USERS	2025-06-13 12:10:54.842	2025-06-13 12:10:54.842
73	USERS_CREATE	Crear Usuario	Permite crear nuevos usuarios	USERS	2025-06-13 12:10:54.843	2025-06-13 12:10:54.843
74	USERS_EDIT	Editar Usuario	Permite editar usuarios existentes	USERS	2025-06-13 12:10:54.843	2025-06-13 12:10:54.843
75	USERS_DELETE	Eliminar Usuario	Permite eliminar usuarios	USERS	2025-06-13 12:10:54.844	2025-06-13 12:10:54.844
76	ROLES_VIEW	Ver Roles	Permite ver la lista de roles	ROLES	2025-06-13 12:10:54.845	2025-06-13 12:10:54.845
77	ROLES_CREATE	Crear Rol	Permite crear nuevos roles	ROLES	2025-06-13 12:10:54.846	2025-06-13 12:10:54.846
78	ROLES_EDIT	Editar Rol	Permite editar roles existentes	ROLES	2025-06-13 12:10:54.846	2025-06-13 12:10:54.846
79	ROLES_DELETE	Eliminar Rol	Permite eliminar roles	ROLES	2025-06-13 12:10:54.847	2025-06-13 12:10:54.847
80	PERMISSIONS_VIEW	Ver Permisos	Permite ver la lista de permisos	PERMISSIONS	2025-06-13 12:10:54.848	2025-06-13 12:10:54.848
81	COLLECTION_POINTS_VIEW	Ver Puntos de Recolección	Permite ver los puntos de recolección	COLLECTION_POINTS	2025-06-13 12:10:54.848	2025-06-13 12:10:54.848
82	COLLECTION_POINTS_CREATE	Crear Punto de Recolección	Permite crear nuevos puntos de recolección	COLLECTION_POINTS	2025-06-13 12:10:54.849	2025-06-13 12:10:54.849
83	COLLECTION_POINTS_EDIT	Editar Punto de Recolección	Permite editar puntos de recolección existentes	COLLECTION_POINTS	2025-06-13 12:10:54.849	2025-06-13 12:10:54.849
84	COLLECTION_POINTS_DELETE	Eliminar Punto de Recolección	Permite eliminar puntos de recolección	COLLECTION_POINTS	2025-06-13 12:10:54.85	2025-06-13 12:10:54.85
85	PUNTO_USERS_VIEW	Ver Usuarios del Punto	Permite ver los usuarios asociados al punto de reparación	Punto de Reparación	2025-06-13 12:10:55.215	2025-06-13 12:10:55.215
86	PUNTO_USERS_CREATE	Crear Usuarios del Punto	Permite crear nuevos usuarios en el punto de reparación	Punto de Reparación	2025-06-13 12:10:55.216	2025-06-13 12:10:55.216
87	PUNTO_USERS_EDIT	Editar Usuarios del Punto	Permite editar usuarios del punto de reparación	Punto de Reparación	2025-06-13 12:10:55.216	2025-06-13 12:10:55.216
88	PUNTO_USERS_DELETE	Eliminar Usuarios del Punto	Permite eliminar usuarios del punto de reparación	Punto de Reparación	2025-06-13 12:10:55.216	2025-06-13 12:10:55.216
89	PUNTO_TICKETS_VIEW	Ver Tickets del Punto	Permite ver los tickets del punto de reparación	Punto de Reparación	2025-06-13 12:10:55.216	2025-06-13 12:10:55.216
90	PUNTO_TICKETS_CREATE	Crear Tickets del Punto	Permite crear tickets en el punto de reparación	Punto de Reparación	2025-06-13 12:10:55.217	2025-06-13 12:10:55.217
91	PUNTO_TICKETS_EDIT	Editar Tickets del Punto	Permite editar tickets del punto de reparación	Punto de Reparación	2025-06-13 12:10:55.217	2025-06-13 12:10:55.217
92	PUNTO_TICKETS_DELETE	Eliminar Tickets del Punto	Permite eliminar tickets del punto de reparación	Punto de Reparación	2025-06-13 12:10:55.217	2025-06-13 12:10:55.217
\.


--
-- Data for Name: piezas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.piezas (id, nombre, marca_id, modelo_id, stock, precio, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: piezas_reparacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.piezas_reparacion (id, reparacion_id, pieza_id, cantidad, precio, total, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: precios_venta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.precios_venta (id, tipo, nombre, marca, modelo, precio_compra_promedio, precio_venta, producto_id, servicio_id, created_by, updated_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: presupuestos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.presupuestos (id, ticket_id, total, descuento, total_final, aprobado, fecha_aprobacion, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: problemas_frecuentes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.problemas_frecuentes (id, nombre, descripcion, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos (id, nombre, marca_id, modelo_id, proveedor_id, categoria_id, precio_promedio, stock, tipo_servicio_id, stock_maximo, stock_minimo, tipo, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: productos_reparacion_frecuente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos_reparacion_frecuente (id, reparacion_frecuente_id, producto_id, cantidad, precio_venta, concepto_extra, precio_concepto_extra, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: proveedores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proveedores (id, nombre, contacto, telefono, email, direccion, notas, banco, clabe_interbancaria, cuenta_bancaria, rfc, tipo, created_at, updated_at) FROM stdin;
2	Aureliano Buendía García	Aureliano Buendía García	5544332211	aureliano@100anios.com	camino a macondo s/n	\N	Bienestar	09123092854	123412352345	BUGA670501	FISICA	2025-06-13 13:08:30.237	2025-06-13 13:08:30.237
\.


--
-- Data for Name: puntos_recoleccion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.puntos_recoleccion (id, nombre, activo, created_at, updated_at, email, is_headquarters, location, parent_id, phone, schedule, url) FROM stdin;
\.


--
-- Data for Name: reparaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reparaciones (id, ticket_id, diagnostico, solucion, observaciones, fecha_inicio, fecha_fin, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: reparaciones_frecuentes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reparaciones_frecuentes (id, nombre, descripcion, activo, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, nombre, descripcion, created_at, updated_at) FROM stdin;
4	ADMINISTRADOR	Acceso total al sistema con todos los permisos	2025-06-13 12:10:54.851	2025-06-13 12:10:54.851
5	ADMINISTRADOR_PUNTO	Administrador del punto de reparación	2025-06-13 12:10:55.217	2025-06-13 12:10:55.217
6	OPERADOR_PUNTO	Operador del punto de reparación	2025-06-13 12:10:55.229	2025-06-13 12:10:55.229
\.


--
-- Data for Name: roles_permisos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles_permisos (id, rol_id, permiso_id, created_at, updated_at) FROM stdin;
50	4	47	2025-06-13 12:10:54.853	2025-06-13 12:10:54.853
51	4	48	2025-06-13 12:10:54.855	2025-06-13 12:10:54.855
52	4	49	2025-06-13 12:10:54.856	2025-06-13 12:10:54.856
53	4	50	2025-06-13 12:10:54.857	2025-06-13 12:10:54.857
54	4	51	2025-06-13 12:10:54.857	2025-06-13 12:10:54.857
55	4	52	2025-06-13 12:10:54.858	2025-06-13 12:10:54.858
56	4	53	2025-06-13 12:10:54.859	2025-06-13 12:10:54.859
57	4	54	2025-06-13 12:10:54.859	2025-06-13 12:10:54.859
58	4	55	2025-06-13 12:10:54.86	2025-06-13 12:10:54.86
59	4	56	2025-06-13 12:10:54.86	2025-06-13 12:10:54.86
60	4	57	2025-06-13 12:10:54.861	2025-06-13 12:10:54.861
61	4	58	2025-06-13 12:10:54.862	2025-06-13 12:10:54.862
62	4	59	2025-06-13 12:10:54.862	2025-06-13 12:10:54.862
63	4	60	2025-06-13 12:10:54.863	2025-06-13 12:10:54.863
64	4	61	2025-06-13 12:10:54.863	2025-06-13 12:10:54.863
65	4	62	2025-06-13 12:10:54.864	2025-06-13 12:10:54.864
66	4	63	2025-06-13 12:10:54.865	2025-06-13 12:10:54.865
67	4	64	2025-06-13 12:10:54.865	2025-06-13 12:10:54.865
68	4	65	2025-06-13 12:10:54.866	2025-06-13 12:10:54.866
69	4	66	2025-06-13 12:10:54.866	2025-06-13 12:10:54.866
70	4	67	2025-06-13 12:10:54.867	2025-06-13 12:10:54.867
71	4	68	2025-06-13 12:10:54.868	2025-06-13 12:10:54.868
72	4	69	2025-06-13 12:10:54.868	2025-06-13 12:10:54.868
73	4	70	2025-06-13 12:10:54.869	2025-06-13 12:10:54.869
74	4	71	2025-06-13 12:10:54.869	2025-06-13 12:10:54.869
75	4	72	2025-06-13 12:10:54.87	2025-06-13 12:10:54.87
76	4	73	2025-06-13 12:10:54.87	2025-06-13 12:10:54.87
77	4	74	2025-06-13 12:10:54.871	2025-06-13 12:10:54.871
78	4	75	2025-06-13 12:10:54.871	2025-06-13 12:10:54.871
79	4	76	2025-06-13 12:10:54.872	2025-06-13 12:10:54.872
80	4	77	2025-06-13 12:10:54.873	2025-06-13 12:10:54.873
81	4	78	2025-06-13 12:10:54.873	2025-06-13 12:10:54.873
82	4	79	2025-06-13 12:10:54.874	2025-06-13 12:10:54.874
83	4	80	2025-06-13 12:10:54.874	2025-06-13 12:10:54.874
84	4	81	2025-06-13 12:10:54.875	2025-06-13 12:10:54.875
85	4	82	2025-06-13 12:10:54.875	2025-06-13 12:10:54.875
86	4	83	2025-06-13 12:10:54.876	2025-06-13 12:10:54.876
87	4	84	2025-06-13 12:10:54.876	2025-06-13 12:10:54.876
88	5	85	2025-06-13 12:10:55.218	2025-06-13 12:10:55.218
89	5	86	2025-06-13 12:10:55.219	2025-06-13 12:10:55.219
90	5	87	2025-06-13 12:10:55.219	2025-06-13 12:10:55.219
91	5	88	2025-06-13 12:10:55.22	2025-06-13 12:10:55.22
92	5	89	2025-06-13 12:10:55.22	2025-06-13 12:10:55.22
93	5	90	2025-06-13 12:10:55.221	2025-06-13 12:10:55.221
94	5	91	2025-06-13 12:10:55.222	2025-06-13 12:10:55.222
95	5	92	2025-06-13 12:10:55.222	2025-06-13 12:10:55.222
96	6	89	2025-06-13 12:10:55.23	2025-06-13 12:10:55.23
97	6	90	2025-06-13 12:10:55.23	2025-06-13 12:10:55.23
98	6	91	2025-06-13 12:10:55.231	2025-06-13 12:10:55.231
\.


--
-- Data for Name: salidas_almacen; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salidas_almacen (id, producto_id, cantidad, razon, tipo, referencia, fecha, usuario_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ticket_problemas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ticket_problemas (id, ticket_id, problema_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets (id, numero_ticket, fecha_recepcion, cliente_id, tipo_servicio_id, modelo_id, descripcion_problema, estatus_reparacion_id, creador_id, tecnico_asignado_id, punto_recoleccion_id, recogida, fecha_entrega, entregado, cancelado, motivo_cancelacion, fecha_inicio_diagnostico, fecha_fin_diagnostico, fecha_inicio_reparacion, fecha_fin_reparacion, fecha_cancelacion, direccion_id, imei, capacidad, color, fecha_compra, codigo_desbloqueo, red_celular, patron_desbloqueo, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tipos_servicio; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipos_servicio (id, nombre, descripcion, created_at, updated_at) FROM stdin;
6	Reparación de Celulares	\N	2025-06-13 12:12:29.266	2025-06-13 12:12:29.266
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nombre, apellido_paterno, apellido_materno, email, password_hash, telefono, activo, created_at, updated_at) FROM stdin;
1	Administrador	Admin		admin@example.com	$2a$10$a4Hul3hFHLe.3w2XYDI9bO2jSs.ZhUghegB7zt7oQUPsjq8YgMVky	\N	t	2025-06-13 11:10:52.103	2025-06-13 11:10:52.103
3	Técnico	Técnico		tecnico@example.com	$2a$10$yt3xzaJkGynvoxnsIl8lHeqez6oppK6vYLxFvbU8NgU/kXJUcW5bu	\N	t	2025-06-13 11:10:52.246	2025-06-13 11:10:52.246
4	Atención al Cliente	Cliente		atencion@example.com	$2a$10$/2eg96ieQujDmyv5XxAZK.K.1b6Lca0Zye3LSqor19cPNsuXsxI3y	\N	t	2025-06-13 11:10:52.329	2025-06-13 11:10:52.329
2	Sergio	Velazco		sergio@hoom.mx	$2a$10$NXdDt8UvmHzsXCYgVFciSuBKxlUcovGy7ix9PlsQkVupy68zlETC2	\N	t	2025-06-13 11:10:52.178	2025-06-13 12:10:55.019
\.


--
-- Data for Name: usuarios_puntos_recoleccion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios_puntos_recoleccion (id, usuario_id, punto_recoleccion_id, nivel, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: usuarios_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios_roles (id, usuario_id, rol_id, created_at, updated_at) FROM stdin;
3	1	4	2025-06-13 12:10:54.951	2025-06-13 12:10:54.951
4	2	4	2025-06-13 12:10:55.022	2025-06-13 12:10:55.022
\.


--
-- Name: categorias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categorias_id_seq', 1, false);


--
-- Name: checklist_diagnostico_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.checklist_diagnostico_id_seq', 1, false);


--
-- Name: checklist_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.checklist_items_id_seq', 4, true);


--
-- Name: clientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clientes_id_seq', 1, true);


--
-- Name: conceptos_presupuesto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conceptos_presupuesto_id_seq', 1, false);


--
-- Name: direcciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.direcciones_id_seq', 1, false);


--
-- Name: dispositivos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dispositivos_id_seq', 1, false);


--
-- Name: entradas_almacen_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.entradas_almacen_id_seq', 2, true);


--
-- Name: entregas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.entregas_id_seq', 1, false);


--
-- Name: estatus_reparacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estatus_reparacion_id_seq', 8, true);


--
-- Name: fotos_producto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fotos_producto_id_seq', 1, false);


--
-- Name: marcas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.marcas_id_seq', 18, true);


--
-- Name: modelos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.modelos_id_seq', 54, true);


--
-- Name: pagos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pagos_id_seq', 1, false);


--
-- Name: pasos_reparacion_frecuente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pasos_reparacion_frecuente_id_seq', 1, false);


--
-- Name: permisos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permisos_id_seq', 92, true);


--
-- Name: piezas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.piezas_id_seq', 1, false);


--
-- Name: piezas_reparacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.piezas_reparacion_id_seq', 1, false);


--
-- Name: precios_venta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.precios_venta_id_seq', 4, true);


--
-- Name: presupuestos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.presupuestos_id_seq', 1, false);


--
-- Name: problemas_frecuentes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.problemas_frecuentes_id_seq', 1, false);


--
-- Name: productos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productos_id_seq', 4, true);


--
-- Name: productos_reparacion_frecuente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productos_reparacion_frecuente_id_seq', 1, false);


--
-- Name: proveedores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.proveedores_id_seq', 2, true);


--
-- Name: puntos_recoleccion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.puntos_recoleccion_id_seq', 1, false);


--
-- Name: reparaciones_frecuentes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reparaciones_frecuentes_id_seq', 1, false);


--
-- Name: reparaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reparaciones_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 6, true);


--
-- Name: roles_permisos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_permisos_id_seq', 98, true);


--
-- Name: salidas_almacen_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.salidas_almacen_id_seq', 1, false);


--
-- Name: ticket_problemas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ticket_problemas_id_seq', 1, false);


--
-- Name: tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tickets_id_seq', 1, false);


--
-- Name: tipos_servicio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipos_servicio_id_seq', 6, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 5, true);


--
-- Name: usuarios_puntos_recoleccion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_puntos_recoleccion_id_seq', 1, false);


--
-- Name: usuarios_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_roles_id_seq', 4, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (id);


--
-- Name: checklist_diagnostico checklist_diagnostico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_diagnostico
    ADD CONSTRAINT checklist_diagnostico_pkey PRIMARY KEY (id);


--
-- Name: checklist_items checklist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_items
    ADD CONSTRAINT checklist_items_pkey PRIMARY KEY (id);


--
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);


--
-- Name: conceptos_presupuesto conceptos_presupuesto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conceptos_presupuesto
    ADD CONSTRAINT conceptos_presupuesto_pkey PRIMARY KEY (id);


--
-- Name: direcciones direcciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.direcciones
    ADD CONSTRAINT direcciones_pkey PRIMARY KEY (id);


--
-- Name: dispositivos dispositivos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispositivos
    ADD CONSTRAINT dispositivos_pkey PRIMARY KEY (id);


--
-- Name: entradas_almacen entradas_almacen_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entradas_almacen
    ADD CONSTRAINT entradas_almacen_pkey PRIMARY KEY (id);


--
-- Name: entregas entregas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entregas
    ADD CONSTRAINT entregas_pkey PRIMARY KEY (id);


--
-- Name: estatus_reparacion estatus_reparacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estatus_reparacion
    ADD CONSTRAINT estatus_reparacion_pkey PRIMARY KEY (id);


--
-- Name: fotos_producto fotos_producto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fotos_producto
    ADD CONSTRAINT fotos_producto_pkey PRIMARY KEY (id);


--
-- Name: marcas marcas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marcas
    ADD CONSTRAINT marcas_pkey PRIMARY KEY (id);


--
-- Name: modelos modelos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modelos
    ADD CONSTRAINT modelos_pkey PRIMARY KEY (id);


--
-- Name: pagos pagos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_pkey PRIMARY KEY (id);


--
-- Name: pasos_reparacion_frecuente pasos_reparacion_frecuente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasos_reparacion_frecuente
    ADD CONSTRAINT pasos_reparacion_frecuente_pkey PRIMARY KEY (id);


--
-- Name: permisos permisos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos
    ADD CONSTRAINT permisos_pkey PRIMARY KEY (id);


--
-- Name: piezas piezas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.piezas
    ADD CONSTRAINT piezas_pkey PRIMARY KEY (id);


--
-- Name: piezas_reparacion piezas_reparacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.piezas_reparacion
    ADD CONSTRAINT piezas_reparacion_pkey PRIMARY KEY (id);


--
-- Name: precios_venta precios_venta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.precios_venta
    ADD CONSTRAINT precios_venta_pkey PRIMARY KEY (id);


--
-- Name: presupuestos presupuestos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuestos
    ADD CONSTRAINT presupuestos_pkey PRIMARY KEY (id);


--
-- Name: problemas_frecuentes problemas_frecuentes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.problemas_frecuentes
    ADD CONSTRAINT problemas_frecuentes_pkey PRIMARY KEY (id);


--
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (id);


--
-- Name: productos_reparacion_frecuente productos_reparacion_frecuente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos_reparacion_frecuente
    ADD CONSTRAINT productos_reparacion_frecuente_pkey PRIMARY KEY (id);


--
-- Name: proveedores proveedores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedores
    ADD CONSTRAINT proveedores_pkey PRIMARY KEY (id);


--
-- Name: puntos_recoleccion puntos_recoleccion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntos_recoleccion
    ADD CONSTRAINT puntos_recoleccion_pkey PRIMARY KEY (id);


--
-- Name: reparaciones_frecuentes reparaciones_frecuentes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reparaciones_frecuentes
    ADD CONSTRAINT reparaciones_frecuentes_pkey PRIMARY KEY (id);


--
-- Name: reparaciones reparaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reparaciones
    ADD CONSTRAINT reparaciones_pkey PRIMARY KEY (id);


--
-- Name: roles_permisos roles_permisos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles_permisos
    ADD CONSTRAINT roles_permisos_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: salidas_almacen salidas_almacen_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salidas_almacen
    ADD CONSTRAINT salidas_almacen_pkey PRIMARY KEY (id);


--
-- Name: ticket_problemas ticket_problemas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_problemas
    ADD CONSTRAINT ticket_problemas_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: tipos_servicio tipos_servicio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipos_servicio
    ADD CONSTRAINT tipos_servicio_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: usuarios_puntos_recoleccion usuarios_puntos_recoleccion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_puntos_recoleccion
    ADD CONSTRAINT usuarios_puntos_recoleccion_pkey PRIMARY KEY (id);


--
-- Name: usuarios_roles usuarios_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_roles
    ADD CONSTRAINT usuarios_roles_pkey PRIMARY KEY (id);


--
-- Name: categorias_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX categorias_nombre_key ON public.categorias USING btree (nombre);


--
-- Name: checklist_diagnostico_reparacion_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX checklist_diagnostico_reparacion_id_key ON public.checklist_diagnostico USING btree (reparacion_id);


--
-- Name: clientes_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX clientes_email_key ON public.clientes USING btree (email);


--
-- Name: dispositivos_ticket_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX dispositivos_ticket_id_key ON public.dispositivos USING btree (ticket_id);


--
-- Name: entregas_ticket_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX entregas_ticket_id_key ON public.entregas USING btree (ticket_id);


--
-- Name: estatus_reparacion_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX estatus_reparacion_nombre_key ON public.estatus_reparacion USING btree (nombre);


--
-- Name: marcas_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX marcas_nombre_key ON public.marcas USING btree (nombre);


--
-- Name: permisos_codigo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX permisos_codigo_key ON public.permisos USING btree (codigo);


--
-- Name: presupuestos_ticket_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX presupuestos_ticket_id_key ON public.presupuestos USING btree (ticket_id);


--
-- Name: reparaciones_ticket_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX reparaciones_ticket_id_key ON public.reparaciones USING btree (ticket_id);


--
-- Name: roles_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX roles_nombre_key ON public.roles USING btree (nombre);


--
-- Name: roles_permisos_rol_id_permiso_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX roles_permisos_rol_id_permiso_id_key ON public.roles_permisos USING btree (rol_id, permiso_id);


--
-- Name: tickets_direccion_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tickets_direccion_id_key ON public.tickets USING btree (direccion_id);


--
-- Name: tickets_imei_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tickets_imei_key ON public.tickets USING btree (imei);


--
-- Name: tickets_numero_ticket_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tickets_numero_ticket_key ON public.tickets USING btree (numero_ticket);


--
-- Name: tipos_servicio_nombre_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX tipos_servicio_nombre_key ON public.tipos_servicio USING btree (nombre);


--
-- Name: usuarios_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX usuarios_email_key ON public.usuarios USING btree (email);


--
-- Name: usuarios_roles_usuario_id_rol_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX usuarios_roles_usuario_id_rol_id_key ON public.usuarios_roles USING btree (usuario_id, rol_id);


--
-- Name: checklist_diagnostico checklist_diagnostico_reparacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_diagnostico
    ADD CONSTRAINT checklist_diagnostico_reparacion_id_fkey FOREIGN KEY (reparacion_id) REFERENCES public.reparaciones(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: checklist_items checklist_items_checklist_diagnostico_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_items
    ADD CONSTRAINT checklist_items_checklist_diagnostico_id_fkey FOREIGN KEY (checklist_diagnostico_id) REFERENCES public.checklist_diagnostico(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: clientes clientes_creado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_creado_por_id_fkey FOREIGN KEY (creado_por_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: conceptos_presupuesto conceptos_presupuesto_presupuesto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conceptos_presupuesto
    ADD CONSTRAINT conceptos_presupuesto_presupuesto_id_fkey FOREIGN KEY (presupuesto_id) REFERENCES public.presupuestos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: direcciones direcciones_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.direcciones
    ADD CONSTRAINT direcciones_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dispositivos dispositivos_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dispositivos
    ADD CONSTRAINT dispositivos_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: entradas_almacen entradas_almacen_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entradas_almacen
    ADD CONSTRAINT entradas_almacen_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: entradas_almacen entradas_almacen_proveedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entradas_almacen
    ADD CONSTRAINT entradas_almacen_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: entradas_almacen entradas_almacen_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entradas_almacen
    ADD CONSTRAINT entradas_almacen_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: entregas entregas_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entregas
    ADD CONSTRAINT entregas_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: fotos_producto fotos_producto_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fotos_producto
    ADD CONSTRAINT fotos_producto_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: modelos modelos_marca_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modelos
    ADD CONSTRAINT modelos_marca_id_fkey FOREIGN KEY (marca_id) REFERENCES public.marcas(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: pagos pagos_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: pasos_reparacion_frecuente pasos_reparacion_frecuente_reparacion_frecuente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pasos_reparacion_frecuente
    ADD CONSTRAINT pasos_reparacion_frecuente_reparacion_frecuente_id_fkey FOREIGN KEY (reparacion_frecuente_id) REFERENCES public.reparaciones_frecuentes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: piezas piezas_marca_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.piezas
    ADD CONSTRAINT piezas_marca_id_fkey FOREIGN KEY (marca_id) REFERENCES public.marcas(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: piezas piezas_modelo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.piezas
    ADD CONSTRAINT piezas_modelo_id_fkey FOREIGN KEY (modelo_id) REFERENCES public.modelos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: piezas_reparacion piezas_reparacion_pieza_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.piezas_reparacion
    ADD CONSTRAINT piezas_reparacion_pieza_id_fkey FOREIGN KEY (pieza_id) REFERENCES public.piezas(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: piezas_reparacion piezas_reparacion_reparacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.piezas_reparacion
    ADD CONSTRAINT piezas_reparacion_reparacion_id_fkey FOREIGN KEY (reparacion_id) REFERENCES public.reparaciones(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: precios_venta precios_venta_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.precios_venta
    ADD CONSTRAINT precios_venta_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: precios_venta precios_venta_servicio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.precios_venta
    ADD CONSTRAINT precios_venta_servicio_id_fkey FOREIGN KEY (servicio_id) REFERENCES public.tipos_servicio(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: presupuestos presupuestos_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuestos
    ADD CONSTRAINT presupuestos_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: productos productos_categoria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: productos productos_marca_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_marca_id_fkey FOREIGN KEY (marca_id) REFERENCES public.marcas(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: productos productos_modelo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_modelo_id_fkey FOREIGN KEY (modelo_id) REFERENCES public.modelos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: productos productos_proveedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: productos_reparacion_frecuente productos_reparacion_frecuente_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos_reparacion_frecuente
    ADD CONSTRAINT productos_reparacion_frecuente_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: productos_reparacion_frecuente productos_reparacion_frecuente_reparacion_frecuente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos_reparacion_frecuente
    ADD CONSTRAINT productos_reparacion_frecuente_reparacion_frecuente_id_fkey FOREIGN KEY (reparacion_frecuente_id) REFERENCES public.reparaciones_frecuentes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: productos productos_tipo_servicio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_tipo_servicio_id_fkey FOREIGN KEY (tipo_servicio_id) REFERENCES public.tipos_servicio(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: puntos_recoleccion puntos_recoleccion_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.puntos_recoleccion
    ADD CONSTRAINT puntos_recoleccion_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.puntos_recoleccion(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reparaciones reparaciones_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reparaciones
    ADD CONSTRAINT reparaciones_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: roles_permisos roles_permisos_permiso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles_permisos
    ADD CONSTRAINT roles_permisos_permiso_id_fkey FOREIGN KEY (permiso_id) REFERENCES public.permisos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: roles_permisos roles_permisos_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles_permisos
    ADD CONSTRAINT roles_permisos_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: salidas_almacen salidas_almacen_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salidas_almacen
    ADD CONSTRAINT salidas_almacen_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: salidas_almacen salidas_almacen_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salidas_almacen
    ADD CONSTRAINT salidas_almacen_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ticket_problemas ticket_problemas_problema_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_problemas
    ADD CONSTRAINT ticket_problemas_problema_id_fkey FOREIGN KEY (problema_id) REFERENCES public.problemas_frecuentes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ticket_problemas ticket_problemas_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket_problemas
    ADD CONSTRAINT ticket_problemas_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tickets tickets_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tickets tickets_creador_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_creador_id_fkey FOREIGN KEY (creador_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tickets tickets_direccion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_direccion_id_fkey FOREIGN KEY (direccion_id) REFERENCES public.direcciones(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tickets tickets_estatus_reparacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_estatus_reparacion_id_fkey FOREIGN KEY (estatus_reparacion_id) REFERENCES public.estatus_reparacion(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tickets tickets_modelo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_modelo_id_fkey FOREIGN KEY (modelo_id) REFERENCES public.modelos(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tickets tickets_punto_recoleccion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_punto_recoleccion_id_fkey FOREIGN KEY (punto_recoleccion_id) REFERENCES public.puntos_recoleccion(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tickets tickets_tecnico_asignado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_tecnico_asignado_id_fkey FOREIGN KEY (tecnico_asignado_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tickets tickets_tipo_servicio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_tipo_servicio_id_fkey FOREIGN KEY (tipo_servicio_id) REFERENCES public.tipos_servicio(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: usuarios_puntos_recoleccion usuarios_puntos_recoleccion_punto_recoleccion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_puntos_recoleccion
    ADD CONSTRAINT usuarios_puntos_recoleccion_punto_recoleccion_id_fkey FOREIGN KEY (punto_recoleccion_id) REFERENCES public.puntos_recoleccion(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: usuarios_puntos_recoleccion usuarios_puntos_recoleccion_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_puntos_recoleccion
    ADD CONSTRAINT usuarios_puntos_recoleccion_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: usuarios_roles usuarios_roles_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_roles
    ADD CONSTRAINT usuarios_roles_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: usuarios_roles usuarios_roles_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_roles
    ADD CONSTRAINT usuarios_roles_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

