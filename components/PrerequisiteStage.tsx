'use client';

import React, { useState } from 'react';
import {
  evaluateFourierBoundaryTrig,
  evaluateCharacteristicODE,
  buildTabularDIModel,
  TabularDIPatternId,
} from '@/lib/math-engine';
import MathFormula, { MathText } from '@/components/MathFormula';
import {
  Compass,
  Calculator,
  Activity,
  CheckCircle2,
  ArrowDownRight,
  ArrowLeft,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

type PrereqLabTab = 'ibp_tabular' | 'trig_parity' | 'ode_hyperbolic';

export default function PrerequisiteStage() {
  const [activeTab, setActiveTab] = useState<PrereqLabTab>('ibp_tabular');
  const [harmonicN, setHarmonicN] = useState<number>(1);
  const [ibpPatternId, setIbpPatternId] =
    useState<TabularDIPatternId>('x2_cos_nx');
  const [selectedDiagStep, setSelectedDiagStep] = useState<
    'all' | number | 'horizontal'
  >('all');
  const [lambdaPreset, setLambdaPreset] = useState<number>(4);

  const trigInfo = evaluateFourierBoundaryTrig(harmonicN);
  const odeInfo = evaluateCharacteristicODE(lambdaPreset);
  const diModel = buildTabularDIModel(ibpPatternId);

  const handlePatternChange = (nextPattern: TabularDIPatternId) => {
    setIbpPatternId(nextPattern);
    setSelectedDiagStep('all');
  };

  // Unit circle point for angle theta = n * pi
  const circleCx = 120;
  const circleCy = 110;
  const circleR = 66;
  const pointNPiX = circleCx + circleR * trigInfo.cosNPi;
  const pointNPiY = circleCy;

  // Wave plot on [-pi, pi] for cos(nx) and sin(nx)
  const waveWidth = 420;
  const waveHeight = 220;
  const padX = 36;
  const padY = 26;
  const plotW = waveWidth - 2 * padX;
  const plotH = waveHeight - 2 * padY;

  const toWaveX = (x: number) =>
    padX + ((x + Math.PI) / (2 * Math.PI)) * plotW;
  const toWaveY = (y: number) =>
    padY + plotH / 2 - y * (plotH * 0.38);

  const cosPoints: string[] = [];
  const sinPoints: string[] = [];
  const numSamples = 160;
  for (let i = 0; i <= numSamples; i++) {
    const x = -Math.PI + (i / numSamples) * (2 * Math.PI);
    const sx = toWaveX(x).toFixed(1);
    cosPoints.push(`${sx},${toWaveY(Math.cos(harmonicN * x)).toFixed(1)}`);
    sinPoints.push(`${sx},${toWaveY(Math.sin(harmonicN * x)).toFixed(1)}`);
  }

  // ODE Curve points on [0, L]
  const odePoints: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const u = i / 120;
    const yVal = Math.max(
      -1.2,
      Math.min(1.2, odeInfo.evaluateSampleCurve(u * Math.PI, Math.PI))
    );
    const px = padX + u * plotW;
    const py = toWaveY(yVal);
    odePoints.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }

  return (
    <section
      aria-label="آزمایشگاه تعاملی ریاضیات پایه و پیش‌نیاز"
      className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-xs transition-colors sm:p-5 dark:border-[#334155] dark:bg-[#111827]"
    >
      {/* Top Interactive Sub-Lab Switcher */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3.5 dark:border-[#334155]">
        <div>
          <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            آزمایشگاه تعاملی ریاضیات پایه و پیش‌نیاز مهندسی
          </h3>
          <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
            ابزارهای بصری برای تسلط کامل بر روش جزء‌به‌جزء جدولی (جدول DI با فلش‌های قطری)، دایره مثلثاتی فوریه و معادلات دیفرانسیل مرتبه دوم
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('ibp_tabular')}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition ${
              activeTab === 'ibp_tabular'
                ? 'border-[#0284C7] bg-[#0284C7] text-white'
                : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#334155] hover:border-[#0284C7] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#CBD5E1]'
            }`}
          >
            <Calculator className="h-3.5 w-3.5" />
            <span>۱. کارگاه روش جزء‌به‌جزء جدولی (Tabular DI)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('trig_parity')}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition ${
              activeTab === 'trig_parity'
                ? 'border-[#0284C7] bg-[#0284C7] text-white'
                : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#334155] hover:border-[#0284C7] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#CBD5E1]'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <MathText text="۲. دایره مثلثاتی و مقادیر $(-1)^n$" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ode_hyperbolic')}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition ${
              activeTab === 'ode_hyperbolic'
                ? 'border-[#0284C7] bg-[#0284C7] text-white'
                : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#334155] hover:border-[#0284C7] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#CBD5E1]'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <MathText text="۳. شبیه‌ساز معادله مشخصه $X''+\lambda X=0$" />
          </button>
        </div>
      </div>

      {/* SUB-LAB 1: TABULAR DI METHOD (INTERACTIVE VISUAL WORKBENCH) */}
      {activeTab === 'ibp_tabular' && (
        <div className="space-y-4">
          {/* Pattern Selector Bar */}
          <div className="flex flex-col gap-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 sm:flex-row sm:items-center sm:justify-between dark:border-[#334155] dark:bg-[#1E293B]/70">
            <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              انتخاب الگوی انتگرال برای ساخت جدول DI و مشاهده مسیر ضرب قُطری:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  {
                    id: 'x2_cos_nx',
                    label: 'الگوی ۱ (۴ سطری): $\\int x^2 \\cos(nx)\\,dx$',
                  },
                  {
                    id: 'x_cos_nx',
                    label: 'الگوی ۲ (۳ سطری): $\\int x \\cos(nx)\\,dx$',
                  },
                  {
                    id: 'x3_sin_nx',
                    label: 'الگوی ۳ (۵ سطری): $\\int x^3 \\sin(nx)\\,dx$',
                  },
                  {
                    id: 'exp_cos_cyclic',
                    label: 'الگوی ۴ (بازگشتی افقی): $\\int e^{-ax}\\cos(\\alpha x)\\,dx$',
                  },
                ] as { id: TabularDIPatternId; label: string }[]
              ).map((pat) => (
                <button
                  key={pat.id}
                  type="button"
                  onClick={() => handlePatternChange(pat.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                    ibpPatternId === pat.id
                      ? 'border-[#0284C7] bg-[#0284C7] text-white shadow-2xs'
                      : 'border-[#CBD5E1] bg-white text-[#334155] hover:border-[#0284C7] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#CBD5E1]'
                  }`}
                >
                  <MathText text={pat.label} />
                </button>
              ))}
            </div>
          </div>

          {/* 4 Golden Rules of Tabular DI Banner */}
          <div className="rounded-xl border border-[#0284C7]/30 bg-[#F0F9FF] p-4 dark:border-[#0284C7]/40 dark:bg-[#0C4A6E]/25">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-[#0369A1] dark:text-[#38BDF8]">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>
                ۴ قانون طلایی روش جزء‌به‌جزء جدولی (Tabular DI Method) — چرا هرگز هم‌سطر ضرب نمی‌کنیم؟
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2.5 text-xs leading-6 text-[#1E293B] md:grid-cols-2 dark:text-[#E2E8F0]">
              <div className="rounded-lg border border-[#BAE6FD] bg-white/90 p-2.5 dark:border-[#0369A1]/50 dark:bg-[#0F172A]/90">
                <strong className="font-bold text-[#0284C7] dark:text-[#38BDF8]">
                  قانون ۱ (انتخاب ستون‌ها با LIATE):{' '}
                </strong>
                <MathText text="در سطر اول، تابع $u$ (معمولاً چندجمله‌ای $x^k$) را در ستون $D$ (مشتق‌گیری متوالی) و تابع $dv$ (مثلثاتی یا نمایی) را در ستون $I$ (انتگرال‌گیری متوالی) قرار می‌دهیم." />
              </div>
              <div className="rounded-lg border border-[#BAE6FD] bg-white/90 p-2.5 dark:border-[#0369A1]/50 dark:bg-[#0F172A]/90">
                <strong className="font-bold text-[#059669] dark:text-[#34D399]">
                  <MathText text="قانون ۲ (ضرب قُطری $D_k \searrow I_{k+1}$): " />
                </strong>
                <MathText text="هر عنصر در سطر $k$ ستون $D$ (با علامت متناوب $+,-,+,-$) همیشه به صورت **قُطری ($\searrow$)** در **سطر بعدی ($k+1$)** از ستون $I$ ضرب می‌شود؛ هرگز دو عنصر هم‌سطر را خارج از انتگرال ضرب نکنید!" />
              </div>
              <div className="rounded-lg border border-[#BAE6FD] bg-white/90 p-2.5 dark:border-[#0369A1]/50 dark:bg-[#0F172A]/90">
                <strong className="font-bold text-[#D97706] dark:text-[#FBBF24]">
                  <MathText text="قانون ۳ (چرا $I_1$ در سطر اول ضرب نمی‌شود؟): " />
                </strong>
                <MathText text="چون در فرمول $\int u\,dv = u\cdot v - \int v\,du$، جمله اول $u\cdot v$ است نه $u\cdot dv$! عبارت سطر اول ستون $I$ خودِ $dv$ است و انتگرال آن یعنی $v$ در **سطر دوم ستون $I$ ($I_2$)** قرار دارد." />
              </div>
              <div className="rounded-lg border border-[#BAE6FD] bg-white/90 p-2.5 dark:border-[#0369A1]/50 dark:bg-[#0F172A]/90">
                <strong className="font-bold text-[#7C3AED] dark:text-[#C084FC]">
                  <MathText text="قانون ۴ (قانون توقف افقی $\longleftarrow$ در سطر آخر): " />
                </strong>
                <MathText text="در آخرین سطر جدول، دو عنصر هم‌سطر را به صورت **افقی ($\longleftarrow$)** در هم ضرب کرده و **داخل علامت انتگرال** ($\pm\int D_{\text{last}}\cdot I_{\text{last}}\,dx$) می‌گذاریم. اگر $D_{\text{last}}=0$ باشد، انتگرال صفر شده و تمام می‌شود!" />
              </div>
            </div>
          </div>

          {/* Interactive Step Filter Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 dark:border-[#334155] dark:bg-[#1E293B]/60">
            <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              ردیاب مرحله‌به‌مرحله قطرهای جدول (روی هر قطر کلیک کنید تا مسیر ضرب آن هایلایت شود):
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedDiagStep('all')}
                className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
                  selectedDiagStep === 'all'
                    ? 'border-[#0284C7] bg-[#0284C7] text-white'
                    : 'border-[#CBD5E1] bg-white text-[#334155] hover:border-[#0284C7] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#CBD5E1]'
                }`}
              >
                نمایش هم‌زمان همه قطرها ({diModel.diagonals.length} قطر)
              </button>
              {diModel.diagonals.map((diag) => (
                <button
                  key={diag.stepNumber}
                  type="button"
                  onClick={() => setSelectedDiagStep(diag.stepNumber)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
                    selectedDiagStep === diag.stepNumber
                      ? 'border-[#0284C7] bg-[#0284C7] text-white'
                      : 'border-[#CBD5E1] bg-white text-[#334155] hover:border-[#0284C7] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#CBD5E1]'
                  }`}
                >
                  <MathText
                    text={`قطر ${diag.stepNumber}: $D_{${diag.fromRow}} \\searrow I_{${diag.toRow}}$`}
                  />
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedDiagStep('horizontal')}
                className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
                  selectedDiagStep === 'horizontal'
                    ? 'border-[#7C3AED] bg-[#7C3AED] text-white'
                    : 'border-[#CBD5E1] bg-white text-[#334155] hover:border-[#7C3AED] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#CBD5E1]'
                }`}
              >
                <MathText
                  text={`سطر آخر افقی: $${diModel.horizontalRemainder.rowSign}\\int D_{${diModel.rows.length}} \\cdot I_{${diModel.rows.length}}\\,dx$`}
                />
              </button>
            </div>
          </div>

          {/* Main Grid: Left = Visual DI Table with Diagonal Arrows, Right = Extracted Terms & Evaluation */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Visual Interactive Tabular DI Table */}
            <div className="space-y-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 lg:col-span-7 dark:border-[#334155] dark:bg-[#1E293B]/60">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  جدول تعاملی DI (چپ به راست: ستون مشتق D در سمت چپ ↘ ستون انتگرال I در سمت راست):
                </div>
                <div className="flex flex-wrap gap-2">
                  <MathFormula formula={diModel.uChoiceLatex} />
                  <MathFormula formula={diModel.dvChoiceLatex} />
                </div>
              </div>

              {/* Structured Visual Table in LTR so Column D is on the Left and arrows ↘ point Down-Right to Column I */}
              <div
                dir="ltr"
                className="overflow-x-auto rounded-xl border border-[#CBD5E1] bg-white shadow-2xs dark:border-[#475569] dark:bg-[#0F172A]"
              >
                <table className="w-full border-collapse text-center text-xs">
                  <thead>
                    <tr className="border-b border-[#CBD5E1] bg-[#F1F5F9] text-[#0F172A] dark:border-[#334155] dark:bg-[#1E293B] dark:text-[#F8FAFC]">
                      <th className="px-2.5 py-2.5 font-bold" dir="rtl">
                        سطر
                      </th>
                      <th className="px-2.5 py-2.5 font-bold" dir="rtl">
                        علامت
                      </th>
                      <th
                        className="px-3 py-2.5 font-bold text-[#0284C7] dark:text-[#38BDF8]"
                        dir="rtl"
                      >
                        ستون D (مشتق متوالی u)
                      </th>
                      <th
                        className="px-2.5 py-2.5 font-bold text-[#059669] dark:text-[#34D399]"
                        dir="rtl"
                      >
                        مسیر ضرب قُطری (↘)
                      </th>
                      <th
                        className="px-3 py-2.5 font-bold text-[#D97706] dark:text-[#FBBF24]"
                        dir="rtl"
                      >
                        ستون I (انتگرال متوالی dv)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
                    {diModel.rows.map((row) => {
                      const outgoingDiag = diModel.diagonals.find(
                        (d) => d.fromRow === row.rowIndex
                      );
                      const incomingDiag = diModel.diagonals.find(
                        (d) => d.toRow === row.rowIndex
                      );
                      const isLastRow = row.rowIndex === diModel.rows.length;

                      const isDHighlighted =
                        selectedDiagStep === 'all'
                          ? Boolean(outgoingDiag)
                          : selectedDiagStep === 'horizontal'
                          ? isLastRow
                          : outgoingDiag?.stepNumber === selectedDiagStep;

                      const isIHighlighted =
                        selectedDiagStep === 'all'
                          ? Boolean(incomingDiag)
                          : selectedDiagStep === 'horizontal'
                          ? isLastRow
                          : incomingDiag?.stepNumber === selectedDiagStep;

                      return (
                        <tr
                          key={row.rowIndex}
                          className="transition-colors hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40"
                        >
                          {/* Row Number */}
                          <td
                            dir="rtl"
                            className="px-2.5 py-3 font-mono font-bold text-[#475569] dark:text-[#94A3B8]"
                          >
                            سطر {row.rowIndex}
                          </td>

                          {/* Alternating Sign */}
                          <td className="px-2.5 py-3">
                            <span
                              dir="ltr"
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-full font-mono text-sm font-extrabold ${
                                row.sign === '+'
                                  ? 'border border-[#059669]/40 bg-[#ECFDF5] text-[#059669] dark:bg-[#064E3B]/60 dark:text-[#34D399]'
                                  : 'border border-[#D97706]/40 bg-[#FFFBEB] text-[#D97706] dark:bg-[#78350F]/60 dark:text-[#FBBF24]'
                              }`}
                            >
                              {row.sign}1
                            </span>
                          </td>

                          {/* Column D Cell (Derivative) */}
                          <td
                            className={`px-3 py-3 transition-all ${
                              isDHighlighted
                                ? 'bg-[#F0F9FF] ring-2 ring-inset ring-[#0284C7] dark:bg-[#0C4A6E]/40 dark:ring-[#38BDF8]'
                                : ''
                            }`}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <MathFormula
                                formula={`D_{${row.rowIndex}} = ${row.dLatex}`}
                              />
                              <span
                                dir="rtl"
                                className="text-[11px] font-medium text-[#475569] dark:text-[#94A3B8]"
                              >
                                {row.dRoleFa}
                              </span>
                            </div>
                          </td>

                          {/* Connector Column: Diagonal Arrow (D_k ↘ I_{k+1}) or Horizontal Stopping Rule */}
                          <td className="px-2.5 py-3">
                            {outgoingDiag ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedDiagStep(outgoingDiag.stepNumber)
                                }
                                className={`mx-auto flex flex-col items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition ${
                                  selectedDiagStep === 'all' ||
                                  selectedDiagStep === outgoingDiag.stepNumber
                                    ? 'border-[#0284C7] bg-[#E0F2FE] text-[#0369A1] shadow-2xs dark:border-[#38BDF8] dark:bg-[#0C4A6E]/70 dark:text-[#7DD3FC]'
                                    : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#64748B] dark:border-[#475569] dark:bg-[#1E293B] dark:text-[#94A3B8]'
                                }`}
                              >
                                <span className="flex items-center gap-1">
                                  <MathFormula
                                    formula={`(${outgoingDiag.rowSign}D_{${outgoingDiag.fromRow}}) \\searrow I_{${outgoingDiag.toRow}}`}
                                  />
                                  <ArrowDownRight className="h-4 w-4 text-[#0284C7] dark:text-[#38BDF8]" />
                                </span>
                                <span
                                  dir="rtl"
                                  className="text-[10px] font-semibold"
                                >
                                  قطر {outgoingDiag.stepNumber}: ضرب در سطر{' '}
                                  {outgoingDiag.toRow} ستون I
                                </span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedDiagStep('horizontal')
                                }
                                className={`mx-auto flex flex-col items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition ${
                                  selectedDiagStep === 'all' ||
                                  selectedDiagStep === 'horizontal'
                                    ? 'border-[#7C3AED] bg-[#F3E8FF] text-[#6D28D9] dark:border-[#C084FC] dark:bg-[#4C1D95]/60 dark:text-[#DDD6FE]'
                                    : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#64748B] dark:border-[#475569] dark:bg-[#1E293B] dark:text-[#94A3B8]'
                                }`}
                              >
                                <span className="flex items-center gap-1">
                                  <MathFormula
                                    formula={`${row.sign}\\int D_{${row.rowIndex}} \\cdot I_{${row.rowIndex}}\\,dx`}
                                  />
                                  <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                                </span>
                                <span
                                  dir="rtl"
                                  className="text-[10px] font-semibold"
                                >
                                  {diModel.horizontalRemainder.isZero
                                    ? 'ضرب افقی = ۰ (توقف کامل)'
                                    : 'ضرب افقی زیر انتگرال (بازگشتی)'}
                                </span>
                              </button>
                            )}
                          </td>

                          {/* Column I Cell (Integral) */}
                          <td
                            className={`px-3 py-3 transition-all ${
                              row.rowIndex === 1
                                ? 'bg-[#FFFBEB]/60 dark:bg-[#78350F]/20'
                                : isIHighlighted
                                ? 'bg-[#ECFDF5] ring-2 ring-inset ring-[#059669] dark:bg-[#064E3B]/40 dark:ring-[#34D399]'
                                : ''
                            }`}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <MathFormula
                                formula={`I_{${row.rowIndex}} = ${row.iLatex}`}
                              />
                              {row.rowIndex === 1 ? (
                                <span
                                  dir="rtl"
                                  className="inline-flex items-center gap-1 rounded bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-bold text-[#92400E] dark:bg-[#78350F] dark:text-[#FDE68A]"
                                >
                                  <AlertCircle className="h-3 w-3 shrink-0" />
                                  {row.iRoleFa}
                                </span>
                              ) : (
                                <span
                                  dir="rtl"
                                  className="text-[11px] font-semibold text-[#059669] dark:text-[#34D399]"
                                >
                                  {row.iRoleFa}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Why Row 1 of Column I is never multiplied callout */}
              <div className="rounded-lg border border-[#F59E0B]/40 bg-[#FFFBEB] p-3 text-xs leading-6 text-[#92400E] dark:border-[#F59E0B]/40 dark:bg-[#78350F]/30 dark:text-[#FDE68A]">
                <strong className="font-bold">
                  نکته بسیار مهم (چرا سطر ۱ ستون I یعنی I₁ در هیچ قطری ضرب نمی‌شود؟):{' '}
                </strong>
                <span>{diModel.whyRowOneIDoesNotMultiplyFa}</span>
              </div>
            </div>

            {/* Right Column: Step-by-Step Diagonal Products & Final Result */}
            <div className="space-y-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 lg:col-span-5 dark:border-[#334155] dark:bg-[#1E293B]/60">
              <div className="text-xs font-bold text-[#0369A1] dark:text-[#38BDF8]">
                استخراج مرحله‌به‌مرحله جملات از قطرهای جدول:
              </div>

              <div className="space-y-2.5">
                {diModel.diagonals.map((diag) => {
                  const isActive =
                    selectedDiagStep === 'all' ||
                    selectedDiagStep === diag.stepNumber;
                  return (
                    <div
                      key={diag.stepNumber}
                      onClick={() => setSelectedDiagStep(diag.stepNumber)}
                      className={`cursor-pointer rounded-xl border p-3 transition ${
                        isActive
                          ? 'border-[#0284C7] bg-white shadow-2xs dark:border-[#38BDF8] dark:bg-[#0F172A]'
                          : 'border-[#E2E8F0] bg-white/60 opacity-65 hover:opacity-100 dark:border-[#334155] dark:bg-[#0F172A]/50'
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        <span>
                          قطر {diag.stepNumber} (سطر {diag.fromRow} ستون D ↘ سطر{' '}
                          {diag.toRow} ستون I):
                        </span>
                        <MathFormula
                          formula={`(${diag.rowSign}D_{${diag.fromRow}}) \\times I_{${diag.toRow}}`}
                          highlight
                        />
                      </div>
                      <p className="mb-1.5 text-[11px] leading-5 text-[#475569] dark:text-[#94A3B8]">
                        {diag.explanationFa}
                      </p>
                      <MathFormula
                        block
                        formula={`${diag.rawProductLatex} = ${diag.simplifiedTermLatex}`}
                      />
                    </div>
                  );
                })}

                {/* Final Row Horizontal Integral Box */}
                <div
                  onClick={() => setSelectedDiagStep('horizontal')}
                  className={`cursor-pointer rounded-xl border p-3 transition ${
                    selectedDiagStep === 'all' ||
                    selectedDiagStep === 'horizontal'
                      ? 'border-[#7C3AED] bg-[#FAF5FF] shadow-2xs dark:border-[#C084FC] dark:bg-[#2E1065]/40'
                      : 'border-[#E2E8F0] bg-white/60 opacity-65 hover:opacity-100 dark:border-[#334155] dark:bg-[#0F172A]/50'
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between text-xs font-bold text-[#6D28D9] dark:text-[#DDD6FE]">
                    <span>
                      قانون سطر آخر (ضرب افقی سطر {diModel.horizontalRemainder.rowIndex} زیر علامت انتگرال):
                    </span>
                    <MathFormula
                      formula={`${diModel.horizontalRemainder.rowSign}\\int D_{${diModel.horizontalRemainder.rowIndex}} \\cdot I_{${diModel.horizontalRemainder.rowIndex}}\\,dx`}
                    />
                  </div>
                  <p className="mb-1.5 text-[11px] leading-5 text-[#475569] dark:text-[#CBD5E1]">
                    {diModel.horizontalRemainder.explanationFa}
                  </p>
                  <MathFormula
                    block
                    formula={diModel.horizontalRemainder.integralLatex}
                  />
                </div>
              </div>

              {/* Combined Final Indefinite & Definite Formulas */}
              <div className="space-y-2 border-t border-[#E2E8F0] pt-3 dark:border-[#334155]">
                <div className="text-xs font-bold text-[#059669] dark:text-[#34D399]">
                  حاصل جمع قطرها (جواب نهایی انتگرال نامعین و معین):
                </div>
                <MathFormula
                  block
                  highlight
                  formula={diModel.indefiniteFormulaLatex}
                />
                <MathFormula block formula={diModel.definiteFormulaLatex} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-LAB 2: TRIGONOMETRY & PARITY IDENTITIES */}
      {activeTab === 'trig_parity' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Visual Stage: Unit Circle + Wave on [-pi, pi] */}
          <div className="space-y-3 lg:col-span-7">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
              {/* Unit Circle SVG */}
              <div className="flex flex-col items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 sm:col-span-5 dark:border-[#334155] dark:bg-[#1E293B]">
                <div className="mb-1 text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  <MathText text={`دایره مثلثاتی در زاویه $\\theta = ${harmonicN}\\pi$`} />
                </div>
                <svg
                  direction="ltr"
                  viewBox="0 0 240 220"
                  className="h-44 w-48 [direction:ltr]"
                  role="img"
                  aria-label="دایره مثلثاتی واحد"
                >
                  <line
                    x1="15"
                    y1={circleCy}
                    x2="225"
                    y2={circleCy}
                    stroke="#94A3B8"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={circleCx}
                    y1="15"
                    x2={circleCx}
                    y2="205"
                    stroke="#94A3B8"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={circleCx}
                    cy={circleCy}
                    r={circleR}
                    fill="none"
                    stroke="#64748B"
                    strokeWidth="2"
                  />
                  <line
                    x1={circleCx}
                    y1={circleCy}
                    x2={pointNPiX}
                    y2={pointNPiY}
                    stroke="#0284C7"
                    strokeWidth="3"
                  />
                  <circle
                    cx={pointNPiX}
                    cy={pointNPiY}
                    r="7"
                    fill="#D97706"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                  <text
                    x={circleCx + circleR + 8}
                    y={circleCy - 6}
                    fontSize="11"
                    fill="#0284C7"
                    fontWeight="bold"
                  >
                    (1,0)
                  </text>
                  <text
                    x={circleCx - circleR - 36}
                    y={circleCy - 6}
                    fontSize="11"
                    fill="#D97706"
                    fontWeight="bold"
                  >
                    (-1,0)
                  </text>
                  <text
                    x={circleCx - 16}
                    y={circleCy - circleR - 8}
                    fontSize="10"
                    fill="#64748B"
                  >
                    (0,1)
                  </text>
                  <text
                    x={circleCx - 18}
                    y={circleCy + circleR + 16}
                    fontSize="10"
                    fill="#64748B"
                  >
                    (0,-1)
                  </text>
                </svg>
                <div className="mt-1 text-center text-[11px] font-semibold text-[#0369A1] dark:text-[#38BDF8]">
                  {trigInfo.isEvenN
                    ? `چون n=${harmonicN} زوج است، زاویه ${harmonicN}π روی نقطه (+1, 0) می‌افتد`
                    : `چون n=${harmonicN} فرد است، زاویه ${harmonicN}π روی نقطه (-1, 0) می‌افتد`}
                </div>
              </div>

              {/* Wave Plot on [-pi, pi] */}
              <div className="flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3 sm:col-span-7 dark:border-[#334155] dark:bg-[#1E293B]">
                <div className="mb-1 flex items-center justify-between text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  <MathText text={`رفتار $\\cos(${harmonicN}x)$ و $\\sin(${harmonicN}x)$ در مرزهای $\\pm\\pi$`} />
                  <span className="rounded bg-[#E0F2FE] px-2 py-0.5 text-[11px] text-[#0369A1] dark:bg-[#0C4A6E] dark:text-[#7DD3FC]">
                    <MathText text={`$n = ${harmonicN}$ (${trigInfo.isEvenN ? 'زوج' : 'فرد'})`} />
                  </span>
                </div>
                <svg
                  direction="ltr"
                  viewBox={`0 0 ${waveWidth} ${waveHeight}`}
                  className="h-44 w-full [direction:ltr]"
                  role="img"
                  aria-label="نمودار سینوس و کسینوس در بازه منفی پی تا پی"
                >
                  <line
                    x1={padX}
                    y1={padY + plotH / 2}
                    x2={waveWidth - padX}
                    y2={padY + plotH / 2}
                    stroke="#94A3B8"
                    strokeWidth="1.2"
                  />
                  <line
                    x1={waveWidth / 2}
                    y1={padY}
                    x2={waveWidth / 2}
                    y2={waveHeight - padY}
                    stroke="#64748B"
                    strokeDasharray="4 4"
                  />
                  <polyline
                    fill="none"
                    stroke="#0284C7"
                    strokeWidth="2.5"
                    points={cosPoints.join(' ')}
                  />
                  <polyline
                    fill="none"
                    stroke="#D97706"
                    strokeWidth="2"
                    strokeDasharray="5 3"
                    points={sinPoints.join(' ')}
                  />
                  <circle
                    cx={toWaveX(-Math.PI)}
                    cy={toWaveY(trigInfo.cosNPi)}
                    r="5.5"
                    fill="#0284C7"
                  />
                  <circle
                    cx={toWaveX(Math.PI)}
                    cy={toWaveY(trigInfo.cosNPi)}
                    r="5.5"
                    fill="#0284C7"
                  />
                  <circle
                    cx={toWaveX(Math.PI)}
                    cy={toWaveY(0)}
                    r="4.5"
                    fill="#D97706"
                  />
                  <text
                    x={padX - 8}
                    y={waveHeight - 6}
                    fontSize="11"
                    fill="#64748B"
                  >
                    -π
                  </text>
                  <text
                    x={waveWidth / 2 - 4}
                    y={waveHeight - 6}
                    fontSize="11"
                    fill="#64748B"
                  >
                    0
                  </text>
                  <text
                    x={waveWidth - padX - 8}
                    y={waveHeight - 6}
                    fontSize="11"
                    fill="#64748B"
                  >
                    +π
                  </text>
                </svg>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#475569] dark:text-[#94A3B8]">
                  <span className="font-bold text-[#0284C7] dark:text-[#38BDF8]">
                    <MathText text={`━ خط آبی ممتد: $\\cos(${harmonicN}x)$ (زوج)`} />
                  </span>
                  <span className="font-bold text-[#D97706] dark:text-[#FBBF24]">
                    <MathText text={`┅ خط نارنجی خط‌چین: $\\sin(${harmonicN}x)$ (فرد)`} />
                  </span>
                </div>
              </div>
            </div>

            {/* Golden Identities Reference Box */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 dark:border-[#334155] dark:bg-[#1E293B]">
              <div className="mb-1.5 text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                <MathText text="قانون طلایی تفکیک جملات زوج ($n=2k$) و فرد ($n=2k-1$) در سری فوریه:" />
              </div>
              <MathFormula
                block
                formula="1 - (-1)^n = \begin{cases} 0 & n = 2k \text{ (even)} \\ 2 & n = 2k-1 \text{ (odd)} \end{cases} \quad , \quad 1 + (-1)^n = \begin{cases} 2 & n = 2k \text{ (even)} \\ 0 & n = 2k-1 \text{ (odd)} \end{cases}"
              />
            </div>
          </div>

          {/* Controls & Live Exact Values */}
          <div className="space-y-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 lg:col-span-5 dark:border-[#334155] dark:bg-[#1E293B]">
            <div>
              <label className="mb-2 flex items-center justify-between text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                <MathText text="انتخاب شماره هماهنگ صحیح ($n$):" />
                <span
                  dir="ltr"
                  className="rounded bg-[#0284C7] px-2.5 py-0.5 font-mono text-xs text-white"
                >
                  n = {harmonicN} ({trigInfo.isEvenN ? 'Even / زوج' : 'Odd / فرد'})
                </span>
              </label>
              <input
                type="range"
                min={1}
                max={8}
                step={1}
                value={harmonicN}
                onChange={(e) => setHarmonicN(Number(e.target.value))}
                className="w-full accent-[#0284C7]"
              />
              <div className="mt-2 grid grid-cols-8 gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setHarmonicN(val)}
                    className={`rounded border py-1 font-mono text-xs font-bold transition ${
                      harmonicN === val
                        ? 'border-[#0284C7] bg-[#0284C7] text-white'
                        : 'border-[#CBD5E1] bg-white text-[#334155] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#CBD5E1]'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                <MathText text={`مقادیر دقیق مثلثاتی به ازای $n = ${harmonicN}$:`} />
              </div>
              <MathFormula
                block
                highlight
                formula={`\\sin(${harmonicN}\\pi) = 0 \\quad , \\quad \\cos(${harmonicN}\\pi) = (-1)^{${harmonicN}} = ${trigInfo.cosNPi}`}
              />
              <MathFormula
                block
                formula={`\\begin{aligned} 1 - \\cos(${harmonicN}\\pi) &= 1 - (${trigInfo.cosNPi}) = ${trigInfo.oneMinusCosNPi} \\\\ 1 + \\cos(${harmonicN}\\pi) &= 1 + (${trigInfo.cosNPi}) = ${trigInfo.onePlusCosNPi} \\end{aligned}`}
              />
              <MathFormula
                block
                formula={`\\begin{aligned} \\sin\\left(\\frac{${harmonicN}\\pi}{2}\\right) &= ${trigInfo.sinHalfNPi} \\\\ \\sin\\left(\\frac{(2(${harmonicN})-1)\\pi}{2}\\right) &= (-1)^{${harmonicN}-1} = ${trigInfo.sinOddHalfPi} \\end{aligned}`}
              />
            </div>

            <p className="text-xs leading-6 text-[#334155] dark:text-[#CBD5E1]">
              <MathText text="در انتگرال‌گیری ضرایب فوریه، هرگاه در حدود بالا و پایین به $\sin(n\pi)$ رسیدید مستقیماً عدد $0$ و هرگاه به $\cos(n\pi)$ رسیدید مستقیماً $(-1)^n$ قرار دهید (هرگز آن را به صورت $\cos(n\pi)$ رها نکنید)." />
            </p>
          </div>
        </div>
      )}

      {/* SUB-LAB 3: 2ND-ORDER ODE & HYPERBOLIC / EULER SIMULATOR */}
      {activeTab === 'ode_hyperbolic' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-6">
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 dark:border-[#334155] dark:bg-[#1E293B]">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                <MathText text="نمودار رفتار جواب معادله $X''(x) + \lambda X(x) = 0$" />
                <span
                  dir="ltr"
                  className="rounded bg-[#0284C7] px-2 py-0.5 font-mono text-xs text-white"
                >
                  λ = {lambdaPreset}
                </span>
              </div>
              <svg
                direction="ltr"
                viewBox={`0 0 ${waveWidth} ${waveHeight}`}
                className="h-44 w-full [direction:ltr]"
                role="img"
                aria-label="نمودار جواب معادله دیفرانسیل مرتبه دوم"
              >
                <line
                  x1={padX}
                  y1={padY + plotH / 2}
                  x2={waveWidth - padX}
                  y2={padY + plotH / 2}
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                />
                <polyline
                  fill="none"
                  stroke={
                    odeInfo.canSatisfyTwoPointZeroBC ? '#059669' : '#D97706'
                  }
                  strokeWidth="3"
                  points={odePoints.join(' ')}
                />
                <circle
                  cx={padX}
                  cy={padY + plotH / 2}
                  r="5"
                  fill="#0284C7"
                />
                <circle
                  cx={waveWidth - padX}
                  cy={padY + plotH / 2}
                  r="5"
                  fill="#0284C7"
                />
                <text x={padX - 8} y={waveHeight - 6} fontSize="11" fill="#64748B">
                  x = 0
                </text>
                <text
                  x={waveWidth - padX - 18}
                  y={waveHeight - 6}
                  fontSize="11"
                  fill="#64748B"
                >
                  x = L
                </text>
              </svg>
              <div className="mt-2 flex items-center gap-2 text-xs font-bold">
                <CheckCircle2
                  className={`h-4 w-4 shrink-0 ${
                    odeInfo.canSatisfyTwoPointZeroBC
                      ? 'text-[#059669] dark:text-[#34D399]'
                      : 'text-[#D97706] dark:text-[#FBBF24]'
                  }`}
                />
                <span className="text-[#334155] dark:text-[#CBD5E1]">
                  {odeInfo.canSatisfyTwoPointZeroBC
                    ? 'جواب نوسانی است و می‌تواند در هر دو مرز x=0 و x=L صفر شود (تولید توابع ویژه)!'
                    : 'جواب غیرنوسانی است و نمی‌تواند هم‌زمان در دو مرز x=0 و x=L صفر شود (جواب بدیهی X=0).'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 lg:col-span-6 dark:border-[#334155] dark:bg-[#1E293B]">
            <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              <MathText text="انتخاب علامت و مقدار پارامتر $\lambda$ در معادله $X'' + \lambda X = 0$:" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: -4, label: 'λ = -4 < 0 (هیپربولیک)' },
                { val: 0, label: 'λ = 0 (خطی مضاعف)' },
                { val: 4, label: 'λ = +4 > 0 (مثلثاتی نوسانی)' },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setLambdaPreset(item.val)}
                  className={`rounded-lg border px-2.5 py-2 text-xs font-bold transition ${
                    lambdaPreset === item.val
                      ? 'border-[#0284C7] bg-[#0284C7] text-white'
                      : 'border-[#CBD5E1] bg-white text-[#334155] dark:border-[#475569] dark:bg-[#0F172A] dark:text-[#CBD5E1]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-[#0369A1] dark:text-[#38BDF8]">
                معادله مشخصه و ریشه‌ها:
              </div>
              <MathFormula block formula={odeInfo.rootsLatex} />
              <div className="text-xs font-bold text-[#0369A1] dark:text-[#38BDF8]">
                فرم کلی جواب معادله دیفرانسیل:
              </div>
              <MathFormula block highlight formula={odeInfo.generalSolutionLatex} />
            </div>

            <p className="text-xs leading-6 text-[#334155] dark:text-[#CBD5E1]">
              <MathText text={odeInfo.physicalMeaningFa} />
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
