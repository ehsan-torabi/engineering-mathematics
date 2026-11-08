'use client';

import React from 'react';

/* ═══════════════════════════════════════════════════════════════════════
 * Hand-drawn SVG concept figures for lesson subtopics.
 * All strokes/labels read the app's semantic tokens, so every figure is
 * crisp at any size and adapts to light/dark automatically.
 * Math cells use the KaTeX serif italic look; Persian labels inherit the
 * app font. Each figure is pure presentation — no state, no effects.
 * ═══════════════════════════════════════════════════════════════════════ */

const MATH_FONT = "KaTeX_Math, 'Cambria Math', 'Times New Roman', serif";

function SvgFrame({
  viewBox,
  label,
  children,
}: {
  viewBox: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <svg
      viewBox={viewBox}
      className="h-auto w-full"
      role="img"
      aria-label={label}
      direction="ltr"
    >
      {children}
    </svg>
  );
}

/** Persian label text: bidi-RTL content, center-anchored so anchoring is
 *  independent of paragraph direction. */
function FaText({
  x,
  y,
  size = 12.5,
  fill = 'var(--ink-2)',
  weight = '700',
  anchor = 'middle',
  children,
}: {
  x: number;
  y: number;
  size?: number;
  fill?: string;
  weight?: string;
  anchor?: 'middle' | 'start' | 'end';
  children: React.ReactNode;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      fontWeight={weight}
      fill={fill}
      direction="rtl"
    >
      {children}
    </text>
  );
}

/** Math label text: LTR, KaTeX-style serif italic. */
function MathTextSvg({
  x,
  y,
  size = 13,
  fill = 'var(--ink-2)',
  anchor = 'middle',
  children,
}: {
  x: number;
  y: number;
  size?: number;
  fill?: string;
  anchor?: 'middle' | 'start' | 'end';
  children: React.ReactNode;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      fontFamily={MATH_FONT}
      fontStyle="italic"
      fill={fill}
    >
      {children}
    </text>
  );
}

/** polyline path from sampled points */
function pts(points: [number, number][]): string {
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
}

/* ── 1. Tabular DI (integration by parts table) ─────────────────────── */

