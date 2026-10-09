import { Anuphan } from 'next/font/google';

/**
 * Anuphan variable (wght 100–700) covers every weight used above the fold:
 * regular 400 (body, lead), medium 500 (h1/h2), semibold 600 (emphasis).
 * One variable face, Thai + Latin. `adjustFontFallback` builds the metric-matched
 * Arial face. `display: swap` lets the browser exchange glyphs without a class
 * change on <html>. Preload stays off: next/font would preload the thai
 * and latin files, and that raised mobile LCP by about 300ms.
 */
export const anuphan = Anuphan({
  subsets: ['thai', 'latin'],
  display: 'swap',
  adjustFontFallback: true,
  preload: false,
  variable: '--font-anuphan',
});
