import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CURRICULUM_MODULES, ModuleId } from '@/lib/curriculum-data';
import AppChrome, { AppShell } from '@/components/shell/AppChrome';
import ModulePageClient from '@/components/module/ModulePageClient';

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

  return {
    title: `${mod.shortTitle} — آزمایشگاه تعاملی ریاضیات مهندسی`,
    description: mod.subtitle,
    openGraph: {
      title: `${mod.shortTitle} — آزمایشگاه تعاملی ریاضیات مهندسی`,
      description: mod.subtitle,
    },
  };
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exists = CURRICULUM_MODULES.some((m) => m.id === id);
  if (!exists) {
    notFound();
  }

  const moduleId = id as ModuleId;

  return (
    <AppChrome moduleId={moduleId}>
      <AppShell>
        {/* useSearchParams lives in the client workspace page */}
        <Suspense fallback={<div className="min-h-[60vh]" />}>
          <ModulePageClient moduleId={moduleId} />
        </Suspense>
      </AppShell>
    </AppChrome>
  );
}
