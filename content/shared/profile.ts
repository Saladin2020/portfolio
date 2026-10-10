import type { ProfileData } from '../schema';
import photo from '@/assets/images/profile/photo.jpg';

/**
 * Locale-neutral profile facts, as provided by the site owner (2026-10-09).
 * Resume PDF (C-24) is still omitted, so that CTA stays hidden.
 * Availability and the Facebook contact link are the PO-approved GATE 4 copy.
 */
export const profile = {
  nameEn: 'Salahuddin Benno',
  email: 'negaton.app@gmail.com',
  links: {
    github: 'https://github.com/Saladin2020',
    linkedin: 'https://www.linkedin.com/in/salahuddin-benno-9b7419b9',
    hire: [{ id: 'facebook', url: 'https://www.facebook.com/negaton.man' }],
  },
  photo,
  photoPublicPath: '/images/profile.jpg', // ≤600 px illustration at a stable URL for JSON-LD. OG/Twitter use the designed share card.
  availability: 'both',
} satisfies ProfileData;
