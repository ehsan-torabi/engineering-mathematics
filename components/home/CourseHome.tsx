'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Award,
  BookMarked,
  CheckCircle2,
  ClipboardList,
  Landmark,
  Play,
} from 'lucide-react';
import { CURRICULUM_MODULES, MODULE_ENRICHMENT } from '@/lib/curriculum-data';
import { useStudyProgress } from '@/lib/study-progress-context';
import { useCourseTools } from '@/components/shell/AppChrome';
import { MathText } from '@/components/MathFormula';

/**
 * Course map — the home surface. Answers one question first («where do I
 * continue?») and then shows the whole course as a calm, scannable list.
 * This replaces the old roadmap modal: progress is the home, not a popup.
 * Module rows push real routes, so browser back/forward works natively.
 */
export default function CourseHome() {
  const router = useRouter();
  const { courseProgress } = useStudyProgress();
  const { openExam, openFormulas, openRequirements } = useCourseTools();

  const openModule = (moduleId: string, subtopicIndex?: number) => {
    const query = subtopicIndex ? `?phase=lesson&lesson=${subtopicIndex}` : '';
    router.push(`/module/${moduleId}${query}`);
  };

  const next = courseProgress.recommendedNextAction;
  const nextModule = CURRICULUM_MODULES.find((m) => m.id === next.moduleId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Course identity */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold leading-10 text-ink">
          آزمایشگاه تعاملی ریاضیات مهندسی
        </h1>
        <p className="mt-1 text-sm leading-7 text-ink-3">
          آنالیز فوریه، اشتورم-لیوویل و معادله گرما · مقطع کارشناسی
        </p>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-accent-solid transition-[width] duration-500"
              style={{ width: `${courseProgress.overallMasteryPercent}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-bold tabular-nums text-ink-2">
            تسلط کل {courseProgress.overallMasteryPercent}%
          </span>
        </div>
      </div>

      {/* Continue card — the single primary action on this screen */}
      <button
        type="button"
        onClick={() => openModule(next.moduleId, next.subtopicIndex)}
        className="group mb-10 flex w-full items-center justify-between gap-4 rounded-xl border border-accent-line bg-accent-soft p-5 text-start transition-colors hover:bg-accent-tint"
      >
        <div className="min-w-0">
          <div className="text-xs font-bold text-accent-deep dark:text-accent">
            ادامه مطالعه · {next.moduleNumberLabel}
          </div>
          <div className="mt-1 truncate text-base font-bold text-ink">
            <MathText text={next.title} />
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-accent-solid px-4 py-2.5 text-sm font-bold text-white transition-transform group-hover:-translate-x-0.5">
          <Play className="h-4 w-4" />
          ادامه بده
        </span>
      </button>

      {/* Module list */}
      <h2 className="mb-3 text-sm font-bold text-ink-3">فصل‌های دوره</h2>
      <div className="space-y-2">
        {CURRICULUM_MODULES.map((mod, idx) => {
          const summary = courseProgress.moduleSummaries[idx];
          const isComplete = summary.masteryPercent >= 100;
          const isUntouched = summary.statusLabel === 'شروع‌نشده';

          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => openModule(mod.id)}
              style={{ animationDelay: `${Math.min(idx * 40, 280)}ms` }}
              className="animate-rise group flex w-full items-center gap-4 rounded-xl border border-line bg-surface p-4 text-start transition-colors hover:border-line-strong"
            >
              {/* Number badge */}
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                  isComplete
                    ? 'bg-ok-soft text-ok-ink'
                    : isUntouched
                      ? 'bg-muted text-ink-4'
                      : 'bg-accent-soft text-accent-deep dark:text-accent'
                }`}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5 text-ok" />
                ) : (
                  mod.numberLabel.replace(/^بخش\s*/, '').replace(/\s*\(.*\)$/, '')
                )}
              </span>

              {/* Title + phase stats */}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-ink">
                  {mod.shortTitle.replace(/^\d+\.\s*/, '')}
                </span>
                <span className="mt-1 block truncate text-xs text-ink-3">
                  درس‌نامه {summary.completedSubtopicsCount}/{summary.totalSubtopics}
                  {' · '}
                  مثال {summary.completedExamplesCount}/{summary.totalExamples}
                  {' · '}
                  آزمون {summary.answeredQuestionsCount}/{summary.totalQuestions}
                </span>
                <span className="mt-2 block h-1 w-full overflow-hidden rounded-full bg-muted">
                  <span
                    className={`block h-full rounded-full transition-[width] duration-500 ${
                      isComplete ? 'bg-ok' : 'bg-accent'
                    }`}
                    style={{ width: `${summary.masteryPercent}%` }}
                  />
                </span>
              </span>

              {/* Mastery + open */}
              <span className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-sm font-bold tabular-nums text-ink-2">
                  {summary.masteryPercent}%
                </span>
                <ArrowLeft className="h-4 w-4 text-ink-4 transition-transform group-hover:-translate-x-0.5 group-hover:text-accent" />
              </span>
            </button>
          );
        })}
      </div>

      {/* Pioneers strip — the human side of the course */}
      <section
        aria-labelledby="pioneers-title"
        className="mt-10 rounded-xl border border-line bg-surface p-4"
      >
        <h3
          id="pioneers-title"
          className="mb-3 flex items-center gap-1.5 text-sm font-bold text-ink"
        >
          <Landmark className="h-4 w-4 text-accent" />
          پیشگامان این ریاضیات
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.values(MODULE_ENRICHMENT)
            .flatMap((e) => e.figures)
            .filter(
              (fig, idx, all) =>
                all.findIndex((f) => f.nameEn === fig.nameEn) === idx
            )
            .map((fig) => (
              <a
                key={fig.nameEn}
                href={fig.wikiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 rounded-lg border border-line bg-panel p-2 transition-colors hover:border-accent-line hover:bg-accent-soft"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fig.portraitSrc}
                  alt={`تصویر ${fig.nameFa}`}
                  loading="lazy"
                  className="h-11 w-11 shrink-0 rounded-lg border border-line object-cover object-top"
                />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold text-ink group-hover:text-accent-deep dark:group-hover:text-accent">
                    {fig.nameFa}
                  </span>
                  <span className="block text-[10px] tabular-nums text-ink-4">
                    {fig.years}
                  </span>
                </span>
              </a>
            ))}
        </div>
      </section>

      {/* Course-wide tools */}
      <div className="mt-10 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={openExam}
          className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4 text-start transition-colors hover:border-line-strong"
        >
          <Award className="h-5 w-5 shrink-0 text-accent" />
          <span className="min-w-0">
            <span className="block text-sm font-bold text-ink">آزمون جامع</span>
            <span className="block text-xs text-ink-3">
              {courseProgress.totalQuestions} سوال · دقت فعلی{' '}
              {courseProgress.quizAccuracyPercent}%
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={openFormulas}
          className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4 text-start transition-colors hover:border-line-strong"
        >
          <BookMarked className="h-5 w-5 shrink-0 text-accent" />
          <span className="min-w-0">
            <span className="block text-sm font-bold text-ink">بانک فرمول‌ها</span>
            <span className="block text-xs text-ink-3">
              جستجو میان همه قضایا و روابط
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={openRequirements}
          className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4 text-start transition-colors hover:border-line-strong"
        >
          <ClipboardList className="h-5 w-5 shrink-0 text-accent" />
          <span className="min-w-0">
            <span className="block text-sm font-bold text-ink">سند طراحی دوره</span>
            <span className="block text-xs text-ink-3">
              نیازمندی‌ها و نگاشت سرفصل‌ها
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
