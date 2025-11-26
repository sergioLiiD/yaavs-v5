import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
    console.log('Iniciando registro de cliente...');
    
    const data = await request.json();
    console.log('Datos recibidos:', { ...data, password: '[REDACTED]' });
    
    // Validar datos con el esquema
    const validatedData = clienteSchema.parse(data);
    console.log('Datos validados correctamente');

    // Normalizar email y teléfono
    const emailNormalizado = validatedData.email.toLowerCase().trim();
    const telefonoNormalizado = validatedData.telefonoCelular.trim().replace(/\s+/g, '');

    // Verificar si el email ya existe
    const existingClienteByEmail = await prisma.clientes.findUnique({
      where: { email: emailNormalizado },
      select: {
        id: true,
        nombre: true,
        apellido_paterno: true,
        email: true,
        telefono_celular: true
      }
    });

    if (existingClienteByEmail) {
      console.log('Email ya registrado:', emailNormalizado);
      const nombreCompleto = `${existingClienteByEmail.nombre} ${existingClienteByEmail.apellido_paterno}`.trim();
      return NextResponse.json(
        { 
          error: 'El correo electrónico ya está registrado',
          message: `Ya existe una cuenta registrada con el correo electrónico "${validatedData.email}". Cliente: ${nombreCompleto}. Si ya tienes una cuenta, intenta iniciar sesión.`,
          field: 'email',
          existingClient: {
            id: existingClienteByEmail.id,
            nombre: nombreCompleto,
            email: existingClienteByEmail.email,
            telefono: existingClienteByEmail.telefono_celular
          }
        },
        { status: 400 }
      );
    }

    // Verificar si el teléfono ya existe (normalizar teléfonos en la búsqueda)
    const existingClienteByPhone = await prisma.clientes.findFirst({
      where: { 
        telefono_celular: telefonoNormalizado
      },
      select: {
        id: true,
        nombre: true,
        apellido_paterno: true,
        email: true,
        telefono_celular: true
      }
    });

    if (existingClienteByPhone) {
      console.log('Teléfono ya registrado:', telefonoNormalizado);
      const nombreCompleto = `${existingClienteByPhone.nombre} ${existingClienteByPhone.apellido_paterno}`.trim();
      return NextResponse.json(
        { 
          error: 'El número de teléfono ya está registrado',
          message: `Ya existe una cuenta registrada con el número de teléfono "${validatedData.telefonoCelular}". Cliente: ${nombreCompleto}. Si ya tienes una cuenta, intenta iniciar sesión.`,
          field: 'telefonoCelular',
          existingClient: {
            id: existingClienteByPhone.id,
            nombre: nombreCompleto,
            email: existingClienteByPhone.email,
            telefono: existingClienteByPhone.telefono_celular
          }
        },
        { status: 400 }
      );
    }

    // Crear el cliente
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);
    console.log('Creando cliente...');
    const cliente = await prisma.clientes.create({
      data: {
        nombre: validatedData.nombre,
        apellido_paterno: validatedData.apellidoPaterno,
        apellido_materno: validatedData.apellidoMaterno || null,
        telefono_celular: telefonoNormalizado, // Usar teléfono normalizado
        telefono_contacto: validatedData.telefonoContacto || null,
        email: emailNormalizado, // Usar email normalizado
        rfc: validatedData.rfc || null,
        calle: validatedData.calle || null,
        numero_exterior: validatedData.numeroExterior || null,
        numero_interior: validatedData.numeroInterior || null,
        colonia: validatedData.colonia || null,
        ciudad: validatedData.ciudad || null,
        estado: validatedData.estado || null,
        codigo_postal: validatedData.codigoPostal || null,
        latitud: validatedData.latitud || null,
        longitud: validatedData.longitud || null,
        fuente_referencia: validatedData.fuenteReferencia || null,
        password_hash: hashedPassword,
        tipo_registro: 'WEB',
        updated_at: new Date()
      },
      select: {
        id: true,
        nombre: true,
        apellido_paterno: true,
        apellido_materno: true,
        telefono_celular: true,
        telefono_contacto: true,
        email: true,
        calle: true,
        numero_exterior: true,
        numero_interior: true,
        colonia: true,
        ciudad: true,
        estado: true,
        codigo_postal: true,
        latitud: true,
        longitud: true,
        fuente_referencia: true,
        rfc: true,
        created_at: true,
        updated_at: true,
        tipo_registro: true
      }
    });
    console.log('Cliente creado exitosamente:', cliente.id);

    return NextResponse.json({ 
      success: true, 
      cliente,
      message: 'Cliente registrado exitosamente' 
    });
  } catch (error) {
    console.error('Error detallado al registrar cliente:', error);
    
    // Si es un error de validación de Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Datos de entrada inválidos', 
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    // Si es un error de Prisma (violación de constraint único)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      const target = (error as any).meta?.target as string[] | undefined;
      if (target && target.includes('email')) {
        return NextResponse.json(
          { 
            error: 'El correo electrónico ya está registrado',
            message: `El correo electrónico "${validatedData?.email || 'proporcionado'}" ya está en uso. Por favor, utiliza otro correo electrónico o intenta iniciar sesión si ya tienes una cuenta.`,
            field: 'email'
          },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor al registrar el cliente' },
      { status: 500 }
    );
  }
} 