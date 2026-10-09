import type { ProfileData } from '../schema';
import photo from '@/assets/images/profile/photo.jpg';

/**
 * Locale-neutral profile facts, as provided by the site owner (2026-10-09).
 * Not provided → omitted (UI hidden): hire-platform links (C-23), resume PDF (C-24), availability (C-26).
 */
export const profile = {
  nameEn: 'Salahuddin Benno',
  email: 'negaton.app@gmail.com',
  links: {
    github: 'https://github.com/Saladin2020',
    linkedin: 'https://www.linkedin.com/in/salahuddin-benno-9b7419b9',
    hire: [],
  },
  photo,
  photoPublicPath: '/images/profile.jpg', // 600 px copy at a stable URL for JSON-LD / OG consumers
} satisfies ProfileData;
