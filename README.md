# YAAS - Sistema de Gestión de Taller

Este es un sistema de gestión para talleres de reparación de dispositivos móviles, desarrollado con Next.js 14 y TypeScript.

## Características

- Gestión de inventario de productos y servicios
- Catálogo de reparaciones frecuentes
- Gestión de precios de venta
- Gestión de proveedores
- Gestión de marcas y modelos
- Sistema de checklist para diagnóstico y reparación

## Tecnologías Utilizadas

- Next.js 14
- TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- Shadcn/ui
- NextAuth.js

## Requisitos

- Node.js 18 o superior
- PostgreSQL
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/yaavs-v5.git
cd yaavs-v5
```

2. Instalar dependencias:
```bash
npm install
# o
yarn install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```
Editar el archivo .env con tus credenciales de base de datos y otras configuraciones necesarias.

4. Ejecutar las migraciones de la base de datos:
```bash
npx prisma migrate dev
```

5. Iniciar el servidor de desarrollo:
```bash
npm run dev
# o
yarn dev
```

## Estructura del Proyecto

```
src/
├── app/                    # Rutas y páginas de la aplicación
├── components/            # Componentes reutilizables
├── lib/                   # Utilidades y configuraciones
├── types/                # Definiciones de tipos TypeScript
└── services/             # Servicios y lógica de negocio
```

## Licencia

Este proyecto está bajo la Licencia MIT.
