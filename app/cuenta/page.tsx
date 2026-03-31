"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { motion } from "framer-motion";
import { auth, isFirebaseConfigured } from "@/lib/firebase-client";
import { useAuth } from "@/components/AuthProvider";

export default function CuentaPage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  if (!ready) {
    return (
      <div className="pt-32 text-center text-stone">
        Cargando…
      </div>
    );
  }

  if (!isFirebaseConfigured || !user) {
    return (
      <div className="pt-24 pb-20 px-4 text-center max-w-md mx-auto space-y-6">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-light"
        >
          Mi cuenta
        </motion.h1>
        <p className="text-stone text-sm">
          Iniciá sesión para asociar tus compras o creá una cuenta nueva.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/cuenta/ingresar"
            className="px-8 py-3 bg-charcoal text-cream text-sm tracking-widest uppercase"
          >
            Ingresar
          </Link>
          <Link
            href="/cuenta/registro"
            className="px-8 py-3 border border-charcoal text-charcoal text-sm tracking-widest uppercase"
          >
            Registrarse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 max-w-lg mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl font-light mb-2">Mi cuenta</h1>
        <p className="text-sm text-stone break-all">{user.email}</p>
      </motion.div>

      <div className="space-y-3">
        <Link
          href="/tienda"
          className="block text-center px-8 py-3 border border-charcoal/20 text-sm tracking-widest uppercase hover:border-charcoal/40"
        >
          Ir a la tienda
        </Link>
        <button
          type="button"
          onClick={async () => {
            if (auth) await signOut(auth);
            router.replace("/");
            router.refresh();
          }}
          className="w-full px-8 py-3 bg-charcoal text-cream text-sm tracking-widest uppercase hover:bg-ink"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
