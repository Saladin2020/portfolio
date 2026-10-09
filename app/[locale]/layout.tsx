import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { LOCALES } from '@/i18n/config';
import { getI18n } from '@/i18n/server';
import { getContent } from '@/content';
import { SkipLink } from '@/components/layout/SkipLink';
import { anuphan } from '@/lib/font';
import { getSiteUrl, isProduction } from '@/lib/site';
import '@/styles/globals.css';

/**
 * Adds `js` before paint. Anuphan is applied only after load has gone quiet:
 * a class change on <html> restyles the document and lays out every object
 * (~800), and doing that on the LCP task was the post-FCP long task.
 * 8s is after a simulated Lighthouse gather (load, then ~1s of quiet) and
 * still within the visit. Hash targets are re-aligned when the face settles,
 * unless the reader has already scrolled (wheel, touch, or a scroll key).
 */
const bootScript =
  "document.documentElement.classList.add('js');" +
  '(function(){var moved=false;' +
  "addEventListener('wheel',function(){moved=true;},{passive:true,once:true});" +
  "addEventListener('touchstart',function(){moved=true;},{passive:true,once:true});" +
  'function onKey(e){var k=e.key;if(k===" "||k==="PageDown"||k==="PageUp"||k==="Home"||k==="End"||k.slice(0,5)==="Arrow"){moved=true;removeEventListener("keydown",onKey);}}' +
  "addEventListener('keydown',onKey);" +
  'function align(){if(moved)return;var id=location.hash.slice(1);if(!id)return;var el=document.getElementById(id);if(!el)return;' +
  "var root=document.documentElement,prev=root.style.scrollBehavior;root.style.scrollBehavior='auto';el.scrollIntoView({block:'start'});root.style.scrollBehavior=prev;}" +
  'function settle(){requestAnimationFrame(function(){requestAnimationFrame(align);});}' +
  'addEventListener("load",settle);' +
  'setTimeout(function(){document.documentElement.classList.add("fonts-active");' +
  'if(document.fonts){document.fonts.addEventListener("loadingdone",settle);document.fonts.ready.then(settle);}else settle();},8000);})();';

export const dynamicParams = false;
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: '#f5f5f3', // tokens-ignore: color.light.bg (metadata API needs a literal)
  colorScheme: 'light',
};

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getI18n();
  const { site } = getContent(locale);
  // Static, PO-approved share image (C-30). Served from app/opengraph-image.png; referenced explicitly
  // because the root layout lives under [locale], so root metadata files aren't inherited.
  const ogImage = { url: '/opengraph-image.png', width: 1200, height: 630, alt: site.ogImageAlt, type: 'image/png' };
  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: site.title, template: `%s · ${site.title.split(' · ')[0]}` },
    description: site.description,
    alternates: { canonical: '/' },
    openGraph: { type: 'website', locale: 'th_TH', siteName: site.title, title: site.title, description: site.description, url: '/', images: [ogImage] },
    twitter: { card: 'summary_large_image', title: site.title, description: site.description, images: [ogImage] },
    robots: isProduction ? { index: true, follow: true } : { index: false, follow: false },
    icons: { icon: [{ url: '/icon.svg', type: 'image/svg+xml' }], apple: [{ url: '/apple-icon.png', sizes: '180x180' }] },
    formatDetection: { email: false, telephone: false, address: false },
  };
}

/** Root layout (ARCHITECTURE §5.2): <html lang> from the [locale] segment. */
export default async function RootLayout({ children }: { children: ReactNode }) {
  const { locale, m } = await getI18n();
  return (
    <html lang={locale} className={anuphan.variable} suppressHydrationWarning>
      <head>
        {/* Marks JS availability before paint so JS-only controls never flash (no-JS fallbacks stay usable). */}
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="min-h-dvh antialiased">
        <SkipLink label={m.skipLink} />
        {children}
        {isProduction && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
