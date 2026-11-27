'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CURRICULUM_MODULES, ModuleId } from '@/lib/curriculum-data';
import { useStudyProgress } from '@/lib/study-progress-context';
import { useAssistant } from '@/components/shell/AppChrome';
import ModuleWorkspace, {
  ModulePhase,
} from '@/components/module/ModuleWorkspace';

interface ModulePageClientProps {
  moduleId: ModuleId;
  phase: ModulePhase;
  /** 0-based lesson index, already clamped by the route */
  lessonIndex: number;
  /** 0-based example index, already clamped by the route */
  exampleIndex: number;
}

function workspacePath(
  moduleId: ModuleId,
  phase: ModulePhase,
  lessonIndex: number,
  exampleIndex: number
): string {
  switch (phase) {
    case 'lab':
      return `/module/${moduleId}/lab`;
    case 'quiz':
      return `/module/${moduleId}/quiz`;
    case 'examples':
      return exampleIndex > 0
        ? `/module/${moduleId}/examples/${exampleIndex + 1}`
        : `/module/${moduleId}/examples`;
    case 'lesson':
    default:
      return lessonIndex > 0
        ? `/module/${moduleId}/lesson/${lessonIndex + 1}`
        : `/module/${moduleId}`;
  }
}

/**
 * Module workspace client. The route path is the source of truth:
 * `/module/[id]`, `/module/[id]/lesson/[n]`, `/module/[id]/lab`,
 * `/module/[id]/examples[/[n]]`, `/module/[id]/quiz` — all statically
 * generated and crawlable. Every learner action performs exactly one
 * atomic push, so browser back/forward retraces the learning path.
 */
export default function ModulePageClient({
  moduleId,
  phase,
  lessonIndex,
  exampleIndex,
}: ModulePageClientProps) {
  const router = useRouter();
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
  const moduleSummary = moduleSummaryFor(moduleId);

  // One atomic URL push per learner action — never two competing pushes
  const handleNavigate = useCallback(
    (next: { phase?: ModulePhase; lesson?: number; example?: number }) => {
      const nextPhase = next.phase ?? phase;
      const nextLesson = next.lesson ?? lessonIndex;
      const nextExample = next.example ?? exampleIndex;
      router.push(
        workspacePath(moduleId, nextPhase, nextLesson, nextExample),
        { scroll: false }
      );
    },
    [router, moduleId, phase, lessonIndex, exampleIndex]
  );

  const handleAskAI = useCallback(
    (promptText: string, subtopicTitle?: string) => {
      // Resolve the hint to the exact subtopic (id + title) so the AI
      // assistant receives the official درس‌نامه of what the student sees;
      // prompt-only callers fall back to the active lesson in the URL.
      const activeSubtopic =
        (subtopicTitle &&
          workspaceModule.subtopics.find((s) => s.title === subtopicTitle)) ||
        workspaceModule.subtopics[lessonIndex];
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
    [openAssistant, workspaceModule, lessonIndex]
  );

  return (
    <ModuleWorkspace
      moduleId={moduleId}
      phase={phase}
      onNavigate={handleNavigate}
      subtopicIndex={lessonIndex}
      exampleIndex={exampleIndex}
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
