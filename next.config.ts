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
};

export default nextConfig;
