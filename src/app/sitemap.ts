import type { MetadataRoute } from 'next';
import { getServerEnv } from '@/lib/server/env';
import { callBackend } from '@/lib/server/backend-client';
import { PORTFOLIO_PROJECTS } from '@/lib/portfolio-data';
import { PaginatedDesigns } from '@/lib/types/design';

async function getDesignSlugs(): Promise<string[]> {
  try {
    const data = await callBackend<PaginatedDesigns>('/designs?pageSize=200');
    return data.designs.map((d) => d.slug);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { APP_ORIGIN } = getServerEnv();
  const designSlugs = await getDesignSlugs();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: APP_ORIGIN, changeFrequency: 'weekly', priority: 1 },
    { url: `${APP_ORIGIN}/designs`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${APP_ORIGIN}/portfolio`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${APP_ORIGIN}/process`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${APP_ORIGIN}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${APP_ORIGIN}/contact`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${APP_ORIGIN}/schedule-a-meeting`, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const portfolioRoutes: MetadataRoute.Sitemap = PORTFOLIO_PROJECTS.map((project) => ({
    url: `${APP_ORIGIN}/portfolio/${project.slug}`,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const designRoutes: MetadataRoute.Sitemap = designSlugs.map((slug) => ({
    url: `${APP_ORIGIN}/designs/${slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...portfolioRoutes, ...designRoutes];
}
