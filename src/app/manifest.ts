import type { MetadataRoute } from 'next';
import { siteDescription } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Dishan Bashitha — Portfolio',
    short_name: 'Dishan',
    description: siteDescription,
    lang: 'en',
    start_url: '/',
    scope: '/',
    display: 'browser',
    background_color: '#17131e',
    theme_color: '#7652d4',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
