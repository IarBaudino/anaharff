import { notFound } from "next/navigation";
import { CategoryContent } from "@/components/portfolio/CategoryContent";

const categories: Record<string, { label: string }> = {
  desnudos: { label: "Desnudos (nude)" },
  retratos: { label: "Retratos (portrait)" },
  artistico: { label: "Artístico (art & shows)" },
  experimental: { label: "Experimental" },
};

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
