import axios from 'axios';

// Configurar axios para incluir credenciales en todas las peticiones
axios.defaults.withCredentials = true;

// Configurar la URL base si es necesario
if (typeof window !== 'undefined') {
  axios.defaults.baseURL = window.location.origin;
}

// Interceptor para manejar errores de autenticación
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir al login si la sesión ha expirado
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axios; 