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
 * under the nav (CI measured ~26–40px). The first hash jump is instant: a smooth
 * fragment scroll on the long page lasts ~1.3s and must not cancel the re-align.
 * A scroll counts as the reader only after real input (wheel, touch, scroll keys,
 * scrollbar pointerdown, Ctrl/Cmd+F) or when it is a scroll this script did not
 * cause after that jump has settled (scrollbar drag, find-in-page, scrollBy).
 * Stop after the post-font align. Dialog and menu call freeze() so they are never re-aligned.
 */
const bootScript =
  "document.documentElement.classList.add('js');" +
  '(function(){var root=document.documentElement,sealed=false,moved=false,fontsDone=false,settled=false,applying=false,trailed=false,own=0;' +
  'if(location.hash)root.style.scrollBehavior="auto";' +
  'function seal(){if(sealed)return;sealed=true;removeEventListener("scroll",onScroll);' +
  'if(document.fonts)document.fonts.removeEventListener("loadingdone",kick);removeEventListener("load",kick);}' +
  'function mark(){moved=true;}' +
  'function onScroll(){if(sealed||own>0||!settled)return;moved=true;}' +
  'function programmatic(fn){own++;try{fn();}finally{requestAnimationFrame(function(){own=Math.max(0,own-1);});}}' +
  'function jump(el){var prev=root.style.scrollBehavior;root.style.scrollBehavior="auto";el.scrollIntoView({block:"start"});root.style.scrollBehavior=prev;}' +
  'function align(){if(sealed)return;if(moved){seal();return;}var id=location.hash.slice(1);if(!id){seal();return;}' +
  'var el=document.getElementById(id);if(!el)return;programmatic(function(){jump(el);});' +
  'if(fontsDone&&!trailed){trailed=true;requestAnimationFrame(function(){requestAnimationFrame(function(){if(sealed)return;if(moved){seal();return;}' +
  'var again=document.getElementById(id);if(again)programmatic(function(){jump(again);});seal();});});}}' +
  'function kick(){if(sealed)return;requestAnimationFrame(function(){requestAnimationFrame(align);});}' +
  'function settle(){if(settled)return;settled=true;if(root.style.scrollBehavior==="auto")root.style.scrollBehavior="";}' +
  'function watch(){var id=location.hash.slice(1);if(!id){settle();return;}var last=-1,stable=0,n=0;' +
  '(function tick(){if(settled||sealed)return;var el=document.getElementById(id),y=window.scrollY,top=el?el.getBoundingClientRect().top:1e9;' +
  'var landed=!!el&&y===last&&(y>0||top<window.innerHeight);if(landed)stable++;else stable=0;last=y;n++;' +
  'if((el&&stable>=2)||n>120)settle();else requestAnimationFrame(tick);})();}' +
  'function apply(){if(applying||(fontsDone&&root.classList.contains("fonts-active")))return;applying=true;' +
  'var ready=document.fonts?document.fonts.ready:Promise.resolve();ready.then(function(){own++;root.classList.add("fonts-active");fontsDone=true;' +
  'if(!sealed)align();requestAnimationFrame(function(){requestAnimationFrame(function(){own=Math.max(0,own-1);});});});}' +
  'addEventListener("scroll",onScroll,{passive:true});' +
  'addEventListener("wheel",function(){mark();},{passive:true,once:true});' +
  'addEventListener("touchstart",function(){mark();},{passive:true,once:true});' +
  'function onKey(e){var k=e.key;if((e.ctrlKey||e.metaKey)&&(k==="f"||k==="F")){mark();return;}' +
  'if(k===" "||k==="PageDown"||k==="PageUp"||k==="Home"||k==="End"||k.slice(0,5)==="Arrow"){mark();removeEventListener("keydown",onKey);}}' +
  'addEventListener("keydown",onKey);' +
  'addEventListener("pointerdown",function(e){var t=e.target;if(t===root||t===document.body||e.clientX>=root.clientWidth||e.clientY>=root.clientHeight)mark();},{passive:true});' +
  'if(document.readyState==="loading")addEventListener("DOMContentLoaded",watch);else watch();' +
  'if(document.fonts)document.fonts.addEventListener("loadingdone",kick);' +
  'try{new PerformanceObserver(function(list,obs){if(!list.getEntries().length)return;obs.disconnect();setTimeout(apply,0);}).observe({type:"largest-contentful-paint",buffered:true});}catch(e){}' +
  'setTimeout(apply,4000);addEventListener("load",kick);' +
  'window.__portfolioHashAlign={programmatic:programmatic,freeze:function(){mark();seal();}};})();';

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
