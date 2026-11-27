'use client';

import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Trophy,
  Circle,
} from 'lucide-react';
import { CurriculumModule } from '@/lib/curriculum-data';
import MathFormula, { MathText } from '@/components/MathFormula';
import { faNum } from '@/lib/persian-digits';

interface QuizPanelProps {
  module: CurriculumModule;
  quizAnswers: Record<string, number>;
  onSelectQuizAnswer: (questionId: string, optionIdx: number) => void;
  onResetModuleQuiz: () => void;
}

/**
 * Self-assessment, one question at a time. Answer reveals instant feedback
 * plus the reasoning; a dot rail shows progress and lets the learner jump
 * around. Finishing all questions shows a score card with a retry action.
 */
export default function QuizPanel({
  module,
  quizAnswers,
  onSelectQuizAnswer,
  onResetModuleQuiz,
}: QuizPanelProps) {
  const questions = module.practiceQuestions;

  const firstUnansweredIdx = useMemo(() => {
    const idx = questions.findIndex((q) => quizAnswers[q.id] === undefined);
    return idx === -1 ? 0 : idx;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [module.id]);

  const [currentIdx, setCurrentIdx] = useState(firstUnansweredIdx);

  if (questions.length === 0) {
    return (
      <p className="rounded-xl border border-line bg-surface p-8 text-center text-sm text-ink-3">
        برای این فصل پرسش خودآزمایی ثبت نشده است.
      </p>
    );
  }

  const question = questions[currentIdx];
  const userChoice = quizAnswers[question.id];
  const isAnswered = userChoice !== undefined;
  const isCorrect = userChoice === question.correctIndex;

  const correctCount = questions.filter(
    (q) => quizAnswers[q.id] === q.correctIndex
  ).length;
  const answeredCount = questions.filter(
    (q) => quizAnswers[q.id] !== undefined
  ).length;
  const allAnswered = answeredCount === questions.length;

  const handleReset = () => {
    onResetModuleQuiz();
    setCurrentIdx(0);
  };

  /* ── Score card: every question answered ── */
  if (allAnswered) {
    const scorePercent = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="animate-rise mx-auto max-w-xl rounded-xl border border-line bg-surface p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft">
          <Trophy
            className={`h-7 w-7 ${
              scorePercent >= 70 ? 'text-ok' : 'text-accent'
            }`}
          />
        </div>
        <h2 className="mt-4 text-lg font-bold text-ink">
          خودآزمایی این فصل را کامل جواب دادی
        </h2>
        <p className="mt-2 text-sm leading-7 text-ink-3">
          <span className="font-bold tabular-nums text-ink">
            {faNum(correctCount)} از {faNum(questions.length)}
          </span>{' '}
          پاسخ صحیح · نمره{' '}
          <span className="font-bold tabular-nums text-ink">{faNum(scorePercent)}٪</span>
        </p>
        <p className="mt-1 text-xs leading-6 text-ink-3">
          {scorePercent >= 70
            ? 'تسلط خوبی بر این فصل داری؛ سراغ فصل بعد برو.'
            : 'پاسخ‌ها را مرور کن یا درس‌نامه‌های فصل را یک‌بار دیگر بخوان.'}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentIdx(0)}
            className="rounded-lg border border-line-strong bg-surface px-4 py-2 text-xs font-bold text-ink-2 transition-colors hover:border-accent hover:text-accent"
          >
            مرور پاسخ‌ها
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg bg-accent-solid px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-accent-deep"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            آزمون مجدد
          </button>
        </div>
      </div>
    );
  }

  /* ── One question at a time ── */
  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress dot rail */}
      <div
        className="mb-5 flex flex-wrap items-center gap-1.5"
        role="tablist"
        aria-label="پیشرفت خودآزمایی"
      >
        {questions.map((q, idx) => {
          const choice = quizAnswers[q.id];
          const state =
            choice === undefined
              ? 'unanswered'
              : choice === q.correctIndex
                ? 'correct'
                : 'wrong';
          return (
            <button
              key={q.id}
              type="button"
              role="tab"
              aria-selected={idx === currentIdx}
              aria-label={`سوال ${faNum(idx + 1)}`}
              onClick={() => setCurrentIdx(idx)}
              className={`flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-bold tabular-nums transition-colors ${
                idx === currentIdx
                  ? 'bg-accent-solid text-white'
                  : state === 'correct'
                    ? 'bg-ok-soft text-ok-ink'
                    : state === 'wrong'
                      ? 'bg-danger-soft text-danger-ink'
                      : 'bg-muted text-ink-4 hover:bg-line'
              }`}
            >
              {faNum(idx + 1)}
            </button>
          );
        })}
        <span className="ms-2 text-[11px] font-semibold tabular-nums text-ink-4">
          {faNum(answeredCount)}/{faNum(questions.length)} پاسخ داده شد
        </span>
      </div>

      {/* Question card */}
      <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
        <div className="text-xs font-bold text-accent-deep dark:text-accent">
          سوال {faNum(currentIdx + 1)} از {faNum(questions.length)}
        </div>

        <p className="mt-2.5 text-[15px] font-semibold leading-8 text-ink">
          <MathText text={question.question} />
        </p>

        {question.formula && (
          <div className="mt-3">
            <MathFormula formula={question.formula} block />
          </div>
        )}

        <div className="mt-5 space-y-2" role="radiogroup" aria-label="گزینه‌های پاسخ">
          {question.options.map((opt, optIdx) => {
            const isSelected = userChoice === optIdx;
            const isCorrectOption = optIdx === question.correctIndex;

            let optionClass =
              'border-line-strong bg-surface text-ink hover:border-accent';
            if (isAnswered) {
              if (isCorrectOption) {
                optionClass = 'border-ok bg-ok-soft text-ok-ink font-bold';
              } else if (isSelected) {
                optionClass = 'border-danger bg-danger-soft text-danger-ink';
              } else {
                optionClass = 'border-line bg-panel text-ink-4';
              }
            }

            return (
              <button
                key={optIdx}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={isAnswered}
                onClick={() => onSelectQuizAnswer(question.id, optIdx)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-start text-[13px] transition-colors disabled:cursor-default ${optionClass}`}
              >
                <MathFormula formula={opt} block={false} />
                {isAnswered && isCorrectOption && (
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-ok" />
                )}
                {isAnswered && isSelected && !isCorrectOption && (
                  <XCircle className="h-4.5 w-4.5 shrink-0 text-danger" />
                )}
                {isAnswered && !isSelected && !isCorrectOption && (
                  <Circle className="h-4 w-4 shrink-0 opacity-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {isAnswered && (
          <div
            className={`animate-rise mt-5 rounded-lg border p-4 text-[13px] leading-7 ${
              isCorrect
                ? 'border-ok-line bg-ok-soft text-ok-ink'
                : 'border-warn-line bg-warn-soft text-warn-ink'
            }`}
          >
            <strong className="font-bold">
              {isCorrect ? 'پاسخ صحیح است. ' : 'پاسخ نادرست است. '}
            </strong>
            <MathText text={question.explanation} />
          </div>
        )}
      </div>

      {/* Question navigation */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3.5 py-2 text-xs font-bold text-ink-2 transition-colors hover:border-line-strong disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
          سوال قبلی
        </button>

        {currentIdx < questions.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
            className="flex items-center gap-1.5 rounded-lg bg-accent-solid px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-accent-deep"
          >
            سوال بعدی
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : (
          <span className="text-xs text-ink-4">
            آخرین سوال باقی‌مانده را جواب بده
          </span>
        )}
      </div>
    </div>
  );
}
