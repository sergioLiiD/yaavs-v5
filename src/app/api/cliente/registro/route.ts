import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
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
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export async function POST(request: Request) {
  try {
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

    // Crear el cliente
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    console.log('Creando cliente...');
    const cliente = await prisma.cliente.create({
      data: {
        nombre: validatedData.nombre,
        apellidoPaterno: validatedData.apellidoPaterno,
        apellidoMaterno: validatedData.apellidoMaterno || null,
        telefonoCelular: validatedData.telefonoCelular,
        telefonoContacto: validatedData.telefonoContacto || null,
        email: validatedData.email,
        rfc: validatedData.rfc || null,
        calle: validatedData.calle || null,
        numeroExterior: validatedData.numeroExterior || null,
        numeroInterior: validatedData.numeroInterior || null,
        colonia: validatedData.colonia || null,
        ciudad: validatedData.ciudad || null,
        estado: validatedData.estado || null,
        codigoPostal: validatedData.codigoPostal || null,
        latitud: validatedData.latitud || null,
        longitud: validatedData.longitud || null,
        fuenteReferencia: validatedData.fuenteReferencia || null,
        passwordHash: hashedPassword,
        tipoRegistro: 'WEB',
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
        createdAt: true,
        updatedAt: true,
        tipoRegistro: true
      }
    });
    console.log('Cliente creado:', cliente.id);

    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Error detallado al registrar cliente:', error);
    return NextResponse.json(
      { error: 'Error al registrar el cliente' },
      { status: 500 }
    );
  }
} 