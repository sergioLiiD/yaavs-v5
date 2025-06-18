import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';
import { db } from '@/lib/db';

const prisma = new PrismaClient();

export interface CustomUser {
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
  puntoRecoleccion?: {
    id: number;
    nombre: string;
  };
}

export interface Session {
  user: CustomUser;
}

declare module 'next-auth' {
  interface User extends CustomUser {}
  interface Session {
    user: CustomUser;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends CustomUser {}
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
        console.log('=== INICIANDO AUTENTICACIÓN ===');
        console.log('Email recibido:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Faltan credenciales');
          return null;
        }

        console.log('Buscando usuario en la base de datos...');
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
            },
            puntosRecoleccion: {
              include: {
                puntoRecoleccion: true
              }
            }
          }
        });

        if (!user) {
          console.log('Usuario no encontrado o inactivo');
          return null;
        }

        console.log('Usuario encontrado:', user.email);
        console.log('Verificando contraseña...');

        const isPasswordValid = await compare(credentials.password, user.passwordHash);

        if (!isPasswordValid) {
          console.log('Contraseña inválida');
          return null;
        }

        console.log('Contraseña válida');
        console.log('Roles del usuario:', user.usuarioRoles.map(ur => ur.rol.nombre));

        // Preparar el objeto de usuario con roles y permisos anidados
        const userWithRoles: CustomUser = {
          id: parseInt(user.id.toString(), 10),
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
              descripcion: ur.rol.descripcion || '',
              permisos: ur.rol.permisos.map(p => ({
                permiso: {
                  id: p.permiso.id,
                  codigo: p.permiso.codigo,
                  nombre: p.permiso.nombre,
                  descripcion: p.permiso.descripcion || '',
                  categoria: p.permiso.categoria
                }
              }))
            }
          })),
          puntoRecoleccion: user.puntosRecoleccion[0]?.puntoRecoleccion ? {
            id: user.puntosRecoleccion[0].puntoRecoleccion.id,
            nombre: user.puntosRecoleccion[0].puntoRecoleccion.nombre
          } : undefined
        };

        console.log('Usuario autenticado exitosamente:', userWithRoles.email);
        console.log('Rol asignado:', userWithRoles.role);
        console.log('=== FIN AUTENTICACIÓN ===\n');

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
        token.puntoRecoleccion = user.puntoRecoleccion;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: typeof token.id === 'string' ? parseInt(token.id, 10) : token.id,
          email: token.email as string,
          name: token.name as string,
          role: token.role as string,
          permissions: token.permissions as string[],
          roles: token.roles,
          puntoRecoleccion: token.puntoRecoleccion as { id: number; nombre: string; } | undefined,
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Si la URL es relativa, hacerla absoluta
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // Si la URL es absoluta y del mismo dominio, permitirla
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Por defecto, redirigir al dashboard
      return `${baseUrl}/dashboard`;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  debug: process.env.NODE_ENV === 'development',
  events: {
    async signOut() {
      // Limpiar cualquier estado de sesión al cerrar sesión
    }
  },
  logger: {
    error(code, metadata) {
      // Solo registrar errores reales, no los 401 esperados
      if (code !== 'CLIENT_FETCH_ERROR') {
        console.error(code, metadata);
      }
    },
    warn(code) {
      console.warn(code);
    },
    debug(code, metadata) {
      console.debug(code, metadata);
    }
  }
}; 