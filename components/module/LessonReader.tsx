'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Zap,
  StickyNote,
  PenLine,
} from 'lucide-react';
import { CurriculumModule } from '@/lib/curriculum-data';
import MathFormula, { MathText } from '@/components/MathFormula';
import { Image as ImageIcon } from 'lucide-react';
import { SUBTOPIC_FIGURES } from '@/components/figures/figure-registry';

interface LessonReaderProps {
  module: CurriculumModule;
  subtopicIndex: number;
  onSubtopicChange: (index: number) => void;
  completedSubtopics: string[];
  onToggleSubtopic: (subtopicId: string) => void;
  note: string;
  onUpdateNote: (text: string) => void;
  /** Offered at the end of the last lesson: move on to worked problems */
  onGoToExamples?: () => void;
}

/**
 * Focused article reading — one subtopic, generous measure, nothing else
 * on screen. This is where learning actually happens, so chrome stays out
 * of the way: a kicker, a title, one mark-studied action, and the text.
 */
export default function LessonReader({
  module,
  subtopicIndex,
  onSubtopicChange,
  completedSubtopics,
  onToggleSubtopic,
  note,
  onUpdateNote,
  onGoToExamples,
}: LessonReaderProps) {
  const subtopic =
    module.subtopics[subtopicIndex] || module.subtopics[0];
  const total = module.subtopics.length;
  const isDone = completedSubtopics.includes(subtopic.id);
  const isFirst = subtopicIndex === 0;
  const isLast = subtopicIndex === total - 1;
  const prevSub = !isFirst ? module.subtopics[subtopicIndex - 1] : null;
  const nextSub = !isLast ? module.subtopics[subtopicIndex + 1] : null;

  const [isNoteOpen, setIsNoteOpen] = useState(false);

  return (
    <article className="mx-auto max-w-3xl">
      {/* Kicker */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-4">
        <span className="font-bold text-accent-deep dark:text-accent">
          درس‌نامه {subtopicIndex + 1} از {total}
        </span>
        <span aria-hidden="true">·</span>
        <span>صفحات جزوه: {subtopic.pdfPages}</span>
      </div>

      {/* Title + mark-studied */}
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <h2 className="min-w-0 flex-1 text-xl font-bold leading-9 text-ink">
          <MathText text={subtopic.title} />
        </h2>
        <button
          type="button"
          onClick={() => onToggleSubtopic(subtopic.id)}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
            isDone
              ? 'border-ok-line bg-ok-soft text-ok-ink'
              : 'border-line-strong bg-surface text-ink-2 hover:border-accent hover:text-accent'
          }`}
        >
          <CheckCircle2 className={`h-4 w-4 ${isDone ? 'text-ok' : ''}`} />
          {isDone ? 'مطالعه شد' : 'ثبت مطالعه'}
        </button>
      </div>

      {/* Lead summary */}
      <p className="mt-5 text-[15px] font-medium leading-9 text-ink">
        <MathText text={subtopic.summary} />
      </p>

      {/* Detailed explanation */}
      {subtopic.detailedExplanation && (
        <div className="mt-6 space-y-4 border-s-2 border-accent ps-4">
          {subtopic.detailedExplanation.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="text-[15px] leading-9 text-ink-2">
              <MathText text={paragraph} />
            </p>
          ))}
        </div>
      )}

      {/* Concept figure (if this subtopic has one) */}
      {(() => {
        const fig = SUBTOPIC_FIGURES[subtopic.id];
        if (!fig) return null;
        const { Figure, captionFa } = fig;
        return (
          <figure className="mt-7 rounded-xl border border-line bg-surface p-4">
            <div className="rounded-lg bg-panel p-2">
              <Figure />
            </div>
            <figcaption className="mt-2.5 flex items-start gap-2 text-xs leading-6 text-ink-3">
              <ImageIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-accent" />
              {captionFa}
            </figcaption>
          </figure>
        );
      })()}

      {/* Callouts: pitfalls and engineering applications */}
      {(subtopic.commonPitfalls?.length ||
        subtopic.engineeringApplications?.length) && (
        <div className="mt-8 space-y-4">
          {subtopic.commonPitfalls &&
            subtopic.commonPitfalls.length > 0 && (
              <section className="rounded-lg border border-warn-line bg-warn-soft p-4">
                <h3 className="flex items-center gap-1.5 text-xs font-bold text-warn-ink">
                  <AlertTriangle className="h-4 w-4 text-warn" />
                  دام‌های امتحانی و خطاهای رایج
                </h3>
                <ul className="mt-2.5 space-y-2">
                  {subtopic.commonPitfalls.map((pitfall, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-[13px] leading-7 text-warn-ink"
                    >
                      <span className="mt-3 h-1 w-1 shrink-0 rounded-full bg-warn" />
                      <MathText text={pitfall} />
                    </li>
                  ))}
                </ul>
              </section>
            )}

          {subtopic.engineeringApplications &&
            subtopic.engineeringApplications.length > 0 && (
              <section className="rounded-lg border border-ok-line bg-ok-soft p-4">
                <h3 className="flex items-center gap-1.5 text-xs font-bold text-ok-ink">
                  <Zap className="h-4 w-4 text-ok" />
                  کاربردهای مهندسی
                </h3>
                <ul className="mt-2.5 space-y-2">
                  {subtopic.engineeringApplications.map((app, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-[13px] leading-7 text-ok-ink"
                    >
                      <span className="mt-3 h-1 w-1 shrink-0 rounded-full bg-ok" />
                      <MathText text={app} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
        </div>
      )}

      {/* Key conceptual points */}
      {subtopic.conceptualPoints.length > 0 && (
        <section className="mt-8">
          <h3 className="text-xs font-bold text-ink-3">نکات کلیدی</h3>
          <ul className="mt-3 space-y-2.5">
            {subtopic.conceptualPoints.map((point, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-[15px] leading-8 text-ink-2"
              >
                <CheckCircle2 className="mt-1.5 h-4 w-4 shrink-0 text-ok" />
                <MathText text={point} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Reference formulas */}
      {subtopic.keyFormulas.length > 0 && (
        <section className="mt-8">
          <h3 className="text-xs font-bold text-ink-3">
            روابط و فرمول‌های مرجع
          </h3>
          <div className="mt-3 space-y-2.5">
            {subtopic.keyFormulas.map((kf, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-line bg-surface p-3.5"
              >
                <div className="mb-2 text-[13px] font-bold text-ink">
                  <MathText text={kf.label} />
                </div>
                <MathFormula formula={kf.formula} block />
                {kf.note && (
                  <p className="mt-2 border-t border-line pt-2 text-xs leading-6 text-ink-3">
                    <MathText text={kf.note} />
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Personal notes — collapsed by default, autosaves */}
      <div className="mt-10 rounded-lg border border-line bg-surface">
        <button
          type="button"
          onClick={() => setIsNoteOpen((prev) => !prev)}
          aria-expanded={isNoteOpen}
          className="flex w-full items-center justify-between gap-2 px-4 py-3"
        >
          <span className="flex items-center gap-2 text-xs font-bold text-ink-2">
            <StickyNote className="h-4 w-4 text-warn" />
            یادداشت من از این فصل
          </span>
          <span className="text-[11px] text-ink-4">
            {isNoteOpen ? 'بستن' : note ? 'دارای یادداشت ذخیره‌شده' : 'افزودن یادداشت'}
          </span>
        </button>
        {isNoteOpen && (
          <NoteBox
            key={subtopic.id}
            initialValue={note}
            onUpdate={onUpdateNote}
          />
        )}
      </div>

      {/* Lesson navigation */}
      <nav
        aria-label="جابه‌جایی بین درس‌نامه‌ها"
        className="mt-8 flex items-stretch justify-between gap-3 border-t border-line pt-6"
      >
        {prevSub ? (
          <button
            type="button"
            onClick={() => onSubtopicChange(subtopicIndex - 1)}
            className="group flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-3 text-start transition-colors hover:border-line-strong"
          >
            <ChevronRight className="h-4 w-4 shrink-0 text-ink-4 transition-transform group-hover:translate-x-0.5" />
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold text-ink-4">
                درس‌نامه قبلی
              </span>
              <span className="block truncate text-xs font-bold text-ink">
                <MathText text={prevSub.title} />
              </span>
            </span>
          </button>
        ) : (
          <span className="flex-1" />
        )}

        {nextSub ? (
          <button
            type="button"
            onClick={() => onSubtopicChange(subtopicIndex + 1)}
            className="group flex min-w-0 flex-1 items-center justify-end gap-2 rounded-lg border border-line bg-surface px-3.5 py-3 text-end transition-colors hover:border-line-strong"
          >
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold text-ink-4">
                درس‌نامه بعدی
              </span>
              <span className="block truncate text-xs font-bold text-ink">
                <MathText text={nextSub.title} />
              </span>
            </span>
            <ChevronLeft className="h-4 w-4 shrink-0 text-ink-4 transition-transform group-hover:-translate-x-0.5" />
          </button>
        ) : onGoToExamples ? (
          <button
            type="button"
            onClick={onGoToExamples}
            className="group flex min-w-0 flex-1 items-center justify-end gap-2 rounded-lg bg-accent-solid px-3.5 py-3 text-end text-white transition-colors hover:bg-accent-deep"
          >
            <span className="min-w-0">
              <span className="block text-[10px] font-semibold text-white/75">
                درس‌نامه‌ها تمام شد
              </span>
              <span className="flex items-center justify-end gap-1.5 text-xs font-bold">
                <PenLine className="h-3.5 w-3.5" />
                برو به مسائل حل‌شده
              </span>
            </span>
            <ChevronLeft className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
          </button>
        ) : (
          <span className="flex-1" />
        )}
      </nav>
    </article>
  );
}

/**
 * Note editor for one subtopic. Keyed by the subtopic id, so switching
 * lessons remounts it with the fresh saved value — no sync effect needed.
 */
function NoteBox({
  initialValue,
  onUpdate,
}: {
  initialValue: string;
  onUpdate: (text: string) => void;
}) {
  const [draft, setDraft] = useState(initialValue);

  return (
    <div className="animate-rise border-t border-line p-4">
      <textarea
        rows={6}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          onUpdate(e.target.value);
        }}
        placeholder="نکات کلیدی، فرمول‌های فرّار یا سوالات امتحانی‌ات را اینجا بنویس (ذخیره خودکار در مرورگر)..."
        aria-label="یادداشت شخصی فصل"
        className="w-full resize-y rounded-lg border border-line-strong bg-panel p-3 text-[13px] leading-7 text-ink outline-none transition-colors focus:border-accent focus:bg-surface"
      />
    </div>
  );
}
