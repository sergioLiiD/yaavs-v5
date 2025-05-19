import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
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