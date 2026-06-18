import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioCategoryClient } from "@/components/portfolio/PortfolioCategoryClient";
import { siteConfig } from "@/lib/seo";
import { buildAbsolutePageMetadata } from "@/lib/seo-metadata";
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

  return buildAbsolutePageMetadata({
    absoluteTitle: `${cat.label} · Portfolio · ${siteConfig.name}`,
    description,
    path,
  });
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
  return <PortfolioCategoryClient category={cat} />;
}
