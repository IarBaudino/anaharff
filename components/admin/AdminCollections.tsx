"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteContent } from "@/hooks/useSiteContent";
import {
  newManagedItemId,
  slugifyLabel,
  type PortfolioCategory,
  type SeriesProject,
  type SiteContent,
} from "@/lib/site-content";

const VALIDATION_SUMMARY =
  "Revisá los avisos en rojo antes de guardar: nombre vacío, enlace vacío o enlace repetido.";

function inputClass() {
  return "w-full rounded-xl border border-charcoal/20 bg-cream px-4 py-3 focus:border-charcoal focus:outline-none";
}

type RowErrors = { label?: string; slug?: string };

type FieldErrorsState = {
  portfolio: Record<string, RowErrors>;
  series: Record<string, RowErrors>;
};

export function AdminCollections() {
  const { content, setContent, save, saving, loading, error } = useSiteContent();
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorsState>({
    portfolio: {},
    series: {},
  });

  function clearAllFieldErrors() {
    setFieldErrors({ portfolio: {}, series: {} });
  }

  async function onSave() {
    setMessage(null);
    const normalized: SiteContent = {
      ...content,
      portfolio: {
        categories: content.portfolio.categories.map((c) => ({
          ...c,
          label: c.label.trim(),
          slug: slugifyLabel(c.slug),
          description: c.description.trim(),
        })),
      },
      series: {
        projects: content.series.projects.map((p) => ({
          ...p,
          label: p.label.trim(),
          slug: slugifyLabel(p.slug),
          statement: p.statement.trim(),
          description: p.description.trim(),
        })),
      },
    };

    const validation = validateCollections(normalized);
    setFieldErrors({ portfolio: validation.portfolio, series: validation.series });

    if (!validation.ok) {
      setMessage(VALIDATION_SUMMARY);
      return;
    }

    clearAllFieldErrors();
    const res = await save(normalized);
    if (res.ok) {
      setMessage(res.offline ? "Guardado local." : "Cambios guardados y publicados.");
      return;
    }
    setMessage("No se pudo guardar.");
  }

  if (loading) return <p className="text-stone">Cargando contenido...</p>;

  return (
    <div className="space-y-10">
      {(Object.keys(fieldErrors.portfolio).length > 0 || Object.keys(fieldErrors.series).length > 0) && (
        <div className="rounded-lg border border-red-200 bg-red-50/80 p-4 text-sm text-red-900">
          <p className="font-medium">Revisá los campos marcados antes de guardar.</p>
          <p className="mt-1 text-red-800/90">
            Cada categoría y cada serie necesita un nombre y un enlace único (solo letras, números y
            guiones).
          </p>
        </div>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-2xl">Portfolio</h2>
        <p className="text-sm text-stone">
          Estas categorías aparecen en la página Portfolio y en el submenú superior.
        </p>

        <div className="space-y-4">
          {content.portfolio.categories.map((cat, idx) => {
            const err = fieldErrors.portfolio[cat.id];
            return (
            <div key={cat.id} className="space-y-3 rounded-lg border border-charcoal/10 bg-cream/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs uppercase tracking-widest text-stone">
                  Categoría {idx + 1}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      clearAllFieldErrors();
                      moveCategory(-1, idx, content, setContent);
                    }}
                    disabled={idx === 0}
                    className="rounded border border-charcoal/20 p-1.5 disabled:opacity-40"
                    aria-label="Subir categoría"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearAllFieldErrors();
                      moveCategory(1, idx, content, setContent);
                    }}
                    disabled={idx === content.portfolio.categories.length - 1}
                    className="rounded border border-charcoal/20 p-1.5 disabled:opacity-40"
                    aria-label="Bajar categoría"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearAllFieldErrors();
                      removeCategory(idx, content, setContent);
                    }}
                    className="rounded border border-charcoal/20 p-1.5 text-red-700"
                    aria-label="Eliminar categoría"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <input
                  className={cn(inputClass(), err?.label && "border-red-500")}
                  value={cat.label}
                  onChange={(e) => {
                    clearAllFieldErrors();
                    updateCategory(idx, { label: e.target.value }, content, setContent);
                  }}
                  placeholder="Nombre visible"
                />
                {err?.label && <p className="mt-1 text-xs text-red-700">{err.label}</p>}
              </div>
              <div>
                <input
                  className={cn(inputClass(), err?.slug && "border-red-500")}
                  value={cat.slug}
                  onChange={(e) => {
                    clearAllFieldErrors();
                    updateCategory(idx, { slug: slugifyLabel(e.target.value) }, content, setContent);
                  }}
                  placeholder="URL (slug): familia, retratos, etc."
                />
                {err?.slug && <p className="mt-1 text-xs text-red-700">{err.slug}</p>}
              </div>
              <textarea
                className={inputClass()}
                rows={2}
                value={cat.description}
                onChange={(e) => {
                  clearAllFieldErrors();
                  updateCategory(idx, { description: e.target.value }, content, setContent);
                }}
                placeholder="Descripción corta para SEO"
              />
            </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            clearAllFieldErrors();
            addCategory(content, setContent);
          }}
          className="inline-flex items-center gap-2 rounded border border-charcoal/25 px-4 py-2 text-sm hover:bg-charcoal/5"
        >
          <Plus className="size-4" />
          Añadir categoría
        </button>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">Series</h2>
        <p className="text-sm text-stone">
          Estos proyectos aparecen en la pestaña Series y en su submenú.
        </p>

        <div className="space-y-4">
          {content.series.projects.map((project, idx) => {
            const err = fieldErrors.series[project.id];
            return (
            <div
              key={project.id}
              className="space-y-3 rounded-lg border border-charcoal/10 bg-cream/60 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs uppercase tracking-widest text-stone">Serie {idx + 1}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      clearAllFieldErrors();
                      moveProject(-1, idx, content, setContent);
                    }}
                    disabled={idx === 0}
                    className="rounded border border-charcoal/20 p-1.5 disabled:opacity-40"
                    aria-label="Subir serie"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearAllFieldErrors();
                      moveProject(1, idx, content, setContent);
                    }}
                    disabled={idx === content.series.projects.length - 1}
                    className="rounded border border-charcoal/20 p-1.5 disabled:opacity-40"
                    aria-label="Bajar serie"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearAllFieldErrors();
                      removeProject(idx, content, setContent);
                    }}
                    className="rounded border border-charcoal/20 p-1.5 text-red-700"
                    aria-label="Eliminar serie"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <input
                  className={cn(inputClass(), err?.label && "border-red-500")}
                  value={project.label}
                  onChange={(e) => {
                    clearAllFieldErrors();
                    updateProject(idx, { label: e.target.value }, content, setContent);
                  }}
                  placeholder="Nombre visible"
                />
                {err?.label && <p className="mt-1 text-xs text-red-700">{err.label}</p>}
              </div>
              <div>
                <input
                  className={cn(inputClass(), err?.slug && "border-red-500")}
                  value={project.slug}
                  onChange={(e) => {
                    clearAllFieldErrors();
                    updateProject(idx, { slug: slugifyLabel(e.target.value) }, content, setContent);
                  }}
                  placeholder="URL (slug): unica, ser-gorda..."
                />
                {err?.slug && <p className="mt-1 text-xs text-red-700">{err.slug}</p>}
              </div>
              <textarea
                className={inputClass()}
                rows={3}
                value={project.statement}
                onChange={(e) => {
                  clearAllFieldErrors();
                  updateProject(idx, { statement: e.target.value }, content, setContent);
                }}
                placeholder="Statement visible debajo del título"
              />
              <textarea
                className={inputClass()}
                rows={2}
                value={project.description}
                onChange={(e) => {
                  clearAllFieldErrors();
                  updateProject(idx, { description: e.target.value }, content, setContent);
                }}
                placeholder="Descripción corta para SEO"
              />
            </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            clearAllFieldErrors();
            addProject(content, setContent);
          }}
          className="inline-flex items-center gap-2 rounded border border-charcoal/25 px-4 py-2 text-sm hover:bg-charcoal/5"
        >
          <Plus className="size-4" />
          Añadir serie
        </button>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="bg-charcoal px-8 py-3 text-sm uppercase tracking-widest text-cream transition-colors hover:bg-ink disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
        {message && (
          <p
            className={cn(
              "text-sm",
              message === VALIDATION_SUMMARY || message === "No se pudo guardar."
                ? "text-red-800"
                : "text-charcoal/80"
            )}
          >
            {message}
          </p>
        )}
        {error && <p className="text-sm text-red-700">{error}</p>}
      </div>
    </div>
  );
}

