import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/catalogo/proveedores
export async function GET(req: NextRequest) {
  try {
    console.log('GET /api/catalogo/proveedores - Iniciando...');
    
    const session = await getServerSession(authOptions);
    console.log('GET /api/catalogo/proveedores - Session:', session?.user?.email);

    if (!session?.user) {
      console.log('GET /api/catalogo/proveedores - No autorizado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const proveedores = await prisma.proveedor.findMany({
      orderBy: { nombre: 'asc' }
    });

    console.log('GET /api/catalogo/proveedores - Proveedores encontrados:', proveedores.length);
    return NextResponse.json(proveedores);
  } catch (error) {
    console.error('GET /api/catalogo/proveedores - Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener los proveedores' },
      { status: 500 }
    );
  }
}

// POST /api/catalogo/proveedores
export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/catalogo/proveedores - Iniciando...');
    
    const session = await getServerSession(authOptions);
    console.log('POST /api/catalogo/proveedores - Session:', session?.user?.email);

    if (!session?.user) {
      console.log('POST /api/catalogo/proveedores - No autorizado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await req.json();
    console.log('POST /api/catalogo/proveedores - Datos recibidos:', data);

    // Validar datos requeridos
    if (!data.nombre || !data.telefono) {
      console.log('POST /api/catalogo/proveedores - Datos incompletos:', data);
      return NextResponse.json(
        { error: 'Los campos nombre y teléfono son obligatorios' },
        { status: 400 }
      );
    }

    // Crear el proveedor
    const proveedor = await prisma.proveedor.create({
      data: {
        nombre: data.nombre,
        contacto: data.contacto || '',
        telefono: data.telefono,
        email: data.email || null,
        direccion: data.direccion || null,
        notas: data.notas || null,
        tipo: data.tipo || 'FISICA',
        rfc: data.rfc || '',
        banco: data.banco || '',
        cuentaBancaria: data.cuentaBancaria || '',
        clabeInterbancaria: data.clabeInterbancaria || ''
      }
    });

    console.log('POST /api/catalogo/proveedores - Proveedor creado:', proveedor);
    return NextResponse.json(proveedor);
  } catch (error: any) {
    console.error('POST /api/catalogo/proveedores - Error:', error);
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un proveedor con ese nombre' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error al crear el proveedor' },
      { status: 500 }
    );
  }
}

// PUT /api/catalogo/proveedores/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('PUT /api/catalogo/proveedores/[id] - Iniciando...');
    
    const session = await getServerSession(authOptions);
    console.log('PUT /api/catalogo/proveedores/[id] - Session:', session?.user?.email);

    if (!session?.user) {
      console.log('PUT /api/catalogo/proveedores/[id] - No autorizado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await req.json();
    console.log('PUT /api/catalogo/proveedores/[id] - Datos recibidos:', data);

    // Validar datos requeridos
    if (!data.nombre || !data.contacto || !data.telefono || !data.tipo || !data.rfc || 
        !data.banco || !data.cuentaBancaria || !data.clabeInterbancaria) {
      console.log('PUT /api/catalogo/proveedores/[id] - Datos incompletos:', data);
      return NextResponse.json(
        { error: 'Los campos nombre, contacto, teléfono, tipo, RFC, banco, cuenta bancaria y CLABE son obligatorios' },
        { status: 400 }
      );
    }

    // Validar tipo
    if (!['FISICA', 'MORAL'].includes(data.tipo)) {
      console.log('PUT /api/catalogo/proveedores/[id] - Tipo inválido:', data.tipo);
      return NextResponse.json(
        { error: 'El tipo debe ser FISICA o MORAL' },
        { status: 400 }
      );
    }

    // Actualizar el proveedor
    const proveedor = await prisma.proveedor.update({
      where: { id: parseInt(params.id) },
      data: {
        nombre: data.nombre,
        contacto: data.contacto,
        telefono: data.telefono,
        email: data.email || null,
        direccion: data.direccion || null,
        notas: data.notas || null,
        tipo: data.tipo,
        rfc: data.rfc,
        banco: data.banco,
        cuentaBancaria: data.cuentaBancaria,
        clabeInterbancaria: data.clabeInterbancaria
      }
    });

    console.log('PUT /api/catalogo/proveedores/[id] - Proveedor actualizado:', proveedor);
    return NextResponse.json(proveedor);
  } catch (error: any) {
    console.error('PUT /api/catalogo/proveedores/[id] - Error:', error);
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ya existe un proveedor con ese nombre' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error al actualizar el proveedor' },
      { status: 500 }
    );
  }
}

// DELETE /api/catalogo/proveedores/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('DELETE /api/catalogo/proveedores/[id] - Iniciando...');
    
    const session = await getServerSession(authOptions);
    console.log('DELETE /api/catalogo/proveedores/[id] - Session:', session?.user?.email);

    if (!session?.user) {
      console.log('DELETE /api/catalogo/proveedores/[id] - No autorizado');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Eliminar el proveedor
    await prisma.proveedor.delete({
      where: { id: parseInt(params.id) }
    });

    console.log('DELETE /api/catalogo/proveedores/[id] - Proveedor eliminado');
    return NextResponse.json({ message: 'Proveedor eliminado correctamente' });
  } catch (error) {
    console.error('DELETE /api/catalogo/proveedores/[id] - Error:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el proveedor' },
      { status: 500 }
    );
  }
} 