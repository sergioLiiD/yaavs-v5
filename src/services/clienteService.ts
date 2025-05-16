import { prisma } from '@/lib/prisma';
import { CreateClienteDTO, UpdateClienteDTO, Cliente } from '@/types/cliente';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';

export class ClienteService {
  // Obtener todos los clientes
  static async getAll(): Promise<Cliente[]> {
    try {
      const clientes = await prisma.cliente.findMany({
        orderBy: {
          nombre: 'asc'
        }
      });
      return clientes;
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw new Error('Error al obtener los clientes');
    }
  }

  // Obtener un cliente por ID
  static async getById(id: number): Promise<Cliente | null> {
    try {
      const cliente = await prisma.cliente.findUnique({
        where: { id }
      });
      return cliente;
    } catch (error) {
      console.error('Error al obtener cliente por ID:', error);
      throw new Error('Error al obtener el cliente');
    }
  }

  // Obtener un cliente por email
  static async getByEmail(email: string): Promise<Cliente | null> {
    try {
      const cliente = await prisma.cliente.findFirst({
        where: { email }
      });
      return cliente;
    } catch (error) {
      console.error('Error al obtener cliente por email:', error);
      throw new Error('Error al obtener el cliente');
    }
  }

  // Crear un nuevo cliente
  static async create(data: CreateClienteDTO): Promise<Cliente> {
    try {
      console.log('Iniciando creación de cliente en servicio...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(data.password, salt);

      console.log('Creando cliente en base de datos...');
      const cliente = await prisma.cliente.create({
        data: {
          nombre: data.nombre,
          apellidoPaterno: data.apellidoPaterno,
          apellidoMaterno: data.apellidoMaterno,
          telefonoCelular: data.telefonoCelular,
          email: data.email,
          passwordHash,
          activo: true,
          tipoRegistro: data.tipoRegistro || 'Registro propio',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log('Cliente creado exitosamente en servicio:', cliente.id);
      return cliente;
    } catch (error) {
      console.error('Error al crear cliente en servicio:', error);
      throw new Error('Error al crear el cliente');
    }
  }

  // Actualizar un cliente
  static async update(id: number, data: UpdateClienteDTO): Promise<Cliente> {
    const updateData: any = {
      ...data
    };

    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(data.password, salt);
      delete updateData.password;
      delete updateData.confirmPassword;
    }

    const cliente = await prisma.cliente.update({
      where: { id },
      data: updateData
    });
    return cliente as Cliente;
  }

  // Eliminar un cliente (soft delete)
  static async delete(id: number): Promise<boolean> {
    const result = await prisma.cliente.update({
      where: { id },
      data: { activo: false }
    });
    return !!result;
  }

  // Verificar si un email ya existe
  static async emailExists(email: string, excludeId?: number): Promise<boolean> {
    try {
      const count = await prisma.cliente.count({
        where: {
          email,
          ...(excludeId ? { id: { not: excludeId } } : {})
        }
      });
      return count > 0;
    } catch (error) {
      console.error('Error al verificar email:', error);
      throw new Error('Error al verificar el email');
    }
  }

  // Verificar credenciales de cliente
  static async verifyCredentials(email: string, password: string): Promise<Cliente | null> {
    try {
      const cliente = await prisma.cliente.findFirst({
        where: {
          email,
          activo: true
        }
      });

      if (!cliente) return null;
      if (!cliente.passwordHash) return null;

      const isValid = await bcrypt.compare(password, cliente.passwordHash);
      if (!isValid) return null;

      return cliente;
    } catch (error) {
      console.error('Error al verificar credenciales:', error);
      throw new Error('Error al verificar las credenciales');
    }
  }
} 