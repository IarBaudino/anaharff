import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";

// Asegura que .env.local esté cargado al evaluar remotePatterns (dev y build).
loadEnvConfig(process.cwd());

function supabaseStorageHostname(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

const supabaseHost = supabaseStorageHostname();

const supabaseRemotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  // Cualquier proyecto Supabase (obras subidas desde el panel).
  {
    protocol: "https",
    hostname: "**.supabase.co",
    pathname: "/storage/v1/object/public/**",
  },
  ...(supabaseHost
    ? [
        {
          protocol: "https" as const,
          hostname: supabaseHost,
          pathname: "/storage/v1/object/public/**",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  // En Windows evita bloqueos EPERM entre build/dev usando carpetas distintas.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  images: {
    remotePatterns: [
      ...supabaseRemotePatterns,
      // Legacy: imágenes aún no migradas desde Cloudinary
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
    ],
  },
};

export default nextConfig;
