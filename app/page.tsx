'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CURRICULUM_MODULES,
  ModuleId,
  ModuleComplexityLayout,
  LAYOUT_COMPLEXITY_CONFIG,
  getModuleDefaultLayout,
} from '@/lib/curriculum-data';
import {
  StudyProgressState,
  INITIAL_STUDY_PROGRESS,
  computeCourseProgress,
} from '@/lib/study-engine';
import FourierInteractiveStage from '@/components/FourierInteractiveStage';
import FourierIntegralStage from '@/components/FourierIntegralStage';
import FourierTransformStage from '@/components/FourierTransformStage';
import SturmLiouvilleStage from '@/components/SturmLiouvilleStage';
import HeatEquationStage from '@/components/HeatEquationStage';
import PrerequisiteStage from '@/components/PrerequisiteStage';
import StepByStepSolver from '@/components/StepByStepSolver';
import PdfViewerModal from '@/components/PdfViewerModal';
import InteractiveScratchpad from '@/components/InteractiveScratchpad';
import AIAssistantDrawer from '@/components/AIAssistantDrawer';
import FormulaCheatSheetModal from '@/components/FormulaCheatSheetModal';
import StudyRoadmapModal, {
  RoadmapModalTab,
} from '@/components/StudyRoadmapModal';
import MathFormula, { MathText } from '@/components/MathFormula';
import {
  BookOpen,
  FileText,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Compass,
  ListChecks,
  PenTool,
  Bot,
  Settings2,
  BookMarked,
  Award,
  Layers,
  Moon,
  Sun,
  LayoutGrid,
  Maximize2,
  Columns,
  Sparkles,
  AlertTriangle,
  Zap,
} from 'lucide-react';

const STORAGE_KEY_PROGRESS = 'eng_math_study_progress_v1';
const STORAGE_KEY_THEME = 'eng_math_theme_v1';
const STORAGE_KEY_LAYOUT = 'eng_math_layout_mode_v1';

