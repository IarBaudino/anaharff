import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryContent } from "@/components/portfolio/CategoryContent";
import { siteConfig } from "@/lib/seo";
import { buildAbsolutePageMetadata } from "@/lib/seo-metadata";
import { getServerSiteContent } from "@/lib/site-content-server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; subcategory: string }>;
}): Promise<Metadata> {
  const { category, subcategory } = await params;
  const content = await getServerSiteContent();
  const cat = content.portfolio.categories.find((c) => c.slug === category);
  const sub = cat?.subcategories?.find((s) => s.slug === subcategory);
  if (!cat || !sub) return {};
  const path = `/portfolio/${category}/${subcategory}`;
  const description = sub.description || `${sub.label} · ${siteConfig.name}`;

  return buildAbsolutePageMetadata({
    absoluteTitle: `${sub.label} · ${cat.label} · ${siteConfig.name}`,
    description,
    path,
  });
}

export default async function PortfolioSubcategoryPage({
  params,
}: {
  params: Promise<{ category: string; subcategory: string }>;
}) {
  const { category, subcategory } = await params;
  const content = await getServerSiteContent();
  const cat = content.portfolio.categories.find((c) => c.slug === category);
  const sub = cat?.subcategories?.find((s) => s.slug === subcategory);
  if (!cat || !sub) notFound();

  return (
    <CategoryContent
      label={sub.label}
      backHref={`/portfolio/${category}`}
      imageUrls={sub.galleryImages}
    />
  );
}
