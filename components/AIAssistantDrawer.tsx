'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AISettings,
  ChatMessageItem,
  DEFAULT_AI_SETTINGS,
  OPENAI_COMPATIBLE_PRESETS,
  OpenAICompatiblePresetId,
  buildOpenAIChatCompletionsUrl,
} from '@/lib/ai-settings';
import ChatMarkdown from '@/components/ai/ChatMarkdown';
import {
  BookOpen,
  Bot,
  Settings2,
  Send,
  X,
  Square,
  Server,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Cpu,
  MessageSquareText,
  Copy,
  Check,
  Plus,
  ArrowDown,
  Eye,
  EyeOff,
  KeyRound,
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

const STORAGE_KEY_SETTINGS = 'eng_math_ai_settings_v1';
const STORAGE_KEY_CHAT = 'eng_math_ai_chat_v1';
const MAX_SAVED_MESSAGES = 60;

function nowTimeLabel(): string {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());
  } catch {
    return '';
  }
}

const WELCOME_MESSAGE: ChatMessageItem = {
  id: 'welcome-msg',
  role: 'assistant',
  content:
    'سلام! من دستیار درس **ریاضیات مهندسی** هستم. هر پرسشی درباره سری و تبدیل فوریه، اشتورم-لیوویل یا معادله گرما داری بپرس؛ راه‌حل را گام‌به‌گام و با بسط کامل انتگرال‌گیری جزء‌به‌جزء می‌نویسم.\n\n$$f(x) \\simeq \\frac{a_0}{2} + \\sum_{n=1}^{\\infty} \\left[ a_n \\cos\\left(\\frac{n\\pi x}{\\ell}\\right) + b_n \\sin\\left(\\frac{n\\pi x}{\\ell}\\right) \\right]$$\n\nبرای تنظیم مدل، به زبانه **تنظیمات AI** برو.',
  timestamp: '',
};

