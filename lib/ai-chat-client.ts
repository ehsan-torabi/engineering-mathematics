/**
 * Shared browser client for the /api/ai/chat SSE endpoint. Builds the
 * request body from the persisted settings, relays `meta`/`delta` events
 * while the reply streams and supports abort via AbortSignal.
 * Used by both the assistant drawer and the full-page assistant so the
 * two surfaces cannot drift apart.
 */

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

export async function streamAssistantReply(
  options: StreamAssistantOptions
): Promise<StreamAssistantResult> {
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
