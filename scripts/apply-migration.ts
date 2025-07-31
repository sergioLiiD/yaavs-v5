import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('Aplicando migración para agregar valor por defecto a updated_at...');
    
    // Aplicar la migración
    await prisma.$executeRaw`ALTER TABLE "puntos_recoleccion" ALTER COLUMN "updated_at" SET DEFAULT NOW()`;
    
    console.log('✅ Migración aplicada exitosamente');
    
    // Verificar que el cambio se aplicó
    const result = await prisma.$queryRaw`
      SELECT column_name, column_default, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'puntos_recoleccion' AND column_name = 'updated_at'
    `;
    
    console.log('Verificación:', result);
    
  } catch (error) {
    console.error('❌ Error al aplicar la migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration(); 