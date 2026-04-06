import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function inputClass() {
  return "mt-1 w-full border border-charcoal/20 bg-cream px-4 py-3 text-charcoal focus:border-charcoal focus:outline-none";
}

export function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium tracking-tight text-charcoal"
    >
      {children}
    </label>
  );
}

export function HelpText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("mt-1 max-w-2xl text-xs leading-relaxed text-stone", className)}>{children}</p>
  );
}

export function PanelTitle({ children }: { children: ReactNode }) {
  return <h2 className="font-display text-2xl font-light text-charcoal">{children}</h2>;
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="border-b border-charcoal/10 pb-2 font-display text-lg font-light text-charcoal">
      {children}
    </h3>
  );
}
