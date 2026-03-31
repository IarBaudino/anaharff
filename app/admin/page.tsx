"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase-client";
import { useAuth } from "@/components/AuthProvider";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  const { user } = useAuth();

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-light mb-2">
              Panel de administración
            </h1>
            <p className="text-charcoal/80 text-sm">
              Contenido, productos/fotos, pedidos y clientes del sitio.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            {user?.email && (
              <span className="text-xs text-stone max-w-[200px] truncate">{user.email}</span>
            )}
            <Link
              href="/"
              className="text-xs tracking-widest uppercase border border-charcoal/20 px-4 py-2 hover:border-charcoal/40"
            >
              Ver sitio
            </Link>
            {isFirebaseConfigured && auth && user && (
              <button
                type="button"
                onClick={() => {
                  if (!auth) return;
                  void signOut(auth);
                }}
                className="text-xs tracking-widest uppercase border border-charcoal/20 px-4 py-2 hover:border-charcoal/40"
              >
                Salir
              </button>
            )}
          </div>
        </div>

        <AdminDashboard />
      </div>
    </div>
  );
}
