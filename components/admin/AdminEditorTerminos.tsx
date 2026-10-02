"use client";

import { useState } from "react";
import {
  ADMIN_SAVE_SUCCESS,
  AdminPanelNotice,
  adminNoticeVariant,
} from "@/components/admin/admin-panel-ui";
import { AdminInput, AdminTextarea, HelpText, PanelTitle } from "@/components/admin/admin-fields";
import { useSiteContent } from "@/hooks/useSiteContent";

export function AdminEditorTerminos() {
  const { content, setContent, save, saving, loading, error, isFirebaseConfigured } =
    useSiteContent();
  const [message, setMessage] = useState<string | null>(null);

  async function onSave() {
    const res = await save(content);
    setMessage(res.ok ? (res.offline ? "Cambios guardados (solo en este navegador)." : ADMIN_SAVE_SUCCESS) : "No se pudo guardar.");
  }

  if (loading) return <p className="text-stone">Cargando términos...</p>;

  const noticeVariant = adminNoticeVariant(message);

  return (
    <div className="space-y-6">
      {message && noticeVariant ? (
        <AdminPanelNotice variant={noticeVariant}>{message}</AdminPanelNotice>
      ) : null}
      {!isFirebaseConfigured ? (
        <div className="border border-amber-500/30 bg-amber-100/50 p-4 text-sm text-amber-900">
          Podés editar aquí, pero los cambios no se publican hasta configurar Firebase.
        </div>
      ) : null}
      <section className="space-y-4">
        <PanelTitle>Términos y condiciones</PanelTitle>
        <HelpText>
          Este texto se publica en <strong>/terminos</strong>. Podés escribirlo como quieras: títulos,
          párrafos y saltos de línea se ven igual en la página.
        </HelpText>
        <AdminInput
          id="terminos-titulo"
          label="Título de la página"
          value={content.legal.terminosTitulo}
          onChange={(e) =>
            setContent({
              ...content,
              legal: { ...content.legal, terminosTitulo: e.target.value },
            })
          }
        />
        <AdminTextarea
          id="terminos-cuerpo"
          label="Texto"
          rows={18}
          value={content.legal.terminosCuerpo}
          onChange={(e) =>
            setContent({
              ...content,
              legal: { ...content.legal, terminosCuerpo: e.target.value },
            })
          }
        />
      </section>
      <button
        type="button"
        onClick={() => void onSave()}
        disabled={saving}
        className="bg-charcoal px-8 py-3 text-sm uppercase tracking-widest text-cream transition-colors hover:bg-ink disabled:opacity-50"
      >
        {saving ? "Guardando..." : "Guardar términos"}
      </button>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
