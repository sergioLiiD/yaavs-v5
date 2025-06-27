import { NextResponse } from 'next/server';
import { ChecklistService } from '@/services/checklistService';

export const dynamic = 'force-dynamic';

// GET /api/catalogo/checklist/tipo/[tipo]
export async function GET(
  request: Request,
  { params }: { params: { tipo: string } }
) {
  try {
    if (params.tipo !== 'diagnostico' && params.tipo !== 'reparacion') {
      return NextResponse.json(
        { error: 'Tipo de checklist inválido. Debe ser "diagnostico" o "reparacion"' },
        { status: 400 }
      );
    }

    const checklistItems = await ChecklistService.getByTipo(
      params.tipo as 'diagnostico' | 'reparacion'
    );

    return NextResponse.json(checklistItems);
  } catch (error) {
    console.error('Error al obtener items del checklist:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al obtener los items del checklist' },
      { status: 500 }
    );
  }
} 