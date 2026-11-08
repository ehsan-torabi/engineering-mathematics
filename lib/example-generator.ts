/**
 * Parameterized worked-example generator.
 *
 * Fully expanded 5-step derivations for five canonical problem families,
 * rebuilt from interactive parameters (length, diffusivity, mode number,
 * amplitude). Pure function — no React, no side effects — so the UI layer
 * stays a thin renderer.
 */

export type CustomSolverType =
  | 'heat_1d'
  | 'sturm_liouville'
  | 'fourier_half_range'
  | 'fourier_full_cosine'
  | 'fourier_transform_pulse';

export interface GeneratedExample {
  problemHeader: string;
  steps: {
    stepNumber: number;
    title: string;
    explanation: string;
    formula: string;
    whyHint?: string;
  }[];
}

export const CUSTOM_SOLVER_TYPES: {
  id: CustomSolverType;
  label: string;
  hint: string;
}[] = [
  {
    id: 'heat_1d',
    label: 'معادله گرما یک‌بعدی',
    hint: 'جداسازی متغیرها روی میله با شرایط مرزی دیریکله',
  },
  {
    id: 'sturm_liouville',
    label: 'اشتورم-لیوویل (معادله اولر)',
    hint: 'عامل انتگرال‌ساز و استخراج مقادیر و توابع ویژه',
  },
  {
    id: 'fourier_half_range',
    label: 'سری فوریه سینوسی نیم‌دامنه',
    hint: 'بسط فرد تابع خطی روی بازه محدود',
  },
  {
    id: 'fourier_full_cosine',
    label: 'سری فوریه کسینوسی + پارسوال',
    hint: 'بسط زوج تابع قدرمطلق و محاسبه مجموع سری',
  },
  {
    id: 'fourier_transform_pulse',
    label: 'تبدیل فوریه نمایی',
    hint: 'پالس نمایی روی کل محور حقیقی و انتگرال انرژی',
  },
];

export interface SolverParams {
  /** length of the domain L */
  lengthL: number;
  /** diffusivity k (heat) or decay rate (transform) */
  diffusivityK: number;
  /** mode number n */
  modeN: number;
  /** amplitude A */
  amplitudeA: number;
}

