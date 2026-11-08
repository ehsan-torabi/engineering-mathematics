'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { CURRICULUM_MODULES, ModuleId } from '@/lib/curriculum-data';
import {
  StudyProgressState,
  INITIAL_STUDY_PROGRESS,
  CourseProgressReport,
  ModuleMasterySummary,
  computeCourseProgress,
} from '@/lib/study-engine';

const STORAGE_KEY_PROGRESS = 'eng_math_study_progress_v1';

interface StudyProgressContextValue {
  progressState: StudyProgressState;
  courseProgress: CourseProgressReport;
  moduleMastery: Record<string, number>;
  moduleSummaryFor: (moduleId: ModuleId) => ModuleMasterySummary;
  toggleSubtopic: (subtopicId: string) => void;
  toggleExample: (exampleId: string) => void;
  selectQuizAnswer: (questionId: string, optionIdx: number) => void;
  resetQuizAnswers: (moduleFilter: ModuleId | 'all') => void;
  updateModuleNote: (moduleId: ModuleId, noteText: string) => void;
}

const StudyProgressContext =
  createContext<StudyProgressContextValue | null>(null);

/**
 * Single persisted study-progress store shared by every route (home and
 * module pages). Reads the same localStorage key the app has always used,
 * so existing progress survives the routing refactor.
 */
export function StudyProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [progressState, setProgressState] = useState<StudyProgressState>(
    () => {
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
    }
  );

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

  const courseProgress = useMemo(
    () => computeCourseProgress(progressState, CURRICULUM_MODULES),
    [progressState]
  );

  const moduleMastery = useMemo(() => {
    const map: Record<string, number> = {};
    courseProgress.moduleSummaries.forEach((s) => {
      map[s.moduleId] = s.masteryPercent;
    });
    return map;
  }, [courseProgress]);

  const value = useMemo<StudyProgressContextValue>(
    () => ({
      progressState,
      courseProgress,
      moduleMastery,
      moduleSummaryFor: (moduleId) =>
        courseProgress.moduleSummaries.find(
          (s) => s.moduleId === moduleId
        ) || courseProgress.moduleSummaries[0],
      toggleSubtopic: (subtopicId) => {
        setProgressState((prev) => {
          const exists = prev.completedSubtopics.includes(subtopicId);
          return {
            ...prev,
            completedSubtopics: exists
              ? prev.completedSubtopics.filter((id) => id !== subtopicId)
              : [...prev.completedSubtopics, subtopicId],
          };
        });
      },
      toggleExample: (exampleId) => {
        setProgressState((prev) => {
          const exists = prev.completedExamples.includes(exampleId);
          return {
            ...prev,
            completedExamples: exists
              ? prev.completedExamples.filter((id) => id !== exampleId)
              : [...prev.completedExamples, exampleId],
          };
        });
      },
      selectQuizAnswer: (questionId, optionIdx) => {
        setProgressState((prev) => ({
          ...prev,
          quizAnswers: {
            ...prev.quizAnswers,
            [questionId]: optionIdx,
          },
        }));
      },
      resetQuizAnswers: (moduleFilter) => {
        if (moduleFilter === 'all') {
          setProgressState((prev) => ({ ...prev, quizAnswers: {} }));
          return;
        }
        const targetMod = CURRICULUM_MODULES.find(
          (m) => m.id === moduleFilter
        );
        if (!targetMod) return;
        const qIds = new Set(targetMod.practiceQuestions.map((q) => q.id));
        setProgressState((prev) => {
          const nextAnswers = { ...prev.quizAnswers };
          qIds.forEach((id) => {
            delete nextAnswers[id];
          });
          return { ...prev, quizAnswers: nextAnswers };
        });
      },
      updateModuleNote: (moduleId, noteText) => {
        setProgressState((prev) => ({
          ...prev,
          moduleNotes: {
            ...prev.moduleNotes,
            [moduleId]: noteText,
          },
        }));
      },
    }),
    [progressState, courseProgress, moduleMastery]
  );

  return (
    <StudyProgressContext.Provider value={value}>
      {children}
    </StudyProgressContext.Provider>
  );
}

export function useStudyProgress(): StudyProgressContextValue {
  const ctx = useContext(StudyProgressContext);
  if (!ctx) {
    throw new Error(
      'useStudyProgress must be used inside <StudyProgressProvider>'
    );
  }
  return ctx;
}
