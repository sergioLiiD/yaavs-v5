import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  repairPointId?: string;
  canRepair?: boolean;
  usuarios_puntos_recoleccion?: Array<{
    id: string;
    puntoRecoleccionId: string;
    usuarioId: number;
    rolId: number;
    activo: boolean;
    puntos_recoleccion: {
      id: string;
      isRepairPoint: boolean;
    };
  }>;
  roles?: Array<{
    rol: {
      nombre: string;
      permisos: Array<{
        permiso: {
          codigo: string;
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
  adapter: PrismaAdapter(db) as any,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/repair-point/login',
    error: '/repair-point/login'
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        type: { label: 'Type', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Credenciales faltantes');
          return null;
        }

        try {
          const user = await db.usuario.findUnique({
            where: {
              email: credentials.email,
            },
            include: {
              usuariosPuntos: {
                include: {
                  puntos_recoleccion: {
                    select: {
                      id: true,
                      isRepairPoint: true
                    }
                  }
                }
              },
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

          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!passwordMatch) {
            console.log('Contraseña incorrecta para:', credentials.email);
            return null;
          }

          // Verificar los roles y permisos del usuario
          const userRoles = user.roles.map(role => ({
            nombre: role.rol.nombre,
            permisos: role.rol.permisos.map(p => p.permiso.codigo)
          }));

          console.log('Roles del usuario:', userRoles);

          // Determinar el rol principal y permisos
          let role = 'USER';
          let permissions: string[] = [];
          let puntoRecoleccion = null;

          // Verificar si es administrador
          const isAdmin = userRoles.some(r => r.nombre === 'ADMINISTRADOR');
          if (isAdmin) {
            role = 'ADMINISTRATOR';
            permissions = ['*']; // Todos los permisos
          } else {
            // Verificar si es técnico
            const isTechnician = userRoles.some(r => r.nombre === 'TECNICO');
            if (isTechnician) {
              role = 'TECHNICIAN';
              // Obtener permisos específicos del técnico
              const techRole = userRoles.find(r => r.nombre === 'TECNICO');
              if (techRole) {
                permissions = techRole.permisos;
              }
              // Verificar punto de recolección para técnicos
              puntoRecoleccion = user.usuariosPuntos?.[0]?.puntos_recoleccion;
              if (!puntoRecoleccion) {
                console.log('Técnico no asignado a ningún punto de recolección:', user.email);
                return null;
              }
            } else {
              // Para otros roles, asignar permisos según su rol
              userRoles.forEach(r => {
                permissions = [...permissions, ...r.permisos];
              });
            }
          }

          return {
            id: user.id,
            email: user.email,
            name: user.nombre,
            role,
            permissions,
            repairPointId: puntoRecoleccion?.id,
            canRepair: puntoRecoleccion?.isRepairPoint
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
        token.id = Number(user.id);
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.permissions = user.permissions;
        token.repairPointId = user.repairPointId;
        token.canRepair = user.canRepair;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = Number(token.id);
        session.user.email = token.email || '';
        session.user.name = token.name || '';
        session.user.role = token.role || '';
        session.user.permissions = token.permissions || [];
        session.user.repairPointId = token.repairPointId || '';
        session.user.canRepair = token.canRepair || false;
      }
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