'use client';

import React, { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import {
  AlertTriangle,
  BookOpenCheck,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ExternalLink,
  EyeOff,
  FileText,
  Info,
  Lightbulb,
  RotateCcw,
} from 'lucide-react';
import {
  EXAM_PAPERS,
  EXAM_TOPICS,
  TOTAL_EXAM_QUESTIONS,
  type ExamPaper,
  type ExamQuestion,
  type ExamTopic,
} from '@/lib/exams';
import MathFormula, { MathText } from '@/components/MathFormula';
import { faNum } from '@/lib/persian-digits';
import { useAssistant } from '@/components/shell/AppChrome';

/** Build a self-contained AI prompt for one exam question. */
function buildQuestionPrompt(
  paper: ExamPaper,
  question: ExamQuestion,
  mode: 'solve' | 'hint'
): string {
  const head = `سؤال ${question.numberLabel} از ${paper.title} ${paper.university} (${paper.semester})، موضوع: ${question.topic}.`;
  const body = `${question.statement}${question.statementFormula ? `\n\n${question.statementFormula}` : ''}`;
  if (mode === 'hint') {
    return `${head}\n${body}\n\nلطفاً راه حل کامل را ننویس؛ فقط نکتهٔ کلیدی و نقطهٔ شروع را راهنمایی کن تا خودم ادامه دهم، و بعد از تلاش من مسیر را تصحیح کن.`;
  }
  return `${head}\n${body}\n\nلطفاً این سؤال را گام‌به‌گام حل کن؛ در هر گام دلیل ریاضی هر جابه‌جایی را بنویس و در انتها پاسخ نهایی را داخل کادر جمع‌بندی کن.`;
}

const STORAGE_KEY_SEEN = 'eng_math_exam_seen_v1';

/**
 * localStorage-backed «seen solutions» store. useSyncExternalStore keeps
 * SSR/hydration safe without a setState-in-effect (react-hooks rule).
 */
const EMPTY_SEEN: Set<string> = new Set();
let seenCache: Set<string> | null = null;
const seenListeners = new Set<() => void>();

function readSeenSet(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_SEEN);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function subscribeSeen(onChange: () => void): () => void {
  seenListeners.add(onChange);
  return () => seenListeners.delete(onChange);
}

function getSeenSnapshot(): Set<string> {
  if (seenCache === null) seenCache = readSeenSet();
  return seenCache;
}

function getSeenServerSnapshot(): Set<string> {
  return EMPTY_SEEN;
}

function markSeen(questionId: string): void {
  const current = getSeenSnapshot();
  if (current.has(questionId)) return;
  const next = new Set(current);
  next.add(questionId);
  seenCache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY_SEEN, JSON.stringify([...next]));
  } catch {
    /* storage unavailable — keep in-memory only */
  }
  seenListeners.forEach((l) => l());
}

/** Per-question solution state: open panel + how many steps are revealed. */
interface SolutionState {
  open: boolean;
  revealedSteps: number;
}

const MIN_TARGET = 'min-h-[44px]'; // WCAG/AA tap-target floor for exam controls

/**
 * بانک امتحانات — every paper of the course with a complete, triple-checked
 * solution per question. Each question runs the same active-recall ladder as
 * the worked examples: attempt first, peek at the strategic hint, then unfold
 * the solution step by step; the final answer only shows after the last step.
 * Viewing progress persists in localStorage.
 */
