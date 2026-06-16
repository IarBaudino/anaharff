"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase-client";
import { cn } from "@/lib/utils";
import { siteButtonSolid } from "@/lib/site-buttons";
import { PasswordField } from "@/components/ui/PasswordField";

function inputClass() {
  return "w-full rounded-xl border border-charcoal/20 bg-cream px-4 py-3 focus:border-charcoal focus:outline-none";
}

export default function RegistroPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-stone">Cargando…</div>}>
      <RegistroForm />
    </Suspense>
  );
}

function RegistroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/cuenta";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isFirebaseConfigured || !auth || !db) {
      setError("No se pueden crear cuentas en este momento. Probá más tarde.");
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const authEmail = cred.user.email ?? email.trim();
      await setDoc(doc(db, "customers", cred.user.uid), {
        uid: cred.user.uid,
        email: authEmail,
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        createdAt: serverTimestamp(),
        ordersCount: 0,
      });

      try {
        const idToken = await cred.user.getIdToken();
        await fetch("/api/email/welcome", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nombre: nombre.trim() }),
        });
      } catch {
        /* el registro no debe fallar si el mail de bienvenida no sale */
      }

      router.replace(nextPath.startsWith("/") ? nextPath : "/cuenta");
      router.refresh();
    } catch {
      setError("No se pudo crear la cuenta. Probá otro email o una contraseña más segura.");
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
        <h1 className="font-display text-3xl font-light mb-2">Crear cuenta</h1>
        <p className="text-sm text-stone mb-6">
          Creá tu cuenta para comprar impresiones con envío. Podés guardar tu dirección y ver el
          estado de tus pedidos.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs tracking-widest mb-2" htmlFor="nombre">
              Nombre
            </label>
            <input
              id="nombre"
              className={inputClass()}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs tracking-widest mb-2" htmlFor="tel">
              Teléfono
            </label>
            <input
              id="tel"
              className={inputClass()}
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
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
              minLength={6}
            />
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className={cn(siteButtonSolid, "w-full")}
          >
            {loading ? "Creando…" : "Registrarme"}
          </button>
        </form>
        <p className="mt-6 text-sm text-stone">
          ¿Ya tenés cuenta?{" "}
          <Link href={`/cuenta/ingresar?next=${encodeURIComponent(nextPath)}`} className="text-accent underline">
            Ingresar
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
