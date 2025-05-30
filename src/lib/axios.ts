import axios from 'axios';
import { getSession } from 'next-auth/react';

// Crear una instancia de axios con configuración base
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Habilitar el envío de cookies
});

// Interceptor para agregar el token de autenticación
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const session = await getSession();
      if (session?.user) {
        config.withCredentials = true;
      }
      return config;
    } catch (error) {
      console.error('Error en el interceptor de solicitud:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    console.error('Error en el interceptor de solicitud:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la respuesta:', {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });

    if (error.response?.status === 401) {
      // Redirigir al login si el token expiró
      window.location.href = '/auth/login';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 