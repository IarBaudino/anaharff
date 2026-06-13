import { z } from "zod";

export const TIPOS_CONSULTA = [
  { value: "sesion", label: "Sesión de fotos o encargo personal" },
  { value: "tienda", label: "Compra de obra / tienda / edición limitada" },
  { value: "colaboracion", label: "Colaboración, exposición o prensa" },
  { value: "clases", label: "Taller, mentoría o consulta técnica" },
  { value: "otro", label: "Otro motivo" },
] as const;

export const PREFERENCIAS_CONTACTO = [
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "cualquiera", label: "Me da igual" },
] as const;

export const ORIGENES_CONTACTO = [
  { value: "", label: "Elegí una opción (opcional)" },
  { value: "instagram", label: "Instagram" },
  { value: "recomendacion", label: "Recomendación de alguien" },
  { value: "portfolio", label: "Vi el portfolio o el sitio" },
  { value: "tienda_online", label: "Navegando la tienda" },
  { value: "evento", label: "Feria, muestra o evento" },
  { value: "busqueda", label: "Búsqueda en internet" },
  { value: "otro", label: "Otro" },
] as const;

export const contactFormSchema = z.object({
  nombre: z.string().min(2, "Nombre requerido").max(80),
  apellido: z.string().max(80).optional(),
  email: z.string().email("Email inválido"),
  telefono: z
    .string()
    .max(40)
    .refine(
      (s) => !s.trim() || /^[\d\s+().-]{8,}$/.test(s.trim()),
      "Si completás el teléfono, revisá el formato"
    )
    .optional(),
  tipoConsulta: z
    .string()
    .min(1)
    .refine((v) => TIPOS_CONSULTA.some((t) => t.value === v)),
  asunto: z.string().max(140).optional(),
  ubicacion: z.string().max(100).optional(),
  preferenciaContacto: z.enum(["email", "whatsapp", "cualquiera"]),
  comoNosConociste: z.string().optional(),
  mensaje: z.string().min(20).max(5000),
  consentimiento: z.literal(true),
  /** Honeypot anti-spam: debe ir vacío */
  website: z.string().max(0).optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

/** Validación en el navegador (checkbox + honeypot opcional). */
export const contactFormClientSchema = contactFormSchema
  .omit({ consentimiento: true, website: true })
  .extend({
    consentimiento: z.boolean().refine((v) => v === true, {
      message: "Necesito tu conformidad para usar estos datos solo para responderte",
    }),
    website: z.string().optional(),
  });

export type ContactFormClientValues = z.infer<typeof contactFormClientSchema>;

export function labelForTipoConsulta(value: string): string {
  return TIPOS_CONSULTA.find((t) => t.value === value)?.label ?? value;
}

export function labelForPreferencia(value: string): string {
  return PREFERENCIAS_CONTACTO.find((p) => p.value === value)?.label ?? value;
}

export function labelForOrigen(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return ORIGENES_CONTACTO.find((o) => o.value === value)?.label;
}
