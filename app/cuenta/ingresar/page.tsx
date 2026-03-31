"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { motion } from "framer-motion";
import { auth, isFirebaseConfigured } from "@/lib/firebase-client";

function inputClass() {
  return "w-full px-4 py-3 border border-charcoal/20 bg-cream focus:border-charcoal focus:outline-none";
}

export default function IngresarPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isFirebaseConfigured || !auth) {
      setError("Firebase no está configurado.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/cuenta");
      router.refresh();
    } catch {
      setError("Email o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-24 pb-20 min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md border border-charcoal/10 bg-cream p-8 rounded-lg shadow-sm"
      >
        <h1 className="font-display text-3xl font-light mb-2">Ingresar</h1>
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
            <input
              id="pass"
              type="password"
              className={inputClass()}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-8 py-3 bg-charcoal text-cream text-sm tracking-widest uppercase hover:bg-ink transition-colors disabled:opacity-50"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
        <p className="mt-6 text-sm text-stone">
          ¿No tenés cuenta?{" "}
          <Link href="/cuenta/registro" className="text-accent underline">
            Registrate
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
