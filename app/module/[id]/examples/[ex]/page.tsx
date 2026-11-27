import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CURRICULUM_MODULES } from '@/lib/curriculum-data';
import { SITE_NAME, plainText, workspacePhaseMeta } from '@/lib/seo';
import ModulePhasePage from '@/components/module/ModulePhasePage';
import { buildExamplesJsonLd } from '@/lib/module-schema';

/** One static page per worked example (1-based URLs; /examples/1 redirects). */
export function generateStaticParams() {
  return CURRICULUM_MODULES.flatMap((mod) =>
    mod.workedExamples
      .map((_, index) => ({ id: mod.id, ex: String(index + 1) }))
      .filter((entry) => entry.ex !== '1')
  );
}

function resolveExampleIndex(id: string, ex: string) {
  const mod = CURRICULUM_MODULES.find((m) => m.id === id);
  if (!mod) return null;
  const n = Number(ex);
  const oneBased = Number.isFinite(n) ? Math.trunc(n) : 1;
  const index = Math.min(Math.max(1, oneBased), mod.workedExamples.length) - 1;
  return { mod, index };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; ex: string }>;
}): Promise<Metadata> {
  const { id, ex } = await params;
  const resolved = resolveExampleIndex(id, ex);
  if (!resolved) return {};

  const { mod, index } = resolved;
  const example = mod.workedExamples[index];
  const meta = workspacePhaseMeta('examples', {
    moduleId: mod.id,
    moduleTitle: mod.title,
    moduleShortTitle: mod.shortTitle,
    moduleSubtitle: mod.subtitle,
    exampleIndex: index,
    exampleCount: mod.workedExamples.length,
    lessonTitle: example?.title,
  });

  return {
    title: meta.title,
    description: meta.description,
    keywords: [
      plainText(example?.title || mod.title),
      'مسئله حل شده ریاضیات مهندسی',
      'حل گام‌به‌گام',
    ],
    alternates: { canonical: `/module/${mod.id}/examples/${index + 1}` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'article',
      locale: 'fa_IR',
      url: `/module/${mod.id}/examples/${index + 1}`,
      siteName: SITE_NAME,
    },
    twitter: { card: 'summary_large_image', title: meta.title, description: meta.description },
  };
}

export default async function ModuleExamplePage({
  params,
}: {
  params: Promise<{ id: string; ex: string }>;
}) {
  const { id, ex } = await params;
  const resolved = resolveExampleIndex(id, ex);
  if (!resolved) {
    notFound();
  }

  const { mod, index } = resolved;
  const example = mod.workedExamples[index];

  return (
    <ModulePhasePage
      moduleId={mod.id}
      phase="examples"
      exampleIndex={index}
      h1Text={plainText(example?.title || `مسئله حل‌شده ${mod.title}`)}
      jsonLd={buildExamplesJsonLd(mod, index)}
    />
  );
}
