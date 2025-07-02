const axios = require('axios');

async function testFrontendSimulation() {
  try {
    console.log('🧪 Simulando petición del frontend con credenciales...');
    
    // Simular los datos exactos que envía el frontend
    const userData = {
      email: 'test4@example.com',
      nombre: 'Test',
      apellidoPaterno: 'User',
      apellidoMaterno: '',
      password: '123456',
      confirmPassword: '123456',
      activo: true,
      roles: [15] // ID del rol ADMINISTRADOR
    };
    
    console.log('📝 Datos a enviar:', { ...userData, password: '[REDACTED]' });
    
    // Hacer la petición POST a la API con credenciales
    const response = await axios.post('http://localhost:3000/api/usuarios', userData, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    console.log('✅ Respuesta exitosa:', response.status);
    console.log('📋 Datos del usuario creado:', {
      id: response.data.id,
      email: response.data.email,
      nombre: response.data.nombre,
      roles_count: response.data.usuarioRoles?.length || 0
    });
    
  } catch (error) {
    console.error('❌ Error en la petición:', error.message);
    
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📋 Datos del error:', error.response.data);
    }
  }
}

testFrontendSimulation(); 