/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static optimization where possible
  output: 'standalone',
  // Other config options
  swcMinify: true,
  // Disable React strict mode in production to avoid double rendering
  reactStrictMode: process.env.NODE_ENV === 'development',
};

module.exports = nextConfig;
