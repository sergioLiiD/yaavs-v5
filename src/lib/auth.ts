import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NivelUsuario } from '@/types/usuario';

declare module 'next-auth' {
  interface User {
    id: number;
    email: string;
    nombre: string;
    role: NivelUsuario;
  }

  interface Session {
    user: User & {
      id: number;
      role: NivelUsuario;
    };
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' }
      },
      async authorize(credentials) {
        console.log('Intentando autenticar con:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Credenciales incompletas');
          return null;
        }

        const usuario = await prisma.usuario.findFirst({
          where: {
            email: credentials.email,
            activo: true
          }
        });

        console.log('Usuario encontrado:', usuario ? 'Sí' : 'No');

        if (!usuario) {
          console.log('Usuario no encontrado');
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          usuario.passwordHash
        );

        console.log('Contraseña coincide:', passwordMatch ? 'Sí' : 'No');

        if (!passwordMatch) {
          console.log('Contraseña incorrecta');
          return null;
        }

        console.log('Autenticación exitosa');
        return {
          id: usuario.id,
          email: usuario.email,
          nombre: usuario.nombre,
          role: usuario.nivel
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log('JWT Callback - Token:', token);
      console.log('JWT Callback - User:', user);
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      console.log('Session Callback - Session:', session);
      console.log('Session Callback - Token:', token);
      if (session.user) {
        session.user.id = token.id as number;
        session.user.role = token.role as NivelUsuario;
      }
      return session;
    }
  }
}; 