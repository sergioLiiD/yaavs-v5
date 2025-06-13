import { Cliente as PrismaCliente, Usuario } from '@prisma/client';

export type ClienteWithRelations = PrismaCliente & {
  tickets: any[];
  direcciones: any[];
  creadoPor?: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string | null;
    email: string;
  } | null;
};

export type Cliente = PrismaCliente;

export interface CreateClienteDTO {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  telefonoCelular: string;
  telefonoContacto?: string;
  email: string;
  calle?: string;
  numeroExterior?: string;
  numeroInterior?: string;
  colonia?: string;
  ciudad?: string;
  estado?: string;
  codigoPostal?: string;
  latitud?: number;
  longitud?: number;
  fuenteReferencia?: string;
  rfc?: string;
  password?: string;
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