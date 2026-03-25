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
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
    // Next.js 16: minimumCacheTTL por defecto es 4h (14400s)
    // images.domains está deprecated — usar remotePatterns (ya configurado arriba)
  },
};

export default nextConfig;