export function TabularDIFigure() {
  const colX: { sign: [number, number]; d: [number, number]; i: [number, number] } = {
    sign: [96, 168],
    d: [168, 384],
    i: [384, 600],
  };
  const headerY = 36;
  const rowH = 52;
  const rowsY0 = 64;
  const rowCenter = (r: number) => rowsY0 + rowH * r + rowH / 2; // r = 0..3
  const tableBottom = rowsY0 + rowH * 4;
  const cx = (a: number, b: number) => (a + b) / 2;

  const rows = [
    { sign: '+', d: 'x²', i: 'cos(nx)' },
    { sign: '−', d: '2x', i: 'sin(nx)/n' },
    { sign: '+', d: '2', i: '−cos(nx)/n²' },
    { sign: '−', d: '0', i: '−sin(nx)/n³' },
  ];

  return (
    <SvgFrame viewBox="0 0 696 388" label="جدول انتگرال‌گیری جزء به جزء جدولی با ضرب قطری">
      <defs>
        <marker id="di-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--chart-accent)" />
        </marker>
        <marker id="di-arrow-h" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--chart-danger)" />
        </marker>
      </defs>

      {/* column headers */}
      <FaText x={cx(...colX.sign)} y={headerY} fill="var(--ink-3)">علامت</FaText>
      <FaText x={cx(...colX.d)} y={headerY} fill="var(--chart-accent)">ستون D (مشتق‌گیری)</FaText>
      <FaText x={cx(...colX.i)} y={headerY} fill="var(--ink-2)">ستون I (انتگرال‌گیری)</FaText>

      {/* grid */}
      {[0, 1, 2, 3, 4].map((r) => (
        <line key={`h${r}`} x1={colX.sign[0]} y1={rowsY0 + rowH * r} x2={colX.i[1]} y2={rowsY0 + rowH * r} stroke="var(--chart-grid)" strokeWidth="1.5" />
      ))}
      <line x1={colX.sign[0]} y1={rowsY0} x2={colX.sign[0]} y2={tableBottom} stroke="var(--chart-grid)" strokeWidth="1.5" />
      <line x1={colX.d[0]} y1={rowsY0} x2={colX.d[0]} y2={tableBottom} stroke="var(--chart-grid)" strokeWidth="1.5" />
      <line x1={colX.i[0]} y1={rowsY0} x2={colX.i[0]} y2={tableBottom} stroke="var(--chart-grid)" strokeWidth="1.5" />
      <line x1={colX.i[1]} y1={rowsY0} x2={colX.i[1]} y2={tableBottom} stroke="var(--chart-grid)" strokeWidth="1.5" />

      {/* cells */}
      {rows.map((row, r) => (
        <g key={r}>
          <text x={cx(...colX.sign)} y={rowCenter(r) + 5} textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--chart-muted)">{row.sign}</text>
          <MathTextSvg x={cx(...colX.d)} y={rowCenter(r) + 6} size={17} fill="var(--chart-accent)">{row.d}</MathTextSvg>
          <MathTextSvg x={cx(...colX.i)} y={rowCenter(r) + 6} size={17} fill="var(--ink-2)">{row.i}</MathTextSvg>
        </g>
      ))}

      {/* diagonal multiply arrows D_k ↘ I_{k+1} */}
      {[0, 1, 2].map((r) => (
        <path
          key={`dg${r}`}
          d={`M ${cx(...colX.d) + 44} ${rowCenter(r) + 17} L ${cx(...colX.i) - 44} ${rowCenter(r + 1) - 17}`}
          stroke="var(--chart-accent)"
          strokeWidth="2.5"
          fill="none"
          markerEnd="url(#di-arrow)"
        />
      ))}

      {/* horizontal stop rule on last row: arrow + ∫ dx = 0 + caption */}
      <path
        d={`M ${cx(...colX.i) + 52} ${tableBottom + 24} L ${cx(...colX.d) - 16} ${tableBottom + 24}`}
        stroke="var(--chart-danger)"
        strokeWidth="2.5"
        fill="none"
        markerEnd="url(#di-arrow-h)"
      />
      <MathTextSvg x={colX.i[1] + 8} y={tableBottom + 28} size={14} fill="var(--chart-danger)" anchor="start">∫ dx = 0</MathTextSvg>
      <FaText x={cx(...colX.d)} y={tableBottom + 48} fill="var(--chart-danger)">ضرب افقیِ سطر آخر (اینجا صفر است)</FaText>

      {/* stacked legend, center-anchored */}
      <FaText x={348} y={tableBottom + 82} fill="var(--chart-accent)">↘ ضرب قُطری: سطر k از ستون D در سطر k+1 از ستون I</FaText>
      <FaText x={348} y={tableBottom + 102} fill="var(--ink-3)">اولین خانه ستون I (خودِ dv) هیچ‌وقت ضرب نمی‌شود</FaText>
    </SvgFrame>
  );
}

/* ── 2. Even / odd symmetry ─────────────────────────────────────────── */

function MiniAxes({ x0, y0, w, h }: { x0: number; y0: number; w: number; h: number }) {
  return (
    <g stroke="var(--chart-axis)" strokeWidth="1.5" fill="none">
      <line x1={x0} y1={y0 + h / 2} x2={x0 + w} y2={y0 + h / 2} />
      <line x1={x0 + w / 2} y1={y0} x2={x0 + w / 2} y2={y0 + h} />
    </g>
  );
}

