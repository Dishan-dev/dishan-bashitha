import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteUrl, siteTitle, siteDescription } from "@/lib/site";

const geist = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: siteUrl ?? new URL("http://localhost:3000"),
  title: siteTitle,
  description: siteDescription,
  applicationName: "Dishan Bashitha Portfolio",
  authors: [{ name: "Dishan Bashitha" }],
  creator: "Dishan Bashitha",
  alternates: siteUrl ? { canonical: "/" } : undefined,
  robots: { index: Boolean(siteUrl), follow: Boolean(siteUrl) },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Dishan Bashitha",
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    images: [{ url: "/social-preview.png", width: 1200, height: 630, alt: "Dishan Bashitha — Software Engineer. Building digital experiences that make an impact." }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/social-preview.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfbfe" },
    { media: "(prefers-color-scheme: dark)", color: "#17131e" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t;try{t=localStorage.getItem('portfolio-theme')}catch(e){}document.documentElement.dataset.theme=t==='light'||t==='dark'?t:window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'})()` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
