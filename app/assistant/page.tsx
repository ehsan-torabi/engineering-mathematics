import type { Metadata } from 'next';
import AppChrome, { AppShell } from '@/components/shell/AppChrome';
import AssistantPageClient from '@/components/ai/AssistantPageClient';
import { SITE_NAME } from '@/lib/seo';

const title = 'دستیار هوشمند ریاضیات مهندسی';
const description =
  'گفت‌وگوی آموزشی با دستیار هوش مصنوعی درس ریاضیات مهندسی: جلسات ذخیره‌شده، هماهنگی پاسخ‌ها با فصل و زیرمبحث فعال، حل گام‌به‌گام سری و تبدیل فوریه، اشتورم-لیوویل و معادله گرما با نگارش فرمول‌های LaTeX.';

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'دستیار هوشمند ریاضیات',
    'چت هوش مصنوعی ریاضیات مهندسی',
    'حل گام‌به‌گام سری فوریه',
    'پرسش و پاسخ اشتورم-لیوویل',
  ],
  alternates: { canonical: '/assistant' },
  openGraph: {
    title,
    description,
    type: 'website',
    locale: 'fa_IR',
    url: '/assistant',
    siteName: SITE_NAME,
  },
  twitter: { card: 'summary', title, description },
};

export default function AssistantPage() {
  return (
    <AppChrome>
      <AppShell>
        <AssistantPageClient />
      </AppShell>
    </AppChrome>
  );
}
