"use client";

import { useId, useRef, useState, type ChangeEvent } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { auth, isFirebaseConfigured } from "@/lib/firebase-client";
import { useAuth } from "@/components/AuthProvider";
import { useAdminPanelUi } from "@/components/admin/admin-panel-ui";
import { deleteStoredImageByUrl } from "@/lib/storage-client";

type Props = {
  // eslint-disable-next-line no-unused-vars
  onUploaded: (publicUrl: string) => void;
  disabled?: boolean;
  previewUrl?: string | null;
  /** Si es true, al subir una nueva imagen intenta borrar la anterior en Storage. */
  autoDeletePrevious?: boolean;
  multiple?: boolean;
  /** Subcarpeta lógica dentro de `anaharff/` (tienda, portfolio, series, home, blog). */
  folder?: string;
  variant?: "default" | "compact";
};

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_UPLOAD_MB_LABEL = "4 MB";
const MAX_IMAGE_DIMENSION = 1800;

async function readImageSize(file: File): Promise<{ width: number; height: number }> {
  const src = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("No se pudo leer la imagen"));
      el.src = src;
    });
    return { width: img.naturalWidth, height: img.naturalHeight };
  } finally {
    URL.revokeObjectURL(src);
  }
}

async function compressImageToLimit(file: File, maxBytes: number): Promise<File | null> {
  if (file.type === "image/gif" || file.type === "image/avif") return null;
  if (!file.type.startsWith("image/")) return null;

  const src = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("No se pudo procesar la imagen"));
      el.src = src;
    });

    const longest = Math.max(img.naturalWidth, img.naturalHeight);
    const scale = longest > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / longest : 1;
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, width, height);

    const qualities = [0.82, 0.7, 0.58, 0.46];
    for (const q of qualities) {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", q)
      );
      if (!blob) continue;
      if (blob.size <= maxBytes) {
        const baseName = file.name.replace(/\.[^.]+$/, "");
        return new File([blob], `${baseName}.jpg`, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
      }
    }
    return null;
  } finally {
    URL.revokeObjectURL(src);
  }
}

