import { prisma } from '@/lib/prisma';
import { ChecklistItem } from '@prisma/client';

interface CreateChecklistItemData {
  nombre: string;
  descripcion?: string;
  paraDiagnostico: boolean;
  paraReparacion: boolean;
  checklistDiagnosticoId?: number;
}

interface UpdateChecklistItemData {
  nombre?: string;
  descripcion?: string;
  paraDiagnostico?: boolean;
  paraReparacion?: boolean;
  checklistDiagnosticoId?: number;
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

      const createData: any = {
        nombre: data.nombre.trim(),
        descripcion: data.descripcion?.trim() || '',
        paraDiagnostico: data.paraDiagnostico,
        paraReparacion: data.paraReparacion,
      };

      if (data.checklistDiagnosticoId) {
        createData.checklistDiagnosticoId = data.checklistDiagnosticoId;
      }

      return await prisma.checklistItem.create({
        data: createData
      });
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  static async update(id: number, data: UpdateChecklistItemData): Promise<ChecklistItem> {
    try {
      await this.getById(id);
      if (data.nombre && !data.nombre.trim()) {
        throw new Error('El nombre no puede estar vacío');
      }

      const updateData: any = {};

      if (data.nombre) {
        updateData.nombre = data.nombre.trim();
      }
      if (data.descripcion !== undefined) {
        updateData.descripcion = data.descripcion.trim() || '';
      }
      if (data.paraDiagnostico !== undefined) {
        updateData.paraDiagnostico = data.paraDiagnostico;
      }
      if (data.paraReparacion !== undefined) {
        updateData.paraReparacion = data.paraReparacion;
      }
      if (data.checklistDiagnosticoId !== undefined) {
        updateData.checklistDiagnosticoId = data.checklistDiagnosticoId;
      }

      return await prisma.checklistItem.update({
        where: { id },
        data: updateData
      });
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<void> {
    try {
      await this.getById(id);
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
      return await prisma.checklistItem.findMany({
        where: {
          checklistDiagnosticoId
        },
        orderBy: {
          id: 'asc'
        }
      });
    } catch (error) {
      console.error('Error en getByChecklistDiagnostico:', error);
      throw new Error('Error al obtener los items del checklist de diagnóstico');
    }
  }
} 