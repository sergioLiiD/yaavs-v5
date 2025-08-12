import { axiosInstance } from '@/lib/axios'
import { 
  Cupon, 
  CreateCuponData, 
  UpdateCuponData, 
  CuponFilters, 
  UsoCupon,
  GenerateCuponesData 
} from '@/types/cupon'

export const cuponService = {
  // Obtener todos los cupones con filtros
  async getCupones(filters?: CuponFilters): Promise<Cupon[]> {
    const params = new URLSearchParams()
    if (filters?.search) params.append('search', filters.search)
    if (filters?.tipo) params.append('tipo', filters.tipo)
    if (filters?.activo !== undefined) params.append('activo', filters.activo.toString())
    if (filters?.fecha_desde) params.append('fecha_desde', filters.fecha_desde)
    if (filters?.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta)

    const response = await axiosInstance.get(`/api/cupones?${params.toString()}`)
    return response.data
  },

  // Obtener un cupón por ID
  async getCupon(id: number): Promise<Cupon> {
    const response = await axiosInstance.get(`/api/cupones/${id}`)
    return response.data
  },

  // Crear un nuevo cupón
  async createCupon(data: CreateCuponData): Promise<Cupon> {
    const response = await axiosInstance.post('/api/cupones', data)
    return response.data
  },

  // Actualizar un cupón
  async updateCupon(id: number, data: UpdateCuponData): Promise<Cupon> {
    const response = await axiosInstance.put(`/api/cupones/${id}`, data)
    return response.data
  },

  // Eliminar un cupón
  async deleteCupon(id: number): Promise<void> {
    await axiosInstance.delete(`/api/cupones/${id}`)
  },

  // Generar cupones en serie
  async generateCupones(data: GenerateCuponesData): Promise<Cupon[]> {
    const response = await axiosInstance.post('/api/cupones/generate', data)
    return response.data
  },

  // Obtener usos de un cupón
  async getUsosCupon(cuponId: number): Promise<UsoCupon[]> {
    const response = await axiosInstance.get(`/api/cupones/${cuponId}/usos`)
    return response.data
  },

  // Validar un cupón
  async validateCupon(codigo: string, monto: number): Promise<{
    valido: boolean
    cupon?: Cupon
    descuento?: number
    mensaje?: string
  }> {
    const response = await axiosInstance.post('/api/cupones/validate', {
      codigo,
      monto
    })
    return response.data
  },

  // Aplicar un cupón a un ticket
  async applyCuponToTicket(codigo: string, ticketId: number): Promise<{
    success: boolean
    descuento: number
    mensaje?: string
  }> {
    const response = await axiosInstance.post('/api/cupones/apply-ticket', {
      codigo,
      ticket_id: ticketId
    })
    return response.data
  },

  // Aplicar un cupón a una venta
  async applyCuponToVenta(codigo: string, ventaId: number): Promise<{
    success: boolean
    descuento: number
    mensaje?: string
  }> {
    const response = await axiosInstance.post('/api/cupones/apply-venta', {
      codigo,
      venta_id: ventaId
    })
    return response.data
  }
}