function validateCollections(content: SiteContent): {
  ok: boolean;
  portfolio: Record<string, RowErrors>;
  series: Record<string, RowErrors>;
} {
  const portfolio: Record<string, RowErrors> = {};
  const series: Record<string, RowErrors> = {};

  function setPort(id: string, patch: RowErrors) {
    portfolio[id] = { ...portfolio[id], ...patch };
  }
  function setSer(id: string, patch: RowErrors) {
    series[id] = { ...series[id], ...patch };
  }

  for (const cat of content.portfolio.categories) {
    if (!cat.label.trim()) {
      setPort(cat.id, { label: "Falta el nombre visible." });
    }
    if (!cat.slug.trim()) {
      setPort(cat.id, { slug: "Falta el enlace de la URL (ej. familia, retratos)." });
    }
  }

  const portSlugMap = new Map<string, string[]>();
  for (const cat of content.portfolio.categories) {
    const s = cat.slug.trim();
    if (!s) continue;
    const list = portSlugMap.get(s) ?? [];
    list.push(cat.id);
    portSlugMap.set(s, list);
  }
  for (const ids of portSlugMap.values()) {
    if (ids.length > 1) {
      for (const id of ids) {
        setPort(id, { slug: "Este enlace ya lo usa otra categoría. Cambiá uno de los dos." });
      }
    }
  }

  for (const p of content.series.projects) {
    if (!p.label.trim()) {
      setSer(p.id, { label: "Falta el nombre visible." });
    }
    if (!p.slug.trim()) {
      setSer(p.id, { slug: "Falta el enlace de la URL (ej. unica, ser-gorda)." });
    }
  }

  const serSlugMap = new Map<string, string[]>();
  for (const p of content.series.projects) {
    const s = p.slug.trim();
    if (!s) continue;
    const list = serSlugMap.get(s) ?? [];
    list.push(p.id);
    serSlugMap.set(s, list);
  }
  for (const ids of serSlugMap.values()) {
    if (ids.length > 1) {
      for (const id of ids) {
        setSer(id, { slug: "Este enlace ya lo usa otra serie. Cambiá uno de los dos." });
      }
    }
  }

  const hasRowErrors = (rec: Record<string, RowErrors>) =>
    Object.values(rec).some((e) => Boolean(e.label || e.slug));

  return {
    ok: !hasRowErrors(portfolio) && !hasRowErrors(series),
    portfolio,
    series,
  };
}

