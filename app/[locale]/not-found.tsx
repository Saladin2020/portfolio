import { th } from '@/messages/th';
import { PillLink } from '@/components/ui/Pill';

/** Thai 404 (static). */
export default function NotFound() {
  return (
    <main id="main" className="section-x section-y grid min-h-dvh place-items-center text-center">
      <div className="flex max-w-copy flex-col items-center gap-3">
        <h1 className="type-h2 text-light-text-heading">{th.notFound.title}</h1>
        <p className="text-light-text-secondary">{th.notFound.body}</p>
        <PillLink href="/">{th.notFound.home}</PillLink>
      </div>
    </main>
  );
}
