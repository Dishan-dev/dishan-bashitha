import type { MetadataRoute } from 'next';
import { projects } from '@/data/projects';
import { absoluteUrl } from '@/lib/site';

// Every real, canonical page: the portfolio and one page per case study. No lastModified is
// given because the content carries no reliable edit dates, and a build timestamp would claim
// every page changed on every deploy.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl('/'), priority: 1 },
    ...projects.map(project => ({ url: absoluteUrl(`/projects/${project.slug}`), priority: 0.8 })),
  ];
}
