"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export function ExitoContent() {
  const searchParams = useSearchParams();
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const tried = useRef(false);

  useEffect(() => {
    const paymentId = searchParams.get("payment_id");
    if (!paymentId || tried.current) return;
    tried.current = true;

    fetch("/api/orders/sync-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setSyncMsg(
            data.created
              ? "Tu pedido quedó registrado en el panel de administración."
              : "Pedido ya registrado."
          );
        } else {
          setSyncMsg(
            "No se pudo sincronizar el pedido automáticamente (revisá en el panel más tarde)."
          );
        }
      })
      .catch(() => {
        setSyncMsg("No se pudo sincronizar el pedido automáticamente.");
      });
  }, [searchParams]);

  return (
    <div className="pt-24 pb-20 min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md px-4"
      >
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
        <h1 className="font-display text-2xl md:text-3xl font-light mb-4">
          ¡Pago exitoso!
        </h1>
        <p className="text-charcoal/80 mb-8">
          Gracias por tu compra. Recibirás un correo con los detalles de entrega
          de tu imagen.
        </p>
        {syncMsg && <p className="text-sm text-stone mb-6">{syncMsg}</p>}
        <Link
          href="/tienda"
          className="inline-block px-8 py-3 bg-charcoal text-cream text-sm tracking-widest uppercase hover:bg-ink transition-colors"
        >
          Volver a la tienda
        </Link>
      </motion.div>
    </div>
  );
}
