'use client';

import React, { useMemo, useRef } from 'react';
import {
  BookOpen,
  FlaskConical,
  PenLine,
  ListChecks,
  CheckCircle2,
} from 'lucide-react';
import {
  CURRICULUM_MODULES,
  ModuleId,
  MODULE_ENRICHMENT,
} from '@/lib/curriculum-data';
import {
  ModuleMasterySummary,
  StudyProgressState,
} from '@/lib/study-engine';
import { MathText } from '@/components/MathFormula';
import LessonReader from '@/components/module/LessonReader';
import LabPanel from '@/components/module/LabPanel';
import ExamplesDeck from '@/components/module/ExamplesDeck';
import QuizPanel from '@/components/module/QuizPanel';
import EnrichmentCards from '@/components/module/EnrichmentCards';

export type ModulePhase = 'lesson' | 'lab' | 'examples' | 'quiz';

interface WorkspaceNavigation {
  phase?: ModulePhase;
  lesson?: number;
  example?: number;
}

interface ModuleWorkspaceProps {
  moduleId: ModuleId;
  phase: ModulePhase;
  /** Single atomic navigation callback — one URL push per learner action */
  onNavigate: (next: WorkspaceNavigation) => void;
  subtopicIndex: number;
  exampleIndex: number;
  progressState: StudyProgressState;
  moduleSummary: ModuleMasterySummary;
  onToggleSubtopic: (subtopicId: string) => void;
  onToggleExample: (exampleId: string) => void;
  onSelectQuizAnswer: (questionId: string, optionIdx: number) => void;
  onResetModuleQuiz: (moduleId: ModuleId) => void;
  onUpdateModuleNote: (moduleId: ModuleId, noteText: string) => void;
  onAskAI: (promptText: string, subtopicTitle?: string) => void;
}

const PHASE_TABS: {
  id: ModulePhase;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: 'lesson', label: 'درس‌نامه', icon: <BookOpen className="h-4 w-4" /> },
  { id: 'lab', label: 'آزمایشگاه', icon: <FlaskConical className="h-4 w-4" /> },
  { id: 'examples', label: 'مسائل حل‌شده', icon: <PenLine className="h-4 w-4" /> },
  { id: 'quiz', label: 'خودآزمایی', icon: <ListChecks className="h-4 w-4" /> },
];

function scrollToWorkspace(el: HTMLElement | null) {
  if (!el) return;
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  el.scrollIntoView({
    behavior: reduceMotion ? 'auto' : 'smooth',
    block: 'start',
  });
}

/**
 * The focused learning workspace. One module, one phase, one lesson at a
 * time. The rail (start side in RTL) is the table of contents; the main
 * column shows exactly one thing. The old four-zone page with its layout
 * switcher is gone — phase selection replaces it.
 */
