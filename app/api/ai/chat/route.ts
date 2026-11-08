import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  AIProviderType,
  buildMathTutorSystemInstruction,
  buildOpenAIChatCompletionsUrl,
  ReasoningLevel,
  SolutionDetailLevel,
} from '@/lib/ai-settings';

interface IncomingChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  provider?: AIProviderType;
  customBaseUrl?: string;
  model?: string;
  /** API key supplied from the settings UI; env keys are only a fallback */
  apiKey?: string;
  detailLevel?: SolutionDetailLevel;
  thinkingLevel?: ReasoningLevel;
  includeModuleContext?: boolean;
  customSystemPrompt?: string;
  /** When true the reply streams back as Server-Sent Events instead of one JSON payload */
  stream?: boolean;
  moduleContext?: {
    moduleTitle?: string;
    moduleSubtitle?: string;
    subtopicTitle?: string;
  };
  messages: IncomingChatMessage[];
}

export async function GET() {
  const hasGeminiKey = Boolean(
    process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
  );
  const hasOpenAICompatibleKey = Boolean(
    process.env.OPENAI_COMPATIBLE_API_KEY &&
      process.env.OPENAI_COMPATIBLE_API_KEY !== 'MY_OPENAI_COMPATIBLE_API_KEY'
  );
  const defaultOpenAIBaseUrl =
    process.env.OPENAI_COMPATIBLE_BASE_URL || 'https://api.openai.com/v1';

  return NextResponse.json({
    ok: true,
    geminiReady: hasGeminiKey,
    openAICompatibleKeyConfigured: hasOpenAICompatibleKey,
    defaultOpenAIBaseUrl,
  });
}

/**
 * Wraps an async producer into a Server-Sent Events response.
 * The producer receives a `send` callback for JSON events and must not
 * throw past `finally` — errors are reported as `{type:'error'}` events so
 * the client can render them inline in the chat.
 */
