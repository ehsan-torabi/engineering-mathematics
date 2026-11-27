import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CURRICULUM_MODULES, ModuleId } from '@/lib/curriculum-data';
import { BASE_KEYWORDS, SITE_NAME, absoluteUrl, plainText } from '@/lib/seo';
import AppChrome, { AppShell } from '@/components/shell/AppChrome';
import ModulePageClient from '@/components/module/ModulePageClient';
import ModuleSeoContent from '@/components/seo/ModuleSeoContent';

export function generateStaticParams() {
  return CURRICULUM_MODULES.map((mod) => ({ id: mod.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const mod = CURRICULUM_MODULES.find((m) => m.id === id);
  if (!mod) return {};

  const title = mod.title;
  const description = `${mod.subtitle}. درس‌نامهٔ کامل، مثال‌های حل‌شده گام‌به‌گام و آزمون تعاملی.`;

  return {
    title,
    description,
    keywords: [
      plainText(mod.title),
      mod.shortTitle,
      'درسنامه ریاضیات مهندسی',
      'مثال حل شده',
      ...BASE_KEYWORDS.slice(0, 4),
    ],
    alternates: { canonical: `/module/${mod.id}` },
    openGraph: {
      title,
      description,
      type: 'article',
      locale: 'fa_IR',
      url: `/module/${mod.id}`,
      siteName: SITE_NAME,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mod = CURRICULUM_MODULES.find((m) => m.id === id);
  if (!mod) {
    notFound();
  }

  const moduleId = id as ModuleId;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'صفحهٔ دوره',
            item: absoluteUrl('/'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: mod.shortTitle,
            item: absoluteUrl(`/module/${mod.id}`),
          },
        ],
      },
      {
        '@type': 'LearningResource',
        '@id': absoluteUrl(`/module/${mod.id}#lesson`),
        name: mod.title,
        description: mod.subtitle,
        url: absoluteUrl(`/module/${mod.id}`),
        inLanguage: 'fa-IR',
        learningResourceType: 'درس‌نامه',
        educationalLevel: 'کارشناسی',
        isAccessibleForFree: true,
        about: { '@type': 'Thing', name: 'ریاضیات مهندسی' },
        teaches: mod.subtopics.map((s) => plainText(s.title)),
        isPartOf: {
          '@type': 'Course',
          name: 'ریاضیات مهندسی · آنالیز فوریه و معادلات دیفرانسیل جزئی',
          url: absoluteUrl('/'),
        },
      },
    ],
  };

  return (
    <AppChrome moduleId={moduleId}>
      <AppShell>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <h1 className="sr-only">{mod.title}</h1>
        {/* useSearchParams lives in the client workspace page */}
        <Suspense fallback={<div className="min-h-[60vh]" />}>
          <ModulePageClient moduleId={moduleId} />
        </Suspense>
        <ModuleSeoContent module={mod} />
      </AppShell>
    </AppChrome>
  );
}
