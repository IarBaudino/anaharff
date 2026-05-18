"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { motion } from "framer-motion";
import { auth, isFirebaseConfigured } from "@/lib/firebase-client";
import { cn } from "@/lib/utils";
import { siteButtonSolid } from "@/lib/site-buttons";

function inputClass() {
  return "w-full rounded-xl border border-charcoal/20 bg-cream px-4 py-3 focus:border-charcoal focus:outline-none";
}

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!isFirebaseConfigured || !auth) {
      setError("No está disponible en este momento. Probá más tarde.");
      return;
    }

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Ingresá tu email.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, trimmed);
      setSuccess(true);
    } catch {
      setError(
        "No pudimos enviar el correo. Revisá que el email sea el de tu cuenta o probá de nuevo en unos minutos."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 pb-20 pt-6 md:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-lg border border-charcoal/10 bg-cream p-8 shadow-sm"
      >
        <h1 className="mb-2 font-display text-3xl font-light">Recuperar contraseña</h1>
        <p className="mb-6 text-sm text-stone">
          Te enviamos un enlace a tu correo para elegir una contraseña nueva.
        </p>

        {success ? (
          <div className="space-y-4">
            <p className="text-sm text-charcoal/90">
              Si existe una cuenta con <strong className="font-medium">{email.trim()}</strong>, vas a
              recibir un email con instrucciones. Revisá también la carpeta de spam.
            </p>
            <Link href="/cuenta/ingresar" className={cn(siteButtonSolid, "inline-flex w-full justify-center")}>
              Volver a ingresar
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs tracking-widest" htmlFor="email-reset">
                Email de tu cuenta
              </label>
              <input
                id="email-reset"
                type="email"
                className={inputClass()}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <button type="submit" disabled={loading} className={cn(siteButtonSolid, "w-full")}>
              {loading ? "Enviando…" : "Enviar enlace"}
            </button>
          </form>
        )}

        <p className="mt-6 text-sm text-stone">
          <Link href="/cuenta/ingresar" className="text-accent underline">
            Volver a ingresar
          </Link>
          {" · "}
          <Link href="/cuenta/registro" className="text-accent underline">
            Crear cuenta
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
