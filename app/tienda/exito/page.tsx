import { Suspense } from "react";
import { ExitoContent } from "./ExitoContent";

export default function TiendaExitoPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-20 text-center text-stone md:pt-32">Cargando…</div>
      }
    >
      <ExitoContent />
    </Suspense>
  );
}
