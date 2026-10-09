import { Anuphan } from 'next/font/google';

/**
 * Anuphan variable (wght 100–700) covers every weight used above the fold:
 * regular 400 (body, lead), medium 500 (h1/h2), semibold 600 (emphasis).
 * Thai + Latin subsets only. `font-display: swap` with the metric-matched
 * fallback. Preload stays off. The layout applies the face only after load
 * has settled, so the swap is not a second full-document layout during TBT.
 */
export const anuphan = Anuphan({
  subsets: ['thai', 'latin'],
  display: 'swap',
  preload: false,
  variable: '--font-anuphan',
});
