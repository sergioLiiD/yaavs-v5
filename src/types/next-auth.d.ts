import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    nombre: string;
    nivel: string;
  }

  interface Session {
    user: User & {
      id: string;
      nivel: string;
    };
  }
} 