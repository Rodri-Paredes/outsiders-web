import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OUTSIDERS - Urban Streetwear',
    short_name: 'OUTSIDERS',
    description: 'Ropa urbana para los que se atreven a ser diferentes. Diseños únicos y drops exclusivos.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'portrait',
    icons: [
      {
        src: '/logos/logo-negro.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/logos/logo-negro.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  };
}
