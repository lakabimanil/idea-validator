import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed basePath for local development
  // Add it back only when deploying to a subdirectory
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
