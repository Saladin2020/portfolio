import type { SkillGroupId } from '../../schema';

/** Group labels (AC-SKILL-01), grouped around what the projects actually use. */
export const skillGroupLabels = {
  frameworks: 'ภาษาและเฟรมเวิร์ก',
  data: 'ฐานข้อมูล',
  integrations: 'การเชื่อมต่อและ PWA',
  'ai-tools': 'เครื่องมือ AI',
  devops: 'Deploy',
} satisfies Record<SkillGroupId, string>;
