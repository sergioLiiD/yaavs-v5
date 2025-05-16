import { Cliente as PrismaCliente } from '@prisma/client';

export type Cliente = PrismaCliente;

export interface CreateClienteDTO {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  telefonoCelular: string;
  email: string;
  password: string;
  confirmPassword: string;
  tipoRegistro?: string;
}

export interface UpdateClienteDTO {
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string | null;
  telefonoCelular?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
} 