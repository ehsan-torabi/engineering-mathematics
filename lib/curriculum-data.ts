/**
 * Complete Curriculum Data for Engineering Mathematics (Undergraduate Level)
 * Based on the attached PDF: "نکات و مثال‌ها در ریاضیات مهندسی" (دکتر بیژن طائری / محمدرضا احمدی دارانی / بنفشه رئیسی)
 * All formulas are written in standard LaTeX for KaTeX rendering, and all inline math in Persian text
 * is delimited with $...$ so MathText isolates LTR directionality cleanly.
 * All worked examples are fully expanded step-by-step without skipping intermediate calculus or algebra.
 */

import { TEXTBOOK_NOTES } from './textbook-notes.ts';

export type ModuleId =
  | 'module_0_prerequisites'
  | 'module_1_definitions'
  | 'module_2_fourier_series'
  | 'module_3_fourier_integral'
  | 'module_4_fourier_transform'
  | 'module_5_sturm_liouville'
  | 'module_6_heat_pde';

export interface DerivationStep {
  stepNumber: number;
  title: string;
  explanation: string;
  formula: string;
  highlightNote?: string;
  whyHint?: string;
}

export interface WorkedExample {
  id: string;
  pdfReference: string;
  title: string;
  difficulty: 'پایه (مفهومی)' | 'متوسط (امتحانی)' | 'پیشرفته (تکمیلی)';
  problemStatement: string;
  problemFormula: string;
  finalAnswerFormula: string;
  steps: DerivationStep[];
}

export interface SubtopicItem {
  id: string;
  title: string;
  pdfPages: string;
  summary: string;
  detailedExplanation?: string;
  commonPitfalls?: string[];
  engineeringApplications?: string[];
  keyFormulas: {
    label: string;
    formula: string;
    note?: string;
  }[];
  conceptualPoints: string[];
}

export interface PracticeQuestion {
  id: string;
  question: string;
  formula?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type ModuleComplexityLayout = 'wide_canvas' | 'focused_reading' | 'balanced_split';

export interface LayoutComplexityConfig {
  id: ModuleComplexityLayout;
  labelFa: string;
  badgeFa: string;
  rationaleFa: string;
  recommendedModulesFa: string;
}

export const LAYOUT_COMPLEXITY_CONFIG: Record<
  ModuleComplexityLayout,
  LayoutComplexityConfig
> = {
  wide_canvas: {
    id: 'wide_canvas',
    labelFa: 'بوم عریض شبیه‌سازی (Wide Canvas)',
    badgeFa: 'پیچیدگی بالا: بوم عریض و تحلیل چندبعدی',
    rationaleFa: 'بهینه‌سازی‌شده برای معادلات با مشتقات جزئی (گرما، موج) و اشتورم-لیوویل: فضای عریض برای شبیه‌ساز تصویری و استقرار همزمان درس‌نامه و حل گام‌به‌گام.',
    recommendedModulesFa: 'معادله گرما (PDE)، اشتورم-لیوویل، تبدیل و انتگرال فوریه',
  },
  focused_reading: {
    id: 'focused_reading',
    labelFa: 'مطالعه متمرکز متن و فرمول (Focused Reading)',
    badgeFa: 'پایه و تعاریف: طول سطر ارگونومیک برای خوانایی حداکثری',
    rationaleFa: 'بهینه‌سازی‌شده برای مباحث پیش‌نیاز، تعاریف و پایه‌های اولیه: تمرکز روی درس‌نامه با پهنای استاندارد مطالعه ارگونومیک همراه با جعبه ابزار تعاملی در کنار متن.',
    recommendedModulesFa: 'ریاضیات پایه و پیش‌نیاز، تعاریف اولیه و تقارن',
  },
  balanced_split: {
    id: 'balanced_split',
    labelFa: 'نمای متوازن دو ستونه (Balanced Split)',
    badgeFa: 'متوازن: هم‌ترازی بوم نوسان و حل تحلیلی',
    rationaleFa: 'بهینه‌سازی‌شده برای سری فوریه: تعادل بین مشاهده هارمونیک‌های نوسانی و پیگیری گام‌به‌گام بسط‌های جبری.',
    recommendedModulesFa: 'سری‌های فوریه مثلثاتی',
  },
};

export function getModuleDefaultLayout(moduleId: ModuleId): ModuleComplexityLayout {
  switch (moduleId) {
    case 'module_6_heat_pde':
    case 'module_5_sturm_liouville':
    case 'module_4_fourier_transform':
    case 'module_3_fourier_integral':
      return 'wide_canvas';
    case 'module_0_prerequisites':
    case 'module_1_definitions':
      return 'focused_reading';
    case 'module_2_fourier_series':
    default:
      return 'balanced_split';
  }
}

export interface CurriculumModule {
  id: ModuleId;
  numberLabel: string;
  /** Compact label for the top navigation bar */
  shortTitle: string;
  title: string;
  subtitle: string;
  pdfPageRange: string;
  simulatorType:
    | 'prerequisites_foundation'
    | 'symmetry_orthogonality'
    | 'fourier_series'
    | 'fourier_integral'
    | 'fourier_transform'
    | 'sturm_liouville'
    | 'heat_pde';
  layoutComplexity?: ModuleComplexityLayout;
  subtopics: SubtopicItem[];
  workedExamples: WorkedExample[];
  practiceQuestions: PracticeQuestion[];
}

const BASE_CURRICULUM_MODULES: CurriculumModule[] = [
  {
    id: 'module_0_prerequisites',
    shortTitle: '۰. پیش‌نیاز',
    numberLabel: 'بخش ۰ (پیش‌نیاز)',
    title: 'ریاضیات پایه و پیش‌نیاز: انتگرال جزء‌به‌جزء، مثلثات فوریه، اویلر و معادلات دیفرانسیل',
    subtitle: 'مرور جامع و گام‌به‌گام تمام ابزارهای حساب دیفرانسیل و انتگرال، مثلثات مرزی، اعداد مختلط و ODE مورد نیاز برای ریاضیات مهندسی',
    pdfPageRange: 'مباحث پایه و پیش‌نیاز ضروری',
    simulatorType: 'prerequisites_foundation',
    layoutComplexity: 'focused_reading',
    subtopics: [
      {
        id: 'p0_ibp_tabular',
        title: 'انتگرال‌گیری جزء‌به‌جزء، قانون LIATE و شرح کامل روش جدولی (Tabular DI)',
        pdfPages: 'پیش‌نیاز اول',
        summary:
          'بیش از ۹۰٪ ضرایب سری فوریه ($a_n$ و $b_n$) و تبدیل‌های فوریه نیازمند محاسبه انتگرال حاصل‌ضرب یک چندجمله‌ای ($x^k$) یا تابع نمایی ($e^{ax}$) در سینوس و کسینوس هستند. روش جزء‌به‌جزء جدولی (Tabular DI Method) این انتگرال‌های چندمرحله‌ای را با قانون «ضرب قُطری از سطر $k$ ستون $D$ به سطر $k+1$ ستون $I$» و «ضرب افقی زیر انتگرال در سطر آخر» بدون کوچک‌ترین خطای علامت حل می‌کند.',
        keyFormulas: [
          {
            label: '۱. فرمول استاندارد انتگرال‌گیری جزء‌به‌جزء و منشأ روش جدولی',
            formula:
              '\\int u\\,dv = u\\,v - \\int v\\,du \\implies \\int f(x)g(x)\\,dx = +f(x)G_1(x) - f\'(x)G_2(x) + f\'\'(x)G_3(x) - \\cdots',
            note: 'طبق قانون اولویت LIATE (لگاریتمی، معکوس مثلثاتی، جبری/چندجمله‌ای، مثلثاتی، نمایی)، همیشه چندجمله‌ای ($x^k$) را در ستون مشتق ($D$) و عبارت مثلثاتی $\\cos(\\omega x)$ یا $\\sin(\\omega x)$ را در ستون انتگرال ($I$) قرار می‌دهیم.',
          },
          {
            label: '۲. ساختار استاندارد جدول DI با قانون ضرب قُطری ($\\searrow$) و توقف افقی ($\\longleftarrow$)',
            formula:
              '\\begin{array}{c|c|c|c|l} \\text{سطر} & \\text{علامت} & D \\text{ (مشتق } u\\text{)} & \\text{مسیر ضرب} & I \\text{ (انتگرال } dv\\text{)} \\\\ \\hline 1 & + & u_0 = x^2 & \\searrow \\text{ قطر ۱ در } I_2 & I_1 = \\cos(nx) \\;\\text{(ضرب نمی‌شود!)} \\\\ 2 & - & u_1 = 2x & \\searrow \\text{ قطر ۲ در } I_3 & I_2 = \\frac{\\sin(nx)}{n} \\\\ 3 & + & u_2 = 2 & \\searrow \\text{ قطر ۳ در } I_4 & I_3 = -\\frac{\\cos(nx)}{n^2} \\\\ 4 & - & u_3 = 0 & \\longleftarrow \\text{ انتگرال افقی} & I_4 = -\\frac{\\sin(nx)}{n^3} \\end{array}',
            note: 'چرا $I_1 = \\cos(nx)$ در سطر اول ضرب نمی‌شود؟ چون در فرمول $\\int u\\,dv = u\\cdot v - \\int v\\,du$، جمله اول $u\\cdot v$ است نه $u\\cdot dv$! در سطر ۱، ستون $I$ همان $dv$ (قبل از انتگرال‌گیری) است و $v = \\int dv$ در سطر ۲ ستون $I$ قرار دارد؛ بنابراین همیشه سطر $k$ از ستون $D$ به صورت قُطری ($\\searrow$) در سطر $k+1$ از ستون $I$ ضرب می‌شود.',
          },
          {
            label: '۳. استخراج عبارت نهایی از قطرهای جدول DI و قانون انتگرال افقی سطر آخر',
            formula:
              '\\int x^2\\cos(nx)\\,dx = \\underbrace{(+x^2)\\left(\\frac{\\sin(nx)}{n}\\right)}_{\\text{قطر ۱: } D_1 \\searrow I_2} + \\underbrace{(-2x)\\left(-\\frac{\\cos(nx)}{n^2}\\right)}_{\\text{قطر ۲: } D_2 \\searrow I_3} + \\underbrace{(+2)\\left(-\\frac{\\sin(nx)}{n^3}\\right)}_{\\text{قطر ۳: } D_3 \\searrow I_4} - \\underbrace{\\int (0)\\left(-\\frac{\\sin(nx)}{n^3}\\right)dx}_{\\text{سطر آخر افقی } = 0}',
            note: 'در سطر آخر جدول همیشه عناصر همان سطر را به صورت افقی ($\\longleftarrow$) در هم ضرب کرده و زیر علامت انتگرال ($\\pm \\int D_{\\text{last}}\\cdot I_{\\text{last}}\\,dx$) قرار می‌دهیم. اگر $D_{\\text{last}} = 0$ باشد انتگرال صفر شده و کار تمام است؛ و اگر تابع تکرارشونده مانند $e^{-ax}\\cos(\\alpha x)$ باشد، انتگرال افقی مضربی از انتگرال اولیه $I$ را می‌سازد.',
          },
          {
            label: '۴. انتگرال‌های پایه مثلثاتی (مخرج ضریب زاویه فراموش نشود!)',
            formula:
              '\\int \\cos\\left(\\frac{n\\pi x}{\\ell}\\right)dx = \\frac{\\ell}{n\\pi}\\sin\\left(\\frac{n\\pi x}{\\ell}\\right) \\quad , \\quad \\int \\sin\\left(\\frac{n\\pi x}{\\ell}\\right)dx = -\\frac{\\ell}{n\\pi}\\cos\\left(\\frac{n\\pi x}{\\ell}\\right)',
            note: 'در هر سطر از ستون $I$ جدول DI، هنگام انتگرال‌گیری از سینوس یا کسینوس، تقسیم بر ضریب زاویه ($n$ یا $\\frac{n\\pi}{\\ell}$) و علامت منفی انتگرال سینوس را با دقت اعمال کنید.',
          },
        ],
        conceptualPoints: [
          'هرگز در جدول DI دو عبارت هم‌سطر را در هم ضرب نکنید (مگر در سطر آخر که داخل علامت انتگرال $\\int$ قرار می‌گیرد): ضرب‌های خارج از انتگرال همگی قُطری ($\\searrow$) از سطر $k$ ستون $D$ به سطر $k+1$ ستون $I$ هستند.',
          'علامت هر قطر از ضربِ «علامت متناوب ستون اول ($+ , - , + , -$)» در «علامت درونی انتگرال ستون $I$» به دست می‌آید؛ مثلاً در قطر دوم $x^2\\cos(nx)$ داریم $(-2x)\\times(-\\frac{\\cos(nx)}{n^2}) = +\\frac{2x\\cos(nx)}{n^2}$.',
          'در جایگذاری حدود $[F(x)]_a^b = F(b) - F(a)$، به ازای $x = 0$ همواره $x\\sin(nx) = 0$ و $x\\cos(nx) = 0$ است، اما خود $\\cos(0) = 1$ صفر نیست و نباید به اشتباه حذف شود!',
        ],
      },
      {
        id: 'p0_trig_identities',
        title: 'مثلثات طلایی فوریه، مقادیر مرزی $(-1)^n$ و اتحادهای تبدیل ضرب به جمع',
        pdfPages: 'پیش‌نیاز دوم',
        summary:
          'پس از انتگرال‌گیری، حدود بالا و پایین انتگرال مضرب‌هایی از $\\pi$ یا $\\frac{\\pi}{2}$ هستند. ساده‌سازی نهایی ضرایب فوریه بدون شناخت دقیق مقادیر $\\sin(n\\pi)$، $\\cos(n\\pi)$ و اتحادهای مثلثاتی ممکن نیست.',
        keyFormulas: [
          {
            label: 'مقادیر طلایی سینوس و کسینوس به ازای عدد صحیح $n \\in \\mathbb{Z}$',
            formula:
              '\\sin(n\\pi) = 0 \\quad , \\quad \\cos(n\\pi) = (-1)^n \\quad , \\quad \\sin\\left(\\frac{(2n-1)\\pi}{2}\\right) = (-1)^{n-1} \\quad , \\quad \\cos\\left(\\frac{(2n-1)\\pi}{2}\\right) = 0',
            note: 'همچنین داریم $\\cos(2n\\pi) = 1$، $\\sin(2n\\pi) = 0$ و $(-1)^{2n} = 1$ و $(-1)^{2n-1} = -1$.',
          },
          {
            label: 'جدول مقادیر مهم سینوس و کسینوس در زوایای خاص',
            formula:
              '\\begin{aligned} &x = 0: \\quad \\sin x = 0 \\quad , \\quad \\cos x = 1 \\\\ &x = \\frac{\\pi}{6}: \\quad \\sin x = \\frac{1}{2} \\quad , \\quad \\cos x = \\frac{\\sqrt{3}}{2} \\\\ &x = \\frac{\\pi}{4}: \\quad \\sin x = \\frac{\\sqrt{2}}{2} \\quad , \\quad \\cos x = \\frac{\\sqrt{2}}{2} \\\\ &x = \\frac{\\pi}{3}: \\quad \\sin x = \\frac{\\sqrt{3}}{2} \\quad , \\quad \\cos x = \\frac{1}{2} \\\\ &x = \\frac{\\pi}{2}: \\quad \\sin x = 1 \\quad , \\quad \\cos x = 0 \\\\ &x = \\pi: \\quad \\sin x = 0 \\quad , \\quad \\cos x = -1 \\end{aligned}',
            note: 'این مقادیر پایه همه در محاسبه ضرایب فوریه با $n = 1$ و بررسی اولین جمله سری لازم‌اند؛ برای زوایای بیشتر از $\\frac{\\pi}{2}$، علامت بر اساس ربع تعیین می‌شود: در ربع دوم فقط سینوس، در ربع سوم فقط تانژانت و در ربع چهارم فقط کسینوس مثبت است. همچنین $\\sin(-x) = -\\sin x$ (فرد) و $\\cos(-x) = \\cos x$ (زوج) است.',
          },
          {
            label: 'تفکیک زوج و فرد برای عبارات $1 - (-1)^n$ و $1 + (-1)^n$',
            formula:
              '1 - (-1)^n = \\begin{cases} 0 & n = 2k \\text{ (زوج)} \\\\ 2 & n = 2k-1 \\text{ (فرد)} \\end{cases} \\qquad , \\qquad 1 + (-1)^n = \\begin{cases} 2 & n = 2k \\text{ (زوج)} \\\\ 0 & n = 2k-1 \\text{ (فرد)} \\end{cases}',
            note: 'هرگاه در صورت کسر ضریب فوریه عبارت $1 - (-1)^n$ ظاهر شود، تمام جملات زوج سری صفر شده و فقط جملات فرد $n=2k-1$ باقی می‌مانند.',
          },
          {
            label: 'اتحادهای کاهش توان و تبدیل ضرب به جمع (پایه اثبات تعامد و نُرم)',
            formula:
              '\\begin{aligned} \\sin^2\\theta &= \\frac{1 - \\cos(2\\theta)}{2} \\quad , \\quad \\cos^2\\theta = \\frac{1 + \\cos(2\\theta)}{2} \\\\ \\sin A \\cos B &= \\frac{1}{2}\\big[\\sin(A+B) + \\sin(A-B)\\big] \\\\ \\cos A \\cos B &= \\frac{1}{2}\\big[\\cos(A-B) + \\cos(A+B)\\big] \\quad , \\quad \\sin A \\sin B = \\frac{1}{2}\\big[\\cos(A-B) - \\cos(A+B)\\big] \\end{aligned}',
            note: 'برای انتگرال‌گیری از $\\sin^2(nx)$ یا $\\cos^2(nx)$ (در محاسبه نُرم و اتحاد پارسوال) همیشه از اتحاد کاهش توان استفاده می‌کنیم.',
          },
        ],
        conceptualPoints: [
          'دقت کنید که $(-1)^n \\cdot (-1) = (-1)^{n+1} = (-1)^{n-1}$ است؛ این تساوی در مرتب‌سازی علامت ضریب $b_n$ بسیار کاربرد دارد.',
          'مقدار $\\sin\\left(\\frac{n\\pi}{2}\\right)$ به ازای $n$های زوج ($n=2k$) برابر $0$ و به ازای $n$های فرد ($n=1,3,5,\\dots$) به تناوب برابر $+1, -1, +1, \\dots$ یعنی $(-1)^{\\frac{n-1}{2}}$ است.',
        ],
      },
      {
        id: 'p0_euler_hyperbolic',
        title: 'اعداد مختلط، فرمول اویلر ($e^{i\\theta}$) و توابع هیپربولیک ($\\sinh, \\cosh$)',
        pdfPages: 'پیش‌نیاز سوم',
        summary:
          'فرمول اویلر پیوند عمیق بین تابع نمایی مختلط و توابع مثلثاتی را برقرار می‌کند که شالوده تبدیل فوریه ($e^{-i\\alpha x}$) است. توابع هیپربولیک نیز در حل معادله مشخصه اشتورم-لیوویل به ازای $\\lambda < 0$ ظاهر می‌شوند.',
        keyFormulas: [
          {
            label: 'فرمول اویلر و نمایش نمایی سینوس و کسینوس',
            formula:
              'e^{\\pm i\\theta} = \\cos\\theta \\pm i\\sin\\theta \\implies \\cos\\theta = \\frac{e^{i\\theta} + e^{-i\\theta}}{2} \\quad , \\quad \\sin\\theta = \\frac{e^{i\\theta} - e^{-i\\theta}}{2i}',
            note: 'در اینجا $i^2 = -1$ و $\\frac{1}{i} = -i$ است. اندازه (قدر مطلق) عدد مختلط $e^{i\\theta}$ روی دایره واحد همواره برابر $|e^{i\\theta}| = \\sqrt{\\cos^2\\theta + \\sin^2\\theta} = 1$ است.',
          },
          {
            label: 'تعریف و خواص توابع هیپربولیک (هذلولوی)',
            formula:
              '\\cosh(x) = \\frac{e^x + e^{-x}}{2} \\quad , \\quad \\sinh(x) = \\frac{e^x - e^{-x}}{2} \\quad , \\quad \\cosh^2(x) - \\sinh^2(x) = 1',
            note: 'تابع $\\cosh(x)$ تابعی زوج است و همواره $\\cosh(x) \\ge 1 > 0$ (هیچ ریشه حقیقی ندارد). تابع $\\sinh(x)$ تابعی فرد است و تنها ریشه حقیقی آن $x = 0$ است ($\\sinh(x)=0 \\iff x=0$).',
          },
          {
            label: 'مقادیر مهم، اتحادهای مضاعف و پل مختلط توابع هیپربولیک',
            formula:
              '\\begin{aligned} &\\sinh(0) = 0 \\quad , \\quad \\cosh(0) = 1 \\quad , \\quad \\sinh(\\ln n) = \\frac{n - \\frac{1}{n}}{2} \\quad , \\quad \\cosh(\\ln n) = \\frac{n + \\frac{1}{n}}{2} \\\\ &\\sinh(2x) = 2\\sinh(x)\\cosh(x) \\quad , \\quad \\cosh(2x) = \\cosh^2(x) + \\sinh^2(x) \\quad , \\quad e^{x} = \\cosh(x) + \\sinh(x) \\\\ &\\cosh(ix) = \\cos(x) \\quad , \\quad \\sinh(ix) = i\\sin(x) \\end{aligned}',
            note: 'مثال‌های عددی پرکاربرد: $\\sinh(\\ln 2) = \\frac{3}{4}$ و $\\cosh(\\ln 2) = \\frac{5}{4}$؛ همچنین $\\sinh(\\ln 3) = \\frac{4}{3}$ و $\\cosh(\\ln 3) = \\frac{5}{3}$. روابط $\\cosh(ix) = \\cos x$ و $\\sinh(ix) = i\\sin x$ پل مستقیم توابع هیپربولیک با فرمول اویلر هستند و در تبدیل جواب‌های مختلط به حقیقی استفاده می‌شوند.',
          },
          {
            label: 'مشتق و انتگرال توابع هیپربولیک (بدون تغییر علامت!)',
            formula:
              '\\frac{d}{dx}\\big(\\sinh(px)\\big) = p\\cosh(px) \\qquad , \\qquad \\frac{d}{dx}\\big(\\cosh(px)\\big) = p\\sinh(px)',
            note: 'برخلاف مشتق کسینوس که علامت منفی می‌گیرد، مشتق و انتگرال هر دو تابع $\\sinh$ و $\\cosh$ همواره مثبت است.',
          },
        ],
        conceptualPoints: [
          'برای هر عدد مختلط $z = x + iy$، مزدوج مختلط برابر $\\bar{z} = x - iy$ و مربع قدر مطلق برابر $|z|^2 = z\\cdot\\bar{z} = x^2 + y^2$ است (کاربرد مستقیم در طیف انرژی تبدیل فوریه $|F(\\alpha)|^2$).',
          'چون $\\sinh(pL) = 0$ به ازای $L > 0$ فقط زمانی رخ می‌دهد که $p = 0$ باشد، در مسئله اشتورم-لیوویل حالت $\\lambda = -p^2 < 0$ معمولاً فقط جواب بدیهی صفر می‌دهد.',
        ],
      },
      {
        id: 'p0_second_order_ode',
        title: 'معادلات دیفرانسیل معمولی خطی مرتبه دوم ($ay\'\' + by\' + cy = 0$)',
        pdfPages: 'پیش‌نیاز چهارم',
        summary:
          'در روش جداسازی متغیرها برای حل معادله گرما و در مسئله اشتورم-لیوویل، معادله با مشتقات جزئی (PDE) به دو معادله دیفرانسیل معمولی (ODE) تبدیل می‌شود که حل دقیق آن‌ها پیش‌نیاز مستقیم بخش‌های ۵ و ۶ است.',
        keyFormulas: [
          {
            label: 'معادله دیفرانسیل مرتبه اول جداسازی‌پذیر (بخش زمانی معادله گرما)',
            formula:
              'T\'(t) + \\alpha^2 \\lambda\\, T(t) = 0 \\implies \\frac{T\'(t)}{T(t)} = -\\alpha^2 \\lambda \\implies T(t) = C\\, e^{-\\alpha^2 \\lambda t}',
            note: 'وقتی $\\lambda > 0$ باشد، عامل نمایی $e^{-\\alpha^2 \\lambda t}$ با گذشت زمان $t \\to \\infty$ به صفر میل می‌کند که بیانگر میرایی فیزیکی دماست.',
          },
          {
            label: 'سه حالت جواب عمومی معادله مکانی $X\'\'(x) + \\lambda X(x) = 0$ بر حسب علامت $\\lambda$',
            formula:
              'X(x) = \\begin{cases} c_1 e^{px} + c_2 e^{-px} = A\\cosh(px) + B\\sinh(px) & \\lambda = -p^2 < 0 \\; (r = \\pm p) \\\\ A + Bx & \\lambda = 0 \\; (r_1 = r_2 = 0) \\\\ A\\cos(px) + B\\sin(px) & \\lambda = p^2 > 0 \\; (r = \\pm ip) \\end{cases}',
            note: 'در بازه‌های متناهی $[0, L]$، نوشتن جواب حالت $\\lambda < 0$ برحسب $A\\cosh(px) + B\\sinh(px)$ بسیار ساده‌تر از $c_1 e^{px} + c_2 e^{-px}$ است چون در $x=0$ مستقیماً $\\sinh(0)=0$ و $\\cosh(0)=1$ می‌شود.',
          },
        ],
        conceptualPoints: [
          'معادله مشخصه با قرار دادن $X(x) = e^{rx}$ به دست می‌آید: $r^2 + \\lambda = 0 \\implies r^2 = -\\lambda$.',
          'فقط در حالت سوم ($\\lambda = p^2 > 0$) جواب‌ها نوسانی هستند و می‌توانند شرایط مرزی دو نقطه مانند $X(0)=0$ و $X(L)=0$ را بدون صفر شدن کامل تابع ارضا کنند.',
        ],
      },
      {
        id: 'p0_parity_product',
        title: 'ضرب توابع زوج و فرد: جدول تقارن حاصل‌ضرب و اثر آن بر ضرایب فوریه',
        pdfPages: 'پیش‌نیاز پنجم',
        summary:
          'در محاسبه ضرایب سری فوریه همیشه یک حاصل‌ضرب انتگرال‌گیری می‌شود: $f(x)\\cos(nx)$ یا $f(x)\\sin(nx)$. تشخیص سریع تقارن این حاصل‌ضرب با «جدول ضرب زوج و فرد» تعیین می‌کند که کدام ضریب از همان ابتدا صفر است ($a_n$ یا $b_n$) و کدام ضریب با $2\\int_0^\\ell$ ساده می‌شود؛ بدون این مهارت، بیشترین خطای علامت و اتلاف وقت در امتحان رخ می‌دهد.',
        keyFormulas: [
          {
            label: '۱. تعریف زوج و فرد و جدول تقارن حاصل‌ضرب دو تابع',
            formula:
              '\\begin{aligned} &\\text{زوج: } f(-x) = f(x) \\qquad \\text{فرد: } f(-x) = -f(x) \\\\ &\\text{زوج} \\times \\text{زوج} = \\text{زوج} \\qquad \\text{فرد} \\times \\text{فرد} = \\text{زوج} \\qquad \\text{زوج} \\times \\text{فرد} = \\text{فرد} \\end{aligned}',
            note: 'اثبات یک‌خطی برای $g(x) = f(x)h(x)$: $g(-x) = f(-x)h(-x)$. مثال‌های کلیدی: $x^2\\cos(nx)$ زوج است، $x\\sin(nx)$ زوج است (فرد در فرد) و $x\\cos(nx)$ فرد است.',
          },
          {
            label: '۲. تقارن توان‌ها و مربع توابع مثلثاتی',
            formula:
              '(-x)^n = (-1)^n x^n \\implies x^{2k} \\text{ زوج و } x^{2k-1} \\text{ فرد است} \\qquad , \\qquad \\sin^2(nx) = \\frac{1 - \\cos(2nx)}{2} \\; \\text{(زوج)}',
            note: 'مربع هر تابع ($\\sin^2(nx)$، $\\cos^2(nx)$ و $\\sinh^2(x)$) همیشه زوج است؛ این نکته در محاسبه نُرم $\\int_{-\\pi}^{\\pi}\\sin^2(nx)\\,dx = \\pi$ بدون نیاز به محاسبه کامل به کار می‌رود.',
          },
          {
            label: '۳. اثر مستقیم تقارن حاصل‌ضرب بر صفر شدن ضرایب فوریه',
            formula:
              'a_n = \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} f(x)\\cos(nx)\\,dx \\quad , \\quad b_n = \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} f(x)\\sin(nx)\\,dx \\implies \\begin{cases} f \\text{ زوج} \\implies f(x)\\sin(nx) \\text{ فرد} \\implies b_n = 0 \\\\ f \\text{ فرد} \\implies f(x)\\cos(nx) \\text{ فرد} \\implies a_n = 0 \\end{cases}',
            note: 'چون $\\cos(nx)$ زوج و $\\sin(nx)$ فرد است، تقارن حاصل‌ضرب را خودِ تابع $f$ تعیین می‌کند: تابع زوج فقط بسط کسینوسی و تابع فرد فقط بسط سینوسی دارد.',
          },
        ],
        conceptualPoints: [
          'تابع ثابت $c$، $|x|$، $\\cos(nx)$ و $\\cosh(x)$ زوج هستند و $x^n$ با $n$ فرد، $\\sin(nx)$، $\\tan(nx)$ و $\\sinh(x)$ فرد هستند؛ ترکیب خطی دو تابع زوج، زوج است اما جمع یک تابع زوج و یک تابع فرد (در حالت کلی) نه زوج است و نه فرد.',
          'برای هر تابع تعریف‌شده روی بازه متقارن، $f(x) + f(-x)$ همیشه زوج و $f(x) - f(-x)$ همیشه فرد است؛ همین ایده مبنای تجزیه یکتای $f = f_e + f_o$ در بخش ۱ است.',
          'قاعده تصمیم‌گیری در امتحان: قبل از نوشتن هر انتگرال ضریب فوریه روی $[-\\pi, \\pi]$، تقارن انتگرال‌ده را مشخص کن تا یا فوراً آن را صفر بنویسی یا بازه را به $[0, \\pi]$ با ضریب $2$ تبدیل کنی.',
          'دام مر رایج: «حاصل‌ضرب دو تابع غیرصفر فرد است» — در واقع فرد در فرد، زوج می‌شود؛ تقارن را همیشه از تعریف $f(-x)$ استخراج کن نه از حدس.',
        ],
      },
      {
        id: 'p0_parity_integral',
        title: 'انتگرال‌گیری توابع زوج و فرد روی بازه متقارن، نُرم‌ها و بسط‌های نیمه‌بازه',
        pdfPages: 'پیش‌نیاز ششم',
        summary:
          'قضیه تقارن انتگرال روی بازه‌های متقارن $[-\\ell, \\ell]$ یا $(-\\infty, \\infty)$ اجازه می‌دهد انتگرال تابع فرد را بدون هیچ محاسبه‌ای صفر بنویسیم و انتگرال تابع زوج را به دو برابر انتگرال روی نیم‌بازه مثبت تبدیل کنیم. این قضیه ستون فقرات محاسبه سریع ضرایب $a_n$ و $b_n$، نُرم توابع متعامد و بسط‌های نیمه‌بازه (سری کسینوسی و سینوسی) است.',
        keyFormulas: [
          {
            label: '۱. قضیه تقارن انتگرال روی بازه متقارن $[-a, a]$',
            formula:
              '\\int_{-a}^{a} g(x)\\,dx = \\begin{cases} 0 & g(x) \\text{ فرد باشد} \\\\ 2\\displaystyle\\int_{0}^{a} g(x)\\,dx & g(x) \\text{ زوج باشد} \\end{cases}',
            note: 'اثبات با تقسیم بازه به $[-a, 0]$ و $[0, a]$ و تغییر متغیر $x \\to -x$؛ شرط لازم، متقارن بودن بازه انتگرال‌گیری نسبت به مبدأ است.',
          },
          {
            label: '۲. کاربرد فوری در ضرایب فوریه: محاسبه $\\int_{-\\pi}^{\\pi} x\\sin(nx)\\,dx$',
            formula:
              '\\int_{-\\pi}^{\\pi} x\\sin(nx)\\,dx = 2\\int_{0}^{\\pi} x\\sin(nx)\\,dx = \\frac{2\\pi(-1)^{n+1}}{n} \\qquad , \\qquad \\int_{-\\pi}^{\\pi} x\\cos(nx)\\,dx = 0',
            note: 'حاصل‌ضرب $x\\sin(nx)$ (فرد در فرد) زوج است پس برابر $2\\int_0^\\pi$ می‌شود، اما $x\\cos(nx)$ (فرد در زوج) فرد است و انتگرالش روی $[-\\pi, \\pi]$ دقیقاً صفر است؛ حل کامل این انتگرال در مثال پایه ۴ آمده است.',
          },
          {
            label: '۳. نُرم توابع متعامد و انتگرال‌های ناسره زوج',
            formula:
              '\\int_{-\\pi}^{\\pi} \\cos^2(nx)\\,dx = \\int_{-\\pi}^{\\pi} \\sin^2(nx)\\,dx = \\pi \\quad (n \\ge 1) \\qquad , \\qquad \\int_{-\\infty}^{\\infty} e^{-ax^2}\\,dx = 2\\int_{0}^{\\infty} e^{-ax^2}\\,dx = \\sqrt{\\frac{\\pi}{a}} \\; (a > 0)',
            note: 'چون $\\cos^2(nx)$ و $e^{-ax^2}$ زوج هستند، انتگرال روی کل بازه دو برابر انتگرال روی نیم‌بازه مثبت است؛ همین نُرم‌ها در برهان تعامد سری فوریه و اتحاد پارسوال به کار می‌روند.',
          },
        ],
        conceptualPoints: [
          'پادمشتق تقارن را عوض می‌کند: با شرط $F(0) = 0$، پادمشتق تابع فرد زوج است ($F(x) = \\int_0^x f(t)\\,dt$ با $f$ فرد) و پادمشتق تابع زوج فرد است.',
          'روی بازه غیرمتقارن مانند $[0, \\pi]$ هیچ‌کدام از این دو قاعده برقرار نیست؛ انتگرال تابع فرد روی $[0, \\pi]$ معمولاً صفر نیست.',
          'در بسط نیمه‌بازه روی $(0, L)$، تابع با بازتاب زوج به سری کسینوسی و با بازتاب فرد به سری سینوسی گسترش می‌یابد؛ انتخاب نوع تقارن توسط شرایط مرزی (نویمن یا دیریکله) تعیین می‌شود.',
          'دام رایج: به‌کار بردن قضیه روی بازه‌های غیرمتقارن یا فراموش کردن ضریب $2$ در حالت تابع زوج: $\\int_{-a}^{a} g = 2\\int_0^a$ است نه $\\int_0^a$.',
        ],
      },
      {
        id: 'p0_improper_gaussian',
        title: 'انتگرال‌های ناسره، انتگرال گوسین و قضایای تقارن در انتگرال‌گیری',
        pdfPages: 'پیش‌نیاز هفتم',
        summary:
          'در مباحث انتگرال فوریه و تبدیل فوریه (بخش‌های ۳ و ۴)، دامنه انتگرال‌گیری کل محور اعداد حقیقی $(-\\infty, \\infty)$ است و محاسبه حد در بی‌نهایت و انتگرال‌های مرجع نمایی و گوسین اهمیت کلیدی دارد.',
        keyFormulas: [
          {
            label: 'انتگرال‌های ناسره نمایی-کسینوسی و نمایی-سینوسی ($a > 0$)',
            formula:
              '\\int_{0}^{\\infty} e^{-ax}\\cos(\\alpha x)\\,dx = \\frac{a}{a^2 + \\alpha^2} \\qquad , \\qquad \\int_{0}^{\\infty} e^{-ax}\\sin(\\alpha x)\\,dx = \\frac{\\alpha}{a^2 + \\alpha^2}',
            note: 'چون $\\lim_{x \\to \\infty} e^{-ax} = 0$ (به ازای $a > 0$) و توابع $\\sin$ و $\\cos$ کران‌دار هستند ($|\\cos(\\alpha x)| \\le 1$)، حد در کران بالا برابر صفر است.',
          },
          {
            label: 'انتگرال گوسین (Gaussian Integral) و انتگرال دیریکله (Dirichlet Integral)',
            formula:
              '\\int_{-\\infty}^{\\infty} e^{-a x^2}\\,dx = \\sqrt{\\frac{\\pi}{a}} \\quad (a > 0) \\qquad , \\qquad \\int_{0}^{\\infty} \\frac{\\sin(u)}{u}\\,du = \\frac{\\pi}{2}',
            note: 'در حالت خاص $a = 1$ داریم $\\int_{-\\infty}^{\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}$ و چون تابع زوج است، $\\int_{0}^{\\infty} e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}$.',
          },
        ],
        conceptualPoints: [
          'قبل از شروع هر انتگرال روی بازه متقارن $[-\\ell, \\ell]$ یا $(-\\infty, \\infty)$، ابتدا زوج یا فرد بودن انتگرال‌ده را بررسی کنید: اگر فرد باشد حاصل فوراً $0$ است و اگر زوج باشد برابر $2\\int_0^\\ell$ است.',
          'با استفاده از خاصیت زوج بودن $e^{-a|x|}\\cos(\\alpha x)$، تبدیل فوریه تابع نمایی دوطرفه بدون نیاز به شکستن بازه برابر $2\\int_0^\\infty e^{-ax}\\cos(\\alpha x)\\,dx = \\frac{2a}{a^2+\\alpha^2}$ می‌شود.',
        ],
      },
      {
        id: 'p0_exp_ln',
        title: 'محاسبات نمایی و لگاریتمی: قواعد $e$ و $\\ln$ در جواب‌ها و ضرایب',
        pdfPages: 'پیش‌نیاز هشتم',
        summary:
          'جواب معادله زمانی گرما ($T(t) = C e^{-\\alpha^2 \\lambda t}$)، جواب‌های نمایی معادلات دیفرانسیل، هسته تبدیل فوریه ($e^{-i\\alpha x}$) و ساده‌سازی‌های لگاریتم طبیعی در تمام بخش‌های درس تکرار می‌شوند؛ تسلط بر قواعد توان، قواعد لگاریتم، مشتق و انتگرال، و حل معادلات نمایی-لگاریتمی با بررسی دامنه شرط انجام صحیح این محاسبات است.',
        keyFormulas: [
          {
            label: '۱. قواعد توان نمایی (پایه $e$)',
            formula:
              'e^{a} e^{b} = e^{a+b} \\quad , \\quad \\frac{e^{a}}{e^{b}} = e^{a-b} \\quad , \\quad \\big(e^{a}\\big)^{b} = e^{ab} \\quad , \\quad e^{-a} = \\frac{1}{e^{a}} \\quad , \\quad e^{0} = 1',
            note: 'به ازای $a > 0$ و $x \\to \\infty$ داریم $e^{-ax} \\to 0$؛ همین میرایی، صفر شدن حد کران‌دار در انتگرال‌های ناسره و فروپاشی دما در $e^{-\\alpha^2\\lambda t}$ ($\\lambda > 0$) را توضیح می‌دهد.',
          },
          {
            label: '۲. قواعد لگاریتم طبیعی و وارون بودن $e^x$ و $\\ln x$',
            formula:
              '\\ln(ab) = \\ln a + \\ln b \\quad , \\quad \\ln\\frac{a}{b} = \\ln a - \\ln b \\quad , \\quad \\ln a^{b} = b\\,\\ln a \\quad , \\quad \\ln 1 = 0 \\quad , \\quad \\ln e = 1',
            note: 'توابع $e^{(\\cdot)}$ و $\\ln$ وارون یکدیگرند: $e^{\\ln x} = x$ به ازای $x > 0$ و $\\ln(e^{x}) = x$ به ازای هر $x$ حقیقی. دامنه $\\ln x$ فقط اعداد مثبت است؛ برای عبارت‌هایی با علامت نامعلوم از $\\ln|x|$ استفاده می‌شود.',
          },
          {
            label: '۳. مشتق و انتگرال پایه توابع نمایی و لگاریتمی',
            formula:
              '\\frac{d}{dx} e^{ax} = a\\,e^{ax} \\quad , \\quad \\int e^{ax}\\,dx = \\frac{e^{ax}}{a} + C \\quad (a \\neq 0) \\quad , \\quad \\frac{d}{dx}\\ln x = \\frac{1}{x} \\quad , \\quad \\int \\frac{dx}{x} = \\ln|x| + C',
            note: 'قدر مطلق در $\\int \\frac{dx}{x}$ حیاتی است؛ در انتگرال جزء‌به‌جزء وقتی عامل لگاریتمی داریم، طبق LIATE انتخاب $u = \\ln x$ با مشتق ساده $\\frac{1}{x}$ انجام می‌شود.',
          },
          {
            label: '۴. حل معادلات نمایی و لگاریتمی با بررسی دامنه',
            formula:
              'e^{2x+1} = 5 \\implies 2x + 1 = \\ln 5 \\implies x = \\frac{\\ln 5 - 1}{2} \\qquad , \\qquad \\ln(x-1) + \\ln(x+2) = \\ln 6 \\implies (x-1)(x+2) = 6 \\implies x = \\frac{-1 + \\sqrt{33}}{2}',
            note: 'در معادله لگاریتمی، جواب دوم معادله درجه دوم یعنی $\\frac{-1-\\sqrt{33}}{2}$ به دلیل نقض دامنه ($x - 1 < 0$) یک ریشه اضافی (Extraneous) است و باید حذف شود؛ گرفتن $\\ln$ از دو طرف معادله نمایی همیشه مجاز است چون $e^{(\\cdot)} > 0$.',
          },
        ],
        conceptualPoints: [
          'رفتار حدی: $\\lim_{x \\to +\\infty} e^{-ax} = 0$ به ازای $a > 0$ اما $e^{-x}$ در $x \\to -\\infty$ بی‌کران رشد می‌کند؛ همچنین رشد $\\ln x$ بسیار کندتر از هر توان مثبت $x^{\\epsilon}$ است.',
          'هر عدد مثبت را می‌توان پایه نمایی نوشت: $b = e^{\\ln b}$؛ مثال کاربردی در معادله گرما: زمان نصف‌شدن دما از $e^{-\\alpha^2\\lambda t_{1/2}} = \\frac{1}{2}$ به دست می‌آید: $t_{1/2} = \\frac{\\ln 2}{\\alpha^2 \\lambda}$.',
          'در هسته تبدیل فوریه با قرارداد درس $e^{-i\\alpha x}$ داریم $|e^{-i\\alpha x}| = 1$ (فاز، بدون میرایی)؛ اما نماهای حقیقی $e^{\\pm ax}$ نقش رشد/میرایی دارند؛ این دو نقش نباید با هم اشتباه گرفته شوند.',
          'دام‌های رایج: ساده‌سازی غلط $\\ln(a+b) = \\ln a + \\ln b$، فراموش کردن قدر مطلق در $\\int \\frac{dx}{x}$ و نادیده گرفتن دامنه هنگام حل معادلات لگاریتمی (ریشه اضافی).',
        ],
      },
      {
        id: 'p0_equation_roots',
        title: 'گرفتن و بررسی ریشه معادلات: جبری، مثلثاتی، نمایی و تأیید جواب',
        pdfPages: 'پیش‌نیاز نهم',
        summary:
          'قلب مسئله اشتورم-لیوویل این است که پس از اعمال شرایط مرزی، معادله‌ای مانند $\\sin(pL) = 0$ یا $\\cos(pL) = 0$ برای پارامتر $p$ حل شود و از ریشه‌های آن، مقادیر مشخصه $\\lambda_n$ ساخته شود. «گرفتن ریشه» یعنی یافتن دقیق جواب‌ها با تجزیه عوامل، فرمول درجه دوم یا معلومات دایره مثلثاتی و «بررسی ریشه» یعنی تأیید با جایگذاری، کنترل دامنه و حذف ریشه‌های اضافی.',
        keyFormulas: [
          {
            label: '۱. ریشه‌های معادلات مثلثاتی پایه (منبع مقادیر مشخصه)',
            formula:
              '\\sin\\theta = 0 \\iff \\theta = n\\pi \\qquad , \\qquad \\cos\\theta = 0 \\iff \\theta = \\frac{(2n-1)\\pi}{2} \\qquad , \\qquad \\tan\\theta = 0 \\iff \\theta = n\\pi \\quad (n \\in \\mathbb{Z})',
            note: 'به ازای $\\theta = pL$: شرط $\\sin(pL) = 0$ داده $p = \\frac{n\\pi}{L}$ می‌دهد و شرط $\\cos(pL) = 0$ داده $p = \\frac{(2n-1)\\pi}{2L}$؛ انتخاب بین این دو، تفاوت شرایط مرزی دیریکله و نویمن در مقادیر مشخصه است.',
          },
          {
            label: '۲. گرفتن ریشه با تجزیه عوامل و فرمول درجه دوم',
            formula:
              'x^2 - 5x + 6 = (x-2)(x-3) = 0 \\implies x = 2 \\; , \\; x = 3 \\qquad , \\qquad ax^2 + bx + c = 0 \\implies x = \\frac{-b \\pm \\sqrt{\\Delta}}{2a}',
            note: 'برای چندجمله‌ای‌های کامل‌تر، آزمایش ریشه‌های گویا و تجزیه متوالی عوامل به کار می‌رود؛ تحلیل کامل دلتا در پیش‌نیاز دهم آمده است. تأیید با جایگذاری: $2^2 - 5(2) + 6 = 0$ است.',
          },
          {
            label: '۳. بررسی ریشه: تأیید با جایگذاری و ریشه‌های ناممکن',
            formula:
              'e^{rx} = 0 \\; \\text{هیچ ریشه‌ای ندارد} \\qquad , \\qquad \\sinh(px) = 0 \\iff px = 0 \\iff x = 0 \\qquad , \\qquad \\cosh(px) = 0 \\; \\text{ریشه حقیقی ندارد}',
            note: 'در حالت $\\lambda = -p^2 < 0$، دقیقاً همین نبودِ ریشه برای $\\sinh(pL) = 0$ و $\\cosh(pL) = 0$ است که جواب غیربدیهی را ناممکن می‌کند؛ چون $\\cosh(pL) \\ge 1$ و $\\sinh(pL) > 0$ به ازای $pL > 0$.',
          },
        ],
        conceptualPoints: [
          'هر ریشه به‌دست‌آمده باید با جایگذاری در معادله اصلی تأیید شود؛ در معادلات لگاریتمی یا رادیکالی ممکن است جواب ظاهری (ریشه اضافی) ظاهر شود که در دامنه معادله نامعتبر است.',
          'تقارن زوج/فرد معادله، ریشه‌ها را متقارن می‌کند: اگر $r$ ریشه $r^2 + \\lambda = 0$ باشد، $-r$ نیز ریشه است؛ به همین دلیل جواب‌ها به شکل زوج $\\pm p$ یا $\\pm ip$ ظاهر می‌شوند.',
          'برای معادلات گذرندها (Transcendental) مانند $\\tan x = x$ که حل دقیق ندارند، قضیه مقدار میانی به کار می‌رود: اگر $g$ پیوسته باشد و $g(a)\\,g(b) < 0$، حداقل یک ریشه در $(a, b)$ وجود دارد؛ این روش بررسی علامت، در معادلات مقادیر مشخصه با شرایط مرزی ترکیبی ضروری است.',
          'هنگام گرفتن ریشه از طریق تقسیم دو طرف معادله بر یک عبارت، مطمئن شو آن عبارت هرگز صفر نمی‌شود: تقسیم بر $e^{rx} \\neq 0$ مجاز است، اما تقسیم بر $\\sin(px)$ ریشه‌های $px = n\\pi$ را از بین می‌برد (به‌جای تقسیم، فاکتور بگیر).',
        ],
      },
      {
        id: 'p0_discriminant',
        title: 'محاسبه دلتا ($\\Delta = b^2 - 4ac$) و تحلیل نوع ریشه معادله درجه دوم',
        pdfPages: 'پیش‌نیاز دهم',
        summary:
          'معادله مشخصه هر معادله دیفرانسیل خطی مرتبه دوم با ضرایب ثابت یک معادله درجه دوم است؛ علامت دلتا ($\\Delta = b^2 - 4ac$) تعیین می‌کند معادله ریشه حقیقی متمایز، مضاعف یا مختلط مزدوج داشته باشد و در نتیجه جواب ODE هیپربولیک، خطی یا نوسانی (سینوسی-کسینوسی) شود — این دقیقاً همان سه حالت $\\lambda$ در حل معادله مشخصه $r^2 + \\lambda = 0$ است.',
        keyFormulas: [
          {
            label: '۱. تعریف دلتا و سه حالت ریشه',
            formula:
              '\\Delta = b^2 - 4ac \\quad , \\quad x_{1,2} = \\frac{-b \\pm \\sqrt{\\Delta}}{2a} \\implies \\begin{cases} \\Delta > 0: \\; \\text{دو ریشه حقیقی متمایز} \\\\ \\Delta = 0: \\; \\text{ریشه مضاعف } x_0 = -\\frac{b}{2a} \\\\ \\Delta < 0: \\; \\text{دو ریشه مختلط مزدوج} \\end{cases}',
            note: 'در حالت $\\Delta < 0$ ریشه‌ها برابر $x = -\\frac{b}{2a} \\pm i\\,\\frac{\\sqrt{|\\Delta|}}{2a}$ هستند؛ دلتای منفی به معنای «بی‌جوابی» نیست، به معنای ریشه‌های مختلط است (ضرایب حقیقی همیشه ریشه‌های مختلط مزدوج می‌دهند).',
          },
          {
            label: '۲. بازسازی سه حالت معادله مشخصه $r^2 + \\lambda = 0$ با دلتا',
            formula:
              'a = 1 \\; , \\; b = 0 \\; , \\; c = \\lambda \\implies \\Delta = -4\\lambda \\implies \\begin{cases} \\lambda < 0: \\; \\Delta > 0 \\implies r = \\pm\\sqrt{-\\lambda} = \\pm p \\; \\text{(هیپربولیک)} \\\\ \\lambda = 0: \\; \\Delta = 0 \\implies r_1 = r_2 = 0 \\; \\text{(مضاعف)} \\\\ \\lambda > 0: \\; \\Delta < 0 \\implies r = \\pm i\\sqrt{\\lambda} \\; \\text{(نوسانی)} \\end{cases}',
            note: 'این جدول، پل مستقیم بین جبر دلتا و سه حالت جواب $A\\cosh(px) + B\\sinh(px)$، $A + Bx$ و $A\\cos(px) + B\\sin(px)$ در پیش‌نیاز چهارم است.',
          },
          {
            label: '۳. روابط ریشه‌ها (قضیه ویت) و مثال عددی کامل',
            formula:
              'x_1 + x_2 = -\\frac{b}{a} \\quad , \\quad x_1\\,x_2 = \\frac{c}{a} \\qquad \\text{مثال: } 2r^2 - 4r + 10 = 0 \\implies \\Delta = 16 - 80 = -64 < 0 \\implies r = \\frac{4 \\pm 8i}{4} = 1 \\pm 2i',
            note: 'کنترل با ویت: جمع ریشه‌ها $2 = -\\frac{-4}{2}$ و حاصل‌ضرب $(1+2i)(1-2i) = 5 = \\frac{10}{2}$ است. اگر $\\Delta$ مربع کامل باشد، ریشه‌ها گویا هستند و تجزیه عوامل ساده انجام می‌شود.',
          },
        ],
        conceptualPoints: [
          'دلتا یک «ابزار تصمیم» است نه جواب نهایی: ابتدا علامت دلتا را حساب کن تا نوع جواب عمومی ODE مشخص شود — ریشه‌های حقیقی متمایز $r_1 \\neq r_2$ داده $c_1 e^{r_1 x} + c_2 e^{r_2 x}$، ریشه مضاعف $r_0$ داده $(c_1 + c_2 x)e^{r_0 x}$ و ریشه‌های مختلط $\\alpha \\pm i\\beta$ داده $e^{\\alpha x}\\big(A\\cos(\\beta x) + B\\sin(\\beta x)\\big)$ می‌دهند.',
          'برای معادله کامل میرایی-نوسانی $A y\'\' + B y\' + C y = 0$ با $\\Delta < 0$، ریشه‌ها $\\alpha \\pm i\\beta$ با $\\alpha = -\\frac{B}{2A}$ و $\\beta = \\frac{\\sqrt{|\\Delta|}}{2A}$ هستند؛ عامل $e^{\\alpha t}$ میرایی و $\\beta$ فرکانس نوسان را می‌سازد.',
          'دام‌های رایج: فراموش کردن مخرج $2a$، اشتباه در علامت $b$ (در $r^2 - 4r + 10$ مقدار $-b = +4$ است) و نوشتن $\\sqrt{\\Delta}$ برای $\\Delta < 0$ به‌جای $\\sqrt{|\\Delta|}$ یا معادل آن $\\sqrt{4ac - b^2}$.',
        ],
      },
      {
        id: 'p0_partial_fractions',
        title: 'تجزیه به کسرهای جزئی (Partial Fractions): چهار حالت، روش پوشان و انتگرال‌های استاندارد',
        pdfPages: 'پیش‌نیاز یازدهم',
        summary:
          'هرگاه انتگرال‌گیری جزء‌به‌جزء به کسری با مخرج چندجمله‌ای برخورد کند (ضرایب فوریه توابع گویا، جواب معادلات انتگرالی در بخش ۴ مانند مثال ۳۶، و حل معادلات دیفرانسیل خطی)، تنها راه سیستماتیک، تجزیه کسر به جمع کسرهای ساده‌ی قابل انتگرال‌گیری است. تسلط بر چهار حالت مخرج، روش پوشان (Cover-Up) و انتگرال‌های استاندارد پس از تجزیه، این انتگرال‌ها را بدون هیچ حدس زدنی حل می‌کند.',
        keyFormulas: [
          {
            label: '۱. قالب کلی تجزیه بر اساس چهار حالت مخرج',
            formula:
              '\\begin{aligned} &\\text{حالت ۱ (عوامل خطی متمایز): } \\frac{P(x)}{(x-a_1)(x-a_2)} = \\frac{A_1}{x-a_1} + \\frac{A_2}{x-a_2} \\\\ &\\text{حالت ۲ (عامل خطی تکراری): } \\frac{P(x)}{(x-a)^n} = \\frac{A_1}{x-a} + \\frac{A_2}{(x-a)^2} + \\cdots + \\frac{A_n}{(x-a)^n} \\\\ &\\text{حالت ۳ (درجه دو متمایز): } \\frac{P(x)}{q_1\\,q_2} = \\frac{B_1x+C_1}{q_1} + \\frac{B_2x+C_2}{q_2} \\\\ &\\text{حالت ۴ (درجه دو تکراری): } \\frac{P(x)}{q^n} = \\frac{B_1x+C_1}{q} + \\cdots + \\frac{B_nx+C_n}{q^n} \\end{aligned}',
            note: 'در حالت‌های ۳ و ۴، $q = ax^2 + bx + c$ یک مقدار درجه دو تجزیه‌ناپذیر است یعنی دلتای آن منفی است ($\\Delta = b^2 - 4ac < 0$، مطابق پیش‌نیاز دهم) و صورت هر جمله باید کامل خطی ($Bx + C$) باشد. پیش‌شرط همه حالت‌ها: درجه صورت کمتر از درجه مخرج باشد؛ در غیر این صورت ابتدا تقسیم چندجمله‌ای انجام می‌شود.',
          },
          {
            label: '۲. روش پوشان (Heaviside Cover-Up) برای عوامل خطی متمایز',
            formula:
              '\\frac{1}{(x-1)(x+2)} = \\frac{A}{x-1} + \\frac{B}{x+2} \\implies A = \\left. \\frac{1}{x+2} \\right|_{x=1} = \\frac{1}{3} \\quad , \\quad B = \\left. \\frac{1}{x-1} \\right|_{x=-2} = -\\frac{1}{3}',
            note: 'برای یافتن $A$، عامل $(x-1)$ را «می‌پوشانیم» و در ریشه آن یعنی $x=1$ مقدار می‌گیریم. این روش فقط برای عوامل خطی متمایز (و بالاترین توان یک عامل تکراری) کار می‌کند؛ برای مقدارهای درجه دو تجزیه‌ناپذیر قابل استفاده نیست چون صورت آن‌ها شامل $x$ است.',
          },
          {
            label: '۳. حالت ترکیبی: عامل خطی + درجه دو تجزیه‌ناپذیر (مبنای معادلات انتگرالی)',
            formula:
              '\\frac{1}{(x-1)(x^2+1)} = \\frac{A}{x-1} + \\frac{Bx+C}{x^2+1} \\implies 1 = A(x^2+1) + (Bx+C)(x-1) \\implies A = \\frac{1}{2} \\; , \\; B = C = -\\frac{1}{2}',
            note: 'مقایسه ضرایب: $A + B = 0$، $C - B = 0$ و $A - C = 1$. راه سریع‌تر: پوشان برای $A = \\left.\\frac{1}{x^2+1}\\right|_{x=1} = \\frac{1}{2}$، سپس جایگذاری عدد راحت $x = 0$: $-1 = -A + C \\implies C = -\\frac{1}{2}$ و $x = 2$: $\\frac{1}{5} = \\frac{A}{1} + \\frac{2B+C}{5} \\implies B = -\\frac{1}{2}$.',
          },
          {
            label: '۴. جعبه‌ابزار انتگرال‌های استاندارد پس از تجزیه',
            formula:
              '\\int \\frac{dx}{x-a} = \\ln|x-a| + C \\quad , \\quad \\int \\frac{dx}{(x-a)^2} = -\\frac{1}{x-a} + C \\quad , \\quad \\int \\frac{2x\\,dx}{x^2+a^2} = \\ln(x^2+a^2) + C \\quad , \\quad \\int \\frac{dx}{x^2+a^2} = \\frac{1}{a}\\arctan\\frac{x}{a} + C',
            note: 'دو حالت پرتکرار دیگر: $\\int \\frac{dx}{x^2 - a^2} = \\frac{1}{2a}\\ln\\left| \\frac{x-a}{x+a} \\right| + C$ و با مربع کامل $\\int \\frac{dx}{x^2+2x+5} = \\int \\frac{dx}{(x+1)^2+4} = \\frac{1}{2}\\arctan\\frac{x+1}{2} + C$.',
          },
        ],
        conceptualPoints: [
          'کسر نامناسب (درجه صورت بزرگ‌تر یا مساوی مخرج) را هرگز مستقیماً تجزیه نکنید؛ ابتدا تقسیم چندجمله‌ای: $\\frac{x^2+1}{x^2-1} = 1 + \\frac{2}{x^2-1} = 1 + \\frac{1}{x-1} - \\frac{1}{x+1}$.',
          'در این درس، تجزیه به کسرهای جزئی دقیقاً همان ابزاری است که در مثال ۳۶ بخش ۴ (معادله انتگرالی کانولوشن) عبارت $\\frac{2(1+\\alpha^2)}{4+\\alpha^2}$ را به $2 - \\frac{6}{4+\\alpha^2}$ تبدیل می‌کند؛ ترفند «نوشتن صورت بر حسب مخرج» ($1 + \\alpha^2 = (4+\\alpha^2) - 3$) یک تجزیه ذهنی بدون نوشتن دستگاه است.',
          'قبل از شروع انتگرال‌گیری، تجزیه را کنترل کنید: کسرها را دوباره جمع کنید یا یک عدد راحت (مثل $x = 0$ یا $x = 2$) در دو طرف جایگذاری کنید؛ چند ثانیه کنترل، از یک انتگرال کامل غلط نجات می‌دهد.',
          'دام‌های رایج: حذف توان‌های میانی عامل تکراری (باید همه توان‌ها از $1$ تا $n$ بیایند)، استفاده از پوشان برای مقدار درجه دو تجزیه‌ناپذیر، فراموش کردن قدر مطلق در $\\ln|x-a|$ و گم کردن ضریب $\\frac{1}{2a}$ در تجزیه $\\frac{1}{x^2-a^2}$.',
        ],
      },
    ],
    workedExamples: [
      {
        id: 'ex_prereq_1',
        pdfReference: 'مثال پایه ۱ (پیش‌نیاز سری فوریه)',
        title: 'محاسبه کامل و گام‌به‌گام انتگرال دو مرحله‌ای $\\int_{-\\pi}^{\\pi} x^2 \\cos(nx)\\,dx$ با جزء‌به‌جزء و جدول DI',
        difficulty: 'پایه (مفهومی)',
        problemStatement:
          'مقدار دقیق انتگرال $\\int_{-\\pi}^{\\pi} x^2 \\cos(nx)\\,dx$ را به ازای عدد صحیح $n \\ge 1$ با نوشتن کامل تمام مراحل تقارن، انتگرال‌گیری جزء‌به‌جزء دو مرحله‌ای و جایگذاری حدود محاسبه کنید.',
        problemFormula: 'I_n = \\int_{-\\pi}^{\\pi} x^2 \\cos(nx)\\,dx \\quad (n \\in \\mathbb{N})',
        finalAnswerFormula: 'I_n = \\frac{4\\pi (-1)^n}{n^2}',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: بررسی تقارن انتگرال‌ده روی بازه متقارن $[-\\pi, \\pi]$',
            explanation:
              'ابتدا زوج یا فرد بودن تابع زیر انتگرال $g(x) = x^2 \\cos(nx)$ را بررسی می‌کنیم. چون $x^2$ زوج است و $\\cos(nx)$ نیز زوج است، حاصل‌ضرب دو تابع زوج یک تابع زوج می‌باشد:',
            formula:
              'g(-x) = (-x)^2 \\cos(-nx) = x^2 \\cos(nx) = g(x) \\implies I_n = 2 \\int_{0}^{\\pi} x^2 \\cos(nx)\\,dx',
            whyHint: 'تبدیل بازه $[-\\pi, \\pi]$ به $2\\int_0^\\pi$ باعث می‌شود حد پایین انتگرال $x=0$ شود که محاسبات جایگذاری را بسیار ساده‌تر و ایمن‌تر می‌کند.',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: اجرای مرحله اول انتگرال‌گیری جزء‌به‌جزء ($\\int u_1\\,dv_1$)',
            explanation:
              'قرار می‌دهیم $u_1 = x^2$ (در نتیجه $du_1 = 2x\\,dx$) و $dv_1 = \\cos(nx)\\,dx$ (در نتیجه $v_1 = \\frac{\\sin(nx)}{n}$) و در فرمول $\\int u_1\\,dv_1 = u_1 v_1 - \\int v_1\\,du_1$ جایگذاری می‌کنیم:',
            formula:
              'I_n = 2 \\left( \\left[ x^2 \\frac{\\sin(nx)}{n} \\right]_{0}^{\\pi} - \\int_{0}^{\\pi} \\frac{\\sin(nx)}{n} (2x\\,dx) \\right)',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: جایگذاری حدود در جمله اول و ساده‌سازی انتگرال باقی‌مانده',
            explanation:
              'در جمله براکت اول، به ازای حد بالا $x=\\pi$ داریم $\\pi^2 \\frac{\\sin(n\\pi)}{n} = 0$ و به ازای حد پایین $x=0$ داریم $0^2 \\frac{\\sin(0)}{n} = 0$. بنابراین براکت اول کاملاً صفر می‌شود:',
            formula:
              'I_n = 2 \\left( (0 - 0) - \\frac{2}{n} \\int_{0}^{\\pi} x \\sin(nx)\\,dx \\right) = -\\frac{4}{n} \\int_{0}^{\\pi} x \\sin(nx)\\,dx',
            whyHint: 'توجه کنید که ضریب $-\\frac{2}{n}$ در عدد $2$ بیرون پرانتز ضرب شده و ضریب $-\\frac{4}{n}$ را می‌سازد.',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: اجرای مرحله دوم انتگرال‌گیری جزء‌به‌جزء برای $\\int_0^\\pi x\\sin(nx)\\,dx$',
            explanation:
              'اکنون برای انتگرال جدید قرار می‌دهیم $u_2 = x \\implies du_2 = dx$ و $dv_2 = \\sin(nx)\\,dx \\implies v_2 = -\\frac{\\cos(nx)}{n}$:',
            formula:
              '\\int_{0}^{\\pi} x \\sin(nx)\\,dx = \\left[ -\\frac{x \\cos(nx)}{n} \\right]_{0}^{\\pi} - \\int_{0}^{\\pi} \\left( -\\frac{\\cos(nx)}{n} \\right)dx = \\left( -\\frac{\\pi \\cos(n\\pi)}{n} - 0 \\right) + \\left[ \\frac{\\sin(nx)}{n^2} \\right]_{0}^{\\pi}',
          },
          {
            stepNumber: 5,
            title: 'گام ۵: جایگذاری $\\cos(n\\pi) = (-1)^n$ و استخراج جواب نهایی',
            explanation:
              'چون $\\sin(n\\pi) = 0$ و $\\sin(0) = 0$ است، جمله دوم صفر شده و حاصل $\\int_0^\\pi x\\sin(nx)\\,dx = -\\frac{\\pi(-1)^n}{n}$ می‌شود. با قرار دادن آن در رابطه گام ۳ داریم:',
            formula:
              'I_n = -\\frac{4}{n} \\left( -\\frac{\\pi (-1)^n}{n} \\right) = \\frac{4\\pi (-1)^n}{n^2}',
            highlightNote: 'این نتیجه دقیقاً نشان می‌دهد چرا ضریب کسینوسی سری فوریه تابع $f(x) = x^2$ در بازه $[-\\pi, \\pi]$ برابر $a_n = \\frac{1}{\\pi} I_n = \\frac{4(-1)^n}{n^2}$ است.',
          },
          {
            stepNumber: 6,
            title: 'گام ۶: جمع‌بندی با روش جزء‌به‌جزء جدولی (Tabular DI Method) در یک نگاه',
            explanation:
              'به‌جای دو بار نوشتن فرمول جزء‌به‌جزء، جدول ۴ سطری DI را تشکیل می‌دهیم: در ستون $D$ از $x^2$ متوالیاً مشتق می‌گیریم تا به $0$ برسیم و در ستون $I$ از $\\cos(nx)$ متوالیاً انتگرال می‌گیریم. سپس هر سطر $k$ از ستون $D$ را با علامت متناوب $(+,-,+,-)$ به صورت قُطری ($\\searrow$) در سطر $k+1$ از ستون $I$ ضرب می‌کنیم:',
            formula:
              '\\begin{aligned} \\text{قطر اول } (D_1 \\searrow I_2): &\\quad (+x^2)\\left(\\frac{\\sin(nx)}{n}\\right) = +\\frac{x^2\\sin(nx)}{n} \\\\ \\text{قطر دوم } (D_2 \\searrow I_3): &\\quad (-2x)\\left(-\\frac{\\cos(nx)}{n^2}\\right) = +\\frac{2x\\cos(nx)}{n^2} \\\\ \\text{قطر سوم } (D_3 \\searrow I_4): &\\quad (+2)\\left(-\\frac{\\sin(nx)}{n^3}\\right) = -\\frac{2\\sin(nx)}{n^3} \\\\ \\text{سطر چهارم افقی } (D_4 \\leftarrow I_4): &\\quad -\\int (0)\\left(-\\frac{\\sin(nx)}{n^3}\\right)dx = 0 \\end{aligned}',
            whyHint: 'دقت کنید که عنصر اول ستون انتگرال یعنی $I_1 = \\cos(nx)$ در هیچ قطری ضرب نمی‌شود، زیرا خودِ $dv$ است و انتگرال اول آن ($v_1 = \\frac{\\sin(nx)}{n}$) در سطر دوم قرار دارد!',
          },
        ],
      },
      {
        id: 'ex_prereq_2',
        pdfReference: 'مثال پایه ۲ (پیش‌نیاز انتگرال و تبدیل فوریه)',
        title: 'اثبات کامل فرمول انتگرال بازگشتی $\\int_{0}^{\\infty} e^{-ax}\\cos(\\alpha x)\\,dx = \\frac{a}{a^2+\\alpha^2}$',
        difficulty: 'متوسط (امتحانی)',
        problemStatement:
          'به ازای ثابت مثبت $a > 0$ و عدد حقیقی $\\alpha$، با استفاده از دو بار انتگرال‌گیری جزء‌به‌جزء (روش انتگرال بازگشتی) ثابت کنید $\\int_{0}^{\\infty} e^{-ax}\\cos(\\alpha x)\\,dx = \\frac{a}{a^2+\\alpha^2}$.',
        problemFormula: 'I = \\int_{0}^{\\infty} e^{-ax}\\cos(\\alpha x)\\,dx \\quad (a > 0)',
        finalAnswerFormula: 'I = \\frac{a}{a^2 + \\alpha^2}',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: مرحله اول انتگرال‌گیری جزء‌به‌جزء',
            explanation:
              'انتگرال مورد نظر را $I$ می‌نامیم. قرار می‌دهیم $u = \\cos(\\alpha x) \\implies du = -\\alpha \\sin(\\alpha x)\\,dx$ و $dv = e^{-ax}\\,dx \\implies v = -\\frac{1}{a}e^{-ax}$:',
            formula:
              'I = \\left[ -\\frac{1}{a} e^{-ax} \\cos(\\alpha x) \\right]_{0}^{\\infty} - \\int_{0}^{\\infty} \\left(-\\frac{1}{a}e^{-ax}\\right)\\big(-\\alpha \\sin(\\alpha x)\\,dx\\big)',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: محاسبه دقیق حد در بی‌نهایت ($x \\to \\infty$) و در صفر ($x = 0$)',
            explanation:
              'چون $a > 0$ است، وقتی $x \\to \\infty$ داریم $e^{-ax} \\to 0$ و چون $|\\cos(\\alpha x)| \\le 1$ کران‌دار است، حد در $\\infty$ صفر می‌شود. در $x = 0$ نیز $e^0 \\cos(0) = 1 \\times 1 = 1$ است:',
            formula:
              '\\left[ -\\frac{1}{a} e^{-ax} \\cos(\\alpha x) \\right]_{0}^{\\infty} = 0 - \\left( -\\frac{1}{a}(1)(1) \\right) = \\frac{1}{a} \\implies I = \\frac{1}{a} - \\frac{\\alpha}{a} \\int_{0}^{\\infty} e^{-ax}\\sin(\\alpha x)\\,dx',
            whyHint: 'دقت کنید که سه علامت منفی در انتگرال سمت راست در هم ضرب شده و علامت کلی منفی ($-\\frac{\\alpha}{a}$) می‌سازند.',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: مرحله دوم انتگرال‌گیری جزء‌به‌جزء برای انتگرال سینوسی',
            explanation:
              'برای انتگرال $J = \\int_{0}^{\\infty} e^{-ax}\\sin(\\alpha x)\\,dx$ مجدداً قرار می‌دهیم $u = \\sin(\\alpha x) \\implies du = \\alpha\\cos(\\alpha x)\\,dx$ و $dv = e^{-ax}\\,dx \\implies v = -\\frac{1}{a}e^{-ax}$:',
            formula:
              'J = \\left[ -\\frac{1}{a} e^{-ax} \\sin(\\alpha x) \\right]_{0}^{\\infty} - \\int_{0}^{\\infty} \\left(-\\frac{1}{a}e^{-ax}\\right)\\big(\\alpha \\cos(\\alpha x)\\,dx\\big) = (0 - 0) + \\frac{\\alpha}{a} \\underbrace{\\int_{0}^{\\infty} e^{-ax}\\cos(\\alpha x)\\,dx}_{I} = \\frac{\\alpha}{a} I',
            whyHint: 'در براکت اول، هم در $x \\to \\infty$ (به خاطر $e^{-ax} \\to 0$) و هم در $x = 0$ (به خاطر $\\sin(0) = 0$) مقدار عبارت صفر است!',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: جایگذاری $J = \\frac{\\alpha}{a} I$ در رابطه گام ۲ و تشکیل معادله جبری برحسب $I$',
            explanation:
              'عبارت به دست آمده برای $J$ را در معادله گام ۲ قرار می‌دهیم تا انتگرال به خودش بازگردد:',
            formula:
              'I = \\frac{1}{a} - \\frac{\\alpha}{a} \\left( \\frac{\\alpha}{a} I \\right) \\implies I = \\frac{1}{a} - \\frac{\\alpha^2}{a^2} I',
          },
          {
            stepNumber: 5,
            title: 'گام ۵: حل معادله خطی برحسب $I$ و مخرج مشترک گرفتن',
            explanation:
              'جمله حاوی $I$ را به طرف چپ منتقل کرده، مخرج مشترک $a^2$ می‌گیریم و طرفین را ساده می‌کنیم:',
            formula:
              'I \\left( 1 + \\frac{\\alpha^2}{a^2} \\right) = \\frac{1}{a} \\implies I \\left( \\frac{a^2 + \\alpha^2}{a^2} \\right) = \\frac{1}{a} \\implies I = \\frac{a}{a^2 + \\alpha^2} \\quad , \\quad J = \\frac{\\alpha}{a} I = \\frac{\\alpha}{a^2 + \\alpha^2}',
            highlightNote: 'با یک بار حل این مسئله، هم انتگرال کسینوسی $I = \\frac{a}{a^2+\\alpha^2}$ و هم انتگرال سینوسی $J = \\frac{\\alpha}{a^2+\\alpha^2}$ به طور هم‌زمان اثبات شدند.',
          },
        ],
      },
      {
        id: 'ex_prereq_3',
        pdfReference: 'مثال پایه ۳ (پیش‌نیاز اشتورم-لیوویل و معادله گرما)',
        title: 'تحلیل کامل سه حالت معادله مشخصه $X\'\'(x) + \\lambda X(x) = 0$ با شرایط مرزی $X(0)=0, X(L)=0$',
        difficulty: 'متوسط (امتحانی)',
        problemStatement:
          'معادله دیفرانسیل مرتبه دوم $X\'\'(x) + \\lambda X(x) = 0$ را در بازه $[0, L]$ با شرایط مرزی همگن $X(0) = 0$ و $X(L) = 0$ در هر سه حالت $\\lambda < 0$، $\\lambda = 0$ و $\\lambda > 0$ به طور کامل حل کنید.',
        problemFormula: 'X\'\'(x) + \\lambda X(x) = 0 \\quad , \\quad X(0) = 0 \\; , \\; X(L) = 0',
        finalAnswerFormula: '\\lambda_n = \\left(\\frac{n\\pi}{L}\\right)^2 \\quad , \\quad X_n(x) = B_n \\sin\\left(\\frac{n\\pi x}{L}\\right) \\quad (n = 1, 2, 3, \\dots)',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: تشکیل معادله مشخصه با قرار دادن $X(x) = e^{rx}$',
            explanation:
              'برای حل معادله دیفرانسیل خطی همگن با ضرایب ثابت، جواب آزمایشی $X(x) = e^{rx}$ را جایگذاری کرده و بر $e^{rx} \\neq 0$ تقسیم می‌کنیم:',
            formula:
              'r^2 e^{rx} + \\lambda e^{rx} = 0 \\implies r^2 + \\lambda = 0 \\implies r^2 = -\\lambda',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: بررسی حالت اول $\\lambda < 0$ (قرار دادن $\\lambda = -p^2$ با $p > 0$)',
            explanation:
              'وقتی $\\lambda$ منفی باشد، $r^2 = p^2 > 0$ دارای دو ریشه حقیقی متمایز $r = \\pm p$ است و جواب عمومی برحسب توابع هیپربولیک نوشته می‌شود:',
            formula:
              '\\begin{aligned} X(x) &= A \\cosh(px) + B \\sinh(px) \\\\ X(0) = 0 &\\implies A\\underbrace{\\cosh(0)}_{1} + B\\underbrace{\\sinh(0)}_{0} = 0 \\implies A = 0 \\\\ X(L) = 0 &\\implies B \\sinh(pL) = 0 \\xrightarrow{pL > 0 \\implies \\sinh(pL) \\neq 0} B = 0 \\end{aligned}',
            whyHint: 'چون $A = 0$ و $B = 0$ شد، در حالت $\\lambda < 0$ فقط جواب بدیهی $X(x) = 0$ به دست می‌آید.',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: بررسی حالت دوم $\\lambda = 0$ (ریشه مضاعف $r_1 = r_2 = 0$)',
            explanation:
              'به ازای $\\lambda = 0$ معادله به صورت $X\'\'(x) = 0$ است که با دو بار انتگرال‌گیری مستقیم جواب خطی $X(x) = A + Bx$ می‌دهد:',
            formula:
              '\\begin{aligned} X(0) = 0 &\\implies A + B(0) = 0 \\implies A = 0 \\\\ X(L) = 0 &\\implies 0 + B(L) = 0 \\xrightarrow{L > 0} B = 0 \\implies X(x) = 0 \\end{aligned}',
            whyHint: 'بنابراین $\\lambda = 0$ نیز برای شرایط مرزی دیریکله $X(0)=X(L)=0$ جواب غیربدیهی ندارد.',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: بررسی حالت سوم $\\lambda > 0$ (قرار دادن $\\lambda = p^2$ با $p > 0$)',
            explanation:
              'به ازای $\\lambda = p^2 > 0$، معادله مشخصه $r^2 + p^2 = 0$ دارای دو ریشه مزدوج مختلط $r = \\pm ip$ است و جواب عمومی مثلثاتی است:',
            formula:
              '\\begin{aligned} X(x) &= A \\cos(px) + B \\sin(px) \\\\ X(0) = 0 &\\implies A\\cos(0) + B\\sin(0) = 0 \\implies A(1) + 0 = 0 \\implies A = 0 \\\\ X(L) = 0 &\\implies B \\sin(pL) = 0 \\end{aligned}',
          },
          {
            stepNumber: 5,
            title: 'گام ۵: استخراج ریشه‌های غیربدیهی $\\sin(pL) = 0$ و مقادیر ویژه $\\lambda_n$',
            explanation:
              'برای داشتن جواب غیرصفر باید $B \\neq 0$ باشد؛ بنابراین باید $\\sin(pL) = 0$ شود که طبق دایره مثلثاتی به معنای مضرب صحیحی از $\\pi$ بودن کمان است:',
            formula:
              'pL = n\\pi \\implies p_n = \\frac{n\\pi}{L} \\implies \\lambda_n = p_n^2 = \\left(\\frac{n\\pi}{L}\\right)^2 \\quad , \\quad X_n(x) = \\sin\\left(\\frac{n\\pi x}{L}\\right) \\quad (n = 1, 2, 3, \\dots)',
            highlightNote: 'این ۵ گام پایه ثابت تمام مسائل اشتورم-لیوویل (بخش ۵) و جداسازی متغیرها در معادله گرما (بخش ۶) است.',
          },
        ],
      },
      {
        id: 'ex_prereq_4',
        pdfReference: 'مثال پایه ۴ (پیش‌نیاز تقارن و ضرایب فوریه)',
        title: 'محاسبه $\\int_{-\\pi}^{\\pi} x \\sin(nx)\\,dx$ با ترکیب تقارن زوج/فرد و انتگرال‌گیری جزء‌به‌جزء',
        difficulty: 'پایه (مفهومی)',
        problemStatement:
          'مقدار دقیق انتگرال $\\int_{-\\pi}^{\\pi} x \\sin(nx)\\,dx$ را به ازای عدد صحیح $n \\ge 1$ با بررسی کامل تقارن انتگرال‌ده، اجرای انتگرال‌گیری جزء‌به‌جزء و جایگذاری صریح حدود محاسبه کنید و نتیجه را با ضریب سینوسی سری فوریه تابع $f(x) = x$ مقایسه کنید.',
        problemFormula: 'I_n = \\int_{-\\pi}^{\\pi} x \\sin(nx)\\,dx \\quad (n \\in \\mathbb{N})',
        finalAnswerFormula: 'I_n = \\frac{2\\pi (-1)^{n+1}}{n}',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: بررسی تقارن انتگرال‌ده روی بازه متقارن $[-\\pi, \\pi]$',
            explanation:
              'تابع $f(x) = x$ فرد است و $\\sin(nx)$ نیز فرد است؛ طبق جدول ضرب زوج و فرد، حاصل‌ضرب دو تابع فرد یک تابع زوج می‌شود. پس انتگرال روی بازه متقارن برابر دو برابر انتگرال روی نیم‌بازه مثبت است:',
            formula:
              'g(-x) = (-x)\\sin(-nx) = (-x)(-\\sin(nx)) = x\\sin(nx) = g(x) \\implies I_n = 2 \\int_{0}^{\\pi} x \\sin(nx)\\,dx',
            whyHint: 'همین یک سطر، کل انتگرال روی نیم‌بازه منفی را حذف می‌کند و جایگذاری حدود را فقط روی $[0, \\pi]$ ساده و ایمن می‌سازد.',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: انتگرال‌گیری جزء‌به‌جزء برای $\\int_0^\\pi x \\sin(nx)\\,dx$',
            explanation:
              'طبق قاعده LIATE چندجمله‌ای $x$ را به عنوان $u$ انتخاب می‌کنیم: $u = x \\implies du = dx$ و $dv = \\sin(nx)\\,dx \\implies v = -\\frac{\\cos(nx)}{n}$:',
            formula:
              '\\int_{0}^{\\pi} x \\sin(nx)\\,dx = \\left[ -\\frac{x \\cos(nx)}{n} \\right]_{0}^{\\pi} + \\frac{1}{n} \\int_{0}^{\\pi} \\cos(nx)\\,dx',
            whyHint: 'مشتق $x$ برابر $1$ است پس انتگرال باقی‌مانده از درجه سینوسی به کسینوسیِ ساده افت می‌کند؛ یک مرحله کافی است.',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: جایگذاری حدود در جمله براکت اول',
            explanation:
              'در حد بالا $x = \\pi$ داریم $-\\frac{\\pi \\cos(n\\pi)}{n} = -\\frac{\\pi (-1)^n}{n}$ و در حد پایین $x = 0$ داریم $-\\frac{0 \\cdot \\cos(0)}{n} = 0$؛ پس براکت برابر $\\frac{\\pi (-1)^{n+1}}{n}$ می‌شود:',
            formula:
              '\\left[ -\\frac{x \\cos(nx)}{n} \\right]_{0}^{\\pi} = -\\frac{\\pi (-1)^n}{n} - 0 = \\frac{\\pi (-1)^{n+1}}{n}',
            whyHint: 'دقت در علامت: منفیِ $\\cos(n\\pi) = (-1)^n$ عامل $(-1)^{n+1}$ می‌سازد؛ اینجا محل اصلی خطاهای علامتی در امتحان است.',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: محاسبه انتگرال کسینوسی باقی‌مانده',
            explanation:
              'انتگرال باقی‌مانده مستقیم محاسبه می‌شود و چون $\\sin(n\\pi) = \\sin(0) = 0$، حاصل آن صفر است:',
            formula:
              '\\frac{1}{n} \\int_{0}^{\\pi} \\cos(nx)\\,dx = \\left[ \\frac{\\sin(nx)}{n^2} \\right]_{0}^{\\pi} = \\frac{\\sin(n\\pi) - \\sin(0)}{n^2} = 0',
          },
          {
            stepNumber: 5,
            title: 'گام ۵: ترکیب نتایج و پیوند با ضریب فوریه $b_n$',
            explanation:
              'جمع نتایج گام ۳ و ۴ در گام ۱ جواب نهایی را می‌سازد؛ این مقدار دقیقاً مبنای ضریب سینوسی سری فوریه تابع $f(x) = x$ است که $b_n = \\frac{2(-1)^{n+1}}{n}$ می‌دهد:',
            formula:
              'I_n = 2 \\left( \\frac{\\pi (-1)^{n+1}}{n} + 0 \\right) = \\frac{2\\pi (-1)^{n+1}}{n} \\quad , \\quad b_n = \\frac{1}{\\pi} I_n = \\frac{2(-1)^{n+1}}{n}',
            highlightNote: 'کنترل صحت برای $n = 1$: انتگرال $\\int_{-\\pi}^{\\pi} x \\sin(x)\\,dx = 2\\pi > 0$ است که با شکل مثبت نمودار $x\\sin x$ در $[0, \\pi]$ سازگار است.',
          },
        ],
      },
      {
        id: 'ex_prereq_5',
        pdfReference: 'مثال پایه ۵ (پیش‌نیاز انتگرال کسرهای گویا)',
        title: 'محاسبه کامل $\\int \\frac{dx}{(x-1)(x^2+1)}$ با تجزیه به کسرهای جزئی (عامل خطی + درجه دو تجزیه‌ناپذیر)',
        difficulty: 'متوسط (امتحانی)',
        problemStatement:
          'انتگرال نامعین $\\int \\frac{dx}{(x-1)(x^2+1)}\\,dx$ را با تجزیه به کسرهای جزئی به طور کامل حل کنید؛ ضرایب را هم با دستگاه مقایسه ضرایب و هم با روش پوشان و مقدارهای راحت بیابید و در انتها درستی جواب را با مشتق‌گیری مجدد بررسی کنید.',
        problemFormula: 'I = \\int \\frac{dx}{(x-1)(x^2+1)}',
        finalAnswerFormula: 'I = \\frac{1}{2}\\ln|x-1| - \\frac{1}{4}\\ln(x^2+1) - \\frac{1}{2}\\arctan x + C',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: تشخیص قالب تجزیه بر اساس نوع عوامل مخرج',
            explanation:
              'مخرج دو عامل دارد: عامل خطی متمایز $(x-1)$ و مقدار درجه دو تجزیه‌ناپذیر $(x^2+1)$ چون دلتای آن $\\Delta = -4 < 0$ است. طبق قالب حالت ترکیبی، جمله عامل خطی صورت ثابت و جمله درجه دو صورت کامل خطی می‌گیرد:',
            formula:
              '\\frac{1}{(x-1)(x^2+1)} = \\frac{A}{x-1} + \\frac{Bx+C}{x^2+1}',
            whyHint: 'از آنجا که $x^2+1$ هیچ ریشه حقیقی ندارد، روش پوشان روی آن کار نمی‌کند؛ برای این جمله باید ضرایب $B$ و $C$ را با دستگاه یا مقدارهای راحت پیدا کنیم.',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: تعیین ضرایب با پوشان، مقایسه ضرایب و مقدارهای راحت',
            explanation:
              'در دو طرف معادله در مخرج مشترک $(x-1)(x^2+1)$ ضرب می‌کنیم تا هویت $1 = A(x^2+1) + (Bx+C)(x-1)$ به دست آید. مقایسه ضرایب $x^2$، $x$ و ثابت دستگاه $A+B = 0$، $C-B = 0$ و $A-C = 1$ می‌سازد. راه سریع‌تر: پوشان برای $A$ و سپس جایگذاری عدد راحت $x=0$ و $x=2$:',
            formula:
              'A = \\left. \\frac{1}{x^2+1} \\right|_{x=1} = \\frac{1}{2} \\quad ; \\quad x = 0 \\implies -1 = -A + C \\implies C = -\\frac{1}{2} \\quad ; \\quad x = 2 \\implies \\frac{1}{5} = \\frac{A}{1} + \\frac{2B+C}{5} \\implies B = -\\frac{1}{2}',
            whyHint: 'کنترل با مقایسه ضرایب: $A + B = \\frac{1}{2} - \\frac{1}{2} = 0$ و $A - C = \\frac{1}{2} + \\frac{1}{2} = 1$ است؛ تجزیه تأیید می‌شود.',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: انتگرال‌گیری قطعه به قطعه با جعبه‌ابزار استاندارد',
            explanation:
              'با جایگذاری تجزیه $\\frac{1}{2}\\frac{1}{x-1} - \\frac{1}{2}\\frac{x+1}{x^2+1}$، انتگرال به سه قطعه استاندارد شکسته می‌شود: جمله لگاریتمی، جمله $\\frac{x}{x^2+1}$ (با تغییر متغیر $u = x^2+1$) و جمله آرکتانژانت:',
            formula:
              'I = \\frac{1}{2}\\int \\frac{dx}{x-1} - \\frac{1}{2}\\int \\frac{x\\,dx}{x^2+1} - \\frac{1}{2}\\int \\frac{dx}{x^2+1} = \\frac{1}{2}\\ln|x-1| - \\frac{1}{4}\\ln(x^2+1) - \\frac{1}{2}\\arctan x + C',
            whyHint: 'دقت کنید که $\\int \\frac{x\\,dx}{x^2+1} = \\frac{1}{2}\\ln(x^2+1)$ است (نصف، نه یک!) و چون $x^2+1$ همیشه مثبت است، قدر مطلق نمی‌گیرد.',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: بررسی درستی جواب با مشتق‌گیری مجدد',
            explanation:
              'از جواب نهایی مشتق می‌گیریم؛ باید دقیقاً انتگرال‌ده اولیه به دست آید. با ساده‌سازی روی مخرج مشترک $(x-1)(x^2+1)$:',
            formula:
              '\\frac{dI}{dx} = \\frac{1}{2(x-1)} - \\frac{x}{2(x^2+1)} - \\frac{1}{2(x^2+1)} = \\frac{x^2+1 - x(x-1) - (x-1)}{2(x-1)(x^2+1)} = \\frac{2}{2(x-1)(x^2+1)} = \\frac{1}{(x-1)(x^2+1)}',
            highlightNote: 'بررسی با مشتق‌گیری (یا جمع دوباره کسرها) کوتاه‌ترین راه اطمینان از صحت ضرایب است؛ در امتحان این کنترل چند ثانیه بیشتر وقت نمی‌گیرد.',
          },
        ],
      },
      {
        id: 'ex_prereq_6',
        pdfReference: 'مثال پایه ۶ (پیش‌نیاز عامل خطی تکراری)',
        title: 'محاسبه $\\int \\frac{dx}{x(x+1)^2}$ با تجزیه به کسرهای جزئی در حالت عامل خطی تکراری',
        difficulty: 'متوسط (امتحانی)',
        problemStatement:
          'انتگرال نامعین $\\int \\frac{dx}{x(x+1)^2}\\,dx$ را با تجزیه به کسرهای جزئی حل کنید، نقش «همه توان‌های عامل تکراری» را نشان دهید و درستی جواب را بررسی کنید.',
        problemFormula: 'I = \\int \\frac{dx}{x(x+1)^2}',
        finalAnswerFormula: 'I = \\ln|x| - \\ln|x+1| + \\frac{1}{x+1} + C',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: نوشتن قالب کامل برای عامل خطی تکراری',
            explanation:
              'عامل $(x+1)$ با توان $2$ تکرار شده است؛ طبق حالت ۲، هر دو توان $1$ و $2$ باید در تجزیه بیایند. عامل $x$ متمایز است و یک جمله می‌گیرد:',
            formula:
              '\\frac{1}{x(x+1)^2} = \\frac{A}{x} + \\frac{B}{x+1} + \\frac{C}{(x+1)^2}',
            whyHint: 'رایج‌ترین خطای این حالت، حذف جمله $\\frac{B}{x+1}$ و نوشتن فقط $\\frac{C}{(x+1)^2}$ است؛ بدون همه توان‌ها دستگاه جواب ندارد.',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: تعیین ضرایب با پوشان و یک مقدار راحت',
            explanation:
              'پوشان روی $x$: $A = \\left.\\frac{1}{(x+1)^2}\\right|_{x=0} = 1$ و پوشان روی $(x+1)^2$ (بالاترین توان): $C = \\left.\\frac{1}{x}\\right|_{x=-1} = -1$. برای $B$ عدد راحت $x = 1$ را در هویت $1 = A(x+1)^2 + Bx(x+1) + Cx$ جایگذاری می‌کنیم:',
            formula:
              'x = 1 \\implies 1 = 4A + 2B + C = 4 + 2B - 1 \\implies 2B = -2 \\implies B = -1',
            whyHint: 'پوشان در عامل تکراری فقط بالاترین توان ($C$) را می‌دهد؛ توان‌های پایین‌تر مثل $B$ باید با جایگذاری عدد راحت یا مقایسه ضرایب پیدا شوند.',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: انتگرال‌گیری سه قطعه استاندارد',
            explanation:
              'با تجزیه تأییدشده $\\frac{1}{x} - \\frac{1}{x+1} - \\frac{1}{(x+1)^2}$، دو قطعه اول لگاریتمی و قطعه سوم از نوع توان دوم با پادمشتق منفی عبارت کسری است:',
            formula:
              'I = \\int \\frac{dx}{x} - \\int \\frac{dx}{x+1} - \\int \\frac{dx}{(x+1)^2} = \\ln|x| - \\ln|x+1| + \\frac{1}{x+1} + C',
            whyHint: 'دقت در علامت قطعه سوم: چون پادمشتق $\\frac{1}{(x-a)^2}$ برابر $-\\frac{1}{x-a}$ است، جمله منفی تجزیه به $+\\frac{1}{x+1}$ می‌رسد.',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: بررسی درستی با مشتق‌گیری مجدد',
            explanation:
              'مشتق جواب برابر انتگرال‌ده اولیه است؛ با مخرج مشترک $x(x+1)^2$:',
            formula:
              '\\frac{dI}{dx} = \\frac{1}{x} - \\frac{1}{x+1} - \\frac{1}{(x+1)^2} = \\frac{(x+1)^2 - x(x+1) - x}{x(x+1)^2} = \\frac{x^2+2x+1 - x^2 - x - x}{x(x+1)^2} = \\frac{1}{x(x+1)^2}',
            highlightNote: 'جمع دو لگاریتم می‌تواند به فرم فشرده $\\ln\\left| \\frac{x}{x+1} \\right| + \\frac{1}{x+1} + C$ هم نوشته شود؛ هر دو فرم صحیح‌اند و فقط ثابت جابه‌جا شده است.',
          },
        ],
      },
    ],
    practiceQuestions: [
      {
        id: 'q1_m0',
        question: 'به ازای هر عدد صحیح $n \\ge 1$، حاصل عبارت $1 - \\cos(n\\pi)$ به ازای $n$های فرد ($n = 2k-1$) برابر چند است؟',
        options: ['0', '1', '2', '(-1)^n'],
        correctIndex: 2,
        explanation:
          'چون $\\cos(n\\pi) = (-1)^n$ است و به ازای اعداد فرد $(-1)^{2k-1} = -1$ می‌باشد، داریم $1 - (-1) = 2$. به ازای $n$های زوج این عبارت برابر $1 - 1 = 0$ است.',
      },
      {
        id: 'q2_m0',
        question: 'در محاسبه انتگرال $\\int x^2 \\sin(nx)\\,dx$ به روش جزء‌به‌جزء، بهترین انتخاب برای $u$ و $dv$ در گام اول کدام است؟',
        options: [
          'u = \\sin(nx) \\; , \\; dv = x^2\\,dx',
          'u = x^2 \\; , \\; dv = \\sin(nx)\\,dx',
          'u = x \\sin(nx) \\; , \\; dv = x\\,dx',
          'u = 1 \\; , \\; dv = x^2 \\sin(nx)\\,dx',
        ],
        correctIndex: 1,
        explanation:
          'طبق قاعده LIATE، چندجمله‌ای $x^2$ را برابر $u$ انتخاب می‌کنیم تا با دو بار مشتق‌گیری متوالی به عدد ثابت و صفر تبدیل شود و از $\\sin(nx)\\,dx$ انتگرال می‌گیریم ($v = -\\frac{\\cos(nx)}{n}$).',
      },
      {
        id: 'q3_m0',
        question: 'جواب عمومی معادله دیفرانسیل $X\'\'(x) - 9 X(x) = 0$ کدام است؟',
        options: [
          'X(x) = A \\cos(3x) + B \\sin(3x)',
          'X(x) = A \\cosh(3x) + B \\sinh(3x)',
          'X(x) = (A + Bx) e^{-3x}',
          'X(x) = A \\cos(9x) + B \\sin(9x)',
        ],
        correctIndex: 1,
        explanation:
          'معادله مشخصه $r^2 - 9 = 0$ دارای دو ریشه حقیقی $r = \\pm 3$ است؛ بنابراین جواب عمومی به صورت $c_1 e^{3x} + c_2 e^{-3x}$ یا معادل هیپربولیک آن $A\\cosh(3x) + B\\sinh(3x)$ نوشته می‌شود.',
      },
      {
        id: 'q4_m0',
        question: 'مقدار انتگرال معین $\\int_{0}^{\\infty} e^{-2x} \\cos(3x)\\,dx$ چقدر است؟',
        options: [
          '\\frac{2}{13}',
          '\\frac{3}{13}',
          '\\frac{2}{5}',
          '\\frac{1}{6}',
        ],
        correctIndex: 0,
        explanation:
          'طبق فرمول استاندارد $\\int_{0}^{\\infty} e^{-ax}\\cos(\\alpha x)\\,dx = \\frac{a}{a^2+\\alpha^2}$، با قرار دادن $a = 2$ و $\\alpha = 3$ داریم $\\frac{2}{2^2 + 3^2} = \\frac{2}{4 + 9} = \\frac{2}{13}$.',
      },
      {
        id: 'q5_m0',
        question: 'اگر $f(x)$ تابعی فرد در بازه $[-\\pi, \\pi]$ باشد، کدام گزینه درباره ضرایب سری فوریه آن درست است؟',
        options: [
          'a_n = 0 و بسط سینوسی',
          'b_n = 0 و بسط کسینوسی',
          'هر دو a_n و b_n صفرند',
          'هیچ‌کدام صفر نمی‌شوند',
        ],
        correctIndex: 0,
        explanation:
          'چون $\\sin(nx)$ فرد است، حاصل‌ضرب $f(x)\\sin(nx)$ (فرد در فرد) زوج می‌شود و $b_n$ می‌تواند غیرصفر باشد؛ اما $f(x)\\cos(nx)$ (فرد در زوج) فرد است و انتگرال آن روی بازه متقارن صفر می‌شود، یعنی $a_n = 0$. پس تابع فرد فقط بسط سینوسی دارد.',
      },
      {
        id: 'q6_m0',
        question: 'حاصل انتگرال $\\int_{-\\pi}^{\\pi} x^3 \\cos(nx)\\,dx$ به ازای عدد صحیح $n \\ge 1$ چقدر است؟',
        options: [
          '\\frac{6(-1)^n}{n^4}',
          '0',
          '\\frac{6\\pi(-1)^n}{n^2}',
          '2\\pi(-1)^{n+1}',
        ],
        correctIndex: 1,
        explanation:
          'تابع $x^3$ فرد است و $\\cos(nx)$ زوج است؛ طبق جدول ضرب زوج و فرد، حاصل‌ضرب $x^3\\cos(nx)$ فرد است و انتگرال هر تابع فرد روی بازه متقارن $[-\\pi, \\pi]$ دقیقاً صفر می‌شود، بدون نیاز به هیچ انتگرال‌گیری جزء‌به‌جزء.',
      },
      {
        id: 'q7_m0',
        question: 'حل معادله نمایی $e^{3x} = 7$ کدام است؟',
        options: [
          'x = 3\\ln 7',
          'x = \\frac{\\ln 7}{3}',
          'x = \\ln\\frac{7}{3}',
          'x = e^{7/3}',
        ],
        correctIndex: 1,
        explanation:
          'از دو طرف لگاریتم طبیعی می‌گیریم (مجاز چون $e^{(\\cdot)} > 0$): $\\ln(e^{3x}) = 3x = \\ln 7$؛ بنابراین $x = \\frac{\\ln 7}{3}$.',
      },
      {
        id: 'q8_m0',
        question: 'برای معادله مشخصه $r^2 + 9 = 0$، مقدار دلتا و نوع ریشه‌ها کدام است؟',
        options: [
          '\\Delta = 36 > 0 ؛ دو ریشه حقیقی r = \\pm 3',
          '\\Delta = -36 < 0 ؛ دو ریشه مختلط r = \\pm 3i',
          '\\Delta = 0 ؛ ریشه مضاعف r = 0',
          '\\Delta = -9 ؛ دو ریشه مختلط r = \\pm 9i',
        ],
        correctIndex: 1,
        explanation:
          'با $a = 1$، $b = 0$ و $c = 9$ داریم $\\Delta = b^2 - 4ac = -36 < 0$ و ریشه‌ها $r = \\frac{0 \\pm \\sqrt{36}\\,i}{2} = \\pm 3i$ هستند؛ جواب نوسانی $A\\cos(3x) + B\\sin(3x)$ می‌دهد که همان حالت $\\lambda = 9 > 0$ در معادله مشخصه $r^2 + \\lambda = 0$ است.',
      },
      {
        id: 'q9_m0',
        question: 'قالب درست تجزیه به کسرهای جزئی برای $\\frac{1}{x(x+1)^2}$ کدام است؟',
        options: [
          '\\frac{A}{x} + \\frac{B}{x+1} + \\frac{C}{(x+1)^2}',
          '\\frac{A}{x} + \\frac{C}{(x+1)^2}',
          '\\frac{A}{x} + \\frac{Bx+C}{x+1}',
          '\\frac{A}{x} + \\frac{B}{x+1}',
        ],
        correctIndex: 0,
        explanation:
          'عامل خطی تکراری $(x+1)^2$ باید همه توان‌های خود از $1$ تا $2$ را در تجزیه بیاورد؛ حذف جمله $\\frac{B}{x+1}$ رایج‌ترین خطای امتحانی است و دستگاه را ناسازگار می‌کند.',
      },
      {
        id: 'q10_m0',
        question: 'در تجزیه $\\frac{1}{(x-1)(x+2)} = \\frac{A}{x-1} + \\frac{B}{x+2}$، مقدار $A$ با روش پوشان چقدر است؟',
        options: ['\\frac{1}{3}', '-\\frac{1}{3}', '1', '3'],
        correctIndex: 0,
        explanation:
          'با پوشاندن عامل $(x-1)$ و مقدارگیری در ریشه آن $x = 1$: $A = \\left.\\frac{1}{x+2}\\right|_{x=1} = \\frac{1}{3}$؛ به طریق مشابه $B = \\left.\\frac{1}{x-1}\\right|_{x=-2} = -\\frac{1}{3}$ است.',
      },
      {
        id: 'q11_m0',
        question: 'حاصل تجزیه $\\frac{1}{x(x^2+1)}$ به کسرهای جزئی کدام است؟',
        options: [
          '\\frac{1}{x} - \\frac{x}{x^2+1}',
          '\\frac{1}{x} + \\frac{1}{x^2+1}',
          '\\frac{1}{x} + \\frac{x}{x^2+1}',
          '\\frac{A}{x} + \\frac{Bx+C}{x^2+1} \\; \\text{با } C = 1',
        ],
        correctIndex: 0,
        explanation:
          'با هویت $1 = A(x^2+1) + (Bx+C)x$: مقایسه ضرایب می‌دهد $A+B = 0$، $C = 0$ و $A = 1$؛ پس $B = -1$ و تجزیه $\\frac{1}{x} - \\frac{x}{x^2+1}$ است. کنترل: $\\frac{x^2+1 - x^2}{x(x^2+1)} = \\frac{1}{x(x^2+1)}$ است.',
      },
      {
        id: 'q12_m0',
        question: 'نتیجه تقسیم و تجزیه کسر نامناسب $\\frac{x^2+1}{x^2-1}$ کدام است؟',
        options: [
          '1 + \\frac{1}{x-1} - \\frac{1}{x+1}',
          '\\frac{1}{x-1} + \\frac{1}{x+1}',
          '1 + \\frac{2}{x^2-1} بدون تجزیه بیشتر (فرم نهایی)',
          'x + \\frac{1}{x-1} - \\frac{1}{x+1}',
        ],
        correctIndex: 0,
        explanation:
          'تقسیم چندجمله‌ای می‌دهد $\\frac{x^2+1}{x^2-1} = 1 + \\frac{2}{x^2-1}$ و چون $\\frac{1}{x^2-1} = \\frac{1}{2}\\left( \\frac{1}{x-1} - \\frac{1}{x+1} \\right)$ است، نتیجه نهایی $1 + \\frac{1}{x-1} - \\frac{1}{x+1}$ می‌شود.',
      },
    ],
  },
  {
    id: 'module_1_definitions',
    shortTitle: '۱. تعاریف و تعامد',
    numberLabel: 'بخش ۱',
    title: 'آنالیز فوریه: تعاریف، تقارن، نُرم و تعامد توابع',
    subtitle: 'انگیزه فیزیکی، توابع زوج و فرد، توابع متناوب، ضرب داخلی، نُرم تابع و مجموعه‌های متعامد',
    pdfPageRange: 'صفحات ۱ تا ۱۵ جزوه',
    simulatorType: 'symmetry_orthogonality',
    layoutComplexity: 'focused_reading',
    subtopics: [
      {
        id: 'm1_motivation',
        title: 'انگیزه تعریف و کاربرد مهندسی',
        pdfPages: 'صفحات ۲ تا ۴',
        summary:
          'پدیده‌های متناوب مانند جریان متناوب برق با فرکانس $60\\text{ Hz}$، امواج صوتی سازهای موسیقی (پیانو و ویولن در فرکانس پایه $440\\text{ Hz}$) و طیف فرکانسی صدای انسان با تجزیه به هماهنگ‌های سینوسی و کسینوسی تحلیل می‌شوند.',
        keyFormulas: [
          {
            label: 'رابطه فرکانس، دوره تناوب و فرکانس زاویه‌ای',
            formula: 'f = \\frac{1}{T} \\quad , \\quad \\omega = \\frac{2\\pi}{T} = 2\\pi f',
            note: 'واحد فرکانس $f$ هرتز ($\\text{Hz}$ یا دور بر ثانیه) و واحد دوره تناوب $T$ ثانیه ($\\text{s}$) است.',
          },
          {
            label: 'طیف هماهنگ‌های صوتی (Harmonics)',
            formula: 'f_n = n \\cdot f_0 \\quad (n = 1, 2, 3, \\dots)',
            note: 'تفاوت طنین صدای پیانو و ویولن در یک نت یکسان ($f_0 = 440\\text{ Hz}$) ناشی از دامنه متفاوت هماهنگ‌های ضرایب صحیح $n f_0$ است.',
          },
        ],
        conceptualPoints: [
          'آنالیز فوریه ابزار اصلی تبدیل سیگنال از حوزه مکان یا زمان ($x$ یا $t$) به حوزه فرکانس ($\\omega$ یا $\\alpha$) است.',
          'هر موج متناوب پیچیده را می‌توان به صورت برهم‌نهی (ترکیب خطی) امواج ساده $\\cos(n\\omega x)$ و $\\sin(n\\omega x)$ نوشت.',
        ],
      },
      {
        id: 'm1_even_odd',
        title: 'تعریف تابع زوج، تابع فرد و اعمال جبری روی توابع',
        pdfPages: 'صفحات ۵ تا ۸',
        summary:
          'شناخت تقارن تابع روی بازه متقارن $[-\\ell, \\ell]$ حجم محاسبات انتگرال‌گیری ضرایب فوریه را به نصف کاهش می‌دهد. همچنین هر تابع دلخواه روی بازه متقارن به صورت یکتا به مجموع یک تابع زوج و یک تابع فرد تجزیه می‌شود.',
        keyFormulas: [
          {
            label: 'شرط تابع زوج و خاصیت انتگرال آن در بازه متقارن $[-\\ell, \\ell]$',
            formula: 'f(-x) = f(x) \\implies \\int_{-\\ell}^{\\ell} f(x)\\,dx = 2 \\int_{0}^{\\ell} f(x)\\,dx',
            note: 'مثال‌های مهم تابع زوج: $x^2$، $\\cos(nx)$، $|x|$، $x\\sin(x)$ و $\\cosh(x)$.',
          },
          {
            label: 'شرط تابع فرد و خاصیت انتگرال آن در بازه متقارن $[-\\ell, \\ell]$',
            formula: 'f(-x) = -f(x) \\implies \\int_{-\\ell}^{\\ell} f(x)\\,dx = 0',
            note: 'مثال‌های مهم تابع فرد: $x$، $x^3$، $\\sin(nx)$، $x^2\\sin(x)$ و $x\\cos(x)$. اگر $f$ فرد و در مبدأ تعریف‌شده باشد، همواره $f(0) = 0$ است.',
          },
          {
            label: 'تجزیه یکتای هر تابع به بخش زوج $f_e(x)$ و بخش فرد $f_o(x)$',
            formula: 'f(x) = f_e(x) + f_o(x) \\quad , \\quad f_e(x) = \\frac{f(x)+f(-x)}{2} \\quad , \\quad f_o(x) = \\frac{f(x)-f(-x)}{2}',
            note: 'حاصل‌ضرب دو تابع هم‌نام ($\\text{زوج}\\times\\text{زوج}$ یا $\\text{فرد}\\times\\text{فرد}$) زوج است و حاصل‌ضرب دو تابع ناهم‌نام ($\\text{زوج}\\times\\text{فرد}$) فرد است.',
          },
        ],
        conceptualPoints: [
          'مشتق تابع زوج، تابعی فرد است ($f\'(-x) = -f\'(x)$) و مشتق تابع فرد، تابعی زوج است.',
          'در بازه متقارن $[-\\ell, \\ell]$، انتگرال هر تابع فرد دقیقاً برابر $0$ است که نیمی از انتگرال‌های سری فوریه را بدون محاسبه صفر می‌کند.',
        ],
      },
      {
        id: 'm1_periodic',
        title: 'تعریف تابع متناوب و نمادهای کاربردی حد چپ و راست',
        pdfPages: 'صفحات ۸ تا ۱۰',
        summary:
          'تابعی که مقادیر آن در فواصل منظم $T > 0$ تکرار می‌شود متناوب نامیده می‌شود. کوچک‌ترین عدد مثبت $T$ دوره تناوب اصلی نام دارد.',
        keyFormulas: [
          {
            label: 'تعریف تابع متناوب با دوره تناوب $T > 0$',
            formula: 'f(x + T) = f(x) \\implies f(x + nT) = f(x) \\quad (\\forall n \\in \\mathbb{Z})',
            note: 'تابع ثابت $f(x) = c$ متناوب است اما دوره تناوب اصلی ندارد.',
          },
          {
            label: 'دوره تناوب توابع مثلثاتی و ترکیب خطی آن‌ها',
            formula: 'T\\big(\\sin(ax)\\big) = T\\big(\\cos(ax)\\big) = \\frac{2\\pi}{|a|} \\quad , \\quad T = \\text{LCM}(T_1, T_2)',
            note: 'اگر نسبت دو دوره تناوب $\\frac{T_1}{T_2} = \\frac{p}{q}$ عددی گویا باشد، مجموع دو تابع نیز متناوب است.',
          },
          {
            label: 'ناوردا بودن انتگرال تابع متناوب در طول یک دوره کامل $T = 2\\ell$',
            formula: '\\int_{a}^{a+2\\ell} f(x)\\,dx = \\int_{0}^{2\\ell} f(x)\\,dx = \\int_{-\\ell}^{\\ell} f(x)\\,dx',
            note: 'مقدار انتگرال روی هر بازه‌ای به طول یک دوره تناوب کامل $2\\ell$ مستقل از نقطه شروع $a$ است.',
          },
        ],
        conceptualPoints: [
          'نماد $f(x_0^+)$ حد راست ($\\lim_{h \\to 0^+} f(x_0+h)$) و $f(x_0^-)$ حد چپ ($\\lim_{h \\to 0^+} f(x_0-h)$) تابع در نقطه پرش $x_0$ را نشان می‌دهد.',
          'تابع تکه‌به‌تکه پیوسته در بازه $[a,b]$ دارای تعداد متناهی نقطه ناپیوستگی بوده و در هر ناپیوستگی حد چپ و راست متناهی دارد.',
        ],
      },
      {
        id: 'm1_norm_orthogonal',
        title: 'تعریف ضرب داخلی، نُرم تابع و مجموعه‌های متعامد',
        pdfPages: 'صفحات ۱۱ تا ۱۵',
        summary:
          'با تعمیم مفهوم ضرب داخلی بردارها به فضای توابع، مفهوم تعامد (Orthogonality) و طول یا نُرم تابع (Norm) تعریف می‌شود که شالوده بسط سری فوریه تعمیم‌یافته است.',
        keyFormulas: [
          {
            label: 'ضرب داخلی دو تابع حقیقی در بازه $[a, b]$',
            formula: '\\langle f, g \\rangle = \\int_{a}^{b} f(x)\\,g(x)\\,dx \\quad , \\quad \\langle f, g \\rangle_p = \\int_{a}^{b} p(x)\\,f(x)\\,g(x)\\,dx',
            note: 'در حالت وزن‌دار (مانند مسئله اشتورم-لیوویل)، تابع مثبت $p(x) > 0$ تابع وزن تعامد نامیده می‌شود.',
          },
          {
            label: 'نُرم (طول) تابع در فضای $L^2[a,b]$',
            formula: '\\|f\\| = \\sqrt{\\langle f, f \\rangle} = \\left( \\int_{a}^{b} \\big(f(x)\\big)^2\\,dx \\right)^{\\frac{1}{2}}',
            note: 'تابع بهنجار (Normalized) تابعی است که نُرم آن برابر $1$ باشد: $\\hat{\\varphi}_n(x) = \\frac{\\varphi_n(x)}{\\|\\varphi_n\\|}$.',
          },
          {
            label: 'شرط تعامد خانواده توابع $\\{\\varphi_n(x)\\}$ و ضرایب فوریه تعمیم‌یافته',
            formula: '\\langle \\varphi_m, \\varphi_n \\rangle = \\int_{a}^{b} \\varphi_m(x)\\,\\varphi_n(x)\\,dx = 0 \\quad (m \\neq n) \\implies c_n = \\frac{\\langle f, \\varphi_n \\rangle}{\\|\\varphi_n\\|^2}',
            note: 'مجموعه مثلثاتی $\\left\\{1, \\cos\\frac{n\\pi x}{\\ell}, \\sin\\frac{n\\pi x}{\\ell}\\right\\}$ روی $[-\\ell, \\ell]$ یک مجموعه متعامد است.',
          },
        ],
        conceptualPoints: [
          'نُرم هر یک از توابع $\\sin\\left(\\frac{n\\pi x}{\\ell}\\right)$ و $\\cos\\left(\\frac{n\\pi x}{\\ell}\\right)$ روی بازه $[-\\ell, \\ell]$ دقیقاً برابر $\\sqrt{\\ell}$ است.',
          'نُرم تابع ثابت $\\varphi_0(x) = 1$ روی بازه $[-\\ell, \\ell]$ برابر $\\|1\\| = \\sqrt{\\int_{-\\ell}^{\\ell} 1^2\\,dx} = \\sqrt{2\\ell}$ است.',
        ],
      },
    ],
    workedExamples: [
      {
        id: 'ex_pdf_1',
        pdfReference: 'مثال ۱ و ۲ جزوه (صفحه ۱۱)',
        title: 'اثبات کامل تعامد و محاسبه نُرم مجموعه توابع مثلثاتی روی بازه $[-\\pi, \\pi]$',
        difficulty: 'پایه (مفهومی)',
        problemStatement:
          'نشان دهید مجموعه توابع $\\{1, \\cos x, \\sin x, \\cos 2x, \\sin 2x, \\dots\\}$ در بازه $[-\\pi, \\pi]$ یک مجموعه متعامد تشکیل می‌دهند و نُرم هر عضو را با محاسبه کامل انتگرال‌ها بیابید.',
        problemFormula: '\\varphi_0(x) = 1 \\; , \\; \\varphi_n(x) = \\cos(nx) \\; , \\; \\psi_n(x) = \\sin(nx) \\quad \\text{on } [-\\pi, \\pi]',
        finalAnswerFormula: '\\|1\\| = \\sqrt{2\\pi} \\quad , \\quad \\|\\cos(nx)\\| = \\|\\sin(nx)\\| = \\sqrt{\\pi} \\quad (n \\ge 1)',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: اثبات تعامد تابع ثابت $1$ با $\\cos(nx)$ و $\\sin(nx)$',
            explanation:
              'ابتدا ضرب داخلی تابع ثابت $\\varphi_0(x) = 1$ را با $\\cos(nx)$ و $\\sin(nx)$ به ازای $n \\ge 1$ محاسبه می‌کنیم و حدود بالا و پایین را جایگذاری می‌نماییم:',
            formula:
              '\\langle 1, \\cos(nx) \\rangle = \\int_{-\\pi}^{\\pi} 1 \\cdot \\cos(nx)\\,dx = \\left[ \\frac{\\sin(nx)}{n} \\right]_{-\\pi}^{\\pi} = \\frac{\\sin(n\\pi) - \\sin(-n\\pi)}{n} = \\frac{0 - 0}{n} = 0',
            whyHint: 'به ازای هر عدد صحیح $n$، مقدار $\\sin(n\\pi) = 0$ است. همچنین برای $\\sin(nx)$ چون تابع فرد است داریم $\\int_{-\\pi}^{\\pi} \\sin(nx)\\,dx = 0$.',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: اثبات تعامد $\\sin(nx)$ و $\\cos(mx)$ به ازای هر $m, n$',
            explanation:
              'برای محاسبه ضرب داخلی $\\langle \\sin(nx), \\cos(mx) \\rangle$، از خاصیت تقارن توابع استفاده می‌کنیم: چون $\\sin(nx)$ فرد و $\\cos(mx)$ زوج است، حاصل‌ضرب آن‌ها $h(x) = \\sin(nx)\\cos(mx)$ تابعی فرد است:',
            formula:
              'h(-x) = \\sin(-nx)\\cos(-mx) = -\\sin(nx)\\cos(mx) = -h(x) \\implies \\int_{-\\pi}^{\\pi} \\sin(nx)\\cos(mx)\\,dx = 0',
            whyHint: 'انتگرال هر تابع فرد روی بازه متقارن $[-\\pi, \\pi]$ بدون نیاز به انتگرال‌گیری برابر صفر است.',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: اثبات تعامد $\\cos(nx)$ و $\\cos(mx)$ به ازای $m \\neq n$',
            explanation:
              'از اتحاد مثلثاتی تبدیل ضرب به جمع $\\cos A \\cos B = \\frac{1}{2}[\\cos(A-B) + \\cos(A+B)]$ استفاده کرده و جمله به جمله انتگرال می‌گیریم:',
            formula:
              '\\int_{-\\pi}^{\\pi} \\cos(nx)\\cos(mx)\\,dx = \\frac{1}{2} \\int_{-\\pi}^{\\pi} \\big[ \\cos((n-m)x) + \\cos((n+m)x) \\big]\\,dx = \\frac{1}{2} \\left[ \\frac{\\sin((n-m)x)}{n-m} + \\frac{\\sin((n+m)x)}{n+m} \\right]_{-\\pi}^{\\pi} = 0',
            whyHint: 'چون $m \\neq n$ است مخرج $n-m \\neq 0$ بوده و در حدود $\\pm\\pi$ سینوس مضرب صحیحی از $\\pi$ برابر صفر می‌شود.',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: محاسبه کامل نُرم تابع ثابت $\\|1\\|$ و نُرم $\\|\\cos(nx)\\|$ (حالت $m = n$)',
            explanation:
              'اکنون برای محاسبه نُرم، حالت $m = n$ را با استفاده از اتحاد کاهش توان $\\cos^2(nx) = \\frac{1 + \\cos(2nx)}{2}$ به طور کامل بسط می‌دهیم:',
            formula:
              '\\|\\cos(nx)\\|^2 = \\int_{-\\pi}^{\\pi} \\cos^2(nx)\\,dx = \\int_{-\\pi}^{\\pi} \\frac{1 + \\cos(2nx)}{2}\\,dx = \\left[ \\frac{x}{2} + \\frac{\\sin(2nx)}{4n} \\right]_{-\\pi}^{\\pi} = \\left(\\frac{\\pi}{2} + 0\\right) - \\left(-\\frac{\\pi}{2} - 0\\right) = \\pi',
          },
          {
            stepNumber: 5,
            title: 'گام ۵: استخراج مقادیر نهایی نُرم با جذر گرفتن',
            explanation:
              'به طریق کاملاً مشابه برای $\\sin^2(nx) = \\frac{1 - \\cos(2nx)}{2}$ نیز حاصل انتگرال برابر $\\pi$ می‌شود و برای تابع ثابت $1$ انتگرال روی $[-\\pi, \\pi]$ برابر $2\\pi$ است:',
            formula:
              '\\|1\\| = \\sqrt{\\int_{-\\pi}^{\\pi} 1^2\\,dx} = \\sqrt{[x]_{-\\pi}^{\\pi}} = \\sqrt{2\\pi} \\quad , \\quad \\|\\cos(nx)\\| = \\|\\sin(nx)\\| = \\sqrt{\\pi}',
            highlightNote: 'این مقادیر نُرم دقیقاً منشأ ضریب $\\frac{1}{\\pi}$ (و $\\frac{1}{\\ell}$ در حالت کلی) در فرمول‌های ضرایب سری فوریه اویلر هستند.',
          },
        ],
      },
      {
        id: 'ex_pdf_4_legendre',
        pdfReference: 'مثال ۴ و ۵ جزوه (صفحه ۱۵ تا ۱۹)',
        title: 'تعامد چندجمله‌ای‌های لژاندر و محاسبه گام‌به‌گام بسط سری فوریه تعمیم‌یافته',
        difficulty: 'متوسط (امتحانی)',
        problemStatement:
          'چندجمله‌ای‌های لژاندر $P_0(x)=1$، $P_1(x)=x$ و $P_2(x)=\\frac{1}{2}(3x^2-1)$ را در بازه $[-1, 1]$ در نظر بگیرید. ابتدا تعامد و نُرم آن‌ها را حساب کنید و سپس سه جمله اول بسط سری فوریه لژاندر تابع پله‌ای $f(x) = \\begin{cases} 0 & -1 < x < 0 \\\\ 1 & 0 < x < 1 \\end{cases}$ را بیابید.',
        problemFormula: 'f(x) = c_0 P_0(x) + c_1 P_1(x) + c_2 P_2(x) + \\dots \\quad , \\quad c_n = \\frac{\\langle f, P_n \\rangle}{\\|P_n\\|^2}',
        finalAnswerFormula: 'f(x) \\simeq \\frac{1}{2} P_0(x) + \\frac{3}{4} P_1(x) + 0 \\cdot P_2(x) = \\frac{1}{2} + \\frac{3}{4}x',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: تحقیق تعامد دو به دوی $P_0, P_1, P_2$ روی $[-1, 1]$',
            explanation:
              'ضرب داخلی هر جفت را با انتگرال‌گیری صریح در بازه $[-1, 1]$ محاسبه می‌کنیم:',
            formula:
              '\\langle P_0, P_2 \\rangle = \\int_{-1}^{1} 1 \\cdot \\frac{1}{2}(3x^2 - 1)\\,dx = \\frac{1}{2} \\Big[ x^3 - x \\Big]_{-1}^{1} = \\frac{1}{2}\\big((1-1) - (-1+1)\\big) = 0',
            whyHint: 'همچنین $\\langle P_0, P_1 \\rangle = \\int_{-1}^1 x\\,dx = 0$ و $\\langle P_1, P_2 \\rangle = \\frac{1}{2}\\int_{-1}^1 (3x^3-x)\\,dx = 0$ چون انتگرال‌ده‌ها توابع فرد هستند.',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: محاسبه کامل مربع نُرم $\\|P_0\\|^2$، $\\|P_1\\|^2$ و $\\|P_2\\|^2$',
            explanation:
              'از هر چندجمله‌ای به توان دو در بازه $[-1, 1]$ انتگرال می‌گیریم (به دلیل زوج بودن توان دوم، انتگرال را $2\\int_0^1$ می‌نویسیم):',
            formula:
              '\\|P_0\\|^2 = \\int_{-1}^{1} 1^2\\,dx = 2 \\; , \\; \\|P_1\\|^2 = 2\\int_{0}^{1} x^2\\,dx = 2\\left[\\frac{x^3}{3}\\right]_0^1 = \\frac{2}{3} \\; , \\; \\|P_2\\|^2 = \\frac{2}{4}\\int_{0}^{1} (9x^4 - 6x^2 + 1)\\,dx = \\frac{1}{2}\\left[\\frac{9}{5} - 2 + 1\\right] = \\frac{2}{5}',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: محاسبه ضریب اول $c_0$ برای تابع دوضابطه‌ای $f(x)$',
            explanation:
              'چون $f(x)$ در بازه $[-1, 0)$ برابر $0$ و در $(0, 1]$ برابر $1$ است، حدود انتگرال صورت از $0$ تا $1$ شکسته می‌شود:',
            formula:
              'c_0 = \\frac{\\langle f, P_0 \\rangle}{\\|P_0\\|^2} = \\frac{\\int_{-1}^{0} 0 \\cdot 1\\,dx + \\int_{0}^{1} 1 \\cdot 1\\,dx}{2} = \\frac{[x]_0^1}{2} = \\frac{1 - 0}{2} = \\frac{1}{2}',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: محاسبه ضریب دوم $c_1$ و ضریب سوم $c_2$',
            explanation:
              'به همین ترتیب ضرب داخلی $\\langle f, P_1 \\rangle$ و $\\langle f, P_2 \\rangle$ را در بازه $[0, 1]$ حساب کرده و بر مربع نُرم‌ها تقسیم می‌کنیم:',
            formula:
              'c_1 = \\frac{\\int_{0}^{1} 1 \\cdot x\\,dx}{\\|P_1\\|^2} = \\frac{\\left[\\frac{x^2}{2}\\right]_0^1}{\\frac{2}{3}} = \\frac{\\frac{1}{2}}{\\frac{2}{3}} = \\frac{3}{4} \\quad , \\quad c_2 = \\frac{\\int_{0}^{1} \\frac{1}{2}(3x^2 - 1)\\,dx}{\\|P_2\\|^2} = \\frac{\\frac{1}{2}[x^3 - x]_0^1}{\\frac{2}{5}} = \\frac{0}{\\frac{2}{5}} = 0',
          },
          {
            stepNumber: 5,
            title: 'گام ۵: جایگذاری ضرایب در بسط سری فوریه تعمیم‌یافته',
            explanation:
              'با قرار دادن ضرایب محاسبه‌شده $c_0 = \\frac{1}{2}$، $c_1 = \\frac{3}{4}$ و $c_2 = 0$ به تقریب چندجمله‌ای بهینه در فضای $L^2[-1,1]$ می‌رسیم:',
            formula:
              'f(x) \\simeq c_0 P_0(x) + c_1 P_1(x) + c_2 P_2(x) = \\frac{1}{2}(1) + \\frac{3}{4}(x) + 0 = \\frac{1}{2} + \\frac{3}{4}x',
            highlightNote: 'در حالت کلی برای چندجمله‌ای لژاندر مرتبه $n$ همیشه رابطه $\\|P_n\\|^2 = \\frac{2}{2n+1}$ برقرار است.',
          },
        ],
      },
    ],
    practiceQuestions: [
      {
        id: 'q1_m1',
        question: 'کدام‌یک از توابع زیر در بازه متقارن $[-\\pi, \\pi]$ یک تابع زوج است؟',
        options: [
          'f(x) = x^2 \\sin(x)',
          'f(x) = x \\sin(x) + \\cos(3x)',
          'f(x) = x^3 + \\cos(x)',
          'f(x) = e^x',
        ],
        correctIndex: 1,
        explanation:
          'در گزینه دوم، $x$ و $\\sin(x)$ هر دو فرد هستند پس حاصل‌ضربشان $x\\sin(x)$ زوج است؛ $\\cos(3x)$ نیز زوج است و مجموع دو تابع زوج، تابعی زوج می‌باشد.',
      },
      {
        id: 'q2_m1',
        question: 'مقدار نُرم تابع $f(x) = \\sin(3x)$ در بازه $[-\\pi, \\pi]$ چقدر است؟',
        options: ['0', '\\sqrt{\\pi}', '\\pi', '\\sqrt{2\\pi}'],
        correctIndex: 1,
        explanation:
          'طبق رابطه $\\|\\sin(nx)\\|^2 = \\int_{-\\pi}^{\\pi} \\sin^2(nx)\\,dx = \\pi$، نُرم تابع برابر $\\sqrt{\\pi}$ است و مستقل از عدد صحیح $n \\neq 0$ می‌باشد.',
      },
      {
        id: 'q3_m1',
        question: 'حاصل انتگرال ضرب داخلی $\\int_{-\\ell}^{\\ell} \\cos\\left(\\frac{3\\pi x}{\\ell}\\right)\\sin\\left(\\frac{3\\pi x}{\\ell}\\right)dx$ چقدر است؟',
        options: ['\\ell', '0', '\\frac{\\ell}{2}', '2\\ell'],
        correctIndex: 1,
        explanation:
          'حاصل‌ضرب یک تابع زوج ($\\cos$) در یک تابع فرد ($\\sin$) تابعی فرد است؛ انتگرال هر تابع فرد در بازه متقارن $[-\\ell, \\ell]$ دقیقاً برابر صفر است (تعامد سینوس و کسینوس بر یکدیگر).',
      },
    ],
  },
  {
    id: 'module_2_fourier_series',
    shortTitle: '۲. سری فوریه',
    numberLabel: 'بخش ۲',
    title: 'سری فوریه و کاربردهای آن (بسط کامل و جامع)',
    subtitle:
      'سری فوریه تعمیم‌یافته، سری مثلثاتی، سینوسی و کسینوسی (توسیع نیم‌دامنه)، اتحاد پارسوال، مشتق و انتگرال جمله‌به‌جمله، بازه دلخواه $[a,b]$ و تکنیک‌های جمع سری‌ها',
    pdfPageRange: 'صفحات ۱۶ تا ۵۶ جزوه',
    simulatorType: 'fourier_series',
    layoutComplexity: 'balanced_split',
    subtopics: [
      {
        id: 'm2_1_generalized_fourier',
        title: '۱. تعریف سری فوریه تعمیم‌یافته بر پایه مجموعه‌های متعامد و تقریب کمترین مربعات',
        pdfPages: 'صفحات ۱۶ تا ۱۸ جزوه',
        summary:
          'پیش از ورود به سری فوریه مثلثاتی، باید بدانیم سری فوریه در واقع تصویر کردن یک تابع $f(x)$ روی یک دستگاه متعامد از توابع پایه $\\{\\varphi_n(x)\\}_{n=1}^{\\infty}$ در فضای ضرب داخلی است؛ دقیقاً مشابه تجزیه یک بردار سه بعدی روی محورهای متعامد $\\hat{i}, \\hat{j}, \\hat{k}$.',
        keyFormulas: [
          {
            label: 'بسط سری فوریه تعمیم‌یافته و استخراج ضرایب $c_n$ از طریق تعامد',
            formula:
              '\\begin{aligned} f(x) &\\simeq \\sum_{n=1}^{\\infty} c_n \\varphi_n(x) \\quad \\xrightarrow{\\text{ضرب داخلی در } \\varphi_m(x)} \\quad \\langle f, \\varphi_m \\rangle = \\sum_{n=1}^{\\infty} c_n \\underbrace{\\langle \\varphi_n, \\varphi_m \\rangle}_{0 \\text{ برای } n \\neq m} = c_m \\|\\varphi_m\\|^2 \\\\ \\implies c_n &= \\frac{\\langle f, \\varphi_n \\rangle}{\\|\\varphi_n\\|^2} = \\frac{\\int_{a}^{b} p(x) f(x) \\varphi_n(x)\\,dx}{\\int_{a}^{b} p(x) \\big(\\varphi_n(x)\\big)^2\\,dx} \\end{aligned}',
            note: 'به دلیل خاصیت تعامد $\\langle \\varphi_n, \\varphi_m \\rangle = 0$ برای $n \\neq m$، در یک جمع بی‌نهایت جمله‌ای تمام جملات به جز جمله $n=m$ حذف می‌شوند و هر ضریب $c_n$ مستقل از سایر ضرایب محاسبه می‌گردد!',
          },
          {
            label: 'قضیه کمترین مربعات (Best Mean-Square Approximation)',
            formula:
              'E_N = \\left\\| f(x) - \\sum_{n=1}^{N} \\alpha_n \\varphi_n(x) \\right\\|^2 = \\int_{a}^{b} p(x)\\left( f(x) - \\sum_{n=1}^{N} \\alpha_n \\varphi_n(x) \\right)^2 dx \\quad \\text{is minimized iff } \\alpha_n = c_n',
            note: 'در میان تمام ترکیب‌های خطی $N$ جمله‌ای از توابع پایه، انتخاب ضرایب فوریه $\\alpha_n = c_n$ خطای میانگین مربعات $E_N$ را به کمترین مقدار ممکن می‌رساند.',
          },
        ],
        conceptualPoints: [
          'چرا تعامد مهم‌ترین مفهوم آنالیز فوریه است؟ اگر پایه $\\{\\varphi_n\\}$ متعامد نبود، برای یافتن $N$ ضریب اول باید یک دستگاه $N$ معادله و $N$ مجهول حل می‌کردیم و با افزودن جمله $(N+1)$-ام تمام ضرایب قبلی تغییر می‌کردند! اما با تعامد، هر ضریب $c_n$ یک بار برای همیشه با یک انتگرال مستقیم به دست می‌آید.',
          'ضریب فوریه $c_n$ نشان‌دهنده میزان «شباهت» یا «هم‌فاز بودن» تابع $f(x)$ با هارمونیک پایه $\\varphi_n(x)$ در بازه $[a, b]$ است.',
        ],
      },
      {
        id: 'm2_2_parseval_general',
        title: '۲. نامساوی بسل، اتحاد پارسوال کلی و مفهوم کامل بودن (Completeness)',
        pdfPages: 'صفحات ۱۸ تا ۱۹ جزوه',
        summary:
          'با بسط دادن نامنفی بودن خطای میانگین مربعات $E_N \\ge 0$، نامساوی بسل و در حد $N \\to \\infty$ اتحاد بنیادی پارسوال (قضیه فیثاغورس در فضای بی‌نهایت‌بُعدی توابع) حاصل می‌شود.',
        keyFormulas: [
          {
            label: 'بسط خطای میانگین مربعات و استخراج نامساوی بسل (Bessel Inequality)',
            formula:
              '\\begin{aligned} 0 \\le E_N &= \\langle f - S_N, f - S_N \\rangle = \\|f\\|^2 - 2\\sum_{n=1}^{N} c_n \\underbrace{\\langle f, \\varphi_n \\rangle}_{c_n \\|\\varphi_n\\|^2} + \\sum_{n=1}^{N} c_n^2 \\|\\varphi_n\\|^2 = \\|f\\|^2 - \\sum_{n=1}^{N} c_n^2 \\|\\varphi_n\\|^2 \\\\ \\implies &\\sum_{n=1}^{\\infty} c_n^2 \\|\\varphi_n\\|^2 \\le \\|f\\|^2 = \\int_{a}^{b} p(x)\\big(f(x)\\big)^2\\,dx \\quad (\\text{نامساوی بسل}) \\end{aligned}',
            note: 'از همگرایی سری سمت چپ در نامساوی بسل نتیجه می‌شود که برای هر تابع با نُرم متناهی، حد جمله عمومی $\\lim_{n \\to \\infty} c_n \\|\\varphi_n\\| = 0$ است (لم ریمان-لبگ).',
          },
          {
            label: 'اتحاد پارسوال کلی (Generalized Parseval Identity)',
            formula:
              '\\lim_{N \\to \\infty} E_N = 0 \\iff \\|f\\|^2 = \\int_{a}^{b} p(x)\\big(f(x)\\big)^2\\,dx = \\sum_{n=1}^{\\infty} c_n^2 \\|\\varphi_n\\|^2',
            note: 'اگر مجموعه متعامد $\\{\\varphi_n\\}$ کامل (Complete) باشد، خطای میانگین مربعات به صفر میل کرده و نامساوی بسل به تساوی پارسوال تبدیل می‌شود.',
          },
        ],
        conceptualPoints: [
          'مفهوم فیزیکی اتحاد پارسوال (پایستگی انرژی): انتگرال مربع تابع در حوزه مکان/زمان بیانگر کل انرژی موج است و سمت راست نشان می‌دهد که این انرژی دقیقاً برابر مجموع انرژی تک‌تک هارمونیک‌های متعامد تشکیل‌دهنده آن است.',
          'یک مجموعه متعامد را «کامل» می‌نامیم هرگاه هیچ تابع غیرصفر تکه‌ای پیوسته‌ای پیدا نشود که بر تمام اعضای مجموعه عمود باشد.',
        ],
      },
      {
        id: 'm2_3_trig_fourier',
        title: '۳. سری فوریه مثلثاتی در $[-\\ell, \\ell]$ و $[-\\pi, \\pi]$، اثبات ضرایب اویلر و قضیه دیریکله',
        pdfPages: 'صفحات ۲۰ تا ۲۷ جزوه',
        summary:
          'مهم‌ترین دستگاه متعامد کامل روی بازه $[-\\ell, \\ell]$، دستگاه مثلثاتی $\\left\\{1, \\cos\\left(\\frac{n\\pi x}{\\ell}\\right), \\sin\\left(\\frac{n\\pi x}{\\ell}\\right)\\right\\}_{n=1}^{\\infty}$ است. هر تابع متناوب با دوره تناوب $T = 2\\ell$ که شرایط دیریکله را داشته باشد، به صورت سری فوریه مثلثاتی بسط داده می‌شود.',
        keyFormulas: [
          {
            label: 'فرم استاندارد سری فوریه مثلثاتی و ۴ جمله اول بازشده آن',
            formula:
              '\\begin{aligned} f(x) &\\simeq \\frac{a_0}{2} + \\sum_{n=1}^{\\infty} \\left[ a_n \\cos\\left(\\frac{n\\pi x}{\\ell}\\right) + b_n \\sin\\left(\\frac{n\\pi x}{\\ell}\\right) \\right] \\\\ &= \\underbrace{\\frac{a_0}{2}}_{\\text{مؤلفه DC (میانگین)}} + \\underbrace{\\left(a_1\\cos\\frac{\\pi x}{\\ell} + b_1\\sin\\frac{\\pi x}{\\ell}\\right)}_{\\text{هارمونیک اول (اصلی } n=1\\text{)}} + \\underbrace{\\left(a_2\\cos\\frac{2\\pi x}{\\ell} + b_2\\sin\\frac{2\\pi x}{\\ell}\\right)}_{\\text{هارمونیک دوم } (n=2)} + \\underbrace{\\left(a_3\\cos\\frac{3\\pi x}{\\ell} + b_3\\sin\\frac{3\\pi x}{\\ell}\\right)}_{\\text{هارمونیک سوم } (n=3)} + \\cdots \\end{aligned}',
            note: 'چرا جمله ثابت را $\\frac{a_0}{2}$ می‌نویسیم؟ زیرا نُرم مربعِ تابع ثابت $\\varphi_0(x)=1$ روی $[-\\ell, \\ell]$ برابر $\\int_{-\\ell}^{\\ell} 1^2 dx = 2\\ell$ است، در حالی که نُرم مربعِ $\\cos(n\\pi x/\\ell)$ برابر $\\ell$ است! نوشتن $\\frac{a_0}{2}$ باعث می‌شود فرمول انتگرالی $a_0$ دقیقاً همان فرمول $a_n$ به ازای $n=0$ (با ضریب $\\frac{1}{\\ell}$) باشد.',
          },
          {
            label: 'اثبات و فرمول‌های ضرایب اویلر ($a_0, a_n, b_n$) در بازه $[-\\ell, \\ell]$ و حالت خاص $[-\\pi, \\pi]$',
            formula:
              '\\begin{aligned} a_0 &= \\frac{1}{\\ell}\\int_{-\\ell}^{\\ell} f(x)\\,dx &&\\xrightarrow{\\ell = \\pi} &&a_0 = \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} f(x)\\,dx \\\\ a_n &= \\frac{1}{\\ell}\\int_{-\\ell}^{\\ell} f(x)\\cos\\left(\\frac{n\\pi x}{\\ell}\\right)dx &&\\xrightarrow{\\ell = \\pi} &&a_n = \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} f(x)\\cos(nx)\\,dx \\quad (n \\ge 1) \\\\ b_n &= \\frac{1}{\\ell}\\int_{-\\ell}^{\\ell} f(x)\\sin\\left(\\frac{n\\pi x}{\\ell}\\right)dx &&\\xrightarrow{\\ell = \\pi} &&b_n = \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} f(x)\\sin(nx)\\,dx \\quad (n \\ge 1) \\end{aligned}',
            note: 'مقدار جمله ثابت $\\frac{a_0}{2} = \\frac{1}{2\\ell}\\int_{-\\ell}^{\\ell} f(x)\\,dx$ دقیقاً برابر «مقدار میانگین» (Average / DC Value) تابع $f(x)$ در یک دوره تناوب کامل است.',
          },
          {
            label: 'قضیه همگرایی نقطه‌ای دیریکله (در نقاط درونی و نقاط مرزی $\\pm\\ell$)',
            formula:
              'S(x_0) = \\begin{cases} f(x_0), & \\text{اگر } f \\text{ در } x_0 \\text{ پیوسته باشد} \\\\ \\; \\dfrac{f(x_0^+) + f(x_0^-)}{2}, & \\text{اگر } x_0 \\in (-\\ell, \\ell) \\text{ نقطه پرش باشد} \\\\ \\; \\dfrac{f(-\\ell^+) + f(\\ell^-)}{2}, & \\text{در نقاط مرزی } x_0 = \\pm\\ell \\end{cases}',
            note: 'دقت کنید که در مرزهای بازه ($x = \\ell$ یا $x = -\\ell$)، به دلیل تناوب تابع، حد راست در $+\\ell$ همان حد راست در ابتداى بازه یعنی $f(-\\ell^+)$ است!',
          },
        ],
        conceptualPoints: [
          'شرایط سه‌گانه دیریکله (شروط کافی همگرایی سری فوریه): ۱) تابع $f(x)$ در یک دوره تناوب کراندار باشد، ۲) تعداد نقاط ناپیوستگی (پرش) آن در یک دوره تناوب متناهی باشد، ۳) تعداد نقاط اکسترمم نسبی (ماکزیمم و مینیمم) آن در یک دوره تناوب متناهی باشد (تکه‌ای هموار بودن).',
          'پدیده گیبس (Gibbs Phenomenon): در همسایگی نقاط ناپیوستگی پرشی (Jump Discontinuity)، مجموع جزئی $S_N(x)$ حتی به ازای $N \\to \\infty$ یک نوسان اضافی (Overshoot) به اندازه حدود $9\\%$ از کل ارتفاع پرش ایجاد می‌کند که عرض آن با افزایش $N$ باریک‌تر می‌شود اما ارتفاعش از بین نمی‌رود.',
        ],
      },
      {
        id: 'm2_4_sine_cosine_halfrange',
        title: '۴. سری فوریه کسینوسی و سینوسی (توابع زوج و فرد) و توسیع‌های نیم‌دامنه روی $[0, \\ell]$',
        pdfPages: 'صفحات ۲۸ تا ۳۵ جزوه',
        summary:
          'بررسی تقارن تابع (زوج یا فرد بودن) پیش از شروع انتگرال‌گیری، حجم محاسبات سری فوریه را به نصف کاهش می‌دهد. همچنین اگر تابعی فقط در نیم‌بازه $[0, \\ell]$ داده شده باشد، می‌توانیم به دلخواه برای آن سری کسینوسی (توسیع زوج) یا سری سینوسی (توسیع فرد) بسازیم.',
        keyFormulas: [
          {
            label: 'سری فوریه کسینوسی (برای تابع زوج روی $[-\\ell, \\ell]$ یا توسیع زوج نیم‌دامنه روی $[0, \\ell]$)',
            formula:
              '\\begin{aligned} f(-x) = f(x) \\implies b_n &= 0 \\quad (\\forall n \\ge 1), \\qquad a_0 = \\frac{2}{\\ell}\\int_{0}^{\\ell} f(x)\\,dx, \\qquad a_n = \\frac{2}{\\ell}\\int_{0}^{\\ell} f(x)\\cos\\left(\\frac{n\\pi x}{\\ell}\\right)dx \\\\ f(x) &\\simeq \\frac{a_0}{2} + \\sum_{n=1}^{\\infty} a_n \\cos\\left(\\frac{n\\pi x}{\\ell}\\right) = \\frac{a_0}{2} + a_1\\cos\\left(\\frac{\\pi x}{\\ell}\\right) + a_2\\cos\\left(\\frac{2\\pi x}{\\ell}\\right) + a_3\\cos\\left(\\frac{3\\pi x}{\\ell}\\right) + \\cdots \\end{aligned}',
            note: 'چرا در توسیع زوج (کسینوسی) تابع حاصل همیشه در $x=0$ و $x=\\pm\\ell$ پیوسته است؟ زیرا بازتاب آینه‌ای نسبت به محور عمودی باعث می‌شود $f_e(0^+)=f_e(0^-)$ و $f_e(-\\ell)=f_e(\\ell)$ باشد؛ لذا سری کسینوسی معمولاً سریع‌تر همگرا می‌شود.',
          },
          {
            label: 'سری فوریه سینوسی (برای تابع فرد روی $[-\\ell, \\ell]$ یا توسیع فرد نیم‌دامنه روی $[0, \\ell]$)',
            formula:
              '\\begin{aligned} f(-x) = -f(x) \\implies a_0 &= 0, \\quad a_n = 0 \\quad (\\forall n \\ge 1), \\qquad b_n = \\frac{2}{\\ell}\\int_{0}^{\\ell} f(x)\\sin\\left(\\frac{n\\pi x}{\\ell}\\right)dx \\\\ f(x) &\\simeq \\sum_{n=1}^{\\infty} b_n \\sin\\left(\\frac{n\\pi x}{\\ell}\\right) = b_1\\sin\\left(\\frac{\\pi x}{\\ell}\\right) + b_2\\sin\\left(\\frac{2\\pi x}{\\ell}\\right) + b_3\\sin\\left(\\frac{3\\pi x}{\\ell}\\right) + \\cdots \\end{aligned}',
            note: 'در سری فوریه سینوسی، در نقاط $x=0$ و $x=\\pm\\ell$ همواره تمامی جملات $\\sin(n\\pi x/\\ell)$ برابر صفر هستند؛ بنابراین سری سینوسی در $x=0$ و $x=\\ell$ همیشه به عدد $0$ همگرا می‌شود (حتی اگر $f(0^+) \\neq 0$ یا $f(\\ell^-) \\neq 0$ باشد!).',
          },
          {
            label: 'تجزیه هر تابع دلخواه به مؤلفه زوج و مؤلفه فرد در $[-\\ell, \\ell]$',
            formula:
              'f(x) = \\underbrace{\\frac{f(x) + f(-x)}{2}}_{f_{\\text{even}}(x) \\;\\to\\; \\frac{a_0}{2} + \\sum a_n\\cos(\\frac{n\\pi x}{\\ell})} + \\underbrace{\\frac{f(x) - f(-x)}{2}}_{f_{\\text{odd}}(x) \\;\\to\\; \\sum b_n\\sin(\\frac{n\\pi x}{\\ell})}',
            note: 'بخش کسینوسی سری فوریه هر تابع، دقیقاً سری فوریه بخش زوج آن ($f_{\\text{even}}$) و بخش سینوسی آن دقیقاً سری فوریه بخش فرد آن ($f_{\\text{odd}}$) است!',
          },
        ],
        conceptualPoints: [
          'کاربرد کلیدی توسیع نیم‌دامنه در PDE (فصل ۶): وقتی دمای اولیه یک میله $u(x,0) = f(x)$ فقط روی بازه فیزیکی $[0, L]$ داده شده است، اگر دو سر میله در دمای صفر باشند ($u(0,t)=u(L,t)=0$) از «سری فوریه سینوسی» استفاده می‌کنیم و اگر دو سر میله عایق باشند ($u_x(0,t)=u_x(L,t)=0$) از «سری فوریه کسینوسی» استفاده می‌کنیم.',
          'تکنیک طلایی برای توابع ترکیبی مثل $f(x) = x^2 + x^3\\cos(x) + 5\\sin(3x)$ در $[-\\pi, \\pi]$: جمله $x^3\\cos(x)$ فرد است پس در $a_n$ نقشی ندارد؛ جمله $x^2$ زوج است پس در $b_n$ نقشی ندارد؛ و جمله $5\\sin(3x)$ خودش یک هارمونیک پایه است که بدون انتگرال‌گیری مستقیماً به $b_3$ مقدار $5$ را اضافه می‌کند!',
        ],
      },
      {
        id: 'm2_5_parseval_trig',
        title: '۵. اتحاد پارسوال برای سری فوریه مثلثاتی، سینوسی و کسینوسی',
        pdfPages: 'صفحات ۳۶ تا ۴۲ جزوه',
        summary:
          'با جایگذاری نُرم‌های دستگاه مثلثاتی ($\\|1\\|^2 = 2\\ell$ و $\\|\\cos\\|^2 = \\|\\sin\\|^2 = \\ell$) در اتحاد پارسوال کلی، فرمول‌های صریح اتحاد پارسوال برای سری مثلثاتی کامل و سری‌های نیم‌دامنه به دست می‌آیند.',
        keyFormulas: [
          {
            label: 'اتحاد پارسوال برای سری فوریه مثلثاتی کامل در بازه $[-\\ell, \\ell]$',
            formula:
              '\\frac{1}{\\ell}\\int_{-\\ell}^{\\ell} \\big(f(x)\\big)^2\\,dx = \\frac{a_0^2}{2} + \\sum_{n=1}^{\\infty} \\left( a_n^2 + b_n^2 \\right)',
            note: 'اثبات: چون $\\int_{-\\ell}^{\\ell} 1^2 dx = 2\\ell$ و ضریب جمله ثابت $\\frac{a_0}{2}$ است، جمله اول برابر $\\frac{1}{\\ell}\\left(\\frac{a_0}{2}\\right)^2 (2\\ell) = \\frac{a_0^2}{2}$ می‌شود.',
          },
          {
            label: 'اتحاد پارسوال برای سری فوریه کسینوسی و سینوسی در نیم‌بازه $[0, \\ell]$',
            formula:
              '\\begin{aligned} \\text{سری کسینوسی (زوج):} \\quad &\\frac{2}{\\ell}\\int_{0}^{\\ell} \\big(f(x)\\big)^2\\,dx = \\frac{a_0^2}{2} + \\sum_{n=1}^{\\infty} a_n^2 \\\\ \\; \\text{سری سینوسی (فرد):} \\quad &\\frac{2}{\\ell}\\int_{0}^{\\ell} \\big(f(x)\\big)^2\\,dx = \\sum_{n=1}^{\\infty} b_n^2 \\end{aligned}',
            note: 'مراقب ضریب $\\frac{2}{\\ell}$ در سمت چپ فرمول نیم‌بازه $[0, \\ell]$ باشید (زیرا $\\int_{-\\ell}^{\\ell} f^2 dx = 2\\int_{0}^{\\ell} f^2 dx$).',
          },
        ],
        conceptualPoints: [
          'قانون تشخیص سریع در امتحان: اگر ضرایب سری فوریه شما شامل $\\frac{1}{n}$ باشد و مجموع $\\sum \\frac{1}{n^2}$ خواسته شود، یا ضرایب شامل $\\frac{1}{n^2}$ باشد و مجموع $\\sum \\frac{1}{n^4}$ خواسته شود (یعنی توان مخرج سریِ خواسته شده ۲ برابر توان ضریب فوریه و با جملات همگی مثبت باشد)، باید از اتحاد پارسوال استفاده کنید.',
          'در مقابل، اگر توان مخرجِ سریِ خواسته شده همان توان ضرایب فوریه باشد (یا سری متناوب با علامت $(-1)^n$ باشد)، کافی است یک نقطه مناسب $x_0$ (معمولاً $x=0$، $x=\\pi$ یا $x=\\pi/2$) در قضیه همگرایی دیریکله قرار دهید.',
        ],
      },
      {
        id: 'm2_6_diff_int_fourier',
        title: '۶. انتگرال‌گیری و مشتق‌گیری جمله‌به‌جمله از سری فوریه و سرعت همگرایی ضرایب',
        pdfPages: 'صفحات ۴۳ تا ۴۹ جزوه',
        summary:
          'انتگرال‌گیری و مشتق‌گیری جمله‌به‌جمله از سری فوریه دو کاربرد حیاتی دارند: اولاً تولید سری فوریه توابع چندجمله‌ای درجه بالاتر (مثل $x^2$ و $x^3$) از روی سری‌های ساده‌تر بدون نیاز به انتگرال جزء‌به‌جزء، و ثانیاً بررسی صحت جواب معادلات دیفرانسیل جزئی.',
        keyFormulas: [
          {
            label: 'قضیه انتگرال‌گیری جمله‌به‌جمله از سری فوریه (همواره مجاز!)',
            formula:
              '\\int_{-\\ell}^{x} f(t)\\,dt = \\frac{a_0}{2}(x + \\ell) + \\sum_{n=1}^{\\infty} \\frac{\\ell}{n\\pi} \\left[ a_n \\sin\\left(\\frac{n\\pi x}{\\ell}\\right) - b_n \\left(\\cos\\left(\\frac{n\\pi x}{\\ell}\\right) - (-1)^n\\right) \\right]',
            note: 'نکته بسیار مهم: انتگرال‌گیری از یک سری فوریه حتی اگر $f(x)$ ناپیوسته باشد همواره مجاز است و سری حاصل یکنواخت همگراست! اما دقت کنید که اگر $a_0 \\neq 0$ باشد، جمله $\\frac{a_0}{2}x$ متناوب نیست و باید خودش با سری فوریه $x$ جایگزین شود.',
          },
          {
            label: 'قضیه مشتق‌گیری جمله‌به‌جمله از سری فوریه (مشروط به پیوستگی مرزی!)',
            formula:
              '\\text{If } f \\text{ is continuous on } [-\\ell, \\ell] \\text{ and } f(-\\ell) = f(\\ell) \\implies f\'(x) \\simeq \\sum_{n=1}^{\\infty} \\frac{n\\pi}{\\ell}\\left[ b_n \\cos\\left(\\frac{n\\pi x}{\\ell}\\right) - a_n \\sin\\left(\\frac{n\\pi x}{\\ell}\\right) \\right]',
            note: 'هشدار امتحانی: اگر شرط مرزی $f(-\\ell) = f(\\ell)$ برقرار نباشد (مثلاً برای $f(x) = x$ در $[-\\pi, \\pi]$ که $f(-\\pi) \\neq f(\\pi)$)، مشتق‌گیری جمله‌به‌جمله مجاز نیست! مثلاً مشتق جمله‌به‌جمله از سری $x = 2\\sum \\frac{(-1)^{n+1}}{n}\\sin(nx)$ عبارت واگرای $2\\sum (-1)^{n+1}\\cos(nx)$ را می‌دهد که به $f\'(x)=1$ همگرا نیست.',
          },
          {
            label: 'فرمول ضرایب فوریه مشتق $f\'(x)$ در حالت وجود پرش مرزی $f(-\\ell) \\neq f(\\ell)$',
            formula:
              'a_n(f\') = \\frac{n\\pi}{\\ell} b_n(f) + \\frac{(-1)^n \\big[f(\\ell^-) - f(-\\ell^+)\\big]}{\\ell}, \\qquad b_n(f\') = -\\frac{n\\pi}{\\ell} a_n(f)',
            note: 'این فرمول عمومی (که از انتگرال‌گیری جزء‌به‌جزء به دست می‌آید) نشان می‌دهد دقیقاً چرا برای مجاز بودن مشتق‌گیری جمله‌به‌جمله باید پرش مرزی $f(\\ell^-) - f(-\\ell^+) = 0$ باشد.',
          },
        ],
        conceptualPoints: [
          'ارتباط هموار بودن تابع با سرعت همگرایی ضرایب فوریه: ۱) اگر $f(x)$ دارای پرش ناپیوستگی باشد (مثل موج مربعی یا دندان‌اره‌ای)، ضرایب از مرتبه $\\mathcal{O}(1/n)$ هستند. ۲) اگر خود $f(x)$ همه‌جا (از جمله در مرزها $f(-\\ell)=f(\\ell)$) پیوسته باشد اما $f\'(x)$ پرش داشته باشد (مثل $|x|$ یا $x^2$)، ضرایب از مرتبه $\\mathcal{O}(1/n^2)$ هستند. ۳) به طور کلی اگر $f, f\', \\dots, f^{(k-1)}$ پیوسته باشند و $f^{(k)}$ پرش داشته باشد، ضرایب با سرعت $\\mathcal{O}(1/n^{k+1})$ به صفر میل می‌کنند.',
        ],
      },
      {
        id: 'm2_7_arbitrary_interval_ab',
        title: '۷. سری فوریه مثلثاتی در بازه نامتقارن دلخواه $[a, b]$',
        pdfPages: 'صفحات ۵۰ تا ۵۴ جزوه',
        summary:
          'اگر تابع $f(x)$ به جای بازه متقارن $[-\\ell, \\ell]$ در یک بازه دلخواه $[a, b]$ تعریف شده باشد، طول کل یک دوره تناوب برابر $T = 2\\ell = b - a$ و نصف طول بازه برابر $\\ell = \\frac{b-a}{2}$ است. ساختار کمان‌های مثلثاتی تغییر نمی‌کند و فقط حدود انتگرال از $a$ تا $b$ قرار می‌گیرد.',
        keyFormulas: [
          {
            label: 'فرمول کامل سری فوریه در بازه دلخواه $[a, b]$ با نیم‌طول $\\ell = \\frac{b - a}{2}$',
            formula:
              '\\begin{aligned} \\ell &= \\frac{b - a}{2}, \\qquad f(x) \\simeq \\frac{a_0}{2} + \\sum_{n=1}^{\\infty} \\left[ a_n \\cos\\left(\\frac{n\\pi x}{\\ell}\\right) + b_n \\sin\\left(\\frac{n\\pi x}{\\ell}\\right) \\right] \\\\ a_0 &= \\frac{1}{\\ell}\\int_{a}^{b} f(x)\\,dx, \\qquad a_n = \\frac{1}{\\ell}\\int_{a}^{b} f(x)\\cos\\left(\\frac{n\\pi x}{\\ell}\\right)dx, \\qquad b_n = \\frac{1}{\\ell}\\int_{a}^{b} f(x)\\sin\\left(\\frac{n\\pi x}{\\ell}\\right)dx \\end{aligned}',
            note: 'حالت بسیار مهم $[0, 2\\pi]$: در بازه $[0, 2\\pi]$ داریم $2\\ell = 2\\pi \\implies \\ell = \\pi$؛ بنابراین کمان‌ها همچنان $\\cos(nx)$ و $\\sin(nx)$ با ضریب $\\frac{1}{\\pi}$ هستند و فقط حدود انتگرال از $0$ تا $2\\pi$ است.',
          },
          {
            label: 'همگرایی دیریکله در نقاط مرزی $x = a$ و $x = b$',
            formula:
              'S(a) = S(b) = \\frac{f(a^+) + f(b^-)}{2}',
            note: 'چون توسیع متناوب تابع با دوره تناوب $2\\ell = b - a$ انتهای بازه ($b$) را به ابتدای بازه بعدی ($a$) متصل می‌کند، در هر دو مرز $x=a$ و $x=b$ سری به میانگین حد راست در $a$ و حد چپ در $b$ همگرا می‌شود.',
          },
        ],
        conceptualPoints: [
          'هشدار بسیار مهم در بازه‌های نامتقارن مثل $[0, 2\\pi]$ یا $[-1, 3]$: هرگز در بازه نامتقارن $[a, b]$ بدون رسم توسیع متناوب روی $[-\\ell, \\ell]$ از قوانین «تابع زوج یا فرد» به صورت چشمی استفاده نکنید! مثلاً $f(x) = x$ روی $[0, 2\\pi]$ پس از تناوب دیگر یک تابع فرد متقارن نسبت به مبدأ نیست و در $x=2\\pi$ پرش دارد (در واقع $a_0 = 2\\pi \\neq 0$ است!).',
        ],
      },
      {
        id: 'm2_8_series_summation_mastery',
        title: '۸. فرم مختلط سری فوریه و جدول استراتژی جامع محاسبه مجموع سری‌های عددی',
        pdfPages: 'صفحات ۵۴ تا ۵۶ جزوه',
        summary:
          'با جایگذاری روابط اویلر $\\cos(\\theta) = \\frac{e^{i\\theta}+e^{-i\\theta}}{2}$ و $\\sin(\\theta) = \\frac{e^{i\\theta}-e^{-i\\theta}}{2i}$، سری فوریه مثلثاتی به فرم فشرده مختلط تبدیل می‌شود که پلی مستقیم به سمت تبدیل فوریه در فصل ۴ است. همچنین در این بخش جدول مرجع تمامی سری‌های عددی استاندارد را جمع‌بندی می‌کنیم.',
        keyFormulas: [
          {
            label: 'فرم نمایی (مختلط) سری فوریه در بازه $[-\\ell, \\ell]$',
            formula:
              'f(x) \\simeq \\sum_{n=-\\infty}^{\\infty} c_n e^{i\\frac{n\\pi x}{\\ell}}, \\qquad c_n = \\frac{1}{2\\ell}\\int_{-\\ell}^{\\ell} f(x) e^{-i\\frac{n\\pi x}{\\ell}}\\,dx',
            note: 'ارتباط ضرایب مختلط با ضرایب مثلثاتی: $c_0 = \\frac{a_0}{2}$، برای $n \\ge 1$ داریم $c_n = \\frac{a_n - i b_n}{2}$ و $c_{-n} = \\frac{a_n + i b_n}{2} = \\overline{c_n}$، و اتحاد پارسوال به فرم زیبای $\\frac{1}{2\\ell}\\int_{-\\ell}^{\\ell} |f(x)|^2 dx = \\sum_{n=-\\infty}^{\\infty} |c_n|^2$ درمی‌آید.',
          },
          {
            label: '۶ سری عددی طلایی مستخرج از سری فوریه و روابط تبدیل زوج/فرد',
            formula:
              '\\begin{aligned} &1)\\; \\sum_{k=1}^{\\infty} \\frac{(-1)^{k-1}}{2k-1} = 1 - \\frac{1}{3} + \\frac{1}{5} - \\frac{1}{7} + \\cdots = \\frac{\\pi}{4} &&\\big(\\text{از موج مربعی یا } f(x)=x \\text{ در } x=\\frac{\\pi}{2}\\big) \\\\ &2)\\; \\sum_{k=1}^{\\infty} \\frac{1}{(2k-1)^2} = 1 + \\frac{1}{9} + \\frac{1}{25} + \\cdots = \\frac{\\pi^2}{8} &&\\big(\\text{از } f(x)=|x| \\text{ در } x=0 \\text{ یا پارسوال موج مربعی}\\big) \\\\ &3)\\; \\sum_{n=1}^{\\infty} \\frac{1}{n^2} = 1 + \\frac{1}{4} + \\frac{1}{9} + \\frac{1}{16} + \\cdots = \\frac{\\pi^2}{6} &&\\big(\\text{از } f(x)=x^2 \\text{ در } x=\\pi \\text{ یا پارسوال } f(x)=x\\big) \\\\ &4)\\; \\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1}}{n^2} = 1 - \\frac{1}{4} + \\frac{1}{9} - \\frac{1}{16} + \\cdots = \\frac{\\pi^2}{12} &&\\big(\\text{از } f(x)=x^2 \\text{ در } x=0\\big) \\\\ &5)\\; \\sum_{k=1}^{\\infty} \\frac{1}{(2k-1)^4} = 1 + \\frac{1}{81} + \\frac{1}{625} + \\cdots = \\frac{\\pi^4}{96} &&\\big(\\text{از اتحاد پارسوال برای } f(x)=|x|\\big) \\\\ &6)\\; \\sum_{n=1}^{\\infty} \\frac{1}{n^4} = 1 + \\frac{1}{16} + \\frac{1}{81} + \\cdots = \\frac{\\pi^4}{90} &&\\big(\\text{از اتحاد پارسوال برای } f(x)=x^2\\big) \\end{aligned}',
            note: 'رابطه جبری طلایی بین کل سری $S = \\sum_{n=1}^{\\infty} \\frac{1}{n^p}$ و جملات فرد $S_{\\text{odd}} = \\sum_{k=1}^{\\infty} \\frac{1}{(2k-1)^p}$: چون جملات زوج برابر $\\sum \\frac{1}{(2k)^p} = \\frac{1}{2^p} S$ هستند، همواره داریم $S = S_{\\text{odd}} + \\frac{1}{2^p} S \\implies S = \\frac{2^p}{2^p - 1} S_{\\text{odd}}$.',
          },
        ],
        conceptualPoints: [
          'چگونه از روی $\\sum_{k=1}^{\\infty} \\frac{1}{(2k-1)^2} = \\frac{\\pi^2}{8}$ سریعاً $\\sum_{n=1}^{\\infty} \\frac{1}{n^2}$ را بیابیم؟ به ازای $p=2$ ضریب تبدیل برابر $\\frac{2^2}{2^2-1} = \\frac{4}{3}$ است، پس $S = \\frac{4}{3} \\times \\frac{\\pi^2}{8} = \\frac{\\pi^2}{6}$. و برای $p=4$ ضریب تبدیل برابر $\\frac{16}{15}$ است، پس $\\sum \\frac{1}{n^4} = \\frac{16}{15} \\times \\frac{\\pi^4}{96} = \\frac{\\pi^4}{90}$!',
        ],
      },
    ],
    workedExamples: [
      {
        id: 'ex_pdf_6',
        pdfReference: 'مثال ۶ جزوه (صفحه ۲۳)',
        title: 'محاسبه کامل سری فوریه تابع دوضابطه‌ای، بسط جملات اول و استخراج $\\sum \\frac{1}{(2k-1)^2} = \\frac{\\pi^2}{8}$ و $\\sum \\frac{1}{n^2} = \\frac{\\pi^2}{6}$',
        difficulty: 'متوسط (امتحانی)',
        problemStatement:
          'سری فوریه تابع $f(x)$ که در $[-\\pi, 0)$ برابر $0$ و در $[0, \\pi)$ برابر $\\pi - x$ است را با انجام کامل تمام انتگرال‌های جزء به جزء بیابید، چند جمله اول سری را به صورت بازشده بنویسید و سپس مجموع سری‌های عددی $\\sum_{k=1}^{\\infty} \\frac{1}{(2k-1)^2}$ و $\\sum_{n=1}^{\\infty} \\frac{1}{n^2}$ را محاسبه کنید.',
        problemFormula: 'f(x) = \\begin{cases} 0 & -\\pi \\le x < 0 \\\\ \\pi - x & 0 \\le x < \\pi \\end{cases} \\quad , \\quad f(x + 2\\pi) = f(x)',
        finalAnswerFormula: 'f(x) \\simeq \\frac{\\pi}{4} + \\sum_{n=1}^{\\infty} \\left[ \\frac{1 - (-1)^n}{n^2 \\pi} \\cos(nx) + \\frac{1}{n} \\sin(nx) \\right] \\; , \\; \\sum_{k=1}^{\\infty} \\frac{1}{(2k-1)^2} = \\frac{\\pi^2}{8}',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: نوشتن فرمول ضرایب در بازه $[-\\pi, \\pi]$ و محاسبه کامل $a_0$',
            explanation:
              'نصف طول بازه برابر $\\ell = \\pi$ است. انتگرال روی $[-\\pi, \\pi]$ به دو بازه $[-\\pi, 0]$ و $[0, \\pi]$ شکسته می‌شود که انتگرال اول صفر است:',
            formula:
              'a_0 = \\frac{1}{\\pi} \\int_{-\\pi}^{\\pi} f(x)\\,dx = \\frac{1}{\\pi} \\left[ \\int_{-\\pi}^{0} 0\\,dx + \\int_{0}^{\\pi} (\\pi - x)\\,dx \\right] = \\frac{1}{\\pi} \\left[ \\pi x - \\frac{x^2}{2} \\right]_{0}^{\\pi} = \\frac{1}{\\pi} \\left( \\pi^2 - \\frac{\\pi^2}{2} - 0 \\right) = \\frac{\\pi}{2}',
            whyHint: 'بنابراین جمله ثابت اول سری فوریه برابر $\\frac{a_0}{2} = \\frac{\\pi / 2}{2} = \\frac{\\pi}{4}$ خواهد بود.',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: تشکیل انتگرال جزء به جزء برای محاسبه ضریب کسینوسی $a_n$',
            explanation:
              'برای محاسبه $a_n = \\frac{1}{\\pi} \\int_{0}^{\\pi} (\\pi - x) \\cos(nx)\\,dx$، متغیرهای انتگرال‌گیری جزء به جزء ($\\int u\\,dv = uv - \\int v\\,du$) را انتخاب می‌کنیم:',
            formula:
              '\\begin{aligned} u &= \\pi - x \\implies du = -dx \\\\ dv &= \\cos(nx)\\,dx \\implies v = \\frac{\\sin(nx)}{n} \\end{aligned} \\implies a_n = \\frac{1}{\\pi} \\left( \\left[ (\\pi - x)\\frac{\\sin(nx)}{n} \\right]_{0}^{\\pi} - \\int_{0}^{\\pi} \\frac{\\sin(nx)}{n}(-dx) \\right)',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: جایگذاری حدود بالا و پایین در $a_n$ و تفکیک $n$ زوج و فرد',
            explanation:
              'جمله اول در هر دو حد $x = \\pi$ (چون $\\pi - \\pi = 0$) و $x = 0$ (چون $\\sin(0) = 0$) برابر صفر می‌شود. انتگرال باقی‌مانده را حساب می‌کنیم:',
            formula:
              'a_n = \\frac{1}{\\pi} \\left[ 0 + \\int_{0}^{\\pi} \\frac{\\sin(nx)}{n}\\,dx \\right] = \\frac{1}{\\pi} \\left[ -\\frac{\\cos(nx)}{n^2} \\right]_{0}^{\\pi} = \\frac{-\\cos(n\\pi) - (-\\cos(0))}{n^2 \\pi} = \\frac{1 - (-1)^n}{n^2 \\pi}',
            whyHint: 'چون $\\cos(n\\pi) = (-1)^n$ و $\\cos(0) = 1$ است؛ به ازای $n = 2k$ داریم $a_{2k} = 0$ و به ازای $n = 2k-1$ داریم $a_{2k-1} = \\frac{2}{(2k-1)^2 \\pi}$.',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: محاسبه کامل ضریب سینوسی $b_n$ با انتگرال‌گیری جزء به جزء',
            explanation:
              'اکنون برای $b_n = \\frac{1}{\\pi} \\int_{0}^{\\pi} (\\pi - x) \\sin(nx)\\,dx$ قرار می‌دهیم $u = \\pi - x$ و $dv = \\sin(nx)\\,dx \\implies v = -\\frac{\\cos(nx)}{n}$:',
            formula:
              'b_n = \\frac{1}{\\pi} \\left( \\left[ -(\\pi - x)\\frac{\\cos(nx)}{n} \\right]_{0}^{\\pi} - \\int_{0}^{\\pi} \\left(-\\frac{\\cos(nx)}{n}\\right)(-dx) \\right) = \\frac{1}{\\pi} \\left( \\left[ 0 - \\left(-\\frac{\\pi \\cos(0)}{n}\\right) \\right] - \\left[ \\frac{\\sin(nx)}{n^2} \\right]_{0}^{\\pi} \\right) = \\frac{1}{n}',
          },
          {
            stepNumber: 5,
            title: 'گام ۵: نوشتن فرم بسته سری فوریه و بسط صریح جملات اول ($n=1,2,3,4,5$)',
            explanation:
              'با جایگذاری ضرایب در فرمول کلی سری فوریه و باز کردن جملات کسینوسی (فقط فردها) و سینوسی (همه $n$ها) داریم:',
            formula:
              '\\begin{aligned} f(x) &\\simeq \\frac{\\pi}{4} + \\frac{2}{\\pi}\\sum_{k=1}^{\\infty} \\frac{\\cos((2k-1)x)}{(2k-1)^2} + \\sum_{n=1}^{\\infty} \\frac{\\sin(nx)}{n} \\\\ &= \\frac{\\pi}{4} + \\frac{2}{\\pi}\\left( \\cos x + \\frac{\\cos 3x}{9} + \\frac{\\cos 5x}{25} + \\cdots \\right) + \\left( \\sin x + \\frac{\\sin 2x}{2} + \\frac{\\sin 3x}{3} + \\frac{\\sin 4x}{4} + \\cdots \\right) \\end{aligned}',
          },
          {
            stepNumber: 6,
            title: 'گام ۶: اعمال قضیه دیریکله در نقطه ناپیوستگی $x = 0$ برای جمع سری‌های عددی',
            explanation:
              'در نقطه $x = 0$ تابع پرش دارد: حد راست $f(0^+) = \\lim_{x \\to 0^+} (\\pi - x) = \\pi$ و حد چپ $f(0^-) = 0$ است. با قرار دادن $x = 0$ در سری فوریه داریم $\\cos(0)=1$ و $\\sin(0)=0$:',
            formula:
              '\\begin{aligned} S(0) = \\frac{f(0^+) + f(0^-)}{2} = \\frac{\\pi + 0}{2} &= \\frac{\\pi}{4} + \\frac{2}{\\pi}\\sum_{k=1}^{\\infty} \\frac{1}{(2k-1)^2} \\implies \\sum_{k=1}^{\\infty} \\frac{1}{(2k-1)^2} = \\frac{\\pi^2}{8} \\\\ \\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\sum_{\\text{odd}} + \\sum_{\\text{even}} &= \\frac{\\pi^2}{8} + \\frac{1}{4}\\sum_{n=1}^{\\infty} \\frac{1}{n^2} \\implies \\frac{3}{4}\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{8} \\implies \\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6} \\end{aligned}',
            highlightNote: 'دقت کنید که انتخاب نقطه ناپیوستگی $x = 0$ باعث شد تمام جملات $\\sin(nx)$ صفر شوند و مستقیماً مجموع هر دو سری مطلوب به دست آید.',
          },
        ],
      },
      {
        id: 'ex_pdf_7_8_sawtooth',
        pdfReference: 'مثال‌های ۷ و ۸ جزوه (صفحات ۲۵ تا ۲۷)',
        title: 'سری فوریه سینوسی $f(x)=x$ و $g(x)=x+\\sin x$ در $[-\\pi, \\pi]$ و استخراج سری لایبنیتس $\\frac{\\pi}{4}$',
        difficulty: 'متوسط (امتحانی)',
        problemStatement:
          'الف) سری فوریه تابع دندان‌اره‌ای $f(x) = x$ را در بازه $(-\\pi, \\pi)$ محاسبه کرده و جملات اول آن را بسط دهید. ب) بدون انتگرال‌گیری مجدد، سری فوریه $g(x) = x + \\sin x$ را بنویسید. ج) با انتخاب نقطه مناسب، مجموع سری لایبنیتس $1 - \\frac{1}{3} + \\frac{1}{5} - \\frac{1}{7} + \\cdots$ را بیابید.',
        problemFormula: 'f(x) = x, \\quad g(x) = x + \\sin(x) \\quad (-\\pi < x < \\pi)',
        finalAnswerFormula: 'x = 2\\sum_{n=1}^{\\infty}\\frac{(-1)^{n+1}}{n}\\sin(nx), \\quad x + \\sin x = 3\\sin x + 2\\sum_{n=2}^{\\infty}\\frac{(-1)^{n+1}}{n}\\sin(nx), \\quad \\sum_{k=1}^{\\infty}\\frac{(-1)^{k-1}}{2k-1} = \\frac{\\pi}{4}',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: تحلیل تقارن تابع $f(x) = x$ و صفر شدن ضرایب کسینوسی',
            explanation:
              'چون $f(-x) = -x = -f(x)$ است، تابع $f(x)=x$ روی بازه متقارن $(-\\pi, \\pi)$ فرد است. بنابراین انتگرال $f(x)$ و $f(x)\\cos(nx)$ روی $[-\\pi, \\pi]$ صفر شده و داریم:',
            formula: 'a_0 = 0, \\qquad a_n = 0 \\quad (\\forall n \\ge 1)',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: محاسبه ضریب سینوسی $b_n$ با جدول جزء‌به‌جزء (DI Method)',
            explanation:
              'چون ضرب دو تابع فرد ($x$ و $\\sin(nx)$) تابعی زوج است، انتگرال روی $[-\\pi, \\pi]$ برابر ۲ برابر انتگرال روی $[0, \\pi]$ است. با انتخاب $u=x$ (ستون مشتق) و $dv=\\sin(nx)dx$ (ستون انتگرال) داریم:',
            formula:
              'b_n = \\frac{2}{\\pi}\\int_{0}^{\\pi} x\\sin(nx)\\,dx = \\frac{2}{\\pi}\\left[ -\\frac{x\\cos(nx)}{n} + \\frac{\\sin(nx)}{n^2} \\right]_{0}^{\\pi} = \\frac{2}{\\pi}\\left( -\\frac{\\pi\\cos(n\\pi)}{n} + 0 - 0 \\right) = -\\frac{2(-1)^n}{n} = \\frac{2(-1)^{n+1}}{n}',
            whyHint: 'چون $\\cos(n\\pi) = (-1)^n$ و $-(-1)^n = (-1)^{n+1}$ است؛ لذا برای $n=1$ مثبت، برای $n=2$ منفی و به صورت یک‌درمیان علامت عوض می‌کند.',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: نوشتن بسط کامل و جملات بازشده سری فوریه $f(x) = x$',
            explanation:
              'در نقاط درونی $(-\\pi, \\pi)$ تابع پیوسته است و سری فوریه دقیقاً به خود $x$ همگرا می‌شود:',
            formula:
              'x = 2\\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1}}{n}\\sin(nx) = 2\\left( \\sin x - \\frac{\\sin 2x}{2} + \\frac{\\sin 3x}{3} - \\frac{\\sin 4x}{4} + \\frac{\\sin 5x}{5} - \\cdots \\right) \\quad (-\\pi < x < \\pi)',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: استخراج فوری سری فوریه $g(x) = x + \\sin x$ با استفاده از خاصیت خطی بودن و تعامد',
            explanation:
              'توابع پایه مثلثاتی بر هم متعامدند؛ بنابراین سری فوریه خودِ تابع $\\sin(x)$ تنها از یک جمله (هارمونیک اول $n=1$ با ضریب $b_1 = 1$) تشکیل شده و برای $n \\ge 2$ ضریب آن صفر است! با جمع کردن این تک‌جمله با سری $x$ داریم:',
            formula:
              '\\begin{aligned} x + \\sin x &= \\sin x + \\left( 2\\sin x - \\sin 2x + \\frac{2}{3}\\sin 3x - \\frac{1}{2}\\sin 4x + \\cdots \\right) \\\\ &= 3\\sin x - \\sin 2x + \\frac{2}{3}\\sin 3x - \\frac{1}{2}\\sin 4x + \\cdots = 3\\sin x + 2\\sum_{n=2}^{\\infty}\\frac{(-1)^{n+1}}{n}\\sin(nx) \\end{aligned}',
            whyHint: 'در امتحان هرگاه جمله‌ای مثل $c\\sin(kx)$ یا $c\\cos(kx)$ به تابع اضافه شد، هرگز دوباره انتگرال نگیرید؛ فقط ضریب $b_k$ یا $a_k$ را به اندازه $c$ تغییر دهید!',
          },
          {
            stepNumber: 5,
            title: 'گام ۵: جایگذاری $x = \\frac{\\pi}{2}$ برای استخراج فرمول لایبنیتس ($\\frac{\\pi}{4}$)',
            explanation:
              'نقطه $x = \\frac{\\pi}{2}$ درون بازه پیوستگی $(-\\pi, \\pi)$ قرار دارد. در این نقطه مقادیر $\\sin(n\\pi/2)$ برای $n$های زوج صفر و برای $n=1,3,5,7,\\dots$ به ترتیب برابر $+1, -1, +1, -1, \\dots$ هستند:',
            formula:
              '\\frac{\\pi}{2} = 2\\left( \\sin\\frac{\\pi}{2} - \\frac{\\sin\\pi}{2} + \\frac{\\sin\\frac{3\\pi}{2}}{3} - \\frac{\\sin 2\\pi}{4} + \\frac{\\sin\\frac{5\\pi}{2}}{5} - \\cdots \\right) = 2\\left( 1 - 0 - \\frac{1}{3} - 0 + \\frac{1}{5} - \\frac{1}{7} + \\cdots \\right) \\implies 1 - \\frac{1}{3} + \\frac{1}{5} - \\frac{1}{7} + \\cdots = \\frac{\\pi}{4}',
            highlightNote: 'توجه کنید که در مرزهای بازه ($x = \\pm\\pi$)، تمام جملات $\\sin(\\pm n\\pi) = 0$ هستند و سری به میانگین پرش $\\frac{\\pi + (-\\pi)}{2} = 0$ همگرا می‌شود (نه به $\\pm\\pi$!).',
          },
        ],
      },
      {
        id: 'ex_pdf_9_abs',
        pdfReference: 'مثال ۹ و ۱۶ جزوه (صفحات ۲۹ و ۴۱)',
        title: 'بسط کامل سری فوریه کسینوسی $f(x) = |x|$ و محاسبه $\\sum \\frac{1}{(2k-1)^4}$ با اتحاد پارسوال',
        difficulty: 'متوسط (امتحانی)',
        problemStatement:
          'سری فوریه تابع $f(x) = |x|$ را در بازه $[-\\pi, \\pi]$ با جزئیات کامل محاسبه کنید، ۴ جمله اول را بسط دهید و سپس با استفاده از اتحاد پارسوال، مجموع سری عددی $\\sum_{k=1}^{\\infty} \\frac{1}{(2k-1)^4}$ را بیابید.',
        problemFormula: 'f(x) = |x| \\quad (-\\pi \\le x \\le \\pi) \\quad \\implies \\quad \\text{Find Fourier Series \\& } \\sum_{k=1}^{\\infty} \\frac{1}{(2k-1)^4}',
        finalAnswerFormula: '|x| = \\frac{\\pi}{2} - \\frac{4}{\\pi} \\sum_{k=1}^{\\infty} \\frac{\\cos((2k-1)x)}{(2k-1)^2} \\quad , \\quad \\sum_{k=1}^{\\infty} \\frac{1}{(2k-1)^4} = \\frac{\\pi^4}{96}',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: بررسی تقارن تابع در بازه $[-\\pi, \\pi]$ و محاسبه $b_n$ و $a_0$',
            explanation:
              'چون $f(-x) = |-x| = |x| = f(x)$، تابع زوج است؛ بنابراین حاصل‌ضرب $|x|\\sin(nx)$ فرد بوده و تمام ضرایب سینوسی صفر هستند ($b_n = 0$). برای $a_0$ از فرمول دو برابر انتگرال در $[0, \\pi]$ استفاده می‌کنیم:',
            formula:
              'b_n = 0 \\quad , \\quad a_0 = \\frac{2}{\\pi} \\int_{0}^{\\pi} x\\,dx = \\frac{2}{\\pi} \\left[ \\frac{x^2}{2} \\right]_{0}^{\\pi} = \\frac{2}{\\pi} \\left( \\frac{\\pi^2}{2} - 0 \\right) = \\pi \\implies \\frac{a_0}{2} = \\frac{\\pi}{2}',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: انتگرال‌گیری جزء به جزء برای محاسبه ضریب کسینوسی $a_n$',
            explanation:
              'در بازه $[0, \\pi]$ داریم $|x| = x$. با انتخاب $u = x \\implies du = dx$ و $dv = \\cos(nx)\\,dx \\implies v = \\frac{\\sin(nx)}{n}$ داریم:',
            formula:
              'a_n = \\frac{2}{\\pi} \\int_{0}^{\\pi} x \\cos(nx)\\,dx = \\frac{2}{\\pi} \\left( \\left[ \\frac{x \\sin(nx)}{n} \\right]_{0}^{\\pi} - \\int_{0}^{\\pi} \\frac{\\sin(nx)}{n}\\,dx \\right) = \\frac{2}{\\pi} \\left( 0 - \\left[ -\\frac{\\cos(nx)}{n^2} \\right]_{0}^{\\pi} \\right)',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: جایگذاری حدود $0$ و $\\pi$ در $a_n$ و نوشتن جملات بازشده سری کسینوسی',
            explanation:
              'با جایگذاری $\\cos(n\\pi) = (-1)^n$ و $\\cos(0) = 1$، ضرایب زوج صفر شده و فقط ضرایب فرد $n=2k-1$ باقی می‌مانند:',
            formula:
              '\\begin{aligned} a_n &= \\frac{2\\big((-1)^n - 1\\big)}{n^2 \\pi} = \\begin{cases} 0 & n = 2k \\\\ -\\frac{4}{(2k-1)^2 \\pi} & n = 2k-1 \\end{cases} \\\\ \\; |x| &= \\frac{\\pi}{2} - \\frac{4}{\\pi}\\left( \\cos x + \\frac{\\cos 3x}{9} + \\frac{\\cos 5x}{25} + \\frac{\\cos 7x}{49} + \\cdots \\right) \\quad (-\\pi \\le x \\le \\pi) \\end{aligned}',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: نوشتن اتحاد پارسوال و محاسبه انتگرال سمت چپ',
            explanation:
              'طبق اتحاد پارسوال برای تابع زوج در $[-\\pi, \\pi]$ داریم $\\frac{2}{\\pi} \\int_{0}^{\\pi} (f(x))^2\\,dx = \\frac{a_0^2}{2} + \\sum_{n=1}^{\\infty} a_n^2$. ابتدا سمت چپ را حساب می‌کنیم:',
            formula:
              '\\text{LHS} = \\frac{2}{\\pi} \\int_{0}^{\\pi} x^2\\,dx = \\frac{2}{\\pi} \\left[ \\frac{x^3}{3} \\right]_{0}^{\\pi} = \\frac{2}{\\pi} \\left( \\frac{\\pi^3}{3} - 0 \\right) = \\frac{2\\pi^2}{3}',
          },
          {
            stepNumber: 5,
            title: 'گام ۵: تشکیل معادله پارسوال و حل جبری برای $\\sum_{k=1}^{\\infty} \\frac{1}{(2k-1)^4}$',
            explanation:
              'اکنون مقادیر $a_0 = \\pi$ و $a_{2k-1} = -\\frac{4}{(2k-1)^2 \\pi}$ را در سمت راست اتحاد پارسوال قرار داده و معادله را حل می‌کنیم:',
            formula:
              '\\frac{2\\pi^2}{3} = \\frac{\\pi^2}{2} + \\sum_{k=1}^{\\infty} \\left( -\\frac{4}{(2k-1)^2 \\pi} \\right)^2 \\implies \\frac{2\\pi^2}{3} - \\frac{\\pi^2}{2} = \\frac{16}{\\pi^2} \\sum_{k=1}^{\\infty} \\frac{1}{(2k-1)^4} \\implies \\frac{\\pi^2}{6} = \\frac{16}{\\pi^2} S \\implies S = \\frac{\\pi^4}{96}',
            highlightNote: 'با استفاده از رابطه $\\sum_{n=1}^\\infty \\frac{1}{n^4} = \\frac{16}{15} \\sum_{k=1}^{\\infty} \\frac{1}{(2k-1)^4}$ می‌توان نتیجه مشهور $\\sum_{n=1}^{\\infty} \\frac{1}{n^4} = \\frac{16}{15}\\left(\\frac{\\pi^4}{96}\\right) = \\frac{\\pi^4}{90}$ را نیز بلافاصله استخراج کرد.',
          },
        ],
      },
      {
        id: 'ex_pdf_parabola_x2',
        pdfReference: 'مسأله کلاسیک بازل و مثال‌های صفحات ۳۰ تا ۴۲ جزوه',
        title: 'سری فوریه سهمی $f(x) = x^2$ در $[-\\pi, \\pi]$ با جدول ۴ سطری DI و استخراج ۳ سری مشهور ریماﻥ',
        difficulty: 'متوسط (امتحانی)',
        problemStatement:
          'بسط سری فوریه تابع $f(x) = x^2$ را در بازه $[-\\pi, \\pi]$ با استفاده از روش جزء‌به‌جزء جدولی (DI) به دست آورید و سپس از روی آن مجموع هر سه سری $\\sum_{n=1}^{\\infty} \\frac{1}{n^2}$، $\\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1}}{n^2}$ و $\\sum_{n=1}^{\\infty} \\frac{1}{n^4}$ را محاسبه کنید.',
        problemFormula: 'f(x) = x^2 \\quad (-\\pi \\le x \\le \\pi), \\quad f(x + 2\\pi) = f(x)',
        finalAnswerFormula: 'x^2 = \\frac{\\pi^2}{3} + 4\\sum_{n=1}^{\\infty}\\frac{(-1)^n}{n^2}\\cos(nx), \\quad \\sum_{n=1}^{\\infty}\\frac{1}{n^2} = \\frac{\\pi^2}{6}, \\quad \\sum_{n=1}^{\\infty}\\frac{(-1)^{n+1}}{n^2} = \\frac{\\pi^2}{12}, \\quad \\sum_{n=1}^{\\infty}\\frac{1}{n^4} = \\frac{\\pi^4}{90}',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: بررسی تقارن زوج تابع $f(x)=x^2$ و محاسبه ضریب ثابت $a_0$',
            explanation:
              'چون $f(-x) = (-x)^2 = x^2 = f(x)$، تابع زوج است و تمام ضرایب سینوسی صفر می‌شوند ($b_n = 0$). مقدار $a_0$ برابر است با:',
            formula:
              'b_n = 0, \\qquad a_0 = \\frac{2}{\\pi}\\int_{0}^{\\pi} x^2\\,dx = \\frac{2}{\\pi}\\left[ \\frac{x^3}{3} \\right]_{0}^{\\pi} = \\frac{2\\pi^2}{3} \\implies \\frac{a_0}{2} = \\frac{\\pi^2}{3}',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: محاسبه انتگرال $\\int x^2\\cos(nx)\\,dx$ با ۳ قطر جدول DI',
            explanation:
              'در جدول DI، ستون مشتق $D$ شامل $[x^2, 2x, 2, 0]$ (با علامت‌های $+, -, +, -$) و ستون انتگرال $I$ شامل $[\\cos(nx), \\frac{\\sin(nx)}{n}, -\\frac{\\cos(nx)}{n^2}, -\\frac{\\sin(nx)}{n^3}]$ است. با ضرب قطری سطر $k$ از $D$ در سطر $k+1$ از $I$ داریم:',
            formula:
              'a_n = \\frac{2}{\\pi}\\int_{0}^{\\pi} x^2\\cos(nx)\\,dx = \\frac{2}{\\pi}\\left[ \\underbrace{+\\frac{x^2\\sin(nx)}{n}}_{\\text{قطر ۱: صفر در } 0,\\pi} \\underbrace{- (2x)\\left(-\\frac{\\cos(nx)}{n^2}\\right)}_{\\text{قطر ۲: }+\\frac{2x\\cos(nx)}{n^2}} \\underbrace{+ (2)\\left(-\\frac{\\sin(nx)}{n^3}\\right)}_{\\text{قطر ۳: صفر در } 0,\\pi} \\right]_{0}^{\\pi}',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: جایگذاری حدود $0$ و $\\pi$ و نوشتن بسط کامل و جملات بازشده سری $x^2$',
            explanation:
              'چون $\\sin(n\\pi) = \\sin(0) = 0$ است، قطر اول و سوم در هر دو حد صفر می‌شوند و فقط قطر دوم در حد بالا $x = \\pi$ باقی می‌ماند:',
            formula:
              '\\begin{aligned} a_n &= \\frac{2}{\\pi}\\left( \\frac{2\\pi\\cos(n\\pi) - 0}{n^2} \\right) = \\frac{4(-1)^n}{n^2} \\\\ \\; x^2 &= \\frac{\\pi^2}{3} + 4\\sum_{n=1}^{\\infty} \\frac{(-1)^n}{n^2}\\cos(nx) = \\frac{\\pi^2}{3} - 4\\left( \\cos x - \\frac{\\cos 2x}{4} + \\frac{\\cos 3x}{9} - \\frac{\\cos 4x}{16} + \\cdots \\right) \\end{aligned}',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: جایگذاری نقاط پیوستگی $x = \\pi$ و $x = 0$ برای استخراج دو سری درجه ۲',
            explanation:
              'چون $f(-\\pi) = f(\\pi) = \\pi^2$، توسیع متناوب در تمام نقاط از جمله مرز $x = \\pi$ پیوسته است! اول $x = \\pi$ (که $\\cos(n\\pi) = (-1)^n$ و $(-1)^n(-1)^n = (+1)^n = 1$ می‌دهد) و سپس $x = 0$ (که $\\cos(0)=1$ می‌دهد) را جایگذاری می‌کنیم:',
            formula:
              '\\begin{aligned} x = \\pi &\\implies \\pi^2 = \\frac{\\pi^2}{3} + 4\\sum_{n=1}^{\\infty}\\frac{(-1)^n(-1)^n}{n^2} \\implies \\frac{2\\pi^2}{3} = 4\\sum_{n=1}^{\\infty}\\frac{1}{n^2} \\implies \\sum_{n=1}^{\\infty}\\frac{1}{n^2} = \\frac{\\pi^2}{6} \\\\ \\; x = 0 &\\implies 0 = \\frac{\\pi^2}{3} + 4\\sum_{n=1}^{\\infty}\\frac{(-1)^n}{n^2} \\implies \\sum_{n=1}^{\\infty}\\frac{(-1)^{n+1}}{n^2} = 1 - \\frac{1}{4} + \\frac{1}{9} - \\frac{1}{16} + \\cdots = \\frac{\\pi^2}{12} \\end{aligned}',
          },
          {
            stepNumber: 5,
            title: 'گام ۵: اعمال اتحاد پارسوال برای استخراج $\\sum_{n=1}^{\\infty} \\frac{1}{n^4} = \\frac{\\pi^4}{90}$',
            explanation:
              'اکنون از اتحاد پارسوال $\\frac{2}{\\pi}\\int_{0}^{\\pi} (x^2)^2\\,dx = \\frac{a_0^2}{2} + \\sum_{n=1}^{\\infty} a_n^2$ استفاده می‌کنیم:',
            formula:
              '\\frac{2}{\\pi}\\int_{0}^{\\pi} x^4\\,dx = \\frac{2\\pi^4}{5} = \\frac{(2\\pi^2/3)^2}{2} + \\sum_{n=1}^{\\infty}\\left(\\frac{4(-1)^n}{n^2}\\right)^2 = \\frac{2\\pi^4}{9} + 16\\sum_{n=1}^{\\infty}\\frac{1}{n^4} \\implies 16\\sum_{n=1}^{\\infty}\\frac{1}{n^4} = \\left(\\frac{2}{5} - \\frac{2}{9}\\right)\\pi^4 = \\frac{8\\pi^4}{45} \\implies \\sum_{n=1}^{\\infty}\\frac{1}{n^4} = \\frac{\\pi^4}{90}',
            highlightNote: 'این مثال نشان می‌دهد چگونه از یک سری فوریه واحد ($f(x)=x^2$) می‌توان با انتخاب هوشمندانه نقاط مرزی، میانی و اتحاد پارسوال، سه سری عددی کلاسیک را به دست آورد.',
          },
        ],
      },
      {
        id: 'ex_pdf_diff_int_series',
        pdfReference: 'مبحث مشتق و انتگرال سری فوریه (صفحات ۴۳ تا ۴۹ جزوه)',
        title: 'استخراج سری فوریه $x^2$ و $x(\\pi^2 - x^2)$ با انتگرال‌گیری جمله‌به‌جمله از سری $f(x)=x$ (بدون انتگرال جزء‌به‌جزء!)',
        difficulty: 'پیشرفته (تکمیلی)',
        problemStatement:
          'با فرض معلوم بودن سری فوریه $x = 2\\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1}}{n}\\sin(nx)$ در $(-\\pi, \\pi)$، بدون استفاده از فرمول‌های انتگرالی اویلر و صرفاً با انتگرال‌گیری جمله‌به‌جمله متوالی، سری فوریه توابع $x^2$ و $g(x) = x(\\pi^2 - x^2)$ را در $[-\\pi, \\pi]$ بیابید.',
        problemFormula: 'x = 2\\sum_{n=1}^{\\infty}\\frac{(-1)^{n+1}}{n}\\sin(nx) \\quad \\xrightarrow{\\int_{0}^{x} dt} \\quad \\text{Find Fourier Series of } x^2 \\text{ and } x(\\pi^2 - x^2)',
        finalAnswerFormula: 'x^2 = \\frac{\\pi^2}{3} + 4\\sum_{n=1}^{\\infty}\\frac{(-1)^n}{n^2}\\cos(nx), \\qquad x(\\pi^2 - x^2) = 12\\sum_{n=1}^{\\infty}\\frac{(-1)^{n+1}}{n^3}\\sin(nx)',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: انتگرال‌گیری جمله‌به‌جمله از سری فوریه $t$ در بازه $[0, x]$',
            explanation:
              'طبق قضیه انتگرال‌گیری جمله‌به‌جمله، انتگرال‌گیری از سری فوریه هر تابع تکه‌ای پیوسته همواره مجاز است. از دو طرف رابطه $t = 2\\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1}}{n}\\sin(nt)$ از $0$ تا $x$ انتگرال می‌گیریم:',
            formula:
              '\\int_{0}^{x} t\\,dt = 2\\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1}}{n} \\int_{0}^{x} \\sin(nt)\\,dt \\implies \\frac{x^2}{2} = 2\\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1}}{n}\\left[ \\frac{-\\cos(nt)}{n} \\right]_{0}^{x} = 2\\sum_{n=1}^{\\infty} \\frac{(-1)^n}{n^2}\\big(\\cos(nx) - 1\\big)',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: جداسازی ثابت انتگرال‌گیری و تشکیل سری فوریه $x^2$',
            explanation:
              'طرفین را در $2$ ضرب کرده و جمله ثابت را از جمله حاوی $\\cos(nx)$ جدا می‌کنیم. ثابتِ ظاهرشده همان $\\frac{a_0}{2} = \\frac{1}{\\pi}\\int_{0}^{\\pi} x^2 dx = \\frac{\\pi^2}{3}$ است:',
            formula:
              'x^2 = \\underbrace{-4\\sum_{n=1}^{\\infty}\\frac{(-1)^n}{n^2}}_{\\frac{a_0}{2} = \\frac{\\pi^2}{3}} + 4\\sum_{n=1}^{\\infty}\\frac{(-1)^n}{n^2}\\cos(nx) \\implies x^2 - \\frac{\\pi^2}{3} = 4\\sum_{n=1}^{\\infty}\\frac{(-1)^n}{n^2}\\cos(nx) \\quad (-\\pi \\le x \\le \\pi)',
            whyHint: 'چون میانگینِ یک سری خالص کسینوسی $\\sum a_n\\cos(nx)$ روی $[-\\pi, \\pi]$ صفر است، ثابتِ بیرون‌آمده از انتگرال الزاماً برابر مقدار میانگینِ $x^2$ روی $[-\\pi, \\pi]$ یعنی $\\frac{\\pi^2}{3}$ است!',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: انتگرال‌گیری جمله‌به‌جمله مجدد برای رسیدن به چندجمله‌ای درجه ۳',
            explanation:
              'چون در سریِ $x^2 - \\frac{\\pi^2}{3} = 4\\sum_{n=1}^{\\infty}\\frac{(-1)^n}{n^2}\\cos(nx)$ جمله ثابت وجود ندارد ($a_0 = 0$)، انتگرال‌گیری از آن هیچ جمله خطی غیرمتناوبی تولید نمی‌کند! از $0$ تا $x$ انتگرال می‌گیریم:',
            formula:
              '\\int_{0}^{x} \\left(t^2 - \\frac{\\pi^2}{3}\\right)dt = 4\\sum_{n=1}^{\\infty}\\frac{(-1)^n}{n^2}\\int_{0}^{x}\\cos(nt)\\,dt \\implies \\frac{x^3}{3} - \\frac{\\pi^2 x}{3} = 4\\sum_{n=1}^{\\infty}\\frac{(-1)^n}{n^3}\\sin(nx)',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: ضرب در $-3$ و دستیابی به سری فوریه سینوسی $x(\\pi^2 - x^2)$',
            explanation:
              'با ضرب طرفین در $-3$ (که $(-1)^n$ را به $(-1)^{n+1}$ تبدیل می‌کند)، سری فوریه دقیق تابع درجه سوم بدون حتی یک بار انتگرال‌گیری جزء‌به‌جزء حاصل می‌شود:',
            formula:
              'x(\\pi^2 - x^2) = 12\\sum_{n=1}^{\\infty}\\frac{(-1)^{n+1}}{n^3}\\sin(nx) = 12\\left( \\sin x - \\frac{\\sin 2x}{8} + \\frac{\\sin 3x}{27} - \\frac{\\sin 4x}{64} + \\cdots \\right) \\quad (-\\pi \\le x \\le \\pi)',
            highlightNote: 'ببینید چقدر زیبا سرعت همگرایی با هر بار انتگرال‌گیری افزایش یافت: سری $x$ از مرتبه $1/n$، سری $x^2$ از مرتبه $1/n^2$ و سری $x(\\pi^2-x^2)$ (که هم خودش و هم مشتقش در مرزهای $\\pm\\pi$ پیوسته‌اند!) از مرتبه $1/n^3$ است.',
          },
        ],
      },
      {
        id: 'ex_pdf_arbitrary_ab',
        pdfReference: 'مبحث بازه دلخواه $[a,b]$ (صفحات ۵۰ تا ۵۴ جزوه)',
        title: 'سری فوریه در بازه نامتقارن دلخواه $[-1, 3]$ و تحلیل همگرایی در مرزها و نقاط پرش',
        difficulty: 'متوسط (امتحانی)',
        problemStatement:
          'تابع $f(x)$ در بازه نامتقارن $[-1, 3)$ به صورت $f(x) = 0$ برای $-1 \\le x < 1$ و $f(x) = 2$ برای $1 \\le x < 3$ تعریف شده و با دوره تناوب $T = 4$ متناوب است. بسط سری فوریه آن را بیابید و مقدار همگرایی سری را در نقاط $x = 1$، $x = -1$ و $x = 3$ تعیین کنید.',
        problemFormula: 'f(x) = \\begin{cases} 0, & -1 \\le x < 1 \\\\ 2, & 1 \\le x < 3 \\end{cases}, \\qquad T = b - a = 3 - (-1) = 4 \\implies \\ell = 2',
        finalAnswerFormula: 'f(x) \\simeq 1 - \\frac{4}{\\pi}\\sum_{k=1}^{\\infty}\\frac{(-1)^{k-1}}{2k-1}\\cos\\left(\\frac{(2k-1)\\pi x}{2}\\right) \\quad (b_n = 0 \\;\\text{برای همه } n)',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: تعیین نیم‌طول بازه $\\ell$ و فرکانس زاویه‌ای پایه $\\frac{\\pi}{\\ell}$',
            explanation:
              'بازه داده شده $[a, b] = [-1, 3]$ است. طول کل دوره تناوب برابر $2\\ell = b - a = 3 - (-1) = 4$ است؛ بنابراین نصف طول بازه برابر $\\ell = 2$ بوده و توابع پایه به صورت $\\cos\\left(\\frac{n\\pi x}{2}\\right)$ و $\\sin\\left(\\frac{n\\pi x}{2}\\right)$ هستند:',
            formula:
              'a_0 = \\frac{1}{\\ell}\\int_{a}^{b} f(x)\\,dx = \\frac{1}{2}\\left[ \\int_{-1}^{1} 0\\,dx + \\int_{1}^{3} 2\\,dx \\right] = \\frac{1}{2}\\big( 2(3 - 1) \\big) = 2 \\implies \\frac{a_0}{2} = 1',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: محاسبه کامل ضرایب کسینوسی $a_n$ در بازه $[1, 3]$',
            explanation:
              'چون تابع در $[-1, 1)$ صفر است، انتگرال فقط از $1$ تا $3$ گرفته می‌شود. دقت کنید که $\\sin\\left(\\frac{3n\\pi}{2}\\right) = \\sin\\left(n\\pi + \\frac{n\\pi}{2}\\right) = (-1)^n \\sin\\left(\\frac{n\\pi}{2}\\right)$ است:',
            formula:
              'a_n = \\frac{1}{2}\\int_{1}^{3} 2\\cos\\left(\\frac{n\\pi x}{2}\\right)dx = \\left[ \\frac{2}{n\\pi}\\sin\\left(\\frac{n\\pi x}{2}\\right) \\right]_{1}^{3} = \\frac{2}{n\\pi}\\left( \\sin\\left(\\frac{3n\\pi}{2}\\right) - \\sin\\left(\\frac{n\\pi}{2}\\right) \\right)',
            whyHint: 'به ازای $n$های زوج ($n=2k$) هر دو سینوس صفرند پس $a_{2k} = 0$. به ازای $n=2k-1$ (فرد) داریم $\\sin\\left(\\frac{(2k-1)\\pi}{2}\\right) = (-1)^{k-1}$ و $\\sin\\left(\\frac{3(2k-1)\\pi}{2}\\right) = -(-1)^{k-1}$؛ بنابراین $a_{2k-1} = -\\frac{4(-1)^{k-1}}{(2k-1)\\pi}$.',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: محاسبه کامل ضرایب سینوسی $b_n$ در بازه $[1, 3]$',
            explanation:
              'به طریق مشابه برای ضریب سینوسی $b_n$ انتگرال می‌گیریم:',
            formula:
              'b_n = \\frac{1}{2}\\int_{1}^{3} 2\\sin\\left(\\frac{n\\pi x}{2}\\right)dx = \\left[ -\\frac{2}{n\\pi}\\cos\\left(\\frac{n\\pi x}{2}\\right) \\right]_{1}^{3} = \\frac{2}{n\\pi}\\left( \\cos\\left(\\frac{n\\pi}{2}\\right) - \\cos\\left(\\frac{3n\\pi}{2}\\right) \\right) = 0 \\quad (\\text{زیرا برای } n \\text{ فرد هر دو کسینوس صفرند و برای } n=2k \\text{ هر دو برابر } (-1)^k \\text{ هستند!})',
            whyHint: 'نکته بسیار ظریف: برای $n=2k$ داریم $\\cos(k\\pi) - \\cos(3k\\pi) = (-1)^k - (-1)^{3k} = 0$! پس تمام ضرایب $b_n$ در این بازه صفر می‌شوند (زیرا تابع نسبت به خط $x=2$ و $x=0$ تقارن محوری زوج دارد!).',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: نوشتن بسط نهایی و تعیین مقدار سری در نقاط پرش $x=1$ و مرزهای $x=-1, 3$',
            explanation:
              'بنابراین سری فوریه فقط دارای جملات کسینوسی فرد است. اکنون طبق قضیه همگرایی دیریکله در نقطه درونی $x=1$ و نقاط مرزی $x=-1$ و $x=3$ داریم:',
            formula:
              '\\begin{aligned} f(x) &\\simeq 1 - \\frac{4}{\\pi}\\sum_{k=1}^{\\infty} \\frac{(-1)^{k-1}}{2k-1}\\cos\\left(\\frac{(2k-1)\\pi x}{2}\\right) = 1 - \\frac{4}{\\pi}\\left( \\cos\\frac{\\pi x}{2} - \\frac{1}{3}\\cos\\frac{3\\pi x}{2} + \\frac{1}{5}\\cos\\frac{5\\pi x}{2} - \\cdots \\right) \\\\ \\; S(1) &= \\frac{f(1^-) + f(1^+)}{2} = \\frac{0 + 2}{2} = 1, \\qquad S(-1) = S(3) = \\frac{f(-1^+) + f(3^-)}{2} = \\frac{0 + 2}{2} = 1 \\end{aligned}',
            highlightNote: 'همواره می‌توان صحت ضرایب را با جایگذاری نقاط پرش بررسی کرد: به ازای $x=1$ و $x=-1$ داریم $\\cos((2k-1)\\pi/2) = 0$ و سری دقیقاً عدد ثابت $1$ را می‌دهد که با میانگین حد چپ و راست برابر است!',
          },
        ],
      },
    ],
    practiceQuestions: [
      {
        id: 'q1_m2',
        question:
          'اگر تابع $f(x)$ در بازه $[-2, 2]$ به صورت $f(x) = -1$ برای $x < 0$ و $f(x) = 3$ برای $x > 0$ تعریف شود و متناوب با دوره تناوب $4$ باشد، سری فوریه آن در نقطه $x = 0$ و در نقطه مرزی $x = 2$ به چه عددی همگرا می‌شود؟',
        options: ['0', '1', '2', '3'],
        correctIndex: 1,
        explanation:
          'طبق قضیه همگرایی دیریکله، هم در نقطه پرش درونی $x = 0$ و هم در نقطه مرزی $x = 2$ سری به میانگین حد چپ و راست همگراست: $S(0) = \\frac{f(0^+) + f(0^-)}{2} = \\frac{3 + (-1)}{2} = 1$ و $S(2) = \\frac{f(-2^+) + f(2^-)}{2} = \\frac{-1 + 3}{2} = 1$.',
      },
      {
        id: 'q2_m2',
        question:
          'در بسط سری فوریه تابع $f(x) = x^3 + 3\\cos(2x) - 4\\sin(5x)$ روی بازه $[-\\pi, \\pi]$، مقدار ضرایب کسینوسی $a_5$ و $a_2$ به ترتیب کدام است؟',
        options: ['a_5 = 0 , a_2 = 3', 'a_5 = -4 , a_2 = 3', 'a_5 = 0 , a_2 = 0', 'a_5 = 3 , a_2 = -4'],
        correctIndex: 0,
        explanation:
          'جملات $x^3$ و $-4\\sin(5x)$ هر دو فرد هستند و هیچ سهمی در ضرایب کسینوسی $a_n$ ندارند. بخش زوج تابع فقط $3\\cos(2x)$ است که به دلیل تعامد توابع کسینوسی تنها ضریب $a_2 = 3$ ایجاد می‌کند و برای $n = 5$ داریم $a_5 = 0$.',
      },
      {
        id: 'q3_m2',
        question:
          'طبق اتحاد پارسوال برای سری فوریه روی بازه $[-\\ell, \\ell]$، مقدار میانگین مربعات $\\frac{1}{\\ell}\\int_{-\\ell}^{\\ell} [f(x)]^2\\,dx$ برابر کدام عبارت است؟',
        options: [
          'a_0^2 + \\sum_{n=1}^{\\infty} (a_n^2 + b_n^2)',
          '\\frac{a_0^2}{2} + \\sum_{n=1}^{\\infty} (a_n^2 + b_n^2)',
          '\\frac{a_0^2}{4} + \\frac{1}{2}\\sum_{n=1}^{\\infty} (a_n^2 + b_n^2)',
          '\\sum_{n=1}^{\\infty} (a_n + b_n)^2',
        ],
        correctIndex: 1,
        explanation:
          'طبق قضیه پارسوال (صفحه ۳۹ جزوه دکتر طائری)، انتگرال $\\frac{1}{\\ell}\\int_{-\\ell}^{\\ell} [f(x)]^2\\,dx$ دقیقاً برابر $\\frac{a_0^2}{2} + \\sum_{n=1}^{\\infty}(a_n^2 + b_n^2)$ است.',
      },
      {
        id: 'q4_m2',
        question:
          'اگر تابع $f(x) = x + 2$ فقط در بازه $[0, \\pi]$ داده شده باشد و «بسط سری فوریه سینوسی» (توسیع فرد نیم‌دامنه) آن را بنویسیم، این سری در نقطه $x = 0$ به چه عددی همگرا می‌شود؟',
        options: ['0', '1', '2', '\\pi + 2'],
        correctIndex: 0,
        explanation:
          'در سری فوریه سینوسی $S(x) = \\sum_{n=1}^{\\infty} b_n \\sin(nx)$، به ازای $x = 0$ تمامی جملات $\\sin(0) = 0$ هستند؛ بنابراین سری فوریه سینوسی هر تابعی در نقطه $x = 0$ (و همچنین $x = \\ell$) همواره به عدد $0$ همگرا می‌شود (چون در توسیع فرد، حد راست $+2$ و حد چپ $-2$ است و میانگین آن‌ها صفر می‌شود).',
      },
      {
        id: 'q5_m2',
        question:
          'کدام‌یک از شروط زیر برای مجاز بودن «مشتق‌گیری جمله‌به‌جمله» از سری فوریه یک تابع پیوسته و تکه‌ای هموار $f(x)$ در بازه $[-\\ell, \\ell]$ الزامی است؟',
        options: [
          'f(0) = 0',
          'a_0 = 0',
          'f(-\\ell) = f(\\ell)',
          'f\'(-\\ell) = 0',
        ],
        correctIndex: 2,
        explanation:
          'برای اینکه توسیع متناوب تابع $f(x)$ در سراسر محور اعداد حقیقی پیوسته باشد و در مرزهای تناوب پرش نداشته باشد، باید مقدار تابع در دو سر بازه با هم برابر باشد: $f(-\\ell) = f(\\ell)$. در غیر این صورت مشتق‌گیری جمله‌به‌جمله مجاز نیست.',
      },
      {
        id: 'q6_m2',
        question:
          'اگر بدانیم $\\sum_{k=1}^{\\infty} \\frac{1}{(2k-1)^2} = \\frac{\\pi^2}{8}$ است، مجموع کل سری $\\sum_{n=1}^{\\infty} \\frac{1}{n^2}$ از طریق تفکیک جملات زوج و فرد برابر کدام گزینه می‌شود؟',
        options: [
          '\\frac{\\pi^2}{4}',
          '\\frac{\\pi^2}{6}',
          '\\frac{\\pi^2}{12}',
          '\\frac{3\\pi^2}{16}',
        ],
        correctIndex: 1,
        explanation:
          'اگر $S = \\sum_{n=1}^{\\infty} \\frac{1}{n^2}$ باشد، مجموع جملات زوج برابر $\\sum_{k=1}^{\\infty} \\frac{1}{(2k)^2} = \\frac{1}{4}S$ است. لذا $S = S_{\\text{odd}} + \\frac{1}{4}S \\implies \\frac{3}{4}S = \\frac{\\pi^2}{8} \\implies S = \\frac{4}{3} \\times \\frac{\\pi^2}{8} = \\frac{\\pi^2}{6}$.',
      },
    ],
  },
  {
    id: 'module_3_fourier_integral',
    shortTitle: '۳. انتگرال فوریه',
    numberLabel: 'بخش ۳',
    title: 'انتگرال فوریه و کاربردهای آن (بسط کامل)',
    subtitle: 'گذار از سری به انتگرال فوریه در حد $\\ell \\to \\infty$، انتگرال‌های سینوسی و کسینوسی، قضیه دیریکله در نقاط پرش، اتحاد پارسوال و حل معادلات انتگرالی',
    pdfPageRange: 'صفحات ۵۷ تا ۷۱ جزوه',
    simulatorType: 'fourier_integral',
    layoutComplexity: 'wide_canvas',
    subtopics: [
      {
        id: 'm3_1_transient_signals',
        title: 'گذار از سری فوریه به انتگرال فوریه و انگیزه فیزیکی سیگنال‌های گذرا ($\\ell \\to \\infty$)',
        pdfPages: 'صفحات ۵۷ تا ۵۹',
        summary:
          'سیگنال‌های فیزیکی واقعی مانند پالس‌های ناگهانی، زلزله، تخلیه صاعقه و تکانه‌ها غیرمتناوب هستند. با میل دادن نیم‌دوره تناوب به بی‌نهایت ($\\ell \\to \\infty$)، فاصله فرکانس‌های گسسته $\\Delta\\alpha = \\frac{\\pi}{\\ell} \\to 0$ شده و مجموع سیگما به انتگرال پیوسته روی تمام فرکانس‌های $\\alpha \\in [0, \\infty)$ تبدیل می‌گردد.',
        keyFormulas: [
          {
            label: 'گذار حد مجموع ریمان به انتگرال پیوسته فوریه',
            formula: 'f_\\ell(x) = \\frac{a_0}{2} + \\sum_{n=1}^{\\infty} [a_n\\cos(\\alpha_n x) + b_n\\sin(\\alpha_n x)] \\xrightarrow{\\ell \\to \\infty} \\int_{0}^{\\infty} [A(\\alpha)\\cos(\\alpha x) + B(\\alpha)\\sin(\\alpha x)]\\,d\\alpha',
            note: 'در این حد، $\\alpha_n = \\frac{n\\pi}{\\ell}$ به متغیر پیوسته $\\alpha$ و ضریب گسسته به چگالی طیفی $A(\\alpha) = \\lim_{\\ell \\to \\infty} \\frac{\\ell}{\\pi} a_n$ میل می‌کند.',
          },
          {
            label: 'شرط کافی دریکله برای وجود انتگرال فوریه',
            formula: '\\int_{-\\infty}^{\\infty} |f(x)|\\,dx < \\infty \\quad (f \\in L^1(\\mathbb{R}))',
            note: 'تابع باید روی تمام محور حقیقی مطلقاً انتگرال‌پذیر و تکه‌ای هموار باشد.',
          },
        ],
        conceptualPoints: [
          'سری فوریه سیگنال را به طیف خطی (Line Spectrum) از فرکانس‌های هماهنگ $n\\omega_0$ تجزیه می‌کرد؛ انتگرال فوریه سیگنال را به یک طیف پیوسته (Continuous Density Spectrum) تجزیه می‌کند.',
          'انرژی کل سیگنال غیرمتناوب برخلاف سیگنال‌های متناوب، در بازه زمانی متناهی متمرکز است و توان میانگین آن صفر است، بنابراین با چگالی انرژی طیفی توصیف می‌شود.',
        ],
      },
      {
        id: 'm3_2_fourier_integral_def',
        title: 'نمایش انتگرال فوریه عمومی، ضرایب طیفی $A(\\alpha)$ و $B(\\alpha)$ و قضیه دیریکله',
        pdfPages: 'صفحات ۵۹ تا ۶۲',
        summary:
          'نمایش انتگرال فوریه هر تابع تکه‌ای هموار و مطلقاً انتگرال‌پذیر از دو تابع چگالی طیفی $A(\\alpha)$ (مؤلفه زوج/کسینوسی) و $B(\\alpha)$ (مؤلفه فرد/سینوسی) تشکیل شده است.',
        keyFormulas: [
          {
            label: 'فرمول کلی نمایش انتگرال فوریه تابع $f(x)$',
            formula: 'f(x) \\simeq \\int_{0}^{\\infty} \\Big[ A(\\alpha) \\cos(\\alpha x) + B(\\alpha) \\sin(\\alpha x) \\Big]\\,d\\alpha',
          },
          {
            label: 'ضرایب طیفی تحلیلی اویلر-فوریه',
            formula: 'A(\\alpha) = \\frac{1}{\\pi} \\int_{-\\infty}^{\\infty} f(t) \\cos(\\alpha t)\\,dt \\quad , \\quad B(\\alpha) = \\frac{1}{\\pi} \\int_{-\\infty}^{\\infty} f(t) \\sin(\\alpha t)\\,dt',
          },
          {
            label: 'قضیه همگرایی دیریکله برای انتگرال فوریه در نقاط پرش $x_0$',
            formula: '\\int_{0}^{\\infty} \\Big[ A(\\alpha) \\cos(\\alpha x_0) + B(\\alpha) \\sin(\\alpha x_0) \\Big]\\,d\\alpha = \\frac{f(x_0^+) + f(x_0^-)}{2}',
            note: 'در نقاط پیوستگی انتگرال دقیقاً به $f(x_0)$ و در نقاط پرش ناپیوستگی به میانگین حسابی دو حد چپ و راست همگراست.',
          },
        ],
        conceptualPoints: [
          'چنانچه تابع زوج باشد $B(\\alpha) = 0$ و چنانچه فرد باشد $A(\\alpha) = 0$ خواهد بود.',
          'در حل آزمون‌های کارشناسی ارشد، قضیه دیریکله مهم‌ترین ابزار محاسبه مقادیر انتگرال‌های ناسره مثلثاتی در نقاط خاص $x=0$ یا نقاط ناپیوستگی است.',
        ],
      },
      {
        id: 'm3_3_fourier_cosine_integral',
        title: 'انتگرال فوریه کسینوسی (Fourier Cosine Integral) برای توابع زوج و نیم‌خط $x > 0$',
        pdfPages: 'صفحات ۶۲ تا ۶۵',
        summary:
          'برای هر تابع زوج یا تابعی که فقط در نیم‌خط $x \\in (0, \\infty)$ تعریف شده است، با اعمال قرینه‌سازی زوج، نمایش انتگرال فوریه کسینوسی به دست می‌آید.',
        keyFormulas: [
          {
            label: 'نمایش انتگرال فوریه کسینوسی (Cosine Integral Representation)',
            formula: 'f(x) \\simeq \\int_{0}^{\\infty} A(\\alpha) \\cos(\\alpha x)\\,d\\alpha \\quad (x > 0)',
          },
          {
            label: 'ضریب طیفی کسینوسی $A(\\alpha)$',
            formula: 'A(\\alpha) = \\frac{2}{\\pi} \\int_{0}^{\\infty} f(t) \\cos(\\alpha t)\\,dt',
            note: 'توجه به ضریب $\\frac{2}{\\pi}$ در ابتدای انتگرال به جای $\\frac{1}{\\pi}$ بسیار حیاتی است.',
          },
          {
            label: 'انتگرال مشهور کسینوسی لاپلاس (حاصل از $f(x) = e^{-ax}$)',
            formula: '\\int_{0}^{\\infty} \\frac{\\cos(\\alpha x)}{a^2 + \\alpha^2}\\,d\\alpha = \\frac{\\pi}{2a} e^{-ax} \\quad (x \\ge 0, \\; a > 0)',
          },
        ],
        conceptualPoints: [
          'در نقطه مرزی $x = 0$، فرمول به $\\int_0^\\infty A(\\alpha)\\,d\\alpha = f(0^+)$ تبدیل می‌شود که روشی سریع برای محاسبه انتگرال‌های کسینوسی است.',
        ],
      },
      {
        id: 'm3_4_fourier_sine_integral',
        title: 'انتگرال فوریه سینوسی (Fourier Sine Integral) برای توابع فرد و نیم‌خط $x > 0$',
        pdfPages: 'صفحات ۶۵ تا ۶۷',
        summary:
          'با قرینه‌سازی فرد یک تابع در نیم‌خط مثبت یا برای توابع فرد روی $(-\\infty, \\infty)$، نمایش منحصراً سینوسی پدید می‌آید.',
        keyFormulas: [
          {
            label: 'نمایش انتگرال فوریه سینوسی (Sine Integral Representation)',
            formula: 'f(x) \\simeq \\int_{0}^{\\infty} B(\\alpha) \\sin(\\alpha x)\\,d\\alpha \\quad (x > 0)',
          },
          {
            label: 'ضریب طیفی سینوسی $B(\\alpha)$',
            formula: 'B(\\alpha) = \\frac{2}{\\pi} \\int_{0}^{\\infty} f(t) \\sin(\\alpha t)\\,dt',
          },
          {
            label: 'انتگرال مشهور سینوسی لاپلاس (حاصل از $f(x) = e^{-ax}$)',
            formula: '\\int_{0}^{\\infty} \\frac{\\alpha \\sin(\\alpha x)}{a^2 + \\alpha^2}\\,d\\alpha = \\frac{\\pi}{2} e^{-ax} \\quad (x > 0, \\; a > 0)',
          },
          {
            label: 'همگرایی انتگرال سینوسی در مبدأ ($x = 0$)',
            formula: 'x = 0 \\implies \\int_{0}^{\\infty} B(\\alpha) \\sin(0)\\,d\\alpha = 0',
            note: 'انتگرال فوریه سینوسی هر تابعی در مبدأ $x=0$ همواره دقیقاً صفر است، حتی اگر $f(0^+) \\ne 0$ باشد؛ چون در بسط فرد، حد چپ $f(0^-) = -f(0^+)$ است و طبق قضیه دیریکله سری به میانگین $\\frac{f(0^+) + f(0^-)}{2} = 0$ همگرا می‌شود.',
          },
        ],
        conceptualPoints: [
          'اگر در صورت سؤال تستی انتگرال حاوی عامل $\\sin(\\alpha x)$ باشد، باید سراغ انتگرال فوریه سینوسی بروید و اگر عامل $\\cos(\\alpha x)$ باشد، سراغ انتگرال کسینوسی.',
        ],
      },
      {
        id: 'm3_5_parseval_fourier_integral',
        title: 'اتحاد پارسوال برای انتگرال فوریه و محاسبه انتگرال‌های ناسره توان دو',
        pdfPages: 'صفحات ۶۷ تا ۶۹',
        summary:
          'اتحاد پارسوال بقای انرژی سیگنال را بین حوزه مکان/زمان و حوزه فرکانس بیان می‌کند و قوی‌ترین روش بدون کانتور برای محاسبه انتگرال‌های ناسره با مخرج‌های درجه دو و چهار است.',
        keyFormulas: [
          {
            label: 'اتحاد پارسوال کلی انتگرال فوریه در $(-\\infty, \\infty)$',
            formula: '\\frac{1}{\\pi} \\int_{-\\infty}^{\\infty} |f(x)|^2\\,dx = \\int_{0}^{\\infty} \\Big[ A^2(\\alpha) + B^2(\\alpha) \\Big]\\,d\\alpha',
          },
          {
            label: 'اتحاد پارسوال برای انتگرال فوریه کسینوسی روی $[0, \\infty)$',
            formula: '\\frac{2}{\\pi} \\int_{0}^{\\infty} |f(x)|^2\\,dx = \\int_{0}^{\\infty} A^2(\\alpha)\\,d\\alpha',
          },
          {
            label: 'اتحاد پارسوال برای انتگرال فوریه سینوسی روی $[0, \\infty)$',
            formula: '\\frac{2}{\\pi} \\int_{0}^{\\infty} |f(x)|^2\\,dx = \\int_{0}^{\\infty} B^2(\\alpha)\\,d\\alpha',
          },
          {
            label: 'محاسبه انتگرال ناسره کسر توان چهار با پارسوال تابع نمایی',
            formula: '\\int_{0}^{\\infty} \\frac{1}{(a^2 + \\alpha^2)^2}\\,d\\alpha = \\frac{\\pi}{4a^3} \\quad , \\quad \\int_{0}^{\\infty} \\frac{\\alpha^2}{(a^2 + \\alpha^2)^2}\\,d\\alpha = \\frac{\\pi}{4a}',
          },
          {
            label: 'فرم تبدیل فوریه (پلانشرل) و پل آن با چگالی‌های طیفی $A$ و $B$',
            formula: '\\int_{-\\infty}^{\\infty} |f(x)|^2\\,dx = \\frac{1}{2\\pi} \\int_{-\\infty}^{\\infty} |F(\\alpha)|^2\\,d\\alpha \\quad , \\quad F(\\alpha) = \\pi\\big(A(\\alpha) - iB(\\alpha)\\big) \\implies |F|^2 = \\pi^2\\big(A^2 + B^2\\big)',
            note: 'برای $f$ حقیقی، تبدیل فوریه دقیقاً از روی دو چگالی طیفی ساخته می‌شود؛ با جایگذاری این رابطه در فرم پلانشرل، دقیقاً فرم حقیقی $\\frac{1}{\\pi}\\int f^2 = \\int_0^{\\infty}(A^2 + B^2)\\,d\\alpha$ بازیابی می‌شود؛ یعنی دو فرم، یک اتحاد واحدند.',
          },
          {
            label: 'انتگرال لورنتس پایه (پیش‌زمینه محاسبات پارسوال)',
            formula: '\\int_{0}^{\\infty} \\frac{d\\alpha}{a^2 + \\alpha^2} = \\frac{\\pi}{2a} \\quad (a > 0) \\implies a^2 I_1 + I_2 = \\int_{0}^{\\infty} \\frac{d\\alpha}{a^2+\\alpha^2} = \\frac{\\pi}{2a}',
            note: 'با نوشتن $a^2 + \\alpha^2$ در صورت، دو انتگرال توان چهار با یکدیگر قفل می‌شوند: $a^2 I_1 + I_2 = \\frac{\\pi}{2a}$؛ با دانستن $I_1 = \\frac{\\pi}{4a^3}$ نتیجه $I_2 = \\frac{\\pi}{4a}$ بلافاصله به دست می‌آید (همان ترفند تجزیه جبری مثال ۳۵ بخش ۴).',
          },
        ],
        conceptualPoints: [
          'قاعده تشخیص: اگر عبارت زیر انتگرال توان یک باشد (مانند $\\frac{\\sin\\alpha}{\\alpha}$ یا $\\frac{\\cos\\alpha x}{1+\\alpha^2}$)، از قضیه دیریکله استفاده کنید. اگر توان دو یا چهار باشد (مانند $\\frac{\\sin^2\\alpha}{\\alpha^2}$ یا $\\frac{1}{(1+\\alpha^2)^2}$)، حتماً از اتحاد پارسوال استفاده نمایید!',
          'منشأ اتحاد، حد اتحاد پارسوال سری فوریه است: با میل دادن $\\ell \\to \\infty$، فاصله فرکانس‌های گسسته $\\Delta\\alpha = \\frac{\\pi}{\\ell} \\to 0$ میل می‌کند، مجموع $\\sum (a_n^2 + b_n^2)$ به انتگرال $\\int (A^2 + B^2)\\,d\\alpha$ تبدیل می‌شود و ضرایب گسسته به چگالی می‌رسند ($a_n \\approx \\frac{\\pi}{\\ell} A(\\alpha_n)$ مطابق بخش ۳-۱).',
          'کنترل ضرایب با یک نمونه شناخته‌شده: برای $f(x) = e^{-x}$ ($x > 0$) داریم $A(\\alpha) = \\frac{2}{\\pi(1+\\alpha^2)}$؛ پس فرم نیم‌خط می‌دهد $\\frac{2}{\\pi} \\cdot \\frac{1}{2} = \\frac{1}{\\pi} = \\frac{4}{\\pi^2}\\int_0^{\\infty} \\frac{d\\alpha}{(1+\\alpha^2)^2} \\implies \\int_0^{\\infty} \\frac{d\\alpha}{(1+\\alpha^2)^2} = \\frac{\\pi}{4}$ — اگر ضرایب $\\pi$ را جابه‌جا بنویسید همین کنترل ساده جواب غلط را لو می‌دهد.',
          'پارسوال برای تابعی که نه زوج است و نه فرد: فرم کلی $\\frac{1}{\\pi}\\int_{-\\infty}^{\\infty} f^2 = \\int_0^{\\infty}(A^2+B^2)\\,d\\alpha$ برقرار است و برای $f(x) = e^{-ax}$ روی نیم‌خط مثبت (با صفر در نیم‌خط منفی) هر دو چگالی ناصفرند: $A = \\frac{a}{\\pi(a^2+\\alpha^2)}$ و $B = \\frac{\\alpha}{\\pi(a^2+\\alpha^2)}$.',
        ],
      },
      {
        id: 'm3_6_integral_equations',
        title: 'حل معادلات انتگرالی (Integral Equations) با استفاده از انتگرال فوریه معکوس',
        pdfPages: 'صفحات ۶۹ تا ۷۱',
        summary:
          'معادله‌ای که در آن تابع مجهول زیر علامت انتگرال قرار دارد یک معادله انتگرالی است. قضایای معکوس فوریه کسینوسی و سینوسی مستقیماً این معادلات را حل می‌کنند.',
        keyFormulas: [
          {
            label: 'حل معادله انتگرالی کسینوسی $\\int_0^\\infty u(\\alpha)\\cos(\\alpha x)\\,d\\alpha = g(x)$',
            formula: '\\int_{0}^{\\infty} u(\\alpha) \\cos(\\alpha x)\\,d\\alpha = g(x) \\implies u(\\alpha) = \\frac{2}{\\pi} \\int_{0}^{\\infty} g(t) \\cos(\\alpha t)\\,dt',
            note: 'تابع مجهول $u(\\alpha)$ دقیقاً ضریب انتگرال فوریه کسینوسی تابع معلوم $g(x)$ است.',
          },
          {
            label: 'حل معادله انتگرالی سینوسی $\\int_0^\\infty u(\\alpha)\\sin(\\alpha x)\\,d\\alpha = h(x)$',
            formula: '\\int_{0}^{\\infty} u(\\alpha) \\sin(\\alpha x)\\,d\\alpha = h(x) \\implies u(\\alpha) = \\frac{2}{\\pi} \\int_{0}^{\\infty} h(t) \\sin(\\alpha t)\\,dt',
          },
        ],
        conceptualPoints: [
          'دقت کنید که متغیرهای $x$ و $\\alpha$ نقش متقابل دارند: آنچه در معادله نقش ورودی دارد، در فرمول جواب نقش آرگومان تابع معلوم را بازی می‌کند.',
        ],
      },
    ],
    workedExamples: [
      {
        id: 'ex_pdf_18_pulse',
        pdfReference: 'مثال ۱۸ جزوه (صفحه ۵۹)',
        title: 'محاسبه کامل انتگرال فوریه پالس مستطیلی و استخراج انتگرال دیریکله $\\int_{0}^{\\infty} \\frac{\\sin\\alpha}{\\alpha}\\,d\\alpha$',
        difficulty: 'متوسط (امتحانی)',
        problemStatement:
          'نمایش انتگرال فوریه تابع پالس مستطیلی $f(x) = \\begin{cases} 1 & |x| < 1 \\\\ 0 & |x| > 1 \\end{cases}$ را به صورت گام‌به‌گام بیابید و مقدار انتگرال ناسره $\\int_{0}^{\\infty} \\frac{\\sin\\alpha \\cos(\\alpha x)}{\\alpha}\\,d\\alpha$ را به ازای مقادیر مختلف $x$ تعیین کنید.',
        problemFormula: 'f(x) = \\begin{cases} 1 & -1 < x < 1 \\\\ 0 & |x| > 1 \\end{cases} \\quad \\implies \\quad I(x) = \\int_{0}^{\\infty} \\frac{\\sin\\alpha \\cos(\\alpha x)}{\\alpha}\\,d\\alpha',
        finalAnswerFormula: '\\int_{0}^{\\infty} \\frac{\\sin\\alpha \\cos(\\alpha x)}{\\alpha}\\,d\\alpha = \\begin{cases} \\frac{\\pi}{2} & |x| < 1 \\\\ \\frac{\\pi}{4} & |x| = 1 \\\\ 0 & |x| > 1 \\end{cases}',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: بررسی تقارن تابع پالس و محاسبه $B(\\alpha)$',
            explanation:
              'چون تابع $f(t)$ در بازه $(-1, 1)$ برابر $1$ و بیرون آن صفر است، نسبت به مبدأ متقارن (زوج) می‌باشد؛ بنابراین انتگرال $B(\\alpha)$ روی $(-\\infty, \\infty)$ صفر است:',
            formula:
              'B(\\alpha) = \\frac{1}{\\pi} \\int_{-\\infty}^{\\infty} f(t) \\sin(\\alpha t)\\,dt = \\frac{1}{\\pi} \\int_{-1}^{1} 1 \\cdot \\sin(\\alpha t)\\,dt = 0',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: انتگرال‌گیری کامل برای محاسبه ضریب کسینوسی $A(\\alpha)$',
            explanation:
              'اکنون ضریب $A(\\alpha)$ را با شکستن بازه $(-\\infty, \\infty)$ به $[-1, 1]$ محاسبه کرده و حدود بالا و پایین را قرار می‌دهیم:',
            formula:
              'A(\\alpha) = \\frac{1}{\\pi} \\int_{-1}^{1} 1 \\cdot \\cos(\\alpha t)\\,dt = \\frac{1}{\\pi} \\left[ \\frac{\\sin(\\alpha t)}{\\alpha} \\right]_{-1}^{1} = \\frac{\\sin(\\alpha) - \\sin(-\\alpha)}{\\pi \\alpha} = \\frac{2\\sin(\\alpha)}{\\pi \\alpha}',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: جایگذاری $A(\\alpha)$ و $B(\\alpha)$ در فرمول انتگرال فوریه',
            explanation:
              'با قرار دادن ضرایب در رابطه کلی $f(x) \\simeq \\int_{0}^{\\infty} [A(\\alpha)\\cos(\\alpha x) + B(\\alpha)\\sin(\\alpha x)]\\,d\\alpha$ داریم:',
            formula:
              'f(x) \\simeq \\int_{0}^{\\infty} \\frac{2\\sin(\\alpha)}{\\pi \\alpha} \\cos(\\alpha x)\\,d\\alpha = \\frac{2}{\\pi} \\int_{0}^{\\infty} \\frac{\\sin\\alpha \\cos(\\alpha x)}{\\alpha}\\,d\\alpha',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: ضرب طرفین در $\\frac{\\pi}{2}$ و اعمال قضیه همگرایی در نقاط پیوستگی و پرش',
            explanation:
              'در نقاط پیوستگی ($|x| < 1$ که $f(x)=1$ است و $|x| > 1$ که $f(x)=0$ است) انتگرال به خود $f(x)$ همگراست. در نقاط پرش $x = \\pm 1$ به میانگین حد چپ و راست یعنی $\\frac{1 + 0}{2} = \\frac{1}{2}$ همگرا می‌شود:',
            formula:
              '\\int_{0}^{\\infty} \\frac{\\sin\\alpha \\cos(\\alpha x)}{\\alpha}\\,d\\alpha = \\frac{\\pi}{2} \\cdot \\frac{f(x^+) + f(x^-)}{2} = \\begin{cases} \\frac{\\pi}{2}(1) = \\frac{\\pi}{2} & |x| < 1 \\\\ \\frac{\\pi}{2}\\left(\\frac{1+0}{2}\\right) = \\frac{\\pi}{4} & |x| = 1 \\\\ \\frac{\\pi}{2}(0) = 0 & |x| > 1 \\end{cases}',
          },
          {
            stepNumber: 5,
            title: 'گام ۵: استخراج انتگرال مشهور دیریکله به ازای $x = 0$',
            explanation:
              'با قرار دادن نقطه خاص $x = 0$ (که در ناحیه $|x| < 1$ قرار دارد و $\\cos(0) = 1$ است) به فرمول کلاسیک انتگرال دیریکله می‌رسیم:',
            formula:
              'x = 0 \\implies \\int_{0}^{\\infty} \\frac{\\sin\\alpha \\cdot \\cos(0)}{\\alpha}\\,d\\alpha = \\int_{0}^{\\infty} \\frac{\\sin\\alpha}{\\alpha}\\,d\\alpha = \\frac{\\pi}{2}',
            highlightNote: 'همچنین با اعمال اتحاد پارسوال روی همین مثال داریم $\\int_0^\\infty \\frac{\\sin^2\\alpha}{\\alpha^2}\\,d\\alpha = \\frac{\\pi}{2}$.',
          },
        ],
      },
      {
        id: 'ex_pdf_21_exp',
        pdfReference: 'مثال ۲۱ جزوه (صفحه ۶۴)',
        title: 'انتگرال فوریه کسینوسی و سینوسی تابع نمایی $e^{-kx}$ و اثبات انتگرال‌های لاپلاس',
        difficulty: 'متوسط (امتحانی)',
        problemStatement:
          'نمایش انتگرال فوریه کسینوسی تابع $f(x) = e^{-kx}$ ($k > 0$) را در نیم‌خط $x > 0$ با محاسبه کامل انتگرال بیابید و مقدار انتگرال ناسره $\\int_{0}^{\\infty} \\frac{\\cos(\\alpha x)}{k^2 + \\alpha^2}\\,d\\alpha$ را استخراج کنید.',
        problemFormula: 'f(x) = e^{-kx} \\quad (x > 0, \\; k > 0)',
        finalAnswerFormula: '\\int_{0}^{\\infty} \\frac{\\cos(\\alpha x)}{k^2 + \\alpha^2}\\,d\\alpha = \\frac{\\pi}{2k} e^{-kx} \\quad (x \\ge 0)',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: نوشتن فرمول ضریب انتگرال فوریه کسینوسی $A(\\alpha)$',
            explanation:
              'برای نمایش کسینوسی در نیم‌خط $x > 0$، باید انتگرال زیر را با دو بار انتگرال‌گیری جزء به جزء (یا فرمول استاندارد نمایی-مثلثاتی) محاسبه کنیم:',
            formula:
              'A(\\alpha) = \\frac{2}{\\pi} \\int_{0}^{\\infty} e^{-kt} \\cos(\\alpha t)\\,dt',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: محاسبه کامل انتگرال ناسره $I = \\int_{0}^{\\infty} e^{-kt}\\cos(\\alpha t)\\,dt$',
            explanation:
              'پادمشتق عبارت $e^{-kt}\\cos(\\alpha t)$ را نوشته و در حدود $t \\to \\infty$ و $t = 0$ محاسبه می‌کنیم:',
            formula:
              '\\int_{0}^{\\infty} e^{-kt}\\cos(\\alpha t)\\,dt = \\left[ \\frac{e^{-kt}}{k^2 + \\alpha^2} \\big( -k\\cos(\\alpha t) + \\alpha\\sin(\\alpha t) \\big) \\right]_{0}^{\\infty} = 0 - \\frac{1}{k^2 + \\alpha^2}\\big(-k(1) + 0\\big) = \\frac{k}{k^2 + \\alpha^2}',
            whyHint: 'چون $k > 0$ است، در حد $t \\to \\infty$ عامل نمایی $e^{-kt} \\to 0$ میل کرده و حد بالا را صفر می‌کند.',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: جایگذاری $A(\\alpha)$ در نمایش انتگرال فوریه کسینوسی',
            explanation:
              'با قرار دادن $A(\\alpha) = \\frac{2k}{\\pi(k^2 + \\alpha^2)}$ در رابطه $f(x) = \\int_{0}^{\\infty} A(\\alpha)\\cos(\\alpha x)\\,d\\alpha$ داریم:',
            formula:
              'e^{-kx} = \\int_{0}^{\\infty} \\frac{2k}{\\pi(k^2 + \\alpha^2)} \\cos(\\alpha x)\\,d\\alpha = \\frac{2k}{\\pi} \\int_{0}^{\\infty} \\frac{\\cos(\\alpha x)}{k^2 + \\alpha^2}\\,d\\alpha',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: ضرب طرفین در $\\frac{\\pi}{2k}$ و استخراج فرمول نهایی انتگرال لاپلاس',
            explanation:
              'با تنها کردن انتگرال در یک طرف معادله، مقدار دقیق انتگرال ناسره به دست می‌آید:',
            formula:
              '\\int_{0}^{\\infty} \\frac{\\cos(\\alpha x)}{k^2 + \\alpha^2}\\,d\\alpha = \\frac{\\pi}{2k} e^{-kx} \\quad (x \\ge 0, \\; k > 0)',
            highlightNote: 'به طریق مشابه از انتگرال فوریه سینوسی همین تابع رابطه $\\int_{0}^{\\infty} \\frac{\\alpha \\sin(\\alpha x)}{k^2 + \\alpha^2}\\,d\\alpha = \\frac{\\pi}{2} e^{-kx}$ برای $x > 0$ اثبات می‌شود.',
          },
        ],
      },
      {
        id: 'ex_pdf_triangle_integral',
        pdfReference: 'مسائل تکمیلی انتگرال فوریه (صفحه ۶۸ جزوه)',
        title: 'انتگرال فوریه پالس مثلثی متقارن و استخراج انتگرال‌های $\\int_0^\\infty \\frac{\\sin^2 u}{u^2}du$ و $\\int_0^\\infty \\frac{\\sin^4 u}{u^4}du$',
        difficulty: 'پیشرفته (تکمیلی)',
        problemStatement:
          'نمایش انتگرال فوریه پالس مثلثی $f(x) = \\begin{cases} 1 - |x| & |x| < 1 \\\\ 0 & |x| \\ge 1 \\end{cases}$ را به دست آورید و با استفاده از قضیه دیریکله و اتحاد پارسوال، مقادیر دو انتگرال ناسره $\\int_0^\\infty \\frac{\\sin^2 u}{u^2}du$ و $\\int_0^\\infty \\frac{\\sin^4 u}{u^4}du$ را به دست آورید.',
        problemFormula: 'f(x) = \\begin{cases} 1 - |x| & |x| < 1 \\\\ 0 & |x| \\ge 1 \\end{cases}',
        finalAnswerFormula: '\\int_0^{\\infty} \\frac{\\sin^2 u}{u^2}\\,du = \\frac{\\pi}{2} \\quad , \\quad \\int_0^{\\infty} \\frac{\\sin^4 u}{u^4}\\,du = \\frac{\\pi}{3}',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: بررسی زوجیت و نوشتن انتگرال ضریب $A(\\alpha)$',
            explanation:
              'چون $|-x| = |x|$ است، تابع کاملاً متقارن زوج بوده و پیوسته است؛ بنابراین $B(\\alpha) = 0$ و انتگرال $A(\\alpha)$ به فرم زیر است:',
            formula:
              'A(\\alpha) = \\frac{2}{\\pi}\\int_{0}^{1} (1 - t)\\cos(\\alpha t)\\,dt',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: انتگرال‌گیری جزء به جزء به روش DI',
            explanation:
              'با مشتق‌گیری از $u = 1-t$ و انتگرال‌گیری از $dv = \\cos(\\alpha t)dt$ داریم:',
            formula:
              'A(\\alpha) = \\frac{2}{\\pi}\\left[ (1-t)\\frac{\\sin(\\alpha t)}{\\alpha} - (-1)\\frac{-\\cos(\\alpha t)}{\\alpha^2} \\right]_{0}^{1} = \\frac{2}{\\pi}\\left( 0 - \\frac{\\cos\\alpha}{\\alpha^2} - \\left( 0 - \\frac{1}{\\alpha^2} \\right) \\right) = \\frac{2(1 - \\cos\\alpha)}{\\pi\\alpha^2} = \\frac{4\\sin^2(\\alpha/2)}{\\pi\\alpha^2}',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: نوشتن نمایش انتگرال فوریه و قرار دادن $x = 0$',
            explanation:
              'با قرار دادن $A(\\alpha)$ در نمایش انتگرال فوریه و انتخاب $x = 0$ (قله پالس که در آن $f(0)=1$ است):',
            formula:
              '1 = \\frac{4}{\\pi}\\int_{0}^{\\infty} \\frac{\\sin^2(\\alpha/2)}{\\alpha^2}\\,d\\alpha \\xrightarrow{u = \\alpha/2 \\implies d\\alpha = 2du} 1 = \\frac{4}{\\pi}\\int_{0}^{\\infty} \\frac{\\sin^2 u}{4u^2}(2du) = \\frac{2}{\\pi}\\int_0^\\infty \\frac{\\sin^2 u}{u^2}du \\implies \\int_{0}^{\\infty} \\frac{\\sin^2 u}{u^2}\\,du = \\frac{\\pi}{2}',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: اعمال اتحاد پارسوال برای استخراج انتگرال توان چهار',
            explanation:
              'طبق اتحاد پارسوال $\\frac{1}{\\pi}\\int_{-\\infty}^{\\infty} (f(x))^2 dx = \\int_0^\\infty A^2(\\alpha)d\\alpha$:',
            formula:
              '\\frac{2}{\\pi}\\int_{0}^{1} (1-x)^2 dx = \\frac{2}{\\pi}\\left[-\\frac{(1-x)^3}{3}\\right]_0^1 = \\frac{2}{3\\pi} = \\int_{0}^{\\infty} \\left(\\frac{4\\sin^2(\\alpha/2)}{\\pi\\alpha^2}\\right)^2 d\\alpha = \\frac{16}{\\pi^2}\\int_0^\\infty \\frac{\\sin^4(\\alpha/2)}{\\alpha^4}d\\alpha',
          },
          {
            stepNumber: 5,
            title: 'گام ۵: تغییر متغیر $u = \\alpha/2$ و نتیجه نهایی',
            explanation:
              'با تغییر متغیر $u = \\alpha/2$ و $d\\alpha = 2du$ داریم:',
            formula:
              '\\frac{2}{3\\pi} = \\frac{16}{\\pi^2}\\int_0^\\infty \\frac{\\sin^4 u}{16u^4}(2du) = \\frac{2}{\\pi^2}\\int_0^\\infty \\frac{\\sin^4 u}{u^4}du \\implies \\int_{0}^{\\infty} \\frac{\\sin^4 u}{u^4}\\,du = \\frac{\\pi}{3}',
            highlightNote: 'این انتگرال با روش‌های حساب دیفرانسیل معمولی به سادگی قابل محاسبه نیست، اما با پارسوال در ۳ سطر حل می‌شود.',
          },
        ],
      },
      {
        id: 'ex_pdf_parseval_general',
        pdfReference: 'مسائل تکمیلی انتگرال فوریه (صفحه ۶۹ جزوه)',
        title: 'اثبات اتحاد پارسوال حالت کلی برای تابع بدون تقارن $f(x) = e^{-ax}$ نیم‌خطی و استخراج انتگرال‌های لورنتس',
        difficulty: 'پیشرفته (تکمیلی)',
        problemStatement:
          'برای تابع $f(x) = \\begin{cases} e^{-ax} & x > 0 \\\\ 0 & x < 0 \\end{cases}$ ($a > 0$) که نه زوج است و نه فرد، هر دو چگالی طیفی $A(\\alpha)$ و $B(\\alpha)$ را محاسبه کنید و نشان دهید اتحاد پارسوال حالت کلی $\\frac{1}{\\pi}\\int_{-\\infty}^{\\infty} f^2\\,dx = \\int_0^{\\infty} (A^2 + B^2)\\,d\\alpha$ برقرار است؛ سپس از فرم نیم‌خطِ زوج، انتگرال $\\int_0^{\\infty} \\frac{d\\alpha}{(a^2+\\alpha^2)^2}$ را استخراج کنید.',
        problemFormula: 'f(x) = \\begin{cases} e^{-ax} & x > 0 \\\\ 0 & x < 0 \\end{cases} \\quad (a > 0)',
        finalAnswerFormula: '\\frac{1}{\\pi}\\int_{-\\infty}^{\\infty} f^2\\,dx = \\frac{1}{2a\\pi} = \\int_{0}^{\\infty} (A^2 + B^2)\\,d\\alpha \\quad , \\quad \\int_{0}^{\\infty} \\frac{d\\alpha}{(a^2+\\alpha^2)^2} = \\frac{\\pi}{4a^3}',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: محاسبه هر دو چگالی طیفی با انتگرال‌های استاندارد نمایی-مثلثاتی',
            explanation:
              'چون تابع روی کل محور نه زوج است و نه فرد، هر دو ضریب ناصفرند. با انتگرال‌های استاندارد پیش‌نیاز $\\int_0^{\\infty} e^{-at}\\cos(\\alpha t)dt = \\frac{a}{a^2+\\alpha^2}$ و $\\int_0^{\\infty} e^{-at}\\sin(\\alpha t)dt = \\frac{\\alpha}{a^2+\\alpha^2}$ و ضریب $\\frac{1}{\\pi}$ تعریف کلی:',
            formula:
              'A(\\alpha) = \\frac{1}{\\pi}\\int_{0}^{\\infty} e^{-at}\\cos(\\alpha t)\\,dt = \\frac{a}{\\pi(a^2+\\alpha^2)} \\quad , \\quad B(\\alpha) = \\frac{1}{\\pi}\\int_{0}^{\\infty} e^{-at}\\sin(\\alpha t)\\,dt = \\frac{\\alpha}{\\pi(a^2+\\alpha^2)}',
            whyHint: 'انتگرال روی $(-\\infty, \\infty)$ چون تابع در نیم‌خط منفی صفر است، دقیقاً به انتگرال روی $[0, \\infty)$ می‌رسد؛ ولی ضریب همچنان $\\frac{1}{\\pi}$ است نه $\\frac{2}{\\pi}$، چون تابع زوج نیست.',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: محاسبه سمت چپ اتحاد (انرژی کل سیگنال)',
            explanation:
              'تابع در نیم‌خط منفی صفر است پس انتگرال مربع آن روی کل محور به نیم‌خط مثبت محدود می‌شود:',
            formula:
              '\\frac{1}{\\pi}\\int_{-\\infty}^{\\infty} [f(x)]^2\\,dx = \\frac{1}{\\pi}\\int_{0}^{\\infty} e^{-2ax}\\,dx = \\frac{1}{\\pi}\\left[ \\frac{e^{-2ax}}{-2a} \\right]_{0}^{\\infty} = \\frac{1}{2a\\pi}',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: محاسبه سمت راست اتحاد و برابری دو طرف',
            explanation:
              'مجموع مربع دو چگالی را انتگرال می‌گیریم؛ صورت هر دو کسر مشترک است و با تجزیه جبری ساده می‌شود:',
            formula:
              '\\int_{0}^{\\infty} \\big(A^2 + B^2\\big)\\,d\\alpha = \\int_{0}^{\\infty} \\frac{a^2 + \\alpha^2}{\\pi^2(a^2+\\alpha^2)^2}\\,d\\alpha = \\frac{1}{\\pi^2}\\int_{0}^{\\infty} \\frac{d\\alpha}{a^2+\\alpha^2} = \\frac{1}{\\pi^2} \\cdot \\frac{\\pi}{2a} = \\frac{1}{2a\\pi}',
            highlightNote: 'دو طرف دقیقاً برابر شدند: اتحاد پارسوال برای تابع بدون تقارن نیز با ضریب $\\frac{1}{\\pi}$ برقرار است و هر دو مؤلفه طیف سهم برابر در بقای انرژی دارند.',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: استخراج انتگرال لورنتس توان چهار از فرم نیم‌خط زوج',
            explanation:
              'اکنون تابع زوج $g(x) = e^{-a|x|}$ را در نظر می‌گیریم که چگالی کسینوسی آن $A_g(\\alpha) = \\frac{2a}{\\pi(a^2+\\alpha^2)}$ است. فرم نیم‌خط پارسوال زوج می‌دهد:',
            formula:
              '\\frac{2}{\\pi}\\int_{0}^{\\infty} e^{-2ax}\\,dx = \\frac{1}{a\\pi} = \\int_{0}^{\\infty} \\left( \\frac{2a}{\\pi(a^2+\\alpha^2)} \\right)^2 d\\alpha = \\frac{4a^2}{\\pi^2} \\int_{0}^{\\infty} \\frac{d\\alpha}{(a^2+\\alpha^2)^2}',
            whyHint: 'کنترل در حد $a = 1$: همان نتیجه شناخته‌شده $\\int_0^{\\infty} \\frac{d\\alpha}{(1+\\alpha^2)^2} = \\frac{\\pi}{4}$ به دست می‌آید.',
          },
          {
            stepNumber: 5,
            title: 'گام ۵: نتیجه نهایی و ارتباط با انتگرال جفت',
            explanation:
              'با حل معادله گام ۴ برای انتگرال توان چهار و استفاده از قفل جبری $a^2 I_1 + I_2 = \\frac{\\pi}{2a}$ (نوشتن $a^2+\\alpha^2$ در صورت)، جفت انتگرال کامل می‌شود:',
            formula:
              'I_1 = \\int_{0}^{\\infty} \\frac{d\\alpha}{(a^2+\\alpha^2)^2} = \\frac{\\pi}{4a^3} \\quad , \\quad I_2 = \\frac{\\pi}{2a} - a^2 I_1 = \\frac{\\pi}{2a} - \\frac{\\pi}{4a} = \\frac{\\pi}{4a}',
            highlightNote: 'پارسوال در یک حرکت، انتگرالی را که با جزء‌به‌جزء نیاز به دو مرحله بازگشتی دارد، به یک معادله جبری یک‌خطی تبدیل می‌کند.',
          },
        ],
      },
      {
        id: 'ex_pdf_cosine_integral_eq',
        pdfReference: 'معادلات انتگرالی فوریه (صفحه ۷۰ جزوه)',
        title: 'حل معادله انتگرالی کسینوسی $\\int_0^\\infty f(x)\\cos(\\alpha x)dx = 1 - \\alpha$ با فرمول معکوس',
        difficulty: 'متوسط (امتحانی)',
        problemStatement:
          'معادله انتگرالی $\\int_{0}^{\\infty} f(x) \\cos(\\alpha x)\\,dx = \\begin{cases} 1 - \\alpha & 0 \\le \\alpha \\le 1 \\\\ 0 & \\alpha > 1 \\end{cases}$ را حل کرده و ضابطه تابع مجهول $f(x)$ را بیابید.',
        problemFormula: '\\int_{0}^{\\infty} f(x) \\cos(\\alpha x)\\,dx = g(\\alpha) = \\begin{cases} 1 - \\alpha & 0 \\le \\alpha \\le 1 \\\\ 0 & \\alpha > 1 \\end{cases}',
        finalAnswerFormula: 'f(x) = \\frac{2(1 - \\cos x)}{\\pi x^2} = \\frac{4\\sin^2(x/2)}{\\pi x^2}',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: تشخیص ساختار معادله انتگرالی کسینوسی',
            explanation:
              'صورت معادله بیانگر انتگرال فوریه کسینوسی معکوس است. اگر $\\int_0^\\infty f(x)\\cos(\\alpha x)dx = g(\\alpha)$ باشد، آنگاه طبق فرمول وارون انتگرال فوریه کسینوسی داریم:',
            formula:
              'f(x) = \\frac{2}{\\pi} \\int_{0}^{\\infty} g(\\alpha) \\cos(\\alpha x)\\,d\\alpha',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: جایگذاری ضابطه $g(\\alpha)$ و محدود کردن بازه انتگرال‌گیری',
            explanation:
              'چون $g(\\alpha)$ فقط در بازه $[0, 1]$ ناصفر و برابر $1-\\alpha$ است، حدود انتگرال به $[0, 1]$ محدود می‌شود:',
            formula:
              'f(x) = \\frac{2}{\\pi} \\int_{0}^{1} (1 - \\alpha) \\cos(\\alpha x)\\,d\\alpha',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: انتگرال‌گیری جزء به جزء و استخراج فرم نهایی $f(x)$',
            explanation:
              'با روش جزء‌به‌جزء جدولی داریم:',
            formula:
              'f(x) = \\frac{2}{\\pi} \\left[ (1 - \\alpha)\\frac{\\sin(\\alpha x)}{x} - (-1)\\frac{-\\cos(\\alpha x)}{x^2} \\right]_{0}^{1} = \\frac{2}{\\pi} \\left( 0 - \\frac{\\cos x}{x^2} - \\left(0 - \\frac{1}{x^2}\\right) \\right) = \\frac{2(1 - \\cos x)}{\\pi x^2}',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: ساده‌سازی با اتحاد مثلثاتی زاویه دوبرابر',
            explanation:
              'با جایگذاری $1 - \\cos x = 2\\sin^2(x/2)$ فرم بسته زیبا و فاقد تکینگی حاصل می‌شود:',
            formula:
              'f(x) = \\frac{4\\sin^2(x/2)}{\\pi x^2}',
            highlightNote: 'دقت کنید که $\\lim_{x \\to 0} f(x) = \\frac{4}{\\pi} \\times \\frac{1}{4} = \\frac{1}{\\pi}$ است و تابع در مبدأ کاملاً خوش‌رفتار است.',
          },
        ],
      },
      {
        id: 'ex_pdf_sine_integral_eq',
        pdfReference: 'معادلات انتگرالی سینوسی (صفحه ۷۱ جزوه)',
        title: 'حل معادله انتگرالی سینوسی $\\int_0^\\infty f(x)\\sin(\\alpha x)dx = e^{-\\alpha}$ و بررسی نقطه $x=0$',
        difficulty: 'متوسط (امتحانی)',
        problemStatement:
          'پاسخ معادله انتگرالی $\\int_{0}^{\\infty} f(x) \\sin(\\alpha x)\\,dx = e^{-\\alpha}$ (به ازای $\\alpha > 0$) را بیابید و مقدار $f(0)$ را تحلیل نمایید.',
        problemFormula: '\\int_{0}^{\\infty} f(x) \\sin(\\alpha x)\\,dx = e^{-\\alpha} \\quad (\\alpha > 0)',
        finalAnswerFormula: 'f(x) = \\frac{2x}{\\pi(1 + x^2)} \\quad (x > 0)',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: استفاده از فرمول وارون انتگرال فوریه سینوسی',
            explanation:
              'اگر $\\int_0^\\infty f(x)\\sin(\\alpha x)dx = h(\\alpha)$ باشد، بر اساس قضیه وارون فوریه سینوسی داریم:',
            formula:
              'f(x) = \\frac{2}{\\pi} \\int_{0}^{\\infty} h(\\alpha) \\sin(\\alpha x)\\,d\\alpha',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: جایگذاری $h(\\alpha) = e^{-\\alpha}$ و محاسبه انتگرال',
            explanation:
              'با دو بار جزء به جزء گرفتن (فرمول استاندارد ضرب نمایی در سینوس) داریم:',
            formula:
              'f(x) = \\frac{2}{\\pi} \\int_{0}^{\\infty} e^{-\\alpha} \\sin(\\alpha x)\\,d\\alpha = \\frac{2}{\\pi} \\left[ \\frac{e^{-\\alpha}}{1 + x^2} \\big( -\\sin(\\alpha x) - x\\cos(\\alpha x) \\big) \\right]_{0}^{\\infty} = 0 - \\frac{2}{\\pi(1 + x^2)}(-x) = \\frac{2x}{\\pi(1 + x^2)}',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: بررسی همگرایی در $x = 0$ و رفتار مجانبی',
            explanation:
              'در $x = 0$، $f(0) = 0$ است که کاملاً با ماهیت فرد بودن انتگرال فوریه سینوسی همخوانی دارد. برای مقادیر بزرگ $x$ نیز تابع به صورت $\\mathcal{O}(1/x)$ افت می‌کند.',
            formula:
              'f(0) = 0 \\quad , \\quad \\lim_{x \\to \\infty} f(x) = 0',
          },
        ],
      },
      {
        id: 'ex_pdf_dirichlet_gibbs_integral',
        pdfReference: 'پدیده گیبس در انتگرال فوریه (صفحه ۶۱ جزوه)',
        title: 'تحلیل دقیق تحلیلی و عددی پدیده گیبس (Gibbs Phenomenon) در انتگرال فوریه جزئی پالس مستطیلی',
        difficulty: 'پیشرفته (تکمیلی)',
        problemStatement:
          'انتگرال فوریه جزئی $I_\\Omega(x) = \\frac{2}{\\pi}\\int_0^\\Omega \\frac{\\sin\\alpha \\cos(\\alpha x)}{\\alpha}d\\alpha$ را با تابع انتگرال سینوسی $\\operatorname{Si}(u) = \\int_0^u \\frac{\\sin t}{t}dt$ بیان کرده و مقدار ماکزیمم فراجهش گیبس را در اطراف نقطه پرش $x = 1$ اثبات کنید.',
        problemFormula: 'I_\\Omega(x) = \\frac{2}{\\pi} \\int_{0}^{\\Omega} \\frac{\\sin\\alpha \\cos(\\alpha x)}{\\alpha}\\,d\\alpha',
        finalAnswerFormula: 'I_\\Omega(x) = \\frac{1}{\\pi}\\Big[ \\operatorname{Si}(\\Omega(1+x)) + \\operatorname{Si}(\\Omega(1-x)) \\Big] \\implies \\text{Peak} \\approx 1.0895 \\; (+8.95\\%)',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: تبدیل ضرب مثلثاتی به جمع سینوس‌ها با اتحاد حاصل‌ضرب',
            explanation:
              'از اتحاد $2\\sin\\alpha\\cos(\\alpha x) = \\sin(\\alpha(1+x)) + \\sin(\\alpha(1-x))$ استفاده می‌کنیم:',
            formula:
              'I_\\Omega(x) = \\frac{1}{\\pi} \\int_{0}^{\\Omega} \\frac{\\sin(\\alpha(1+x))}{\\alpha}\\,d\\alpha + \\frac{1}{\\pi} \\int_{0}^{\\Omega} \\frac{\\sin(\\alpha(1-x))}{\\alpha}\\,d\\alpha',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: تغییر متغیر و تبدیل به تابع استاندارد $\\operatorname{Si}(u)$',
            explanation:
              'با قرار دادن $t = \\alpha(1+x)$ در انتگرال اول و $t = \\alpha(1-x)$ در انتگرال دوم، تعریف انتگرال سینوسی $\\operatorname{Si}(u) = \\int_0^u \\frac{\\sin t}{t}dt$ ظاهر می‌شود:',
            formula:
              'I_\\Omega(x) = \\frac{1}{\\pi} \\Big[ \\operatorname{Si}(\\Omega(1+x)) + \\operatorname{Si}(\\Omega(1-x)) \\Big]',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: یافتن مکان ماکزیمم فراجهش و محاسبه مقدار عددی',
            explanation:
              'تابع $\\operatorname{Si}(u)$ اولین ماکزیمم مطلق خود را در $u = \\pi$ تجربه می‌کند که در آن $\\operatorname{Si}(\\pi) \\approx 1.8519$ است. با نزدیک شدن $x$ از داخل پالس به مرز $x = 1$ در فاصله $1 - x = \\frac{\\pi}{\\Omega}$:',
            formula:
              '\\operatorname{Si}(\\Omega(1-x)) = \\operatorname{Si}(\\pi) \\approx 1.8519 \\quad , \\quad \\operatorname{Si}(\\Omega(1+x)) \\approx \\operatorname{Si}(2\\Omega) \\approx \\frac{\\pi}{2} \\approx 1.5708',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: محاسبه درصد فراجهش فراتر از ارتفاع پالس ($1$)',
            explanation:
              'مقدار قله نوسان گیبس به دست می‌آید:',
            formula:
              'I_\\Omega\\left(1 - \\frac{\\pi}{\\Omega}\\right) \\approx \\frac{1}{\\pi}\\left( \\frac{\\pi}{2} + 1.8519 \\right) = \\frac{1}{2} + \\frac{1.8519}{\\pi} \\approx 0.5 + 0.5895 = 1.0895',
            highlightNote: 'ارتفاع پالس برابر ۱ است اما انتگرال جزئی به ۱.۰۸۹۵ می‌رسد؛ یعنی دقیقاً ۸.۹۵٪ فراجهش (Overshoot) که حتی با $\\Omega \\to \\infty$ نیز حذف نمی‌شود، بلکه تنها به مرز $x=1$ فشرده‌تر می‌گردد!',
          },
        ],
      },
    ],
    practiceQuestions: [
      {
        id: 'q1_m3',
        question: 'مقدار انتگرال دیریکله $\\int_{0}^{\\infty} \\frac{\\sin\\alpha \\cos(\\alpha x)}{\\alpha}\\,d\\alpha$ به ازای $x = 1$ (نقطه پرش پالس واحد) چقدر است؟',
        options: ['\\frac{\\pi}{2}', '\\frac{\\pi}{4}', '0', '\\pi'],
        correctIndex: 1,
        explanation:
          'در نقطه پرش $x = 1$، طبق قضیه همگرایی دیریکله انتگرال به میانگین حد چپ ($1$) و حد راست ($0$) همگراست: $\\frac{1+0}{2} \\times \\frac{\\pi}{2} = \\frac{\\pi}{4}$.',
      },
      {
        id: 'q2_m3',
        question: 'در نمایش انتگرال فوریه یک تابع زوج $f(x)$ که در شرط مطلقاً انتگرال‌پذیری صدق می‌کند، ضریب سینوسی $B(\\alpha)$ چه مقداری دارد؟',
        options: [
          'B(\\alpha) = 0',
          'B(\\alpha) = \\frac{2}{\\pi}\\int_0^\\infty f(t)\\sin(\\alpha t)\\,dt',
          'B(\\alpha) = A(\\alpha)',
          'B(\\alpha) = 1',
        ],
        correctIndex: 0,
        explanation:
          'برای تابع زوج $f(t)$، حاصل‌ضرب $f(t)\\sin(\\alpha t)$ تابعی فرد است و انتگرال آن از $-\\infty$ تا $+\\infty$ برابر صفر می‌شود؛ بنابراین $B(\\alpha) = 0$ است.',
      },
      {
        id: 'q3_m3',
        question: 'حاصل انتگرال لاپلاس $\\int_0^\\infty \\frac{\\cos(\\alpha x)}{1 + \\alpha^2}\\,d\\alpha$ به ازای $x > 0$ کدام است؟',
        options: [
          '\\frac{\\pi}{2} e^{-x}',
          '\\pi e^{-x}',
          '\\frac{1}{2} e^{-x^2}',
          '\\frac{\\pi}{4} e^{-2x}',
        ],
        correctIndex: 0,
        explanation:
          'از انتگرال فوریه کسینوسی تابع $f(x) = e^{-x}$ در بازه $x > 0$ نتیجه می‌شود $\\int_0^\\infty \\frac{\\cos(\\alpha x)}{1+\\alpha^2}d\\alpha = \\frac{\\pi}{2}e^{-x}$.',
      },
      {
        id: 'q4_m3',
        question: 'با استفاده از اتحاد پارسوال برای انتگرال فوریه تابع نمایی دوطرفه $f(x) = e^{-|x|}$، مقدار انتگرال ناسره $\\int_0^\\infty \\frac{d\\alpha}{(1 + \\alpha^2)^2}$ چقدر به دست می‌آید؟',
        options: [
          '\\frac{\\pi}{4}',
          '\\frac{\\pi}{2}',
          '\\frac{\\pi}{8}',
          '\\frac{\\pi}{3}',
        ],
        correctIndex: 0,
        explanation:
          'چون $A(\\alpha) = \\frac{2}{\\pi(1+\\alpha^2)}$ است، طبق پارسوال $\\frac{1}{\\pi}\\int_{-\\infty}^\\infty e^{-2|x|}dx = \\int_0^\\infty [A(\\alpha)]^2 d\\alpha$. سمت چپ برابر $\\frac{1}{\\pi}$ است (زیرا $\\int_{-\\infty}^\\infty e^{-2|x|}dx = 2 \\times \\frac{1}{2} = 1$)، بنابراین $\\frac{4}{\\pi^2}\\int_0^\\infty \\frac{d\\alpha}{(1+\\alpha^2)^2} = \\frac{1}{\\pi} \\implies \\int_0^\\infty \\frac{d\\alpha}{(1+\\alpha^2)^2} = \\frac{\\pi}{4}$.',
      },
      {
        id: 'q5_m3',
        question: 'اگر معادله انتگرالی $\\int_0^\\infty f(x)\\cos(\\alpha x)\\,dx = e^{-2\\alpha}$ داده شده باشد، ضابطه تابع مجهول $f(x)$ کدام است؟',
        options: [
          'f(x) = \\frac{4}{\\pi(4 + x^2)}',
          'f(x) = \\frac{2}{\\pi(4 + x^2)}',
          'f(x) = \\frac{2x}{\\pi(4 + x^2)}',
          'f(x) = \\frac{1}{\\pi(2 + x^2)}',
        ],
        correctIndex: 0,
        explanation:
          'طبق قضیه معکوس انتگرال فوریه کسینوسی: $f(x) = \\frac{2}{\\pi}\\int_0^\\infty e^{-2\\alpha}\\cos(\\alpha x)d\\alpha = \\frac{2}{\\pi} \\times \\frac{2}{4 + x^2} = \\frac{4}{\\pi(4 + x^2)}$.',
      },
      {
        id: 'q6_m3',
        question: 'مقدار ماکزیمم فراجهش ناشی از پدیده گیبس در تقریب انتگرال فوریه جزئی $I_\\Omega(x)$ برای پالس مستطیلی با دامنه واحد، تقریباً چند درصد است؟',
        options: ['8.95\\%', '17.9\\%', '5.0\\%', 'صفر (پدیده گیبس در انتگرال وجود ندارد)'],
        correctIndex: 0,
        explanation:
          'پدیده گیبس در انتگرال فوریه دقیقا مشابه سری فوریه رخ می‌دهد و بیشینه نوسان در نزدیکی نقطه پرش برابر $\\frac{1}{2} + \\frac{1}{\\pi}\\operatorname{Si}(\\pi) \\approx 1.0895$ است که نشان‌دهنده ۸.۹۵٪ فراجهش است.',
      },
      {
        id: 'q7_m3',
        question: 'اتحاد پارسوال برای انتگرال فوریه تابعی که نه زوج است و نه فرد، به کدام شکل درست است؟',
        options: [
          '\\frac{1}{\\pi}\\int_{-\\infty}^{\\infty} f^2\\,dx = \\int_0^{\\infty} \\big(A^2(\\alpha) + B^2(\\alpha)\\big)\\,d\\alpha',
          '\\frac{2}{\\pi}\\int_{-\\infty}^{\\infty} f^2\\,dx = \\int_0^{\\infty} \\big(A^2 + B^2\\big)\\,d\\alpha',
          '\\frac{1}{\\pi}\\int_{-\\infty}^{\\infty} f^2\\,dx = \\int_0^{\\infty} A^2(\\alpha)\\,d\\alpha',
          '\\int_{-\\infty}^{\\infty} f^2\\,dx = \\frac{1}{\\pi}\\int_0^{\\infty} \\big(A^2 + B^2\\big)\\,d\\alpha',
        ],
        correctIndex: 0,
        explanation:
          'در حالت کلی هر دو چگالی طیفی سهم دارند و ضریب $\\frac{1}{\\pi}$ سمت چپ است؛ یعنی $\\int f^2\\,dx = \\pi\\int(A^2+B^2)\\,d\\alpha$. گزینه چهارم ضرایب را وارونه نوشته است (خطای رایج $\\pi^2$-ای) و فرم $\\frac{2}{\\pi}\\int_0^{\\infty}$ فقط برای توابع زوج یا فرد روی نیم‌خط معتبر است.',
      },
      {
        id: 'q8_m3',
        question: 'برای $f(x) = e^{-2x}$ روی نیم‌خط مثبت (و صفر در نیم‌خط منفی)، حاصل $\\int_0^{\\infty} \\big(A^2(\\alpha) + B^2(\\alpha)\\big)\\,d\\alpha$ چقدر است؟',
        options: [
          '\\frac{1}{4\\pi}',
          '\\frac{1}{2\\pi}',
          '\\frac{1}{8\\pi}',
          '\\frac{\\pi}{4}',
        ],
        correctIndex: 0,
        explanation:
          'چگالی‌ها $A = \\frac{2}{\\pi(4+\\alpha^2)}$ و $B = \\frac{\\alpha}{\\pi(4+\\alpha^2)}$ هستند؛ پس $\\int_0^{\\infty}(A^2+B^2)d\\alpha = \\frac{1}{\\pi^2}\\int_0^{\\infty} \\frac{d\\alpha}{4+\\alpha^2} = \\frac{1}{\\pi^2} \\cdot \\frac{\\pi}{4} = \\frac{1}{4\\pi}$. کنترل با سمت چپ اتحاد: $\\frac{1}{\\pi}\\int_0^{\\infty} e^{-4x}dx = \\frac{1}{4\\pi}$ است.',
      },
    ],
  },
  {
    id: 'module_4_fourier_transform',
    shortTitle: '۴. تبدیل فوریه',
    numberLabel: 'بخش ۴',
    title: 'تبدیل فوریه و قضایای کاربردی آن (Fourier Transform Handbook)',
    subtitle: 'جزوه جامع تبدیل فوریه مختلط، قضایای تقارن، انتقال، مدولاسیون، مقیاس، مشتق و انتگرال، کانولوشن، پارسوال، تبدیل‌های سینوسی/کسینوسی و حل معادلات PDE',
    pdfPageRange: 'صفحات ۷۲ تا ۱۰۵ جزوه',
    simulatorType: 'fourier_transform',
    layoutComplexity: 'wide_canvas',
    subtopics: [
      {
        id: 'm4_1_definition_inversion',
        title: '۱. گذار از انتگرال به تبدیل فوریه مختلط، فرمول معکوس و طیف اندازه و فاز',
        pdfPages: 'صفحات ۷۲ تا ۷۵',
        summary:
          'تبدیل فوریه شکل نمایی فشرده و جبری انتگرال فوریه است که سیگنال‌های نامتناوب $f(x) \\in L^1(\\mathbb{R})$ را به حوزه فرکانس پیوسته $\\alpha$ نگاشت می‌دهد. با استفاده از فرمول اویلر $e^{-i\\alpha t} = \\cos(\\alpha t) - i\\sin(\\alpha t)$، تابع حقیقی به طیف مختلط $F(\\alpha) = |F(\\alpha)|e^{i\\theta(\\alpha)}$ با طیف دامنه زوج و طیف فاز فرد تبدیل می‌شود.',
        keyFormulas: [
          {
            label: 'تعریف مستقیم تبدیل فوریه (منطبق با قرارداد استاندارد مهندسی جزوه دکتر طائری)',
            formula:
              'F(\\alpha) = \\mathcal{F}\\big[f(x)\\big] = \\int_{-\\infty}^{\\infty} f(t)\\,e^{-i\\alpha t}\\,dt \\quad (\\alpha \\in \\mathbb{R})',
            note: 'شرط وجود تبدیل: تابع $f(x)$ باید بر کل خط حقیقی انتگرال‌پذیر مطلق باشد: $\\int_{-\\infty}^{\\infty} |f(x)|\\,dx < \\infty$.',
          },
          {
            label: 'فرمول تبدیل فوریه معکوس (Inverse Fourier Transform)',
            formula:
              'f(x) = \\mathcal{F}^{-1}\\big[F(\\alpha)\\big] = \\frac{1}{2\\pi} \\int_{-\\infty}^{\\infty} F(\\alpha)\\,e^{i\\alpha x}\\,d\\alpha',
            note: 'دقت کنید که در قرارداد مرجع جزوه، ضریب نرمال‌سازی $\\frac{1}{2\\pi}$ در انتگرال معکوس قرار داده شده و توان نمایی تبدیل مستقیم $-i\\alpha t$ است.',
          },
          {
            label: 'ارتباط تبدیل فوریه با ضرایب انتگرال فوریه حقیقی $A(\\alpha)$ و $B(\\alpha)$',
            formula:
              'F(\\alpha) = \\pi \\big[ A(\\alpha) - i B(\\alpha) \\big] \\iff A(\\alpha) = \\frac{1}{\\pi} \\operatorname{Re} F(\\alpha) \\quad , \\quad B(\\alpha) = -\\frac{1}{\\pi} \\operatorname{Im} F(\\alpha)',
          },
          {
            label: 'مقدار تبدیل در فرکانس صفر (DC Component)',
            formula:
              'F(0) = \\int_{-\\infty}^{\\infty} f(t)\\,dt = \\text{مساحت جبری کل زیر نمودار تابع در حوزه مکان}',
          },
        ],
        conceptualPoints: [
          'اگر $f(x)$ تابعی حقیقی باشد، $F(-\\alpha) = \\overline{F(\\alpha)}$ است (تقارن هرمیتی)؛ بنابراین اندازه $|F(\\alpha)|$ همواره تابعی زوج و فاز $\\theta(\\alpha)$ همواره تابعی فرد است.',
          'در نقاط ناپیوستگی جهشی، تبدیل معکوس فوریه دقیقاً به مقدار میانگین جهش دیریکله $\\frac{f(x^+) + f(x^-)}{2}$ همگرا می‌شود.',
        ],
      },
      {
        id: 'm4_2_duality_symmetry',
        title: '۲. قضیه خطی بودن و قضیه تقارن (دوگانی / Duality Theorem)',
        pdfPages: 'صفحات ۷۶ تا ۷۸',
        summary:
          'قضیه تقارن یکی از زیباترین و قدرتمندترین ابزارهای آنالیز فوریه است. این قضیه بیان می‌کند که اگر جفت تبدیل $f(x) \\leftrightarrow F(\\alpha)$ را بشناسیم، تبدیل فوریه تابعی با ضابطه $F(x)$ مستقیماً برابر $2\\pi f(-\\alpha)$ خواهد بود، بدون نیاز به محاسبه هیچ انتگرال جدیدی.',
        keyFormulas: [
          {
            label: 'قضیه تقارن (دوگانی / Symmetry Theorem)',
            formula:
              '\\mathcal{F}\\big[ f(x) \\big] = F(\\alpha) \\implies \\mathcal{F}\\big[ F(x) \\big] = 2\\pi\\,f(-\\alpha)',
            note: 'اگر تابع $f(x)$ زوج باشد ($f(-\\alpha) = f(\\alpha)$)، رابطه به فرم ساده $\\mathcal{F}[F(x)] = 2\\pi f(\\alpha)$ درمی‌آید.',
          },
          {
            label: 'قضیه ترکیب خطی (Linearity)',
            formula:
              '\\mathcal{F}\\big[ c_1 f_1(x) + c_2 f_2(x) \\big] = c_1 F_1(\\alpha) + c_2 F_2(\\alpha) \\quad (\\forall c_1, c_2 \\in \\mathbb{C})',
          },
          {
            label: 'نمونه کاربرد تقارن: استخراج تبدیل تابع لورنتس از نمایی دوطرفه',
            formula:
              '\\mathcal{F}\\big[ e^{-a|x|} \\big] = \\frac{2a}{a^2+\\alpha^2} \\xrightarrow{\\text{Symmetry}} \\mathcal{F}\\left[ \\frac{1}{x^2+a^2} \\right] = \\frac{\\pi}{a} e^{-a|\\alpha|}',
          },
        ],
        conceptualPoints: [
          'قضیه تقارن به ما اجازه می‌دهد جفت‌های دوگانه بسازیم: تبدیل پالس مستطیلی تابع سینک است؛ بنابراین تبدیل تابع سینک یک پالس مستطیلی است!',
        ],
      },
      {
        id: 'm4_3_shifts_modulation',
        title: '۳. قضایای انتقال زمان، انتقال فرکانس و مدولاسیون حامل (Modulation)',
        pdfPages: 'صفحات ۷۹ تا ۸۲',
        summary:
          'تأخیر زمانی سیگنال در مکان، صرفاً فاز فرکانسی را تغییر می‌دهد بدون تغییر دامنه. متقابلاً ضرب تابع در یک حامل هارمونیک، طیف فرکانسی را به مرکز فرکانس حامل منتقل می‌کند که اساس مدولاسیون مخابراتی است.',
        keyFormulas: [
          {
            label: 'قضیه انتقال زمان (Time Shifting Theorem)',
            formula:
              '\\mathcal{F}\\big[ f(x - x_0) \\big] = e^{-i\\alpha x_0} F(\\alpha) \\quad (x_0 \\in \\mathbb{R})',
            note: 'اندازه طیف تغییر نمی‌کند: $|\\mathcal{F}[f(x-x_0)]| = |F(\\alpha)|$؛ تنها فاز به اندازه $-\\alpha x_0$ شیفت خطی می‌خورد.',
          },
          {
            label: 'قضیه انتقال فرکانس (Frequency Shifting Theorem)',
            formula:
              '\\mathcal{F}\\big[ e^{i\\omega_0 x} f(x) \\big] = F(\\alpha - \\omega_0) \\quad , \\quad \\mathcal{F}\\big[ e^{-i\\omega_0 x} f(x) \\big] = F(\\alpha + \\omega_0)',
          },
          {
            label: 'قضیه مدولاسیون کسینوسی و سینوسی (AM Modulation)',
            formula:
              '\\mathcal{F}\\big[ f(x)\\cos(\\omega_0 x) \\big] = \\frac{1}{2}\\Big[ F(\\alpha - \\omega_0) + F(\\alpha + \\omega_0) \\Big] \\quad , \\quad \\mathcal{F}\\big[ f(x)\\sin(\\omega_0 x) \\big] = \\frac{1}{2i}\\Big[ F(\\alpha - \\omega_0) - F(\\alpha + \\omega_0) \\Big]',
          },
        ],
        conceptualPoints: [
          'در مخابرات رادیویی، برای ارسال سیگنال صوتی با پهنای باند کم روی آنتن‌های کوچک، آن را در $\\cos(\\omega_0 t)$ ضرب می‌کنند تا طیف به فرکانس‌های بالای حامل $\\pm\\omega_0$ منتقل شود.',
        ],
      },
      {
        id: 'm4_4_scaling_uncertainty',
        title: '۴. قضیه مقیاس مکان/فرکانس و اصل عدم قطعیت هایزنبرگ-گابور',
        pdfPages: 'صفحات ۸۳ تا ۸۶',
        summary:
          'فشرده‌سازی سیگنال در حوزه مکان، همواره منجر به باز شدن و گسترش طیف فرکانسی آن می‌شود و بالعکس. حاصل‌ضرب پهنای زمانی در پهنای فرکانسی هرگز نمی‌تواند از یک مقدار آستانه کمتر شود.',
        keyFormulas: [
          {
            label: 'قضیه تغییر مقیاس (Time & Frequency Scaling)',
            formula:
              '\\mathcal{F}\\big[ f(ax) \\big] = \\frac{1}{|a|} F\\left(\\frac{\\alpha}{a}\\right) \\quad (a \\neq 0)',
            note: 'اگر $a = -1$ باشد، قضیه معکوس زمانی به دست می‌آید: $\\mathcal{F}[f(-x)] = F(-\\alpha)$.',
          },
          {
            label: 'اصل عدم قطعیت هایزنبرگ-گابور (Fourier Uncertainty Principle)',
            formula:
              '\\Delta x \\cdot \\Delta \\alpha \\ge \\frac{1}{2}',
            note: 'تساوی دقیقاً و منحصراً برای تابع زنگوله‌ای گاوسی $f(x) = C e^{-a x^2}$ برقرار است.',
          },
        ],
        conceptualPoints: [
          'یک پالس بسیار کوتاه زمانی (مثل ضربه دیراک با $\\Delta x \\to 0$) دارای طیف نامتناهی گسترده در همه فرکانس‌ها است: $\\mathcal{F}[\\delta(x)] = 1$.',
          'یک موج تک‌فرکانسی نامتناهی زمانی (مثل سینوس با $\\Delta \\alpha \\to 0$) در تمام محور زمان گسترده است.',
        ],
      },
      {
        id: 'm4_5_derivatives_integrals',
        title: '۵. قضایای مشتق مکان، مشتق فرکانس و انتگرال در مکان',
        pdfPages: 'صفحات ۸۶ تا ۸۹',
        summary:
          'تبدیل فوریه عملیات دشوار دیفرانسیل‌گیری در مکان را به ضرب جبری در $(i\\alpha)$ و ضرب در $x$ در مکان را به مشتق‌گیری نسبت به فرکانس در حوزه $\\alpha$ تبدیل می‌کند.',
        keyFormulas: [
          {
            label: 'قضیه مشتق مکان مرتبه $n$ (Space Derivative)',
            formula:
              '\\mathcal{F}\\Big[ f^{(n)}(x) \\Big] = (i\\alpha)^n F(\\alpha) \\quad \\implies \\quad \\mathcal{F}\\big[ f\'\'(x) \\big] = -\\alpha^2 F(\\alpha)',
            note: 'شرط لازم: توابع $f, f\', \\dots, f^{(n-1)}$ باید در $x \\to \\pm\\infty$ به صفر میل کنند.',
          },
          {
            label: 'قضیه مشتق فرکانس مرتبه $n$ (Frequency Derivative)',
            formula:
              '\\mathcal{F}\\Big[ x^n f(x) \\Big] = i^n \\frac{d^n}{d\\alpha^n} F(\\alpha) \\quad \\implies \\quad \\mathcal{F}\\big[ x f(x) \\big] = i \\frac{d}{d\\alpha} F(\\alpha)',
          },
          {
            label: 'قضیه انتگرال در مکان',
            formula:
              '\\mathcal{F}\\left[ \\int_{-\\infty}^{x} f(t)\\,dt \\right] = \\frac{F(\\alpha)}{i\\alpha} + \\pi F(0)\\,\\delta(\\alpha)',
          },
        ],
        conceptualPoints: [
          'خاصیت $\\mathcal{F}[f\'\'(x)] = -\\alpha^2 F(\\alpha)$ دلیل بنیادین موفقیت تبدیل فوریه در حل معادلات دیفرانسیل با مشتقات جزئی (PDE) مانند معادله گرما $u_t = c^2 u_{xx}$ و موج $u_{tt} = c^2 u_{xx}$ است، زیرا مشتقات مکانی مرتبه دو را به ضرب در $-\\alpha^2$ ساده تبدیل می‌کند.',
        ],
      },
      {
        id: 'm4_6_convolution_parseval',
        title: '۶. قضیه کانولوشن زمان و فرکانس، اتحاد پارسوال و حل معادلات انتگرالی',
        pdfPages: 'صفحات ۸۹ تا ۹۷',
        summary:
          'کانولوشن دو سیگنال در حوزه مکان معادل ضرب ساده تبدیل‌های آن‌ها در فرکانس است. اتحاد پارسوال بقای انرژی را بین حوزه مکان و فرکانس برقرار کرده و ابزاری فوق‌العاده برای محاسبه انتگرال‌های ناسره بسیار دشوار است.',
        keyFormulas: [
          {
            label: 'تعریف کانولوشن پیوسته (Continuous Convolution)',
            formula:
              '(f * g)(x) = \\int_{-\\infty}^{\\infty} f(t)\\,g(x - t)\\,dt = \\int_{-\\infty}^{\\infty} f(x - t)\\,g(t)\\,dt',
          },
          {
            label: 'قضیه کانولوشن زمان (Time Convolution Theorem)',
            formula:
              '\\mathcal{F}\\big[ (f * g)(x) \\big] = F(\\alpha) \\cdot G(\\alpha)',
          },
          {
            label: 'قضیه کانولوشن فرکانس (Frequency Convolution Theorem)',
            formula:
              '\\mathcal{F}\\big[ f(x) g(x) \\big] = \\frac{1}{2\\pi} (F * G)(\\alpha) = \\frac{1}{2\\pi} \\int_{-\\infty}^{\\infty} F(u)\\,G(\\alpha - u)\\,du',
          },
          {
            label: 'اتحاد پارسوال / پلانشرل تبدیل فوریه (Parseval’s Energy Identity)',
            formula:
              '\\int_{-\\infty}^{\\infty} |f(x)|^2\\,dx = \\frac{1}{2\\pi} \\int_{-\\infty}^{\\infty} |F(\\alpha)|^2\\,d\\alpha',
            note: 'انرژی کل سیگنال در حوزه مکان برابر انرژی طیف فرکانسی آن تقسیم بر $2\\pi$ است.',
          },
        ],
        conceptualPoints: [
          'برای حل معادلات انتگرالی کانولوشن فریدریش به فرم $\\int_{-\\infty}^{\\infty} u(t)k(x-t)dt = h(x)$، کافی است از طرفین تبدیل فوریه بگیریم: $U(\\alpha)K(\\alpha) = H(\\alpha) \\implies U(\\alpha) = \\frac{H(\\alpha)}{K(\\alpha)}$ و سپس تبدیل معکوس بگیریم.',
        ],
      },
      {
        id: 'm4_7_sine_cosine_transforms',
        title: '۷. تبدیل‌های فوریه سینوسی و کسینوسی در نیم‌خط $x > 0$ و شرایط مرزی PDE',
        pdfPages: 'صفحات ۹۸ تا ۱۰۵',
        summary:
          'برای مسائلی که دامنه مکانی آن‌ها نیم‌خط مثبت $[0, \\infty)$ است (مانند میله نیمه‌نامتناهی)، از تبدیل فوریه سینوسی $\\mathcal{F}_s$ یا کسینوسی $\\mathcal{F}_c$ استفاده می‌شود. انتخاب تبدیل دقیقاً وابسته به نوع شرط مرزی در مبدأ $x=0$ است.',
        keyFormulas: [
          {
            label: 'تعریف تبدیل‌های فوریه کسینوسی و سینوسی و معکوس آن‌ها',
            formula:
              'F_c(\\alpha) = \\sqrt{\\frac{2}{\\pi}} \\int_{0}^{\\infty} f(x)\\cos(\\alpha x)\\,dx \\quad , \\quad F_s(\\alpha) = \\sqrt{\\frac{2}{\\pi}} \\int_{0}^{\\infty} f(x)\\sin(\\alpha x)\\,dx',
            note: 'فرمول‌های معکوس کاملاً متقارن هستند و با همان هسته کسینوس یا سینوس تعریف می‌شوند.',
          },
          {
            label: 'تبدیل مشتق دوم کسینوسی (ویژه شرط مرزی نیومن / مشتق در مبدأ)',
            formula:
              '\\mathcal{F}_c\\big[ f\'\'(x) \\big] = -\\alpha^2 F_c(\\alpha) - \\sqrt{\\frac{2}{\\pi}}\\,f\'(0)',
            note: 'اگر در مرز $x=0$ مقدار مشتق $f\'(0)$ معلوم باشد (مانند انتهای عایق حرارتی $u_x(0,t)=0$)، از تبدیل کسینوسی استفاده می‌شود.',
          },
          {
            label: 'تبدیل مشتق دوم سینوسی (ویژه شرط مرزی دیریکله / مقدار در مبدأ)',
            formula:
              '\\mathcal{F}_s\\big[ f\'\'(x) \\big] = -\\alpha^2 F_s(\\alpha) + \\alpha\\sqrt{\\frac{2}{\\pi}}\\,f(0)',
            note: 'اگر در مرز $x=0$ مقدار خود تابع $f(0)$ معلوم باشد (مانند دمای ثابت در مبدأ $u(0,t)=0$)، از تبدیل سینوسی استفاده می‌شود.',
          },
        ],
        conceptualPoints: [
          'تبدیل کسینوسی متناظر با بسط زوج تابع به کل محور $(-\\infty, \\infty)$ و تبدیل سینوسی متناظر با بسط فرد تابع است.',
        ],
      },
    ],
    workedExamples: [
      {
        id: 'ex_pdf_24_rect_sinc',
        pdfReference: 'مثال‌های ۱۸ و ۲۴ جزوه (صفحات ۶۰ و ۷۳)',
        title: 'محاسبه تبدیل فوریه پالس مستطیلی، اعمال قضیه تقارن برای تابع سینک و استخراج انتگرال دیریکله',
        difficulty: 'متوسط (امتحانی)',
        problemStatement:
          'الف) تبدیل فوریه پالس مستطیلی متقارن $p_a(x) = \\begin{cases} 1 & |x| < a \\\\ 0 & |x| > a \\end{cases}$ ($a > 0$) را با باز کردن کامل انتگرال محاسبه کنید. ب) با استفاده از قضیه تقارن، تبدیل فوریه تابع سینک $g(x) = \\frac{\\sin(ax)}{x}$ را تعیین کنید. ج) با اعمال قضیه معکوس فوریه، مقدار انتگرال ناسره دیریکله $\\int_{-\\infty}^{\\infty} \\frac{\\sin\\alpha}{\\alpha}\\,d\\alpha$ را استخراج نمایید.',
        problemFormula: 'p_a(x) = \\begin{cases} 1 & |x| < a \\\\ 0 & |x| > a \\end{cases} \\implies \\text{Find } \\mathcal{F}[p_a(x)] \\; , \\; \\mathcal{F}\\left[\\frac{\\sin(ax)}{x}\\right] \\; , \\; \\int_{-\\infty}^{\\infty} \\frac{\\sin\\alpha}{\\alpha}\\,d\\alpha',
        finalAnswerFormula: '\\mathcal{F}[p_a(x)] = \\frac{2\\sin(a\\alpha)}{\\alpha} \\; , \\; \\mathcal{F}\\left[\\frac{\\sin(ax)}{x}\\right] = \\begin{cases} \\pi & |\\alpha| < a \\\\ 0 & |\\alpha| > a \\end{cases} \\; , \\; \\int_{-\\infty}^{\\infty} \\frac{\\sin\\alpha}{\\alpha}\\,d\\alpha = \\pi',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: نوشتن انتگرال تعریف تبدیل فوریه پالس مستطیلی',
            explanation:
              'چون تابع فقط در بازه $[-a, a]$ غیرصفر و برابر ۱ است، حدود انتگرال به $[-a, a]$ محدود می‌شود:',
            formula:
              'F(\\alpha) = \\int_{-\\infty}^{\\infty} p_a(t)\\,e^{-i\\alpha t}\\,dt = \\int_{-a}^{a} 1 \\cdot e^{-i\\alpha t}\\,dt',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: محاسبه پادمشتق نمایی و تبدیل به فرم سینوسی',
            explanation:
              'پادمشتق $e^{-i\\alpha t}$ برابر $\\frac{e^{-i\\alpha t}}{-i\\alpha}$ است. با قرار دادن کران‌ها داریم:',
            formula:
              'F(\\alpha) = \\left[ \\frac{e^{-i\\alpha t}}{-i\\alpha} \\right]_{-a}^{a} = \\frac{e^{-i a\\alpha} - e^{i a\\alpha}}{-i\\alpha} = \\frac{e^{ia\\alpha} - e^{-ia\\alpha}}{i\\alpha} = \\frac{2i\\sin(a\\alpha)}{i\\alpha} = \\frac{2\\sin(a\\alpha)}{\\alpha}',
            highlightNote: 'در $\\alpha = 0$ با قاعده هوپیتال داریم $F(0) = 2a$ که دقیقاً برابر مساحت مستطیل به عرض $2a$ و ارتفاع ۱ است.',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: اعمال قضیه تقارن برای تبدیل فوریه تابع سینک',
            explanation:
              'طبق قضیه تقارن $\\mathcal{F}[f(x)] = F(\\alpha) \\implies \\mathcal{F}[F(x)] = 2\\pi f(-\\alpha)$. در اینجا $F(x) = \\frac{2\\sin(ax)}{x}$ و $f(x) = p_a(x)$ زوج است ($p_a(-\\alpha) = p_a(\\alpha)$). بنابراین:',
            formula:
              '\\mathcal{F}\\left[ \\frac{2\\sin(ax)}{x} \\right] = 2\\pi p_a(\\alpha) \\implies 2\\,\\mathcal{F}\\left[ \\frac{\\sin(ax)}{x} \\right] = 2\\pi p_a(\\alpha) \\implies \\mathcal{F}\\left[ \\frac{\\sin(ax)}{x} \\right] = \\pi p_a(\\alpha) = \\begin{cases} \\pi & |\\alpha| < a \\\\ 0 & |\\alpha| > a \\end{cases}',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: اعمال فرمول تبدیل معکوس در $x=0$ برای محاسبه انتگرال دیریکله',
            explanation:
              'طبق فرمول معکوس $f(x) = \\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty} F(\\alpha) e^{i\\alpha x} d\\alpha$، برای پالس مستطیلی با $a=1$ در مبدأ پیوستگی $x=0$ داریم $f(0) = 1$:',
            formula:
              'f(0) = \\frac{1}{2\\pi} \\int_{-\\infty}^{\\infty} \\frac{2\\sin\\alpha}{\\alpha} e^{i 0} d\\alpha = 1 \\implies \\frac{1}{\\pi} \\int_{-\\infty}^{\\infty} \\frac{\\sin\\alpha}{\\alpha}\\,d\\alpha = 1 \\implies \\int_{-\\infty}^{\\infty} \\frac{\\sin\\alpha}{\\alpha}\\,d\\alpha = \\pi',
            whyHint: 'چون انتگرال‌ده زوج است، $\\int_0^\\infty \\frac{\\sin\\alpha}{\\alpha}d\\alpha = \\frac{\\pi}{2}$ به دست می‌آید.',
          },
        ],
      },
      {
        id: 'ex_pdf_25_27_exp_deriv',
        pdfReference: 'مثال‌های ۲۵، ۲۷ و ۳۱ جزوه (صفحات ۷۴ تا ۸۳)',
        title: 'تبدیل فوریه نمایی دوطرفه، استخراج لورنتس با تقارن و $x e^{-a|x|}$ با مشتق فرکانس',
        difficulty: 'متوسط (امتحانی)',
        problemStatement:
          'تبدیل فوریه تابع نمایی متقارن $f(x) = e^{-a|x|}$ ($a > 0$) را با باز کردن کامل محاسبه کنید؛ سپس با قضایای تقارن و مشتق فرکانس، تبدیل فوریه توابع $g(x) = \\frac{1}{x^2+a^2}$ و $h(x) = x e^{-a|x|}$ را بیابید.',
        problemFormula: 'f(x) = e^{-a|x|} \\implies \\text{Find } \\mathcal{F}[f(x)] \\; , \\; \\mathcal{F}\\left[\\frac{1}{x^2+a^2}\\right] \\; , \\; \\mathcal{F}\\big[x e^{-a|x|}\\big]',
        finalAnswerFormula: '\\mathcal{F}\\big[e^{-a|x|}\\big] = \\frac{2a}{a^2+\\alpha^2} \\; , \\; \\mathcal{F}\\left[\\frac{1}{x^2+a^2}\\right] = \\frac{\\pi}{a}e^{-a|\\alpha|} \\; , \\; \\mathcal{F}\\big[x e^{-a|x|}\\big] = \\frac{-4ia\\alpha}{(a^2+\\alpha^2)^2}',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: نوشتن انتگرال تعریف و استفاده از تقارن زوج تابع',
            explanation:
              'طبق فرمول اویلر $e^{-i\\alpha t} = \\cos(\\alpha t) - i\\sin(\\alpha t)$، بخش سینوسی به دلیل فرد بودن صفر می‌شود:',
            formula:
              'F(\\alpha) = \\int_{-\\infty}^{\\infty} e^{-a|t|} e^{-i\\alpha t} dt = 2 \\int_{0}^{\\infty} e^{-at} \\cos(\\alpha t)\\,dt',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: محاسبه انتگرال نمایی-مثلثاتی با دو بار جزء‌به‌جزء یا تبدیل لاپلاس',
            explanation:
              'با استفاده از رابطه استاندارد انتگرال لاپلاس $\\int_0^\\infty e^{-at}\\cos(\\alpha t)dt = \\frac{a}{a^2+\\alpha^2}$ برای $a > 0$ داریم:',
            formula:
              'F(\\alpha) = 2 \\cdot \\frac{a}{a^2 + \\alpha^2} = \\frac{2a}{a^2 + \\alpha^2}',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: اعمال قضیه تقارن برای تابع لورنتس $\\frac{1}{x^2+a^2}$',
            explanation:
              'طبق قضیه تقارن، $\\mathcal{F}[F(x)] = 2\\pi f(-\\alpha)$. با جایگذاری $F(x) = \\frac{2a}{x^2+a^2}$:',
            formula:
              '\\mathcal{F}\\left[ \\frac{2a}{x^2+a^2} \\right] = 2\\pi e^{-a|-\\alpha|} = 2\\pi e^{-a|\\alpha|} \\implies \\mathcal{F}\\left[ \\frac{1}{x^2+a^2} \\right] = \\frac{2\\pi}{2a} e^{-a|\\alpha|} = \\frac{\\pi}{a} e^{-a|\\alpha|}',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: اعمال قضیه مشتق فرکانس برای $x e^{-a|x|}$',
            explanation:
              'طبق فرمول مشتق فرکانس $\\mathcal{F}[x f(x)] = i \\frac{d}{d\\alpha} F(\\alpha)$، مشتق نسبت به $\\alpha$ می‌گیریم:',
            formula:
              '\\mathcal{F}\\big[ x e^{-a|x|} \\big] = i \\frac{d}{d\\alpha} \\left( \\frac{2a}{a^2 + \\alpha^2} \\right) = i \\left( \\frac{-2a \\cdot 2\\alpha}{(a^2 + \\alpha^2)^2} \\right) = \\frac{-4ia\\alpha}{(a^2 + \\alpha^2)^2}',
            highlightNote: 'چون تابع $x e^{-a|x|}$ فرد است، تبدیل فوریه آن کاملاً موهومی خالص شد که تأییدکننده درستی محاسبات است.',
          },
        ],
      },
      {
        id: 'ex_pdf_36_conv_integral_eq',
        pdfReference: 'مثال ۳۶ جزوه (صفحه ۹۲)',
        title: 'حل کامل معادله انتگرالی کانولوشن فریدریش با تبدیل فوریه و تجزیه کسرها',
        difficulty: 'پیشرفته (تکمیلی)',
        problemStatement:
          'جواب معادله انتگرالی $\\int_{-\\infty}^{\\infty} u(t)\\,e^{-|x-t|}\\,dt = e^{-2|x|}$ را با استفاده از قضیه کانولوشن زمان، تبدیل فوریه و اعمال تبدیل معکوس به دست آورید.',
        problemFormula: '\\int_{-\\infty}^{\\infty} u(t)\\,e^{-|x-t|}\\,dt = e^{-2|x|} \\implies \\text{Find } u(x)',
        finalAnswerFormula: 'u(x) = 2\\delta(x) - \\frac{3}{2} e^{-2|x|}',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: بازشناسی عملگر کانولوشن و اعمال تبدیل فوریه به طرفین',
            explanation:
              'سمت چپ معادله ساختار انتگرال کانولوشن $(u * g)(x)$ است که در آن $g(x) = e^{-|x|}$ و سمت راست $h(x) = e^{-2|x|}$ است. طبق قضیه کانولوشن $\\mathcal{F}[u * g] = U(\\alpha)G(\\alpha)$ داریم:',
            formula:
              '\\mathcal{F}\\big[ u(x) * e^{-|x|} \\big] = \\mathcal{F}\\big[ e^{-2|x|} \\big] \\implies U(\\alpha) \\cdot G(\\alpha) = H(\\alpha)',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: جایگذاری تبدیل‌های فوریه $G(\\alpha)$ و $H(\\alpha)$',
            explanation:
              'از جدول تبدیل فوریه برای نمایی دوطرفه با $a=1$ و $a=2$ داریم $G(\\alpha) = \\frac{2}{1+\\alpha^2}$ و $H(\\alpha) = \\frac{4}{4+\\alpha^2}$:',
            formula:
              'U(\\alpha) \\cdot \\left( \\frac{2}{1 + \\alpha^2} \\right) = \\frac{4}{4 + \\alpha^2} \\implies U(\\alpha) = \\frac{4}{4 + \\alpha^2} \\cdot \\frac{1 + \\alpha^2}{2} = \\frac{2(1 + \\alpha^2)}{4 + \\alpha^2}',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: ساده‌سازی جبری و تجزیه به کسرهای جزئی',
            explanation:
              'در صورت کسر عبارت $1 + \\alpha^2 = (4 + \\alpha^2) - 3$ را قرار می‌دهیم:',
            formula:
              'U(\\alpha) = \\frac{2(4 + \\alpha^2 - 3)}{4 + \\alpha^2} = 2 \\left( 1 - \\frac{3}{4 + \\alpha^2} \\right) = 2 - \\frac{6}{4 + \\alpha^2}',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: اعمال تبدیل معکوس فوریه برای استخراج تابع مجهول $u(x)$',
            explanation:
              'می‌دانیم $\\mathcal{F}^{-1}[2] = 2\\delta(x)$ و برای جمله دوم داریم $\\mathcal{F}^{-1}\\left[\\frac{4}{4+\\alpha^2}\\right] = e^{-2|x|}$؛ بنابراین $\\frac{6}{4+\\alpha^2} = \\frac{3}{2} \\cdot \\frac{4}{4+\\alpha^2}$ است:',
            formula:
              'u(x) = \\mathcal{F}^{-1}\\left[ 2 - \\frac{6}{4 + \\alpha^2} \\right] = 2\\delta(x) - \\frac{3}{2} e^{-2|x|}',
            highlightNote: 'تبدیل فوریه معادله انتگرالی پیچیده را بدون نیاز به مشتق‌گیری‌های پیاپی به یک کسر جبری ساده تبدیل کرد.',
          },
        ],
      },
      {
        id: 'ex_pdf_33_gaussian_proof',
        pdfReference: 'مثال ۳۳ جزوه (صفحه ۸۵)',
        title: 'اثبات تحلیلی کامل تبدیل فوریه تابع گاوسی با تشکیل و حل معادله دیفرانسیل',
        difficulty: 'پیشرفته (تکمیلی)',
        problemStatement:
          'با تشکیل یک معادله دیفرانسیل معمولی مرتبه اول برای $F(\\alpha) = \\mathcal{F}[e^{-a x^2}]$ ($a > 0$)، نشان دهید که تبدیل فوریه تابع گاوسی خود یک تابع گاوسی با ضابطه $F(\\alpha) = \\sqrt{\\frac{\\pi}{a}}\\,e^{-\\frac{\\alpha^2}{4a}}$ است.',
        problemFormula: 'f(x) = e^{-a x^2} \\implies \\text{Prove } F(\\alpha) = \\sqrt{\\frac{\\pi}{a}}\\,e^{-\\frac{\\alpha^2}{4a}}',
        finalAnswerFormula: 'F(\\alpha) = \\sqrt{\\frac{\\pi}{a}}\\,e^{-\\frac{\\alpha^2}{4a}}',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: مشتق‌گیری از انتگرال تعریف نسبت به پارامتر فرکانس $\\alpha$',
            explanation:
              'طبق قاعده لایب‌نیتس برای مشتق‌گیری زیر علامت انتگرال داریم:',
            formula:
              'F(\\alpha) = \\int_{-\\infty}^{\\infty} e^{-ax^2} e^{-i\\alpha x}\\,dx \\implies \\frac{dF}{d\\alpha} = \\int_{-\\infty}^{\\infty} (-ix) e^{-ax^2} e^{-i\\alpha x}\\,dx',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: بازنویسی عبارت با مشتق مکانی و اعمال جزء‌به‌جزء',
            explanation:
              'توجه کنید که $\\frac{d}{dx}(e^{-ax^2}) = -2ax e^{-ax^2}$ است؛ بنابراین $-ix e^{-ax^2} = \\frac{i}{2a} \\frac{d}{dx}(e^{-ax^2})$:',
            formula:
              '\\frac{dF}{d\\alpha} = \\frac{i}{2a} \\int_{-\\infty}^{\\infty} \\left[ \\frac{d}{dx}\\left(e^{-ax^2}\\right) \\right] e^{-i\\alpha x}\\,dx',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: انتگرال جزء‌به‌جزء و حذف جملات مرزی در بی‌نهایت',
            explanation:
              'با فرض $u = e^{-i\\alpha x}$ و $dv = d(e^{-ax^2})$ داریم:',
            formula:
              '\\frac{dF}{d\\alpha} = \\frac{i}{2a} \\left( \\underbrace{\\left[ e^{-ax^2} e^{-i\\alpha x} \\right]_{-\\infty}^{\\infty}}_{= 0} - \\int_{-\\infty}^{\\infty} e^{-ax^2} (-i\\alpha) e^{-i\\alpha x}\\,dx \\right) = \\frac{i}{2a} (i\\alpha) F(\\alpha) = -\\frac{\\alpha}{2a} F(\\alpha)',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: حل معادله دیفرانسیل جداپذیر و تعیین ثابت با انتگرال پواسون',
            explanation:
              'معادله $\\frac{dF}{F} = -\\frac{\\alpha}{2a} d\\alpha$ جواب عمومی $F(\\alpha) = C e^{-\\frac{\\alpha^2}{4a}}$ دارد. برای یافتن $C$ از مقدار در مبدأ و انتگرال مشهور پواسون گاوسی استفاده می‌کنیم:',
            formula:
              'C = F(0) = \\int_{-\\infty}^{\\infty} e^{-ax^2}\\,dx = \\sqrt{\\frac{\\pi}{a}} \\implies F(\\alpha) = \\sqrt{\\frac{\\pi}{a}}\\,e^{-\\frac{\\alpha^2}{4a}}',
            highlightNote: 'این تابع تنها تابع خودمتشابه فوریه است که کمینه رابطه عدم قطعیت $\\Delta x \\cdot \\Delta \\alpha = \\frac{1}{2}$ را ارضا می‌کند.',
          },
        ],
      },
      {
        id: 'ex_pdf_parseval_degree4',
        pdfReference: 'مثال ۳۵ جزوه (صفحه ۹۱)',
        title: 'محاسبه انتگرال‌های ناسره کسر درجه ۴ با قضیه پارسوال تبدیل فوریه',
        difficulty: 'پیشرفته (تکمیلی)',
        problemStatement:
          'با استفاده از اتحاد پارسوال تبدیل فوریه، مقادیر دو انتگرال ناسره مهندسی $I_1 = \\int_{-\\infty}^{\\infty} \\frac{dx}{(x^2 + a^2)^2}$ و $I_2 = \\int_{-\\infty}^{\\infty} \\frac{x^2 dx}{(x^2 + a^2)^2}$ ($a > 0$) را به طور دقیق بیابید.',
        problemFormula: 'I_1 = \\int_{-\\infty}^{\\infty} \\frac{dx}{(x^2+a^2)^2} \\quad , \\quad I_2 = \\int_{-\\infty}^{\\infty} \\frac{x^2 dx}{(x^2+a^2)^2}',
        finalAnswerFormula: 'I_1 = \\frac{\\pi}{2a^3} \\quad , \\quad I_2 = \\frac{\\pi}{2a}',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: انتخاب تابع پایه $f(x) = e^{-a|x|}$ و بیان مربع آن در مکان',
            explanation:
              'برای محاسبه $I_1$ از تابع لورنتس $\\frac{1}{x^2+a^2}$ استفاده می‌کنیم که تبدیل فوریه $e^{-a|x|}$ است. طبق پارسوال:',
            formula:
              '\\int_{-\\infty}^{\\infty} |f(x)|^2\\,dx = \\frac{1}{2\\pi} \\int_{-\\infty}^{\\infty} |F(\\alpha)|^2\\,d\\alpha',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: جایگذاری $f(x) = e^{-a|x|}$ و $F(\\alpha) = \\frac{2a}{a^2+\\alpha^2}$',
            explanation:
              'انتگرال سمت چپ به سادگی محاسبه می‌شود:',
            formula:
              '\\text{LHS} = \\int_{-\\infty}^{\\infty} \\big(e^{-a|x|}\\big)^2 dx = 2 \\int_{0}^{\\infty} e^{-2ax} dx = 2 \\left[ \\frac{e^{-2ax}}{-2a} \\right]_0^\\infty = \\frac{1}{a}',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: برابری با سمت راست و استخراج انتگرال $I_1$',
            explanation:
              'سمت راست اتحاد پارسوال را تشکیل می‌دهیم:',
            formula:
              '\\text{RHS} = \\frac{1}{2\\pi} \\int_{-\\infty}^{\\infty} \\left( \\frac{2a}{a^2 + \\alpha^2} \\right)^2 d\\alpha = \\frac{4a^2}{2\\pi} \\int_{-\\infty}^{\\infty} \\frac{d\\alpha}{(a^2+\\alpha^2)^2} = \\frac{2a^2}{\\pi} I_1',
            whyHint: 'با مساوی قرار دادن طرفین: $\\frac{2a^2}{\\pi} I_1 = \\frac{1}{a} \\implies I_1 = \\frac{\\pi}{2a^3}$.',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: محاسبه انتگرال دوم $I_2$ با استفاده از تجزیه جبری صورت',
            explanation:
              'در صورت کسر $x^2 = (x^2 + a^2) - a^2$ را جایگذاری می‌کنیم:',
            formula:
              'I_2 = \\int_{-\\infty}^{\\infty} \\frac{x^2}{(x^2+a^2)^2} dx = \\int_{-\\infty}^{\\infty} \\frac{x^2+a^2 - a^2}{(x^2+a^2)^2} dx = \\int_{-\\infty}^{\\infty} \\frac{dx}{x^2+a^2} - a^2 I_1',
            highlightNote: 'چون $\\int_{-\\infty}^{\\infty} \\frac{dx}{x^2+a^2} = \\frac{\\pi}{a}$ است، داریم: $I_2 = \\frac{\\pi}{a} - a^2\\left(\\frac{\\pi}{2a^3}\\right) = \\frac{\\pi}{a} - \\frac{\\pi}{2a} = \\frac{\\pi}{2a}$.',
          },
        ],
      },
      {
        id: 'ex_pdf_pde_heat_infinite',
        pdfReference: 'کاربرد تبدیل فوریه در PDE (صفحات ۹۳ تا ۹۷ جزوه)',
        title: 'حل تحلیلی معادله انتقال حرارت میله نامتناهی با تبدیل فوریه و کانولوشن هسته گرما',
        difficulty: 'پیشرفته (تکمیلی)',
        problemStatement:
          'معادله انتقال حرارت یک‌بعدی در میله نامتناهی $-\\infty < x < \\infty$ را با شرط اولیه $u(x, 0) = f(x)$ و شرط کرانداری جواب در بی‌نهایت حل کنید: $\\frac{\\partial u}{\\partial t} = c^2 \\frac{\\partial^2 u}{\\partial x^2}$.',
        problemFormula: 'u_t = c^2 u_{xx} \\quad , \\quad u(x,0) = f(x) \\quad (-\\infty < x < \\infty , t > 0)',
        finalAnswerFormula: 'u(x,t) = \\frac{1}{2c\\sqrt{\\pi t}} \\int_{-\\infty}^{\\infty} f(\\tau)\\,e^{-\\frac{(x-\\tau)^2}{4c^2 t}}\\,d\\tau = \\big( f * G_t \\big)(x)',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: اعمال تبدیل فوریه مکانی نسبت به متغیر $x$ بر طرفین معادله',
            explanation:
              'فرض می‌کنیم $U(\\alpha, t) = \\mathcal{F}[u(x, t)] = \\int_{-\\infty}^{\\infty} u(x,t) e^{-i\\alpha x} dx$ باشد. طبق قضیه مشتق مکان $\\mathcal{F}[u_{xx}] = -\\alpha^2 U(\\alpha, t)$:',
            formula:
              '\\mathcal{F}\\left[ \\frac{\\partial u}{\\partial t} \\right] = c^2 \\mathcal{F}\\left[ \\frac{\\partial^2 u}{\\partial x^2} \\right] \\implies \\frac{\\partial U}{\\partial t} = -c^2 \\alpha^2 U(\\alpha, t)',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: حل معادله دیفرانسیل معمولی مرتبه اول بر حسب زمان $t$',
            explanation:
              'معادله بر حسب $t$ یک ODE ساده با جواب نمایی است:',
            formula:
              'U(\\alpha, t) = U(\\alpha, 0)\\,e^{-c^2 \\alpha^2 t} \\quad \\text{که در آن} \\quad U(\\alpha, 0) = \\mathcal{F}[u(x,0)] = F(\\alpha)',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: شناسایی تابع معکوس ضریب نمایی به عنوان هسته گاوسی گرما',
            explanation:
              'از جدول تبدیل فوریه می‌دانیم که $\\mathcal{F}\\left[ e^{-k x^2} \\right] = \\sqrt{\\frac{\\pi}{k}} e^{-\\frac{\\alpha^2}{4k}}$. با قرار دادن $\\frac{1}{4k} = c^2 t \\implies k = \\frac{1}{4c^2 t}$ داریم:',
            formula:
              'G_t(x) = \\mathcal{F}^{-1}\\left[ e^{-c^2 t \\alpha^2} \\right] = \\frac{1}{2c\\sqrt{\\pi t}}\\,e^{-\\frac{x^2}{4c^2 t}}',
            whyHint: 'این تابع همان هسته معروف گرمای فوریه (Gauss-Weierstrass Heat Kernel) است.',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: اعمال قضیه کانولوشن برای استخراج جواب کلی $u(x,t)$',
            explanation:
              'چون $U(\\alpha, t) = F(\\alpha) \\cdot \\mathcal{F}[G_t(x)]$ است، طبق قضیه کانولوشن زمان جواب برابر کانولوشن شرایط اولیه با هسته گرما است:',
            formula:
              'u(x, t) = \\mathcal{F}^{-1}\\big[ F(\\alpha) \\cdot \\mathcal{F}[G_t(x)] \\big] = (f * G_t)(x) = \\frac{1}{2c\\sqrt{\\pi t}} \\int_{-\\infty}^{\\infty} f(\\tau)\\,e^{-\\frac{(x - \\tau)^2}{4c^2 t}}\\,d\\tau',
            highlightNote: 'این فرمول انتگرالی معروف پواسون نشان می‌دهد که گرما با سرعت بینهایت در کل میله نامتناهی پخش می‌شود و هر نقطه از اثر کل نقاط متأثر است.',
          },
        ],
      },
    ],
    practiceQuestions: [
      {
        id: 'q1_m4',
        question: 'اگر تبدیل فوریه تابع $f(x)$ برابر $F(\\alpha)$ باشد، تبدیل فوریه تابع $f(x - 3)$ کدام است؟',
        options: ['e^{3i\\alpha} F(\\alpha)', 'e^{-3i\\alpha} F(\\alpha)', 'F(\\alpha - 3)', 'F(\\alpha + 3)'],
        correctIndex: 1,
        explanation:
          'طبق قضیه انتقال زمان در تبدیل فوریه، $\\mathcal{F}[f(x - x_0)] = e^{-i\\alpha x_0} F(\\alpha)$ است؛ بنابراین به ازای $x_0 = 3$ دقیقاً برابر $e^{-3i\\alpha} F(\\alpha)$ می‌شود.',
      },
      {
        id: 'q2_m4',
        question: 'در حل یک معادله دیفرانسیل با مشتقات جزئی روی نیم‌خط $x > 0$، اگر شرط مرزی به صورت مشتق در مبدأ $u_x(0, t)$ داده شده باشد، کدام تبدیل فوریه مناسب‌تر است؟',
        options: [
          '\\mathcal{F}_c \\text{ (تبدیل فوریه کسینوسی)}',
          '\\mathcal{F}_s \\text{ (تبدیل فوریه سینوسی)}',
          '\\mathcal{F} \\text{ (تبدیل فوریه مختلط دوطرفه)}',
          '\\text{سری فوریه سینوسی}',
        ],
        correctIndex: 0,
        explanation:
          'زیرا در فرمول تبدیل کسینوسی مشتق دوم داریم: $\\mathcal{F}_c[u_{xx}] = -\\alpha^2 U_c(\\alpha,t) - \\sqrt{\\frac{2}{\\pi}}u_x(0,t)$ که مستقیماً از شرط مرزی مشتق در $x=0$ استفاده می‌کند.',
      },
      {
        id: 'q3_m4',
        question: 'طبق قضیه کانولوشن زمان، تبدیل فوریه حاصل کانولوشن دو تابع $\\mathcal{F}\\{(f * g)(x)\\}$ برابر کدام گزینه است؟',
        options: [
          'F(\\alpha) \\cdot G(\\alpha)',
          '\\frac{1}{2\\pi} (F * G)(\\alpha)',
          'F(\\alpha) + G(\\alpha)',
          '\\int_{-\\infty}^{\\infty} F(\\alpha)G(\\alpha)\\,d\\alpha',
        ],
        correctIndex: 0,
        explanation:
          'مهم‌ترین خاصیت کانولوشن این است که تبدیل فوریه کانولوشن دو تابع در حوزه زمان برابر حاصل‌ضرب جبری ساده تبدیل‌های فوریه آن‌ها یعنی $F(\\alpha)G(\\alpha)$ است.',
      },
      {
        id: 'q4_m4',
        question: 'اگر تبدیل فوریه $f(x) = e^{-|x|}$ برابر $F(\\alpha) = \\frac{2}{1+\\alpha^2}$ باشد، طبق قضیه تقارن تبدیل فوریه $g(x) = \\frac{1}{1+x^2}$ برابر کدام است؟',
        options: [
          '\\pi e^{-|\\alpha|}',
          '2\\pi e^{-|\\alpha|}',
          '\\frac{\\pi}{2} e^{-|\\alpha|}',
          'e^{-|\\alpha|}',
        ],
        correctIndex: 0,
        explanation:
          'طبق قضیه تقارن $\\mathcal{F}[F(x)] = 2\\pi f(-\\alpha)$. در اینجا $\\mathcal{F}\\left[\\frac{2}{1+x^2}\\right] = 2\\pi e^{-|-\\alpha|} = 2\\pi e^{-|\\alpha|}$. با تقسیم طرفین بر ۲ داریم: $\\mathcal{F}\\left[\\frac{1}{1+x^2}\\right] = \\pi e^{-|\\alpha|}$.',
      },
      {
        id: 'q5_m4',
        question: 'تبدیل فوریه تابع $h(x) = x e^{-2x^2}$ با کدام فرمول زیر برابر است؟',
        options: [
          '\\frac{-i\\alpha}{4}\\sqrt{\\frac{\\pi}{2}}\\,e^{-\\frac{\\alpha^2}{8}}',
          '\\frac{i\\alpha}{4}\\sqrt{\\frac{\\pi}{2}}\\,e^{-\\frac{\\alpha^2}{8}}',
          '-i\\alpha \\sqrt{\\frac{\\pi}{2}}\\,e^{-\\frac{\\alpha^2}{8}}',
          '\\frac{-i\\alpha}{2}\\,e^{-\\frac{\\alpha^2}{4}}',
        ],
        correctIndex: 0,
        explanation:
          'برای $f(x) = e^{-2x^2}$ داریم $F(\\alpha) = \\sqrt{\\frac{\\pi}{2}}e^{-\\alpha^2/8}$. با قضیه مشتق فرکانس $\\mathcal{F}[x f(x)] = i \\frac{d}{d\\alpha}F(\\alpha) = i \\sqrt{\\frac{\\pi}{2}}\\left(\\frac{-2\\alpha}{8}\\right)e^{-\\alpha^2/8} = \\frac{-i\\alpha}{4}\\sqrt{\\frac{\\pi}{2}}e^{-\\alpha^2/8}$.',
      },
      {
        id: 'q6_m4',
        question: 'کدام گزینه درباره تبدیل فوریه تابع دلتای دیراک $\\delta(x)$ و تابع پله هویساید $u(x)$ صحیح است؟',
        options: [
          '\\mathcal{F}[\\delta(x)] = 1 \\quad , \\quad \\mathcal{F}[u(x)] = \\frac{1}{i\\alpha} + \\pi\\delta(\\alpha)',
          '\\mathcal{F}[\\delta(x)] = 0 \\quad , \\quad \\mathcal{F}[u(x)] = \\frac{1}{i\\alpha}',
          '\\mathcal{F}[\\delta(x)] = 2\\pi \\quad , \\quad \\mathcal{F}[u(x)] = \\pi\\delta(\\alpha)',
          '\\mathcal{F}[\\delta(x)] = 1 \\quad , \\quad \\mathcal{F}[u(x)] = \\frac{1}{i\\alpha}',
        ],
        correctIndex: 0,
        explanation:
          'طبق تعریف تبدیل فوریه $\\int_{-\\infty}^\\infty \\delta(t)e^{-i\\alpha t}dt = e^0 = 1$ است. برای پله هویساید $u(x) = \\frac{1}{2} + \\frac{1}{2}\\operatorname{sgn}(x)$، جمله $\\pi\\delta(\\alpha)$ ناشی از مقدار ثابت DC و $\\frac{1}{i\\alpha}$ ناشی از تابع علامت است.',
      },
    ],
  },
  {
    id: 'module_5_sturm_liouville',
    shortTitle: '۵. اشتورم-لیوویل',
    numberLabel: 'بخش ۵',
    title: 'مسئله اشتورم-لیوویل (Sturm-Liouville)',
    subtitle: 'معادله خودالحاقی، عامل انتگرال‌ساز، شرایط مرزی منظم، مقادیر ویژه $\\lambda_n$ و تعامد توابع ویژه با تابع وزن $p(x)$',
    pdfPageRange: 'صفحات ۱۰۶ تا ۱۱۵ جزوه',
    simulatorType: 'sturm_liouville',
    layoutComplexity: 'wide_canvas',
    subtopics: [
      {
        id: 'm5_1_what_is_bvp_sl',
        title: 'مفاهیم بنیادین مسائل مقدار مرزی (BVP) و پیدایش نظریه اشتورم-لیوویل',
        pdfPages: 'صفحات ۱۰۶ تا ۱۰۸',
        summary:
          'تفاوت اساسی مسائل مقدار مرزی (BVP) با مسائل مقدار اولیه (IVP). چرا ارتعاشات تار صوتی، رسانش حرارت در میله‌ها و معادلات موج نیازمند حل مقادیر ویژه هستند.',
        keyFormulas: [
          {
            label: 'فرم عمومی معادله دیفرانسیل خطی مرتبه دوم با پارامتر $\\lambda$',
            formula: 'P(x)\\,y\'\'(x) + Q(x)\\,y\'(x) + \\Big[ \\lambda\\,R(x) + S(x) \\Big] y(x) = 0 \\quad (a < x < b)',
            note: 'در این معادله $\\lambda$ پارامتر مجهول است که فقط به ازای مقادیر خاصی جواب غیربدیهی دارد.',
          },
          {
            label: 'شرایط مرزی عمومی همگن (شرایط رابین / مختلط)',
            formula: '\\alpha_1 y(a) + \\alpha_2 y\'(a) = 0 \\quad , \\quad \\beta_1 y(b) + \\beta_2 y\'(b) = 0',
            note: 'اگر $\\alpha_2 = \\beta_2 = 0$ باشد شرایط دیریکله، و اگر $\\alpha_1 = \\beta_1 = 0$ باشد شرایط نیومن نام دارد.',
          },
        ],
        conceptualPoints: [
          'بر خلاف مسائل مقدار اولیه که طبق قضیه پیکارد همواره جواب یکتا دارند، مسائل مقدار مرزی تنها به ازای مجموعه‌ای شمارا از مقادیر $\\lambda$ (مقادیر ویژه) دارای جواب غیربدیهی ($y(x) \\not\\equiv 0$) هستند.',
          'جواب بدیهی $y(x) \\equiv 0$ همواره در معادلات همگن صدق می‌کند؛ هدف اصلی یافتن حالات مانا و مدهای ارتعاشی فیزیکی است.',
        ],
      },
      {
        id: 'm5_2_standard_self_adjoint_form',
        title: 'فرم استاندارد خودالحاقی (Self-Adjoint Form) و اپراتورهای متقارن',
        pdfPages: 'صفحات ۱۰۶ تا ۱۰۸',
        summary:
          'ساختار اپراتور دیفرانسیلی خودالحاقی $L[y] = [r(x) y\']\' + q(x)y = -\\lambda p(x) y$. مقایسه ماهیت خودالحاقی با ماتریس‌های متقارن و هرمیتی در جبر خطی.',
        keyFormulas: [
          {
            label: 'فرم استاندارد خودالحاقی اشتورم-لیوویل',
            formula: '\\frac{d}{dx}\\Big[ r(x)\\,y\'(x) \\Big] + \\Big[ \\lambda\\,p(x) + q(x) \\Big] y(x) = 0 \\quad (a < x < b)',
            note: 'در این فرم $p(x) > 0$ تابع وزن (Weight Function)، $r(x) > 0$ تابع هدایت و $q(x)$ پتانسیل کمکی است.',
          },
          {
            label: 'اتحاد لاگرانژ برای اپراتور اشتورم-لیوویل (Lagrange Identity)',
            formula: 'u\\,L[v] - v\\,L[u] = \\frac{d}{dx}\\Big[ r(x)\\,\\big( u(x)v\'(x) - v(x)u\'(x) \\big) \\Big]',
            note: 'این اتحاد سنگ‌بنای اثبات تعامد توابع ویژه و حقیقی بودن مقادیر ویژه در ریاضی مهندسی است.',
          },
        ],
        conceptualPoints: [
          'خودالحاقی بودن اپراتور دیفرانسیلی تضمین می‌کند که مقادیر ویژه همواره اعدادی حقیقی هستند و هیچ مقدار ویژه موهومی وجود ندارد.',
          'توابع ویژه متناظر با مقادیر ویژه متمایز، نسبت به تابع وزن $p(x)$ پایه‌های متعامد یک فضای هیلبرت تابعی را تشکیل می‌دهند.',
        ],
      },
      {
        id: 'm5_3_integrating_factor_recipe',
        title: 'دستورالعمل قطعی محاسبه عامل انتگرال‌ساز $\\mu(x)$ و تابع وزن تعامد $p(x)$',
        pdfPages: 'صفحات ۱۰۶ تا ۱۰۸',
        summary:
          'الگوریتم گام‌به‌گام برای تبدیل هر معادله خطی مرتبه دوم دلخواه به فرم اشتورم-لیوویل و استخراج فوری تابع وزن تعامد $p(x)$.',
        keyFormulas: [
          {
            label: 'فرمول عامل انتگرال‌ساز $\\mu(x)$ برای تبدیل $P(x)y\'\' + Q(x)y\' + (\\lambda R+S)y = 0$',
            formula: '\\mu(x) = \\frac{1}{P(x)} \\exp\\left( \\int \\frac{Q(x)}{P(x)}\\,dx \\right)',
            note: 'با ضرب کل معادله اولیه در $\\mu(x)$، معادله دقیقاً به فرم خودالحاقی تبدیل می‌شود.',
          },
          {
            label: 'ضرایب استاندارد پس از ضرب در $\\mu(x)$',
            formula: 'r(x) = \\mu(x)\\,P(x) = \\exp\\left(\\int \\frac{Q}{P}dx\\right) \\; , \\; p(x) = \\mu(x)\\,R(x) \\; , \\; q(x) = \\mu(x)\\,S(x)',
            note: 'تابع وزن تعامد $p(x)$ همیشه همان ضریب $\\lambda y$ در فرم خودالحاقی است.',
          },
        ],
        conceptualPoints: [
          'برای معادله با ضرایب ثابت $y\'\' + ay\' + \\lambda y = 0$، عامل انتگرال‌ساز $\\mu(x) = e^{ax}$ و تابع وزن $p(x) = e^{ax}$ است.',
          'در کنکورهای کارشناسی ارشد و دکتری، تابع وزن تعامد $p(x)$ پای ثابت سوالات تستی اشتورم-لیوویل است.',
        ],
      },
      {
        id: 'm5_4_regular_vs_singular',
        title: 'مسائل اشتورم-لیوویل منظم (Regular) در برابر تکین (Singular)',
        pdfPages: 'صفحات ۱۰۸ تا ۱۱۰',
        summary:
          'مقایسه رفتار مسائل منظم با مسائل تکین مهندسی نظیر معادلات لژاندر، بسل، چبیشف و هرمیت و تبیین شرایط کرانداری فیزیکی.',
        keyFormulas: [
          {
            label: 'معادله لژاندر روی $[-1, 1]$ (اشتورم-لیوویل تکین در دو انتها)',
            formula: '\\frac{d}{dx}\\Big[ (1-x^2)\\,y\'(x) \\Big] + \\lambda\\,y(x) = 0 \\implies r(\\pm 1) = 0 \\; , \\; p(x) = 1',
            note: 'به دلیل صفر شدن $r(x)$ در $x = \\pm 1$، به جای شرط مرزی جبری، شرط کرانداری $|y(\\pm 1)| < \\infty$ اعمال می‌شود.',
          },
          {
            label: 'معادله بسل مرتبه $n$ روی $[0, R]$ (تکین در مبدأ $x = 0$)',
            formula: '\\frac{d}{dx}\\Big[ x\\,y\'(x) \\Big] + \\left( \\lambda x - \\frac{n^2}{x} \\right) y(x) = 0 \\implies r(0) = 0 \\; , \\; p(x) = x',
            note: 'تابع وزن تعامد توابع بسل برابر $p(x) = x$ است.',
          },
        ],
        conceptualPoints: [
          'در مسئله منظم، بازه $[a, b]$ متناهی است و توابع $r(x) > 0$ و $p(x) > 0$ در تمام طول بازه پیوسته و اکیداً مثبت‌اند.',
          'در مسائل تکین، حذف جواب‌های نامتناهی (نظیر $Y_n$ در بسل یا $Q_n$ در لژاندر) مقادیر ویژه کوانتیده را مشخص می‌کند.',
        ],
      },
      {
        id: 'm5_5_eigenvalues_properties_table4',
        title: 'قضایای بنیادین مقادیر ویژه، قضیه نوسان اشتورم و جدول ۴ جزوه',
        pdfPages: 'صفحات ۱۰۹ تا ۱۱۵',
        summary:
          'قضایای بنیادین اشتورم-لیوویل: حقیقی بودن مقادیر ویژه، صعودی و نامتناهی بودن آن‌ها، قضیه نوسان اشتورم ($n-1$ گره داخلی) و جدول ۵ حالت مرزی استاندارد.',
        keyFormulas: [
          {
            label: 'قضیه تعامد وزن‌دار توابع ویژه (Orthogonality Theorem)',
            formula: '\\langle y_m, y_n \\rangle_p = \\int_{a}^{b} p(x)\\,y_m(x)\\,y_n(x)\\,dx = 0 \\quad (\\lambda_m \\neq \\lambda_n)',
            note: 'تمامی توابع ویژه متناظر با مقادیر ویژه نابرابر، با تابع وزن $p(x)$ بر یکدیگر عمودند.',
          },
          {
            label: 'قضیه نوسان اشتورم (Sturm Oscillation Theorem)',
            formula: '\\text{Interior Nodes}(y_n) = n - 1 \\quad (n = 1, 2, 3, \\dots)',
            note: 'تابع ویژه $n$-ام در داخل بازه باز $(a, b)$ دقیقاً دارای $n-1$ ریشه (گره) است و ریشه‌های دو مد متوالی یک‌درمیانند.',
          },
          {
            label: 'خلاصه جدول ۴ جزوه (۵ حالت مرزی استاندارد)',
            formula: '\\text{Dirichlet: } \\lambda_n = (n\\pi/L)^2 \\quad , \\quad \\text{Neumann: } \\lambda_0 = 0, \\; \\lambda_n = (n\\pi/L)^2',
            note: 'در شرایط مختلط مضارب فرد $\\lambda_n = (\\frac{(2n-1)\\pi}{2L})^2$ ظاهر می‌شوند.',
          },
        ],
        conceptualPoints: [
          'مقدار ویژه $\\lambda_0 = 0$ فقط زمانی پذیرفته می‌شود که جواب خطی $y = Ax + B$ با شرایط مرزی منجر به جواب غیرصفر پایدار شود (حالت نیومن یا متناوب).',
          'در شرایط دیریکله و مختلط، $\\lambda = 0$ همواره منجر به جواب بدیهی $y \\equiv 0$ شده و مقدار ویژه نیست.',
        ],
      },
      {
        id: 'm5_6_generalized_fourier_expansion',
        title: 'بسط سری فوریه تعمیم‌یافته (Generalized Fourier Series) بر پایه توابع ویژه',
        pdfPages: 'صفحات ۱۱۴ تا ۱۱۵',
        summary:
          'بسط هر تابع دلخواه $f(x)$ بر حسب توابع ویژه اشتورم-لیوویل به فرم $f(x) = \\sum c_n y_n(x)$ و محاسبه یکتای ضرایب با تابع وزن $p(x)$.',
        keyFormulas: [
          {
            label: 'فرمول بسط سری فوریه تعمیم‌یافته',
            formula: 'f(x) = \\sum_{n=1}^{\\infty} c_n\\,y_n(x) \\quad (a < x < b)',
            note: 'این رابطه شالوده اصلی پاسخ‌دهی به شرایط اولیه در معادلات حرارت و موج است.',
          },
          {
            label: 'فرمول طلایی محاسبه ضرایب با استفاده از تابع وزن $p(x)$',
            formula: 'c_n = \\frac{\\langle f, y_n \\rangle_p}{\\|y_n\\|_p^2} = \\frac{\\int_a^b p(x)\\,f(x)\\,y_n(x)\\,dx}{\\int_a^b p(x)\\,[y_n(x)]^2\\,dx}',
            note: 'سری فوریه مثلثاتی معمولی، سری فوریه-بسلی و سری فوریه-لژاندر همگی حالات خاصی از این رابطه واحد هستند.',
          },
        ],
        conceptualPoints: [
          'به دلیل کامل بودن (Completeness) مجموعه توابع ویژه اشتورم-لیوویل منظم، هر تابع تکه‌ای هموار با خطای میانگین مربعات صفر به سری همگرا می‌شود.',
          'اتحاد پارسوال تعمیم‌یافته بیان می‌کند که انرژی کل تابع با جمع مجذور ضرایب وزن‌دار برابر است: $\\int p f^2 dx = \\sum c_n^2 \\|y_n\\|^2$.',
        ],
      },
    ],
    workedExamples: [
      {
        id: 'ex_m5_dirichlet_3cases',
        pdfReference: 'مثال ۴۱ و جدول ۴ جزوه (صفحات ۱۰۹ تا ۱۱۱)',
        title: 'بررسی جامع ۳ حالت $\\lambda < 0, \\lambda = 0, \\lambda > 0$ در مسئله دیریکله همگن',
        difficulty: 'متوسط (امتحانی)',
        problemStatement:
          'مقادیر ویژه و توابع ویژه مسئله مقدار مرزی دیریکله $y\'\' + \\lambda y = 0$ را در بازه $[0, L]$ با شرایط $y(0) = 0$ و $y(L) = 0$ با بررسی موشکافانه هر سه حالت علامت $\\lambda$ اثبات کنید.',
        problemFormula: 'y\'\'(x) + \\lambda y(x) = 0 \\quad (0 < x < L) \\quad , \\quad y(0) = 0 \\; , \\; y(L) = 0',
        finalAnswerFormula: '\\lambda_n = \\left(\\frac{n\\pi}{L}\\right)^2 \\quad , \\quad y_n(x) = \\sin\\left(\\frac{n\\pi x}{L}\\right) \\quad (n = 1, 2, 3, \\dots)',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: بررسی حالت اول $\\lambda < 0$ (فرض $\\lambda = -\\alpha^2$ با $\\alpha > 0$)',
            explanation:
              'معادله دیفرانسیل به صورت $y\'\' - \\alpha^2 y = 0$ در می‌آید که ریشه‌های معادله مشخصه آن $r = \\pm \\alpha$ هستند. جواب عمومی را با توابع هذلولوی می‌نویسیم:',
            formula:
              'y(x) = c_1 \\cosh(\\alpha x) + c_2 \\sinh(\\alpha x)',
            whyHint: 'توابع هذلولوی نوسانی نیستند و اکیداً یکنوا رفتار می‌کنند.',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: اعمال شرایط مرزی دیریکله در حالت $\\lambda < 0$',
            explanation:
              'شرط اول $y(0) = 0$ را اعمال می‌کنیم: $c_1 \\cosh(0) + c_2 \\sinh(0) = c_1(1) + 0 = 0 \\implies c_1 = 0$. اکنون با توجه به $c_1 = 0$ شرط مرزی دوم $y(L) = 0$ را اعمال می‌کنیم:',
            formula:
              'y(L) = c_2 \\sinh(\\alpha L) = 0 \\xrightarrow{\\alpha > 0, \\; L > 0 \\implies \\sinh(\\alpha L) \\neq 0} c_2 = 0 \\implies y(x) \\equiv 0',
            whyHint: 'چون تنها جواب موجود، جواب بدیهی صفر است، در حالت $\\lambda < 0$ هیچ مقدار ویژه‌ای وجود ندارد.',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: بررسی حالت دوم $\\lambda = 0$',
            explanation:
              'اگر $\\lambda = 0$ باشد، معادله $y\'\'(x) = 0$ است که جواب عمومی آن خط راست است:',
            formula:
              'y(x) = A x + B \\implies \\begin{cases} y(0) = A(0) + B = 0 \\implies B = 0 \\\\ y(L) = A(L) + 0 = 0 \\xrightarrow{L \\neq 0} A = 0 \\end{cases} \\implies y(x) \\equiv 0',
            whyHint: 'بنابراین در شرایط دیریکله، $\\lambda = 0$ نیز مقدار ویژه نیست.',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: بررسی حالت سوم $\\lambda > 0$ (فرض $\\lambda = \\alpha^2$ با $\\alpha > 0$)',
            explanation:
              'معادله $y\'\' + \\alpha^2 y = 0$ دارای ریشه‌های مشخصه $r = \\pm i\\alpha$ است؛ بنابراین جواب عمومی به صورت توابع مثلثاتی نوسانی است:',
            formula:
              'y(x) = c_1 \\cos(\\alpha x) + c_2 \\sin(\\alpha x)',
          },
          {
            stepNumber: 5,
            title: 'گام ۵: اعمال شرایط مرزی در حالت مثبت و کوانتیده شدن فرکانس‌ها',
            explanation:
              'ابتدا $y(0) = c_1(1) + c_2(0) = 0 \\implies c_1 = 0$. سپس برای داشتن جواب غیربدیهی باید $c_2 \\neq 0$ باشد:',
            formula:
              'y(L) = c_2 \\sin(\\alpha L) = 0 \\xrightarrow{c_2 \\neq 0} \\sin(\\alpha L) = 0 \\implies \\alpha_n L = n\\pi \\implies \\alpha_n = \\frac{n\\pi}{L} \\quad (n = 1, 2, \\dots)',
          },
          {
            stepNumber: 6,
            title: 'گام ۶: استخراج مقادیر ویژه، توابع ویژه و نرم متعامد',
            explanation:
              'با توجه به این‌که $\\lambda = \\alpha^2$ است، مقادیر ویژه و توابع ویژه دیریکله استخراج می‌شوند:',
            formula:
              '\\lambda_n = \\left(\\frac{n\\pi}{L}\\right)^2 \\quad , \\quad y_n(x) = \\sin\\left(\\frac{n\\pi x}{L}\\right) \\quad , \\quad \\int_0^L \\sin^2\\left(\\frac{n\\pi x}{L}\\right)dx = \\frac{L}{2}',
            highlightNote: 'این دقیقاً همان مدهای ارتعاشی تار کشیده و ستون‌های هدایت حرارت دو سر صفر هستند.',
          },
        ],
      },
      {
        id: 'ex_m5_mixed_dn',
        pdfReference: 'مثال ۴۲ جزوه (صفحات ۱۱۲ تا ۱۱۴)',
        title: 'حل کامل شرایط مرزی مختلط $y(0) = 0$ و $y\'(L) = 0$ (یک سر صفر، یک سر عایق)',
        difficulty: 'متوسط (امتحانی)',
        problemStatement:
          'مقادیر ویژه و توابع ویژه مسئله $y\'\' + \\lambda y = 0$ را با شرایط مرزی مختلط $y(0) = 0$ و $y\'(L) = 0$ به صورت کامل بیابید.',
        problemFormula: 'y\'\'(x) + \\lambda y(x) = 0 \\quad (0 < x < L) \\quad , \\quad y(0) = 0 \\; , \\; y\'(L) = 0',
        finalAnswerFormula: '\\lambda_n = \\left(\\frac{(2n-1)\\pi}{2L}\\right)^2 \\quad , \\quad y_n(x) = \\sin\\left(\\frac{(2n-1)\\pi x}{2L}\\right) \\quad (n = 1, 2, 3, \\dots)',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: بررسی حالات $\\lambda < 0$ و $\\lambda = 0$',
            explanation:
              'در حالت $\\lambda = 0$ جواب $y = Ax + B$ و $y\' = A$ است. از $y(0)=0$ داریم $B=0$ و از $y\'(L)=A=0$ داریم $A=0$، پس $y \\equiv 0$. در $\\lambda < 0$ نیز $y(0)=0 \\implies c_1=0$ و $y\'(L) = \\alpha c_2 \\cosh(\\alpha L) = 0 \\implies c_2 = 0$ زیرا $\\cosh \\ge 1$.',
            formula:
              '\\lambda \\le 0 \\implies y(x) \\equiv 0 \\text{ (مقدار ویژه نیست)}',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: تشکیل جواب عمومی برای $\\lambda = \\alpha^2 > 0$',
            explanation:
              'جواب عمومی و مشتق آن عبارتند از:',
            formula:
              'y(x) = c_1 \\cos(\\alpha x) + c_2 \\sin(\\alpha x) \\quad , \\quad y\'(x) = -\\alpha c_1 \\sin(\\alpha x) + \\alpha c_2 \\cos(\\alpha x)',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: اعمال شرط مرزی اول $y(0) = 0$',
            explanation:
              'با قرار دادن $x=0$ در تابع جواب داریم:',
            formula:
              'y(0) = c_1 \\cos(0) + c_2 \\sin(0) = c_1(1) + 0 = 0 \\implies c_1 = 0 \\implies y(x) = c_2 \\sin(\\alpha x)',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: اعمال شرط مشتق در انتهای میله $y\'(L) = 0$',
            explanation:
              'مشتق تابع برابر $y\'(x) = \\alpha c_2 \\cos(\\alpha x)$ است. با قرار دادن $x=L$:',
            formula:
              'y\'(L) = \\alpha c_2 \\cos(\\alpha L) = 0 \\xrightarrow{c_2 \\neq 0, \\; \\alpha > 0} \\cos(\\alpha L) = 0',
            whyHint: 'ریشه‌های معادله $\\cos(\\theta) = 0$ مضارب فرد $\\pi/2$ هستند.',
          },
          {
            stepNumber: 5,
            title: 'گام ۵: حل معادله مثلثاتی و محاسبه مقادیر ویژه',
            explanation:
              'بنابراین آرگومان کسینوس باید برابر با یک مضرب فرد از $\\pi/2$ باشد:',
            formula:
              '\\alpha_n L = \\frac{(2n-1)\\pi}{2} \\implies \\alpha_n = \\frac{(2n-1)\\pi}{2L} \\quad (n = 1, 2, 3, \\dots)',
          },
          {
            stepNumber: 6,
            title: 'گام ۶: فرمول نهایی مقادیر ویژه و توابع ویژه',
            explanation:
              'چون $\\lambda = \\alpha^2$ است، مقادیر و توابع ویژه نهایی عبارتند از:',
            formula:
              '\\lambda_n = \\left(\\frac{(2n-1)\\pi}{2L}\\right)^2 \\quad , \\quad y_n(x) = \\sin\\left(\\frac{(2n-1)\\pi x}{2L}\\right) \\quad (n = 1, 2, 3, \\dots)',
            highlightNote: 'نرم این توابع ویژه نیز برابر $\\int_0^L \\sin^2(\\frac{(2n-1)\\pi x}{2L})dx = \\frac{L}{2}$ است.',
          },
        ],
      },
      {
        id: 'ex_m5_neumann_zero_eigenvalue',
        pdfReference: 'حالت ب جدول ۴ جزوه (صفحه ۱۱۰)',
        title: 'حل شرایط مرزی نیومن $y\'(0)=0, y\'(L)=0$ و اثبات مقدار ویژه $\\lambda_0 = 0$',
        difficulty: 'پایه (مفهومی)',
        problemStatement:
          'مسئله مقدار مرزی نیومن $y\'\' + \\lambda y = 0$ در بازه $[0, L]$ با شرایط دو سر عایق $y\'(0) = 0$ و $y\'(L) = 0$ را حل کنید و دقیقاً نشان دهید چرا $\\lambda_0 = 0$ یک مقدار ویژه معتبر است.',
        problemFormula: 'y\'\'(x) + \\lambda y(x) = 0 \\quad (0 < x < L) \\quad , \\quad y\'(0) = 0 \\; , \\; y\'(L) = 0',
        finalAnswerFormula: '\\lambda_0 = 0 \\; (y_0 = 1) \\quad , \\quad \\lambda_n = \\left(\\frac{n\\pi}{L}\\right)^2 \\; , \\; y_n(x) = \\cos\\left(\\frac{n\\pi x}{L}\\right) \\; (n \\ge 1)',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: بررسی دقیق حالت $\\lambda = 0$',
            explanation:
              'اگر $\\lambda = 0$ باشد، معادله $y\'\'(x) = 0$ است. با انتگرال‌گیری جواب عمومی خط راست $y(x) = Ax + B$ و مشتق آن $y\'(x) = A$ به دست می‌آید:',
            formula:
              '\\begin{cases} y\'(0) = A = 0 \\\\ y\'(L) = A = 0 \\end{cases} \\implies A = 0 \\quad , \\quad B = \\text{عدد ثابت دلخواه غیرصفر}',
            whyHint: 'دقت کنید که هیچ شرطی روی $B$ اعمال نشد! بنابراین $B$ می‌تواند هر عدد غیرصفری مانند $1$ باشد.',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: نتیجه‌گیری مقدار ویژه صفر و تابع ویژه ثابت',
            explanation:
              'چون جواب غیربدیهی $y_0(x) = 1$ وجود دارد، $\\lambda_0 = 0$ یک مقدار ویژه معتبر است:',
            formula:
              '\\lambda_0 = 0 \\quad , \\quad y_0(x) = 1 \\quad , \\quad \\|y_0\\|^2 = \\int_0^L (1)^2\\,dx = L',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: رد حالت $\\lambda = -\\alpha^2 < 0$',
            explanation:
              'جواب عمومی $y = c_1 \\cosh(\\alpha x) + c_2 \\sinh(\\alpha x)$ و مشتق آن $y\' = \\alpha c_1 \\sinh(\\alpha x) + \\alpha c_2 \\cosh(\\alpha x)$ است:',
            formula:
              'y\'(0) = \\alpha c_2(1) = 0 \\implies c_2 = 0 \\implies y\'(L) = \\alpha c_1 \\sinh(\\alpha L) = 0 \\xrightarrow{\\sinh(\\alpha L) \\neq 0} c_1 = 0 \\implies y \\equiv 0',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: حل حالت $\\lambda = \\alpha^2 > 0$',
            explanation:
              'مشتق جواب $y\'(x) = -\\alpha c_1 \\sin(\\alpha x) + \\alpha c_2 \\cos(\\alpha x)$ است:',
            formula:
              'y\'(0) = \\alpha c_2 = 0 \\implies c_2 = 0 \\implies y\'(L) = -\\alpha c_1 \\sin(\\alpha L) = 0 \\implies \\sin(\\alpha L) = 0 \\implies \\alpha_n = \\frac{n\\pi}{L}',
          },
          {
            stepNumber: 5,
            title: 'گام ۵: جمع‌بندی جواب نهایی مدهای نیومن',
            explanation:
              'مجموعه کامل مقادیر و توابع ویژه شامل مد صفر و مدهای نوسانی کسینوسی عبارتند از:',
            formula:
              '\\lambda_0 = 0 \\; (y_0 = 1) \\quad , \\quad \\lambda_n = \\left(\\frac{n\\pi}{L}\\right)^2 \\; , \\; y_n(x) = \\cos\\left(\\frac{n\\pi x}{L}\\right) \\quad (n = 1, 2, 3, \\dots)',
            highlightNote: 'در انتقال حرارت، مد صفر $\\lambda_0 = 0$ متناظر با دمای تعادل پایدار میله عایق پس از زمان طولانی است.',
          },
        ],
      },
      {
        id: 'ex_m5_euler_cauchy',
        pdfReference: 'مثال ۴۱ جزوه (صفحه ۱۱۱)',
        title: 'حل جامع مسئله اشتورم-لیوویل اولر-کوشی $x^2 y\'\' + 3x y\' + \\lambda y = 0$',
        difficulty: 'پیشرفته (تکمیلی)',
        problemStatement:
          'معادله دیفرانسیل اولر $x^2 y\'\' + 3x y\' + \\lambda y = 0$ را در بازه $1 < x < e$ با شرایط مرزی $y(1) = 0$ و $y(e) = 0$ به فرم خودالحاقی اشتورم-لیوویل ببرید و مقادیر ویژه، توابع ویژه و تابع وزن تعامد را بیابید.',
        problemFormula: 'x^2 y\'\' + 3x y\' + \\lambda y = 0 \\quad (1 < x < e) \\quad , \\quad y(1) = 0 \\; , \\; y(e) = 0',
        finalAnswerFormula: '\\lambda_n = 1 + n^2\\pi^2 \\quad , \\quad y_n(x) = \\frac{1}{x}\\sin(n\\pi \\ln x) \\quad , \\quad p(x) = x',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: محاسبه عامل انتگرال‌ساز $\\mu(x)$ و تبدیل به فرم خودالحاقی',
            explanation:
              'ضرایب معادله $P(x) = x^2$ و $Q(x) = 3x$ هستند. عامل انتگرال‌ساز $\\mu(x)$ را محاسبه کرده و در کل معادله ضرب می‌کنیم:',
            formula:
              '\\mu(x) = \\frac{1}{x^2} \\exp\\left( \\int \\frac{3x}{x^2}\\,dx \\right) = \\frac{1}{x^2} e^{3\\ln x} = \\frac{x^3}{x^2} = x \\implies \\frac{d}{dx}\\big[ x^3 y\'(x) \\big] + \\lambda x y(x) = 0',
            whyHint: 'بنابراین $r(x) = x^3$، $q(x) = 0$ و تابع وزن تعامد برابر $p(x) = x$ است.',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: حل معادله اولر با فرض $y = x^m$',
            explanation:
              'با قرار دادن $y = x^m$ در معادله $x^2 y\'\' + 3x y\' + \\lambda y = 0$ معادله مشخصه کمکی تشکیل می‌شود:',
            formula:
              'm(m-1) + 3m + \\lambda = 0 \\implies m^2 + 2m + \\lambda = 0 \\implies m = -1 \\pm \\sqrt{1 - \\lambda}',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: بررسی شرط وجود جواب نوسانی غیربدیهی ($1 - \\lambda < 0$)',
            explanation:
              'برای صدق کردن در دو شرط مرزی صفر در $x=1$ و $x=e$، ریشه‌ها باید مزدوج مختلط باشند؛ یعنی $1 - \\lambda = -\\alpha^2 < 0 \\implies \\lambda = 1 + \\alpha^2$ (با $\\alpha > 0$):',
            formula:
              'm = -1 \\pm i\\alpha \\implies y(x) = x^{-1} \\Big[ c_1 \\cos(\\alpha \\ln x) + c_2 \\sin(\\alpha \\ln x) \\Big]',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: اعمال شرایط مرزی $y(1) = 0$ و $y(e) = 0$',
            explanation:
              'چون $\\ln(1) = 0$ و $\\ln(e) = 1$ است، شرایط مرزی را در جواب عمومی جایگذاری می‌کنیم:',
            formula:
              '\\begin{cases} y(1) = 1^{-1}[c_1 \\cos(0) + c_2 \\sin(0)] = 0 \\implies c_1 = 0 \\\\ y(e) = e^{-1} c_2 \\sin(\\alpha \\cdot 1) = 0 \\xrightarrow{c_2 \\neq 0} \\sin(\\alpha) = 0 \\implies \\alpha_n = n\\pi \\end{cases}',
          },
          {
            stepNumber: 5,
            title: 'گام ۵: استخراج مقادیر ویژه، توابع ویژه و رابطه تعامد وزن‌دار',
            explanation:
              'با قرار دادن $\\alpha_n = n\\pi$ در رابطه $\\lambda = 1 + \\alpha^2$ جواب کامل مسئله به دست می‌آید:',
            formula:
              '\\lambda_n = 1 + n^2\\pi^2 \\quad , \\quad y_n(x) = \\frac{\\sin(n\\pi \\ln x)}{x} \\quad , \\quad \\int_{1}^{e} x \\cdot \\frac{\\sin(m\\pi\\ln x)}{x} \\frac{\\sin(n\\pi\\ln x)}{x}\\,dx = 0 \\; (m \\neq n)',
            highlightNote: 'دقت کنید که در انتگرال تعامد، تابع وزن $p(x) = x$ با یکی از مخرج‌های $x$ ساده می‌شود.',
          },
        ],
      },
      {
        id: 'ex_m5_legendre_singular',
        pdfReference: 'معادلات دیفرانسیل تکین (صفحات ۱۰۸ تا ۱۱۰)',
        title: 'تبدیل معادله لژاندر به فرم خودالحاقی و تعامد چندجمله‌ای‌های لژاندر',
        difficulty: 'پیشرفته (تکمیلی)',
        problemStatement:
          'معادله دیفرانسیل لژاندر $(1-x^2)y\'\' - 2xy\' + \\lambda y = 0$ را در بازه $[-1, 1]$ به فرم استاندارد خودالحاقی اشتورم-لیوویل تبدیل کرده و تابع وزن تعامد و شرط تکینگی را تحلیل کنید.',
        problemFormula: '(1-x^2)y\'\'(x) - 2x y\'(x) + \\lambda y(x) = 0 \\quad (-1 < x < 1)',
        finalAnswerFormula: '\\frac{d}{dx}\\Big[ (1-x^2)y\'(x) \\Big] + \\lambda y(x) = 0 \\quad , \\quad p(x) = 1 \\quad , \\quad \\int_{-1}^1 P_m(x)P_n(x)dx = 0',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: محاسبه عامل انتگرال‌ساز $\\mu(x)$',
            explanation:
              'ضرایب معادله $P(x) = 1 - x^2$ و $Q(x) = -2x$ هستند. با انتگرال‌گیری از نسبت آن‌ها:',
            formula:
              '\\int \\frac{Q(x)}{P(x)}dx = \\int \\frac{-2x}{1-x^2}dx = \\ln(1-x^2) \\implies \\mu(x) = \\frac{1}{1-x^2} e^{\\ln(1-x^2)} = \\frac{1-x^2}{1-x^2} = 1',
            whyHint: 'چون مشتق ضریب مشتق دوم دقیقاً برابر ضریب مشتق اول است ($(1-x^2)\' = -2x$)، معادله از ابتدا خودالحاقی بوده و عامل انتگرال‌ساز برابر ۱ است!',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: نوشتن فرم استاندارد خودالحاقی اشتورم-لیوویل',
            explanation:
              'با ادغام دو جمله اول بر اساس قاعده مشتق ضرب داریم:',
            formula:
              '\\frac{d}{dx}\\Big[ (1-x^2)\\,y\'(x) \\Big] + \\lambda\\,y(x) = 0 \\implies r(x) = 1-x^2 \\; , \\; p(x) = 1 \\; , \\; q(x) = 0',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: تحلیل تکینگی در مرزهای بازه',
            explanation:
              'در مرزهای $x = 1$ و $x = -1$، تابع $r(x) = 1 - x^2 = 0$ صفر می‌شود. به همین دلیل مسئله تکین (Singular) است و به جای شرایط مرزی، شرط کرانداری $|y(\\pm 1)| < \\infty$ تحمیل می‌شود.',
            formula:
              'r(\\pm 1) = 0 \\implies \\lambda_n = n(n+1) \\quad , \\quad y_n(x) = P_n(x) \\quad (n = 0, 1, 2, \\dots)',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: رابطه تعامد چندجمله‌ای‌های لژاندر',
            explanation:
              'چون تابع وزن $p(x) = 1$ است، چندجمله‌ای‌های لژاندر با وزن ۱ روی بازه $[-1, 1]$ بر یکدیگر متعامدند:',
            formula:
              '\\int_{-1}^{1} 1 \\cdot P_m(x)\\,P_n(x)\\,dx = \\begin{cases} 0 & m \\neq n \\\\ \\frac{2}{2n+1} & m = n \\end{cases}',
            highlightNote: 'این پایه و اساس بسط فوریه-لژاندر در پتانسیل‌های الکترواستاتیک کروی است.',
          },
        ],
      },
      {
        id: 'ex_m5_generalized_expansion',
        pdfReference: 'بسط سری فوریه تعمیم‌یافته (صفحات ۱۱۴ و ۱۱۵)',
        title: 'محاسبه ضرایب بسط فوریه تعمیم‌یافته تابع پله‌ای $f(x) = 1$ بر پایه مدهای دیریکله',
        difficulty: 'متوسط (امتحانی)',
        problemStatement:
          'تابع ثابت $f(x) = 1$ را در بازه $[0, L]$ بر حسب توابع ویژه اشتورم-لیوویل دیریکله $y_n(x) = \\sin(\\frac{n\\pi x}{L})$ بسط دهید و ضرایب $c_n$ را محاسبه کنید.',
        problemFormula: 'f(x) = 1 = \\sum_{n=1}^{\\infty} c_n \\sin\\left(\\frac{n\\pi x}{L}\\right) \\quad (0 < x < L)',
        finalAnswerFormula: 'c_n = \\frac{2[1 - (-1)^n]}{n\\pi} = \\begin{cases} \\frac{4}{n\\pi} & n \\text{ فرد} \\\\ 0 & n \\text{ زوج} \\end{cases}',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: نوشتن فرمول کلی ضرایب با تابع وزن $p(x) = 1$',
            explanation:
              'طبق فرمول سری فوریه تعمیم‌یافته اشتورم-لیوویل داریم:',
            formula:
              'c_n = \\frac{\\int_0^L p(x)\\,f(x)\\,y_n(x)\\,dx}{\\int_0^L p(x)\\,[y_n(x)]^2\\,dx} = \\frac{\\int_0^L 1 \\cdot 1 \\cdot \\sin\\left(\\frac{n\\pi x}{L}\\right)dx}{\\frac{L}{2}}',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: محاسبه انتگرال صورت کسر',
            explanation:
              'انتگرال تابع سینوس را از $0$ تا $L$ محاسبه می‌کنیم:',
            formula:
              '\\int_0^L \\sin\\left(\\frac{n\\pi x}{L}\\right)dx = \\left[ -\\frac{L}{n\\pi}\\cos\\left(\\frac{n\\pi x}{L}\\right) \\right]_0^L = \\frac{L}{n\\pi}\\Big( 1 - \\cos(n\\pi) \\Big) = \\frac{L}{n\\pi}\\Big( 1 - (-1)^n \\Big)',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: ساده‌سازی و استخراج ضرایب نهایی',
            explanation:
              'با تقسیم بر مخرج کسر که برابر $L/2$ است:',
            formula:
              'c_n = \\frac{2}{L} \\cdot \\frac{L}{n\\pi}\\Big( 1 - (-1)^n \\Big) = \\frac{2\\big(1 - (-1)^n\\big)}{n\\pi} = \\begin{cases} \\frac{4}{n\\pi} & n = 1, 3, 5, \\dots \\\\ 0 & n = 2, 4, 6, \\dots \\end{cases}',
            highlightNote: 'این بسط دقیقاً همان سری فوریه سینوسی تابع پله‌ای است که توزیع دمای اولیه میله گرمایی دو سر صفر را مدل می‌کند.',
          },
        ],
      },
    ],
    practiceQuestions: [
      {
        id: 'q1_m5',
        question: 'در معادله دیفرانسیل اولر $x^2 y\'\' + 3x y\' + \\lambda y = 0$ روی بازه $[1, e]$، تابع وزن تعامد $p(x)$ بعد از تبدیل به فرم اشتورم-لیوویل کدام است؟',
        options: ['p(x) = 1', 'p(x) = x', 'p(x) = x^3', 'p(x) = \\frac{1}{x}'],
        correctIndex: 1,
        explanation:
          'عامل انتگرال‌ساز برابر $\\mu(x) = \\frac{1}{x^2} \\exp(\\int \\frac{3}{x}\\,dx) = x$ است. با ضرب معادله در $x$ به فرم $[x^3 y\']\' + \\lambda x y = 0$ می‌رسیم که در آن ضریب $\\lambda y$ همان تابع وزن $p(x) = x$ است.',
      },
      {
        id: 'q2_m5',
        question: 'مقادیر ویژه مسئله اشتورم-لیوویل $y\'\' + \\lambda y = 0$ در بازه $[0, L]$ با شرایط مرزی مختلط $y(0) = 0$ و $y\'(L) = 0$ کدام است؟',
        options: [
          '\\lambda_n = \\left(\\frac{n\\pi}{L}\\right)^2',
          '\\lambda_n = \\left(\\frac{(2n-1)\\pi}{2L}\\right)^2',
          '\\lambda_n = \\left(\\frac{2n\\pi}{L}\\right)^2',
          '\\lambda_n = n\\pi',
        ],
        correctIndex: 1,
        explanation:
          'از شرط $y(0)=0$ جمله کسینوسی حذف می‌شود و از شرط مشتق $y\'(L) = \\alpha c_2 \\cos(\\alpha L) = 0$ داریم $\\alpha L = \\frac{(2n-1)\\pi}{2}$، بنابراین $\\lambda_n = \\left(\\frac{(2n-1)\\pi}{2L}\\right)^2$.',
      },
      {
        id: 'q3_m5',
        question: 'در کدام‌یک از شرایط مرزی زیر برای معادله $y\'\' + \\lambda y = 0$ در بازه $[0, L]$، مقدار $\\lambda_0 = 0$ نیز یک مقدار ویژه معتبر (با تابع ویژه ثابت $y_0 = 1$) محسوب می‌شود؟',
        options: [
          'y(0) = 0 \\; , \\; y(L) = 0 \\text{ (دیریکله)}',
          'y\'(0) = 0 \\; , \\; y\'(L) = 0 \\text{ (نیومن / عایق)}',
          'y(0) = 0 \\; , \\; y\'(L) = 0',
          'y\'(0) = 0 \\; , \\; y(L) = 0',
        ],
        correctIndex: 1,
        explanation:
          'به ازای $\\lambda = 0$ جواب کلی $y(x) = Ax + B$ است. تنها در شرایط مرزی نیومن $y\'(0)=y\'(L)=0$ داریم $A=0$ ولی $B$ دلخواه می‌ماند و تابع ثابت غیرصفر $y_0(x) = 1$ یک تابع ویژه معتبر است.',
      },
      {
        id: 'q4_m5',
        question: 'تابع وزن تعامد $p(x)$ برای معادله دیفرانسیل چندجمله‌ای‌های چبیشف $(1-x^2)y\'\' - xy\' + \\lambda y = 0$ در بازه $[-1, 1]$ کدام است؟',
        options: [
          'p(x) = 1',
          'p(x) = \\sqrt{1 - x^2}',
          'p(x) = \\frac{1}{\\sqrt{1 - x^2}}',
          'p(x) = 1 - x^2',
        ],
        correctIndex: 2,
        explanation:
          'عامل انتگرال‌ساز برابر است با $\\mu(x) = \\frac{1}{1-x^2}\\exp(\\int \\frac{-x}{1-x^2}dx) = \\frac{1}{1-x^2}\\sqrt{1-x^2} = \\frac{1}{\\sqrt{1-x^2}}$. چون $R(x)=1$ است، تابع وزن تعامد $p(x) = \\mu(x)R(x) = \\frac{1}{\\sqrt{1-x^2}}$ می‌باشد.',
      },
      {
        id: 'q5_m5',
        question: 'طبق قضیه نوسان اشتورم، تابع ویژه سوم ($n=3$) در مسئله مقدار مرزی دیریکله $y\'\' + \\lambda y = 0$ روی بازه $(0, L)$ دارای چند ریشه داخلی است؟',
        options: ['۱ ریشه', '۲ ریشه', '۳ ریشه', '۴ ریشه'],
        correctIndex: 1,
        explanation:
          'طبق قضیه نوسان اشتورم، تابع ویژه $n$-ام دقیقاً دارای $n-1$ ریشه درون بازه باز $(0, L)$ است؛ بنابراین برای $n=3$ تابع $\\sin(\\frac{3\\pi x}{L})$ دارای $3 - 1 = 2$ ریشه داخلی در نقاط $x = L/3$ و $x = 2L/3$ است.',
      },
      {
        id: 'q6_m5',
        question: 'در بسط سری فوریه تعمیم‌یافته $f(x) = \\sum c_n y_n(x)$ بر حسب توابع ویژه مسئله اشتورم-لیوویل با تابع وزن $p(x)$، فرمول صحیح ضرایب $c_n$ کدام است؟',
        options: [
          'c_n = \\int_a^b f(x)\\,y_n(x)\\,dx',
          'c_n = \\frac{\\int_a^b p(x)\\,f(x)\\,y_n(x)\\,dx}{\\int_a^b p(x)\\,[y_n(x)]^2\\,dx}',
          'c_n = \\frac{\\int_a^b r(x)\\,f(x)\\,y_n(x)\\,dx}{\\int_a^b r(x)\\,[y_n(x)]^2\\,dx}',
          'c_n = \\frac{1}{L} \\int_a^b p(x)\\,f(x)\\,dx',
        ],
        correctIndex: 1,
        explanation:
          'با ضرب طرفین بسط در $p(x) y_m(x)$ و انتگرال‌گیری از $a$ تا $b$، به دلیل رابطه تعامد $\\int_a^b p(x) y_n y_m dx = 0$ برای $n \\neq m$، تمامی جملات به جز جمله $n=m$ حذف می‌شوند و فرمول طلایی $c_n = \\frac{\\int_a^b p(x) f(x) y_n(x) dx}{\\int_a^b p(x) [y_n(x)]^2 dx}$ به دست می‌آید.',
      },
    ],
  },
  {
    id: 'module_6_heat_pde',
    shortTitle: '۶. معادله گرما',
    numberLabel: 'بخش ۶',
    title: 'معادله گرما و معادلات با مشتقات جزئی (PDE)',
    subtitle: 'دسته‌بندی PDEها، معادله گرمای همگن و غیرهمگن، روش جداسازی متغیرها (فوریه)، میله متناهی، نیمه‌نامتناهی و نامتناهی، چشمه‌های حرارتی، هسته گاوسی و اصل ماکزیمم',
    pdfPageRange: 'صفحات ۱۱۶ تا ۲۱۷ جزوه',
    simulatorType: 'heat_pde',
    layoutComplexity: 'wide_canvas',
    subtopics: [
      {
        id: 'm6_pde_classification',
        title: 'تعریف PDE، مرتبه، خطی بودن، دسته‌بندی با مبین $\\Delta$ و فرم‌های کانونی استاندارد',
        pdfPages: 'صفحات ۱۱۶ تا ۱۲۲',
        summary:
          'معادلات با مشتقات جزئی (PDE) شامل مشتق نسبت به دو یا چند متغیر مستقل (مانند مکان $x, y$ و زمان $t$) هستند. معادلات خطی مرتبه دوم با دو متغیر مستقل بر اساس علامت مبین $\\Delta = B^2 - 4AC$ دقیقاً مانند مقاطع مخروطی در هندسه تحلیلی به سه دسته فیزیکی سهموی (پدیده‌های نفوذی و اتلافی مانند گرما)، هذلولوی (پدیده‌های موجی و ارتعاشی) و بیضوی (پدیده‌های پتانسیل و حالت ماندگار) طبقه‌بندی می‌شوند.',
        keyFormulas: [
          {
            label: 'فرم کلی PDE خطی مرتبه دوم و فرمول مبین $\\Delta$',
            formula: 'A(x,y)\\,u_{xx} + B(x,y)\\,u_{xy} + C(x,y)\\,u_{yy} + D\\,u_x + E\\,u_y + F\\,u = G',
            note: 'مبین معادله برابر است با $\\Delta(x,y) = B^2 - 4AC$. علامت $\\Delta$ نوع فیزیکی معادله را مشخص می‌کند.',
          },
          {
            label: 'سه خانواده اصلی معادلات مهندسی و تعبیر فیزیکی آن‌ها',
            formula:
              '\\begin{cases} \\Delta = 0 : \\text{Parabolic (سهموی - اتلاف حرارتی و نفوذ)} & u_t = k^2 u_{xx} \\\\ \\Delta > 0 : \\text{Hyperbolic (هذلولوی - انتشار موج و ارتعاش)} & u_{tt} = c^2 u_{xx} \\\\ \\Delta < 0 : \\text{Elliptic (بیضوی - پتانسیل و تعادل الکترواستاتیک)} & u_{xx} + u_{yy} = 0 \\end{cases}',
          },
          {
            label: 'معادله مشخصه‌های PDE مرتبه دوم و متغیرهای کانونی $(\\xi, \\eta)$',
            formula:
              '\\frac{dy}{dx} = \\frac{B \\pm \\sqrt{B^2 - 4AC}}{2A} \\implies \\begin{cases} \\Delta > 0 : u_{\\xi\\eta} = \\Phi(\\xi, \\eta, u, u_\\xi, u_\\eta) \\\\ \\Delta = 0 : u_{\\eta\\eta} = \\Phi(\\xi, \\eta, u, u_\\xi, u_\\eta) \\\\ \\Delta < 0 : u_{\\alpha\\alpha} + u_{\\beta\\beta} = \\Phi \\end{cases}',
            note: 'در معادلات هذلولوی دو دسته مشخصه حقیقی متمایز، در سهموی یک دسته مشخصه مکرر، و در بیضوی دو دسته مشخصه مختلط مزدوج وجود دارد.',
          },
        ],
        conceptualPoints: [
          'مرتبه یک PDE برابر بالاترین مرتبه مشتق موجود در معادله است. معادله گرما $u_t = k^2 u_{xx}$ از نظر مکان مرتبه ۲ و از نظر زمان مرتبه ۱ است.',
          'اگر ضرایب $A, B, C$ توابعی از $x, y$ باشند، نوع معادله ممکن است در نقاط مختلف صفحه تغییر کند؛ به عنوان مثال در معادله تریکومی $y\\,u_{xx} + u_{yy} = 0$، مبین برابر $\\Delta = -4y$ است: برای $y < 0$ هذلولوی، برای $y = 0$ سهموی و برای $y > 0$ بیضوی است.',
          'تفاوت بنیادی رفتاری: امواج در معادلات هذلولوی با سرعت متناهی $c$ سیر می‌کنند و جبهه موج شکل خود را حفظ می‌کند؛ در حالی که در معادلات سهموی سرعت انتشار گرما از نظر تئوری نامتناهی است و اطلاعات به سرعت هموار و اتلاف می‌شوند.',
        ],
      },
      {
        id: 'm6_heat_homog_separation',
        title: 'معادله گرمای میله، اشتقاق از قانون فوریه، روش جداسازی متغیرها و شرایط مرزی همگن',
        pdfPages: 'صفحات ۱۲۳ تا ۱۴۵',
        summary:
          'معادله گرما بر پایه قانون هدایت حرارتی فوریه ($q = -\\kappa \\nabla u$) و اصل بقای انرژی استوار است. برای میله متناهی به طول $L$، روش جداسازی متغیرها (روش فوریه) جواب را به حاصل‌ضرب بخش مکانی $X(x)$ و بخش زمانی $T(t)$ تجزیه می‌کند. شرط فیزیکی پایداری و میرا شوندگی ایجاب می‌کند که ثابت جداسازی منفی باشد ($-\\lambda = -\\alpha^2$).',
        keyFormulas: [
          {
            label: 'اشتقاق فیزیکی معادله گرما و ضریب پخش حرارتی $k^2$',
            formula: 'q = -\\kappa \\frac{\\partial u}{\\partial x} \\quad , \\quad \\rho c_p \\frac{\\partial u}{\\partial t} = -\\frac{\\partial q}{\\partial x} \\implies u_t = k^2 u_{xx} \\quad , \\quad k^2 = \\frac{\\kappa}{\\rho c_p}',
            note: '$\\kappa$: ضریب هدایت حرارتی، $\\rho$: چگالی جرمی، $c_p$: گرمای ویژه، $k^2$ (یا $\\alpha$): ضریب نفوذ یا پخش حرارتی (Thermal Diffusivity).',
          },
          {
            label: 'جداسازی متغیرها $u(x,t) = X(x)T(t)$ و تولید مسئله اشتورم-لیوویل',
            formula: 'X(x) T\'(t) = k^2 X\'\'(x) T(t) \\implies \\frac{X\'\'(x)}{X(x)} = \\frac{T\'(t)}{k^2 T(t)} = -\\lambda \\implies \\begin{cases} X\'\'(x) + \\lambda X(x) = 0 \\\\ T\'(t) + \\lambda k^2 T(t) = 0 \\end{cases}',
            note: 'اگر ثابت جداسازی مثبت باشد ($+\\lambda$)، جواب زمانی $T(t) = e^{+\\lambda k^2 t}$ منفجر می‌شود که با اصل دوم ترمودینامیک و اتلاف حرارت در تضاد است.',
          },
          {
            label: 'الف) دو سر در دمای صفر (دیریکله همگن): $u(0,t)=u(L,t)=0$',
            formula: 'u(x,t) = \\sum_{n=1}^{\\infty} b_n \\sin\\left(\\frac{n\\pi x}{L}\\right) e^{-\\left(\\frac{n\\pi k}{L}\\right)^2 t} \\quad , \\quad b_n = \\frac{2}{L} \\int_{0}^{L} f(x) \\sin\\left(\\frac{n\\pi x}{L}\\right)dx',
            note: 'مقادیر ویژه $\\lambda_n = (n\\pi/L)^2$ و توابع ویژه $\\sin(n\\pi x/L)$ هستند. تمام هماهنگ‌ها با زمان به سمت صفر میل می‌کنند.',
          },
          {
            label: 'ب) دو سر کاملاً عایق حرارتی (نیومن همگن): $u_x(0,t)=u_x(L,t)=0$',
            formula: 'u(x,t) = \\frac{a_0}{2} + \\sum_{n=1}^{\\infty} a_n \\cos\\left(\\frac{n\\pi x}{L}\\right) e^{-\\left(\\frac{n\\pi k}{L}\\right)^2 t} \\quad , \\quad a_n = \\frac{2}{L} \\int_{0}^{L} f(x) \\cos\\left(\\frac{n\\pi x}{L}\\right)dx',
            note: 'جمله ثابت $\\frac{a_0}{2} = \\frac{1}{L}\\int_0^L f(x)dx$ دمای تعادل ماندگار است؛ چون عایق است، انرژی حرارتی کل میله پایسته می‌ماند.',
          },
          {
            label: 'ج) یک سر صفر و یک سر عایق (دیریکله-نیومن مختلط): $u(0,t)=0 , u_x(L,t)=0$',
            formula: 'u(x,t) = \\sum_{n=1}^{\\infty} c_n \\sin\\left(\\frac{(2n-1)\\pi x}{2L}\\right) e^{-\\left(\\frac{(2n-1)\\pi k}{2L}\\right)^2 t}',
            note: 'فرکانس‌های مکانی ربع‌موج $\\alpha_n = \\frac{(2n-1)\\pi}{2L}$ هستند.',
          },
        ],
        conceptualPoints: [
          'زمان فرونشست یا ثابت زمانی مشخصه مد اول (Fundamental Relaxation Time): $\\tau_1 = \\frac{L^2}{\\pi^2 k^2}$. هر چه طول میله $L$ دو برابر شود، زمان سرد شدن ۴ برابر افزایش می‌یابد!',
          'هموارسازی فوری (Instantaneous Smoothing): حتی اگر دمای اولیه دارای ناپیوستگی‌های پله‌ای یا شکستگی‌های تیز باشد، به محض گذر کوچک‌ترین زمان $t > 0$ به دلیل عامل $e^{-n^2 t}$ تمام هارمونیک‌های فرکانس بالا حذف شده و تابع بی‌نهایت بار مشتق‌پذیر ($C^\\infty$) می‌شود.',
        ],
      },
      {
        id: 'm6_nonhomog_bc_steady',
        title: 'شرایط مرزی غیرهمگن، تجزیه حالت ماندگار و گذرا و شرط مرزی جابجایی (رابین)',
        pdfPages: 'صفحات ۱۴۶ تا ۱۶۵',
        summary:
          'هنگامی که شرایط مرزی دو سر میله غیرصفر باشند (مانند $u(0,t)=T_1$ و $u(L,t)=T_2$)، نمی‌توان مستقیماً از جداسازی متغیرها استفاده کرد. روش استاندارد، تجزیه جواب به صورت مجموع حالت ماندگار تعادلی $v(x)$ (جواب معادله لاپلاس $v\'\'=0$ با شرایط مرزی اصلی) و حالت گذرای همگن $w(x,t)$ (با شرایط مرزی صفر و شرط اولیه اصلاح‌شده $w(x,0) = f(x) - v(x)$) است.',
        keyFormulas: [
          {
            label: 'تجزیه حالت ماندگار و گذرا برای شرایط مرزی دیریکله غیرهمگن',
            formula: 'u(x,t) = v(x) + w(x,t) \\quad , \\quad v\'\'(x) = 0 \\implies v(x) = T_1 + \\frac{T_2 - T_1}{L} x',
            note: '$v(x)$ خط راست متصل‌کننده دو دمای مرزی است و مستقل از زمان است.',
          },
          {
            label: 'مسئله مقدار مرزی همگن برای بخش گذرا $w(x,t)$',
            formula: '\\begin{cases} w_t = k^2 w_{xx} \\\\ w(0,t) = 0 \\; , \\; w(L,t) = 0 \\\\ w(x,0) = f(x) - v(x) = f(x) - \\left(T_1 + \\frac{T_2-T_1}{L}x\\right) \\end{cases}',
          },
          {
            label: 'شرط مرزی جابجایی حرارتی رابین (قانون خنک‌کاری نیوتن در انتهای میله)',
            formula: '-\\kappa \\frac{\\partial u}{\\partial x}(L,t) = h\\left(u(L,t) - T_\\infty\\right) \\implies u_x(L,t) + H\\,u(L,t) = H\\,T_\\infty \\quad (H = h/\\kappa)',
            note: '$h$: ضریب انتقال حرارت جابجایی سیال اطراف، $T_\\infty$: دمای محیط پیرامون.',
          },
        ],
        conceptualPoints: [
          'رفتار مجانبی در زمان‌های طولانی: چون جملات نمایی بخش گذرا $w(x,t)$ دارای ضریب $e^{-(n\\pi k/L)^2 t}$ هستند، همواره داریم $\\lim_{t \\to \\infty} w(x,t) = 0$؛ بنابراین در زمان بی‌نهایت، پروفایل دمای میله به طور کامل به خط راست ماندگار $v(x)$ همگرا می‌شود.',
          'اگر شرایط مرزی وابسته به زمان باشند ($u(0,t) = \\mu_1(t)$)، تابع کمکی $v(x,t) = \\mu_1(t) + \\frac{\\mu_2(t)-\\mu_1(t)}{L}x$ را تعریف کرده و مسئله به یک PDE ناهمگن تبدیل می‌شود.',
        ],
      },
      {
        id: 'm6_heat_source_duhamel',
        title: 'معادله گرمای ناهمگن با چشمه حرارتی داخلی و روش بسط بر حسب توابع ویژه',
        pdfPages: 'صفحات ۱۶۶ تا ۱۸۵',
        summary:
          'هنگامی که درون میله چشمه یا چاه تولید گرما وجود داشته باشد (مانند جریان الکتریکی ژول یا واکنش شیمیایی)، معادله به فرم ناهمگن $u_t = k^2 u_{xx} + g(x,t)$ درمی‌آید. برای حل این مسئله از روش بسط بر حسب توابع ویژه مکانی اشتورم-لیوویل متناظر (Eigenfunction Expansion) استفاده می‌کنیم.',
        keyFormulas: [
          {
            label: 'معادله گرمای ناهمگن با چشمه داخلی و بسط توابع ویژه',
            formula: 'u_t = k^2 u_{xx} + g(x,t) \\quad , \\quad u(x,t) = \\sum_{n=1}^\\infty T_n(t)\\,\\sin\\left(\\frac{n\\pi x}{L}\\right)',
            note: 'چشمه $g(x,t)$ نیز به سری سینوسی بسط داده می‌شود: $g(x,t) = \\sum g_n(t) \\sin(n\\pi x/L)$.',
          },
          {
            label: 'معادله دیفرانسیل معمولی مرتبه اول برای مدهای زمانی $T_n(t)$',
            formula: 'T\'_n(t) + \\left(\\frac{n\\pi k}{L}\\right)^2 T_n(t) = g_n(t) \\quad , \\quad T_n(0) = b_n = \\frac{2}{L}\\int_0^L f(x)\\sin\\left(\\frac{n\\pi x}{L}\\right)dx',
            note: 'این ODE خطی مرتبه اول با عامل انتگرال‌ساز $e^{(n\\pi k/L)^2 t}$ به سادگی حل می‌شود.',
          },
          {
            label: 'حالت ماندگار با چشمه حرارتی یکنواخت $g(x) = Q_0$ و دو سر دمای صفر',
            formula: 'k^2 v\'\'(x) + Q_0 = 0 \\implies v(x) = \\frac{Q_0}{2k^2}\\,x\\,(L - x)',
            note: 'پروفایل ماندگار یک سهمی متقارن با ماکزیمم دما در مرکز میله $x = L/2$ به مقدار $\\frac{Q_0 L^2}{8k^2}$ است.',
          },
        ],
        conceptualPoints: [
          'اصل دوهامل (Duhamel\'s Principle): جواب مسئله با چشمه زمان‌مند پیوسته $g(x,t)$ را می‌توان به صورت انتگرالی از جواب‌های یک مسئله همگن با پالس‌های ضربه اولیه پی‌درپی نوشت.',
        ],
      },
      {
        id: 'm6_infinite_heat_kernel',
        title: 'میله نامتناهی ($-\\infty < x < \\infty$) با تبدیل فوریه و هسته حرارتی گاوسی',
        pdfPages: 'صفحات ۱۸۶ تا ۲۰۲',
        summary:
          'برای میله‌های بی‌نهایت طویل، طیف مقادیر ویژه از گسسته به پیوسته تبدیل شده و سری فوریه به انتگرال و تبدیل فوریه میل می‌کند. با اعمال تبدیل فوریه مکانی $\\mathcal{F}[u(x,t)] = U(\\alpha, t)$، مشتق جزئی مکانی $u_{xx}$ به $-\\alpha^2 U$ تبدیل شده و جواب در حوزه فرکانس به سادگی یک تابع نمایی گاوسی می‌شود. تبدیل معکوس آن هسته حرارتی گاوسی (تابع گرین) را ایجاد می‌کند.',
        keyFormulas: [
          {
            label: 'حل معادله گرما در حوزه تبدیل فوریه مکانی $\\alpha$',
            formula: '\\mathcal{F}[u_t] = \\mathcal{F}[k^2 u_{xx}] \\implies \\frac{\\partial U}{\\partial t} = -k^2 \\alpha^2 U(\\alpha, t) \\implies U(\\alpha, t) = F(\\alpha)\\,e^{-k^2 \\alpha^2 t}',
            note: '$F(\\alpha) = \\mathcal{F}[f(x)]$ تبدیل فوریه توزیع دمای اولیه میله است.',
          },
          {
            label: 'هسته حرارتی گاوسی (تابع گرین معادله گرما) و انتگرال کانولوشن',
            formula: 'G(x,t) = \\mathcal{F}^{-1}\\left[e^{-k^2 \\alpha^2 t}\\right] = \\frac{1}{\\sqrt{4\\pi k^2 t}}\\,\\exp\\left(-\\frac{x^2}{4k^2 t}\\right) \\implies u(x,t) = (f * G_t)(x)',
          },
          {
            label: 'فرمول کامل انتگرال پواسون برای توزیع دمای میله نامتناهی',
            formula: 'u(x,t) = \\frac{1}{\\sqrt{4\\pi k^2 t}} \\int_{-\\infty}^{\\infty} f(\\xi)\\,\\exp\\left( -\\frac{(x - \\xi)^2}{4k^2 t} \\right) d\\xi',
            note: 'با تغییر متغیر $z = \\frac{\\xi - x}{\\sqrt{4k^2 t}}$، انتگرال به تابع خطای گاوسی $\\operatorname{erf}(z)$ تبدیل می‌شود.',
          },
          {
            label: 'پاسخ ضربه پالس حرارتی متمرکز (چشمه نقطه‌ای دیراک $f(x) = Q_0 \\delta(x)$)',
            formula: 'u(x,t) = \\frac{Q_0}{\\sqrt{4\\pi k^2 t}}\\,e^{-\\frac{x^2}{4k^2 t}} \\quad , \\quad \\sigma(t) = \\sqrt{2k^2 t}',
            note: 'پالس با گذشت زمان پهن‌تر می‌شود؛ انحراف معیار فضایی نفوذ گرما با جذر زمان $\\sqrt{t}$ افزایش می‌یابد.',
          },
        ],
        conceptualPoints: [
          'هسته گاوسی $G(x,t)$ یک توزیع احتمال نرمال با میانگین صفر و واریانس $\\sigma^2 = 2k^2 t$ است. مساحت زیر نمودار هسته در تمام زمان‌ها پایسته و برابر ۱ است: $\\int_{-\\infty}^\\infty G(x,t) dx = 1$.',
          'تابع خطا: $\\operatorname{erf}(z) = \\frac{2}{\\sqrt{\\pi}}\\int_0^z e^{-s^2}ds$ با خواص $\\operatorname{erf}(0)=0$ و $\\operatorname{erf}(\\infty)=1$ و $\\operatorname{erfc}(z) = 1 - \\operatorname{erf}(z)$.',
        ],
      },
      {
        id: 'm6_semi_infinite_rod',
        title: 'میله نیمه‌نامتناهی ($0 \\le x < \\infty$) با تبدیل‌های فوریه سینوسی و کسینوسی',
        pdfPages: 'صفحات ۲۰۳ تا ۲۱۰',
        summary:
          'برای میله‌های نیمه‌نامتناهی، انتخاب نوع تبدیل فوریه بر اساس نوع شرط مرزی در مبدا $x = 0$ تعیین می‌شود: اگر دمای سطح $u(0,t)$ معلوم باشد (دیریکله)، از تبدیل فوریه سینوسی استفاده می‌کنیم زیرا مشتق دوم به $-w^2 U_s + \\sqrt{2/\\pi}\\,w\\,u(0,t)$ تبدیل می‌شود؛ و اگر شار حرارتی $u_x(0,t)$ معلوم باشد (نیومن)، از تبدیل فوریه کسینوسی بهره می‌گیریم.',
        keyFormulas: [
          {
            label: 'تبدیل فوریه سینوسی برای شرط مرزی دمای سر میله $u(0,t) = T_0$',
            formula: '\\mathcal{F}_s[u_{xx}] = -w^2 U_s(w,t) + \\sqrt{\\frac{2}{\\pi}}\\,w\\,u(0,t) \\implies \\frac{dU_s}{dt} + k^2 w^2 U_s = k^2 w \\sqrt{\\frac{2}{\\pi}} T_0',
          },
          {
            label: 'جواب تحلیلی میله نیمه‌نامتناهی با دمای اولیه صفر و سطح در دمای $T_0$',
            formula: 'u(x,t) = T_0\\,\\operatorname{erfc}\\left( \\frac{x}{2k\\sqrt{t}} \\right) = T_0 \\left[ 1 - \\operatorname{erf}\\left( \\frac{x}{2k\\sqrt{t}} \\right) \\right]',
            note: 'این جواب کلاسیک نشان می‌دهد چگونه جبهه حرارت به داخل محیط نیمه‌نامتناهی نفوذ می‌کند.',
          },
          {
            label: 'تبدیل فوریه کسینوسی برای شرط مرزی شار سر میله $u_x(0,t) = q_0$',
            formula: '\\mathcal{F}_c[u_{xx}] = -w^2 U_c(w,t) - \\sqrt{\\frac{2}{\\pi}}\\,u_x(0,t)',
          },
        ],
        conceptualPoints: [
          'متغیر خودمتشابه (Similarity Variable): ترکیب $\\eta = \\frac{x}{2k\\sqrt{t}}$ متغیر بدون بعد خودمتشابه است که PDE گرما را به یک ODE معمولی برای پروفایل نفوذ تبدیل می‌کند.',
        ],
      },
      {
        id: 'm6_theorems_max_principle',
        title: 'قضایای بنیادی: اصل ماکزیمم، یکتایی و پایداری جواب، و روش انرژی',
        pdfPages: 'صفحات ۲۱۱ تا ۲۱۷',
        summary:
          'معادله گرما دارای خواص ساختاری عمیقی است: اصل ماکزیمم بیان می‌کند که بیشترین و کمترین دمای یک میله بدون چشمه داخلی تنها در مرزهای مکانی یا در لحظه اولیه رخ می‌دهد. از این اصل یا از روش انرژی، یکتایی و پایداری جواب در حس هادامارد اثبات می‌شود.',
        keyFormulas: [
          {
            label: 'اصل ماکزیمم ضعیف و قوی برای معادله گرما (Maximum Principle)',
            formula: '\\min_{\\Gamma} u \\le u(x,t) \\le \\max_{\\Gamma} u \\quad , \\quad \\Gamma = \\text{Parabolic Boundary } (t=0 \\cup x=0 \\cup x=L)',
            note: 'هیچ نقطه بیشینه یا کمینه موضعی نمی‌تواند در داخل بازه زمانی-مکانی $(0, L) \\times (0, T]$ بدون وجود چشمه به وجود آید.',
          },
          {
            label: 'روش انتگرال انرژی و اثبات یکتایی جواب معادله گرما',
            formula: 'E(t) = \\frac{1}{2}\\int_0^L [u_1(x,t) - u_2(x,t)]^2 dx \\implies \\frac{dE}{dt} = -k^2 \\int_0^L [w_x]^2 dx \\le 0',
            note: 'چون $E(0) = 0$ و مشتق انرژی ناافزا است، $E(t) \\equiv 0$ خواهد بود که یکتایی مطلق جواب را نتیجه می‌دهد.',
          },
        ],
        conceptualPoints: [
          'تعبیر ترمودینامیکی اصل ماکزیمم: گرما خودبه‌خود از جسم سردتر به جسم گرم‌تر منتقل نمی‌شود؛ بنابراین یک نقطه درونی میله نمی‌تواند بدون حضور منبع، از تمام همسایگی‌ها و شرایط اولیه خود داغ‌تر شود.',
          'برگشت‌ناپذیری زمانی (Time Irreversibility): حل معادله گرما به سمت جلو ($t > 0$) پایدار و هموارکننده است، اما حل آن به سمت گذشته ($t < 0$) یک مسئله بدطرح (Ill-Posed) با ناپایداری شدید نمایی است.',
        ],
      },
    ],
    workedExamples: [
      {
        id: 'ex_pdf_44_heat_homog',
        pdfReference: 'مثال ۴۴ جزوه (صفحه ۱۳۲)',
        title: 'حل کامل و گام‌به‌گام معادله گرمای همگن میله با روش جداسازی متغیرها',
        difficulty: 'متوسط (امتحانی)',
        problemStatement:
          'توزیع دمای $u(x,t)$ را در میله‌ای به طول $L = \\pi$ با ضریب $k = 1$ بیابید هرگاه دو سر میله در دمای صفر نگه داشته شوند ($u(0,t)=u(\\pi,t)=0$) و دمای اولیه میله برابر $u(x,0) = 4\\sin(x) - 7\\sin(3x)$ باشد.',
        problemFormula: 'u_t = u_{xx} \\quad (0 < x < \\pi, \\; t > 0) \\quad , \\quad u(0,t)=u(\\pi,t)=0 \\quad , \\quad u(x,0) = 4\\sin(x) - 7\\sin(3x)',
        finalAnswerFormula: 'u(x,t) = 4\\sin(x)\\,e^{-t} - 7\\sin(3x)\\,e^{-9t}',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: فرض جواب به صورت حاصل‌ضرب $u(x,t) = X(x)T(t)$ و جایگذاری در PDE',
            explanation:
              'مشتقات جزئی $u_t = X(x)T\'(t)$ و $u_{xx} = X\'\'(x)T(t)$ را در معادله گرما $u_t = u_{xx}$ قرار داده و طرفین را بر $X(x)T(t)$ تقسیم می‌کنیم:',
            formula:
              'X(x)T\'(t) = X\'\'(x)T(t) \\implies \\frac{X\'\'(x)}{X(x)} = \\frac{T\'(t)}{T(t)} = -\\lambda',
            whyHint: 'چون طرف چپ فقط تابعی از $x$ و طرف راست فقط تابعی از $t$ است، این تساوی تنها زمانی برای هر $x,t$ برقرار است که هر دو طرف برابر مقدار ثابتی مانند $-\\lambda$ باشند.',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: استخراج دو معادله دیفرانسیل معمولی (ODE) و جداسازی شرایط مرزی',
            explanation:
              'شرایط مرزی $u(0,t) = X(0)T(t) = 0$ و $u(\\pi,t) = X(\\pi)T(t) = 0$ را به شرط مکانی تبدیل می‌کنیم (چون $T(t) \\not\\equiv 0$ است):',
            formula:
              '\\begin{cases} X\'\'(x) + \\lambda X(x) = 0 \\quad , \\quad X(0) = 0 \\; , \\; X(\\pi) = 0 \\\\ T\'(t) + \\lambda T(t) = 0 \\end{cases}',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: حل مسئله اشتورم-لیوویل مکانی برای یافتن $\\lambda_n$ و $X_n(x)$',
            explanation:
              'طبق حالت الف جدول اشتورم-لیوویل در بازه $[0, \\pi]$، تنها به ازای $\\lambda = \\alpha^2 > 0$ جواب غیربدیهی داریم که در آن $X(x) = c_1\\cos(\\alpha x) + c_2\\sin(\\alpha x)$ است:',
            formula:
              'X(0) = 0 \\implies c_1 = 0 \\; , \\; X(\\pi) = c_2\\sin(\\alpha\\pi) = 0 \\implies \\alpha_n = n \\implies \\lambda_n = n^2 \\; , \\; X_n(x) = \\sin(nx) \\quad (n=1,2,\\dots)',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: حل معادله دیفرانسیل زمانی $T\'_n(t) + n^2 T_n(t) = 0$ و اصل برهم‌نهی',
            explanation:
              'به ازای هر مقدار ویژه $\\lambda_n = n^2$، معادله مرتبه اول زمانی را حل کرده و با اصل برهم‌نهی (Superposition) جواب سری کلی را تشکیل می‌دهیم:',
            formula:
              '\\frac{dT_n}{T_n} = -n^2\\,dt \\implies T_n(t) = b_n e^{-n^2 t} \\implies u(x,t) = \\sum_{n=1}^{\\infty} b_n \\sin(nx)\\,e^{-n^2 t}',
          },
          {
            stepNumber: 5,
            title: 'گام ۵: اعمال شرط اولیه $u(x,0) = f(x)$ و تعیین ضرایب $b_n$',
            explanation:
              'در لحظه $t = 0$ داریم $e^0 = 1$. با قرار دادن $t = 0$ در سری و تطبیق ضرایب دو طرف تساوی داریم:',
            formula:
              'u(x,0) = \\sum_{n=1}^{\\infty} b_n \\sin(nx) = b_1\\sin(x) + b_2\\sin(2x) + b_3\\sin(3x) + \\dots = 4\\sin(x) - 7\\sin(3x)',
          },
          {
            stepNumber: 6,
            title: 'گام ۶: استخراج مقادیر عددی ضرایب و نوشتن جواب نهایی $u(x,t)$',
            explanation:
              'به دلیل استقلال خطی و تعامد توابع $\\sin(nx)$، ضرایب متناظر دو طرف باید دقیقاً برابر باشند:',
            formula:
              'b_1 = 4 \\; , \\; b_3 = -7 \\; , \\; b_n = 0 \\; (n \\neq 1, 3) \\implies u(x,t) = 4\\sin(x)\\,e^{-t} - 7\\sin(3x)\\,e^{-9t}',
            highlightNote: 'هرگاه شرط اولیه خودش ترکیبی از جملات $\\sin\\left(\\frac{n\\pi x}{L}\\right)$ باشد، نیازی به انتگرال‌گیری نیست و ضرایب با مقایسه مستقیم به دست می‌آیند.',
          },
        ],
      },
      {
        id: 'ex_pdf_45_heat_insulated',
        pdfReference: 'مثال ۴۵ جزوه (صفحه ۱۴۱)',
        title: 'حل کامل میله با دو سر عایق حرارتی (شرایط مرزی نیومن) و بقای انرژی حرارتی',
        difficulty: 'متوسط (امتحانی)',
        problemStatement:
          'میله‌ای به طول $L = \\pi$ با دو سر کاملاً عایق حرارتی ($u_x(0,t) = u_x(\\pi,t) = 0$) و ضریب $k = 1$ مفروض است. اگر دمای اولیه میله به صورت شیب خطی $u(x,0) = x$ باشد، توزیع دمای $u(x,t)$ را بیابید و مقدار دمای تعادل نهایی در زمان $t \\to \\infty$ را محاسبه کنید.',
        problemFormula: 'u_t = u_{xx} \\quad (0 < x < \\pi) \\quad , \\quad u_x(0,t)=0 \\; , \\; u_x(\\pi,t)=0 \\quad , \\quad u(x,0) = x',
        finalAnswerFormula: 'u(x,t) = \\frac{\\pi}{2} - \\frac{4}{\\pi} \\sum_{m=1}^{\\infty} \\frac{\\cos((2m-1)x)}{(2m-1)^2}\\,e^{-(2m-1)^2 t}',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: تشکیل مسئله اشتورم-لیوویل کسینوسی با شرایط مرزی مشتق صفر',
            explanation:
              'با جداسازی متغیرها $u(x,t) = X(x)T(t)$، شرایط مرزی عایق به $X\'(0) = 0$ و $X\'(\\pi) = 0$ تبدیل می‌شوند:',
            formula:
              'X\'\'(x) + \\lambda X(x) = 0 \\quad , \\quad X\'(0) = 0 \\; , \\; X\'(\\pi) = 0 \\implies \\begin{cases} \\lambda_0 = 0 \\implies X_0(x) = 1 \\\\ \\lambda_n = n^2 \\implies X_n(x) = \\cos(nx) \\quad (n \\ge 1) \\end{cases}',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: حل بخش زمانی و تشکیل سری کسینوسی کامل فوریه',
            explanation:
              'برای $\\lambda_0 = 0$ داریم $T\'_0(t) = 0 \\implies T_0(t) = \\frac{a_0}{2}$ (ثابت). برای $n \\ge 1$ داریم $T_n(t) = a_n e^{-n^2 t}$:',
            formula:
              'u(x,t) = \\frac{a_0}{2} + \\sum_{n=1}^{\\infty} a_n \\cos(nx)\\,e^{-n^2 t}',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: محاسبه ضریب دمای ماندگار $a_0$ (دمای میانگین اولیه میله)',
            explanation:
              'طبق فرمول سری فوریه کسینوسی در بازه $[0, \\pi]$ داریم:',
            formula:
              '\\frac{a_0}{2} = \\frac{1}{\\pi} \\int_{0}^{\\pi} f(x)\\,dx = \\frac{1}{\\pi} \\int_{0}^{\\pi} x\\,dx = \\frac{1}{\\pi} \\left[ \\frac{x^2}{2} \\right]_0^\\pi = \\frac{\\pi}{2}',
            whyHint: 'چون دو سر میله عایق هستند، هیچ حرارتی هدر نمی‌رود و دمای نهایی میله برابر میانگین حسابی دمای اولیه خواهد بود.',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: محاسبه ضرایب $a_n$ با انتگرال‌گیری جزء به جزء',
            explanation:
              'ضرایب $a_n$ را با انتخاب $u = x \\implies du = dx$ و $dv = \\cos(nx)dx \\implies v = \\frac{\\sin(nx)}{n}$ محاسبه می‌کنیم:',
            formula:
              'a_n = \\frac{2}{\\pi} \\int_{0}^{\\pi} x \\cos(nx)\\,dx = \\frac{2}{\\pi} \\left( \\left[ x \\frac{\\sin(nx)}{n} \\right]_0^\\pi - \\int_0^\\pi \\frac{\\sin(nx)}{n}\\,dx \\right) = \\frac{2}{\\pi} \\left( 0 + \\left[ \\frac{\\cos(nx)}{n^2} \\right]_0^\\pi \\right) = \\frac{2[(-1)^n - 1]}{\\pi n^2}',
          },
          {
            stepNumber: 5,
            title: 'گام ۵: تفکیک زوج و فرد برای ضرایب $a_n$ و بازنویسی جواب نهایی',
            explanation:
              'به ازای $n$ زوج داریم $(-1)^n - 1 = 0 \\implies a_n = 0$. به ازای $n = 2m-1$ فرد داریم $(-1)^{2m-1} - 1 = -2 \\implies a_{2m-1} = \\frac{-4}{\\pi(2m-1)^2}$:',
            formula:
              'u(x,t) = \\frac{\\pi}{2} - \\frac{4}{\\pi} \\sum_{m=1}^{\\infty} \\frac{\\cos((2m-1)x)}{(2m-1)^2}\\,e^{-(2m-1)^2 t}',
            highlightNote: 'وقتی $t \\to \\infty$، تمام جملات نمایی میرا شده و دمای کل نقاط میله به دمای ثابت و یکنواخت $\\frac{\\pi}{2}$ می‌رسد.',
          },
        ],
      },
      {
        id: 'ex_pdf_49_nonhomog_bc',
        pdfReference: 'مثال ۴۹ جزوه (صفحه ۱۶۲)',
        title: 'حل کامل معادله گرما با شرایط مرزی غیرهمگن (تجزیه به حالت ماندگار و گذرا)',
        difficulty: 'پیشرفته (تکمیلی)',
        problemStatement:
          'مسئله معادله گرمای $u_t = k^2 u_{xx}$ در میله‌ای به طول $L = \\pi$ با ضریب $k = 1$ را با شرایط مرزی غیرهمگن $u(0,t) = 20$ و $u(\\pi,t) = 40$ و دمای اولیه صفر $u(x,0) = 0$ به طور کامل حل کنید.',
        problemFormula: 'u_t = u_{xx} \\quad (0 < x < \\pi) \\quad , \\quad u(0,t) = 20 \\; , \\; u(\\pi,t) = 40 \\; , \\; u(x,0) = 0',
        finalAnswerFormula: 'u(x,t) = 20 + \\frac{20}{\\pi}x + \\sum_{n=1}^{\\infty} \\left( \\frac{80(-1)^n - 40}{n\\pi} \\right) \\sin(nx)\\,e^{-n^2 t}',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: تجزیه جواب به مجموع دمای ماندگار $v(x)$ و دمای گذرا $w(x,t)$',
            explanation:
              'چون شرایط مرزی غیرصفر هستند، قرار می‌دهیم $u(x,t) = v(x) + w(x,t)$ که در آن $v(x)$ دمای تعادل در زمان $t \\to \\infty$ است و در $v\'\'(x) = 0$ صدق می‌کند:',
            formula:
              'v\'\'(x) = 0 \\implies v(x) = a x + b \\quad , \\quad \\begin{cases} v(0) = b = 20 \\\\ v(\\pi) = a\\pi + 20 = 40 \\implies a = \\frac{20}{\\pi} \\end{cases} \\implies v(x) = 20 + \\frac{20}{\\pi}x',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: تشکیل مسئله مقدار مرزی همگن برای بخش گذرا $w(x,t)$',
            explanation:
              'اکنون تابع $w(x,t) = u(x,t) - v(x)$ دارای شرایط مرزی صفر بوده و شرط اولیه آن برابر است با:',
            formula:
              'w_t = w_{xx} \\quad , \\quad w(0,t) = 0 \\; , \\; w(\\pi,t) = 0 \\quad , \\quad w(x,0) = u(x,0) - v(x) = -20 - \\frac{20}{\\pi}x',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: نوشتن سری سینوسی بخش گذرا و فرمول ضرایب $b_n$',
            explanation:
              'جواب بخش همگن به صورت $w(x,t) = \\sum_{n=1}^{\\infty} b_n \\sin(nx)\\,e^{-n^2 t}$ است که در آن ضرایب $b_n$ با انتگرال‌گیری جزء به جزء محاسبه می‌شوند:',
            formula:
              'b_n = \\frac{2}{\\pi} \\int_{0}^{\\pi} \\left( -20 - \\frac{20}{\\pi}x \\right) \\sin(nx)\\,dx',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: انجام کامل انتگرال‌گیری جزء به جزء برای محاسبه $b_n$',
            explanation:
              'با انتخاب $u = -20 - \\frac{20}{\\pi}x \\implies du = -\\frac{20}{\\pi}\\,dx$ و $dv = \\sin(nx)\\,dx \\implies v = -\\frac{\\cos(nx)}{n}$ داریم:',
            formula:
              'b_n = \\frac{2}{\\pi} \\left( \\left[ \\left(20 + \\frac{20}{\\pi}x\\right)\\frac{\\cos(nx)}{n} \\right]_{0}^{\\pi} - \\int_{0}^{\\pi} \\frac{20}{n\\pi}\\cos(nx)\\,dx \\right) = \\frac{2}{\\pi} \\left( \\frac{40\\cos(n\\pi) - 20\\cos(0)}{n} - 0 \\right) = \\frac{80(-1)^n - 40}{n\\pi}',
          },
          {
            stepNumber: 5,
            title: 'گام ۵: ترکیب حالت ماندگار $v(x)$ و حالت گذرا $w(x,t)$ برای جواب نهایی',
            explanation:
              'با جمع کردن توزیع خطی ماندگار و سری فوریه گذرا، جواب کامل $u(x,t)$ به دست می‌آید:',
            formula:
              'u(x,t) = 20 + \\frac{20}{\\pi}x + \\sum_{n=1}^{\\infty} \\left( \\frac{80(-1)^n - 40}{n\\pi} \\right) \\sin(nx)\\,e^{-n^2 t}',
            highlightNote: 'وقتی $t \\to \\infty$ میل کند، جملات نمایی $e^{-n^2 t} \\to 0$ شده و دمای میله به خط راست $v(x) = 20 + \\frac{20}{\\pi}x$ میل می‌کند.',
          },
        ],
      },
      {
        id: 'ex_heat_source_eigenfunction',
        pdfReference: 'بخش معادلات ناهمگن جزوه (صفحه ۱۷۴)',
        title: 'حل معادله گرمای ناهمگن با چشمه حرارتی داخلی با روش بسط توابع ویژه',
        difficulty: 'پیشرفته (تکمیلی)',
        problemStatement:
          'توزیع دمای $u(x,t)$ را در میله‌ای با معادله ناهمگن $u_t = u_{xx} + \\sin(2x)$ روی بازه $(0, \\pi)$ بیابید هرگاه دو سر میله در دمای صفر نگه داشته شوند ($u(0,t) = u(\\pi,t) = 0$) و دمای اولیه میله $u(x,0) = \\sin(x)$ باشد.',
        problemFormula: 'u_t = u_{xx} + \\sin(2x) \\quad , \\quad u(0,t)=u(\\pi,t)=0 \\quad , \\quad u(x,0) = \\sin(x)',
        finalAnswerFormula: 'u(x,t) = \\sin(x)\\,e^{-t} + \\frac{1}{4}\\left(1 - e^{-4t}\\right)\\sin(2x)',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: بسط جواب و چشمه بر حسب توابع ویژه مکانی اشتورم-لیوویل',
            explanation:
              'چون شرایط مرزی در دو سر صفر هستند، توابع ویژه مکانی $\\sin(nx)$ هستند. جواب را به صورت $u(x,t) = \\sum_{n=1}^\\infty T_n(t)\\sin(nx)$ فرض می‌کنیم:',
            formula:
              'u(x,t) = \\sum_{n=1}^{\\infty} T_n(t)\\,\\sin(nx) \\quad , \\quad g(x) = \\sin(2x) = \\sum_{n=1}^\\infty g_n\\,\\sin(nx)',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: جایگذاری در PDE و تشکیل دستگاه معادلات دیفرانسیل زمانی',
            explanation:
              'با مشتق‌گیری و جایگذاری در $u_t - u_{xx} = \\sin(2x)$ داریم:',
            formula:
              '\\sum_{n=1}^{\\infty} [T\'_n(t) + n^2 T_n(t)]\\,\\sin(nx) = \\sin(2x) \\implies \\begin{cases} T\'_1(t) + 1^2 T_1(t) = 0 \\\\ T\'_2(t) + 2^2 T_2(t) = 1 \\\\ T\'_n(t) + n^2 T_n(t) = 0 \\quad (n \\ge 3) \\end{cases}',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: اعمال شرایط اولیه $u(x,0) = \\sin(x)$ به مدهای زمانی $T_n(0)$',
            explanation:
              'با قرار دادن $t = 0$ در بسط داریم $u(x,0) = \\sum T_n(0)\\sin(nx) = \\sin(x)$:',
            formula:
              'T_1(0) = 1 \\quad , \\quad T_2(0) = 0 \\quad , \\quad T_n(0) = 0 \\quad (n \\ge 3)',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: حل ODEهای مدهای اول و دوم با روش عامل انتگرال‌ساز',
            explanation:
              'برای مد اول: $T\'_1 + T_1 = 0 \\implies T_1(t) = T_1(0)e^{-t} = e^{-t}$. برای مد دوم: معادله ناهمگن $T\'_2 + 4T_2 = 1$ با شرط $T_2(0) = 0$ دارای جواب زیر است:',
            formula:
              '\\frac{d}{dt}\\left( e^{4t} T_2(t) \\right) = e^{4t} \\implies e^{4t} T_2(t) = \\frac{e^{4t}}{4} + C \\implies T_2(t) = \\frac{1}{4} + C e^{-4t} \\xrightarrow{T_2(0)=0} C = -\\frac{1}{4} \\implies T_2(t) = \\frac{1}{4}(1 - e^{-4t})',
          },
          {
            stepNumber: 5,
            title: 'گام ۵: جمع‌بندی جملات و استخراج جواب نهایی $u(x,t)$',
            explanation:
              'تمامی مدهای $n \\ge 3$ به دلیل شرایط اولیه و چشمه صفر برابر صفر باقی می‌مانند؛ بنابراین جواب کامل برابر است با:',
            formula:
              'u(x,t) = \\sin(x)\\,e^{-t} + \\frac{1}{4}\\left(1 - e^{-4t}\\right)\\sin(2x)',
            highlightNote: 'در زمان $t \\to \\infty$، اثر شرط اولیه ($\sin(x)e^{-t}$) میرا شده و اثر ماندگار چشمه حرارتی $\\frac{1}{4}\\sin(2x)$ در میله باقی می‌ماند.',
          },
        ],
      },
      {
        id: 'ex_heat_semi_infinite_sine',
        pdfReference: 'بخش میله نیمه‌نامتناهی جزوه (صفحه ۲۰۴)',
        title: 'حل معادله گرما در میله نیمه‌نامتناهی با تبدیل فوریه سینوسی و تابع خطای مکمل',
        difficulty: 'پیشرفته (تکمیلی)',
        problemStatement:
          'میله نیمه‌نامتناهی $0 < x < \\infty$ با ضریب پخش $k$ و دمای اولیه صفر ($u(x,0) = 0$) مفروض است. در لحظه $t = 0$ دمای سر میله ناگهان به مقدار ثابت $T_0$ رسانده و در آن حفظ می‌شود ($u(0,t) = T_0$). توزیع دما $u(x,t)$ را با استفاده از تبدیل فوریه سینوسی بیابید.',
        problemFormula: 'u_t = k^2 u_{xx} \\quad (x > 0, \\; t > 0) \\quad , \\quad u(0,t) = T_0 \\; , \\; u(x,0) = 0',
        finalAnswerFormula: 'u(x,t) = T_0 \\,\\operatorname{erfc}\\left( \\frac{x}{2k\\sqrt{t}} \\right)',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: علت انتخاب تبدیل فوریه سینوسی و اعمال آن به طرفین PDE',
            explanation:
              'چون شرط مرزی در مبدا به صورت دمای مقداردهی‌شده (دیریکله) است، تبدیل فوریه سینوسی $U_s(w,t) = \\mathcal{F}_s[u(x,t)] = \\sqrt{\\frac{2}{\\pi}}\\int_0^\\infty u(x,t)\\sin(wx)dx$ را اعمال می‌کنیم:',
            formula:
              '\\mathcal{F}_s[u_{xx}] = -w^2 U_s(w,t) + \\sqrt{\\frac{2}{\\pi}}\\,w\\,u(0,t) = -w^2 U_s(w,t) + \\sqrt{\\frac{2}{\\pi}}\\,w\\,T_0',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: تشکیل معادله دیفرانسیل معمولی زمانی برای $U_s(w,t)$',
            explanation:
              'با جایگذاری در PDE داریم $\\frac{\\partial U_s}{\\partial t} = k^2 \\mathcal{F}_s[u_{xx}]$ که یک ODE مرتبه اول خطی است:',
            formula:
              '\\frac{dU_s}{dt} + k^2 w^2 U_s = k^2 w \\sqrt{\\frac{2}{\\pi}} T_0 \\quad , \\quad U_s(w,0) = \\mathcal{F}_s[0] = 0',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: حل ODE و یافتن پاسخ در حوزه فرکانس تبدیل فوریه',
            explanation:
              'با ضرب در عامل انتگرال‌ساز $e^{k^2 w^2 t}$ و انتگرال‌گیری داریم:',
            formula:
              'U_s(w,t) = \\sqrt{\\frac{2}{\\pi}}\\,\\frac{T_0}{w}\\left( 1 - e^{-k^2 w^2 t} \\right)',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: اعمال تبدیل معکوس فوریه سینوسی و بازنویسی به فرم تابع خطا',
            explanation:
              'با استفاده از رابطه انتگرال معکوس فوریه سینوسی و انتگرال مشهور لاپلاس داریم:',
            formula:
              'u(x,t) = \\sqrt{\\frac{2}{\\pi}} \\int_0^\\infty U_s(w,t)\\,\\sin(wx)\\,dw = \\frac{2T_0}{\\pi} \\int_0^\\infty \\frac{1 - e^{-k^2 w^2 t}}{w}\\,\\sin(wx)\\,dw = T_0 \\left[ 1 - \\operatorname{erf}\\left(\\frac{x}{2k\\sqrt{t}}\\right) \\right] = T_0\\,\\operatorname{erfc}\\left(\\frac{x}{2k\\sqrt{t}}\\right)',
            highlightNote: 'تابع $\\operatorname{erfc}(\\eta)$ نشان‌دهنده نفوذ جبهه حرارت در محیط نیمه‌نامتناهی با متغیر خودمتشابه $\\eta = \\frac{x}{2k\\sqrt{t}}$ است.',
          },
        ],
      },
      {
        id: 'ex_heat_infinite_gaussian_kernel',
        pdfReference: 'بخش میله نامتناهی و هسته گرما جزوه (صفحه ۱۹۲)',
        title: 'حل معادله گرما در میله نامتناهی با پالس اولیه مستطیلی با هسته گاوسی',
        difficulty: 'پیشرفته (تکمیلی)',
        problemStatement:
          'میله نامتناهی $-\\infty < x < \\infty$ با ضریب $k$ دارای دمای اولیه به صورت پالس حرارتی متقارن $u(x,0) = T_0$ برای $|x| < a$ و $u(x,0) = 0$ برای $|x| \\ge a$ است. توزیع دمای $u(x,t)$ را با استفاده از هسته حرارتی گاوسی بر حسب تابع خطای $\\operatorname{erf}$ بیابید.',
        problemFormula: 'u_t = k^2 u_{xx} \\quad (-\\infty < x < \\infty) \\quad , \\quad u(x,0) = \\begin{cases} T_0 & |x| < a \\\\ 0 & |x| \\ge a \\end{cases}',
        finalAnswerFormula: 'u(x,t) = \\frac{T_0}{2} \\left[ \\operatorname{erf}\\left(\\frac{x+a}{2k\\sqrt{t}}\\right) - \\operatorname{erf}\\left(\\frac{x-a}{2k\\sqrt{t}}\\right) \\right]',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: نوشتن فرمول عمومی کانولوشن با هسته حرارتی گاوسی (تابع گرین)',
            explanation:
              'جواب معادله گرما روی کل محور حقیقی با هسته گاوسی $G(x-\\xi, t) = \\frac{1}{\\sqrt{4\\pi k^2 t}} e^{-\\frac{(x-\\xi)^2}{4k^2 t}}$ بیان می‌شود:',
            formula:
              'u(x,t) = \\frac{1}{\\sqrt{4\\pi k^2 t}} \\int_{-\\infty}^{\\infty} f(\\xi)\\,\\exp\\left( -\\frac{(x-\\xi)^2}{4k^2 t} \\right)d\\xi',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: اعمال شرط پالس مستطیلی و محدود کردن حدود انتگرال به $[-a, a]$',
            explanation:
              'چون $f(\\xi) = T_0$ تنها در بازه $[-a, a]$ غیرصفر است، حدود انتگرال به این بازه محدود می‌شود:',
            formula:
              'u(x,t) = \\frac{T_0}{\\sqrt{4\\pi k^2 t}} \\int_{-a}^{a} \\exp\\left( -\\frac{(\\xi - x)^2}{4k^2 t} \\right)d\\xi',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: تغییر متغیر برای تبدیل انتگرال به فرم استاندارد تابع خطا $\\operatorname{erf}$',
            explanation:
              'تغییر متغیر $s = \\frac{\\xi - x}{2k\\sqrt{t}}$ را اعمال می‌کنیم که در آن $d\\xi = 2k\\sqrt{t}\\,ds$ است:',
            formula:
              '\\begin{cases} \\xi = -a \\implies s = \\frac{-a - x}{2k\\sqrt{t}} = -\\frac{x+a}{2k\\sqrt{t}} \\\\ \\xi = a \\implies s = \\frac{a - x}{2k\\sqrt{t}} = -\\frac{x-a}{2k\\sqrt{t}} \\end{cases} \\implies u(x,t) = \\frac{T_0}{\\sqrt{\\pi}} \\int_{-\\frac{x+a}{2k\\sqrt{t}}}^{-\\frac{x-a}{2k\\sqrt{t}}} e^{-s^2}\\,ds',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: تفکیک انتگرال و استفاده از خاصیت فرد بودن تابع خطا $\\operatorname{erf}(-z) = -\\operatorname{erf}(z)$',
            explanation:
              'با توجه به تعریف $\\operatorname{erf}(z) = \\frac{2}{\\sqrt{\\pi}}\\int_0^z e^{-s^2}ds$ و تقارن انتگرال داریم:',
            formula:
              'u(x,t) = \\frac{T_0}{2} \\left[ \\operatorname{erf}\\left(\\frac{x+a}{2k\\sqrt{t}}\\right) - \\operatorname{erf}\\left(\\frac{x-a}{2k\\sqrt{t}}\\right) \\right]',
            highlightNote: 'در زمان $t \\to 0^+$ این تابع دقیقاً پالس اولیه مستطیلی با پرش‌های تیز است، اما برای هر $t > 0$ لبه‌های پالس کاملاً هموار و پیوسته می‌شوند.',
          },
        ],
      },
      {
        id: 'ex_pde_canonical_transformation',
        pdfReference: 'بخش فرم‌های کانونی جزوه (صفحه ۱۲۱)',
        title: 'تبدیل معادله با مشتقات جزئی مرتبه دوم با ضرایب متغیر به فرم کانونی استاندارد',
        difficulty: 'پیشرفته (تکمیلی)',
        problemStatement:
          'نوع معادله با مشتقات جزئی $x\\,u_{xx} - y\\,u_{yy} + \\frac{1}{2}(u_x - u_y) = 0$ را در ناحیه $x > 0, y > 0$ تعیین کنید و با متغیرهای مشخصه، آن را به فرم کانونی هذلولوی تبدیل کنید.',
        problemFormula: 'x\\,u_{xx} - y\\,u_{yy} + \\frac{1}{2}(u_x - u_y) = 0 \\quad (x > 0, \\; y > 0)',
        finalAnswerFormula: 'u_{\\xi\\eta} = 0 \\implies u(x,y) = f_1(\\sqrt{x} + \\sqrt{y}) + f_2(\\sqrt{x} - \\sqrt{y})',
        steps: [
          {
            stepNumber: 1,
            title: 'گام ۱: محاسبه مبین $\\Delta$ و تعیین نوع معادله',
            explanation:
              'ضرایب مشتقات مرتبه دوم عبارتند از $A = x$ و $B = 0$ و $C = -y$:',
            formula:
              '\\Delta = B^2 - 4AC = 0^2 - 4(x)(-y) = 4xy > 0 \\quad (\\forall x>0, y>0)',
            whyHint: 'چون مبین مثبت اکید است، معادله در ربع اول دستگاه مختصات از نوع هذلولوی (Hyperbolic) است.',
          },
          {
            stepNumber: 2,
            title: 'گام ۲: تشکیل معادله دیفرانسیل مشخصه‌های حقیقی معادله',
            explanation:
              'شیب منحنی‌های مشخصه از فرمول $\\frac{dy}{dx} = \\frac{B \\pm \\sqrt{\\Delta}}{2A}$ به دست می‌آید:',
            formula:
              '\\frac{dy}{dx} = \\pm \\frac{\\sqrt{4xy}}{2x} = \\pm \\sqrt{\\frac{y}{x}} \\implies \\frac{dy}{\\sqrt{y}} \\mp \\frac{dx}{\\sqrt{x}} = 0',
          },
          {
            stepNumber: 3,
            title: 'گام ۳: انتگرال‌گیری از مشخصه‌ها و معرفی متغیرهای کانونی $\\xi$ و $\\eta$',
            explanation:
              'با انتگرال‌گیری مستقیم از دو معادله جداپذیر مشخصه داریم:',
            formula:
              '2\\sqrt{y} \\mp 2\\sqrt{x} = C \\implies \\begin{cases} \\xi = \\sqrt{x} + \\sqrt{y} \\\\ \\eta = \\sqrt{x} - \\sqrt{y} \\end{cases}',
          },
          {
            stepNumber: 4,
            title: 'گام ۴: اعمال قاعده زنجیره‌ای برای مشتقات جزئی و ساده‌سازی به فرم کانونی',
            explanation:
              'با مشتق‌گیری برحسب $\\xi, \\eta$ و جایگذاری در معادله اصلی، تمام جملات مرتبه پایین حذف شده و فرم کانونی ظاهر می‌شود:',
            formula:
              'u_{\\xi\\eta} = 0 \\implies u(\\xi, \\eta) = f_1(\\xi) + f_2(\\eta) = f_1(\\sqrt{x} + \\sqrt{y}) + f_2(\\sqrt{x} - \\sqrt{y})',
            highlightNote: 'فرم کانونی هذلولوی $u_{\\xi\\eta} = 0$ به ما امکان می‌دهد جواب عمومی معادله را بدون حدس یا تقریب به طور مستقیم به دست آوریم.',
          },
        ],
      },
    ],
    practiceQuestions: [
      {
        id: 'q1_m6',
        question: 'معادله با مشتقات جزئی $4 u_{xx} - 5 u_{xy} + u_{yy} + 3 u_x = 0$ از کدام نوع است؟',
        options: [
          '\\text{سهموی (Parabolic)}',
          '\\text{هذلولوی (Hyperbolic)}',
          '\\text{بیضوی (Elliptic)}',
          '\\text{مختلط غیرخطی}',
        ],
        correctIndex: 1,
        explanation:
          'با توجه به $A = 4$، $B = -5$ و $C = 1$، مقدار مبین برابر $\\Delta = B^2 - 4AC = (-5)^2 - 4(4)(1) = 25 - 16 = 9 > 0$ است؛ بنابراین معادله از نوع هذلولوی است.',
      },
      {
        id: 'q2_m6',
        question:
          'در میله‌ای به طول $L$ که دو سر آن کاملاً عایق حرارتی هستند ($u_x(0,t) = u_x(L,t) = 0$)، وقتی زمان $t \\to \\infty$ میل کند، دمای میله به چه مقداری می‌رسد؟',
        options: [
          '0',
          '\\frac{1}{L} \\int_0^L f(x)\\,dx',
          '\\max f(x)',
          '\\sum_{n=1}^\\infty a_n',
        ],
        correctIndex: 1,
        explanation:
          'در شرایط مرزی نیومن (عایق)، هیچ حرارتی از دو سر میله خارج نمی‌شود؛ جملات کسینوسی با زمان میرا شده و تنها جمله ثابت سری کسینوسی یعنی $\\frac{a_0}{2} = \\frac{1}{L} \\int_0^L f(x)\\,dx$ باقی می‌ماند.',
      },
      {
        id: 'q3_m6',
        question: 'در میله‌ای به طول $L = \\pi$ با شرایط مرزی $u(0,t) = 10$ و $u(\\pi,t) = 50$، توزیع دمای حالت ماندگار (Steady-State) یعنی $v(x)$ کدام است؟',
        options: [
          'v(x) = 10 + \\frac{40}{\\pi}x',
          'v(x) = 50 - \\frac{40}{\\pi}x',
          'v(x) = 30\\sin(x)',
          'v(x) = \\frac{60}{\\pi}x',
        ],
        correctIndex: 0,
        explanation:
          'در حالت ماندگار $v\'\'(x) = 0 \\implies v(x) = T_1 + \\frac{T_2 - T_1}{L}x = 10 + \\frac{50 - 10}{\\pi}x = 10 + \\frac{40}{\\pi}x$.',
      },
      {
        id: 'q4_m6',
        question: 'در روش جداسازی متغیرها $u(x,t) = X(x)T(t)$ برای معادله گرما $u_t = k^2 u_{xx}$، چرا ثابت جداسازی $\\frac{X\'\'}{X} = \\frac{T\'}{k^2 T}$ الزاماً باید یک مقدار منفی مانند $-\\lambda = -\\alpha^2$ انتخاب شود؟',
        options: [
          'برای جلوگیری از انفجار نمایی دما در زمان $t \\to \\infty$ و ارضای میرایی طبیعی پدیده نفوذ',
          'چون توابع مثلثاتی مشتق‌پذیر نیستند',
          'چون ضریب پخش حرارتی $k^2$ منفی است',
          'برای اینکه معادله به فرم بیضوی تبدیل شود',
        ],
        correctIndex: 0,
        explanation:
          'اگر ثابت جداسازی مثبت ($+\\alpha^2$) باشد، جواب زمانی $T(t) = C e^{k^2 \\alpha^2 t}$ خواهد شد که با گذشت زمان به سمت بی‌نهایت منفجر می‌شود؛ در حالی که طبق قانون دوم ترمودینامیک و فیزیک نفوذ حرارت، انرژی گرمایی در غیاب چشمه باید میرا شونده ($e^{-k^2 \\alpha^2 t}$) باشد.',
      },
      {
        id: 'q5_m6',
        question: 'اگر طول میله‌ای با دو سر دمای صفر دو برابر شود ($L \\to 2L$)، زمان فرونشست یا ثابت زمانی مشخصه مد اول آن ($\\tau_1$) چند برابر می‌شود؟',
        options: [
          '۲ برابر',
          '۴ برابر',
          'نصف می‌شود',
          '۱۶ برابر',
        ],
        correctIndex: 1,
        explanation:
          'ثابت زمانی مشخصه فرونشست مد اول برابر $\\tau_1 = \\frac{L^2}{\\pi^2 k^2}$ است که با مجذور طول میله $L^2$ متناسب است؛ بنابراین با دو برابر شدن طول میله، زمان لازم برای افت دما ۴ برابر خواهد شد.',
      },
      {
        id: 'q6_m6',
        question: 'در حل معادله گرما در میله نیمه‌نامتناهی $x > 0$، اگر شرط مرزی به صورت شار حرارتی مشخص در مبدا ($u_x(0,t) = q(t)$) باشد، کدام تبدیل فوریه باید استفاده شود؟',
        options: [
          '\\text{تبدیل فوریه سینوسی } \\mathcal{F}_s',
          '\\text{تبدیل فوریه کسینوسی } \\mathcal{F}_c',
          '\\text{تبدیل لاپلاس برحسب مکان}',
          '\\text{تبدیل هیلبرت}',
        ],
        correctIndex: 1,
        explanation:
          'در تبدیل فوریه کسینوسی، مشتق دوم به $\\mathcal{F}_c[u_{xx}] = -w^2 U_c - \\sqrt{2/\\pi}\\,u_x(0,t)$ تبدیل می‌شود که مستقیماً شرط شار $u_x(0,t)$ را جذب می‌کند؛ در حالی که تبدیل سینوسی برای شرط دمای $u(0,t)$ به کار می‌رود.',
      },
      {
        id: 'q7_m6',
        question: 'پاسخ ضربه (تابع گرین) معادله گرما در میله نامتناهی یک تابع گاوسی است. انحراف معیار فضایی این بسته حرارتی $\\sigma(t)$ چگونه با زمان رشد می‌کند؟',
        options: [
          '\\sigma(t) \\propto t',
          '\\sigma(t) \\propto \\sqrt{t}',
          '\\sigma(t) \\propto t^2',
          '\\sigma(t) \\text{ با زمان ثابت می‌ماند}',
        ],
        correctIndex: 1,
        explanation:
          'هسته گاوسی $G(x,t) = \\frac{1}{\\sqrt{4\\pi k^2 t}} e^{-\\frac{x^2}{4k^2 t}}$ دارای واریانس $\\sigma^2(t) = 2k^2 t$ است؛ بنابراین انحراف معیار یا پهنای فضایی بسته حرارتی با جذر زمان یعنی $\\sigma(t) = \\sqrt{2k^2 t}$ منبسط می‌شود که ویژگی بنیادین پدیده‌های نفوذی انشتین-براونی است.',
      },
      {
        id: 'q8_m6',
        question: 'طبق اصل ماکزیمم (Maximum Principle) برای معادله گرمای همگن $u_t = k^2 u_{xx}$ روی $[0, L] \\times [0, T]$، کدام عبارت همواره صحیح است؟',
        options: [
          'دمای هر نقطه درونی میله در هر زمان همواره مقید بین حداقل و حداکثر دمای اولیه و مرزها است',
          'ماکزیمم دما همواره در مرکز میله رخ می‌دهد',
          'دمای میله با گذشت زمان دائماً نوسان می‌کند',
          'دمای نهایی حتماً صفر است',
        ],
        correctIndex: 0,
        explanation:
          'طبق اصل ماکزیمم، در غیاب چشمه حرارتی داخلی، بیشترین و کمترین دمای میله تنها می‌توانند در شرایط مرزی ($x=0, x=L$) یا شرایط اولیه ($t=0$) رخ دهند و هیچ نقطه درونی نمی‌تواند بدون حضور منبع از مرزهای خود داغ‌تر یا سردتر شود ($\\min_{\\Gamma} u \\le u(x,t) \\le \\max_{\\Gamma} u$).',
      },
    ],
  },
];

export const CURRICULUM_MODULES: CurriculumModule[] = BASE_CURRICULUM_MODULES.map((mod) => ({
  ...mod,
  subtopics: mod.subtopics.map((sub) => {
    const note = TEXTBOOK_NOTES[sub.id];
    return {
      ...sub,
      detailedExplanation: note?.detailedExplanation ?? sub.detailedExplanation ?? sub.summary,
      commonPitfalls: note?.commonPitfalls ?? sub.commonPitfalls ?? [],
      engineeringApplications: note?.engineeringApplications ?? sub.engineeringApplications ?? [],
    };
  }),
}));

export { TEXTBOOK_NOTES } from './textbook-notes.ts';


/* ═══════════════════════════════════════════════════════════════════════════
 * Course Enrichment: historical figures & curated external resources.
 * Portraits are public-domain images from Wikimedia Commons (local copies in
 * /public/figures). Every external link was verified reachable (Nov 2025).
 * ═══════════════════════════════════════════════════════════════════════════ */

export interface HistoricalFigure {
  nameFa: string;
  nameEn: string;
  years: string;
  portraitSrc: string;
  bioFa: string;
  wikiUrl: string;
}

export interface ExternalResource {
  labelFa: string;
  url: string;
  kind: 'video' | 'demo' | 'wiki' | 'blog';
  noteFa: string;
}

export interface ModuleEnrichment {
  figures: HistoricalFigure[];
  resources: ExternalResource[];
}

const FIG_FOURIER: HistoricalFigure = {
  nameFa: 'ژوزف فوریه',
  nameEn: 'Joseph Fourier',
  years: '۱۷۶۸ – ۱۸۳۰',
  portraitSrc: '/figures/fourier.jpg',
  bioFa: 'ریاضیدان و فیزیکدان فرانسوی؛ در کتاب «نظریه تحلیلی گرما» (۱۸۲۲) نشان داد هر تابعی را می‌توان با مجموعی از سینوس و کسینوس‌ها ساخت — همان ایده‌ای که سری و تبدیل فوریه از آن زاده شد و امروز پایه پردازش سیگنال، تصویربرداری پزشکی و مهندسی مخابرات است.',
  wikiUrl: 'https://fa.wikipedia.org/wiki/ژوزف_فوریه',
};

const FIG_EULER: HistoricalFigure = {
  nameFa: 'لئونارد اویلر',
  nameEn: 'Leonhard Euler',
  years: '۱۷۰۷ – ۱۷۸۳',
  portraitSrc: '/figures/euler.jpg',
  bioFa: 'بزرگ‌ترین ریاضیدان قرن هجدهم؛ فرمول ه‍شگون او e^(iθ) = cos(θ) + i·sin(θ) پل بین جبر مختلط و مثلثات است و کل زبان تبدیل فوریه روی همین فرمول بنا شده است.',
  wikiUrl: 'https://fa.wikipedia.org/wiki/لئونارد_اویلر',
};

const FIG_STURM: HistoricalFigure = {
  nameFa: 'شارل استورم',
  nameEn: 'Charles-François Sturm',
  years: '۱۸۰۳ – ۱۸۵۵',
  portraitSrc: '/figures/sturm.jpg',
  bioFa: 'ریاضیدان سوئیسی؛ همکار لیوویل در پاریس. قضیه شمارش ریشه‌های استورم و مسئله مقدار ویژه‌ای مشترکشان، چارچوب کلی «سیستم‌های متعامد در معادلات دیفرانسیل» را ساخت.',
  wikiUrl: 'https://en.wikipedia.org/wiki/Jacques_Charles_Fran%C3%A7ois_Sturm',
};

const FIG_LIOUVILLE: HistoricalFigure = {
  nameFa: 'ژوزف لیوویل',
  nameEn: 'Joseph Liouville',
  years: '۱۸۰۹ – ۱۸۸۲',
  portraitSrc: '/figures/liouville.jpg',
  bioFa: 'ریاضیدان فرانسوی و بنیان‌گذار مجله ریاضیات خالص و کاربردی (Journal de Mathématiques)؛ کار مشترکش با استورم (۱۸۳۶–۱۸۳۷) نظریه عمومی توابع ویژه و بسط هر تابع برحسب آن‌ها را بنیان گذاشت.',
  wikiUrl: 'https://en.wikipedia.org/wiki/Joseph_Liouville',
};

export const MODULE_ENRICHMENT: Record<ModuleId, ModuleEnrichment> = {
  module_0_prerequisites: {
    figures: [FIG_EULER],
    resources: [
      {
        labelFa: 'دوره فارسی: معادلات دیفرانسیل صفر تا صد (مکتب‌خونه)',
        url: 'https://maktabkhooneh.org/course/%D8%A2%D9%85%D9%88%D8%B2%D8%B4-%D8%B5%D9%81%D8%B1-%D8%AA%D8%A7-%D8%B5%D8%AF-%D9%85%D8%B9%D8%A7%D8%AF%D9%84%D8%A7%D8%AA-%D8%AF%DB%8C%D9%81%D8%B1%D8%A7%D9%86%D8%B3%DB%8C%D9%84-mk1474',
        kind: 'video',
        noteFa: 'پیش‌نیاز چهارم (ODE مرتبه دوم) و هر جایی که جداسازی متغیرها لازم می‌شود، اینجا به فارسی تدریس شده است.',
      },
      {
        labelFa: 'ویدیو: فرمول اویلر به زبان ساده (3Blue1Brown)',
        url: 'https://www.youtube.com/watch?v=mvmuCPvRoLQ',
        kind: 'video',
        noteFa: 'چرخش روی دایره واحد؛ شهود بصری e^{iθ} که در پیش‌نیاز سوم به کار می‌رود.',
      },
      {
        labelFa: 'انیمیشن تعاملی: موج‌ها را با هم جمع کنید (Jez Swanson)',
        url: 'https://www.jezzamon.com/fourier/',
        kind: 'demo',
        noteFa: 'با اسلایدر بازی کنید تا ببینید چگونه سینوس‌ها یک موج مربعی می‌سازند.',
      },
    ],
  },
  module_1_definitions: {
    figures: [],
    resources: [
      {
        labelFa: 'ویدیوی فارسی: آشنایی با مفهوم سری فوریه (آپارات)',
        url: 'https://www.aparat.com/v/vql1fhm',
        kind: 'video',
        noteFa: 'تدریس فارسی و آرام مفهوم بسط متناوب؛ مناسب قبل از ورود به تعامد و نُرم.',
      },
      {
        labelFa: 'مقاله فارسی: سری فوریه به زبان ساده (مجله فرادرس)',
        url: 'https://blog.faradars.org/fourier-series/',
        kind: 'blog',
        noteFa: 'مرور فارسی تعاریف، ضرایب و تقارن‌ها با مثال‌های ساده.',
      },
      {
        labelFa: 'ویکی‌پدیا: دستگاه‌های متعامد توابع',
        url: 'https://fa.wikipedia.org/wiki/سری_فوریه',
        kind: 'wiki',
        noteFa: 'مقدمه فارسی سری فوریه برای مرور سریع تعاریف و تقارن‌ها.',
      },
    ],
  },
  module_2_fourier_series: {
    figures: [FIG_FOURIER],
    resources: [
      {
        labelFa: 'ویدیوی فارسی: جلسه اول سری فوریه — ریاضی مهندسی (آپارات)',
        url: 'https://www.aparat.com/v/n00vi7v',
        kind: 'video',
        noteFa: 'تدریس کلاسی فارسی دقیقاً روی سرفصل همین فصل (ضرایب اویلر-فوریه و بسط).',
      },
      {
        labelFa: 'مقاله فارسی: رابطه پارسوال — از صفر تا صد (مجله فرادرس)',
        url: 'https://blog.faradars.org/%d8%b1%d8%a7%d8%a8%d8%b7%d9%87-%d9%be%d8%a7%d8%b1%d8%b3%d9%88%d8%a7%d9%84-%d8%af%d8%b1-%d8%b3%d8%b1%db%8c-%d9%81%d9%88%d8%b1%db%8c%d9%87/',
        kind: 'blog',
        noteFa: 'توضیح فارسی اتحاد پارسوال و جمع سری‌های عددی — درس‌نامه ۵ همین فصل.',
      },
      {
        labelFa: 'ویدیو: سری فوریه چیست؟ از جریان گرما تا رسم با دایره‌ها (3Blue1Brown)',
        url: 'https://www.youtube.com/watch?v=r6sGWTCMz2k',
        kind: 'video',
        noteFa: 'بهترین شهود بصری برای اپ‌سایکل‌ها و همگرایی سری؛ دقیقاً همزمان با این فصل ببینید.',
      },
      {
        labelFa: 'ابزار تعاملی: رسم هر شکل با فوریه (Jez Swanson)',
        url: 'https://www.jezzamon.com/fourier/',
        kind: 'demo',
        noteFa: 'شکل بکشید و ببینید چند هارمونیک لازم است تا شبیه شود — آزمایشگاه این فصل به زبان دیگر!',
      },
    ],
  },
  module_3_fourier_integral: {
    figures: [FIG_FOURIER],
    resources: [
      {
        labelFa: 'مقاله فارسی: انتگرال فوریه و محاسبه آن (مجله فرادرس)',
        url: 'https://blog.faradars.org/%d8%a7%d9%86%d8%aa%da%af%d8%b1%d8%a7%d9%84-%d9%81%d9%88%d8%b1%db%8c%d9%87/',
        kind: 'blog',
        noteFa: 'گذار از سری به انتگرال و ضرایب طیفی A(α) و B(α) به فارسی، همراه فیلم رایگان.',
      },
      {
        labelFa: 'ویکی‌پدیا: انتگرال و تبدیل فوریه',
        url: 'https://fa.wikipedia.org/wiki/تبدیل_فوریه',
        kind: 'wiki',
        noteFa: 'رابطه حد ℓ→∞ در سری فوریه با طیف پیوسته، به فارسی و خلاصه.',
      },
    ],
  },
  module_4_fourier_transform: {
    figures: [FIG_FOURIER],
    resources: [
      {
        labelFa: 'ویدیوی فارسی: جلسه ۱۹ — تبدیل فوریه (آپارات)',
        url: 'https://www.aparat.com/v/cgb8b42',
        kind: 'video',
        noteFa: 'تدریس فارسی تعریف، وارون و خواص تبدیل — هم‌راستا با جدول جامع این فصل.',
      },
      {
        labelFa: 'مقاله فارسی: تبدیل فوریه و محاسبه آن (مجله فرادرس)',
        url: 'https://blog.faradars.org/fourier-transform/',
        kind: 'blog',
        noteFa: 'مرور فارسی خواص (خطی بودن، شیفت، پارسوال) با مثال‌های گام‌به‌گام.',
      },
      {
        labelFa: 'ویدیو: تبدیل فوریه با شهود بصری (3Blue1Brown)',
        url: 'https://www.youtube.com/watch?v=spUNpyF58BY',
        kind: 'video',
        noteFa: 'مفهوم «هر سیگنال، ترکیبی از فرکانس‌ها» را با مثال‌های واقعی نشان می‌دهد.',
      },
      {
        labelFa: 'ویکی‌پدیا: تبدیل فوریه',
        url: 'https://fa.wikipedia.org/wiki/تبدیل_فوریه',
        kind: 'wiki',
        noteFa: 'مرور ویژگی‌ها (خطی بودن، شیفت زمان/فرکانس، پارسوال) به فارسی.',
      },
    ],
  },
  module_5_sturm_liouville: {
    figures: [FIG_STURM, FIG_LIOUVILLE],
    resources: [
      {
        labelFa: 'ویدیوی فارسی: معادلات اشتورم-لیوویل بر اساس کتاب دکتر طائری (آپارات)',
        url: 'https://www.aparat.com/v/f7483g8',
        kind: 'video',
        noteFa: 'درس‌گفتار دانشگاهی فارسی دقیقاً بر پایه همان کتاب مرجع این آزمایشگاه!',
      },
      {
        labelFa: 'ویدیوی فارسی: حل تمرین مسائل اشتورم-لیوویل (آپارات)',
        url: 'https://www.aparat.com/v/c956c3p',
        kind: 'video',
        noteFa: 'حل تست‌های کنکور ارشد — مکمل «مسائل حل‌شده» همین فصل.',
      },
      {
        labelFa: 'ویکی‌پدیا: نظریه اشتورم–لیوویل (English)',
        url: 'https://en.wikipedia.org/wiki/Sturm%E2%80%93Liouville_theory',
        kind: 'wiki',
        noteFa: 'مقاله انگلیسی کامل‌ترین مرور از فرم استاندارد مسئله و طیف ویژه‌مقادیر است.',
      },
    ],
  },
  module_6_heat_pde: {
    figures: [FIG_FOURIER],
    resources: [
      {
        labelFa: 'مقاله فارسی: معادله گرما به زبان ساده (مجله فرادرس)',
        url: 'https://blog.faradars.org/%d9%85%d8%b9%d8%a7%d8%af%d9%84%d9%87-%da%af%d8%b1%d9%85%d8%a7/',
        kind: 'blog',
        noteFa: 'شهود فیزیکی معادله انتشار و نقش شرایط مرزی و اولیه به فارسی.',
      },
      {
        labelFa: 'مقاله فارسی: معادلات دیفرانسیل با مشتقات جزئی — از صفر تا صد (فرادرس)',
        url: 'https://blog.faradars.org/partial-differential-equations/',
        kind: 'blog',
        noteFa: 'روش جداسازی متغیرها که ستون فقرات درس‌نامه ۲ این فصل است، توضیح فارسی.',
      },
      {
        labelFa: 'ویدیو: حل معادله گرما با فوریه (3Blue1Brown)',
        url: 'https://www.youtube.com/watch?v=ToIXSwZ1pJU',
        kind: 'video',
        noteFa: 'همان داستان تولد سری فوریه: میله داغ، شرایط مرزی و میرایی هارمونیک‌ها — هم‌راستا با آزمایشگاه این فصل.',
      },
      {
        labelFa: 'ویکی‌پدیا: معادله گرما',
        url: 'https://fa.wikipedia.org/wiki/معادله_گرما',
        kind: 'wiki',
        noteFa: 'معادله انتشار، شرط مرزی و کاربردها به فارسی.',
      },
    ],
  },
};
