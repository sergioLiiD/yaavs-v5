import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

export interface Session {
  user: User;
  permissions: string[];
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('Credenciales faltantes');
            return null;
          }

          console.log('Intentando autenticar:', credentials.email);

          const user = await db.usuario.findUnique({
            where: {
              email: credentials.email
            },
            include: {
              roles: {
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
            }
          });

          if (!user) {
            console.log('Usuario no encontrado:', credentials.email);
            return null;
          }

          console.log('Usuario encontrado:', {
            id: user.id,
            email: user.email,
            roles: user.roles.map(r => r.rol.nombre)
          });

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!passwordMatch) {
            console.log('Contraseña incorrecta para:', credentials.email);
            return null;
          }

          console.log('Autenticación exitosa para:', credentials.email);

          const roles = user.roles.map(r => r.rol.nombre);
          const permisos = user.roles.flatMap(r => 
            r.rol.permisos.map(rp => rp.permiso.codigo)
          );

          console.log('Permisos asignados:', permisos);

          return {
            id: user.id,
            email: user.email,
            name: user.nombre,
            role: roles[0] || 'USER',
            permisos: permisos
          };
        } catch (error) {
          console.error('Error en authorize:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.permisos = user.permisos;
      }
      console.log('Token generado:', token);
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          role: token.role as string,
          permisos: token.permisos as string[]
        };
      }
      console.log('Sesión generada:', session);
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  events: {
    async signIn({ user }) {
      console.log('Usuario inició sesión:', user.email);
    },
    async signOut({ token }) {
      console.log('Usuario cerró sesión:', token.email);
    },
    async session({ session, token }) {
      console.log('Sesión actualizada:', session.user.email);
    }
  }
}; 