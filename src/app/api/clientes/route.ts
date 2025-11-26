import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Esquema de validación para el registro de clientes
const clienteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  apellidoPaterno: z.string().min(1, 'El apellido paterno es requerido'),
  apellidoMaterno: z.string().optional(),
  telefonoCelular: z.string().min(1, 'El teléfono celular es requerido'),
  telefonoContacto: z.string().optional(),
  email: z.string().email('Email inválido'),
  rfc: z.string().optional(),
  calle: z.string().optional(),
  numeroExterior: z.string().optional(),
  numeroInterior: z.string().optional(),
  colonia: z.string().optional(),
  ciudad: z.string().optional(),
  estado: z.string().optional(),
  codigoPostal: z.string().optional(),
  latitud: z.number().optional().nullable(),
  longitud: z.number().optional().nullable(),
  fuenteReferencia: z.string().optional(),
  password: z.string().optional(),
  activo: z.boolean().optional(),
  tipoRegistro: z.string().optional(),
  puntoRecoleccionId: z.number().optional()
});

function cleanClienteData(data: any) {
  const cleanedData: any = {
    nombre: data.nombre,
    apellido_paterno: data.apellidoPaterno,
    apellido_materno: data.apellidoMaterno,
    telefono_celular: data.telefonoCelular,
    telefono_contacto: data.telefonoContacto,
    email: data.email,
    rfc: data.rfc,
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
    password_hash: data.passwordHash,
    updated_at: new Date()
  };

  // Agregar tipo_registro si está presente
  if (data.tipoRegistro) {
    cleanedData.tipo_registro = data.tipoRegistro;
  }

  // Agregar la relación creado_por si hay un creadoPorId
  if (data.creadoPorId) {
    cleanedData.creado_por_id = data.creadoPorId;
  }

  // Agregar el punto_recoleccion_id directamente
  if (data.puntoRecoleccionId) {
    cleanedData.punto_recoleccion_id = data.puntoRecoleccionId;
  }

  return cleanedData;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const format = searchParams.get('format');
    const skip = (page - 1) * limit;

    // Construir el where base con búsqueda
    let where: Prisma.clientesWhereInput = {};
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido_paterno: { contains: search, mode: 'insensitive' } },
        { apellido_materno: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { telefono_celular: { contains: search } }
      ];
    }

    const userRole = session.user.role;
    const userPointId = session.user.puntoRecoleccion?.id;

    // Si es usuario de punto de recolección, solo mostrar clientes de su punto
    if ((userRole === 'ADMINISTRADOR_PUNTO' || userRole === 'USUARIO_PUNTO') && userPointId) {
      where.punto_recoleccion_id = userPointId;
    }

    // Si no es admin ni tiene permisos específicos, no mostrar nada
    if (userRole !== 'ADMINISTRADOR' && !session.user.permissions.includes('CLIENTS_VIEW')) {
      if (!userPointId) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
      }
    }

    const [clientesRaw, total] = await Promise.all([
      prisma.clientes.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc'
        },
        include: {
          usuarios: {
            select: {
              id: true,
              nombre: true,
              apellido_paterno: true,
              apellido_materno: true,
              email: true
            }
          },
          puntos_recoleccion: {
            select: {
              id: true,
              nombre: true
            }
          }
        }
      }),
      prisma.clientes.count({ where })
    ]);

    console.log('Clientes raw de la base de datos:', clientesRaw);

    // Mapear los datos al formato esperado por el frontend
    const clientes = clientesRaw.map((cliente: any) => {
      const clienteMapeado = {
        id: cliente.id,
        nombre: cliente.nombre,
        apellido_paterno: cliente.apellido_paterno,
        apellido_materno: cliente.apellido_materno,
        telefono_celular: cliente.telefono_celular,
        telefono_contacto: cliente.telefono_contacto,
        email: cliente.email,
        calle: cliente.calle,
        numero_exterior: cliente.numero_exterior,
        numero_interior: cliente.numero_interior,
        colonia: cliente.colonia,
        ciudad: cliente.ciudad,
        estado: cliente.estado,
        codigo_postal: cliente.codigo_postal,
        latitud: cliente.latitud,
        longitud: cliente.longitud,
        fuente_referencia: cliente.fuente_referencia,
        rfc: cliente.rfc,
        tipo_registro: cliente.tipo_registro,
        created_at: cliente.created_at ? new Date(cliente.created_at).toISOString() : null,
        updated_at: cliente.updated_at ? new Date(cliente.updated_at).toISOString() : null,
        punto_recoleccion_id: cliente.punto_recoleccion_id,
        creado_por: cliente.usuarios ? {
          id: cliente.usuarios.id,
          nombre: cliente.usuarios.nombre,
          apellido_paterno: cliente.usuarios.apellido_paterno,
          apellido_materno: cliente.usuarios.apellido_materno,
          email: cliente.usuarios.email
        } : null,
        punto_recoleccion: cliente.puntos_recoleccion ? {
          id: cliente.puntos_recoleccion.id,
          nombre: cliente.puntos_recoleccion.nombre
        } : null
      };
      
      console.log('Cliente mapeado:', clienteMapeado);
      return clienteMapeado;
    });

    // Si se solicita formato simple (para formularios), devolver solo el array
    if (format === 'simple') {
      return NextResponse.json(clientes);
    }
    
    // Por defecto, devolver formato completo con paginación
    return NextResponse.json({
      clientes,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return NextResponse.json(
      { error: 'Error al obtener los clientes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  let validatedData: z.infer<typeof clienteSchema> | null = null;
  
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    console.log('Datos recibidos en POST /api/clientes:', data);
    
    validatedData = clienteSchema.parse(data);
    console.log('Datos validados:', validatedData);

    const userRole = session.user.role;
    const userPointId = session.user.puntoRecoleccion?.id;

    // Determinar el punto de recolección a usar
    let puntoRecoleccionIdToUse = validatedData.puntoRecoleccionId;
    if (userRole === 'ADMINISTRADOR_PUNTO' || userRole === 'USUARIO_PUNTO') {
      if (!userPointId) {
        return NextResponse.json({ error: 'No tienes un punto de recolección asignado' }, { status: 403 });
      }
      puntoRecoleccionIdToUse = userPointId;
    }

    // Si no es admin ni tiene permisos, y no es usuario de punto, no puede crear
    if (userRole !== 'ADMINISTRADOR' && !session.user.permissions.includes('CLIENTS_CREATE')) {
      if (!userPointId) {
        return NextResponse.json({ error: 'No autorizado para crear clientes' }, { status: 403 });
      }
    }

    // Normalizar email y teléfono
    const emailNormalizado = validatedData.email.toLowerCase().trim();
    const telefonoNormalizado = validatedData.telefonoCelular.trim().replace(/\s+/g, '');

    // Verificar si el email ya existe
    const existingClientByEmail = await prisma.clientes.findUnique({
      where: { email: emailNormalizado },
      select: {
        id: true,
        nombre: true,
        apellido_paterno: true,
        email: true,
        telefono_celular: true
      }
    });

    if (existingClientByEmail) {
      const nombreCompleto = `${existingClientByEmail.nombre} ${existingClientByEmail.apellido_paterno}`.trim();
      return NextResponse.json(
        { 
          error: 'El correo electrónico ya está registrado',
          message: `Ya existe un cliente registrado con el correo electrónico "${validatedData.email}". Cliente: ${nombreCompleto}`,
          field: 'email',
          existingClient: {
            id: existingClientByEmail.id,
            nombre: nombreCompleto,
            email: existingClientByEmail.email,
            telefono: existingClientByEmail.telefono_celular
          }
        },
        { status: 400 }
      );
    }

    // Verificar si el teléfono ya existe (normalizar teléfonos en la búsqueda)
    const existingClientByPhone = await prisma.clientes.findFirst({
      where: { 
        telefono_celular: telefonoNormalizado
      },
      select: {
        id: true,
        nombre: true,
        apellido_paterno: true,
        email: true,
        telefono_celular: true
      }
    });

    if (existingClientByPhone) {
      const nombreCompleto = `${existingClientByPhone.nombre} ${existingClientByPhone.apellido_paterno}`.trim();
      return NextResponse.json(
        { 
          error: 'El número de teléfono ya está registrado',
          message: `Ya existe un cliente registrado con el número de teléfono "${validatedData.telefonoCelular}". Cliente: ${nombreCompleto}`,
          field: 'telefonoCelular',
          existingClient: {
            id: existingClientByPhone.id,
            nombre: nombreCompleto,
            email: existingClientByPhone.email,
            telefono: existingClientByPhone.telefono_celular
          }
        },
        { status: 400 }
      );
    }

    // Preparar los datos del cliente
    const { password, ...clienteData } = validatedData;
    const dataToSave = cleanClienteData({
      ...clienteData,
      email: emailNormalizado, // Usar email normalizado
      telefonoCelular: telefonoNormalizado, // Usar teléfono normalizado
      creadoPorId: session.user.id,
      tipoRegistro: userPointId ? 'PUNTO_RECOLECCION' : 'SISTEMA_CENTRAL',
      puntoRecoleccionId: puntoRecoleccionIdToUse
    });

    console.log('Datos a guardar:', dataToSave);

    // Si se proporciona contraseña, hashearla
    if (password) {
      dataToSave.passwordHash = await bcrypt.hash(password, 10);
    }

    // Crear el cliente
    const cliente = await prisma.clientes.create({
      data: dataToSave
    });

    console.log('Cliente creado:', cliente);

    return NextResponse.json(cliente);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    // Manejar error de Prisma cuando el email ya existe (violación de constraint único)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = error.meta?.target as string[] | undefined;
        if (target && target.includes('email')) {
          return NextResponse.json(
            { 
              error: 'El correo electrónico ya está registrado',
              message: `El correo electrónico "${validatedData?.email || 'proporcionado'}" ya está en uso. Por favor, utiliza otro correo electrónico.`,
              field: 'email'
            },
            { status: 400 }
          );
        }
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Error al crear el cliente',
        message: 'Ocurrió un error inesperado al intentar registrar el cliente. Por favor, intenta nuevamente.'
      },
      { status: 500 }
    );
  }
} 