import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeriesContent } from "@/components/series/SeriesContent";
import { absoluteUrl, siteConfig } from "@/lib/seo";

const series: Record<string, { label: string; description: string }> = {
  unica: {
    label: "Unica",
    description:
      'Serie fotográfica "Unica" — narrativa en analógico. Ana Harff, Buenos Aires.',
  },
  "ser-gorda": {
    label: "Ser Gorda",
    description:
      'Proyecto "Ser Gorda" — cuerpo, identidad y fotografía analógica. Ana Harff, Buenos Aires.',
  },
  "venus-as-a-boy": {
    label: "Venus as a Boy",
    description:
      'Serie "Venus as a Boy" — fotografía analógica y exploración visual. Ana Harff, Buenos Aires.',
  },
  "desde-la-distancia": {
    label: "Desde la Distancia",
    description:
      'Serie "Desde la Distancia" — distancia, memoria y analógico. Ana Harff, Buenos Aires.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = series[slug];
  if (!s) return {};
  const path = `/series/${slug}`;
  return {
    title: { absolute: `${s.label} · Series · ${siteConfig.name}` },
    description: s.description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title: `${s.label} · ${siteConfig.name}`,
      description: s.description,
      url: absoluteUrl(path),
    },
    twitter: {
      card: "summary_large_image",
      title: `${s.label} · ${siteConfig.name}`,
      description: s.description,
    },
  };
}

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
