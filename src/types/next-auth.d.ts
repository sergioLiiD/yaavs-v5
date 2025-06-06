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
    permisos: string[];
  }

  interface Session {
    user: {
      id: number;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      permisos: string[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    role: string;
    permisos: string[];
  }
} 