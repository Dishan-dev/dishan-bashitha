import type { MetadataRoute } from 'next';
import { absoluteUrl, indexable } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  // Preview deployments are kept out of search entirely; production is open to every crawler.
  return indexable
    ? { rules: { userAgent: '*', allow: '/' }, sitemap: absoluteUrl('/sitemap.xml'), host: absoluteUrl('/') }
    : { rules: { userAgent: '*', disallow: '/' } };
}
