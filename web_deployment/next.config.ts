import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove output: 'export' to enable API routes and Middleware
  images: {
    unoptimized: true,
  },
  // We need this for the MySQL compatibility if still using it
  serverExternalPackages: ['mysql2'],
};

export default nextConfig;
