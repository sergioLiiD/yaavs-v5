/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Hacer redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true,
      },
    ];
  },
  // Configuración del servidor
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  server: {
    hostname: '0.0.0.0',
    port: process.env.PORT || 8080,
  },
};

module.exports = nextConfig;
