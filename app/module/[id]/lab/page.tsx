import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CURRICULUM_MODULES } from '@/lib/curriculum-data';
import { SITE_NAME, plainText, workspacePhaseMeta } from '@/lib/seo';
import ModulePhasePage from '@/components/module/ModulePhasePage';
import { buildLabJsonLd } from '@/lib/module-schema';

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

  const meta = workspacePhaseMeta('lab', {
    moduleId: mod.id,
    moduleTitle: mod.title,
    moduleShortTitle: mod.shortTitle,
    moduleSubtitle: mod.subtitle,
  });

  return {
    title: meta.title,
    description: meta.description,
    keywords: ['آزمایشگاه تعاملی', plainText(mod.title), 'شبیه‌ساز ریاضیات مهندسی'],
    alternates: { canonical: `/module/${mod.id}/lab` },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
      locale: 'fa_IR',
      url: `/module/${mod.id}/lab`,
      siteName: SITE_NAME,
    },
    twitter: { card: 'summary_large_image', title: meta.title, description: meta.description },
  };
}

export default async function ModuleLabPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mod = CURRICULUM_MODULES.find((m) => m.id === id);
  if (!mod) {
    notFound();
  }

  return (
    <ModulePhasePage
      moduleId={mod.id}
      phase="lab"
      h1Text={`آزمایشگاه تعاملی ${plainText(mod.title)}`}
      jsonLd={buildLabJsonLd(mod)}
    />
  );
}
