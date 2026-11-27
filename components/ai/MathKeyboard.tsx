'use client';

import React from 'react';

/**
 * Math snippet palette for the assistant composer (کیبورد ریاضی).
 *
 * Every chip splices a LaTeX snippet at the composer's caret via
 * `onInsert(text, caret)` — the parent owns the textarea and applies the
 * insertion. Snippets arrive pre-wrapped with $…$ (or $$…$$ for multi-line
 * structures) so both the model and the transcript renderer understand them
 * without the user knowing delimiter rules.
 *
 * UX rules applied (ui-ux-pro-max): web touch targets ≥ 24px with 8px
 * gaps, wrapped rows instead of horizontal scrolling, aria-labels on every
 * chip, and type="button" so palette clicks never submit the prompt form.
 */

export interface MathSnippet {
  /** Visible LaTeX source on the chip (rendered LTR monospace) */
  label: string;
  /** Persian accessible name / tooltip */
  aria: string;
  /** LaTeX body inserted between the delimiters */
  latex: string;
  /** Caret position within `latex` after insertion (defaults to end) */
  caret?: number;
  /** Wrap with $$…$$ instead of $…$ (multi-line structures) */
  display?: boolean;
}

export const MATH_SNIPPET_GROUPS: { title: string; snippets: MathSnippet[] }[] = [
  {
    title: 'قالب‌ها',
    snippets: [
      { label: '\\frac{a}{b}', aria: 'درج کسر a بر b', latex: '\\frac{a}{b}', caret: 6 },
      { label: '\\sqrt{x}', aria: 'درج ریشه دوم', latex: '\\sqrt{x}', caret: 6 },
      { label: 'x^{2}', aria: 'درج توان دوم', latex: 'x^{2}', caret: 3 },
      { label: 'a_{n}', aria: 'درج زیرنویس', latex: 'a_{n}', caret: 3 },
      { label: 'e^{i\\theta}', aria: 'درج نمایی مختلط فرمول اویلر', latex: 'e^{i\\theta}', caret: 3 },
      { label: '(-1)^{n}', aria: 'درج علامت متناوب منفی یک به توان n', latex: '(-1)^{n}', caret: 7 },
      {
        label: '\\sum_{n=1}^{\\infty}',
        aria: 'درج جمع سری از n مساوی یک تا بی‌نهایت',
        latex: '\\sum_{n=1}^{\\infty} a_n',
        caret: 18,
      },
      {
        label: '\\int_{a}^{b} f\\,dx',
        aria: 'درج انتگرال معین از a تا b',
        latex: '\\int_{a}^{b} f(x)\\,dx',
        caret: 12,
      },
      { label: '\\int f\\,dx', aria: 'درج انتگرال نامعین', latex: '\\int f(x)\\,dx', caret: 5 },
      {
        label: '\\lim_{x \\to 0}',
        aria: 'درج حد وقتی x میل به صفر دارد',
        latex: '\\lim_{x \\to 0} f(x)',
        caret: 17,
      },
      { label: '[-\\ell, \\ell]', aria: 'درج بازه متقارن با ل', latex: '[-\\ell, \\ell]', caret: 2 },
      {
        label: '\\begin{cases}',
        aria: 'درج دستگاه چند جزئی (بلوک نمایشی)',
        latex: '\\begin{cases} u_t = k u_{xx} \\\\ u(0,t) = 0 \\end{cases}',
        caret: 13,
        display: true,
      },
      {
        label: '\\begin{pmatrix}',
        aria: 'درج ماتریس دو در دو (بلوک نمایشی)',
        latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
        caret: 15,
        display: true,
      },
    ],
  },
  {
    title: 'نمادها',
    snippets: [
      { label: '\\pi', aria: 'درج عدد پی', latex: '\\pi' },
      { label: '\\infty', aria: 'درج بی‌نهایت', latex: '\\infty' },
      { label: '\\pm', aria: 'درج به‌علاوه منفی', latex: '\\pm' },
      { label: '\\times', aria: 'درج ضربدر', latex: '\\times' },
      { label: '\\cdot', aria: 'درج نقطه ضرب', latex: '\\cdot' },
      { label: '\\le', aria: 'درج کوچکتر مساوی', latex: '\\le' },
      { label: '\\ge', aria: 'درج بزرگتر مساوی', latex: '\\ge' },
      { label: '\\ne', aria: 'درج نامساوی', latex: '\\ne' },
      { label: '\\approx', aria: 'درج تقریبا مساوی', latex: '\\approx' },
      { label: '\\sqrt{}', aria: 'درج علامت ریشه', latex: '\\sqrt{}', caret: 6 },
      { label: '\\partial', aria: 'درج مشتق جزئی', latex: '\\partial' },
      { label: '\\Delta', aria: 'درج دلتا', latex: '\\Delta' },
      { label: '\\ell', aria: 'درج نیم‌طول ل', latex: '\\ell' },
      { label: '\\to', aria: 'درج فلش میل به', latex: '\\to' },
      { label: '\\in', aria: 'درج عضویت', latex: '\\in' },
    ],
  },
  {
    title: 'حروف یونانی',
    snippets: [
      { label: '\\alpha', aria: 'درج آلفا', latex: '\\alpha' },
      { label: '\\beta', aria: 'درج بتا', latex: '\\beta' },
      { label: '\\gamma', aria: 'درج گاما', latex: '\\gamma' },
      { label: '\\delta', aria: 'درج دلتای کوچک', latex: '\\delta' },
      { label: '\\theta', aria: 'درج تتا', latex: '\\theta' },
      { label: '\\lambda', aria: 'درج لامبدا', latex: '\\lambda' },
      { label: '\\mu', aria: 'درج میو', latex: '\\mu' },
      { label: '\\omega', aria: 'درج امگای کوچک', latex: '\\omega' },
      { label: '\\phi', aria: 'درج فی', latex: '\\phi' },
      { label: '\\sigma', aria: 'درج سیگما', latex: '\\sigma' },
      { label: '\\Gamma', aria: 'درج گمای بزرگ', latex: '\\Gamma' },
      { label: '\\Omega', aria: 'درج امگای بزرگ', latex: '\\Omega' },
    ],
  },
];

