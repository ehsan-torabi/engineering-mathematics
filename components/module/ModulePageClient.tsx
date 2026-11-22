'use client';

import React, { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CURRICULUM_MODULES,
  ModuleId,
} from '@/lib/curriculum-data';
import { useStudyProgress } from '@/lib/study-progress-context';
import { useAssistant } from '@/components/shell/AppChrome';
import ModuleWorkspace, {
  ModulePhase,
} from '@/components/module/ModuleWorkspace';

const VALID_PHASES: ModulePhase[] = ['lesson', 'lab', 'examples', 'quiz'];

interface ParsedWorkspaceQuery {
  phase: ModulePhase;
  lesson: number;
  example: number;
}

function parseWorkspaceQuery(
  searchParams: URLSearchParams,
  subtopicCount: number,
  exampleCount: number
): ParsedWorkspaceQuery {
  const phaseParam = searchParams.get('phase') as ModulePhase | null;
  const phase =
    phaseParam && VALID_PHASES.includes(phaseParam) ? phaseParam : 'lesson';

  const clampIndex = (raw: string | null, count: number) => {
    const value = Number(raw ?? '0');
    if (!Number.isFinite(value)) return 0;
    return Math.min(Math.max(0, Math.trunc(value)), Math.max(0, count - 1));
  };

  return {
    phase,
    lesson: clampIndex(searchParams.get('lesson'), subtopicCount),
    example: clampIndex(searchParams.get('ex'), exampleCount),
  };
}

/**
 * Module workspace route. The URL is the source of truth:
 * `/module/[id]?phase=lesson|lab|examples|quiz&lesson=N&ex=M`.
 * Every phase/lesson/example change pushes history, so the browser's
 * back/forward buttons retrace the learner's exact path; deep links open
 * straight on the right lesson.
 */
export default function ModulePageClient({
  moduleId,
}: {
  moduleId: ModuleId;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    progressState,
    moduleSummaryFor,
    toggleSubtopic,
    toggleExample,
    selectQuizAnswer,
    resetQuizAnswers,
    updateModuleNote,
  } = useStudyProgress();
  const { openAssistant } = useAssistant();

  const workspaceModule = CURRICULUM_MODULES.find((m) => m.id === moduleId)!;
  const query = parseWorkspaceQuery(
    searchParams,
    workspaceModule.subtopics.length,
    workspaceModule.workedExamples.length
  );
  const moduleSummary = moduleSummaryFor(moduleId);

  const updateParams = useCallback(
    (next: Partial<ParsedWorkspaceQuery>) => {
      const merged = { ...query, ...next };
      const params = new URLSearchParams();
      if (merged.phase !== 'lesson') params.set('phase', merged.phase);
      if (merged.lesson > 0) params.set('lesson', String(merged.lesson));
      if (merged.example > 0) params.set('ex', String(merged.example));
      const qs = params.toString();
      router.push(`/module/${moduleId}${qs ? `?${qs}` : ''}`, {
        scroll: false,
      });
    },
    [query, moduleId, router]
  );

  // One atomic URL push per learner action — never two competing pushes
  const handleNavigate = useCallback(
    (next: { phase?: ModulePhase; lesson?: number; example?: number }) => {
      updateParams(next);
    },
    [updateParams]
  );

  const handleAskAI = useCallback(
    (promptText: string, subtopicTitle?: string) => {
      // Resolve the hint to the exact subtopic (id + title) so the AI
      // assistant receives the official درس‌نامه of what the student sees;
      // prompt-only callers fall back to the active lesson in the URL.
      const activeSubtopic =
        (subtopicTitle &&
          workspaceModule.subtopics.find((s) => s.title === subtopicTitle)) ||
        workspaceModule.subtopics[query.lesson];
      openAssistant(
        promptText,
        activeSubtopic
          ? {
              subtopicId: activeSubtopic.id,
              subtopicTitle: activeSubtopic.title,
            }
          : undefined
      );
    },
    [openAssistant, workspaceModule, query.lesson]
  );

  return (
    <ModuleWorkspace
      moduleId={moduleId}
      phase={query.phase}
      onNavigate={handleNavigate}
      subtopicIndex={query.lesson}
      exampleIndex={query.example}
      progressState={progressState}
      moduleSummary={moduleSummary}
      onToggleSubtopic={toggleSubtopic}
      onToggleExample={toggleExample}
      onSelectQuizAnswer={selectQuizAnswer}
      onResetModuleQuiz={resetQuizAnswers}
      onUpdateModuleNote={updateModuleNote}
      onAskAI={handleAskAI}
    />
  );
}
