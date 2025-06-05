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
  apellidoMaterno: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  roles: Array<{
    rol: Rol;
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