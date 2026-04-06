"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { motion } from "framer-motion";
import { auth, isFirebaseConfigured } from "@/lib/firebase-client";
import { cn } from "@/lib/utils";
import { siteButtonSolid } from "@/lib/site-buttons";
import { PasswordField } from "@/components/ui/PasswordField";

function inputClass() {
  return "w-full rounded-xl border border-charcoal/20 bg-cream px-4 py-3 focus:border-charcoal focus:outline-none";
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isFirebaseConfigured || !auth) {
      setError("El acceso al panel no está disponible en este entorno.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Credenciales incorrectas o usuario sin permisos de admin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-4 pb-20 min-h-[70vh] flex items-center justify-center px-4 md:pt-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md border border-charcoal/10 bg-cream p-8 rounded-lg shadow-sm"
      >
        <h1 className="font-display text-3xl font-light mb-2">Admin</h1>
        <p className="text-sm text-stone mb-8">
          Usá el correo y la contraseña que te dieron para administrar el sitio. Si no podés entrar,
          quien te habilitó puede revisar que tu usuario tenga permisos de administración.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
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
          <button
            type="submit"
            disabled={loading}
            className={cn(siteButtonSolid, "w-full")}
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
