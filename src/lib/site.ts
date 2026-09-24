const configuredUrl = process.env.SITE_URL?.trim();

function resolveSiteUrl() {
  if (!configuredUrl) return undefined;
  const url = new URL(configuredUrl);
  if (!['https:', 'http:'].includes(url.protocol) || url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
    throw new Error('SITE_URL must be an HTTP(S) origin without a path, credentials, query, or fragment.');
  }
  return url;
}

export const siteUrl = resolveSiteUrl();
export const siteTitle = 'Dishan Bashitha — Software Engineer';
export const siteDescription = 'Software engineer based in Sri Lanka building full-stack applications with React, Next.js, TypeScript, and Spring Boot. Explore my projects, skills, and experience.';
