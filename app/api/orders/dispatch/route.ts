import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase-admin";
import { sendDispatchEmail } from "@/lib/email/send";
import { getServerSiteContent } from "@/lib/site-content-server";
import { safeTrackingUrl, trackingUrlFor } from "@/lib/site-content";
import { isAdminIdToken } from "@/lib/verify-admin-token";
import type { OrderRecord } from "@/lib/commerce-types";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!(await isAdminIdToken(token))) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: "El servidor no puede guardar pedidos." }, { status: 500 });
  }

  let body: { orderId?: string; empresaId?: string; trackingNumero?: string; trackingUrl?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const orderId = body.orderId?.trim() ?? "";
  const empresaId = body.empresaId?.trim() ?? "";
  const trackingNumero = body.trackingNumero?.trim() ?? "";
  const trackingUrlInput = body.trackingUrl?.trim() ?? "";
  if (!orderId || (!trackingNumero && !trackingUrlInput)) {
    return NextResponse.json(
      { error: "Escribí el número de seguimiento, la URL, o los dos." },
      { status: 400 }
    );
  }

  const site = await getServerSiteContent();
  const empresa = empresaId
    ? site.tienda.empresasEnvio.find((e) => e.id === empresaId)
    : undefined;
  if (empresaId && !empresa) {
    return NextResponse.json(
      { error: "Esa empresa no está en la lista. Agregala en Productos y guardá." },
      { status: 400 }
    );
  }

  const pastedUrl = trackingUrlInput ? safeTrackingUrl(trackingUrlInput) : "";
  if (trackingUrlInput && !pastedUrl) {
    return NextResponse.json(
      { error: "La URL tiene que empezar con http:// o https://." },
      { status: 400 }
    );
  }

  const ref = db.collection("orders").doc(orderId);
  const snap = await ref.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
  }

  const order = snap.data() as OrderRecord;
  const trackingUrl =
    pastedUrl || (empresa && trackingNumero ? trackingUrlFor(empresa, trackingNumero) : "");

  const keepStatus =
    order.status === "rechazado" ||
    order.status === "cancelado" ||
    order.status === "completado";

  await ref.update({
    envioEmpresaId: empresa?.id ?? null,
    envioEmpresaNombre: empresa?.nombre ?? null,
    trackingNumero: trackingNumero || null,
    trackingUrl: trackingUrl || null,
    status: keepStatus ? order.status : "en_preparacion",
    updatedAt: FieldValue.serverTimestamp(),
  });

  const email = order.customerEmail?.trim() ?? "";
  if (!email.includes("@")) {
    return NextResponse.json({
      ok: true,
      emailed: false,
      warning: "Pedido actualizado, pero no hay un email de cliente para avisar.",
    });
  }

  const sent = await sendDispatchEmail({
    orderId,
    customerEmail: email,
    payerName: order.payerName,
    empresaNombre: empresa?.nombre,
    trackingNumero,
    trackingUrl,
  });

  if (!sent.ok) {
    return NextResponse.json({
      ok: true,
      emailed: false,
      warning: "El pedido quedó guardado, pero el mail no se pudo enviar. Revisá el SMTP.",
    });
  }

  return NextResponse.json({ ok: true, emailed: true });
}
