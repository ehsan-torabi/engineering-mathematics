'use client';

import React, { useState, useMemo } from 'react';
import {
  computeLaplaceRectangleCoefficients,
  evaluateLaplaceSeriesAt,
  evaluateLaplaceTopProfile,
  type LaplaceTopProfileId,
} from '@/lib/math-engine';
import { faNum } from '@/lib/persian-digits';
import MathFormula from './MathFormula';
import { Grid3X3, Sliders, Info, Layers } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const TOP_PRESETS: {
  id: LaplaceTopProfileId;
  labelFa: string;
  hintFa: string;
}[] = [
  { id: 'top_constant', labelFa: 'لبه یکنواخت', hintFa: 'f = ۱۰۰ ثابت؛ عمیق‌ترین نفوذ را ببینید' },
  { id: 'top_sine_bump', labelFa: 'تک‌مد سینوسی', hintFa: 'f = sin(πx/W)؛ جواب فقط یک جمله دارد' },
  { id: 'top_parabolic', labelFa: 'سهموی متقارن', hintFa: 'فقط هارمونیک‌های فرد فعال می‌شوند' },
  { id: 'top_tent', labelFa: 'چادر مرکزی', hintFa: 'قله تیز در وسط؛ هموار شدن با عمق' },
  { id: 'top_step', labelFa: 'پله‌ای (نیمه داغ)', hintFa: 'پرش در وسط لبه؛ فیلتر عمقی تیز را نرم می‌کند' },
  { id: 'top_gaussian', labelFa: 'لکه داغ گاوسی', hintFa: 'باند محدود؛ سریع‌ترین فراموشی عمق' },
];

const HEAT_NX = 40; // columns (x direction)
const HEAT_NY = 24; // rows (y direction, drawn top = y = H)

/** Discrete potential color from the shared chart token palette. */
function potentialColor(ratio: number): string {
  if (ratio < 0.06) return 'var(--panel)';
  if (ratio < 0.33) return 'var(--chart-accent)';
  if (ratio < 0.66) return 'var(--chart-warn)';
  return 'var(--chart-danger)';
}

/**
 * Interactive simulator for the Laplace (steady-state potential) problem in a
 * rectangle with zero left/right/bottom edges and prescribed top-edge data —
 * the exact sinh series of Module 8 (PDF Example 47).
 */
