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

1. Set `SITE_URL` in the host's production build environment to the final HTTPS origin, for example `https://your-domain.com` (no path). For local production testing, copy `.env.example` to `.env.local` and fill it in.
2. Install with `npm ci`.
3. Run `npm run lint`, `npm run typecheck`, and `npm run build`.
4. Start with `npm start`, or let the hosting platform run its Next.js integration.

`SITE_URL` controls canonical links, social image URLs, robots.txt, and sitemap.xml. Rebuild after changing it. If it is unset, indexing is disabled and the sitemap is empty; set it before the public launch. Keep it unset for non-public previews.

The production app includes SVG and ICO favicons, an Apple touch icon, home-screen icons, a web manifest, a 1200×630 social preview, and baseline response headers. The manifest does not provide offline support.

## Content before launch

- Project demo/repository links are optional in `src/data/projects.ts`. Add actual URLs to `liveUrl` and `githubUrl`; absent links are hidden.
- Résumé buttons currently open an email request. To offer a download, add your real résumé to `public/resume.pdf` and update the links in `AboutScene.tsx` and `ContactScene.tsx`.
- Verify the email and social profile URLs in `ContactScene.tsx` belong to you and are current.

## Verify the deployed site

Check `/`, `/favicon.ico`, `/icon.svg`, `/apple-icon.png`, `/manifest.webmanifest`, `/social-preview.png`, `/robots.txt`, and `/sitemap.xml`. Confirm the canonical and Open Graph URLs use the public domain, test section navigation and both themes, and open the site on a phone.