/** Wrap a snippet body with math delimiters and compute the final caret. */
export function wrapSnippet(
  snippet: Pick<MathSnippet, 'latex' | 'caret' | 'display'>
): { text: string; caret: number } {
  const prefix = snippet.display ? '$$' : '$';
  const suffix = snippet.display ? '$$' : '$';
  const caret =
    snippet.caret === undefined
      ? snippet.latex.length
      : Math.min(Math.max(snippet.caret, 0), snippet.latex.length);
  return {
    text: `${prefix}${snippet.latex}${suffix}`,
    caret: prefix.length + caret,
  };
}

interface MathKeyboardProps {
  /** Splice `text` at the composer caret and move the caret to `caret` */
  onInsert: (text: string, caret: number) => void;
  id?: string;
}

export default function MathKeyboard({ onInsert, id = 'math-keyboard' }: MathKeyboardProps) {
  return (
    <div
      id={id}
      role="group"
      aria-label="کیبورد ریاضی: با هر کلیک، فرمول در محل نشانگر متن درج می‌شود"
      className="mb-2 max-h-52 space-y-2 overflow-y-auto rounded-xl border border-line bg-panel p-2.5"
    >
      {MATH_SNIPPET_GROUPS.map((group) => (
        <div key={group.title}>
          <div className="mb-1 text-[10px] font-bold text-ink-4">{group.title}</div>
          <div className="flex flex-wrap gap-2">
            {group.snippets.map((snip) => {
              const wrapped = wrapSnippet(snip);
              return (
                <button
                  key={snip.label + snip.aria}
                  type="button"
                  title={snip.aria}
                  aria-label={snip.aria}
                  onClick={() => onInsert(wrapped.text, wrapped.caret)}
                  className="flex h-8 items-center rounded-lg border border-line bg-surface px-2.5 font-mono text-[11px] text-accent-deep transition-colors hover:border-accent hover:bg-accent-soft dark:text-accent"
                >
                  <span dir="ltr">{snip.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
