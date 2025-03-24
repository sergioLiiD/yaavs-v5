import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '../db/prisma';
import { compare } from 'bcrypt';

// Extender tipos para incluir role e id
declare module 'next-auth' {
  interface User {
    role?: string;
    id: string;
  }
  
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    id: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      name: 'Credenciales',
      credentials: {
        email: { label: 'Correo Electrónico', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        // Implementación simulada para pruebas iniciales
        // En producción, descomenta el código que accede a la base de datos
        
        // Simulación de usuario para pruebas
        if (credentials.email === 'admin@example.com' && credentials.password === 'password') {
          return {
            id: '1',
            name: 'Administrador',
            email: 'admin@example.com',
            role: 'ADMINISTRADOR',
          };
        }

        /* 
        // Implementación real con base de datos
        const user = await prisma.usuario.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash || !user.activo) {
          return null;
        }

        const passwordValid = await compare(credentials.password, user.passwordHash);

        if (!passwordValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          name: `${user.nombre} ${user.apellidoPaterno}`,
          email: user.email,
          role: user.nivel,
        };
        */

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
}; 