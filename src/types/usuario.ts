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
  usuarios_roles?: Array<{
    id: number;
    usuario_id: number;
    rol_id: number;
    created_at: Date;
    updated_at: Date;
    roles: {
      id: number;
      nombre: string;
      descripcion?: string;
      roles_permisos: Array<{
        id: number;
        rol_id: number;
        permiso_id: number;
        permisos: {
          id: number;
          codigo: string;
          nombre: string;
          descripcion?: string;
          categoria: string;
        }
      }>
    }
  }>;
  usuarioRoles?: Array<{
    id: number;
    usuarioId: number;
    rolId: number;
    createdAt: Date;
    updatedAt: Date;
    rol: {
      id: number;
      nombre: string;
      descripcion?: string;
      permisos: Array<{
        id: number;
        rolId: number;
        permisoId: number;
        permiso: {
          id: number;
          codigo: string;
          nombre: string;
          descripcion?: string;
          categoria: string;
        }
      }>
    }
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