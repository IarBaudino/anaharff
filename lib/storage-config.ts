export const STORAGE_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET?.trim() || "images";

export const STORAGE_PREFIX =
  process.env.SUPABASE_STORAGE_PREFIX?.trim() || "anaharff";

/** Prefijo de objetos subidos desde el panel (`anaharff/uploads/...`). */
export const STORAGE_UPLOAD_PREFIX = `${STORAGE_PREFIX}/uploads`;

export function isSupabaseStorageConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}
