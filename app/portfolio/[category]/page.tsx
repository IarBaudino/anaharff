import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryContent } from "@/components/portfolio/CategoryContent";
import { absoluteUrl, siteConfig } from "@/lib/seo";
import { getServerSiteContent } from "@/lib/site-content-server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const content = await getServerSiteContent();
  const cat = content.portfolio.categories.find((c) => c.slug === category);
  if (!cat) return {};
  const path = `/portfolio/${category}`;
  const description = cat.description || `Galería ${cat.label} · ${siteConfig.name}`;

  return {
    title: { absolute: `${cat.label} · Portfolio · ${siteConfig.name}` },
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title: `${cat.label} · ${siteConfig.name}`,
      description,
      url: absoluteUrl(path),
    },
    twitter: {
      card: "summary_large_image",
      title: `${cat.label} · ${siteConfig.name}`,
      description,
    },
  };
}

export default async function PortfolioCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const content = await getServerSiteContent();
  const cat = content.portfolio.categories.find((c) => c.slug === category);
  if (!cat) notFound();
  return <CategoryContent label={cat.label} />;
}
