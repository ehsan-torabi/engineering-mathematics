import AppChrome, { AppShell } from '@/components/shell/AppChrome';
import CourseHome from '@/components/home/CourseHome';
import CourseSeoContent from '@/components/seo/CourseSeoContent';
import { CURRICULUM_MODULES } from '@/lib/curriculum-data';
import {
  HOME_FAQ,
  SITE_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
  plainText,
} from '@/lib/seo';

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Course',
      '@id': absoluteUrl('/#course'),
      name: 'ریاضیات مهندسی، آنالیز فوریه و معادلات دیفرانسیل جزئی',
      description: SITE_DESCRIPTION,
      inLanguage: 'fa-IR',
      url: absoluteUrl('/'),
      educationalLevel: 'کارشناسی',
      teaches: [
        'سری فوریه',
        'انتگرال فوریه',
        'تبدیل فوریه',
        'مسئله اشتورم-لیوویل',
        'معادله گرما',
        'معادلات دیفرانسیل جزئی',
      ],
      provider: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: absoluteUrl('/'),
      },
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'online',
        inLanguage: 'fa-IR',
      },
      syllabusSections: CURRICULUM_MODULES.map((mod) => ({
        '@type': 'Syllabus',
        name: mod.title,
        description: plainText(mod.subtitle),
        url: absoluteUrl(`/module/${mod.id}`),
      })),
    },
    {
      '@type': 'FAQPage',
      '@id': absoluteUrl('/#faq'),
      inLanguage: 'fa-IR',
      mainEntity: HOME_FAQ.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    },
  ],
};

export default function EngineeringMathHomePage() {
  return (
    <AppChrome>
      <AppShell>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
        />
        <CourseHome />
        <CourseSeoContent />
      </AppShell>
    </AppChrome>
  );
}
