"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { motion } from "framer-motion";
import { auth, isFirebaseConfigured } from "@/lib/firebase-client";
import { ensureCustomerProfile } from "@/lib/customer-profile";
import { cn } from "@/lib/utils";
import { siteButtonSolid } from "@/lib/site-buttons";
import { PasswordField } from "@/components/ui/PasswordField";

function inputClass() {
  return "w-full rounded-xl border border-charcoal/20 bg-cream px-4 py-3 focus:border-charcoal focus:outline-none";
}

export default function IngresarPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-stone">Cargando…</div>}>
      <IngresarForm />
    </Suspense>
  );
}

function IngresarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/cuenta";
  const resetOk = searchParams.get("reset") === "ok";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isFirebaseConfigured || !auth) {
      setError("El inicio de sesión no está disponible en este momento.");
      return;
    }

    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      try {
        await ensureCustomerProfile(cred.user);
      } catch {
        /* el panel intentará crear el perfil al cargar */
      }
      router.replace(nextPath.startsWith("/") ? nextPath : "/cuenta");
      router.refresh();
    } catch {
      setError("Email o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pb-20 min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md border border-charcoal/10 bg-cream p-8 rounded-lg shadow-sm"
      >
        <h1 className="mb-2 font-display text-3xl font-light">Ingresar</h1>
        {resetOk ? (
          <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            Contraseña actualizada. Ya podés ingresar con tu nueva clave.
          </p>
        ) : null}
        <form onSubmit={onSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-xs tracking-widest mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={inputClass()}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs tracking-widest mb-2" htmlFor="pass">
              Contraseña
            </label>
            <PasswordField
              id="pass"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <p className="text-right text-xs">
            <Link
              href={`/cuenta/recuperar?email=${encodeURIComponent(email)}`}
              className="text-accent underline underline-offset-2"
            >
              Olvidé mi contraseña
            </Link>
          </p>
          <button
            type="submit"
            disabled={loading}
            className={cn(siteButtonSolid, "w-full")}
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
        <p className="mt-6 text-sm text-stone">
          ¿No tenés cuenta?{" "}
          <Link href={`/cuenta/registro?next=${encodeURIComponent(nextPath)}`} className="text-accent underline">
            Registrate
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
