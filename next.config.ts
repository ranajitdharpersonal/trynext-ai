import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'trynext-ai.vercel.app',
          },
        ],
        destination: 'https://trynext.ranajitdhar.in/:path*',
        permanent: true, // 301 Permanent Redirect for SEO
      },
    ];
  },
};

export default nextConfig;