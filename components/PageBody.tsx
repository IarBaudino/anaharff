"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";
import { SIDEBAR_PAD, SITE_PAGE_TOP } from "@/lib/layout-constants";

export function PageBody({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isHome = pathname === "/";

  return (
    <>
      <main
        className={cn(
          "min-w-0 flex-1",
          isAdmin ? "pt-12" : cn("bg-[var(--color-cream)]", SIDEBAR_PAD)
        )}
      >
        <div className={cn(!isAdmin && !isHome && SITE_PAGE_TOP)}>{children}</div>
      </main>
      {!isAdmin && <Footer className={SIDEBAR_PAD} />}
    </>
  );
}
