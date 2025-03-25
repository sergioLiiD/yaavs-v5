import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const usuario = await prisma.usuario.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!usuario || !usuario.activo) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          usuario.passwordHash
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: usuario.id.toString(),
          email: usuario.email,
          nombre: `${usuario.nombre} ${usuario.apellidoPaterno}`,
          nivel: usuario.nivel
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nivel = user.nivel;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.nivel = token.nivel as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt'
  }
}; 