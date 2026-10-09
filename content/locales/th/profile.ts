import type { ProfileText } from '../../schema';

/**
 * Sources: the owner's profile notes (names, decisions incl. the tagline) and the project fact sheet
 * (stack and workflow facts used in the bio). Fields without a source fact are omitted and their UI is hidden:
 * valueProp (C-06), roleCity / rolePreferences (C-28).
 */
export const profileText = {
  fullName: 'ซอลาฮุดดีน เบนโน',
  positioning: 'AI-native builder',
  // PO decision 2026-10-09 14:14 ICT, verbatim.
  headline: [
    'สร้างเว็บ โปรแกรม และแอปที่ใช้งานได้จริง — เร็วขึ้นด้วย ',
    { text: 'AI agents', lang: 'en', emphasis: 'gradient' },
    ' ควบคุมคุณภาพด้วยมือนักพัฒนา',
  ],
  bio: 'นักพัฒนาที่สร้างผลงานทั้ง 4 ชิ้นในหน้านี้คนเดียว โดยทำงานร่วมกับ AI agents (Cursor / Claude) ทุกโปรเจกต์ใช้ Next.js, React, TypeScript และ Tailwind CSS ใช้ฐานข้อมูล Neon Postgres และ deploy ใช้งานจริงบน Vercel',
  jobTitle: 'AI-native builder',
  photoAlt: 'รูปถ่ายของซอลาฮุดดีน เบนโน สวมแว่นกรอบกลมและเสื้อเชิ้ตสีกรมท่า',
  availabilityLabel: {
    freelance: 'รับงานฟรีแลนซ์',
    'full-time': 'เปิดรับงานประจำ',
    both: 'รับทั้งงานฟรีแลนซ์และงานประจำ',
    'not-available': 'ยังไม่รับงานใหม่ในตอนนี้',
  },
  hireLabels: {},
} satisfies ProfileText;