export default function ExamBank() {
  const { openAssistant } = useAssistant();
  const [topic, setTopic] = useState<ExamTopic>('همه موضوع‌ها');
  const [openPaperId, setOpenPaperId] = useState<string | null>(
    EXAM_PAPERS[0]?.id ?? null
  );
  const [openHints, setOpenHints] = useState<Set<string>>(new Set());
  const [solutions, setSolutions] = useState<Record<string, SolutionState>>({});
  const seen = useSyncExternalStore(
    subscribeSeen,
    getSeenSnapshot,
    getSeenServerSnapshot
  );

  const papers = useMemo<ExamPaper[]>(() => {
    if (topic === 'همه موضوع‌ها') return EXAM_PAPERS;
    return EXAM_PAPERS.map((paper) => ({
      ...paper,
      questions: paper.questions.filter((q) => q.topic === topic),
    })).filter((paper) => paper.questions.length > 0);
  }, [topic]);

  const toggleHint = useCallback((questionId: string) => {
    setOpenHints((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  }, []);

  const openSolution = useCallback((questionId: string) => {
    setSolutions((prev) => ({
      ...prev,
      [questionId]: {
        open: true,
        revealedSteps: prev[questionId]?.revealedSteps || 1,
      },
    }));
    markSeen(questionId);
  }, []);

  const closeSolution = useCallback((questionId: string) => {
    setSolutions((prev) => ({
      ...prev,
      [questionId]: {open: false, revealedSteps: prev[questionId]?.revealedSteps || 1},
    }));
  }, []);

  const revealNextStep = useCallback((questionId: string, total: number) => {
    setSolutions((prev) => ({
      ...prev,
      [questionId]: {
        open: true,
        revealedSteps: Math.min(total, (prev[questionId]?.revealedSteps || 1) + 1),
      },
    }));
  }, []);

  const revealAllSteps = useCallback((questionId: string, total: number) => {
    setSolutions((prev) => ({
      ...prev,
      [questionId]: {open: true, revealedSteps: total},
    }));
    markSeen(questionId);
  }, []);

  const restartSolution = useCallback((questionId: string) => {
    setSolutions((prev) => ({
      ...prev,
      [questionId]: {open: true, revealedSteps: 1},
    }));
  }, []);

  const setPaperSolutions = useCallback((paper: ExamPaper, open: boolean) => {
    const ids = paper.questions.map((q) => q.id);
    setSolutions((prev) => {
      const next = {...prev};
      for (const id of ids) {
        next[id] = {
          open,
          revealedSteps: open
            ? Math.max(prev[id]?.revealedSteps || 1, paper.questions.find((q) => q.id === id)!.steps.length)
            : prev[id]?.revealedSteps || 1,
        };
      }
      return next;
    });
    if (open) {
      for (const q of paper.questions) markSeen(q.id);
    }
  }, []);

  const seenCount = useMemo(
    () => EXAM_PAPERS.flatMap((p) => p.questions).filter((q) => seen.has(q.id)).length,
    [seen]
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold leading-10 text-ink">
          بانک امتحانات و پاسخ‌های تشریحی
        </h1>
        <p className="mt-1 text-sm leading-7 text-ink-3">
          {faNum(EXAM_PAPERS.length)} برگهٔ میان‌ترم و پایان‌ترم با{' '}
          {faNum(TOTAL_EXAM_QUESTIONS)} سؤال و حل گام‌به‌گام کنترل‌شده؛ هر برگه
          راستی‌آزمایی عددی شده و PDF اصلی آن هم در دسترس است.
        </p>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-accent-solid transition-[width] duration-500"
              style={{
                width: `${Math.round((seenCount / TOTAL_EXAM_QUESTIONS) * 100)}%`,
              }}
            />
          </div>
          <span className="shrink-0 text-xs font-bold tabular-nums text-ink-2">
            حل‌دیده‌شده {faNum(seenCount)} از {faNum(TOTAL_EXAM_QUESTIONS)}
          </span>
        </div>
      </div>

      {/* Topic filter */}
      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="فیلتر موضوع">
        {EXAM_TOPICS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTopic(t)}
            aria-pressed={topic === t}
            className={`min-h-[36px] rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
              topic === t
                ? 'border-accent bg-accent-soft text-accent-deep dark:text-accent'
                : 'border-line bg-surface text-ink-3 hover:border-line-strong hover:text-ink-2'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Papers */}
      <div className="space-y-3">
        {papers.map((paper, idx) => {
          const isOpen = openPaperId === paper.id;
          const paperOpenCount = paper.questions.filter(
            (q) => solutions[q.id]?.open
          ).length;
          const allOpen = paperOpenCount === paper.questions.length;

          return (
            <section
              key={paper.id}
              style={{ animationDelay: `${Math.min(idx * 40, 280)}ms` }}
              className="animate-rise overflow-hidden rounded-xl border border-line bg-surface"
            >
              {/* Paper header */}
              <button
                type="button"
                onClick={() => setOpenPaperId(isOpen ? null : paper.id)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-3 p-4 text-start transition-colors hover:bg-muted/60"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isOpen
                      ? 'bg-accent-soft text-accent-deep dark:text-accent'
                      : 'bg-muted text-ink-4'
                  }`}
                >
                  <FileText className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-ink">
                    {paper.university} · {paper.title}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-3">
                    <span>{paper.semester}</span>
                    {paper.examDate && <span aria-hidden="true">·</span>}
                    {paper.examDate && <span>{paper.examDate}</span>}
                    <span aria-hidden="true">·</span>
                    <span className="font-bold tabular-nums text-ink-2">
                      {faNum(paper.questions.length)} سؤال
                    </span>
                    {paper.duration && <span aria-hidden="true">·</span>}
                    {paper.duration && <span>{paper.duration}</span>}
                    {paper.hasOfficialSolution && (
                      <span className="rounded-md bg-ok-soft px-1.5 py-0.5 font-bold text-ok-ink">
                        پاسخ‌نامهٔ رسمی
                      </span>
                    )}
                  </span>
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-ink-4 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="border-t border-line">
                  {/* Paper toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-muted/40 px-4 py-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPaperSolutions(paper, !allOpen)}
                        className={`flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-2 text-[11px] font-bold text-ink-2 transition-colors hover:border-accent-line hover:text-accent-deep dark:hover:text-accent ${MIN_TARGET}`}
                      >
                        {allOpen ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <BookOpenCheck className="h-3.5 w-3.5" />
                        )}
                        {allOpen ? 'بستن همهٔ حل‌ها' : 'نمایش همهٔ حل‌ها'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          openAssistant(
                            `برگهٔ ${paper.title} ${paper.university} (${paper.semester}) را جلوی من باز کرده‌ام؛ اگر سوالی از این برگه برایم مبهم است، درخواست می‌کنم سؤال را بنویسم و تو گام‌به‌گام برایم توضیح بدهی. برای شروع، فهرست موضوعات این برگه و پیش‌نیاز هر سؤال را خلاصه کن.`
                          )
                        }
                        className={`flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-2 text-[11px] font-bold text-ink-2 transition-colors hover:border-accent-line hover:text-accent-deep dark:hover:text-accent ${MIN_TARGET}`}
                      >
                        <Bot className="h-3.5 w-3.5" />
                        پرسش دربارهٔ کل برگه
                      </button>
                    </div>
                    <a
                      href={paper.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-2 text-[11px] font-bold text-ink-2 transition-colors hover:border-accent-line hover:text-accent-deep dark:hover:text-accent ${MIN_TARGET}`}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      برگهٔ اصلی (PDF)
                    </a>
                  </div>

                  {/* Questions — each one its own card */}
                  <ol className="space-y-3 px-3 pb-4 pt-1">
                    {paper.questions.map((q) => {
                      const state = solutions[q.id] ?? {open: false, revealedSteps: 0};
                      return (
                        <QuestionCard
                          key={q.id}
                          paper={paper}
                          question={q}
                          hintOpen={openHints.has(q.id)}
                          onToggleHint={() => toggleHint(q.id)}
                          solution={state}
                          onOpenSolution={() => openSolution(q.id)}
                          onCloseSolution={() => closeSolution(q.id)}
                          onNextStep={() => revealNextStep(q.id, q.steps.length)}
                          onRevealAll={() => revealAllSteps(q.id, q.steps.length)}
                          onRestart={() => restartSolution(q.id)}
                          wasSeen={seen.has(q.id)}
                          onAskAI={openAssistant}
                        />
                      );
                    })}
                  </ol>
                </div>
              )}
            </section>
          );
        })}

        {papers.length === 0 && (
          <div className="rounded-xl border border-line bg-surface p-8 text-center">
            <p className="text-sm font-bold text-ink">
              سوالی با موضوع «{topic}» پیدا نشد.
            </p>
            <p className="mt-1 text-xs leading-6 text-ink-3">
              موضوع دیگری را انتخاب کنید یا فیلتر را بردارید.
            </p>
            <button
              type="button"
              onClick={() => setTopic('همه موضوع‌ها')}
              className={`mt-4 rounded-lg bg-accent-solid px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-accent-deep ${MIN_TARGET}`}
            >
              نمایش همهٔ موضوع‌ها
            </button>
          </div>
        )}
      </div>

      <p className="mt-6 flex items-start gap-2 rounded-xl border border-line bg-panel p-4 text-xs leading-6 text-ink-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <span>
          حل‌ها با قراردادهای جزوهٔ درس (تبدیل فوریه با هستهٔ{' '}
          <MathFormula formula="e^{-i\\alpha x}" />) نوشته شده و هر ادعای
          محاسباتی با آزمون عددی کنترل شده است؛ هرجا پاسخ‌نامهٔ رسمی با حل این
          صفحه اختلاف دارد، هشدارش داخل همان سؤال آمده است.
        </span>
      </p>
    </div>
  );
}

