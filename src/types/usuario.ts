import { Prisma } from '@prisma/client';

export type NivelUsuario = 'ADMINISTRADOR' | 'TECNICO' | 'ATENCION_CLIENTE';

export interface Rol {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  usuariosPuntos?: Array<{
    id: string;
    puntoRecoleccionId: string;
    usuarioId: number;
    rolId: number;
    activo: boolean;
    puntos_recoleccion: {
      id: string;
      isRepairPoint: boolean;
    };
  }>;
  roles?: Array<{
    rol: {
      nombre: string;
      permisos: Array<{
        permiso: {
          codigo: string;
        };
      }>;
    };
  }>;
}

export interface CreateUsuarioDTO {
  email: string;
  password: string;
  confirmPassword: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  activo?: boolean;
  roles?: number[]; // IDs de los roles a asignar
}

export interface UpdateUsuarioDTO {
  email?: string;
  password?: string;
  confirmPassword?: string;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string | null;
  activo?: boolean;
  roles?: number[]; // IDs de los roles a asignar
} 