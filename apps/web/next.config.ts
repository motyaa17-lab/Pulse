import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Windows can hit EPERM on `.next/trace` if the folder gets locked by AV/indexers
  // or a previous dev/build process. Using an app-specific dist dir avoids the lock.
  distDir: '../.next-web',
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '4000', pathname: '/**' },
      { protocol: 'http', hostname: 'localhost', port: '9000', pathname: '/**' },
    ],
  },
};

export default nextConfig;
