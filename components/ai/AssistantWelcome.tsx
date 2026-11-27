'use client';

import React from 'react';
import { BookOpen, Bot } from 'lucide-react';
import ChatMarkdown from '@/components/ai/ChatMarkdown';
import { MAX_SESSION_MESSAGES, type SessionModuleContext } from '@/lib/ai-sessions';
import { faDigits } from '@/lib/ai-sessions';

/**
 * Honest empty state for a fresh conversation: what the assistant is for,
 * which subject it is grounded in (or that it is not grounded at all), and
 * a real formula rendered with KaTeX. Not a fake assistant message.
 */
export default function AssistantWelcome({
  moduleContext,
}: {
  moduleContext: SessionModuleContext | null;
}) {
  const boundLabel = moduleContext?.subtopicTitle
    ? `${moduleContext.moduleTitle} · ${moduleContext.subtopicTitle}`
    : moduleContext?.moduleTitle;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 pt-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-solid text-white">
        <Bot className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold text-ink">دستیار درس ریاضیات مهندسی</h3>
      <div className="text-[13px] leading-8 text-ink-2">
        <ChatMarkdown
          content={
            'هر پرسشی درباره سری و تبدیل فوریه، اشتورم-لیوویل یا معادله گرما داری بپرس؛ راه‌حل را گام‌به‌گام و با بسط کامل انتگرال‌گیری جزء‌به‌جزء می‌نویسم.\n\n$$f(x) \\simeq \\frac{a_0}{2} + \\sum_{n=1}^{\\infty} \\left[ a_n \\cos\\left(\\frac{n\\pi x}{\\ell}\\right) + b_n \\sin\\left(\\frac{n\\pi x}{\\ell}\\right) \\right]$$'
          }
        />
      </div>
      <p className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-[11px] text-ink-3">
        <BookOpen className="h-3.5 w-3.5 shrink-0 text-accent" />
        {boundLabel
          ? `پاسخ‌ها بر پایهٔ مبحث «${boundLabel}» هماهنگ می‌شود`
          : 'بدون مبحث فعال؛ برای هماهنگی با درس‌نامه، مبحث دلخواه را انتخاب کن'}
      </p>
      <p className="text-[10px] text-ink-4">
        اولین پرسش خودکار عنوان گفت‌وگو را می‌سازد و تا{' '}
        {faDigits(MAX_SESSION_MESSAGES)} پیام آخر در همین مرورگر ذخیره می‌شود.
      </p>
    </div>
  );
}
