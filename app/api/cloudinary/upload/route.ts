import { NextRequest, NextResponse } from "next/server";
import { isAdminIdToken } from "@/lib/verify-admin-token";
import {
  isCloudinaryServerConfigured,
  uploadImageToCloudinary,
} from "@/lib/cloudinary-server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isCloudinaryServerConfigured()) {
    return NextResponse.json(
      { error: "Cloudinary no configurado en el servidor" },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!(await isAdminIdToken(token))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Falta el archivo (campo file)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { secureUrl, publicId } = await uploadImageToCloudinary({
      buffer,
      mimeType: file.type || "image/jpeg",
      filename: file.name || "upload",
    });

    return NextResponse.json({ secureUrl, publicId });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al subir";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
