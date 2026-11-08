'use client';

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Table as TableIcon,
  Activity,
  FileText,
  Sliders,
  Search,
  Filter,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Cpu,
  Layers,
  Flame,
  Radio,
  Minimize2,
  Maximize2,
  BookMarked,
} from 'lucide-react';
import MathFormula, { MathText } from './MathFormula';
import {
  MASTER_FOURIER_TRANSFORM_TABLE,
  FourierTransformTableEntry,
  evaluateTransformPair,
  TransformPresetId,
} from '@/lib/math-engine';
import { CURRICULUM_MODULES } from '@/lib/curriculum-data';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

export default function FourierTransformStage() {
  // Navigation tabs: booklet, table, visualizer, derivations
  const [activeTab, setActiveTab] = useState<'booklet' | 'table' | 'visualizer' | 'derivations'>(
    'table'
  );

  // Table tab states
  const [tableSearch, setTableSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTableEntryId, setSelectedTableEntryId] = useState<string>('rect_pulse');

  // Visualizer states
  const [visPresetId, setVisPresetId] = useState<TransformPresetId>('two_sided_exp');
  const [paramA, setParamA] = useState<number>(1.2);
  const [timeShift, setTimeShift] = useState<number>(0);
  const [freqShift, setFreqShift] = useState<number>(0);

  // Derivations and Worked Examples states
  const [selectedExampleId, setSelectedExampleId] = useState<string>('ex_pdf_24_rect_sinc');
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [revealedExplanations, setRevealedExplanations] = useState<Record<string, boolean>>({});

  // Module data from curriculum
  const module4Data = useMemo(() => {
    return (
      CURRICULUM_MODULES.find((m) => m.id === 'module_4_fourier_transform') ||
      CURRICULUM_MODULES[3]
    );
  }, []);

  // Filtered table entries
  const filteredTableEntries = useMemo(() => {
    return MASTER_FOURIER_TRANSFORM_TABLE.filter((entry) => {
      const matchesCategory =
        selectedCategory === 'all' || entry.category === selectedCategory;
      const q = tableSearch.trim().toLowerCase();
      const matchesSearch =
        !q ||
        entry.nameFa.toLowerCase().includes(q) ||
        entry.categoryFa.toLowerCase().includes(q) ||
        entry.derivationMethodFa.toLowerCase().includes(q) ||
        entry.engineeringApplicationFa.toLowerCase().includes(q) ||
        entry.timeFormulaLatex.toLowerCase().includes(q) ||
        entry.freqFormulaLatex.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [tableSearch, selectedCategory]);

  const activeTableEntry = useMemo(() => {
    return (
      MASTER_FOURIER_TRANSFORM_TABLE.find((e) => e.id === selectedTableEntryId) ||
      MASTER_FOURIER_TRANSFORM_TABLE[0]
    );
  }, [selectedTableEntryId]);

  // Compute visualizer plot points for time and frequency domains
  const visData = useMemo(() => {
    const timePoints: { x: number; fx: number }[] = [];
    const freqPoints: {
      alpha: number;
      absF: number;
      realF: number;
      imagF: number;
    }[] = [];

    const xDomain = Math.max(4, paramA * 3.5);
    const timeStep = (2 * xDomain) / 160;
    for (let x = -xDomain; x <= xDomain; x += timeStep) {
      const pair = evaluateTransformPair(visPresetId, x, paramA, timeShift, freqShift);
      timePoints.push({
        x: Number(x.toFixed(2)),
        fx: Number(pair.fx.toFixed(4)),
      });
    }

    const alphaDomain = Math.max(14, 25 / paramA);
    const alphaStep = (2 * alphaDomain) / 160;
    for (let alpha = -alphaDomain; alpha <= alphaDomain; alpha += alphaStep) {
      const pair = evaluateTransformPair(visPresetId, alpha, paramA, timeShift, freqShift);
      freqPoints.push({
        alpha: Number(alpha.toFixed(2)),
        absF: Number(pair.absFAlpha.toFixed(4)),
        realF: Number(pair.realFAlpha.toFixed(4)),
        imagF: Number(pair.imagFAlpha.toFixed(4)),
      });
    }

    // Numerical Energy Integrals via Riemann sums
    let timeEnergy = 0;
    for (let i = 0; i < timePoints.length; i++) {
      timeEnergy += timePoints[i].fx * timePoints[i].fx * timeStep;
    }

    let freqEnergy = 0;
    for (let i = 0; i < freqPoints.length; i++) {
      freqEnergy +=
        (freqPoints[i].realF * freqPoints[i].realF +
          freqPoints[i].imagF * freqPoints[i].imagF) *
        alphaStep;
    }
    const freqEnergyNormalized = freqEnergy / (2 * Math.PI);

    // DC Component F(0)
    const dcPair = evaluateTransformPair(visPresetId, 0, paramA, timeShift, freqShift);
    const dcValue = dcPair.realFAlpha;

    return {
      timePoints,
      freqPoints,
      xDomain,
      alphaDomain,
      timeEnergy: Number(timeEnergy.toFixed(4)),
      freqEnergyNormalized: Number(freqEnergyNormalized.toFixed(4)),
      dcValue: Number(dcValue.toFixed(4)),
    };
  }, [visPresetId, paramA, timeShift, freqShift]);

  // Selected worked example
  const activeWorkedExample = useMemo(() => {
    return (
      module4Data.workedExamples.find((ex) => ex.id === selectedExampleId) ||
      module4Data.workedExamples[0]
    );
  }, [module4Data, selectedExampleId]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner Header */}
      <div className="rounded-xl border border-accent-line bg-accent-soft p-6 text-ink">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-white/20 px-3 py-1 font-mono text-xs font-bold tracking-wider text-white backdrop-blur-xs">
                بخش ۴ ریاضی مهندسی
              </span>
              <span className="rounded-lg bg-warn-tint px-2.5 py-1 text-xs font-bold text-warn-ink">
                صفحات ۷۲ تا ۱۰۵ جزوه دکتر طائری
              </span>
              <span className="rounded-lg bg-ok-tint px-2.5 py-1 text-xs font-bold text-ok-ink">
                ۱۶ جفت تبدیل استاندارد
              </span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              جزوه جامع و شبیه‌ساز تحلیلی تبدیل فوریه و قضایای بنیادین
            </h2>
            <p className="max-w-3xl text-xs leading-relaxed text-accent-deep sm:text-sm">
              کامل‌ترین مرجع آموزشی تبدیل فوریه مختلط، قضایای تقارن و دوگانی، انتقال زمان و فرکانس،
              مدولاسیون، مقیاس، اصل عدم قطعیت هایزنبرگ-گابور، مشتق، کانولوشن، اتحاد پارسوال و حل معادلات PDE.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold shadow-xs transition ${
                activeTab === 'table'
                  ? 'bg-surface text-accent-deep'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <TableIcon className="h-4 w-4" />
              <span>جدول جامع تبدیل فوریه (۱۶ جفت)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('booklet')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold shadow-xs transition ${
                activeTab === 'booklet'
                  ? 'bg-surface text-accent-deep'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>جزوه و قضایای بنیادین</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('visualizer')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold shadow-xs transition ${
                activeTab === 'visualizer'
                  ? 'bg-surface text-accent-deep'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>شبیه‌ساز دو دامنه‌ای</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('derivations')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold shadow-xs transition ${
                activeTab === 'derivations'
                  ? 'bg-surface text-accent-deep'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>حل مثال‌های آزمونی و اثبات‌ها</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: MASTER FOURIER TRANSFORM REFERENCE TABLE */}
      {activeTab === 'table' && (
        <div className="space-y-6">
          {/* Search, Filter and Stat bar */}
          <div className="rounded-2xl border border-line-strong bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-accent-tint px-2.5 py-0.5 text-xs font-bold text-accent-deep">
                  <TableIcon className="h-3.5 w-3.5" />
                  جدول مرجع جامع تبدیل فوریه (جدول ۱ جزوه - صفحه ۱۰۵)
                </span>
                <h3 className="mt-1 text-base font-extrabold text-ink">
                  آرشیو کامل ۱۶ جفت تبدیل فوریه با فرمول دقیق، خواص، کاربرد و انرژی پارسوال
                </h3>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-ink-4" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="جستجو بر اساس نام، فرمول، تقارن..."
                  className="w-full rounded-xl border border-line-strong bg-panel py-1.5 pr-9 pl-3 text-xs text-ink placeholder-ink-4 transition focus:border-accent focus:bg-surface focus:outline-hidden"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
              <span className="flex items-center gap-1 text-xs font-bold text-ink-3">
                <Filter className="h-3.5 w-3.5 text-accent" />
                دسته‌بندی:
              </span>
              {[
                { id: 'all', label: `همه جفت‌ها (${MASTER_FOURIER_TRANSFORM_TABLE.length})` },
                { id: 'basic', label: 'پایه‌ای و زوج/فرد' },
                { id: 'symmetry', label: 'قضیه تقارن و دوگانی' },
                { id: 'frequency_derivative', label: 'مشتق فرکانس x f(x)' },
                { id: 'modulation', label: 'مدولاسیون و شیفت' },
                { id: 'sine_cosine', label: 'تبدیل‌های سینوسی و کسینوسی' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                    selectedCategory === cat.id
                      ? 'bg-accent-solid text-white'
                      : 'border border-line-strong bg-panel text-ink-3 hover:bg-muted'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Master Table Grid */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Table Entries List (7 cols) */}
            <div className="space-y-3 lg:col-span-7">
              {filteredTableEntries.map((entry, index) => {
                const isSelected = entry.id === selectedTableEntryId;
                return (
                  <div
                    key={entry.id}
                    onClick={() => setSelectedTableEntryId(entry.id)}
                    className={`cursor-pointer rounded-xl border p-4 transition ${
                      isSelected
                        ? 'border-accent bg-accent-soft ring-2 ring-accent/20 shadow-sm'
                        : 'border-line bg-surface hover:border-accent-line hover:bg-panel'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-tint font-mono text-xs font-bold text-accent-deep">
                          {index + 1}
                        </span>
                        <h4 className="text-sm font-extrabold text-ink">{entry.nameFa}</h4>
                      </div>
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-bold text-ink-3">
                        {entry.categoryFa}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div className="rounded-lg border border-line bg-surface p-2.5">
                        <span className="text-[10px] font-bold text-ink-4">
                          حوزه مکان / زمان f(x):
                        </span>
                        <MathFormula formula={entry.timeFormulaLatex} block />
                      </div>
                      <div className="rounded-lg border border-accent-line bg-accent-soft/50 p-2.5">
                        <span className="text-[10px] font-bold text-accent-deep">
                          تبدیل فوریه F(α):
                        </span>
                        <MathFormula formula={entry.freqFormulaLatex} block highlight />
                      </div>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink-3">
                      <div className="flex items-center gap-3">
                        <span>
                          <strong>مقدار DC: </strong>
                          <MathFormula formula={entry.fZeroLatex} />
                        </span>
                        <span>
                          <strong>روش: </strong>
                          {entry.derivationMethodFa}
                        </span>
                      </div>
                      {entry.associatedPresetId && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setVisPresetId(entry.associatedPresetId!);
                            setActiveTab('visualizer');
                          }}
                          className="flex items-center gap-1 rounded bg-accent-tint px-2 py-0.5 font-bold text-accent-deep hover:bg-accent-tint"
                        >
                          <Activity className="h-3 w-3" />
                          <span>مشاهده در شبیه‌ساز</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredTableEntries.length === 0 && (
                <div className="rounded-xl border border-dashed border-line-strong p-8 text-center text-xs text-ink-4">
                  هیچ تبدیل فوریه‌ای با جستجوی واردشده یافت نشد.
                </div>
              )}
            </div>

            {/* Selected Entry Detail Card (5 cols) */}
            <div className="lg:col-span-5">
              <div className="sticky top-6 space-y-4 rounded-2xl border border-accent-line bg-surface p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div>
                    <span className="rounded bg-accent-tint px-2 py-0.5 text-[10px] font-bold text-accent-deep">
                      جزئیات تحلیلی جفت انتخابی
                    </span>
                    <h3 className="mt-1 text-base font-extrabold text-ink">
                      {activeTableEntry.nameFa}
                    </h3>
                  </div>
                  {activeTableEntry.associatedPresetId && (
                    <button
                      type="button"
                      onClick={() => {
                        setVisPresetId(activeTableEntry.associatedPresetId!);
                        setActiveTab('visualizer');
                      }}
                      className="rounded-lg bg-accent-solid px-3 py-1.5 text-xs font-bold text-white transition hover:bg-accent-solid"
                    >
                      شبیه‌سازی زنده
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-bold text-ink-3">
                      ضابطه در حوزه مکان f(x):
                    </span>
                    <MathFormula formula={activeTableEntry.timeFormulaLatex} block />
                    {activeTableEntry.timeConditionLatex && (
                      <div className="text-[11px] text-ink-4">
                        شرط پارامتر: <MathFormula formula={activeTableEntry.timeConditionLatex} />
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-xs font-bold text-accent-deep">
                      تبدیل فوریه در حوزه فرکانس F(α):
                    </span>
                    <MathFormula formula={activeTableEntry.freqFormulaLatex} block highlight />
                  </div>

                  <div className="rounded-xl border border-line bg-panel p-3.5 space-y-2 text-xs">
                    <div>
                      <strong className="text-ink">مقدار در مبدأ فرکانس (مساحت کل):</strong>
                      <div className="mt-1">
                        <MathFormula formula={activeTableEntry.fZeroLatex} />
                      </div>
                    </div>

                    <div>
                      <strong className="text-ink">اتحاد انرژی پارسوال:</strong>
                      <div className="mt-1">
                        <MathFormula formula={activeTableEntry.parsevalEnergyLatex} />
                      </div>
                    </div>

                    <div>
                      <strong className="text-ink">روش اثبات و استخراج:</strong>
                      <p className="mt-0.5 text-ink-3 leading-relaxed">
                        {activeTableEntry.derivationMethodFa}
                      </p>
                    </div>

                    <div>
                      <strong className="text-ink">کاربرد عملی در مهندسی:</strong>
                      <p className="mt-0.5 text-ok-ink leading-relaxed font-semibold">
                        {activeTableEntry.engineeringApplicationFa}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPREHENSIVE LECTURE BOOKLET & THEOREMS */}
      {activeTab === 'booklet' && (
        <div className="space-y-6">
          {/* Booklet Core Theorems Matrix */}
          <div className="rounded-2xl border border-line-strong bg-surface p-5">
            <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-warn-tint px-2.5 py-0.5 text-xs font-bold text-warn">
                  <BookMarked className="h-3.5 w-3.5" />
                  ماتریس ۱۰ قضیه بنیادین تبدیل فوریه
                </span>
                <h3 className="mt-1 text-base font-extrabold text-ink">
                  چکیده سریع و مقایسه‌ای تمام خواص جبر فوریه جهت حل مسائل امتحانی
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: '۱. ترکیب خطی (Linearity)',
                  formula: '\\mathcal{F}[c_1 f_1 + c_2 f_2] = c_1 F_1 + c_2 F_2',
                  note: 'تبدیل فوریه یک عملگر خطی روی فضای توابع انتگرال‌پذیر است.',
                },
                {
                  title: '۲. قضیه تقارن (Duality)',
                  formula: '\\mathcal{F}[F(x)] = 2\\pi f(-\\alpha)',
                  note: 'جفت‌های تبدیل دوگانه را بدون انتگرال‌گیری جدید نتیجه می‌دهد.',
                },
                {
                  title: '۳. انتقال زمان (Time Shift)',
                  formula: '\\mathcal{F}[f(x - x_0)] = e^{-i\\alpha x_0} F(\\alpha)',
                  note: 'تأخیر زمانی فاز را تغییر می‌دهد اما اندازه طیف ثابت می‌ماند.',
                },
                {
                  title: '۴. انتقال فرکانس (Freq Shift)',
                  formula: '\\mathcal{F}[e^{i\\omega_0 x} f(x)] = F(\\alpha - \\omega_0)',
                  note: 'اساس مدولاسیون مخابراتی و انتقال سیگنال به حامل.',
                },
                {
                  title: '۵. مدولاسیون AM (کسینوسی)',
                  formula: '\\mathcal{F}[f(x)\\cos(\\omega_0 x)] = \\frac{1}{2}[F(\\alpha-\\omega_0) + F(\\alpha+\\omega_0)]',
                  note: 'تولید دو باند جانبی متقارن در فرکانس‌های حامل.',
                },
                {
                  title: '۶. تغییر مقیاس (Scaling)',
                  formula: '\\mathcal{F}[f(ax)] = \\frac{1}{|a|} F\\left(\\frac{\\alpha}{a}\\right)',
                  note: 'فشرده‌سازی در زمان معادل پهن شدن در فرکانس است.',
                },
                {
                  title: '۷. مشتق مکان (Derivative in x)',
                  formula: '\\mathcal{F}[f^{(n)}(x)] = (i\\alpha)^n F(\\alpha)',
                  note: 'تبدیل معادلات دیفرانسیل به معادلات جبری چندجمله‌ای.',
                },
                {
                  title: '۸. مشتق فرکانس (x f(x))',
                  formula: '\\mathcal{F}[x^n f(x)] = i^n \\frac{d^n}{d\\alpha^n} F(\\alpha)',
                  note: 'ضرب در توان‌های x معادل مشتق‌گیری در فرکانس است.',
                },
                {
                  title: '۹. کانولوشن زمان (Convolution)',
                  formula: '\\mathcal{F}[(f * g)(x)] = F(\\alpha) \\cdot G(\\alpha)',
                  note: 'کانولوشن دشوار در زمان به ضرب جبری ساده تبدیل می‌شود.',
                },
                {
                  title: '۱۰. اتحاد پارسوال (Parseval)',
                  formula: '\\int_{-\\infty}^{\\infty} |f(x)|^2 dx = \\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty} |F(\\alpha)|^2 d\\alpha',
                  note: 'بقای انرژی کل سیگنال بین حوزه مکان و فرکانس.',
                },
              ].map((thm, i) => (
                <div key={i} className="rounded-xl border border-line bg-panel p-3.5">
                  <div className="text-xs font-extrabold text-ink">{thm.title}</div>
                  <div className="my-1.5">
                    <MathFormula formula={thm.formula} block highlight />
                  </div>
                  <p className="text-[11px] leading-relaxed text-ink-3">{thm.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Subtopics Accordions */}
          <div className="space-y-4">
            {module4Data.subtopics.map((sub, idx) => (
              <div
                key={sub.id}
                className="rounded-2xl border border-line bg-surface p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-tint font-mono text-xs font-bold text-accent-deep">
                      ۴.{idx + 1}
                    </span>
                    <h3 className="text-base font-extrabold text-ink">{sub.title}</h3>
                  </div>
                  <span className="rounded bg-muted px-2.5 py-1 text-xs font-bold text-ink-3">
                    {sub.pdfPages}
                  </span>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-ink-2 sm:text-sm">
                  <MathText text={sub.summary} />
                </p>

                <div className="mt-4 space-y-3">
                  <div className="text-xs font-bold text-accent-deep">فرمول‌های کلیدی این بخش:</div>
                  <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-2">
                    {sub.keyFormulas.map((kf, kIdx) => (
                      <div
                        key={kIdx}
                        className="rounded-xl border border-accent-line bg-accent-soft/60 p-3"
                      >
                        <div className="mb-1 text-xs font-bold text-ink">
                          <MathText text={kf.label} />
                        </div>
                        <MathFormula formula={kf.formula} block />
                        {kf.note && (
                          <div className="mt-1 text-[11px] text-ink-3 leading-relaxed">
                            <MathText text={kf.note} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {sub.conceptualPoints && sub.conceptualPoints.length > 0 && (
                  <div className="mt-3.5 rounded-xl border border-warn-line bg-warn-soft p-3">
                    <strong className="text-xs font-bold text-warn-ink">
                      نکات مفهومی و آزمونی:
                    </strong>
                    <ul className="mt-1 list-inside list-disc space-y-1 text-xs text-warn-ink">
                      {sub.conceptualPoints.map((pt, pIdx) => (
                        <li key={pIdx}>
                          <MathText text={pt} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DUAL-DOMAIN INTERACTIVE VISUALIZER */}
      {activeTab === 'visualizer' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left 7 Cols: Spatial Plot and Frequency Plot */}
            <div className="space-y-4 lg:col-span-7">
              {/* Plot 1: Spatial Domain f(x) */}
              <div className="rounded-2xl border border-line-strong bg-surface p-4">
                <div className="mb-2 flex items-center justify-between text-xs font-bold text-ink">
                  <span className="flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-accent" />
                    ۱. حوزه مکان / زمان: تابع <MathFormula formula="f(x)" />
                  </span>
                  <span dir="ltr" className="font-mono text-accent">
                    x ∈ [-{visData.xDomain.toFixed(1)}, +{visData.xDomain.toFixed(1)}]
                  </span>
                </div>
                <div dir="ltr" className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={visData.timePoints}
                      margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                      <XAxis
                        dataKey="x"
                        type="number"
                        domain={[-visData.xDomain, visData.xDomain]}
                        tick={{ fontSize: 11, fill: 'var(--chart-axis)' }}
                      />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--chart-axis)' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--surface)',
                          borderColor: 'var(--chart-grid)',
                          borderRadius: '8px',
                          fontSize: '11px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      {timeShift !== 0 && (
                        <ReferenceLine
                          x={timeShift}
                          stroke="var(--chart-danger)"
                          strokeDasharray="4 3"
                          label={{ value: `x₀=${timeShift}`, fill: 'var(--chart-danger)', fontSize: 10 }}
                        />
                      )}
                      <Area
                        type="monotone"
                        dataKey="fx"
                        name="f(x) تابع در مکان"
                        stroke="var(--chart-accent)"
                        fill="var(--chart-accent)"
                        fillOpacity={0.15}
                        strokeWidth={2.5}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Plot 2: Frequency Domain F(alpha) */}
              <div className="rounded-2xl border border-line-strong bg-surface p-4">
                <div className="mb-2 flex items-center justify-between text-xs font-bold text-ink">
                  <span className="flex items-center gap-1.5">
                    <Radio className="h-4 w-4 text-ok" />
                    ۲. حوزه فرکانس پیوسته: طیف اندازه <MathFormula formula="|F(\alpha)|" /> و مؤلفه‌ها
                  </span>
                  <span dir="ltr" className="font-mono text-ok">
                    α ∈ [-{visData.alphaDomain.toFixed(1)}, +{visData.alphaDomain.toFixed(1)}] rad/s
                  </span>
                </div>
                <div dir="ltr" className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={visData.freqPoints}
                      margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                      <XAxis
                        dataKey="alpha"
                        type="number"
                        domain={[-visData.alphaDomain, visData.alphaDomain]}
                        tick={{ fontSize: 11, fill: 'var(--chart-axis)' }}
                      />
                      <YAxis tick={{ fontSize: 11, fill: 'var(--chart-axis)' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--surface)',
                          borderColor: 'var(--chart-grid)',
                          borderRadius: '8px',
                          fontSize: '11px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      {freqShift !== 0 && (
                        <ReferenceLine
                          x={freqShift}
                          stroke="var(--chart-violet)"
                          strokeDasharray="4 3"
                          label={{ value: `ω₀=${freqShift}`, fill: 'var(--chart-violet)', fontSize: 10 }}
                        />
                      )}
                      <Area
                        type="monotone"
                        dataKey="absF"
                        name="|F(α)| طیف اندازه"
                        stroke="var(--chart-ok)"
                        fill="var(--chart-ok)"
                        fillOpacity={0.12}
                        strokeWidth={2.2}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="realF"
                        name="Re F(α) بخش حقیقی"
                        stroke="var(--chart-accent)"
                        strokeWidth={1.8}
                        dot={false}
                        isAnimationActive={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="imagF"
                        name="Im F(α) بخش موهومی"
                        stroke="var(--chart-warn)"
                        strokeWidth={1.5}
                        strokeDasharray="4 3"
                        dot={false}
                        isAnimationActive={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Controls, Physics Indicators & Live Equations */}
            <div className="space-y-4 lg:col-span-5">
              <div className="rounded-2xl border border-line-strong bg-surface p-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-ink">انتخاب سیگنال پایه:</label>
                  <select
                    value={visPresetId}
                    onChange={(e) => setVisPresetId(e.target.value as TransformPresetId)}
                    className="mt-1 w-full rounded-xl border border-line-strong bg-panel p-2 text-xs font-bold text-ink transition focus:border-accent focus:bg-surface focus:outline-hidden"
                  >
                    <option value="two_sided_exp">نمایی دوطرفه متقارن e^(-a|x|)</option>
                    <option value="rect_pulse">پالس مستطیلی متقارن p_a(x)</option>
                    <option value="gaussian">تابع گاوسی e^(-a x^2)</option>
                    <option value="one_sided_exp">نمایی یک‌طرفه علّی e^(-ax) u(x)</option>
                    <option value="triangle_pulse">پالس مثلثی متقارن (1 - |x|/a)</option>
                  </select>
                </div>

                {/* Slider a */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-ink-2">
                    <span>پارامتر مقیاس پهنا / واپاشی (a):</span>
                    <span dir="ltr" className="font-mono text-accent">
                      a = {paramA.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.3}
                    max={3.0}
                    step={0.1}
                    value={paramA}
                    onChange={(e) => setParamA(Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                  <div className="flex justify-between text-[10px] text-ink-4">
                    <span>پالس پهن‌تر در مکان (طیف فرکانسی تیز)</span>
                    <span>پالس تیز (طیف گسترده)</span>
                  </div>
                </div>

                {/* Slider Time Shift x0 */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-ink-2">
                    <span>انتقال زمان / مکان (Time Shift x₀):</span>
                    <span dir="ltr" className="font-mono text-danger-ink">
                      x₀ = {timeShift.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-3}
                    max={3}
                    step={0.5}
                    value={timeShift}
                    onChange={(e) => setTimeShift(Number(e.target.value))}
                    className="w-full accent-danger"
                  />
                  <div className="flex justify-between text-[10px] text-ink-4">
                    <span>تأخیر فاز منفی (-3)</span>
                    <span>بدون شیفت (0)</span>
                    <span>پیش‌افتاد فاز (+3)</span>
                  </div>
                </div>

                {/* Slider Frequency Modulation w0 */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-ink-2">
                    <span>انتقال فرکانس / حامل مدولاسیون (ω₀):</span>
                    <span dir="ltr" className="font-mono text-accent">
                      ω₀ = {freqShift} rad/s
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={8}
                    step={1}
                    value={freqShift}
                    onChange={(e) => setFreqShift(Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                  <div className="flex justify-between text-[10px] text-ink-4">
                    <span>باند پایه (0)</span>
                    <span>مدولاسیون حامل (8 rad/s)</span>
                  </div>
                </div>
              </div>

              {/* Physical Readout Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-accent-line bg-accent-soft p-3">
                  <span className="text-[10px] font-bold text-accent-deep">
                    مساحت مکان = مؤلفه DC:
                  </span>
                  <div className="mt-1 font-mono text-xs font-extrabold text-ink" dir="ltr">
                    F(0) = {visData.dcValue.toFixed(4)}
                  </div>
                </div>

                <div className="rounded-xl border border-ok-line bg-ok-soft p-3">
                  <span className="text-[10px] font-bold text-ok-ink">
                    برابری انرژی پارسوال:
                  </span>
                  <div className="mt-1 font-mono text-[11px] font-extrabold text-ok-ink" dir="ltr">
                    Ex: {visData.timeEnergy.toFixed(3)} ≃ Eα: {visData.freqEnergyNormalized.toFixed(3)}
                  </div>
                </div>
              </div>

              {/* Heisenberg Uncertainty Note */}
              <div className="rounded-xl border border-warn-line bg-warn-soft p-3 text-xs leading-relaxed text-warn-ink">
                <strong>اصل عدم قطعیت فوریه: </strong>
                <MathText text="کاهش پهنای پالس در حوزه مکان ($a$ بزرگتر) مستلزم افزایش پهنای باند طیف فرکانس است: ($\Delta x \cdot \Delta \alpha \ge 1/2$). این نامساوی پایه مخابرات مدرن و مکانیک کوانتوم است." />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WORKED EXAMPLES & PROBLEM SOLVER */}
      {activeTab === 'derivations' && (
        <div className="space-y-6">
          {/* Examples Selector Bar */}
          <div className="rounded-2xl border border-line-strong bg-surface p-5">
            <div className="mb-3 flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-accent-tint px-2.5 py-0.5 text-xs font-bold text-accent-deep">
                  <FileText className="h-3.5 w-3.5" />
                  ۶ مثال تشریحی حل‌شده کامل بدون پرش محاسباتی
                </span>
                <h3 className="mt-1 text-base font-extrabold text-ink">
                  مسائل آزمونی و کاربردی با حل گام‌به‌گام تحلیلی
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {module4Data.workedExamples.map((ex, i) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => setSelectedExampleId(ex.id)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    selectedExampleId === ex.id
                      ? 'bg-accent-solid text-white'
                      : 'border border-line-strong bg-panel text-ink-3 hover:bg-muted'
                  }`}
                >
                  <span>مثال {i + 1}: </span>
                  <span>{ex.title.slice(0, 36)}...</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Worked Example Card */}
          <div className="rounded-2xl border border-accent-line bg-surface p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
              <div>
                <span className="text-xs font-bold text-accent">
                  {activeWorkedExample.pdfReference}
                </span>
                <h3 className="mt-0.5 text-lg font-extrabold text-ink">
                  {activeWorkedExample.title}
                </h3>
              </div>
              <span className="rounded-md bg-warn-tint px-2.5 py-1 text-xs font-bold text-warn">
                درجه سختی: {activeWorkedExample.difficulty}
              </span>
            </div>

            {/* Problem Statement */}
            <div className="rounded-xl border border-line bg-panel p-4 space-y-2">
              <strong className="text-xs text-ink">صورت مسئله:</strong>
              <p className="text-xs leading-relaxed text-ink-2 sm:text-sm">
                <MathText text={activeWorkedExample.problemStatement} />
              </p>
              {activeWorkedExample.problemFormula && (
                <div className="mt-2">
                  <MathFormula formula={activeWorkedExample.problemFormula} block highlight />
                </div>
              )}
            </div>

            {/* Step by Step Derivations */}
            <div className="space-y-3.5">
              <div className="text-xs font-bold text-accent-deep">مراحل حل تحلیلی بدون جهش:</div>
              {activeWorkedExample.steps.map((st) => (
                <div
                  key={st.stepNumber}
                  className="rounded-xl border border-accent-line bg-accent-soft/50 p-4 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-solid text-[11px] font-bold text-white">
                      {st.stepNumber}
                    </span>
                    <h4 className="text-xs font-extrabold text-ink">
                      <MathText text={st.title} />
                    </h4>
                  </div>

                  <p className="text-xs leading-relaxed text-ink-3">
                    <MathText text={st.explanation} />
                  </p>

                  <MathFormula formula={st.formula} block />

                  {st.whyHint && (
                    <div className="text-[11px] font-medium text-accent-deep leading-relaxed">
                      💡 <strong>چرا این گام؟ </strong>
                      <MathText text={st.whyHint} />
                    </div>
                  )}

                  {st.highlightNote && (
                    <div className="rounded-lg border border-warn-line bg-warn-soft p-2 text-[11px] text-warn-ink">
                      <strong>نکته کلیدی: </strong>
                      <MathText text={st.highlightNote} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Final Answer Formula Box */}
            <div className="rounded-xl border border-ok-line bg-ok-soft p-4">
              <div className="text-xs font-bold text-ok-ink">پاسخ نهایی تحلیلی:</div>
              <div className="mt-1">
                <MathFormula formula={activeWorkedExample.finalAnswerFormula} block highlight />
              </div>
            </div>
          </div>

          {/* Interactive Exam Practice Quiz (6 Questions) */}
          <div className="rounded-2xl border border-line-strong bg-surface p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-0.5 text-xs font-bold text-ink-3">
                  <HelpCircle className="h-3.5 w-3.5" />
                  آزمونک سنجش یادگیری تبدیل فوریه
                </span>
                <h3 className="mt-1 text-base font-extrabold text-ink">
                  ۶ تست مفهومی و امتحانی استاندارد با پاسخ تشریحی جامع
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              {module4Data.practiceQuestions.map((q, qIndex) => {
                const selected = userAnswers[q.id];
                const isAnswered = typeof selected !== 'undefined';
                const isCorrect = isAnswered && selected === q.correctIndex;
                const showExplanation = revealedExplanations[q.id];

                return (
                  <div
                    key={q.id}
                    className="rounded-xl border border-line bg-panel p-4 space-y-3"
                  >
                    <div className="flex items-start gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-solid text-[11px] font-bold text-white">
                        {qIndex + 1}
                      </span>
                      <div className="text-xs font-bold text-ink leading-relaxed">
                        <MathText text={q.question} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {q.options.map((opt, optIndex) => {
                        let btnStyle =
                          'border-line-strong bg-surface text-ink-2 hover:bg-muted';
                        if (isAnswered) {
                          if (optIndex === q.correctIndex) {
                            btnStyle = 'border-ok bg-ok-soft text-ok-ink font-bold';
                          } else if (selected === optIndex) {
                            btnStyle = 'border-danger bg-danger-soft text-danger-ink font-bold';
                          }
                        }

                        return (
                          <button
                            key={optIndex}
                            type="button"
                            onClick={() => {
                              setUserAnswers((prev) => ({ ...prev, [q.id]: optIndex }));
                              setRevealedExplanations((prev) => ({ ...prev, [q.id]: true }));
                            }}
                            className={`rounded-xl border p-2.5 text-right text-xs transition ${btnStyle}`}
                          >
                            <MathText text={opt} />
                          </button>
                        );
                      })}
                    </div>

                    {showExplanation && (
                      <div
                        className={`mt-2 rounded-lg p-3 text-xs leading-relaxed ${
                          isCorrect
                            ? 'border border-ok-line bg-ok-soft text-ok-ink'
                            : 'border border-warn-line bg-warn-soft text-warn-ink'
                        }`}
                      >
                        <strong>{isCorrect ? 'پاسخ صحیح: ' : 'پاسخ نادرست: '}</strong>
                        <MathText text={q.explanation} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
