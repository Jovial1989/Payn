import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "motion", "lightweight-charts"],
  },
  turbopack: {
    root: path.resolve(__dirname, "../../"),
  },
};

export default nextConfig;
