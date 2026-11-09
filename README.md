# Dishan Bashitha portfolio

Next.js App Router portfolio with light/dark themes and animated sections.

## Development

Use Node.js 22 or newer and npm.

```sh
npm ci
npm run dev
```

## Deploy

Deploy to a host that supports Next.js or a Node.js server. This project uses Next.js image optimization; do not publish the source or `.next` directory as a plain static website.

1. The canonical origin is `https://dishan.me` (set in `src/lib/site.ts`). `SITE_URL` can override it, for example for a local production test; it must be an HTTPS origin without a path.
2. Install with `npm ci`.
3. Run `npm run lint`, `npm run typecheck`, and `npm run build`.
4. Start with `npm start`, or let the hosting platform run its Next.js integration.

The canonical origin drives canonical links, social image URLs, structured data, robots.txt and sitemap.xml. Only the production deployment is indexable: Vercel preview deployments (`VERCEL_ENV` other than `production`) send `noindex` and a disallow-all robots.txt. The previous address, `dishan-bashitha.vercel.app`, redirects permanently to `https://dishan.me` (see `next.config.ts`). Optionally set `GOOGLE_SITE_VERIFICATION` to emit a Search Console verification tag.

The production app includes SVG and ICO favicons, an Apple touch icon, home-screen icons, a web manifest, a 1200×630 social preview, and baseline response headers. The manifest does not provide offline support.

## Content before launch

- Project demo/repository links are optional in `src/data/projects.ts`. Add actual URLs to `liveUrl` and `githubUrl`; absent links are hidden.
- Résumé buttons currently open an email request. To offer a download, add your real résumé to `public/resume.pdf` and update the links in `AboutScene.tsx` and `ContactScene.tsx`.
- Verify the email and social profile URLs in `ContactScene.tsx` belong to you and are current.

## Verify the deployed site

Check `/`, `/favicon.ico`, `/icon.svg`, `/apple-icon.png`, `/manifest.webmanifest`, `/social-preview.png`, `/robots.txt`, and `/sitemap.xml`. Confirm the canonical and Open Graph URLs use the public domain, test section navigation and both themes, and open the site on a phone.
