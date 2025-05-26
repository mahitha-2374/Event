import type {NextConfig} from 'next';


const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false, // Changed to false to enable error checking
  },
  eslint: {
    ignoreDuringBuilds: false, // Changed to false to enable error checking
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['uuid'],
  },
};

export default nextConfig;
