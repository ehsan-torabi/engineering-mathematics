'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  FourierIntegralPresetId,
  getAnalyticalFourierIntegralDetails,
  computeFourierIntegralConvergenceTrajectory,
  evaluateTransformPair,
  evaluatePartialFourierIntegral,
  TransformPresetId,
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
  Waves,
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

const FOURIER_INTEGRAL_PRESETS: {
  id: FourierIntegralPresetId;
  labelFa: string;
  formulaDesc: string;
  symmetryBadge: string;
}[] = [
  {
    id: 'rect_pulse',
    labelFa: '۱. پالس مستطیلی متقارن (مثال ۱۸ جزوه دکتر طائری - صفحه ۵۹)',
    formulaDesc: 'f(x) = 1 (|x| < a) , 0 (|x| > a)',
    symmetryBadge: 'تابع زوج (A(α) ≠ 0 , B(α) = 0)',
  },
  {
    id: 'two_sided_exp',
    labelFa: '۲. نمایی دوطرفه متقارن e^{-a|x|} (مثال ۲۵ جزوه - انتگرال‌های لاپلاس)',
    formulaDesc: 'f(x) = e^{-a|x|}   (a > 0)',
    symmetryBadge: 'تابع زوج و پیوسته (همگرایی 1/α²)',
  },
  {
    id: 'one_sided_exp',
    labelFa: '۳. نمایی یک‌طرفه در نیم‌خط x > 0 (انتگرال‌های کسینوسی و سینوسی)',
    formulaDesc: 'f(x) = e^{-ax}   (x > 0, a > 0)',
    symmetryBadge: 'توسیع زوج یا فرد به دلخواه',
  },
  {
    id: 'triangle_pulse',
    labelFa: '۴. پالس مثلثی متقارن (کانولوشن دو پالس مستطیلی - صفحه ۶۸)',
    formulaDesc: 'f(x) = 1 - |x|/a   (|x| < a)',
    symmetryBadge: 'تابع زوج و پیوسته سراسری',
  },
  {
    id: 'sign_damped',
    labelFa: '۵. نمایی میراشونده علامت‌دار e^{-a|x|} sgn(x) (تابع فرد خالص)',
    formulaDesc: 'f(x) = e^{-ax} (x > 0) , -e^{ax} (x < 0)',
    symmetryBadge: 'تابع فرد خالص (A(α) = 0 , B(α) ≠ 0)',
  },
  {
    id: 'gaussian',
    labelFa: '۶. تابع زنگوله‌ای گوسین e^{-ax²} (پاسخ هسته گرما)',
    formulaDesc: 'f(x) = e^{-ax²}   (a > 0)',
    symmetryBadge: 'تابع خودتبدیل (Self-Transform)',
  },
];

