import type { NextConfig } from "next";

// The production site is served from https://engagement.chula.ac.th/inclusive/.
// Keep development at the domain root while making Next generate subpath-aware
// routes and static asset URLs for production.
const basePath = process.env.NODE_ENV === "production" ? "/inclusive" : undefined;

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
  basePath,
  
};

export default nextConfig;