export function generateCustomExample(
  solverType: CustomSolverType,
  { lengthL: L, diffusivityK: k, modeN: n, amplitudeA: A }: SolverParams
): GeneratedExample {
  const kSq = k * k;

  if (solverType === 'heat_1d') {
    return {
      problemHeader: `u_t = ${kSq}\\,u_{xx} \\quad (0 < x < ${L},\\; t > 0) \\; , \\; u(0,t)=u(${L},t)=0 \\; , \\; u(x,0) = ${A}\\sin\\left(\\frac{${n}\\pi x}{${L}}\\right)`,
      steps: [
        {
          stepNumber: 1,
          title: 'گام ۱: فرض جداسازی متغیرها $u(x,t) = X(x)T(t)$ و جایگذاری در معادله گرما',
          explanation: `مشتقات جزئی $u_t = X(x)T'(t)$ و $u_{xx} = X''(x)T(t)$ را در معادله $u_t = ${kSq} u_{xx}$ قرار داده و طرفین را بر عبارت غیرصفر $${kSq} X(x)T(t)$ تقسیم می‌کنیم:`,
          formula: `X(x)T'(t) = ${kSq} X''(x)T(t) \\implies \\frac{X''(x)}{X(x)} = \\frac{T'(t)}{${kSq} T(t)} = -\\lambda`,
        },
        {
          stepNumber: 2,
          title: `گام ۲: استخراج دو معادله دیفرانسیل معمولی و شرایط مرزی در بازه $[0, ${L}]$`,
          explanation: `از شرایط مرزی $u(0,t)=X(0)T(t)=0$ و $u(${L},t)=X(${L})T(t)=0$ به شرایط مرزی مکانی $X(0)=0$ و $X(${L})=0$ می‌رسیم:`,
          formula: `\\begin{cases} X''(x) + \\lambda X(x) = 0 \\quad , \\quad X(0) = 0 \\; , \\; X(${L}) = 0 \\\\ T'(t) + ${kSq}\\lambda\\,T(t) = 0 \\end{cases}`,
        },
        {
          stepNumber: 3,
          title: 'گام ۳: حل کامل مسئله اشتورم-لیوویل مکانی برای $\\lambda = \\alpha^2 > 0$',
          explanation: `جواب عمومی معادله مکانی $X(x) = c_1\\cos(\\alpha x) + c_2\\sin(\\alpha x)$ است. با اعمال شرایط مرزی در دو سر میله:`,
          formula: `X(0) = c_1 = 0 \\; , \\; X(${L}) = c_2\\sin(\\alpha \\cdot ${L}) = 0 \\implies \\alpha_m = \\frac{m\\pi}{${L}} \\implies \\lambda_m = \\left(\\frac{m\\pi}{${L}}\\right)^2 \\; , \\; X_m(x) = \\sin\\left(\\frac{m\\pi x}{${L}}\\right)`,
        },
        {
          stepNumber: 4,
          title: 'گام ۴: حل معادله دیفرانسیل زمانی $T\'_m(t)$ و تشکیل سری برهم‌نهی',
          explanation: `با قرار دادن $\\lambda_m = \\left(\\frac{m\\pi}{${L}}\\right)^2$ در معادله زمانی، جواب نمایی پایه و برهم‌نهی کلی تشکیل می‌شود:`,
          formula: `\\frac{dT_m}{T_m} = -${kSq}\\left(\\frac{m\\pi}{${L}}\\right)^2 dt \\implies T_m(t) = b_m \\exp\\left(-\\left(\\frac{${k}m\\pi}{${L}}\\right)^2 t\\right) \\implies u(x,t) = \\sum_{m=1}^{\\infty} b_m \\sin\\left(\\frac{m\\pi x}{${L}}\\right) e^{-\\left(\\frac{${k}m\\pi}{${L}}\\right)^2 t}`,
        },
        {
          stepNumber: 5,
          title: 'گام ۵: اعمال شرط اولیه در $t = 0$ و استخراج جواب دقیق نهایی',
          explanation: `در لحظه $t = 0$ داریم $u(x,0) = \\sum_{m=1}^{\\infty} b_m \\sin\\left(\\frac{m\\pi x}{${L}}\\right) = ${A}\\sin\\left(\\frac{${n}\\pi x}{${L}}\\right)$. در نتیجه تنها ضریب $m = ${n}$ برابر $b_{${n}} = ${A}$ است:`,
          formula: `b_{${n}} = ${A} \\; , \\; b_m = 0 \\; (m \\neq ${n}) \\implies u(x,t) = ${A}\\sin\\left(\\frac{${n}\\pi x}{${L}}\\right) \\exp\\left( -\\frac{${n * n * kSq}\\pi^2}{${L * L}} t \\right)`,
        },
      ],
    };
  }

  if (solverType === 'sturm_liouville') {
    return {
      problemHeader: `x^2 y'' + ${2 * n + 1}x y' + \\lambda y = 0 \\quad (1 < x < e^{${L}}) \\quad , \\quad y(1) = 0 \\; , \\; y(e^{${L}}) = 0`,
      steps: [
        {
          stepNumber: 1,
          title: 'گام ۱: محاسبه عامل انتگرال‌ساز $\\mu(x)$',
          explanation: `ضرایب معادله برابر $P(x) = x^2$ و $Q(x) = ${2 * n + 1}x$ هستند. عامل انتگرال‌ساز را با انتگرال‌گیری صریح محاسبه می‌کنیم:`,
          formula: `\\mu(x) = \\frac{1}{P(x)}\\exp\\left(\\int \\frac{Q(x)}{P(x)}\\,dx\\right) = \\frac{1}{x^2}\\exp\\left(\\int \\frac{${2 * n + 1}}{x}\\,dx\\right) = \\frac{x^{${2 * n + 1}}}{x^2} = x^{${2 * n - 1}}`,
        },
        {
          stepNumber: 2,
          title: 'گام ۲: ضرب معادله در $\\mu(x)$ و تبدیل به فرم خودالحاقی اشتورم-لیوویل',
          explanation: `با ضرب طرفین معادله در $\\mu(x) = x^{${2 * n - 1}}$، فرم خودالحاقی استاندارد و تابع وزن تعامد $p(x)$ به دست می‌آیند:`,
          formula: `\\frac{d}{dx}\\Big[ x^{${2 * n + 1}}\\,y'(x) \\Big] + \\lambda\\,x^{${2 * n - 1}}\\,y(x) = 0 \\implies r(x) = x^{${2 * n + 1}} \\; , \\; p(x) = x^{${2 * n - 1}}`,
        },
        {
          stepNumber: 3,
          title: 'گام ۳: تشکیل معادله مشخصه اولر با فرض $y = x^r$',
          explanation: `با قرار دادن $y = x^r$ در معادله دیفرانسیل اولر، معادله درجه دوم برحسب $r$ حاصل می‌شود:`,
          formula: `r(r-1) + ${2 * n + 1}r + \\lambda = 0 \\implies r^2 + ${2 * n}r + \\lambda = 0 \\implies r = -${n} \\pm \\sqrt{${n * n} - \\lambda}`,
        },
        {
          stepNumber: 4,
          title: 'گام ۴: بررسی حالت ریشه‌های مزدوج مختلط $\\lambda = ${n * n} + \\alpha^2 > ${n * n}$',
          explanation: `برای صدق کردن در شرایط مرزی دو سر صفر، قرار می‌دهیم ${n * n} - \\lambda = -\\alpha^2 < 0$ ($\\alpha > 0$) و جواب عمومی را می‌نویسیم:`,
          formula: `y(x) = x^{-${n}} \\Big[ c_1 \\cos(\\alpha \\ln x) + c_2 \\sin(\\alpha \\ln x) \\Big]`,
        },
        {
          stepNumber: 5,
          title: 'گام ۵: اعمال شرایط مرزی در $x = 1$ و $x = e^{' + L + '}$ و استخراج جواب نهایی',
          explanation: `از $y(1) = 0$ نتیجه می‌شود $c_1 = 0$. سپس از شرط دوم $y(e^{${L}}) = 0$ مقادیر ویژه و توابع ویژه استخراج می‌شوند:`,
          formula: `\\sin(\\alpha \\cdot ${L}) = 0 \\implies \\alpha_m = \\frac{m\\pi}{${L}} \\implies \\lambda_m = ${n * n} + \\left(\\frac{m\\pi}{${L}}\\right)^2 \\; , \\; y_m(x) = x^{-${n}}\\sin\\left(\\frac{m\\pi \\ln x}{${L}}\\right)`,
        },
      ],
    };
  }

  if (solverType === 'fourier_full_cosine') {
    return {
      problemHeader: `f(x) = ${A}|x| \\quad \\text{on } [-${L}, ${L}] \\quad (\\text{بسط سری فوریه کسینوسی زوج و اتحاد پارسوال})`,
      steps: [
        {
          stepNumber: 1,
          title: 'گام ۱: بررسی تقارن زوج تابع و حذف ضرایب سینوسی $b_m$',
          explanation: `چون $f(-x) = ${A}|-x| = ${A}|x| = f(x)$ تابع زوج است، تمامی ضرایب سینوسی $b_m = 0$ بوده و ضرایب کسینوسی از دو برابر انتگرال روی بازه $[0, ${L}]$ به دست می‌آیند:`,
          formula: `b_m = 0 \\quad , \\quad a_0 = \\frac{2}{${L}}\\int_{0}^{${L}} ${A}x\\,dx = \\frac{2(${A})}{${L}}\\left[\\frac{x^2}{2}\\right]_{0}^{${L}} = ${A * L}`,
        },
        {
          stepNumber: 2,
          title: 'گام ۲: تشکیل انتگرال ضریب $a_m$ و انتگرال‌گیری جزء‌به‌جزء',
          explanation: `قرار می‌دهیم $u = x \\implies du = dx$ و $dv = \\cos\\left(\\frac{m\\pi x}{${L}}\\right)dx \\implies v = \\frac{${L}}{m\\pi}\\sin\\left(\\frac{m\\pi x}{${L}}\\right)$:`,
          formula: `a_m = \\frac{${2 * A}}{${L}} \\left( \\left[ \\frac{${L}x}{m\\pi}\\sin\\left(\\frac{m\\pi x}{${L}}\\right) \\right]_{0}^{${L}} - \\int_{0}^{${L}} \\frac{${L}}{m\\pi}\\sin\\left(\\frac{m\\pi x}{${L}}\\right)dx \\right)`,
        },
        {
          stepNumber: 3,
          title: 'گام ۳: محاسبه انتگرال سینوس و جایگذاری حدود بالا و پایین',
          explanation: `چون $\\sin(m\\pi) = 0$ و $\\sin(0) = 0$ است، جمله مرزی اول صفر شده و از انتگرال سینوس، کسینوس حاصل می‌شود:`,
          formula: `a_m = \\frac{${2 * A}}{${L}} \\left[ \\left(\\frac{${L}}{m\\pi}\\right)^2 \\cos\\left(\\frac{m\\pi x}{${L}}\\right) \\right]_{0}^{${L}} = \\frac{${2 * A * L}}{m^2\\pi^2}\\big( \\cos(m\\pi) - \\cos(0) \\big) = \\frac{${2 * A * L}}{m^2\\pi^2}\\big( (-1)^m - 1 \\big)`,
        },
        {
          stepNumber: 4,
          title: 'گام ۴: تفکیک اندیس‌های زوج ($m=2k$) و فرد ($m=2k-1$)',
          explanation: `به ازای $m$ زوج داریم $(-1)^m - 1 = 0$ و به ازای $m = 2k-1$ فرد داریم $(-1)^{2k-1} - 1 = -2$:`,
          formula: `a_{2k} = 0 \\quad , \\quad a_{2k-1} = \\frac{-${4 * A * L}}{(2k-1)^2\\pi^2} \\implies f(x) = \\frac{${A * L}}{2} - \\frac{${4 * A * L}}{\\pi^2}\\sum_{k=1}^{\\infty} \\frac{1}{(2k-1)^2}\\cos\\left(\\frac{(2k-1)\\pi x}{${L}}\\right)`,
        },
        {
          stepNumber: 5,
          title: 'گام ۵: اعمال اتحاد پارسوال و استخراج مجموع سری عددی',
          explanation: `طبق اتحاد پارسوال $\\frac{1}{${L}}\\int_{-${L}}^{${L}} f^2(x)\\,dx = \\frac{a_0^2}{2} + \\sum_{m=1}^{\\infty} a_m^2$ داریم:`,
          formula: `\\frac{2}{${L}}\\int_{0}^{${L}} ${A * A}x^2\\,dx = \\frac{${2 * A * A * L * L}}{3} = \\frac{(${A * L})^2}{2} + \\sum_{k=1}^{\\infty} \\frac{${16 * A * A * L * L}}{(2k-1)^4\\pi^4} \\implies \\sum_{k=1}^{\\infty} \\frac{1}{(2k-1)^4} = \\frac{\\pi^4}{96}`,
        },
      ],
    };
  }

  if (solverType === 'fourier_transform_pulse') {
    return {
      problemHeader: `f(x) = ${A} e^{-${k}|x|} \\quad (-\\infty < x < \\infty) \\quad (\\text{تبدیل فوریه و انتگرال پارسوال})`,
      steps: [
        {
          stepNumber: 1,
          title: 'گام ۱: نوشتن تعریف تبدیل فوریه و استفاده از تقارن زوج تابع',
          explanation: `چون $f(x) = ${A}e^{-${k}|x|}$ یک تابع زوج در کل محور حقیقی است، بخش موهومی با $\\sin(\\alpha x)$ فرد بوده و صفر می‌شود:`,
          formula: `\\mathcal{F}\\{f(x)\\} = F(\\alpha) = \\int_{-\\infty}^{\\infty} ${A}e^{-${k}|x|}e^{-i\\alpha x}\\,dx = 2\\int_{0}^{\\infty} ${A}e^{-${k}x}\\cos(\\alpha x)\\,dx`,
        },
        {
          stepNumber: 2,
          title: 'گام ۲: به کارگیری فرمول انتگرال بازگشتی نمایی-کسینوسی در بازه $[0, \\infty)$',
          explanation: `با دو بار انتگرال‌گیری جزء‌به‌جزء متوالی از $I = \\int e^{-${k}x}\\cos(\\alpha x)\\,dx$ داریم:`,
          formula: `\\int e^{-${k}x}\\cos(\\alpha x)\\,dx = \\frac{e^{-${k}x}}{${kSq} + \\alpha^2}\\big( -${k}\\cos(\\alpha x) + \\alpha\\sin(\\alpha x) \\big)`,
        },
        {
          stepNumber: 3,
          title: 'گام ۳: جایگذاری حدود $x \\to \\infty$ و $x = 0$',
          explanation: `چون ${k} > 0$ است، در حد بالا $\\lim_{x\\to\\infty} e^{-${k}x} = 0$ بوده و در حد پایین $x=0$ داریم $e^0(-${k}\\cos 0 + 0) = -${k}$:`,
          formula: `F(\\alpha) = ${2 * A} \\left[ 0 - \\frac{-${k}}{${kSq} + \\alpha^2} \\right] = \\frac{${2 * A * k}}{${kSq} + \\alpha^2}`,
        },
        {
          stepNumber: 4,
          title: 'گام ۴: نوشتن فرمول تبدیل فوریه معکوس و تقارن دوگان',
          explanation: `از فرمول تبدیل فوریه معکوس $f(x) = \\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty} F(\\alpha)e^{i\\alpha x}\\,d\\alpha$ نتیجه می‌شود:`,
          formula: `\\int_{0}^{\\infty} \\frac{\\cos(\\alpha x)}{${kSq} + \\alpha^2}\\,d\\alpha = \\frac{\\pi}{${2 * k}} e^{-${k}|x|}`,
        },
        {
          stepNumber: 5,
          title: 'گام ۵: محاسبه انتگرال انرژی از طریق قضیه پارسوال تبدیل فوریه',
          explanation: `طبق اتحاد پارسوال $\\int_{-\\infty}^{\\infty} |f(x)|^2\\,dx = \\frac{1}{2\\pi}\\int_{-\\infty}^{\\infty} |F(\\alpha)|^2\\,d\\alpha$:`,
          formula: `\\int_{-\\infty}^{\\infty} \\frac{d\\alpha}{(${kSq} + \\alpha^2)^2} = \\frac{2\\pi}{(${2 * A * k})^2} \\int_{-\\infty}^{\\infty} ${A * A}e^{-${2 * k}|x|}\\,dx = \\frac{2\\pi}{${4 * kSq}} \\left(\\frac{1}{${k}}\\right) = \\frac{\\pi}{${2 * k * kSq}}`,
        },
      ],
    };
  }

  // fourier_half_range
  return {
    problemHeader: `f(x) = ${A}x \\quad \\text{on } [0, ${L}] \\quad (\\text{بسط کامل سری فوریه سینوسی نیم‌دامنه})`,
    steps: [
      {
        stepNumber: 1,
        title: 'گام ۱: نوشتن فرمول سری فوریه سینوسی (توسیع فرد) روی بازه $[0, L]$',
        explanation: `در بسط سینوسی نیم‌دامنه، ضرایب کسینوسی صفر هستند ($a_0 = 0, a_m = 0$) و ضرایب سینوسی $b_m$ از رابطه زیر محاسبه می‌شوند:`,
        formula: `f(x) \\simeq \\sum_{m=1}^{\\infty} b_m \\sin\\left(\\frac{m\\pi x}{${L}}\\right) \\quad , \\quad b_m = \\frac{2}{${L}} \\int_{0}^{${L}} ${A}x \\sin\\left(\\frac{m\\pi x}{${L}}\\right)dx`,
      },
      {
        stepNumber: 2,
        title: 'گام ۲: تشکیل اجزای انتگرال‌گیری جزء به جزء ($\\int u\\,dv = uv - \\int v\\,du$)',
        explanation: `انتخاب می‌کنیم $u = x \\implies du = dx$ و $dv = \\sin\\left(\\frac{m\\pi x}{${L}}\\right)dx \\implies v = -\\frac{${L}}{m\\pi}\\cos\\left(\\frac{m\\pi x}{${L}}\\right)$:`,
        formula: `b_m = \\frac{${2 * A}}{${L}} \\left( \\left[ -\\frac{${L}x}{m\\pi}\\cos\\left(\\frac{m\\pi x}{${L}}\\right) \\right]_{0}^{${L}} + \\int_{0}^{${L}} \\frac{${L}}{m\\pi}\\cos\\left(\\frac{m\\pi x}{${L}}\\right)dx \\right)`,
      },
      {
        stepNumber: 3,
        title: 'گام ۳: محاسبه انتگرال کسینوس و جایگذاری حدود بالا و پایین $x = ' + L + '$ و $x = 0$',
        explanation: `پادمشتق جمله دوم را نوشته و حدود $0$ تا $${L}$ را در هر دو عبارت جایگذاری می‌کنیم:`,
        formula: `b_m = \\frac{${2 * A}}{${L}} \\left[ -\\frac{${L}x}{m\\pi}\\cos\\left(\\frac{m\\pi x}{${L}}\\right) + \\left(\\frac{${L}}{m\\pi}\\right)^2 \\sin\\left(\\frac{m\\pi x}{${L}}\\right) \\right]_{0}^{${L}} = \\frac{${2 * A}}{${L}} \\left( -\\frac{${L * L}}{m\\pi}\\cos(m\\pi) + 0 - 0 \\right)`,
      },
      {
        stepNumber: 4,
        title: 'گام ۴: جایگذاری اتحاد $\\cos(m\\pi) = (-1)^m$ و ساده‌سازی جبری $b_m$',
        explanation: `چون $-\\cos(m\\pi) = -(-1)^m = (-1)^{m+1}$ است، ضریب $b_m$ به فرم بسته زیر در می‌آید:`,
        formula: `b_m = \\frac{${2 * A * L}}{m\\pi} (-1)^{m+1} \\quad (m = 1, 2, 3, \\dots)`,
      },
      {
        stepNumber: 5,
        title: 'گام ۵: نوشتن بسط کامل سری فوریه سینوسی و باز کردن سه جمله اول',
        explanation: `با قرار دادن $b_m$ در سری، نمایش کامل سری فوریه سینوسی تابع $f(x) = ${A}x$ در بازه $(0, ${L})$ به دست می‌آید:`,
        formula: `${A}x \\simeq \\frac{${2 * A * L}}{\\pi} \\sum_{m=1}^{\\infty} \\frac{(-1)^{m+1}}{m} \\sin\\left(\\frac{m\\pi x}{${L}}\\right) = \\frac{${2 * A * L}}{\\pi} \\left[ \\sin\\left(\\frac{\\pi x}{${L}}\\right) - \\frac{1}{2}\\sin\\left(\\frac{2\\pi x}{${L}}\\right) + \\frac{1}{3}\\sin\\left(\\frac{3\\pi x}{${L}}\\right) - \\dots \\right]`,
      },
    ],
  };
}
