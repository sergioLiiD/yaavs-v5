import { prisma } from '@/lib/prisma';
import { CreateUsuarioDTO, UpdateUsuarioDTO, Usuario } from '@/types/usuario';
import bcrypt from 'bcryptjs';
import { sql } from '@vercel/postgres';
import { NivelUsuario, Prisma } from '@prisma/client';

export class UsuarioService {
  // Obtener todos los usuarios
  static async getAll(): Promise<Usuario[]> {
    const usuarios = await prisma.usuario.findMany({
      orderBy: {
        nombre: 'asc'
      },
      include: {
        roles: {
          include: {
            rol: true
          }
        }
      }
    });
    return usuarios as Usuario[];
  }

  // Obtener un usuario por ID
  static async getById(id: number): Promise<Usuario | null> {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            rol: true
          }
        }
      }
    });
    return usuario as Usuario | null;
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

    const usuario = await prisma.usuario.create({
      data: {
        email: data.email,
        passwordHash,
        nombre: data.nombre,
        apellidoPaterno: data.apellidoPaterno,
        apellidoMaterno: data.apellidoMaterno,
        nivel: data.nivel as NivelUsuario,
        activo: data.activo ?? true,
        roles: {
          create: data.roles?.map(rolId => ({
            rolId
          }))
        }
      },
      include: {
        roles: {
          include: {
            rol: true
          }
        }
      }
    });
    return usuario as Usuario;
  }

  // Actualizar un usuario
  static async update(id: number, data: UpdateUsuarioDTO): Promise<Usuario> {
    const updateData: Prisma.UsuarioUpdateInput = {
      ...data
    };

    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(data.password, salt);
      delete updateData.password;
    }

    // Primero eliminamos los roles existentes
    await prisma.usuarioRol.deleteMany({
      where: { usuarioId: id }
    });

    const usuario = await prisma.usuario.update({
      where: { id },
      data: {
        ...updateData,
        roles: {
          create: data.roles?.map(rolId => ({
            rolId
          }))
        }
      },
      include: {
        roles: {
          include: {
            rol: true
          }
        }
      }
    });
    return usuario as Usuario;
  }

  // Eliminar un usuario
  static async delete(id: number): Promise<boolean> {
    // Primero eliminamos las relaciones de roles
    await prisma.usuarioRol.deleteMany({
      where: { usuarioId: id }
    });

    // Luego eliminamos el usuario
    const result = await prisma.usuario.delete({
      where: { id }
    });
    return !!result;
  }

  // Verificar si un email ya existe
  static async emailExists(email: string, excludeId?: number): Promise<boolean> {
    const count = await prisma.usuario.count({
      where: {
        email,
        id: excludeId ? { not: excludeId } : undefined
      }
    });
    return count > 0;
  }

  // Verificar credenciales de usuario
  static async verifyCredentials(email: string, password: string): Promise<Usuario | null> {
    const usuario = await prisma.usuario.findFirst({
      where: {
        email,
        activo: true
      },
      include: {
        roles: {
          include: {
            rol: true
          }
        }
      }
    });

    if (!usuario) return null;

    const isValid = await bcrypt.compare(password, usuario.passwordHash);
    if (!isValid) return null;

    return usuario as Usuario;
  }
}