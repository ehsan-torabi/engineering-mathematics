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
  detailLevel?: SolutionDetailLevel;
  thinkingLevel?: ReasoningLevel;
  includeModuleContext?: boolean;
  customSystemPrompt?: string;
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

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const provider: AIProviderType = body.provider || 'gemini';
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

      const serverOpenAIKey = process.env.OPENAI_COMPATIBLE_API_KEY;
      if (
        serverOpenAIKey &&
        serverOpenAIKey !== 'MY_OPENAI_COMPATIBLE_API_KEY'
      ) {
        headers['Authorization'] = `Bearer ${serverOpenAIKey}`;
      }

      const openAIPayload = {
        model: selectedModel,
        messages: [
          { role: 'system', content: systemInstruction },
          ...messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ],
      };

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

    // Default Provider: Server-side Google Gemini via @google/genai
    const apiKey = process.env.GEMINI_API_KEY;
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
