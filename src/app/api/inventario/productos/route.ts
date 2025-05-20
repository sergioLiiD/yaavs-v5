import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// Definir el tipo de usuario extendido
interface User {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role?: string;
  nivel?: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('GET /api/inventario/productos - Session:', session?.user?.email);

    if (!session?.user) {
      console.log('GET /api/inventario/productos - No autorizado');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const productos = await prisma.producto.findMany({
      include: {
        marca: true,
        modelo: true,
        proveedor: true,
        categoria: true,
        fotos: true,
        inventarioMinimo: true,
      },
    });

    return NextResponse.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener productos',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/inventario/productos - Iniciando...');
    
    const session = await getServerSession(authOptions);
    console.log('POST /api/inventario/productos - Session:', session?.user?.email);

    if (!session?.user) {
      console.log('POST /api/inventario/productos - No autorizado');
      return NextResponse.json(
        { error: 'No autorizado. Por favor, inicia sesión.' },
        { status: 401 }
      );
    }

    const data = await request.json();
    console.log('POST /api/inventario/productos - Datos recibidos:', data);
    console.log('tipoServicioId recibido:', data.tipoServicioId, typeof data.tipoServicioId);

    // Validar campos básicos requeridos
    const camposFaltantes = [];
    if (!data.nombre) camposFaltantes.push('nombre');
    if (!data.tipoServicioId) camposFaltantes.push('tipo de servicio');

    // Validar campos adicionales según el tipo
    if (data.tipo === 'PRODUCTO') {
      if (!data.marcaId) camposFaltantes.push('marca');
      if (!data.modeloId) camposFaltantes.push('modelo');
    }

    if (camposFaltantes.length > 0) {
      return NextResponse.json(
        { 
          error: 'Campos requeridos faltantes',
          campos: camposFaltantes.join(', '),
          mensaje: `Por favor, proporciona los siguientes campos: ${camposFaltantes.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Convertir IDs a números
    const tipoServicioId = Number(data.tipoServicioId);
    console.log('tipoServicioId después de la conversión:', tipoServicioId, typeof tipoServicioId);
    
    if (isNaN(tipoServicioId)) {
      return NextResponse.json(
        { 
          error: 'Error de validación',
          mensaje: 'El ID del tipo de servicio debe ser un número válido'
        },
        { status: 400 }
      );
    }
    const marcaId = data.tipo === 'PRODUCTO' ? parseInt(data.marcaId) : null;
    const modeloId = data.tipo === 'PRODUCTO' ? parseInt(data.modeloId) : null;
    const proveedorId = data.tipo === 'PRODUCTO' ? parseInt(data.proveedorId) : null;

    // Crear el producto usando una transacción para asegurar la integridad de los datos
    const nuevoProducto = await prisma.$transaction(async (tx) => {
      // Verificar que existan todas las relaciones necesarias
      console.log('tipoServicioId antes de la consulta:', tipoServicioId, typeof tipoServicioId);
      
      const tipoServicio = await tx.tipoServicio.findUnique({ 
        where: { 
          id: tipoServicioId 
        } 
      });

      console.log('Resultado de la consulta tipoServicio:', tipoServicio);

      const [marca, modelo, proveedor] = await Promise.all([
        data.tipo === 'PRODUCTO' ? tx.marca.findUnique({ where: { id: marcaId! } }) : null,
        data.tipo === 'PRODUCTO' ? tx.modelo.findUnique({ where: { id: modeloId! } }) : null,
        data.tipo === 'PRODUCTO' ? tx.proveedor.findUnique({ where: { id: proveedorId! } }) : null
      ]);

      if (!tipoServicio) {
        throw new Error('El tipo de servicio seleccionado no existe');
      }

      if (data.tipo === 'PRODUCTO') {
        if (!marca) throw new Error('La marca seleccionada no existe');
        if (!modelo) throw new Error('El modelo seleccionado no existe');
        if (!proveedor) throw new Error('El proveedor seleccionado no existe');
      }

      // Preparar los datos para crear el producto
      const createData = {
        sku: data.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        notasInternas: data.notasInternas || null,
        garantiaValor: data.garantiaValor || 0,
        garantiaUnidad: data.garantiaUnidad || 'dias',
        stock: 0,
        precioPromedio: 0,
        stockMaximo: data.stockMaximo || 0,
        stockMinimo: data.stockMinimo || 0,
        tipo: data.tipo || 'PRODUCTO',
        tipoServicioId,
        marcaId: data.tipo === 'PRODUCTO' ? marcaId : null,
        modeloId: data.tipo === 'PRODUCTO' ? modeloId : null,
        proveedorId: data.tipo === 'PRODUCTO' ? proveedorId : null,
        categoriaId: data.categoriaId || null
      } as const;

      // Crear el producto
      const producto = await tx.producto.create({
        data: createData,
        include: {
          marca: true,
          modelo: true,
          proveedor: true,
          categoria: true,
          fotos: true,
        },
      });

      return producto;
    });

    console.log('POST /api/inventario/productos - Producto creado:', nuevoProducto);
    return NextResponse.json(nuevoProducto, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear producto:', error);
    
    // Manejar errores específicos con mensajes más descriptivos
    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          error: 'Conflicto de datos',
          mensaje: 'Ya existe un producto con el mismo SKU. Por favor, utiliza un SKU diferente.'
        },
        { status: 400 }
      );
    }

    if (error.code === 'P2003') {
      return NextResponse.json(
        { 
          error: 'Error de relaciones',
          mensaje: 'Una o más relaciones no existen. Por favor, verifica que todos los IDs proporcionados sean válidos.'
        },
        { status: 400 }
      );
    }

    // Para errores personalizados de validación
    if (error.message && !error.code) {
      return NextResponse.json(
        { 
          error: 'Error de validación',
          mensaje: error.message
        },
        { status: 400 }
      );
    }

    // Para otros errores no manejados específicamente
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        mensaje: 'Ha ocurrido un error al crear el producto. Por favor, inténtalo de nuevo.',
        detalles: error.message
      },
      { status: 500 }
    );
  }
} 