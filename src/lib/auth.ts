import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcrypt';
import { db } from '@/lib/prisma-docker';

export interface CustomUser {
  id: number;
  email: string;
  name: string;
  role: string;
  permissions: string[];
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
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        console.log('=== INICIANDO AUTENTICACIÓN ===');
        console.log('Email recibido:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Faltan credenciales');
          return null;
        }

        console.log('Buscando usuario en la base de datos...');
        const user = await db.usuarios.findUnique({
          where: { 
            email: credentials.email,
            activo: true
          },
          include: {
            usuarios_roles: {
              include: {
                roles: {
                  include: {
                    roles_permisos: {
                      include: {
                        permisos: true
                      }
                    }
                  }
                }
              }
            },
            usuarios_puntos_recoleccion: {
              include: {
                puntos_recoleccion: true
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

        const isPasswordValid = await compare(credentials.password, user.password_hash);

        if (!isPasswordValid) {
          console.log('Contraseña inválida');
          return null;
        }

        console.log('Contraseña válida');
        console.log('Roles del usuario:', user.usuarios_roles.map((ur: any) => ur.roles.nombre));

        // Preparar el objeto de usuario OPTIMIZADO (sin roles anidados)
        const userWithRoles: CustomUser = {
          id: Number(user.id),
          email: user.email,
          name: user.nombre,
          role: user.usuarios_roles[0]?.roles?.nombre || 'USER',
          permissions: user.usuarios_roles.flatMap((ur: any) => 
            ur.roles.roles_permisos.map((p: any) => p.permisos.codigo)
          ),
          puntoRecoleccion: user.usuarios_puntos_recoleccion[0]?.puntos_recoleccion ? {
            id: user.usuarios_puntos_recoleccion[0].puntos_recoleccion.id,
            nombre: user.usuarios_puntos_recoleccion[0].puntos_recoleccion.nombre
          } : undefined
        };

        console.log('Usuario autenticado exitosamente:', userWithRoles.email);
        console.log('Rol asignado:', userWithRoles.role);
        console.log('=== FIN AUTENTICACIÓN ===\n');

        return userWithRoles as any;
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  // Configuración específica de cookies para Docker
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    callbackUrl: {
      name: 'next-auth.callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name: 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.permissions = user.permissions;
        token.puntoRecoleccion = user.puntoRecoleccion;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: Number(token.id) as number,
          email: token.email as string,
          name: token.name as string,
          role: token.role as string,
          permissions: token.permissions as string[],
          puntoRecoleccion: token.puntoRecoleccion as { id: number; nombre: string; } | undefined,
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      console.log('🔀 Callback de redirección:', { url, baseUrl });
      
      // Si la URL es relativa, hacerla absoluta
      if (url.startsWith('/')) {
        const redirectUrl = `${baseUrl}${url}`;
        console.log('📍 Redirigiendo a URL relativa:', redirectUrl);
        return redirectUrl;
      }
      
      // Si la URL es absoluta y del mismo dominio, permitirla
      if (url.startsWith(baseUrl)) {
        console.log('📍 Redirigiendo a URL del mismo dominio:', url);
        return url;
      }
      
      // Si es una URL externa, verificar que sea segura
      if (url.startsWith('http')) {
        console.log('⚠️ URL externa detectada, redirigiendo al dashboard:', url);
        return `${baseUrl}/dashboard`;
      }
      
      // Por defecto, redirigir al dashboard
      console.log('📍 Redirigiendo por defecto al dashboard');
      return `${baseUrl}/dashboard`;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },
  debug: true,
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