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
  ListChecks,
  Activity,
  CheckCircle2,
  ArrowDownRight,
  ArrowLeft,
  AlertCircle,
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
      className="rounded-xl border border-line bg-surface p-4 transition-colors sm:p-5"
    >
      {/* Top Interactive Sub-Lab Switcher */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3.5">
        <div>
          <h3 className="text-base font-bold text-ink">
            آزمایشگاه تعاملی ریاضیات پایه و پیش‌نیاز مهندسی
          </h3>
          <p className="text-xs text-ink-3">
            ابزارهای بصری برای تسلط کامل بر روش جزء‌به‌جزء جدولی (جدول DI با فلش‌های قطری)، دایره مثلثاتی فوریه و معادلات دیفرانسیل مرتبه دوم
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('ibp_tabular')}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition ${
              activeTab === 'ibp_tabular'
                ? 'border-accent bg-accent-solid text-white'
                : 'border-line-strong bg-panel text-ink-2 hover:border-accent'
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
                ? 'border-accent bg-accent-solid text-white'
                : 'border-line-strong bg-panel text-ink-2 hover:border-accent'
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
                ? 'border-accent bg-accent-solid text-white'
                : 'border-line-strong bg-panel text-ink-2 hover:border-accent'
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
          <div className="flex flex-col gap-2.5 rounded-xl border border-line bg-panel p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs font-bold text-ink">
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
                      ? 'border-accent bg-accent-solid text-white'
                      : 'border-line-strong bg-surface text-ink-2 hover:border-accent'
                  }`}
                >
                  <MathText text={pat.label} />
                </button>
              ))}
            </div>
          </div>

          {/* 4 Golden Rules of Tabular DI Banner */}
          <div className="rounded-xl border border-accent/30 bg-accent-soft p-4 dark:border-accent/40">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-accent-deep">
              <ListChecks className="h-4 w-4 shrink-0" />
              <span>
                ۴ قانون طلایی روش جزء‌به‌جزء جدولی (Tabular DI Method) — چرا هرگز هم‌سطر ضرب نمی‌کنیم؟
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2.5 text-xs leading-6 text-ink-2 md:grid-cols-2">
              <div className="rounded-lg border border-accent-line bg-surface/90 p-2.5 dark:bg-ink-solid/90">
                <strong className="font-bold text-accent">
                  قانون ۱ (انتخاب ستون‌ها با LIATE):{' '}
                </strong>
                <MathText text="در سطر اول، تابع $u$ (معمولاً چندجمله‌ای $x^k$) را در ستون $D$ (مشتق‌گیری متوالی) و تابع $dv$ (مثلثاتی یا نمایی) را در ستون $I$ (انتگرال‌گیری متوالی) قرار می‌دهیم." />
              </div>
              <div className="rounded-lg border border-accent-line bg-surface/90 p-2.5 dark:bg-ink-solid/90">
                <strong className="font-bold text-ok">
                  <MathText text="قانون ۲ (ضرب قُطری $D_k \searrow I_{k+1}$): " />
                </strong>
                <MathText text="هر عنصر در سطر $k$ ستون $D$ (با علامت متناوب $+,-,+,-$) همیشه به صورت **قُطری ($\searrow$)** در **سطر بعدی ($k+1$)** از ستون $I$ ضرب می‌شود؛ هرگز دو عنصر هم‌سطر را خارج از انتگرال ضرب نکنید!" />
              </div>
              <div className="rounded-lg border border-accent-line bg-surface/90 p-2.5 dark:bg-ink-solid/90">
                <strong className="font-bold text-warn">
                  <MathText text="قانون ۳ (چرا $I_1$ در سطر اول ضرب نمی‌شود؟): " />
                </strong>
                <MathText text="چون در فرمول $\int u\,dv = u\cdot v - \int v\,du$، جمله اول $u\cdot v$ است نه $u\cdot dv$! عبارت سطر اول ستون $I$ خودِ $dv$ است و انتگرال آن یعنی $v$ در **سطر دوم ستون $I$ ($I_2$)** قرار دارد." />
              </div>
              <div className="rounded-lg border border-accent-line bg-surface/90 p-2.5 dark:bg-ink-solid/90">
                <strong className="font-bold text-accent">
                  <MathText text="قانون ۴ (قانون توقف افقی $\longleftarrow$ در سطر آخر): " />
                </strong>
                <MathText text="در آخرین سطر جدول، دو عنصر هم‌سطر را به صورت **افقی ($\longleftarrow$)** در هم ضرب کرده و **داخل علامت انتگرال** ($\pm\int D_{\text{last}}\cdot I_{\text{last}}\,dx$) می‌گذاریم. اگر $D_{\text{last}}=0$ باشد، انتگرال صفر شده و تمام می‌شود!" />
              </div>
            </div>
          </div>

          {/* Interactive Step Filter Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-panel px-3.5 py-2.5">
            <span className="text-xs font-bold text-ink">
              ردیاب مرحله‌به‌مرحله قطرهای جدول (روی هر قطر کلیک کنید تا مسیر ضرب آن هایلایت شود):
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedDiagStep('all')}
                className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
                  selectedDiagStep === 'all'
                    ? 'border-accent bg-accent-solid text-white'
                    : 'border-line-strong bg-surface text-ink-2 hover:border-accent'
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
                      ? 'border-accent bg-accent-solid text-white'
                      : 'border-line-strong bg-surface text-ink-2 hover:border-accent'
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
                    ? 'border-accent bg-accent-solid text-white'
                    : 'border-line-strong bg-surface text-ink-2 hover:border-accent'
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
            <div className="space-y-3 rounded-xl border border-line bg-panel p-4 lg:col-span-7">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold text-ink">
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
                className="overflow-x-auto rounded-xl border border-line-strong bg-surface"
              >
                <table className="w-full border-collapse text-center text-xs">
                  <thead>
                    <tr className="border-b border-line-strong bg-muted text-ink">
                      <th className="px-2.5 py-2.5 font-bold" dir="rtl">
                        سطر
                      </th>
                      <th className="px-2.5 py-2.5 font-bold" dir="rtl">
                        علامت
                      </th>
                      <th
                        className="px-3 py-2.5 font-bold text-accent"
                        dir="rtl"
                      >
                        ستون D (مشتق متوالی u)
                      </th>
                      <th
                        className="px-2.5 py-2.5 font-bold text-ok"
                        dir="rtl"
                      >
                        مسیر ضرب قُطری (↘)
                      </th>
                      <th
                        className="px-3 py-2.5 font-bold text-warn"
                        dir="rtl"
                      >
                        ستون I (انتگرال متوالی dv)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
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
                          className="transition-colors hover:bg-panel"
                        >
                          {/* Row Number */}
                          <td
                            dir="rtl"
                            className="px-2.5 py-3 font-mono font-bold text-ink-3"
                          >
                            سطر {row.rowIndex}
                          </td>

                          {/* Alternating Sign */}
                          <td className="px-2.5 py-3">
                            <span
                              dir="ltr"
                              className={`inline-flex h-7 w-7 items-center justify-center rounded-full font-mono text-sm font-extrabold ${
                                row.sign === '+'
                                  ? 'border border-ok/40 bg-ok-soft text-ok'
                                  : 'border border-warn/40 bg-warn-soft text-warn'
                              }`}
                            >
                              {row.sign}1
                            </span>
                          </td>

                          {/* Column D Cell (Derivative) */}
                          <td
                            className={`px-3 py-3 transition-all ${
                              isDHighlighted
                                ? 'bg-accent-soft ring-2 ring-inset ring-accent'
                                : ''
                            }`}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <MathFormula
                                formula={`D_{${row.rowIndex}} = ${row.dLatex}`}
                              />
                              <span
                                dir="rtl"
                                className="text-[11px] font-medium text-ink-3"
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
                                    ? 'border-accent bg-accent-tint text-accent-deep'
                                    : 'border-line-strong bg-panel text-ink-4'
                                }`}
                              >
                                <span className="flex items-center gap-1">
                                  <MathFormula
                                    formula={`(${outgoingDiag.rowSign}D_{${outgoingDiag.fromRow}}) \\searrow I_{${outgoingDiag.toRow}}`}
                                  />
                                  <ArrowDownRight className="h-4 w-4 text-accent" />
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
                                    ? 'border-accent bg-accent-soft text-accent'
                                    : 'border-line-strong bg-panel text-ink-4'
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
                                ? 'bg-warn-soft/60 dark:bg-warn-soft/20'
                                : isIHighlighted
                                ? 'bg-ok-soft ring-2 ring-inset ring-ok'
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
                                  className="inline-flex items-center gap-1 rounded bg-warn-tint px-2 py-0.5 text-[10px] font-bold text-warn-ink"
                                >
                                  <AlertCircle className="h-3 w-3 shrink-0" />
                                  {row.iRoleFa}
                                </span>
                              ) : (
                                <span
                                  dir="rtl"
                                  className="text-[11px] font-semibold text-ok"
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
              <div className="rounded-lg border border-warn/40 bg-warn-soft p-3 text-xs leading-6 text-warn-ink dark:border-warn/40">
                <strong className="font-bold">
                  نکته بسیار مهم (چرا سطر ۱ ستون I یعنی I₁ در هیچ قطری ضرب نمی‌شود؟):{' '}
                </strong>
                <span>{diModel.whyRowOneIDoesNotMultiplyFa}</span>
              </div>
            </div>

            {/* Right Column: Step-by-Step Diagonal Products & Final Result */}
            <div className="space-y-3 rounded-xl border border-line bg-panel p-4 lg:col-span-5">
              <div className="text-xs font-bold text-accent-deep">
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
                          ? 'border-accent bg-surface'
                          : 'border-line bg-surface/60 opacity-65 hover:opacity-100 dark:bg-ink-solid/50'
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between text-xs font-bold text-ink">
                        <span>
                          قطر {diag.stepNumber} (سطر {diag.fromRow} ستون D ↘ سطر{' '}
                          {diag.toRow} ستون I):
                        </span>
                        <MathFormula
                          formula={`(${diag.rowSign}D_{${diag.fromRow}}) \\times I_{${diag.toRow}}`}
                          highlight
                        />
                      </div>
                      <p className="mb-1.5 text-[11px] leading-5 text-ink-3">
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
                      ? 'border-accent bg-accent-soft'
                      : 'border-line bg-surface/60 opacity-65 hover:opacity-100 dark:bg-ink-solid/50'
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between text-xs font-bold text-accent">
                    <span>
                      قانون سطر آخر (ضرب افقی سطر {diModel.horizontalRemainder.rowIndex} زیر علامت انتگرال):
                    </span>
                    <MathFormula
                      formula={`${diModel.horizontalRemainder.rowSign}\\int D_{${diModel.horizontalRemainder.rowIndex}} \\cdot I_{${diModel.horizontalRemainder.rowIndex}}\\,dx`}
                    />
                  </div>
                  <p className="mb-1.5 text-[11px] leading-5 text-ink-3">
                    {diModel.horizontalRemainder.explanationFa}
                  </p>
                  <MathFormula
                    block
                    formula={diModel.horizontalRemainder.integralLatex}
                  />
                </div>
              </div>

              {/* Combined Final Indefinite & Definite Formulas */}
              <div className="space-y-2 border-t border-line pt-3">
                <div className="text-xs font-bold text-ok">
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
              <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-panel p-3 sm:col-span-5">
                <div className="mb-1 text-xs font-bold text-ink">
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
                    stroke="var(--chart-muted)"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={circleCx}
                    y1="15"
                    x2={circleCx}
                    y2="205"
                    stroke="var(--chart-muted)"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={circleCx}
                    cy={circleCy}
                    r={circleR}
                    fill="none"
                    stroke="var(--chart-axis)"
                    strokeWidth="2"
                  />
                  <line
                    x1={circleCx}
                    y1={circleCy}
                    x2={pointNPiX}
                    y2={pointNPiY}
                    stroke="var(--chart-accent)"
                    strokeWidth="3"
                  />
                  <circle
                    cx={pointNPiX}
                    cy={pointNPiY}
                    r="7"
                    fill="var(--chart-warn)"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                  <text
                    x={circleCx + circleR + 8}
                    y={circleCy - 6}
                    fontSize="11"
                    fill="var(--chart-accent)"
                    fontWeight="bold"
                  >
                    (1,0)
                  </text>
                  <text
                    x={circleCx - circleR - 36}
                    y={circleCy - 6}
                    fontSize="11"
                    fill="var(--chart-warn)"
                    fontWeight="bold"
                  >
                    (-1,0)
                  </text>
                  <text
                    x={circleCx - 16}
                    y={circleCy - circleR - 8}
                    fontSize="10"
                    fill="var(--chart-axis)"
                  >
                    (0,1)
                  </text>
                  <text
                    x={circleCx - 18}
                    y={circleCy + circleR + 16}
                    fontSize="10"
                    fill="var(--chart-axis)"
                  >
                    (0,-1)
                  </text>
                </svg>
                <div className="mt-1 text-center text-[11px] font-semibold text-accent-deep">
                  {trigInfo.isEvenN
                    ? `چون n=${harmonicN} زوج است، زاویه ${harmonicN}π روی نقطه (+1, 0) می‌افتد`
                    : `چون n=${harmonicN} فرد است، زاویه ${harmonicN}π روی نقطه (-1, 0) می‌افتد`}
                </div>
              </div>

              {/* Wave Plot on [-pi, pi] */}
              <div className="flex flex-col justify-between rounded-xl border border-line bg-panel p-3 sm:col-span-7">
                <div className="mb-1 flex items-center justify-between text-xs font-bold text-ink">
                  <MathText text={`رفتار $\\cos(${harmonicN}x)$ و $\\sin(${harmonicN}x)$ در مرزهای $\\pm\\pi$`} />
                  <span className="rounded bg-accent-tint px-2 py-0.5 text-[11px] text-accent-deep">
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
                    stroke="var(--chart-muted)"
                    strokeWidth="1.2"
                  />
                  <line
                    x1={waveWidth / 2}
                    y1={padY}
                    x2={waveWidth / 2}
                    y2={waveHeight - padY}
                    stroke="var(--chart-axis)"
                    strokeDasharray="4 4"
                  />
                  <polyline
                    fill="none"
                    stroke="var(--chart-accent)"
                    strokeWidth="2.5"
                    points={cosPoints.join(' ')}
                  />
                  <polyline
                    fill="none"
                    stroke="var(--chart-warn)"
                    strokeWidth="2"
                    strokeDasharray="5 3"
                    points={sinPoints.join(' ')}
                  />
                  <circle
                    cx={toWaveX(-Math.PI)}
                    cy={toWaveY(trigInfo.cosNPi)}
                    r="5.5"
                    fill="var(--chart-accent)"
                  />
                  <circle
                    cx={toWaveX(Math.PI)}
                    cy={toWaveY(trigInfo.cosNPi)}
                    r="5.5"
                    fill="var(--chart-accent)"
                  />
                  <circle
                    cx={toWaveX(Math.PI)}
                    cy={toWaveY(0)}
                    r="4.5"
                    fill="var(--chart-warn)"
                  />
                  <text
                    x={padX - 8}
                    y={waveHeight - 6}
                    fontSize="11"
                    fill="var(--chart-axis)"
                  >
                    -π
                  </text>
                  <text
                    x={waveWidth / 2 - 4}
                    y={waveHeight - 6}
                    fontSize="11"
                    fill="var(--chart-axis)"
                  >
                    0
                  </text>
                  <text
                    x={waveWidth - padX - 8}
                    y={waveHeight - 6}
                    fontSize="11"
                    fill="var(--chart-axis)"
                  >
                    +π
                  </text>
                </svg>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink-3">
                  <span className="font-bold text-accent">
                    <MathText text={`━ خط آبی ممتد: $\\cos(${harmonicN}x)$ (زوج)`} />
                  </span>
                  <span className="font-bold text-warn">
                    <MathText text={`┅ خط نارنجی خط‌چین: $\\sin(${harmonicN}x)$ (فرد)`} />
                  </span>
                </div>
              </div>
            </div>

            {/* Golden Identities Reference Box */}
            <div className="rounded-xl border border-line bg-panel p-3.5">
              <div className="mb-1.5 text-xs font-bold text-ink">
                <MathText text="قانون طلایی تفکیک جملات زوج ($n=2k$) و فرد ($n=2k-1$) در سری فوریه:" />
              </div>
              <MathFormula
                block
                formula="1 - (-1)^n = \begin{cases} 0 & n = 2k \text{ (even)} \\ 2 & n = 2k-1 \text{ (odd)} \end{cases} \quad , \quad 1 + (-1)^n = \begin{cases} 2 & n = 2k \text{ (even)} \\ 0 & n = 2k-1 \text{ (odd)} \end{cases}"
              />
            </div>
          </div>

          {/* Controls & Live Exact Values */}
          <div className="space-y-4 rounded-xl border border-line bg-panel p-4 lg:col-span-5">
            <div>
              <label className="mb-2 flex items-center justify-between text-xs font-bold text-ink">
                <MathText text="انتخاب شماره هماهنگ صحیح ($n$):" />
                <span
                  dir="ltr"
                  className="rounded bg-accent-solid px-2.5 py-0.5 font-mono text-xs text-white"
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
                className="w-full accent-accent"
              />
              <div className="mt-2 grid grid-cols-8 gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setHarmonicN(val)}
                    className={`rounded border py-1 font-mono text-xs font-bold transition ${
                      harmonicN === val
                        ? 'border-accent bg-accent-solid text-white'
                        : 'border-line-strong bg-surface text-ink-2'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="text-xs font-bold text-ink">
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

            <p className="text-xs leading-6 text-ink-2">
              <MathText text="در انتگرال‌گیری ضرایب فوریه، هرگاه در حدود بالا و پایین به $\sin(n\pi)$ رسیدید مستقیماً عدد $0$ و هرگاه به $\cos(n\pi)$ رسیدید مستقیماً $(-1)^n$ قرار دهید (هرگز آن را به صورت $\cos(n\pi)$ رها نکنید)." />
            </p>
          </div>
        </div>
      )}

      {/* SUB-LAB 3: 2ND-ORDER ODE & HYPERBOLIC / EULER SIMULATOR */}
      {activeTab === 'ode_hyperbolic' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-6">
            <div className="rounded-xl border border-line bg-panel p-3.5">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-ink">
                <MathText text="نمودار رفتار جواب معادله $X''(x) + \lambda X(x) = 0$" />
                <span
                  dir="ltr"
                  className="rounded bg-accent-solid px-2 py-0.5 font-mono text-xs text-white"
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
                  stroke="var(--chart-muted)"
                  strokeWidth="1.5"
                />
                <polyline
                  fill="none"
                  stroke={
                    odeInfo.canSatisfyTwoPointZeroBC ? 'var(--chart-ok)' : 'var(--chart-warn)'
                  }
                  strokeWidth="3"
                  points={odePoints.join(' ')}
                />
                <circle
                  cx={padX}
                  cy={padY + plotH / 2}
                  r="5"
                  fill="var(--chart-accent)"
                />
                <circle
                  cx={waveWidth - padX}
                  cy={padY + plotH / 2}
                  r="5"
                  fill="var(--chart-accent)"
                />
                <text x={padX - 8} y={waveHeight - 6} fontSize="11" fill="var(--chart-axis)">
                  x = 0
                </text>
                <text
                  x={waveWidth - padX - 18}
                  y={waveHeight - 6}
                  fontSize="11"
                  fill="var(--chart-axis)"
                >
                  x = L
                </text>
              </svg>
              <div className="mt-2 flex items-center gap-2 text-xs font-bold">
                <CheckCircle2
                  className={`h-4 w-4 shrink-0 ${
                    odeInfo.canSatisfyTwoPointZeroBC
                      ? 'text-ok'
                      : 'text-warn'
                  }`}
                />
                <span className="text-ink-2">
                  {odeInfo.canSatisfyTwoPointZeroBC
                    ? 'جواب نوسانی است و می‌تواند در هر دو مرز x=0 و x=L صفر شود (تولید توابع ویژه)!'
                    : 'جواب غیرنوسانی است و نمی‌تواند هم‌زمان در دو مرز x=0 و x=L صفر شود (جواب بدیهی X=0).'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-line bg-panel p-4 lg:col-span-6">
            <div className="text-xs font-bold text-ink">
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
                      ? 'border-accent bg-accent-solid text-white'
                      : 'border-line-strong bg-surface text-ink-2'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-accent-deep">
                معادله مشخصه و ریشه‌ها:
              </div>
              <MathFormula block formula={odeInfo.rootsLatex} />
              <div className="text-xs font-bold text-accent-deep">
                فرم کلی جواب معادله دیفرانسیل:
              </div>
              <MathFormula block highlight formula={odeInfo.generalSolutionLatex} />
            </div>

            <p className="text-xs leading-6 text-ink-2">
              <MathText text={odeInfo.physicalMeaningFa} />
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
