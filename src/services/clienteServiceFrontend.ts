import axios from '@/lib/axios';

export interface Cliente {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  telefono_celular: string;
  telefono_contacto?: string;
  email: string;
  calle?: string;
  numero_exterior?: string;
  numero_interior?: string;
  colonia?: string;
  ciudad?: string;
  estado?: string;
  codigo_postal?: string;
  created_at: string;
  updated_at: string;
}

export class ClienteServiceFrontend {
  static async obtenerClientes(): Promise<Cliente[]> {
    try {
      const response = await axios.get('/api/clientes');
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener clientes:', error);
      throw new Error(error.response?.data?.error || 'Error al obtener los clientes');
    }
  }

  static async buscarClientes(termino: string): Promise<Cliente[]> {
    try {
      const response = await axios.get(`/api/clientes?search=${encodeURIComponent(termino)}`);
      return response.data;
    } catch (error: any) {
      console.error('Error al buscar clientes:', error);
      throw new Error(error.response?.data?.error || 'Error al buscar clientes');
    }
  }

  static async obtenerCliente(id: number): Promise<Cliente> {
    try {
      const response = await axios.get(`/api/clientes/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener cliente:', error);
      throw new Error(error.response?.data?.error || 'Error al obtener el cliente');
    }
  }
} 