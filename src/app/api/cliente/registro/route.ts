import { NextResponse } from 'next/server';
import { ClienteService } from '@/services/clienteService';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Esquema de validación para el registro de clientes
const registroSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellidoPaterno: z.string().min(1, 'El apellido paterno es requerido'),
  apellidoMaterno: z.string().optional(),
  telefonoCelular: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export async function POST(request: Request) {
  try {
    console.log('Iniciando registro de cliente...');
    
    // Verificar que el cuerpo de la petición sea JSON
    const contentType = request.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Content-Type inválido:', contentType);
      return NextResponse.json(
        { error: 'El contenido debe ser JSON' },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log('Datos recibidos:', { ...body, password: '[REDACTED]' });
    
    // Validar los datos de entrada
    const validatedData = registroSchema.parse(body);
    console.log('Datos validados correctamente');

    // Verificar si el email ya está registrado
    const emailExists = await ClienteService.emailExists(validatedData.email);
    if (emailExists) {
      console.log('Email ya registrado:', validatedData.email);
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Crear el cliente
    console.log('Creando cliente...');
    const cliente = await ClienteService.create({
      ...validatedData,
      tipoRegistro: 'Registro propio'
    });
    console.log('Cliente creado exitosamente:', cliente.id);

    // Omitir el passwordHash de la respuesta
    const { passwordHash, ...clienteSinPassword } = cliente;

    return NextResponse.json({
      message: 'Cliente registrado exitosamente',
      cliente: clienteSinPassword
    });
  } catch (error) {
    console.error('Error detallado al registrar cliente:', error);

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
      { error: 'Error al registrar el cliente' },
      { status: 500 }
    );
  }
} 