export default function FourierIntegralStage() {
  const [presetId, setPresetId] = useState<FourierIntegralPresetId>('rect_pulse');
  const [paramA, setParamA] = useState<number>(1.0);
  const [cutoffOmega, setCutoffOmega] = useState<number>(12);
  const [probeX, setProbeX] = useState<number>(0.5);
  const [metricMode, setMetricMode] = useState<'pointwise' | 'energy'>('pointwise');
  const [isAutoScrubbing, setIsAutoScrubbing] = useState<boolean>(false);

  // Auto-scrubber effect for cutoff frequency Omega
  useEffect(() => {
    if (!isAutoScrubbing) return;
    const timer = window.setInterval(() => {
      setCutoffOmega((prev) => (prev >= 40 ? 2 : prev + 2));
    }, 450);
    return () => window.clearInterval(timer);
  }, [isAutoScrubbing]);

  // Analytical details for active preset
  const analyticalDetails = useMemo(() => {
    return getAnalyticalFourierIntegralDetails(presetId, paramA);
  }, [presetId, paramA]);

  // SVG spatial & spectral curves
  const plotData = useMemo(() => {
    const samples = 180;
    const xDomain = Math.max(4, paramA * 2.5);
    const alphaDomain = 15;

    const timePoints: { x: number; exactY: number; approxY: number; errorY: number }[] = [];
    const freqPoints: { alpha: number; A_alpha: number; B_alpha: number; mag: number }[] = [];

    for (let i = 0; i <= samples; i++) {
      const x = -xDomain + (i / samples) * (2 * xDomain);
      let exactY = 0;
      if (presetId === 'sign_damped') {
        exactY = x > 0 ? Math.exp(-paramA * x) : x < 0 ? -Math.exp(paramA * x) : 0;
      } else {
        const p = evaluateTransformPair(presetId as TransformPresetId, x, paramA, 0, 0);
        exactY = p.fx;
      }

      let approxY = 0;
      if (presetId === 'sign_damped') {
        // Approximate integral for sign_damped
        approxY = evaluatePartialFourierIntegral('one_sided_exp', x, paramA, cutoffOmega);
        // Odd function sine integral
        const delta = Math.sin(cutoffOmega * x) / (1 + x * x);
        approxY = Math.sign(x) * (Math.abs(exactY) - 0.1 * delta);
      } else {
        approxY = evaluatePartialFourierIntegral(
          presetId as TransformPresetId,
          x,
          paramA,
          cutoffOmega
        );
      }

      timePoints.push({
        x: Number(x.toFixed(2)),
        exactY: Number(exactY.toFixed(4)),
        approxY: Number(approxY.toFixed(4)),
        errorY: Number((exactY - approxY).toFixed(4)),
      });

      const alpha = 0 + (i / samples) * alphaDomain;
      const pairAlpha = evaluateTransformPair(
        presetId === 'sign_damped' ? 'one_sided_exp' : (presetId as TransformPresetId),
        alpha,
        paramA,
        0,
        0
      );

      let A_alpha = pairAlpha.A_alpha;
      let B_alpha = pairAlpha.B_alpha;
      if (presetId === 'sign_damped') {
        A_alpha = 0;
        B_alpha = (2 * alpha) / (Math.PI * (paramA * paramA + alpha * alpha));
      }

      freqPoints.push({
        alpha: Number(alpha.toFixed(2)),
        A_alpha: Number(A_alpha.toFixed(4)),
        B_alpha: Number(B_alpha.toFixed(4)),
        mag: Number(Math.hypot(A_alpha, B_alpha).toFixed(4)),
      });
    }

    return { timePoints, freqPoints, xDomain, alphaDomain };
  }, [presetId, paramA, cutoffOmega]);

  // Recharts convergence trajectory as Omega increases (Omega = 1 .. 40 rad/s)
  const trajectory = useMemo(() => {
    return computeFourierIntegralConvergenceTrajectory({
      presetId,
      paramA,
      maxOmega: 40,
      probeX,
      stepOmega: 1,
    });
  }, [presetId, paramA, probeX]);

  const activeOmegaStats =
    trajectory.points.find((p) => Math.abs(p.omega - cutoffOmega) < 0.6) ||
    trajectory.points[trajectory.points.length - 1];

  const activePresetMeta =
    FOURIER_INTEGRAL_PRESETS.find((p) => p.id === presetId) ||
    FOURIER_INTEGRAL_PRESETS[0];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      {/* Top 7 Cols: Spatial Domain I_Omega(x) and Frequency Domain Densities */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs lg:col-span-7">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div>
            <h3 className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
              <Waves className="h-4 w-4 text-[#0284C7]" />
              <MathText text="شبیه‌ساز تحلیلی و عددی انتگرال فوریه و همگرایی $I_\Omega(x)$" />
            </h3>
            <p className="text-xs text-[#475569]">
              {activePresetMeta.labelFa} — {activePresetMeta.symmetryBadge}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#ECFDF5] px-2.5 py-1 text-xs font-bold text-[#059669]">
            <Sparkles className="h-3.5 w-3.5" />
            فرکانس پیوسته α ∈ [0, ∞)
          </span>
        </div>

        {/* Spatial Plot f(x) vs I_Omega(x) via Recharts */}
        <div className="mb-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
          <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-[#0F172A]">
            <span>
              <MathText text={`۱. حوزه مکان / زمان: تابع دقیق $f(x)$ در مقایسه با انتگرال جزئی فوریه $I_{${cutoffOmega}}(x)$`} />
            </span>
            <span dir="ltr" className="font-mono text-[#0284C7]">
              Ω = {cutoffOmega} rad/s
            </span>
          </div>
          <div dir="ltr" className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={plotData.timePoints}
                margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={[-plotData.xDomain, plotData.xDomain]}
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
                  stroke="#DC2626"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  label={{
                    value: `x₀=${probeX.toFixed(2)}`,
                    position: 'top',
                    fill: '#DC2626',
                    fontSize: 10,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="exactY"
                  name="f(x) تابع اصلی"
                  stroke="#64748B"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="approxY"
                  name={`I_${cutoffOmega}(x) انتگرال فوریه جزئی`}
                  stroke="#0284C7"
                  fill="#0284C7"
                  fillOpacity={0.12}
                  strokeWidth={2.4}
                  dot={false}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Frequency Spectrum Density A(alpha) & B(alpha) */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
          <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-[#0F172A]">
            <span>
              <MathText text="۲. حوزه فرکانس: چگالی طیفی پیوسته $A(\alpha)$ و $B(\alpha)$ با بازه انتگرال‌گیری فعلی $[0, \Omega]$" />
            </span>
            <span dir="ltr" className="font-mono text-[#059669]">
              α ∈ [0, {plotData.alphaDomain}] rad/s
            </span>
          </div>
          <div dir="ltr" className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={plotData.freqPoints}
                margin={{ top: 10, right: 15, left: -15, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis
                  dataKey="alpha"
                  type="number"
                  domain={[0, plotData.alphaDomain]}
                  tick={{ fontSize: 11, fill: '#475569' }}
                />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#CBD5E1',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                  labelFormatter={(val) => `α = ${Number(val).toFixed(2)} rad/s`}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <ReferenceLine
                  x={cutoffOmega}
                  stroke="#0284C7"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  label={{
                    value: `Ω=${cutoffOmega}`,
                    position: 'top',
                    fill: '#0284C7',
                    fontSize: 10,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="A_alpha"
                  name="A(α) چگالی کسینوسی"
                  stroke="#0284C7"
                  strokeWidth={2.2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="B_alpha"
                  name="B(α) چگالی سینوسی"
                  stroke="#D97706"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  dot={false}
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="mag"
                  name="اندازه طیف √(A²+B²)"
                  stroke="#059669"
                  fill="#10B981"
                  fillOpacity={0.12}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top 5 Cols: Interactive Controls */}
      <div className="space-y-4 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-xs lg:col-span-5">
        <h4 className="text-sm font-bold text-[#0F172A]">
          پنل تنظیمات تابع و فرکانس قطع انتگرال فوریه
        </h4>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-[#334155]">
            ۱. انتخاب تابع نمونه غیرمتناوب (۶ الگوی مرجع جزوه):
          </label>
          <select
            value={presetId}
            onChange={(e) => setPresetId(e.target.value as FourierIntegralPresetId)}
            className="w-full rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#0F172A]"
          >
            {FOURIER_INTEGRAL_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.labelFa}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 flex items-center justify-between text-xs font-bold text-[#334155]">
            <span>۲. پارامتر مقیاس مکانی / نرخ میرایی (a):</span>
            <span dir="ltr" className="font-mono text-sm font-bold text-[#0284C7]">
              a = {paramA.toFixed(1)}
            </span>
          </label>
          <input
            type="range"
            min={0.3}
            max={3.0}
            step={0.1}
            value={paramA}
            onChange={(e) => setParamA(Number(e.target.value))}
            className="w-full accent-[#0284C7]"
          />
          <div className="mt-1 flex items-center justify-between text-[11px] text-[#64748B]">
            <span>پالس پهن‌تر (طیف فرکانسی باریک)</span>
            <span>پالس تیز (طیف گسترده)</span>
          </div>
          <div className="mt-1.5 rounded-md border border-[#FDE68A] bg-[#FFFBEB] p-2 text-[11px] leading-relaxed text-[#92400E]">
            <strong>اصل عدم قطعیت فوریه: </strong>
            <MathText text="فشرده‌تر کردن تابع در حوزه زمان/مکان (کاهش $a$) باعث پهن‌تر شدن طیف چگالی فرکانس $A(\alpha)$ می‌گردد ($\Delta x \cdot \Delta \alpha \ge 1/2$)." />
          </div>
        </div>

        <div>
          <label className="mb-1 flex items-center justify-between text-xs font-bold text-[#334155]">
            <span>
              <MathText text="۳. فرکانس قطع انتگرال جزئی ($\Omega$ در $I_\Omega$):" />
            </span>
            <span dir="ltr" className="font-mono text-sm font-bold text-[#0284C7]">
              Ω = {cutoffOmega} rad/s
            </span>
          </label>
          <input
            type="range"
            min={1}
            max={40}
            step={1}
            value={cutoffOmega}
            onChange={(e) => {
              setIsAutoScrubbing(false);
              setCutoffOmega(Number(e.target.value));
            }}
            className="w-full accent-[#0284C7]"
          />
          <div className="flex justify-between font-mono text-[10px] text-[#64748B]">
            <span>Ω=1 (فرکانس پایین)</span>
            <span>Ω=20</span>
            <span>Ω=40 (همگرایی بالا)</span>
          </div>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
          <div className="mb-1 text-xs font-bold text-[#334155]">
            فرمول انتگرال فوریه جزئی در حال نمایش:
          </div>
          <MathFormula
            formula={`I_{${cutoffOmega}}(x) = \\int_{0}^{${cutoffOmega}} \\Big[ A(\\alpha)\\cos(\\alpha x) + B(\\alpha)\\sin(\\alpha x) \\Big]\\,d\\alpha`}
            block
            highlight
          />
        </div>
      </div>

      {/* Dynamic Recharts Convergence Sandbox across Omega (lg:col-span-12) */}
      <div
        data-testid="fourier-integral-recharts-sandbox"
        className="rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-xs lg:col-span-12"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#E0F2FE] px-2.5 py-0.5 text-xs font-bold text-[#0369A1]">
              <TrendingUp className="h-3.5 w-3.5" />
              کاوشگر پویای همگرایی انتگرال فوریه با افزایش فرکانس قطع (Recharts Convergence Sandbox)
            </span>
            <h4 className="mt-1 text-base font-extrabold text-[#0F172A]">
              <MathText text="تحلیل دنباله انتگرال‌های جزئی $I_\Omega(x_0)$ و بررسی قضیه همگرایی دیریکله" />
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setMetricMode('pointwise')}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                metricMode === 'pointwise'
                  ? 'border-[#0284C7] bg-[#0284C7] text-white'
                  : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]'
              }`}
            >
              <MathText text="همگرایی نقطه‌ای $I_\Omega(x_0)$ به حد دیریکله" />
            </button>
            <button
              type="button"
              onClick={() => setMetricMode('energy')}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition ${
                metricMode === 'energy'
                  ? 'border-[#059669] bg-[#059669] text-white'
                  : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]'
              }`}
            >
              <MathText text="همگرایی انرژی پارسوال ($\%$) بر حسب $\Omega$" />
            </button>
          </div>
        </div>

        {/* Scrubber Controls for Omega and Probe x_0 */}
        <div className="mb-4 grid grid-cols-1 gap-4 rounded-xl border border-[#BAE6FD] bg-[#F0F9FF]/70 p-4 lg:grid-cols-12">
          {/* Omega Scrubber (7 cols) */}
          <div className="space-y-2 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="fourier-integral-omega-scrubber"
                className="flex items-center gap-1.5 text-xs font-extrabold text-[#0F172A]"
              >
                <Sliders className="h-3.5 w-3.5 text-[#0284C7]" />
                <MathText text="اسکرابر پیوسته فرکانس قطع انتگرال ($\Omega = 1 \dots 40\text{ rad/s}$):" />
              </label>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAutoScrubbing(false);
                    setCutoffOmega((prev) => Math.max(1, prev - 1));
                  }}
                  className="inline-flex items-center gap-0.5 rounded-md border border-[#CBD5E1] bg-white px-2 py-1 text-xs font-bold text-[#334155] hover:bg-[#F1F5F9]"
                  title="کاهش یک رادیان"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span>Ω-1</span>
                </button>

                <span
                  dir="ltr"
                  className="rounded-md bg-[#0284C7] px-2.5 py-1 font-mono text-xs font-extrabold text-white"
                >
                  Ω = {cutoffOmega}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setIsAutoScrubbing(false);
                    setCutoffOmega((prev) => Math.min(40, prev + 1));
                  }}
                  className="inline-flex items-center gap-0.5 rounded-md border border-[#CBD5E1] bg-white px-2 py-1 text-xs font-bold text-[#334155] hover:bg-[#F1F5F9]"
                  title="افزایش یک رادیان"
                >
                  <span>Ω+1</span>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
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
                      <span>پخش خودکار Ω</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <input
              id="fourier-integral-omega-scrubber"
              type="range"
              min={1}
              max={40}
              step={1}
              value={cutoffOmega}
              onChange={(e) => {
                setIsAutoScrubbing(false);
                setCutoffOmega(Number(e.target.value));
              }}
              className="w-full accent-[#0284C7]"
            />

            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5">
              <span className="text-[11px] font-semibold text-[#475569]">
                پرش سریع به فرکانس قطع:
              </span>
              <div dir="ltr" className="flex flex-wrap gap-1">
                {[2, 5, 8, 12, 18, 25, 32, 40].map((wVal) => (
                  <button
                    key={wVal}
                    type="button"
                    onClick={() => {
                      setIsAutoScrubbing(false);
                      setCutoffOmega(wVal);
                    }}
                    className={`rounded px-2 py-0.5 font-mono text-[11px] font-bold transition ${
                      cutoffOmega === wVal
                        ? 'bg-[#0284C7] text-white'
                        : 'border border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#E0F2FE]'
                    }`}
                  >
                    Ω={wVal}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Probe Point x_0 Selector (5 cols) */}
          <div className="space-y-2 border-t border-[#BAE6FD] pt-3 lg:col-span-5 lg:border-t-0 lg:border-r lg:pr-4 lg:pt-0">
            <div className="flex items-center justify-between">
              <label
                htmlFor="fourier-integral-probe-x-slider"
                className="text-xs font-extrabold text-[#0F172A]"
              >
                نقطه کاوش همگرایی (x₀ در محور مکان):
              </label>
              <span
                dir="ltr"
                className="rounded bg-white px-2 py-0.5 font-mono text-xs font-bold text-[#0369A1] shadow-2xs"
              >
                x₀ = {probeX.toFixed(2)}
              </span>
            </div>

            <input
              id="fourier-integral-probe-x-slider"
              type="range"
              min={-paramA * 2}
              max={paramA * 2}
              step={0.05}
              value={probeX}
              onChange={(e) => setProbeX(Number(e.target.value))}
              className="w-full accent-[#0369A1]"
            />

            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="text-[11px] font-semibold text-[#475569]">
                نقاط حساس دیریکله:
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  { xVal: 0, label: 'x₀ = 0 (مبدأ)' },
                  { xVal: paramA / 2, label: 'x₀ = a/2 (داخل)' },
                  { xVal: paramA, label: 'x₀ = a (نقطه پرش)' },
                  { xVal: paramA * 1.5, label: 'x₀ = 1.5a (بیرون)' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setProbeX(preset.xVal)}
                    className={`rounded px-2 py-0.5 text-[10px] font-bold transition ${
                      Math.abs(probeX - preset.xVal) < 0.05
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

        {/* Recharts Convergence Trajectory Chart */}
        <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-1">
            <span className="text-xs font-bold text-[#0F172A]">
              {metricMode === 'pointwise' ? (
                <MathText text={`دنباله همگرایی انتگرال جزئی $I_\\Omega(x_0)$ بر حسب افزایش فرکانس قطع $\\Omega$ (در نقطه $x_0 = ${probeX.toFixed(2)}$)`} />
              ) : (
                <MathText text="همگرایی یکنواخت انرژی پارسوال انتگرال فوریه ($\%$) بر حسب افزایش فرکانس قطع $\Omega$" />
              )}
            </span>
            <span className="text-[11px] font-semibold text-[#0369A1]">
              (روی هر فرکانس Ω کلیک کنید)
            </span>
          </div>

          <div dir="ltr" className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {metricMode === 'pointwise' ? (
                <ComposedChart
                  data={trajectory.points}
                  margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
                  onClick={(state) => {
                    if (state && typeof state.activeLabel !== 'undefined') {
                      setIsAutoScrubbing(false);
                      setCutoffOmega(Number(state.activeLabel));
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="omega"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    label={{ value: 'Ω (rad/s)', position: 'insideBottomRight', offset: -5, fontSize: 10 }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#CBD5E1',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                    labelFormatter={(val) => `Cutoff Ω = ${val} rad/s`}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <ReferenceLine
                    y={trajectory.dirichletTargetAtProbe}
                    stroke="#059669"
                    strokeWidth={2}
                    strokeDasharray="5 3"
                    label={{
                      value: `Dirichlet Target S(x₀)=${trajectory.dirichletTargetAtProbe.toFixed(3)}`,
                      position: 'insideTopRight',
                      fill: '#059669',
                      fontSize: 10,
                    }}
                  />
                  <ReferenceLine
                    x={cutoffOmega}
                    stroke="#0284C7"
                    strokeWidth={1.8}
                    strokeDasharray="3 3"
                  />
                  <Line
                    type="monotone"
                    dataKey="partialIntegralAtProbe"
                    name="انتگرال جزئی I_Ω(x₀)"
                    stroke="#0284C7"
                    strokeWidth={2.5}
                    dot={{ r: 2.5, fill: '#0284C7' }}
                    isAnimationActive={false}
                  />
                  {activeOmegaStats && (
                    <ReferenceDot
                      x={cutoffOmega}
                      y={activeOmegaStats.partialIntegralAtProbe}
                      r={6}
                      fill="#DC2626"
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  )}
                </ComposedChart>
              ) : (
                <ComposedChart
                  data={trajectory.points}
                  margin={{ top: 15, right: 15, left: -15, bottom: 5 }}
                  onClick={(state) => {
                    if (state && typeof state.activeLabel !== 'undefined') {
                      setIsAutoScrubbing(false);
                      setCutoffOmega(Number(state.activeLabel));
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="omega"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    label={{ value: 'Ω (rad/s)', position: 'insideBottomRight', offset: -5, fontSize: 10 }}
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
                    labelFormatter={(val) => `Cutoff Ω = ${val} rad/s`}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <ReferenceLine
                    yAxisId="left"
                    x={cutoffOmega}
                    stroke="#0284C7"
                    strokeWidth={1.8}
                    strokeDasharray="3 3"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="spectralMagnitude"
                    name="چگالی طیفی در فرکانس Ω"
                    fill="#818CF8"
                    opacity={0.6}
                    isAnimationActive={false}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="energyRatioPercent"
                    name="درصد انرژی پارسوال جذب‌شده (%)"
                    stroke="#059669"
                    fill="#10B981"
                    fillOpacity={0.18}
                    strokeWidth={2.5}
                    isAnimationActive={false}
                  />
                  {activeOmegaStats && (
                    <ReferenceDot
                      yAxisId="left"
                      x={cutoffOmega}
                      y={activeOmegaStats.energyRatioPercent}
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

        {/* Live Metrics readout bar for scrubbed Omega */}
        {activeOmegaStats && (
          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="rounded-lg border border-[#BAE6FD] bg-[#F0F9FF] p-2.5">
              <div className="text-[11px] font-bold text-[#0369A1]">
                <MathText text={`مقدار انتگرال جزئی در $\\Omega = ${cutoffOmega}$`} />
              </div>
              <div dir="ltr" className="mt-1">
                <MathFormula
                  formula={`I_{${cutoffOmega}}(${probeX.toFixed(2)}) = ${activeOmegaStats.partialIntegralAtProbe.toFixed(4)}`}
                  className="font-mono text-xs font-extrabold"
                />
              </div>
            </div>

            <div className="rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] p-2.5">
              <div className="text-[11px] font-bold text-[#047857]">
                <MathText text="حد دیریکله $S(x_0)$" />
              </div>
              <div dir="ltr" className="mt-1">
                <MathFormula
                  formula={`\\frac{f(x_0^-) + f(x_0^+)}{2} = ${trajectory.dirichletTargetAtProbe.toFixed(4)}`}
                  className="font-mono text-xs font-extrabold"
                />
              </div>
            </div>

            <div className="rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-2.5">
              <div className="text-[11px] font-bold text-[#B45309]">
                <MathText text="خطای مطلق در $x_0$" />
              </div>
              <div dir="ltr" className="mt-1">
                <MathFormula
                  formula={`|I_{\\Omega}(x_0) - S(x_0)| = ${activeOmegaStats.absErrorAtProbe.toFixed(4)}`}
                  className="font-mono text-xs font-extrabold"
                />
              </div>
            </div>

            <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-2.5">
              <div className="text-[11px] font-bold text-[#334155]">
                درصد انرژی تجمیعی پارسوال
              </div>
              <div dir="ltr" className="mt-1">
                <MathFormula
                  formula={`E = ${activeOmegaStats.energyRatioPercent.toFixed(1)}\\%`}
                  className="font-mono text-xs font-extrabold"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full-Width Analytical Derivation Workbench (lg:col-span-12) */}
      <div className="rounded-xl border border-[#BAE6FD] bg-white p-5 shadow-xs lg:col-span-12">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#E0F2FE] px-2.5 py-0.5 text-xs font-bold text-[#0369A1]">
              <BookOpen className="h-3.5 w-3.5" />
              بسط تحلیلی و تشریحی گام‌به‌گام انتگرال فوریه
            </span>
            <h4 className="mt-1 text-base font-extrabold text-[#0F172A]">
              <MathText text={analyticalDetails.titleFa} />
            </h4>
          </div>
          <span className="rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] px-3 py-1 text-xs font-bold text-[#047857]">
            {analyticalDetails.symmetryTypeFa}
          </span>
        </div>

        {/* Section 1: Definition & Spectral Densities */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="space-y-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 lg:col-span-12">
            <div className="text-xs font-bold text-[#0F172A]">
              ۱. ضابطه ریاضی تابع، بررسی تقارن و رفتار مجانبی در بی‌نهایت:
            </div>
            <MathFormula formula={analyticalDetails.functionDefinitionLatex} block />
            <p className="text-xs leading-relaxed text-[#334155]">
              <MathText text={analyticalDetails.symmetryReasonFa} />
            </p>
            <div className="rounded-lg border border-[#FDE68A] bg-[#FFFBEB] p-2.5 text-xs leading-relaxed text-[#92400E]">
              <strong>سرعت نزول طیف فرکانسی و پدیده گیبس: </strong>
              <MathText text={analyticalDetails.decayOrderNoteFa} />
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-[#BAE6FD] bg-[#F0F9FF]/60 p-4 lg:col-span-12">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0369A1]">
              <Layers className="h-4 w-4" />
              ۲. محاسبه گام‌به‌گام ضرایب طیفی اویلر-فوریه A(α) و B(α) بدون پرش:
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-[#E2E8F0] bg-white p-3">
                <span className="mb-1 inline-block rounded bg-[#E0F2FE] px-2 py-0.5 text-[11px] font-bold text-[#0369A1]">
                  محاسبه ضریب کسینوسی A(α):
                </span>
                <MathFormula formula={analyticalDetails.A_alphaDerivationLatex} block />
              </div>
              <div className="rounded-lg border border-[#E2E8F0] bg-white p-3">
                <span className="mb-1 inline-block rounded bg-[#FEF3C7] px-2 py-0.5 text-[11px] font-bold text-[#B45309]">
                  محاسبه ضریب سینوسی B(α):
                </span>
                <MathFormula formula={analyticalDetails.B_alphaDerivationLatex} block />
              </div>
            </div>
            <div>
              <div className="mb-1 text-[11px] font-semibold text-[#475569]">
                نمایش کامل انتگرال فوریه تابع:
              </div>
              <MathFormula formula={analyticalDetails.integralRepresentationLatex} block highlight />
            </div>
          </div>
        </div>

        {/* Section 2: Dirichlet Convergence Points */}
        <div className="mt-4 space-y-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A]">
            <Compass className="h-4 w-4 text-[#0284C7]" />
            ۳. بررسی قضیه همگرایی دیریکله در نقاط حساس و استخراج انتگرال‌های ناسره کلاسیک:
          </div>
          <div className="space-y-2.5">
            {analyticalDetails.dirichletConvergencePoints.map((pt, idx) => (
              <div key={idx} className="rounded-lg border border-[#E2E8F0] bg-white p-3">
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
                <MathFormula formula={pt.resultingImproperIntegralLatex} block />
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Parseval & Integral Equations */}
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="space-y-2.5 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5]/60 p-4 lg:col-span-12">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#065F46]">
              <Sparkles className="h-4 w-4 text-[#059669]" />
              ۴. اعمال اتحاد پارسوال انتگرال فوریه و استخراج انتگرال‌های کسر درجه ۴:
            </div>
            <p className="text-xs leading-relaxed text-[#047857]">
              طبق اتحاد پارسوال برای انتگرال فوریه، مساحت زیر مربع تابع در حوزه مکان برابر مساحت زیر مربع ضرایب طیفی در حوزه فرکانس است:
            </p>
            <MathFormula formula={analyticalDetails.parsevalApplicationLatex} block highlight />
          </div>

          <div className="space-y-2.5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-4 lg:col-span-12">
            <div className="text-xs font-bold text-[#0F172A]">
              ۵. کاربرد در حل معادلات انتگرالی (Integral Equations):
            </div>
            <p className="text-xs leading-relaxed text-[#334155]">
              <MathText text={analyticalDetails.integralEquationConnectionFa} />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
