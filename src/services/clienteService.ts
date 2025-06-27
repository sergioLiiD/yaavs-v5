import { prisma } from '@/lib/prisma';
import { Cliente, CreateClienteDTO, UpdateClienteDTO } from '@/types/cliente';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

export class ClienteService {
  // Obtener todos los clientes
  static async getAll(puntoRecoleccionId?: number): Promise<Cliente[]> {
    try {
      const where: Prisma.clientesWhereInput = {};

      // Si se proporciona un puntoRecoleccionId, filtrar por ese punto
      if (puntoRecoleccionId) {
        where.punto_recoleccion_id = puntoRecoleccionId;
      }

      const clientes = await prisma.clientes.findMany({
        where,
        orderBy: {
          nombre: 'asc'
        },
        include: {
          puntos_recoleccion: {
            select: {
              id: true,
              nombre: true,
              is_repair_point: true
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
      const cliente = await prisma.clientes.findUnique({
        where: { id },
        select: {
          id: true,
          nombre: true,
          apellido_paterno: true,
          apellido_materno: true,
          telefono_celular: true,
          telefono_contacto: true,
          email: true,
          calle: true,
          numero_exterior: true,
          numero_interior: true,
          colonia: true,
          ciudad: true,
          estado: true,
          codigo_postal: true,
          latitud: true,
          longitud: true,
          fuente_referencia: true,
          rfc: true,
          created_at: true,
          updated_at: true,
          tipo_registro: true
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
      const cliente = await prisma.clientes.findFirst({
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
    return prisma.clientes.create({
      data: {
        nombre: data.nombre,
        apellido_paterno: data.apellidoPaterno,
        apellido_materno: data.apellidoMaterno,
        telefono_celular: data.telefonoCelular,
        telefono_contacto: data.telefonoContacto,
        email: data.email,
        calle: data.calle,
        numero_exterior: data.numeroExterior,
        numero_interior: data.numeroInterior,
        colonia: data.colonia,
        ciudad: data.ciudad,
        estado: data.estado,
        codigo_postal: data.codigoPostal,
        latitud: data.latitud,
        longitud: data.longitud,
        fuente_referencia: data.fuenteReferencia,
        rfc: data.rfc,
        tipo_registro: data.tipoRegistro,
        password_hash: hashedPassword,
        updated_at: new Date()
      }
    });
  }

  // Actualizar un cliente
  static async update(id: number, data: UpdateClienteDTO): Promise<Cliente> {
    const updateData: any = {
      nombre: data.nombre,
      apellido_paterno: data.apellidoPaterno,
      apellido_materno: data.apellidoMaterno,
      telefono_celular: data.telefonoCelular,
      email: data.email,
      updated_at: new Date()
    };

    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(data.password, salt);
    }

    const cliente = await prisma.clientes.update({
      where: { id },
      data: updateData
    });
    return cliente as Cliente;
  }

  // Eliminar un cliente (hard delete ya que no hay campo activo)
  static async delete(id: number): Promise<boolean> {
    const result = await prisma.clientes.delete({
      where: { id }
    });
    return !!result;
  }

  // Verificar si un email ya existe
  static async emailExists(email: string, excludeId?: number): Promise<boolean> {
    try {
      const count = await prisma.clientes.count({
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
    const cliente = await prisma.clientes.findUnique({
      where: { email }
    });

    if (!cliente || !cliente.password_hash) {
      return null;
    }

    const isValid = await bcrypt.compare(password, cliente.password_hash);
    if (!isValid) {
      return null;
    }

    return cliente;
  }

  static async findById(id: number) {
    const cliente = await prisma.clientes.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        apellido_paterno: true,
        apellido_materno: true,
        telefono_celular: true,
        telefono_contacto: true,
        email: true,
        calle: true,
        numero_exterior: true,
        numero_interior: true,
        colonia: true,
        ciudad: true,
        estado: true,
        codigo_postal: true,
        latitud: true,
        longitud: true,
        fuente_referencia: true,
        rfc: true,
        created_at: true,
        updated_at: true,
        tipo_registro: true
      }
    });

    if (!cliente) {
      return null;
    }

    // Mapear a formato camelCase para el frontend
    return {
      ...cliente,
      apellidoPaterno: cliente.apellido_paterno,
      apellidoMaterno: cliente.apellido_materno,
      telefonoCelular: cliente.telefono_celular,
      telefonoContacto: cliente.telefono_contacto,
      numeroExterior: cliente.numero_exterior,
      numeroInterior: cliente.numero_interior,
      codigoPostal: cliente.codigo_postal,
      fuenteReferencia: cliente.fuente_referencia,
      tipoRegistro: cliente.tipo_registro,
      createdAt: cliente.created_at,
      updatedAt: cliente.updated_at
    };
  }

  static async findByEmail(email: string) {
    return prisma.clientes.findUnique({
      where: { email }
    });
  }

  static async findAll(where?: Prisma.clientesWhereInput) {
    return prisma.clientes.findMany({
      where
    });
  }
} 