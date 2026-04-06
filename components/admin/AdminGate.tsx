"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, db, isFirebaseConfigured } from "@/lib/firebase-client";
import { useAuth } from "@/components/AuthProvider";

export function AdminGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin || !isFirebaseConfigured) {
      setAllowed(true);
      return;
    }

    if (!ready) return;

    if (!user || !auth || !db) {
      router.replace("/admin/login");
      setAllowed(false);
      return;
    }

    let cancelled = false;
    (async () => {
      const snap = await getDoc(doc(db, "admins", user.uid));
      if (cancelled) return;
      if (!snap.exists()) {
        await signOut(auth);
        router.replace("/admin/login");
        setAllowed(false);
        return;
      }
      setAllowed(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [isLogin, ready, user, router, pathname]);

  if (isLogin) return <>{children}</>;

  if (!isFirebaseConfigured) {
    return (
      <div className="pt-4 px-4 md:pt-8">
        <p className="text-red-700">
          El panel de administración no está disponible: falta completar la configuración del sitio.
        </p>
        {children}
      </div>
    );
  }

  if (!ready || allowed === null) {
    return (
      <div className="pt-20 text-center text-stone md:pt-32">
        Comprobando acceso…
      </div>
    );
  }

  if (!allowed) return null;

  return <>{children}</>;
}
