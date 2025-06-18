import 'next-auth';
import { NivelUsuario } from '@/types/usuario';
import NextAuth from "next-auth"
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: number;
    email: string;
    name?: string | null;
    role: string;
    permissions: string[];
    roles: Array<{
      rol: {
        id: number;
        nombre: string;
        descripcion: string;
        permisos: Array<{
          permiso: {
            id: number;
            codigo: string;
            nombre: string;
            descripcion: string;
            categoria: string;
          };
        }>;
      };
    }>;
    repairPointId?: string;
    canRepair?: boolean;
    puntoRecoleccion?: {
      id: number;
      nombre: string;
    };
  }

  interface Session {
    user: {
      id: number;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      permissions: string[];
      roles: Array<{
        rol: {
          id: number;
          nombre: string;
          descripcion: string;
          permisos: Array<{
            permiso: {
              id: number;
              codigo: string;
              nombre: string;
              descripcion: string;
              categoria: string;
            };
          }>;
        };
      }>;
      repairPointId?: string;
      canRepair?: boolean;
      puntoRecoleccion?: {
        id: number;
        nombre: string;
      };
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    role: string;
    permissions: string[];
    roles: Array<{
      rol: {
        id: number;
        nombre: string;
        descripcion: string;
        permisos: Array<{
          permiso: {
            id: number;
            codigo: string;
            nombre: string;
            descripcion: string;
            categoria: string;
          };
        }>;
      };
    }>;
    repairPointId?: string;
    canRepair?: boolean;
  }
} 