import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { isEmailConfigured } from "@/lib/email/config";
import { sendWelcomeEmail } from "@/lib/email/send";

export async function POST(request: NextRequest) {
  if (!isEmailConfigured()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }

  const email = decoded.email?.trim();
  if (!email) {
    return NextResponse.json({ error: "Email no disponible." }, { status: 400 });
  }

  let nombre = "";
  try {
    const body = await request.json();
    if (body && typeof body.nombre === "string") {
      nombre = body.nombre.trim().slice(0, 80);
    }
  } catch {
    /* body opcional */
  }

  const result = await sendWelcomeEmail(nombre, email);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: "welcome_send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
