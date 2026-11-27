import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CURRICULUM_MODULES, ModuleId } from '@/lib/curriculum-data';
import { BASE_KEYWORDS, SITE_NAME, plainText, workspacePhaseMeta } from '@/lib/seo';
import { stripLessonNumber } from '@/lib/persian-digits';
import ModulePhasePage from '@/components/module/ModulePhasePage';
import { buildLessonJsonLd } from '@/lib/module-schema';

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

  const first = mod.subtopics[0];
  const meta = workspacePhaseMeta('lesson', {
    moduleId: mod.id,
    moduleTitle: mod.title,
    moduleShortTitle: mod.shortTitle,
    moduleSubtitle: mod.subtitle,
    lessonIndex: 0,
    lessonCount: mod.subtopics.length,
    lessonTitle: first?.title,
    lessonSummary: first?.summary,
  });

  return {
    title: meta.title,
    description: meta.description,
    keywords: [
      plainText(first?.title || mod.title),
      mod.shortTitle,
      'درسنامه ریاضیات مهندسی',
      'مثال حل شده',
      ...BASE_KEYWORDS.slice(0, 4),
    ],
    alternates: { canonical: `/module/${mod.id}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'article',
      locale: 'fa_IR',
      url: `/module/${mod.id}`,
      siteName: SITE_NAME,
    },
    twitter: { card: 'summary_large_image', title: meta.title, description: meta.description },
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

  const first = mod.subtopics[0];

  return (
    <ModulePhasePage
      moduleId={mod.id}
      phase="lesson"
      lessonIndex={0}
      h1Text={plainText(stripLessonNumber(first?.title || mod.title))}
      jsonLd={buildLessonJsonLd(mod, 0)}
    />
  );
}
