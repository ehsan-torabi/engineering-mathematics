/**
 * Single source of truth for canonical URLs and search metadata.
 * Deployment sets NEXT_PUBLIC_SITE_URL (or APP_URL on AI Studio); no domain
 * is hardcoded here so moving the site never leaves stale canonicals behind.
 */

import {faNum, stripLessonNumber} from './persian-digits';

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.APP_URL ||
  'http://localhost:3000';

export const SITE_URL = rawSiteUrl.replace(/\/+$/, '');

export const SITE_NAME = 'آزمایشگاه تعاملی ریاضیات مهندسی';

export const SITE_DESCRIPTION =
  'آموزش تعاملی ریاضیات مهندسی دوره کارشناسی: آنالیز فوریه، سری و انتگرال فوریه، تبدیل فوریه، مسئله اشتورم-لیوویل و معادله گرما، همراه با درس‌نامه فارسی، مثال‌های حل‌شده گام‌به‌گام، آزمون و بانک امتحانات دانشگاهی با پاسخ کامل.';

/**
 * Unicode stand-ins for the LaTeX commands that appear in lesson titles, so
 * plain-text surfaces (meta titles, descriptions, llms.txt, JSON-LD) keep the
 * math readable instead of dropping it or leaking raw `\frac` markup.
 */
const MATH_UNICODE: Record<string, string> = {
  ell: 'ℓ', pi: 'π', infty: '∞', alpha: 'α', beta: 'β', gamma: 'γ',
  lambda: 'λ', Delta: 'Δ', delta: 'δ', omega: 'ω', Omega: 'Ω', theta: 'θ',
  mu: 'μ', nu: 'ν', phi: 'φ', varphi: 'φ', psi: 'ψ', Sigma: 'Σ', sum: '∑',
  int: '∫', times: '×', cdot: '·', sqrt: '√', pm: '±', le: '≤', ge: '≥',
  neq: '≠', to: '→', sim: '~', approx: '≈', in: '∈', forall: '∀',
  sin: 'sin', cos: 'cos', tan: 'tan', ln: 'ln', log: 'log', exp: 'exp',
};

function mathToPlain(tex: string): string {
  let s = tex
    // spacing / layout commands carry no meaning in plain text
    .replace(/\\(?:left|right|bigl|bigr|Bigl|Bigr|,|;|!|quad|qquad|displaystyle|text)\b/g, ' ')
    .replace(/\\([a-zA-Z]+)/g, (_m, cmd: string) => MATH_UNICODE[cmd] ?? cmd)
    .replace(/\^\{?([0-9]|n)\}?/g, (_m, d: string) =>
      d === 'n' ? 'ⁿ' : ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'][Number(d)]
    )
    .replace(/_\{?([0-9]|n)\}?/g, (_m, d: string) =>
      d === 'n' ? 'ₙ' : ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'][Number(d)]
    )
    .replace(/[{}]/g, '');
  return s.replace(/\s+/g, ' ').trim();
}

/**
 * Persian plain text for non-HTML surfaces: math spans become readable
 * unicode («[-ℓ, ℓ]», «sinh, cosh»), punctuation spacing is fixed and empty
 * parens left behind by dropped groups are removed.
 */
