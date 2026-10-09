import localFont from 'next/font/local';

/**
 * Anuphan variable (wght 100–700), Thai and Latin subsets only.
 * Two next/font/google calls share one family name in this Next version, so
 * font-display cannot differ. Local faces keep one file per subset and give
 * the hero heading its own family. The same file bytes are emitted once.
 * Preload stays off.
 * The metric-matched fallback is "Anuphan Local" after both subsets. A
 * size-adjust face between them would answer Latin before the Latin file.
 */
export const anuphanThai = localFont({
  src: [{ path: '../assets/fonts/anuphan-thai.woff2', weight: '100 700', style: 'normal' }],
  display: 'swap',
  adjustFontFallback: false,
  preload: false,
  variable: '--font-anuphan-thai',
  declarations: [{ prop: 'unicode-range', value: 'U+02D7, U+0303, U+0331, U+0E01-0E5B, U+200C-200D, U+25CC' }],
});

export const anuphanLatin = localFont({
  src: [{ path: '../assets/fonts/anuphan-latin.woff2', weight: '100 700', style: 'normal' }],
  display: 'swap',
  adjustFontFallback: false,
  preload: false,
  variable: '--font-anuphan-latin',
  declarations: [{ prop: 'unicode-range', value: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' }],
});

/** Hero h1 only. Optional: a cached face paints immediately; a late file does not repaint the LCP element. */
export const anuphanHeadingThai = localFont({
  src: [{ path: '../assets/fonts/anuphan-thai.woff2', weight: '100 700', style: 'normal' }],
  display: 'optional',
  adjustFontFallback: false,
  preload: false,
  variable: '--font-anuphan-heading-thai',
  declarations: [{ prop: 'unicode-range', value: 'U+02D7, U+0303, U+0331, U+0E01-0E5B, U+200C-200D, U+25CC' }],
});

export const anuphanHeadingLatin = localFont({
  src: [{ path: '../assets/fonts/anuphan-latin.woff2', weight: '100 700', style: 'normal' }],
  display: 'optional',
  adjustFontFallback: false,
  preload: false,
  variable: '--font-anuphan-heading-latin',
  declarations: [{ prop: 'unicode-range', value: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD' }],
});
