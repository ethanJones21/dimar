import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Compiler estable en Next.js 16
  reactCompiler: true,

  // Turbopack en top-level (ya no en experimental)
  // turbopack: {}, // descomentar si necesitas opciones personalizadas

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default nextConfig;
