import type { NextConfig } from 'next';

/**
 * Static-only site (ARCHITECTURE §2.1, §5.2).
 * Thai is served unprefixed: `/` → `/th`, `/work/:slug` → `/th/work/:slug` (rewrites);
 * prefixed URLs 308 to the unprefixed canonical ones (redirects).
 */
const isDev = process.env.NODE_ENV === 'development';

/**
 * Content-Security-Policy (SECURITY_REVIEW F-04).
 * - script-src keeps 'unsafe-inline': the pages are prerendered once at build time, and Next.js
 *   inlines its RSC payload (`self.__next_f.push(...)`) plus our tiny `html.js` toggle. A nonce
 *   needs per-request rendering (breaks the static-only rule), and a hash list would have to be
 *   computed per page after the build. Adding even one hash would also make browsers ignore
 *   'unsafe-inline' and block Next's own inline scripts. Everything else is locked to 'self'.
 * - JSON-LD (`type="application/ld+json"`) is a data block, not executed, so CSP doesn't apply.
 * - Vercel Analytics / Speed Insights load from same-origin `/_vercel/*`, covered by 'self'.
 * - next/font is self-hosted (font-src 'self'); next/image is same-origin, blur placeholders are
 *   data: URLs (img-src data:) set via inline style attributes (style-src 'unsafe-inline').
 * - `next dev` needs 'unsafe-eval' (React debugging); it is added only in development.
 * - upgrade-insecure-requests is omitted in development so http://localhost keeps working.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  // Explicit (Vercel also adds HSTS); browsers ignore it over plain-http localhost.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Thai 404 for unmatched URLs: the root layout lives under the dynamic [locale] segment (§5.2 fallback).
  experimental: { globalNotFound: true },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [60, 75],
  },
  async redirects() {
    return [
      { source: '/favicon.ico', destination: '/icon.svg', permanent: true },
      { source: '/th', destination: '/', permanent: true },
      { source: '/th/work/:slug', destination: '/work/:slug', permanent: true },
      { source: '/work', destination: '/#work', permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/th' },
        { source: '/work/:slug', destination: '/th/work/:slug' },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
