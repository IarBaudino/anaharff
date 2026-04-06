import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryContent } from "@/components/portfolio/CategoryContent";
import { absoluteUrl, siteConfig } from "@/lib/seo";

const categories: Record<string, { label: string; description: string }> = {
  desnudos: {
    label: "Desnudos (nude)",
    description:
      "Galería de desnudo artístico y editorial en fotografía analógica. Ana Harff, Buenos Aires.",
  },
  retratos: {
    label: "Retratos (portrait)",
    description:
      "Retratos en fotografía analógica: mirada, identidad y presencia. Ana Harff, Buenos Aires.",
  },
  artistico: {
    label: "Artístico (art & shows)",
    description:
      "Obra artística, muestras y proyectos editoriales en analógico. Ana Harff, Buenos Aires.",
  },
  experimental: {
    label: "Experimental",
    description:
      "Procesos experimentales y lecturas libres del cuerpo y el espacio en analógico. Ana Harff.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = categories[category];
  if (!cat) return {};
  const path = `/portfolio/${category}`;
  return {
    title: { absolute: `${cat.label} · Portfolio · ${siteConfig.name}` },
    description: cat.description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title: `${cat.label} · ${siteConfig.name}`,
      description: cat.description,
      url: absoluteUrl(path),
    },
    twitter: {
      card: "summary_large_image",
      title: `${cat.label} · ${siteConfig.name}`,
      description: cat.description,
    },
  };
}

export default async function PortfolioCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = categories[category];

  if (!cat) notFound();

  return <CategoryContent label={cat.label} />;
}
