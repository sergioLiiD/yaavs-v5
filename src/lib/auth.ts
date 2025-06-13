import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';
import { db } from '@/lib/db';

const prisma = new PrismaClient();

export interface User {
  id: number;
  email: string;
  name: string;
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
}

export interface Session {
  user: User;
  permissions: string[];
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.usuario.findUnique({
          where: { 
            email: credentials.email,
            activo: true
          },
          include: {
            usuarioRoles: {
              include: {
                rol: {
                  include: {
                    permisos: {
                      include: {
                        permiso: true
                      }
                    }
                  }
                }
              }
            }
          } as any
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          return null;
        }

        // Preparar el objeto de usuario con roles y permisos anidados
        const userWithRoles = {
          id: user.id,
          email: user.email,
          name: user.nombre,
          role: user.usuarioRoles[0]?.rol?.nombre || 'USER',
          permissions: user.usuarioRoles.flatMap(ur => 
            ur.rol.permisos.map(p => p.permiso.codigo)
          ),
          roles: user.usuarioRoles.map(ur => ({
            rol: {
              id: ur.rol.id,
              nombre: ur.rol.nombre,
              descripcion: ur.rol.descripcion,
              permisos: ur.rol.permisos.map(p => ({
                permiso: {
                  id: p.permiso.id,
                  codigo: p.permiso.codigo,
                  nombre: p.permiso.nombre,
                  descripcion: p.permiso.descripcion,
                  categoria: p.permiso.categoria
                }
              }))
            }
          }))
        };

        return userWithRoles;
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.permissions = user.permissions;
        token.roles = user.roles;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role;
        session.user.permissions = token.permissions;
        session.user.roles = token.roles;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  debug: process.env.NODE_ENV === 'development'
}; 