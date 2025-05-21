import { Prisma } from '@prisma/client';

export type NivelUsuario = 'ADMINISTRADOR' | 'TECNICO' | 'ATENCION_CLIENTE';

export type Usuario = Prisma.UsuarioGetPayload<{
  select: {
    id: true;
    email: true;
    nombre: true;
    apellidoPaterno: true;
    apellidoMaterno: true;
    nivel: true;
    activo: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

export interface CreateUsuarioDTO {
  email: string;
  password: string;
  confirmPassword: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  nivel: NivelUsuario;
  activo?: boolean;
}

export interface UpdateUsuarioDTO {
  email?: string;
  password?: string;
  confirmPassword?: string;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string | null;
  nivel?: NivelUsuario;
  activo?: boolean;
} 