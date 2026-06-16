"use client";

import { useEffect, useState } from "react";

type Status = {
  configured: boolean;
  hint: string | null;
};

export function AdminStorageStatus() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/storage/status")
      .then((res) => res.json() as Promise<Status>)
      .then((data) => {
        if (!cancelled) setStatus(data);
      })
      .catch(() => {
        if (!cancelled) setStatus({ configured: false, hint: "No se pudo comprobar el servidor." });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!status || status.configured) return null;

  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  return (
    <div className="mb-8 border border-amber-500/35 bg-amber-50/90 p-4 text-sm text-amber-950">
      <p className="font-medium">Subida de imágenes no disponible en este entorno</p>
      <p className="mt-2 leading-relaxed">
        {status.hint} Portfolio, portada del inicio y tienda usan la misma API (
        <code className="text-xs">/api/storage/upload</code>).
      </p>
      {isLocal ? (
        <p className="mt-2 leading-relaxed">
          Si las variables están en <strong>Vercel</strong>, en local no aplican solas. Opciones: entrá al
          admin en la <strong>web publicada</strong> (tu dominio en Vercel), o copiá las variables con{" "}
          <code className="text-xs">vercel env pull .env.local</code> y reiniciá{" "}
          <code className="text-xs">npm run dev</code>.
        </p>
      ) : (
        <p className="mt-2 leading-relaxed">
          Estás en el sitio publicado pero el servidor no ve Supabase. Revisá en Vercel → Settings →
          Environment Variables que existan{" "}
          <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
          <code className="text-xs">SUPABASE_SERVICE_ROLE_KEY</code> (marcadas para{" "}
          <strong>Production</strong>) y hacé un <strong>Redeploy</strong>.
        </p>
      )}
    </div>
  );
}
