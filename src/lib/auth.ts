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
    signIn: '/auth/login',
    error: '/auth/login'
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Credenciales faltantes');
          return null;
        }

        try {
          console.log('=== INICIO DEL PROCESO DE AUTENTICACIÓN ===');
          console.log('Credenciales recibidas:', { 
            email: credentials.email,
            password: credentials.password 
          });

          // 1. Buscar el usuario
          console.log('\n1. Buscando usuario...');
          const user = await db.usuario.findUnique({
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
            }
          });

          if (!user) {
            console.log('❌ Usuario no encontrado o inactivo');
            return null;
          }

          // Forzar el tipo any para acceder a usuarioRoles
          const userWithRoles = user as any;

          console.log('✅ Usuario encontrado:', {
            id: userWithRoles.id,
            email: userWithRoles.email,
            roles: userWithRoles.usuarioRoles.map((ur: any) => ur.rol.nombre)
          });

          // 2. Verificar el hash
          console.log('\n2. Verificando hash...');
          console.log('Hash en la base de datos:', user.passwordHash);

          // 3. Comparar contraseñas
          console.log('\n3. Comparando contraseñas...');
          const passwordMatch = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          console.log('¿Contraseña coincide?', passwordMatch ? '✅ Sí' : '❌ No');

          if (!passwordMatch) {
            console.log('❌ Contraseña incorrecta');
            return null;
          }

          // 4. Obtener el rol principal del usuario
          console.log('\n4. Obteniendo rol principal...');
          const mainRole = userWithRoles.usuarioRoles[0]?.rol.nombre || 'USUARIO';
          console.log('Rol principal:', mainRole);

          // 5. Preparar usuario para retornar
          const userToReturn = {
            id: userWithRoles.id,
            email: userWithRoles.email,
            name: userWithRoles.nombre,
            role: mainRole,
            permissions: userWithRoles.usuarioRoles.flatMap((ur: any) => 
              ur.rol.permisos.map((p: any) => p.permiso.codigo)
            )
          };

          console.log('\n5. Usuario autorizado:', userToReturn);
          console.log('\n=== FIN DEL PROCESO DE AUTENTICACIÓN ===');

          return userToReturn;

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
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
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