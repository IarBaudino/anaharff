import { cn } from "@/lib/utils";

type Variant = "ornament" | "line" | "double" | "wide";

interface SectionDividerProps {
  className?: string;
  variant?: Variant;
  /** `onDark` para pie u otras superficies charcoal. */
  tone?: "default" | "onDark";
}

/** Separadores editoriales: línea + acento, doble regla o rombo central. */
export function SectionDivider({
  className,
  variant = "ornament",
  tone = "default",
}: SectionDividerProps) {
  const dark = tone === "onDark";

  if (variant === "line") {
    return (
      <div className={cn("w-full", className)} aria-hidden>
        <div
          className={cn(
            "h-px w-full",
            dark ? "bg-cream/18" : "bg-charcoal/18"
          )}
        />
        <div className="mt-1.5 h-0.5 w-28 max-w-[min(40%,12rem)] bg-accent/80" />
      </div>
    );
  }

  if (variant === "double") {
    return (
      <div className={cn("w-full space-y-1", className)} aria-hidden>
        <div
          className={cn("h-px w-full", dark ? "bg-cream/16" : "bg-charcoal/14")}
        />
        <div
          className={cn(
            "h-px w-full",
            dark ? "bg-cream/[0.08]" : "bg-charcoal/[0.07]"
          )}
        />
      </div>
    );
  }

  if (variant === "wide") {
    return (
      <div
        className={cn(
          "flex w-full items-stretch gap-0 overflow-hidden rounded-[1px]",
          className
        )}
        aria-hidden
      >
        <span className="w-1 shrink-0 bg-accent/85" />
        <span
          className={cn(
            "h-px min-h-px flex-1 self-center",
            dark ? "bg-cream/14" : "bg-charcoal/16"
          )}
        />
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center gap-4 md:gap-10", className)}
      aria-hidden
    >
      <span
        className={cn(
          "h-px min-w-[1.5rem] flex-1 bg-gradient-to-r",
          dark
            ? "from-transparent via-cream/22 to-cream/12"
            : "from-transparent via-charcoal/22 to-charcoal/12"
        )}
      />
      <span
        className={cn(
          "relative h-2 w-2 shrink-0 rotate-45 border bg-accent/90",
          dark
            ? "border-cream/35 shadow-[inset_0_0_0_1px_rgba(26,26,26,0.2)]"
            : "border-accent/60 shadow-[inset_0_0_0_1px_rgba(247,245,240,0.15)]"
        )}
      />
      <span
        className={cn(
          "h-px min-w-[1.5rem] flex-1 bg-gradient-to-l",
          dark
            ? "from-transparent via-cream/22 to-cream/12"
            : "from-transparent via-charcoal/22 to-charcoal/12"
        )}
      />
    </div>
  );
}
