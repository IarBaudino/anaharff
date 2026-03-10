"use client";

import { motion } from "framer-motion";

export default function SobreMiPage() {
  return (
    <div className="pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          id="biografia"
        >
          <h1 className="font-display text-4xl md:text-5xl font-light mb-12">
            Sobre mí
          </h1>
          <div className="prose prose-lg max-w-none text-charcoal/90 leading-relaxed space-y-6">
            <p>
              Fotógrafa analógica radicada en Buenos Aires. Mi trabajo explora la
              representación del cuerpo, la diversidad y la autenticidad. A
              través de la fotografía analógica busco capturar momentos de
              vulnerabilidad y verdad.
            </p>
            <p>
              Mi práctica fotográfica se centra en desnudos artísticos, retratos
              íntimos y series que cuestionan los estereotipos corporales. Creo
              en la importancia de la representación diversa y en la lucha por la
              emancipación del cuerpo.
            </p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 pt-16 border-t border-charcoal/10"
        >
          <h2 className="font-display text-2xl font-light mb-6">
            Sesión de fotos
          </h2>
          <p className="text-charcoal/90 leading-relaxed mb-6">
            Ofrezco sesiones de fotografía analógica personalizadas. Si te
            interesa reservar una sesión, no dudes en{" "}
            <a href="/contacto" className="text-accent underline hover:no-underline">
              contactarme
            </a>
            .
          </p>
        </motion.section>
      </div>
    </div>
  );
}
