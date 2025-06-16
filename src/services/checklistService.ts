import { prisma } from '@/lib/prisma';
import { ChecklistItem } from '@prisma/client';

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
  static async getAll(): Promise<ChecklistItem[]> {
    try {
      return await prisma.checklistItem.findMany({
        orderBy: {
          id: 'asc',
        },
      });
    } catch (error) {
      console.error('Error en getAll:', error);
      throw new Error('Error al obtener los items del checklist');
    }
  }

  static async getById(id: number): Promise<ChecklistItem> {
    try {
      const item = await prisma.checklistItem.findUnique({
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

  static async create(data: CreateChecklistItemData): Promise<ChecklistItem> {
    try {
      if (!data.nombre.trim()) {
        throw new Error('El nombre no puede estar vacío');
      }

      // @ts-expect-error - Prisma types issue
      return await prisma.checklistItem.create({
        data: {
          nombre: data.nombre.trim(),
          descripcion: data.descripcion?.trim() || '',
          paraDiagnostico: data.paraDiagnostico,
          paraReparacion: data.paraReparacion,
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
      const respuestas = await prisma.checklistDiagnostico.findFirst({
        where: {
          respuestas: {
            some: {
              checklistItemId: id
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

      // @ts-expect-error - Prisma types issue
      return await prisma.checklistItem.update({
        where: { id },
        data: {
          nombre: data.nombre?.trim(),
          descripcion: data.descripcion?.trim() || '',
          paraDiagnostico: data.paraDiagnostico,
          paraReparacion: data.paraReparacion,
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
      const item = await prisma.checklistItem.findUnique({
        where: { id }
      });

      if (!item) {
        throw new Error('Item no encontrado');
      }

      // Verificar si el item está en uso
      const respuestas = await prisma.checklistDiagnostico.findFirst({
        where: {
          respuestas: {
            some: {
              checklistItemId: id
            }
          }
        }
      });

      if (respuestas) {
        throw new Error('No se puede eliminar un item que está en uso en un diagnóstico');
      }

      // Eliminar el item directamente
      await prisma.checklistItem.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  static async getByChecklistDiagnostico(checklistDiagnosticoId: number): Promise<ChecklistItem[]> {
    try {
      // @ts-expect-error - Prisma types issue
      const diagnostico = await prisma.checklistDiagnostico.findUnique({
        where: { id: checklistDiagnosticoId },
        include: {
          respuestas: {
            include: {
              checklistItem: true
            }
          }
        }
      });

      if (!diagnostico) {
        throw new Error('Checklist de diagnóstico no encontrado');
      }

      return diagnostico.respuestas.map(r => r.checklistItem);
    } catch (error) {
      console.error('Error en getByChecklistDiagnostico:', error);
      throw new Error('Error al obtener los items del checklist de diagnóstico');
    }
  }
} 