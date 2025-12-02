import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack to fix font module resolution issue
  experimental: {
    turbo: undefined,
  },
  // Temporarily disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