function QuestionCard({
  paper,
  question,
  hintOpen,
  onToggleHint,
  solution,
  onOpenSolution,
  onCloseSolution,
  onNextStep,
  onRevealAll,
  onRestart,
  wasSeen,
  onAskAI,
}: {
  paper: ExamPaper;
  question: ExamQuestion;
  hintOpen: boolean;
  onToggleHint: () => void;
  solution: SolutionState;
  onOpenSolution: () => void;
  onCloseSolution: () => void;
  onNextStep: () => void;
  onRevealAll: () => void;
  onRestart: () => void;
  wasSeen: boolean;
  onAskAI: (prompt: string) => void;
}) {
  const totalSteps = question.steps.length;
  const revealed = solution.revealedSteps;
  const allRevealed = revealed >= totalSteps;

  return (
    <li className="rounded-xl border border-line bg-panel p-4">
      {/* Statement */}
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-0.5 flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md px-1.5 text-xs font-bold ${
            wasSeen ? 'bg-ok-soft text-ok-ink' : 'bg-muted text-ink-3'
          }`}
        >
          {wasSeen ? <CheckCircle2 className="h-4 w-4 text-ok" /> : question.numberLabel}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm leading-7 text-ink">
            <MathText text={question.statement} />
          </div>
          {question.statementFormula && (
            <MathFormula formula={question.statementFormula} block />
          )}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {question.marks && (
              <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-bold text-ink-3">
                {question.marks}
              </span>
            )}
            <span className="rounded-md bg-accent-tint px-2 py-0.5 text-[11px] font-bold text-accent-deep dark:text-accent">
              {question.topic}
            </span>
            {question.officialSolution && (
              <span className="rounded-md bg-ok-tint px-2 py-0.5 text-[11px] font-bold text-ok-ink">
                پاسخ‌نامهٔ رسمی در PDF
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Attempt ladder: hint first, then the step-by-step solution */}
      <div className="mt-3 flex flex-wrap items-stretch gap-2">
        <button
          type="button"
          onClick={onToggleHint}
          aria-expanded={hintOpen}
          className={`flex min-h-[44px] flex-1 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
            hintOpen
              ? 'border-warn-line bg-warn-soft text-warn-ink'
              : 'border-line bg-surface text-ink-2 hover:border-warn hover:text-warn-ink'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Lightbulb className="h-4 w-4" />
            راهنمای شروع حل
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${hintOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {solution.open ? (
          <button
            type="button"
            onClick={onCloseSolution}
            className={`flex min-h-[44px] items-center gap-1.5 rounded-lg border border-accent-line bg-accent-soft px-3.5 py-2 text-xs font-bold text-accent-deep transition-colors hover:bg-accent-tint dark:text-accent ${MIN_TARGET}`}
          >
            <EyeOff className="h-4 w-4" />
            پنهان کردن حل
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenSolution}
            className={`flex min-h-[44px] items-center gap-1.5 rounded-lg bg-accent-solid px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-accent-deep ${MIN_TARGET}`}
          >
            <BookOpenCheck className="h-4 w-4" />
            نمایش حل گام‌به‌گام
          </button>
        )}

        <button
          type="button"
          onClick={() => onAskAI(buildQuestionPrompt(paper, question, 'hint'))}
          title="فقط راهنمایی اولیه، بدون حل کامل"
          className={`flex min-h-[44px] items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-xs font-bold text-ink-2 transition-colors hover:border-accent-line hover:text-accent-deep dark:hover:text-accent ${MIN_TARGET}`}
        >
          <Bot className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only">راهنمایی با دستیار</span>
        </button>
      </div>

      {/* Strategic hint — visible before the solution, deliberately cheap */}
      {hintOpen && (
        <div className="animate-rise mt-3 rounded-lg border-s-[3px] border-warn-line bg-warn-soft p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-warn-ink">
            <Lightbulb className="h-3.5 w-3.5" />
            نقطهٔ شروع
          </div>
          <p className="mt-1.5 text-[13px] leading-7 text-warn-ink">
            <MathText text={question.approach} />
          </p>
        </div>
      )}

      {/* Step-by-step solution — unfolds at reading speed */}
      {solution.open && (
        <div className="animate-rise mt-3 rounded-xl border border-line bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-panel px-3 py-2">
            <span className="text-xs font-semibold tabular-nums text-ink-3">
              نمایش گام {faNum(Math.min(revealed, totalSteps))} از{' '}
              {faNum(totalSteps)}
            </span>
            <div className="flex items-center gap-1.5">
              {allRevealed ? (
                <button
                  type="button"
                  onClick={onRestart}
                  className={`flex items-center gap-1.5 rounded-md border border-line-strong bg-surface px-3 py-1.5 text-xs font-bold text-ink-2 transition-colors hover:border-accent hover:text-accent-deep ${MIN_TARGET}`}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  حل از ابتدا
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onRevealAll}
                    className={`rounded-md border border-line-strong bg-surface px-3 py-1.5 text-xs font-bold text-ink-2 transition-colors hover:border-accent hover:text-accent-deep ${MIN_TARGET}`}
                  >
                    نمایش همه
                  </button>
                  <button
                    type="button"
                    onClick={onNextStep}
                    className={`flex items-center gap-1.5 rounded-md bg-accent-solid px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-accent-deep ${MIN_TARGET}`}
                  >
                    گام بعدی
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          <ol className="mt-3 space-y-3">
            {question.steps.slice(0, revealed).map((step, i) => (
              <li
                key={i}
                className="animate-rise rounded-lg border border-line bg-panel p-3"
              >
                <div className="flex items-start gap-2 text-xs font-bold text-ink">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-solid text-[11px] text-white">
                    {faNum(i + 1)}
                  </span>
                  <span className="mt-1 min-w-0">
                    <MathText text={step.title} />
                  </span>
                </div>
                {step.formula && (
                  <MathFormula formula={step.formula} block className="mt-2" />
                )}
                {step.detail && (
                  <p className="mt-2 text-xs leading-6 text-ink-2">
                    <MathText text={step.detail} />
                  </p>
                )}
              </li>
            ))}
          </ol>

          {!allRevealed && (
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-4">
              <Info className="h-3.5 w-3.5" />
              پاسخ نهایی بعد از آخرین گام نمایش داده می‌شود؛ اول خودتان را امتحان کنید.
            </p>
          )}

          {allRevealed && (
            <div className="animate-rise mt-3">
              <div className="mb-1.5 text-xs font-bold text-ok-ink">
                پاسخ نهایی
              </div>
              <MathFormula formula={question.finalAnswer} block highlight />
            </div>
          )}

          {(question.notes?.length ?? 0) > 0 && allRevealed && (
            <div className="mt-3 space-y-2">
              {question.notes?.map((note, i) => (
                <p
                  key={i}
                  className={`flex items-start gap-2 rounded-lg border p-3 text-xs leading-6 ${
                    note.includes('⚠️')
                      ? 'border-warn-line bg-warn-soft text-warn-ink'
                      : 'border-line bg-panel text-ink-3'
                  }`}
                >
                  {note.includes('⚠️') ? (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : (
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  )}
                  <MathText text={note.replace('⚠️ ', '')} />
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </li>
  );
}
