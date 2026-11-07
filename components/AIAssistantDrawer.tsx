'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  AISettings,
  ChatMessageItem,
  DEFAULT_AI_SETTINGS,
  GEMINI_AVAILABLE_MODELS,
  OPENAI_COMPATIBLE_PRESETS,
  OpenAICompatiblePresetId,
  buildOpenAIChatCompletionsUrl,
  parseMathMarkdownBlocks,
} from '@/lib/ai-settings';
import MathFormula, { MathText } from '@/components/MathFormula';
import {
  Bot,
  Settings2,
  Send,
  X,
  Trash2,
  Sparkles,
  Server,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Cpu,
  MessageSquareText,
} from 'lucide-react';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  activeTab: 'chat' | 'settings';
  onTabChange: (tab: 'chat' | 'settings') => void;
  onClose: () => void;
  draftPrompt?: string;
  onDraftPromptChange?: (prompt: string) => void;
  moduleContext: {
    moduleTitle: string;
    moduleSubtitle: string;
    subtopicTitle: string;
  };
}

const STORAGE_KEY_SETTINGS = 'eng_math_ai_settings_v1';

const INITIAL_ASSISTANT_MESSAGE: ChatMessageItem = {
  id: 'welcome-msg',
  role: 'assistant',
  content:
    'سلام! من دستیار هوشمند درس **ریاضیات مهندسی** هستم. هر پرسشی درباره سری فوریه، انتگرال و تبدیل فوریه، مسئله اشتورم-لیوویل یا معادله گرما دارید بپرسید تا راه‌حل را با **بسط کامل تمام مراحل انتگرال‌گیری جزء‌به‌جزء و جایگذاری حدود** به صورت استاندارد برایتان بنویسم.\n\n$$f(x) \\simeq \\frac{a_0}{2} + \\sum_{n=1}^{\\infty} \\left[ a_n \\cos\\left(\\frac{n\\pi x}{\\ell}\\right) + b_n \\sin\\left(\\frac{n\\pi x}{\\ell}\\right) \\right]$$\n\nهمچنین از زبانه **تنظیمات AI (Settings)** می‌توانید بین مدل پیش‌فرض **Google Gemini** یا هر **ارائه‌دهنده سفارشی سازگار با استاندارد OpenAI (Custom Provider)** جابه‌جا شوید.',
  timestamp: 'اکنون',
  providerUsed: 'gemini',
  modelUsed: 'gemini-3.8-flash',
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
        return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore storage read errors
    }
    return DEFAULT_AI_SETTINGS;
  });

  const [messages, setMessages] = useState<ChatMessageItem[]>([
    INITIAL_ASSISTANT_MESSAGE,
  ]);
  const [internalPrompt, setInternalPrompt] = useState<string>('');
  const inputPrompt = draftPrompt !== undefined ? draftPrompt : internalPrompt;
  const setInputPrompt = (val: string) => {
    if (onDraftPromptChange) {
      onDraftPromptChange(val);
    } else {
      setInternalPrompt(val);
    }
  };
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
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
  const msgCounterRef = useRef<number>(1);

  // Persist AI settings to localStorage whenever modified
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY_SETTINGS,
        JSON.stringify(settings)
      );
    } catch {
      // Ignore storage write errors
    }
  }, [settings]);

  // Check server status when drawer opens
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

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeTab]);

  if (!isOpen) return null;

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

  const handleProviderSwitch = (provider: 'gemini' | 'openai_compatible') => {
    if (provider === 'gemini') {
      setSettings((prev) => ({
        ...prev,
        provider: 'gemini',
        model: GEMINI_AVAILABLE_MODELS.some((m) => m.id === prev.model)
          ? prev.model
          : 'gemini-3.8-flash',
      }));
    } else {
      const preset =
        OPENAI_COMPATIBLE_PRESETS.find((p) => p.id === settings.presetId) ||
        OPENAI_COMPATIBLE_PRESETS[0];
      setSettings((prev) => ({
        ...prev,
        provider: 'openai_compatible',
        customBaseUrl: prev.customBaseUrl || preset.baseUrl,
        model:
          prev.provider === 'gemini' ? preset.defaultModel : prev.model,
      }));
    }
  };

  const sendMessage = async (promptText?: string) => {
    const textToSend = (promptText ?? inputPrompt).trim();
    if (!textToSend || isLoading) return;

    msgCounterRef.current += 1;
    const userMsg: ChatMessageItem = {
      id: `user-${msgCounterRef.current}`,
      role: 'user',
      content: textToSend,
      timestamp: 'اکنون',
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    if (!promptText) {
      setInputPrompt('');
    }
    setErrorBanner(null);
    setIsLoading(true);
    setActiveTab('chat');

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: settings.provider,
          customBaseUrl: settings.customBaseUrl,
          model: settings.model,
          detailLevel: settings.detailLevel,
          thinkingLevel: settings.thinkingLevel,
          includeModuleContext: settings.includeModuleContext,
          customSystemPrompt: settings.customSystemPrompt,
          moduleContext,
          messages: updatedHistory
            .filter((m) => m.id !== 'welcome-msg')
            .map((m) => ({
              role: m.role,
              content: m.content,
            })),
        }),
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        setErrorBanner(
          data.error || 'خطا در دریافت پاسخ از سرور هوش مصنوعی.'
        );
      } else {
        msgCounterRef.current += 1;
        const assistantMsg: ChatMessageItem = {
          id: `assistant-${msgCounterRef.current}`,
          role: 'assistant',
          content: data.text || 'پاسخی دریافت نشد.',
          timestamp: 'اکنون',
          providerUsed: data.providerUsed || settings.provider,
          modelUsed: data.modelUsed || settings.model,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'خطای شبکه در ارتباط با سرور';
      setErrorBanner(`خطا در ارتباط با سرور: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    `یک مثال امتحانی از مبحث «${moduleContext.subtopicTitle}» با حل کاملاً تشریحی و بدون حذف محاسبات پایه بده.`,
    `تمام مراحل انتگرال‌گیری جزء‌به‌جزء ($u$ و $dv$) و جایگذاری حدود در این بخش را گام‌به‌گام توضیح بده.`,
    `نکات کلیدی امتحانی و دام‌های رایج در مبحث «${moduleContext.moduleTitle}» چیست؟`,
    `چگونه از تقارن زوج و فرد یا شرایط مرزی برای ساده‌سازی محاسبات این فصل استفاده کنیم؟`,
  ];

  const resolvedOpenAIEndpoint = buildOpenAIChatCompletionsUrl(
    settings.customBaseUrl
  );

  return (
    <div
      className="fixed inset-0 z-50 flex justify-start bg-slate-900/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="دستیار هوشمند ریاضیات مهندسی و تنظیمات AI"
    >
      <div className="flex h-full w-full max-w-2xl flex-col border-l border-[#CBD5E1] bg-white shadow-2xl">
        {/* Top Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0284C7] text-white shadow-2xs">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] sm:text-base">
                دستیار هوشمند ریاضیات مهندسی (AI Tutor)
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-[#475569]">
                <span className="inline-block h-2 w-2 rounded-full bg-[#059669]" />
                <span>
                  {settings.provider === 'gemini'
                    ? `Google Gemini (${settings.model})`
                    : `OpenAI-Compatible (${settings.model})`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Switch between Chat and AI Settings */}
            <div className="flex rounded-lg border border-[#CBD5E1] bg-white p-0.5">
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold transition ${
                  activeTab === 'chat'
                    ? 'bg-[#0284C7] text-white'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                <MessageSquareText className="h-3.5 w-3.5" />
                <span>گفتگو</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold transition ${
                  activeTab === 'settings'
                    ? 'bg-[#0284C7] text-white'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                <Settings2 className="h-3.5 w-3.5" />
                <span>تنظیمات AI</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#CBD5E1] bg-white p-2 text-[#475569] transition hover:bg-[#F1F5F9] hover:text-[#0F172A]"
              aria-label="بستن دستیار هوشمند"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* TAB 1: CHAT INTERFACE */}
        {activeTab === 'chat' ? (
          <>
            {/* Active Context Banner + Clear Chat */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] bg-[#F0F9FF]/70 px-4 py-2 text-xs">
              <div className="flex items-center gap-1.5 text-[#0369A1]">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span>مبحث فعال:</span>
                <strong className="font-bold">
                  <MathText text={moduleContext.subtopicTitle} />
                </strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('settings')}
                  className="font-bold text-[#0284C7] underline-offset-4 hover:underline"
                >
                  تغییر ارائه‌دهنده / مدل
                </button>
                <button
                  type="button"
                  onClick={() => setMessages([INITIAL_ASSISTANT_MESSAGE])}
                  className="flex items-center gap-1 rounded border border-[#CBD5E1] bg-white px-2 py-1 text-[11px] font-semibold text-[#475569] hover:text-[#DC2626]"
                >
                  <Trash2 className="h-3 w-3" />
                  پاک‌سازی گفتگو
                </button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                const parsedBlocks = parseMathMarkdownBlocks(msg.content);

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isUser ? 'items-start' : 'items-stretch'
                    }`}
                  >
                    <div
                      className={`rounded-2xl border p-4 ${
                        isUser
                          ? 'max-w-[90%] border-[#0284C7]/30 bg-[#F0F9FF] text-[#0F172A]'
                          : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#0F172A] shadow-2xs'
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between gap-2 border-b border-[#E2E8F0]/80 pb-1.5 text-[11px] text-[#64748B]">
                        <span className="font-bold text-[#0F172A]">
                          {isUser ? 'پرسش شما' : 'پاسخ تشریحی دستیار هوشمند'}
                        </span>
                        <div className="flex items-center gap-2">
                          {!isUser && msg.modelUsed && (
                            <span
                              dir="ltr"
                              className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] text-[#0369A1] border border-[#E2E8F0]"
                            >
                              {msg.providerUsed === 'openai_compatible'
                                ? `OpenAI-API • ${msg.modelUsed}`
                                : msg.modelUsed}
                            </span>
                          )}
                          <span>{msg.timestamp}</span>
                        </div>
                      </div>

                      <div className="space-y-2.5 text-xs leading-7 sm:text-sm sm:leading-8">
                        {parsedBlocks.map((block, bIdx) => {
                          if (block.type === 'display_math') {
                            return (
                              <MathFormula
                                key={bIdx}
                                formula={block.content}
                                block
                                highlight
                              />
                            );
                          }
                          return (
                            <p key={bIdx} className="text-[#1E293B]">
                              <MathText text={block.content} />
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="rounded-xl border border-[#0284C7]/30 bg-[#F0F9FF]/60 p-4 text-xs text-[#0369A1]">
                  <div className="flex items-center gap-2 font-bold">
                    <span className="inline-block h-2.5 w-2.5 animate-ping rounded-full bg-[#0284C7]" />
                    <span>
                      در حال استنتاج و بسط گام‌به‌گام روابط ریاضی با مدل{' '}
                      <span dir="ltr" className="font-mono">
                        {settings.model}
                      </span>
                      ...
                    </span>
                  </div>
                </div>
              )}

              {errorBanner && (
                <div className="rounded-xl border border-[#DC2626]/40 bg-[#FEF2F2] p-3.5 text-xs leading-6 text-[#991B1B]">
                  <div className="mb-1 flex items-center gap-1.5 font-bold">
                    <AlertCircle className="h-4 w-4 shrink-0 text-[#DC2626]" />
                    <span>خطا در دریافت پاسخ:</span>
                  </div>
                  <p>{errorBanner}</p>
                  {settings.provider === 'openai_compatible' && (
                    <button
                      type="button"
                      onClick={() => handleProviderSwitch('gemini')}
                      className="mt-2 rounded-lg bg-[#0284C7] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0369A1]"
                    >
                      بازگشت فوری به Google Gemini (پیش‌فرض سرور)
                    </button>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts + Input Form */}
            <div className="border-t border-[#E2E8F0] bg-[#F8FAFC] p-3.5 sm:p-4">
              <div className="mb-2.5 flex gap-1.5 overflow-x-auto pb-1">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isLoading}
                    onClick={() => sendMessage(qp)}
                    className="shrink-0 rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-right text-[11px] font-semibold text-[#334155] transition hover:border-[#0284C7] hover:bg-[#F0F9FF] hover:text-[#0369A1] disabled:opacity-50"
                  >
                    <MathText text={qp} />
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
                  rows={2}
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="سوال یا معادله ریاضی خود را بنویسید (مثلاً: سری فوریه f(x)=x^2 را در بازه [-π, π] گام به گام حساب کن)..."
                  className="flex-1 resize-none rounded-xl border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-xs leading-6 text-[#0F172A] focus:border-[#0284C7] focus:outline-hidden sm:text-sm"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputPrompt.trim()}
                  className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-[#0284C7] px-4 text-xs font-bold text-white shadow-2xs transition hover:bg-[#0369A1] disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  <span>ارسال</span>
                </button>
              </form>
            </div>
          </>
        ) : (
          /* TAB 2: AI SETTINGS & OPENAI-COMPATIBLE CUSTOM PROVIDER CONFIGURATION */
          <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
            {/* Section 1: Provider Architecture Selection */}
            <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-[#0F172A]">
                  <Cpu className="h-4 w-4 text-[#0284C7]" />
                  <span>۱. انتخاب ارائه‌دهنده هوش مصنوعی (AI Provider)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings(DEFAULT_AI_SETTINGS)}
                  className="flex items-center gap-1 rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-1 text-[11px] font-bold text-[#475569] hover:text-[#0F172A]"
                >
                  <RotateCcw className="h-3 w-3" />
                  بازنشانی به پیش‌فرض
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleProviderSwitch('gemini')}
                  className={`flex flex-col items-start rounded-xl border p-3.5 text-right transition ${
                    settings.provider === 'gemini'
                      ? 'border-[#0284C7] bg-[#F0F9FF] ring-2 ring-[#0284C7]/20'
                      : 'border-[#CBD5E1] bg-white hover:border-[#94A3B8]'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xs font-bold text-[#0F172A]">
                      Google Gemini (پیش‌فرض سرور)
                    </span>
                    <span className="rounded bg-[#059669]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#065F46]">
                      متصل و آماده
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-5 text-[#475569]">
                    استفاده مستقیم از SDK رسمی سرور با پشتیبانی از استدلال ریاضی و فرمول‌نویسی KaTeX
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleProviderSwitch('openai_compatible')}
                  className={`flex flex-col items-start rounded-xl border p-3.5 text-right transition ${
                    settings.provider === 'openai_compatible'
                      ? 'border-[#0284C7] bg-[#F0F9FF] ring-2 ring-[#0284C7]/20'
                      : 'border-[#CBD5E1] bg-white hover:border-[#94A3B8]'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xs font-bold text-[#0F172A]">
                      OpenAI-Compatible (ارائه‌دهنده سفارشی)
                    </span>
                    <span
                      dir="ltr"
                      className="rounded bg-[#0284C7]/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#0369A1]"
                    >
                      /v1/chat/completions
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-5 text-[#475569]">
                    سازگار با OpenAI، OpenRouter، Groq، DeepSeek، Ollama، LM Studio و هر سرور سفارشی
                  </p>
                </button>
              </div>
            </div>

            {/* Section 2: Provider-Specific Configuration */}
            {settings.provider === 'gemini' ? (
              <div className="space-y-4 rounded-xl border border-[#E2E8F0] bg-white p-4">
                <div className="text-sm font-bold text-[#0F172A]">
                  ۲. تنظیمات مدل Google Gemini و عمق استدلال
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#334155]">
                    انتخاب مدل Gemini:
                  </label>
                  <div className="space-y-2">
                    {GEMINI_AVAILABLE_MODELS.map((gm) => (
                      <button
                        key={gm.id}
                        type="button"
                        onClick={() =>
                          setSettings((prev) => ({ ...prev, model: gm.id }))
                        }
                        className={`flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-right text-xs transition ${
                          settings.model === gm.id
                            ? 'border-[#0284C7] bg-[#F0F9FF] font-bold text-[#0369A1]'
                            : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#334155] hover:border-[#CBD5E1]'
                        }`}
                      >
                        <span>{gm.label}</span>
                        <span
                          dir="ltr"
                          className="rounded bg-white px-2 py-0.5 font-mono text-[11px] text-[#0284C7] border border-[#CBD5E1]"
                        >
                          {gm.id}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#334155]">
                    سطح تفکر و استدلال ریاضی (Thinking Level):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: 'LOW', label: 'سریع (Low)' },
                        { id: 'MEDIUM', label: 'متعادل (Medium)' },
                        { id: 'HIGH', label: 'عمیق (High)' },
                      ] as const
                    ).map((lvl) => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() =>
                          setSettings((prev) => ({
                            ...prev,
                            thinkingLevel: lvl.id,
                          }))
                        }
                        className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${
                          settings.thinkingLevel === lvl.id
                            ? 'border-[#0284C7] bg-[#0284C7] text-white'
                            : 'border-[#CBD5E1] bg-[#F8FAFC] text-[#475569] hover:text-[#0F172A]'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 rounded-xl border border-[#E2E8F0] bg-white p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#0F172A]">
                    ۲. پیکربندی ارائه‌دهنده سازگار با استاندارد OpenAI (Custom Provider)
                  </span>
                  <Server className="h-4 w-4 text-[#0284C7]" />
                </div>

                {/* Preset Buttons */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#334155]">
                    پیش‌تنظیم‌های آماده (Provider Presets):
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {OPENAI_COMPATIBLE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handlePresetChange(preset.id)}
                        className={`rounded-lg border px-2.5 py-2 text-right text-xs font-bold transition ${
                          settings.presetId === preset.id
                            ? 'border-[#0284C7] bg-[#F0F9FF] text-[#0369A1]'
                            : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:border-[#CBD5E1]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[11px] text-[#64748B]">
                    {activePreset.description}
                  </p>
                </div>

                {/* Custom Base URL Input */}
                <div>
                  <label
                    htmlFor="custom-base-url-input"
                    className="mb-1 block text-xs font-bold text-[#334155]"
                  >
                    آدرس پایه سرور (Custom Provider Base URL):
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
                    className="w-full rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2 font-mono text-xs text-[#0F172A] focus:border-[#0284C7] focus:bg-white focus:outline-hidden"
                  />
                  <div className="mt-1 flex items-center justify-between text-[11px] text-[#64748B]">
                    <span>مسیر نهایی فراخوانی سرور:</span>
                    <code
                      dir="ltr"
                      className="rounded bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-[10px] text-[#0369A1]"
                    >
                      {resolvedOpenAIEndpoint}
                    </code>
                  </div>
                </div>

                {/* Custom Model Name Input & Quick Chips */}
                <div>
                  <label
                    htmlFor="custom-model-input"
                    className="mb-1 block text-xs font-bold text-[#334155]"
                  >
                    نام یا شناسه مدل (Model Name / ID):
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
                    className="w-full rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-3 py-2 font-mono text-xs text-[#0F172A] focus:border-[#0284C7] focus:bg-white focus:outline-hidden"
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-[#64748B]">
                      مدل‌های پیشنهادی این ارائه‌دهنده:
                    </span>
                    {activePreset.suggestedModels.map((sm) => (
                      <button
                        key={sm}
                        type="button"
                        dir="ltr"
                        onClick={() =>
                          setSettings((prev) => ({ ...prev, model: sm }))
                        }
                        className={`rounded border px-2 py-0.5 font-mono text-[10px] transition ${
                          settings.model === sm
                            ? 'border-[#0284C7] bg-[#0284C7] text-white'
                            : 'border-[#CBD5E1] bg-white text-[#334155] hover:border-[#0284C7]'
                        }`}
                      >
                        {sm}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Server Environment Status Info */}
                <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs leading-6 text-[#475569]">
                  <div className="flex items-center gap-1.5 font-bold text-[#0F172A]">
                    {serverStatus.openAICompatibleKeyConfigured ? (
                      <CheckCircle2 className="h-4 w-4 text-[#059669]" />
                    ) : (
                      <Server className="h-4 w-4 text-[#0284C7]" />
                    )}
                    <span>وضعیت احراز هویت سمت سرور:</span>
                  </div>
                  <p className="mt-1 text-[11px]">
                    درخواست‌های OpenAI-Compatible از طریق مسیر امن سرور{' '}
                    <code dir="ltr" className="font-mono text-[#0369A1]">
                      /api/ai/chat
                    </code>{' '}
                    ارسال می‌شوند. برای سرویس‌های ابری، متغیر محیطی{' '}
                    <code dir="ltr" className="font-mono text-[#0F172A]">
                      OPENAI_COMPATIBLE_API_KEY
                    </code>{' '}
                    در بخش Secrets سرور خوانده می‌شود (سرویس‌های محلی مانند Ollama نیاز به کلید ندارند).
                  </p>
                </div>
              </div>
            )}

            {/* Section 3: Pedagogical & Derivation Detail Settings */}
            <div className="space-y-4 rounded-xl border border-[#E2E8F0] bg-white p-4">
              <div className="text-sm font-bold text-[#0F172A]">
                ۳. تنظیمات آموزشی و نحوه بسط راه‌حل‌های ریاضی (AI Settings)
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#334155]">
                  سطح جزئیات راه‌حل‌ها (Solution Detail Level):
                </label>
                <div className="space-y-2">
                  {(
                    [
                      {
                        id: 'full_step_by_step',
                        title:
                          'بسط کامل گام‌به‌گام بدون حذف محاسبات پایه (پیشنهادی)',
                        desc: 'نمایش کامل اجزای انتگرال جزء‌به‌جزء (u, dv)، جایگذاری صریح حدود بالا و پایین و ساده‌سازی‌های مثلثاتی',
                      },
                      {
                        id: 'exam_prep',
                        title: 'رویکرد امتحانی و نکات تست/تشریحی مهندسی',
                        desc: 'تمرکز بر تشخیص سریع تقارن زوج و فرد، اتحاد پارسوال و شرایط مرزی',
                      },
                      {
                        id: 'conceptual',
                        title: 'توضیح مفهومی، فیزیکی و شهودی',
                        desc: 'توضیح معنای فیزیکی هماهنگ‌ها، طیف فرکانسی و پخش گرما در میله همراه با فرمول نهایی',
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
                      className={`flex w-full flex-col items-start rounded-lg border p-3 text-right transition ${
                        settings.detailLevel === mode.id
                          ? 'border-[#0284C7] bg-[#F0F9FF]'
                          : 'border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#CBD5E1]'
                      }`}
                    >
                      <span className="text-xs font-bold text-[#0F172A]">
                        {mode.title}
                      </span>
                      <span className="mt-0.5 text-[11px] text-[#475569]">
                        {mode.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Context Toggle */}
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">
                    ارسال خودکار مبحث فعلی درس به دستیار هوشمند
                  </div>
                  <div className="text-[11px] text-[#475569]">
                    فصل و زیرمجموعه فعال صفحه را به عنوان زمینه علمی به دستیار ارسال می‌کند
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
                  className="h-4 w-4 accent-[#0284C7]"
                />
              </label>

              {/* Custom System Prompt */}
              <div>
                <label
                  htmlFor="custom-system-prompt"
                  className="mb-1 block text-xs font-bold text-[#334155]"
                >
                  دستورالعمل سفارشی سیستم (Custom System Instructions):
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
                  placeholder="مثال: در انتهای هر پاسخ یک تمرین مشابه با جواب نهایی نیز پیشنهاد بده..."
                  className="w-full rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] p-3 text-xs leading-6 text-[#0F172A] focus:border-[#0284C7] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('chat')}
                  className="flex items-center gap-1.5 rounded-xl bg-[#0284C7] px-5 py-2.5 text-xs font-bold text-white shadow-2xs transition hover:bg-[#0369A1]"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>ذخیره و بازگشت به گفتگوی علمی</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
