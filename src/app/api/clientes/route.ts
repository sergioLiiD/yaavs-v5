import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Esquema de validación para el registro de clientes
const clienteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellidoPaterno: z.string().min(1, 'El apellido paterno es requerido'),
  apellidoMaterno: z.string().optional(),
  telefonoCelular: z.string().min(1, 'El teléfono celular es requerido'),
  telefonoContacto: z.string().optional(),
  email: z.string().email('Email inválido'),
  rfc: z.string().optional(),
  calle: z.string().optional(),
  numeroExterior: z.string().optional(),
  numeroInterior: z.string().optional(),
  colonia: z.string().optional(),
  ciudad: z.string().optional(),
  estado: z.string().optional(),
  codigoPostal: z.string().optional(),
  latitud: z.number().optional().nullable(),
  longitud: z.number().optional().nullable(),
  fuenteReferencia: z.string().optional(),
  password: z.string().optional(),
  activo: z.boolean().optional(),
  tipoRegistro: z.string().optional(),
  puntoRecoleccionId: z.number().optional()
});

function cleanClienteData(data: any) {
  const cleanedData: any = {
    nombre: data.nombre,
    apellido_paterno: data.apellidoPaterno,
    apellido_materno: data.apellidoMaterno,
    telefono_celular: data.telefonoCelular,
    telefono_contacto: data.telefonoContacto,
    email: data.email,
    rfc: data.rfc,
    calle: data.calle,
    numero_exterior: data.numeroExterior,
    numero_interior: data.numeroInterior,
    colonia: data.colonia,
    ciudad: data.ciudad,
    estado: data.estado,
    codigo_postal: data.codigoPostal,
    latitud: data.latitud,
    longitud: data.longitud,
    fuente_referencia: data.fuenteReferencia,
    password_hash: data.passwordHash,
    updated_at: new Date()
  };

  // Agregar tipo_registro si está presente
  if (data.tipoRegistro) {
    cleanedData.tipo_registro = data.tipoRegistro;
  }

  // Agregar la relación creado_por si hay un creadoPorId
  if (data.creadoPorId) {
    cleanedData.creado_por_id = data.creadoPorId;
  }

  // Agregar el punto_recoleccion_id directamente
  if (data.puntoRecoleccionId) {
    cleanedData.punto_recoleccion_id = data.puntoRecoleccionId;
  }

  return cleanedData;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // Construir el where base con búsqueda
    let where: Prisma.clientesWhereInput = {};
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido_paterno: { contains: search, mode: 'insensitive' } },
        { apellido_materno: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { telefono_celular: { contains: search } }
      ];
    }

    const userRole = session.user.role;
    const userPointId = session.user.puntoRecoleccion?.id;

    // Si es usuario de punto de recolección, solo mostrar clientes de su punto
    if ((userRole === 'ADMINISTRADOR_PUNTO' || userRole === 'USUARIO_PUNTO') && userPointId) {
      where.punto_recoleccion_id = userPointId;
    }

    // Si no es admin ni tiene permisos específicos, no mostrar nada
    if (userRole !== 'ADMINISTRADOR' && !session.user.permissions.includes('CLIENTS_VIEW')) {
      if (!userPointId) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
      }
    }

    const [clientesRaw, total] = await Promise.all([
      prisma.clientes.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc'
        },
        include: {
          usuarios: {
            select: {
              id: true,
              nombre: true,
              apellido_paterno: true,
              apellido_materno: true,
              email: true
            }
          },
          puntos_recoleccion: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      }),
      prisma.clientes.count({ where })
    ]);

    // Mapear los datos a formato camelCase para el frontend
    const clientes = clientesRaw.map((cliente: any) => ({
      id: cliente.id,
      nombre: cliente.nombre,
      apellidoPaterno: cliente.apellido_paterno,
      apellidoMaterno: cliente.apellido_materno,
      telefonoCelular: cliente.telefono_celular,
      telefonoContacto: cliente.telefono_contacto,
      email: cliente.email,
      calle: cliente.calle,
      numeroExterior: cliente.numero_exterior,
      numeroInterior: cliente.numero_interior,
      colonia: cliente.colonia,
      ciudad: cliente.ciudad,
      estado: cliente.estado,
      codigoPostal: cliente.codigo_postal,
      latitud: cliente.latitud,
      longitud: cliente.longitud,
      fuenteReferencia: cliente.fuente_referencia,
      rfc: cliente.rfc,
      tipoRegistro: cliente.tipo_registro,
      createdAt: cliente.created_at,
      updatedAt: cliente.updated_at,
      puntoRecoleccionId: cliente.punto_recoleccion_id,
      creadoPor: cliente.usuarios ? {
        id: cliente.usuarios.id,
        nombre: cliente.usuarios.nombre,
        apellidoPaterno: cliente.usuarios.apellido_paterno,
        apellidoMaterno: cliente.usuarios.apellido_materno,
        email: cliente.usuarios.email
      } : null,
      puntoRecoleccion: cliente.puntos_recoleccion ? {
        id: cliente.puntos_recoleccion.id,
        nombre: cliente.puntos_recoleccion.nombre
      } : null
    }));

    return NextResponse.json({
      clientes,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return NextResponse.json(
      { error: 'Error al obtener los clientes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    console.log('Datos recibidos en POST /api/clientes:', data);
    
    const validatedData = clienteSchema.parse(data);
    console.log('Datos validados:', validatedData);

    const userRole = session.user.role;
    const userPointId = session.user.puntoRecoleccion?.id;

    // Determinar el punto de recolección a usar
    let puntoRecoleccionIdToUse = validatedData.puntoRecoleccionId;
    if (userRole === 'ADMINISTRADOR_PUNTO' || userRole === 'USUARIO_PUNTO') {
      if (!userPointId) {
        return NextResponse.json({ error: 'No tienes un punto de recolección asignado' }, { status: 403 });
      }
      puntoRecoleccionIdToUse = userPointId;
    }

    // Si no es admin ni tiene permisos, y no es usuario de punto, no puede crear
    if (userRole !== 'ADMINISTRADOR' && !session.user.permissions.includes('CLIENTS_CREATE')) {
      if (!userPointId) {
        return NextResponse.json({ error: 'No autorizado para crear clientes' }, { status: 403 });
      }
    }

    // Verificar si el email ya existe
    const existingClient = await prisma.clientes.findUnique({
      where: { email: validatedData.email }
    });

    if (existingClient) {
      return NextResponse.json(
        { error: 'Ya existe un cliente con este email' },
        { status: 400 }
      );
    }

    // Preparar los datos del cliente
    const { password, ...clienteData } = validatedData;
    const dataToSave = cleanClienteData({
      ...clienteData,
      creadoPorId: session.user.id,
      tipoRegistro: userPointId ? 'PUNTO_RECOLECCION' : 'SISTEMA_CENTRAL',
      puntoRecoleccionId: puntoRecoleccionIdToUse
    });

    console.log('Datos a guardar:', dataToSave);

    // Si se proporciona contraseña, hashearla
    if (password) {
      dataToSave.passwordHash = await bcrypt.hash(password, 10);
    }

    // Crear el cliente
    const cliente = await prisma.clientes.create({
      data: dataToSave
    });

    console.log('Cliente creado:', cliente);

    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Error al crear el cliente' },
      { status: 500 }
    );
  }
} 