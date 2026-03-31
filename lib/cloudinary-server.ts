import { v2 as cloudinary } from "cloudinary";

const MAX_BYTES = 12 * 1024 * 1024;
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
    throw new Error("Cloudinary no configurado");
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
    throw new Error("Archivo demasiado grande (máx. 12 MB)");
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
