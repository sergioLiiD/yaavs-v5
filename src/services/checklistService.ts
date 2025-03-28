import { prisma } from '@/lib/prisma';

export class ChecklistService {
  static async getAll() {
    try {
      return await prisma.checklistItem.findMany({
        orderBy: {
          nombre: 'asc'
        }
      });
    } catch (error) {
      console.error('Error en getAll:', error);
      throw new Error('Error al obtener los items del checklist');
    }
  }

  static async getById(id: number) {
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

  static async create(data: {
    nombre: string;
    descripcion?: string;
    paraDiagnostico: boolean;
    paraReparacion: boolean;
  }) {
    try {
      // Validar que el nombre no esté vacío
      if (!data.nombre.trim()) {
        throw new Error('El nombre no puede estar vacío');
      }

      // Validar que al menos uno de los tipos esté seleccionado
      if (!data.paraDiagnostico && !data.paraReparacion) {
        throw new Error('Debe seleccionar al menos un tipo de checklist');
      }

      return await prisma.checklistItem.create({
        data: {
          ...data,
          nombre: data.nombre.trim(),
          activo: true
        }
      });
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  static async update(id: number, data: {
    nombre?: string;
    descripcion?: string;
    paraDiagnostico?: boolean;
    paraReparacion?: boolean;
    activo?: boolean;
  }) {
    try {
      // Verificar que el item existe
      await this.getById(id);

      // Validar que el nombre no esté vacío si se está actualizando
      if (data.nombre && !data.nombre.trim()) {
        throw new Error('El nombre no puede estar vacío');
      }

      // Validar que al menos uno de los tipos esté seleccionado
      if (data.paraDiagnostico !== undefined && data.paraReparacion !== undefined) {
        if (!data.paraDiagnostico && !data.paraReparacion) {
          throw new Error('Debe seleccionar al menos un tipo de checklist');
        }
      }

      return await prisma.checklistItem.update({
        where: { id },
        data: {
          ...data,
          nombre: data.nombre ? data.nombre.trim() : undefined
        }
      });
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  static async delete(id: number) {
    try {
      // Verificar que el item existe
      await this.getById(id);

      return await prisma.checklistItem.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  static async getByTipo(tipo: 'diagnostico' | 'reparacion') {
    try {
      return await prisma.checklistItem.findMany({
        where: {
          activo: true,
          ...(tipo === 'diagnostico' 
            ? { paraDiagnostico: true }
            : { paraReparacion: true }
          )
        },
        orderBy: {
          nombre: 'asc'
        }
      });
    } catch (error) {
      console.error('Error en getByTipo:', error);
      throw new Error('Error al obtener los items del checklist por tipo');
    }
  }
} 