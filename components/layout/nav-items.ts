import type { Messages } from '@/messages/th';

export type NavItem = { id: 'work' | 'process' | 'skills' | 'about' | 'contact'; label: string };

export function navItems(m: Messages): NavItem[] {
  return [
    { id: 'work', label: m.nav.work },
    { id: 'process', label: m.nav.process },
    { id: 'skills', label: m.nav.skills },
    { id: 'about', label: m.nav.about },
    { id: 'contact', label: m.nav.contact },
  ];
}

/** On the home page anchors are `#id`; on sub-pages they point back to `/#id`. */
export const navHref = (id: string, onHome: boolean) => (onHome ? `#${id}` : `/#${id}`);