function sseResponse(
  produce: (send: (event: Record<string, unknown>) => void) => Promise<void>
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      };
      try {
        await produce(send);
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : 'خطای ناشناخته در جریان پاسخ هوش مصنوعی';
        send({ type: 'error', error: message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    // Default path is the OpenAI-compatible custom provider; Gemini is opt-in.
    const provider: AIProviderType = body.provider || 'openai_compatible';
    const messages = Array.isArray(body.messages) ? body.messages : [];

    if (messages.length === 0) {
      return NextResponse.json(
        { error: 'پیامی برای ارسال به دستیار هوشمند یافت نشد.' },
        { status: 400 }
      );
    }

    const systemInstruction = buildMathTutorSystemInstruction(
      {
        detailLevel: body.detailLevel || 'full_step_by_step',
        customSystemPrompt: body.customSystemPrompt || '',
        includeModuleContext: body.includeModuleContext ?? true,
      },
      body.moduleContext
    );

    /* ────────────────────────── OpenAI-Compatible provider ────────────────────────── */
    if (provider === 'openai_compatible') {
      const targetBaseUrl =
        body.customBaseUrl?.trim() ||
        process.env.OPENAI_COMPATIBLE_BASE_URL ||
        'https://api.openai.com/v1';
      const endpointUrl = buildOpenAIChatCompletionsUrl(targetBaseUrl);
      const selectedModel = body.model?.trim() || 'gpt-4o-mini';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Key precedence: the key entered in the settings UI wins; Google's
      // OpenAI-compatible endpoint falls back to GEMINI_API_KEY, every
      // other host to OPENAI_COMPATIBLE_API_KEY.
      const isGeminiEndpoint = targetBaseUrl.includes(
        'generativelanguage.googleapis.com'
      );
      const userKey = body.apiKey?.trim();
      let serverOpenAIKey = userKey || undefined;
      if (!serverOpenAIKey) {
        if (isGeminiEndpoint) {
          const geminiKey = process.env.GEMINI_API_KEY;
          serverOpenAIKey =
            geminiKey && geminiKey !== 'MY_GEMINI_API_KEY'
              ? geminiKey
              : undefined;
        } else {
          const envKey = process.env.OPENAI_COMPATIBLE_API_KEY;
          serverOpenAIKey =
            envKey && envKey !== 'MY_OPENAI_COMPATIBLE_API_KEY'
              ? envKey
              : undefined;
        }
      }
      if (serverOpenAIKey) {
        headers['Authorization'] = `Bearer ${serverOpenAIKey}`;
      }

      const openAIPayload: Record<string, unknown> = {
        model: selectedModel,
        messages: [
          { role: 'system', content: systemInstruction },
          ...messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ],
      };

      /* ── Streaming path: relay upstream SSE deltas to the client ── */
      if (body.stream) {
        return sseResponse(async (send) => {
          send({
            type: 'meta',
            providerUsed: 'openai_compatible',
            modelUsed: selectedModel,
          });

          const upstreamRes = await fetch(endpointUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({ ...openAIPayload, stream: true }),
          });

          if (!upstreamRes.ok || !upstreamRes.body) {
            const errText = await upstreamRes.text().catch(() => '');
            send({
              type: 'error',
              error: `خطا در ارتباط با ارائه‌دهنده سازگار با OpenAI (${endpointUrl}) — کد وضعیت ${upstreamRes.status}. جزئیات: ${errText.slice(0, 240)}`,
            });
            return;
          }

          const reader = upstreamRes.body.getReader();
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
              if (!payload || payload === '[DONE]') continue;

              try {
                const parsed = JSON.parse(payload);
                const delta =
                  parsed?.choices?.[0]?.delta?.content ??
                  parsed?.choices?.[0]?.message?.content ??
                  '';
                if (typeof delta === 'string' && delta) {
                  send({ type: 'delta', text: delta });
                }
              } catch {
                // Ignore malformed keep-alive or partial frames
              }
            }
          }

          send({ type: 'done' });
        });
      }

      /* ── Non-streaming path (kept for backward compatibility) ── */
      const upstreamRes = await fetch(endpointUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(openAIPayload),
      });

      if (!upstreamRes.ok) {
        const errText = await upstreamRes.text().catch(() => '');
        return NextResponse.json(
          {
            error: `خطا در ارتباط با ارائه‌دهنده سازگار با OpenAI (${endpointUrl}) — کد وضعیت ${upstreamRes.status}. در صورت استفاده از سرویس‌های ابری مطمئن شوید متغیر محیطی OPENAI_COMPATIBLE_API_KEY در بخش Secrets تنظیم شده است یا به حالت Google Gemini (پیش‌فرض سرور) سوئیچ کنید. جزئیات: ${errText.slice(0, 240)}`,
          },
          { status: upstreamRes.status }
        );
      }

      const data = await upstreamRes.json();
      const replyText =
        data?.choices?.[0]?.message?.content ||
        data?.choices?.[0]?.text ||
        data?.message?.content ||
        '';

      if (!replyText) {
        return NextResponse.json(
          {
            error:
              'پاسخ معتبری در قالب استاندارد OpenAI (choices[0].message.content) از سرور سفارشی دریافت نشد.',
          },
          { status: 502 }
        );
      }

      return NextResponse.json({
        text: replyText,
        providerUsed: 'openai_compatible',
        modelUsed: selectedModel,
        endpointUsed: endpointUrl,
      });
    }

    /* ────────────────────────── Default: Google Gemini ────────────────────────── */
    const apiKey = body.apiKey?.trim() || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'کلید GEMINI_API_KEY در سرور یافت نشد. لطفاً در بخش Settings > Secrets کلید را بررسی کنید.',
        },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const allowedGeminiModels = [
      'gemini-3.8-flash',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
    ];
    const requestedModel = body.model?.trim() || 'gemini-3.8-flash';
    const modelName = allowedGeminiModels.includes(requestedModel)
      ? requestedModel
      : 'gemini-3.8-flash';

    // Format conversation history into structured contents for multi-turn context
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const thinkingLevelMap: Record<ReasoningLevel, ThinkingLevel> = {
      LOW: ThinkingLevel.LOW,
      MEDIUM: ThinkingLevel.MEDIUM,
      HIGH: ThinkingLevel.HIGH,
    };

    const config: {
      systemInstruction: string;
      thinkingConfig?: { thinkingLevel: ThinkingLevel };
    } = {
      systemInstruction,
    };

    if (modelName === 'gemini-3.8-flash' && body.thinkingLevel) {
      config.thinkingConfig = {
        thinkingLevel:
          thinkingLevelMap[body.thinkingLevel] || ThinkingLevel.MEDIUM,
      };
    }

    /* ── Streaming path: forward generateContentStream chunks ── */
    if (body.stream) {
      return sseResponse(async (send) => {
        send({
          type: 'meta',
          providerUsed: 'gemini',
          modelUsed: modelName,
        });

        const response = await ai.models.generateContentStream({
          model: modelName,
          contents,
          config,
        });

        for await (const chunk of response) {
          const chunkText =
            typeof chunk?.text === 'string' ? chunk.text : (chunk?.text ?? '');
          if (chunkText) {
            send({ type: 'delta', text: chunkText });
          }
        }

        send({ type: 'done' });
      });
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config,
    });

    const text = response.text ?? '';
    return NextResponse.json({
      text,
      providerUsed: 'gemini',
      modelUsed: modelName,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'خطای ناشناخته در سرور هوش مصنوعی';
    return NextResponse.json(
      {
        error: `خطا در پردازش درخواست هوش مصنوعی: ${message}`,
      },
      { status: 500 }
    );
  }
}
