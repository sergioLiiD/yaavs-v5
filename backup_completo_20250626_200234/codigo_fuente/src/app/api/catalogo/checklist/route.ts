import { NextResponse } from 'next/server';
import { ChecklistService } from '@/services/checklistService';

// GET /api/catalogo/checklist
export async function GET() {
  try {
    const checklistItems = await ChecklistService.getAll();
    return NextResponse.json(checklistItems);
  } catch (error) {
    console.error('Error al obtener items del checklist:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener los items del checklist' },
      { status: 500 }
    );
  }
}

// POST /api/catalogo/checklist
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, descripcion, paraDiagnostico, paraReparacion } = body;

    // Validar campos requeridos
    if (!nombre) {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    if (typeof paraDiagnostico !== 'boolean' || typeof paraReparacion !== 'boolean') {
      return NextResponse.json(
        { error: 'Los campos paraDiagnostico y paraReparacion son requeridos y deben ser booleanos' },
        { status: 400 }
      );
    }

    const checklistItem = await ChecklistService.create({
      nombre,
      descripcion,
      paraDiagnostico,
      paraReparacion
    });

    return NextResponse.json(checklistItem, { status: 201 });
  } catch (error) {
    console.error('Error al crear item del checklist:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear el item del checklist' },
      { status: error instanceof Error && error.message.includes('no puede estar vacío') ? 400 : 500 }
    );
  }
} 