"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "HOME" },
  {
    href: "/sobre-mi",
    label: "SOBRE MÍ",
    subItems: [
      { href: "/sobre-mi#biografia", label: "BIOGRAFÍA" },
      { href: "/sesion", label: "SESIÓN DE FOTOS" },
      { href: "/contacto", label: "CONTACTO" },
    ],
  },
  {
    href: "/portfolio",
    label: "PORTFOLIO",
    subItems: [
      { href: "/portfolio/desnudos", label: "DESNUDOS (NUDE)" },
      { href: "/portfolio/retratos", label: "RETRATOS (PORTRAIT)" },
      { href: "/portfolio/artistico", label: "ARTÍSTICO (ART & SHOWS)" },
      { href: "/portfolio/experimental", label: "EXPERIMENTAL" },
    ],
  },
  {
    href: "/series",
    label: "SERIES",
    subItems: [
      { href: "/series/unica", label: "UNICA" },
      { href: "/series/ser-gorda", label: "Ser Gorda" },
      { href: "/series/venus-as-a-boy", label: "Venus as a Boy" },
      { href: "/series/desde-la-distancia", label: "Desde la Distancia" },
    ],
  },
  { href: "/blog", label: "BLOG" },
  { href: "/tienda", label: "TIENDA" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-charcoal/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link
            href="/"
            className="font-display text-xl md:text-2xl font-medium tracking-tight text-charcoal hover:text-accent transition-colors"
          >
            ANA HARFF
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() =>
                  item.subItems ? setHoveredItem(item.href) : null
                }
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "text-xs tracking-[0.2em] uppercase font-medium transition-colors",
                    "text-charcoal hover:text-accent"
                  )}
                >
                  {item.label}
                </Link>
                {item.subItems && (
                  <AnimatePresence>
                    {hoveredItem === item.href && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 pt-2"
                      >
                        <div className="bg-cream border border-charcoal/10 shadow-lg py-3 min-w-[200px]">
                          {item.subItems.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className="block px-4 py-2 text-xs tracking-widest text-charcoal hover:bg-charcoal/5 hover:text-accent transition-colors"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-charcoal"
            aria-label="Abrir menú"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-charcoal/10 bg-cream"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <div key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-2 text-sm tracking-widest text-charcoal hover:text-accent"
                  >
                    {item.label}
                  </Link>
                  {item.subItems && (
                    <div className="pl-4 space-y-1">
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setMobileOpen(false)}
                          className="block py-1.5 text-xs tracking-widest text-stone hover:text-accent"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
