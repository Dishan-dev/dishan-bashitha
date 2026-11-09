// The canonical origin. SITE_URL can override it (for example a local production test), but every
// absolute URL the site emits defaults to https://dishan.me.
const configuredUrl = process.env.SITE_URL?.trim() || 'https://dishan.me';

function resolveSiteUrl() {
  const url = new URL(configuredUrl);
  if (!['https:', 'http:'].includes(url.protocol) || url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
    throw new Error('SITE_URL must be an HTTP(S) origin without a path, credentials, query, or fragment.');
  }
  return url;
}

export const siteUrl = resolveSiteUrl();

/**
 * Only the production deployment is indexable. Vercel preview deployments (and their unique
 * *.vercel.app URLs) stay out of search results; local production builds count as production.
 */
export const indexable = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === 'production' : process.env.NODE_ENV === 'production';

/** The previous address, permanently redirected to the canonical domain. */
export const legacyHost = 'dishan-bashitha.vercel.app';

export const absoluteUrl = (path = '/') => new URL(path, siteUrl).href;

export const siteName = 'Dishan Bashitha';
export const siteTitle = 'Dishan Bashitha | Software Engineer & Developer';
export const siteDescription = "Software engineer in Sri Lanka building full-stack web applications with React, Next.js, TypeScript and Spring Boot. Explore Dishan Bashitha's projects and experience.";
