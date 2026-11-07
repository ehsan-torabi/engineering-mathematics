'use client';

import React, { useState, useMemo } from 'react';
import { CURRICULUM_MODULES, ModuleId } from '@/lib/curriculum-data';
import {
  StudyProgressState,
  computeCourseProgress,
  getExamQuestions,
  evaluateExamResults,
  REQUIREMENTS_SPECIFICATION,
} from '@/lib/study-engine';
import MathFormula, { MathText } from '@/components/MathFormula';
import {
  X,
  CheckCircle2,
  XCircle,
  Compass,
  Award,
  Layers,
  RotateCcw,
  ArrowUpLeft,
  StickyNote,
  ClipboardCheck,
} from 'lucide-react';

export type RoadmapModalTab = 'roadmap' | 'exam' | 'requirements';

interface StudyRoadmapModalProps {
  isOpen: boolean;
  activeTab: RoadmapModalTab;
  onTabChange: (tab: RoadmapModalTab) => void;
  onClose: () => void;
  progressState: StudyProgressState;
  onToggleSubtopic: (subtopicId: string) => void;
  onToggleExample: (exampleId: string) => void;
  onSelectQuizAnswer: (questionId: string, optionIdx: number) => void;
  onResetQuizAnswers: (moduleFilter: ModuleId | 'all') => void;
  onUpdateModuleNote: (moduleId: ModuleId, noteText: string) => void;
  onJumpToModule: (moduleId: ModuleId, subtopicIndex?: number) => void;
}

