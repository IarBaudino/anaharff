"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Instagram, Mail, Menu, ShoppingCart, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/AuthProvider";
import { useSiteContent } from "@/hooks/useSiteContent";
import { defaultSiteContent } from "@/lib/site-content";
import { useCartStore } from "@/stores/cart-store";
import { SITE_NAV_SIDEBAR_WIDTH_CLASS } from "@/lib/layout-constants";
import { SITE_INSTAGRAM_URL } from "@/lib/site-links";

type NavItem = {
  href: string;
  label: string;
  subItems?: { href: string; label: string }[];
};

const baseNavItems: NavItem[] = [
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
      { href: "/portfolio/familia", label: "FAMILIA" },
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
];

const railLink =
  "block w-full py-2.5 pl-0.5 text-left font-display text-[0.68rem] font-light uppercase tracking-[0.2em] text-charcoal transition-colors hover:text-accent";

const railSubLink =
  "block w-full py-1.5 pl-3 text-left font-display text-[0.62rem] font-light tracking-wide text-stone transition-colors hover:text-charcoal";

const navSocialIconClass =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-md text-charcoal/70 transition-colors hover:bg-charcoal/[0.06] hover:text-charcoal";

function NavSocialLinks({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <Link
        href={SITE_INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
        className={navSocialIconClass}
        aria-label="Instagram"
      >
        <Instagram className="size-[1.1rem]" strokeWidth={1.65} />
      </Link>
      <Link href="/contacto" onClick={onNavigate} className={navSocialIconClass} aria-label="Contacto">
        <Mail className="size-[1.1rem]" strokeWidth={1.65} />
      </Link>
    </div>
  );
}

function cartItemCount(items: { quantity: number }[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

function CartNavLink({
  onNavigate,
  variant = "icon",
}: {
  onNavigate?: () => void;
  variant?: "icon" | "drawer" | "sidebar";
}) {
  const count = useCartStore((s) => cartItemCount(s.items));

  if (variant === "drawer" || variant === "sidebar") {
    return (
      <Link
        href="/tienda/carrito"
        onClick={onNavigate}
        className={cn(
          /* railLink usa `block` y anulaba el flex: icono y texto quedaban en columna */
          "flex w-full min-w-0 flex-nowrap items-center gap-2 py-2.5 text-left transition-colors hover:text-accent",
          variant === "sidebar" &&
            "font-display text-[0.68rem] font-light uppercase tracking-[0.2em] text-charcoal pl-0.5",
          variant === "drawer" && "justify-center text-center font-display text-lg font-light text-charcoal"
        )}
      >
        <ShoppingCart className="size-4 shrink-0 opacity-80" strokeWidth={1.75} />
        <span className="truncate">Carrito</span>
        {count > 0 ? (
          <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[0.65rem] font-medium text-cream">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </Link>
    );
  }

  return (
    <Link
      href="/tienda/carrito"
      onClick={onNavigate}
      className="relative inline-flex size-10 shrink-0 touch-manipulation items-center justify-center rounded-md text-charcoal transition-colors hover:bg-charcoal/[0.06]"
      aria-label={count > 0 ? `Carrito, ${count} artículos` : "Carrito"}
    >
      <ShoppingCart className="size-[1.15rem]" strokeWidth={1.75} />
      {count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex min-h-[1rem] min-w-[1rem] items-center justify-center rounded-full bg-accent px-0.5 text-[0.6rem] font-semibold leading-none text-cream">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}

function NavRail({
  navItems,
  onNavigate,
}: {
  navItems: NavItem[];
  onNavigate?: () => void;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const toggle = (key: string) => setOpenKey((k) => (k === key ? null : key));

  return (
    <nav className="flex min-h-0 flex-col gap-0.5" aria-label="Principal">
      {navItems.map((item) => {
        if (!item.subItems?.length) {
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate} className={railLink}>
              {item.label}
            </Link>
          );
        }
        const isOpen = openKey === item.href;
        return (
          <div key={item.href} className="flex flex-col">
            <div className="flex items-center gap-0.5">
              <Link href={item.href} onClick={onNavigate} className={cn(railLink, "min-w-0 flex-1")}>
                {item.label}
              </Link>
              <button
                type="button"
                className="flex size-8 shrink-0 items-center justify-center rounded-sm text-charcoal/45 transition-colors hover:bg-charcoal/[0.06] hover:text-charcoal"
                aria-expanded={isOpen}
                aria-label={`${isOpen ? "Cerrar" : "Abrir"} submenú ${item.label}`}
                onClick={() => toggle(item.href)}
              >
                <ChevronDown
                  className={cn("size-3.5 transition-transform", isOpen && "rotate-180")}
                  strokeWidth={2}
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
                  className="overflow-hidden"
                >
                  <div className="flex flex-col border-l border-charcoal/10 py-1 pl-1">
                    {item.subItems.map((sub) => (
                      <Link key={sub.href} href={sub.href} onClick={onNavigate} className={railSubLink}>
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
    </nav>
  );
}

function AuthRail({ onNavigate }: { onNavigate?: () => void }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="h-14 shrink-0" aria-hidden />;
  if (user) {
    return (
      <Link href="/cuenta" onClick={onNavigate} className={railLink}>
        Mi cuenta
      </Link>
    );
  }
  return (
    <div className="flex flex-col gap-0.5">
      <Link href="/cuenta/ingresar" onClick={onNavigate} className={railLink}>
        Iniciar sesión
      </Link>
      <Link href="/cuenta/registro" onClick={onNavigate} className={cn(railSubLink, "pl-0.5 uppercase tracking-[0.18em]")}>
        Registrarse
      </Link>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { content } = useSiteContent();
  const portfolioCategories = content?.portfolio.categories?.length
    ? content.portfolio.categories
    : defaultSiteContent.portfolio.categories;
  const seriesProjects = content?.series.projects?.length
    ? content.series.projects
    : defaultSiteContent.series.projects;

  const navItems: NavItem[] = baseNavItems.map((item) => {
    if (item.href === "/portfolio") {
      return {
        ...item,
        subItems: portfolioCategories.map((c) => ({
          href: `/portfolio/${c.slug}`,
          label: c.label.toUpperCase(),
        })),
      };
    }
    if (item.href === "/series") {
      return {
        ...item,
        subItems: seriesProjects.map((s) => ({
          href: `/series/${s.slug}`,
          label: s.label,
        })),
      };
    }
    return item;
  });

  useEffect(() => {
    function onResize() {
      if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
        setMobileOpen(false);
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isAdmin || !mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isAdmin, mobileOpen]);

  if (isAdmin) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 flex h-12 items-center justify-between border-b border-charcoal/10 bg-[var(--color-cream)] px-4">
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

  const railFooter = (
    <div className="shrink-0 space-y-1 pt-4">
      <div
        className="mb-4 h-px bg-gradient-to-r from-transparent via-charcoal/[0.08] to-transparent"
        aria-hidden
      />
      <NavSocialLinks
        onNavigate={() => setMobileOpen(false)}
        className="mb-3 pl-0.5"
      />
      <CartNavLink variant="sidebar" onNavigate={() => setMobileOpen(false)} />
      <AuthRail onNavigate={() => setMobileOpen(false)} />
    </div>
  );

  return (
    <>
      {/* Móvil: misma base que el cuerpo (sin borde que marque corte con el contenido) */}
      <header className="fixed inset-x-0 top-0 z-[100] flex h-14 items-center justify-between bg-[var(--color-cream)] px-3 lg:hidden">
        <Link
          href="/"
          className="font-display text-base font-light tracking-tight text-charcoal transition-colors hover:text-accent"
        >
          Ana Harff
        </Link>
        <div className="flex items-center gap-0.5">
          <NavSocialLinks />
          <CartNavLink />
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex size-10 touch-manipulation items-center justify-center rounded-md text-charcoal transition-colors hover:bg-charcoal/[0.06]"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileOpen ? <X className="size-5" strokeWidth={1.75} /> : <Menu className="size-5" strokeWidth={1.75} />}
          </button>
        </div>
      </header>

      {/* Desktop: rail continuo con el fondo (sin línea vertical dura) */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-[90] hidden h-[100dvh] flex-col bg-[var(--color-cream)] lg:flex",
          SITE_NAV_SIDEBAR_WIDTH_CLASS
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-8">
          <Link
            href="/"
            className="mb-8 shrink-0 font-display text-xl font-light tracking-tight text-charcoal transition-colors hover:text-accent"
          >
            Ana Harff
          </Link>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] pr-1">
            <NavRail navItems={navItems} />
          </div>
          {railFooter}
        </div>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[95] bg-charcoal/30 backdrop-blur-[1px] lg:hidden"
              aria-label="Cerrar menú"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "fixed left-0 top-0 z-[100] flex h-[100dvh] max-h-[100dvh] flex-col bg-[var(--color-cream)] shadow-[6px_0_32px_-12px_rgba(26,26,26,0.12)] lg:hidden",
                "w-[min(88vw,17.5rem)] pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
              )}
            >
              <div className="flex min-h-0 flex-1 flex-col px-4">
                <div className="flex items-center justify-between pb-3">
                  <Link
                    href="/"
                    className="font-display text-lg font-light text-charcoal"
                    onClick={() => setMobileOpen(false)}
                  >
                    Menú
                  </Link>
                  <button
                    type="button"
                    className="flex size-9 items-center justify-center rounded-md text-charcoal/70 hover:bg-charcoal/[0.06]"
                    aria-label="Cerrar"
                    onClick={() => setMobileOpen(false)}
                  >
                    <X className="size-5" strokeWidth={1.75} />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4 [-webkit-overflow-scrolling:touch]">
                  <NavRail navItems={navItems} onNavigate={() => setMobileOpen(false)} />
                </div>
                {railFooter}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
