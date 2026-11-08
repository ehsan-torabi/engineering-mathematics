import type { Metadata } from 'next';
import AppChrome, { AppShell } from '@/components/shell/AppChrome';
import ExamBank from '@/components/exams/ExamBank';

export const metadata: Metadata = {
  title: 'بانک امتحانات | آزمایشگاه تعاملی ریاضیات مهندسی',
  description:
    'همهٔ برگه‌های میان‌ترم و پایان‌ترم ریاضیات مهندسی دانشگاه شهرکرد با حل کامل و راستی‌آزمایی‌شده.',
};

export default function ExamsPage() {
  return (
    <AppChrome>
      <AppShell>
        <ExamBank />
      </AppShell>
    </AppChrome>
  );
}