export default function StudyRoadmapModal({
  isOpen,
  activeTab,
  onTabChange,
  onClose,
  progressState,
  onToggleSubtopic,
  onToggleExample,
  onSelectQuizAnswer,
  onResetQuizAnswers,
  onUpdateModuleNote,
  onJumpToModule,
}: StudyRoadmapModalProps) {
  const [examModuleFilter, setExamModuleFilter] = useState<ModuleId | 'all'>(
    'all'
  );
  const [selectedNoteModule, setSelectedNoteModule] = useState<ModuleId>(
    'module_0_prerequisites'
  );

  const progressReport = useMemo(
    () => computeCourseProgress(progressState, CURRICULUM_MODULES),
    [progressState]
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

  if (!isOpen) return null;

  const completedSubSet = new Set(progressState.completedSubtopics);
  const completedExSet = new Set(progressState.completedExamples);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="نقشه راه یادگیری، آزمون جامع و مهندسی نیازمندی‌ها"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-xs sm:p-5"
    >
      <div className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#CBD5E1] bg-white shadow-2xl">
        {/* Top Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0284C7] text-white">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A] sm:text-lg">
                سامانه جامع مدیریت یادگیری، آزمون پایان‌ترم و مهندسی نیازمندی‌ها
              </h2>
              <p className="text-xs text-[#475569]">
                پیگیری تسلط بر سرفصل‌ها، یادداشت‌برداری شخصی، شبیه‌ساز آزمون جامع و ماتریس نیازمندی‌های آموزشی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Segmented Tab Controls */}
            <div className="flex items-center gap-1 rounded-xl border border-[#CBD5E1] bg-white p-1">
              <button
                type="button"
                onClick={() => onTabChange('roadmap')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  activeTab === 'roadmap'
                    ? 'bg-[#0284C7] text-white'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                <Compass className="h-3.5 w-3.5" />
                <span>۱. نقشه راه و پیشرفت من</span>
              </button>
              <button
                type="button"
                onClick={() => onTabChange('exam')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  activeTab === 'exam'
                    ? 'bg-[#0284C7] text-white'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                <Award className="h-3.5 w-3.5" />
                <span>۲. شبیه‌ساز آزمون جامع ({examQuestions.length})</span>
              </button>
              <button
                type="button"
                onClick={() => onTabChange('requirements')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  activeTab === 'requirements'
                    ? 'bg-[#0284C7] text-white'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>۳. مهندسی نیازمندی‌ها (RTM)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="بستن پنجره نقشه راه"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#CBD5E1] bg-white text-[#475569] transition hover:border-[#0284C7] hover:text-[#0F172A]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-5">
          {/* TAB 1: STUDY ROADMAP, PROGRESS & PERSONAL NOTES */}
          {activeTab === 'roadmap' && (
            <div className="space-y-5">
              {/* Top KPI Summary Row */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
                  <div className="text-xs font-semibold text-[#64748B]">
                    درصد تسلط کل بر دوره
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="tabular-nums text-2xl font-bold text-[#0284C7]">
                      {progressReport.overallMasteryPercent}%
                    </span>
                    <span className="text-xs text-[#475569]">
                      از مجموع ۷ فصل
                    </span>
                  </div>
                  <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                    <div
                      className="h-full rounded-full bg-[#0284C7] transition-all"
                      style={{
                        width: `${progressReport.overallMasteryPercent}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
                  <div className="text-xs font-semibold text-[#64748B]">
                    درس‌نامه‌های مطالعه‌شده
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="tabular-nums text-2xl font-bold text-[#0F172A]">
                      {progressReport.completedSubtopicsCount} /{' '}
                      {progressReport.totalSubtopics}
                    </span>
                    <span className="text-xs text-[#059669]">زیرمبحث</span>
                  </div>
                  <p className="mt-2 text-[11px] text-[#64748B]">
                    با تیک زدن هر زیرمبحث، وضعیت مطالعه ذخیره می‌شود.
                  </p>
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
                  <div className="text-xs font-semibold text-[#64748B]">
                    مثال‌های تشریحی حل‌شده
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="tabular-nums text-2xl font-bold text-[#0F172A]">
                      {progressReport.completedExamplesCount} /{' '}
                      {progressReport.totalExamples}
                    </span>
                    <span className="text-xs text-[#0284C7]">مثال گام‌به‌گام</span>
                  </div>
                  <p className="mt-2 text-[11px] text-[#64748B]">
                    مثال‌های ۵ گامی با بسط کامل انتگرال جزء‌به‌جزء.
                  </p>
                </div>

                <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
                  <div className="text-xs font-semibold text-[#64748B]">
                    عملکرد در پرسش‌های امتحانی
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="tabular-nums text-2xl font-bold text-[#059669]">
                      {progressReport.correctQuestionsCount} /{' '}
                      {progressReport.totalQuestions}
                    </span>
                    <span className="tabular-nums text-xs font-semibold text-[#475569]">
                      دقت: {progressReport.quizAccuracyPercent}%
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] text-[#64748B]">
                    پاسخ‌داده‌شده: {progressReport.answeredQuestionsCount} پرسش
                  </p>
                </div>
              </div>

              {/* Next Recommended Study Action Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#0284C7]/40 bg-[#F0F9FF] p-4">
                <div>
                  <div className="text-xs font-bold text-[#0369A1]">
                    پیشنهاد هوشمند گام بعدی مطالعه شما ({progressReport.recommendedNextAction.moduleNumberLabel}):
                  </div>
                  <div className="mt-0.5 text-sm font-bold text-[#0F172A]">
                    <MathText text={progressReport.recommendedNextAction.title} />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onJumpToModule(
                      progressReport.recommendedNextAction.moduleId,
                      progressReport.recommendedNextAction.subtopicIndex
                    );
                    onClose();
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-[#0284C7] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#0369A1]"
                >
                  <span>ورود مستقیم به این مبحث</span>
                  <ArrowUpLeft className="h-4 w-4" />
                </button>
              </div>

              {/* Module-by-Module Checklist & Personal Notes */}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                {/* Left 8 cols: 7 Modules Checklist */}
                <div className="space-y-3 lg:col-span-8">
                  <h3 className="text-sm font-bold text-[#0F172A]">
                    چک‌لیست تسلط بر سرفصل‌ها و مثال‌های هر فصل (برای ثبت تسلط کلیک کنید):
                  </h3>
                  {CURRICULUM_MODULES.map((mod, mIdx) => {
                    const summary = progressReport.moduleSummaries[mIdx];
                    return (
                      <div
                        key={mod.id}
                        className="rounded-xl border border-[#E2E8F0] bg-white p-4"
                      >
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F5F9] pb-2.5">
                          <div>
                            <div className="flex items-center gap-2 text-xs text-[#64748B]">
                              <span className="font-bold text-[#0284C7]">
                                {mod.numberLabel}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>وضعیت: {summary.statusLabel}</span>
                              <span aria-hidden="true">·</span>
                              <span className="tabular-nums font-bold text-[#0F172A]">
                                پیشرفت: {summary.masteryPercent}%
                              </span>
                            </div>
                            <h4 className="mt-0.5 text-sm font-bold text-[#0F172A]">
                              <MathText text={mod.title} />
                            </h4>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              onJumpToModule(mod.id, 0);
                              onClose();
                            }}
                            className="flex items-center gap-1 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-1.5 text-xs font-bold text-[#0F172A] transition hover:border-[#0284C7] hover:text-[#0284C7]"
                          >
                            <span>باز کردن فصل</span>
                            <ArrowUpLeft className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {/* Subtopics checklist */}
                          <div>
                            <div className="mb-1.5 text-[11px] font-bold text-[#475569]">
                              زیرمباحث درس‌نامه ({summary.completedSubtopicsCount}/
                              {summary.totalSubtopics}):
                            </div>
                            <div className="space-y-1.5">
                              {mod.subtopics.map((sub) => {
                                const isDone = completedSubSet.has(sub.id);
                                return (
                                  <button
                                    key={sub.id}
                                    type="button"
                                    onClick={() => onToggleSubtopic(sub.id)}
                                    className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-right text-xs transition ${
                                      isDone
                                        ? 'border-[#059669]/40 bg-[#ECFDF5] font-semibold text-[#065F46]'
                                        : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#334155] hover:border-[#CBD5E1]'
                                    }`}
                                  >
                                    <CheckCircle2
                                      className={`h-3.5 w-3.5 shrink-0 ${
                                        isDone
                                          ? 'text-[#059669]'
                                          : 'text-[#94A3B8]'
                                      }`}
                                    />
                                    <span className="truncate">
                                      <MathText text={sub.title} />
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Worked Examples checklist */}
                          <div>
                            <div className="mb-1.5 text-[11px] font-bold text-[#475569]">
                              مثال‌های حل‌شده گام‌به‌گام (
                              {summary.completedExamplesCount}/
                              {summary.totalExamples}):
                            </div>
                            <div className="space-y-1.5">
                              {mod.workedExamples.map((ex) => {
                                const isDone = completedExSet.has(ex.id);
                                return (
                                  <button
                                    key={ex.id}
                                    type="button"
                                    onClick={() => onToggleExample(ex.id)}
                                    className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-1.5 text-right text-xs transition ${
                                      isDone
                                        ? 'border-[#0284C7]/40 bg-[#F0F9FF] font-semibold text-[#0369A1]'
                                        : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#334155] hover:border-[#CBD5E1]'
                                    }`}
                                  >
                                    <CheckCircle2
                                      className={`h-3.5 w-3.5 shrink-0 ${
                                        isDone
                                          ? 'text-[#0284C7]'
                                          : 'text-[#94A3B8]'
                                      }`}
                                    />
                                    <span className="truncate">
                                      <MathText text={ex.title} />
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right 4 cols: Persistent Personal Study Notes per Module */}
                <div className="space-y-3 lg:col-span-4">
                  <div className="sticky top-2 rounded-xl border border-[#E2E8F0] bg-white p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#0F172A]">
                      <StickyNote className="h-4 w-4 text-[#D97706]" />
                      <span>یادداشت‌های امتحانی شخصی من</span>
                    </div>
                    <p className="mb-3 text-xs leading-6 text-[#475569]">
                      نکات مهم، فرمول‌های فرّار یا سوالات امتحانی هر فصل را اینجا یادداشت کنید (ذخیره خودکار در مرورگر):
                    </p>

                    <label className="mb-1.5 block text-xs font-bold text-[#334155]">
                      انتخاب فصل:
                    </label>
                    <select
                      value={selectedNoteModule}
                      onChange={(e) =>
                        setSelectedNoteModule(e.target.value as ModuleId)
                      }
                      aria-label="انتخاب فصل برای یادداشت"
                      className="mb-3 w-full rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2 text-xs font-bold text-[#0F172A]"
                    >
                      {CURRICULUM_MODULES.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.numberLabel} — {m.title.slice(0, 38)}...
                        </option>
                      ))}
                    </select>

                    <textarea
                      rows={9}
                      value={progressState.moduleNotes[selectedNoteModule] || ''}
                      onChange={(e) =>
                        onUpdateModuleNote(selectedNoteModule, e.target.value)
                      }
                      placeholder="نکات کلیدی این فصل را اینجا بنویسید (مثلاً: در شرایط مرزی عایق نیومن، مقدار ویژه \lambda_0 = 0 را فراموش نکنم)..."
                      aria-label="متن یادداشت شخصی فصل"
                      className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-3 text-xs leading-6 text-[#0F172A] focus:border-[#0284C7] focus:bg-white focus:outline-none"
                    />
                    <div className="mt-2 flex items-center justify-between text-[11px] text-[#059669]">
                      <span>ذخیره‌شده در حافظه مرورگر شما</span>
                      <span className="tabular-nums text-[#64748B]">
                        {(
                          progressState.moduleNotes[selectedNoteModule] || ''
                        ).length}{' '}
                        کاراکتر
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPREHENSIVE EXAM SIMULATOR */}
          {activeTab === 'exam' && (
            <div className="space-y-5">
              {/* Exam Scoreboard & Diagnostic Summary */}
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3.5">
                  <div>
                    <h3 className="text-sm font-bold text-[#0F172A]">
                      کارنامه تحلیلی و شبیه‌ساز آزمون ریاضیات مهندسی
                    </h3>
                    <p className="text-xs text-[#475569]">
                      سوالات زیر تمام مباحث پایه، سری و تبدیل فوریه، اشتورم-لیوویل و معادله گرما را پوشش می‌دهند
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={examModuleFilter}
                      onChange={(e) =>
                        setExamModuleFilter(
                          e.target.value as ModuleId | 'all'
                        )
                      }
                      aria-label="فیلتر فصل آزمون"
                      className="rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-1.5 text-xs font-bold text-[#0F172A]"
                    >
                      <option value="all">
                        آزمون جامع کل درس (تمام ۷ فصل)
                      </option>
                      {CURRICULUM_MODULES.map((m) => (
                        <option key={m.id} value={m.id}>
                          فقط {m.numberLabel}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => onResetQuizAnswers(examModuleFilter)}
                      className="flex items-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-bold text-[#475569] transition hover:border-[#DC2626] hover:text-[#DC2626]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>پاک کردن پاسخ‌ها و آزمون مجدد</span>
                    </button>
                  </div>
                </div>

                <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                    <div className="text-[11px] text-[#64748B]">نمره کل کسب‌شده</div>
                    <div className="mt-1 tabular-nums text-xl font-bold text-[#0284C7]">
                      {examEvaluation.scorePercent}%
                    </div>
                    <div className="mt-0.5 text-[11px] font-semibold text-[#334155]">
                      {examEvaluation.gradeLabelFa}
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                    <div className="text-[11px] text-[#64748B]">
                      پاسخ‌های صحیح / کل سوالات
                    </div>
                    <div className="mt-1 tabular-nums text-xl font-bold text-[#059669]">
                      {examEvaluation.correctCount} از{' '}
                      {examEvaluation.totalQuestions}
                    </div>
                    <div className="mt-0.5 text-[11px] text-[#64748B]">
                      نادرست: {examEvaluation.wrongCount} · بی‌پاسخ:{' '}
                      {examEvaluation.unansweredCount}
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                    <div className="text-[11px] font-semibold text-[#059669]">
                      فصول با تسلط خوب:
                    </div>
                    <div className="mt-1 text-xs leading-5 text-[#0F172A]">
                      {examEvaluation.strongModules.length > 0
                        ? examEvaluation.strongModules.join(' · ')
                        : 'هنوز پرسشی پاسخ داده نشده است'}
                    </div>
                  </div>

                  <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                    <div className="text-[11px] font-semibold text-[#D97706]">
                      فصول نیازمند مرور و تمرین:
                    </div>
                    <div className="mt-1 text-xs leading-5 text-[#0F172A]">
                      {examEvaluation.weakModules.length > 0
                        ? examEvaluation.weakModules.join(' · ')
                        : 'عالی! تمام فصول پاسخ‌داده‌شده در وضعیت مطلوب هستند'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Exam Questions Grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {examQuestions.map((q, idx) => {
                  const userChoice = progressState.quizAnswers[q.id];
                  const isAnswered = userChoice !== undefined;
                  const isCorrect = userChoice === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      className="flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-white p-4"
                    >
                      <div>
                        <div className="mb-2 flex items-center justify-between text-xs text-[#64748B]">
                          <span className="font-bold text-[#0284C7]">
                            سوال {idx + 1} · {q.moduleNumberLabel}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              onJumpToModule(q.moduleId, 0);
                              onClose();
                            }}
                            className="text-[11px] font-semibold text-[#0369A1] hover:underline"
                          >
                            مرور درس‌نامه این فصل
                          </button>
                        </div>

                        <p className="mb-3.5 text-sm font-semibold leading-7 text-[#0F172A]">
                          <MathText text={q.question} />
                        </p>

                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = userChoice === optIdx;
                            let btnStyle =
                              'border-[#CBD5E1] bg-[#F8FAFC] text-[#0F172A] hover:border-[#0284C7]';
                            if (isAnswered) {
                              if (optIdx === q.correctIndex) {
                                btnStyle =
                                  'border-[#059669] bg-[#ECFDF5] text-[#065F46] font-bold';
                              } else if (isSelected) {
                                btnStyle =
                                  'border-[#DC2626] bg-[#FEF2F2] text-[#991B1B]';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => onSelectQuizAnswer(q.id, optIdx)}
                                className={`flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-right text-xs transition ${btnStyle}`}
                              >
                                <MathFormula formula={opt} block={false} />
                                {isAnswered && optIdx === q.correctIndex && (
                                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#059669]" />
                                )}
                                {isAnswered &&
                                  isSelected &&
                                  optIdx !== q.correctIndex && (
                                    <XCircle className="h-4 w-4 shrink-0 text-[#DC2626]" />
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
                              ? 'border-[#059669]/30 bg-[#ECFDF5] text-[#065F46]'
                              : 'border-[#D97706]/30 bg-[#FFFBEB] text-[#92400E]'
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
            </div>
          )}

          {/* TAB 3: REQUIREMENTS ENGINEERING MATRIX & DEPENDENCY BLUEPRINT */}
          {activeTab === 'requirements' && (
            <div className="space-y-5">
              {/* Overview & Prerequisite Dependency Graph */}
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-[#0F172A]">
                  <ClipboardCheck className="h-4 w-4 text-[#0284C7]" />
                  <span>
                    سند مهندسی نیازمندی‌ها (Requirements Engineering) و نگاشت وابستگی سرفصل‌ها
                  </span>
                </div>
                <p className="mb-4 text-xs leading-6 text-[#475569]">
                  این سامانه بر اساس تحلیل دقیق نیازمندی‌های دانشجوی مقطع کارشناسی مهندسی طراحی شده است تا شکاف بین «مفاهیم ریاضی پایه (حسابان و معادلات دیفرانسیل)» و «مباحث پیشرفته آنالیز فوریه و معادلات با مشتقات جزئی (PDE)» را به صورت تعاملی و گام‌به‌گام پوشش دهد:
                </p>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
                    <div className="text-xs font-bold text-[#0284C7]">
                      ۱. لایه پیش‌نیاز و ابزارهای پایه (بخش ۰)
                    </div>
                    <p className="mt-1.5 text-xs leading-6 text-[#334155]">
                      انتگرال‌گیری جزء‌به‌جزء و جدول DI، اتحادهای مرزی <MathText text="$\cos(n\pi)=(-1)^n$" />، فرمول اویلر و معادله مشخصه <MathText text="$X''+\lambda X=0$" /> که پیش‌نیاز مستقیم محاسبه تمام ضرایب فوریه و ویژه-توابع هستند.
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
                    <div className="text-xs font-bold text-[#0284C7]">
                      ۲. لایه نمایش طیفی و فوریه (بخش‌های ۱ تا ۴)
                    </div>
                    <p className="mt-1.5 text-xs leading-6 text-[#334155]">
                      تعامد و نُرم توابع، سری فوریه مثلثاتی و نیم‌دامنه، اتحاد پارسوال، و گذار از توابع متناوب به نامتناوب از طریق انتگرال فوریه و تبدیل فوریه و کانولوشن.
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
                    <div className="text-xs font-bold text-[#0284C7]">
                      ۳. لایه مسائل مقدار مرزی و PDE (بخش‌های ۵ و ۶)
                    </div>
                    <p className="mt-1.5 text-xs leading-6 text-[#334155]">
                      فرم خودالحاقی اشتورم-لیوویل، استخراج مقادیر ویژه <MathText text="$\lambda_n$" /> و استفاده از اصل برهم‌نهی و سری فوریه برای حل کامل معادله گرمای همگن و غیرهمگن میله.
                    </p>
                  </div>
                </div>
              </div>

              {/* Requirements Traceability Matrix (RTM) */}
              <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
                <h3 className="mb-3 text-sm font-bold text-[#0F172A]">
                  ماتریس ردیابی نیازمندی‌های کارکردی و آموزشی (Requirements Traceability Matrix)
                </h3>

                <div className="space-y-3">
                  {REQUIREMENTS_SPECIFICATION.map((req) => (
                    <div
                      key={req.id}
                      className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs text-[#64748B]">
                          <span className="font-mono font-bold text-[#0284C7]">
                            {req.id}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{req.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>اولویت: {req.priority}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#059669]">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>پیاده‌سازی و راستی‌آزمایی شده</span>
                        </div>
                      </div>

                      <h4 className="mt-1 text-sm font-bold text-[#0F172A]">
                        <MathText text={req.title} />
                      </h4>
                      <p className="mt-1 text-xs leading-6 text-[#334155]">
                        <MathText text={req.description} />
                      </p>

                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8F0] pt-2 text-[11px] text-[#475569]">
                        <span>
                          <strong className="font-semibold text-[#0F172A]">
                            معیار پذیرش (Acceptance Criteria):{' '}
                          </strong>
                          <MathText text={req.acceptanceCriteria} />
                        </span>
                        <span dir="ltr" className="font-mono text-[#0369A1]">
                          {req.targetComponent}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
