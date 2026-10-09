# Portfolio

Static Next.js site (Thai, `app/[locale]`). `npm run build` prerenders every route.

## Site URL

Canonical URLs (metadata, sitemap, robots, JSON-LD, Open Graph) resolve in this order:

1. `NEXT_PUBLIC_SITE_URL` if set.
2. `https://${VERCEL_PROJECT_PRODUCTION_URL}` otherwise. Vercel sets that on import, so no env setup is required.
3. Production fails only when neither is set. Local and CI use `http://localhost:3000` (or `VERCEL_URL` on preview).

Copy `.env.example` if you want a custom domain locally. Details are in `docs/RUNBOOK.md`.