function updateCategory(
  idx: number,
  patch: Partial<PortfolioCategory>,
  content: ReturnType<typeof useSiteContent>["content"],
  // eslint-disable-next-line no-unused-vars
  setContent: (next: ReturnType<typeof useSiteContent>["content"]) => void
) {
  const next = [...content.portfolio.categories];
  next[idx] = { ...next[idx], ...patch };
  setContent({ ...content, portfolio: { ...content.portfolio, categories: next } });
}

function updateProject(
  idx: number,
  patch: Partial<SeriesProject>,
  content: ReturnType<typeof useSiteContent>["content"],
  // eslint-disable-next-line no-unused-vars
  setContent: (next: ReturnType<typeof useSiteContent>["content"]) => void
) {
  const next = [...content.series.projects];
  next[idx] = { ...next[idx], ...patch };
  setContent({ ...content, series: { ...content.series, projects: next } });
}

function addCategory(
  content: ReturnType<typeof useSiteContent>["content"],
  // eslint-disable-next-line no-unused-vars
  setContent: (next: ReturnType<typeof useSiteContent>["content"]) => void
) {
  const next = [...content.portfolio.categories];
  next.push({
    id: newManagedItemId("cat"),
    slug: `categoria-${next.length + 1}`,
    label: `Nueva categoría ${next.length + 1}`,
    description: "",
  });
  setContent({ ...content, portfolio: { ...content.portfolio, categories: next } });
}

function addProject(
  content: ReturnType<typeof useSiteContent>["content"],
  // eslint-disable-next-line no-unused-vars
  setContent: (next: ReturnType<typeof useSiteContent>["content"]) => void
) {
  const next = [...content.series.projects];
  next.push({
    id: newManagedItemId("series"),
    slug: `serie-${next.length + 1}`,
    label: `Nueva serie ${next.length + 1}`,
    statement: "",
    description: "",
  });
  setContent({ ...content, series: { ...content.series, projects: next } });
}

function removeCategory(
  idx: number,
  content: ReturnType<typeof useSiteContent>["content"],
  // eslint-disable-next-line no-unused-vars
  setContent: (next: ReturnType<typeof useSiteContent>["content"]) => void
) {
  const next = content.portfolio.categories.filter((_, i) => i !== idx);
  setContent({ ...content, portfolio: { ...content.portfolio, categories: next } });
}

function removeProject(
  idx: number,
  content: ReturnType<typeof useSiteContent>["content"],
  // eslint-disable-next-line no-unused-vars
  setContent: (next: ReturnType<typeof useSiteContent>["content"]) => void
) {
  const next = content.series.projects.filter((_, i) => i !== idx);
  setContent({ ...content, series: { ...content.series, projects: next } });
}

function moveCategory(
  direction: -1 | 1,
  idx: number,
  content: ReturnType<typeof useSiteContent>["content"],
  // eslint-disable-next-line no-unused-vars
  setContent: (next: ReturnType<typeof useSiteContent>["content"]) => void
) {
  const next = [...content.portfolio.categories];
  const to = idx + direction;
  if (to < 0 || to >= next.length) return;
  [next[idx], next[to]] = [next[to], next[idx]];
  setContent({ ...content, portfolio: { ...content.portfolio, categories: next } });
}

function moveProject(
  direction: -1 | 1,
  idx: number,
  content: ReturnType<typeof useSiteContent>["content"],
  // eslint-disable-next-line no-unused-vars
  setContent: (next: ReturnType<typeof useSiteContent>["content"]) => void
) {
  const next = [...content.series.projects];
  const to = idx + direction;
  if (to < 0 || to >= next.length) return;
  [next[idx], next[to]] = [next[to], next[idx]];
  setContent({ ...content, series: { ...content.series, projects: next } });
}