export function EvenOddSymmetryFigure() {
  const W = 200;
  const H = 150;
  const gap = 48;
  const panels = [0, 1, 2].map((i) => ({ x0: 12 + i * (W + gap), y0: 16 }));

  const mapX = (p: { x0: number }, u: number) => p.x0 + W / 2 + u * (W / 2 - 14);
  const mapY = (p: { y0: number }, v: number) => p.y0 + H / 2 - v * (H / 2 - 16);

  const even = (u: number) => 0.75 * u * u;                 // x²
  const odd = (u: number) => 0.75 * (u * u * u - 0.25 * u); // cubic-ish, odd
  const neither = (u: number) => 0.5 * (Math.exp(u) - 1);

  const curve = (p: { x0: number; y0: number }, f: (u: number) => number) =>
    pts(
      Array.from({ length: 61 }, (_, k) => {
        const u = -1 + (k / 60) * 2;
        return [mapX(p, u), mapY(p, f(u))] as [number, number];
      })
    );

  const labels = ['تابع زوج: f(−x) = f(x)', 'تابع فرد: f(−x) = −f(x)', 'بدون تقارن'];
  const colors = ['var(--chart-accent)', 'var(--chart-violet)', 'var(--chart-muted)'];

  return (
    <SvgFrame viewBox="0 0 700 210" label="سه نمونه تقارن زوج فرد و بدون تقارن">
      {panels.map((p, i) => (
        <g key={i}>
          <MiniAxes x0={p.x0} y0={p.y0} w={W} h={H} />
          <path d={curve(p, [even, odd, neither][i])} stroke={colors[i]} strokeWidth="2.5" fill="none" />
          {/* mirror hints */}
          {i === 0 && (
            <path d={`M ${mapX(p, 0.55)} ${mapY(p, even(0.55) + 0.1)} q 0 26 -30 30`} stroke="var(--chart-ok)" strokeWidth="1.6" fill="none" strokeDasharray="4 3" markerEnd="url(#eo-arrow)" />
          )}
          {i === 1 && (
            <circle cx={mapX(p, 0)} cy={mapY(p, 0)} r="3.5" fill="var(--chart-ok)" />
          )}
          <FaText x={p.x0 + W / 2} y={p.y0 + H + 26}>{labels[i]}</FaText>
        </g>
      ))}
      <defs>
        <marker id="eo-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--chart-ok)" />
        </marker>
      </defs>
    </SvgFrame>
  );
}

/* ── 3. Half-range extensions (cosine vs sine series) ───────────────── */

export function HalfRangeExtensionFigure() {
  const W = 200;
  const H = 140;
  const gap = 48;
  const panels = [0, 1, 2].map((i) => ({ x0: 12 + i * (W + gap), y0: 18 }));
  const mapX = (p: { x0: number }, u: number) => p.x0 + W / 2 + u * (W / 2 - 14);
  const mapY = (p: { y0: number }, v: number) => p.y0 + H - 24 - v * (H - 44);

  // f(u) = u on [0,1]; even ext: |u| ; odd ext: u on [-1,1]
  const paths = [
    (p: { x0: number; y0: number }) =>
      pts([[mapX(p, 0), mapY(p, 0)], [mapX(p, 1), mapY(p, 1)]]),
    (p: { x0: number; y0: number }) =>
      pts([[mapX(p, -1), mapY(p, 1)], [mapX(p, 0), mapY(p, 0)], [mapX(p, 1), mapY(p, 1)]]),
    (p: { x0: number; y0: number }) =>
      pts([[mapX(p, -1), mapY(p, -1)], [mapX(p, 0), mapY(p, 0)], [mapX(p, 1), mapY(p, 1)]]),
  ];
  const labels = ['تابع فقط روی [0, ℓ]', 'گسترش زوج → سری کسینوسی', 'گسترش فرد → سری سینوسی'];
  const colors = ['var(--chart-muted)', 'var(--chart-accent)', 'var(--chart-violet)'];

  return (
    <SvgFrame viewBox="0 0 700 200" label="گسترش زوج و فرد تابع نیم دامنه">
      {panels.map((p, i) => (
        <g key={i}>
          <MiniAxes x0={p.x0} y0={p.y0} w={W} h={H} />
          {/* ℓ markers */}
          <line x1={mapX(p, 0)} y1={mapY(p, 0)} x2={mapX(p, 0)} y2={mapY(p, 0) - 6} stroke="var(--chart-axis)" strokeWidth="1.5" />
          <line x1={mapX(p, 1)} y1={mapY(p, 0)} x2={mapX(p, 1)} y2={mapY(p, 0) - 6} stroke="var(--chart-axis)" strokeWidth="1.5" />
          {i > 0 && (
            <line x1={mapX(p, -1)} y1={mapY(p, 0)} x2={mapX(p, -1)} y2={mapY(p, 0) - 6} stroke="var(--chart-axis)" strokeWidth="1.5" />
          )}
          <path d={paths[i](p)} stroke={colors[i]} strokeWidth="3" fill="none" strokeLinejoin="round" />
          <MathTextSvg x={mapX(p, 1) + 4} y={mapY(p, 0) + 16} size={11} fill="var(--ink-3)">ℓ</MathTextSvg>
          <FaText x={p.x0 + W / 2} y={p.y0 + H + 20}>{labels[i]}</FaText>
        </g>
      ))}
    </SvgFrame>
  );
}

