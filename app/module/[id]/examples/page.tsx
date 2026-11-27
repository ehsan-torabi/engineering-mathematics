import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CURRICULUM_MODULES } from '@/lib/curriculum-data';
import { SITE_NAME, plainText, workspacePhaseMeta } from '@/lib/seo';
import ModulePhasePage from '@/components/module/ModulePhasePage';
import { buildExamplesJsonLd } from '@/lib/module-schema';

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

  const first = mod.workedExamples[0];
  const meta = workspacePhaseMeta('examples', {
    moduleId: mod.id,
    moduleTitle: mod.title,
    moduleShortTitle: mod.shortTitle,
    moduleSubtitle: mod.subtitle,
    exampleIndex: 0,
    exampleCount: mod.workedExamples.length,
    lessonTitle: first?.title,
  });

  return {
    title: meta.title,
    description: meta.description,
    keywords: ['مسئله حل شده ریاضیات مهندسی', plainText(mod.title), 'حل گام‌به‌گام'],
    alternates: { canonical: `/module/${mod.id}/examples` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'article',
      locale: 'fa_IR',
      url: `/module/${mod.id}/examples`,
      siteName: SITE_NAME,
    },
    twitter: { card: 'summary_large_image', title: meta.title, description: meta.description },
  };
}

export default async function ModuleExamplesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mod = CURRICULUM_MODULES.find((m) => m.id === id);
  if (!mod) {
    notFound();
  }

  const first = mod.workedExamples[0];

  return (
    <ModulePhasePage
      moduleId={mod.id}
      phase="examples"
      exampleIndex={0}
      h1Text={plainText(first?.title || `مسائل حل‌شده ${mod.title}`)}
      jsonLd={buildExamplesJsonLd(mod, 0)}
    />
  );
}
