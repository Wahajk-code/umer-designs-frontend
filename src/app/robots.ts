import type { MetadataRoute } from 'next';
import { getServerEnv } from '@/lib/server/env';

export default function robots(): MetadataRoute.Robots {
  const { APP_ORIGIN } = getServerEnv();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/dashboard', '/modifications', '/pay', '/api'],
    },
    sitemap: `${APP_ORIGIN}/sitemap.xml`,
  };
}