/* ── 4. Discrete line spectrum → continuous spectrum (ℓ → ∞) ───────── */

export function SpectrumContinuumFigure() {
  const W = 200;
  const H = 140;
  const gap = 48;
  const panels = [0, 1, 2].map((i) => ({ x0: 12 + i * (W + gap), y0: 18 }));
  const env = (a: number) => 1 / (1 + a * a); // Lorentz-like envelope
  const mapX = (p: { x0: number }, a: number) => p.x0 + 10 + (a / 3.2) * (W - 20);
  const mapY = (p: { y0: number }, v: number) => p.y0 + H - 24 - v * (H - 46);

  const labels = ['سری فوریه: خطوط گسسته', 'ℓ بزرگ‌تر: خطوط متراکم‌تر', 'ℓ → ∞: طیف پیوسته'];

  return (
    <SvgFrame viewBox="0 0 700 200" label="تبدیل طیف خطی به طیف پیوسته با بزرگ شدن ℓ">
      {panels.map((p, i) => (
        <g key={i}>
          <line x1={p.x0 + 6} y1={mapY(p, 0)} x2={p.x0 + W - 6} y2={mapY(p, 0)} stroke="var(--chart-axis)" strokeWidth="1.5" />
          {i < 2 ? (
            (() => {
              const spacing = i === 0 ? 0.4 : 0.2;
              const lines = [];
              for (let a = spacing; a <= 3.2; a += spacing) {
                lines.push(
                  <line
                    key={a}
                    x1={mapX(p, a)}
                    y1={mapY(p, 0)}
                    x2={mapX(p, a)}
                    y2={mapY(p, env(a) * 0.95)}
                    stroke="var(--chart-accent)"
                    strokeWidth={i === 0 ? 3.5 : 2.2}
                  />
                );
              }
              return lines;
            })()
          ) : (
            <path
              d={
                pts(
                  Array.from({ length: 81 }, (_, k) => {
                    const a = (k / 80) * 3.2;
                    return [mapX(p, a), mapY(p, env(a) * 0.95)] as [number, number];
                  })
                ) + ` L ${mapX(p, 3.2)} ${mapY(p, 0)} L ${mapX(p, 0)} ${mapY(p, 0)} Z`
              }
              fill="var(--chart-accent)"
              opacity="0.28"
              stroke="var(--chart-accent)"
              strokeWidth="2.2"
            />
          )}
          <MathTextSvg x={p.x0 + W - 10} y={mapY(p, 0) + 16} size={11} fill="var(--ink-3)" anchor="end">α</MathTextSvg>
          <FaText x={p.x0 + W / 2} y={p.y0 + H + 20}>{labels[i]}</FaText>
        </g>
      ))}
    </SvgFrame>
  );
}

/* ── 5. Rect ↔ sinc transform pair ──────────────────────────────────── */

