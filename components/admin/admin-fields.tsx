import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
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

/** Texto de ejemplo debajo del hint (también sirve como placeholder del campo). */
export function FieldExample({ children }: { children: ReactNode }) {
  return (
    <p className="mt-0.5 text-[11px] italic leading-snug text-stone/85">
      Ejemplo: {children}
    </p>
  );
}

type AdminFieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  example?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function AdminField({
  label,
  htmlFor,
  hint,
  example,
  error,
  children,
  className,
}: AdminFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      {hint ? <HelpText className="!mt-0">{hint}</HelpText> : null}
      {example ? <FieldExample>{example}</FieldExample> : null}
      {children}
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}

type AdminInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  example?: string;
  error?: string;
};

export function AdminInput({
  label,
  hint,
  example,
  error,
  id,
  className,
  placeholder,
  ...props
}: AdminInputProps) {
  return (
    <AdminField label={label} htmlFor={id} hint={hint} example={example} error={error}>
      <input
        id={id}
        className={cn(inputClass(), error && "border-red-500", className)}
        placeholder={placeholder ?? (typeof example === "string" ? example : undefined)}
        {...props}
      />
    </AdminField>
  );
}

type AdminTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: string;
  example?: string;
  error?: string;
};

export function AdminTextarea({
  label,
  hint,
  example,
  error,
  id,
  className,
  placeholder,
  rows = 3,
  ...props
}: AdminTextareaProps) {
  return (
    <AdminField label={label} htmlFor={id} hint={hint} example={example} error={error}>
      <textarea
        id={id}
        rows={rows}
        className={cn(inputClass(), error && "border-red-500", className)}
        placeholder={placeholder ?? (typeof example === "string" ? example : undefined)}
        {...props}
      />
    </AdminField>
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
