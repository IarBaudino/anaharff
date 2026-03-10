"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

export default function TiendaPendientePage() {
  return (
    <div className="pt-24 pb-20 min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md px-4"
      >
        <Clock className="w-16 h-16 text-amber-600 mx-auto mb-6" />
        <h1 className="font-display text-2xl md:text-3xl font-light mb-4">
          Pago pendiente
        </h1>
        <p className="text-charcoal/80 mb-8">
          Tu pago está en proceso. Cuando se complete, recibirás un correo con
          los detalles.
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
