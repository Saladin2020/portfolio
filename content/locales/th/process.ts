import type { ProcessStepId, ProcessStepText } from '../../schema';

/**
 * Step titles: UX microcopy. Descriptions only where the project notes / owner decisions back them;
 * "idea" has no source fact, so its description is omitted (title only).
 */
export const processText = {
  idea: { title: 'ไอเดีย' },
  design: {
    title: 'ออกแบบ',
    description: 'ออกแบบหน้าจอด้วย Tailwind CSS และคอมโพเนนต์ shadcn/ui / Radix UI รองรับธีมสว่าง–มืดและภาษาไทย',
  },
  'ai-build': {
    title: 'สร้างด้วย AI agent',
    description: 'สร้างทุกโปรเจกต์ร่วมกับ AI agents (Cursor / Claude) และเก็บกติกาสำหรับ agent ไว้ใน repo เช่น AGENTS.md และ CLAUDE.md (p3, LABWISE)',
    qualityNote: 'เขียนด้วย TypeScript ทุกโปรเจกต์ และใช้ Zod ตรวจสอบข้อมูล (MEMO, LABWISE, signal-controlbridge)',
  },
  test: {
    title: 'ทดสอบ',
    description: 'เขียนชุดทดสอบอัตโนมัติด้วย tsx --test (MEMO และ p3) และให้ CI รันทดสอบ (p3)',
    qualityNote: 'จำกัดอัตราการเรียก endpoint สาธารณะ และเข้ารหัสข้อมูลลับฝั่งเซิร์ฟเวอร์ (p3, signal-controlbridge)',
  },
  deploy: {
    title: 'ส่งมอบ / Deploy',
    description: 'Deploy บน Vercel ใช้ฐานข้อมูล Neon Postgres และงานตั้งเวลาด้วย Vercel Cron (MEMO, p3)',
  },
} satisfies Record<ProcessStepId, ProcessStepText>;
