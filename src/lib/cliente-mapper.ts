export interface ClienteListItem {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string | null;
  telefonoCelular: string;
  telefonoContacto?: string | null;
  email?: string | null;
  calle?: string | null;
  numeroExterior?: string | null;
  numeroInterior?: string | null;
  colonia?: string | null;
  ciudad?: string | null;
  estado?: string | null;
  codigoPostal?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  fuenteReferencia?: string | null;
  rfc?: string | null;
  tipoRegistro?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  puntoRecoleccion?: { id: number; nombre: string } | null;
}

export function mapClienteFromApi(cliente: Record<string, unknown>): ClienteListItem {
  return {
    id: cliente.id as number,
    nombre: cliente.nombre as string,
    apellidoPaterno: (cliente.apellido_paterno ?? cliente.apellidoPaterno) as string,
    apellidoMaterno: (cliente.apellido_materno ?? cliente.apellidoMaterno) as string | null,
    telefonoCelular: (cliente.telefono_celular ?? cliente.telefonoCelular) as string,
    telefonoContacto: (cliente.telefono_contacto ?? cliente.telefonoContacto) as string | null,
    email: cliente.email as string | null,
    calle: cliente.calle as string | null,
    numeroExterior: (cliente.numero_exterior ?? cliente.numeroExterior) as string | null,
    numeroInterior: (cliente.numero_interior ?? cliente.numeroInterior) as string | null,
    colonia: cliente.colonia as string | null,
    ciudad: cliente.ciudad as string | null,
    estado: cliente.estado as string | null,
    codigoPostal: (cliente.codigo_postal ?? cliente.codigoPostal) as string | null,
    latitud: cliente.latitud as number | null,
    longitud: cliente.longitud as number | null,
    fuenteReferencia: (cliente.fuente_referencia ?? cliente.fuenteReferencia) as string | null,
    rfc: cliente.rfc as string | null,
    tipoRegistro: (cliente.tipo_registro ?? cliente.tipoRegistro) as string | null,
    createdAt: (cliente.created_at ?? cliente.createdAt) as string | null,
    updatedAt: (cliente.updated_at ?? cliente.updatedAt) as string | null,
    puntoRecoleccion: (cliente.punto_recoleccion ?? cliente.puntoRecoleccion) as { id: number; nombre: string } | null,
  };
}

export interface ClienteFormPrefill {
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  telefonoCelular?: string;
  email?: string;
}

export function parseClienteSearchQuery(search: string): ClienteFormPrefill {
  const trimmed = search.trim();
  if (!trimmed) return {};

  const phoneDigits = trimmed.replace(/\D/g, '');
  const compactLength = trimmed.replace(/\s/g, '').length;
  if (phoneDigits.length >= 7 && phoneDigits.length >= compactLength * 0.7) {
    return { telefonoCelular: trimmed };
  }

  if (trimmed.includes('@')) {
    return { email: trimmed };
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { nombre: parts[0] };
  }
  if (parts.length === 2) {
    return { nombre: parts[0], apellidoPaterno: parts[1] };
  }
  return {
    nombre: parts[0],
    apellidoPaterno: parts[1],
    apellidoMaterno: parts.slice(2).join(' '),
  };
}

export function formatClienteNombre(cliente: Pick<ClienteListItem, 'nombre' | 'apellidoPaterno' | 'apellidoMaterno'>): string {
  if (!cliente.apellidoPaterno) {
    return cliente.nombre;
  }
  return [cliente.nombre, cliente.apellidoPaterno, cliente.apellidoMaterno].filter(Boolean).join(' ');
}
