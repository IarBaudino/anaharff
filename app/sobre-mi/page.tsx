"use client";

import { motion } from "framer-motion";
import { useSiteContent } from "@/hooks/useSiteContent";
import { defaultSiteContent } from "@/lib/site-content";

export default function SobreMiPage() {
  const { content } = useSiteContent();
  const sobreMi = content?.sobreMi ?? defaultSiteContent.sobreMi;

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
              {sobreMi.bio1}
            </p>
            <p>
              {sobreMi.bio2}
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
            {sobreMi.sesionTexto}
          </p>
        </motion.section>
      </div>
    </div>
  );
}
