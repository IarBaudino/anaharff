"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { doc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/components/AuthProvider";
import { CheckoutButton } from "@/components/tienda/CheckoutButton";
import { ShippingAddressForm } from "@/components/shipping/ShippingAddressForm";
import { db } from "@/lib/firebase-client";
import type { CheckoutLineItem } from "@/lib/commerce-types";
import type { TiendaEnvios } from "@/lib/site-content";
import {
  emptyShippingAddress,
  normalizeShippingAddress,
  validateShippingAddress,
  SHIPPING_LINE_ITEM_ID,
  shippingCostForZone,
  shippingZoneLabel,
  type ShippingAddress,
} from "@/lib/shipping";
import type { CartItem } from "@/stores/cart-store";

type Props = {
  cartItems: CartItem[];
  envios: TiendaEnvios;
  savedAddress?: ShippingAddress | null;
  profileNombre?: string;
  profileTelefono?: string;
};

export function CartCheckoutPanel({
  cartItems,
  envios,
  savedAddress,
  profileNombre = "",
  profileTelefono = "",
}: Props) {
  const { user } = useAuth();
  const [address, setAddress] = useState<ShippingAddress>(() => {
    if (savedAddress) return savedAddress;
    return {
      ...emptyShippingAddress(),
      nombre: profileNombre,
      telefono: profileTelefono,
    };
  });
  const [saveForLater, setSaveForLater] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (savedAddress) {
      setAddress(savedAddress);
      return;
    }
    setAddress((prev) => ({
      ...prev,
      nombre: prev.nombre || profileNombre,
      telefono: prev.telefono || profileTelefono,
    }));
  }, [savedAddress, profileNombre, profileTelefono]);

  const subtotal = cartItems.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const shippingCost = shippingCostForZone(envios, address.zona);
  const total = subtotal + shippingCost;

  const checkoutItems: CheckoutLineItem[] = useMemo(() => {
    const productLines = cartItems.map((i) => ({
      id: i.id,
      title: i.title,
      quantity: i.quantity,
      unit_price: i.unit_price,
      currency_id: "ARS" as const,
      description: i.description,
      picture_url: i.picture_url,
    }));
    if (shippingCost <= 0) return productLines;
    return [
      ...productLines,
      {
        id: SHIPPING_LINE_ITEM_ID,
        title: `Envío — ${shippingZoneLabel(address.zona)}`,
        quantity: 1,
        unit_price: shippingCost,
        currency_id: "ARS",
        description: "Costo de envío de la impresión",
      },
    ];
  }, [address.zona, cartItems, shippingCost]);

  async function persistAddressIfNeeded() {
    if (!saveForLater || !user || !db) return;
    const normalized = normalizeShippingAddress(address);
    if (!normalized) return;
    await updateDoc(doc(db, "customers", user.uid), { envio: normalized });
  }

  if (!user) {
    return (
      <div className="space-y-4 rounded-xl border border-amber-200/80 bg-amber-50/60 p-5">
        <p className="text-sm text-charcoal">
          Para comprar impresiones necesitás una cuenta y los datos de envío.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/cuenta/ingresar?next=/tienda/carrito"
            className="inline-flex rounded-full border border-charcoal/25 bg-charcoal px-5 py-2.5 text-sm text-cream"
          >
            Ingresar
          </Link>
          <Link
            href="/cuenta/registro?next=/tienda/carrito"
            className="inline-flex rounded-full border border-charcoal/25 px-5 py-2.5 text-sm text-charcoal hover:bg-charcoal/[0.06]"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-light text-charcoal">Envío</h2>
        <p className="mt-1 text-sm text-stone">
          Las obras son impresiones físicas. Indicá a dónde debemos enviarlas.
        </p>
      </div>

      <ShippingAddressForm value={address} onChange={setAddress} />

      <label className="flex cursor-pointer items-start gap-2 text-sm text-charcoal">
        <input
          type="checkbox"
          className="mt-1"
          checked={saveForLater}
          onChange={(e) => setSaveForLater(e.target.checked)}
        />
        Guardar esta dirección en mi cuenta para próximas compras
      </label>

      <div className="space-y-2 border-t border-charcoal/10 pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-stone">Subtotal impresiones</span>
          <span>${subtotal.toLocaleString("es-AR")} ARS</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone">Envío ({shippingZoneLabel(address.zona)})</span>
          <span>
            {shippingCost > 0 ? `$${shippingCost.toLocaleString("es-AR")} ARS` : "Sin cargo"}
          </span>
        </div>
        <div className="flex justify-between text-lg font-medium text-charcoal">
          <span>Total</span>
          <span>${total.toLocaleString("es-AR")} ARS</span>
        </div>
      </div>

      {formError ? <p className="text-sm text-red-700">{formError}</p> : null}

      <CheckoutButton
        items={checkoutItems}
        checkoutScope="cart"
        label="Pagar con Mercado Pago"
        requireAuth
        shipping={{
          zona: address.zona,
          zonaLabel: shippingZoneLabel(address.zona),
          cost: shippingCost,
          address,
        }}
        onBeforeCheckout={async () => {
          const err = validateShippingAddress(address);
          if (err) {
            setFormError(err);
            throw new Error(err);
          }
          setFormError(null);
          await persistAddressIfNeeded();
        }}
        onSuccessRedirect={(url) => {
          window.location.href = url;
        }}
      />
    </div>
  );
}
