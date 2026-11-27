import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CURRICULUM_MODULES } from '@/lib/curriculum-data';
import { BASE_KEYWORDS, SITE_NAME, plainText, workspacePhaseMeta } from '@/lib/seo';
import { stripLessonNumber } from '@/lib/persian-digits';
import ModulePhasePage from '@/components/module/ModulePhasePage';
import { buildLessonJsonLd } from '@/lib/module-schema';

/** One static page per lesson (1-based URLs; /lesson/1 redirects to the root). */
export function generateStaticParams() {
  return CURRICULUM_MODULES.flatMap((mod) =>
    mod.subtopics
      .map((_, index) => ({ id: mod.id, lesson: String(index + 1) }))
      .filter((entry) => entry.lesson !== '1')
  );
}

function resolveLessonIndex(id: string, lesson: string) {
  const mod = CURRICULUM_MODULES.find((m) => m.id === id);
  if (!mod) return null;
  const n = Number(lesson);
  const oneBased = Number.isFinite(n) ? Math.trunc(n) : 1;
  const index = Math.min(Math.max(1, oneBased), mod.subtopics.length) - 1;
  return { mod, index };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; lesson: string }>;
}): Promise<Metadata> {
  const { id, lesson } = await params;
  const resolved = resolveLessonIndex(id, lesson);
  if (!resolved) return {};

  const { mod, index } = resolved;
  const sub = mod.subtopics[index];
  const meta = workspacePhaseMeta('lesson', {
    moduleId: mod.id,
    moduleTitle: mod.title,
    moduleShortTitle: mod.shortTitle,
    moduleSubtitle: mod.subtitle,
    lessonIndex: index,
    lessonCount: mod.subtopics.length,
    lessonTitle: sub?.title,
    lessonSummary: sub?.summary,
  });

  return {
    title: meta.title,
    description: meta.description,
    keywords: [
      plainText(sub?.title || mod.title),
      mod.shortTitle,
      'درسنامه ریاضیات مهندسی',
      ...BASE_KEYWORDS.slice(0, 4),
    ],
    alternates: { canonical: `/module/${mod.id}/lesson/${index + 1}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'article',
      locale: 'fa_IR',
      url: `/module/${mod.id}/lesson/${index + 1}`,
      siteName: SITE_NAME,
    },
    twitter: { card: 'summary_large_image', title: meta.title, description: meta.description },
  };
}

export default async function ModuleLessonPage({
  params,
}: {
  params: Promise<{ id: string; lesson: string }>;
}) {
  const { id, lesson } = await params;
  const resolved = resolveLessonIndex(id, lesson);
  if (!resolved) {
    notFound();
  }

  const { mod, index } = resolved;
  const sub = mod.subtopics[index];

  return (
    <ModulePhasePage
      moduleId={mod.id}
      phase="lesson"
      lessonIndex={index}
      h1Text={plainText(stripLessonNumber(sub?.title || mod.title))}
      jsonLd={buildLessonJsonLd(mod, index)}
    />
  );
}
