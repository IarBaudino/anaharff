import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";

/** Sincroniza el email del perfil `customers` con el de Firebase Auth (tras verificación). */
export async function POST(request: NextRequest) {
  const adminAuth = getAdminAuth();
  const db = getAdminDb();
  if (!adminAuth || !db) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
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

  await db.collection("customers").doc(decoded.uid).set(
    { email, uid: decoded.uid, updatedAt: new Date() },
    { merge: true }
  );

  return NextResponse.json({ ok: true, email });
}
