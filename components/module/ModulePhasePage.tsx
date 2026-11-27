import { notFound } from 'next/navigation';
import { CURRICULUM_MODULES, ModuleId } from '@/lib/curriculum-data';
import AppChrome, { AppShell } from '@/components/shell/AppChrome';
import ModulePageClient from '@/components/module/ModulePageClient';
import ModuleSeoContent from '@/components/seo/ModuleSeoContent';
import type { WorkspacePhase } from '@/lib/seo';

interface ModulePhasePageProps {
  moduleId: ModuleId;
  phase: WorkspacePhase;
  lessonIndex?: number;
  exampleIndex?: number;
  /** Single sr-only h1 of the route (the page's search subject) */
  h1Text: string;
  jsonLd: object;
}

/**
 * Server shell shared by the five workspace routes (root, lesson/[n],
 * lab, examples[/[n]], quiz). Renders the JSON-LD, the single sr-only h1,
 * the interactive workspace (SSR'd client component — the lesson content is
 * fully crawlable in the initial HTML) and the plain-text chapter overview.
 */
export default function ModulePhasePage({
  moduleId,
  phase,
  lessonIndex = 0,
  exampleIndex = 0,
  h1Text,
  jsonLd,
}: ModulePhasePageProps) {
  const mod = CURRICULUM_MODULES.find((m) => m.id === moduleId);
  if (!mod) {
    notFound();
  }

  return (
    <AppChrome moduleId={moduleId}>
      <AppShell>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <h1 className="sr-only">{h1Text}</h1>
        <ModulePageClient
          moduleId={moduleId}
          phase={phase}
          lessonIndex={lessonIndex}
          exampleIndex={exampleIndex}
        />
        <ModuleSeoContent module={mod} />
      </AppShell>
    </AppChrome>
  );
}
