'use client';

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';
import { CURRICULUM_MODULES, ModuleId } from '@/lib/curriculum-data';
import {
  StudyProgressProvider,
  useStudyProgress,
} from '@/lib/study-progress-context';
import TopBar from '@/components/shell/TopBar';
import PdfViewerModal from '@/components/PdfViewerModal';
import InteractiveScratchpad from '@/components/InteractiveScratchpad';
import AIAssistantDrawer from '@/components/AIAssistantDrawer';
import FormulaSheetModal from '@/components/overlays/FormulaSheetModal';
import ExamModal from '@/components/overlays/ExamModal';
import RequirementsModal from '@/components/overlays/RequirementsModal';

interface LessonContextHint {
  subtopicTitle: string;
}

interface AssistantContextValue {
  openAssistant: (prompt?: string, lessonHint?: LessonContextHint) => void;
}

interface CourseToolsContextValue {
  openFormulas: () => void;
  openExam: () => void;
  openRequirements: () => void;
  openPdf: () => void;
  toggleScratchpad: () => void;
}

const AssistantContext = createContext<AssistantContextValue | null>(null);
const CourseToolsContext = createContext<CourseToolsContextValue | null>(null);

/** Open the AI assistant drawer, optionally prefilled with a prompt. */
export function useAssistant(): AssistantContextValue {
  const ctx = useContext(AssistantContext);
  if (!ctx) {
    throw new Error('useAssistant must be used inside <AppChrome>');
  }
  return ctx;
}

/** Open the course-wide tools (formula bank, exam, requirements, PDF, scratchpad). */
export function useCourseTools(): CourseToolsContextValue {
  const ctx = useContext(CourseToolsContext);
  if (!ctx) {
    throw new Error('useCourseTools must be used inside <AppChrome>');
  }
  return ctx;
}

interface AppChromeProps {
  /** Id of the module the current route shows; undefined on the course map */
  moduleId?: ModuleId;
  children: React.ReactNode;
}

/**
 * Application chrome shared by every route: top bar, global overlays
 * (formula bank, exam, requirements, PDF, scratchpad, AI assistant) and
 * the persisted progress provider. Each page renders its content as
 * children; overlay state is per-route by design (navigation resets it),
 * while study progress persists through storage sync.
 */
export default function AppChrome({ moduleId, children }: AppChromeProps) {
  const activeModule = useMemo(() => {
    if (!moduleId) return undefined;
    return (
      CURRICULUM_MODULES.find((m) => m.id === moduleId) ||
      CURRICULUM_MODULES[0]
    );
  }, [moduleId]);

  return (
    <ActiveModuleContext.Provider value={activeModule}>
      <StudyProgressProvider>
        <ChromeOverlayProvider>{children}</ChromeOverlayProvider>
      </StudyProgressProvider>
    </ActiveModuleContext.Provider>
  );
}

const ActiveModuleContext = createContext<
  (typeof CURRICULUM_MODULES)[number] | undefined
>(undefined);

function ChromeOverlayProvider({ children }: { children: React.ReactNode }) {
  const [aiInitialTab, setAiInitialTab] = useState<'chat' | 'settings'>('chat');
  const [aiDraftPrompt, setAiDraftPrompt] = useState('');
  const [aiLessonHint, setAiLessonHint] = useState<
    LessonContextHint | undefined
  >(undefined);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isRequirementsModalOpen, setIsRequirementsModalOpen] = useState(false);
  const [isPdfOpen, setIsPdfOpen] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);

  const openAssistant = (prompt?: string, lessonHint?: LessonContextHint) => {
    if (prompt !== undefined) setAiDraftPrompt(prompt);
    setAiLessonHint(lessonHint);
    setAiInitialTab('chat');
    setIsAIAssistantOpen(true);
  };

  const assistantValue = useMemo<AssistantContextValue>(
    () => ({ openAssistant }),
    []
  );

  const courseToolsValue = useMemo<CourseToolsContextValue>(
    () => ({
      openFormulas: () => setIsFormulaModalOpen(true),
      openExam: () => setIsExamModalOpen(true),
      openRequirements: () => setIsRequirementsModalOpen(true),
      openPdf: () => setIsPdfOpen(true),
      toggleScratchpad: () => setIsScratchpadOpen((prev) => !prev),
    }),
    []
  );

  const aiModuleContext = useAiModuleContext(aiLessonHint);

  return (
    <AssistantContext.Provider value={assistantValue}>
      <CourseToolsContext.Provider value={courseToolsValue}>
        {children}

        {/* ── Global overlays ── */}

        <AIAssistantDrawer
          isOpen={isAIAssistantOpen}
          activeTab={aiInitialTab}
          onTabChange={setAiInitialTab}
          onClose={() => setIsAIAssistantOpen(false)}
          draftPrompt={aiDraftPrompt}
          onDraftPromptChange={setAiDraftPrompt}
          moduleContext={aiModuleContext}
        />

        <FormulaSheetModal
          isOpen={isFormulaModalOpen}
          onClose={() => setIsFormulaModalOpen(false)}
        />

        <ExamBridge isOpen={isExamModalOpen} onClose={() => setIsExamModalOpen(false)} />

        <RequirementsModal
          isOpen={isRequirementsModalOpen}
          onClose={() => setIsRequirementsModalOpen(false)}
        />

        <PdfBridge isOpen={isPdfOpen} onClose={() => setIsPdfOpen(false)} />

        <InteractiveScratchpad
          externalOpen={isScratchpadOpen}
          onExternalToggle={setIsScratchpadOpen}
        />
      </CourseToolsContext.Provider>
    </AssistantContext.Provider>
  );
}

function useAiModuleContext(lessonHint?: LessonContextHint) {
  const activeModule = useContext(ActiveModuleContext);
  if (!activeModule) {
    return {
      moduleTitle: 'آزمایشگاه تعاملی ریاضیات مهندسی (نقشه دوره)',
      moduleSubtitle: '',
      subtopicTitle: lessonHint?.subtopicTitle || '',
    };
  }
  return {
    moduleTitle: activeModule.title,
    moduleSubtitle: activeModule.subtitle,
    subtopicTitle: lessonHint?.subtopicTitle || '',
  };
}

function ExamBridge({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { progressState, selectQuizAnswer, resetQuizAnswers } =
    useStudyProgress();

  return (
    <ExamModal
      isOpen={isOpen}
      onClose={onClose}
      progressState={progressState}
      onSelectQuizAnswer={selectQuizAnswer}
      onResetQuizAnswers={resetQuizAnswers}
    />
  );
}

function PdfBridge({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const activeModule = useContext(ActiveModuleContext);

  return (
    <PdfViewerModal
      isOpen={isOpen}
      onClose={onClose}
      pageRangeLabel={activeModule?.pdfPageRange ?? ''}
    />
  );
}

/** TopBar wired to the chrome contexts; rendered by pages via <AppShell/>. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const courseTools = useCourseTools();
  const assistant = useAssistant();

  return (
    <div className="min-h-screen bg-paper text-ink">
      <TopBar
        onOpenFormulas={courseTools.openFormulas}
        onOpenPdf={courseTools.openPdf}
        onToggleScratchpad={courseTools.toggleScratchpad}
        onOpenAI={() => assistant.openAssistant()}
      />
      {children}
    </div>
  );
}