export default function LaplaceStage() {
  const [topProfile, setTopProfile] = useState<LaplaceTopProfileId>('top_step');
  const [widthW, setWidthW] = useState<number>(2);
  const [heightH, setHeightH] = useState<number>(2);
  const [cutY, setCutY] = useState<number>(1.0);

  const params = useMemo(
    () => ({ rectWidthW: widthW, rectHeightH: heightH, topProfile }),
    [widthW, heightH, topProfile]
  );

  const modeData = useMemo(
    () => computeLaplaceRectangleCoefficients(params, 24),
    [params]
  );

  const heatmap = useMemo(() => {
    // Grid sample of the potential; row 0 is drawn at the top edge (y = H).
    const values: number[][] = [];
    let maxU = 1;
    for (let j = 0; j <= HEAT_NY; j++) {
      const y = (j / HEAT_NY) * heightH;
      const row: number[] = [];
      for (let i = 0; i <= HEAT_NX; i++) {
        const x = (i / HEAT_NX) * widthW;
        const u = evaluateLaplaceSeriesAt(x, y, modeData);
        maxU = Math.max(maxU, Math.abs(u));
        row.push(u);
      }
      values.push(row);
    }
    return { values, maxU };
  }, [modeData, heightH, widthW]);

  const cutData = useMemo(() => {
    const samples = 60;
    const points: { x: number; u: number; f: number }[] = [];
    for (let i = 0; i <= samples; i++) {
      const x = (i / samples) * widthW;
      points.push({
        x: Math.round(x * 100) / 100,
        u: Math.round(evaluateLaplaceSeriesAt(x, cutY, modeData) * 10) / 10,
        f: Math.round(evaluateLaplaceTopProfile(topProfile, x, widthW) * 10) / 10,
      });
    }
    return points;
  }, [modeData, cutY, topProfile, widthW]);

  const firstModeDecay =
    Math.sinh((Math.PI * cutY) / widthW) / Math.sinh((Math.PI * heightH) / widthW);
  const activeModes = modeData.bn.filter((b) => Math.abs(b) > 0.5).length;

  const cellW = 520 / HEAT_NX;
  const cellH = 260 / HEAT_NY;

  return (
    <div className="space-y-4 rounded-xl border border-line bg-surface p-4 transition-colors sm:p-5">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-line pb-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-solid text-white">
            <Grid3X3 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink">آزمایشگاه معادله لاپلاس</h3>
            <p className="text-xs text-ink-3">
              پتانسیل حالت پایا در مستطیل با سه لبه صفر؛ داده لبه بالا را عوض کنید و «فراموشی عمق» را ببینید.
            </p>
          </div>
        </div>
        <MathFormula
          formula="u_{xx} + u_{yy} = 0 \quad , \quad u = \sum_{n=1}^{\infty} b_n \frac{\sinh(n\pi y/W)}{\sinh(n\pi H/W)} \sin\!\left(\frac{n\pi x}{W}\right)"
          block
          highlight
          className="text-xs"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Heatmap + cut chart */}
        <div className="space-y-4 rounded-xl border border-line bg-surface p-4 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-ink">
              <Layers className="h-4 w-4 text-accent" />
              <span>نقشه پتانسیل u(x, y)</span>
            </div>
            <div className="flex gap-1 text-[10px] text-ink-3">
              <span className="rounded px-1.5 py-0.5" style={{ background: 'var(--chart-danger)' }}>داغ</span>
              <span className="rounded px-1.5 py-0.5" style={{ background: 'var(--chart-warn)' }}>ولرم</span>
              <span className="rounded px-1.5 py-0.5 text-white" style={{ background: 'var(--chart-accent)' }}>سرد</span>
              <span className="rounded border border-line-strong px-1.5 py-0.5">صفر</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-line bg-panel">
            <svg
              viewBox="0 0 560 300"
              className="h-64 w-full"
              role="img"
              aria-label="نقشه دو بعدی توزیع پتانسیل حالت پایا در مستطیل با میرایی نمایی در عمق"
            >
              {heatmap.values
                .slice()
                .reverse() // draw y = H (data edge) on top
                .map((row, rj) =>
                  row.map((u, i) => {
                    const j = HEAT_NY - rj;
                    const y = (j / HEAT_NY) * heightH;
                    return (
                      <rect
                        key={`${i}-${j}`}
                        x={20 + i * cellW}
                        y={20 + rj * cellH}
                        width={cellW + 0.6}
                        height={cellH + 0.6}
                        fill={potentialColor(Math.abs(u) / heatmap.maxU)}
                      />
                    );
                  })
                )}

              {/* cut line */}
              {(() => {
                const cutRow = HEAT_NY - (cutY / heightH) * HEAT_NY;
                return (
                  <line
                    x1={20}
                    y1={20 + cutRow * cellH}
                    x2={20 + HEAT_NX * cellW}
                    y2={20 + cutRow * cellH}
                    stroke="var(--ink)"
                    strokeWidth="1.4"
                    strokeDasharray="6 4"
                  />
                );
              })()}

              {/* edge labels */}
              <text x={20} y={14} className="fill-(--chart-axis) font-mono text-[11px] font-bold">y = H</text>
              <text x={20} y={296} className="fill-(--chart-axis) font-mono text-[11px]">y = 0</text>
              <text x={20 + HEAT_NX * cellW + 4} y={34} className="fill-(--chart-axis) font-mono text-[10px]">x=0</text>
              <text x={20 + HEAT_NX * cellW + 4} y={286} className="fill-(--chart-axis) font-mono text-[10px]">x=W</text>
            </svg>
          </div>

          {/* Cut-depth slider */}
          <div className="rounded-lg border border-accent/30 bg-accent-soft p-3 dark:border-accent/30">
            <label className="mb-1 flex justify-between text-xs font-bold text-accent-deep">
              <span>عمق مقطع برش y*:</span>
              <span className="font-mono">{cutY.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min={0}
              max={heightH}
              step={0.05}
              value={cutY}
              onChange={(e) => setCutY(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <p className="mt-1 text-[11px] text-ink-4">
              میرایی مد اول در این عمق: <span className="font-mono font-bold">e ضریب sinh</span> = {firstModeDecay.toFixed(3)}
            </p>
          </div>

          {/* Cross-section chart */}
          <div className="rounded-xl border border-line bg-panel p-3">
            <h4 className="mb-1.5 text-xs font-bold text-ink-2">
              مقطع افقی u(x, y*) در برش انتخابی در برابر داده لبه f(x):
            </h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cutData} margin={{ top: 4, right: 8, left: -18, bottom: -8 }}>
                  <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="x" tick={{ fontSize: 10, fill: 'var(--chart-axis)' }} stroke="var(--chart-axis)" />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--chart-axis)' }} stroke="var(--chart-axis)" />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--panel)',
                      border: '1px solid var(--line-strong)',
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                  />
                  <Line type="monotone" dataKey="f" stroke="var(--chart-muted)" strokeWidth="1.6" strokeDasharray="5 4" dot={false} name="داده لبه f(x)" />
                  <Line type="monotone" dataKey="u" stroke="var(--chart-danger)" strokeWidth="2.4" dot={false} name="پتانسیل u(x, y*)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Parameter deck */}
        <div className="space-y-4 rounded-xl border border-line bg-surface p-4 lg:col-span-5">
          <h4 className="flex items-center gap-1.5 text-sm font-bold text-ink">
            <Sliders className="h-4 w-4 text-accent" />
            <span>تنظیم داده مرزی و هندسه مستطیل</span>
          </h4>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink-2">۱. داده لبه بالایی f(x):</label>
            <div className="grid grid-cols-2 gap-1.5">
              {TOP_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  title={p.hintFa}
                  onClick={() => setTopProfile(p.id)}
                  className={`rounded-lg border px-2 py-1.5 text-start text-[11px] font-semibold transition ${
                    topProfile === p.id
                      ? 'border-accent bg-accent-soft text-accent-deep'
                      : 'border-line-strong bg-panel text-ink-3 hover:bg-muted'
                  }`}
                >
                  {p.labelFa}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] leading-5 text-ink-4">
              {TOP_PRESETS.find((p) => p.id === topProfile)?.hintFa}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-lg border border-line bg-panel p-3">
            <div>
              <label className="mb-1 flex justify-between text-xs font-bold text-ink-2">
                <span>عرض W:</span>
                <span className="font-mono">{widthW.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min={1}
                max={4}
                step={0.1}
                value={widthW}
                onChange={(e) => setWidthW(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
            <div>
              <label className="mb-1 flex justify-between text-xs font-bold text-ink-2">
                <span>ارتفاع H:</span>
                <span className="font-mono">{heightH.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min={0.5}
                max={4}
                step={0.1}
                value={heightH}
                onChange={(e) => setHeightH(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
          </div>

          {/* Readouts */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-line bg-panel p-2">
              <div className="text-[10px] text-ink-4">میرایی مد اول در برش</div>
              <div className="font-mono text-sm font-bold text-ink">{firstModeDecay.toFixed(3)}</div>
            </div>
            <div className="rounded-lg border border-line bg-panel p-2">
              <div className="text-[10px] text-ink-4">مد فعال</div>
              <div className="font-mono text-sm font-bold text-ink">{faNum(activeModes)}</div>
            </div>
            <div className="rounded-lg border border-line bg-panel p-2">
              <div className="text-[10px] text-ink-4">میانگین لبه (۱/W)∫f</div>
              <div className="font-mono text-sm font-bold text-accent-deep">{modeData.topMean.toFixed(1)}</div>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-panel p-3">
            <h4 className="mb-1 text-xs font-bold text-ink-2">ضرایب سینوسی لبه (bₙ) — هشت مد اول:</h4>
            <div className="flex h-6 items-end gap-1">
              {modeData.bn.slice(0, 16).map((b, i) => {
                const maxB = Math.max(...modeData.bn.slice(0, 16).map((v) => Math.abs(v)), 1);
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t"
                    style={{
                      height: `${Math.max(3, (Math.abs(b) / maxB) * 100)}%`,
                      background: Math.abs(b) > 0.5 ? 'var(--chart-accent)' : 'var(--chart-muted)',
                    }}
                    title={`b${i + 1} = ${b.toFixed(2)}`}
                  />
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px] leading-5 text-ink-4">
              هرچه داده لبه هموارتر باشد، ضرایب مدهای بالا سریع‌تر صفر می‌شوند؛ در عمق نیز همین مدها با sinh میرا می‌شوند.
            </p>
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
            • با «پله‌ای» و عمق‌های مختلف: پرش وسط لبه در چه عمقی کاملاً هموار می‌شود؟ این با رفتار سری سینوسی در نقاط جهش چه قراردادی دارد؟
          </li>
          <li>
            • H را زیاد کنید: چرا پتانسیل در میانه مستطیل تقریباً مستقل از جزئیات لبه بالا و نزدیک به میانگین (۱/W)∫f می‌شود؟
          </li>
          <li>
            • با «تک‌مد سینوسی» چرا نقشه فقط یک الگوی نوسانی ساده دارد؟ تعداد مد فعال را با پروفایل‌های دیگر مقایسه کنید.
          </li>
        </ul>
      </div>
    </div>
  );
}
