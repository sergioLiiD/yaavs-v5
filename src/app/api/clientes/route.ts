import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';
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
  latitud: z.number().optional(),
  longitud: z.number().optional(),
  fuenteReferencia: z.string().optional(),
});

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      select: {
        id: true,
        nombre: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        telefonoCelular: true,
        telefonoContacto: true,
        email: true,
        calle: true,
        numeroExterior: true,
        numeroInterior: true,
        colonia: true,
        ciudad: true,
        estado: true,
        codigoPostal: true,
        latitud: true,
        longitud: true,
        fuenteReferencia: true,
        rfc: true,
        activo: true,
        tipoRegistro: true,
        createdAt: true,
        updatedAt: true
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
    if (!session?.user) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    const data = await request.json();
    console.log('Datos recibidos:', { ...data, password: '[REDACTED]' });
    
    // Validar datos con el esquema
    const validatedData = clienteSchema.parse(data);
    console.log('Datos validados correctamente');

    // Verificar si el email ya existe
    const existingCliente = await prisma.cliente.findUnique({
      where: { email: validatedData.email },
    });

    if (existingCliente) {
      console.log('Email ya registrado:', validatedData.email);
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Generar una contraseña aleatoria
    const defaultPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Crear el cliente
    console.log('Creando cliente...');
    const cliente = await prisma.cliente.create({
      data: {
        nombre: validatedData.nombre,
        apellidoPaterno: validatedData.apellidoPaterno,
        apellidoMaterno: validatedData.apellidoMaterno || '',
        telefonoCelular: validatedData.telefonoCelular,
        telefonoContacto: validatedData.telefonoContacto || '',
        email: validatedData.email,
        rfc: validatedData.rfc || '',
        calle: validatedData.calle || '',
        numeroExterior: validatedData.numeroExterior || '',
        numeroInterior: validatedData.numeroInterior || '',
        colonia: validatedData.colonia || '',
        ciudad: validatedData.ciudad || '',
        estado: validatedData.estado || '',
        codigoPostal: validatedData.codigoPostal || '',
        latitud: validatedData.latitud || null,
        longitud: validatedData.longitud || null,
        fuenteReferencia: validatedData.fuenteReferencia || '',
        passwordHash: hashedPassword,
        tipoRegistro: 'REGISTRO_TIENDA',
        activo: true,
        updatedAt: new Date(),
        createdAt: new Date()
      },
      select: {
        id: true,
        nombre: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        telefonoCelular: true,
        telefonoContacto: true,
        email: true,
        calle: true,
        numeroExterior: true,
        numeroInterior: true,
        colonia: true,
        ciudad: true,
        estado: true,
        codigoPostal: true,
        latitud: true,
        longitud: true,
        fuenteReferencia: true,
        rfc: true,
        activo: true,
        tipoRegistro: true,
        createdAt: true,
        updatedAt: true
      }
    });
    console.log('Cliente creado:', cliente.id);

    // Devolver el cliente con la contraseña temporal
    return NextResponse.json({
      ...cliente,
      passwordTemporal: defaultPassword
    });
  } catch (error) {
    console.error('Error detallado al crear cliente:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Error al crear el cliente' },
      { status: 500 }
    );
  }
} 