'use client';

import React, { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import {
  AlertTriangle,
  BookOpenCheck,
  Bot,
  CheckCircle2,
  ChevronDown,
  Eye,
  ExternalLink,
  FileText,
  GraduationCap,
  Info,
  Lightbulb,
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
import { useAssistant } from '@/components/shell/AppChrome';

/** Build a self-contained AI prompt for one exam question. */
function buildQuestionPrompt(
  paper: ExamPaper,
  question: ExamQuestion,
  mode: 'solve' | 'hint'
): string {
  const head = `سؤال ${question.numberLabel} از ${paper.title} ${paper.university} (${paper.semester}) — موضوع: ${question.topic}.`;
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

/**
 * بانک امتحانات — all midterm/final papers of the course with a complete,
 * triple-checked solution for every question. Solutions open inline;
 * viewing progress persists in localStorage.
 */
export default function ExamBank() {
  const { openAssistant } = useAssistant();
  const [topic, setTopic] = useState<ExamTopic>('همه موضوع‌ها');
  const [openPaperId, setOpenPaperId] = useState<string | null>(
    EXAM_PAPERS[0]?.id ?? null
  );
  const [openQuestions, setOpenQuestions] = useState<Set<string>>(new Set());
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

  const toggleQuestion = useCallback((questionId: string) => {
    setOpenQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
        markSeen(questionId);
      }
      return next;
    });
  }, []);

  const openAll = useCallback((paper: ExamPaper) => {
    setOpenQuestions((prev) => {
      const next = new Set(prev);
      let added = false;
      for (const q of paper.questions) {
        if (!next.has(q.id)) {
          next.add(q.id);
          added = true;
        }
      }
      if (added) {
        for (const q of paper.questions) markSeen(q.id);
      } else {
        for (const q of paper.questions) next.delete(q.id);
      }
      return next;
    });
  }, []);

  const seenCount = useMemo(
    () => EXAM_PAPERS.flatMap((p) => p.questions).filter((q) => seen.has(q.id)).length,
    [seen]
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold leading-10 text-ink">
          <GraduationCap className="h-7 w-7 text-accent" />
          بانک امتحانات و پاسخ‌های تشریحی
        </h1>
        <p className="mt-1 text-sm leading-7 text-ink-3">
          همهٔ برگه‌های میان‌ترم و پایان‌ترم موجود در{' '}
          <span dir="ltr" className="rounded bg-muted px-1.5 py-0.5 text-xs">
            public/assets/exams
          </span>{' '}
          · {EXAM_PAPERS.length} برگه · {TOTAL_EXAM_QUESTIONS} سؤال با حل کامل و
          کنترل‌شده (سه‌باره راستی‌آزمایی شده)
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
            دیده‌شده {seenCount}/{TOTAL_EXAM_QUESTIONS}
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
            className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
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
          const paperOpenCount = paper.questions.filter((q) =>
            openQuestions.has(q.id)
          ).length;

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
                  <span className="mt-0.5 block truncate text-xs text-ink-3">
                    {paper.semester}
                    {paper.examDate ? ` · ${paper.examDate}` : ''}
                    {paper.duration ? ` · ${paper.duration}` : ''}
                    {' · '}
                    {paper.questions.length} سؤال
                    {paper.hasOfficialSolution ? ' · دارای پاسخ‌نامهٔ رسمی' : ''}
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
                        onClick={() => openAll(paper)}
                        className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 text-[11px] font-bold text-ink-2 transition-colors hover:border-accent-line hover:text-accent-deep dark:hover:text-accent"
                      >
                        {paperOpenCount === paper.questions.length ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <BookOpenCheck className="h-3.5 w-3.5" />
                        )}
                        {paperOpenCount === paper.questions.length
                          ? 'بستن همهٔ حل‌ها'
                          : 'نمایش همهٔ حل‌ها'}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          openAssistant(
                            `برگهٔ ${paper.title} ${paper.university} (${paper.semester}) را جلوی من باز کرده‌ام؛ اگر سوالی از این برگه برایم مبهم است، درخواست می‌کنم سؤال را بنویسم و تو گام‌به‌گام برایم توضیح بدهی. برای شروع، فهرست موضوعات این برگه و پیش‌نیاز هر سؤال را خلاصه کن.`
                          )
                        }
                        className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 text-[11px] font-bold text-ink-2 transition-colors hover:border-accent-line hover:text-accent-deep dark:hover:text-accent"
                      >
                        <Bot className="h-3.5 w-3.5" />
                        پرسش دربارهٔ کل برگه
                      </button>
                    </div>
                    <a
                      href={paper.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 text-[11px] font-bold text-ink-2 transition-colors hover:border-accent-line hover:text-accent-deep dark:hover:text-accent"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      برگهٔ اصلی (PDF)
                    </a>
                  </div>

                  {/* Questions */}
                  <ol className="divide-y divide-line">
                    {paper.questions.map((q) => (
                      <QuestionCard
                        key={q.id}
                        paper={paper}
                        question={q}
                        isOpen={openQuestions.has(q.id)}
                        onToggle={() => toggleQuestion(q.id)}
                        wasSeen={seen.has(q.id)}
                        onAskAI={openAssistant}
                      />
                    ))}
                  </ol>
                </div>
              )}
            </section>
          );
        })}

        {papers.length === 0 && (
          <p className="rounded-xl border border-line bg-surface p-6 text-center text-sm text-ink-3">
            سوالی با این موضوع پیدا نشد.
          </p>
        )}
      </div>

      <p className="mt-6 flex items-start gap-2 rounded-xl border border-line bg-panel p-4 text-xs leading-6 text-ink-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <span>
          حل‌ها با قراردادهای جزوهٔ درس (تبدیل فوریه با هستهٔ{' '}
          <MathFormula formula="e^{-i\\alpha x}" />) نوشته شده‌اند و هر ادعای
          محاسباتی با مجموعه‌آزمون عددی{' '}
          <span dir="ltr" className="rounded bg-muted px-1.5 py-0.5 text-[11px]">
            lib/exams-verify.test.ts
          </span>{' '}
          راستی‌آزمایی شده است؛ مغایرت‌های پاسخ‌نامهٔ رسمی در صورت وجود با برچسب
          هشدار مشخص شده‌اند.
        </span>
      </p>
    </div>
  );
}

