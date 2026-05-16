/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Optimization is handled by images.weserv.nl proxy — no server-side processing needed
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'obrsjuqzmllnfmldlgby.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.weserv.nl',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;

