/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.convex.cloud',
      }
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Your ngrok tunnel configuration
  allowedDevOrigins: ['coroner-germless-stoning.ngrok-free.dev'],
};

module.exports = nextConfig;