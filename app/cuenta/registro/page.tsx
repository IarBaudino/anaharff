"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase-client";
import { cn } from "@/lib/utils";
import { siteButtonSolid } from "@/lib/site-buttons";

function inputClass() {
  return "w-full rounded-xl border border-charcoal/20 bg-cream px-4 py-3 focus:border-charcoal focus:outline-none";
}

export default function RegistroPage() {
  const router = useRouter();
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
      setError("Firebase no está configurado.");
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "customers", cred.user.uid), {
        uid: cred.user.uid,
        email: cred.user.email,
        nombre: nombre || "",
        telefono: telefono || "",
        createdAt: serverTimestamp(),
        ordersCount: 0,
      });
      router.replace("/cuenta");
      router.refresh();
    } catch {
      setError("No se pudo crear la cuenta. Probá otro email o una contraseña más segura.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-6 md:pt-24 pb-20 min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md border border-charcoal/10 bg-cream p-8 rounded-lg shadow-sm"
      >
        <h1 className="font-display text-3xl font-light mb-2">Crear cuenta</h1>
        <p className="text-sm text-stone mb-6">
          Registrate para asociar tus compras a tu perfil (opcional: también podés comprar como
          invitado).
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
            <input
              id="pass"
              type="password"
              className={inputClass()}
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
          <Link href="/cuenta/ingresar" className="text-accent underline">
            Ingresar
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
