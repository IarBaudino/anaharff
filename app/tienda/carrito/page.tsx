"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { CartCheckoutPanel } from "@/components/tienda/CartCheckoutPanel";
import { useAuth } from "@/components/AuthProvider";
import { useSiteContent } from "@/hooks/useSiteContent";
import { db } from "@/lib/firebase-client";
import { defaultSiteContent } from "@/lib/site-content";
import type { CustomerRecord } from "@/lib/commerce-types";
import { normalizeShippingAddress } from "@/lib/shipping";
import { useCartStore } from "@/stores/cart-store";
import { SITE_PAGE_SHELL } from "@/lib/layout-constants";

export default function CarritoPage() {
  const { user } = useAuth();
  const { content } = useSiteContent();
  const envios = content?.tienda?.envios ?? defaultSiteContent.tienda.envios;
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const clear = useCartStore((s) => s.clear);

  const [profileNombre, setProfileNombre] = useState("");
  const [profileTelefono, setProfileTelefono] = useState("");
  const [savedAddress, setSavedAddress] = useState(
    null as ReturnType<typeof normalizeShippingAddress>
  );

  useEffect(() => {
    if (!user || !db) {
      setProfileNombre("");
      setProfileTelefono("");
      setSavedAddress(null);
      return;
    }

    const ref = doc(db, "customers", user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setProfileNombre("");
        setProfileTelefono("");
        setSavedAddress(null);
        return;
      }
      const data = snap.data() as CustomerRecord;
      setProfileNombre(data.nombre ?? "");
      setProfileTelefono(data.telefono ?? "");
      setSavedAddress(data.envio ? normalizeShippingAddress(data.envio) : null);
    });

    return () => unsub();
  }, [user]);

  return (
    <div className={SITE_PAGE_SHELL}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="section-kicker mb-2">Tienda</p>
            <h1 className="font-display text-4xl font-light tracking-tight text-charcoal md:text-5xl">
              Carrito
            </h1>
            <p className="mt-2 max-w-xl text-sm text-stone">
              Impresiones físicas en edición limitada. Completá el envío antes de pagar.
            </p>
          </div>
          <Link href="/tienda" className="text-sm text-stone underline underline-offset-4">
            Seguir comprando
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-charcoal/10 bg-cream/70 p-8 text-center">
            <p className="text-charcoal/80">Todavía no agregaste productos al carrito.</p>
            <Link
              href="/tienda"
              className="mt-5 inline-block rounded-full border border-charcoal/25 px-5 py-2.5 text-sm hover:bg-charcoal/[0.06]"
            >
              Ir a tienda
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12">
            <ul className="space-y-4 lg:col-span-7">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-charcoal/10 bg-cream/70 p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded bg-charcoal/[0.05]">
                      {item.picture_url ? (
                        <Image
                          src={item.picture_url}
                          alt={item.title}
                          fill
                          sizes="80px"
                          className="object-contain p-1"
                        />
                      ) : (
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-charcoal/[0.08] to-transparent"
                          aria-hidden
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-xl font-light text-charcoal">{item.title}</p>
                      <p className="mt-1 text-sm text-stone">
                        ${item.unit_price.toLocaleString("es-AR")} ARS · impresión
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="rounded border border-charcoal/20 p-1.5"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(item.id, item.quantity + 1)}
                        className="rounded border border-charcoal/20 p-1.5"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="inline-flex items-center gap-1 rounded border border-charcoal/15 px-2.5 py-1.5 text-xs text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="space-y-4 rounded-xl border border-charcoal/10 bg-cream/80 p-5 lg:col-span-5 lg:sticky lg:top-24 lg:h-fit">
              <CartCheckoutPanel
                cartItems={items}
                envios={envios}
                savedAddress={savedAddress}
                profileNombre={profileNombre}
                profileTelefono={profileTelefono}
              />
              <button
                type="button"
                onClick={clear}
                className="text-xs text-stone underline underline-offset-4"
              >
                Vaciar carrito
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
