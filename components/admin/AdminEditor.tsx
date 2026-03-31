"use client";

import { useState } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";

function inputClass() {
  return "w-full px-4 py-3 border border-charcoal/20 bg-cream focus:border-charcoal focus:outline-none";
}

export function AdminEditor() {
  const { content, setContent, save, saving, loading, error, isFirebaseConfigured } =
    useSiteContent();
  const [message, setMessage] = useState<string | null>(null);

  async function onSave() {
    const res = await save(content);
    if (res.ok) {
      setMessage(
        res.offline
          ? "Guardado local (sin Firebase configurado)."
          : "Guardado correctamente en Firebase."
      );
      return;
    }
    setMessage("No se pudo guardar.");
  }

  if (loading) {
    return <p className="text-stone">Cargando contenido...</p>;
  }

  return (
    <div className="space-y-10">
      {!isFirebaseConfigured && (
        <div className="border border-amber-500/30 bg-amber-100/50 p-4 text-sm text-amber-900">
          Firebase no está configurado en entorno. Podés editar visualmente, pero no se
          persistirá en la nube hasta configurar variables.
        </div>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-2xl">Home</h2>
        <input
          className={inputClass()}
          value={content.home.titulo}
          onChange={(e) =>
            setContent({
              ...content,
              home: { ...content.home, titulo: e.target.value },
            })
          }
          placeholder="Título principal"
        />
        <textarea
          className={inputClass()}
          rows={4}
          value={content.home.parrafoEs}
          onChange={(e) =>
            setContent({
              ...content,
              home: { ...content.home, parrafoEs: e.target.value },
            })
          }
          placeholder="Texto en español"
        />
        <textarea
          className={inputClass()}
          rows={4}
          value={content.home.parrafoEn}
          onChange={(e) =>
            setContent({
              ...content,
              home: { ...content.home, parrafoEn: e.target.value },
            })
          }
          placeholder="Texto en inglés"
        />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">Sobre mí</h2>
        <textarea
          className={inputClass()}
          rows={4}
          value={content.sobreMi.bio1}
          onChange={(e) =>
            setContent({
              ...content,
              sobreMi: { ...content.sobreMi, bio1: e.target.value },
            })
          }
        />
        <textarea
          className={inputClass()}
          rows={4}
          value={content.sobreMi.bio2}
          onChange={(e) =>
            setContent({
              ...content,
              sobreMi: { ...content.sobreMi, bio2: e.target.value },
            })
          }
        />
        <textarea
          className={inputClass()}
          rows={3}
          value={content.sobreMi.sesionTexto}
          onChange={(e) =>
            setContent({
              ...content,
              sobreMi: { ...content.sobreMi, sesionTexto: e.target.value },
            })
          }
        />
      </section>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-8 py-3 bg-charcoal text-cream text-sm tracking-widest uppercase hover:bg-ink transition-colors disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
        {message && <p className="text-sm text-charcoal/80">{message}</p>}
        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}