export function RectSincPairFigure() {
  const W = 220;
  const H = 150;
  const rx0 = 16;
  const sx0 = 448;
  const y0 = 18;

  const rectX = (u: number) => rx0 + 14 + u * (W - 28); // u ∈ [-1,1]
  const rectY = (v: number) => y0 + H - 28 - v * (H - 56);

  const sincX = (a: number) => sx0 + 14 + (a / 9.5) * (W - 28); // a ∈ [0, 9.5]
  const sincY = (v: number) => y0 + H - 28 - v * (H - 62);
  const f = (a: number) => (Math.abs(a) < 1e-9 ? 1 : Math.sin(a) / a);

  return (
    <SvgFrame viewBox="0 0 700 190" label="جفت تبدیل پالس مستطیلی و تابع سینک">
      {/* rect pulse */}
      <g>
        <line x1={rx0 + 6} y1={rectY(0)} x2={rx0 + W - 6} y2={rectY(0)} stroke="var(--chart-axis)" strokeWidth="1.5" />
        <line x1={rectX(-1)} y1={rectY(0)} x2={rectX(-1)} y2={rectY(1)} stroke="var(--chart-axis)" strokeWidth="1.2" strokeDasharray="3 3" />
        <line x1={rectX(1)} y1={rectY(0)} x2={rectX(1)} y2={rectY(1)} stroke="var(--chart-axis)" strokeWidth="1.2" strokeDasharray="3 3" />
        <path
          d={pts([
            [rectX(-1.6), rectY(0)],
            [rectX(-1), rectY(0)],
            [rectX(-1), rectY(1)],
            [rectX(1), rectY(1)],
            [rectX(1), rectY(0)],
            [rectX(1.6), rectY(0)],
          ])}
          stroke="var(--chart-accent)"
          strokeWidth="2.8"
          fill="none"
          strokeLinejoin="round"
        />
        <MathTextSvg x={rectX(0)} y={rectY(1) - 10} fill="var(--chart-accent)">p_a(x)</MathTextSvg>
        <FaText x={rx0 + W / 2} y={y0 + H + 4}>پالس مستطیلی (حوزه مکان)</FaText>
      </g>

      {/* ℱ arrow */}
      <g>
        <line x1={rx0 + W + 26} y1={y0 + H / 2} x2={sx0 - 26} y2={y0 + H / 2} stroke="var(--chart-muted)" strokeWidth="2" markerEnd="url(#rs-arrow)" />
        <MathTextSvg x={(rx0 + W + sx0) / 2} y={y0 + H / 2 - 10} size={17}>ℱ</MathTextSvg>
      </g>
      <defs>
        <marker id="rs-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--chart-muted)" />
        </marker>
      </defs>

      {/* sinc */}
      <g>
        <line x1={sx0 + 6} y1={sincY(0)} x2={sx0 + W - 6} y2={sincY(0)} stroke="var(--chart-axis)" strokeWidth="1.5" />
        {/* zero crossings at nπ (a = π ≈ 3.14, 2π ≈ 6.28, 3π ≈ 9.42) */}
        {[Math.PI, 2 * Math.PI, 3 * Math.PI].map((z) => (
          <line key={z} x1={sincX(z)} y1={sincY(0) - 4} x2={sincX(z)} y2={sincY(0) + 4} stroke="var(--chart-warn)" strokeWidth="1.4" />
        ))}
        <path
          d={pts(
            Array.from({ length: 121 }, (_, k) => {
              const a = (k / 120) * 9.5;
              return [sincX(a), sincY(f(a) * 0.95)] as [number, number];
            })
          )}
          stroke="var(--chart-violet)"
          strokeWidth="2.6"
          fill="none"
        />
        <MathTextSvg x={545} y={52} fill="var(--chart-violet)">2sin(aα)/α</MathTextSvg>
        <FaText x={sx0 + W / 2} y={y0 + H + 4}>تابع سینک (حوزه فرکانس)</FaText>
      </g>
    </SvgFrame>
  );
}

/* ── 6. Sturm–Liouville eigenfunction modes (Dirichlet rod) ─────────── */

export function SturmModesFigure() {
  const W = 470;
  const rowH = 62;
  const y0 = 14;
  const x0 = 70;

  const mapX = (u: number) => x0 + 20 + u * (W - 60); // u ∈ [0,1]
  const mapY = (r: number, v: number) => y0 + rowH * r + rowH / 2 - v * 22;

  const modes = [
    { n: 1, nodes: 0 },
    { n: 2, nodes: 1 },
    { n: 3, nodes: 2 },
  ];
  const colors = ['var(--chart-accent)', 'var(--chart-violet)', 'var(--chart-ok)'];

  return (
    <SvgFrame viewBox="0 0 700 230" label="سه مود اول توابع ویژه سینوسی در میله با شرایط مرزی دیریکله">
      {modes.map((m, r) => (
        <g key={m.n}>
          {/* boundary walls */}
          <line x1={mapX(0)} y1={y0 + rowH * r + 4} x2={mapX(0)} y2={y0 + rowH * (r + 1) - 4} stroke="var(--chart-axis)" strokeWidth="3" />
          <line x1={mapX(1)} y1={y0 + rowH * r + 4} x2={mapX(1)} y2={y0 + rowH * (r + 1) - 4} stroke="var(--chart-axis)" strokeWidth="3" />
          <line x1={mapX(0)} y1={mapY(r, 0)} x2={mapX(1)} y2={mapY(r, 0)} stroke="var(--chart-grid)" strokeWidth="1.2" strokeDasharray="3 3" />
          <path
            d={pts(
              Array.from({ length: 101 }, (_, k) => {
                const u = k / 100;
                return [mapX(u), mapY(r, Math.sin(m.n * Math.PI * u))] as [number, number];
              })
            )}
            stroke={colors[r]}
            strokeWidth="2.6"
            fill="none"
          />
          {/* internal nodes */}
          {Array.from({ length: m.nodes }, (_, k) => (
            <circle key={k} cx={mapX((k + 1) / m.n)} cy={mapY(r, 0)} r="3.2" fill="var(--chart-danger)" />
          ))}
          <text x={x0 - 8} y={mapY(r, 0) + 5} textAnchor="end" fontSize="12.5" fontWeight="700" fill="var(--ink-2)">
            {`n = ${m.n}`}
          </text>
          <MathTextSvg x={mapX(1) + 12} y={mapY(r, 0) + 5} size={12} fill="var(--ink-3)" anchor="start">
            {`λ${'₁₂₃'[r]} = (${m.n === 1 ? '' : m.n}π/L)²`}
          </MathTextSvg>
          <FaText x={mapX(0.5)} y={y0 + rowH * (r + 1) + 1} size={11} fill="var(--ink-4)">
            {`${['۱', '۲', '۳'][r]} نیم‌موج · گره داخلی: ${['۰', '۱', '۲'][r]}`}
          </FaText>
        </g>
      ))}
    </SvgFrame>
  );
}

