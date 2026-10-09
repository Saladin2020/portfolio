import type { RichText as RichTextType } from '@/content/schema';
import { cx } from './cx';

/** Renders RichText segments: gradient keyword (scene-aware), strong, and lang="en" passages. */
export function RichText({ value, scene = 'light', animate = false }: { value: RichTextType; scene?: 'light' | 'dark'; animate?: boolean }) {
  return (
    <>
      {value.map((seg, i) => {
        if (typeof seg === 'string') return <span key={i}>{seg}</span>;
        const cls = cx(
          seg.emphasis === 'gradient' && (scene === 'dark' ? 'text-emphasis-dark' : 'text-emphasis-light'),
          seg.emphasis === 'gradient' && animate && 'motion-shimmer',
          seg.emphasis === 'strong' && 'font-semibold',
          'box-decoration-clone',
        );
        return seg.emphasis === 'strong' ? (
          <strong key={i} lang={seg.lang} className={cls}>
            {seg.text}
          </strong>
        ) : (
          <span key={i} lang={seg.lang} className={cls}>
            {seg.text}
          </span>
        );
      })}
    </>
  );
}

export function richTextToString(value: RichTextType): string {
  return value.map((s) => (typeof s === 'string' ? s : s.text)).join('');
}
