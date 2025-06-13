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
    puntoRecoleccionId: data.puntoRecoleccionId,
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

  return cleanedData;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar si el usuario es de un punto de recolección
    const userPoint = await prisma.usuarioPuntoRecoleccion.findFirst({
      where: {
        usuarioId: session.user.id
      },
      select: {
        puntoRecoleccionId: true
      }
    });

    // Construir el where para filtrar por creador si es necesario
    const where: any = {};
    if (userPoint?.puntoRecoleccionId) {
      where.creadoPorId = session.user.id;
    }

    type ClienteWithRelations = Cliente & {
      creadoPor: Pick<Usuario, 'id' | 'nombre' | 'apellidoPaterno' | 'apellidoMaterno' | 'email'> | null;
    };

    const include: any = {
      tickets: true,
      direcciones: true,
      creadoPor: {
        select: {
          id: true,
          nombre: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
          email: true
        }
      }
    };

    const clientes = (await prisma.cliente.findMany({
      where,
      include
    })) as unknown as ClienteWithRelations[];

    // Asegurarnos de que todos los campos opcionales estén presentes
    const clientesFormateados = clientes.map(cliente => ({
      ...cliente,
      telefonoContacto: cliente.telefonoContacto || null,
      rfc: cliente.rfc || null,
      calle: cliente.calle || null,
      numeroExterior: cliente.numeroExterior || null,
      numeroInterior: cliente.numeroInterior || null,
      colonia: cliente.colonia || null,
      ciudad: cliente.ciudad || null,
      estado: cliente.estado || null,
      codigoPostal: cliente.codigoPostal || null,
      latitud: cliente.latitud || null,
      longitud: cliente.longitud || null,
      fuenteReferencia: cliente.fuenteReferencia || null,
      creadoPor: cliente.creadoPor ? {
        id: cliente.creadoPor.id,
        nombre: cliente.creadoPor.nombre,
        apellidoPaterno: cliente.creadoPor.apellidoPaterno,
        apellidoMaterno: cliente.creadoPor.apellidoMaterno,
        email: cliente.creadoPor.email
      } : null
    }));

    return NextResponse.json(clientesFormateados);
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
      const dataToSave = cleanClienteData({ ...clienteData, passwordHash });

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
      select: {
        puntoRecoleccionId: true
      }
    });

    if (userPoint?.puntoRecoleccionId) {
      const dataToSave = cleanClienteData({
        ...validatedData,
        puntoRecoleccionId: userPoint.puntoRecoleccionId,
        creadoPorId: session.user.id
      });

      const cliente = await prisma.cliente.create({
        data: dataToSave,
        include: {
          tickets: true
        }
      });

      return NextResponse.json(cliente);
    }

    // Caso 3: Registro desde sistema central
    const dataToSave = cleanClienteData({
      ...validatedData,
      creadoPorId: session.user.id
    });

    const cliente = await prisma.cliente.create({
      data: dataToSave,
      include: {
        tickets: true
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