function QuestionCard({
  paper,
  question,
  isOpen,
  onToggle,
  wasSeen,
  onAskAI,
}: {
  paper: ExamPaper;
  question: ExamQuestion;
  isOpen: boolean;
  onToggle: () => void;
  wasSeen: boolean;
  onAskAI: (prompt: string) => void;
}) {
  return (
    <li className="px-4 py-4">
      {/* Statement */}
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-0.5 flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md px-1.5 text-xs font-bold ${
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

      {/* Toggle + AI */}
      <div className="mt-3 flex flex-wrap items-stretch gap-2">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          className={`flex flex-1 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
            isOpen
              ? 'border-accent-line bg-accent-soft text-accent-deep dark:text-accent'
              : 'border-line bg-surface text-ink-2 hover:border-accent-line hover:bg-accent-soft hover:text-accent-deep dark:hover:text-accent'
          }`}
        >
          <span className="flex items-center gap-1.5">
            {isOpen ? (
              <Eye className="h-4 w-4" />
            ) : (
              <Lightbulb className="h-4 w-4" />
            )}
            {isOpen ? 'پنهان کردن حل' : 'نمایش حل کامل'}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
        <button
          type="button"
          onClick={() => onAskAI(buildQuestionPrompt(paper, question, 'hint'))}
          className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-xs font-bold text-ink-2 transition-colors hover:border-accent-line hover:text-accent-deep dark:hover:text-accent"
          title="فقط راهنمایی اولیه، بدون حل کامل"
        >
          <Bot className="h-4 w-4" />
          راهنمایی بده
        </button>
        <button
          type="button"
          onClick={() => onAskAI(buildQuestionPrompt(paper, question, 'solve'))}
          className="flex items-center gap-1.5 rounded-lg border border-accent-line bg-accent-soft px-3 py-2 text-xs font-bold text-accent-deep transition-colors hover:bg-accent-tint dark:text-accent"
        >
          <Bot className="h-4 w-4" />
          حل با دستیار
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 space-y-3 rounded-xl border border-line bg-panel p-4">
          <p className="text-xs font-bold text-ink-3">
            <Lightbulb className="ml-1 inline h-3.5 w-3.5 text-accent" />
            ایدهٔ حل: <MathText text={question.approach} className="text-ink-2" />
          </p>

          <ol className="space-y-3">
            {question.steps.map((step, i) => (
              <li key={i} className="rounded-lg border border-line bg-surface p-3">
                <div className="text-xs font-bold text-ink">
                  <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded bg-accent-tint text-[11px] text-accent-deep dark:text-accent">
                    {i + 1}
                  </span>
                  <MathText text={step.title} />
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

          <div>
            <div className="mb-1.5 text-xs font-bold text-ok-ink">
              پاسخ نهایی
            </div>
            <MathFormula formula={question.finalAnswer} block highlight />
          </div>

          {(question.notes?.length ?? 0) > 0 && (
            <div className="space-y-2">
              {question.notes?.map((note, i) => (
                <p
                  key={i}
                  className={`flex items-start gap-2 rounded-lg border p-3 text-xs leading-6 ${
                    note.includes('⚠️')
                      ? 'border-warn-line bg-warn-soft text-warn-ink'
                      : 'border-line bg-surface text-ink-3'
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
