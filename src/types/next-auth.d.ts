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
    id: number | string;
    role: string;
    permissions: string[];
    repairPointId?: string;
    canRepair?: boolean;
    puntoRecoleccion?: {
      id: number;
      nombre: string;
    };
  }
} 