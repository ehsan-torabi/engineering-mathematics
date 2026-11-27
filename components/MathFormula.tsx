'use client';

import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { normalizeToLatex } from '@/lib/normalize-latex';

export { normalizeToLatex };

interface MathFormulaProps {
  formula: string;
  block?: boolean;
  /** Render as a key-result card (accent border + tint). Inline key results get a slim tint. */
  highlight?: boolean;
  className?: string;
}

/**
 * Renders publication-quality mathematics with KaTeX, always isolated LTR so
 * formulas never scramble inside the RTL Persian layout.
 *
 * Inline math flows seamlessly inside Persian prose — no background pill —
 * while display math (block) is centered and horizontally scrollable on
 * narrow screens. Key results (highlight) get the only decorated containers:
 * a slim accent tint inline, or an accent card for display equations.
 */
export default function MathFormula({
  formula,
  block = false,
  highlight = false,
  className = '',
}: MathFormulaProps) {
  const html = useMemo(() => {
    const cleanLatex = normalizeToLatex(formula);
    try {
      return katex.renderToString(cleanLatex, {
        displayMode: block,
        throwOnError: false,
        strict: false,
        trust: true,
      });
    } catch {
      return cleanLatex;
    }
  }, [formula, block]);

  if (block) {
    return (
      <span
        dir="ltr"
        style={{ unicodeBidi: 'isolate' }}
        className={`my-3 block overflow-x-auto overflow-y-hidden text-center text-[0.92em] leading-[1.7] ${
          highlight
            ? 'rounded-xl border border-accent-line bg-accent-soft px-4 py-3 text-ink'
            : ''
        } ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      dir="ltr"
      style={{ unicodeBidi: 'isolate' }}
      className={`mx-[0.08em] inline-block whitespace-nowrap align-middle text-[0.88em] ${
        highlight
          ? 'rounded bg-accent-tint px-1 text-accent-deep'
          : ''
      } ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Shared inline renderer for Persian prose containing `$...$` math and
 * `**bold**` segments (bold may itself contain math). Every math span is an
 * isolated LTR inline-block, so bidirectional text never scrambles minus
 * signs, intervals like [-ℓ, ℓ] or fractions.
 */
export function renderInline(
  text: string,
  keyBase = 'i'
): React.ReactNode[] {
  const parts = text.split(/(\$[^$]+\$|\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, idx) => {
    if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      return (
        <MathFormula
          key={`${keyBase}-${idx}`}
          formula={part.slice(1, -1)}
          block={false}
        />
      );
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      const boldSubParts = part
        .slice(2, -2)
        .split(/(\$[^$]+\$)/g)
        .filter(Boolean);
      return (
        <strong key={`${keyBase}-${idx}`} className="font-bold text-ink">
          {boldSubParts.map((sub, sIdx) => {
            if (sub.startsWith('$') && sub.endsWith('$') && sub.length > 2) {
              return (
                <MathFormula
                  key={sIdx}
                  formula={sub.slice(1, -1)}
                  block={false}
                />
              );
            }
            return <React.Fragment key={sIdx}>{sub}</React.Fragment>;
          })}
        </strong>
      );
    }
    return <React.Fragment key={`${keyBase}-${idx}`}>{part}</React.Fragment>;
  });
}

/**
 * Persian RTL text mixed with inline `$...$` math, `$$...$$` display math and
 * `**bold**`. The root is a neutral wrapper so callers can place it inside
 * headings, paragraphs and flex rows alike.
 */
export function MathText({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  const segments = useMemo(
    () => (text ? text.split(/(\$\$[^$]+\$\$)/g).filter(Boolean) : []),
    [text]
  );

  return (
    <span className={className} dir="rtl">
      {segments.map((segment, idx) => {
        if (
          segment.startsWith('$$') &&
          segment.endsWith('$$') &&
          segment.length > 4
        ) {
          return (
            <MathFormula
              key={idx}
              formula={segment.slice(2, -2)}
              block
            />
          );
        }
        return (
          <React.Fragment key={idx}>{renderInline(segment, `t${idx}`)}</React.Fragment>
        );
      })}
    </span>
  );
}
