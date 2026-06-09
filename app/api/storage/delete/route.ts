import { NextResponse } from "next/server";
import { isSupabaseStorageConfigured } from "@/lib/storage-config";
import { deleteStorageObjectByUrl } from "@/lib/supabase-storage-server";
import { isAdminIdToken } from "@/lib/verify-admin-token";

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

  let body: { url?: string };
  try {
    body = (await req.json()) as { url?: string };
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const url = String(body.url ?? "").trim();
  if (!url) {
    return NextResponse.json({ error: "Falta la URL." }, { status: 400 });
  }

  try {
    const result = await deleteStorageObjectByUrl(url);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al borrar la imagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
