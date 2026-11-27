'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  computeWaveModeData,
  evaluateWaveSeriesAt,
  type WaveInitialProfileId,
} from '@/lib/math-engine';
import { faNum } from '@/lib/persian-digits';
import MathFormula from './MathFormula';
import { Play, Pause, RotateCcw, Waves, Sliders, Info } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const PROFILE_PRESETS: {
  id: WaveInitialProfileId;
  labelFa: string;
  hintFa: string;
}[] = [
  {
    id: 'sine_mode_1',
    labelFa: 'مد اول خالص',
    hintFa: 'f = sin(πx/L)؛ فقط یک نوسان‌گر هماهنگ',
  },
  {
    id: 'two_modes',
    labelFa: 'ترکیب دو مد',
    hintFa: 'مد اول + مد دوم؛ ضربه دوفرکانسی',
  },
  {
    id: 'pluck_tent',
    labelFa: 'زخش وسط تار (گیتار)',
    hintFa: 'پروفایل چادری متقارن؛ رها از سکون',
  },
  {
    id: 'pluck_quarter',
    labelFa: 'زخش نامتقارن در یک‌چهارم',
    hintFa: 'چادر در x = L/4؛ موج مسیردار نامتقارن',
  },
  {
    id: 'strike_center',
    labelFa: 'ضربه چکش در وسط (پیانو)',
    hintFa: 'شکل صفر؛ سرعت اولیه گاوسی در مرکز',
  },
  {
    id: 'gaussian_pluck',
    labelFa: 'پالس گاوسی باریک',
    hintFa: 'قله تیز؛ جداشدن دو نیم‌پالس را ببینید',
  },
  {
    id: 'flat_displacement',
    labelFa: 'جابه‌جایی یکنواخت',
    hintFa: 'ویژه سرهای آزاد؛ مد صفر رانشی',
  },
  {
    id: 'sine_forcing_first',
    labelFa: 'ضربه سرعت مد اول',
    hintFa: 'f = 0 و g ∝ sin(πx/L)؛ شروع از سکون',
  },
];

const SVG_W = 640;
const SVG_H = 300;
const PLOT_LEFT = 42;
const PLOT_RIGHT = SVG_W - 42;
const PLOT_TOP = 34;
const PLOT_BOTTOM = SVG_H - 40;

/**
 * Interactive simulator for the 1D wave equation u_tt = a²u_xx on a finite
 * string with fixed or free ends — normal-mode series solution (Module 7).
 */
