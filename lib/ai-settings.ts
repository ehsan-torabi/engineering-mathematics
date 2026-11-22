/**
 * Pure Logic & Configuration for the AI Engineering Math Assistant
 * Supports:
 * 1. OpenAI-Compatible providers as the default path (OpenAI, OpenRouter, Ollama, LM Studio, Groq, DeepSeek, vLLM, or any custom /v1/chat/completions endpoint)
 * 2. Google Gemini as an optional server-side provider (via @google/genai SDK)
 */

export type AIProviderType = 'gemini' | 'openai_compatible';

export type OpenAICompatiblePresetId =
  | 'openai'
  | 'gemini'
  | 'openrouter'
  | 'groq'
  | 'deepseek'
  | 'ollama'
  | 'lmstudio'
  | 'custom';

export type SolutionDetailLevel = 'full_step_by_step' | 'conceptual' | 'exam_prep';

export type ReasoningLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface OpenAICompatiblePreset {
  id: OpenAICompatiblePresetId;
  label: string;
  description: string;
  baseUrl: string;
  defaultModel: string;
  suggestedModels: string[];
}

export interface AISettings {
  provider: AIProviderType;
  presetId: OpenAICompatiblePresetId;
  customBaseUrl: string;
  model: string;
  /** User-supplied API key, entered in the settings UI and stored only in this browser */
  apiKey: string;
  detailLevel: SolutionDetailLevel;
  thinkingLevel: ReasoningLevel;
  includeModuleContext: boolean;
  customSystemPrompt: string;
}

export interface ChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  providerUsed?: string;
  modelUsed?: string;
  /** Set when generation was stopped by the user and the partial answer was kept */
  stopped?: boolean;
}

export const GEMINI_AVAILABLE_MODELS: { id: string; label: string; badge: string }[] = [
  {
    id: 'gemini-3.8-flash',
    label: 'Gemini 3.8 Flash (سریع و دقیق برای ریاضیات مهندسی)',
    badge: 'اختیاری',
  },
  {
    id: 'gemini-3.1-flash-lite',
    label: 'Gemini 3.1 Flash Lite (فوق‌سریع برای پرسش‌های کوتاه)',
    badge: 'سبک',
  },
  {
    id: 'gemini-flash-latest',
    label: 'Gemini Flash Latest (نسخه پایدار عمومی)',
    badge: 'پایدار',
  },
];

export const OPENAI_COMPATIBLE_PRESETS: OpenAICompatiblePreset[] = [
  {
    id: 'openai',
    label: 'OpenAI Official API',
    description: 'سرویس استاندارد OpenAI سازگار با مسیر /v1/chat/completions',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    suggestedModels: ['gpt-4o-mini', 'gpt-4o', 'o3-mini'],
  },
  {
    id: 'gemini',
    label: 'Google Gemini',
    description:
      'نقطه پایانی رسمی سازگار با OpenAI در Google AI؛ کلید GEMINI_API_KEY سرور استفاده می‌شود',
    baseUrl:
      'https://generativelanguage.googleapis.com/v1beta/openai',
    defaultModel: 'gemini-3.8-flash',
    suggestedModels: [
      'gemini-3.8-flash',
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
    ],
  },
  {
    id: 'openrouter',
    label: 'OpenRouter (چندمدلی)',
    description: 'دسترسی یکپارچه به مدل‌های ریاضی و مهندسی با استاندارد OpenAI',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'qwen/qwen-2.5-math-72b-instruct',
    suggestedModels: [
      'qwen/qwen-2.5-math-72b-instruct',
      'deepseek/deepseek-r1',
      'meta-llama/llama-3.3-70b-instruct',
    ],
  },
  {
    id: 'groq',
    label: 'Groq Cloud (استنتاج فوق‌سریع)',
    description: 'سازگار با پروتکل OpenAI برای اجرای سریع مدل‌های متن‌باز',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    suggestedModels: ['llama-3.3-70b-versatile', 'deepseek-r1-distill-llama-70b'],
  },
  {
    id: 'deepseek',
    label: 'DeepSeek API',
    description: 'مدل‌های استدلال ریاضی DeepSeek با سازگاری کامل OpenAI',
    baseUrl: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    suggestedModels: ['deepseek-chat', 'deepseek-reasoner'],
  },
  {
    id: 'ollama',
    label: 'Ollama (سرور محلی / Local)',
    description: 'اجرای محلی مدل‌ها روی پورت ۱۱۴۳۴ با سازگاری کامل OpenAI',
    baseUrl: 'http://localhost:11434/v1',
    defaultModel: 'qwen2.5-math:7b',
    suggestedModels: ['qwen2.5-math:7b', 'llama3.2:latest', 'deepseek-r1:8b'],
  },
  {
    id: 'lmstudio',
    label: 'LM Studio / vLLM (سرور محلی)',
    description: 'سرور محلی استاندارد OpenAI روی پورت ۱۲۳۴ یا ۸۰۰۰',
    baseUrl: 'http://localhost:1234/v1',
    defaultModel: 'local-model',
    suggestedModels: ['local-model'],
  },
  {
    id: 'custom',
    label: 'ارائه‌دهنده سفارشی (Custom OpenAI-Compatible Endpoint)',
    description: 'هر سرور یا پراکسی اختصاصی سازگار با استاندارد OpenAI Chat Completions',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    suggestedModels: ['gpt-4o-mini', 'custom-math-model'],
  },
];

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: 'openai_compatible',
  presetId: 'custom',
  customBaseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  apiKey: '',
  detailLevel: 'full_step_by_step',
  thinkingLevel: 'MEDIUM',
  includeModuleContext: true,
  customSystemPrompt: '',
};

