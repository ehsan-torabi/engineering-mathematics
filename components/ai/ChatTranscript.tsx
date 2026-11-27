'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowDown, Bot, Check, Copy, RotateCcw, Square } from 'lucide-react';
import type { ChatMessageItem } from '@/lib/ai-settings';
import ChatMarkdown from '@/components/ai/ChatMarkdown';

/**
 * Shared conversation transcript for the assistant drawer and the full-page
 * assistant: message bubbles, the streaming bubble with stop, the error row
 * with retry, scroll-following that never fights a reader who scrolled up,
 * and a log role so screen readers follow the conversation.
 */

interface ChatTranscriptProps {
  messages: ChatMessageItem[];
  streamingText: string | null;
  streamingModel: string | null;
  isBusy: boolean;
  errorBanner: string | null;
  onRegenerate: () => void;
  onStop: () => void;
  /** Rendered instead of bubbles while the session has no messages yet */
  emptyState: React.ReactNode;
  className?: string;
}

export default function ChatTranscript({
  messages,
  streamingText,
  streamingModel,
  isBusy,
  errorBanner,
  onRegenerate,
  onStop,
  emptyState,
  className = '',
}: ChatTranscriptProps) {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const isNearBottomRef = useRef(true);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleScrollAreaScroll = () => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    isNearBottomRef.current = nearBottom;
    setShowJumpToBottom(!nearBottom);
  };

  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollAreaRef.current;
    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, []);

  // Follow only while the reader is already near the bottom; also settles
  // the initial view on mount (isNearBottomRef starts true)
  useEffect(() => {
    if (isNearBottomRef.current) {
      scrollToBottom(false);
    }
  }, [messages, streamingText, scrollToBottom]);

  const handleCopyMessage = (msg: ChatMessageItem) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(msg.content).catch(() => {});
    }
    setCopiedId(msg.id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === msg.id ? null : prev));
    }, 1600);
  };

  const lastAssistantId = [...messages]
    .reverse()
    .find((m) => m.role === 'assistant')?.id;

  const isEmpty = messages.length === 0 && streamingText === null;

  return (
    <div className={`relative flex-1 min-h-0 ${className}`}>
      <div
        ref={scrollAreaRef}
        onScroll={handleScrollAreaScroll}
        role="log"
        aria-label="گفت‌وگو با دستیار"
        aria-busy={isBusy || undefined}
        className="absolute inset-0 space-y-4 overflow-y-auto bg-paper p-4"
      >
        {isEmpty ? (
          emptyState
        ) : (
          <>
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-stretch'}`}
                >
                  <div
                    className={`rounded-xl border p-3.5 ${
                      isUser
                        ? 'max-w-[85%] border-accent-line bg-accent-soft'
                        : 'border-line bg-surface'
                    }`}
                  >
                    {!isUser && (
                      <div className="mb-2 flex items-center justify-between gap-2 border-b border-line pb-1.5">
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-ink-3">
                          <Bot className="h-3.5 w-3.5 text-accent" />
                          پاسخ دستیار
                          {msg.modelUsed && (
                            <span
                              dir="ltr"
                              className="rounded border border-line bg-paper px-1.5 py-0.5 font-mono text-[10px] font-normal text-accent-deep dark:text-accent"
                            >
                              {msg.modelUsed}
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-1">
                          {msg.stopped && (
                            <span className="text-[10px] font-semibold text-warn-ink">
                              متوقف شد
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg)}
                            aria-label="کپی پاسخ"
                            title="کپی متن پاسخ"
                            className="flex h-6 w-6 items-center justify-center rounded-md text-ink-4 transition-colors hover:bg-muted hover:text-ink"
                          >
                            {copiedId === msg.id ? (
                              <Check className="h-3.5 w-3.5 text-ok" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                          {msg.id === lastAssistantId && (
                            <button
                              type="button"
                              onClick={onRegenerate}
                              disabled={isBusy}
                              aria-label="تولید مجدد پاسخ"
                              title="پاسخ جدید با همین پرسش"
                              className="flex h-6 w-6 items-center justify-center rounded-md text-ink-4 transition-colors hover:bg-muted hover:text-ink disabled:opacity-40"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-[13px] leading-8 text-ink">
                      <ChatMarkdown content={msg.content} />
                    </div>

                    {msg.timestamp && (
                      <div className="mt-1.5 text-[10px] text-ink-4">
                        {msg.timestamp}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Streaming bubble */}
            {streamingText !== null && (
              <div className="flex flex-col items-stretch" aria-busy="true">
                <div className="rounded-xl border border-line bg-surface p-3.5">
                  <div className="mb-2 flex items-center justify-between gap-2 border-b border-line pb-1.5">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-ink-3">
                      <Bot className="h-3.5 w-3.5 text-accent" />
                      {streamingText ? 'در حال نوشتن' : 'در حال فکر کردن'}
                      {streamingModel && (
                        <span
                          dir="ltr"
                          className="rounded border border-line bg-paper px-1.5 py-0.5 font-mono text-[10px] font-normal text-accent-deep dark:text-accent"
                        >
                          {streamingModel}
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={onStop}
                      aria-label="توقف تولید پاسخ"
                      className="flex items-center gap-1 rounded-md border border-danger-line bg-danger-soft px-2 py-1 text-[10px] font-bold text-danger-ink transition-colors hover:bg-danger-tint"
                    >
                      <Square className="h-2.5 w-2.5 fill-current" />
                      توقف
                    </button>
                  </div>

                  {streamingText ? (
                    <div className="after:inline-block after:animate-pulse after:content-['▍']">
                      <ChatMarkdown content={streamingText} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:0ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:150ms]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-accent [animation-delay:300ms]" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {errorBanner && (
          <div
            role="alert"
            className="rounded-xl border border-danger-line bg-danger-soft p-3.5 text-xs leading-6 text-danger-ink"
          >
            <div className="mb-1 flex items-center gap-1.5 font-bold">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>خطا در دریافت پاسخ:</span>
            </div>
            <p>{errorBanner}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onRegenerate}
                className="flex items-center gap-1 rounded-lg bg-accent-solid px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-accent-deep"
              >
                <RotateCcw className="h-3 w-3" />
                تلاش مجدد
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Jump to bottom */}
      {showJumpToBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom()}
          aria-label="رفتن به پایین گفتگو"
          className="absolute bottom-4 left-1/2 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-line-strong bg-surface text-ink-2 shadow-lg transition-colors hover:border-accent hover:text-accent"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
