'use client';

import React, { useEffect, useRef } from 'react';
import { Send, Square } from 'lucide-react';

/**
 * Shared prompt composer for the assistant drawer and the full-page
 * assistant: auto-growing textarea, Enter-to-send (skipped during IME
 * composition), stop button while streaming, optional quick-prompt chips.
 */

interface AssistantComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isBusy: boolean;
  onStop: () => void;
  quickPrompts?: string[];
  /** Chip click sends the prompt directly (drawer behavior); when absent, chips fill the textarea */
  onQuickPromptSend?: (prompt: string) => void;
  placeholder?: string;
  /** Focus the textarea on mount (used by the full page) */
  autoFocus?: boolean;
  id?: string;
}

const MAX_PROMPT_CHIP_CHARS = 64;

export default function AssistantComposer({
  value,
  onChange,
  onSend,
  isBusy,
  onStop,
  quickPrompts,
  onQuickPromptSend,
  placeholder = 'سوال ریاضی‌ات را بنویس… (Shift+Enter برای خط جدید)',
  autoFocus = false,
  id = 'assistant-prompt',
}: AssistantComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleTextareaChange = (next: string) => {
    onChange(next);
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  };

  // Programmatic clears (send, new chat) bypass onChange — collapse back
  useEffect(() => {
    if (value === '' && textareaRef.current) {
      textareaRef.current.style.height = '';
    }
  }, [value]);

  return (
    <div className="border-t border-line bg-surface p-3">
      {quickPrompts && quickPrompts.length > 0 && (
        <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isBusy}
              onClick={() =>
                onQuickPromptSend ? onQuickPromptSend(qp) : onChange(qp)
              }
              className="shrink-0 rounded-full border border-line bg-panel px-3 py-1.5 text-[11px] font-semibold text-ink-2 transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-deep disabled:opacity-50 dark:hover:text-accent"
            >
              {Array.from(qp).length > MAX_PROMPT_CHIP_CHARS
                ? `${Array.from(qp).slice(0, MAX_PROMPT_CHIP_CHARS).join('')}…`
                : qp}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
        className="flex items-end gap-2"
      >
        <textarea
          ref={textareaRef}
          id={id}
          rows={1}
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => handleTextareaChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder={placeholder}
          aria-label="متن پرسش"
          className="max-h-40 min-h-[44px] flex-1 resize-none rounded-xl border border-line-strong bg-paper px-3.5 py-2.5 text-[13px] leading-7 text-ink outline-none transition-colors focus:border-accent focus:bg-surface"
        />
        {isBusy ? (
          <button
            type="button"
            onClick={onStop}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-danger-line bg-danger-soft px-4 text-xs font-bold text-danger-ink transition-colors hover:bg-danger-tint"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            توقف
          </button>
        ) : (
          <button
            type="submit"
            disabled={!value.trim()}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-accent-solid px-4 text-xs font-bold text-white transition-colors hover:bg-accent-deep disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
            ارسال
          </button>
        )}
      </form>
    </div>
  );
}