/**
 * Normalizes any OpenAI-compatible base URL into a clean root URL without trailing slashes.
 */
export function normalizeOpenAIBaseUrl(rawUrl: string): string {
  const trimmed = (rawUrl || '').trim().replace(/\/+$/, '');
  if (!trimmed) {
    return 'https://api.openai.com/v1';
  }
  return trimmed;
}

/**
 * Constructs the full OpenAI-compatible `/chat/completions` endpoint URL from a base URL.
 * Handles inputs like:
 * - `https://api.openai.com` -> `https://api.openai.com/v1/chat/completions`
 * - `https://api.openai.com/v1` -> `https://api.openai.com/v1/chat/completions`
 * - `https://custom.host/v1/chat/completions` -> `https://custom.host/v1/chat/completions`
 */
export function buildOpenAIChatCompletionsUrl(rawBaseUrl: string): string {
  const base = normalizeOpenAIBaseUrl(rawBaseUrl);
  if (base.endsWith('/chat/completions')) {
    return base;
  }
  if (/\/v\d+$/.test(base) || base.includes('/v1') || base.includes('/api/')) {
    return `${base}/chat/completions`;
  }
  return `${base}/v1/chat/completions`;
}

/**
 * Builds the comprehensive Engineering Mathematics system instruction in Persian,
 * enforcing unskipped step-by-step derivations and strict LaTeX ($...$ and $$...$$) delimiters.
 * When the server resolves the active lesson, `knowledgeContext` carries the
 * official درس‌نامه block (from lib/ai-context) that grounds the reply in the
 * exact notation and formulas the student is studying.
 */
