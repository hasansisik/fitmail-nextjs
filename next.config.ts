import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/:path*',
        has: [
          {
            type: 'host',
            value: 'account.localhost',
          },
        ],
      },
      {
        source: '/:path*',
        destination: '/panel/:path*',
        has: [
          {
            type: 'host',
            value: 'panel.localhost',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
