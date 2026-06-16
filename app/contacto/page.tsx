"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionDivider } from "@/components/SectionDivider";
import { cn } from "@/lib/utils";
import { siteButtonSolid } from "@/lib/site-buttons";
import { SITE_PAGE_SHELL } from "@/lib/layout-constants";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contactFormClientSchema,
  ORIGENES_CONTACTO,
  PREFERENCIAS_CONTACTO,
  TIPOS_CONSULTA,
  type ContactFormClientValues,
} from "@/lib/contact-schema";

const inputClass =
  "w-full rounded-xl border-2 border-charcoal/15 bg-cream px-4 py-3 transition-colors focus:border-charcoal focus:outline-none";
const labelClass = "mb-2 block text-sm text-charcoal/90";

export default function ContactoPage() {
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormClientValues>({
    resolver: zodResolver(contactFormClientSchema),
    defaultValues: {
      apellido: "",
      telefono: "",
      asunto: "",
      ubicacion: "",
      preferenciaContacto: "email",
      comoNosConociste: "",
      consentimiento: false,
      website: "",
    },
  });

  const pref = watch("preferenciaContacto");

  const onSubmit = async (values: ContactFormClientValues) => {
    setSubmitError(null);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        consentimiento: true,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setSubmitError(
        data.error || "No se pudo enviar el mensaje. Probá de nuevo en unos minutos."
      );
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className={SITE_PAGE_SHELL}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl space-y-4"
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
    <div className={SITE_PAGE_SHELL}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
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
          className="max-w-2xl space-y-6"
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
              {ORIGENES_CONTACTO.map((o) => (
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

          <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
            <label htmlFor="website">No completar</label>
            <input
              id="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              {...register("website")}
            />
          </div>

          {submitError ? (
            <p className="text-sm text-red-700" role="alert">
              {submitError}
            </p>
          ) : null}

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
