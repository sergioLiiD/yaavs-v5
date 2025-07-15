import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient, Prisma, usuarios, usuarios_roles, roles, permisos, puntos_recoleccion, usuarios_puntos_recoleccion } from '@prisma/client';
import { compare } from 'bcrypt';

const prisma = new PrismaClient();

type UsuarioWithRelations = usuarios & {
  usuarios_roles: (usuarios_roles & {
    roles: roles & {
      roles_permisos: {
        permisos: permisos;
      }[];
    }
  })[];
  usuarios_puntos_recoleccion: (usuarios_puntos_recoleccion & {
    puntos_recoleccion: puntos_recoleccion
  })[];
};

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
        id: number;
        nombre: string;
      }>;
    };
  }>;
  puntoRecoleccion?: {
    id: number;
    nombre: string;
  };
}

declare module 'next-auth' {
  interface User extends CustomUser {}
  interface Session {
    user: CustomUser;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
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
          id: number;
          nombre: string;
        }>;
      };
    }>;
    puntoRecoleccion?: {
      id: number;
      nombre: string;
    };
  }
}

export const authOptionsRepairPoint: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/login',
    error: '/auth/login',
  },
  cookies: {
    sessionToken: {
      name: 'repair-point-session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    callbackUrl: {
      name: 'repair-point-callback-url',
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name: 'repair-point-csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        console.log('Iniciando autorización para repair-point');
        if (!credentials?.email || !credentials?.password) {
          console.log('Faltan credenciales');
          return null;
        }

        console.log('Buscando usuario:', credentials.email);
        try {
          const user = await prisma.usuarios.findUnique({
            where: { 
              email: credentials.email,
              activo: true
            },
            include: {
              usuarios_puntos_recoleccion: {
                include: {
                  puntos_recoleccion: true
                }
              },
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
              }
            }
          }) as UsuarioWithRelations | null;

          if (!user) {
            console.log('Usuario no encontrado');
            return null;
          }

          console.log('Usuario encontrado, verificando contraseña');
          const isPasswordValid = await compare(credentials.password, user.password_hash);

          if (!isPasswordValid) {
            console.log('Contraseña inválida');
            return null;
          }

          // Verificar si el usuario tiene un rol permitido
          const allowedRoles = ['ADMINISTRADOR_PUNTO', 'USUARIO_PUNTO', 'ADMINISTRADOR'];
          const userRole = user.usuarios_roles[0]?.roles?.nombre;
          console.log('Rol del usuario:', userRole);
          
          if (!allowedRoles.includes(userRole)) {
            console.log('Rol no permitido');
            return null;
          }

          // Si no es administrador general, verificar si tiene punto de recolección asignado
          if (userRole !== 'ADMINISTRADOR' && user.usuarios_puntos_recoleccion.length === 0) {
            console.log('Usuario sin punto de recolección asignado');
            return null;
          }

          const puntoRecoleccion = user.usuarios_puntos_recoleccion[0]?.puntos_recoleccion;
          console.log('Punto de recolección:', puntoRecoleccion?.nombre);
          
          const permissions = user.usuarios_roles.flatMap(r => 
            r.roles.roles_permisos.map(p => p.permisos.nombre)
          );
          console.log('Permisos:', permissions);

          const userData: CustomUser = {
            id: user.id,
            email: user.email,
            name: user.nombre,
            role: userRole || '',
            permissions,
            roles: user.usuarios_roles.map(ur => ({
              rol: {
                id: ur.roles.id,
                nombre: ur.roles.nombre,
                descripcion: ur.roles.descripcion || '',
                permisos: ur.roles.roles_permisos.map(p => ({
                  id: p.permisos.id,
                  nombre: p.permisos.nombre
                }))
              }
            })),
            puntoRecoleccion: puntoRecoleccion ? {
              id: puntoRecoleccion.id,
              nombre: puntoRecoleccion.nombre
            } : undefined
          };

          console.log('Autenticación exitosa para:', userData.email);
          return userData as any;
        } catch (error) {
          console.error('Error en autorización:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token = { ...token, ...user };
      }
      return {
        ...token,
        id: typeof token.id === 'string' ? Number(token.id) : token.id
      };
    },
    async session({ session, token }) {
      session.user = token as any;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Asegurarnos de que las redirecciones se mantengan dentro de /repair-point
      if (url.startsWith(baseUrl)) {
        if (!url.includes('/repair-point')) {
          return `${baseUrl}/repair-point`;
        }
        return url;
      } else if (url.startsWith('/')) {
        if (!url.startsWith('/repair-point')) {
          return `${baseUrl}/repair-point`;
        }
        return `${baseUrl}${url}`;
      }
      return baseUrl;
    }
  },
  debug: true
}; 