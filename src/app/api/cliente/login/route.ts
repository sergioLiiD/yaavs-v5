import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ClienteService } from '@/services/clienteService';
import { generateToken } from '@/lib/jwt';

// Configurar para usar Node.js runtime
export const runtime = 'nodejs';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export async function POST(request: Request) {
  try {
    console.log('Iniciando proceso de login en API...');
    const body = await request.json();
    
    // Validar datos de entrada
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos', details: result.error.errors },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    console.log('Verificando credenciales...');

    // Verificar credenciales
    const cliente = await ClienteService.verifyCredentials(email, password);
    if (!cliente) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Generar token JWT
    console.log('Generando token JWT...');
    const token = await generateToken({
      id: cliente.id,
      email: cliente.email,
    });

    // Crear respuesta
    const response = NextResponse.json({
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        apellidoPaterno: cliente.apellidoPaterno,
        apellidoMaterno: cliente.apellidoMaterno,
        email: cliente.email,
        telefonoCelular: cliente.telefonoCelular,
        telefonoContacto: cliente.telefonoContacto,
        calle: cliente.calle,
        numeroExterior: cliente.numeroExterior,
        numeroInterior: cliente.numeroInterior,
        colonia: cliente.colonia,
        ciudad: cliente.ciudad,
        estado: cliente.estado,
        codigoPostal: cliente.codigoPostal,
        latitud: cliente.latitud,
        longitud: cliente.longitud,
        fuenteReferencia: cliente.fuenteReferencia,
        rfc: cliente.rfc,
        tipoRegistro: cliente.tipoRegistro,
        createdAt: cliente.createdAt,
        updatedAt: cliente.updatedAt,
      },
      token,
    });

    // Establecer cookie
    console.log('Estableciendo cookie...');
    response.cookies.set('cliente_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 días
    });

    console.log('Login exitoso para cliente:', cliente.id);
    return response;
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 