export default function AIAssistantDrawer({
  isOpen,
  activeTab,
  onTabChange: setActiveTab,
  onClose,
  draftPrompt,
  onDraftPromptChange,
  moduleContext,
}: AIAssistantDrawerProps) {
  const [settings, setSettings] = useState<AISettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_AI_SETTINGS;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = { ...DEFAULT_AI_SETTINGS, ...JSON.parse(saved) };
        // Migration: Gemini used to be a standalone provider card; it now
        // lives as a preset inside the OpenAI-compatible configuration.
        if (parsed.provider === 'gemini') {
          const geminiPreset =
            OPENAI_COMPATIBLE_PRESETS.find((p) => p.id === 'gemini')!;
          return {
            ...parsed,
            provider: 'openai_compatible',
            presetId: 'gemini',
            customBaseUrl: geminiPreset.baseUrl,
          };
        }
        return parsed;
      }
    } catch {
      // Ignore storage read errors
    }
    return DEFAULT_AI_SETTINGS;
  });

  const [messages, setMessages] = useState<ChatMessageItem[]>(() => {
    // Restore the saved conversation; falls back to the welcome card.
    // The drawer renders null until opened, so this never causes a
    // hydration mismatch.
    if (typeof window === 'undefined') return [WELCOME_MESSAGE];
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY_CHAT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as ChatMessageItem[];
        }
      }
    } catch {
      // Ignore storage read errors
    }
    return [WELCOME_MESSAGE];
  });
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [streamingModel, setStreamingModel] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const [internalPrompt, setInternalPrompt] = useState('');
  const inputPrompt = draftPrompt !== undefined ? draftPrompt : internalPrompt;
  const setInputPrompt = (val: string) => {
    if (onDraftPromptChange) {
      onDraftPromptChange(val);
    } else {
      setInternalPrompt(val);
    }
  };
  const [serverStatus, setServerStatus] = useState<{
    checked: boolean;
    geminiReady: boolean;
    openAICompatibleKeyConfigured: boolean;
    defaultOpenAIBaseUrl: string;
  }>({
    checked: false,
    geminiReady: true,
    openAICompatibleKeyConfigured: false,
    defaultOpenAIBaseUrl: 'https://api.openai.com/v1',
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const isNearBottomRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  /* ── Persistence: settings + conversation ── */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore storage write errors
    }
  }, [settings]);

  // Persist the conversation as it grows
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasRealMessages = messages.some((m) => m.id !== 'welcome-msg');
    try {
      if (hasRealMessages) {
        window.localStorage.setItem(
          STORAGE_KEY_CHAT,
          JSON.stringify(messages.slice(-MAX_SAVED_MESSAGES))
        );
      } else {
        window.localStorage.removeItem(STORAGE_KEY_CHAT);
      }
    } catch {
      // Ignore storage write errors
    }
  }, [messages]);

  /* ── Server status check when the drawer opens ── */
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    fetch('/api/ai/chat')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.ok) {
          setServerStatus({
            checked: true,
            geminiReady: Boolean(data.geminiReady),
            openAICompatibleKeyConfigured: Boolean(
              data.openAICompatibleKeyConfigured
            ),
            defaultOpenAIBaseUrl:
              data.defaultOpenAIBaseUrl || 'https://api.openai.com/v1',
          });
        }
      })
      .catch(() => {
        // Ignore status check error
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  /* ── Auto-scroll: follow only while the reader is already near the bottom ── */
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end',
    });
  }, []);

  const handleScrollAreaScroll = () => {
    const el = scrollAreaRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    isNearBottomRef.current = nearBottom;
    setShowJumpToBottom(!nearBottom);
  };

  useEffect(() => {
    if (!isOpen || activeTab !== 'chat') return;
    if (isNearBottomRef.current) {
      scrollToBottom(false);
    }
  }, [messages, streamingText, isOpen, activeTab, scrollToBottom]);

  const isBusy = isLoading;

  /* ── Sending: streaming SSE with abort support ── */
  const sendMessage = async (
    promptText?: string,
    historyOverride?: ChatMessageItem[]
  ) => {
    const textToSend = (promptText ?? inputPrompt).trim();
    if (!textToSend || isBusy) return;

    const baseHistory = historyOverride ?? messages;
    const userMsg: ChatMessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: nowTimeLabel(),
    };

    const updatedHistory = [...baseHistory, userMsg];
    setMessages(updatedHistory);
    if (!promptText) {
      setInputPrompt('');
    }
    setErrorBanner(null);
    setIsLoading(true);
    setStreamingText('');
    setStreamingModel(null);
    setActiveTab('chat');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulated = '';
    let activeModelUsed: string | null = null;

    const finalizeAssistant = (stopped: boolean) => {
      const content = accumulated.trim();
      if (!content) return;
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content,
          timestamp: nowTimeLabel(),
          providerUsed: settings.provider,
          modelUsed: activeModelUsed || settings.model,
          stopped: stopped || undefined,
        },
      ]);
    };

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          provider: settings.provider,
          customBaseUrl: settings.customBaseUrl,
          model: settings.model,
          detailLevel: settings.detailLevel,
          thinkingLevel: settings.thinkingLevel,
          includeModuleContext: settings.includeModuleContext,
          customSystemPrompt: settings.customSystemPrompt,
          apiKey: settings.apiKey.trim(),
          moduleContext,
          stream: true,
          messages: updatedHistory
            .filter((m) => m.id !== 'welcome-msg')
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          data?.error || `خطای سرور هوش مصنوعی (کد ${response.status})`
        );
      }
      if (!response.body) {
        throw new Error('جریان پاسخ از سرور در دسترس نیست.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload) continue;

          try {
            const event = JSON.parse(payload);
            if (event.type === 'meta') {
              activeModelUsed = event.modelUsed || settings.model;
              setStreamingModel(activeModelUsed);
            } else if (event.type === 'delta' && typeof event.text === 'string') {
              accumulated += event.text;
              setStreamingText(accumulated);
            } else if (event.type === 'error') {
              throw new Error(event.error || 'خطا در جریان پاسخ مدل.');
            }
            // 'done' ends the loop implicitly when the stream closes
          } catch (err) {
            if (err instanceof SyntaxError) continue;
            throw err;
          }
        }
      }

      finalizeAssistant(false);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // User pressed stop — keep whatever arrived
        finalizeAssistant(true);
      } else {
        const msg =
          err instanceof Error ? err.message : 'خطای شبکه در ارتباط با سرور';
        setErrorBanner(msg);
      }
    } finally {
      setIsLoading(false);
      setStreamingText(null);
      setStreamingModel(null);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
  };

  /* ── Regenerate: strip trailing assistant message(s) and resend the last prompt ── */
  const handleRegenerate = () => {
    if (isBusy) return;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        sendMessage(messages[i].content, messages.slice(0, i));
        return;
      }
    }
  };

  const handleCopyMessage = (msg: ChatMessageItem) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(msg.content).catch(() => {});
    }
    setCopiedId(msg.id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === msg.id ? null : prev));
    }, 1600);
  };

  const handleNewChat = () => {
    if (isBusy) handleStop();
    setMessages([WELCOME_MESSAGE]);
    setErrorBanner(null);
    setInputPrompt('');
  };

  /* ── Auto-grow textarea ── */
  const handleTextareaChange = (value: string) => {
    setInputPrompt(value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  };

  const activePreset =
    OPENAI_COMPATIBLE_PRESETS.find((p) => p.id === settings.presetId) ||
    OPENAI_COMPATIBLE_PRESETS[0];

  const handlePresetChange = (presetId: OpenAICompatiblePresetId) => {
    const found = OPENAI_COMPATIBLE_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setSettings((prev) => ({
      ...prev,
      provider: 'openai_compatible',
      presetId,
      customBaseUrl: found.baseUrl,
      model: found.defaultModel,
    }));
  };

  // A credential is available when the user entered a key in the settings
  // UI, or the server has an environment key as a fallback.
  const hasCredential =
    settings.apiKey.trim().length > 0 ||
    serverStatus.openAICompatibleKeyConfigured ||
    serverStatus.geminiReady;

  const quickPrompts = [
    `یک مثال امتحانی از مبحث «${moduleContext.subtopicTitle}» با حل کاملاً تشریحی و بدون حذف محاسبات پایه بده.`,
    `تمام مراحل انتگرال‌گیری جزء‌به‌جزء ($u$ و $dv$) و جایگذاری حدود در این بخش را گام‌به‌گام توضیح بده.`,
    `یک سوال چهارگزینه‌ای استاندارد از «${moduleContext.subtopicTitle}» طرح کن، جواب را نگیر؛ بعد از پاسخ من، درست بودن آن را با توضیح کامل بررسی کن.`,
    `نکات کلیدی امتحانی و دام‌های رایج در مبحث «${moduleContext.moduleTitle}» چیست؟`,
    `چگونه از تقارن زوج و فرد یا شرایط مرزی برای ساده‌سازی محاسبات این فصل استفاده کنیم؟`,
  ];

  const resolvedOpenAIEndpoint = buildOpenAIChatCompletionsUrl(
    settings.customBaseUrl
  );

  if (!isOpen) return null;

  const lastAssistantId = [...messages]
    .reverse()
    .find((m) => m.role === 'assistant')?.id;

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
            {/* Context strip */}
            <div className="flex items-center justify-between gap-2 border-b border-line bg-accent-soft/60 px-4 py-2 text-[11px]">
              <div className="flex min-w-0 items-center gap-1.5 text-accent-deep dark:text-accent">
                <BookOpen className="h-3.5 w-3.5 shrink-0" />
                <span className="shrink-0">مبحث فعال:</span>
                <strong className="truncate font-bold">
                  {moduleContext.subtopicTitle}
                </strong>
              </div>
              <button
                type="button"
                onClick={handleNewChat}
                className="flex shrink-0 items-center gap-1 rounded-md border border-line-strong bg-surface px-2 py-1 font-semibold text-ink-3 transition-colors hover:border-accent hover:text-accent"
              >
                <Plus className="h-3 w-3" />
                گفتگوی جدید
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollAreaRef}
              onScroll={handleScrollAreaScroll}
              className="relative flex-1 space-y-4 overflow-y-auto bg-paper p-4"
            >
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
                                onClick={handleRegenerate}
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
                <div className="flex flex-col items-stretch">
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
                        onClick={handleStop}
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

              {errorBanner && (
                <div className="rounded-xl border border-danger-line bg-danger-soft p-3.5 text-xs leading-6 text-danger-ink">
                  <div className="mb-1 flex items-center gap-1.5 font-bold">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>خطا در دریافت پاسخ:</span>
                  </div>
                  <p>{errorBanner}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleRegenerate}
                      className="flex items-center gap-1 rounded-lg bg-accent-solid px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-accent-deep"
                    >
                      <RotateCcw className="h-3 w-3" />
                      تلاش مجدد
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Jump to bottom */}
            {showJumpToBottom && (
              <button
                type="button"
                onClick={() => scrollToBottom()}
                aria-label="رفتن به پایین گفتگو"
                className="absolute bottom-36 left-1/2 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-line-strong bg-surface text-ink-2 shadow-lg transition-colors hover:border-accent hover:text-accent"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            )}

            {/* Quick prompts + composer */}
            <div className="border-t border-line bg-surface p-3">
              <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isBusy}
                    onClick={() => sendMessage(qp)}
                    className="shrink-0 rounded-full border border-line bg-panel px-3 py-1.5 text-[11px] font-semibold text-ink-2 transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-deep disabled:opacity-50 dark:hover:text-accent"
                  >
                    {qp.length > 64 ? `${qp.slice(0, 64)}…` : qp}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex items-end gap-2"
              >
                <textarea
                  ref={textareaRef}
                  rows={1}
                  value={inputPrompt}
                  onChange={(e) => handleTextareaChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="سوال ریاضی‌ات را بنویس… (Shift+Enter برای خط جدید)"
                  aria-label="متن پرسش"
                  className="max-h-40 min-h-[44px] flex-1 resize-none rounded-xl border border-line-strong bg-paper px-3.5 py-2.5 text-[13px] leading-7 text-ink outline-none transition-colors focus:border-accent focus:bg-surface"
                />
                {isBusy ? (
                  <button
                    type="button"
                    onClick={handleStop}
                    className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-danger-line bg-danger-soft px-4 text-xs font-bold text-danger-ink transition-colors hover:bg-danger-tint"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" />
                    توقف
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!inputPrompt.trim()}
                    className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-accent-solid px-4 text-xs font-bold text-white transition-colors hover:bg-accent-deep disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                    ارسال
                  </button>
                )}
              </form>
            </div>
          </>
        ) : (
          /* ══════════════════ SETTINGS ══════════════════ */
          <div className="flex-1 space-y-5 overflow-y-auto bg-paper p-4 sm:p-6">
            {/* Provider configuration — one panel, presets include Gemini */}
            <div className="space-y-4 rounded-xl border border-line bg-surface p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-accent" />
                  <span className="text-sm font-bold text-ink">
                    ۱. پیکربندی ارائه‌دهنده (سازگار با OpenAI)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings(DEFAULT_AI_SETTINGS)}
                  className="flex items-center gap-1 rounded-lg border border-line-strong bg-surface px-2.5 py-1 text-[11px] font-bold text-ink-3 transition-colors hover:text-ink"
                >
                  <RotateCcw className="h-3 w-3" />
                  بازنشانی
                </button>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink-2">
                  پیش‌تنظیم‌های آماده:
                </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {OPENAI_COMPATIBLE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handlePresetChange(preset.id)}
                        className={`rounded-lg border px-2.5 py-2 text-start text-xs font-bold transition-colors ${
                          settings.presetId === preset.id
                            ? 'border-accent bg-accent-soft text-accent-deep dark:text-accent'
                            : 'border-line bg-panel text-ink-3 hover:border-line-strong'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[11px] text-ink-4">
                    {activePreset.description}
                  </p>
                </div>

                {/* API key — entered here, stored only in this browser */}
                <div>
                  <label
                    htmlFor="api-key-input"
                    className="mb-1 block text-xs font-bold text-ink-2"
                  >
                    کلید API (API Key):
                  </label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-4" />
                    <input
                      id="api-key-input"
                      type={showApiKey ? 'text' : 'password'}
                      dir="ltr"
                      autoComplete="off"
                      value={settings.apiKey}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          apiKey: e.target.value,
                        }))
                      }
                      placeholder="sk-…"
                      aria-label="کلید API ارائه‌دهنده"
                      className="w-full rounded-lg border border-line-strong bg-panel py-2 pe-10 ps-9 font-mono text-xs text-ink outline-none transition-colors focus:border-accent focus:bg-surface"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey((prev) => !prev)}
                      aria-label={showApiKey ? 'پنهان کردن کلید' : 'نمایش کلید'}
                      className="absolute end-2.5 top-1/2 -translate-y-1/2 text-ink-4 transition-colors hover:text-ink"
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] leading-5 text-ink-4">
                    فقط در حافظه همین مرورگر ذخیره می‌شود و همراه هر درخواست به
                    مسیر سرور این برنامه فرستاده می‌شود. برای سرویس‌های محلی
                    (Ollama / LM Studio) خالی بگذار.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="custom-base-url-input"
                    className="mb-1 block text-xs font-bold text-ink-2"
                  >
                    آدرس پایه سرور (Base URL):
                  </label>
                  <input
                    id="custom-base-url-input"
                    type="text"
                    dir="ltr"
                    value={settings.customBaseUrl}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        presetId: 'custom',
                        customBaseUrl: e.target.value,
                      }))
                    }
                    placeholder="https://api.openai.com/v1"
                    className="w-full rounded-lg border border-line-strong bg-panel px-3 py-2 font-mono text-xs text-ink outline-none transition-colors focus:border-accent focus:bg-surface"
                  />
                  <div className="mt-1 flex items-center justify-between text-[11px] text-ink-4">
                    <span>مسیر نهایی:</span>
                    <code
                      dir="ltr"
                      className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-accent-deep dark:text-accent"
                    >
                      {resolvedOpenAIEndpoint}
                    </code>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="custom-model-input"
                    className="mb-1 block text-xs font-bold text-ink-2"
                  >
                    نام مدل (Model ID):
                  </label>
                  <input
                    id="custom-model-input"
                    type="text"
                    dir="ltr"
                    value={settings.model}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        model: e.target.value,
                      }))
                    }
                    placeholder="gpt-4o-mini"
                    className="w-full rounded-lg border border-line-strong bg-panel px-3 py-2 font-mono text-xs text-ink outline-none transition-colors focus:border-accent focus:bg-surface"
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-ink-4">
                      مدل‌های پیشنهادی:
                    </span>
                    {activePreset.suggestedModels.map((sm) => (
                      <button
                        key={sm}
                        type="button"
                        dir="ltr"
                        onClick={() =>
                          setSettings((prev) => ({ ...prev, model: sm }))
                        }
                        className={`rounded border px-2 py-0.5 font-mono text-[10px] transition-colors ${
                          settings.model === sm
                            ? 'border-accent bg-accent-solid text-white'
                            : 'border-line-strong bg-surface text-ink-2 hover:border-accent'
                        }`}
                      >
                        {sm}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-line bg-panel p-3 text-xs leading-6 text-ink-3">
                  <div className="flex items-center gap-1.5 font-bold text-ink">
                    {serverStatus.openAICompatibleKeyConfigured ? (
                      <CheckCircle2 className="h-4 w-4 text-ok" />
                    ) : (
                      <Server className="h-4 w-4 text-accent" />
                    )}
                    <span>وضعیت احراز هویت سمت سرور:</span>
                  </div>
                  <p className="mt-1 text-[11px]">
                    کلید API بالا فقط در مرورگر تو ذخیره می‌شود و با هر درخواست
                    از مسیر امن{' '}
                    <code dir="ltr" className="font-mono text-accent-deep">
                      /api/ai/chat
                    </code>{' '}
                    عبور می‌کند. در نبود آن، کلیدهای محیطی سرور (
                    <code dir="ltr" className="font-mono text-ink">
                      OPENAI_COMPATIBLE_API_KEY
                    </code>{' '}
                    یا{' '}
                    <code dir="ltr" className="font-mono text-ink">
                      GEMINI_API_KEY
                    </code>{' '}
                    برای پیش‌تنظیم Gemini) به‌عنوان جایگزین استفاده می‌شوند
                    (سرویس‌های محلی مانند Ollama به کلید نیاز ندارند).
                  </p>
                </div>
              </div>

            {/* Pedagogical settings */}
            <div className="space-y-4 rounded-xl border border-line bg-surface p-4">
              <div className="text-sm font-bold text-ink">
                ۲. تنظیمات آموزشی و نحوه بسط راه‌حل‌ها
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-ink-2">
                  سطح جزئیات راه‌حل‌ها:
                </label>
                <div className="space-y-2">
                  {(
                    [
                      {
                        id: 'full_step_by_step',
                        title: 'بسط کامل گام‌به‌گام بدون حذف محاسبات پایه (پیشنهادی)',
                        desc: 'نمایش کامل u و dv، جایگذاری صریح حدود و ساده‌سازی‌های مثلثاتی',
                      },
                      {
                        id: 'exam_prep',
                        title: 'رویکرد امتحانی و نکات تست/تشریحی',
                        desc: 'تمرکز بر تشخیص سریع تقارن، اتحاد پارسوال و شرایط مرزی',
                      },
                      {
                        id: 'conceptual',
                        title: 'توضیح مفهومی، فیزیکی و شهودی',
                        desc: 'معنای فیزیکی هماهنگ‌ها، طیف فرکانسی و پخش گرما',
                      },
                    ] as const
                  ).map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          detailLevel: mode.id,
                        }))
                      }
                      className={`flex w-full flex-col items-start rounded-lg border p-3 text-start transition-colors ${
                        settings.detailLevel === mode.id
                          ? 'border-accent bg-accent-soft'
                          : 'border-line bg-panel hover:border-line-strong'
                      }`}
                    >
                      <span className="text-xs font-bold text-ink">
                        {mode.title}
                      </span>
                      <span className="mt-0.5 text-[11px] text-ink-3">
                        {mode.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-line bg-panel p-3">
                <div>
                  <div className="text-xs font-bold text-ink">
                    ارسال خودکار مبحث فعلی درس به دستیار
                  </div>
                  <div className="text-[11px] text-ink-3">
                    فصل، زیرمبحث فعال و فرمول‌ها و نکات رسمی درس‌نامه به‌عنوان
                    زمینه علمی ارسال می‌شود
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.includeModuleContext}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      includeModuleContext: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-[var(--accent)]"
                />
              </label>

              <div>
                <label
                  htmlFor="custom-system-prompt"
                  className="mb-1 block text-xs font-bold text-ink-2"
                >
                  دستورالعمل سفارشی سیستم:
                </label>
                <textarea
                  id="custom-system-prompt"
                  rows={3}
                  value={settings.customSystemPrompt}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      customSystemPrompt: e.target.value,
                    }))
                  }
                  placeholder="مثال: در انتهای هر پاسخ یک تمرین مشابه با جواب نهایی پیشنهاد بده…"
                  className="w-full rounded-lg border border-line-strong bg-panel p-3 text-xs leading-6 text-ink outline-none transition-colors focus:border-accent focus:bg-surface"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className="flex items-center gap-1.5 rounded-xl bg-accent-solid px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-accent-deep"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  ذخیره و بازگشت به گفتگو
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
