import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // En Vercel debe quedarse en ".next" para que el builder encuentre routes-manifest.json.
  // Localmente usamos ".next-cache" para evitar bloqueos esporádicos de permisos en Windows.
  distDir: process.env.VERCEL ? ".next" : ".next-cache",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
    ],
  },
};

export default nextConfig;