/* ── 7. Heat rod with decaying temperature profiles ─────────────────── */

export function HeatRodFigure() {
  const x0 = 80;
  const W = 480;
  const y0 = 20;
  const H = 120;

  const mapX = (u: number) => x0 + 10 + u * (W - 20);
  const mapY = (v: number) => y0 + H - 18 - v * (H - 46);
  const profile = (u: number, decay: number) => 0.9 * decay * Math.sin(Math.PI * u);

  const profiles = [
    { decay: 1, dash: undefined as string | undefined, color: 'var(--chart-accent)', label: 't = 0' },
    { decay: 0.55, dash: '7 4', color: 'var(--chart-warn)', label: 't₁ > 0' },
    { decay: 0.25, dash: '2.5 3.5', color: 'var(--chart-danger)', label: 't₂ > t₁' },
  ];

  return (
    <SvgFrame viewBox="0 0 700 190" label="میرایی پروفایل دما در میله با مرزهای صفر">
      {/* rod ends (fixed-temperature walls) */}
      <rect x={x0 - 6} y={y0 + 6} width="7" height={H - 24} fill="var(--chart-muted)" opacity="0.5" rx="2" />
      <rect x={x0 + W - 1} y={y0 + 6} width="7" height={H - 24} fill="var(--chart-muted)" opacity="0.5" rx="2" />
      <line x1={mapX(0)} y1={mapY(0)} x2={mapX(1)} y2={mapY(0)} stroke="var(--chart-axis)" strokeWidth="1.6" />
      <path
        d={pts(
          Array.from({ length: 101 }, (_, k) => {
            const u = k / 100;
            return [mapX(u), mapY(profile(u, 1))] as [number, number];
          })
        )}
        stroke={profiles[0].color}
        strokeWidth="2.8"
        fill="none"
      />
      {profiles.slice(1).map((pr) => (
        <path
          key={pr.label}
          d={pts(
            Array.from({ length: 101 }, (_, k) => {
              const u = k / 100;
              return [mapX(u), mapY(profile(u, pr.decay))] as [number, number];
            })
          )}
          stroke={pr.color}
          strokeWidth="2"
          strokeDasharray={pr.dash}
          fill="none"
        />
      ))}
      {/* BC labels */}
      <MathTextSvg x={mapX(0) - 10} y={y0} size={11.5}>u(0,t) = 0</MathTextSvg>
      <MathTextSvg x={mapX(1) + 10} y={y0} size={11.5}>u(L,t) = 0</MathTextSvg>
      <MathTextSvg x={mapX(1)} y={mapY(0) + 18} size={11} fill="var(--ink-3)" anchor="end">L</MathTextSvg>

      {/* decay legend */}
      {profiles.map((pr, i) => (
        <g key={pr.label}>
          <line x1={x0 + W + 40} y1={y0 + 26 + i * 26} x2={x0 + W + 76} y2={y0 + 26 + i * 26} stroke={pr.color} strokeWidth="2.4" strokeDasharray={pr.dash} />
          <MathTextSvg x={x0 + W + 84} y={y0 + 30 + i * 26} size={11.5} anchor="start">{pr.label}</MathTextSvg>
        </g>
      ))}
      <FaText x={350} y={178} fill="var(--ink-3)" size={11.5}>هر هارمونیک با e^(−n²π²k²t/L²) میرا می‌شود</FaText>
    </SvgFrame>
  );
}

