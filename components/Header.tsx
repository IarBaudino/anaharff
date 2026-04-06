"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";

const navItems = [
  { href: "/", label: "HOME" },
  {
    href: "/sobre-mi",
    label: "SOBRE MÍ",
    subItems: [
      { href: "/sobre-mi#biografia", label: "BIOGRAFÍA" },
      { href: "/sesion", label: "SESIÓN" },
      { href: "/contacto", label: "CONTACTO" },
    ],
  },
  {
    href: "/portfolio",
    label: "PORTFOLIO",
    subItems: [
      { href: "/portfolio/desnudos", label: "DESNUDOS" },
      { href: "/portfolio/retratos", label: "RETRATOS" },
      { href: "/portfolio/artistico", label: "ARTÍSTICO" },
      { href: "/portfolio/experimental", label: "EXPERIMENTAL" },
    ],
  },
  {
    href: "/series",
    label: "SERIES",
    subItems: [
      { href: "/series/unica", label: "Unica" },
      { href: "/series/ser-gorda", label: "Ser Gorda" },
      { href: "/series/venus-as-a-boy", label: "Venus as a Boy" },
      { href: "/series/desde-la-distancia", label: "Desde la dist." },
    ],
  },
  { href: "/blog", label: "BLOG" },
  { href: "/tienda", label: "TIENDA" },
] as const;

const drawerLinkClass =
  "font-display text-lg font-light leading-snug tracking-tight text-charcoal transition-colors hover:text-accent";

const drawerSubLinkClass =
  "font-display text-base font-light leading-snug tracking-tight text-stone transition-colors hover:text-accent";

const navItemClass =
  "inline-flex items-center gap-0.5 whitespace-nowrap px-2 py-2 font-display text-[0.8rem] font-light tracking-tight text-charcoal transition-colors hover:text-accent lg:px-2.5 lg:text-sm";

const dropdownLinkClass =
  "block px-4 py-2.5 text-center font-display text-sm font-light tracking-tight text-charcoal transition-colors hover:bg-charcoal/5 hover:text-accent";

