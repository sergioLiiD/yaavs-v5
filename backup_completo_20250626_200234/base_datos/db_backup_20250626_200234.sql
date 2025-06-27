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
    'MORAL',
    'DISTRIBUIDOR',
    'FABRICANTE'
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
-- Name: checklist_reparacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checklist_reparacion (
    id integer NOT NULL,
    reparacion_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.checklist_reparacion OWNER TO postgres;

--
-- Name: checklist_reparacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.checklist_reparacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.checklist_reparacion_id_seq OWNER TO postgres;

--
-- Name: checklist_reparacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.checklist_reparacion_id_seq OWNED BY public.checklist_reparacion.id;


--
-- Name: checklist_respuesta_diagnostico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checklist_respuesta_diagnostico (
    id integer NOT NULL,
    checklist_diagnostico_id integer NOT NULL,
    checklist_item_id integer NOT NULL,
    respuesta boolean NOT NULL,
    observaciones text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.checklist_respuesta_diagnostico OWNER TO postgres;

--
-- Name: checklist_respuesta_diagnostico_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.checklist_respuesta_diagnostico_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.checklist_respuesta_diagnostico_id_seq OWNER TO postgres;

--
-- Name: checklist_respuesta_diagnostico_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.checklist_respuesta_diagnostico_id_seq OWNED BY public.checklist_respuesta_diagnostico.id;


--
-- Name: checklist_respuesta_reparacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checklist_respuesta_reparacion (
    id integer NOT NULL,
    checklist_reparacion_id integer NOT NULL,
    checklist_item_id integer NOT NULL,
    respuesta boolean NOT NULL,
    observaciones text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.checklist_respuesta_reparacion OWNER TO postgres;

--
-- Name: checklist_respuesta_reparacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.checklist_respuesta_reparacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.checklist_respuesta_reparacion_id_seq OWNER TO postgres;

--
-- Name: checklist_respuesta_reparacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.checklist_respuesta_reparacion_id_seq OWNED BY public.checklist_respuesta_reparacion.id;


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
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    creado_por_id integer,
    tipo_registro text,
    punto_recoleccion_id integer
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
    updated_at timestamp(3) without time zone NOT NULL,
    iva_incluido boolean DEFAULT true NOT NULL,
    saldo double precision DEFAULT 0 NOT NULL,
    pagado boolean DEFAULT false NOT NULL
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
    sku text NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    notas_internas text,
    garantia_valor integer,
    garantia_unidad text,
    categoria_id integer,
    marca_id integer,
    modelo_id integer,
    proveedor_id integer,
    precio_promedio double precision DEFAULT 0 NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    tipo_servicio_id integer,
    stock_maximo integer,
    stock_minimo integer,
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
    location jsonb,
    parent_id integer,
    phone text,
    schedule jsonb,
    url text,
    is_repair_point boolean DEFAULT false NOT NULL
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
    fecha_inicio timestamp(3) without time zone,
    fecha_fin timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    capacidad text,
    codigo_desbloqueo text,
    red_celular text,
    salud_bateria integer,
    version_so text,
    fecha_pausa timestamp(3) without time zone,
    fecha_reanudacion timestamp(3) without time zone
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
    updated_at timestamp(3) without time zone NOT NULL,
    tipo_desbloqueo text
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
-- Name: checklist_reparacion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_reparacion ALTER COLUMN id SET DEFAULT nextval('public.checklist_reparacion_id_seq'::regclass);


--
-- Name: checklist_respuesta_diagnostico id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_respuesta_diagnostico ALTER COLUMN id SET DEFAULT nextval('public.checklist_respuesta_diagnostico_id_seq'::regclass);


--
-- Name: checklist_respuesta_reparacion id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_respuesta_reparacion ALTER COLUMN id SET DEFAULT nextval('public.checklist_respuesta_reparacion_id_seq'::regclass);


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
4909d8ed-8b1a-458f-a6b6-74eaa59d668f	7b146969a11ad9b4c7954b4a7c20bc134190f26837de07ea008e5c539d9cc38d	2025-06-17 19:39:16.789577+02	20250616100334_init	\N	\N	2025-06-17 19:39:16.705847+02	1
6edf6a27-405b-4a8f-94bb-13ee64e77e53	c7671a898084b553163753e99f3a5d1f9e2d3564a27c062d3a13244a5359e016	2025-06-17 19:39:16.791609+02	20250616121148_add_pause_resume_dates	\N	\N	2025-06-17 19:39:16.790212+02	1
e51cd5b2-1a5e-4a8c-afb7-35d2009a187b	b2aff5b47c352351e7f6a563ea6d1b96de70a5f48a896e5ee47a22ed30051f90	2025-06-17 19:39:16.794123+02	20250616142037_remove_imei_unique_constraint	\N	\N	2025-06-17 19:39:16.792173+02	1
9a1483e6-84e8-4b25-b2c2-c86ba243252c	a28d36af030f5c67b1f381323114d4ebac6327ecfceb0a1b3083a7e1e5e83762	2025-06-17 19:39:16.800179+02	20250616143848_add_checklist_respuestas	\N	\N	2025-06-17 19:39:16.794685+02	1
1b13b877-57e9-4d4d-8f1f-1b169aae2ae5	190510a0b56a86b36bdf5f8ddf3de5514a83b76622a154be03ca1c85b0ae879c	2025-06-17 19:39:16.804309+02	20250616164101_update_checklist_respuesta_to_boolean	\N	\N	2025-06-17 19:39:16.800727+02	1
e1281349-b809-4182-8232-8fa3732c0df2	e5a9b0d40eeb9b9f63a36fdb943528e09c19e0f5d08343f5b7316b786f9d786b	2025-06-17 19:39:16.805533+02	20250616211622_add_tipo_desbloqueo	\N	\N	2025-06-17 19:39:16.804792+02	1
fa13e558-13a8-4303-bc6c-b9c65e7d82b0	fdf48022bc2e2f6de8ce55cd5619b917ce07c42f70f4d30397b03526ec49b5fe	2025-06-17 19:39:16.807891+02	20250617002938_add_punto_recoleccion_to_cliente	\N	\N	2025-06-17 19:39:16.805908+02	1
8ce3f50e-e119-4091-b591-916874bde219	142571ca3b85cd5f8ba05d860842cb5a67709150ab9a9bcf01515ee1cbc100b1	2025-06-17 19:39:16.810232+02	20250617130817_add_is_repair_point_to_puntos_recoleccion	\N	\N	2025-06-17 19:39:16.809+02	1
c493d62d-7870-4b9f-95c1-01417f56e2ba	b3766ad492b4f4cf23abab7c88cf20f5ef89004bed1d28bd5578bcfcabd0303b	2025-06-17 19:39:16.811904+02	20250617130921_agregar_reparacion_a_puntos_recoleccion	\N	\N	2025-06-17 19:39:16.811118+02	1
ddf8fb01-5ffd-404d-accf-dc9c837a6ad2	afa760c5a5bcc5ed4d2cb8e8928b229b8a5461aef1aeb4cc502cb4d905467f2f	2025-06-17 19:39:17.650599+02	20250617173917_add_checklist_reparacion	\N	\N	2025-06-17 19:39:17.640561+02	1
\.


--
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categorias (id, nombre, descripcion, created_at, updated_at) FROM stdin;
1	Reparación de Celulares	Categoría por defecto para productos de reparación de celulares	2025-06-17 17:42:32.574	2025-06-17 17:42:32.574
\.


--
-- Data for Name: checklist_diagnostico; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checklist_diagnostico (id, reparacion_id, created_at, updated_at) FROM stdin;
1	1	2025-06-17 22:25:30.281	2025-06-17 22:25:30.281
2	28	2025-06-18 17:21:36.171	2025-06-18 17:21:36.171
3	30	2025-06-18 18:10:24.265	2025-06-18 18:10:24.265
\.


--
-- Data for Name: checklist_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checklist_items (id, descripcion, created_at, updated_at, nombre, para_diagnostico, para_reparacion) FROM stdin;
1		2025-06-17 18:00:47.011	2025-06-17 18:00:47.011	¿Golpes Visibles?	t	t
2		2025-06-17 18:00:57.133	2025-06-17 18:00:57.133	¿Botones funcionando?	t	t
3		2025-06-17 18:01:09.948	2025-06-17 18:01:09.948	¿Prende y apaga correctamente?	t	t
4		2025-06-17 18:01:20.418	2025-06-17 18:01:20.418	¿Cámara delantera funcionando?	t	t
5		2025-06-17 18:01:28.986	2025-06-17 18:01:28.986	¿Altavoces funcionando?	t	t
6		2025-06-18 16:12:09.873	2025-06-18 16:12:09.873	¿Cámara trasera funcionando?	t	t
\.


--
-- Data for Name: checklist_reparacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checklist_reparacion (id, reparacion_id, created_at, updated_at) FROM stdin;
1	1	2025-06-17 23:58:45.488	2025-06-17 23:58:45.488
4	28	2025-06-18 18:26:32.696	2025-06-18 18:26:32.696
\.


--
-- Data for Name: checklist_respuesta_diagnostico; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checklist_respuesta_diagnostico (id, checklist_diagnostico_id, checklist_item_id, respuesta, observaciones, created_at, updated_at) FROM stdin;
110	3	3	t	\N	2025-06-18 18:10:24.287	2025-06-18 18:10:24.287
111	3	4	t	\N	2025-06-18 18:10:24.287	2025-06-18 18:10:24.287
112	3	6	t	\N	2025-06-18 18:10:24.287	2025-06-18 18:10:24.287
100	1	5	t	\N	2025-06-17 23:23:17.434	2025-06-17 23:23:17.434
96	1	1	t	pantalla rota	2025-06-17 23:23:17.433	2025-06-17 23:23:17.433
98	1	4	t	\N	2025-06-17 23:23:17.433	2025-06-17 23:23:17.433
97	1	2	t	\N	2025-06-17 23:23:17.433	2025-06-17 23:23:17.433
99	1	3	t	\N	2025-06-17 23:23:17.434	2025-06-17 23:23:17.434
102	2	2	t	\N	2025-06-18 17:21:36.408	2025-06-18 17:21:36.408
101	2	1	f	\N	2025-06-18 17:21:36.408	2025-06-18 17:21:36.408
104	2	3	t	\N	2025-06-18 17:21:36.408	2025-06-18 17:21:36.408
106	2	4	t	\N	2025-06-18 17:21:36.408	2025-06-18 17:21:36.408
103	2	6	t	\N	2025-06-18 17:21:36.408	2025-06-18 17:21:36.408
105	2	5	t	\N	2025-06-18 17:21:36.409	2025-06-18 17:21:36.409
107	3	1	t	pantalla ligeramente rota en la esquina superior derecha	2025-06-18 18:10:24.286	2025-06-18 18:10:24.286
108	3	2	t	\N	2025-06-18 18:10:24.286	2025-06-18 18:10:24.286
109	3	5	t	\N	2025-06-18 18:10:24.287	2025-06-18 18:10:24.287
\.


--
-- Data for Name: checklist_respuesta_reparacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checklist_respuesta_reparacion (id, checklist_reparacion_id, checklist_item_id, respuesta, observaciones, created_at, updated_at) FROM stdin;
36	1	2	f	\N	2025-06-18 02:13:11.507	2025-06-18 02:13:11.507
37	1	1	t	\N	2025-06-18 02:13:11.507	2025-06-18 02:13:11.507
38	1	3	t	\N	2025-06-18 02:13:11.507	2025-06-18 02:13:11.507
39	1	5	t	\N	2025-06-18 02:13:11.508	2025-06-18 02:13:11.508
40	1	4	t	\N	2025-06-18 02:13:11.508	2025-06-18 02:13:11.508
59	4	2	t	\N	2025-06-18 17:38:25.465	2025-06-18 17:38:25.465
60	4	1	f	\N	2025-06-18 17:38:25.465	2025-06-18 17:38:25.465
61	4	6	t	\N	2025-06-18 17:38:25.465	2025-06-18 17:38:25.465
62	4	4	t	\N	2025-06-18 17:38:25.465	2025-06-18 17:38:25.465
63	4	5	t	\N	2025-06-18 17:38:25.465	2025-06-18 17:38:25.465
64	4	3	t	\N	2025-06-18 17:38:25.465	2025-06-18 17:38:25.465
\.


--
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clientes (id, nombre, apellido_paterno, apellido_materno, telefono_celular, telefono_contacto, email, calle, numero_exterior, numero_interior, colonia, ciudad, estado, codigo_postal, latitud, longitud, fuente_referencia, rfc, password_hash, created_at, updated_at, creado_por_id, tipo_registro, punto_recoleccion_id) FROM stdin;
1	Roberto	Gómez 	Bolaños	5544332211	7711234567	chespirito@televisa.com	Bldv. Adolfo Lopez Mateos	1311		San Angel	Mexico	CDMX	02100	\N	\N		GOBR010101	\N	2025-06-17 18:08:57.204	2025-06-17 18:08:57.202	2	SISTEMA_CENTRAL	\N
2	Andrés Manuel	López	Obrador	5511223344	5500998877	amlo@4t.com	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	OBLA010101	\N	2025-06-18 00:18:18.75	2025-06-18 00:18:18.749	8	PUNTO_RECOLECCION	1
3	Claudia	Sheinbaum	Pardo	5555551100	55555555	claudia@mexico.com	Palacio Nacional 1	1		Centro	Mexico	CDMX	01000	\N	\N		SEPC010101	\N	2025-06-18 15:03:50.785	2025-06-18 15:03:50.784	2	SISTEMA_CENTRAL	\N
4	Cliente	Punto	Uno	5544332211	\N	cliente@puntouno.com	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-06-18 19:55:35.156	2025-06-18 20:08:15.966	\N	PUNTO_RECOLECCION	1
5	Cliente	Arregla	Mx	5544332211	\N	cliente@arregla.mx	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	$2a$10$93BOBpt2pl5yHrcS/PTP4Oweb5Z4MXV69HmVF8aeI3nx0Ag3XNbh2	2025-06-18 21:20:27.621	2025-06-18 21:20:27.621	\N	WEB	\N
\.


--
-- Data for Name: conceptos_presupuesto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conceptos_presupuesto (id, presupuesto_id, descripcion, cantidad, precio_unitario, total, created_at, updated_at) FROM stdin;
1	1	Mano de Obra	1	500	500	2025-06-17 22:09:01.145	2025-06-17 22:09:01.145
2	1	Pantalla iPhone 16 Pro	1	4000	4000	2025-06-17 22:09:01.145	2025-06-17 22:09:01.145
3	2	Mano de Obra	1	500	500	2025-06-18 16:24:38.804	2025-06-18 16:24:38.804
4	2	Batería iPhone 16 Pro	1	3100	3100	2025-06-18 16:24:38.804	2025-06-18 16:24:38.804
5	3	Mano de Obra	1	500	500	2025-06-18 18:10:37.106	2025-06-18 18:10:37.106
6	3	Pantalla iPhone 16 Pro	1	4000	4000	2025-06-18 18:10:37.106	2025-06-18 18:10:37.106
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
1	1	Celular	Apple	iPhone 16 Pro	123456789012345	2025-06-17 21:54:25.193	2025-06-17 21:54:25.193
2	3	Celular	Apple	iPhone 16 Ultra	111111111122222	2025-06-18 12:40:46.395	2025-06-18 12:40:46.395
3	4	Celular	Apple	iPhone 16 Pro Max	000000000011111	2025-06-18 15:12:04.405	2025-06-18 15:12:04.405
4	5	Celular	Apple	iPhone 16	123456789012345	2025-06-18 16:27:46.218	2025-06-18 16:27:46.218
5	9	Smartphone	Apple	iPhone 16 Pro	\N	2025-06-18 21:45:58.931	2025-06-18 21:45:58.929
\.


--
-- Data for Name: entradas_almacen; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.entradas_almacen (id, producto_id, cantidad, precio_compra, notas, fecha, usuario_id, proveedor_id, created_at, updated_at) FROM stdin;
3	6	10	2000		2025-06-17 21:35:56.032	2	3	2025-06-17 21:35:56.032	2025-06-17 21:35:56.032
4	5	10	3000		2025-06-17 21:36:05.529	2	3	2025-06-17 21:36:05.529	2025-06-17 21:36:05.529
5	6	5	2200		2025-06-18 16:13:32.27	2	3	2025-06-18 16:13:32.27	2025-06-18 16:13:32.27
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
28	Recibido	El dispositivo ha sido recibido y está pendiente de diagnóstico	2025-06-17 21:30:43.446	2025-06-17 21:30:43.446	t	\N	1
29	En Diagnóstico	El dispositivo está siendo analizado para determinar el problema	2025-06-17 21:30:43.447	2025-06-17 21:30:43.447	t	\N	2
30	Presupuesto Generado	Se ha generado el presupuesto para la reparación	2025-06-17 21:30:43.448	2025-06-17 21:30:43.448	t	\N	3
31	En Reparación	El dispositivo está siendo reparado	2025-06-17 21:30:43.448	2025-06-17 21:30:43.448	t	\N	4
32	Reparado	La reparación del dispositivo ha sido completada	2025-06-17 21:30:43.449	2025-06-17 21:30:43.449	t	\N	5
33	Entregado	El dispositivo ha sido entregado al cliente	2025-06-17 21:30:43.449	2025-06-17 21:30:43.449	t	\N	6
34	Cancelado	La reparación ha sido cancelada	2025-06-17 21:30:43.45	2025-06-17 21:30:43.45	t	\N	7
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
37	Apple	\N	2025-06-17 21:30:43.453	2025-06-17 21:30:43.453
38	Samsung	\N	2025-06-17 21:30:43.453	2025-06-17 21:30:43.453
39	OnePlus	\N	2025-06-17 21:30:43.453	2025-06-17 21:30:43.453
40	Huawei	\N	2025-06-17 21:30:43.453	2025-06-17 21:30:43.453
41	Motorola	\N	2025-06-17 21:30:43.453	2025-06-17 21:30:43.453
42	LG	\N	2025-06-17 21:30:43.453	2025-06-17 21:30:43.453
43	Sony	\N	2025-06-17 21:30:43.453	2025-06-17 21:30:43.453
44	Xiaomi	\N	2025-06-17 21:30:43.453	2025-06-17 21:30:43.453
45	Google	\N	2025-06-17 21:30:43.453	2025-06-17 21:30:43.453
\.


--
-- Data for Name: modelos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modelos (id, nombre, marca_id, created_at, updated_at, descripcion) FROM stdin;
110	iPhone 15 Pro	37	2025-06-17 21:30:43.475	2025-06-17 21:30:43.475	\N
111	iPhone 15	37	2025-06-17 21:30:43.479	2025-06-17 21:30:43.479	\N
112	iPhone 14 Pro	37	2025-06-17 21:30:43.48	2025-06-17 21:30:43.48	\N
113	iPhone 14	37	2025-06-17 21:30:43.481	2025-06-17 21:30:43.481	\N
114	Galaxy S24 Ultra	38	2025-06-17 21:30:43.482	2025-06-17 21:30:43.482	\N
115	Galaxy S24+	38	2025-06-17 21:30:43.483	2025-06-17 21:30:43.483	\N
116	Galaxy S24	38	2025-06-17 21:30:43.484	2025-06-17 21:30:43.484	\N
117	Galaxy Z Fold 5	38	2025-06-17 21:30:43.485	2025-06-17 21:30:43.485	\N
118	Galaxy Z Flip 5	38	2025-06-17 21:30:43.487	2025-06-17 21:30:43.487	\N
119	Xiaomi 14 Ultra	44	2025-06-17 21:30:43.487	2025-06-17 21:30:43.487	\N
120	Xiaomi 14 Pro	44	2025-06-17 21:30:43.488	2025-06-17 21:30:43.488	\N
121	Xiaomi 14	44	2025-06-17 21:30:43.489	2025-06-17 21:30:43.489	\N
122	P60 Pro	40	2025-06-17 21:30:43.49	2025-06-17 21:30:43.49	\N
123	P60	40	2025-06-17 21:30:43.491	2025-06-17 21:30:43.491	\N
124	Mate 60 Pro	40	2025-06-17 21:30:43.492	2025-06-17 21:30:43.492	\N
125	Edge 40 Pro	41	2025-06-17 21:30:43.492	2025-06-17 21:30:43.492	\N
126	Edge 40	41	2025-06-17 21:30:43.493	2025-06-17 21:30:43.493	\N
127	G8	42	2025-06-17 21:30:43.494	2025-06-17 21:30:43.494	\N
128	V60	42	2025-06-17 21:30:43.495	2025-06-17 21:30:43.495	\N
129	Xperia 1 V	43	2025-06-17 21:30:43.496	2025-06-17 21:30:43.496	\N
130	Xperia 5 V	43	2025-06-17 21:30:43.497	2025-06-17 21:30:43.497	\N
131	OnePlus 12	39	2025-06-17 21:30:43.497	2025-06-17 21:30:43.497	\N
132	OnePlus Open	39	2025-06-17 21:30:43.498	2025-06-17 21:30:43.498	\N
133	Pixel 8 Pro	45	2025-06-17 21:30:43.499	2025-06-17 21:30:43.499	\N
134	Pixel 8	45	2025-06-17 21:30:43.5	2025-06-17 21:30:43.5	\N
135	iPhone 16	37	2025-06-17 21:31:43.224	2025-06-17 21:31:43.224	\N
136	iPhone 16 Pro	37	2025-06-17 21:31:48.281	2025-06-17 21:31:48.281	\N
137	iPhone 16 Ultra	37	2025-06-17 21:31:54.785	2025-06-17 21:31:54.785	\N
138	iPhone 16 Pro Max	37	2025-06-17 21:32:01.797	2025-06-17 21:32:01.797	\N
139	iPhone 12	37	2025-06-18 16:10:29.67	2025-06-18 16:10:29.67	\N
\.


--
-- Data for Name: pagos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pagos (id, ticket_id, monto, metodo, referencia, created_at, updated_at) FROM stdin;
1	1	2000	EFECTIVO	\N	2025-06-17 22:09:08.964	2025-06-17 22:09:08.964
2	2	2000	EFECTIVO	\N	2025-06-18 16:25:11.715	2025-06-18 16:25:11.715
3	2	1500	EFECTIVO	\N	2025-06-18 17:28:47.191	2025-06-18 17:28:47.191
\.


--
-- Data for Name: pasos_reparacion_frecuente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pasos_reparacion_frecuente (id, reparacion_frecuente_id, descripcion, orden, created_at, updated_at) FROM stdin;
3	1	Asegurarse de sellar bien antes de cerrar	0	2025-06-18 00:08:07.746	2025-06-18 00:08:07.746
4	2	Asegurarse de que esté cargando adecuadamente antes de cerrar	0	2025-06-18 00:08:23.812	2025-06-18 00:08:23.812
\.


--
-- Data for Name: permisos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permisos (id, codigo, nombre, descripcion, categoria, created_at, updated_at) FROM stdin;
185	DASHBOARD_VIEW	Ver Dashboard	Permite ver el dashboard principal	DASHBOARD	2025-06-17 21:30:43.088	2025-06-17 21:30:43.088
186	COSTS_VIEW	Ver Costos	Permite ver la sección de costos	COSTS	2025-06-17 21:30:43.107	2025-06-17 21:30:43.107
187	COSTS_EDIT	Editar Costos	Permite editar información de costos	COSTS	2025-06-17 21:30:43.107	2025-06-17 21:30:43.107
188	CATALOG_VIEW	Ver Catálogo	Permite ver el catálogo	CATALOG	2025-06-17 21:30:43.108	2025-06-17 21:30:43.108
189	CATALOG_CREATE	Crear Catálogo	Permite crear elementos en el catálogo	CATALOG	2025-06-17 21:30:43.109	2025-06-17 21:30:43.109
190	CATALOG_EDIT	Editar Catálogo	Permite editar elementos del catálogo	CATALOG	2025-06-17 21:30:43.11	2025-06-17 21:30:43.11
191	CATALOG_DELETE	Eliminar Catálogo	Permite eliminar elementos del catálogo	CATALOG	2025-06-17 21:30:43.111	2025-06-17 21:30:43.111
192	INVENTORY_VIEW	Ver Inventario	Permite ver el inventario	INVENTORY	2025-06-17 21:30:43.112	2025-06-17 21:30:43.112
193	INVENTORY_CREATE	Crear Inventario	Permite crear elementos en el inventario	INVENTORY	2025-06-17 21:30:43.114	2025-06-17 21:30:43.114
194	INVENTORY_EDIT	Editar Inventario	Permite editar elementos del inventario	INVENTORY	2025-06-17 21:30:43.114	2025-06-17 21:30:43.114
195	INVENTORY_DELETE	Eliminar Inventario	Permite eliminar elementos del inventario	INVENTORY	2025-06-17 21:30:43.115	2025-06-17 21:30:43.115
196	CLIENTS_VIEW	Ver Clientes	Permite ver la lista de clientes	CLIENTS	2025-06-17 21:30:43.116	2025-06-17 21:30:43.116
197	CLIENTS_CREATE	Crear Cliente	Permite crear nuevos clientes	CLIENTS	2025-06-17 21:30:43.116	2025-06-17 21:30:43.116
198	CLIENTS_EDIT	Editar Cliente	Permite editar clientes existentes	CLIENTS	2025-06-17 21:30:43.117	2025-06-17 21:30:43.117
199	CLIENTS_DELETE	Eliminar Cliente	Permite eliminar clientes	CLIENTS	2025-06-17 21:30:43.117	2025-06-17 21:30:43.117
200	TICKETS_VIEW	Ver Tickets	Permite ver la lista de tickets	TICKETS	2025-06-17 21:30:43.118	2025-06-17 21:30:43.118
201	TICKETS_VIEW_DETAIL	Ver Detalle de Ticket	Permite ver el detalle de un ticket	TICKETS	2025-06-17 21:30:43.119	2025-06-17 21:30:43.119
202	TICKETS_CREATE	Crear Ticket	Permite crear nuevos tickets	TICKETS	2025-06-17 21:30:43.119	2025-06-17 21:30:43.119
203	TICKETS_EDIT	Editar Ticket	Permite editar tickets existentes	TICKETS	2025-06-17 21:30:43.12	2025-06-17 21:30:43.12
204	TICKETS_DELETE	Eliminar Ticket	Permite eliminar tickets	TICKETS	2025-06-17 21:30:43.121	2025-06-17 21:30:43.121
205	TICKETS_ASSIGN	Asignar Ticket	Permite asignar tickets a técnicos	TICKETS	2025-06-17 21:30:43.121	2025-06-17 21:30:43.121
206	REPAIRS_VIEW	Ver Reparaciones	Permite ver las reparaciones	REPAIRS	2025-06-17 21:30:43.122	2025-06-17 21:30:43.122
207	REPAIRS_CREATE	Crear Reparación	Permite crear nuevas reparaciones	REPAIRS	2025-06-17 21:30:43.122	2025-06-17 21:30:43.122
208	REPAIRS_EDIT	Editar Reparación	Permite editar reparaciones existentes	REPAIRS	2025-06-17 21:30:43.123	2025-06-17 21:30:43.123
209	REPAIRS_DELETE	Eliminar Reparación	Permite eliminar reparaciones	REPAIRS	2025-06-17 21:30:43.123	2025-06-17 21:30:43.123
210	USERS_VIEW	Ver Usuarios	Permite ver la lista de usuarios	USERS	2025-06-17 21:30:43.124	2025-06-17 21:30:43.124
211	USERS_CREATE	Crear Usuario	Permite crear nuevos usuarios	USERS	2025-06-17 21:30:43.124	2025-06-17 21:30:43.124
212	USERS_EDIT	Editar Usuario	Permite editar usuarios existentes	USERS	2025-06-17 21:30:43.125	2025-06-17 21:30:43.125
213	USERS_DELETE	Eliminar Usuario	Permite eliminar usuarios	USERS	2025-06-17 21:30:43.125	2025-06-17 21:30:43.125
214	ROLES_VIEW	Ver Roles	Permite ver la lista de roles	ROLES	2025-06-17 21:30:43.126	2025-06-17 21:30:43.126
215	ROLES_CREATE	Crear Rol	Permite crear nuevos roles	ROLES	2025-06-17 21:30:43.127	2025-06-17 21:30:43.127
216	ROLES_EDIT	Editar Rol	Permite editar roles existentes	ROLES	2025-06-17 21:30:43.128	2025-06-17 21:30:43.128
217	ROLES_DELETE	Eliminar Rol	Permite eliminar roles	ROLES	2025-06-17 21:30:43.129	2025-06-17 21:30:43.129
218	PERMISSIONS_VIEW	Ver Permisos	Permite ver la lista de permisos	PERMISSIONS	2025-06-17 21:30:43.13	2025-06-17 21:30:43.13
219	COLLECTION_POINTS_VIEW	Ver Puntos de Recolección	Permite ver los puntos de recolección	COLLECTION_POINTS	2025-06-17 21:30:43.131	2025-06-17 21:30:43.131
220	COLLECTION_POINTS_CREATE	Crear Punto de Recolección	Permite crear nuevos puntos de recolección	COLLECTION_POINTS	2025-06-17 21:30:43.132	2025-06-17 21:30:43.132
221	COLLECTION_POINTS_EDIT	Editar Punto de Recolección	Permite editar puntos de recolección existentes	COLLECTION_POINTS	2025-06-17 21:30:43.133	2025-06-17 21:30:43.133
222	COLLECTION_POINTS_DELETE	Eliminar Punto de Recolección	Permite eliminar puntos de recolección	COLLECTION_POINTS	2025-06-17 21:30:43.133	2025-06-17 21:30:43.133
223	PUNTO_USERS_VIEW	Ver Usuarios del Punto	Permite ver los usuarios asociados al punto de reparación	Punto de Reparación	2025-06-17 21:30:43.501	2025-06-17 21:30:43.501
224	PUNTO_USERS_CREATE	Crear Usuarios del Punto	Permite crear nuevos usuarios en el punto de reparación	Punto de Reparación	2025-06-17 21:30:43.502	2025-06-17 21:30:43.502
225	PUNTO_USERS_EDIT	Editar Usuarios del Punto	Permite editar usuarios del punto de reparación	Punto de Reparación	2025-06-17 21:30:43.502	2025-06-17 21:30:43.502
226	PUNTO_USERS_DELETE	Eliminar Usuarios del Punto	Permite eliminar usuarios del punto de reparación	Punto de Reparación	2025-06-17 21:30:43.503	2025-06-17 21:30:43.503
227	PUNTO_TICKETS_VIEW	Ver Tickets del Punto	Permite ver los tickets del punto de reparación	Punto de Reparación	2025-06-17 21:30:43.503	2025-06-17 21:30:43.503
228	PUNTO_TICKETS_CREATE	Crear Tickets del Punto	Permite crear tickets en el punto de reparación	Punto de Reparación	2025-06-17 21:30:43.503	2025-06-17 21:30:43.503
229	PUNTO_TICKETS_EDIT	Editar Tickets del Punto	Permite editar tickets del punto de reparación	Punto de Reparación	2025-06-17 21:30:43.504	2025-06-17 21:30:43.504
230	PUNTO_TICKETS_DELETE	Eliminar Tickets del Punto	Permite eliminar tickets del punto de reparación	Punto de Reparación	2025-06-17 21:30:43.504	2025-06-17 21:30:43.504
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
7	PRODUCTO	Pantalla iPhone 16 Pro	Apple	iPhone 16 Pro	3000	4000	5	\N	system	system	2025-06-17 21:36:45.619	2025-06-17 21:36:45.619
10	SERVICIO	Diagnóstico	-	-	0	100	\N	1	system	system	2025-06-17 21:45:04.721	2025-06-17 21:45:04.721
11	SERVICIO	Diagnóstico	-	-	0	100	\N	1	system	system	2025-06-17 21:45:17.116	2025-06-17 21:45:17.116
12	SERVICIO	Mano de Obra	-	-	0	500	\N	1	system	system	2025-06-17 21:46:49.513	2025-06-17 21:46:49.513
5	PRODUCTO	Batería iPhone 16 Pro	-	-	2100	3100	6	\N	system	system	2025-06-17 21:36:29.511	2025-06-18 16:14:52.395
\.


--
-- Data for Name: presupuestos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.presupuestos (id, ticket_id, total, descuento, total_final, aprobado, fecha_aprobacion, created_at, updated_at, iva_incluido, saldo, pagado) FROM stdin;
1	1	4500	0	2500	f	\N	2025-06-17 22:09:01.145	2025-06-17 22:09:08.969	t	0	f
2	2	3600	0	2100	f	\N	2025-06-18 16:24:38.804	2025-06-18 17:28:47.201	t	0	f
3	3	4500	0	4500	f	\N	2025-06-18 18:10:37.106	2025-06-18 18:10:37.106	t	0	f
\.


--
-- Data for Name: problemas_frecuentes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.problemas_frecuentes (id, nombre, descripcion, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos (id, sku, nombre, descripcion, notas_internas, garantia_valor, garantia_unidad, categoria_id, marca_id, modelo_id, proveedor_id, precio_promedio, stock, tipo_servicio_id, stock_maximo, stock_minimo, tipo, created_at, updated_at) FROM stdin;
7	0003	Diagnóstico	\N	\N	\N	\N	1	\N	\N	\N	0	0	1	0	0	SERVICIO	2025-06-17 21:35:33.135	2025-06-17 21:35:33.135
8	0004	Mano de Obra	\N	\N	\N	\N	1	\N	\N	\N	0	0	1	0	0	SERVICIO	2025-06-17 21:35:44.652	2025-06-17 21:35:44.652
5	0001	Pantalla iPhone 16 Pro	\N	\N	\N	\N	1	37	136	\N	3000	10	1	0	6	PRODUCTO	2025-06-17 21:35:04.214	2025-06-17 21:36:18.623
6	0002	Batería iPhone 16 Pro	\N	\N	\N	\N	1	37	136	\N	2066.666666666667	15	1	0	5	PRODUCTO	2025-06-17 21:35:20.915	2025-06-18 16:13:32.27
\.


--
-- Data for Name: productos_reparacion_frecuente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos_reparacion_frecuente (id, reparacion_frecuente_id, producto_id, cantidad, precio_venta, concepto_extra, precio_concepto_extra, created_at, updated_at) FROM stdin;
5	1	5	1	4000	\N	\N	2025-06-18 00:08:07.746	2025-06-18 00:08:07.746
6	1	8	1	500	\N	\N	2025-06-18 00:08:07.746	2025-06-18 00:08:07.746
7	2	6	1	3000	\N	\N	2025-06-18 00:08:23.812	2025-06-18 00:08:23.812
8	2	8	1	500	\N	\N	2025-06-18 00:08:23.812	2025-06-18 00:08:23.812
\.


--
-- Data for Name: proveedores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proveedores (id, nombre, contacto, telefono, email, direccion, notas, banco, clabe_interbancaria, cuenta_bancaria, rfc, tipo, created_at, updated_at) FROM stdin;
3	Aureliano Buendía García	Aureliano Buendía García	5544332211	aureliano@100anios.com	Camino a Macondo #1	\N	Bienestar	123456789012345678	12345678	BUGA670501	FISICA	2025-06-17 21:34:27.924	2025-06-17 21:34:27.924
\.


--
-- Data for Name: puntos_recoleccion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.puntos_recoleccion (id, nombre, activo, created_at, updated_at, email, is_headquarters, location, parent_id, phone, schedule, url, is_repair_point) FROM stdin;
1	Matriz Punto Uno	t	2025-06-17 18:06:41.221	2025-06-18 02:38:25.216	matriz@puntouno.com	t	{"lat": 20.0930958, "lng": -98.7523802, "address": "Boulevard Valle de San Javier, Valle de San Javier 3°, 4° y 7°. Sección, Pachuca, Pachuca de Soto, Hidalgo, 42086, Mexico"}	\N	5544332211	{"friday": {"end": "18:00", "open": true, "start": "09:00"}, "monday": {"end": "18:00", "open": true, "start": "09:00"}, "sunday": {"end": "18:00", "open": false, "start": "09:00"}, "tuesday": {"end": "18:00", "open": true, "start": "09:00"}, "saturday": {"end": "18:00", "open": true, "start": "09:00"}, "thursday": {"end": "18:00", "open": true, "start": "09:00"}, "wednesday": {"end": "18:00", "open": true, "start": "09:00"}}	http://puntouno.com	f
\.


--
-- Data for Name: reparaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reparaciones (id, ticket_id, diagnostico, solucion, observaciones, fecha_inicio, fecha_fin, created_at, updated_at, capacidad, codigo_desbloqueo, red_celular, salud_bateria, version_so, fecha_pausa, fecha_reanudacion) FROM stdin;
1	1	se requiere cambio de pantalla	\N	se cambió la pantalla y ya funciona al 100%	2025-06-17 22:09:14.992	2025-06-18 00:13:11.21	2025-06-17 22:03:49.23	2025-06-18 00:13:11.211	\N	\N	\N	100	18.5	\N	\N
27	4	la batería es la que no retiene carga correctamtne, se agota muy rápidamente	\N	\N	2025-06-18 15:13:03.173	\N	2025-06-18 15:13:03.174	2025-06-18 15:48:32.322	\N	\N	\N	100	18.5	\N	\N
30	3	pantalla rota y cámara delantera sin funcionar	\N	\N	2025-06-18 17:13:06.01	\N	2025-06-18 17:13:06.012	2025-06-18 17:13:06.012	\N	\N	\N	100	18.5	\N	\N
28	2	se requiere cambiar la batería	\N	le cambiamos la bateria	2025-06-18 16:25:18.722	2025-06-18 17:38:25.383	2025-06-18 16:24:06.61	2025-06-18 17:38:25.384	\N	\N	\N	100	18.5	\N	\N
\.


--
-- Data for Name: reparaciones_frecuentes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reparaciones_frecuentes (id, nombre, descripcion, activo, created_at, updated_at) FROM stdin;
1	Cambio pantalla iPhone 16 Pro	Cambio de pantalla, servicio y colocación de pantalla nueva original de iPhone 16 Pro	t	2025-06-17 20:04:59.051	2025-06-18 00:08:07.746
2	Cambio de Batería iPhone 16 Pro	Cambio de batería, y servicio para iPhone 16 Pro con producto original	t	2025-06-17 20:05:45.513	2025-06-18 00:08:23.812
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, nombre, descripcion, created_at, updated_at) FROM stdin;
15	ADMINISTRADOR	Acceso total al sistema con todos los permisos	2025-06-17 21:30:43.134	2025-06-17 21:30:43.134
16	ADMINISTRADOR_PUNTO	Administrador del punto de reparación	2025-06-17 21:30:43.504	2025-06-17 21:30:43.504
17	OPERADOR_PUNTO	Operador del punto de reparación	2025-06-17 21:30:43.514	2025-06-17 21:30:43.514
18	TECNICO	Técnico responsable de las reparaciones en central.	2025-06-17 21:33:19.092	2025-06-17 21:33:19.092
\.


--
-- Data for Name: roles_permisos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles_permisos (id, rol_id, permiso_id, created_at, updated_at) FROM stdin;
222	15	185	2025-06-17 21:30:43.136	2025-06-17 21:30:43.136
223	15	186	2025-06-17 21:30:43.139	2025-06-17 21:30:43.139
224	15	187	2025-06-17 21:30:43.139	2025-06-17 21:30:43.139
225	15	188	2025-06-17 21:30:43.14	2025-06-17 21:30:43.14
226	15	189	2025-06-17 21:30:43.141	2025-06-17 21:30:43.141
227	15	190	2025-06-17 21:30:43.141	2025-06-17 21:30:43.141
228	15	191	2025-06-17 21:30:43.142	2025-06-17 21:30:43.142
229	15	192	2025-06-17 21:30:43.143	2025-06-17 21:30:43.143
230	15	193	2025-06-17 21:30:43.144	2025-06-17 21:30:43.144
231	15	194	2025-06-17 21:30:43.144	2025-06-17 21:30:43.144
232	15	195	2025-06-17 21:30:43.145	2025-06-17 21:30:43.145
233	15	196	2025-06-17 21:30:43.146	2025-06-17 21:30:43.146
234	15	197	2025-06-17 21:30:43.146	2025-06-17 21:30:43.146
235	15	198	2025-06-17 21:30:43.147	2025-06-17 21:30:43.147
236	15	199	2025-06-17 21:30:43.148	2025-06-17 21:30:43.148
237	15	200	2025-06-17 21:30:43.148	2025-06-17 21:30:43.148
238	15	201	2025-06-17 21:30:43.149	2025-06-17 21:30:43.149
239	15	202	2025-06-17 21:30:43.15	2025-06-17 21:30:43.15
240	15	203	2025-06-17 21:30:43.15	2025-06-17 21:30:43.15
241	15	204	2025-06-17 21:30:43.151	2025-06-17 21:30:43.151
242	15	205	2025-06-17 21:30:43.151	2025-06-17 21:30:43.151
243	15	206	2025-06-17 21:30:43.152	2025-06-17 21:30:43.152
244	15	207	2025-06-17 21:30:43.152	2025-06-17 21:30:43.152
245	15	208	2025-06-17 21:30:43.153	2025-06-17 21:30:43.153
246	15	209	2025-06-17 21:30:43.153	2025-06-17 21:30:43.153
247	15	210	2025-06-17 21:30:43.154	2025-06-17 21:30:43.154
248	15	211	2025-06-17 21:30:43.155	2025-06-17 21:30:43.155
249	15	212	2025-06-17 21:30:43.155	2025-06-17 21:30:43.155
250	15	213	2025-06-17 21:30:43.156	2025-06-17 21:30:43.156
251	15	214	2025-06-17 21:30:43.156	2025-06-17 21:30:43.156
252	15	215	2025-06-17 21:30:43.157	2025-06-17 21:30:43.157
253	15	216	2025-06-17 21:30:43.157	2025-06-17 21:30:43.157
254	15	217	2025-06-17 21:30:43.158	2025-06-17 21:30:43.158
255	15	218	2025-06-17 21:30:43.159	2025-06-17 21:30:43.159
256	15	219	2025-06-17 21:30:43.16	2025-06-17 21:30:43.16
257	15	220	2025-06-17 21:30:43.161	2025-06-17 21:30:43.161
258	15	221	2025-06-17 21:30:43.161	2025-06-17 21:30:43.161
259	15	222	2025-06-17 21:30:43.162	2025-06-17 21:30:43.162
260	16	223	2025-06-17 21:30:43.506	2025-06-17 21:30:43.506
261	16	224	2025-06-17 21:30:43.508	2025-06-17 21:30:43.508
262	16	225	2025-06-17 21:30:43.509	2025-06-17 21:30:43.509
263	16	226	2025-06-17 21:30:43.51	2025-06-17 21:30:43.51
264	16	227	2025-06-17 21:30:43.511	2025-06-17 21:30:43.511
265	16	228	2025-06-17 21:30:43.512	2025-06-17 21:30:43.512
266	16	229	2025-06-17 21:30:43.513	2025-06-17 21:30:43.513
267	16	230	2025-06-17 21:30:43.513	2025-06-17 21:30:43.513
268	17	227	2025-06-17 21:30:43.514	2025-06-17 21:30:43.514
269	17	228	2025-06-17 21:30:43.515	2025-06-17 21:30:43.515
270	17	229	2025-06-17 21:30:43.515	2025-06-17 21:30:43.515
271	18	206	2025-06-17 21:33:19.092	2025-06-17 21:33:19.092
272	18	208	2025-06-17 21:33:19.092	2025-06-17 21:33:19.092
273	18	209	2025-06-17 21:33:19.092	2025-06-17 21:33:19.092
274	18	207	2025-06-17 21:33:19.092	2025-06-17 21:33:19.092
275	18	196	2025-06-17 21:33:19.092	2025-06-17 21:33:19.092
276	18	198	2025-06-17 21:33:19.092	2025-06-17 21:33:19.092
277	18	199	2025-06-17 21:33:19.092	2025-06-17 21:33:19.092
278	18	197	2025-06-17 21:33:19.092	2025-06-17 21:33:19.092
279	18	200	2025-06-17 21:33:19.092	2025-06-17 21:33:19.092
280	18	204	2025-06-17 21:33:19.092	2025-06-17 21:33:19.092
281	18	202	2025-06-17 21:33:19.092	2025-06-17 21:33:19.092
282	18	201	2025-06-17 21:33:19.092	2025-06-17 21:33:19.092
283	18	203	2025-06-17 21:33:19.092	2025-06-17 21:33:19.092
284	18	205	2025-06-17 21:33:19.092	2025-06-17 21:33:19.092
285	18	185	2025-06-18 21:59:03.152	2025-06-18 21:59:03.152
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

COPY public.tickets (id, numero_ticket, fecha_recepcion, cliente_id, tipo_servicio_id, modelo_id, descripcion_problema, estatus_reparacion_id, creador_id, tecnico_asignado_id, punto_recoleccion_id, recogida, fecha_entrega, entregado, cancelado, motivo_cancelacion, fecha_inicio_diagnostico, fecha_fin_diagnostico, fecha_inicio_reparacion, fecha_fin_reparacion, fecha_cancelacion, direccion_id, imei, capacidad, color, fecha_compra, codigo_desbloqueo, red_celular, patron_desbloqueo, created_at, updated_at, tipo_desbloqueo) FROM stdin;
9	TKT-1750283158929	2025-06-18 21:45:58.931	5	1	139	pantalla rota y cristal trasero roto	28	1	\N	\N	f	\N	f	f	\N	\N	\N	\N	\N	\N	\N	\N	128	azul	2025-06-06 00:00:00	556677	ATT	{}	2025-06-18 21:45:58.931	2025-06-18 21:45:58.931	pin
1	TICK-1750197265171	2025-06-17 21:54:25.172	1	1	136	pantalla ligeramente rota	32	2	3	\N	f	\N	f	f	\N	\N	\N	\N	2025-06-18 00:13:11.514	\N	\N	123456789012345	128	negro	2025-06-01 00:00:00	123456	ATT	{}	2025-06-17 21:54:25.172	2025-06-18 00:13:11.514	\N
4	TICK-1750259524373	2025-06-18 15:12:04.374	3	1	138	batería no carga correctamente	28	2	3	\N	f	\N	f	f	\N	\N	\N	\N	\N	\N	\N	000000000011111	512	Titanio	2025-06-01 00:00:00	010101	ATT	{}	2025-06-18 15:12:04.374	2025-06-18 15:12:14.02	\N
5	TICK-1750264066195	2025-06-18 16:27:46.197	1	1	135	pantalla rota	28	2	\N	\N	f	\N	f	f	\N	\N	\N	\N	\N	\N	\N	123456789012345	128	blanco	2025-06-05 00:00:00	112233	ATT	{}	2025-06-18 16:27:46.197	2025-06-18 16:27:46.197	\N
2	TICK-1750205963674	2025-06-18 00:19:23.676	2	1	138	la batería no está cargando correctamente	32	8	3	1	f	\N	f	f	\N	\N	\N	\N	2025-06-18 17:38:25.479	\N	\N	111111111111111	128	blanco	2025-06-06 00:00:00	444444	ATT	{}	2025-06-18 00:19:23.676	2025-06-18 17:38:25.479	pin
3	TICK-1750250446365	2025-06-18 12:40:46.369	2	1	137	pantalla rota	30	2	3	\N	f	\N	f	f	\N	\N	\N	\N	\N	\N	\N	111111111122222	128	negro	2025-06-06 00:00:00	123456	att	{}	2025-06-18 12:40:46.369	2025-06-18 18:10:37.113	\N
6	TICK-1750276605301	2025-06-18 19:56:45.302	4	1	138	pantalla rota	28	8	\N	1	f	\N	f	f	\N	\N	\N	\N	\N	\N	\N	111111111122222	128	negro	2025-06-06 00:00:00	123456	Telcel	{}	2025-06-18 19:56:45.302	2025-06-18 19:56:45.302	pin
\.


--
-- Data for Name: tipos_servicio; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipos_servicio (id, nombre, descripcion, created_at, updated_at) FROM stdin;
1	Reparación de Celulares	\N	2025-06-17 17:42:32.568	2025-06-17 17:42:32.568
2	Reparación de Tablets	\N	2025-06-17 17:42:32.568	2025-06-17 17:42:32.568
3	Reparación de Laptops	\N	2025-06-17 17:42:32.568	2025-06-17 17:42:32.568
4	Reparación de Consolas	\N	2025-06-17 17:42:32.568	2025-06-17 17:42:32.568
5	Reparación de Smartwatches	\N	2025-06-17 17:42:32.568	2025-06-17 17:42:32.568
6	Reparación de Otros Dispositivos	\N	2025-06-17 17:42:32.568	2025-06-17 17:42:32.568
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nombre, apellido_paterno, apellido_materno, email, password_hash, telefono, activo, created_at, updated_at) FROM stdin;
1	Administrador	Admin		admin@example.com	$2a$10$wG91oC93cc2vJ6uEHXHLq.AykduA1SqWwHgA04iXmEAoKqU7zVQp.	\N	t	2025-06-17 17:42:32.273	2025-06-17 17:42:32.273
2	Sergio	Velazco		sergio@hoom.mx	$2a$10$6Eo3IFvqInqnGp82ur46Z.HvMIt.Qc7NGmjmPtUs1lKL7Iurzww.G	\N	t	2025-06-17 17:42:32.343	2025-06-17 21:30:43.308
8	Admin	Punto	Uno	admin@puntouno.com	$2b$10$6f6yDAB6Ylpf4TdI9hC9N.WXlgHBEr2oW/h2C7UQjqQIXlMVPtO9O	\N	t	2025-06-17 18:07:03.028	2025-06-17 21:53:35.565
4	Atención al Cliente	Cliente		atencion@example.com	$2a$10$2uXo/Zo2.5hW2Ib/lWNpburdFdvggP0Nn.Ph193IlepzCyxsDKwle	\N	t	2025-06-17 17:42:32.487	2025-06-18 18:54:26.731
10	Tecnico	Arregla	Mx	tecnico@arregla.mx	$2a$10$W2QlT8Il7cyfJ6sdBVImGeGoXG9zAvEaEBqyIcoLhotn66mAGMRMO	\N	t	2025-06-18 21:53:07.346	2025-06-18 21:53:07.346
3	Técnico	Técnico		tecnico@example.com	$2a$10$D31qdtLbew/EGziZ0XZzee8cFhO70J3ksm3IxLZ9vOIsXs8qCcrgC	\N	t	2025-06-17 17:42:32.415	2025-06-18 21:59:03.246
\.


--
-- Data for Name: usuarios_puntos_recoleccion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios_puntos_recoleccion (id, usuario_id, punto_recoleccion_id, nivel, created_at, updated_at) FROM stdin;
1	8	1	OPERADOR	2025-06-17 18:07:03.032	2025-06-17 18:07:03.032
\.


--
-- Data for Name: usuarios_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios_roles (id, usuario_id, rol_id, created_at, updated_at) FROM stdin;
11	1	15	2025-06-17 21:30:43.238	2025-06-17 21:30:43.238
12	2	15	2025-06-17 21:30:43.31	2025-06-17 21:30:43.31
14	8	16	2025-06-17 21:53:35.565	2025-06-17 21:53:35.565
16	3	18	2025-06-18 16:22:55.858	2025-06-18 16:22:55.858
17	4	17	2025-06-18 18:54:26.731	2025-06-18 18:54:26.731
18	10	18	2025-06-18 21:53:07.348	2025-06-18 21:53:07.348
\.


--
-- Name: categorias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categorias_id_seq', 1, false);


--
-- Name: checklist_diagnostico_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.checklist_diagnostico_id_seq', 3, true);


--
-- Name: checklist_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.checklist_items_id_seq', 6, true);


--
-- Name: checklist_reparacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.checklist_reparacion_id_seq', 5, true);


--
-- Name: checklist_respuesta_diagnostico_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.checklist_respuesta_diagnostico_id_seq', 112, true);


--
-- Name: checklist_respuesta_reparacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.checklist_respuesta_reparacion_id_seq', 64, true);


--
-- Name: clientes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clientes_id_seq', 5, true);


--
-- Name: conceptos_presupuesto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conceptos_presupuesto_id_seq', 6, true);


--
-- Name: direcciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.direcciones_id_seq', 1, false);


--
-- Name: dispositivos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dispositivos_id_seq', 5, true);


--
-- Name: entradas_almacen_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.entradas_almacen_id_seq', 5, true);


--
-- Name: entregas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.entregas_id_seq', 1, false);


--
-- Name: estatus_reparacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estatus_reparacion_id_seq', 35, true);


--
-- Name: fotos_producto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fotos_producto_id_seq', 1, false);


--
-- Name: marcas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.marcas_id_seq', 45, true);


--
-- Name: modelos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.modelos_id_seq', 139, true);


--
-- Name: pagos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pagos_id_seq', 3, true);


--
-- Name: pasos_reparacion_frecuente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pasos_reparacion_frecuente_id_seq', 4, true);


--
-- Name: permisos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permisos_id_seq', 230, true);


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

SELECT pg_catalog.setval('public.precios_venta_id_seq', 12, true);


--
-- Name: presupuestos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.presupuestos_id_seq', 3, true);


--
-- Name: problemas_frecuentes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.problemas_frecuentes_id_seq', 1, false);


--
-- Name: productos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productos_id_seq', 8, true);


--
-- Name: productos_reparacion_frecuente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productos_reparacion_frecuente_id_seq', 8, true);


--
-- Name: proveedores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.proveedores_id_seq', 4, true);


--
-- Name: puntos_recoleccion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.puntos_recoleccion_id_seq', 1, true);


--
-- Name: reparaciones_frecuentes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reparaciones_frecuentes_id_seq', 2, true);


--
-- Name: reparaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reparaciones_id_seq', 33, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 18, true);


--
-- Name: roles_permisos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_permisos_id_seq', 285, true);


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

SELECT pg_catalog.setval('public.tickets_id_seq', 9, true);


--
-- Name: tipos_servicio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipos_servicio_id_seq', 30, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 11, true);


--
-- Name: usuarios_puntos_recoleccion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_puntos_recoleccion_id_seq', 1, true);


--
-- Name: usuarios_roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_roles_id_seq', 18, true);


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
-- Name: checklist_reparacion checklist_reparacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_reparacion
    ADD CONSTRAINT checklist_reparacion_pkey PRIMARY KEY (id);


--
-- Name: checklist_respuesta_diagnostico checklist_respuesta_diagnostico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_respuesta_diagnostico
    ADD CONSTRAINT checklist_respuesta_diagnostico_pkey PRIMARY KEY (id);


--
-- Name: checklist_respuesta_reparacion checklist_respuesta_reparacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_respuesta_reparacion
    ADD CONSTRAINT checklist_respuesta_reparacion_pkey PRIMARY KEY (id);


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
-- Name: checklist_reparacion_reparacion_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX checklist_reparacion_reparacion_id_key ON public.checklist_reparacion USING btree (reparacion_id);


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
-- Name: productos_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX productos_sku_key ON public.productos USING btree (sku);


--
-- Name: puntos_recoleccion_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX puntos_recoleccion_email_key ON public.puntos_recoleccion USING btree (email);


--
-- Name: puntos_recoleccion_url_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX puntos_recoleccion_url_key ON public.puntos_recoleccion USING btree (url);


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
-- Name: checklist_reparacion checklist_reparacion_reparacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_reparacion
    ADD CONSTRAINT checklist_reparacion_reparacion_id_fkey FOREIGN KEY (reparacion_id) REFERENCES public.reparaciones(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: checklist_respuesta_diagnostico checklist_respuesta_diagnostico_checklist_diagnostico_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_respuesta_diagnostico
    ADD CONSTRAINT checklist_respuesta_diagnostico_checklist_diagnostico_id_fkey FOREIGN KEY (checklist_diagnostico_id) REFERENCES public.checklist_diagnostico(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: checklist_respuesta_diagnostico checklist_respuesta_diagnostico_checklist_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_respuesta_diagnostico
    ADD CONSTRAINT checklist_respuesta_diagnostico_checklist_item_id_fkey FOREIGN KEY (checklist_item_id) REFERENCES public.checklist_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: checklist_respuesta_reparacion checklist_respuesta_reparacion_checklist_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_respuesta_reparacion
    ADD CONSTRAINT checklist_respuesta_reparacion_checklist_item_id_fkey FOREIGN KEY (checklist_item_id) REFERENCES public.checklist_items(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: checklist_respuesta_reparacion checklist_respuesta_reparacion_checklist_reparacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checklist_respuesta_reparacion
    ADD CONSTRAINT checklist_respuesta_reparacion_checklist_reparacion_id_fkey FOREIGN KEY (checklist_reparacion_id) REFERENCES public.checklist_reparacion(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: clientes clientes_creado_por_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_creado_por_id_fkey FOREIGN KEY (creado_por_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: clientes clientes_punto_recoleccion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_punto_recoleccion_id_fkey FOREIGN KEY (punto_recoleccion_id) REFERENCES public.puntos_recoleccion(id) ON UPDATE CASCADE ON DELETE SET NULL;


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
    ADD CONSTRAINT productos_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categorias(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: productos productos_marca_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_marca_id_fkey FOREIGN KEY (marca_id) REFERENCES public.marcas(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: productos productos_modelo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_modelo_id_fkey FOREIGN KEY (modelo_id) REFERENCES public.modelos(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: productos productos_proveedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(id) ON UPDATE CASCADE ON DELETE SET NULL;


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

