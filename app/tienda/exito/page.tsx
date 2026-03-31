import { Suspense } from "react";
import { ExitoContent } from "./ExitoContent";

export default function TiendaExitoPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-32 text-center text-stone">Cargando…</div>
      }
    >
      <ExitoContent />
    </Suspense>
  );
}
