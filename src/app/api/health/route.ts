import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Verificar que estamos en el entorno correcto
    const env = {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      DATABASE_URL: process.env.DATABASE_URL ? 'Configurada' : 'No configurada',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    };

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: env,
      uptime: process.uptime(),
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error en health check:', error);
    return NextResponse.json({
      status: 'error',
      message: error?.message || 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 