export default function ModuleWorkspace({
  moduleId,
  phase,
  onNavigate,
  subtopicIndex,
  exampleIndex,
  progressState,
  moduleSummary,
  onToggleSubtopic,
  onToggleExample,
  onSelectQuizAnswer,
  onResetModuleQuiz,
  onUpdateModuleNote,
  onAskAI,
}: ModuleWorkspaceProps) {
  const mainRef = useRef<HTMLDivElement>(null);

  const workspaceModule = CURRICULUM_MODULES.find((m) => m.id === moduleId)!;

  const completedSubSet = useMemo(
    () => new Set(progressState.completedSubtopics),
    [progressState.completedSubtopics]
  );
  const completedExSet = useMemo(
    () => new Set(progressState.completedExamples),
    [progressState.completedExamples]
  );

  const handleSelectSubtopic = (idx: number) => {
    onNavigate({ phase: 'lesson', lesson: idx });
    scrollToWorkspace(mainRef.current);
  };

  const handleSelectExample = (idx: number) => {
    onNavigate({ phase: 'examples', example: idx });
    scrollToWorkspace(mainRef.current);
  };

  const handlePhaseChange = (next: ModulePhase) => {
    onNavigate({ phase: next });
    scrollToWorkspace(mainRef.current);
  };

  return (
    <div>
      {/* Module header — two lines, nothing else */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-xs font-bold text-accent-deep dark:text-accent">
            {workspaceModule.numberLabel}
          </span>
          <span className="text-xs text-ink-4">{workspaceModule.pdfPageRange}</span>
          <span className="text-xs font-semibold tabular-nums text-ink-3">
            تسلط فصل {moduleSummary.masteryPercent}%
          </span>
        </div>
        <h1 className="mt-1 text-xl font-bold leading-8 text-ink">
          <MathText text={workspaceModule.title} />
        </h1>
      </div>

      <div
        ref={mainRef}
        className="mx-auto max-w-7xl scroll-mt-16 px-4 pb-16 pt-4 sm:px-6 lg:grid lg:grid-cols-[248px_minmax(0,1fr)] lg:gap-8"
      >
        {/* ── Rail (start side in RTL): the module's table of contents ── */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-6">
            {/* Lessons */}
            <nav aria-label="درس‌نامه‌های این فصل">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-xs font-bold text-ink-3">
                  درس‌نامه‌ها
                </span>
                <span className="text-[11px] font-semibold tabular-nums text-ink-4">
                  {moduleSummary.completedSubtopicsCount}/{moduleSummary.totalSubtopics}
                </span>
              </div>
              <ul className="space-y-0.5">
                {workspaceModule.subtopics.map((sub, idx) => {
                  const isActive = phase === 'lesson' && idx === subtopicIndex;
                  const isDone = completedSubSet.has(sub.id);
                  return (
                    <li key={sub.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectSubtopic(idx)}
                        aria-current={isActive ? 'true' : undefined}
                        className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-start text-xs leading-5 transition-colors ${
                          isActive
                            ? 'bg-accent-soft font-bold text-accent-deep dark:text-accent'
                            : 'text-ink-2 hover:bg-muted'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            isDone
                              ? 'bg-ok-soft text-ok'
                              : isActive
                                ? 'bg-accent text-white'
                                : 'bg-muted text-ink-4'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="h-3 w-3" /> : idx + 1}
                        </span>
                        <span className="line-clamp-2">
                          <MathText text={sub.title} />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Worked examples */}
            {workspaceModule.workedExamples.length > 0 && (
              <nav aria-label="مسائل حل‌شده این فصل">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-ink-3">
                    مسائل حل‌شده
                  </span>
                  <span className="text-[11px] font-semibold tabular-nums text-ink-4">
                    {moduleSummary.completedExamplesCount}/{moduleSummary.totalExamples}
                  </span>
                </div>
                <ul className="space-y-0.5">
                  {workspaceModule.workedExamples.map((ex, idx) => {
                    const isActive =
                      phase === 'examples' && idx === exampleIndex;
                    const isDone = completedExSet.has(ex.id);
                    return (
                      <li key={ex.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectExample(idx)}
                          aria-current={isActive ? 'true' : undefined}
                          className={`flex w-full items-start gap-2 rounded-lg px-2.5 py-2 text-start text-xs leading-5 transition-colors ${
                            isActive
                              ? 'bg-accent-soft font-bold text-accent-deep dark:text-accent'
                              : 'text-ink-2 hover:bg-muted'
                          }`}
                        >
                          <PenLine
                            className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                              isDone ? 'text-ok' : 'text-ink-4'
                            }`}
                          />
                          <span className="line-clamp-2">
                            <MathText text={ex.title} />
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            )}
          </div>
        </aside>

        {/* ── Main stage: exactly one phase at a time ── */}
        <main className="min-w-0">
          {/* Phase segmented control */}
          <div className="sticky top-14 z-20 -mx-4 mb-4 border-b border-line bg-paper/90 px-4 py-2.5 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            <div
              role="tablist"
              aria-label="فازهای یادگیری فصل"
              className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1"
            >
              {PHASE_TABS.map((tab) => {
                const isActive = phase === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handlePhaseChange(tab.id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-surface text-ink shadow-sm'
                        : 'text-ink-3 hover:text-ink'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.id === 'quiz' && (
                      <span className="tabular-nums text-[10px] font-semibold text-ink-4">
                        {moduleSummary.answeredQuestionsCount}/{moduleSummary.totalQuestions}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile: lesson chips replace the rail */}
          <div className="mb-5 -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:hidden">
            {workspaceModule.subtopics.map((sub, idx) => {
              const isActive = phase === 'lesson' && idx === subtopicIndex;
              const isDone = completedSubSet.has(sub.id);
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => handleSelectSubtopic(idx)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'border-accent bg-accent-soft text-accent-deep dark:text-accent'
                      : 'border-line bg-surface text-ink-3'
                  }`}
                >
                  {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-ok" />}
                  <span className="tabular-nums">{idx + 1}</span>
                  <span className="max-w-36 truncate">
                    <MathText text={sub.title} />
                  </span>
                </button>
              );
            })}
          </div>

          {/* Phase content — one child, keyed so each switch gets a clean entrance */}
          <div key={phase} className="animate-rise">
            {phase === 'lesson' && (
              <>
                <LessonReader
                  module={workspaceModule}
                  subtopicIndex={subtopicIndex}
                  onSubtopicChange={(idx) => {
                    onNavigate({ lesson: idx });
                    scrollToWorkspace(mainRef.current);
                  }}
                  completedSubtopics={progressState.completedSubtopics}
                  onToggleSubtopic={onToggleSubtopic}
                  note={progressState.moduleNotes[workspaceModule.id] || ''}
                  onUpdateNote={(text) => onUpdateModuleNote(workspaceModule.id, text)}
                  onGoToExamples={() => handlePhaseChange('examples')}
                />
                <EnrichmentCards enrichment={MODULE_ENRICHMENT[workspaceModule.id]} />
              </>
            )}

            {phase === 'lab' && <LabPanel module={workspaceModule} />}

            {phase === 'examples' && (
              <ExamplesDeck
                module={workspaceModule}
                exampleIndex={exampleIndex}
                onExampleChange={(idx) => {
                  onNavigate({ example: idx });
                  scrollToWorkspace(mainRef.current);
                }}
                completedExamples={progressState.completedExamples}
                onToggleExample={onToggleExample}
                onAskAI={(prompt) =>
                  onAskAI(prompt, workspaceModule.subtopics[subtopicIndex]?.title)
                }
              />
            )}

            {phase === 'quiz' && (
              <QuizPanel
                module={workspaceModule}
                quizAnswers={progressState.quizAnswers}
                onSelectQuizAnswer={onSelectQuizAnswer}
                onResetModuleQuiz={() => onResetModuleQuiz(workspaceModule.id)}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
