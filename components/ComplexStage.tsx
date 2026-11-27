'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  evaluateComplexPreset,
  computeContourIntegral,
  type ComplexPresetId,
  type ContourPresetId,
} from '@/lib/math-engine';
import { faNum } from '@/lib/persian-digits';
import MathFormula from './MathFormula';
import { Palette, Orbit, Info, Sliders } from 'lucide-react';

const DOMAIN_PRESETS: {
  id: ComplexPresetId;
  labelFa: string;
  hintFa: string;
  poles: { re: number; im: number }[];
}[] = [
  { id: 'identity', labelFa: 'تابع همانی z', hintFa: 'دوران و مقیاس خالص؛ رنگ‌ها یک‌بار دور می‌زنند', poles: [] },
  { id: 'square', labelFa: 'توان دو z²', hintFa: 'هر رنگ دو بار تکرار می‌شود: نگاشت دو به یک', poles: [] },
  { id: 'inverse', labelFa: 'معکوس 1/z', hintFa: 'چرخش رنگ حول قطب مبدأ؛ انرژی به مرز می‌رود', poles: [{ re: 0, im: 0 }] },
  { id: 'conjugate', labelFa: 'مزدوج z̄', hintFa: 'جهت چرخش رنگ برعکس است: هیچ‌جا تحلیلی نیست!', poles: [] },
  { id: 'exp_z', labelFa: 'نمایی eᶻ', hintFa: 'تناوب عمودی ۲πi؛ نوارهای رنگی افقی تکرار می‌شوند', poles: [] },
  { id: 'sin_z', labelFa: 'سینوس sin z', hintFa: 'روی محور موهومی رشد هیپربولیک می‌بیند', poles: [] },
  { id: 'rational_poles', labelFa: 'گویا 1/(z²+1)', hintFa: 'دو قطب در ±i؛ دو چرخه رنگ کامل', poles: [{ re: 0, im: 1 }, { re: 0, im: -1 }] },
  { id: 'log_principal', labelFa: 'لگاریتم اصلی Ln z', hintFa: 'شاخه اصلی: روی نیم‌خط منفی رنگ می‌شکند', poles: [] },
];

const CONTOUR_PRESETS: {
  id: ContourPresetId;
  labelFa: string;
  hintFa: string;
  defaultCenter: { re: number; im: number };
  defaultRadius: number;
}[] = [
  {
    id: 'pole_simple',
    labelFa: 'قطب ساده 1/(z−2)',
    hintFa: 'مانده ۱ در z = 2 (خانواده مثال‌های ۱۰۵ و ۱۰۶)',
    defaultCenter: { re: 2, im: 0 },
    defaultRadius: 0.8,
  },
  {
    id: 'rational_two_poles',
    labelFa: 'دو قطب 1/((z−1)(z−3))',
    hintFa: 'مانده‌ها −½ و +½؛ جمع‌شان صفر است (مثال ۱۰۰)',
    defaultCenter: { re: 2, im: 0 },
    defaultRadius: 1.6,
  },
  {
    id: 'essential_exp',
    labelFa: 'تکین اساسی z·e^(z/(z−2))',
    hintFa: 'مانده ۶e از بسط لوران — دقیقاً مثال ۱۰۷',
    defaultCenter: { re: 2, im: 0 },
    defaultRadius: 1.2,
  },
  {
    id: 'exp_over_tan',
    labelFa: 'eᶻ/tan z روی |z| = 1',
    hintFa: 'فقط قطب مبدأ داخل مسیر است؛ مانده ۱ — مثال ۱۰۸',
    defaultCenter: { re: 0, im: 0 },
    defaultRadius: 1,
  },
];

const CANVAS_W = 240;
const CANVAS_H = 160;
const VIEW_HALF_W = 3; // window [-3, 3] on the real axis