export default function WaveEquationStage() {
  const [bcType, setBcType] = useState<'dirichlet_fixed' | 'neumann_free'>(
    'dirichlet_fixed'
  );
  const [profile, setProfile] = useState<WaveInitialProfileId>('pluck_tent');
  const [waveSpeedA, setWaveSpeedA] = useState<number>(1);
  const [timeT, setTimeT] = useState<number>(0.6);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const L = 3.14; // string length fixed at π so modes stay in integer frequencies
  const omega1 = (waveSpeedA * Math.PI) / L;
  const period1 = (2 * Math.PI) / omega1;
  const loopT = 4 * period1; // two full fundamental cycles per loop

  // Scenario changes restart the simulation from t = 0 (reset at the call site,
  // not in an effect, per react-hooks/set-state-in-effect).
  const changeScenario = (apply: () => void) => {
    setIsPlaying(false);
    setTimeT(0);
    apply();
  };

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setTimeT((prev) => {
        const next = prev + 0.02 * playbackSpeed;
        return next >= loopT ? 0 : next;
      });
    }, 40);
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, loopT]);

  const waveData = useMemo(() => {
    const samples = 90;
    const params = { stringLengthL: L, waveSpeedA: waveSpeedA, timeT, bcType, initialProfile: profile };
    // Quadrature runs once; each animation frame only re-evaluates the series.
    const modeData = computeWaveModeData(params, 16);

    const points: { x: number; uNow: number; uInit: number; vNow: number }[] = [];
    let maxAbs = 1;
    for (let i = 0; i <= samples; i++) {
      const x = (i / samples) * L;
      const now = evaluateWaveSeriesAt(x, timeT, modeData);
      const init = evaluateWaveSeriesAt(x, 0, modeData);
      maxAbs = Math.max(maxAbs, Math.abs(now.u), Math.abs(init.u));
      points.push({ x, uNow: now.u, uInit: init.u, vNow: now.v });
    }

    const mid = evaluateWaveSeriesAt(L / 2, timeT, modeData);
    const activeModes = modeData.Cn.filter((c) => Math.abs(c) > 0.5).length;

    return {
      points,
      midU: mid.u,
      midV: mid.v,
      coeffs: modeData.Cn,
      maxAbs: maxAbs * 1.15,
      activeModes,
    };
  }, [timeT, waveSpeedA, bcType, profile, L]);

  const mapX = (x: number) => PLOT_LEFT + (x / L) * (PLOT_RIGHT - PLOT_LEFT);
  const mapY = (u: number) =>
    (SVG_H + PLOT_TOP - PLOT_BOTTOM) / 2 +
    PLOT_TOP * 0 +
    (PLOT_BOTTOM - PLOT_TOP) / 2 -
    (u / waveData.maxAbs) * ((PLOT_BOTTOM - PLOT_TOP) / 2);

  const pathOf = (key: 'uNow' | 'uInit') =>
    waveData.points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${mapX(p.x).toFixed(2)} ${mapY(p[key]).toFixed(2)}`)
      .join(' ');

  const spectrumData = useMemo(
    () =>
      waveData.coeffs.slice(0, 8).map((c, i) => ({
        mode: `n=${faNum(i + 1)}`,
        amp: Math.abs(Math.round(c * 10) / 10),
      })),
    [waveData.coeffs]
  );

  return (
    <div className="space-y-4 rounded-xl border border-line bg-surface p-4 transition-colors sm:p-5">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-line pb-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-solid text-white">
            <Waves className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink">آزمایشگاه معادله موج</h3>
            <p className="text-xs text-ink-3">
              ارتعاش تار با مدهای نرمال: شکل اولیه و سرعت اولیه را تنظیم کنید و انتشار و بازگشت موج را ببینید.
            </p>
          </div>
        </div>
        <MathFormula
          formula="u_{tt} = a^2 u_{xx} \quad , \quad \omega_n = \frac{an\pi}{L}"
          block
          highlight
          className="text-xs"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Visualization column */}
        <div className="space-y-4 rounded-xl border border-line bg-surface p-4 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-ink">
              <span>شکل لحظه‌ای تار در</span>
              <span className="rounded-md border border-line-strong bg-panel px-1.5 py-0.5 font-mono text-xs text-ink-2">
                t = {timeT.toFixed(2)}
              </span>
            </div>
            <div className="flex gap-3 text-[11px] text-ink-3">
              <span>
                فرکانس مد اول: <span className="font-mono font-bold text-accent-deep">ω₁ = {omega1.toFixed(2)}</span>
              </span>
              <span>
                دوره تناوب: <span className="font-mono font-bold text-accent-deep">T₁ = {period1.toFixed(2)}s</span>
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-line bg-panel">
            <svg
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              className="h-56 w-full"
              role="img"
              aria-label="نمودار شکل لحظه‌ای تار ارتعاشی در حالت موج ایستاده"
            >
              {/* supports (walls) */}
              <rect x={PLOT_LEFT - 14} y={PLOT_TOP - 16} width={10} height={PLOT_BOTTOM - PLOT_TOP + 32} rx={2} fill="var(--chart-axis)" />
              <rect x={PLOT_RIGHT + 4} y={PLOT_TOP - 16} width={10} height={PLOT_BOTTOM - PLOT_TOP + 32} rx={2} fill="var(--chart-axis)" />

              {/* equilibrium line */}
              <line
                x1={PLOT_LEFT}
                y1={mapY(0)}
                x2={PLOT_RIGHT}
                y2={mapY(0)}
                stroke="var(--chart-grid)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {/* initial profile */}
              <path d={pathOf('uInit')} fill="none" stroke="var(--chart-muted)" strokeWidth="1.8" strokeDasharray="5 4" />

              {/* current shape */}
              <path d={pathOf('uNow')} fill="none" stroke="var(--chart-danger)" strokeWidth="3" strokeLinecap="round" />

              {/* midpoint probe */}
              <circle cx={mapX(L / 2)} cy={mapY(waveData.midU)} r={4.5} fill="var(--chart-danger)" stroke="var(--panel)" strokeWidth="1.5" />

              <text x={PLOT_LEFT - 24} y={mapY(0) + 4} className="fill-(--chart-axis) font-mono text-[11px] font-bold">0</text>
              <text x={(PLOT_LEFT + PLOT_RIGHT) / 2 - 12} y={SVG_H - 12} className="fill-(--chart-axis) font-mono text-[11px]">x = L/2</text>
              <text x={PLOT_RIGHT + 6} y={mapY(0) + 4} className="fill-(--chart-axis) font-mono text-[11px] font-bold">L</text>
            </svg>
          </div>

          {/* Playback controls */}
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
                    توقف ارتعاش
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" />
                    اجرای ارتعاش
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
                onClick={() => setPlaybackSpeed((s) => (s === 1 ? 2 : s === 2 ? 0.5 : 1))}
                className="rounded-lg border border-line-strong bg-surface px-2.5 py-1.5 font-mono text-xs font-bold text-ink-2"
              >
                {playbackSpeed}x
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-ink-3">
              <span className="flex items-center gap-1">
                <span className="inline-block h-0.5 w-3.5 bg-line-strong" />
                شکل اولیه f(x)
              </span>
              <span className="flex items-center gap-1 font-bold text-danger-ink">
                <span className="inline-block h-1 w-3.5 bg-danger-solid" />
                شکل لحظه‌ای u(x,t)
              </span>
            </div>
          </div>

          {/* Time slider */}
          <div className="rounded-lg border border-line bg-panel p-3">
            <label className="mb-1 flex justify-between text-xs font-bold text-ink-2">
              <span>زمان t (بر حسب ثانیه شبیه‌سازی):</span>
              <span className="font-mono">{timeT.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min={0}
              max={loopT}
              step={0.01}
              value={timeT}
              onChange={(e) => {
                setIsPlaying(false);
                setTimeT(Number(e.target.value));
              }}
              className="w-full accent-accent"
            />
          </div>
        </div>

        {/* Parameter deck */}
        <div className="space-y-4 rounded-xl border border-line bg-surface p-4 lg:col-span-5">
          <h4 className="flex items-center gap-1.5 text-sm font-bold text-ink">
            <Sliders className="h-4 w-4 text-accent" />
            <span>تنظیم سرهای تار، داده اولیه و سرعت موج</span>
          </h4>

          {/* BC selector */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink-2">۱. شرایط مرزی دو سر تار:</label>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                { id: 'dirichlet_fixed' as const, label: 'دو سر ثابت: u(0,t) = u(L,t) = 0 — سری سینوسی' },
                { id: 'neumann_free' as const, label: 'دو سر آزاد: u_x(0,t) = u_x(L,t) = 0 — سری کسینوسی + مد رانش' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => changeScenario(() => setBcType(opt.id))}
                  className={`rounded-lg border px-3 py-2 text-start text-xs font-semibold transition ${
                    bcType === opt.id
                      ? 'border-accent bg-accent-soft text-accent-deep'
                      : 'border-line-strong bg-panel text-ink-3 hover:bg-muted'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Wave speed slider */}
          <div className="rounded-lg border border-accent/30 bg-accent-soft p-3 dark:border-accent/30">
            <label className="mb-1 flex justify-between text-xs font-bold text-accent-deep">
              <span>سرعت موج a = √(T/ρ):</span>
              <span className="font-mono">{waveSpeedA.toFixed(1)}</span>
            </label>
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.1}
              value={waveSpeedA}
              onChange={(e) => setWaveSpeedA(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          {/* Initial profile selector */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink-2">۲. داده اولیه تار (f و g):</label>
            <div className="grid grid-cols-2 gap-1.5">
              {PROFILE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  title={p.hintFa}
                  onClick={() => changeScenario(() => setProfile(p.id))}
                  className={`rounded-lg border px-2 py-1.5 text-start text-[11px] font-semibold transition ${
                    profile === p.id
                      ? 'border-accent bg-accent-soft text-accent-deep'
                      : 'border-line-strong bg-panel text-ink-3 hover:bg-muted'
                  }`}
                >
                  {p.labelFa}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] leading-5 text-ink-4">
              {PROFILE_PRESETS.find((p) => p.id === profile)?.hintFa}
            </p>
          </div>

          {/* Mode spectrum */}
          <div className="rounded-xl border border-line bg-panel p-3">
            <h4 className="mb-1.5 flex items-center justify-between text-xs font-bold text-ink-2">
              <span>طیف دامنه مدها |Cₙ| (از شرایط اولیه):</span>
              <span className="text-[11px] font-normal text-ink-4">
                {faNum(waveData.activeModes)} مد فعال
              </span>
            </h4>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spectrumData} margin={{ top: 2, right: 4, left: -22, bottom: -8 }}>
                  <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="mode" tick={{ fontSize: 10, fill: 'var(--chart-axis)' }} stroke="var(--chart-axis)" />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--chart-axis)' }} stroke="var(--chart-axis)" />
                  <Tooltip
                    cursor={{ fill: 'var(--accent-soft)' }}
                    contentStyle={{
                      background: 'var(--panel)',
                      border: '1px solid var(--line-strong)',
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                  />
                  <Bar dataKey="amp" fill="var(--chart-accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-1 text-[11px] leading-5 text-ink-4">
              دامنه هر مد در زمان ثابت است (پایستگی انرژی)؛ فقط فازها با ωₙ می‌چرخند.
            </p>
          </div>

          {/* Readouts */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-line bg-panel p-2">
              <div className="text-[10px] text-ink-4">جابه‌جایی وسط تار</div>
              <div className="font-mono text-sm font-bold text-ink">{waveData.midU.toFixed(2)}</div>
            </div>
            <div className="rounded-lg border border-line bg-panel p-2">
              <div className="text-[10px] text-ink-4">سرعت وسط تار</div>
              <div className="font-mono text-sm font-bold text-ink">{waveData.midV.toFixed(2)}</div>
            </div>
            <div className="rounded-lg border border-line bg-panel p-2">
              <div className="text-[10px] text-ink-4">فرکانس مد اول</div>
              <div className="font-mono text-sm font-bold text-accent-deep">{omega1.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Observation prompts */}
      <div className="rounded-xl border border-line bg-panel p-3.5">
        <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink-2">
          <Info className="h-3.5 w-3.5 text-accent" />
          سوال‌های تحلیلی آزمایش:
        </h4>
        <ul className="space-y-1 text-[11px] leading-5 text-ink-3">
          <li>
            • با «زخش نامتقارن در یک‌چهارم» پخش را اجرا کنید: چرا شکل تار پس از برخورد به سر ثابت وارون می‌شود و چرا دامنه هرگز از حداکثر اولیه فراتر نمی‌رود؟
          </li>
          <li>
            • سرعت موج a را دو برابر کنید: فرکانس‌های ωₙ چقدر تغییر می‌کنند و دوره تناوب تصویر چه رابطه‌ای با a دارد؟
          </li>
          <li>
            • با «جابه‌جایی یکنواخت» روی سرهای آزاد، مد رانشی A₀ + B₀t را مشاهده کنید: چرا همین پروفایل روی سرهای ثابت اصلاً رخ نمی‌دهد؟
          </li>
        </ul>
      </div>
    </div>
  );
}
