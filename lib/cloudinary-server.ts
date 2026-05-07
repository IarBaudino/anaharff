import { v2 as cloudinary } from "cloudinary";

const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export function isCloudinaryServerConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function ensureConfig() {
  const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error("Servicio de imágenes no configurado");
  }
  cloudinary.config({ cloud_name, api_key, api_secret });
}

export async function uploadImageToCloudinary(params: {
  buffer: Buffer;
  mimeType: string;
  filename?: string;
}): Promise<{ secureUrl: string; publicId: string }> {
  ensureConfig();

  if (!ALLOWED.has(params.mimeType)) {
    throw new Error("Tipo de archivo no permitido");
  }
  if (params.buffer.length > MAX_BYTES) {
    throw new Error("Archivo demasiado grande (máx. 4 MB)");
  }

  const folder =
    process.env.CLOUDINARY_UPLOAD_FOLDER?.trim() || "anaharff/tienda";

  const b64 = params.buffer.toString("base64");
  const dataUri = `data:${params.mimeType};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    overwrite: false,
    use_filename: true,
    unique_filename: true,
    filename_override: params.filename?.replace(/\.[^.]+$/, "") || undefined,
  });

  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
  };
}

function extractPublicIdFromCloudinaryUrl(url: string): string | null {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  if (!cloudName) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (!parsed.hostname.endsWith("res.cloudinary.com")) return null;
  const path = parsed.pathname;
  if (!path.startsWith(`/${cloudName}/image/upload/`)) return null;

  const uploadIdx = path.indexOf("/upload/");
  if (uploadIdx === -1) return null;
  const afterUpload = path.slice(uploadIdx + "/upload/".length);
  const segments = afterUpload.split("/").filter(Boolean);
  if (!segments.length) return null;

  // Salta versión tipo v173455566 si está presente.
  const start = /^v\d+$/.test(segments[0] ?? "") ? 1 : 0;
  const idSegments = segments.slice(start);
  if (!idSegments.length) return null;

  const last = idSegments[idSegments.length - 1];
  const withoutExt = last.replace(/\.[a-z0-9]+$/i, "");
  idSegments[idSegments.length - 1] = withoutExt;

  return idSegments.join("/");
}

export async function deleteCloudinaryImageByUrl(url: string): Promise<{ deleted: boolean }> {
  ensureConfig();
  const publicId = extractPublicIdFromCloudinaryUrl(url);
  if (!publicId) return { deleted: false };

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });

  return { deleted: result.result === "ok" };
}
