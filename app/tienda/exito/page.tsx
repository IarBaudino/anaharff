"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export default function TiendaExitoPage() {
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
