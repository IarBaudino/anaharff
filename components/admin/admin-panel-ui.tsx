"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

export const ADMIN_SAVE_SUCCESS = "Cambios guardados";

export type ConfirmOptions = {
  detail: string;
  /** Si true, avisa que las imágenes se borran del almacenamiento. */
  deletesStoredImages?: boolean;
  /** @deprecated usar deletesStoredImages */
  deletesCloudinaryImages?: boolean;
};

function confirmDeleteStub(opts: ConfirmOptions): Promise<boolean> {
  void opts;
  return Promise.resolve(false);
}

export type ConfirmDeleteFn = typeof confirmDeleteStub;

function booleanCallbackStub(flag: boolean): void {
  void flag;
}

type BooleanCallback = typeof booleanCallbackStub;

type AdminPanelUiContextValue = {
  confirmDelete: ConfirmDeleteFn;
};

const AdminPanelUiContext = createContext<AdminPanelUiContextValue | null>(null);

export function AdminPanelUiProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<{
    detail: string;
    deletesStoredImages: boolean;
    resolve: BooleanCallback;
  } | null>(null);

  const confirmDelete = useCallback<ConfirmDeleteFn>(
    ({ detail, deletesStoredImages, deletesCloudinaryImages }) => {
      const warnDelete = deletesStoredImages ?? deletesCloudinaryImages ?? true;
      return new Promise<boolean>((resolve) => {
        setPending({ detail, deletesStoredImages: warnDelete, resolve });
      });
    },
    []
  );

  const finish = (accepted: boolean) => {
    pending?.resolve(accepted);
    setPending(null);
  };

  return (
    <AdminPanelUiContext.Provider value={{ confirmDelete }}>
      {children}
      {pending ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-charcoal/40 p-4"
          role="presentation"
          onClick={() => finish(false)}
        >
          <div
            role="alertdialog"
            aria-labelledby="admin-confirm-title"
            aria-describedby="admin-confirm-desc"
            className="w-full max-w-md rounded-xl border border-charcoal/15 bg-cream p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="admin-confirm-title"
              className="font-display text-xl font-light text-charcoal"
            >
              ¿Confirmar eliminación?
            </h2>
            <p id="admin-confirm-desc" className="mt-3 text-sm leading-relaxed text-charcoal/90">
              {pending.detail}
            </p>
            {pending.deletesStoredImages ? (
              <p className="mt-3 rounded-lg border border-amber-200/90 bg-amber-50 px-3 py-2.5 text-sm text-amber-950">
                Las imágenes asociadas también se eliminarán del almacenamiento. Esta acción no se
                puede deshacer.
              </p>
            ) : (
              <p className="mt-3 text-xs text-stone">Esta acción no se puede deshacer.</p>
            )}
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => finish(false)}
                className="rounded-full border border-charcoal/20 px-4 py-2 text-sm text-charcoal transition-colors hover:bg-charcoal/5"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => finish(true)}
                className="rounded-full bg-red-800 px-4 py-2 text-sm text-cream transition-colors hover:bg-red-900"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminPanelUiContext.Provider>
  );
}

export function useAdminPanelUi(): AdminPanelUiContextValue {
  const ctx = useContext(AdminPanelUiContext);
  if (!ctx) {
    throw new Error("useAdminPanelUi debe usarse dentro de AdminPanelUiProvider");
  }
  return ctx;
}

type AdminPanelNoticeProps = {
  variant: "success" | "error" | "info";
  children: ReactNode;
  className?: string;
};

export function AdminPanelNotice({ variant, children, className }: AdminPanelNoticeProps) {
  return (
    <div
      role="status"
      className={cn(
        "rounded-lg border px-4 py-3 text-sm font-medium shadow-sm",
        variant === "success" &&
          "border-emerald-300/80 bg-emerald-50 text-emerald-950",
        variant === "error" && "border-red-200 bg-red-50 text-red-900",
        variant === "info" && "border-charcoal/15 bg-cream/90 text-charcoal",
        className
      )}
    >
      {children}
    </div>
  );
}

export function adminNoticeVariant(
  message: string | null,
  errorPhrases: string[] = ["No se pudo", "Revisá"]
): "success" | "error" | "info" | null {
  if (!message) return null;
  if (message === ADMIN_SAVE_SUCCESS || message.includes("guardad")) {
    return "success";
  }
  if (errorPhrases.some((p) => message.includes(p))) {
    return "error";
  }
  return "info";
}
