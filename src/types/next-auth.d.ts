import 'next-auth';
import { NivelUsuario } from '@/types/usuario';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    nombre: string;
    role: NivelUsuario;
  }

  interface Session {
    user: User & {
      id: string;
      role: NivelUsuario;
    };
  }
} 