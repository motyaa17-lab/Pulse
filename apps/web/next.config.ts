import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', port: '9000', pathname: '/**' },
      { protocol: 'https', hostname: '*.up.railway.app', pathname: '/**' },
      { protocol: 'https', hostname: 'up.railway.app', pathname: '/**' },
    ],
  },
};

export default nextConfig;
