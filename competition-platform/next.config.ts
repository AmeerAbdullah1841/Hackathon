import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverComponentsExternalPackages: ["better-sqlite3"],
  // Disable Turbopack to fix font module resolution issue
  experimental: {
    turbo: undefined,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark better-sqlite3 as external to prevent bundling issues
      config.externals = config.externals || [];
      config.externals.push("better-sqlite3");
    }
    return config;
  },
};

export default nextConfig;
