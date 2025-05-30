import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const cliente = await prisma.cliente.create({
    data: {
      nombre: 'Cliente',
      apellidoPaterno: 'Ejemplo',
      apellidoMaterno: 'Test',
      telefonoCelular: '1234567890',
      email: 'cliente@ejemplo.com',
      updatedAt: new Date(),
      telefonoContacto: '0987654321',
      calle: 'Calle Principal',
      numeroExterior: '123',
      colonia: 'Centro',
      ciudad: 'Ciudad de México',
      estado: 'CDMX',
      codigoPostal: '12345',
      fuenteReferencia: 'Web',
      rfc: 'XAXX010101000',
      passwordHash: 'hashed_password',
      activo: true,
      tipoRegistro: 'Registro en tienda'
    }
  });

  console.log('Cliente creado:', cliente);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  }); 