'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  PresetFunctionId,
  computeFourierSeries,
  evaluatePresetFunction,
  evaluateFourierPartialSum,
  areOrthogonal,
  getAnalyticalFourierSeriesDetails,
  computeFourierConvergenceTrajectory,
} from '@/lib/math-engine';
import MathFormula, { MathText } from './MathFormula';
import {
  Activity,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Layers,
  Pause,
  Play,
  Sliders,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';

interface FourierInteractiveStageProps {
  mode: 'symmetry_orthogonality' | 'fourier_series';
}

const PRESET_OPTIONS: {
  id: PresetFunctionId;
  labelFa: string;
  formulaDesc: string;
  symmetryBadge: string;
}[] = [
  {
    id: 'square',
    labelFa: '۱. موج مربعی متناوب (مثال ۱۲ جزوه - تابع پله‌ای)',
    formulaDesc: 'f(x) = -1 (-ℓ < x < 0) , +1 (0 < x < ℓ)',
    symmetryBadge: 'تابع فرد (b_n ≠ 0, a_n = 0)',
  },
  {
    id: 'abs_x',
    labelFa: '۲. تابع قدرمطلق f(x) = |x| (مثال ۹ و ۱۶ جزوه)',
    formulaDesc: 'f(x) = |x|   (-ℓ ≤ x ≤ ℓ)',
    symmetryBadge: 'تابع زوج (a_n ≠ 0, b_n = 0)',
  },
  {
    id: 'sawtooth',
    labelFa: '۳. موج دندان‌اره‌ای f(x) = x/ℓ (مثال ۷ جزوه)',
    formulaDesc: 'f(x) = x / ℓ   (-ℓ < x < ℓ)',
    symmetryBadge: 'تابع فرد (سری سینوسی)',
  },
  {
    id: 'piecewise_pdf_ex6',
    labelFa: '۴. تابع دوضابطه‌ای مثال ۶ جزوه (صفحه ۲۳)',
    formulaDesc: 'f(x) = 0 (-ℓ ≤ x < 0) , (ℓ - x)/ℓ (0 ≤ x < ℓ)',
    symmetryBadge: 'نه زوج و نه فرد (سری کامل)',
  },
  {
    id: 'parabola',
    labelFa: '۵. سهمی متناوب f(x) = x² (استخراج ∑ 1/n² = π²/6 و ∑ 1/n⁴ = π⁴/90)',
    formulaDesc: 'f(x) = (πx / ℓ)²   (-ℓ ≤ x ≤ ℓ)',
    symmetryBadge: 'تابع زوج (سری کسینوسی)',
  },
  {
    id: 'x_plus_sin',
    labelFa: '۶. تابع ترکیبی f(x) = x + sin(x) (مثال ۸ جزوه)',
    formulaDesc: 'f(x) = (πx/ℓ) + sin(πx/ℓ)',
    symmetryBadge: 'تابع فرد + تعامد هارمونیک اول',
  },
  {
    id: 'half_rectified',
    labelFa: '۷. موج سینوسی نیم‌سوساز (کاربرد مهندسی برق)',
    formulaDesc: 'f(x) = 0 (-ℓ ≤ x < 0) , sin(πx/ℓ) (0 ≤ x ≤ ℓ)',
    symmetryBadge: 'نه زوج و نه فرد (حالت خاص n=1)',
  },
  {
    id: 'triangle',
    labelFa: '۸. موج مثلثی متقارن f(x) = 1 - |x|/ℓ',
    formulaDesc: 'f(x) = 1 - |x|/ℓ   (-ℓ ≤ x ≤ ℓ)',
    symmetryBadge: 'تابع زوج و پیوسته (همگرایی 1/n²)',
  },
];

const ORTHOGONAL_BASIS_OPTIONS = [
  {
    id: 'sin1',
    label: 'sin(x)',
    fn: (x: number) => Math.sin(x),
  },
  {
    id: 'cos1',
    label: 'cos(x)',
    fn: (x: number) => Math.cos(x),
  },
  {
    id: 'sin2',
    label: 'sin(2x)',
    fn: (x: number) => Math.sin(2 * x),
  },
  {
    id: 'cos2',
    label: 'cos(2x)',
    fn: (x: number) => Math.cos(2 * x),
  },
  {
    id: 'p1_leg',
    label: 'x (چندجمله‌ای لژاندر P₁)',
    fn: (x: number) => x / Math.PI,
  },
  {
    id: 'p2_leg',
    label: '½(3(x/π)² - 1) (لژاندر P₂)',
    fn: (x: number) => 0.5 * (3 * (x / Math.PI) * (x / Math.PI) - 1),
  },
];

export default function FourierInteractiveStage({
  mode,
}: FourierInteractiveStageProps) {
  // Fourier Series state
  const [presetId, setPresetId] = useState<PresetFunctionId>('square');
  const [numHarmonicsN, setNumHarmonicsN] = useState<number>(7);
  const [halfPeriodL, setHalfPeriodL] = useState<number>(3.14);
  const [extensionMode, setExtensionMode] = useState<
    'full' | 'cosine_even' | 'sine_odd'
  >('full');
  const [showErrorCurve, setShowErrorCurve] = useState<boolean>(false);
  const [showHarmonicsOverlay, setShowHarmonicsOverlay] =
    useState<boolean>(true);

  // Interactive Recharts Convergence state
  const [probeRatio, setProbeRatio] = useState<number>(0.5); // x_0 = probeRatio * L in [-L, L]
  const [rechartsMetricMode, setRechartsMetricMode] = useState<
    'pointwise' | 'energy'
  >('pointwise');
  const [isAutoScrubbing, setIsAutoScrubbing] = useState<boolean>(false);

  useEffect(() => {
    if (!isAutoScrubbing) return;
    const timer = window.setInterval(() => {
      setNumHarmonicsN((prev) => (prev >= 35 ? 1 : prev + 1));
    }, 420);
    return () => window.clearInterval(timer);
  }, [isAutoScrubbing]);

  // Lesson 1 Orthogonality & Acoustics state
  const [funcIdxA, setFuncIdxA] = useState<number>(0);
  const [funcIdxB, setFuncIdxB] = useState<number>(1);
  const [instrumentPreset, setInstrumentPreset] = useState<'piano' | 'violin'>(
    'piano'
  );

  // Analytical details for selected preset
  const analyticalDetails = useMemo(
    () => getAnalyticalFourierSeriesDetails(presetId),
    [presetId]
  );

  // Precompute up to N=35 harmonics so scrubbing n=1..35 is instantaneous
  const maxCoeffs35 = useMemo(() => {
    return computeFourierSeries({
      presetId,
      halfPeriodL,
      numHarmonicsN: 35,
      mode: extensionMode,
    });
  }, [presetId, halfPeriodL, extensionMode]);

  // Compute Fourier Series and sample points for SVG plot
  const fourierData = useMemo(() => {
    const anSlice = maxCoeffs35.an.slice(0, numHarmonicsN);
    const bnSlice = maxCoeffs35.bn.slice(0, numHarmonicsN);
    let parsevalRHS = (maxCoeffs35.a0 * maxCoeffs35.a0) / 2;
    for (let i = 0; i < numHarmonicsN; i++) {
      const a = anSlice[i] ?? 0;
      const b = bnSlice[i] ?? 0;
      parsevalRHS += a * a + b * b;
    }

    const coeffs = {
      a0: maxCoeffs35.a0,
      an: anSlice,
      bn: bnSlice,
      parsevalLHS: maxCoeffs35.parsevalLHS,
      parsevalRHS,
    };

    const sampleCount = 260;
    const xMin = -2 * halfPeriodL;
    const xMax = 2 * halfPeriodL;
    const points: {
      x: number;
      exactY: number;
      approxY: number;
      errorY: number;
      h1Y: number;
      h2Y: number;
      h3Y: number;
    }[] = [];

    let maxAbsY = 1.5;
    for (let i = 0; i <= sampleCount; i++) {
      const x = xMin + (i / sampleCount) * (xMax - xMin);
      const exactY = evaluatePresetFunction(
        presetId,
        x,
        halfPeriodL,
        extensionMode
      );
      const approxY = evaluateFourierPartialSum(
        coeffs,
        x,
        halfPeriodL,
        numHarmonicsN
      );
      const errorY = exactY - approxY;

      const omega1 = Math.PI / halfPeriodL;
      const h1Y =
        (coeffs.an[0] ?? 0) * Math.cos(omega1 * x) +
        (coeffs.bn[0] ?? 0) * Math.sin(omega1 * x);
      const h2Y =
        (coeffs.an[1] ?? 0) * Math.cos(2 * omega1 * x) +
        (coeffs.bn[1] ?? 0) * Math.sin(2 * omega1 * x);
      const h3Y =
        (coeffs.an[2] ?? 0) * Math.cos(3 * omega1 * x) +
        (coeffs.bn[2] ?? 0) * Math.sin(3 * omega1 * x);

      maxAbsY = Math.max(maxAbsY, Math.abs(exactY), Math.abs(approxY));
      points.push({ x, exactY, approxY, errorY, h1Y, h2Y, h3Y });
    }

    return { coeffs, points, maxAbsY: maxAbsY * 1.15 };
  }, [maxCoeffs35, presetId, halfPeriodL, numHarmonicsN, extensionMode]);

  const probeX = Number((probeRatio * halfPeriodL).toFixed(3));

  // Term-by-term Recharts convergence trajectory (n = 0 .. 35)
  const convergenceTrajectory = useMemo(() => {
    return computeFourierConvergenceTrajectory({
      presetId,
      halfPeriodL,
      maxN: 35,
      probeX,
      mode: extensionMode,
      precomputedCoeffs: maxCoeffs35,
    });
  }, [presetId, halfPeriodL, probeX, extensionMode, maxCoeffs35]);

  // Spatial Recharts dataset on [-L, L] comparing f(x), S_1(x), S_3(x), and S_n(x)
  const spatialRechartsData = useMemo(() => {
    const sampleCount = 120;
    const rows: {
      x: number;
      exactY: number;
      s1Y: number;
      s3Y: number;
      snY: number;
      errorY: number;
    }[] = [];

    for (let i = 0; i <= sampleCount; i++) {
      const x = -halfPeriodL + (i / sampleCount) * (2 * halfPeriodL);
      const exactY = evaluatePresetFunction(
        presetId,
        x,
        halfPeriodL,
        extensionMode
      );
      const s1Y = evaluateFourierPartialSum(maxCoeffs35, x, halfPeriodL, 1);
      const s3Y = evaluateFourierPartialSum(maxCoeffs35, x, halfPeriodL, 3);
      const snY = evaluateFourierPartialSum(
        maxCoeffs35,
        x,
        halfPeriodL,
        numHarmonicsN
      );
      rows.push({
        x: Number(x.toFixed(2)),
        exactY: Number(exactY.toFixed(4)),
        s1Y: Number(s1Y.toFixed(4)),
        s3Y: Number(s3Y.toFixed(4)),
        snY: Number(snY.toFixed(4)),
        errorY: Number((exactY - snY).toFixed(4)),
      });
    }
    return rows;
  }, [presetId, halfPeriodL, extensionMode, maxCoeffs35, numHarmonicsN]);

  const activeTermStats =
    convergenceTrajectory.terms[numHarmonicsN] ||
    convergenceTrajectory.terms[convergenceTrajectory.terms.length - 1];


  // Compute Lesson 1 Orthogonality data
  const orthoData = useMemo(() => {
    const fA = ORTHOGONAL_BASIS_OPTIONS[funcIdxA].fn;
    const fB = ORTHOGONAL_BASIS_OPTIONS[funcIdxB].fn;
    const res = areOrthogonal(fA, fB, -Math.PI, Math.PI);

    const samples = 180;
    const curvePoints: { x: number; yA: number; yB: number; prod: number }[] =
      [];
    for (let i = 0; i <= samples; i++) {
      const x = -Math.PI + (i / samples) * (2 * Math.PI);
      const yA = fA(x);
      const yB = fB(x);
      curvePoints.push({ x, yA, yB, prod: yA * yB });
    }
    return { ...res, curvePoints };
  }, [funcIdxA, funcIdxB]);

  const activePresetMeta =
    PRESET_OPTIONS.find((p) => p.id === presetId) || PRESET_OPTIONS[0];

  // SVG Coordinate mapper (width 680, height 270)
  const svgWidth = 680;
  const svgHeight = 270;
  const mapX = (x: number, domainMax: number) =>
    ((x + domainMax) / (2 * domainMax)) * (svgWidth - 60) + 30;
  const mapY = (y: number, rangeMax: number) =>
    svgHeight / 2 - (y / rangeMax) * (svgHeight / 2 - 24);

  if (mode === 'symmetry_orthogonality') {
    const prodPath = orthoData.curvePoints
      .map(
        (pt, i) =>
          `${i === 0 ? 'M' : 'L'} ${mapX(pt.x, Math.PI).toFixed(1)} ${mapY(
            pt.prod,
            1.4
          ).toFixed(1)}`
      )
      .join(' ');
    const areaPath = `${prodPath} L ${mapX(Math.PI, Math.PI).toFixed(1)} ${(
      svgHeight / 2
    ).toFixed(1)} L ${mapX(-Math.PI, Math.PI).toFixed(1)} ${(
      svgHeight / 2
    ).toFixed(1)} Z`;

    return (
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Left/Top 7 Cols: Interactive Canvas Stage */}
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs lg:col-span-7">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">
                آزمایشگاه تعاملی ضرب داخلی، نُرم و تعامد توابع روی [-π, π]
              </h3>
              <p className="text-xs text-[#475569]">
                مساحت رنگ‌شده زیر نمودار حاصل‌ضرب f(x)·g(x) مقدار ضرب داخلی ⟨f, g⟩ را نشان می‌دهد
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold ${
                orthoData.orthogonal
                  ? 'bg-[#ECFDF5] text-[#059669]'
                  : 'bg-[#FEF3C7] text-[#B45309]'
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {orthoData.orthogonal
                ? '● متعامد (⟨f, g⟩ = 0)'
                : '▲ غیرمتعامد (⟨f, g⟩ ≠ 0)'}
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="h-64 w-full"
              role="img"
              aria-label="نمودار تعامد و ضرب داخلی دو تابع"
            >
              {/* Grid lines */}
              <line
                x1={30}
                y1={svgHeight / 2}
                x2={svgWidth - 30}
                y2={svgHeight / 2}
                stroke="#94A3B8"
                strokeWidth="1.2"
              />
              <line
                x1={svgWidth / 2}
                y1={16}
                x2={svgWidth / 2}
                y2={svgHeight - 16}
                stroke="#94A3B8"
                strokeWidth="1.2"
              />

              {/* Shaded integral area of f(x)*g(x) */}
              <path
                d={areaPath}
                fill={orthoData.orthogonal ? '#0284C7' : '#059669'}
                fillOpacity="0.18"
              />

              {/* Function f(x) */}
              <path
                d={orthoData.curvePoints
                  .map(
                    (pt, i) =>
                      `${i === 0 ? 'M' : 'L'} ${mapX(pt.x, Math.PI).toFixed(
                        1
                      )} ${mapY(pt.yA, 1.4).toFixed(1)}`
                  )
                  .join(' ')}
                fill="none"
                stroke="#0284C7"
                strokeWidth="2"
                strokeDasharray="5 3"
              />

              {/* Function g(x) */}
              <path
                d={orthoData.curvePoints
                  .map(
                    (pt, i) =>
                      `${i === 0 ? 'M' : 'L'} ${mapX(pt.x, Math.PI).toFixed(
                        1
                      )} ${mapY(pt.yB, 1.4).toFixed(1)}`
                  )
                  .join(' ')}
                fill="none"
                stroke="#D97706"
                strokeWidth="2"
                strokeDasharray="2 3"
              />

              {/* Product f(x)*g(x) */}
              <path
                d={prodPath}
                fill="none"
                stroke="#0F172A"
                strokeWidth="2.5"
              />

              {/* Axis labels */}
              <text
                x={35}
                y={svgHeight / 2 + 16}
                className="fill-[#475569] font-mono text-[11px]"
              >
                -π
              </text>
              <text
                x={svgWidth / 2 + 6}
                y={svgHeight / 2 + 16}
                className="fill-[#475569] font-mono text-[11px]"
              >
                0
              </text>
              <text
                x={svgWidth - 48}
                y={svgHeight / 2 + 16}
                className="fill-[#475569] font-mono text-[11px]"
              >
                +π
              </text>
            </svg>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#475569]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-4 bg-[#0284C7]" />
                تابع اول f(x)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-4 bg-[#D97706]" />
                تابع دوم g(x)
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-[#0F172A]">
                <span className="inline-block h-1 w-4 bg-[#0F172A]" />
                حاصل‌ضرب f(x)·g(x)
              </span>
            </div>
            <span dir="ltr" className="font-mono font-semibold text-[#0369A1]">
              ⟨f, g⟩ = {orthoData.innerProduct.toFixed(4)} | ‖f‖ ={' '}
              {orthoData.normF.toFixed(3)} | ‖g‖ = {orthoData.normG.toFixed(3)}
            </span>
          </div>
        </div>

        {/* Right/Bottom 5 Cols: Controls & Acoustic Harmonics Motivation */}
        <div className="space-y-4 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs lg:col-span-5">
          <h4 className="text-sm font-bold text-[#0F172A]">
            انتخاب توابع جهت آزمون تعامد و محاسبه نُرم
          </h4>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#334155]">
                تابع اول f(x):
              </label>
              <select
                value={funcIdxA}
                onChange={(e) => setFuncIdxA(Number(e.target.value))}
                className="w-full rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2 text-xs font-medium text-[#0F172A]"
              >
                {ORTHOGONAL_BASIS_OPTIONS.map((opt, idx) => (
                  <option key={opt.id} value={idx}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#334155]">
                تابع دوم g(x):
              </label>
              <select
                value={funcIdxB}
                onChange={(e) => setFuncIdxB(Number(e.target.value))}
                className="w-full rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2 text-xs font-medium text-[#0F172A]"
              >
                {ORTHOGONAL_BASIS_OPTIONS.map((opt, idx) => (
                  <option key={opt.id} value={idx}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <MathFormula
            formula={`\\langle f, g \\rangle = \\int_{-\\pi}^{\\pi} f(x)g(x)\\,dx = ${orthoData.innerProduct.toFixed(4)} \\quad , \\quad \\|f\\| = ${orthoData.normF.toFixed(3)} \\quad , \\quad \\|g\\| = ${orthoData.normG.toFixed(3)}`}
            block
            highlight
          />

          {/* Motivation from PDF Page 3: Piano vs Violin 440Hz Harmonics */}
          <div className="border-t border-[#E2E8F0] pt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F172A]">
                انگیزه فیزیکی (صفحه ۳ جزوه): طیف هماهنگ‌های ۴۴۰ هرتز
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setInstrumentPreset('piano')}
                  className={`rounded px-2.5 py-1 text-xs font-semibold ${
                    instrumentPreset === 'piano'
                      ? 'bg-[#0284C7] text-white'
                      : 'bg-[#F1F5F9] text-[#475569]'
                  }`}
                >
                  پیانو (Piano)
                </button>
                <button
                  type="button"
                  onClick={() => setInstrumentPreset('violin')}
                  className={`rounded px-2.5 py-1 text-xs font-semibold ${
                    instrumentPreset === 'violin'
                      ? 'bg-[#0284C7] text-white'
                      : 'bg-[#F1F5F9] text-[#475569]'
                  }`}
                >
                  ویولن (Violin)
                </button>
              </div>
            </div>
            <p className="mb-2.5 text-xs leading-relaxed text-[#475569]">
              {instrumentPreset === 'piano'
                ? 'در پیانو فرکانس پایه ۴۴۰ هرتز قوی‌ترین دامنه را دارد و هماهنگ‌های بالاتر به سرعت تضعیف می‌شوند.'
                : 'در ویولن هماهنگ‌های مرتبه دوم (۸۸۰ هرتز) و سوم (۱۳۲۰ هرتز) دامنه بزرگی دارند که طنین خاص ویولن را می‌سازد.'}
            </p>
            <div className="grid grid-cols-5 gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-center">
              {(instrumentPreset === 'piano'
                ? [100, 42, 18, 9, 4]
                : [85, 95, 68, 45, 25]
              ).map((amp, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="flex h-14 w-full items-end justify-center rounded bg-white p-1">
                    <div
                      className="w-4 rounded-t bg-[#0284C7] transition-all"
                      style={{ height: `${amp}%` }}
                    />
                  </div>
                  <span className="mt-1 font-mono text-[10px] font-semibold text-[#334155]">
                    {(i + 1) * 440}Hz
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fourier Series Interactive Stage (Module 2)
  const exactPath = fourierData.points
    .map(
      (pt, i) =>
        `${i === 0 ? 'M' : 'L'} ${mapX(pt.x, 2 * halfPeriodL).toFixed(
          1
        )} ${mapY(pt.exactY, fourierData.maxAbsY).toFixed(1)}`
    )
    .join(' ');

  const approxPath = fourierData.points
    .map(
      (pt, i) =>
        `${i === 0 ? 'M' : 'L'} ${mapX(pt.x, 2 * halfPeriodL).toFixed(
          1
        )} ${mapY(pt.approxY, fourierData.maxAbsY).toFixed(1)}`
    )
    .join(' ');

  const errorPath = fourierData.points
    .map(
      (pt, i) =>
        `${i === 0 ? 'M' : 'L'} ${mapX(pt.x, 2 * halfPeriodL).toFixed(
          1
        )} ${mapY(pt.errorY, fourierData.maxAbsY).toFixed(1)}`
    )
    .join(' ');

  const h1Path = fourierData.points
    .map(
      (pt, i) =>
        `${i === 0 ? 'M' : 'L'} ${mapX(pt.x, 2 * halfPeriodL).toFixed(
          1
        )} ${mapY(pt.h1Y, fourierData.maxAbsY).toFixed(1)}`
    )
    .join(' ');

  const h2Path = fourierData.points
    .map(
      (pt, i) =>
        `${i === 0 ? 'M' : 'L'} ${mapX(pt.x, 2 * halfPeriodL).toFixed(
          1
        )} ${mapY(pt.h2Y, fourierData.maxAbsY).toFixed(1)}`
    )
    .join(' ');

  const h3Path = fourierData.points
    .map(
      (pt, i) =>
        `${i === 0 ? 'M' : 'L'} ${mapX(pt.x, 2 * halfPeriodL).toFixed(
          1
        )} ${mapY(pt.h3Y, fourierData.maxAbsY).toFixed(1)}`
    )
    .join(' ');

  const energyRatio =
    fourierData.coeffs.parsevalLHS > 1e-8
      ? Math.min(
          100,
          (fourierData.coeffs.parsevalRHS / fourierData.coeffs.parsevalLHS) *
            100
        )
      : 100;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      {/* Left/Top 7 Cols: Live Partial Sum S_N(x) & Gibbs Error Plot */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs lg:col-span-7">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
              <Activity className="h-4 w-4 text-[#0284C7]" />
              شبیه‌ساز همگرایی مجموع جزئی سری فوریه S_N(x)، هارمونیک‌ها و پدیده گیبس
            </h3>
            <p className="text-xs text-[#475569]">
              {activePresetMeta.labelFa} — {activePresetMeta.symmetryBadge}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowHarmonicsOverlay((v) => !v)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                showHarmonicsOverlay
                  ? 'border-[#7C3AED] bg-[#F5F3FF] text-[#6D28D9]'
                  : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]'
              }`}
            >
              {showHarmonicsOverlay
                ? '● نمایش موج‌های هارمونیک (n=1,2,3)'
                : 'نمایش هارمونیک‌های پایه'}
            </button>

            <button
              type="button"
              onClick={() => setShowErrorCurve((v) => !v)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                showErrorCurve
                  ? 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]'
                  : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]'
              }`}
            >
              {showErrorCurve
                ? '● منحنی خطا E_N(x)'
                : 'منحنی خطا f(x)-S_N(x)'}
            </button>
          </div>
        </div>

        {/* SVG Waveform Plot */}
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="h-64 w-full"
            role="img"
            aria-label="نمودار همگرایی سری فوریه"
          >
            {/* Coordinate Axes */}
            <line
              x1={30}
              y1={svgHeight / 2}
              x2={svgWidth - 30}
              y2={svgHeight / 2}
              stroke="#94A3B8"
              strokeWidth="1.2"
            />
            <line
              x1={svgWidth / 2}
              y1={16}
              x2={svgWidth / 2}
              y2={svgHeight - 16}
              stroke="#94A3B8"
              strokeWidth="1.2"
            />

            {/* Period boundaries -L and +L */}
            <line
              x1={mapX(-halfPeriodL, 2 * halfPeriodL)}
              y1={20}
              x2={mapX(-halfPeriodL, 2 * halfPeriodL)}
              y2={svgHeight - 20}
              stroke="#CBD5E1"
              strokeDasharray="4 4"
            />
            <line
              x1={mapX(halfPeriodL, 2 * halfPeriodL)}
              y1={20}
              x2={mapX(halfPeriodL, 2 * halfPeriodL)}
              y2={svgHeight - 20}
              stroke="#CBD5E1"
              strokeDasharray="4 4"
            />

            {/* Optional Individual Harmonics H1, H2, H3 */}
            {showHarmonicsOverlay && (
              <>
                <path
                  d={h1Path}
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="1.3"
                  strokeOpacity="0.65"
                />
                <path
                  d={h2Path}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="1.2"
                  strokeOpacity="0.55"
                />
                <path
                  d={h3Path}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="1.2"
                  strokeOpacity="0.55"
                />
              </>
            )}

            {/* Exact Function f(x) */}
            <path
              d={exactPath}
              fill="none"
              stroke="#64748B"
              strokeWidth="2"
              strokeDasharray="5 4"
            />

            {/* Fourier Partial Sum S_N(x) */}
            <path
              d={approxPath}
              fill="none"
              stroke="#0284C7"
              strokeWidth="2.6"
            />

            {/* Optional Error Curve E_N(x) = f(x) - S_N(x) */}
            {showErrorCurve && (
              <path
                d={errorPath}
                fill="none"
                stroke="#DC2626"
                strokeWidth="1.8"
              />
            )}

            {/* Labels */}
            <text
              x={mapX(-halfPeriodL, 2 * halfPeriodL) - 10}
              y={svgHeight - 6}
              className="fill-[#475569] font-mono text-[11px]"
            >
              -ℓ
            </text>
            <text
              x={svgWidth / 2 + 5}
              y={svgHeight - 6}
              className="fill-[#475569] font-mono text-[11px]"
            >
              0
            </text>
            <text
              x={mapX(halfPeriodL, 2 * halfPeriodL) - 6}
              y={svgHeight - 6}
              className="fill-[#475569] font-mono text-[11px]"
            >
              +ℓ
            </text>
          </svg>
        </div>

        {/* Plot Legend */}
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#475569]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1 font-semibold text-[#0284C7]">
              <span className="inline-block h-1 w-4 rounded bg-[#0284C7]" />
              مجموع جزئی S_N(x)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-0.5 w-4 border-b border-dashed border-[#64748B]" />
              تابع اصلی f(x)
            </span>
            {showHarmonicsOverlay && (
              <>
                <span className="flex items-center gap-1 text-[#7C3AED]">
                  <span className="inline-block h-0.5 w-3 bg-[#8B5CF6]" />
                  هارمونیک اول (n=1)
                </span>
                <span className="flex items-center gap-1 text-[#059669]">
                  <span className="inline-block h-0.5 w-3 bg-[#10B981]" />
                  هارمونیک دوم (n=2)
                </span>
                <span className="flex items-center gap-1 text-[#D97706]">
                  <span className="inline-block h-0.5 w-3 bg-[#F59E0B]" />
                  هارمونیک سوم (n=3)
                </span>
              </>
            )}
          </div>
          <span className="font-mono text-[11px] text-[#64748B]">
            T = 2ℓ = {(2 * halfPeriodL).toFixed(2)}
          </span>
        </div>

        {/* Harmonic Spectrum & Parseval Energy Verification */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-[#0F172A]">
              <span className="flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-[#0284C7]" />
                مقادیر عددی ضرایب اول اویلر (a_n, b_n)
              </span>
              <span dir="ltr" className="font-mono text-[#0369A1]">
                a₀/2 = {(fourierData.coeffs.a0 / 2).toFixed(3)}
              </span>
            </div>
            <div
              dir="ltr"
              className="grid grid-cols-4 gap-1.5 font-mono text-[11px]"
            >
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="rounded border border-[#E2E8F0] bg-white px-2 py-1 text-center"
                >
                  <div className="font-bold text-[#334155]">n={idx + 1}</div>
                  <div className="text-[#0284C7]">
                    a:{(fourierData.coeffs.an[idx] ?? 0).toFixed(2)}
                  </div>
                  <div className="text-[#059669]">
                    b:{(fourierData.coeffs.bn[idx] ?? 0).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-[#0F172A]">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-[#059669]" />
                تحقق اتحاد پارسوال (انرژی سیگنال)
              </span>
              <span dir="ltr" className="font-mono text-[#059669]">
                {energyRatio.toFixed(1)}%
              </span>
            </div>
            <div className="my-1.5 h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
              <div
                className="h-full bg-[#059669] transition-all"
                style={{ width: `${energyRatio}%` }}
              />
            </div>
            <div
              dir="ltr"
              className="flex justify-between font-mono text-[11px] text-[#475569]"
            >
              <span>LHS: {fourierData.coeffs.parsevalLHS.toFixed(3)}</span>
              <span>
                RHS(N={numHarmonicsN}): {fourierData.coeffs.parsevalRHS.toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right/Bottom 5 Cols: Parameter Controls */}
      <div className="space-y-4 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs lg:col-span-5">
        <h4 className="text-sm font-bold text-[#0F172A]">
          پنل تنظیمات تابع و تعداد جملات سری فوریه
        </h4>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#334155]">
            ۱. انتخاب تابع نمونه از مثال‌های جزوه (۸ الگوی استاندارد):
          </label>
          <select
            value={presetId}
            onChange={(e) => setPresetId(e.target.value as PresetFunctionId)}
            className="w-full rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#0F172A]"
          >
            {PRESET_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.labelFa}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 flex items-center justify-between text-xs font-bold text-[#334155]">
            <span>۲. تعداد هماهنگ‌های سری (N):</span>
            <span className="font-mono text-sm font-bold text-[#0284C7]">
              N = {numHarmonicsN} جمله
            </span>
          </label>
          <input
            type="range"
            min={1}
            max={35}
            step={1}
            value={numHarmonicsN}
            onChange={(e) => setNumHarmonicsN(Number(e.target.value))}
            className="w-full accent-[#0284C7]"
          />
          <div className="flex justify-between font-mono text-[10px] text-[#64748B]">
            <span>N=1 (فرکانس پایه)</span>
            <span>N=15</span>
            <span>N=35 (همگرایی بالا)</span>
          </div>
        </div>

        <div>
          <label className="mb-1 flex items-center justify-between text-xs font-bold text-[#334155]">
            <span>۳. نصف دوره تناوب (ℓ در بازه [-ℓ, ℓ]):</span>
            <span dir="ltr" className="font-mono text-xs font-bold text-[#0284C7]">
              ℓ = {halfPeriodL.toFixed(2)} (T = {(2 * halfPeriodL).toFixed(2)})
            </span>
          </label>
          <input
            type="range"
            min={1}
            max={6.28}
            step={0.14}
            value={halfPeriodL}
            onChange={(e) => setHalfPeriodL(Number(e.target.value))}
            className="w-full accent-[#0284C7]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#334155]">
            ۴. نوع بسط سری فوریه (توسیع روی بازه):
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'full', label: 'سری کامل مثلثاتی' },
              { id: 'cosine_even', label: 'سری کسینوسی (زوج)' },
              { id: 'sine_odd', label: 'سری سینوسی (فرد)' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setExtensionMode(
                    item.id as 'full' | 'cosine_even' | 'sine_odd'
                  )
                }
                className={`rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                  extensionMode === item.id
                    ? 'border-[#0284C7] bg-[#0284C7] text-white'
                    : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
          <div className="mb-1 text-xs font-bold text-[#334155]">
            فرمول مجموع جزئی سری فوریه فعلی:
          </div>
          <MathFormula
            formula={`S_{${numHarmonicsN}}(x) = ${(
              fourierData.coeffs.a0 / 2
            ).toFixed(2)} + \\sum_{n=1}^{${numHarmonicsN}} \\left[ a_n \\cos\\left(\\frac{n\\pi x}{${halfPeriodL.toFixed(
              2
            )}}\\right) + b_n \\sin\\left(\\frac{n\\pi x}{${halfPeriodL.toFixed(2)}}\\right) \\right]`}
            block
          />
        </div>
      </div>

      {/* Dynamic Recharts Convergence Visualizer & Interactive n-Scrubber (lg:col-span-12) */}
      <div
        data-testid="recharts-convergence-sandbox"
        className="rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-xs lg:col-span-12"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#E0F2FE] px-2.5 py-0.5 text-xs font-bold text-[#0369A1]">
              <TrendingUp className="h-3.5 w-3.5" />
              تحلیلگر تعاملی همگرایی دنباله مجموع‌های جزئی (Recharts Convergence Sandbox)
            </span>
            <h4 className="mt-1 text-base font-extrabold text-[#0F172A]">
              <MathText text="کاوشگر پویای همگرایی $S_n(x)$ و دنباله $S_n(x_0)$ بر حسب افزایش تعداد جملات $n$" />
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setRechartsMetricMode('pointwise')}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                rechartsMetricMode === 'pointwise'
                  ? 'border-[#0284C7] bg-[#0284C7] text-white'
                  : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]'
              }`}
            >
              همگرایی نقطه‌ای Sₙ(x₀) به حد دیریکله
            </button>
            <button
              type="button"
              onClick={() => setRechartsMetricMode('energy')}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                rechartsMetricMode === 'energy'
                  ? 'border-[#059669] bg-[#059669] text-white'
                  : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]'
              }`}
            >
              همگرایی انرژی پارسوال و طیف دامنه |cₙ|
            </button>
          </div>
        </div>

        {/* Interactive Scrubber Bar for n and Probe Point x_0 */}
        <div className="mb-4 grid grid-cols-1 gap-4 rounded-xl border border-[#BAE6FD] bg-[#F0F9FF]/70 p-4 lg:grid-cols-12">
          {/* Term Count n Scrubber (7 cols) */}
          <div className="space-y-2 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="recharts-n-scrubber"
                className="flex items-center gap-1.5 text-xs font-extrabold text-[#0F172A]"
              >
                <Sliders className="h-3.5 w-3.5 text-[#0284C7]" />
                <span>اسکرابر تعاملی تعداد جملات سری (Scrub through n = 1 … 35):</span>
              </label>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAutoScrubbing(false);
                    setNumHarmonicsN((prev) => Math.max(1, prev - 1));
                  }}
                  className="inline-flex items-center gap-0.5 rounded-md border border-[#CBD5E1] bg-white px-2 py-1 text-xs font-bold text-[#334155] hover:bg-[#F1F5F9]"
                  title="کاهش یک جمله"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span>n-1</span>
                </button>

                <span
                  dir="ltr"
                  data-testid="scrubbed-n-badge"
                  className="rounded-md bg-[#0284C7] px-2.5 py-1 font-mono text-xs font-extrabold text-white"
                >
                  n = {numHarmonicsN}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setIsAutoScrubbing(false);
                    setNumHarmonicsN((prev) => Math.min(35, prev + 1));
                  }}
                  className="inline-flex items-center gap-0.5 rounded-md border border-[#CBD5E1] bg-white px-2 py-1 text-xs font-bold text-[#334155] hover:bg-[#F1F5F9]"
                  title="افزایش یک جمله"
                >
                  <span>n+1</span>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  data-testid="auto-scrub-toggle"
                  onClick={() => setIsAutoScrubbing((v) => !v)}
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold transition ${
                    isAutoScrubbing
                      ? 'bg-[#DC2626] text-white'
                      : 'border border-[#0284C7] bg-white text-[#0284C7] hover:bg-[#E0F2FE]'
                  }`}
                >
                  {isAutoScrubbing ? (
                    <>
                      <Pause className="h-3.5 w-3.5" />
                      <span>توقف</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      <span>پخش خودکار n</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <input
              id="recharts-n-scrubber"
              data-testid="recharts-n-scrubber"
              type="range"
              min={1}
              max={35}
              step={1}
              value={numHarmonicsN}
              onChange={(e) => {
                setIsAutoScrubbing(false);
                setNumHarmonicsN(Number(e.target.value));
              }}
              className="w-full accent-[#0284C7]"
            />

            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5">
              <span className="text-[11px] font-semibold text-[#475569]">
                پرش سریع به مرتبه هارمونیک:
              </span>
              <div dir="ltr" className="flex flex-wrap gap-1">
                {[1, 2, 3, 5, 9, 15, 25, 35].map((nVal) => (
                  <button
                    key={nVal}
                    type="button"
                    data-testid={`quick-n-${nVal}`}
                    onClick={() => {
                      setIsAutoScrubbing(false);
                      setNumHarmonicsN(nVal);
                    }}
                    className={`rounded px-2 py-0.5 font-mono text-[11px] font-bold transition ${
                      numHarmonicsN === nVal
                        ? 'bg-[#0284C7] text-white'
                        : 'border border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#E0F2FE]'
                    }`}
                  >
                    n={nVal}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Probe Point x_0 Selector (5 cols) */}
          <div className="space-y-2 border-t border-[#BAE6FD] pt-3 lg:col-span-5 lg:border-t-0 lg:border-r lg:pr-4 lg:pt-0">
            <div className="flex items-center justify-between">
              <label
                htmlFor="recharts-probe-x-slider"
                className="text-xs font-extrabold text-[#0F172A]"
              >
                نقطه کاوش همگرایی (x₀ در بازه [-ℓ, ℓ]):
              </label>
              <span
                dir="ltr"
                className="rounded bg-white px-2 py-0.5 font-mono text-xs font-bold text-[#0369A1] shadow-2xs"
              >
                x₀ = {probeX.toFixed(2)} ({(probeRatio * 100).toFixed(0)}% ℓ)
              </span>
            </div>

            <input
              id="recharts-probe-x-slider"
              data-testid="recharts-probe-x-slider"
              type="range"
              min={-1}
              max={1}
              step={0.02}
              value={probeRatio}
              onChange={(e) => setProbeRatio(Number(e.target.value))}
              className="w-full accent-[#0369A1]"
            />

            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="text-[11px] font-semibold text-[#475569]">
                نقاط کلیدی آزمون دیریکله:
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  { ratio: 0.5, label: 'x₀ = ℓ/2 (پیوسته)' },
                  { ratio: 0, label: 'x₀ = 0 (مبدأ/پرش)' },
                  { ratio: 0.08, label: 'x₀ ≈ 0.08ℓ (قله گیبس)' },
                  { ratio: 1, label: 'x₀ = ℓ (مرز تناوب)' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setProbeRatio(preset.ratio)}
                    className={`rounded px-2 py-0.5 text-[10px] font-bold transition ${
                      Math.abs(probeRatio - preset.ratio) < 0.015
                        ? 'bg-[#0369A1] text-white'
                        : 'border border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#E0F2FE]'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Two Side-by-Side Dynamic Recharts Visualizations */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Chart 1: Spatial Partial Sum Comparison S_1(x), S_3(x), S_n(x), and f(x) */}
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 lg:col-span-6">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-1">
              <span className="text-xs font-bold text-[#0F172A]">
                ۱. مقایسه نمودار تابع f(x) با مجموع‌های جزئی S₁(x)، S₃(x) و Sₙ(x)
              </span>
              <span
                dir="ltr"
                className="rounded bg-[#E0F2FE] px-2 py-0.5 font-mono text-[11px] font-bold text-[#0369A1]"
              >
                Active: S_{numHarmonicsN}(x)
              </span>
            </div>

            <div dir="ltr" className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={spatialRechartsData}
                  margin={{ top: 20, right: 16, left: -12, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={[-halfPeriodL, halfPeriodL]}
                    tick={{ fontSize: 11, fill: '#475569' }}
                    tickFormatter={(v) => Number(v).toFixed(1)}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#475569' }}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#CBD5E1',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    labelFormatter={(val) => `x = ${Number(val).toFixed(2)}`}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <ReferenceLine
                    x={probeX}
                    stroke="#0369A1"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    label={{
                      value: `x₀=${probeX.toFixed(2)}`,
                      position: 'top',
                      fill: '#0369A1',
                      fontSize: 10,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="exactY"
                    name="f(x) تابع دقیق"
                    stroke="#64748B"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="s1Y"
                    name="S₁(x) (n=1)"
                    stroke="#A855F7"
                    strokeWidth={1.3}
                    strokeOpacity={0.65}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="s3Y"
                    name="S₃(x) (n=3)"
                    stroke="#F59E0B"
                    strokeWidth={1.3}
                    strokeOpacity={0.7}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="snY"
                    name={`S_${numHarmonicsN}(x) (n=${numHarmonicsN})`}
                    stroke="#0284C7"
                    fill="#0284C7"
                    fillOpacity={0.1}
                    strokeWidth={2.6}
                    dot={false}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Convergence Trajectory as n Increases (n = 0 .. 35) */}
          <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 lg:col-span-6">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-1">
              <span className="text-xs font-bold text-[#0F172A]">
                {rechartsMetricMode === 'pointwise'
                  ? `۲. دنباله همگرایی Sₙ(x₀) بر حسب افزایش تعداد جملات n (در x₀ = ${probeX.toFixed(2)})`
                  : '۲. همگرایی انرژی پارسوال (%) و دامنه هارمونیک‌ها بر حسب افزایش n'}
              </span>
              <span className="text-[11px] font-semibold text-[#0369A1]">
                (روی هر نقطه n کلیک کنید)
              </span>
            </div>

            <div dir="ltr" className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {rechartsMetricMode === 'pointwise' ? (
                  <ComposedChart
                    data={convergenceTrajectory.terms}
                    margin={{ top: 10, right: 16, left: -12, bottom: 5 }}
                    onClick={(state) => {
                      if (
                        state &&
                        typeof state.activeLabel !== 'undefined' &&
                        Number(state.activeLabel) >= 1
                      ) {
                        setIsAutoScrubbing(false);
                        setNumHarmonicsN(Number(state.activeLabel));
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      dataKey="n"
                      tick={{ fontSize: 11, fill: '#475569' }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#475569' }}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#CBD5E1',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                      labelFormatter={(val) => `Harmonic n = ${val}`}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <ReferenceLine
                      y={convergenceTrajectory.dirichletTargetAtProbe}
                      stroke="#059669"
                      strokeWidth={2}
                      strokeDasharray="5 3"
                      label={{
                        value: `Dirichlet S(x₀)=${convergenceTrajectory.dirichletTargetAtProbe.toFixed(3)}`,
                        position: 'insideTopRight',
                        fill: '#059669',
                        fontSize: 10,
                      }}
                    />
                    <ReferenceLine
                      x={numHarmonicsN}
                      stroke="#DC2626"
                      strokeWidth={1.8}
                      strokeDasharray="3 3"
                    />
                    <Bar
                      dataKey="termContributionAtProbe"
                      name="سهم جمله n-ام در x₀"
                      fill="#93C5FD"
                      opacity={0.75}
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="partialSumAtProbe"
                      name="مجموع جزئی Sₙ(x₀)"
                      stroke="#0284C7"
                      strokeWidth={2.5}
                      dot={{ r: 2.5, fill: '#0284C7' }}
                      isAnimationActive={false}
                    />
                    {activeTermStats && (
                      <ReferenceDot
                        x={numHarmonicsN}
                        y={activeTermStats.partialSumAtProbe}
                        r={6}
                        fill="#DC2626"
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      />
                    )}
                  </ComposedChart>
                ) : (
                  <ComposedChart
                    data={convergenceTrajectory.terms}
                    margin={{ top: 10, right: 16, left: -12, bottom: 5 }}
                    onClick={(state) => {
                      if (
                        state &&
                        typeof state.activeLabel !== 'undefined' &&
                        Number(state.activeLabel) >= 1
                      ) {
                        setIsAutoScrubbing(false);
                        setNumHarmonicsN(Number(state.activeLabel));
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      dataKey="n"
                      tick={{ fontSize: 11, fill: '#475569' }}
                    />
                    <YAxis
                      yAxisId="left"
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: '#059669' }}
                      unit="%"
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 11, fill: '#6366F1' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#CBD5E1',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                      labelFormatter={(val) => `Harmonic n = ${val}`}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <ReferenceLine
                      yAxisId="left"
                      x={numHarmonicsN}
                      stroke="#DC2626"
                      strokeWidth={1.8}
                      strokeDasharray="3 3"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="harmonicAmplitude"
                      name="دامنه هارمونیک √(aₙ²+bₙ²)"
                      fill="#818CF8"
                      opacity={0.75}
                      isAnimationActive={false}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="energyRatioPercent"
                      name="درصد انرژی پارسوال (%)"
                      stroke="#059669"
                      fill="#10B981"
                      fillOpacity={0.18}
                      strokeWidth={2.5}
                      isAnimationActive={false}
                    />
                    {activeTermStats && (
                      <ReferenceDot
                        yAxisId="left"
                        x={numHarmonicsN}
                        y={activeTermStats.energyRatioPercent}
                        r={6}
                        fill="#DC2626"
                        stroke="#FFFFFF"
                        strokeWidth={2}
                      />
                    )}
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Live Convergence Metrics Readout Bar for Scrubbed n */}
        {activeTermStats && (
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="rounded-lg border border-[#BAE6FD] bg-[#F0F9FF] p-2.5">
              <div className="text-[11px] font-bold text-[#0369A1]">
                مقدار مجموع جزئی در n = {numHarmonicsN}
              </div>
              <div
                dir="ltr"
                className="mt-0.5 font-mono text-sm font-extrabold text-[#0F172A]"
              >
                S_{numHarmonicsN}({probeX.toFixed(2)}) ={' '}
                {activeTermStats.partialSumAtProbe.toFixed(4)}
              </div>
            </div>

            <div className="rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] p-2.5">
              <div className="text-[11px] font-bold text-[#047857]">
                مقدار حدی قضیه دیریکله S(x₀)
              </div>
              <div
                dir="ltr"
                className="mt-0.5 font-mono text-sm font-extrabold text-[#065F46]"
              >
                [f(x₀⁻)+f(x₀⁺)]/2 ={' '}
                {convergenceTrajectory.dirichletTargetAtProbe.toFixed(4)}
              </div>
            </div>

            <div className="rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-2.5">
              <div className="text-[11px] font-bold text-[#B45309]">
                خطای مطلق تقریب در نقطه x₀
              </div>
              <div
                dir="ltr"
                className="mt-0.5 font-mono text-sm font-extrabold text-[#92400E]"
              >
                |S_{numHarmonicsN}(x₀) - S(x₀)| ={' '}
                {activeTermStats.absErrorAtProbe.toFixed(4)}
              </div>
            </div>

            <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2.5">
              <div className="text-[11px] font-bold text-[#334155]">
                سهم جمله n={numHarmonicsN} و انرژی پارسوال
              </div>
              <div
                dir="ltr"
                className="mt-0.5 font-mono text-xs font-extrabold text-[#0F172A]"
              >
                T_{numHarmonicsN}(x₀)={activeTermStats.termContributionAtProbe.toFixed(3)}{' '}
                | E={activeTermStats.energyRatioPercent.toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Full-Width Analytical Derivation & Term-by-Term Series Expansion Workbench (lg:col-span-12) */}
      <div className="rounded-xl border border-[#BAE6FD] bg-white p-5 shadow-xs lg:col-span-12">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#E0F2FE] px-2.5 py-0.5 text-xs font-bold text-[#0369A1]">
              <BookOpen className="h-3.5 w-3.5" />
              بسط تحلیلی و تشریحی گام‌به‌گام تابع انتخاب‌شده
            </span>
            <h4 className="mt-1 text-base font-extrabold text-[#0F172A]">
              <MathText text={analyticalDetails.titleFa} />
            </h4>
          </div>
          <span className="rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] px-3 py-1 text-xs font-bold text-[#047857]">
            {analyticalDetails.symmetryTypeFa}
          </span>
        </div>

        {/* Row 1: Function Definition, Symmetry Explanation, and Explicit Expanded Terms */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="space-y-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 lg:col-span-12">
            <div className="text-xs font-bold text-[#0F172A]">
              <MathText text="۱. ضابطه ریاضی تابع و دلیل تقارن در بازه $[-\ell, \ell]$:" />
            </div>
            <MathFormula formula={analyticalDetails.functionDefinitionLatex} block />
            <p className="text-xs leading-relaxed text-[#334155]">
              <MathText text={analyticalDetails.symmetryReasonFa} />
            </p>
            <div className="rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-2.5 text-xs leading-relaxed text-[#92400E]">
              <strong>سرعت همگرایی ضرایب: </strong>
              <MathText text={analyticalDetails.decayOrderNoteFa} />
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-[#BAE6FD] bg-[#F0F9FF]/60 p-4 lg:col-span-12">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0369A1]">
              <Layers className="h-4 w-4" />
              ۲. فرم بسته سیگما و بسط صریح جمله‌به‌جمله (۴ تا ۵ هارمونیک اول):
            </div>
            <div>
              <div className="mb-1 text-[11px] font-semibold text-[#475569]">
                فرم فشرده سری فوریه (Closed-Form Sigma Notation):
              </div>
              <MathFormula
                formula={analyticalDetails.closedFormSeriesLatex}
                block
                highlight
              />
            </div>
            <div>
              <div className="mb-1 text-[11px] font-semibold text-[#475569]">
                بسط بازشده جملات متوالی (Term-by-Term Harmonic Expansion):
              </div>
              <MathFormula
                formula={analyticalDetails.expandedFirstTermsLatex}
                block
              />
            </div>
          </div>
        </div>

        {/* Row 2: Complete Unskipped Euler Coefficient Integrals (a_0, a_n, b_n) */}
        <div className="mt-4 space-y-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <div className="text-xs font-bold text-[#0F172A]">
            <MathText text="۳. محاسبه تحلیلی کامل ضرایب سه‌گانه اویلر ($a_0$، $a_n$ و $b_n$) بدون پرش از مراحل انتگرال‌گیری:" />
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="rounded-lg border border-[#E2E8F0] bg-white p-3">
              <span className="mb-1 inline-block rounded bg-[#E0F2FE] px-2 py-0.5 text-[11px] font-bold text-[#0369A1]">
                <MathText text="الف) محاسبه ضریب ثابت میانگین ($a_0$ و جمله ثابت $\frac{a_0}{2}$):" />
              </span>
              <MathFormula formula={analyticalDetails.a0DerivationLatex} block />
            </div>

            <div className="rounded-lg border border-[#E2E8F0] bg-white p-3">
              <span className="mb-1 inline-block rounded bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-bold text-[#047857]">
                <MathText text="ب) محاسبه ضریب کسینوسی ($a_n$ — بخش زوج تابع):" />
              </span>
              <MathFormula formula={analyticalDetails.anDerivationLatex} block />
            </div>

            <div className="rounded-lg border border-[#E2E8F0] bg-white p-3">
              <span className="mb-1 inline-block rounded bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-bold text-[#B45309]">
                <MathText text="ج) محاسبه ضریب سینوسی ($b_n$ — بخش فرد تابع):" />
              </span>
              <MathFormula formula={analyticalDetails.bnDerivationLatex} block />
            </div>
          </div>
        </div>

        {/* Row 3: Dirichlet Pointwise Convergence & Parseval Series Summation */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="space-y-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 lg:col-span-12">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A]">
              <Compass className="h-4 w-4 text-[#0284C7]" />
              ۴. بررسی قضیه همگرایی نقطه‌ای دیریکله در نقاط حساس و استخراج سری‌های عددی:
            </div>
            <div className="space-y-2.5">
              {analyticalDetails.dirichletConvergencePoints.map((pt, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-[#E2E8F0] bg-white p-3"
                >
                  <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0369A1]">
                      <MathText text={pt.pointLabelFa} />
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <MathFormula formula={pt.leftLimitLatex} />
                      <MathFormula formula={pt.rightLimitLatex} />
                      <MathFormula formula={pt.averageSumLatex} highlight />
                    </div>
                  </div>
                  <MathFormula formula={pt.resultingSeriesSumLatex} block />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5]/60 p-4 lg:col-span-12">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#065F46]">
              <Sparkles className="h-4 w-4 text-[#059669]" />
              ۵. استخراج مجموع سری توان دوم/چهارم با اتحاد پارسوال:
            </div>
            <p className="text-xs leading-relaxed text-[#047857]">
              <MathText text="با قرار دادن ضرایب $a_0, a_n, b_n$ این تابع در اتحاد پارسوال $\frac{1}{\ell}\int_{-\ell}^{\ell} |f(x)|^2 dx = \frac{a_0^2}{2} + \sum_{n=1}^{\infty}(a_n^2 + b_n^2)$ داریم:" />
            </p>
            <MathFormula
              formula={analyticalDetails.parsevalApplicationLatex}
              block
              highlight
            />
          </div>
        </div>
      </div>
    </div>
  );
}
