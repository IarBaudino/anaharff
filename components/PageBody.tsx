"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";
import { SIDEBAR_PAD } from "@/lib/layout-constants";

export function PageBody({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      <main
        className={cn(
          "min-w-0 flex-1",
          isAdmin ? "pt-12" : SIDEBAR_PAD
        )}
      >
        {children}
      </main>
      {!isAdmin && <Footer className={SIDEBAR_PAD} />}
    </>
  );
}
