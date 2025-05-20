export type NivelUsuario = 'ADMINISTRADOR' | 'TECNICO' | 'ATENCION_CLIENTE';

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  nivel: NivelUsuario;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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