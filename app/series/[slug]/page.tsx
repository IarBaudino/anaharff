import { notFound } from "next/navigation";
import { SeriesContent } from "@/components/series/SeriesContent";

const series: Record<string, { label: string }> = {
  unica: { label: "Unica" },
  "ser-gorda": { label: "Ser Gorda" },
  "venus-as-a-boy": { label: "Venus as a Boy" },
  "desde-la-distancia": { label: "Desde la Distancia" },
};

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = series[slug];

  if (!s) notFound();

  return <SeriesContent label={s.label} />;
}
