import { NextResponse } from "next/server";
import { isSupabaseStorageConfigured } from "@/lib/storage-config";
import { uploadImageToStorage } from "@/lib/supabase-storage-server";
import { isAdminIdToken } from "@/lib/verify-admin-token";

const MAX_BYTES = 4 * 1024 * 1024;

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isSupabaseStorageConfigured()) {
    return NextResponse.json(
      { error: "Supabase Storage no está configurado en el servidor." },
      { status: 503 }
    );
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!(await isAdminIdToken(idToken))) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Solo se permiten imágenes." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `La imagen supera el máximo de ${MAX_BYTES / (1024 * 1024)} MB.` },
      { status: 400 }
    );
  }

  const folder = String(form.get("folder") ?? "uploads").trim() || "uploads";
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const { publicUrl } = await uploadImageToStorage({
      buffer,
      filename: file.name || "upload.jpg",
      contentType: file.type || "image/jpeg",
      folder,
    });
    return NextResponse.json({ publicUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al subir la imagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
