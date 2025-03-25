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

        // Implementación real con base de datos
        const user = await prisma.usuario.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash || !user.activo) {
          console.log('Usuario no encontrado o inactivo');
          return null;
        }

        const passwordValid = await compare(credentials.password, user.passwordHash);

        if (!passwordValid) {
          console.log('Contraseña inválida');
          return null;
        }
        
        console.log('Usuario autenticado correctamente:', user.email);
        return {
          id: user.id.toString(),
          name: `${user.nombre} ${user.apellidoPaterno}`,
          email: user.email,
          role: user.nivel,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

export default authOptions; 