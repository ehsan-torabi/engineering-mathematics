import type { Metadata } from 'next';
import AppChrome, { AppShell } from '@/components/shell/AppChrome';
import ExamBank from '@/components/exams/ExamBank';
import ExamsSeoContent from '@/components/seo/ExamsSeoContent';
import { EXAM_PAPERS, TOTAL_EXAM_QUESTIONS } from '@/lib/exams';
import { SITE_NAME, absoluteUrl } from '@/lib/seo';

const title = 'بانک امتحانات ریاضیات مهندسی با حل کامل';
const description = `${EXAM_PAPERS.length} برگهٔ میان‌ترم و پایان‌ترم ریاضیات مهندسی دانشگاه شهرکرد، شامل ${TOTAL_EXAM_QUESTIONS} پرسش با حل گام‌به‌گام و راستی‌آزمایی‌شده: سری فوریه، تبدیل فوریه، اشتورم-لیوویل و معادله گرما.`;

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    'نمونه سوال ریاضیات مهندسی',
    'امتحان ریاضیات مهندسی با جواب',
    'سوالات سری فوریه با حل',
    'امتحان معادله گرما',
    'دانشگاه شهرکرد ریاضیات مهندسی',
  ],
  alternates: { canonical: '/exams' },
  openGraph: {
    title,
    description,
    type: 'website',
    locale: 'fa_IR',
    url: '/exams',
    siteName: SITE_NAME,
  },
  twitter: { card: 'summary_large_image', title, description },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'بانک امتحانات ریاضیات مهندسی',
  inLanguage: 'fa-IR',
  numberOfItems: EXAM_PAPERS.length,
  itemListElement: EXAM_PAPERS.map((paper, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'LearningResource',
      name: `${paper.university} · ${paper.title}، ${paper.semester}`,
      description: `${paper.questions.length} پرسش حل‌شده در موضوع‌های ${Array.from(new Set(paper.questions.map((q) => q.topic))).join('، ')}.`,
      learningResourceType: 'آزمون',
      inLanguage: 'fa-IR',
      isAccessibleForFree: true,
      url: absoluteUrl('/exams'),
    },
  })),
};

export default function ExamsPage() {
  return (
    <AppChrome>
      <AppShell>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ExamBank />
        <ExamsSeoContent />
      </AppShell>
    </AppChrome>
  );
}
