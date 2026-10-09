import type { Metadata } from 'next';
import Link from 'next/link';
import { anuphan } from '@/lib/font';
import { getSiteUrl } from '@/lib/site';
import { th } from '@/messages/th';
import '@/styles/globals.css';

/** Thai 404 for URLs that match no route, incl. unknown locales/slugs (ARCHITECTURE §5.2 fallback). */

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: th.notFound.title,
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="th" className={anuphan.variable}>
      <body>
        <main id="main" className="section-x section-y grid min-h-dvh place-items-center text-center">
          <div className="flex max-w-copy flex-col items-center gap-3">
            <h1 className="type-h2 text-light-text-heading">{th.notFound.title}</h1>
            <p className="text-light-text-secondary">{th.notFound.body}</p>
            <Link
              href="/"
              className="inline-flex min-h-control items-center rounded-full bg-light-action-primary-bg px-4 type-label text-light-action-primary-text"
            >
              {th.notFound.home}
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
