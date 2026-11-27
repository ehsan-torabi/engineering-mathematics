'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { OPENAI_COMPATIBLE_PRESETS } from '@/lib/ai-settings';
import type { SessionModuleContext } from '@/lib/ai-sessions';
import { useAssistantChat } from '@/hooks/use-assistant-chat';
import ChatTranscript from '@/components/ai/ChatTranscript';
import AssistantComposer from '@/components/ai/AssistantComposer';
import AssistantWelcome from '@/components/ai/AssistantWelcome';
import AISettingsPanel from '@/components/ai/AISettingsPanel';
import {
  BookOpen,
  Bot,
  Settings2,
  X,
  Plus,
  Maximize2,
  MessageSquareText,
  Link2,
} from 'lucide-react';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  activeTab: 'chat' | 'settings';
  onTabChange: (tab: 'chat' | 'settings') => void;
  onClose: () => void;
  draftPrompt?: string;
  onDraftPromptChange?: (prompt: string) => void;
  moduleContext: {
    /** Sent to /api/ai/chat so the server can ground the reply in the official درس‌نامه */
    moduleId?: string;
    moduleTitle: string;
    moduleSubtitle: string;
    subtopicId?: string;
    subtopicTitle: string;
  };
}

/**
 * Slide-in assistant backed by the shared session engine
 * (hooks/use-assistant-chat): conversations persist, survive navigation
 * and are grounded in the subject the session was started from. Full
 * session management lives on /assistant.
 */
