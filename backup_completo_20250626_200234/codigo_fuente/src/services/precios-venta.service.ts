import { PrecioVenta, PrecioVentaInput, PrecioVentaUpdate } from '@/types/precios-venta';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export class PreciosVentaService {
  private static instance: PreciosVentaService;
  private endpoint = `${API_URL}/precios-venta`;

  private constructor() {}

  public static getInstance(): PreciosVentaService {
    if (!PreciosVentaService.instance) {
      PreciosVentaService.instance = new PreciosVentaService();
    }
    return PreciosVentaService.instance;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || 'Error en la petición');
    }
    return response.json();
  }

  async getAll(): Promise<PrecioVenta[]> {
    const response = await fetch(this.endpoint);
    return this.handleResponse(response);
  }

  async getById(id: string): Promise<PrecioVenta | null> {
    const response = await fetch(`${this.endpoint}/${id}`);
    return this.handleResponse(response);
  }

  async create(precio: PrecioVentaInput): Promise<PrecioVenta> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(precio),
    });
    return this.handleResponse(response);
  }

  async update(precio: PrecioVentaUpdate): Promise<PrecioVenta> {
    const response = await fetch(this.endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(precio),
    });
    return this.handleResponse(response);
  }

  async getPreciosSinVenta(): Promise<PrecioVenta[]> {
    const response = await fetch(`${this.endpoint}?sinPrecio=true`);
    return this.handleResponse(response);
  }

  async search(query: string): Promise<PrecioVenta[]> {
    const response = await fetch(`${this.endpoint}?q=${encodeURIComponent(query)}`);
    return this.handleResponse(response);
  }

  async getByTipo(tipo: 'PRODUCTO' | 'SERVICIO'): Promise<PrecioVenta[]> {
    const response = await fetch(`${this.endpoint}?tipo=${tipo}`);
    return this.handleResponse(response);
  }
} 