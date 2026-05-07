import { NextRequest, NextResponse } from "next/server";
import { isAdminIdToken } from "@/lib/verify-admin-token";
import {
  deleteCloudinaryImageByUrl,
  isCloudinaryServerConfigured,
} from "@/lib/cloudinary-server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isCloudinaryServerConfigured()) {
    return NextResponse.json(
      { error: "Servicio de imágenes no configurado." },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!(await isAdminIdToken(token))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { url?: string };
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    if (!url) return NextResponse.json({ error: "Falta url" }, { status: 400 });

    const result = await deleteCloudinaryImageByUrl(url);
    return NextResponse.json({ ok: true, deleted: result.deleted });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al borrar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
