import { STORAGE_BUCKET, STORAGE_UPLOAD_PREFIX } from "@/lib/storage-config";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  buildPublicStorageUrl,
  extractStoragePathFromPublicUrl,
  isCloudinaryUrl,
  isSupabaseStoragePublicUrl,
} from "@/lib/storage-urls";

function safeFilename(name: string): string {
  const base = name.replace(/\.[^.]+$/, "").trim() || "upload";
  return base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function extensionFromFilename(filename: string): string {
  const m = filename.match(/\.([a-z0-9]+)$/i);
  return (m?.[1] ?? "jpg").toLowerCase();
}

export function buildStorageObjectPath(filename: string): string {
  const ext = extensionFromFilename(filename);
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return `${safeFilename(filename)}-${stamp}.${ext}`;
}

export async function uploadImageToStorage(params: {
  buffer: Buffer;
  filename: string;
  contentType: string;
  folder?: string;
}): Promise<{ publicUrl: string; objectPath: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("Supabase Storage no está configurado en el servidor.");
  }

  const subfolder = (params.folder ?? "uploads").replace(/[^a-z0-9/_-]/gi, "");
  const objectName = buildStorageObjectPath(params.filename || "upload.jpg");
  const objectPath = `${STORAGE_UPLOAD_PREFIX}/${subfolder}/${objectName}`;

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(objectPath, params.buffer, {
    contentType: params.contentType || "image/jpeg",
    upsert: false,
    cacheControl: "3600",
  });

  if (error) {
    throw new Error(error.message);
  }

  const publicUrl = buildPublicStorageUrl(objectPath);
  if (!publicUrl) {
    throw new Error("No se pudo generar la URL pública de la imagen.");
  }

  return { publicUrl, objectPath };
}

export async function deleteStorageObjectByUrl(
  url: string
): Promise<{ deleted: boolean; skipped: boolean }> {
  const trimmed = url.trim();
  if (!trimmed) return { deleted: false, skipped: true };

  if (isCloudinaryUrl(trimmed)) {
    return { deleted: false, skipped: true };
  }

  if (!isSupabaseStoragePublicUrl(trimmed)) {
    return { deleted: false, skipped: true };
  }

  const objectPath = extractStoragePathFromPublicUrl(trimmed);
  if (!objectPath) return { deleted: false, skipped: true };

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("Supabase Storage no está configurado en el servidor.");
  }

  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([objectPath]);
  if (error) {
    throw new Error(error.message);
  }

  return { deleted: true, skipped: false };
}
