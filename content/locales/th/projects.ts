import type { ProjectText } from '../../schema';
import type { ProjectId } from '../../shared/projects';

/**
 * Thai copy written only from facts observed in the project fact sheet (live site, README,
 * package.json). No outcomes, user numbers or live-billing/AI claims (PO decision). "โจทย์" restates
 * what each site/README says it is for; nothing beyond that is inferred.
 */
const SOLO = 'พัฒนาคนเดียวทั้งโปรเจกต์ โดยทำงานร่วมกับ AI agents (Cursor / Claude)';
const LOGIN = 'ต้องเข้าสู่ระบบ';

export const projectText = {
  memo: {
    title: 'MEMO',
    problem: 'รวมข้อมูล เครื่องมือ และการวิเคราะห์การลงทุนไว้ในที่เดียว: ติดตามพอร์ต แจ้งเตือนราคา ดูสกรีนหุ้น และอ่านบทวิเคราะห์',
    solution:
      'แพลตฟอร์มสมาชิกด้านการลงทุนแบบ Free / Plus / Pro มีพอร์ตที่บันทึกซื้อ–ขายและถัวเฉลี่ยต้นทุน แจ้งเตือนราคาที่ตรวจด้วย cron รายวัน สกรีนหุ้น US / SET / Crypto บทวิเคราะห์ตามระดับสมาชิกพร้อมระบบเขียนบทความสำหรับแอดมิน ระบบสมาชิกเชื่อมกับ Stripe และติดตั้งเป็น PWA ได้',
    role: SOLO,
    imageAlt: {
      landing: 'หน้าแรกของ MEMO หัวข้อ “ลงทุนอย่างมีระบบ” พร้อมปุ่มเริ่มต้นใช้งานและดูฟีเจอร์',
    },
  },
  p3: {
    title: 'p3',
    problem: 'สร้างพอร์ตหุ้นสหรัฐฯ จำลองด้วยเงิน $1000 เผยแพร่ได้ทันทีโดยไม่ต้องล็อกอิน แล้วไต่อันดับจากราคาจริง',
    solution:
      'ทุกพอร์ตมีหน้าสาธารณะและลิงก์แก้ไขลับ กู้คืนด้วยวลี 12 คำที่เก็บเป็นค่าแฮช SHA-256 เลือกอวาตาร์พิกเซลได้ 100 แบบ มีลีดเดอร์บอร์ดรายสัปดาห์ รายเดือน และรายปี ดูเอลและชาเลนจ์ รีบาลานซ์ด้วยหุ้นเศษส่วน แจ้งเตือน Web Push สำหรับพอร์ตที่ติดดาว ติดตั้งเป็น PWA ได้ และสลับภาษาไทย / อังกฤษ',
    role: SOLO,
    imageAlt: {
      home: 'หน้าแรกของ p3 โลโก้ตัวใหญ่ ป้าย No login, $1000 paper และ US stocks ล้อมด้วยอวาตาร์พิกเซล',
    },
  },
  labwise: {
    title: 'LABWISE',
    problem: 'ระบบบริหารความเสี่ยงและอุบัติการณ์ของห้องปฏิบัติการเทคนิคการแพทย์',
    solution:
      'เว็บระบบที่ไล่ตามขั้นตอน รายงาน → ประเมิน → วิเคราะห์ → แก้ไข → ติดตามผล แบ่งสิทธิ์ Admin / Manager / Staff / Viewer นำเข้ารายงานความเสี่ยงจากไฟล์ Excel มีแดชบอร์ดและหน้าวิเคราะห์แนวโน้มกับ Pareto และติดตั้งเป็น PWA ได้',
    role: SOLO,
    liveNote: LOGIN,
    imageAlt: {
      dashboard: 'แดชบอร์ด LABWISE แสดงจำนวนอุบัติการณ์ เหตุการณ์เกือบพลาด และรายการที่ต้องติดตาม ข้อมูลระบุตัวตนถูกเบลอ',
      incidents: 'หน้ารายการอุบัติการณ์ของ LABWISE พร้อมตัวกรองตามความรุนแรง สถานะ เวร และหมวด ข้อมูลระบุตัวตนถูกเบลอ',
      analysis: 'หน้าวิเคราะห์ของ LABWISE กราฟแนวโน้ม 12 เดือนและกราฟ Pareto แยกตามหมวดอุบัติการณ์',
    },
  },
  'signal-controlbridge': {
    title: 'signal-controlbridge',
    problem: 'ส่งสัญญาณแจ้งเตือน (alert) จาก TradingView เข้า Telegram',
    solution:
      'เว็บแอปที่ให้สร้าง “ช่อง” แต่ละช่องมี webhook URL พร้อม secret ของตัวเอง รับ alert จาก TradingView แล้วส่งข้อความที่จัดรูปแบบไปยัง Telegram เทมเพลตรองรับตัวแปรอย่าง {{ticker}} และเงื่อนไข if / elif / else, bot token เข้ารหัสฝั่งเซิร์ฟเวอร์ด้วย AES-256-GCM มีแดชบอร์ดสถิติการเรียก webhook บัญชีใหม่ต้องได้รับอนุมัติจากแอดมิน มีคู่มือในแอป และสลับภาษาไทย / อังกฤษ',
    role: SOLO,
    liveNote: LOGIN,
    imageAlt: {
      dashboard: 'แดชบอร์ด signal-controlbridge แสดงสถานะช่อง สุขภาพฐานข้อมูล กราฟจำนวน webhook รายเดือน และรายการเรียกล่าสุด',
      channel: 'หน้าตั้งค่าช่องของ signal-controlbridge มี webhook URL (เบลอ) bot token ที่ซ่อนไว้ ปุ่มพรีเซ็ต และเทมเพลตข้อความ',
    },
  },
} satisfies Record<ProjectId, ProjectText>;
