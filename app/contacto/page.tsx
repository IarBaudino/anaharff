"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionDivider } from "@/components/SectionDivider";
import { cn } from "@/lib/utils";
import { siteButtonSolid } from "@/lib/site-buttons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const TIPOS_CONSULTA = [
  { value: "sesion", label: "Sesión de fotos o encargo personal" },
  { value: "tienda", label: "Compra de obra / tienda / edición limitada" },
  { value: "colaboracion", label: "Colaboración, exposición o prensa" },
  { value: "clases", label: "Taller, mentoría o consulta técnica" },
  { value: "otro", label: "Otro motivo" },
] as const;

const PREFERENCIAS_CONTACTO = [
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "cualquiera", label: "Me da igual" },
] as const;

const ORIGENES = [
  { value: "", label: "Elegí una opción (opcional)" },
  { value: "instagram", label: "Instagram" },
  { value: "recomendacion", label: "Recomendación de alguien" },
  { value: "portfolio", label: "Vi el portfolio o el sitio" },
  { value: "tienda_online", label: "Navegando la tienda" },
  { value: "evento", label: "Feria, muestra o evento" },
  { value: "busqueda", label: "Búsqueda en internet" },
  { value: "otro", label: "Otro" },
] as const;

const schema = z.object({
  nombre: z.string().min(2, "Nombre requerido"),
  apellido: z.string().max(80, "Máximo 80 caracteres").optional(),
  email: z.string().email("Email inválido"),
  telefono: z
    .string()
    .refine(
      (s) => !s.trim() || /^[\d\s+().-]{8,}$/.test(s.trim()),
      "Si completás el teléfono, revisá el formato"
    ),
  tipoConsulta: z
    .string()
    .min(1, "Seleccioná el motivo del contacto")
    .refine(
      (v) => TIPOS_CONSULTA.some((t) => t.value === v),
      "Elegí una opción válida"
    ),
  asunto: z.string().max(140, "Máximo 140 caracteres").optional(),
  ubicacion: z.string().max(100, "Máximo 100 caracteres").optional(),
  preferenciaContacto: z.enum(["email", "whatsapp", "cualquiera"]),
  comoNosConociste: z.string().optional(),
  mensaje: z
    .string()
    .min(20, "Contanos un poco más (al menos 20 caracteres)"),
  consentimiento: z.boolean().refine((v) => v === true, {
    message:
      "Necesito tu conformidad para usar estos datos solo para responderte",
  }),
});

type ContactFormValues = z.infer<typeof schema>;

const inputClass =
  "w-full rounded-xl border-2 border-charcoal/15 bg-cream px-4 py-3 transition-colors focus:border-charcoal focus:outline-none";
const labelClass = "mb-2 block text-sm text-charcoal/90";

