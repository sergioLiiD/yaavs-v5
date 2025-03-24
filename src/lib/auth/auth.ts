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
  secret: process.env.NEXTAUTH_SECRET || "tu_secreto_seguro_para_nextauth_aqui",
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  debug: process.env.NODE_ENV === 'development',
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
        console.log('Authorize function called with:', credentials);
        
        if (!credentials?.email || !credentials.password) {
          console.log('No credentials provided');
          return null;
        }

        // Implementación simulada para pruebas iniciales
        if (credentials.email === 'admin@example.com' && credentials.password === 'password') {
          console.log('Test credentials matched, returning mock user');
          const user = {
            id: '1',
            name: 'Administrador',
            email: 'admin@example.com',
            role: 'ADMINISTRADOR',
          };
          return user;
        }

        console.log('No matching user found');
        return null;

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
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT callback - token:', token);
      console.log('JWT callback - user:', user);
      
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback - session:', session);
      console.log('Session callback - token:', token);
      
      if (token && session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
}; 