export default function AIAssistantDrawer({
  isOpen,
  activeTab,
  onTabChange: setActiveTab,
  onClose,
  draftPrompt,
  onDraftPromptChange,
  moduleContext,
}: AIAssistantDrawerProps) {
  // The live page context, or none outside the workspace (home/exams)
  const bindableContext: SessionModuleContext | null = moduleContext.moduleId
    ? moduleContext
    : null;

  const chat = useAssistantChat({
    getNewSessionContext: () => bindableContext,
    statusEnabled: isOpen,
  });
  const {
    settings,
    setSettings,
    activeSession,
    messages,
    streamingText,
    streamingModel,
    isBusy,
    errorBanner,
    sendMessage,
    stop,
    regenerate,
    newChat,
    setSessionContext,
    serverStatus,
  } = chat;

  const [internalPrompt, setInternalPrompt] = useState('');
  const inputPrompt = draftPrompt !== undefined ? draftPrompt : internalPrompt;
  const setInputPrompt = (val: string) => {
    if (onDraftPromptChange) {
      onDraftPromptChange(val);
    } else {
      setInternalPrompt(val);
    }
  };

  const handleSend = () => {
    const text = inputPrompt.trim();
    if (!text || isBusy) return;
    setInputPrompt('');
    void sendMessage(text);
  };

  const handleNewChat = () => {
    newChat();
    setInputPrompt('');
  };

  const activePreset =
    OPENAI_COMPATIBLE_PRESETS.find((p) => p.id === settings.presetId) ||
    OPENAI_COMPATIBLE_PRESETS[0];

  // Escape closes the dialog (settings tab returns to chat first)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (activeTab === 'settings') {
        setActiveTab('chat');
        return;
      }
      onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeTab, setActiveTab, onClose]);

  // A credential is available when the user entered a key in the settings
  // UI, or the server has an environment key as a fallback.
  const hasCredential =
    settings.apiKey.trim().length > 0 ||
    serverStatus.openAICompatibleKeyConfigured ||
    serverStatus.geminiReady;

  const boundContext = activeSession?.moduleContext ?? null;
  const boundSubjectLabel = boundContext
    ? boundContext.subtopicTitle || boundContext.moduleTitle
    : '';
  const canRebind =
    Boolean(activeSession) &&
    Boolean(bindableContext) &&
    boundContext?.moduleId !== bindableContext?.moduleId;

  const quickPromptSubject =
    boundContext?.subtopicTitle || boundContext?.moduleTitle || 'این درس';
  const quickPrompts = [
    `یک مثال امتحانی از مبحث «${quickPromptSubject}» با حل کاملاً تشریحی و بدون حذف محاسبات پایه بده.`,
    `تمام مراحل انتگرال‌گیری جزء‌به‌جزء ($u$ و $dv$) و جایگذاری حدود در این بخش را گام‌به‌گام توضیح بده.`,
    `یک سوال چهارگزینه‌ای استاندارد از «${quickPromptSubject}» طرح کن، جواب را نگیر؛ بعد از پاسخ من، درست بودن آن را با توضیح کامل بررسی کن.`,
    `نکات کلیدی امتحانی و دام‌های رایج در مبحث «${quickPromptSubject}» چیست؟`,
    `چگونه از تقارن زوج و فرد یا شرایط مرزی برای ساده‌سازی محاسبات این فصل استفاده کنیم؟`,
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-start bg-ink/30 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="دستیار هوشمند ریاضیات مهندسی"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex h-full w-full max-w-2xl flex-col border-s border-line-strong bg-surface shadow-2xl">
        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-solid text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold text-ink">
                دستیار هوشمند درس
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-ink-3">
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    serverStatus.checked
                      ? hasCredential
                        ? 'bg-ok'
                        : 'bg-warn'
                      : 'bg-ink-4'
                  }`}
                />
                <span dir="auto" className="truncate">
                  {activePreset.label} · {settings.model}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <div className="flex rounded-lg border border-line-strong bg-surface p-0.5">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                aria-pressed={activeTab === 'chat'}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-accent-solid text-white'
                    : 'text-ink-3 hover:text-ink'
                }`}
              >
                <MessageSquareText className="h-3.5 w-3.5" />
                گفتگو
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                aria-pressed={activeTab === 'settings'}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-accent-solid text-white'
                    : 'text-ink-3 hover:text-ink'
                }`}
              >
                <Settings2 className="h-3.5 w-3.5" />
                تنظیمات
              </button>
            </div>

            <Link
              href="/assistant"
              aria-label="باز کردن صفحهٔ کامل دستیار"
              title="صفحهٔ کامل دستیار و جلسات"
              className="hidden h-8 w-8 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-muted hover:text-ink sm:flex"
            >
              <Maximize2 className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={onClose}
              aria-label="بستن دستیار هوشمند"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-muted hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ══════════════════ CHAT ══════════════════ */}
        {activeTab === 'chat' ? (
          <>
            {/* Context strip: shows the session's bound subject */}
            <div className="flex items-center justify-between gap-2 border-b border-line bg-accent-soft/60 px-4 py-2 text-[11px]">
              <div className="flex min-w-0 items-center gap-1.5 text-accent-deep dark:text-accent">
                <BookOpen className="h-3.5 w-3.5 shrink-0" />
                <span className="shrink-0">مبحث فعال:</span>
                {boundContext ? (
                  <strong className="truncate font-bold">
                    {boundSubjectLabel}
                  </strong>
                ) : (
                  <span className="truncate text-ink-3">
                    بدون مبحث فعال — پاسخ عمومی
                  </span>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {canRebind && (
                  <button
                    type="button"
                    onClick={() =>
                      activeSession &&
                      setSessionContext(activeSession.id, bindableContext)
                    }
                    title="هماهنگ کردن این گفت‌وگو با مبحث همین صفحه"
                    className="flex items-center gap-1 rounded-md border border-line-strong bg-surface px-2 py-1 font-semibold text-ink-3 transition-colors hover:border-accent hover:text-accent"
                  >
                    <Link2 className="h-3 w-3" />
                    اتصال به مبحث فعلی
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="flex items-center gap-1 rounded-md border border-line-strong bg-surface px-2 py-1 font-semibold text-ink-3 transition-colors hover:border-accent hover:text-accent"
                >
                  <Plus className="h-3 w-3" />
                  گفتگوی جدید
                </button>
              </div>
            </div>

            <ChatTranscript
              messages={messages}
              streamingText={streamingText}
              streamingModel={streamingModel}
              isBusy={isBusy}
              errorBanner={errorBanner}
              onRegenerate={regenerate}
              onStop={stop}
              emptyState={<AssistantWelcome moduleContext={boundContext} />}
            />

            <AssistantComposer
              value={inputPrompt}
              onChange={setInputPrompt}
              onSend={handleSend}
              isBusy={isBusy}
              onStop={stop}
              quickPrompts={quickPrompts}
              onQuickPromptSend={(qp) => {
                setInputPrompt('');
                void sendMessage(qp);
              }}
            />
          </>
        ) : (
          /* ══════════════════ SETTINGS ══════════════════ */
          <div className="flex-1 overflow-y-auto bg-paper p-4 sm:p-6">
            <AISettingsPanel
              settings={settings}
              onChange={setSettings}
              serverStatus={serverStatus}
              onDone={() => setActiveTab('chat')}
            />
          </div>
        )}
      </div>
    </div>
  );
}
