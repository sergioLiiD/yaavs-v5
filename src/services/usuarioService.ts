import { prisma } from '@/lib/prisma';
import { CreateUsuarioDTO, UpdateUsuarioDTO, Usuario } from '@/types/usuario';
import bcrypt from 'bcryptjs';
import { sql } from '@vercel/postgres';
import { Prisma } from '@prisma/client';

export class UsuarioService {
  // Obtener todos los usuarios
  static async getAll(): Promise<Usuario[]> {
    const usuarios = await prisma.usuarios.findMany({
      orderBy: {
        nombre: 'asc'
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
        }
      }
    });
    console.log('Usuarios cargados:', JSON.stringify(usuarios, null, 2));
    return usuarios as unknown as Usuario[];
  }

  // Obtener un usuario por ID
  static async getById(id: number): Promise<Usuario | null> {
    const usuario = await prisma.usuarios.findUnique({
      where: { id },
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
        }
      }
    });
    return usuario as unknown as Usuario;
  }

  // Obtener un usuario por email
  static async getByEmail(email: string): Promise<Usuario | null> {
    const { rows } = await sql<Usuario>`
      SELECT id, nombre, apellido_paterno, apellido_materno, email, tipo_usuario, activo,
             created_at, updated_at, created_by, updated_by
      FROM usuarios
      WHERE email = ${email}
    `;
    return rows[0] || null;
  }

  // Crear un nuevo usuario
  static async create(data: CreateUsuarioDTO): Promise<Usuario> {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const usuario = await prisma.usuarios.create({
      data: {
        email: data.email,
        password_hash: passwordHash,
        nombre: data.nombre,
        apellido_paterno: data.apellidoPaterno,
        apellido_materno: data.apellidoMaterno,
        activo: data.activo ?? true,
        updated_at: new Date()
      }
    });

    // Crear las relaciones de roles por separado
    if (data.roles && data.roles.length > 0) {
      await prisma.usuarios_roles.createMany({
        data: data.roles.map(rolId => ({
          usuario_id: usuario.id,
          rol_id: rolId,
          updated_at: new Date()
        }))
      });
    }

    return usuario as unknown as Usuario;
  }

  // Actualizar un usuario
  static async update(id: number, data: UpdateUsuarioDTO): Promise<Usuario> {
    const updateData: Prisma.usuariosUpdateInput = {
      email: data.email,
      nombre: data.nombre,
      apellido_paterno: data.apellidoPaterno,
      apellido_materno: data.apellidoMaterno,
      activo: data.activo,
      updated_at: new Date()
    };

    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(data.password, salt);
    }

    const usuario = await prisma.usuarios.update({
      where: { id },
      data: updateData
    });

    // Actualizar roles por separado
    if (data.roles !== undefined) {
      // Eliminar roles existentes
      await prisma.usuarios_roles.deleteMany({
        where: { usuario_id: id }
      });

      // Crear nuevos roles
      if (data.roles.length > 0) {
        await prisma.usuarios_roles.createMany({
          data: data.roles.map((rolId: number) => ({
            usuario_id: id,
            rol_id: rolId,
            updated_at: new Date()
          }))
        });
      }
    }

    return usuario as unknown as Usuario;
  }

  // Eliminar un usuario
  static async delete(id: number): Promise<boolean> {
    try {
      // Primero eliminamos todas las relaciones del usuario
      
      // 1. Eliminar relaciones de roles
      await prisma.usuarios_roles.deleteMany({
        where: { usuario_id: id }
      });

      // 2. Eliminar relaciones con puntos de recolección
      await prisma.usuarios_puntos_recoleccion.deleteMany({
        where: { usuario_id: id }
      });

      // 3. Eliminar entradas de almacén
      await prisma.entradas_almacen.deleteMany({
        where: { usuario_id: id }
      });

      // 4. Eliminar salidas de almacén
      await prisma.salidas_almacen.deleteMany({
        where: { usuario_id: id }
      });

      // 5. Para tickets donde el usuario es creador, necesitamos asignar otro usuario o eliminar el ticket
      // Por ahora, vamos a verificar si hay tickets creados por este usuario
      const ticketsCreados = await prisma.tickets.count({
        where: { creador_id: id }
      });

      if (ticketsCreados > 0) {
        throw new Error(`No se puede eliminar el usuario porque tiene ${ticketsCreados} tickets creados. Asigne los tickets a otro usuario primero.`);
      }

      // 6. Actualizar tickets donde el usuario es técnico asignado
      await prisma.tickets.updateMany({
        where: { tecnico_asignado_id: id },
        data: { tecnico_asignado_id: null }
      });

      // 7. Actualizar clientes creados por este usuario
      await prisma.clientes.updateMany({
        where: { creado_por_id: id },
        data: { creado_por_id: null }
      });

      // Finalmente eliminamos el usuario
      const result = await prisma.usuarios.delete({
        where: { id }
      });
      
      return !!result;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }

  // Verificar si un email ya existe
  static async emailExists(email: string, excludeId?: number): Promise<boolean> {
    const count = await prisma.usuarios.count({
      where: {
        email,
        id: excludeId ? { not: excludeId } : undefined
      }
    });
    return count > 0;
  }

  // Verificar credenciales de usuario
  static async verifyCredentials(email: string, password: string): Promise<Usuario | null> {
    const usuario = await prisma.usuarios.findFirst({
      where: {
        email,
        activo: true
      },
      include: {
        usuarios_roles: {
          include: {
            roles: true
          }
        }
      }
    });

    if (!usuario) return null;

    const isValid = await bcrypt.compare(password, usuario.password_hash);
    if (!isValid) return null;

    return usuario as unknown as Usuario;
  }
}