'use client';

import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

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
export function normalizeToLatex(input: string): string {
  if (!input) return '';
  // Collapse accidental double backslashes before LaTeX commands or symbols
  // (e.g., \\Omega -> \Omega, \\Delta -> \Delta, \\alpha -> \alpha, \\ge -> \ge)
  let clean = input.replace(/\\\\([a-zA-Z]+|[,\.;:!\{\}\[\]\(\)])/g, (_m, p1) => '\\' + p1);

  // Ensure subscript Omega has braces for KaTeX: I_\Omega or I_Ω -> I_{\Omega}
  clean = clean
    .replace(/I_\\Omega(?=[^a-zA-Z]|$)/g, 'I_{\\Omega}')
    .replace(/I_Ω(?=[^a-zA-Z]|$)/gu, 'I_{\\Omega}')
    .replace(/x_0(?=[^a-zA-Z]|$)/g, 'x_{0}')
    .replace(/x₀/g, 'x_{0}');

  return clean
    .replace(/≃/g, '\\simeq ')
    .replace(/⇒/g, '\\implies ')
    .replace(/⇔/g, '\\iff ')
    .replace(/≠/g, '\\neq ')
    .replace(/≤/g, '\\le ')
    .replace(/≥/g, '\\ge ')
    .replace(/∞/g, '\\infty ')
    .replace(/π/g, '\\pi ')
    .replace(/α/g, '\\alpha ')
    .replace(/λ/g, '\\lambda ')
    .replace(/μ/g, '\\mu ')
    .replace(/ω/g, '\\omega ')
    .replace(/Ω/g, '\\Omega ')
    .replace(/Δ/g, '\\Delta ')
    .replace(/φ/g, '\\varphi ')
    .replace(/ψ/g, '\\psi ')
    .replace(/ℓ/g, '\\ell ')
    .replace(/ℱ/g, '\\mathcal{F}')
    .replace(/∑/g, '\\sum')
    .replace(/∫/g, '\\int')
    .replace(/√\(([^)]+)\)/g, '\\sqrt{$1}')
    .replace(/√([a-zA-Z0-9\\]+)/g, '\\sqrt{$1}')
    .replace(/‖([^‖]+)‖/g, '\\left\\|$1\\right\\|')
    .replace(/⟨([^⟩]+)⟩/g, '\\left\\langle $1 \\right\\rangle ')
    .replace(/½/g, '\\frac{1}{2}')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/⁴/g, '^4')
    .replace(/₀/g, '_0')
    .replace(/₁/g, '_1')
    .replace(/₂/g, '_2');
}

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
            ? 'border-[#0284C7]/50 bg-[#F0F9FF] text-[#0F172A] shadow-2xs dark:border-[#38BDF8]/50 dark:bg-[#0C4A6E]/35 dark:text-[#F8FAFC]'
            : 'border-[#E2E8F0] bg-white text-[#0F172A] dark:border-[#334155] dark:bg-[#0F172A] dark:text-[#F8FAFC]'
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
          ? 'bg-[#E0F2FE] text-[#0369A1] dark:bg-[#0C4A6E]/60 dark:text-[#7DD3FC]'
          : 'bg-[#F1F5F9]/80 text-[#0F172A] dark:bg-[#1E293B] dark:text-[#F8FAFC]'
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
              className="font-bold text-[#0F172A] dark:text-[#F8FAFC]"
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



