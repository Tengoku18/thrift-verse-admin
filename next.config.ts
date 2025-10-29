import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'photoscissors.com',
      },
      {
        protocol: 'https',
        hostname: 'rsaqwegftpoqqtosgrbx.supabase.co',
      },
    ],
  },
};

export default nextConfig;
