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

function isCloudinaryTransformationSegment(segment: string): boolean {
  if (segment.includes(",")) return true;
  if (/^v\d+$/.test(segment)) return false;
  // p. ej. c_fill, w_800, f_auto, fl_progressive
  return /^[a-z0-9]{1,6}_[^/]+$/i.test(segment) || /^[a-z0-9._-]+=[^/]+$/i.test(segment);
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
  const marker = "/image/upload/";
  const markerIdx = path.indexOf(marker);
  if (markerIdx === -1 || !path.startsWith(`/${cloudName}`)) return null;

  const segments = path.slice(markerIdx + marker.length).split("/").filter(Boolean);
  if (!segments.length) return null;

  let i = 0;
  while (i < segments.length) {
    const seg = segments[i]!;
    if (/^v\d+$/.test(seg)) {
      i++;
      break;
    }
    if (isCloudinaryTransformationSegment(seg)) {
      i++;
      continue;
    }
    break;
  }

  if (i >= segments.length) return null;
  const idSegments = segments.slice(i);
  const last = idSegments[idSegments.length - 1] ?? "";
  idSegments[idSegments.length - 1] = last.replace(/\.[a-z0-9]+$/i, "");
  const publicId = idSegments.join("/");
  return publicId || null;
}

export async function deleteCloudinaryImageByUrl(url: string): Promise<{ deleted: boolean }> {
  ensureConfig();
  const publicId = extractPublicIdFromCloudinaryUrl(url);
  if (!publicId) return { deleted: false };

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });

  return { deleted: result.result === "ok" || result.result === "not found" };
}
