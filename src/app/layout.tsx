import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { indexable, siteDescription, siteName, siteTitle, siteUrl } from "@/lib/site";

const geist = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  // Every absolute URL (canonicals, preview images) resolves against https://dishan.me.
  metadataBase: siteUrl,
  title: { default: siteTitle, template: `%s | ${siteName}` },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: siteName, url: siteUrl.href }],
  creator: siteName,
  publisher: siteName,
  alternates: { canonical: "/" },
  robots: indexable
    ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } }
    : { index: false, follow: false },
  openGraph: {
    type: "profile",
    locale: "en_US",
    siteName,
    title: siteTitle,
    description: siteDescription,
    url: "/",
    firstName: "Dishan",
    lastName: "Bashitha",
    // The preview image comes from app/opengraph-image.tsx (and one per project route).
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  // Optional Search Console HTML-tag verification (DNS verification needs no code).
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
};

export const viewport: Viewport = {
  // Matches the cover's violet so mobile browser chrome blends into the first screen.
  themeColor: "#07041a",
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t;try{t=localStorage.getItem('portfolio-theme')}catch(e){}document.documentElement.dataset.theme=t==='light'||t==='dark'?t:window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'})()` }} />
        {/* Without JavaScript the curtain never lifts and reveal effects never run: show everything. */}
        <noscript><style>{`[data-loader]{display:none!important}[data-reveal]{opacity:1!important;translate:none!important}`}</style></noscript>
      </head>
      <body>
        {children}
        {/* Vercel Web Analytics (enable it in the Vercel project's Analytics tab); served by Vercel itself. */}
        {process.env.VERCEL_ENV === "production" && <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />}
      </body>
    </html>
  );
}
