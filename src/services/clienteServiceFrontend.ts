import axios from '@/lib/axios';
import { Cliente } from '@/types/cliente';

export class ClienteServiceFrontend {
  // Obtener todos los clientes
  static async getAll(puntoRecoleccionId?: number): Promise<Cliente[]> {
    try {
      const params = puntoRecoleccionId ? `?puntoRecoleccionId=${puntoRecoleccionId}` : '';
      const response = await axios.get(`/api/clientes${params}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw new Error('Error al obtener los clientes');
    }
  }

  // Obtener un cliente por ID
  static async getById(id: number): Promise<Cliente | null> {
    try {
      const response = await axios.get(`/api/clientes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener cliente por ID:', error);
      throw new Error('Error al obtener el cliente');
    }
  }

  // Obtener un cliente por email
  static async getByEmail(email: string): Promise<Cliente | null> {
    try {
      const response = await axios.get(`/api/clientes/email/${email}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener cliente por email:', error);
      throw new Error('Error al obtener el cliente');
    }
  }

  // Buscar clientes por término
  static async searchClientes(termino: string): Promise<Cliente[]> {
    try {
      const response = await axios.get(`/api/clientes/search?q=${encodeURIComponent(termino)}`);
      return response.data;
    } catch (error) {
      console.error('Error al buscar clientes:', error);
      throw new Error('Error al buscar clientes');
    }
  }
} 