/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static optimization where possible
  output: 'standalone',
  // Disable React strict mode in production to avoid double rendering
  reactStrictMode: process.env.NODE_ENV === 'development',
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Improve serverless performance with ISR
  experimental: {
    serverComponentsExternalPackages: ['prisma', '@prisma/client'],
  },
};

module.exports = nextConfig;
