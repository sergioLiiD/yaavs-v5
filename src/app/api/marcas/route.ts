import { NextResponse } from 'next/server';

// GET: Obtener todas las marcas - Sin autenticación
export async function GET() {
  try {
    // Datos estáticos de marcas
    const marcas = [
      { id: 1, nombre: 'Apple' },
      { id: 2, nombre: 'Samsung' },
      { id: 3, nombre: 'Xiaomi' },
      { id: 4, nombre: 'Huawei' },
      { id: 5, nombre: 'Motorola' },
      { id: 6, nombre: 'LG' },
      { id: 7, nombre: 'Sony' },
      { id: 8, nombre: 'OnePlus' },
      { id: 9, nombre: 'Google' }
    ];

    console.log('API: Enviando datos de marcas:', marcas);
    return NextResponse.json(marcas);
  } catch (error) {
    console.error('Error al obtener marcas:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
} 