export function buildMathTutorSystemInstruction(
  settings: Pick<AISettings, 'detailLevel' | 'customSystemPrompt' | 'includeModuleContext'>,
  moduleContext?: {
    moduleId?: string;
    moduleTitle?: string;
    moduleSubtitle?: string;
    subtopicId?: string;
    subtopicTitle?: string;
    knowledgeContext?: string;
  }
): string {
  const detailInstruction =
    settings.detailLevel === 'full_step_by_step'
      ? 'تمام راه‌حل‌ها را به صورت کاملاً تشریحی، گام‌به‌گام و بدون پرش از روی هیچ محاسبه پایه‌ای بنویس. در انتگرال‌های جزء‌به‌جزء حتماً اجزای $u$، $dv$، $du$ و $v$ را معرفی کن، حدود بالا و پایین انتگرال $[F(x)]_a^b = F(b) - F(a)$ را صریحاً جایگذاری کن و ساده‌سازی‌های مثلثاتی مانند $\\sin(n\\pi)=0$ و $\\cos(n\\pi)=(-1)^n$ را نشان بده.'
      : settings.detailLevel === 'exam_prep'
      ? 'پاسخ را با تمرکز بر نکات کلیدی امتحانی، دام‌های متداول دانشجویان مهندسی، شرایط همگرایی دیریکله، تقارن زوج و فرد برای صفر شدن سریع ضرایب و فرمول نهایی ارائه بده.'
      : 'ابتدا شهود فیزیکی و هندسی مفهوم را به زبان ساده برای دانشجوی کارشناسی مهندسی شرح بده و سپس مراحل اصلی فرمول‌بندی ریاضی را بنویس.';

  const groundingInstruction =
    'اگر بخش «محتوای رسمی درس‌نامه» در زمینه ارسال شده است، پاسخ‌ها را دقیقاً با همان نمادگذاری، فرمول‌ها و قراردادهای آن درس‌نامه هماهنگ کن و از نمادگذاری متناقض استفاده نکن.';

  const contextParts: string[] = [];
  if (settings.includeModuleContext && moduleContext?.moduleTitle) {
    contextParts.push(
      `\nمبحث فعلی دانشجو در اپلیکیشن:\n- فصل: ${moduleContext.moduleTitle}\n- زیرمجموعه: ${moduleContext.moduleSubtitle || ''}\n- بخش فعال: ${moduleContext.subtopicTitle || ''}`
    );
  }
  const knowledge = moduleContext?.knowledgeContext?.trim();
  if (settings.includeModuleContext && knowledge) {
    contextParts.push(
      `\nمحتوای رسمی درس‌نامه برای مبحث فعال دانشجو (مبنای پاسخ‌دهی):\n${knowledge}`
    );
  }
  const contextSection = contextParts.join('\n');

  const customSection = settings.customSystemPrompt?.trim()
    ? `\nدستورالعمل اختصاصی کاربر:\n${settings.customSystemPrompt.trim()}`
    : '';

  return [
    'تو استاد راهنما و دستیار هوشمند درس «ریاضیات مهندسی» (مقطع کارشناسی مهندسی) بر اساس سرفصل‌های آنالیز فوریه، سری فوریه، انتگرال و تبدیل فوریه، مسئله مقدار مرزی اشتورم-لیوویل و معادلات دیفرانسیل با مشتقات جزئی (معادله گرما) هستی.',
    detailInstruction,
    groundingInstruction,
    'قانون بسیار مهم نگارش فرمول‌های ریاضی:',
    '۱. تمام عبارات، متغیرها، بازه‌ها (مانند $[-\\pi, \\pi]$) و فرمول‌های درون‌متنی در میان متن فارسی را حتماً داخل علامت دلار تکی `$...$` قرار بده تا جهت چپ‌به‌راست (LTR) آن‌ها در متن فارسی کاملاً حفظ شود.',
    '۲. فرمول‌های مهم، انتگرال‌های مرحله‌ای و معادلات اصلی هر گام را در یک خط مستقل داخل `$$...$$` بنویس.',
    contextSection,
    customSection,
  ]
    .filter(Boolean)
    .join('\n\n');
}

export interface ParsedMathBlock {
  type: 'display_math' | 'text_line';
  content: string;
}

/**
 * Splits a markdown/LaTeX response string into display-math blocks ($$...$$ or \[...\])
 * and text lines (which may contain inline $...$ or \(...\) math).
 */
export function parseMathMarkdownBlocks(rawText: string): ParsedMathBlock[] {
  if (!rawText) return [];

  // Normalize \[ ... \] to $$ ... $$ and \( ... \) to $ ... $
  const normalized = rawText
    .replace(/\\\[([\s\S]*?)\\\]/g, (_m, inner) => `\n$$${inner.trim()}$$\n`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_m, inner) => `$${inner.trim()}$`);

  const segments = normalized.split(/(\$\$[\s\S]*?\$\$)/g).filter(Boolean);
  const result: ParsedMathBlock[] = [];

  for (const seg of segments) {
    const trimmed = seg.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length >= 4) {
      const formula = trimmed.slice(2, -2).trim();
      if (formula) {
        result.push({ type: 'display_math', content: formula });
      }
    } else {
      const lines = trimmed.split('\n');
      for (const line of lines) {
        if (line.trim()) {
          result.push({ type: 'text_line', content: line.trim() });
        }
      }
    }
  }

  return result;
}
