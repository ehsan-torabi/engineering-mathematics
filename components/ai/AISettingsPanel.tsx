'use client';

import React, { useState } from 'react';
import {
  AISettings,
  DEFAULT_AI_SETTINGS,
  OPENAI_COMPATIBLE_PRESETS,
  OpenAICompatiblePresetId,
  buildOpenAIChatCompletionsUrl,
} from '@/lib/ai-settings';
import type { AiServerStatus } from '@/lib/ai-chat-client';
import {
  Cpu,
  Server,
  CheckCircle2,
  RotateCcw,
  Eye,
  EyeOff,
  KeyRound,
  Check,
} from 'lucide-react';

/**
 * Provider + pedagogical configuration, extracted from the assistant drawer
 * so both the drawer's settings tab and the full-page assistant (in a modal)
 * edit exactly the same persisted settings.
 */

interface AISettingsPanelProps {
  settings: AISettings;
  onChange: (updater: (prev: AISettings) => AISettings) => void;
  serverStatus: AiServerStatus;
  /** Renders the primary confirmation button; e.g. drawer switches tab back */
  onDone?: () => void;
  doneLabel?: string;
}

const DETAIL_LEVELS = [
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
] as const;

export default function AISettingsPanel({
  settings,
  onChange,
  serverStatus,
  onDone,
  doneLabel = 'ذخیره و بازگشت به گفتگو',
}: AISettingsPanelProps) {
  const [showApiKey, setShowApiKey] = useState(false);

  const activePreset =
    OPENAI_COMPATIBLE_PRESETS.find((p) => p.id === settings.presetId) ||
    OPENAI_COMPATIBLE_PRESETS[0];

  const handlePresetChange = (presetId: OpenAICompatiblePresetId) => {
    const found = OPENAI_COMPATIBLE_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    onChange((prev) => ({
      ...prev,
      provider: 'openai_compatible',
      presetId,
      customBaseUrl: found.baseUrl,
      model: found.defaultModel,
    }));
  };

  const resolvedOpenAIEndpoint = buildOpenAIChatCompletionsUrl(
    settings.customBaseUrl
  );

  return (
    <div className="space-y-5">
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
            onClick={() => onChange(() => DEFAULT_AI_SETTINGS)}
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
                onChange((prev) => ({
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
            فقط در حافظه همین مرورگر ذخیره می‌شود و همراه هر درخواست به مسیر
            سرور این برنامه فرستاده می‌شود. برای سرویس‌های محلی (Ollama / LM
            Studio) خالی بگذار.
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
              onChange((prev) => ({
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
              onChange((prev) => ({
                ...prev,
                model: e.target.value,
              }))
            }
            placeholder="gpt-4o-mini"
            className="w-full rounded-lg border border-line-strong bg-panel px-3 py-2 font-mono text-xs text-ink outline-none transition-colors focus:border-accent focus:bg-surface"
          />
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-ink-4">مدل‌های پیشنهادی:</span>
            {activePreset.suggestedModels.map((sm) => (
              <button
                key={sm}
                type="button"
                dir="ltr"
                onClick={() => onChange((prev) => ({ ...prev, model: sm }))}
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
            کلید API بالا فقط در مرورگر تو ذخیره می‌شود و با هر درخواست از مسیر
            امن{' '}
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
            {DETAIL_LEVELS.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() =>
                  onChange((prev) => ({
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
                <span className="text-xs font-bold text-ink">{mode.title}</span>
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
              فصل، زیرمبحث فعال و فرمول‌ها و نکات رسمی درس‌نامه به‌عنوان زمینه
              علمی ارسال می‌شود
            </div>
          </div>
          <input
            type="checkbox"
            checked={settings.includeModuleContext}
            onChange={(e) =>
              onChange((prev) => ({
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
              onChange((prev) => ({
                ...prev,
                customSystemPrompt: e.target.value,
              }))
            }
            placeholder="مثال: در انتهای هر پاسخ یک تمرین مشابه با جواب نهایی پیشنهاد بده…"
            className="w-full rounded-lg border border-line-strong bg-panel p-3 text-xs leading-6 text-ink outline-none transition-colors focus:border-accent focus:bg-surface"
          />
        </div>

        {onDone && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onDone}
              className="flex items-center gap-1.5 rounded-xl bg-accent-solid px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-accent-deep"
            >
              <Check className="h-4 w-4" />
              {doneLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
