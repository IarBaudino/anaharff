"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { motion } from "framer-motion";
import { auth, isFirebaseConfigured } from "@/lib/firebase-client";
import { useAuth } from "@/components/AuthProvider";
import { CuentaDashboard } from "@/components/cuenta/CuentaDashboard";
import { siteButtonOutline, siteButtonSolid } from "@/lib/site-buttons";
import { SITE_PAGE_SHELL_COMPACT } from "@/lib/layout-constants";

export default function CuentaPage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  if (!ready) {
    return <div className="pt-20 text-center text-stone md:pt-32">Cargando…</div>;
  }

  if (!isFirebaseConfigured || !user) {
    return (
      <div className="mx-auto max-w-md space-y-6 px-4 pb-20 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-light"
        >
          Mi cuenta
        </motion.h1>
        <p className="text-sm text-stone">
          Iniciá sesión para ver tus pedidos y editar tus datos.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/cuenta/ingresar" className={siteButtonSolid}>
            Iniciar sesión
          </Link>
          <Link href="/cuenta/registro" className={siteButtonOutline}>
            Registrarse
          </Link>
        </div>
        <p className="text-xs text-stone">
          <Link href="/cuenta/recuperar" className="text-accent underline underline-offset-2">
            Olvidé mi contraseña
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className={SITE_PAGE_SHELL_COMPACT}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 font-display text-4xl font-light md:text-5xl">Mi cuenta</h1>
            <p className="text-sm text-charcoal/80">
              Gestioná tus datos personales y el estado de tus pedidos.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {user.email ? (
              <span className="max-w-[220px] truncate text-xs text-stone">{user.email}</span>
            ) : null}
            <Link
              href="/tienda"
              className="rounded-full border border-charcoal/20 px-4 py-2 text-xs uppercase tracking-widest transition-colors hover:border-charcoal/40 hover:bg-charcoal/[0.04]"
            >
              Ir a tienda
            </Link>
            <Link
              href="/"
              className="rounded-full border border-charcoal/20 px-4 py-2 text-xs uppercase tracking-widest transition-colors hover:border-charcoal/40 hover:bg-charcoal/[0.04]"
            >
              Ver sitio
            </Link>
            {isFirebaseConfigured && auth ? (
              <button
                type="button"
                onClick={() => {
                  if (!auth) return;
                  void signOut(auth).then(() => {
                    router.replace("/");
                    router.refresh();
                  });
                }}
                className="rounded-full border border-charcoal/20 px-4 py-2 text-xs uppercase tracking-widest transition-colors hover:border-charcoal/40 hover:bg-charcoal/[0.04]"
              >
                Salir
              </button>
            ) : null}
          </div>
        </div>

        <CuentaDashboard />
      </div>
    </div>
  );
}
