import { prisma } from '@/lib/prisma';
import { checklist_items } from '@prisma/client';

interface CreateChecklistItemData {
  nombre: string;
  descripcion?: string;
  paraDiagnostico: boolean;
  paraReparacion: boolean;
}

interface UpdateChecklistItemData {
  nombre?: string;
  descripcion?: string;
  paraDiagnostico?: boolean;
  paraReparacion?: boolean;
}

export class ChecklistService {
  static async getAll(): Promise<checklist_items[]> {
    try {
      return await prisma.checklist_items.findMany({
        orderBy: {
          id: 'asc',
        },
      });
    } catch (error) {
      console.error('Error en getAll:', error);
      throw new Error('Error al obtener los items del checklist');
    }
  }

  static async getById(id: number): Promise<checklist_items> {
    try {
      const item = await prisma.checklist_items.findUnique({
        where: { id }
      });

      if (!item) {
        throw new Error('Item no encontrado');
      }

      return item;
    } catch (error) {
      console.error('Error en getById:', error);
      throw error;
    }
  }

  static async create(data: CreateChecklistItemData): Promise<checklist_items> {
    try {
      if (!data.nombre.trim()) {
        throw new Error('El nombre no puede estar vacío');
      }

      return await prisma.checklist_items.create({
        data: {
          nombre: data.nombre.trim(),
          descripcion: data.descripcion?.trim() || '',
          para_diagnostico: data.paraDiagnostico,
          para_reparacion: data.paraReparacion,
          updated_at: new Date(),
        }
      });
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  static async update(id: number, data: UpdateChecklistItemData): Promise<ChecklistItem> {
    try {
      const item = await this.getById(id);

      // Verificar si el item está en uso
      const respuestas = await prisma.checklist_diagnostico.findFirst({
        where: {
          checklist_respuesta_diagnostico: {
            some: {
              checklist_item_id: id
            }
          }
        }
      });

      if (respuestas) {
        throw new Error('No se puede actualizar un item que está en uso en un diagnóstico');
      }

      if (data.nombre && !data.nombre.trim()) {
        throw new Error('El nombre no puede estar vacío');
      }

      return await prisma.checklist_items.update({
        where: { id },
        data: {
          nombre: data.nombre?.trim(),
          descripcion: data.descripcion?.trim() || '',
          para_diagnostico: data.paraDiagnostico,
          para_reparacion: data.paraReparacion,
          updated_at: new Date(),
        }
      });
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      // Verificar si el item existe
      const item = await prisma.checklist_items.findUnique({
        where: { id }
      });

      if (!item) {
        throw new Error('Item no encontrado');
      }

      // Verificar si el item está en uso
      const respuestas = await prisma.checklist_diagnostico.findFirst({
        where: {
          checklist_respuesta_diagnostico: {
            some: {
              checklist_item_id: id
            }
          }
        }
      });

      if (respuestas) {
        throw new Error('No se puede eliminar un item que está en uso en un diagnóstico');
      }

      // Eliminar el item directamente
      await prisma.checklist_items.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  static async getByChecklistDiagnostico(checklistDiagnosticoId: number): Promise<ChecklistItem[]> {
    try {
      const diagnostico = await prisma.checklist_diagnostico.findUnique({
        where: { id: checklistDiagnosticoId },
        include: {
          checklist_respuesta_diagnostico: {
            include: {
              checklist_items: true
            }
          }
        }
      });

      if (!diagnostico) {
        throw new Error('Checklist de diagnóstico no encontrado');
      }

      return diagnostico.checklist_respuesta_diagnostico.map(r => r.checklist_items);
    } catch (error) {
      console.error('Error en getByChecklistDiagnostico:', error);
      throw new Error('Error al obtener los items del checklist de diagnóstico');
    }
  }
} 