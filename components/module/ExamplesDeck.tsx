'use client';

import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Lightbulb,
  CheckCircle2,
  SlidersHorizontal,
  BookOpen,
  Bot,
  Flag,
} from 'lucide-react';
import { CurriculumModule } from '@/lib/curriculum-data';
import {
  CustomSolverType,
  CUSTOM_SOLVER_TYPES,
  generateCustomExample,
} from '@/lib/example-generator';
import MathFormula, { MathText } from '@/components/MathFormula';

interface ExamplesDeckProps {
  module: CurriculumModule;
  exampleIndex: number;
  onExampleChange: (index: number) => void;
  completedExamples: string[];
  onToggleExample: (exampleId: string) => void;
  onAskAI: (promptText: string) => void;
}

type DeckMode = 'curated' | 'parametric';

/**
 * Worked problems. Two modes: the module's curated, fully expanded
 * derivations, and a parametric solver that regenerates a five-step
 * derivation from live parameters. Steps reveal one at a time — the
 * derivation unfolds at reading speed instead of dumping everything.
 */
export default function ExamplesDeck({
  module,
  exampleIndex,
  onExampleChange,
  completedExamples,
  onToggleExample,
  onAskAI,
}: ExamplesDeckProps) {
  const [mode, setMode] = useState<DeckMode>('curated');
  const [revealedSteps, setRevealedSteps] = useState(1);
  const [openHints, setOpenHints] = useState<Record<number, boolean>>({});

  // Parametric solver state
  const [solverType, setSolverType] = useState<CustomSolverType>('heat_1d');
  const [lengthL, setLengthL] = useState(3);
  const [diffusivityK, setDiffusivityK] = useState(2);
  const [modeN, setModeN] = useState(2);
  const [amplitudeA, setAmplitudeA] = useState(5);

  const curatedExample =
    module.workedExamples[exampleIndex] || module.workedExamples[0];

  const parametricExample = useMemo(
    () =>
      generateCustomExample(solverType, {
        lengthL,
        diffusivityK,
        modeN,
        amplitudeA,
      }),
    [solverType, lengthL, diffusivityK, modeN, amplitudeA]
  );

  const active = mode === 'curated' ? curatedExample : parametricExample;
  const totalSteps = active.steps.length;
  const visibleSteps = active.steps.slice(0, revealedSteps);
  const allRevealed = revealedSteps >= totalSteps;
  const isMastered =
    mode === 'curated' && curatedExample
      ? completedExamples.includes(curatedExample.id)
      : false;

  const handleSelectExample = (idx: number) => {
    onExampleChange(idx);
    setRevealedSteps(1);
    setOpenHints({});
  };

  const handleNextStep = () => {
    setRevealedSteps((s) => Math.min(totalSteps, s + 1));
  };

  const handleAskAIAboutStep = (stepNumber: number, stepTitle: string) => {
    const exampleTitle =
      mode === 'curated' ? curatedExample?.title : 'حل‌گر پارامتری';
    onAskAI(
      `درباره گام ${stepNumber} با عنوان «${stepTitle}» در مثال «${exampleTitle}» از بخش ${module.numberLabel} توضیح مفهومی و شهودی بده.`
    );
  };

  const sliderRows: {
    label: string;
    symbol: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (v: number) => void;
  }[] = [
    { label: 'طول بازه', symbol: 'L', value: lengthL, min: 1, max: 6, step: 1, onChange: setLengthL },
    { label: 'ضریب پخش / نرخ میرایی', symbol: 'k', value: diffusivityK, min: 1, max: 5, step: 1, onChange: setDiffusivityK },
    { label: 'شماره مُد', symbol: 'n', value: modeN, min: 1, max: 5, step: 1, onChange: setModeN },
    { label: 'دامنه', symbol: 'A', value: amplitudeA, min: 1, max: 9, step: 1, onChange: setAmplitudeA },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      {/* Mode switcher */}
      <div className="mb-5 flex gap-1 rounded-lg bg-muted p-1" role="tablist" aria-label="حالت حل مسائل">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'curated'}
          onClick={() => {
            setMode('curated');
            setRevealedSteps(1);
          }}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold transition-colors ${
            mode === 'curated'
              ? 'bg-surface text-ink shadow-sm'
              : 'text-ink-3 hover:text-ink'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          مثال‌های جزوه ({module.workedExamples.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'parametric'}
          onClick={() => {
            setMode('parametric');
            setRevealedSteps(1);
          }}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold transition-colors ${
            mode === 'parametric'
              ? 'bg-surface text-ink shadow-sm'
              : 'text-ink-3 hover:text-ink'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          حل‌گر پارامتری
        </button>
      </div>

      {/* ── Parametric controls ── */}
      {mode === 'parametric' && (
        <section className="animate-rise mb-5 rounded-xl border border-line bg-surface p-4">
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="نوع مسئله">
            {CUSTOM_SOLVER_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                role="radio"
                aria-checked={solverType === type.id}
                onClick={() => {
                  setSolverType(type.id);
                  setRevealedSteps(1);
                }}
                title={type.hint}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                  solverType === type.id
                    ? 'border-accent bg-accent-soft text-accent-deep dark:text-accent'
                    : 'border-line bg-panel text-ink-3 hover:border-line-strong'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {sliderRows.map((row) => (
              <div key={row.symbol}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink-2">{row.label}</span>
                  <span className="rounded-md bg-accent-soft px-1.5 py-0.5 font-mono font-bold tabular-nums text-accent-deep dark:text-accent">
                    {row.symbol} = {row.value}
                  </span>
                </div>
                <input
                  type="range"
                  dir="ltr"
                  min={row.min}
                  max={row.max}
                  step={row.step}
                  value={row.value}
                  onChange={(e) => row.onChange(Number(e.target.value))}
                  aria-label={row.label}
                  className="w-full accent-[var(--accent)]"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Problem statement ── */}
      <section className="rounded-xl border border-line-strong bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-accent-deep dark:text-accent">
            صورت مسئله
            {mode === 'curated' && curatedExample && (
              <span className="ms-2 font-normal text-ink-4">
                {curatedExample.pdfReference} · سطح: {curatedExample.difficulty}
              </span>
            )}
          </span>

          {mode === 'curated' && (
            <button
              type="button"
              onClick={() => onToggleExample(curatedExample.id)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-colors ${
                isMastered
                  ? 'border-ok-line bg-ok-soft text-ok-ink'
                  : 'border-line-strong bg-surface text-ink-2 hover:border-accent hover:text-accent'
              }`}
            >
              <CheckCircle2 className={`h-3.5 w-3.5 ${isMastered ? 'text-ok' : ''}`} />
              {isMastered ? 'تسلط ثبت شد' : 'ثبت تسلط'}
            </button>
          )}
        </div>

        {mode === 'curated' && (
          <h2 className="mt-2 text-base font-bold leading-7 text-ink">
            <MathText text={curatedExample.title} />
          </h2>
        )}
        {mode === 'curated' && (
          <p className="mt-2 text-[13px] leading-7 text-ink-2">
            <MathText text={curatedExample.problemStatement} />
          </p>
        )}
        <div className="mt-3">
          <MathFormula
            formula={mode === 'curated' ? curatedExample.problemFormula : parametricExample.problemHeader}
            block
          />
        </div>
      </section>

      {/* ── Step controls ── */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3.5 py-2.5">
        <span className="text-xs font-semibold tabular-nums text-ink-3">
          نمایش گام {Math.min(revealedSteps, totalSteps)} از {totalSteps}
        </span>
        <div className="flex items-center gap-1.5">
          {allRevealed ? (
            <button
              type="button"
              onClick={() => {
                setRevealedSteps(1);
                setOpenHints({});
              }}
              className="flex items-center gap-1.5 rounded-md border border-line-strong bg-surface px-3 py-1.5 text-xs font-bold text-ink-2 transition-colors hover:border-line-strong"
            >
              <Eye className="h-3.5 w-3.5" />
              حل از ابتدا
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setRevealedSteps(totalSteps)}
                className="rounded-md border border-line-strong bg-surface px-3 py-1.5 text-xs font-bold text-ink-2 transition-colors hover:border-line-strong"
              >
                نمایش همه
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-1.5 rounded-md bg-accent-solid px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-accent-deep"
              >
                گام بعدی
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Steps timeline ── */}
      <ol className="mt-4 space-y-3">
        {visibleSteps.map((step, sIdx) => {
          const stepTitle = step.title.replace(/^گام\s+[۰-۹0-9]+:\s*/, '');
          const hintOpen = openHints[sIdx];
          return (
            <li
              key={step.stepNumber}
              className="animate-rise rounded-xl border border-line bg-surface p-4 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-solid text-xs font-bold text-white">
                  {step.stepNumber}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold leading-6 text-ink">
                    <MathText text={stepTitle} />
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-7 text-ink-2">
                    <MathText text={step.explanation} />
                  </p>
                  <div className="mt-3 overflow-hidden rounded-lg border border-line bg-panel px-2 py-1">
                    <MathFormula formula={step.formula} block />
                  </div>

                  {/* Why hint + ask AI */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {step.whyHint && (
                      <button
                        type="button"
                        onClick={() =>
                          setOpenHints((prev) => ({ ...prev, [sIdx]: !prev[sIdx] }))
                        }
                        aria-expanded={hintOpen}
                        className={`flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-bold transition-colors ${
                          hintOpen
                            ? 'border-warn-line bg-warn-soft text-warn-ink'
                            : 'border-line-strong bg-surface text-ink-3 hover:border-warn hover:text-warn-ink'
                        }`}
                      >
                        <Lightbulb className="h-3 w-3" />
                        چرا؟
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleAskAIAboutStep(step.stepNumber, stepTitle)}
                      className="flex items-center gap-1 rounded-md border border-line-strong bg-surface px-2.5 py-1 text-[11px] font-bold text-ink-3 transition-colors hover:border-accent hover:text-accent"
                    >
                      <Bot className="h-3 w-3" />
                      از دستیار بپرس
                    </button>
                  </div>

                  {step.whyHint && hintOpen && (
                    <p className="animate-rise mt-2.5 rounded-lg border border-warn-line bg-warn-soft p-3 text-xs leading-6 text-warn-ink">
                      <MathText text={step.whyHint} />
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* ── Final answer ── */}
      {mode === 'curated' && allRevealed && curatedExample && (
        <div className="animate-rise mt-4 rounded-xl border border-ok-line bg-ok-soft p-4 sm:p-5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-ok-ink">
            <Flag className="h-4 w-4 text-ok" />
            پاسخ نهایی
          </div>
          <div className="mt-2">
            <MathFormula formula={curatedExample.finalAnswerFormula} block />
          </div>
        </div>
      )}

      {/* ── Curated example navigation ── */}
      {mode === 'curated' && module.workedExamples.length > 1 && (
        <div className="mt-6 flex items-stretch justify-between gap-3 border-t border-line pt-5">
          {exampleIndex > 0 ? (
            <button
              type="button"
              onClick={() => handleSelectExample(exampleIndex - 1)}
              className="group flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-3 text-start transition-colors hover:border-line-strong"
            >
              <ChevronRight className="h-4 w-4 shrink-0 text-ink-4" />
              <span className="min-w-0">
                <span className="block text-[10px] font-semibold text-ink-4">مثال قبلی</span>
                <span className="block truncate text-xs font-bold text-ink">
                  <MathText text={module.workedExamples[exampleIndex - 1].title} />
                </span>
              </span>
            </button>
          ) : (
            <span className="flex-1" />
          )}

          {exampleIndex < module.workedExamples.length - 1 ? (
            <button
              type="button"
              onClick={() => handleSelectExample(exampleIndex + 1)}
              className="group flex min-w-0 flex-1 items-center justify-end gap-2 rounded-lg border border-line bg-surface px-3.5 py-3 text-end transition-colors hover:border-line-strong"
            >
              <span className="min-w-0">
                <span className="block text-[10px] font-semibold text-ink-4">مثال بعدی</span>
                <span className="block truncate text-xs font-bold text-ink">
                  <MathText text={module.workedExamples[exampleIndex + 1].title} />
                </span>
              </span>
              <ChevronLeft className="h-4 w-4 shrink-0 text-ink-4" />
            </button>
          ) : (
            <span className="flex-1" />
          )}
        </div>
      )}
    </div>
  );
}
