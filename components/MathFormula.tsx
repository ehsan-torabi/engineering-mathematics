'use client';

import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { normalizeToLatex } from '@/lib/normalize-latex';

export { normalizeToLatex };

interface MathFormulaProps {
  formula: string;
  block?: boolean;
  highlight?: boolean;
  className?: string;
}

/**
 * Normalize legacy shorthand or unicode math strings into clean LaTeX if needed,
 * while passing pure LaTeX directly to KaTeX.
 */

/**
 * Renders standard publication-quality mathematical equations using KaTeX.
 * Always isolates LTR directionality so math never scrambles inside RTL Persian layout.
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
      <div
        dir="ltr"
        style={{ unicodeBidi: 'isolate' }}
        className={`my-2.5 overflow-x-auto rounded-xl border px-4 py-3.5 text-center transition-colors ${
          highlight
            ? 'border-accent/50 bg-accent-soft text-ink'
            : 'border-line bg-surface text-ink'
        } ${className}`}
      >
        <div
          className="text-base leading-relaxed select-all"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  }

  return (
    <span
      dir="ltr"
      style={{ unicodeBidi: 'isolate' }}
      className={`mx-1 inline-block rounded px-1.5 py-0.5 align-middle transition-colors ${
        highlight
          ? 'bg-accent-tint text-accent-deep'
          : 'bg-muted/80 text-ink dark:bg-muted'
      } ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Renders Persian RTL text mixed with inline $...$ LaTeX expressions and **bold** segments cleanly.
 * Every $...$ segment is isolated in an LTR inline-block KaTeX span so bidirectional
 * text never scrambles minus signs, intervals [-l, l], or fractions.
 */
export function MathText({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  const parts = useMemo(() => {
    if (!text) return [];
    // Split on $...$ inline math delimiters or **...** bold delimiters
    return text.split(/(\$[^$]+\$|\*\*[^*]+\*\*)/g).filter(Boolean);
  }, [text]);

  return (
    <span className={className} dir="rtl">
      {parts.map((part, idx) => {
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const mathContent = part.slice(1, -1);
          return <MathFormula key={idx} formula={mathContent} block={false} />;
        }
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          const boldContent = part.slice(2, -2);
          const boldSubParts = boldContent
            .split(/(\$[^$]+\$)/g)
            .filter(Boolean);
          return (
            <strong
              key={idx}
              className="font-bold text-ink"
            >
              {boldSubParts.map((sub, sIdx) => {
                if (
                  sub.startsWith('$') &&
                  sub.endsWith('$') &&
                  sub.length > 2
                ) {
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
        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
    </span>
  );
}



