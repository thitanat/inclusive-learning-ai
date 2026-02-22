import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // ✅ Disable type checking during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // ✅ Disable ESLint errors during build
    ignoreDuringBuilds: true,
  },
  // ✅ Enable standalone output for Docker deployment
  output: 'standalone',
  
  // ✅ Enable instrumentation hook to load env.config.js before everything
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
