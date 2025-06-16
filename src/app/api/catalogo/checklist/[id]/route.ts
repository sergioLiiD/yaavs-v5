import { NextResponse } from 'next/server';
import { ChecklistService } from '@/services/checklistService';

// PUT /api/catalogo/checklist/[id]
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { nombre, descripcion, paraDiagnostico, paraReparacion } = body;

    // Validar que el ID sea un número válido
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Validar campos si se están actualizando
    if (nombre !== undefined && !nombre.trim()) {
      return NextResponse.json(
        { error: 'El nombre no puede estar vacío' },
        { status: 400 }
      );
    }

    if (paraDiagnostico !== undefined && paraReparacion !== undefined) {
      if (!paraDiagnostico && !paraReparacion) {
        return NextResponse.json(
          { error: 'Debe seleccionar al menos un tipo de checklist' },
          { status: 400 }
        );
      }
    }

    const checklistItem = await ChecklistService.update(id, {
      nombre: nombre?.trim(),
      descripcion,
      paraDiagnostico,
      paraReparacion
    });

    return NextResponse.json(checklistItem);
  } catch (error) {
    console.error('Error al actualizar item del checklist:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al actualizar el item del checklist' },
      { status: error instanceof Error && error.message.includes('no encontrado') ? 404 : 500 }
    );
  }
}

// DELETE /api/catalogo/checklist/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validar que el ID sea un número válido
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    await ChecklistService.delete(id);
    return NextResponse.json({ message: 'Item eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar item del checklist:', error);
    
    // Si el error indica que el ítem está en uso, devolver 409 Conflict
    if (error instanceof Error && error.message.includes('está en uso')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    // Para otros errores, mantener el comportamiento actual
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al eliminar el item del checklist' },
      { status: error instanceof Error && error.message.includes('no encontrado') ? 404 : 500 }
    );
  }
} 