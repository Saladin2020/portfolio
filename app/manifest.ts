import type { MetadataRoute } from 'next';
import { siteText } from '@/content/locales/th/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteText.title,
    short_name: 'Portfolio',
    lang: 'th',
    start_url: '/',
    display: 'browser',
    background_color: '#f5f5f3', // tokens-ignore: color.light.bg
    theme_color: '#131922', // tokens-ignore: color.dark.bg
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/apple-icon.png', type: 'image/png', sizes: '180x180' },
    ],
  };
}
