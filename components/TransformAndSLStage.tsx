'use client';

import React, { useState, useMemo } from 'react';
import {
  TransformPresetId,
  SturmLiouvilleCaseId,
  evaluateTransformPair,
  evaluatePartialFourierIntegral,
  solveSturmLiouvilleCase,
  computeSturmLiouvilleIntegratingFactorExample,
} from '@/lib/math-engine';
import MathFormula from './MathFormula';
import { Waves, Compass, Sparkles } from 'lucide-react';

interface TransformAndSLStageProps {
  mode: 'fourier_integral' | 'fourier_transform' | 'sturm_liouville';
}

const TRANSFORM_PRESETS: {
  id: TransformPresetId;
  labelFa: string;
  timeFormula: string;
  freqFormula: string;
}[] = [
  {
    id: 'rect_pulse',
    labelFa: 'پالس مستطیلی (مثال ۱۸ و ۲۴ جزوه)',
    timeFormula: 'f(x) = 1 (|x| < a) , 0 (|x| > a)',
    freqFormula: 'F(α) = 2 sin(aα) / α   ,   A(α) = 2 sin(aα) / (πα)',
  },
  {
    id: 'two_sided_exp',
    labelFa: 'نمایی دوطرفه متقارن (مثال ۲۵ جزوه)',
    timeFormula: 'f(x) = e^{-a|x|}   (a > 0)',
    freqFormula: 'F(α) = 2a / (a² + α²)   ,   A(α) = 2a / (π(a² + α²))',
  },
  {
    id: 'gaussian',
    labelFa: 'تابع گوسین (پاسخ هسته گرما - مثال ۳۳ جزوه)',
    timeFormula: 'f(x) = e^{-a x²}   (a > 0)',
    freqFormula: 'F(α) = √(π/a) e^{-α² / (4a)}',
  },
  {
    id: 'one_sided_exp',
    labelFa: 'نمایی یک‌طرفه علّی (مثال ۲۱ و ۲۶ جزوه)',
    timeFormula: 'f(x) = e^{-ax} u(x)   (x ≥ 0)',
    freqFormula: 'F(α) = 1 / (a + iα)   ⇒   |F(α)| = 1 / √(a² + α²)',
  },
  {
    id: 'triangle_pulse',
    labelFa: 'پالس مثلثی (کانولوشن دو پالس مستطیلی)',
    timeFormula: 'f(x) = 1 - |x|/a   (|x| < a)',
    freqFormula: 'F(α) = a [ sin(aα/2) / (aα/2) ]²',
  },
];

const SL_CASES: {
  id: SturmLiouvilleCaseId;
  labelFa: string;
  bcShort: string;
}[] = [
  {
    id: 'case_a_dirichlet',
    labelFa: 'حالت الف (دیریکله همگن - دو سر صفر)',
    bcShort: 'y(0) = 0 , y(L) = 0',
  },
  {
    id: 'case_b_neumann',
    labelFa: 'حالت ب (نیومن همگن - دو سر عایق)',
    bcShort: "y'(0) = 0 , y'(L) = 0",
  },
  {
    id: 'case_d_dirichlet_neumann',
    labelFa: 'حالت د (مختلط - ابتدا صفر، انتها عایق)',
    bcShort: "y(0) = 0 , y'(L) = 0",
  },
  {
    id: 'case_e_neumann_dirichlet',
    labelFa: 'حالت ه (مختلط - ابتدا عایق، انتها صفر)',
    bcShort: "y'(0) = 0 , y(L) = 0",
  },
  {
    id: 'case_c_periodic',
    labelFa: 'حالت ج (شرایط مرزی متناوب روی [-L, L])',
    bcShort: "y(-L)=y(L) , y'(-L)=y'(L)",
  },
];

