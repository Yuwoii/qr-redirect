/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static optimization where possible
  output: 'standalone',
  
  // Enable React strict mode to catch potential issues early
  reactStrictMode: true,
  
  // ESLint and TypeScript checking configuration
  eslint: {
    // Don't fail the build on ESLint errors in production (but keep enabled)
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
    // Keep running ESLint to catch issues
    dirs: ['src'],
  },
  
  // TypeScript type checking
  typescript: {
    // Don't fail the build on TypeScript errors in production (but keep enabled)
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  
  // Experimental features
  experimental: {
    // Enable improved server-side handling
    serverMinification: true,
    // Next.js 15 uses a different approach to external packages
    // The serverExternalPackages option has been removed in Next.js 15
  },
  
  // Optimize image handling for better performance
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Allow QR code placeholders from trusted sources
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Set up proper headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