function NavDrawer({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const toggle = (key: string) => setOpenKey((k) => (k === key ? null : key));

  return (
    <div className="flex min-w-0 flex-col items-center gap-1">
      {navItems.map((item) => {
        if (!("subItems" in item) || !item.subItems) {
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(drawerLinkClass, "block w-full py-2.5 text-center")}
            >
              {item.label}
            </Link>
          );
        }
        const isOpen = openKey === item.href;
        return (
          <div key={item.href} className="flex w-full flex-col items-center space-y-1">
            <div className="flex w-full items-center justify-center gap-0.5">
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(drawerLinkClass, "py-2.5 text-center")}
              >
                {item.label}
              </Link>
              <button
                type="button"
                className="flex size-9 shrink-0 items-center justify-center rounded-sm text-charcoal/40 transition-colors hover:bg-charcoal/[0.04] hover:text-charcoal"
                aria-expanded={isOpen}
                aria-label={`${isOpen ? "Cerrar" : "Abrir"} submenú ${item.label}`}
                onClick={() => toggle(item.href)}
              >
                <ChevronDown
                  className={cn("size-4 transition-transform", isOpen && "rotate-180")}
                  strokeWidth={1.75}
                />
              </button>
            </div>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full overflow-hidden"
                >
                  <div className="flex flex-col items-center space-y-0.5 py-2">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={onNavigate}
                        className={cn(drawerSubLinkClass, "block w-full max-w-[16rem] px-2 py-1.5 text-center")}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function NavDesktop() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function onDocPointerDown(e: PointerEvent) {
      if (!navRef.current?.contains(e.target as Node)) setOpenKey(null);
    }
    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenKey(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <nav
      ref={navRef}
      className="mx-auto hidden min-w-0 max-w-full flex-1 justify-center overflow-visible md:flex"
      aria-label="Principal"
    >
      <ul className="flex flex-wrap items-center justify-center gap-x-0.5 gap-y-0 lg:gap-x-1">
        {navItems.map((item) => {
          if (!("subItems" in item) || !item.subItems) {
            return (
              <li key={item.href} className="shrink-0">
                <Link href={item.href} className={navItemClass}>
                  {item.label}
                </Link>
              </li>
            );
          }
          const open = openKey === item.href;
          return (
            <li key={item.href} className="relative shrink-0">
              <div className="flex items-center">
                <Link href={item.href} className={navItemClass}>
                  {item.label}
                </Link>
                <button
                  type="button"
                  className={cn(
                    "flex size-8 items-center justify-center rounded-sm text-charcoal/40 transition-colors",
                    open ? "text-charcoal" : "hover:bg-charcoal/[0.04] hover:text-charcoal"
                  )}
                  aria-expanded={open}
                  aria-haspopup="menu"
                  aria-label={`${open ? "Cerrar" : "Abrir"} submenú ${item.label}`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenKey((k) => (k === item.href ? null : item.href));
                  }}
                >
                  <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} strokeWidth={2} />
                </button>
              </div>
              {open && (
                <ul
                  className="absolute left-1/2 top-full z-[70] mt-1 min-w-[12rem] -translate-x-1/2 rounded-sm border border-charcoal/10 bg-cream/98 py-1 shadow-lg backdrop-blur-md"
                  role="menu"
                >
                  {item.subItems.map((sub) => (
                    <li key={sub.href} role="none">
                      <Link
                        href={sub.href}
                        className={dropdownLinkClass}
                        role="menuitem"
                        onClick={() => setOpenKey(null)}
                      >
                        {sub.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function AuthDesktop() {
  const { user, ready } = useAuth();
  if (!ready) return <span className="inline-block w-16 shrink-0" aria-hidden />;
  if (user) {
    return (
      <Link
        href="/cuenta"
        className="shrink-0 whitespace-nowrap font-display text-sm font-light tracking-tight text-stone transition-colors hover:text-charcoal"
      >
        Mi cuenta
      </Link>
    );
  }
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-3 gap-y-1 sm:gap-x-4">
      <Link
        href="/cuenta/ingresar"
        className="whitespace-nowrap font-display text-sm font-light tracking-tight text-stone transition-colors hover:text-charcoal"
      >
        Iniciar sesión
      </Link>
      <Link
        href="/cuenta/registro"
        className="whitespace-nowrap font-display text-sm font-light tracking-tight text-charcoal/70 transition-colors hover:text-accent"
      >
        Registrarse
      </Link>
    </div>
  );
}

function AuthDrawer({ onNavigate }: { onNavigate?: () => void }) {
  const { user, ready } = useAuth();
  if (!ready) return null;
  if (user) {
    return (
      <Link
        href="/cuenta"
        onClick={onNavigate}
        className={cn(drawerLinkClass, "block w-full py-2 text-center")}
      >
        Mi cuenta
      </Link>
    );
  }
  return (
    <div className="flex min-w-0 flex-col items-center gap-1">
      <Link
        href="/cuenta/ingresar"
        onClick={onNavigate}
        className={cn(drawerLinkClass, "block w-full py-2 text-center")}
      >
        Iniciar sesión
      </Link>
      <Link
        href="/cuenta/registro"
        onClick={onNavigate}
        className={cn(drawerLinkClass, "block w-full py-2 text-center text-stone")}
      >
        Registrarse
      </Link>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isAdmin) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 flex h-12 items-center justify-between border-b border-charcoal/10 bg-cream/95 px-4 backdrop-blur-md">
        <Link
          href="/admin"
          className="font-display text-base font-medium tracking-tight text-charcoal hover:text-accent"
        >
          Admin
        </Link>
        <Link
          href="/"
          className="text-[0.65rem] tracking-wide text-stone transition-colors hover:text-charcoal"
        >
          Ver sitio
        </Link>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 shrink-0 overflow-visible border-b border-charcoal/10 bg-cream/90 shadow-[0_1px_0_0_rgba(26,26,26,0.04)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-3 overflow-visible px-4 sm:gap-4 sm:px-6 md:h-[3.75rem] lg:px-10">
        <Link
          href="/"
          className="shrink-0 font-display text-lg font-light tracking-tight text-charcoal transition-colors hover:text-accent md:text-xl"
        >
          Ana Harff
        </Link>

        <NavDesktop />

        <div className="ml-auto hidden shrink-0 items-center md:flex">
          <AuthDesktop />
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="ml-auto flex size-10 shrink-0 items-center justify-center rounded-md border border-charcoal/10 text-charcoal transition-colors hover:border-charcoal/20 hover:bg-charcoal/[0.04] md:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {mobileOpen ? <X className="size-5" strokeWidth={1.75} /> : <Menu className="size-5" strokeWidth={1.75} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] bg-charcoal/25 backdrop-blur-[1px] md:hidden"
              aria-label="Cerrar menú"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 right-0 z-[60] flex w-[min(100vw-2rem,18rem)] flex-col border-l border-charcoal/10 bg-cream pt-4 shadow-lg md:hidden"
            >
              <div className="flex min-h-0 flex-1 flex-col px-4 pb-8">
                <div className="min-h-0 flex-1 overflow-y-auto">
                  <NavDrawer onNavigate={() => setMobileOpen(false)} />
                </div>
                <div className="mt-6 shrink-0 border-t border-charcoal/10 pt-4">
                  <AuthDrawer onNavigate={() => setMobileOpen(false)} />
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
