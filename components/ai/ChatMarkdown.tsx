'use client';

import React, { useMemo, useState } from 'react';
import { BrainCircuit, ChevronDown } from 'lucide-react';
import MathFormula, { MathText } from '@/components/MathFormula';

/**
 * Lightweight markdown renderer for AI chat replies.
 *
 * Handles exactly the structure math tutors emit — no more: display-math
 * blocks ($$...$$), headings, bullet/ordered lists, inline code, **bold**
 * and inline $...$ math (via MathText). Structure below that would need a
 * full markdown dependency; nothing here justifies one.
 *
 * Reasoning-model <think> blocks render as a collapsed, quiet disclosure.
 */

type InlineSegment =
  | { kind: 'code'; text: string }
  | { kind: 'rich'; text: string };

function splitCodeSpans(line: string): InlineSegment[] {
  const parts = line.split(/(`[^`]+`)/g).filter(Boolean);
  return parts.map((part) =>
    part.startsWith('`') && part.endsWith('`') && part.length > 2
      ? { kind: 'code', text: part.slice(1, -1) }
      : { kind: 'rich', text: part }
  );
}

function InlineRich({ text }: { text: string }) {
  return <MathText text={text} />;
}

interface TextBlock {
  type: 'paragraph' | 'heading' | 'ul' | 'ol';
  level?: number;
  items?: string[];
  text?: string;
}

function parseTextChunk(chunk: string): TextBlock[] {
  const blocks: TextBlock[] = [];
  const lines = chunk.split('\n');

  let paragraphLines: string[] = [];
  let listItems: string[] | null = null;
  let listType: 'ul' | 'ol' | null = null;

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      blocks.push({ type: 'paragraph', text: paragraphLines.join(' ') });
      paragraphLines = [];
    }
  };
  const flushList = () => {
    if (listItems && listItems.length > 0) {
      blocks.push({ type: listType ?? 'ul', items: listItems });
    }
    listItems = null;
    listType = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length,
        text: headingMatch[2].replace(/\*+/g, ''),
      });
      continue;
    }

    const ulMatch = line.match(/^[-*•]\s+(.*)$/);
    if (ulMatch) {
      flushParagraph();
      if (listType === 'ol') flushList();
      listType = 'ul';
      (listItems ??= []).push(ulMatch[1]);
      continue;
    }

    const olMatch = line.match(/^(\d+)[.)]\s+(.*)$/);
    if (olMatch) {
      flushParagraph();
      if (listType === 'ul') flushList();
      listType = 'ol';
      (listItems ??= []).push(olMatch[2]);
      continue;
    }

    flushList();
    paragraphLines.push(line.trim());
  }

  flushParagraph();
  flushList();
  return blocks;
}

export default function ChatMarkdown({ content }: { content: string }) {
  const [isThinkingOpen, setIsThinkingOpen] = useState(false);

  const { thinking, blocks } = useMemo(() => {
    // 1. Extract <think> blocks (handle unclosed tag from a stopped stream)
    let thinkingText = '';
    let working = content;

    const closed = working.match(/<think>([\s\S]*?)<\/think>/g);
    if (closed) {
      for (const m of closed) {
        thinkingText += m.replace(/<\/?think>/g, '').trim() + '\n\n';
      }
      working = working.replace(/<think>[\s\S]*?<\/think>/g, '');
    }
    const unclosed = working.match(/<think>([\s\S]*)$/);
    if (unclosed) {
      thinkingText += unclosed[1].trim();
      working = working.replace(/<think>[\s\S]*$/, '');
    }

    // 2. Normalize alternate math delimiters
    working = working
      .replace(/\\\[([\s\S]*?)\\\]/g, (_m, inner) => `\n$$${inner.trim()}$$\n`)
      .replace(/\\\(([\s\S]*?)\\\)/g, (_m, inner) => `$${inner.trim()}$`);

    // 3. Split display math from text chunks
    const segments = working.split(/(\$\$[\s\S]*?\$\$)/g).filter(Boolean);
    const outBlocks: (TextBlock | { type: 'math'; formula: string })[] = [];

    for (const seg of segments) {
      const trimmed = seg.trim();
      if (!trimmed) continue;
      if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length >= 4) {
        const formula = trimmed.slice(2, -2).trim();
        if (formula) outBlocks.push({ type: 'math', formula });
      } else {
        outBlocks.push(...parseTextChunk(trimmed));
      }
    }

    return { thinking: thinkingText.trim(), blocks: outBlocks };
  }, [content]);

  if (!content) return null;

  return (
    <div className="space-y-2.5">
      {thinking && (
        <div className="overflow-hidden rounded-lg border border-warn-line bg-warn-soft/60">
          <button
            type="button"
            onClick={() => setIsThinkingOpen((prev) => !prev)}
            aria-expanded={isThinkingOpen}
            className="flex w-full items-center justify-between gap-2 px-3 py-2"
          >
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-warn-ink">
              <BrainCircuit className="h-3.5 w-3.5" />
              استدلال مدل
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-warn-ink transition-transform ${
                isThinkingOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          {isThinkingOpen && (
            <p
              dir="auto"
              className="animate-rise whitespace-pre-wrap border-t border-warn-line px-3 py-2 text-[11px] leading-6 text-warn-ink/90"
            >
              {thinking}
            </p>
          )}
        </div>
      )}

      {blocks.map((block, idx) => {
        if (block.type === 'math') {
          return (
            <MathFormula key={idx} formula={block.formula} block highlight />
          );
        }

        if (block.type === 'heading') {
          return (
            <p
              key={idx}
              className={`font-bold text-ink ${
                (block.level ?? 3) <= 2 ? 'text-sm' : 'text-[13px]'
              }`}
            >
              <InlineRich text={block.text ?? ''} />
            </p>
          );
        }

        if (block.type === 'ul' || block.type === 'ol') {
          return (
            <ul key={idx} className="space-y-1.5 ps-1">
              {(block.items ?? []).map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2 text-[13px] leading-7 text-ink-2">
                  <span
                    className={`mt-2.5 shrink-0 rounded-full ${
                      block.type === 'ol'
                        ? 'hidden'
                        : 'h-1 w-1 bg-accent'
                    }`}
                    aria-hidden="true"
                  />
                  {block.type === 'ol' && (
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-accent-soft text-[10px] font-bold tabular-nums text-accent-deep dark:text-accent">
                      {itemIdx + 1}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <InlineRich text={item} />
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        // paragraph
        return (
          <p key={idx} className="text-[13px] leading-8 text-ink-2">
            {splitCodeSpans(block.text ?? '').map((seg, segIdx) =>
              seg.kind === 'code' ? (
                <code
                  key={segIdx}
                  dir="ltr"
                  className="inline-block rounded bg-muted px-1.5 py-0.5 align-middle font-mono text-[11px] text-accent-deep dark:text-accent"
                >
                  {seg.text}
                </code>
              ) : (
                <InlineRich key={segIdx} text={seg.text} />
              )
            )}
          </p>
        );
      })}
    </div>
  );
}
