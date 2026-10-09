'use client';

import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { X } from 'lucide-react';
import { projects } from '@/content/shared/projects';
import { projectText } from '@/content/locales/th/projects';
import type { ProjectText } from '@/content/schema';
import { th } from '@/messages/th';
import { ProjectDetail } from './ProjectDetail';

const roots = new Map<string, Root>();
const textById = projectText as Record<string, ProjectText>;

/**
 * Builds one project dialog the first time it is opened.
 * The home page does not ship the four detail bodies (BUG-01): they were a large slice of
 * the document's style and layout cost. Card links stay real `/work/<slug>` URLs for no-JS.
 */
export function ensureProjectDialog(slug: string): HTMLDialogElement | null {
  const existing = document.getElementById(`project-dialog-${slug}`);
  if (existing instanceof HTMLDialogElement) return existing;

  const data = projects.find((p) => p.id === slug);
  const text = textById[slug];
  if (!data || !text) return null;

  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  flushSync(() => {
    root.render(
      <dialog
        id={`project-dialog-${slug}`}
        aria-labelledby={`dialog-${slug}-title`}
        className="project-dialog w-full max-w-nav rounded-panel bg-light-surface p-0 text-light-text-primary shadow-high"
      >
        <div className="sticky top-0 z-10 flex justify-end border-b border-light-border-subtle bg-light-surface p-2">
          <form method="dialog">
            <button
              type="submit"
              aria-label={th.work.close}
              className="inline-flex size-touch items-center justify-center rounded-full border-2 border-light-action-secondary-border text-light-action-secondary-text hover:bg-light-muted"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </form>
        </div>
        <div className="p-4 lg:p-6">
          <ProjectDetail project={{ ...data, text }} m={th} headingLevel="h2" idPrefix={`dialog-${slug}`} />
        </div>
      </dialog>,
    );
  });
  roots.set(slug, root);
  const dialog = host.querySelector('dialog');
  return dialog instanceof HTMLDialogElement ? dialog : null;
}
