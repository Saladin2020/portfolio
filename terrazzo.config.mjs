// Design tokens → CSS. Run: `npm run tokens` (regenerate) / `npm run tokens:check` (drift).
// Source of truth: design/design-tokens.json, a committed copy of the design team's working file
// (kept outside this repo). Refresh the copy with `npm run tokens:sync`.
// Override with TOKENS_PATH if needed.
import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';
import tailwind from '@terrazzo/plugin-tailwind';

const tokensPath = process.env.TOKENS_PATH ?? './design/design-tokens.json';

export default defineConfig({
  tokens: [tokensPath],
  outDir: './styles/generated/',
  plugins: [
    // Every token as a :root variable (--color-base-*, --typography-*, --duration-* …).
    css({ filename: 'tokens.css' }),
    tailwind({
      template: '../tailwind.template.css', // resolved relative to outDir
      filename: 'tailwind-theme.css',
      theme: {
        breakpoint: 'breakpoint.*',
        color: { light: 'color.light.**', dark: 'color.dark.**', status: 'color.status.*' },
        spacing: 'space.*',
        radius: 'radius.*',
        shadow: 'shadow.*',
        ease: 'easing.*',
        text: 'font.size.*',
        'font-weight': 'font.weight.*',
        leading: 'font.line-height.*',
        tracking: 'font.letter-spacing.*',
      },
    }),
  ],
});
