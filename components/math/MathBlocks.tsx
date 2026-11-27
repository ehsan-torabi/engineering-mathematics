'use client';

import React from 'react';
import MathFormula, { renderInline } from '@/components/MathFormula';

/**
 * Rich block renderer for Persian mathematical prose.
 *
 * Accepts the plain-string lesson fields (paragraphs separated by a blank
 * line) and additionally understands a small, safe subset of markers so the
 * curriculum can express structure without full Markdown:
 *
 *   ## عنوان بخش        → section heading (h3)
 *   ### زیربخش          → sub-heading (h4)
 *   - مورد فهرست        → bullet list
 *   ۱. / 1. مورد        → ordered list (markers rendered in Persian digits)
 *   > متن               → semantic callout (side-border box)
 *   $$ ... $$           → display equation (its own centered block)
 *   $...$  **متن**      → inline math and bold, anywhere
 *
 * The parser is line-based and deliberately conservative: anything it does
 * not recognise renders as an ordinary paragraph, so existing two-paragraph
 * explanations keep looking exactly the same.
 */

type Block =
  | {kind: 'p'; text: string}
  | {kind: 'h3' | 'h4'; text: string}
  | {kind: 'ul'; items: string[]}
  | {kind: 'ol'; items: string[]}
  | {kind: 'quote'; text: string}
  | {kind: 'display'; tex: string}
  | {kind: 'hr'};

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = source.replace(/\r\n/g, '\n').split('\n');
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    if (!line) {
      i += 1;
      continue;
    }

    // Display math: single-line $$...$$, or a $$ fence across lines.
    if (line.startsWith('$$')) {
      const rest = line.slice(2);
      if (rest.endsWith('$$') && rest.length >= 2 && rest !== '') {
        blocks.push({kind: 'display', tex: rest.slice(0, -2).trim()});
        i += 1;
        continue;
      }
      const buf: string[] = rest !== '' ? [rest] : [];
      i += 1;
      while (i < lines.length && !lines[i].trim().endsWith('$$')) {
        buf.push(lines[i]);
        i += 1;
      }
      const closing = i < lines.length ? lines[i].trim().replace(/\$\$$/, '') : '';
      if (closing) buf.push(closing);
      i += 1; // consume closing fence (or stop at EOF)
      blocks.push({kind: 'display', tex: buf.join(' ').trim()});
      continue;
    }

    if (/^---+$/.test(line)) {
      blocks.push({kind: 'hr'});
      i += 1;
      continue;
    }

    const heading = line.match(/^(#{2,3})\s+(.+)$/);
    if (heading) {
      blocks.push({
        kind: heading[1].length === 2 ? 'h3' : 'h4',
        text: heading[2].trim(),
      });
      i += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const parts: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        parts.push(lines[i].trim().replace(/^>\s?/, ''));
        i += 1;
      }
      blocks.push({kind: 'quote', text: parts.join(' ')});
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i += 1;
      }
      blocks.push({kind: 'ul', items});
      continue;
    }

    if (/^\d+[.)]\s+/.test(line) || /^[۰-۹]+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (
        i < lines.length &&
        (/^\d+[.)]\s+/.test(lines[i].trim()) || /^[۰-۹]+[.)]\s+/.test(lines[i].trim()))
      ) {
        items.push(lines[i].trim().replace(/^([۰-۹\d]+)[.)]\s+/, ''));
        i += 1;
      }
      blocks.push({kind: 'ol', items});
      continue;
    }

    // Paragraph: consecutive plain lines merge into one paragraph.
    const para: string[] = [];
    while (i < lines.length) {
      const candidate = lines[i].trim();
      if (
        !candidate ||
        candidate.startsWith('$$') ||
        /^#{2,3}\s+/.test(candidate) ||
        /^>\s?/.test(candidate) ||
        /^[-*]\s+/.test(candidate) ||
        /^\d+[.)]\s+/.test(candidate) ||
        /^[۰-۹]+[.)]\s+/.test(candidate) ||
        /^---+$/.test(candidate)
      ) {
        break;
      }
      para.push(candidate);
      i += 1;
    }
    if (para.length) blocks.push({kind: 'p', text: para.join(' ')});
  }

  return blocks;
}

interface MathBlocksProps {
  content: string;
  /** Extra classes for the root wrapper */
  className?: string;
  /** Tailwind classes applied to every paragraph */
  paragraphClassName?: string;
}

export default function MathBlocks({
  content,
  className = '',
  paragraphClassName = '',
}: MathBlocksProps) {
  const blocks = React.useMemo(() => parseBlocks(content || ''), [content]);

  return (
    <div className={className}>
      {blocks.map((block, idx) => {
        switch (block.kind) {
          case 'p':
            return (
              <p key={idx} className={paragraphClassName}>
                {renderInline(block.text, `b${idx}`)}
              </p>
            );
          case 'h3':
            return (
              <h3
                key={idx}
                className="mt-7 mb-2.5 text-base font-bold leading-8 text-ink first:mt-0"
              >
                {renderInline(block.text, `b${idx}`)}
              </h3>
            );
          case 'h4':
            return (
              <h4
                key={idx}
                className="mt-5 mb-2 text-sm font-bold leading-7 text-ink first:mt-0"
              >
                {renderInline(block.text, `b${idx}`)}
              </h4>
            );
          case 'ul':
            return (
              <ul key={idx} className="my-3 space-y-2">
                {block.items.map((item, k) => (
                  <li
                    key={k}
                    className="flex items-start gap-2.5 leading-8 text-ink-2"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-[0.85em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                    />
                    <span className="min-w-0">{renderInline(item, `b${idx}-${k}`)}</span>
                  </li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={idx} className="my-3 space-y-2">
                {block.items.map((item, k) => (
                  <li
                    key={k}
                    className="flex items-start gap-2.5 leading-8 text-ink-2"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent-soft text-[11px] font-bold tabular-nums text-accent-deep dark:text-accent">
                      {k + 1}
                    </span>
                    <span className="min-w-0">{renderInline(item, `b${idx}-${k}`)}</span>
                  </li>
                ))}
              </ol>
            );
          case 'quote':
            return (
              <div
                key={idx}
                className="my-4 rounded-lg border-s-[3px] border-accent-line bg-accent-soft/60 px-4 py-3 leading-8 text-ink-2"
              >
                {renderInline(block.text, `b${idx}`)}
              </div>
            );
          case 'display':
            return <MathFormula key={idx} formula={block.tex} block />;
          case 'hr':
            return <hr key={idx} className="my-6 border-line" />;
          default:
            return null;
        }
      })}
    </div>
  );
}
