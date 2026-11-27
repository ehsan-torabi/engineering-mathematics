/**
 * Single source of truth for canonical URLs and search metadata.
 * Deployment sets NEXT_PUBLIC_SITE_URL (or APP_URL on AI Studio); no domain
 * is hardcoded here so moving the site never leaves stale canonicals behind.
 */

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.APP_URL ||
  'http://localhost:3000';

export const SITE_URL = rawSiteUrl.replace(/\/+$/, '');

export const SITE_NAME = 'آزمایشگاه تعاملی ریاضیات مهندسی';

export const SITE_DESCRIPTION =
  'آموزش تعاملی ریاضیات مهندسی دوره کارشناسی: آنالیز فوریه، سری و انتگرال فوریه، تبدیل فوریه، مسئله اشتورم-لیوویل و معادله گرما، همراه با درس‌نامه فارسی، مثال‌های حل‌شده گام‌به‌گام، آزمون و بانک امتحانات دانشگاهی با پاسخ کامل.';

/** Strip `$...$` LaTeX so titles stay readable in metadata and llms.txt. */
export function plainText(markdown: string): string {
  return markdown
    .replace(/\$[^$]*\$/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([،؛.])/g, '$1')
    .trim();
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
