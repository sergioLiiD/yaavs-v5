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

    // Si es administrador o tiene permiso de ver clientes, mostrar todos los clientes
    if (session.user.role === 'ADMINISTRADOR' || session.user.permissions.includes('CLIENTES_VIEW')) {
      const clientes = await prisma.cliente.findMany({
        include: {
          creadoPor: {
            select: {
              id: true,
              nombre: true,
              apellidoPaterno: true,
              apellidoMaterno: true,
              email: true
            }
          }
        }
      });
      return NextResponse.json(clientes);
    }

    // Si no tiene permiso general, verificar si es de un punto de recolección
    const userPoint = await prisma.usuarioPuntoRecoleccion.findFirst({
      where: {
        usuarioId: session.user.id
      },
      include: {
        puntoRecoleccion: true
      }
    });

    if (!userPoint?.puntoRecoleccion) {
      return NextResponse.json(
        { error: 'Usuario no autorizado para ver clientes' },
        { status: 403 }
      );
    }

    // Construir el where para filtrar clientes del punto de recolección
    const clientes = await prisma.cliente.findMany({
      where: {
        creadoPorId: session.user.id
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
        }
      }
    });

    return NextResponse.json(clientes);
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

    // Caso 1: Registro directo del cliente (sin sesión)
    if (!session) {
      if (!validatedData.password) {
        return NextResponse.json(
          { error: 'Se requiere contraseña para el registro directo' },
          { status: 400 }
        );
      }

      const passwordHash = await bcrypt.hash(validatedData.password, 10);
      const { password, ...clienteData } = validatedData;
      const dataToSave = cleanClienteData({ 
        ...clienteData, 
        passwordHash,
        tipoRegistro: 'REGISTRO_PROPIO' // Cliente se registra por sí mismo
      });

      const cliente = await prisma.cliente.create({
        data: dataToSave,
        include: {
          tickets: true
        }
      });

      return NextResponse.json(cliente);
    }

    // Caso 2: Registro desde punto de recolección
    const userPoint = await prisma.usuarioPuntoRecoleccion.findFirst({
      where: {
        usuarioId: session.user.id
      },
      include: {
        puntoRecoleccion: true
      }
    });

    // Caso 3: Registro desde sistema central (admin o usuario con permisos)
    if (!userPoint?.puntoRecoleccion) {
      if (session.user.role === 'ADMINISTRADOR' || session.user.permissions.includes('CLIENTES_CREATE')) {
        const { puntoRecoleccionId, ...restData } = validatedData;
        const dataToSave = cleanClienteData({
          ...restData,
          creadoPorId: session.user.id,
          tipoRegistro: 'SISTEMA_CENTRAL' // Registrado desde el sistema central
        });

        const cliente = await prisma.cliente.create({
          data: dataToSave,
          include: {
            tickets: true,
            creadoPor: {
              select: {
                id: true,
                nombre: true,
                apellidoPaterno: true,
                apellidoMaterno: true,
                email: true
              }
            }
          }
        });

        return NextResponse.json(cliente);
      }

      return NextResponse.json(
        { error: 'Usuario no autorizado para crear clientes' },
        { status: 403 }
      );
    }

    // Continuar con el registro desde punto de recolección
    const { puntoRecoleccionId, ...restData } = validatedData;
    const dataToSave = cleanClienteData({
      ...restData,
      creadoPorId: session.user.id,
      tipoRegistro: 'PUNTO_RECOLECCION' // Registrado por punto de recolección
    });

    const cliente = await prisma.cliente.create({
      data: {
        ...dataToSave,
        puntoRecoleccion: {
          connect: {
            id: userPoint.puntoRecoleccion.id
          }
        }
      },
      include: {
        tickets: true,
        creadoPor: {
          select: {
            id: true,
            nombre: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            email: true
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