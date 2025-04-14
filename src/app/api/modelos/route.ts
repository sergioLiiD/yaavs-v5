import { NextResponse } from 'next/server';

// GET: Obtener todos los modelos o filtrados por marca - Sin autenticación
export async function GET(request: Request) {
  try {
    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const marcaId = searchParams.get('marcaId');

    console.log('API: Recibiendo solicitud de modelos. Parámetro marcaId:', marcaId);

    // Datos estáticos de modelos
    const modelosMuestra = [
      // Apple
      { id: 1, nombre: 'iPhone 15 Pro Max', marcaId: 1 },
      { id: 2, nombre: 'iPhone 15 Pro', marcaId: 1 },
      { id: 3, nombre: 'iPhone 15', marcaId: 1 },
      { id: 4, nombre: 'iPhone 14 Pro Max', marcaId: 1 },
      { id: 5, nombre: 'iPhone 14 Pro', marcaId: 1 },
      { id: 6, nombre: 'iPhone 14', marcaId: 1 },
      { id: 7, nombre: 'iPhone 13 Pro Max', marcaId: 1 },
      { id: 8, nombre: 'iPhone 13', marcaId: 1 },
      { id: 9, nombre: 'iPhone 12', marcaId: 1 },
      { id: 10, nombre: 'iPhone 11', marcaId: 1 },
      { id: 11, nombre: 'iPhone X', marcaId: 1 },
      // Samsung
      { id: 12, nombre: 'Galaxy S24 Ultra', marcaId: 2 },
      { id: 13, nombre: 'Galaxy S24+', marcaId: 2 },
      { id: 14, nombre: 'Galaxy S24', marcaId: 2 },
      { id: 15, nombre: 'Galaxy S23 Ultra', marcaId: 2 },
      { id: 16, nombre: 'Galaxy S23', marcaId: 2 },
      { id: 17, nombre: 'Galaxy S22', marcaId: 2 },
      { id: 18, nombre: 'Galaxy Z Fold 5', marcaId: 2 },
      { id: 19, nombre: 'Galaxy Z Flip 5', marcaId: 2 },
      { id: 20, nombre: 'Galaxy A54', marcaId: 2 },
      // Xiaomi
      { id: 21, nombre: 'Redmi Note 13 Pro', marcaId: 3 },
      { id: 22, nombre: 'Redmi Note 13', marcaId: 3 },
      { id: 23, nombre: 'Xiaomi 14 Ultra', marcaId: 3 },
      { id: 24, nombre: 'Xiaomi 14', marcaId: 3 },
      { id: 25, nombre: 'Xiaomi 13T Pro', marcaId: 3 },
      { id: 26, nombre: 'POCO F5', marcaId: 3 },
      // Huawei
      { id: 27, nombre: 'P60 Pro', marcaId: 4 },
      { id: 28, nombre: 'Mate 60 Pro', marcaId: 4 },
      { id: 29, nombre: 'Nova 11', marcaId: 4 },
      // Motorola
      { id: 30, nombre: 'Edge 40 Pro', marcaId: 5 },
      { id: 31, nombre: 'Moto G84', marcaId: 5 },
      { id: 32, nombre: 'Razr 40 Ultra', marcaId: 5 },
      // LG
      { id: 33, nombre: 'Velvet', marcaId: 6 },
      { id: 34, nombre: 'Wing', marcaId: 6 },
      { id: 35, nombre: 'V60 ThinQ', marcaId: 6 },
      // Sony
      { id: 36, nombre: 'Xperia 1 V', marcaId: 7 },
      { id: 37, nombre: 'Xperia 5 V', marcaId: 7 },
      { id: 38, nombre: 'Xperia 10 V', marcaId: 7 },
      // OnePlus
      { id: 39, nombre: '12', marcaId: 8 },
      { id: 40, nombre: '11', marcaId: 8 },
      { id: 41, nombre: 'Nord 3', marcaId: 8 },
      // Google
      { id: 42, nombre: 'Pixel 8 Pro', marcaId: 9 },
      { id: 43, nombre: 'Pixel 8', marcaId: 9 },
      { id: 44, nombre: 'Pixel 7a', marcaId: 9 }
    ];

    // Filtrar por marca si se proporciona el parámetro
    let modelosFiltrados = modelosMuestra;
    if (marcaId) {
      modelosFiltrados = modelosMuestra.filter(modelo => 
        modelo.marcaId === parseInt(marcaId)
      );
    }

    console.log('API: Enviando modelos filtrados:', modelosFiltrados.length);
    return NextResponse.json(modelosFiltrados);
  } catch (error) {
    console.error('Error al obtener modelos:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
} 