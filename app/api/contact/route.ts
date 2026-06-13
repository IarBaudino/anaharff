import { NextRequest, NextResponse } from "next/server";
import {
  contactFormSchema,
  labelForOrigen,
  labelForPreferencia,
  labelForTipoConsulta,
} from "@/lib/contact-schema";
import { isEmailConfigured } from "@/lib/email/config";
import { sendContactEmail } from "@/lib/email/send";

export async function POST(request: NextRequest) {
  if (!isEmailConfigured()) {
    return NextResponse.json(
      {
        error:
          "El formulario de contacto no está activo todavía. Escribime por Instagram o probá más tarde.",
      },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  if (typeof raw.website === "string" && raw.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Revisá los campos del formulario.";
    return NextResponse.json({ error: first }, { status: 400 });
  }

  const values = parsed.data;
  const result = await sendContactEmail({
    nombre: values.nombre.trim(),
    apellido: values.apellido?.trim(),
    email: values.email.trim(),
    telefono: values.telefono?.trim(),
    tipoConsulta: values.tipoConsulta,
    tipoConsultaLabel: labelForTipoConsulta(values.tipoConsulta),
    asunto: values.asunto?.trim(),
    ubicacion: values.ubicacion?.trim(),
    preferenciaContacto: values.preferenciaContacto,
    preferenciaLabel: labelForPreferencia(values.preferenciaContacto),
    comoNosConociste: values.comoNosConociste,
    origenLabel: labelForOrigen(values.comoNosConociste),
    mensaje: values.mensaje.trim(),
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        error:
          "No se pudo enviar el mensaje. Probá de nuevo en unos minutos o escribime por Instagram.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
