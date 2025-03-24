/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desactivar cache para desarrollo
  experimental: {
    optimizeCss: true,
  },
  // Hacer redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/auth/login',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
