import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable Turbopack to fix font module resolution issue
  experimental: {
    turbo: undefined,
  },
};

export default nextConfig;
