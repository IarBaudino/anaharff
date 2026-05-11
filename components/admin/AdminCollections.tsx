"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteContent } from "@/hooks/useSiteContent";
import {
  newManagedItemId,
  slugifyLabel,
  type PortfolioCategory,
  type PortfolioSubcategory,
  type SeriesProject,
  type SeriesSubcategory,
  type SiteContent,
} from "@/lib/site-content";
import { CloudinaryUploadField } from "@/components/admin/CloudinaryUploadField";
import { HelpText } from "@/components/admin/admin-fields";

const VALIDATION_SUMMARY =
  "Revisá los avisos en rojo antes de guardar: nombre vacío, enlace vacío o enlace repetido.";

function inputClass() {
  return "w-full rounded-xl border border-charcoal/20 bg-cream px-4 py-3 focus:border-charcoal focus:outline-none";
}

type RowErrors = { label?: string; slug?: string };

type FieldErrorsState = {
  portfolio: Record<string, RowErrors>;
  portfolioSub: Record<string, RowErrors>;
  series: Record<string, RowErrors>;
  seriesSub: Record<string, RowErrors>;
};

function subErrKey(parentId: string, subId: string) {
  return `${parentId}::${subId}`;
}

export function AdminCollections() {
  const { content, setContent, save, saving, loading, error } = useSiteContent();
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrorsState>({
    portfolio: {},
    portfolioSub: {},
    series: {},
    seriesSub: {},
  });

  function clearAllFieldErrors() {
    setFieldErrors({ portfolio: {}, portfolioSub: {}, series: {}, seriesSub: {} });
  }

  function markPendingPublish() {
    setMessage(
      "Imagen en el panel: tocá «Guardar categoría» / «Guardar serie» abajo del bloque, o «Guardar cambios» al final, para publicarla."
    );
  }

  const [portfolioCatOpen, setPortfolioCatOpen] = useState<Record<string, boolean>>({});
  const [portfolioSubOpen, setPortfolioSubOpen] = useState<Record<string, boolean>>({});
  const [seriesProjOpen, setSeriesProjOpen] = useState<Record<string, boolean>>({});
  const [seriesSubOpen, setSeriesSubOpen] = useState<Record<string, boolean>>({});

  function buildNormalizedContent(): SiteContent {
    return {
      ...content,
      portfolio: {
        categories: content.portfolio.categories.map((c) => ({
          ...c,
          label: c.label.trim(),
          slug: slugifyLabel(c.slug),
          description: c.description.trim(),
          coverImageUrl: c.coverImageUrl.trim(),
          galleryImages: c.galleryImages.map((u) => u.trim()).filter(Boolean),
          subcategories: c.subcategories.map((s) => ({
            ...s,
            label: s.label.trim(),
            slug: slugifyLabel(s.slug),
            description: s.description.trim(),
            coverImageUrl: s.coverImageUrl.trim(),
            galleryImages: s.galleryImages.map((u) => u.trim()).filter(Boolean),
          })),
        })),
      },
      series: {
        projects: content.series.projects.map((p) => ({
          ...p,
          label: p.label.trim(),
          slug: slugifyLabel(p.slug),
          statement: p.statement.trim(),
          description: p.description.trim(),
          coverImageUrl: p.coverImageUrl.trim(),
          galleryImages: p.galleryImages.map((u) => u.trim()).filter(Boolean),
          subcategories: p.subcategories.map((s) => ({
            ...s,
            label: s.label.trim(),
            slug: slugifyLabel(s.slug),
            statement: s.statement.trim(),
            description: s.description.trim(),
            coverImageUrl: s.coverImageUrl.trim(),
            galleryImages: s.galleryImages.map((u) => u.trim()).filter(Boolean),
          })),
        })),
      },
    };
  }

  async function onSave() {
    setMessage(null);
    const normalized = buildNormalizedContent();

    const validation = validateCollections(normalized);
    setFieldErrors({
      portfolio: validation.portfolio,
      portfolioSub: validation.portfolioSub,
      series: validation.series,
      seriesSub: validation.seriesSub,
    });

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

  async function onSaveCategory(categoryId: string) {
    setMessage(null);
    const normalized = buildNormalizedContent();
    const validation = validateCollections(normalized);
    setFieldErrors({
      portfolio: validation.portfolio,
      portfolioSub: validation.portfolioSub,
      series: validation.series,
      seriesSub: validation.seriesSub,
    });

    const hasOwnErrors =
      Boolean(validation.portfolio[categoryId]) ||
      Object.keys(validation.portfolioSub).some((k) => k.startsWith(`${categoryId}::`));
    if (hasOwnErrors) {
      setMessage("No se pudo guardar esta categoría: revisá sus campos en rojo.");
      return;
    }

    clearAllFieldErrors();
    const res = await save(normalized);
    if (res.ok) {
      setMessage(res.offline ? "Categoría guardada localmente." : "Categoría guardada y publicada.");
      return;
    }
    setMessage("No se pudo guardar esta categoría.");
  }

  async function onSaveSeries(projectId: string) {
    setMessage(null);
    const normalized = buildNormalizedContent();
    const validation = validateCollections(normalized);
    setFieldErrors({
      portfolio: validation.portfolio,
      portfolioSub: validation.portfolioSub,
      series: validation.series,
      seriesSub: validation.seriesSub,
    });

    const hasOwnErrors =
      Boolean(validation.series[projectId]) ||
      Object.keys(validation.seriesSub).some((k) => k.startsWith(`${projectId}::`));
    if (hasOwnErrors) {
      setMessage("No se pudo guardar esta serie: revisá sus campos en rojo.");
      return;
    }

    clearAllFieldErrors();
    const res = await save(normalized);
    if (res.ok) {
      setMessage(res.offline ? "Serie guardada localmente." : "Serie guardada y publicada.");
      return;
    }
    setMessage("No se pudo guardar esta serie.");
  }

  if (loading) return <p className="text-stone">Cargando contenido...</p>;

  return (
    <div className="space-y-10">
      {(Object.keys(fieldErrors.portfolio).length > 0 ||
        Object.keys(fieldErrors.portfolioSub).length > 0 ||
        Object.keys(fieldErrors.series).length > 0 ||
        Object.keys(fieldErrors.seriesSub).length > 0) && (
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
        <p className="text-xs text-stone">
          Cada categoría y subcategoría es un bloque desplegable: tocá la fila para ver nombre,
          enlace, fotos y subsecciones. Subir imágenes no las publica solas: usá{" "}
          <strong>Guardar categoría</strong> al pie del bloque abierto o <strong>Guardar cambios</strong>{" "}
          abajo de todo.
        </p>

        <div className="space-y-4">
          {content.portfolio.categories.map((cat, idx) => {
            const err = fieldErrors.portfolio[cat.id];
            const hasCatErr = Boolean(err?.label || err?.slug);
            const catExpanded =
              portfolioCatOpen[cat.id] !== undefined ? portfolioCatOpen[cat.id] : hasCatErr;
            return (
              <div
                key={cat.id}
                className="overflow-hidden rounded-lg border border-charcoal/10 bg-cream/60"
              >
                <div className="flex w-full items-stretch gap-0">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2 px-3 py-3 text-left transition-colors hover:bg-charcoal/[0.04]"
                    aria-expanded={catExpanded}
                    onClick={() =>
                      setPortfolioCatOpen((o) => {
                        const cur = o[cat.id] !== undefined ? o[cat.id] : hasCatErr;
                        return { ...o, [cat.id]: !cur };
                      })
                    }
                  >
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-charcoal/70 transition-transform duration-200",
                        catExpanded && "rotate-180"
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 truncate font-medium text-charcoal">
                      {cat.label.trim() || "Categoría sin título"}
                    </span>
                    <span className="shrink-0 text-[11px] uppercase tracking-wide text-stone">
                      {cat.galleryImages.length} fotos
                      {(cat.subcategories?.length ?? 0) > 0
                        ? ` · ${cat.subcategories?.length} sub`
                        : ""}
                    </span>
                  </button>
                  <div
                    className="flex shrink-0 items-center gap-1 border-l border-charcoal/10 px-2 py-2"
                    onClick={(e) => e.stopPropagation()}
                  >
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

                {catExpanded ? (
                  <div className="space-y-3 border-t border-charcoal/10 p-4">
                    <p className="text-[11px] uppercase tracking-widest text-stone">
                      Categoría {idx + 1}
                    </p>
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
              <div className="space-y-3 rounded-lg border border-charcoal/10 bg-cream/70 p-3">
                <p className="text-xs uppercase tracking-widest text-stone">Imágenes de la categoría</p>
                <HelpText className="!mt-0 text-xs">
                  Las fotos de <strong>{cat.label || "esta categoría"}</strong> se agregan acá: usá{" "}
                  <strong>Subir imagen</strong> de abajo para sumar otra a la galería. No hace falta
                  copiar ningún enlace; al guardar quedan asociadas a esta categoría.
                </HelpText>
                <CloudinaryUploadField
                  multiple
                  onUploaded={(url) => {
                    clearAllFieldErrors();
                    appendCategoryImage(idx, url, setContent);
                    markPendingPublish();
                  }}
                  disabled={saving}
                />
                {cat.galleryImages.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {cat.galleryImages.map((imageUrl) => (
                      <div key={imageUrl} className="space-y-2 rounded border border-charcoal/10 p-2">
                        <p className="text-[11px] uppercase tracking-wide text-stone">
                          {cat.coverImageUrl === imageUrl ? "Portada actual" : "Imagen"}
                        </p>
                        <CloudinaryUploadField
                          variant="compact"
                          previewUrl={imageUrl}
                          onUploaded={(nextUrl) => {
                            clearAllFieldErrors();
                            replaceCategoryImage(idx, imageUrl, nextUrl, content, setContent);
                            markPendingPublish();
                          }}
                          disabled={saving}
                          autoDeletePrevious
                        />
                        {cat.coverImageUrl !== imageUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              clearAllFieldErrors();
                              updateCategory(idx, { coverImageUrl: imageUrl }, content, setContent);
                            }}
                            className="inline-flex items-center rounded border border-charcoal/20 px-2.5 py-1.5 text-xs transition-colors hover:bg-charcoal/5"
                          >
                            Usar como portada
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone">Todavía no hay imágenes cargadas.</p>
                )}
              </div>

              <div className="space-y-3 rounded-lg border border-dashed border-charcoal/20 bg-cream/40 p-3">
                <p className="text-xs uppercase tracking-widest text-stone">Subcategorías</p>
                <p className="text-xs text-stone">
                  Cada una tiene galería propia. URL pública:{" "}
                  <code className="rounded bg-charcoal/5 px-1 py-0.5 text-[11px]">
                    /portfolio/{cat.slug}/…
                  </code>
                </p>
                {(cat.subcategories ?? []).map((sub, si) => {
                  const sk = subErrKey(cat.id, sub.id);
                  const sErr = fieldErrors.portfolioSub[sk];
                  const hasSubErr = Boolean(sErr?.label || sErr?.slug);
                  const subExpanded =
                    portfolioSubOpen[sk] !== undefined ? portfolioSubOpen[sk] : hasSubErr;
                  return (
                    <div
                      key={sub.id}
                      className="overflow-hidden rounded-lg border border-charcoal/12 bg-cream/80"
                    >
                      <div className="flex w-full items-stretch gap-0">
                        <button
                          type="button"
                          className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2.5 text-left text-sm transition-colors hover:bg-charcoal/[0.04]"
                          aria-expanded={subExpanded}
                          onClick={() =>
                            setPortfolioSubOpen((o) => {
                              const cur = o[sk] !== undefined ? o[sk] : hasSubErr;
                              return { ...o, [sk]: !cur };
                            })
                          }
                        >
                          <ChevronDown
                            className={cn(
                              "size-3.5 shrink-0 text-charcoal/70 transition-transform duration-200",
                              subExpanded && "rotate-180"
                            )}
                            aria-hidden
                          />
                          <span className="min-w-0 flex-1 truncate font-medium text-charcoal">
                            {sub.label.trim() || "Subcategoría sin título"}
                          </span>
                          <span className="shrink-0 text-[10px] uppercase tracking-wide text-stone">
                            {sub.galleryImages.length} fotos
                          </span>
                        </button>
                        <div
                          className="flex shrink-0 items-center gap-0.5 border-l border-charcoal/10 px-1.5 py-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="rounded border border-charcoal/20 p-1.5 disabled:opacity-40"
                            disabled={si === 0}
                            onClick={() => movePortfolioSub(idx, si, -1, content, setContent)}
                            aria-label="Subir subcategoría"
                          >
                            <ArrowUp className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            className="rounded border border-charcoal/20 p-1.5 disabled:opacity-40"
                            disabled={si === (cat.subcategories?.length ?? 0) - 1}
                            onClick={() => movePortfolioSub(idx, si, 1, content, setContent)}
                            aria-label="Bajar subcategoría"
                          >
                            <ArrowDown className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            className="rounded border border-charcoal/20 p-1.5 text-red-700"
                            onClick={() => removePortfolioSub(idx, si, content, setContent)}
                            aria-label="Eliminar subcategoría"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                      {subExpanded ? (
                        <div className="space-y-2 border-t border-charcoal/10 p-3">
                          <p className="text-[11px] uppercase tracking-wide text-stone">
                            Subcategoría {si + 1} · edición
                          </p>
                      <input
                        className={cn(inputClass(), sErr?.label && "border-red-500")}
                        value={sub.label}
                        onChange={(e) =>
                          updatePortfolioSub(idx, si, { label: e.target.value }, content, setContent)
                        }
                      />
                      {sErr?.label && <p className="text-xs text-red-700">{sErr.label}</p>}
                      <input
                        className={cn(inputClass(), sErr?.slug && "border-red-500")}
                        value={sub.slug}
                        onChange={(e) =>
                          updatePortfolioSub(
                            idx,
                            si,
                            { slug: slugifyLabel(e.target.value) },
                            content,
                            setContent
                          )
                        }
                      />
                      {sErr?.slug && <p className="text-xs text-red-700">{sErr.slug}</p>}
                      <textarea
                        className={inputClass()}
                        rows={2}
                        value={sub.description}
                        onChange={(e) =>
                          updatePortfolioSub(
                            idx,
                            si,
                            { description: e.target.value },
                            content,
                            setContent
                          )
                        }
                      />
                      <div className="space-y-2 rounded border border-charcoal/10 p-2">
                        <p className="text-[11px] uppercase tracking-wide text-stone">
                          Imágenes de esta subcategoría
                        </p>
                        <CloudinaryUploadField
                          multiple
                          onUploaded={(url) =>
                            appendPortfolioSubImage(idx, si, url, setContent)
                          }
                          disabled={saving}
                        />
                        {sub.galleryImages.length > 0 ? (
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {sub.galleryImages.map((imageUrl) => (
                              <div
                                key={imageUrl}
                                className="space-y-2 rounded border border-charcoal/10 p-2"
                              >
                                <CloudinaryUploadField
                                  variant="compact"
                                  previewUrl={imageUrl}
                                  onUploaded={(nextUrl) =>
                                    replacePortfolioSubImage(
                                      idx,
                                      si,
                                      imageUrl,
                                      nextUrl,
                                      content,
                                      setContent
                                    )
                                  }
                                  disabled={saving}
                                  autoDeletePrevious
                                />
                                {sub.coverImageUrl !== imageUrl && (
                                  <button
                                    type="button"
                                    className="inline-flex rounded border border-charcoal/20 px-2 py-1 text-xs"
                                    onClick={() =>
                                      updatePortfolioSub(
                                        idx,
                                        si,
                                        { coverImageUrl: imageUrl },
                                        content,
                                        setContent
                                      )
                                    }
                                  >
                                    Usar como portada
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded border border-charcoal/20 px-3 py-2 text-sm"
                  onClick={() => addPortfolioSub(idx, content, setContent)}
                >
                  <Plus className="size-4" />
                  Añadir subcategoría
                </button>
              </div>
                    <button
                      type="button"
                      onClick={() => onSaveCategory(cat.id)}
                      disabled={saving}
                      className="mt-3 w-full rounded border border-charcoal/25 py-2.5 text-sm text-charcoal transition-colors hover:bg-charcoal/5 disabled:opacity-50"
                    >
                      {saving ? "Guardando…" : "Guardar categoría"}
                    </button>
                  </div>
                ) : null}
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
        <p className="text-xs text-stone">
          Igual que en portfolio: cada serie se pliega y muestra solo el título; al expandir editás
          todo. Guardá con <strong>Guardar serie</strong> al final del bloque o con{" "}
          <strong>Guardar cambios</strong>.
        </p>

        <div className="space-y-4">
          {content.series.projects.map((project, idx) => {
            const err = fieldErrors.series[project.id];
            const hasProjErr = Boolean(err?.label || err?.slug);
            const projExpanded =
              seriesProjOpen[project.id] !== undefined ? seriesProjOpen[project.id] : hasProjErr;
            return (
              <div
                key={project.id}
                className="overflow-hidden rounded-lg border border-charcoal/10 bg-cream/60"
              >
                <div className="flex w-full items-stretch gap-0">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-2 px-3 py-3 text-left transition-colors hover:bg-charcoal/[0.04]"
                    aria-expanded={projExpanded}
                    onClick={() =>
                      setSeriesProjOpen((o) => {
                        const cur = o[project.id] !== undefined ? o[project.id] : hasProjErr;
                        return { ...o, [project.id]: !cur };
                      })
                    }
                  >
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-charcoal/70 transition-transform duration-200",
                        projExpanded && "rotate-180"
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 truncate font-medium text-charcoal">
                      {project.label.trim() || "Serie sin título"}
                    </span>
                    <span className="shrink-0 text-[11px] uppercase tracking-wide text-stone">
                      {project.galleryImages.length} fotos
                      {(project.subcategories?.length ?? 0) > 0
                        ? ` · ${project.subcategories?.length} sub`
                        : ""}
                    </span>
                  </button>
                  <div
                    className="flex shrink-0 items-center gap-1 border-l border-charcoal/10 px-2 py-2"
                    onClick={(e) => e.stopPropagation()}
                  >
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

                {projExpanded ? (
                  <div className="space-y-3 border-t border-charcoal/10 p-4">
                    <p className="text-[11px] uppercase tracking-widest text-stone">
                      Serie {idx + 1}
                    </p>
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
              <div className="space-y-3 rounded-lg border border-charcoal/10 bg-cream/70 p-3">
                <p className="text-xs uppercase tracking-widest text-stone">Imágenes de la serie</p>
                <HelpText className="!mt-0 text-xs">
                  Las fotos de <strong>{project.label || "esta serie"}</strong> se agregan acá con{" "}
                  <strong>Subir imagen</strong>. Cada miniatura es una foto de la serie; elegí cuál es
                  la portada con el botón correspondiente.
                </HelpText>
                <CloudinaryUploadField
                  multiple
                  onUploaded={(url) => {
                    clearAllFieldErrors();
                    appendSeriesImage(idx, url, setContent);
                    markPendingPublish();
                  }}
                  disabled={saving}
                />
                {project.galleryImages.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {project.galleryImages.map((imageUrl) => (
                      <div key={imageUrl} className="space-y-2 rounded border border-charcoal/10 p-2">
                        <p className="text-[11px] uppercase tracking-wide text-stone">
                          {project.coverImageUrl === imageUrl ? "Portada actual" : "Imagen"}
                        </p>
                        <CloudinaryUploadField
                          variant="compact"
                          previewUrl={imageUrl}
                          onUploaded={(nextUrl) => {
                            clearAllFieldErrors();
                            replaceSeriesImage(idx, imageUrl, nextUrl, content, setContent);
                            markPendingPublish();
                          }}
                          disabled={saving}
                          autoDeletePrevious
                        />
                        {project.coverImageUrl !== imageUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              clearAllFieldErrors();
                              updateProject(idx, { coverImageUrl: imageUrl }, content, setContent);
                            }}
                            className="inline-flex items-center rounded border border-charcoal/20 px-2.5 py-1.5 text-xs transition-colors hover:bg-charcoal/5"
                          >
                            Usar como portada
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-stone">Todavía no hay imágenes cargadas.</p>
                )}
              </div>

              <div className="space-y-3 rounded-lg border border-dashed border-charcoal/20 bg-cream/40 p-3">
                <p className="text-xs uppercase tracking-widest text-stone">Subcategorías de la serie</p>
                <p className="text-xs text-stone">
                  Partes con galería propia. URL:{" "}
                  <code className="rounded bg-charcoal/5 px-1 py-0.5 text-[11px]">
                    /series/{project.slug}/…
                  </code>
                </p>
                {(project.subcategories ?? []).map((sub, si) => {
                  const sk = subErrKey(project.id, sub.id);
                  const sErr = fieldErrors.seriesSub[sk];
                  const hasSubErr = Boolean(sErr?.label || sErr?.slug);
                  const subExpanded =
                    seriesSubOpen[sk] !== undefined ? seriesSubOpen[sk] : hasSubErr;
                  return (
                    <div
                      key={sub.id}
                      className="overflow-hidden rounded-lg border border-charcoal/12 bg-cream/80"
                    >
                      <div className="flex w-full items-stretch gap-0">
                        <button
                          type="button"
                          className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2.5 text-left text-sm transition-colors hover:bg-charcoal/[0.04]"
                          aria-expanded={subExpanded}
                          onClick={() =>
                            setSeriesSubOpen((o) => {
                              const cur = o[sk] !== undefined ? o[sk] : hasSubErr;
                              return { ...o, [sk]: !cur };
                            })
                          }
                        >
                          <ChevronDown
                            className={cn(
                              "size-3.5 shrink-0 text-charcoal/70 transition-transform duration-200",
                              subExpanded && "rotate-180"
                            )}
                            aria-hidden
                          />
                          <span className="min-w-0 flex-1 truncate font-medium text-charcoal">
                            {sub.label.trim() || "Parte sin título"}
                          </span>
                          <span className="shrink-0 text-[10px] uppercase tracking-wide text-stone">
                            {sub.galleryImages.length} fotos
                          </span>
                        </button>
                        <div
                          className="flex shrink-0 items-center gap-0.5 border-l border-charcoal/10 px-1.5 py-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="rounded border border-charcoal/20 p-1.5 disabled:opacity-40"
                            disabled={si === 0}
                            onClick={() => moveSeriesSub(idx, si, -1, content, setContent)}
                            aria-label="Subir subserie"
                          >
                            <ArrowUp className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            className="rounded border border-charcoal/20 p-1.5 disabled:opacity-40"
                            disabled={si === (project.subcategories?.length ?? 0) - 1}
                            onClick={() => moveSeriesSub(idx, si, 1, content, setContent)}
                            aria-label="Bajar subserie"
                          >
                            <ArrowDown className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            className="rounded border border-charcoal/20 p-1.5 text-red-700"
                            onClick={() => removeSeriesSub(idx, si, content, setContent)}
                            aria-label="Eliminar subserie"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                      {subExpanded ? (
                        <div className="space-y-2 border-t border-charcoal/10 p-3">
                          <p className="text-[11px] uppercase tracking-wide text-stone">
                            Subserie {si + 1} · edición
                          </p>
                      <input
                        className={cn(inputClass(), sErr?.label && "border-red-500")}
                        value={sub.label}
                        onChange={(e) =>
                          updateSeriesSub(idx, si, { label: e.target.value }, content, setContent)
                        }
                      />
                      {sErr?.label && <p className="text-xs text-red-700">{sErr.label}</p>}
                      <input
                        className={cn(inputClass(), sErr?.slug && "border-red-500")}
                        value={sub.slug}
                        onChange={(e) =>
                          updateSeriesSub(
                            idx,
                            si,
                            { slug: slugifyLabel(e.target.value) },
                            content,
                            setContent
                          )
                        }
                      />
                      {sErr?.slug && <p className="text-xs text-red-700">{sErr.slug}</p>}
                      <textarea
                        className={inputClass()}
                        rows={2}
                        value={sub.statement}
                        onChange={(e) =>
                          updateSeriesSub(idx, si, { statement: e.target.value }, content, setContent)
                        }
                      />
                      <textarea
                        className={inputClass()}
                        rows={2}
                        value={sub.description}
                        onChange={(e) =>
                          updateSeriesSub(idx, si, { description: e.target.value }, content, setContent)
                        }
                      />
                      <div className="space-y-2 rounded border border-charcoal/10 p-2">
                        <p className="text-[11px] uppercase tracking-wide text-stone">Imágenes</p>
                        <CloudinaryUploadField
                          multiple
                          onUploaded={(url) =>
                            appendSeriesSubImage(idx, si, url, setContent)
                          }
                          disabled={saving}
                        />
                        {sub.galleryImages.length > 0 ? (
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {sub.galleryImages.map((imageUrl) => (
                              <div
                                key={imageUrl}
                                className="space-y-2 rounded border border-charcoal/10 p-2"
                              >
                                <CloudinaryUploadField
                                  variant="compact"
                                  previewUrl={imageUrl}
                                  onUploaded={(nextUrl) =>
                                    replaceSeriesSubImage(
                                      idx,
                                      si,
                                      imageUrl,
                                      nextUrl,
                                      content,
                                      setContent
                                    )
                                  }
                                  disabled={saving}
                                  autoDeletePrevious
                                />
                                {sub.coverImageUrl !== imageUrl && (
                                  <button
                                    type="button"
                                    className="inline-flex rounded border border-charcoal/20 px-2 py-1 text-xs"
                                    onClick={() =>
                                      updateSeriesSub(
                                        idx,
                                        si,
                                        { coverImageUrl: imageUrl },
                                        content,
                                        setContent
                                      )
                                    }
                                  >
                                    Usar como portada
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded border border-charcoal/20 px-3 py-2 text-sm"
                  onClick={() => addSeriesSub(idx, content, setContent)}
                >
                  <Plus className="size-4" />
                  Añadir subcategoría
                </button>
              </div>
                    <button
                      type="button"
                      onClick={() => onSaveSeries(project.id)}
                      disabled={saving}
                      className="mt-3 w-full rounded border border-charcoal/25 py-2.5 text-sm text-charcoal transition-colors hover:bg-charcoal/5 disabled:opacity-50"
                    >
                      {saving ? "Guardando…" : "Guardar serie"}
                    </button>
                  </div>
                ) : null}
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
  portfolioSub: Record<string, RowErrors>;
  series: Record<string, RowErrors>;
  seriesSub: Record<string, RowErrors>;
} {
  const portfolio: Record<string, RowErrors> = {};
  const portfolioSub: Record<string, RowErrors> = {};
  const series: Record<string, RowErrors> = {};
  const seriesSub: Record<string, RowErrors> = {};

  function setPort(id: string, patch: RowErrors) {
    portfolio[id] = { ...portfolio[id], ...patch };
  }
  function setPortSub(catId: string, subId: string, patch: RowErrors) {
    const k = subErrKey(catId, subId);
    portfolioSub[k] = { ...portfolioSub[k], ...patch };
  }
  function setSer(id: string, patch: RowErrors) {
    series[id] = { ...series[id], ...patch };
  }
  function setSerSub(projectId: string, subId: string, patch: RowErrors) {
    const k = subErrKey(projectId, subId);
    seriesSub[k] = { ...seriesSub[k], ...patch };
  }

  for (const cat of content.portfolio.categories) {
    if (!cat.label.trim()) {
      setPort(cat.id, { label: "Falta el nombre visible." });
    }
    if (!cat.slug.trim()) {
      setPort(cat.id, { slug: "Falta el enlace de la URL (ej. familia, retratos)." });
    }

    const subSlugMap = new Map<string, string[]>();
    for (const sub of cat.subcategories ?? []) {
      if (!sub.label.trim()) {
        setPortSub(cat.id, sub.id, { label: "Falta el nombre de la subcategoría." });
      }
      if (!sub.slug.trim()) {
        setPortSub(cat.id, sub.id, { slug: "Falta el slug de la subcategoría." });
      }
      const ss = sub.slug.trim();
      if (ss) {
        const list = subSlugMap.get(ss) ?? [];
        list.push(sub.id);
        subSlugMap.set(ss, list);
      }
      if (ss && ss === cat.slug.trim()) {
        setPortSub(cat.id, sub.id, {
          slug: "El slug de la subcategoría no puede ser igual al de la categoría padre.",
        });
      }
    }
    for (const ids of subSlugMap.values()) {
      if (ids.length > 1) {
        for (const sid of ids) {
          setPortSub(cat.id, sid, { slug: "Este slug ya lo usa otra subcategoría de la misma categoría." });
        }
      }
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

    const subSlugMap = new Map<string, string[]>();
    for (const sub of p.subcategories ?? []) {
      if (!sub.label.trim()) {
        setSerSub(p.id, sub.id, { label: "Falta el nombre de la subcategoría." });
      }
      if (!sub.slug.trim()) {
        setSerSub(p.id, sub.id, { slug: "Falta el slug de la subcategoría." });
      }
      const ss = sub.slug.trim();
      if (ss) {
        const list = subSlugMap.get(ss) ?? [];
        list.push(sub.id);
        subSlugMap.set(ss, list);
      }
      if (ss && ss === p.slug.trim()) {
        setSerSub(p.id, sub.id, {
          slug: "El slug no puede ser igual al de la serie padre.",
        });
      }
    }
    for (const ids of subSlugMap.values()) {
      if (ids.length > 1) {
        for (const sid of ids) {
          setSerSub(p.id, sid, { slug: "Este slug ya lo usa otra subcategoría de la misma serie." });
        }
      }
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
    ok:
      !hasRowErrors(portfolio) &&
      !hasRowErrors(portfolioSub) &&
      !hasRowErrors(series) &&
      !hasRowErrors(seriesSub),
    portfolio,
    portfolioSub,
    series,
    seriesSub,
  };
}

function updateCategory(
  idx: number,
  patch: Partial<PortfolioCategory>,
  content: ReturnType<typeof useSiteContent>["content"],
  setContent: ReturnType<typeof useSiteContent>["setContent"]
) {
  const next = [...content.portfolio.categories];
  next[idx] = { ...next[idx], ...patch };
  setContent({ ...content, portfolio: { ...content.portfolio, categories: next } });
}

function updateProject(
  idx: number,
  patch: Partial<SeriesProject>,
  content: ReturnType<typeof useSiteContent>["content"],
  setContent: ReturnType<typeof useSiteContent>["setContent"]
) {
  const next = [...content.series.projects];
  next[idx] = { ...next[idx], ...patch };
  setContent({ ...content, series: { ...content.series, projects: next } });
}

function appendCategoryImage(
  idx: number,
  url: string,
  setContent: ReturnType<typeof useSiteContent>["setContent"]
) {
  const clean = url.trim();
  if (!clean) return;
  setContent((prev) => {
    const row = prev.portfolio.categories[idx];
    if (!row) return prev;
    const galleryImages = row.galleryImages.includes(clean)
      ? row.galleryImages
      : [...row.galleryImages, clean];
    const next = [...prev.portfolio.categories];
    next[idx] = {
      ...row,
      galleryImages,
      coverImageUrl: row.coverImageUrl || clean,
    };
    return { ...prev, portfolio: { ...prev.portfolio, categories: next } };
  });
}

function replaceCategoryImage(
  idx: number,
  prevUrl: string,
  nextUrl: string,
  content: ReturnType<typeof useSiteContent>["content"],
  setContent: ReturnType<typeof useSiteContent>["setContent"]
) {
  const row = content.portfolio.categories[idx];
  const cleanNext = nextUrl.trim();

  if (!cleanNext) {
    const galleryImages = row.galleryImages.filter((u) => u !== prevUrl);
    const nextCover = row.coverImageUrl === prevUrl ? galleryImages[0] ?? "" : row.coverImageUrl;
    updateCategory(idx, { galleryImages, coverImageUrl: nextCover }, content, setContent);
    return;
  }

  const galleryImages = row.galleryImages.map((u) => (u === prevUrl ? cleanNext : u));
  const nextCover = row.coverImageUrl === prevUrl ? cleanNext : row.coverImageUrl;
  updateCategory(idx, { galleryImages, coverImageUrl: nextCover }, content, setContent);
}

function appendSeriesImage(
  idx: number,
  url: string,
  setContent: ReturnType<typeof useSiteContent>["setContent"]
) {
  const clean = url.trim();
  if (!clean) return;
  setContent((prev) => {
    const row = prev.series.projects[idx];
    if (!row) return prev;
    const galleryImages = row.galleryImages.includes(clean)
      ? row.galleryImages
      : [...row.galleryImages, clean];
    const next = [...prev.series.projects];
    next[idx] = {
      ...row,
      galleryImages,
      coverImageUrl: row.coverImageUrl || clean,
    };
    return { ...prev, series: { ...prev.series, projects: next } };
  });
}

function replaceSeriesImage(
  idx: number,
  prevUrl: string,
  nextUrl: string,
  content: ReturnType<typeof useSiteContent>["content"],
  setContent: ReturnType<typeof useSiteContent>["setContent"]
) {
  const row = content.series.projects[idx];
  const cleanNext = nextUrl.trim();

  if (!cleanNext) {
    const galleryImages = row.galleryImages.filter((u) => u !== prevUrl);
    const nextCover = row.coverImageUrl === prevUrl ? galleryImages[0] ?? "" : row.coverImageUrl;
    updateProject(idx, { galleryImages, coverImageUrl: nextCover }, content, setContent);
    return;
  }

  const galleryImages = row.galleryImages.map((u) => (u === prevUrl ? cleanNext : u));
  const nextCover = row.coverImageUrl === prevUrl ? cleanNext : row.coverImageUrl;
  updateProject(idx, { galleryImages, coverImageUrl: nextCover }, content, setContent);
}

function updatePortfolioSub(
  catIdx: number,
  subIdx: number,
  patch: Partial<PortfolioSubcategory>,
  content: ReturnType<typeof useSiteContent>["content"],
  setContent: ReturnType<typeof useSiteContent>["setContent"]
) {
  const cats = [...content.portfolio.categories];
  const cat = cats[catIdx];
  const subs = [...(cat.subcategories ?? [])];
  subs[subIdx] = { ...subs[subIdx], ...patch };
  cats[catIdx] = { ...cat, subcategories: subs };
  setContent({ ...content, portfolio: { ...content.portfolio, categories: cats } });
}

function addPortfolioSub(
  catIdx: number,
  content: ReturnType<typeof useSiteContent>["content"],
  setContent: ReturnType<typeof useSiteContent>["setContent"]
) {
  const cats = [...content.portfolio.categories];
  const cat = cats[catIdx];
  const subs = [...(cat.subcategories ?? [])];
  const n = subs.length + 1;
  subs.push({
    id: newManagedItemId("port-sub"),
    slug: `seccion-${n}`,
    label: `Nueva sección ${n}`,
    description: "",
    coverImageUrl: "",
    galleryImages: [],
  });
  cats[catIdx] = { ...cat, subcategories: subs };
  setContent({ ...content, portfolio: { ...content.portfolio, categories: cats } });
}

function removePortfolioSub(
  catIdx: number,
  subIdx: number,
  content: ReturnType<typeof useSiteContent>["content"],
  setContent: ReturnType<typeof useSiteContent>["setContent"]
) {
  const cats = [...content.portfolio.categories];
  const cat = cats[catIdx];
  const subs = (cat.subcategories ?? []).filter((_, i) => i !== subIdx);
  cats[catIdx] = { ...cat, subcategories: subs };
  setContent({ ...content, portfolio: { ...content.portfolio, categories: cats } });
}

function movePortfolioSub(
  catIdx: number,
  subIdx: number,
  dir: -1 | 1,
  content: ReturnType<typeof useSiteContent>["content"],
  setContent: ReturnType<typeof useSiteContent>["setContent"]
) {
  const cats = [...content.portfolio.categories];
  const cat = cats[catIdx];
  const subs = [...(cat.subcategories ?? [])];
  const to = subIdx + dir;
  if (to < 0 || to >= subs.length) return;
  [subs[subIdx], subs[to]] = [subs[to], subs[subIdx]];
  cats[catIdx] = { ...cat, subcategories: subs };
  setContent({ ...content, portfolio: { ...content.portfolio, categories: cats } });
}

function appendPortfolioSubImage(
  catIdx: number,
  subIdx: number,
  url: string,
  setContent: ReturnType<typeof useSiteContent>["setContent"]
) {
  const clean = url.trim();
  if (!clean) return;
  setContent((prev) => {
    const cats = [...prev.portfolio.categories];
    const cat = cats[catIdx];
    if (!cat) return prev;
    const subs = [...(cat.subcategories ?? [])];
    const sub = subs[subIdx];
    if (!sub) return prev;
    const galleryImages = sub.galleryImages.includes(clean)
      ? sub.galleryImages
      : [...sub.galleryImages, clean];
    subs[subIdx] = {
      ...sub,
      galleryImages,
      coverImageUrl: sub.coverImageUrl || clean,
    };
    cats[catIdx] = { ...cat, subcategories: subs };
    return { ...prev, portfolio: { ...prev.portfolio, categories: cats } };
  });
}

function replacePortfolioSubImage(
  catIdx: number,
  subIdx: number,
  prevUrl: string,
  nextUrl: string,
  content: ReturnType<typeof useSiteContent>["content"],
  setContent: ReturnType<typeof useSiteContent>["setContent"]
) {
  const sub = (content.portfolio.categories[catIdx].subcategories ?? [])[subIdx];
  const cleanNext = nextUrl.trim();
  if (!cleanNext) {
    const galleryImages = sub.galleryImages.filter((u) => u !== prevUrl);
    const nextCover = sub.coverImageUrl === prevUrl ? galleryImages[0] ?? "" : sub.coverImageUrl;
    updatePortfolioSub(catIdx, subIdx, { galleryImages, coverImageUrl: nextCover }, content, setContent);
    return;
  }
  const galleryImages = sub.galleryImages.map((u) => (u === prevUrl ? cleanNext : u));
  const nextCover = sub.coverImageUrl === prevUrl ? cleanNext : sub.coverImageUrl;
  updatePortfolioSub(catIdx, subIdx, { galleryImages, coverImageUrl: nextCover }, content, setContent);
}

function updateSeriesSub(
  projectIdx: number,
  subIdx: number,
  patch: Partial<SeriesSubcategory>,
  content: ReturnType<typeof useSiteContent>["content"],
  setContent: ReturnType<typeof useSiteContent>["setContent"]
) {
  const projects = [...content.series.projects];
  const p = projects[projectIdx];
  const subs = [...(p.subcategories ?? [])];
  subs[subIdx] = { ...subs[subIdx], ...patch };
  projects[projectIdx] = { ...p, subcategories: subs };
  setContent({ ...content, series: { ...content.series, projects } });
}

function addSeriesSub(
  projectIdx: number,
  content: ReturnType<typeof useSiteContent>["content"],
  setContent: ReturnType<typeof useSiteContent>["setContent"]
) {
  const projects = [...content.series.projects];
  const p = projects[projectIdx];
  const subs = [...(p.subcategories ?? [])];
  const n = subs.length + 1;
  subs.push({
    id: newManagedItemId("series-sub"),
    slug: `parte-${n}`,
    label: `Nueva parte ${n}`,
    statement: "",
    description: "",
    coverImageUrl: "",
    galleryImages: [],
  });
  projects[projectIdx] = { ...p, subcategories: subs };
  setContent({ ...content, series: { ...content.series, projects } });
}

function removeSeriesSub(
  projectIdx: number,
  subIdx: number,
  content: ReturnType<typeof useSiteContent>["content"],
  setContent: ReturnType<typeof useSiteContent>["setContent"]
) {
  const projects = [...content.series.projects];
  const p = projects[projectIdx];
  const subs = (p.subcategories ?? []).filter((_, i) => i !== subIdx);
  projects[projectIdx] = { ...p, subcategories: subs };
  setContent({ ...content, series: { ...content.series, projects } });
}

function moveSeriesSub(
  projectIdx: number,
  subIdx: number,
  dir: -1 | 1,
  content: ReturnType<typeof useSiteContent>["content"],
  setContent: ReturnType<typeof useSiteContent>["setContent"]
) {
  const projects = [...content.series.projects];
  const p = projects[projectIdx];
  const subs = [...(p.subcategories ?? [])];
  const to = subIdx + dir;
  if (to < 0 || to >= subs.length) return;
  [subs[subIdx], subs[to]] = [subs[to], subs[subIdx]];
  projects[projectIdx] = { ...p, subcategories: subs };
  setContent({ ...content, series: { ...content.series, projects } });
}

function appendSeriesSubImage(
  projectIdx: number,
  subIdx: number,
  url: string,
  setContent: ReturnType<typeof useSiteContent>["setContent"]
) {
  const clean = url.trim();
  if (!clean) return;
  setContent((prev) => {
    const projects = [...prev.series.projects];
    const p = projects[projectIdx];
    if (!p) return prev;
    const subs = [...(p.subcategories ?? [])];
    const sub = subs[subIdx];
    if (!sub) return prev;
    const galleryImages = sub.galleryImages.includes(clean)
      ? sub.galleryImages
      : [...sub.galleryImages, clean];
    subs[subIdx] = {
      ...sub,
      galleryImages,
      coverImageUrl: sub.coverImageUrl || clean,
    };
    projects[projectIdx] = { ...p, subcategories: subs };
    return { ...prev, series: { ...prev.series, projects } };
  });
}

function replaceSeriesSubImage(
  projectIdx: number,
  subIdx: number,
  prevUrl: string,
  nextUrl: string,
  content: ReturnType<typeof useSiteContent>["content"],
  setContent: ReturnType<typeof useSiteContent>["setContent"]
) {
  const sub = (content.series.projects[projectIdx].subcategories ?? [])[subIdx];
  const cleanNext = nextUrl.trim();
  if (!cleanNext) {
    const galleryImages = sub.galleryImages.filter((u) => u !== prevUrl);
    const nextCover = sub.coverImageUrl === prevUrl ? galleryImages[0] ?? "" : sub.coverImageUrl;
    updateSeriesSub(projectIdx, subIdx, { galleryImages, coverImageUrl: nextCover }, content, setContent);
    return;
  }
  const galleryImages = sub.galleryImages.map((u) => (u === prevUrl ? cleanNext : u));
  const nextCover = sub.coverImageUrl === prevUrl ? cleanNext : sub.coverImageUrl;
  updateSeriesSub(projectIdx, subIdx, { galleryImages, coverImageUrl: nextCover }, content, setContent);
}

function addCategory(
  content: ReturnType<typeof useSiteContent>["content"],
  setContent: ReturnType<typeof useSiteContent>["setContent"]
) {
  const next = [...content.portfolio.categories];
  next.push({
    id: newManagedItemId("cat"),
    slug: `categoria-${next.length + 1}`,
    label: `Nueva categoría ${next.length + 1}`,
    description: "",
    coverImageUrl: "",
    galleryImages: [],
    subcategories: [],
  });
  setContent({ ...content, portfolio: { ...content.portfolio, categories: next } });
}

function addProject(
  content: ReturnType<typeof useSiteContent>["content"],
  setContent: ReturnType<typeof useSiteContent>["setContent"]
) {
  const next = [...content.series.projects];
  next.push({
    id: newManagedItemId("series"),
    slug: `serie-${next.length + 1}`,
    label: `Nueva serie ${next.length + 1}`,
    statement: "",
    description: "",
    coverImageUrl: "",
    galleryImages: [],
    subcategories: [],
  });
  setContent({ ...content, series: { ...content.series, projects: next } });
}

function removeCategory(
  idx: number,
  content: ReturnType<typeof useSiteContent>["content"],
  setContent: ReturnType<typeof useSiteContent>["setContent"]
) {
  const next = content.portfolio.categories.filter((_, i) => i !== idx);
  setContent({ ...content, portfolio: { ...content.portfolio, categories: next } });
}

function removeProject(
  idx: number,
  content: ReturnType<typeof useSiteContent>["content"],
  setContent: ReturnType<typeof useSiteContent>["setContent"]
) {
  const next = content.series.projects.filter((_, i) => i !== idx);
  setContent({ ...content, series: { ...content.series, projects: next } });
}

function moveCategory(
  direction: -1 | 1,
  idx: number,
  content: ReturnType<typeof useSiteContent>["content"],
  setContent: ReturnType<typeof useSiteContent>["setContent"]
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
  setContent: ReturnType<typeof useSiteContent>["setContent"]
) {
  const next = [...content.series.projects];
  const to = idx + direction;
  if (to < 0 || to >= next.length) return;
  [next[idx], next[to]] = [next[to], next[idx]];
  setContent({ ...content, series: { ...content.series, projects: next } });
}
