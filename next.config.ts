import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/idea-validator',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
