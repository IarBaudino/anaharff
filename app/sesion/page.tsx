"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function SesionPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl md:text-5xl font-light mb-12"
        >
          Sesión de fotos
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6 text-charcoal/90 leading-relaxed"
        >
          <p>
            Las sesiones se realizan en Buenos Aires, con fotografía 100%
            analógica. Trabajo con película en formato 35mm y medio formato.
          </p>
          <p>
            Para reservar una sesión o consultar disponibilidad y precios,{" "}
            <Link href="/contacto" className="text-accent underline hover:no-underline">
              contactame
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
}
