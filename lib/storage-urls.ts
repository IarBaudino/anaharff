import { STORAGE_BUCKET } from "@/lib/storage-config";

const PUBLIC_SEGMENT = `/storage/v1/object/public/${STORAGE_BUCKET}/`;

export function isCloudinaryUrl(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith("res.cloudinary.com");
  } catch {
    return false;
  }
}

export function isSupabaseStoragePublicUrl(url: string): boolean {
  try {
    return new URL(url).pathname.includes(PUBLIC_SEGMENT);
  } catch {
    return false;
  }
}

/** Ruta del objeto dentro del bucket a partir de la URL pública de Supabase. */
export function extractStoragePathFromPublicUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const idx = parsed.pathname.indexOf(PUBLIC_SEGMENT);
    if (idx === -1) return null;
    const encoded = parsed.pathname.slice(idx + PUBLIC_SEGMENT.length);
    return decodeURIComponent(encoded);
  } catch {
    return null;
  }
}

export function buildPublicStorageUrl(objectPath: string): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
  if (!base) return null;
  const encoded = objectPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${base}${PUBLIC_SEGMENT}${encoded}`;
}
