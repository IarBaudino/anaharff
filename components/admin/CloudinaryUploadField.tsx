"use client";

import { useState, type ChangeEvent } from "react";
import { Upload } from "lucide-react";
import { auth, isFirebaseConfigured } from "@/lib/firebase-client";
import { useAuth } from "@/components/AuthProvider";

type Props = {
  // eslint-disable-next-line no-unused-vars
  onUploaded: (secureUrl: string) => void;
  disabled?: boolean;
};

export function CloudinaryUploadField({ onUploaded, disabled }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!isFirebaseConfigured || !auth || !user) {
      setErr("Tenés que estar logueada/o como admin.");
      return;
    }

    setErr(null);
    setLoading(true);
    try {
      const idToken = await auth?.currentUser?.getIdToken();
      if (!idToken) {
        setErr("Sesión inválida. Volvé a entrar al panel.");
        return;
      }

      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/cloudinary/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "Error al subir");
        return;
      }
      onUploaded(data.secureUrl as string);
    } catch {
      setErr("Error de red al subir");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <label className="inline-flex items-center gap-2 cursor-pointer w-fit">
        <span className="inline-flex items-center gap-2 rounded border border-charcoal/20 px-3 py-2 text-xs tracking-widest uppercase hover:border-charcoal/35 transition-colors">
          <Upload size={14} />
          {loading ? "Subiendo…" : "Subir a Cloudinary"}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          className="sr-only"
          disabled={disabled || loading || !user}
          onChange={onFile}
        />
      </label>
      {err && <p className="text-xs text-red-700">{err}</p>}
      <p className="text-xs text-stone">
        JPG, PNG, WebP, GIF o AVIF · máx. 12 MB · carpeta en Cloudinary:{" "}
        <code className="text-[11px]">anaharff/tienda</code> (o{" "}
        <code className="text-[11px]">CLOUDINARY_UPLOAD_FOLDER</code>)
      </p>
    </div>
  );
}
