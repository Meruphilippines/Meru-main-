import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For Render deployment - output standalone
  output: "standalone",
  // Disable turbopack in production builds
  experimental: {},
};

export default nextConfig;
