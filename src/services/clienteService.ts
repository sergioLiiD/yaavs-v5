import { prisma } from '@/lib/prisma';
import { Cliente, CreateClienteDTO, UpdateClienteDTO } from '@/types/cliente';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

export class ClienteService {
  // Obtener todos los clientes
  static async getAll(puntoRecoleccionId?: number): Promise<Cliente[]> {
    try {
      const where: Prisma.ClienteWhereInput = {
        activo: true
      };

      // Si se proporciona un puntoRecoleccionId, filtrar por ese punto
      if (puntoRecoleccionId) {
        where.puntoRecoleccionId = puntoRecoleccionId;
      }

      const clientes = await prisma.cliente.findMany({
        where,
        orderBy: {
          nombre: 'asc'
        },
        include: {
          puntoRecoleccion: {
            select: {
              id: true,
              name: true,
              isRepairPoint: true
            }
          }
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
        where: { id },
        select: {
          id: true,
          nombre: true,
          apellidoPaterno: true,
          apellidoMaterno: true,
          telefonoCelular: true,
          telefonoContacto: true,
          email: true,
          calle: true,
          numeroExterior: true,
          numeroInterior: true,
          colonia: true,
          ciudad: true,
          estado: true,
          codigoPostal: true,
          latitud: true,
          longitud: true,
          fuenteReferencia: true,
          rfc: true,
          createdAt: true,
          updatedAt: true,
          tipoRegistro: true
        }
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
  static async create(data: {
    email: string;
    password: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    telefonoCelular: string;
    telefonoContacto?: string;
    calle: string;
    numeroExterior: string;
    numeroInterior?: string;
    colonia: string;
    ciudad: string;
    estado: string;
    codigoPostal: string;
    latitud?: number;
    longitud?: number;
    fuenteReferencia?: string;
    rfc?: string;
    tipoRegistro?: string;
  }): Promise<Cliente> {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.cliente.create({
      data: {
        ...data,
        passwordHash: hashedPassword
      }
    });
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
    const cliente = await prisma.cliente.findUnique({
      where: { email }
    });

    if (!cliente) {
      return null;
    }

    const isValid = await bcrypt.compare(password, cliente.passwordHash);
    if (!isValid) {
      return null;
    }

    return cliente;
  }

  static async findById(id: number) {
    return prisma.cliente.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        telefonoCelular: true,
        telefonoContacto: true,
        email: true,
        calle: true,
        numeroExterior: true,
        numeroInterior: true,
        colonia: true,
        ciudad: true,
        estado: true,
        codigoPostal: true,
        latitud: true,
        longitud: true,
        fuenteReferencia: true,
        rfc: true,
        createdAt: true,
        updatedAt: true,
        tipoRegistro: true,
        passwordHash: true
      }
    });
  }

  static async findByEmail(email: string) {
    return prisma.cliente.findUnique({
      where: { email }
    });
  }

  static async findAll(where?: Prisma.ClienteWhereInput) {
    return prisma.cliente.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
} 