export function plainText(markdown: string): string {
  return markdown
    .replace(/\$\$([^$]+)\$\$/g, (_m, tex: string) => mathToPlain(tex))
    .replace(/\$([^$]+)\$/g, (_m, tex: string) => mathToPlain(tex))
    .replace(/\(\s*\)|\[\s*\]/g, '')
    .replace(/\s+([،؛.؟!:])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Truncate Persian plain text at a word boundary, with ellipsis when cut. */
export function clampFa(text: string, maxChars: number): string {
  const clean = plainText(text);
  if (clean.length <= maxChars) return clean;
  const cut = clean.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > maxChars * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Home FAQ. The same array feeds the visible <details> list and the FAQPage
 * JSON-LD, so structured data can never drift from what the page shows.
 */
export const HOME_FAQ: {question: string; answer: string}[] = [
  {
    question: 'ریاضیات مهندسی چیست و چه مباحثی را شامل می‌شود؟',
    answer:
      'ریاضیات مهندسی مجموعه ابزارهای ریاضی است که در تحلیل مسائل مهندسی به کار می‌رود. در این دوره چهار محور اصلی بررسی می‌شود: سری فوریه برای بسط توابع متناوب، انتگرال و تبدیل فوریه برای توابع غیرمتناوب، مسئله اشتورم-لیوویل برای معادلات دیفرانسیل مرتبه دوم، و معادله گرما به‌عنوان نمونهٔ شاخص معادلات دیفرانسیل جزئی.',
  },
  {
    question: 'سری فوریه چه تفاوتی با تبدیل فوریه دارد؟',
    answer:
      'سری فوریه یک تابع متناوب را با مجموعه‌ای شمارا از سینوس و کسینوس بازسازی می‌کند و ضریب‌های آن از انتگرال روی یک دورهٔ کامل به دست می‌آید. تبدیل فوریه همان ایده را برای توابع غیرمتناوب روی کل محور حقیقی گسترش می‌دهد و به طیف پیوسته می‌رسد.',
  },
  {
    question: 'مسئله اشتورم-لیوویل چه نقشی در حل معادله گرما دارد؟',
    answer:
      'جداسازی متغیرها در معادله گرما به یک معادله مکانی از نوع اشتورم-لیوویل می‌رسد. مقادیر و توابع ویژهٔ آن، پایه‌های متعامدی می‌سازند که جواب را به‌صورت بسط فوریه‌ای می‌نویسند؛ شرایط مرزی نوع توابع ویژه و فرکانس‌های مجاز را تعیین می‌کنند.',
  },
  {
    question: 'آیا حل مثال‌ها و امتحان‌ها در این سایت رایگان است؟',
    answer:
      'بله. درس‌نامه‌ها، مثال‌های حل‌شده گام‌به‌گام، آزمون‌های تعاملی و بانک امتحانات با پاسخ کامل بدون ثبت‌نام و بدون پرداخت در دسترس است. تنها سرویس هوش مصنوعی برای پرسش‌های آزاد به کلید شخصی نیاز دارد.',
  },
  {
    question: 'پیش‌نیاز مطالعهٔ این دوره چیست؟',
    answer:
      'حساب دیفرانسیل و انتگرال، مثلثات، اعداد مختلط و معادلات دیفرانسیل معمولی مرتبه دوم. فصل صفر دوره همین پیش‌نیازها را مرور می‌کند؛ اگر این مباحث را فراموش کرده‌اید از همان‌جا شروع کنید.',
  },
];

/** Shared keywords; module pages append their own chapter terms. */
export const BASE_KEYWORDS = [
  'ریاضیات مهندسی',
  'آنالیز فوریه',
  'سری فوریه',
  'انتگرال فوریه',
  'تبدیل فوریه',
  'معادله گرما',
  'اشتورم-لیوویل',
  'معادلات دیفرانسیل جزئی',
  'آموزش ریاضیات مهندسی',
  'دانلود جزوه ریاضیات مهندسی',
  'نمونه سوال ریاضیات مهندسی',
  'Engineering Mathematics',
  'Fourier series',
  'Fourier transform',
];

export type WorkspacePhase = 'lesson' | 'lab' | 'examples' | 'quiz';

interface PhaseMetaInput {
  moduleId: string;
  moduleTitle: string;
  moduleShortTitle: string;
  moduleSubtitle: string;
  lessonIndex?: number;
  lessonCount?: number;
  exampleIndex?: number;
  exampleCount?: number;
  questionCount?: number;
  lessonTitle?: string;
  lessonSummary?: string;
}

/**
 * Compose the per-route `<title>` and meta description for the four workspace
 * phases. Subject first, brand appended by the layout template. All numerals
 * are Persian per the site's typography convention.
 */
export function workspacePhaseMeta(
  phase: WorkspacePhase,
  input: PhaseMetaInput
): {title: string; description: string} {
  const chapter = stripLessonNumber(input.moduleShortTitle);
  switch (phase) {
    case 'lesson': {
      const subject = input.lessonTitle
        ? clampFa(stripLessonNumber(input.lessonTitle), 52)
        : chapter;
      const title = `درس‌نامه ${faNum((input.lessonIndex ?? 0) + 1)} از ${faNum(input.lessonCount ?? 0)} · ${subject}`;
      const description = clampFa(
        `${plainText(input.lessonSummary || input.moduleSubtitle)} درس‌نامه ${chapter} با فرمول‌ها، دام‌های امتحانی و مثال‌های مرتبط.`,
        155
      );
      return {title, description};
    }
    case 'lab':
      return {
        title: `آزمایشگاه تعاملی ${chapter}`,
        description: clampFa(
          `شبیه‌ساز تعاملی ${input.moduleSubtitle}؛ پارامترها را تغییر دهید و رفتار ریاضی را به‌صورت زنده ببینید.`,
          155
        ),
      };
    case 'examples': {
      const subject = input.lessonTitle
        ? clampFa(input.lessonTitle, 46)
        : chapter;
      return {
        title: `مسئله حل‌شده ${faNum((input.exampleIndex ?? 0) + 1)} از ${faNum(input.exampleCount ?? 0)} · ${chapter}`,
        description: clampFa(
          `${subject}؛ حل گام‌به‌گام با تمام مراحل میانی، راهنمای «چرا؟» و پاسخ نهایی از ${plainText(input.moduleShortTitle)}.`,
          155
        ),
      };
    }
    case 'quiz':
      return {
        title: `خودآزمایی ${chapter}`,
        description: clampFa(
          `${faNum(input.questionCount ?? 0)} پرسش چهارگزینه‌ای از ${plainText(input.moduleTitle)} با پاسخ تشریحی فوری و سنجش تسلط، بدون ثبت‌نام.`,
          155
        ),
      };
  }
}
