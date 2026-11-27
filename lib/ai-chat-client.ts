/**
 * Shared browser client for the AI tutor. Two transport paths:
 * 1. Cloud/custom providers → POST /api/ai/chat and relay its `meta`/`delta`
 *    SSE events (grounding is resolved server-side from curriculum data).
 * 2. Local model servers (Ollama, LM Studio, … on localhost/127.0.0.1) →
 *    fetched DIRECTLY from the browser, because the deployed server proxy
 *    cannot reach the user's own machine ("localhost" there is the server,
 *    not the visitor). Grounding is built client-side here.
 * Used by both the assistant drawer and the full-page assistant so the
 * two surfaces cannot drift apart.
 */

import {
  buildMathTutorSystemInstruction,
  buildOpenAIChatCompletionsUrl,
  isLoopbackBaseUrl,
} from './ai-settings.ts';
import { buildKnowledgeContext } from './ai-context.ts';
import type {
  AISettings,
  ChatMessageItem,
} from './ai-settings.ts';
import type { SessionModuleContext } from './ai-sessions.ts';

export interface AiServerStatus {
  checked: boolean;
  geminiReady: boolean;
  openAICompatibleKeyConfigured: boolean;
  defaultOpenAIBaseUrl: string;
}

export const INITIAL_AI_SERVER_STATUS: AiServerStatus = {
  checked: false,
  geminiReady: true,
  openAICompatibleKeyConfigured: false,
  defaultOpenAIBaseUrl: 'https://api.openai.com/v1',
};

/** Health check for the assistant API route; null when unreachable */
export async function fetchAiServerStatus(): Promise<AiServerStatus | null> {
  try {
    const res = await fetch('/api/ai/chat');
    const data = await res.json();
    if (!data?.ok) return null;
    return {
      checked: true,
      geminiReady: Boolean(data.geminiReady),
      openAICompatibleKeyConfigured: Boolean(data.openAICompatibleKeyConfigured),
      defaultOpenAIBaseUrl: data.defaultOpenAIBaseUrl || 'https://api.openai.com/v1',
    };
  } catch {
    return null;
  }
}

export interface StreamAssistantOptions {
  settings: AISettings;
  moduleContext: SessionModuleContext | null;
  history: ChatMessageItem[];
  signal?: AbortSignal;
  /** Fires once with the model id reported by the server */
  onMeta?: (modelUsed: string) => void;
  /** Fires on every delta with the accumulated text so far */
  onDelta?: (fullText: string) => void;
}

export interface StreamAssistantResult {
  /** Final accumulated reply text (possibly a partial reply when stopped) */
  text: string;
  modelUsed: string | null;
  /** True when the user aborted mid-stream */
  stopped: boolean;
}

/** Persian guidance when the browser cannot reach the local model server */
function localConnectionErrorMessage(endpointUrl: string): string {
  const onHttps =
    typeof window !== 'undefined' && window.location.protocol === 'https:';
  return [
    `اتصال مستقیم مرورگر به سرور محلی (${endpointUrl}) برقرار نشد.`,
    'بررسی کنید: (۱) Ollama یا LM Studio روی همین دستگاه روشن باشد؛',
    "(۲) برای Ollama متغیر محیطی OLLAMA_ORIGINS مبدأ این سایت را مجاز کند (مثال: OLLAMA_ORIGINS='*' و سپس راه‌اندازی دوباره سرویس) و در LM Studio گزینه CORS فعال باشد؛",
    ...(onHttps
      ? [
          '(۳) در صفحه‌ی HTTPS فقط localhost/127.0.0.1 از مرورگر قابل تماس است؛ آدرس‌های شبکه داخلی مانند 192.168.x.x باید با تونل عمومی (مانند cloudflared) در اختیار قرار بگیرند.',
        ]
      : []),
  ].join(' ');
}

/**
 * Direct transport for local model servers: the browser talks straight to
 * the OpenAI-compatible endpoint on the user's machine and parses its SSE
 * deltas. Grounding (درس‌نامه) is built client-side — curriculum data is
 * already part of the client bundle, so this costs nothing extra.
 */
