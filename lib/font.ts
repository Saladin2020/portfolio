import { Anuphan } from 'next/font/google';

/**
 * Anuphan variable (wght 100–700) covers every weight used above the fold:
 * regular 400 (body, lead), medium 500 (h1/h2), semibold 600 (emphasis).
 * Thai + Latin subsets only. `font-display: swap` with the metric-matched
 * fallback. Preload stays off: the layout applies the face only after the
 * text LCP entry, so the woff2 files are not on the critical path.
 */
export const anuphan = Anuphan({
  subsets: ['thai', 'latin'],
  display: 'swap',
  preload: false,
  variable: '--font-anuphan',
});
