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
 * Adds `js` before paint, then `fonts-active` on the task after the text LCP entry.
 * Applying Anuphan reflows Thai text above a hash target, which leaves the heading
 * under the nav (CI measured ~40px). Re-align the hash once the face is ready.
 * Any scroll this script did not perform counts as the reader (scrollbar, scrollBy,
 * find-in-page). Stop after that post-font align so a late loadingdone cannot jump
 * the page again. Dialog and menu call freeze() so they are never re-aligned.
 */
const bootScript =
  "document.documentElement.classList.add('js');" +
  '(function(){var sealed=false,moved=false,fontsDone=false,listening=false,own=0;' +
  'function seal(){if(sealed)return;sealed=true;removeEventListener("scroll",onScroll);' +
  'if(document.fonts)document.fonts.removeEventListener("loadingdone",kick);removeEventListener("load",kick);}' +
  'function onScroll(){if(!listening||own>0||sealed)return;moved=true;}' +
  'function programmatic(fn){own++;try{fn();}finally{requestAnimationFrame(function(){own=Math.max(0,own-1);});}}' +
  'function align(){if(sealed)return;if(moved){seal();return;}var id=location.hash.slice(1);if(!id){seal();return;}' +
  'var el=document.getElementById(id);if(!el)return;' +
  'programmatic(function(){var root=document.documentElement,prev=root.style.scrollBehavior;root.style.scrollBehavior="auto";el.scrollIntoView({block:"start"});root.style.scrollBehavior=prev;});' +
  'if(fontsDone)seal();}' +
  'function kick(){if(sealed)return;requestAnimationFrame(function(){requestAnimationFrame(align);});}' +
  'function apply(){if(fontsDone&&document.documentElement.classList.contains("fonts-active"))return;' +
  'own++;document.documentElement.classList.add("fonts-active");' +
  'requestAnimationFrame(function(){requestAnimationFrame(function(){own=Math.max(0,own-1);});});' +
  'var ready=document.fonts?document.fonts.ready:Promise.resolve();ready.then(function(){fontsDone=true;if(!sealed)kick();});}' +
  'addEventListener("scroll",onScroll,{passive:true});' +
  'addEventListener("wheel",function(){moved=true;},{passive:true,once:true});' +
  'addEventListener("touchstart",function(){moved=true;},{passive:true,once:true});' +
  'function onKey(e){var k=e.key;if(k===" "||k==="PageDown"||k==="PageUp"||k==="Home"||k==="End"||k.slice(0,5)==="Arrow"){moved=true;removeEventListener("keydown",onKey);}}' +
  'addEventListener("keydown",onKey);' +
  'requestAnimationFrame(function(){requestAnimationFrame(function(){listening=true;});});' +
  'if(document.fonts)document.fonts.addEventListener("loadingdone",kick);' +
  'try{new PerformanceObserver(function(list,obs){if(!list.getEntries().length)return;obs.disconnect();setTimeout(apply,0);}).observe({type:"largest-contentful-paint",buffered:true});}catch(e){}' +
  'setTimeout(apply,4000);addEventListener("load",kick);' +
  'window.__portfolioHashAlign={programmatic:programmatic,freeze:function(){moved=true;seal();}};})();';

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