export default function TransformAndSLStage({
  mode,
}: TransformAndSLStageProps) {
  // Fourier Integral & Transform states
  const [presetId, setPresetId] = useState<TransformPresetId>('rect_pulse');
  const [paramA, setParamA] = useState<number>(1.2);
  const [cutoffOmega, setCutoffOmega] = useState<number>(8);
  const [timeShift, setTimeShift] = useState<number>(0);
  const [freqShift, setFreqShift] = useState<number>(0);

  // Sturm-Liouville states
  const [slCaseId, setSlCaseId] =
    useState<SturmLiouvilleCaseId>('case_a_dirichlet');
  const [slLengthL, setSlLengthL] = useState<number>(3.14);
  const [slModeN, setSlModeN] = useState<number>(2);
  const [odeType, setOdeType] = useState<
    'euler' | 'legendre' | 'bessel' | 'constant'
  >('euler');

  const activeTransformMeta =
    TRANSFORM_PRESETS.find((p) => p.id === presetId) || TRANSFORM_PRESETS[0];

  // Compute Curves for Fourier Integral / Transform
  const transformPlotData = useMemo(() => {
    const samples = 160;
    const xDomain = 5;
    const alphaDomain = 10;

    const timePoints: { x: number; fx: number; approxInt: number }[] = [];
    const freqPoints: {
      alpha: number;
      mag: number;
      real: number;
      imag: number;
    }[] = [];

    for (let i = 0; i <= samples; i++) {
      const x = -xDomain + (i / samples) * (2 * xDomain);
      const pairX = evaluateTransformPair(
        presetId,
        x,
        paramA,
        timeShift,
        freqShift
      );
      const approxInt =
        mode === 'fourier_integral'
          ? evaluatePartialFourierIntegral(presetId, x, paramA, cutoffOmega)
          : pairX.fx;

      timePoints.push({ x, fx: pairX.fx, approxInt });

      const alpha = -alphaDomain + (i / samples) * (2 * alphaDomain);
      const pairAlpha = evaluateTransformPair(
        presetId,
        alpha,
        paramA,
        timeShift,
        freqShift
      );
      freqPoints.push({
        alpha,
        mag: pairAlpha.absFAlpha,
        real: pairAlpha.realFAlpha,
        imag: pairAlpha.imagFAlpha,
      });
    }

    return { timePoints, freqPoints };
  }, [presetId, paramA, cutoffOmega, timeShift, freqShift, mode]);

  // Compute Sturm-Liouville Eigenfunction curve
  const slData = useMemo(() => {
    const eigenpair = solveSturmLiouvilleCase(slCaseId, slLengthL, slModeN);
    const companionPair = solveSturmLiouvilleCase(
      slCaseId,
      slLengthL,
      slModeN + 1
    );
    const samples = 160;
    const xStart = slCaseId === 'case_c_periodic' ? -slLengthL : 0;
    const xEnd = slLengthL;

    const points: { x: number; yMain: number; yNext: number }[] = [];
    for (let i = 0; i <= samples; i++) {
      const x = xStart + (i / samples) * (xEnd - xStart);
      points.push({
        x,
        yMain: eigenpair.evaluateEigenfunction(x),
        yNext: companionPair.evaluateEigenfunction(x),
      });
    }

    const integratingFactorInfo =
      computeSturmLiouvilleIntegratingFactorExample(odeType);
    return { eigenpair, companionPair, points, xStart, xEnd, integratingFactorInfo };
  }, [slCaseId, slLengthL, slModeN, odeType]);

  const svgWidth = 680;
  const svgHeight = 250;

  if (mode === 'sturm_liouville') {
    const mapSLX = (x: number) =>
      ((x - slData.xStart) / (slData.xEnd - slData.xStart)) * (svgWidth - 70) +
      35;
    const mapSLY = (y: number) =>
      svgHeight / 2 - (y / 1.35) * (svgHeight / 2 - 22);

    const mainPath = slData.points
      .map(
        (pt, i) =>
          `${i === 0 ? 'M' : 'L'} ${mapSLX(pt.x).toFixed(1)} ${mapSLY(
            pt.yMain
          ).toFixed(1)}`
      )
      .join(' ');

    const nextPath = slData.points
      .map(
        (pt, i) =>
          `${i === 0 ? 'M' : 'L'} ${mapSLX(pt.x).toFixed(1)} ${mapSLY(
            pt.yNext
          ).toFixed(1)}`
      )
      .join(' ');

    return (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left/Top 7 Cols: Eigenfunctions Visualizer */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs lg:col-span-7">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
                <Compass className="h-4 w-4 text-[#0284C7]" />
                آزمایشگاه توابع ویژه y_n(x) و مقادیر ویژه λ_n اشتورم-لیوویل
              </h3>
              <p className="text-xs text-[#475569]">
                {slData.eigenpair.boundaryDescriptionFa}
              </p>
            </div>
            <span
              dir="ltr"
              className="rounded-md bg-[#F0F9FF] px-3 py-1 font-mono text-xs font-bold text-[#0369A1]"
            >
              λ_{slModeN} = {slData.eigenpair.eigenvalueLambda.toFixed(3)}
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="h-60 w-full"
              role="img"
              aria-label="نمودار توابع ویژه اشتورم-لیوویل"
            >
              {/* Zero horizontal axis */}
              <line
                x1={35}
                y1={svgHeight / 2}
                x2={svgWidth - 35}
                y2={svgHeight / 2}
                stroke="#94A3B8"
                strokeWidth="1.2"
              />
              {/* Boundary vertical markers */}
              <line
                x1={35}
                y1={20}
                x2={35}
                y2={svgHeight - 20}
                stroke="#0F172A"
                strokeWidth="2"
              />
              <line
                x1={svgWidth - 35}
                y1={20}
                x2={svgWidth - 35}
                y2={svgHeight - 20}
                stroke="#0F172A"
                strokeWidth="2"
              />

              {/* Companion mode n+1 for orthogonality comparison */}
              <path
                d={nextPath}
                fill="none"
                stroke="#94A3B8"
                strokeWidth="1.8"
                strokeDasharray="4 4"
              />

              {/* Active Eigenfunction y_n(x) */}
              <path
                d={mainPath}
                fill="none"
                stroke="#0284C7"
                strokeWidth="2.8"
              />

              {/* Endpoint labels */}
              <text
                x={30}
                y={svgHeight - 6}
                className="fill-[#0F172A] font-mono text-[11px] font-bold"
              >
                x={slData.xStart === 0 ? '0' : '-L'}
              </text>
              <text
                x={svgWidth - 52}
                y={svgHeight - 6}
                className="fill-[#0F172A] font-mono text-[11px] font-bold"
              >
                x=+L
              </text>
            </svg>
          </div>

          {/* Self-Adjoint Converter Interactive Box */}
          <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#0F172A]">
                مبدل معادله مرتبه دوم به فرم خودالحاقی اشتورم-لیوویل:
              </span>
              <div className="flex gap-1">
                {[
                  { id: 'euler', label: 'معادله اولر (مثال ۴۱)' },
                  { id: 'legendre', label: 'لژاندر' },
                  { id: 'bessel', label: 'بسل' },
                  { id: 'constant', label: 'ضرایب ثابت' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setOdeType(
                        item.id as 'euler' | 'legendre' | 'bessel' | 'constant'
                      )
                    }
                    className={`rounded px-2 py-1 text-[11px] font-semibold ${
                      odeType === item.id
                        ? 'bg-[#0284C7] text-white'
                        : 'bg-white text-[#475569]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded border border-[#E2E8F0] bg-white p-2.5">
                <span className="mb-1 block text-[11px] font-semibold text-[#64748B]">
                  معادله اولیه و عامل انتگرال‌ساز:
                </span>
                <MathFormula
                  formula={slData.integratingFactorInfo.odeLatex}
                  block={false}
                />
              </div>
              <div className="rounded border border-[#0284C7]/30 bg-[#F0F9FF] p-2.5">
                <span className="mb-1 block text-[11px] font-semibold text-[#0369A1]">
                  فرم خودالحاقی اشتورم-لیوویل و تابع وزن:
                </span>
                <MathFormula
                  formula={`${slData.integratingFactorInfo.slFormLatex} \\; , \\; ${slData.integratingFactorInfo.p_x}`}
                  block={false}
                  highlight
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right/Bottom 5 Cols: Sturm-Liouville Controls */}
        <div className="space-y-4 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs lg:col-span-5">
          <h4 className="text-sm font-bold text-[#0F172A]">
            تنظیمات شرایط مرزی (جدول ۴ صفحه ۱۱۳ جزوه)
          </h4>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#334155]">
              ۱. انتخاب یکی از ۵ حالت استاندارد شرایط مرزی:
            </label>
            <select
              value={slCaseId}
              onChange={(e) =>
                setSlCaseId(e.target.value as SturmLiouvilleCaseId)
              }
              className="w-full rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#0F172A]"
            >
              {SL_CASES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.labelFa} — [{c.bcShort}]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 flex justify-between text-xs font-bold text-[#334155]">
              <span>۲. شماره مد ویژه (n):</span>
              <span className="font-mono text-[#0284C7]">n = {slModeN}</span>
            </label>
            <input
              type="range"
              min={1}
              max={8}
              step={1}
              value={slModeN}
              onChange={(e) => setSlModeN(Number(e.target.value))}
              className="w-full accent-[#0284C7]"
            />
          </div>

          <div>
            <label className="mb-1 flex justify-between text-xs font-bold text-[#334155]">
              <span>۳. طول بازه (L):</span>
              <span dir="ltr" className="font-mono text-[#0284C7]">
                L = {slLengthL.toFixed(2)}
              </span>
            </label>
            <input
              type="range"
              min={1}
              max={6.28}
              step={0.14}
              value={slLengthL}
              onChange={(e) => setSlLengthL(Number(e.target.value))}
              className="w-full accent-[#0284C7]"
            />
          </div>

          <div className="space-y-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
            <div className="text-xs font-bold text-[#0F172A]">
              فرمول مقدار ویژه و تابع ویژه متناظر:
            </div>
            <MathFormula
              formula={slData.eigenpair.formulaLambdaLatex}
              block
              highlight
            />
            <MathFormula
              formula={slData.eigenpair.formulaEigenfunctionLatex}
              block
            />
            <p className="text-[11px] leading-relaxed text-[#475569]">
              منحنی نقطه‌چین خاکستری مد بعدی (n={slModeN + 1}) را نشان می‌دهد که بر مد فعلی در بازه [0, L] کاملاً متعامد است: ⟨y_{slModeN}, y_{slModeN + 1}⟩ = 0.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fourier Integral (Module 3) & Fourier Transform (Module 4)
  const mapTX = (x: number, dom: number) =>
    ((x + dom) / (2 * dom)) * (svgWidth - 60) + 30;
  const mapTY = (y: number, maxVal: number) =>
    svgHeight / 2 - (y / maxVal) * (svgHeight / 2 - 22);

  const timePath = transformPlotData.timePoints
    .map(
      (pt, i) =>
        `${i === 0 ? 'M' : 'L'} ${mapTX(pt.x, 5).toFixed(1)} ${mapTY(
          pt.fx,
          1.4
        ).toFixed(1)}`
    )
    .join(' ');

  const integralApproxPath = transformPlotData.timePoints
    .map(
      (pt, i) =>
        `${i === 0 ? 'M' : 'L'} ${mapTX(pt.x, 5).toFixed(1)} ${mapTY(
          pt.approxInt,
          1.4
        ).toFixed(1)}`
    )
    .join(' ');

  const freqMagPath = transformPlotData.freqPoints
    .map(
      (pt, i) =>
        `${i === 0 ? 'M' : 'L'} ${mapTX(pt.alpha, 10).toFixed(1)} ${mapTY(
          pt.mag,
          3.2
        ).toFixed(1)}`
    )
    .join(' ');

  const freqRealPath = transformPlotData.freqPoints
    .map(
      (pt, i) =>
        `${i === 0 ? 'M' : 'L'} ${mapTX(pt.alpha, 10).toFixed(1)} ${mapTY(
          pt.real,
          3.2
        ).toFixed(1)}`
    )
    .join(' ');

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      {/* Left/Top 7 Cols: Dual Domain Visualizer */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs lg:col-span-7">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
              <Waves className="h-4 w-4 text-[#0284C7]" />
              {mode === 'fourier_integral'
                ? 'شبیه‌ساز همگرایی انتگرال فوریه I_Ω(x) در حوزه مکان و طیف پیوسته'
                : 'آزمایشگاه زوج تبدیل فوریه f(x) ↔ F(α) و قضایای انتقال و مقیاس'}
            </h3>
            <p className="text-xs text-[#475569]">
              {activeTransformMeta.labelFa}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md bg-[#ECFDF5] px-2.5 py-1 text-xs font-bold text-[#059669]">
            <Sparkles className="h-3.5 w-3.5" />
            طیف پیوسته (-∞, ∞)
          </span>
        </div>

        {/* Plot 1: Time/Space Domain f(x) */}
        <div className="mb-3 overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] px-3 py-1.5 text-[11px] font-semibold text-[#334155]">
            <span>حوزه مکان / زمان f(x)</span>
            <span dir="ltr" className="font-mono text-[#0284C7]">
              {activeTransformMeta.timeFormula}
            </span>
          </div>
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="h-44 w-full"
            role="img"
            aria-label="نمودار تابع در حوزه مکان"
          >
            <line
              x1={30}
              y1={svgHeight / 2}
              x2={svgWidth - 30}
              y2={svgHeight / 2}
              stroke="#94A3B8"
            />
            <line
              x1={svgWidth / 2}
              y1={14}
              x2={svgWidth / 2}
              y2={svgHeight - 14}
              stroke="#94A3B8"
            />
            <path
              d={timePath}
              fill="none"
              stroke="#64748B"
              strokeWidth="2"
              strokeDasharray={mode === 'fourier_integral' ? '5 3' : undefined}
            />
            {mode === 'fourier_integral' && (
              <path
                d={integralApproxPath}
                fill="none"
                stroke="#0284C7"
                strokeWidth="2.4"
              />
            )}
          </svg>
        </div>

        {/* Plot 2: Frequency Domain F(alpha) */}
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] px-3 py-1.5 text-[11px] font-semibold text-[#334155]">
            <span>حوزه فرکانس: اندازه طیف |F(α)| و بخش حقیقی Re F(α)</span>
            <span dir="ltr" className="font-mono text-[#059669]">
              {activeTransformMeta.freqFormula}
            </span>
          </div>
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="h-44 w-full"
            role="img"
            aria-label="نمودار تبدیل فوریه در حوزه فرکانس"
          >
            <line
              x1={30}
              y1={svgHeight / 2}
              x2={svgWidth - 30}
              y2={svgHeight / 2}
              stroke="#94A3B8"
            />
            <line
              x1={svgWidth / 2}
              y1={14}
              x2={svgWidth / 2}
              y2={svgHeight - 14}
              stroke="#94A3B8"
            />
            <path
              d={freqRealPath}
              fill="none"
              stroke="#0284C7"
              strokeWidth="1.8"
              strokeDasharray="4 3"
            />
            <path
              d={freqMagPath}
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
            />
          </svg>
        </div>
      </div>

      {/* Right/Bottom 5 Cols: Transform Controls */}
      <div className="space-y-4 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs lg:col-span-5">
        <h4 className="text-sm font-bold text-[#0F172A]">
          کنترل پارامترهای انتگرال و تبدیل فوریه
        </h4>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#334155]">
            ۱. انتخاب تابع غیرمتناوب از جدول ۱ جزوه:
          </label>
          <select
            value={presetId}
            onChange={(e) => setPresetId(e.target.value as TransformPresetId)}
            className="w-full rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#0F172A]"
          >
            {TRANSFORM_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.labelFa}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 flex justify-between text-xs font-bold text-[#334155]">
            <span>۲. پارامتر پهنا / نرخ میرایی (a):</span>
            <span dir="ltr" className="font-mono text-[#0284C7]">
              a = {paramA.toFixed(1)}
            </span>
          </label>
          <input
            type="range"
            min={0.5}
            max={3.0}
            step={0.1}
            value={paramA}
            onChange={(e) => setParamA(Number(e.target.value))}
            className="w-full accent-[#0284C7]"
          />
          <p className="mt-1 text-[11px] text-[#64748B]">
            نکته مفهومی: فشرده‌تر شدن پالس در مکان (کاهش a) باعث پهن‌تر شدن طیف فرکانسی F(α) می‌شود (اصل عدم قطعیت فوریه).
          </p>
        </div>

        {mode === 'fourier_integral' ? (
          <div>
            <label className="mb-1 flex justify-between text-xs font-bold text-[#334155]">
              <span>۳. حد بالای انتگرال فوریه (فرکانس قطع Ω):</span>
              <span dir="ltr" className="font-mono text-[#0284C7]">
                Ω = {cutoffOmega} rad/s
              </span>
            </label>
            <input
              type="range"
              min={1}
              max={20}
              step={1}
              value={cutoffOmega}
              onChange={(e) => setCutoffOmega(Number(e.target.value))}
              className="w-full accent-[#0284C7]"
            />
            <MathFormula
              formula={`I_{${cutoffOmega}}(x) = \\int_{0}^{${cutoffOmega}} \\Big[ A(\\alpha)\\cos(\\alpha x) + B(\\alpha)\\sin(\\alpha x) \\Big]\\,d\\alpha`}
              block
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="mb-1 flex justify-between text-xs font-bold text-[#334155]">
                <span>۳. انتقال زمان در تابع ورودی:</span>
                <span dir="ltr" className="font-mono text-[#0284C7]">
                  x₀ = {timeShift.toFixed(1)}
                </span>
              </label>
              <input
                type="range"
                min={-2}
                max={2}
                step={0.2}
                value={timeShift}
                onChange={(e) => setTimeShift(Number(e.target.value))}
                className="w-full accent-[#0284C7]"
              />
            </div>

            <div>
              <label className="mb-1 flex justify-between text-xs font-bold text-[#334155]">
                <span>۴. انتقال فرکانس (مدولاسیون):</span>
                <span dir="ltr" className="font-mono text-[#059669]">
                  α₀ = {freqShift.toFixed(1)}
                </span>
              </label>
              <input
                type="range"
                min={-4}
                max={4}
                step={0.5}
                value={freqShift}
                onChange={(e) => setFreqShift(Number(e.target.value))}
                className="w-full accent-[#059669]"
              />
            </div>

            <MathFormula
              formula={`\\mathcal{F}\\Big[ e^{i(${freqShift})x} f(x - ${timeShift}) \\Big] = e^{-i(\\alpha - ${freqShift})(${timeShift})} F(\\alpha - ${freqShift})`}
              block
              highlight
            />
          </div>
        )}
      </div>
    </div>
  );
}
