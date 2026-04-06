"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { XCircle } from "lucide-react";
import { siteButtonSolid } from "@/lib/site-buttons";

export default function TiendaErrorPage() {
  return (
    <div className="pt-6 md:pt-24 pb-20 min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md px-4"
      >
        <XCircle className="w-16 h-16 text-red-600 mx-auto mb-6" />
        <h1 className="font-display text-2xl md:text-3xl font-light mb-4">
          Hubo un error
        </h1>
        <p className="text-charcoal/80 mb-8">
          El pago no pudo completarse. Podés intentar de nuevo o contactarme si
          el problema persiste.
        </p>
        <Link href="/tienda" className={siteButtonSolid}>
          Volver a intentar
        </Link>
      </motion.div>
    </div>
  );
}
