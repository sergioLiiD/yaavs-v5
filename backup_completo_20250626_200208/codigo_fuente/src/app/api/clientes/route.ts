import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma, Cliente, Usuario } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

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
    apellidoPaterno: data.apellidoPaterno,
    apellidoMaterno: data.apellidoMaterno,
    telefonoCelular: data.telefonoCelular,
    telefonoContacto: data.telefonoContacto,
    email: data.email,
    rfc: data.rfc,
    calle: data.calle,
    numeroExterior: data.numeroExterior,
    numeroInterior: data.numeroInterior,
    colonia: data.colonia,
    ciudad: data.ciudad,
    estado: data.estado,
    codigoPostal: data.codigoPostal,
    latitud: data.latitud,
    longitud: data.longitud,
    fuenteReferencia: data.fuenteReferencia,
    passwordHash: data.passwordHash,
    updatedAt: new Date()
  };

  // Agregar tipoRegistro si está presente
  if (data.tipoRegistro) {
    cleanedData.tipoRegistro = data.tipoRegistro;
  }

  // Agregar la relación creadoPor si hay un creadoPorId
  if (data.creadoPorId) {
    cleanedData.creadoPor = {
      connect: {
        id: data.creadoPorId
      }
    };
  }

  // Agregar el puntoRecoleccionId directamente
  if (data.puntoRecoleccionId) {
    cleanedData.puntoRecoleccionId = data.puntoRecoleccionId;
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
    let where: Prisma.ClienteWhereInput = {};
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellidoPaterno: { contains: search, mode: 'insensitive' } },
        { apellidoMaterno: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { telefonoCelular: { contains: search } }
      ];
    }

    const userRole = session.user.role;
    const userPointId = session.user.puntoRecoleccion?.id;

    // Si es usuario de punto de recolección, solo mostrar clientes de su punto
    if ((userRole === 'ADMINISTRADOR_PUNTO' || userRole === 'USUARIO_PUNTO') && userPointId) {
      where.puntoRecoleccionId = userPointId;
    }

    // Si no es admin ni tiene permisos específicos, no mostrar nada
    if (userRole !== 'ADMINISTRADOR' && !session.user.permissions.includes('CLIENTS_VIEW')) {
      if (!userPointId) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
      }
    }

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          creadoPor: {
            select: {
              id: true,
              nombre: true,
              apellidoPaterno: true,
              apellidoMaterno: true,
              email: true
            }
          },
          puntoRecoleccion: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      }),
      prisma.cliente.count({ where })
    ]);

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
    const validatedData = clienteSchema.parse(data);

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
    const existingClient = await prisma.cliente.findUnique({
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

    // Si se proporciona contraseña, hashearla
    if (password) {
      dataToSave.passwordHash = await bcrypt.hash(password, 10);
    }

    // Crear el cliente
    const cliente = await prisma.cliente.create({
      data: dataToSave,
      include: {
        creadoPor: {
          select: {
            id: true,
            nombre: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            email: true
          }
        },
        puntoRecoleccion: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });

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