export default function EngineeringMathHomePage() {
  const [activeModuleId, setActiveModuleId] = useState<ModuleId>(
    'module_4_fourier_transform'
  );
  const [layoutMode, setLayoutMode] = useState<'auto' | ModuleComplexityLayout>(
    () => {
      if (typeof window === 'undefined') return 'auto';
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY_LAYOUT);
        if (
          saved === 'wide_canvas' ||
          saved === 'focused_reading' ||
          saved === 'balanced_split' ||
          saved === 'auto'
        ) {
          return saved;
        }
        return 'auto';
      } catch {
        return 'auto';
      }
    }
  );
  const [activeSubtopicIndex, setActiveSubtopicIndex] = useState<number>(0);
  const [isPdfOpen, setIsPdfOpen] = useState<boolean>(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState<boolean>(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState<boolean>(false);
  const [aiInitialTab, setAiInitialTab] = useState<'chat' | 'settings'>('chat');
  const [aiDraftPrompt, setAiDraftPrompt] = useState<string>('');
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState<boolean>(false);
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState<boolean>(false);
  const [roadmapTab, setRoadmapTab] = useState<RoadmapModalTab>('roadmap');

  // Persistent Dark Mode state in localStorage for late-night study sessions
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(STORAGE_KEY_THEME) === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.classList.toggle('dark', isDarkMode);
    try {
      window.localStorage.setItem(
        STORAGE_KEY_THEME,
        isDarkMode ? 'dark' : 'light'
      );
    } catch {
      // Ignore storage write error
    }
  }, [isDarkMode]);

  const [progressState, setProgressState] = useState<StudyProgressState>(() => {
    if (typeof window === 'undefined') return INITIAL_STUDY_PROGRESS;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          completedSubtopics: Array.isArray(parsed.completedSubtopics)
            ? parsed.completedSubtopics
            : [],
          completedExamples: Array.isArray(parsed.completedExamples)
            ? parsed.completedExamples
            : [],
          quizAnswers:
            parsed.quizAnswers && typeof parsed.quizAnswers === 'object'
              ? parsed.quizAnswers
              : {},
          moduleNotes:
            parsed.moduleNotes && typeof parsed.moduleNotes === 'object'
              ? parsed.moduleNotes
              : {},
        };
      }
    } catch {
      // Ignore storage read error
    }
    return INITIAL_STUDY_PROGRESS;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY_PROGRESS,
        JSON.stringify(progressState)
      );
    } catch {
      // Ignore storage write error
    }
  }, [progressState]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY_LAYOUT, layoutMode);
    } catch {
      // Ignore storage write error
    }
  }, [layoutMode]);

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', next);
      }
      try {
        window.localStorage.setItem(
          STORAGE_KEY_THEME,
          next ? 'dark' : 'light'
        );
      } catch {
        // Ignore storage write error
      }
      return next;
    });
  };

  const courseProgress = useMemo(
    () => computeCourseProgress(progressState, CURRICULUM_MODULES),
    [progressState]
  );

  const currentModule =
    CURRICULUM_MODULES.find((m) => m.id === activeModuleId) ||
    CURRICULUM_MODULES[0];

  const effectiveLayout: ModuleComplexityLayout = useMemo(() => {
    if (layoutMode !== 'auto') return layoutMode;
    return (
      currentModule.layoutComplexity ||
      getModuleDefaultLayout(currentModule.id)
    );
  }, [layoutMode, currentModule]);

  const currentLayoutConfig = LAYOUT_COMPLEXITY_CONFIG[effectiveLayout];

  const currentModuleSummary =
    courseProgress.moduleSummaries.find(
      (s) => s.moduleId === currentModule.id
    ) || courseProgress.moduleSummaries[0];

  const activeSubtopic =
    currentModule.subtopics[activeSubtopicIndex] || currentModule.subtopics[0];

  const isActiveSubtopicCompleted = progressState.completedSubtopics.includes(
    activeSubtopic.id
  );

  const handleModuleSwitch = (id: ModuleId, subIndex = 0) => {
    setActiveModuleId(id);
    setActiveSubtopicIndex(subIndex);
  };

  const handleToggleSubtopic = (subtopicId: string) => {
    setProgressState((prev) => {
      const exists = prev.completedSubtopics.includes(subtopicId);
      return {
        ...prev,
        completedSubtopics: exists
          ? prev.completedSubtopics.filter((id) => id !== subtopicId)
          : [...prev.completedSubtopics, subtopicId],
      };
    });
  };

  const handleToggleExample = (exampleId: string) => {
    setProgressState((prev) => {
      const exists = prev.completedExamples.includes(exampleId);
      return {
        ...prev,
        completedExamples: exists
          ? prev.completedExamples.filter((id) => id !== exampleId)
          : [...prev.completedExamples, exampleId],
      };
    });
  };

  const handleSelectQuizAnswer = (questionId: string, optionIdx: number) => {
    setProgressState((prev) => ({
      ...prev,
      quizAnswers: {
        ...prev.quizAnswers,
        [questionId]: optionIdx,
      },
    }));
  };

  const handleResetQuizAnswers = (moduleFilter: ModuleId | 'all') => {
    if (moduleFilter === 'all') {
      setProgressState((prev) => ({ ...prev, quizAnswers: {} }));
      return;
    }
    const targetMod = CURRICULUM_MODULES.find((m) => m.id === moduleFilter);
    if (!targetMod) return;
    const qIds = new Set(targetMod.practiceQuestions.map((q) => q.id));
    setProgressState((prev) => {
      const nextAnswers = { ...prev.quizAnswers };
      qIds.forEach((id) => {
        delete nextAnswers[id];
      });
      return {
        ...prev,
        quizAnswers: nextAnswers,
      };
    });
  };

  const handleUpdateModuleNote = (moduleId: ModuleId, noteText: string) => {
    setProgressState((prev) => ({
      ...prev,
      moduleNotes: {
        ...prev.moduleNotes,
        [moduleId]: noteText,
      },
    }));
  };

  // Modular Zone A: Interactive Simulation Sandbox
  const renderInteractiveStage = () => (
    <div id="interactive-stage" className="w-full">
      {currentModule.simulatorType === 'prerequisites_foundation' && (
        <PrerequisiteStage />
      )}

      {(currentModule.simulatorType === 'symmetry_orthogonality' ||
        currentModule.simulatorType === 'fourier_series') && (
        <FourierInteractiveStage mode={currentModule.simulatorType} />
      )}

      {currentModule.simulatorType === 'fourier_integral' && (
        <FourierIntegralStage />
      )}

      {currentModule.simulatorType === 'fourier_transform' && (
        <FourierTransformStage />
      )}

      {currentModule.simulatorType === 'sturm_liouville' && (
        <SturmLiouvilleStage />
      )}

      {currentModule.simulatorType === 'heat_pde' && <HeatEquationStage />}
    </div>
  );

  // Modular Zone B: Interactive Step-by-Step Equation Derivation Solver
  const renderStepByStepSolver = () => (
    <div id="step-by-step-solver" className="w-full">
      <StepByStepSolver
        key={currentModule.id}
        examples={currentModule.workedExamples}
        moduleTitle={currentModule.title}
        completedExamples={progressState.completedExamples}
        onToggleExampleMastery={handleToggleExample}
        onAskAIAboutStep={(promptText) => {
          setAiDraftPrompt(promptText);
          setAiInitialTab('chat');
          setIsAIAssistantOpen(true);
        }}
      />
    </div>
  );

  // Modular Zone C: Structured Lesson Subtopics & Formula Reference Deck
  const renderSubtopicsReference = (compactLayout = false) => (
    <section
      id="subtopics-reference"
      className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition-colors dark:border-[#1E293B] dark:bg-[#111827]"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
          <BookOpen className="h-4 w-4 text-[#0284C7] dark:text-[#38BDF8]" />
          <span>
            درس‌نامه و روابط مرجع {currentModule.numberLabel} (جزوه ریاضیات مهندسی):
          </span>
        </div>

        <button
          type="button"
          onClick={() => handleToggleSubtopic(activeSubtopic.id)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
            isActiveSubtopicCompleted
              ? 'border-[#059669] bg-[#ECFDF5] text-[#065F46] dark:border-[#059669]/60 dark:bg-[#064E3B]/40 dark:text-[#6EE7B7]'
              : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#334155] hover:border-[#0284C7] hover:text-[#0284C7] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#CBD5E1] dark:hover:border-[#38BDF8]'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>
            {isActiveSubtopicCompleted
              ? 'این زیرمبحث مطالعه شد'
              : 'ثبت مطالعه این زیرمبحث'}
          </span>
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {currentModule.subtopics.map((sub, idx) => {
          const isDone = progressState.completedSubtopics.includes(sub.id);
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setActiveSubtopicIndex(idx)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-right text-xs font-bold transition ${
                activeSubtopicIndex === idx
                  ? 'border-[#0284C7] bg-[#F0F9FF] text-[#0369A1] dark:border-[#38BDF8] dark:bg-[#0C4A6E]/40 dark:text-[#7DD3FC]'
                  : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:border-[#CBD5E1] dark:border-[#1E293B] dark:bg-[#1E293B] dark:text-[#94A3B8] dark:hover:border-[#334155]'
              }`}
            >
              {isDone && (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#059669] dark:text-[#34D399]" />
              )}
              <span>{idx + 1}. </span>
              <MathText text={sub.title} />
              <span className="mr-1 font-normal text-[#64748B] dark:text-[#94A3B8]">
                ({sub.pdfPages})
              </span>
            </button>
          );
        })}
      </div>

      {compactLayout ? (
        // Compact single-column vertical stack (ideal for side-by-side companion in wide canvas mode)
        <div className="space-y-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 dark:border-[#1E293B] dark:bg-[#0F172A]/70">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-[#E2E8F0] pb-2 dark:border-[#1E293B]">
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                درس‌نامه: <MathText text={activeSubtopic.title} />
              </h3>
              <span className="rounded-md bg-[#E0F2FE] px-2 py-0.5 text-[11px] font-bold text-[#0369A1] dark:bg-[#0C4A6E]/50 dark:text-[#7DD3FC]">
                {activeSubtopic.pdfPages}
              </span>
            </div>

            {/* Abstract overview */}
            <p className="rounded-lg bg-white p-3 text-xs leading-6 text-[#334155] shadow-2xs dark:bg-[#1E293B] dark:text-[#CBD5E1]">
              <MathText text={activeSubtopic.summary} />
            </p>

            {/* Detailed Textbook Explanation */}
            {activeSubtopic.detailedExplanation && (
              <div className="space-y-2 rounded-lg border-r-3 border-[#0284C7] bg-[#F0F9FF]/60 p-3 dark:border-[#38BDF8] dark:bg-[#0C4A6E]/20">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0369A1] dark:text-[#38BDF8]">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>متن تشریحی درس‌نامه (منطق ریاضی و فیزیکی):</span>
                </div>
                <div className="space-y-2 text-xs leading-6 text-[#1E293B] dark:text-[#E2E8F0]">
                  {activeSubtopic.detailedExplanation.split('\n\n').map((paragraph, pIdx) => (
                    <p key={pIdx}>
                      <MathText text={paragraph} />
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Common Pitfalls Box */}
            {activeSubtopic.commonPitfalls && activeSubtopic.commonPitfalls.length > 0 && (
              <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-900/60 dark:bg-amber-950/20">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <span>دام‌های تستی و خطاهای رایج در آزمون‌ها:</span>
                </div>
                <div className="space-y-1.5">
                  {activeSubtopic.commonPitfalls.map((pitfall, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-1.5 text-xs leading-5 text-amber-900 dark:text-amber-200">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      <MathText text={pitfall} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Engineering Applications Box */}
            {activeSubtopic.engineeringApplications && activeSubtopic.engineeringApplications.length > 0 && (
              <div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <Zap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>کاربردهای مهندسی و صنعتی در دنیای واقعی:</span>
                </div>
                <div className="space-y-1.5">
                  {activeSubtopic.engineeringApplications.map((app, aIdx) => (
                    <div key={aIdx} className="flex items-start gap-1.5 text-xs leading-5 text-emerald-900 dark:text-emerald-200">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <MathText text={app} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Conceptual Points */}
            <div className="space-y-1.5 pt-1">
              <div className="text-xs font-bold text-[#0369A1] dark:text-[#38BDF8]">
                مفاهیم کلیدی و اصول تحلیلی:
              </div>
              {activeSubtopic.conceptualPoints.map((pt, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs leading-5 text-[#334155] dark:text-[#CBD5E1]"
                >
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#059669] dark:text-[#34D399]" />
                  <MathText text={pt} />
                </div>
              ))}
            </div>
          </div>

          {/* Key Formulas Section */}
          <div className="space-y-2.5 border-t border-[#E2E8F0] pt-3 dark:border-[#1E293B]">
            <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              روابط و فرمول‌های مرجع ({activeSubtopic.pdfPages}):
            </div>
            {activeSubtopic.keyFormulas.map((kf, i) => (
              <div
                key={i}
                className="rounded-lg border border-[#E2E8F0] bg-white p-3 dark:border-[#1E293B] dark:bg-[#1E293B]"
              >
                <div className="mb-1 text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  <MathText text={kf.label} />
                </div>
                <MathFormula formula={kf.formula} block highlight={i === 0} />
                {kf.note && (
                  <p className="mt-1.5 text-xs leading-5 text-[#475569] dark:text-[#94A3B8]">
                    <MathText text={kf.note} />
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Standard full textbook layout: In-depth reading deck, warning callouts, engineering applications & formula deck
        <div className="space-y-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-5 dark:border-[#1E293B] dark:bg-[#0F172A]/70">
          {/* Header & Overview Abstract Banner */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-2xs dark:border-[#1E293B] dark:bg-[#111827]">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-2.5 dark:border-[#1E293B]">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0284C7] text-xs font-bold text-white dark:bg-[#38BDF8] dark:text-[#0F172A]">
                  {activeSubtopicIndex + 1}
                </span>
                <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  <MathText text={activeSubtopic.title} />
                </h3>
              </div>
              <span className="rounded-full bg-[#F0F9FF] px-3 py-1 text-xs font-bold text-[#0284C7] border border-[#BAE6FD] dark:border-[#0369A1] dark:bg-[#0C4A6E]/40 dark:text-[#7DD3FC]">
                مرجع جزوه: {activeSubtopic.pdfPages}
              </span>
            </div>

            <div className="text-xs leading-7 text-[#334155] sm:text-sm dark:text-[#CBD5E1]">
              <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">چکیده و انگیزه مدخل: </span>
              <MathText text={activeSubtopic.summary} />
            </div>
          </div>

          {/* Comprehensive Textbook Lecture Notes */}
          {activeSubtopic.detailedExplanation && (
            <div className="rounded-xl border-r-4 border-[#0284C7] border-y border-l border-[#E2E8F0] bg-white p-5 shadow-2xs dark:border-[#1E293B] dark:border-r-[#38BDF8] dark:bg-[#111827]">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0369A1] dark:text-[#38BDF8]">
                <BookOpen className="h-4 w-4" />
                <span>متن تشریحی درس‌نامه (شرح جامع نظری، استدلال ریاضی و تفسیر فیزیکی):</span>
              </div>
              <div className="space-y-3.5 text-xs leading-7 text-[#1E293B] sm:text-sm sm:leading-8 dark:text-[#E2E8F0]">
                {activeSubtopic.detailedExplanation.split('\n\n').map((paragraph, pIdx) => (
                  <p key={pIdx}>
                    <MathText text={paragraph} />
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Side-by-side Special Insights Grid: Pitfalls vs Engineering Applications */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Common Pitfalls & Exam Traps */}
            <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4 shadow-2xs dark:border-amber-900/60 dark:bg-amber-950/20">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 sm:text-sm dark:text-amber-300">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>دام‌های تستی و اشتباهات رایج در آزمون‌های دانشگاهی:</span>
              </div>
              <div className="space-y-2">
                {(activeSubtopic.commonPitfalls || []).map((pitfall, pIdx) => (
                  <div key={pIdx} className="flex items-start gap-2 text-xs leading-6 text-amber-950 dark:text-amber-200">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                    <MathText text={pitfall} />
                  </div>
                ))}
              </div>
            </div>

            {/* Engineering Applications in Practice */}
            <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-2xs dark:border-emerald-900/60 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 sm:text-sm dark:text-emerald-300">
                <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>کاربردهای مهندسی و صنعتی در دنیای واقعی:</span>
              </div>
              <div className="space-y-2">
                {(activeSubtopic.engineeringApplications || []).map((app, aIdx) => (
                  <div key={aIdx} className="flex items-start gap-2 text-xs leading-6 text-emerald-950 dark:text-emerald-200">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <MathText text={app} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Grid: 5 cols Conceptual Key Points & 7 cols Key Formulas Deck */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Left/Middle Column (5 cols): Conceptual Key Points */}
            <div className="space-y-3 rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-2xs lg:col-span-5 dark:border-[#1E293B] dark:bg-[#111827]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0369A1] sm:text-sm dark:text-[#38BDF8]">
                <CheckCircle2 className="h-4 w-4 text-[#059669] dark:text-[#34D399]" />
                <span>نکات کلیدی و اصول تحلیلی:</span>
              </div>
              <div className="space-y-2.5">
                {activeSubtopic.conceptualPoints.map((pt, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs leading-6 text-[#334155] dark:text-[#CBD5E1]"
                  >
                    <CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-[#059669] dark:text-[#34D399]" />
                    <MathText text={pt} />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column (7 cols): Reference Formulas */}
            <div className="space-y-3 lg:col-span-7">
              <div className="text-xs font-bold text-[#0F172A] sm:text-sm dark:text-[#F8FAFC]">
                روابط و فرمول‌های مرجع ({activeSubtopic.pdfPages}):
              </div>
              {activeSubtopic.keyFormulas.map((kf, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-[#E2E8F0] bg-white p-3.5 shadow-2xs dark:border-[#1E293B] dark:bg-[#1E293B]"
                >
                  <div className="mb-1.5 text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    <MathText text={kf.label} />
                  </div>
                  <MathFormula formula={kf.formula} block highlight={i === 0} />
                  {kf.note && (
                    <p className="mt-1.5 text-xs leading-6 text-[#475569] dark:text-[#94A3B8]">
                      <MathText text={kf.note} />
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );

  // Modular Zone D: Self-Assessment Engineering Practice Questions
  const renderPracticeQuestions = () => (
    <section className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs transition-colors dark:border-[#1E293B] dark:bg-[#111827]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#059669] text-white">
            <ListChecks className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              خودآزمایی مفهومی و امتحانی ({currentModule.numberLabel})
            </h3>
            <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
              درک خود از مفاهیم این بخش را با پاسخ به پرسش‌های استاندارد کارشناسی مهندسی بسنجید
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setRoadmapTab('exam');
            setIsRoadmapModalOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-lg border border-[#059669]/40 bg-[#ECFDF5] px-3 py-1.5 text-xs font-bold text-[#065F46] transition hover:bg-[#D1FAE5] dark:border-[#059669]/60 dark:bg-[#064E3B]/30 dark:text-[#6EE7B7]"
        >
          <Award className="h-3.5 w-3.5" />
          <span>ورود به آزمون جامع کل درس ({courseProgress.totalQuestions} سوال)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {currentModule.practiceQuestions.map((q, qIdx) => {
          const userChoice = progressState.quizAnswers[q.id];
          const isAnswered = userChoice !== undefined;
          const isCorrect = userChoice === q.correctIndex;

          return (
            <div
              key={q.id}
              className="flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 transition-colors dark:border-[#1E293B] dark:bg-[#0F172A]/70"
            >
              <div>
                <div className="mb-2 text-xs font-bold text-[#0284C7] dark:text-[#38BDF8]">
                  پرسش {qIdx + 1}:
                </div>
                <p className="mb-3.5 text-sm font-semibold leading-7 text-[#0F172A] dark:text-[#F8FAFC]">
                  <MathText text={q.question} />
                </p>

                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = userChoice === optIdx;
                    let btnStyle =
                      'border-[#CBD5E1] bg-white text-[#0F172A] hover:border-[#0284C7] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC] dark:hover:border-[#38BDF8]';
                    if (isAnswered) {
                      if (optIdx === q.correctIndex) {
                        btnStyle =
                          'border-[#059669] bg-[#ECFDF5] text-[#065F46] font-bold dark:border-[#059669] dark:bg-[#064E3B]/40 dark:text-[#6EE7B7]';
                      } else if (isSelected) {
                        btnStyle =
                          'border-[#DC2626] bg-[#FEF2F2] text-[#991B1B] dark:border-[#EF4444] dark:bg-[#7F1D1D]/40 dark:text-[#FCA5A5]';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectQuizAnswer(q.id, optIdx)}
                        className={`flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-right text-xs transition ${btnStyle}`}
                      >
                        <MathFormula formula={opt} block={false} />
                        {isAnswered && optIdx === q.correctIndex && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#059669] dark:text-[#34D399]" />
                        )}
                        {isAnswered &&
                          isSelected &&
                          optIdx !== q.correctIndex && (
                            <XCircle className="h-4 w-4 shrink-0 text-[#DC2626] dark:text-[#F87171]" />
                          )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {isAnswered && (
                <div
                  className={`mt-3.5 rounded-lg border p-3 text-xs leading-6 ${
                    isCorrect
                      ? 'border-[#059669]/30 bg-[#ECFDF5] text-[#065F46] dark:border-[#059669]/50 dark:bg-[#064E3B]/40 dark:text-[#6EE7B7]'
                      : 'border-[#D97706]/30 bg-[#FFFBEB] text-[#92400E] dark:border-[#F59E0B]/40 dark:bg-[#78350F]/40 dark:text-[#FDE68A]'
                  }`}
                >
                  <strong className="font-bold">
                    {isCorrect ? 'پاسخ صحیح است! ' : 'پاسخ نادرست است. '}
                  </strong>
                  <MathText text={q.explanation} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] transition-colors dark:bg-[#0B1120] dark:text-[#F8FAFC]">
      {/* Top Bar Contract: Zone 1 Brand, Zone 2 Module Navigation, Zone 3 Primary Action */}
      <header className="sticky top-0 z-30 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-xs transition-colors dark:border-[#1E293B] dark:bg-[#111827]/95">
        <div className="mx-auto flex max-w-7xl flex-col gap-2.5 px-4 py-2.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-3">
            {/* Zone 1: Brand & Academic Title */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0284C7] text-white shadow-2xs">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-[#0F172A] sm:text-base dark:text-[#F8FAFC]">
                  آزمایشگاه تعاملی ریاضیات مهندسی
                </h1>
                <p className="hidden text-[11px] text-[#475569] sm:block dark:text-[#94A3B8]">
                  مقطع کارشناسی مهندسی · ریاضیات پایه، آنالیز فوریه، اشتورم-لیوویل و معادله گرما
                </p>
              </div>
            </div>

            {/* Zone 3 (Mobile): Quick Access Controls */}
            <div className="flex items-center gap-1.5 lg:hidden">
              <button
                type="button"
                onClick={handleToggleDarkMode}
                aria-label="تغییر حالت تاریک و روشن (Dark Mode)"
                className="flex shrink-0 items-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs font-bold text-[#0F172A] transition dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC]"
              >
                <Sun className="hidden h-3.5 w-3.5 text-[#FBBF24] dark:inline-block" />
                <Moon className="inline-block h-3.5 w-3.5 text-[#0284C7] dark:hidden" />
                <span className="hidden dark:inline">روز</span>
                <span className="inline dark:hidden">شب</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAiInitialTab('chat');
                  setIsAIAssistantOpen(true);
                }}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-[#0284C7] px-2.5 py-1.5 text-xs font-bold text-white"
              >
                <Bot className="h-3.5 w-3.5" />
                دستیار AI
              </button>
              <button
                type="button"
                onClick={() => setIsFormulaModalOpen(true)}
                className="flex shrink-0 items-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs font-bold text-[#0F172A] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC]"
              >
                <BookMarked className="h-3.5 w-3.5 text-[#0284C7]" />
                فرمول‌ها
              </button>
              <button
                type="button"
                onClick={() => setIsPdfOpen(true)}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs font-bold text-[#0F172A] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC]"
              >
                <FileText className="h-3.5 w-3.5 text-[#0284C7]" />
                PDF
              </button>
            </div>
          </div>

          {/* Zone 2: Primary 7-Module Navigation (Prerequisites + 6 Core Chapters) */}
          <nav
            aria-label="فصل‌های آموزشی"
            className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0"
          >
            {CURRICULUM_MODULES.map((mod) => {
              const isActive = mod.id === activeModuleId;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => handleModuleSwitch(mod.id)}
                  className={`shrink-0 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#0284C7] text-white shadow-2xs'
                      : mod.id === 'module_0_prerequisites'
                      ? 'border border-[#0284C7]/40 bg-[#F0F9FF] text-[#0369A1] hover:bg-[#E0F2FE] dark:border-[#38BDF8]/40 dark:bg-[#0C4A6E]/35 dark:text-[#38BDF8]'
                      : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F172A] dark:bg-[#1E293B] dark:text-[#CBD5E1] dark:hover:bg-[#334155]'
                  }`}
                >
                  {mod.id === 'module_0_prerequisites'
                    ? '۰. پیش‌نیاز پایه'
                    : mod.id === 'module_1_definitions'
                    ? '۱. تعاریف و تعامد'
                    : mod.id === 'module_2_fourier_series'
                    ? '۲. سری فوریه'
                    : mod.id === 'module_3_fourier_integral'
                    ? '۳. انتگرال فوریه'
                    : mod.id === 'module_4_fourier_transform'
                    ? '۴. تبدیل فوریه'
                    : mod.id === 'module_5_sturm_liouville'
                    ? '۵. اشتورم-لیوویل'
                    : '۶. معادله گرما'}
                </button>
              );
            })}
          </nav>

          {/* Zone 3 Desktop Action */}
          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <button
              type="button"
              data-testid="theme-toggle-button"
              onClick={handleToggleDarkMode}
              aria-label="تغییر حالت تاریک و روشن (Dark Mode)"
              title="تغییر حالت تاریک و روشن (Dark / Light Mode)"
              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-bold text-[#0F172A] shadow-2xs transition hover:border-[#0284C7] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC] dark:hover:border-[#38BDF8]"
            >
              <Sun className="hidden h-4 w-4 text-[#FBBF24] dark:inline-block" />
              <Moon className="inline-block h-4 w-4 text-[#0284C7] dark:hidden" />
              <span className="hidden dark:inline">حالت روز</span>
              <span className="inline dark:hidden">حالت شب</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAiInitialTab('chat');
                setIsAIAssistantOpen(true);
              }}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#0284C7] px-3 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-[#0369A1]"
            >
              <Bot className="h-4 w-4" />
              دستیار هوشمند AI
            </button>
            <button
              type="button"
              onClick={() => setIsPdfOpen(true)}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-bold text-[#0F172A] shadow-2xs transition hover:border-[#0284C7] hover:text-[#0284C7] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC]"
            >
              <FileText className="h-4 w-4 text-[#0284C7] dark:text-[#38BDF8]" />
              جزوه PDF
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-7xl space-y-5 px-4 py-4 sm:px-6">
        {/* Compact Chapter Title, Live Mastery Tracker & Workspace Toolkit Bar */}
        <section className="rounded-xl border border-[#E2E8F0] bg-white px-5 py-4 shadow-2xs transition-colors dark:border-[#1E293B] dark:bg-[#111827]">
          <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
                <span className="font-bold text-[#0284C7] dark:text-[#38BDF8]">
                  {currentModule.numberLabel}
                </span>
                <span aria-hidden="true">·</span>
                <span>{currentModule.pdfPageRange}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  تسلط این فصل: {currentModuleSummary.masteryPercent}%
                </span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums font-semibold text-[#059669] dark:text-[#34D399]">
                  پیشرفت کل دوره: {courseProgress.overallMasteryPercent}%
                </span>
              </div>
              <h2 className="mt-1 text-lg font-bold text-[#0F172A] sm:text-xl dark:text-[#F8FAFC]">
                <MathText text={currentModule.title} />
              </h2>
              <p className="mt-0.5 text-xs leading-6 text-[#475569] dark:text-[#CBD5E1]">
                <MathText text={currentModule.subtitle} />
              </p>
            </div>

            {/* Comprehensive Engineering Learning Toolkit Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFormulaModalOpen(true)}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#0284C7] bg-[#F0F9FF] px-3 py-2 text-xs font-bold text-[#0369A1] transition hover:bg-[#E0F2FE] dark:border-[#38BDF8]/40 dark:bg-[#0C4A6E]/30 dark:text-[#38BDF8]"
              >
                <BookMarked className="h-3.5 w-3.5" />
                بانک جامع فرمول‌ها
              </button>

              <button
                type="button"
                onClick={() => {
                  setRoadmapTab('roadmap');
                  setIsRoadmapModalOpen(true);
                }}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-bold text-[#0F172A] transition hover:border-[#0284C7] hover:text-[#0284C7] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC] dark:hover:border-[#38BDF8]"
              >
                <Compass className="h-3.5 w-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
                نقشه راه و پیشرفت ({courseProgress.overallMasteryPercent}%)
              </button>

              <button
                type="button"
                onClick={() => {
                  setRoadmapTab('exam');
                  setIsRoadmapModalOpen(true);
                }}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-bold text-[#0F172A] transition hover:border-[#059669] hover:text-[#059669] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC]"
              >
                <Award className="h-3.5 w-3.5 text-[#059669] dark:text-[#34D399]" />
                شبیه‌ساز آزمون جامع
              </button>

              <button
                type="button"
                onClick={() => {
                  setRoadmapTab('requirements');
                  setIsRoadmapModalOpen(true);
                }}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2 text-xs font-bold text-[#334155] transition hover:border-[#0284C7] hover:text-[#0284C7] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#CBD5E1]"
              >
                <Layers className="h-3.5 w-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
                مهندسی نیازمندی‌ها
              </button>

              <button
                type="button"
                onClick={() => setIsScratchpadOpen((prev) => !prev)}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-xs font-bold text-[#0F172A] transition hover:border-[#0284C7] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC]"
              >
                <PenTool className="h-3.5 w-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
                تخته یادداشت (Scratchpad)
              </button>

              <button
                type="button"
                onClick={() => {
                  setAiInitialTab('settings');
                  setIsAIAssistantOpen(true);
                }}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2 text-xs font-bold text-[#334155] transition hover:border-[#0284C7] hover:text-[#0284C7] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#CBD5E1]"
              >
                <Settings2 className="h-3.5 w-3.5" />
                تنظیمات AI
              </button>
            </div>
          </div>

          {/* Adaptive Content Layout Controller Bar */}
          <div className="mt-4 flex flex-col gap-3 border-t border-[#E2E8F0] pt-3 sm:flex-row sm:items-center sm:justify-between dark:border-[#1E293B]">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-[#334155] dark:text-[#CBD5E1]">
                <LayoutGrid className="h-3.5 w-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
                <span>معماری چیدمان:</span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-md bg-[#F1F5F9] px-2 py-0.5 font-semibold text-[#0F172A] dark:bg-[#1E293B] dark:text-[#F8FAFC]">
                {currentLayoutConfig.labelFa}
              </span>
              <span className="hidden text-[11px] text-[#64748B] md:inline dark:text-[#94A3B8]">
                ({currentLayoutConfig.rationaleFa})
              </span>
            </div>

            {/* Interactive Layout Switcher Buttons */}
            <div
              role="radiogroup"
              aria-label="انتخاب حالت چیدمان صفحه"
              className="flex items-center gap-1 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] p-1 dark:border-[#334155] dark:bg-[#0F172A]"
            >
              <button
                type="button"
                role="radio"
                aria-checked={layoutMode === 'auto'}
                onClick={() => setLayoutMode('auto')}
                title="تطبیق خودکار بر اساس پیچیدگی شبیه‌سازی و ماهیت مبحث"
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold transition ${
                  layoutMode === 'auto'
                    ? 'bg-[#0284C7] text-white shadow-2xs'
                    : 'text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:bg-[#1E293B] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <Sparkles className="h-3 w-3" />
                <span>خودکار</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={layoutMode === 'wide_canvas'}
                onClick={() => setLayoutMode('wide_canvas')}
                title="بوم عریض: پهنای کامل برای شبیه‌سازی معادلات دیفرانسیل و بارهای محاسباتی"
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold transition ${
                  layoutMode === 'wide_canvas'
                    ? 'bg-[#0284C7] text-white shadow-2xs'
                    : 'text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:bg-[#1E293B] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <Maximize2 className="h-3 w-3" />
                <span>بوم عریض</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={layoutMode === 'focused_reading'}
                onClick={() => setLayoutMode('focused_reading')}
                title="مطالعه متمرکز: تفکیک ستونی برای راحتی خوانش درس‌نامه و یادگیری نظری"
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold transition ${
                  layoutMode === 'focused_reading'
                    ? 'bg-[#0284C7] text-white shadow-2xs'
                    : 'text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:bg-[#1E293B] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <BookOpen className="h-3 w-3" />
                <span>مطالعه متمرکز</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={layoutMode === 'balanced_split'}
                onClick={() => setLayoutMode('balanced_split')}
                title="متوازن: تقسیم ۷ ستون آزمایشگاه و ۵ ستون حل گام‌به‌گام در یک نگاه"
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold transition ${
                  layoutMode === 'balanced_split'
                    ? 'bg-[#0284C7] text-white shadow-2xs'
                    : 'text-[#475569] hover:bg-[#E2E8F0] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:bg-[#1E293B] dark:hover:text-[#F8FAFC]'
                }`}
              >
                <Columns className="h-3 w-3" />
                <span>متوازن</span>
              </button>
            </div>
          </div>
        </section>

        {/* Dynamic Content Area: Restructured Grid Layout Adjusting to Module Complexity */}
        {effectiveLayout === 'wide_canvas' && (
          <div className="space-y-5">
            {/* Wide Top Zone: Interactive Simulation Sandbox across full width for PDE & transforms */}
            <div className="w-full">
              {renderInteractiveStage()}
            </div>

            {/* Middle Grid: Desktop side-by-side 12-column grid */}
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
              <div className="xl:col-span-7 space-y-4">
                {renderStepByStepSolver()}
              </div>
              <div className="xl:col-span-5 space-y-4">
                {renderSubtopicsReference(true)}
              </div>
            </div>

            {/* Bottom Zone: Full-width self-assessment practice questions */}
            <div className="w-full">
              {renderPracticeQuestions()}
            </div>
          </div>
        )}

        {effectiveLayout === 'focused_reading' && (
          <div className="grid grid-cols-1 gap-5 items-start lg:grid-cols-12">
            {/* Primary Reading & Theoretical Mastery Column (7 cols) */}
            <div className="space-y-5 lg:col-span-7">
              {renderSubtopicsReference(false)}
              {renderPracticeQuestions()}
            </div>

            {/* Live Interactive Companion & Solver Workbench Column (5 cols) */}
            <div className="space-y-5 lg:col-span-5">
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-2xs transition-colors dark:border-[#1E293B] dark:bg-[#111827]">
                <div className="mb-2 flex items-center justify-between border-b border-[#E2E8F0] pb-2 dark:border-[#1E293B]">
                  <span className="text-xs font-bold text-[#0284C7] dark:text-[#38BDF8]">
                    آزمایشگاه تعاملی مفاهیم
                  </span>
                  <span className="rounded bg-[#F0F9FF] px-2 py-0.5 text-[10px] font-bold text-[#0369A1] dark:bg-[#0C4A6E]/40 dark:text-[#7DD3FC]">
                    همراه مطالعه
                  </span>
                </div>
                {renderInteractiveStage()}
              </div>

              <div className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-2xs transition-colors dark:border-[#1E293B] dark:bg-[#111827]">
                <div className="mb-2 flex items-center justify-between border-b border-[#E2E8F0] pb-2 dark:border-[#1E293B]">
                  <span className="text-xs font-bold text-[#059669] dark:text-[#34D399]">
                    حل گام‌به‌گام و نمونه مسائل حل شده
                  </span>
                  <span className="rounded bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-bold text-[#065F46] dark:bg-[#064E3B]/40 dark:text-[#A7F3D0]">
                    تحلیل تشریحی
                  </span>
                </div>
                {renderStepByStepSolver()}
              </div>
            </div>
          </div>
        )}

        {effectiveLayout === 'balanced_split' && (
          <div className="space-y-5">
            {/* Top Zone: Side-by-side harmonic sandbox & step solver (7 cols + 5 cols) */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              <div className="lg:col-span-7">
                {renderInteractiveStage()}
              </div>
              <div className="lg:col-span-5">
                {renderStepByStepSolver()}
              </div>
            </div>

            {/* Bottom Zone: Lesson Subtopics reference and Practice Questions */}
            <div className="space-y-5">
              {renderSubtopicsReference(false)}
              {renderPracticeQuestions()}
            </div>
          </div>
        )}
      </main>

      {/* Floating AI Assistant & Settings Launcher (bottom-right) */}
      {!isAIAssistantOpen && (
        <div className="fixed right-5 bottom-5 z-40 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setAiInitialTab('chat');
              setIsAIAssistantOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl border border-[#0F172A] bg-[#0F172A] px-4 py-3 text-xs font-bold text-white shadow-lg transition hover:bg-[#1E293B]"
          >
            <Bot className="h-4 w-4 text-[#38BDF8]" />
            <span>دستیار هوشمند AI</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAiInitialTab('settings');
              setIsAIAssistantOpen(true);
            }}
            className="flex items-center justify-center rounded-xl border border-[#CBD5E1] bg-white p-3 text-[#0F172A] shadow-lg transition hover:border-[#0284C7] hover:text-[#0284C7]"
            aria-label="تنظیمات هوش مصنوعی و ارائه‌دهنده سفارشی"
            title="تنظیمات هوش مصنوعی (AI Settings)"
          >
            <Settings2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Interactive Floating Canvas Scratchpad */}
      <InteractiveScratchpad
        externalOpen={isScratchpadOpen}
        onExternalToggle={setIsScratchpadOpen}
      />

      {/* AI Assistant & OpenAI-Compatible Provider Settings Drawer */}
      <AIAssistantDrawer
        isOpen={isAIAssistantOpen}
        activeTab={aiInitialTab}
        onTabChange={setAiInitialTab}
        onClose={() => setIsAIAssistantOpen(false)}
        draftPrompt={aiDraftPrompt}
        onDraftPromptChange={setAiDraftPrompt}
        moduleContext={{
          moduleTitle: currentModule.title,
          moduleSubtitle: currentModule.subtitle,
          subtopicTitle: activeSubtopic.title,
        }}
      />

      {/* Searchable Master Formula Cheat-Sheet Modal */}
      <FormulaCheatSheetModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        onNavigateToSubtopic={(modId, subIdx) =>
          handleModuleSwitch(modId, subIdx)
        }
      />

      {/* Study Roadmap, Comprehensive Exam Simulator & Requirements Blueprint Modal */}
      <StudyRoadmapModal
        isOpen={isRoadmapModalOpen}
        activeTab={roadmapTab}
        onTabChange={setRoadmapTab}
        onClose={() => setIsRoadmapModalOpen(false)}
        progressState={progressState}
        onToggleSubtopic={handleToggleSubtopic}
        onToggleExample={handleToggleExample}
        onSelectQuizAnswer={handleSelectQuizAnswer}
        onResetQuizAnswers={handleResetQuizAnswers}
        onUpdateModuleNote={handleUpdateModuleNote}
        onJumpToModule={(modId, subIdx = 0) =>
          handleModuleSwitch(modId, subIdx)
        }
      />

      {/* PDF Slide Deck Viewer Modal */}
      <PdfViewerModal
        isOpen={isPdfOpen}
        onClose={() => setIsPdfOpen(false)}
        pageRangeLabel={currentModule.pdfPageRange}
      />
    </div>
  );
}