/** HSL hue from arg(f) and brightness from log|f| — classic domain coloring. */
function domainColor(re: number, im: number): [number, number, number] {
  if (!Number.isFinite(re) || !Number.isFinite(im)) return [0, 0, 0];
  const modulus = Math.hypot(re, im);
  if (modulus < 1e-9) return [28, 30, 42]; // neutral dark for f = 0
  const hue = ((Math.atan2(im, re) * 180) / Math.PI + 360) % 360;
  const s = Math.log1p(modulus);
  const lightness = Math.min(0.92, 0.22 + 0.16 * s);
  return hslToRgb(hue, 0.62, lightness);
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

/**
 * Interactive simulator for Module 9: domain coloring of preset complex
 * functions (analytic vs non-analytic, poles, branch cut) plus numeric
 * contour integrals validated against the residue theorem.
 */
export default function ComplexStage() {
  const [domainPreset, setDomainPreset] = useState<ComplexPresetId>('inverse');
  const [contourPresetId, setContourPresetId] = useState<ContourPresetId>('rational_two_poles');
  const [centerRe, setCenterRe] = useState<number>(2);
  const [centerIm, setCenterIm] = useState<number>(0);
  const [radius, setRadius] = useState<number>(1.6);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const contourPreset = CONTOUR_PRESETS.find((p) => p.id === contourPresetId)!;

  // Apply preset defaults when switching contour functions (call-site reset
  // instead of a state-resetting effect, per react-hooks/set-state-in-effect).
  const chooseContour = (id: ContourPresetId) => {
    const preset = CONTOUR_PRESETS.find((p) => p.id === id)!;
    setContourPresetId(id);
    setCenterRe(preset.defaultCenter.re);
    setCenterIm(preset.defaultCenter.im);
    setRadius(preset.defaultRadius);
  };

  const contour = useMemo(
    () => computeContourIntegral(contourPresetId, centerRe, centerIm, radius),
    [contourPresetId, centerRe, centerIm, radius]
  );

  // Render the domain-coloring canvas whenever the preset changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const image = ctx.createImageData(CANVAS_W, CANVAS_H);
    const viewHalfH = (VIEW_HALF_W * CANVAS_H) / CANVAS_W / 1; // keeps aspect square
    for (let py = 0; py < CANVAS_H; py++) {
      const y = viewHalfH * (1 - (2 * py) / CANVAS_H);
      for (let px = 0; px < CANVAS_W; px++) {
        const x = -VIEW_HALF_W + (2 * VIEW_HALF_W * px) / CANVAS_W;
        const fz = evaluateComplexPreset(domainPreset, x, y);
        const re = fz.re;
        const im = fz.im;
        let rgb: [number, number, number];
        // paint the coordinate axes faintly
        const onAxis =
          Math.abs(x) < VIEW_HALF_W / CANVAS_W || Math.abs(y) < (2 * viewHalfH) / CANVAS_H;
        if (!Number.isFinite(re)) {
          rgb = [10, 15, 26]; // hole: pole or branch point
        } else {
          rgb = domainColor(re, im);
          if (onAxis) {
            rgb = [
              Math.round(rgb[0] * 0.55 + 128 * 0.45),
              Math.round(rgb[1] * 0.55 + 138 * 0.45),
              Math.round(rgb[2] * 0.55 + 148 * 0.45),
            ];
          }
        }
        const idx = 4 * (py * CANVAS_W + px);
        image.data[idx] = rgb[0];
        image.data[idx + 1] = rgb[1];
        image.data[idx + 2] = rgb[2];
        image.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(image, 0, 0);
  }, [domainPreset]);

  const activeDomain = DOMAIN_PRESETS.find((p) => p.id === domainPreset)!;

  return (
    <div className="space-y-4 rounded-xl border border-line bg-surface p-4 transition-colors sm:p-5">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-line pb-3.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-solid text-white">
            <Palette className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink">آزمایشگاه آنالیز مختلط</h3>
            <p className="text-xs text-ink-3">
              نقشه دامنه‌رنگی توابع مختلط و آزمون زنده قضیه مانده‌ها: انتگرال عددی در برابر 2πi·Σمانده‌ها.
            </p>
          </div>
        </div>
        <MathFormula
          formula="\oint_C f(z)\,dz = 2\pi i \sum_{k} \operatorname{Res}(f, z_k)"
          block
          highlight
          className="text-xs"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Domain coloring + contour readouts */}
        <div className="space-y-4 rounded-xl border border-line bg-surface p-4 lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-ink">
              <Palette className="h-4 w-4 text-accent" />
              <span>نقشه دامنه‌رنگی f(z)</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-ink-3">
              <span>طیف رنگ = آرگومان</span>
              <span className="inline-block h-2.5 w-16 rounded-full" style={{ background: 'linear-gradient(90deg, hsl(0,62%,50%), hsl(60,62%,50%), hsl(120,62%,50%), hsl(180,62%,50%), hsl(240,62%,50%), hsl(300,62%,50%), hsl(360,62%,50%))' }} />
              <span>روشنایی = log|f|</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-line bg-panel">
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="h-64 w-full"
              style={{ imageRendering: 'auto' }}
              role="img"
              aria-label="نقشه دامنه‌رنگی تابع مختلط انتخابی روی صفحه مختلط"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink-2">۱. تابع مختلط برای رنگ‌آمیزی:</label>
            <div className="grid grid-cols-2 gap-1.5">
              {DOMAIN_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  title={p.hintFa}
                  onClick={() => setDomainPreset(p.id)}
                  className={`rounded-lg border px-2 py-1.5 text-start text-[11px] font-semibold transition ${
                    domainPreset === p.id
                      ? 'border-accent bg-accent-soft text-accent-deep'
                      : 'border-line-strong bg-panel text-ink-3 hover:bg-muted'
                  }`}
                >
                  {p.labelFa}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] leading-5 text-ink-4">
              {activeDomain.hintFa}
            </p>
          </div>

          {/* Contour integral section */}
          <div className="rounded-xl border border-line bg-panel p-3">
            <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink-2">
              <Orbit className="h-3.5 w-3.5 text-accent" />
              <span>انتگرال بسته روی دایره: عددی در برابر قضیه مانده‌ها</span>
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-line bg-surface p-2">
                <div className="text-[10px] text-ink-4">انتگرال عددی (سیمپسون)</div>
                <div className="font-mono text-xs font-bold text-ink" dir="ltr">
                  {contour.numeric.re.toFixed(3)} {contour.numeric.im >= 0 ? '+' : '−'} {Math.abs(contour.numeric.im).toFixed(3)}i
                </div>
              </div>
              <div className="rounded-lg border border-line bg-surface p-2">
                <div className="text-[10px] text-ink-4">۲πi × Σمانده‌های داخل</div>
                <div className="font-mono text-xs font-bold text-accent-deep" dir="ltr">
                  {contour.analytic.re.toFixed(3)} {contour.analytic.im >= 0 ? '+' : '−'} {Math.abs(contour.analytic.im).toFixed(3)}i
                </div>
              </div>
              <div className="rounded-lg border border-line bg-surface p-2">
                <div className="text-[10px] text-ink-4">خطای نسبی</div>
                <div className="font-mono text-xs font-bold text-ink">
                  {contour.relativeError < 1e-10 ? '≈ ۰' : contour.relativeError.toExponential(1)}
                </div>
              </div>
            </div>

            <div className="mt-2.5 space-y-1">
              {contour.poles.map((p, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[11px]">
                  <span className="font-mono text-ink-2" dir="ltr">
                    z = {p.re.toFixed(2)} {p.im >= 0 ? '+' : '−'} {Math.abs(p.im).toFixed(2)}i
                  </span>
                  <span className="font-mono text-ink-3" dir="ltr">
                    Res = {p.residue.re.toFixed(2)} {p.residue.im >= 0 ? '+' : '−'} {Math.abs(p.residue.im).toFixed(2)}i
                  </span>
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                      p.inside
                        ? 'bg-accent-soft text-accent-deep'
                        : 'bg-muted text-ink-4'
                    }`}
                  >
                    {p.inside ? 'داخل مسیر ✓' : 'بیرون مسیر'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Parameter deck */}
        <div className="space-y-4 rounded-xl border border-line bg-surface p-4 lg:col-span-5">
          <h4 className="flex items-center gap-1.5 text-sm font-bold text-ink">
            <Sliders className="h-4 w-4 text-accent" />
            <span>تنظیم تابع تحت انتگرال و دایره مسیر</span>
          </h4>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-ink-2">۲. تابع تحت انتگرال:</label>
            <div className="grid grid-cols-1 gap-1.5">
              {CONTOUR_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  title={p.hintFa}
                  onClick={() => chooseContour(p.id)}
                  className={`rounded-lg border px-3 py-2 text-start text-xs font-semibold transition ${
                    contourPresetId === p.id
                      ? 'border-accent bg-accent-soft text-accent-deep'
                      : 'border-line-strong bg-panel text-ink-3 hover:bg-muted'
                  }`}
                >
                  {p.labelFa}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] leading-5 text-ink-4">{contourPreset.hintFa}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-lg border border-line bg-panel p-3">
            <div>
              <label className="mb-1 flex justify-between text-[11px] font-bold text-ink-2">
                <span>مرکز Re:</span>
                <span className="font-mono">{centerRe.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min={-1}
                max={4}
                step={0.1}
                value={centerRe}
                onChange={(e) => setCenterRe(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
            <div>
              <label className="mb-1 flex justify-between text-[11px] font-bold text-ink-2">
                <span>مرکز Im:</span>
                <span className="font-mono">{centerIm.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min={-2}
                max={2}
                step={0.1}
                value={centerIm}
                onChange={(e) => setCenterIm(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
            <div>
              <label className="mb-1 flex justify-between text-[11px] font-bold text-ink-2">
                <span>شعاع:</span>
                <span className="font-mono">{radius.toFixed(1)}</span>
              </label>
              <input
                type="range"
                min={0.3}
                max={3}
                step={0.1}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
          </div>

          <div className="rounded-lg border border-accent/30 bg-accent-soft p-3 text-[11px] leading-5 text-accent-deep dark:border-accent/30">
            عدد {faNum(contour.poles.filter((p) => p.inside).length)} مانده داخل مسیر شمرده می‌شود؛ انتگرال عددی روی همان دایره با {faNum(1440)} نمونه سیمپسون محاسبه شده و همیشه با ۲πi·Σمانده‌ها هم‌ارز درمی‌آید.
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
            • «مزدوج z̄» و «همانی z» را مقایسه کنید: جهت چرخش رنگ حول مبدأ چه تفاوتی دارد و این با تحلیلی نبودن z̄ چه ارتباطی دارد؟
          </li>
          <li>
            • در «لگاریتم اصلی» شکست رنگ روی کدام نیم‌خط است؟ با نقاط غیرتحلیلی شاخه اصلی که در درس‌نامه انتگرال‌گیری دیدید مقایسه کنید.
          </li>
          <li>
            • مسیر «دو قطب» را جابه‌جا کنید تا فقط یکی داخل بماند: انتگرال چند می‌شود و چرا وقتی هر دو داخل‌اند جواب صفر است؟
          </li>
        </ul>
      </div>
    </div>
  );
}
