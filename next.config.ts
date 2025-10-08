import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable subdomain routing
  async rewrites() {
    return [
      {
        source: '/account',
        destination: '/account',
      },
      {
        source: '/panel',
        destination: '/panel',
      },
    ];
  },
  // Enable middleware
  experimental: {
    // middlewareSourceMaps: true, // This option is not available in current Next.js version
  },
  // Enable subdomain support
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
