'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  HeatInitialProfileId,
  evaluateHeatEquation1D,
  classifyPDE,
  mathErf,
  mathErfc,
} from '@/lib/math-engine';
import MathFormula, { MathText } from './MathFormula';
import {
  Flame,
  Play,
  Pause,
  RotateCcw,
  Layers,
  BarChart3,
  Waves,
  Zap,
  Info,
  Sliders,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const INITIAL_PROFILES: {
  id: HeatInitialProfileId;
  labelFa: string;
  formula: string;
}[] = [
  {
    id: 'two_modes',
    labelFa: 'ترکیب دو مد سینوسی (مثال ۴۴ جزوه)',
    formula: 'f(x) = 70\\sin(\\pi x/L) + 45\\sin(3\\pi x/L)',
  },
  {
    id: 'single_sine',
    labelFa: 'تک‌مد سینوسی پایه (مد اول)',
    formula: 'f(x) = 100\\sin(\\pi x/L)',
  },
  {
    id: 'parabolic_arch',
    labelFa: 'پروفایل سهموی متقارن با دو سر صفر',
    formula: 'f(x) = \\frac{400}{L^2} x (L - x)',
  },
  {
    id: 'step_heaviside',
    labelFa: 'پله‌ای حرارتی (نیمی داغ ۱۰۰°C و نیمی سرد ۰°C)',
    formula: 'f(x) = 100 \\; (x \\le L/2) , \\; 0 \\; (x > L/2)',
  },
  {
    id: 'localized_gaussian',
    labelFa: 'پالس متمرکز گاوسی در مرکز میله',
    formula: 'f(x) = 100 \\exp(-25 ((x - L/2)/L)^2)',
  },
  {
    id: 'tent_center',
    labelFa: 'پروفایل مثلثی چادری (تمرکز گرما در وسط میله)',
    formula: 'f(x) = \\frac{200x}{L} \\; (x \\le L/2) , \\; \\frac{200(L-x)}{L} \\; (x > L/2)',
  },
  {
    id: 'constant_rod',
    labelFa: 'دمای اولیه یکنواخت در کل میله',
    formula: 'f(x) = 80\\,^\\circ\\text{C}',
  },
  {
    id: 'cosine_mode',
    labelFa: 'پروفایل کسینوسی (ویژه میله با دو سر عایق)',
    formula: 'f(x) = 50 + 40\\cos(2\\pi x/L)',
  },
];

type HeatTabId = 'simulation' | 'spectrum' | 'kernel' | 'classifier';

export default function HeatEquationStage() {
  const [activeTab, setActiveTab] = useState<HeatTabId>('simulation');
  const [bcType, setBcType] = useState<
    | 'dirichlet_homog'
    | 'neumann_insulated'
    | 'nonhomog_steady'
    | 'semi_infinite_sine'
    | 'infinite_heat_kernel'
    | 'internal_source'
  >('dirichlet_homog');

  const [initialProfile, setInitialProfile] =
    useState<HeatInitialProfileId>('two_modes');
  const [timeT, setTimeT] = useState<number>(0.15);
  const [diffusivityK, setDiffusivityK] = useState<number>(1.0);
  const [rodLengthL] = useState<number>(3.14);
  const [leftTempT1, setLeftTempT1] = useState<number>(20);
  const [rightTempT2, setRightTempT2] = useState<number>(90);
  const [internalSourceQ, setInternalSourceQ] = useState<number>(50);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Kernel calculation state
  const [kernelZ, setKernelZ] = useState<number>(1.0);

  // PDE Classifier state (Example 43 from PDF)
  const [coeffA, setCoeffA] = useState<number>(1);
  const [coeffB, setCoeffB] = useState<number>(0);
  const [coeffC, setCoeffC] = useState<number>(0);

  // Animation loop when playing
  useEffect(() => {
    if (!isPlaying) return;
    const stepInterval = Math.max(30, 80 / playbackSpeed);
    const timer = setInterval(() => {
      setTimeT((prev) => {
        if (prev >= 3.0) {
          setIsPlaying(false);
          return 3.0;
        }
        return Number((prev + 0.03 * playbackSpeed).toFixed(2));
      });
    }, stepInterval);
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  const heatData = useMemo(() => {
    const samples = 90;
    const points: {
      x: number;
      uNow: number;
      uInitial: number;
      steadyV: number;
    }[] = [];

    for (let i = 0; i <= samples; i++) {
      const x = (i / samples) * rodLengthL;
      const nowRes = evaluateHeatEquation1D(
        {
          rodLengthL,
          diffusivityK,
          timeT,
          bcType,
          initialProfile,
          leftTempT1,
          rightTempT2,
          internalSourceQ,
        },
        x,
        15
      );
      const initRes = evaluateHeatEquation1D(
        {
          rodLengthL,
          diffusivityK,
          timeT: 0,
          bcType,
          initialProfile,
          leftTempT1,
          rightTempT2,
          internalSourceQ,
        },
        x,
        15
      );

      points.push({
        x,
        uNow: nowRes.u_xt,
        uInitial: initRes.u_xt,
        steadyV: nowRes.steadyStateV,
      });
    }

    const midRes = evaluateHeatEquation1D(
      {
        rodLengthL,
        diffusivityK,
        timeT,
        bcType,
        initialProfile,
        leftTempT1,
        rightTempT2,
        internalSourceQ,
      },
      rodLengthL / 2,
      15
    );

    // Initial coefficients for spectrum comparison
    const initMidRes = evaluateHeatEquation1D(
      {
        rodLengthL,
        diffusivityK,
        timeT: 0,
        bcType,
        initialProfile,
        leftTempT1,
        rightTempT2,
        internalSourceQ,
      },
      rodLengthL / 2,
      15
    );

    return {
      points,
      midTemp: midRes.u_xt,
      coeffsNow: midRes.modeCoefficients,
      coeffsInitial: initMidRes.modeCoefficients,
      tau1: midRes.fundamentalRelaxationTime,
    };
  }, [
    rodLengthL,
    diffusivityK,
    timeT,
    bcType,
    initialProfile,
    leftTempT1,
    rightTempT2,
    internalSourceQ,
  ]);

  // Spectral mode data for Recharts
  const spectralChartData = useMemo(() => {
    const kSq = diffusivityK * diffusivityK;
    return heatData.coeffsNow.slice(0, 8).map((nowVal, idx) => {
      const n = idx + 1;
      const initVal = heatData.coeffsInitial[idx] || 0;
      const alphaN = (n * Math.PI) / rodLengthL;
      const theoreticalDecay = Math.exp(-kSq * alphaN * alphaN * Math.max(0, timeT));
      return {
        mode: `n = ${n}`,
        initialAmp: Number(Math.abs(initVal).toFixed(2)),
        currentAmp: Number(Math.abs(nowVal).toFixed(2)),
        decayFactor: Number((theoreticalDecay * 100).toFixed(1)),
      };
    });
  }, [heatData, diffusivityK, rodLengthL, timeT]);

  const pdeClass = useMemo(
    () => classifyPDE(coeffA, coeffB, coeffC),
    [coeffA, coeffB, coeffC]
  );

  const svgWidth = 680;
  const svgHeight = 230;
  const mapX = (x: number) => (x / rodLengthL) * (svgWidth - 70) + 35;
  const mapY = (u: number) => svgHeight - 30 - (u / 120) * (svgHeight - 55);

  const initialPath = heatData.points
    .map(
      (pt, i) =>
        `${i === 0 ? 'M' : 'L'} ${mapX(pt.x).toFixed(1)} ${mapY(
          pt.uInitial
        ).toFixed(1)}`
    )
    .join(' ');

  const currentPath = heatData.points
    .map(
      (pt, i) =>
        `${i === 0 ? 'M' : 'L'} ${mapX(pt.x).toFixed(1)} ${mapY(
          pt.uNow
        ).toFixed(1)}`
    )
    .join(' ');

  const steadyPath = heatData.points
    .map(
      (pt, i) =>
        `${i === 0 ? 'M' : 'L'} ${mapX(pt.x).toFixed(1)} ${mapY(
          pt.steadyV
        ).toFixed(1)}`
    )
    .join(' ');

  const tempToColor = (temp: number) => {
    const ratio = Math.max(0, Math.min(1, temp / 100));
    if (ratio < 0.35) return 'var(--chart-accent)';
    if (ratio < 0.7) return 'var(--chart-warn)';
    return 'var(--chart-danger)';
  };

  return (
    <div className="space-y-4 rounded-xl border border-line bg-surface p-4 transition-colors sm:p-5">
      {/* Header & Sub-Tab Navigation Bar */}
      <div className="flex flex-col gap-3 border-b border-line pb-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-danger-solid text-white">
              <Flame className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-ink sm:text-lg">
              آزمایشگاه جامع و شبیه‌ساز تحلیلی معادله گرما (1D Heat PDE)
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-ink-3">
            مدل‌سازی پدیده‌های نفوذ و اتلاف حرارت، جداسازی متغیرها، میرایی هارمونیک‌ها و هسته گاوسی
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-line-strong bg-panel p-1">
          {[
            {
              id: 'simulation',
              label: 'بوم توزیع دمایی میله',
              icon: Flame,
            },
            {
              id: 'spectrum',
              label: 'تحلیل طیفی و میرایی مدها',
              icon: BarChart3,
            },
            {
              id: 'kernel',
              label: 'هسته گاوسی و تابع خطا',
              icon: Waves,
            },
            {
              id: 'classifier',
              label: 'دسته‌بندی و مبین PDE',
              icon: Layers,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as HeatTabId)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                  isActive
                    ? 'bg-accent-solid text-white'
                    : 'text-ink-3 hover:bg-muted hover:text-ink'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Interactive Rod Thermal Simulation & Dynamic Profiles */}
      {activeTab === 'simulation' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Left/Top 7 Cols: Thermal Rod Curve & Gradient */}
          <div className="space-y-4 rounded-xl border border-line bg-surface p-4 lg:col-span-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded bg-accent-soft px-2 py-0.5 font-mono text-xs font-bold text-accent-deep">
                  u_t = k² u_xx
                </span>
                <span className="text-xs font-semibold text-ink-3">
                  طول میله: L = π m
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  dir="ltr"
                  className="rounded-md bg-danger-soft px-2.5 py-1 font-mono text-xs font-bold text-danger-ink"
                >
                  t = {timeT.toFixed(2)} s | u(L/2, t) ={' '}
                  {heatData.midTemp.toFixed(1)}°C
                </span>
              </div>
            </div>

            {/* SVG Temperature Curve Plot */}
            <div className="overflow-hidden rounded-xl border border-line bg-panel">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="h-56 w-full"
                role="img"
                aria-label="نمودار توزیع دمای میله"
              >
                {/* Horizontal grid lines */}
                <line
                  x1={35}
                  y1={mapY(0)}
                  x2={svgWidth - 35}
                  y2={mapY(0)}
                  stroke="var(--chart-muted)"
                  strokeWidth="1.2"
                />
                <line
                  x1={35}
                  y1={mapY(50)}
                  x2={svgWidth - 35}
                  y2={mapY(50)}
                  stroke="var(--chart-grid)"
                  strokeWidth="0.8"
                  strokeDasharray="3 3"
                />
                <line
                  x1={35}
                  y1={mapY(100)}
                  x2={svgWidth - 35}
                  y2={mapY(100)}
                  stroke="var(--chart-grid)"
                  strokeWidth="0.8"
                  strokeDasharray="3 3"
                />

                {/* Rod boundaries */}
                <line
                  x1={35}
                  y1={16}
                  x2={35}
                  y2={svgHeight - 20}
                  stroke="var(--chart-axis)"
                  strokeWidth="2"
                />
                <line
                  x1={svgWidth - 35}
                  y1={16}
                  x2={svgWidth - 35}
                  y2={svgHeight - 20}
                  stroke="var(--chart-axis)"
                  strokeWidth="2"
                />

                {/* Initial Profile u(x, 0) */}
                <path
                  d={initialPath}
                  fill="none"
                  stroke="var(--chart-muted)"
                  strokeWidth="1.8"
                  strokeDasharray="5 4"
                />

                {/* Steady-State Profile v(x) as t -> infty */}
                <path
                  d={steadyPath}
                  fill="none"
                  stroke="var(--chart-ok)"
                  strokeWidth="1.8"
                  strokeDasharray="2 3"
                />

                {/* Current Temperature Profile u(x, t) */}
                <path
                  d={currentPath}
                  fill="none"
                  stroke="var(--chart-danger)"
                  strokeWidth="3.2"
                />

                {/* Boundary & Node labels */}
                <text
                  x={30}
                  y={svgHeight - 8}
                  className="fill-(--chart-axis) font-mono text-[11px] font-bold"
                >
                  x = 0
                </text>
                <text
                  x={svgWidth / 2 - 15}
                  y={svgHeight - 8}
                  className="fill-(--chart-axis) font-mono text-[11px]"
                >
                  x = L/2
                </text>
                <text
                  x={svgWidth - 52}
                  y={svgHeight - 8}
                  className="fill-(--chart-axis) font-mono text-[11px] font-bold"
                >
                  x = L
                </text>
              </svg>
            </div>

            {/* Physical 1D Rod Heat-Map Visualization */}
            <div className="rounded-xl border border-line bg-panel p-3">
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-ink-2">
                <span>نمای بصری رسانایی حرارتی میله در لحظه t = {timeT.toFixed(2)}s:</span>
                <span className="text-[11px] text-ink-4">
                  آبی (سرد ۰°C) ← کهربایی (گرم) ← قرمز (داغ ۱۰۰°C)
                </span>
              </div>
              <div className="flex h-7 w-full overflow-hidden rounded-lg border border-line-strong">
                {heatData.points
                  .filter((_, idx) => idx % 2 === 0)
                  .map((pt, i) => (
                    <div
                      key={i}
                      className="h-full flex-1 transition-colors"
                      style={{
                        backgroundColor: tempToColor(pt.uNow),
                        opacity: Math.max(0.25, Math.min(1, pt.uNow / 95 + 0.2)),
                      }}
                      title={`x=${pt.x.toFixed(2)}, u=${pt.uNow.toFixed(1)}°C`}
                    />
                  ))}
              </div>
            </div>

            {/* Playback Controls & Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="flex items-center gap-1.5 rounded-lg bg-accent-solid px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-accent-solid"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-3.5 w-3.5" />
                      توقف زمان
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      اجرای پخش حرارت
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setTimeT(0);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-xs font-semibold text-ink-3 transition hover:bg-muted"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  لحظه اولیه (t = 0)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPlaybackSpeed((s) => (s === 1 ? 2 : s === 2 ? 0.5 : 1))
                  }
                  className="rounded-lg border border-line-strong bg-surface px-2.5 py-1.5 font-mono text-xs font-bold text-ink-2"
                >
                  {playbackSpeed}x
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-ink-3">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-0.5 w-3.5 bg-line-strong" />
                  دمای اولیه u(x,0)
                </span>
                <span className="flex items-center gap-1 font-bold text-danger-ink">
                  <span className="inline-block h-1 w-3.5 bg-danger-solid" />
                  دمای لحظه‌ای u(x,t)
                </span>
                <span className="flex items-center gap-1 text-ok">
                  <span className="inline-block h-0.5 w-3.5 bg-ok-solid" />
                  تعادل ماندگار v(x)
                </span>
              </div>
            </div>
          </div>

          {/* Right/Bottom 5 Cols: PDE Parameter Deck */}
          <div className="space-y-4 rounded-xl border border-line bg-surface p-4 lg:col-span-5">
            <h4 className="flex items-center gap-1.5 text-sm font-bold text-ink">
              <Sliders className="h-4 w-4 text-accent" />
              <span>تنظیم شرایط مرزی، اولیه و فیزیکی میله</span>
            </h4>

            {/* Boundary Condition Selector */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-ink-2">
                ۱. شرایط مرزی دو سر میله (Boundary Conditions):
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  {
                    id: 'dirichlet_homog',
                    label: 'الف) دیریکله همگن: دو سر دمای صفر u(0,t)=u(L,t)=0',
                  },
                  {
                    id: 'neumann_insulated',
                    label: 'ب) نیومن همگن: دو سر کاملاً عایق u_x(0,t)=u_x(L,t)=0',
                  },
                  {
                    id: 'nonhomog_steady',
                    label: 'ج) شرایط مرزی غیرهمگن: u(0,t)=T₁ , u(L,t)=T₂',
                  },
                  {
                    id: 'internal_source',
                    label: 'د) چشمه حرارتی داخلی یکنواخت: u_t = k² u_xx + Q₀',
                  },
                  {
                    id: 'semi_infinite_sine',
                    label: 'هـ) میله نیمه‌نامتناهی: x ≥ 0 با دمای سطح T₁',
                  },
                  {
                    id: 'infinite_heat_kernel',
                    label: 'و) میله نامتناهی: پخش بسته حرارتی با هسته پواسون',
                  },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      setBcType(b.id as any);
                      setTimeT(0.15);
                    }}
                    className={`rounded-lg border px-3 py-1.5 text-right text-xs font-semibold transition ${
                      bcType === b.id
                        ? 'border-accent bg-accent-soft text-accent-deep'
                        : 'border-line bg-panel text-ink-3 hover:bg-muted'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Non-homogeneous Temperatures Slider */}
            {bcType === 'nonhomog_steady' && (
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-accent/30 bg-accent-soft p-3 dark:border-accent/30">
                <div>
                  <label className="mb-1 flex justify-between text-xs font-bold text-accent-deep">
                    <span>دمای سر چپ T₁:</span>
                    <span className="font-mono">{leftTempT1}°C</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={leftTempT1}
                    onChange={(e) => setLeftTempT1(Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                </div>
                <div>
                  <label className="mb-1 flex justify-between text-xs font-bold text-accent-deep">
                    <span>دمای سر راست T₂:</span>
                    <span className="font-mono">{rightTempT2}°C</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={rightTempT2}
                    onChange={(e) => setRightTempT2(Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                </div>
              </div>
            )}

            {/* Internal Source Strength Slider */}
            {bcType === 'internal_source' && (
              <div className="rounded-lg border border-warn/30 bg-warn-soft p-3 dark:border-warn/30">
                <label className="mb-1 flex justify-between text-xs font-bold text-warn">
                  <span>شدت چشمه تولید گرما Q₀:</span>
                  <span className="font-mono">{internalSourceQ} W/m</span>
                </label>
                <input
                  type="range"
                  min={10}
                  max={120}
                  step={5}
                  value={internalSourceQ}
                  onChange={(e) => setInternalSourceQ(Number(e.target.value))}
                  className="w-full accent-warn"
                />
              </div>
            )}

            {/* Initial Profile Selector */}
            {bcType !== 'semi_infinite_sine' && bcType !== 'infinite_heat_kernel' && (
              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink-2">
                  ۲. توزیع دمای اولیه میله u(x,0) = f(x):
                </label>
                <select
                  value={initialProfile}
                  onChange={(e) =>
                    setInitialProfile(e.target.value as HeatInitialProfileId)
                  }
                  className="w-full rounded-lg border border-line-strong bg-panel px-3 py-2 text-xs font-semibold text-ink"
                >
                  {INITIAL_PROFILES.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.labelFa}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Time & Diffusivity Sliders */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 flex justify-between text-xs font-bold text-ink-2">
                  <span>زمان (t):</span>
                  <span dir="ltr" className="font-mono text-danger-ink">
                    {timeT.toFixed(2)} s
                  </span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={3.0}
                  step={0.05}
                  value={timeT}
                  onChange={(e) => setTimeT(Number(e.target.value))}
                  className="w-full accent-danger"
                />
              </div>

              <div>
                <label className="mb-1 flex justify-between text-xs font-bold text-ink-2">
                  <span>ضریب پخش (k):</span>
                  <span dir="ltr" className="font-mono text-accent">
                    k = {diffusivityK.toFixed(1)}
                  </span>
                </label>
                <input
                  type="range"
                  min={0.4}
                  max={2.0}
                  step={0.1}
                  value={diffusivityK}
                  onChange={(e) => setDiffusivityK(Number(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>
            </div>

            {/* Telemetry card for Relaxation time */}
            <div className="rounded-lg border border-line bg-panel p-3 text-xs leading-6">
              <div className="flex items-center justify-between text-ink-2">
                <span className="font-bold">ثابت زمانی فرونشست مد اول (τ₁):</span>
                <span className="font-mono font-bold text-accent">
                  {heatData.tau1.toFixed(2)} ثانیه
                </span>
              </div>
              <p className="mt-1 text-[11px] text-ink-4">
                <MathText text="فرمول $\tau_1 = \frac{L^2}{\pi^2 k^2}$ نشان می‌دهد که با گذشت هر $\tau_1$ ثانیه، دامنه هماهنگ پایه بیش از ۶۳٪ افت می‌کند." />
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Spectral Fourier Mode Decay */}
      {activeTab === 'spectrum' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-panel p-4">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-bold text-ink">
                طیف دامنه‌های هارمونیک‌های فوریه و میرایی نمایی با زمان
              </h4>
              <span className="rounded bg-ok-soft px-2.5 py-1 text-xs font-bold text-ok-ink">
                <MathText text="فرکانس‌های بالا ($n \ge 3$) سریع‌تر از بین می‌روند" />
              </span>
            </div>
            <p className="text-xs text-ink-3">
              <MathText text="مقایسه دامنه اولیه $|c_n(0)|$ با دامنه لحظه‌ای $|c_n(t)| = |c_n(0)| e^{-(n\pi k/L)^2 t}$ برای مدهای $n=1$ تا $n=8$:" />
            </p>

            <div className="mt-3 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spectralChartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="mode" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      val,
                      name === 'initialAmp'
                        ? 'دامنه اولیه (t=0)'
                        : name === 'currentAmp'
                        ? 'دامنه فعلی'
                        : 'درصد بقا (%)',
                    ]}
                  />
                  <Legend
                    formatter={(val) =>
                      val === 'initialAmp'
                        ? 'دامنه در لحظه اولیه t=0'
                        : 'دامنه در لحظه جاری t'
                    }
                  />
                  <Bar dataKey="initialAmp" fill="var(--chart-muted)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="currentAmp" fill="var(--chart-danger)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-line bg-surface p-3.5">
              <div className="mb-1 text-xs font-bold text-accent">
                <MathText text="نرخ زوال مدهای فرکانس بالا ($n^2$)" />
              </div>
              <p className="text-xs leading-6 text-ink-3">
                <MathText text="به دلیل وجود ضریب $n^2$ در توان منفی نمایی، مد $n=2$ با سرعت ۴ برابر و مد $n=3$ با سرعت ۹ برابر مد پایه $n=1$ خاموش می‌شوند." />
              </p>
            </div>
            <div className="rounded-xl border border-line bg-surface p-3.5">
              <div className="mb-1 text-xs font-bold text-ok">
                <MathText text="هموارسازی تحلیلی آنی ($C^\infty$)" />
              </div>
              <p className="text-xs leading-6 text-ink-3">
                <MathText text="حتی اگر توزیع اولیه دارای شکستگی‌های ناپیوسته باشد، پس از گذشت حتی $t = 0.01$ ثانیه تمام تیزی‌ها هموار شده و منحنی مشتق‌پذیر پیوسته می‌شود." />
              </p>
            </div>
            <div className="rounded-xl border border-line bg-surface p-3.5">
              <div className="mb-1 text-xs font-bold text-warn">
                پایستگی انرژی در میله عایق
              </div>
              <p className="text-xs leading-6 text-ink-3">
                <MathText text="در شرایط نیومن عایق ($u_x = 0$)، هیچ گرمایی از مرزها خارج نمی‌شود و مقدار میانگین دمای میله در تمام زمان‌ها دقیقاً ثابت می‌ماند." />
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Heat Kernel & Error Function */}
      {activeTab === 'kernel' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="space-y-3 rounded-xl border border-line bg-panel p-4 lg:col-span-6">
              <h4 className="text-sm font-bold text-ink">
                هسته حرارتی گاوسی پواسون (تابع گرین میله نامتناهی)
              </h4>
              <p className="text-xs leading-6 text-ink-2">
                <MathText text="در میله نامتناهی، پاسخ پالس حرارتی نقطه‌ای اولیه (چشمه ضربه دیراک $\delta(x)$) به صورت یک زنگوله گاوسی منتشر می‌شود:" />
              </p>
              <MathFormula
                formula="G(x,t) = \frac{1}{\sqrt{4\pi k^2 t}} \exp\left( -\frac{x^2}{4k^2 t} \right) \quad , \quad \sigma(t) = \sqrt{2k^2 t}"
                block
                highlight
              />
              <p className="text-xs leading-6 text-ink-3">
                <MathText text="مساحت زیر منحنی هسته گاوسی در هر زمان همواره برابر ۱ است (پایستگی گرمای ورودی ضربه)، اما انحراف معیار فضایی نفوذ گرما با $\sqrt{t}$ گسترش می‌یابد." />
              </p>
            </div>

            <div className="space-y-3 rounded-xl border border-line bg-surface p-4 lg:col-span-6">
              <h4 className="text-sm font-bold text-ink">
                <MathText text="محاسبه‌گر تعاملی تابع خطا $\operatorname{erf}(z)$ و متمم $\operatorname{erfc}(z)$" />
              </h4>
              <div className="flex items-center justify-between text-xs font-bold text-ink-2">
                <span>متغیر ورودی z:</span>
                <span className="font-mono text-accent">
                  z = {kernelZ.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={-3.0}
                max={3.0}
                step={0.1}
                value={kernelZ}
                onChange={(e) => setKernelZ(Number(e.target.value))}
                className="w-full accent-accent"
              />
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-lg border border-line bg-panel p-2.5">
                  <div className="text-[11px] text-ink-4">
                    تابع خطا:
                  </div>
                  <div className="font-mono font-bold text-accent">
                    erf({kernelZ.toFixed(2)}) = {mathErf(kernelZ).toFixed(5)}
                  </div>
                </div>
                <div className="rounded-lg border border-line bg-panel p-2.5">
                  <div className="text-[11px] text-ink-4">
                    تابع خطای متمم:
                  </div>
                  <div className="font-mono font-bold text-ok">
                    erfc({kernelZ.toFixed(2)}) = {mathErfc(kernelZ).toFixed(5)}
                  </div>
                </div>
              </div>
              <p className="text-[11px] leading-5 text-ink-4">
                <MathText text="کاربرد در میله نیمه‌نامتناهی: توزیع دمای ناشی از نگه‌داشتن دمای سطح روی $T_0$ برابر است با $u(x,t) = T_0 \operatorname{erfc}\left(\frac{x}{2k\sqrt{t}}\right)$." />
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: PDE Classifier & Canonical Transformer (Example 43) */}
      {activeTab === 'classifier' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-line bg-panel p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-accent" />
                <h4 className="text-sm font-bold text-ink">
                  <MathText text="دسته‌بندی PDE خطی مرتبه دوم با مبین $\Delta = B^2 - 4AC$ و مشخصه‌ها (مثال ۴۳ جزوه)" />
                </h4>
              </div>
              <span
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1 text-xs font-bold ${
                  pdeClass.typeEn === 'parabolic'
                    ? 'bg-warn-tint text-warn'
                    : pdeClass.typeEn === 'hyperbolic'
                    ? 'bg-accent-soft text-accent-deep'
                    : 'bg-ok-soft text-ok'
                }`}
              >
                <MathFormula
                  formula={`\\Delta = B^2 - 4AC = ${pdeClass.delta}`}
                  block={false}
                />
                <span>← {pdeClass.typeFa}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-4">
              <div>
                <label className="mb-1 flex justify-between text-xs font-semibold text-ink-2">
                  <span>ضریب A (مشتق u_xx):</span>
                  <span className="font-mono font-bold">{coeffA}</span>
                </label>
                <input
                  type="range"
                  min={-5}
                  max={5}
                  step={1}
                  value={coeffA}
                  onChange={(e) => setCoeffA(Number(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>
              <div>
                <label className="mb-1 flex justify-between text-xs font-semibold text-ink-2">
                  <span>ضریب B (مشتق u_xy):</span>
                  <span className="font-mono font-bold">{coeffB}</span>
                </label>
                <input
                  type="range"
                  min={-6}
                  max={6}
                  step={1}
                  value={coeffB}
                  onChange={(e) => setCoeffB(Number(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>
              <div>
                <label className="mb-1 flex justify-between text-xs font-semibold text-ink-2">
                  <span>ضریب C (مشتق u_yy):</span>
                  <span className="font-mono font-bold">{coeffC}</span>
                </label>
                <input
                  type="range"
                  min={-5}
                  max={5}
                  step={1}
                  value={coeffC}
                  onChange={(e) => setCoeffC(Number(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>
              <div className="rounded-lg border border-line bg-surface p-2 text-center">
                <MathFormula
                  formula={`${coeffA}\\,u_{xx} + (${coeffB})\\,u_{xy} + (${coeffC})\\,u_{yy} = 0`}
                  block
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 text-xs leading-6">
            <div className="rounded-xl border border-line bg-surface p-3.5">
              <div className="font-bold text-warn">
                <MathText text="۱. سهموی (Parabolic): $\Delta = 0$" />
              </div>
              <p className="mt-1 text-ink-3">
                <MathText text="یک دسته مشخصه حقیقی مکرر. فرم کانونی $u_{\eta\eta} = \Phi$. مثال فیزیکی: معادله گرما و انتشار $u_t = k^2 u_{xx}$." />
              </p>
            </div>
            <div className="rounded-xl border border-line bg-surface p-3.5">
              <div className="font-bold text-accent-deep">
                <MathText text="۲. هذلولوی (Hyperbolic): $\Delta > 0$" />
              </div>
              <p className="mt-1 text-ink-3">
                <MathText text="دو دسته مشخصه حقیقی متمایز. فرم کانونی $u_{\xi\eta} = \Phi$. مثال فیزیکی: معادله موج و ارتعاش تار $u_{tt} = c^2 u_{xx}$." />
              </p>
            </div>
            <div className="rounded-xl border border-line bg-surface p-3.5">
              <div className="font-bold text-ok-ink">
                <MathText text="۳. بیضوی (Elliptic): $\Delta < 0$" />
              </div>
              <p className="mt-1 text-ink-3">
                <MathText text="دو دسته مشخصه مختلط مزدوج. فرم کانونی $u_{\alpha\alpha} + u_{\beta\beta} = \Phi$. مثال فیزیکی: معادله لاپلاس و پتانسیل $\nabla^2 u = 0$." />
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
