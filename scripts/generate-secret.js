const crypto = require('crypto');

// Generar una cadena aleatoria de 64 bytes y convertirla a base64
const secret = crypto.randomBytes(64).toString('base64');

console.log('Tu JWT_SECRET generado:');
 