export function StorageUploadField({
  onUploaded,
  disabled = false,
  previewUrl,
  autoDeletePrevious = false,
  multiple = false,
  folder = "uploads",
  variant = "default",
}: Props) {
  const { confirmDelete } = useAdminPanelUi();
  const { user, ready } = useAuth();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const isCompact = variant === "compact";
  const preview = previewUrl?.trim() ?? "";

  async function uploadOneFile(file: File, idToken: string): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await fetch("/api/storage/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}` },
      body: fd,
    });
    let data: { error?: string; publicUrl?: string } = {};
    try {
      data = (await res.json()) as { error?: string; publicUrl?: string };
    } catch {
      setErr("La respuesta del servidor no es válida. Probá de nuevo.");
      return null;
    }
    if (!res.ok) {
      const base = data.error || "Error al subir";
      setErr(
        res.status === 503
          ? `${base} Revisá NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local (local) o en Vercel (producción), y reiniciá el servidor.`
          : base
      );
      return null;
    }
    const url = String(data.publicUrl || "").trim();
    if (!url) {
      setErr("El servidor no devolvió la URL de la imagen. Revisá Supabase Storage.");
      return null;
    }
    return url;
  }

  function openFilePicker() {
    setErr(null);
    if (disabled) {
      setErr(
        multiple
          ? "No podés subir más imágenes ahora (límite alcanzado o guardado en curso)."
          : "Esperá a que termine de guardar y volvé a intentar."
      );
      return;
    }
    if (loading) return;
    if (!isFirebaseConfigured || !auth) {
      setErr("Falta configuración para subir archivos. Contactá a quien administra el sitio.");
      return;
    }
    if (!ready) {
      setErr("Esperá un momento a que cargue la sesión y tocá de nuevo «Subir imagen».");
      return;
    }
    if (!user) {
      setErr("Tenés que iniciar sesión como administradora para subir imágenes.");
      return;
    }
    inputRef.current?.click();
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const picked = Array.from(input.files ?? []);
    input.value = "";
    if (!picked.length) return;

    if (disabled || loading) {
      setErr("No se pudo subir: esperá a que termine de guardar o a la subida anterior.");
      return;
    }

    const list = multiple ? picked : [picked[0]];
    if (!isFirebaseConfigured || !auth) {
      setErr("Falta configuración para subir archivos.");
      return;
    }
    if (!ready || !user) {
      setErr("Sesión no disponible. Recargá la página e iniciá sesión de nuevo.");
      return;
    }

    setErr(null);
    setLoading(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        setErr("Sesión inválida. Volvé a entrar al panel.");
        return;
      }

      const prevUrl = previewUrl?.trim() ?? "";
      let first = true;

      for (const rawFile of list) {
        let fileToUpload = rawFile;
        if (rawFile.size > MAX_UPLOAD_BYTES) {
          const compressed = await compressImageToLimit(rawFile, MAX_UPLOAD_BYTES);
          if (!compressed) {
            const dims = await readImageSize(rawFile).catch(() => null);
            const details = dims ? ` (${dims.width}x${dims.height})` : "";
            setErr(
              `La imagen «${rawFile.name}» pesa más de ${MAX_UPLOAD_MB_LABEL}${details}. No se pudo comprimir automáticamente; exportala más liviana.`
            );
            return;
          }
          fileToUpload = compressed;
        }

        const nextUrl = await uploadOneFile(fileToUpload, idToken);
        if (!nextUrl) return;

        if (!multiple && autoDeletePrevious && first && prevUrl && prevUrl !== nextUrl) {
          await deleteStoredImageByUrl(prevUrl);
        }
        first = false;
        onUploaded(nextUrl);
      }
    } catch {
      setErr("Error de red al subir");
    } finally {
      setLoading(false);
    }
  }

  async function onRemoveImage() {
    const prevUrl = previewUrl?.trim() ?? "";
    if (!prevUrl) return;
    if (
      !(await confirmDelete({
        detail: isCompact
          ? "Vas a quitar esta imagen de la galería."
          : "Vas a quitar esta imagen.",
        deletesStoredImages: true,
      }))
    ) {
      return;
    }
    setErr(null);
    setLoading(true);
    try {
      await deleteStoredImageByUrl(prevUrl);
      onUploaded("");
    } catch {
      setErr("No se pudo quitar la imagen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="sr-only"
        tabIndex={-1}
        multiple={multiple}
        onChange={onFile}
      />
      <button
        type="button"
        onClick={openFilePicker}
        aria-busy={loading}
        aria-controls={inputId}
        className={cn(
          "inline-flex items-center gap-2 rounded border border-charcoal/20 px-3 py-2 text-xs uppercase tracking-widest transition-colors hover:border-charcoal/35",
          (loading || disabled) && "opacity-60"
        )}
      >
        <Upload size={14} className="shrink-0" />
        {loading
          ? "Subiendo…"
          : multiple
            ? isCompact
              ? "Sumar fotos"
              : "Subir varias"
            : isCompact
              ? "Reemplazar"
              : "Subir imagen"}
      </button>
      {err ? (
        <p className="text-xs text-red-700" role="alert">
          {err}
        </p>
      ) : null}
      {!ready && isFirebaseConfigured && auth ? (
        <p className="text-xs text-stone">Comprobando sesión…</p>
      ) : null}
      {ready && !user && isFirebaseConfigured && auth ? (
        <p className="text-xs text-amber-900">Iniciá sesión para subir archivos.</p>
      ) : null}
      {!isCompact ? (
        <p className="text-xs text-stone">
          JPG, PNG, WebP, GIF o AVIF · máximo {MAX_UPLOAD_MB_LABEL}
          {multiple ? " · podés elegir varias a la vez" : ""}
        </p>
      ) : null}
      {preview ? (
        <div className={isCompact ? "mt-2 space-y-2" : "mt-3 space-y-1.5"}>
          {!isCompact ? (
            <p className="text-xs font-medium tracking-wide text-charcoal/80">Vista previa</p>
          ) : null}
          <div
            className={
              isCompact
                ? "max-w-full overflow-hidden rounded-md border border-charcoal/12 bg-charcoal/[0.03]"
                : "inline-block max-w-full overflow-hidden rounded-lg border border-charcoal/15 bg-cream/60 p-2"
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt=""
              className={
                isCompact
                  ? "mx-auto block max-h-28 w-full max-w-[200px] object-cover"
                  : "max-h-64 w-auto max-w-full object-contain"
              }
            />
          </div>
          {!isCompact ? (
            <p className="text-xs text-stone">Podés subir otra imagen para reemplazarla.</p>
          ) : (
            <p className="text-xs text-stone">Otra foto reemplaza esta en la galería.</p>
          )}
          <button
            type="button"
            onClick={onRemoveImage}
            disabled={loading || !user}
            className="inline-flex items-center rounded border border-charcoal/20 px-2.5 py-1.5 text-xs tracking-wide text-charcoal/90 transition-colors hover:bg-charcoal/5 disabled:opacity-50"
          >
            {isCompact ? "Quitar de la galería" : "Quitar imagen"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** @deprecated Usar StorageUploadField */
export const CloudinaryUploadField = StorageUploadField;
