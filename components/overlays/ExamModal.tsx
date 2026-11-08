'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CURRICULUM_MODULES, ModuleId } from '@/lib/curriculum-data';
import {
  StudyProgressState,
  getExamQuestions,
  evaluateExamResults,
} from '@/lib/study-engine';
import MathFormula, { MathText } from '@/components/MathFormula';
import Modal from '@/components/ui/Modal';
import {
  Award,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowUpLeft,
} from 'lucide-react';

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  progressState: StudyProgressState;
  onSelectQuizAnswer: (questionId: string, optionIdx: number) => void;
  onResetQuizAnswers: (moduleFilter: ModuleId | 'all') => void;
}

/**
 * Comprehensive exam simulator with diagnostic scoreboard. Answers are
 * shared with the per-module quizzes (same store), so progress made here
 * shows up everywhere.
 */
export default function ExamModal({
  isOpen,
  onClose,
  progressState,
  onSelectQuizAnswer,
  onResetQuizAnswers,
}: ExamModalProps) {
  const router = useRouter();
  const [examModuleFilter, setExamModuleFilter] = useState<ModuleId | 'all'>(
    'all'
  );

  const examQuestions = useMemo(
    () => getExamQuestions(examModuleFilter, CURRICULUM_MODULES),
    [examModuleFilter]
  );

  const examEvaluation = useMemo(
    () =>
      evaluateExamResults(
        progressState.quizAnswers,
        examModuleFilter,
        CURRICULUM_MODULES
      ),
    [progressState.quizAnswers, examModuleFilter]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="آزمون جامع"
      title="آزمون جامع"
      description="پوشش کامل مباحث پایه، فوریه، اشتورم-لیوویل و معادله گرما"
      icon={<Award className="h-5 w-5" />}
      widthClass="max-w-3xl"
    >
      {/* Filter + reset */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <select
          value={examModuleFilter}
          onChange={(e) => setExamModuleFilter(e.target.value as ModuleId | 'all')}
          aria-label="فیلتر فصل آزمون"
          className="rounded-lg border border-line-strong bg-surface px-3 py-2 text-xs font-bold text-ink outline-none transition-colors focus:border-accent"
        >
          <option value="all">آزمون جامع کل درس (۷ فصل)</option>
          {CURRICULUM_MODULES.map((m) => (
            <option key={m.id} value={m.id}>
              فقط {m.shortTitle}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onResetQuizAnswers(examModuleFilter)}
          className="flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 py-2 text-xs font-bold text-ink-3 transition-colors hover:border-danger hover:text-danger"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          پاک کردن پاسخ‌ها
        </button>
      </div>

      {/* Scoreboard — one calm strip */}
      <div className="mb-5 rounded-xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div>
            <div className="text-[11px] text-ink-4">نمره کل</div>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums text-accent">
                {examEvaluation.scorePercent}%
              </span>
              <span className="text-xs font-semibold text-ink-2">
                {examEvaluation.gradeLabelFa}
              </span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-ink-4">پاسخ صحیح</div>
            <div className="mt-0.5 text-sm font-bold tabular-nums text-ink">
              {examEvaluation.correctCount} از {examEvaluation.totalQuestions}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-ink-4">نادرست / بی‌پاسخ</div>
            <div className="mt-0.5 text-sm font-bold tabular-nums text-ink">
              {examEvaluation.wrongCount} / {examEvaluation.unansweredCount}
            </div>
          </div>
        </div>

        {(examEvaluation.strongModules.length > 0 ||
          examEvaluation.weakModules.length > 0) && (
          <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-xs leading-6">
            {examEvaluation.strongModules.length > 0 && (
              <p>
                <span className="font-bold text-ok">فصول مسلط: </span>
                <span className="text-ink-2">
                  {examEvaluation.strongModules.join(' · ')}
                </span>
              </p>
            )}
            {examEvaluation.weakModules.length > 0 && (
              <p>
                <span className="font-bold text-warn">نیازمند مرور: </span>
                <span className="text-ink-2">
                  {examEvaluation.weakModules.join(' · ')}
                </span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Questions — single column, calm scanning */}
      <div className="space-y-3">
        {examQuestions.map((q, idx) => {
          const userChoice = progressState.quizAnswers[q.id];
          const isAnswered = userChoice !== undefined;
          const isCorrect = userChoice === q.correctIndex;

          return (
            <div
              key={q.id}
              className="rounded-xl border border-line bg-surface p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-2 text-[11px] text-ink-4">
                <span className="font-bold text-accent">
                  سوال {idx + 1} · {q.moduleNumberLabel}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    router.push(`/module/${q.moduleId}`);
                    onClose();
                  }}
                  className="flex items-center gap-1 font-semibold text-accent-deep hover:underline dark:text-accent"
                >
                  مرور این فصل
                  <ArrowUpLeft className="h-3 w-3" />
                </button>
              </div>

              <p className="text-sm font-semibold leading-8 text-ink">
                <MathText text={q.question} />
              </p>

              <div className="mt-3 space-y-1.5">
                {q.options.map((opt, optIdx) => {
                  const isSelected = userChoice === optIdx;
                  let optionClass =
                    'border-line-strong bg-surface text-ink hover:border-accent';
                  if (isAnswered) {
                    if (optIdx === q.correctIndex) {
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
                      disabled={isAnswered}
                      onClick={() => onSelectQuizAnswer(q.id, optIdx)}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-start text-xs transition-colors disabled:cursor-default ${optionClass}`}
                    >
                      <MathFormula formula={opt} block={false} />
                      {isAnswered && optIdx === q.correctIndex && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-ok" />
                      )}
                      {isAnswered && isSelected && optIdx !== q.correctIndex && (
                        <XCircle className="h-4 w-4 shrink-0 text-danger" />
                      )}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <div
                  className={`animate-rise mt-3 rounded-lg border p-3 text-xs leading-6 ${
                    isCorrect
                      ? 'border-ok-line bg-ok-soft text-ok-ink'
                      : 'border-warn-line bg-warn-soft text-warn-ink'
                  }`}
                >
                  <strong className="font-bold">
                    {isCorrect ? 'پاسخ صحیح است. ' : 'پاسخ نادرست است. '}
                  </strong>
                  <MathText text={q.explanation} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