export default function ContactoPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      apellido: "",
      telefono: "",
      asunto: "",
      ubicacion: "",
      preferenciaContacto: "email",
      comoNosConociste: "",
      consentimiento: false,
    },
  });

  const pref = watch("preferenciaContacto");

  const onSubmit = async (values: ContactFormValues) => {
    // TODO: POST a `/api/contact` con `values`.
    await new Promise((r) => setTimeout(r, 900));
    void values;
    setSent(true);
  };

  if (sent) {
    return (
      <div className="pt-6 md:pt-8 pb-24">
        <div className="mx-auto max-w-xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <p className="font-display text-2xl text-charcoal">
              Mensaje enviado. Te responderé pronto.
            </p>
            <p className="text-sm text-stone">
              Si elegiste WhatsApp y dejaste tu número, podés escribirme también
              desde ahí para agilizar.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 md:pt-12 pb-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="section-kicker mb-3">Escritura</p>
          <h1 className="font-display text-4xl font-light tracking-tight text-charcoal md:text-5xl">
            Contacto
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-charcoal/80">
            Contame el motivo y lo que necesitás: sesiones, obras, colaboraciones
            o consultas. Cuanto más contexto, mejor puedo responderte.
          </p>
          <SectionDivider variant="ornament" className="my-8" />
          <SectionDivider variant="line" className="max-w-sm opacity-90" />
        </motion.header>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="nombre" className={labelClass}>
                Nombre <span className="text-red-600">*</span>
              </label>
              <input
                id="nombre"
                autoComplete="given-name"
                {...register("nombre")}
                className={inputClass}
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="apellido" className={labelClass}>
                Apellido
              </label>
              <input
                id="apellido"
                autoComplete="family-name"
                {...register("apellido")}
                className={inputClass}
              />
              {errors.apellido && (
                <p className="mt-1 text-sm text-red-600">{errors.apellido.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className={labelClass}>
                Email <span className="text-red-600">*</span>
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className={inputClass}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="telefono" className={labelClass}>
                Teléfono / WhatsApp
                {pref === "whatsapp" && (
                  <span className="ms-1 text-accent">(recomendado si elegís WhatsApp)</span>
                )}
              </label>
              <input
                id="telefono"
                type="tel"
                autoComplete="tel"
                placeholder="+54 11 ..."
                {...register("telefono")}
                className={inputClass}
              />
              {errors.telefono && (
                <p className="mt-1 text-sm text-red-600">{errors.telefono.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="tipoConsulta" className={labelClass}>
              Motivo del contacto <span className="text-red-600">*</span>
            </label>
            <select id="tipoConsulta" {...register("tipoConsulta")} className={inputClass}>
              <option value="">Elegí una opción</option>
              {TIPOS_CONSULTA.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {errors.tipoConsulta && (
              <p className="mt-1 text-sm text-red-600">
                {errors.tipoConsulta.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="asunto" className={labelClass}>
              Asunto corto <span className="text-stone">(opcional)</span>
            </label>
            <input
              id="asunto"
              placeholder="Ej.: Sesión en marzo / Impresión tamaño A2"
              {...register("asunto")}
              className={inputClass}
            />
            {errors.asunto && (
              <p className="mt-1 text-sm text-red-600">{errors.asunto.message}</p>
            )}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="ubicacion" className={labelClass}>
                Ciudad / país
                <span className="text-stone"> · opcional</span>
              </label>
              <input
                id="ubicacion"
                autoComplete="address-level1"
                placeholder="Ej.: Buenos Aires, Argentina"
                {...register("ubicacion")}
                className={inputClass}
              />
              {errors.ubicacion && (
                <p className="mt-1 text-sm text-red-600">{errors.ubicacion.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="preferenciaContacto" className={labelClass}>
                Preferencia de respuesta <span className="text-red-600">*</span>
              </label>
              <select
                id="preferenciaContacto"
                {...register("preferenciaContacto")}
                className={inputClass}
              >
                {PREFERENCIAS_CONTACTO.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              {errors.preferenciaContacto && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.preferenciaContacto.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="comoNosConociste" className={labelClass}>
              ¿Cómo me conociste?
              <span className="text-stone"> · opcional</span>
            </label>
            <select id="comoNosConociste" {...register("comoNosConociste")} className={inputClass}>
              {ORIGENES.map((o) => (
                <option key={o.value || "empty"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="mensaje" className={labelClass}>
              Mensaje <span className="text-red-600">*</span>
            </label>
            <textarea
              id="mensaje"
              rows={6}
              placeholder="Ideas, fechas posibles, referencias, dudas sobre formatos o entrega…"
              {...register("mensaje")}
              className={cn(inputClass, "resize-y min-h-[9rem]")}
            />
            {errors.mensaje && (
              <p className="mt-1 text-sm text-red-600">{errors.mensaje.message}</p>
            )}
          </div>

          <div className="rounded-xl border border-charcoal/12 bg-charcoal/[0.02] p-4">
            <label className="flex cursor-pointer gap-3 text-sm leading-snug text-charcoal/90">
              <input
                type="checkbox"
                {...register("consentimiento")}
                className="mt-1 h-4 w-4 shrink-0 rounded border-charcoal/30 text-charcoal focus:ring-charcoal/20"
              />
              <span>
                Acepto que mis datos se usen{" "}
                <strong className="font-medium text-charcoal">
                  solo para responder esta consulta
                </strong>
                , conforme a la normativa aplicable en Argentina (Ley 25.326).
              </span>
            </label>
            {errors.consentimiento && (
              <p className="mt-2 text-sm text-red-600">
                {errors.consentimiento.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(siteButtonSolid, "w-full sm:w-auto")}
          >
            {isSubmitting ? "Enviando..." : "Enviar mensaje"}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