/* ── 8. Euler unit circle (e^{iθ}) ──────────────────────────────────── */

export function EulerCircleFigure() {
  const cx0 = 140;
  const cy0 = 100;
  const R = 68;

  const theta = Math.PI / 3;
  const px = cx0 + R * Math.cos(theta);
  const py = cy0 - R * Math.sin(theta);

  return (
    <SvgFrame viewBox="0 0 700 200" label="دایره واحد مختلط و فرمول اویلر">
      {/* circle + axes */}
      <circle cx={cx0} cy={cy0} r={R} stroke="var(--chart-axis)" strokeWidth="1.6" fill="none" />
      <line x1={cx0 - R - 24} y1={cy0} x2={cx0 + R + 24} y2={cy0} stroke="var(--chart-grid)" strokeWidth="1.4" />
      <line x1={cx0} y1={cy0 - R - 18} x2={cx0} y2={cy0 + R + 18} stroke="var(--chart-grid)" strokeWidth="1.4" />
      {/* radius to e^{iθ} */}
      <line x1={cx0} y1={cy0} x2={px} y2={py} stroke="var(--chart-accent)" strokeWidth="2.4" />
      <circle cx={px} cy={py} r="4.5" fill="var(--chart-accent)" />
      {/* projections */}
      <line x1={px} y1={py} x2={px} y2={cy0} stroke="var(--chart-violet)" strokeWidth="1.8" strokeDasharray="4 3" />
      <line x1={px} y1={py} x2={cx0} y2={py} stroke="var(--chart-warn)" strokeWidth="1.8" strokeDasharray="4 3" />
      {/* θ arc + label on the bisector */}
      <path d={`M ${cx0 + 26} ${cy0} A 26 26 0 0 0 ${cx0 + 26 * Math.cos(theta)} ${cy0 - 26 * Math.sin(theta)}`} stroke="var(--chart-ok)" strokeWidth="1.8" fill="none" />
      <MathTextSvg x={cx0 + 38 * Math.cos(theta / 2)} y={cy0 - 38 * Math.sin(theta / 2) + 4} fill="var(--chart-ok)">θ</MathTextSvg>
      {/* point label outside the circle, along the radius */}
      <MathTextSvg x={cx0 + (R + 14) * Math.cos(theta)} y={cy0 - (R + 14) * Math.sin(theta)} fill="var(--chart-accent)">e^(iθ)</MathTextSvg>
      {/* projection labels */}
      <MathTextSvg x={px + 6} y={cy0 + 14} size={11.5} fill="var(--chart-violet)">cos θ</MathTextSvg>
      <MathTextSvg x={cx0 - 6} y={(py + cy0) / 2} size={11.5} fill="var(--chart-warn)" anchor="end">sin θ</MathTextSvg>

      {/* identity panel */}
      <g>
        <MathTextSvg x={480} y={58} size={15} fill="var(--ink)">e^(iθ) = cos θ + i·sin θ</MathTextSvg>
        <FaText x={664} y={90} anchor="start">نقطه روی دایره واحد = زاویه θ</FaText>
        <FaText x={664} y={114} anchor="start" weight="400" fill="var(--ink-3)" size={12}>مشتق e^(iθ) نسبت به θ دوباره خودش است:</FaText>
        <FaText x={664} y={136} anchor="start" weight="400" fill="var(--ink-3)" size={12}>یعنی چرخش همیشگی روی دایره واحد —</FaText>
        <FaText x={664} y={158} anchor="start" weight="400" fill="var(--ink-3)" size={12}>همان زبانی که تبدیل فوریه با آن نوشته می‌شود.</FaText>
        <MathTextSvg x={480} y={184} size={13} fill="var(--chart-accent)">e^(iπ) + 1 = 0</MathTextSvg>
      </g>
    </SvgFrame>
  );
}