async function streamDirectFromLocalModel(
  options: StreamAssistantOptions,
  endpointUrl: string
): Promise<StreamAssistantResult> {
  const { settings, moduleContext, history, signal, onMeta, onDelta } = options;

  const systemInstruction = buildMathTutorSystemInstruction(
    {
      detailLevel: settings.detailLevel,
      customSystemPrompt: settings.customSystemPrompt,
      includeModuleContext: settings.includeModuleContext,
    },
    moduleContext
      ? {
          ...moduleContext,
          knowledgeContext: buildKnowledgeContext(
            moduleContext.moduleId,
            moduleContext.subtopicId
          ),
        }
      : undefined
  );

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  // Local servers usually need no key; keep it working for LM Studio/vLLM setups that do.
  const userKey = settings.apiKey.trim();
  if (userKey) headers['Authorization'] = `Bearer ${userKey}`;

  let response: Response;
  try {
    response = await fetch(endpointUrl, {
      method: 'POST',
      headers,
      signal,
      body: JSON.stringify({
        model: settings.model,
        stream: true,
        messages: [
          { role: 'system', content: systemInstruction },
          ...history.map((m) => ({ role: m.role, content: m.content })),
        ],
      }),
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { text: '', modelUsed: settings.model, stopped: true };
    }
    // fetch() throws a bare TypeError on network/CORS failures — surface
    // the actual checklist (server running, OLLAMA_ORIGINS/CORS, HTTPS rules).
    throw new Error(localConnectionErrorMessage(endpointUrl));
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(
      `سرور محلی (${endpointUrl}) کد وضعیت ${response.status} برگرداند. جزئیات: ${errText.slice(0, 240)}`
    );
  }
  if (!response.body) {
    throw new Error('جریان پاسخ از سرور محلی در دسترس نیست.');
  }

  onMeta?.(settings.model);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let accumulated = '';

  try {
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
        if (!payload || payload === '[DONE]') continue;

        try {
          const parsed = JSON.parse(payload);
          const delta =
            parsed?.choices?.[0]?.delta?.content ??
            parsed?.choices?.[0]?.message?.content ??
            '';
          if (typeof delta === 'string' && delta) {
            accumulated += delta;
            onDelta?.(accumulated);
          }
        } catch {
          // Ignore malformed keep-alive or partial frames
        }
      }
    }
    return { text: accumulated.trim(), modelUsed: settings.model, stopped: false };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      // User pressed stop — keep whatever arrived
      return { text: accumulated.trim(), modelUsed: settings.model, stopped: true };
    }
    throw err;
  }
}

export async function streamAssistantReply(
  options: StreamAssistantOptions
): Promise<StreamAssistantResult> {
  // Local model servers live on the visitor's own machine: the deployed
  // /api/ai/chat proxy cannot reach them ("localhost" there is the server).
  // These requests are handled directly by the browser instead.
  if (isLoopbackBaseUrl(options.settings.customBaseUrl)) {
    return streamDirectFromLocalModel(
      options,
      buildOpenAIChatCompletionsUrl(options.settings.customBaseUrl)
    );
  }

  const { settings, moduleContext, history, signal, onMeta, onDelta } = options;

  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
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
      messages: history.map((m) => ({ role: m.role, content: m.content })),
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
  let accumulated = '';
  let modelUsed: string | null = null;

  const readLoop = async () => {
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
            const metaModel: string = event.modelUsed || settings.model;
            modelUsed = metaModel;
            onMeta?.(metaModel);
          } else if (event.type === 'delta' && typeof event.text === 'string') {
            accumulated += event.text;
            onDelta?.(accumulated);
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
  };

  try {
    await readLoop();
    return { text: accumulated.trim(), modelUsed, stopped: false };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      // User pressed stop — keep whatever arrived
      return { text: accumulated.trim(), modelUsed, stopped: true };
    }
    throw err;
  }
}
