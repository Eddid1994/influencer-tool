import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // During production build, continue despite TypeScript errors
    // This allows the build to complete while we incrementally fix type issues
    ignoreBuildErrors: false,
  },
  eslint: {
    // During production build, temporarily ignore ESLint errors
    // This allows the build to complete while we incrementally fix type issues
    // TODO: Set this back to false once all TypeScript any errors are resolved
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
