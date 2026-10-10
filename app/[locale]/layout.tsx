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
 * The class is what makes the browser fetch the next/font faces (family names come
 * from `anuphan.style.fontFamily` on `<html data-font-families>`, not a hard-coded
 * string). `document.fonts.ready` captured before that class only covers the
 * fallback, so the re-align stays armed until no face is still `loading`
 * (including heading faces added later), or 6s. The first hash jump is instant.
 * A reader scroll is real input, or a move of more than 96px after the jump
 * settles. The face's own anchoring shift is smaller and is corrected. Dialog
 * and menu call freeze() so they are never re-aligned.
 */
const bootScript =
  "document.documentElement.classList.add('js');" +
  '(function(){var root=document.documentElement,sealed=false,moved=false,fontsDone=false,settled=false,applying=false,trailed=false,own=0,yAtSettle=0;' +
  'if(location.hash)root.style.scrollBehavior="auto";' +
  'function seal(){if(sealed)return;sealed=true;removeEventListener("scroll",onScroll);' +
  'if(document.fonts){document.fonts.removeEventListener("loadingdone",onFont);document.fonts.removeEventListener("loading",onFont);}' +
  'removeEventListener("load",kick);}' +
  'function mark(){moved=true;}' +
  'function onScroll(){if(sealed||own>0||!settled)return;var y=window.scrollY||window.pageYOffset||0;if(Math.abs(y-yAtSettle)>96)moved=true;}' +
  'function programmatic(fn){own++;try{fn();}finally{requestAnimationFrame(function(){own=Math.max(0,own-1);});}}' +
  'function jump(el){var prev=root.style.scrollBehavior;root.style.scrollBehavior="auto";el.scrollIntoView({block:"start"});root.style.scrollBehavior=prev;}' +
  'function align(){if(sealed)return;if(moved){seal();return;}var id=location.hash.slice(1);if(!id){if(fontsDone)seal();return;}' +
  'var el=document.getElementById(id);if(!el)return;programmatic(function(){jump(el);});' +
  'if(fontsDone&&!trailed){trailed=true;requestAnimationFrame(function(){requestAnimationFrame(function(){if(sealed)return;if(moved){seal();return;}' +
  'var again=document.getElementById(id);if(again)programmatic(function(){jump(again);});seal();});});}}' +
  'function kick(){if(sealed||fontsDone)return;requestAnimationFrame(function(){requestAnimationFrame(align);});}' +
  'function onFont(){kick();}' +
  'function settle(){if(settled)return;settled=true;yAtSettle=window.scrollY||window.pageYOffset||0;if(root.style.scrollBehavior==="auto")root.style.scrollBehavior="";}' +
  'function watch(){var id=location.hash.slice(1);if(!id){settle();return;}var last=-1,stable=0,n=0;' +
  '(function tick(){if(settled||sealed)return;var el=document.getElementById(id),y=window.scrollY,top=el?el.getBoundingClientRect().top:1e9;' +
  'var landed=!!el&&y===last&&(y>0||top<window.innerHeight);if(landed)stable++;else stable=0;last=y;n++;' +
  'if((el&&stable>=2)||n>120)settle();else requestAnimationFrame(tick);})();}' +
  'function families(){var raw=root.getAttribute("data-font-families")||"",out=[],cur="",q="",i,c;for(i=0;i<raw.length;i++){c=raw.charAt(i);' +
  'if(q){if(c===q)q="";else cur+=c;}else if(c==="\\""||c==="\'")q=c;else if(c===","){if(cur.trim())out.push(cur.trim());cur="";}else cur+=c;}' +
  'if(cur.trim())out.push(cur.trim());return out;}' +
  'function loadingCount(){var n=0;if(!document.fonts||!document.fonts.forEach)return 0;document.fonts.forEach(function(face){if(face.status==="loading")n++;});return n;}' +
  'function requestFamilies(names){if(!document.fonts||!document.fonts.load)return;for(var i=0;i<names.length;i++){document.fonts.load("1em \\""+names[i].replace(/"/g,"")+"\\"").catch(function(){});}}' +
  'function finishFonts(){if(fontsDone||sealed)return;fontsDone=true;align();}' +
  'function armFonts(){var names=families(),started=Date.now(),saw=false,quiet=0;function sample(){if(fontsDone||sealed)return;var n=loadingCount();' +
  'if(n>0){saw=true;quiet=0;}else if(saw){quiet++;if(quiet>=2){finishFonts();return;}}else if(Date.now()-started>=250){finishFonts();return;}' +
  'requestAnimationFrame(sample);}requestAnimationFrame(function(){requestFamilies(names);requestAnimationFrame(sample);});setTimeout(finishFonts,6000);}' +
  'function apply(){if(applying)return;applying=true;own++;root.classList.add("fonts-active");' +
  'requestAnimationFrame(function(){requestAnimationFrame(function(){own=Math.max(0,own-1);});});armFonts();}' +
  'addEventListener("scroll",onScroll,{passive:true});' +
  'addEventListener("wheel",function(){mark();},{passive:true,once:true});' +
  'addEventListener("touchstart",function(){mark();},{passive:true,once:true});' +
  'function onKey(e){var k=e.key;if((e.ctrlKey||e.metaKey)&&(k==="f"||k==="F")){mark();return;}' +
  'if(k===" "||k==="PageDown"||k==="PageUp"||k==="Home"||k==="End"||k.slice(0,5)==="Arrow"){mark();removeEventListener("keydown",onKey);}}' +
  'addEventListener("keydown",onKey);' +
  'addEventListener("pointerdown",function(e){var t=e.target;if(t===root||t===document.body||e.clientX>=root.clientWidth||e.clientY>=root.clientHeight)mark();},{passive:true});' +
  'if(document.readyState==="loading")addEventListener("DOMContentLoaded",watch);else watch();' +
  'if(document.fonts){document.fonts.addEventListener("loading",onFont);document.fonts.addEventListener("loadingdone",onFont);}' +
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
    <html lang={locale} className={anuphan.variable} data-font-families={anuphan.style.fontFamily} suppressHydrationWarning>
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
