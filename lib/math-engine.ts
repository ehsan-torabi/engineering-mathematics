/**
 * Pure Mathematical Engine for Engineering Mathematics Interactive Lab
 * Covers:
 * 1. Function Symmetry (Even, Odd, Periodic), Inner Product <f,g>, Norm ||f||, Orthogonality
 * 2. Trigonometric Fourier Series (Full, Cosine/Even, Sine/Odd, Shifted Interval [a,b], Parseval's Identity)
 * 3. Fourier Integral & Convergence (A(alpha), B(alpha), Partial Integral I_Omega(x))
 * 4. Fourier Transform & Properties (Symmetry, Shifts, Derivatives, Convolution, Parseval)
 * 5. Sturm-Liouville Boundary Value Problems (Self-adjoint form, Eigenvalues lambda_n, Eigenfunctions y_n)
 * 6. Partial Differential Equations & Heat Equation (Discriminant classification, 1D/2D Heat u(x,t), Steady-State shift)
 */

export type PresetFunctionId =
  | 'square'
  | 'sawtooth'
  | 'abs_x'
  | 'x_plus_sin'
  | 'parabola'
  | 'half_rectified'
  | 'piecewise_pdf_ex6'
  | 'triangle';

export interface FourierSeriesConfig {
  presetId: PresetFunctionId;
  halfPeriodL: number;
  numHarmonicsN: number;
  mode: 'full' | 'cosine_even' | 'sine_odd';
}

export interface FourierCoefficients {
  a0: number;
  an: number[]; // 1-indexed via array[0] = a_1, ..., array[N-1] = a_N
  bn: number[]; // array[0] = b_1, ..., array[N-1] = b_N
  parsevalLHS: number; // (1/L) * integral_{-L}^{L} f(x)^2 dx
  parsevalRHS: number; // (a0^2)/2 + sum_{n=1}^N (an^2 + bn^2)
}

/**
 * Composite Simpson's 1/3 Rule for numerical integration over [a, b]
 */
export function integrateSimpson(
  fn: (x: number) => number,
  a: number,
  b: number,
  steps = 400
): number {
  if (Math.abs(b - a) < 1e-12) return 0;
  const n = steps % 2 === 0 ? steps : steps + 1;
  const h = (b - a) / n;
  let sum = fn(a) + fn(b);

  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    const val = fn(x);
    if (Number.isFinite(val)) {
      sum += (i % 2 === 0 ? 2 : 4) * val;
    }
  }
  return (h / 3) * sum;
}

/**
 * Inner product <f, g> = integral_a^b p(x) f(x) g(x) dx
 */
export function computeInnerProduct(
  f: (x: number) => number,
  g: (x: number) => number,
  a: number,
  b: number,
  weightFn: (x: number) => number = () => 1
): number {
  return integrateSimpson((x) => weightFn(x) * f(x) * g(x), a, b, 400);
}

/**
 * Function Norm ||f|| = sqrt(<f, f>)
 */
export function computeFunctionNorm(
  f: (x: number) => number,
  a: number,
  b: number,
  weightFn: (x: number) => number = () => 1
): number {
  const ip = computeInnerProduct(f, f, a, b, weightFn);
  return Math.sqrt(Math.max(0, ip));
}

/**
 * Check if two functions are orthogonal on [a, b] within tolerance
 */
export function areOrthogonal(
  f: (x: number) => number,
  g: (x: number) => number,
  a: number,
  b: number,
  weightFn: (x: number) => number = () => 1,
  tolerance = 1e-5
): { orthogonal: boolean; innerProduct: number; normF: number; normG: number } {
  const innerProduct = computeInnerProduct(f, g, a, b, weightFn);
  const normF = computeFunctionNorm(f, a, b, weightFn);
  const normG = computeFunctionNorm(g, a, b, weightFn);
  return {
    orthogonal: Math.abs(innerProduct) <= tolerance,
    innerProduct,
    normF,
    normG,
  };
}

/**
 * Analyze function symmetry (Even, Odd, or Neither) on [-L, L]
 */
export function analyzeSymmetry(
  f: (x: number) => number,
  L = Math.PI,
  sampleCount = 50,
  tolerance = 1e-5
): {
  isEven: boolean;
  isOdd: boolean;
  labelFa: 'زوج (Even)' | 'فرد (Odd)' | 'نه زوج و نه فرد (General)';
  evenComponent: (x: number) => number;
  oddComponent: (x: number) => number;
} {
  let maxEvenDiff = 0;
  let maxOddDiff = 0;

  for (let i = 1; i <= sampleCount; i++) {
    const x = (i / (sampleCount + 1)) * L;
    const fx = f(x);
    const fNegX = f(-x);
    maxEvenDiff = Math.max(maxEvenDiff, Math.abs(fx - fNegX));
    maxOddDiff = Math.max(maxOddDiff, Math.abs(fx + fNegX));
  }

  const isEven = maxEvenDiff < tolerance;
  const isOdd = maxOddDiff < tolerance;

  let labelFa: 'زوج (Even)' | 'فرد (Odd)' | 'نه زوج و نه فرد (General)' =
    'نه زوج و نه فرد (General)';
  if (isEven) labelFa = 'زوج (Even)';
  else if (isOdd) labelFa = 'فرد (Odd)';

  return {
    isEven,
    isOdd,
    labelFa,
    evenComponent: (x: number) => 0.5 * (f(x) + f(-x)),
    oddComponent: (x: number) => 0.5 * (f(x) - f(-x)),
  };
}

/**
 * Evaluate preset functions from the Engineering Mathematics curriculum (Dr. Taeri / Ahmadi Darani)
 * Periodically wrapped to [-L, L]
 */
export function evaluatePresetFunction(
  presetId: PresetFunctionId,
  rawX: number,
  L: number,
  mode: 'full' | 'cosine_even' | 'sine_odd' = 'full'
): number {
  const period = 2 * L;
  // Preserve exact right endpoint +L before periodic wrapping
  let x: number;
  if (Math.abs(rawX - L) < 1e-11) {
    x = L;
  } else if (Math.abs(rawX + L) < 1e-11) {
    x = -L;
  } else {
    x = ((((rawX + L) % period) + period) % period) - L;
  }

  // If half-range extension is active, define on [0, L] and extend by symmetry
  if (mode === 'cosine_even') {
    x = Math.abs(x);
  } else if (mode === 'sine_odd') {
    if (Math.abs(x) < 1e-9) return 0;
    const sign = x >= 0 ? 1 : -1;
    const absVal = evaluateBasePresetOnDomain(presetId, Math.abs(x), L);
    return sign * absVal;
  }

  return evaluateBasePresetOnDomain(presetId, x, L);
}

function evaluateBasePresetOnDomain(
  presetId: PresetFunctionId,
  x: number,
  L: number
): number {
  switch (presetId) {
    case 'square':
      // f(x) = -1 for -L < x < 0, +1 for 0 < x < L (Example 12 pattern)
      if (Math.abs(x) < 1e-9) return 0;
      return x > 0 ? 1 : -1;
    case 'sawtooth':
      // f(x) = x / L on [-L, L] (Example 7 pattern)
      return x / L;
    case 'abs_x':
      // f(x) = |x| on [-L, L] (Example 9 pattern: leads to sum 1/(2n-1)^2 = pi^2/8)
      return Math.abs(x);
    case 'x_plus_sin':
      // f(x) = x + sin(x) on [-pi, pi] (Example 8 pattern)
      return (x * Math.PI) / L + Math.sin((Math.PI * x) / L);
    case 'parabola':
      // f(x) = x^2 on [-L, L] (leads to sum 1/n^2 = pi^2/6)
      return (x / L) * (x / L) * Math.PI * Math.PI;
    case 'half_rectified':
      // f(x) = 0 for -L < x < 0, sin(pi x / L) for 0 <= x < L
      return x < 0 ? 0 : Math.sin((Math.PI * x) / L);
    case 'piecewise_pdf_ex6':
      // PDF Example 6: f(x) = 0 for -L <= x < 0, f(x) = L - x for 0 <= x < L
      return x < 0 ? 0 : (L - x) / L;
    case 'triangle':
      // f(x) = 1 - |x|/L on [-L, L]
      return 1 - Math.abs(x) / L;
    default:
      return 0;
  }
}

/**
 * Compute Fourier Series coefficients a_0, a_n, b_n and Parseval's identity values
 * Standard Dr. Taeri convention (Page 22 of PDF):
 * f(x) ~ a_0 / 2 + sum_{n=1}^{infty} (a_n cos(n pi x / L) + b_n sin(n pi x / L))
 * where a_0 = (1/L) int_{-L}^{L} f(x) dx
 *       a_n = (1/L) int_{-L}^{L} f(x) cos(n pi x / L) dx
 *       b_n = (1/L) int_{-L}^{L} f(x) sin(n pi x / L) dx
 */
export function computeFourierSeries(config: FourierSeriesConfig): FourierCoefficients {
  const { presetId, halfPeriodL: L, numHarmonicsN: N, mode } = config;
  const fn = (x: number) => evaluatePresetFunction(presetId, x, L, mode);
  const eps = 1e-8;

  const a0 =
    mode === 'sine_odd'
      ? 0
      : (1 / L) *
        (integrateSimpson(fn, -L + eps, -eps, 200) +
          integrateSimpson(fn, eps, L - eps, 200));

  const an: number[] = [];
  const bn: number[] = [];

  for (let n = 1; n <= N; n++) {
    const omegaN = (n * Math.PI) / L;
    const steps = Math.max(200, Math.min(800, n * 24));

    if (mode === 'sine_odd') {
      an.push(0);
    } else {
      const valA =
        (1 / L) *
        (integrateSimpson((x) => fn(x) * Math.cos(omegaN * x), -L + eps, -eps, steps / 2) +
          integrateSimpson((x) => fn(x) * Math.cos(omegaN * x), eps, L - eps, steps / 2));
      an.push(Math.abs(valA) < 1e-9 ? 0 : valA);
    }

    if (mode === 'cosine_even') {
      bn.push(0);
    } else {
      const valB =
        (1 / L) *
        (integrateSimpson((x) => fn(x) * Math.sin(omegaN * x), -L + eps, -eps, steps / 2) +
          integrateSimpson((x) => fn(x) * Math.sin(omegaN * x), eps, L - eps, steps / 2));
      bn.push(Math.abs(valB) < 1e-9 ? 0 : valB);
    }
  }

  // Parseval's Identity (PDF Page 39):
  // (1/L) int_{-L}^{L} (f(x))^2 dx = (a_0^2)/2 + sum_{n=1}^{infty} (a_n^2 + b_n^2)
  const parsevalLHS =
    (1 / L) *
    (integrateSimpson((x) => fn(x) * fn(x), -L + eps, -eps, 200) +
      integrateSimpson((x) => fn(x) * fn(x), eps, L - eps, 200));

  let parsevalRHS = (a0 * a0) / 2;
  for (let i = 0; i < N; i++) {
    parsevalRHS += an[i] * an[i] + bn[i] * bn[i];
  }

  return { a0, an, bn, parsevalLHS, parsevalRHS };
}

/**
 * Evaluate Partial Sum S_N(x) of Fourier Series at point x
 */
export function evaluateFourierPartialSum(
  coeffs: FourierCoefficients,
  x: number,
  L: number,
  maxHarmonics?: number
): number {
  const limit = maxHarmonics !== undefined ? Math.min(maxHarmonics, coeffs.an.length) : coeffs.an.length;
  let sum = coeffs.a0 / 2;
  for (let n = 1; n <= limit; n++) {
    const omegaN = (n * Math.PI) / L;
    sum += coeffs.an[n - 1] * Math.cos(omegaN * x) + coeffs.bn[n - 1] * Math.sin(omegaN * x);
  }
  return sum;
}

/**
 * Fourier Integral & Transform Presets (Lessons 3 & 4)
 */
export type TransformPresetId =
  | 'rect_pulse' // f(x) = 1 for |x| < a, 0 otherwise -> F(alpha) = 2 sin(a alpha) / alpha
  | 'two_sided_exp' // f(x) = e^{-a |x|} -> F(alpha) = 2a / (a^2 + alpha^2)
  | 'gaussian' // f(x) = e^{-a x^2} -> F(alpha) = sqrt(pi/a) e^{-alpha^2 / (4a)}
  | 'one_sided_exp' // f(x) = e^{-a x} H(x) -> |F(alpha)| = 1 / sqrt(a^2 + alpha^2)
  | 'triangle_pulse'; // f(x) = (1 - |x|/a) for |x| < a -> F(alpha) = a * sinc^2(a alpha / 2)

export function evaluateTransformPair(
  presetId: TransformPresetId,
  xOrAlpha: number,
  paramA: number,
  timeShift = 0,
  freqShift = 0
): {
  fx: number;
  absFAlpha: number;
  realFAlpha: number;
  imagFAlpha: number;
  A_alpha: number; // Fourier integral cosine density A(alpha) = (1/pi) Re F(alpha)
  B_alpha: number; // Fourier integral sine density B(alpha) = -(1/pi) Im F(alpha)
} {
  const a = Math.max(0.2, paramA);
  const shiftedX = xOrAlpha - timeShift;
  const shiftedAlpha = xOrAlpha - freqShift;

  let baseFx = 0;
  let baseMag = 0;
  let basePhase = -shiftedAlpha * timeShift;

  switch (presetId) {
    case 'rect_pulse': {
      baseFx = Math.abs(shiftedX) <= a ? 1 : 0;
      const val =
        Math.abs(shiftedAlpha) < 1e-8
          ? 2 * a
          : (2 * Math.sin(a * shiftedAlpha)) / shiftedAlpha;
      baseMag = Math.abs(val);
      if (val < 0) basePhase += Math.PI;
      break;
    }
    case 'two_sided_exp': {
      baseFx = Math.exp(-a * Math.abs(shiftedX));
      baseMag = (2 * a) / (a * a + shiftedAlpha * shiftedAlpha);
      break;
    }
    case 'gaussian': {
      baseFx = Math.exp(-a * shiftedX * shiftedX);
      baseMag = Math.sqrt(Math.PI / a) * Math.exp(-(shiftedAlpha * shiftedAlpha) / (4 * a));
      break;
    }
    case 'one_sided_exp': {
      baseFx = shiftedX >= 0 ? Math.exp(-a * shiftedX) : 0;
      baseMag = 1 / Math.sqrt(a * a + shiftedAlpha * shiftedAlpha);
      basePhase += -Math.atan2(shiftedAlpha, a);
      break;
    }
    case 'triangle_pulse': {
      baseFx = Math.abs(shiftedX) <= a ? 1 - Math.abs(shiftedX) / a : 0;
      const half = (a * shiftedAlpha) / 2;
      const sinc = Math.abs(half) < 1e-8 ? 1 : Math.sin(half) / half;
      baseMag = a * sinc * sinc;
      break;
    }
  }

  const realFAlpha = baseMag * Math.cos(basePhase);
  const imagFAlpha = baseMag * Math.sin(basePhase);

  return {
    fx: baseFx * Math.cos(freqShift * xOrAlpha),
    absFAlpha: baseMag,
    realFAlpha,
    imagFAlpha,
    A_alpha: realFAlpha / Math.PI,
    B_alpha: -imagFAlpha / Math.PI,
  };
}

/**
 * Comprehensive Fourier Transform Master Table Entry
 * Matches curriculum pages 72-105 (Dr. Taeri, Table 1).
 */
export interface FourierTransformTableEntry {
  id: string;
  nameFa: string;
  category: 'basic' | 'symmetry' | 'frequency_derivative' | 'modulation' | 'sine_cosine';
  categoryFa: string;
  timeFormulaLatex: string;
  timeConditionLatex?: string;
  freqFormulaLatex: string;
  freqConditionLatex?: string;
  fZeroLatex: string;
  parsevalEnergyLatex: string;
  derivationMethodFa: string;
  engineeringApplicationFa: string;
  associatedPresetId?: TransformPresetId;
}

export const MASTER_FOURIER_TRANSFORM_TABLE: FourierTransformTableEntry[] = [
  {
    id: 'rect_pulse',
    nameFa: 'پالس مستطیلی متقارن (Gate / Rect Function)',
    category: 'basic',
    categoryFa: 'پایه‌ای و ناپیوسته',
    timeFormulaLatex: 'p_a(x) = \\begin{cases} 1 & |x| < a \\\\ 0 & |x| > a \\end{cases}',
    timeConditionLatex: 'a > 0',
    freqFormulaLatex: 'F(\\alpha) = \\frac{2\\sin(a\\alpha)}{\\alpha} = 2a\\,\\operatorname{sinc}\\left(\\frac{a\\alpha}{\\pi}\\right)',
    fZeroLatex: 'F(0) = 2a',
    parsevalEnergyLatex: '\\int_{-\\infty}^{\\infty} |f(x)|^2 dx = 2a',
    derivationMethodFa: 'انتگرال مستقیم تعریف روی بازه $[-a, a]$ و ساده‌سازی به کمک فرمول اویلر',
    engineeringApplicationFa: 'پالس کلیدزنی در مدارهای دیجیتال، پنجره‌بندی زمانی و ایجاد پدیده گیبس در فیلترهای ایده‌آل',
    associatedPresetId: 'rect_pulse',
  },
  {
    id: 'sinc_pulse',
    nameFa: 'تابع برش فرکانسی سینک (Sinc Function)',
    category: 'symmetry',
    categoryFa: 'قضیه تقارن و دوگانی',
    timeFormulaLatex: 'f(x) = \\frac{\\sin(ax)}{x}',
    timeConditionLatex: 'a > 0',
    freqFormulaLatex: 'F(\\alpha) = \\begin{cases} \\pi & |\\alpha| < a \\\\ 0 & |\\alpha| > a \\end{cases}',
    fZeroLatex: 'F(0) = \\pi',
    parsevalEnergyLatex: '\\int_{-\\infty}^{\\infty} \\frac{\\sin^2(ax)}{x^2} dx = \\pi a',
    derivationMethodFa: 'اعمال مستقیم قضیه تقارن (Duality) روی تبدیل فوریه پالس مستطیلی',
    engineeringApplicationFa: 'طراحی فیلتر پایین‌گذر ایده‌آل (Brick-wall Filter) و درون‌یابی شانون-نایکوئیست در مخابرات',
  },
  {
    id: 'two_sided_exp',
    nameFa: 'نمایی دوطرفه متقارن (Laplace Distribution)',
    category: 'basic',
    categoryFa: 'پایه‌ای و پیوسته',
    timeFormulaLatex: 'f(x) = e^{-a|x|}',
    timeConditionLatex: 'a > 0',
    freqFormulaLatex: 'F(\\alpha) = \\frac{2a}{a^2 + \\alpha^2}',
    fZeroLatex: 'F(0) = \\frac{2}{a}',
    parsevalEnergyLatex: '\\int_{-\\infty}^{\\infty} e^{-2a|x|} dx = \\frac{1}{a}',
    derivationMethodFa: 'تجزیه به دو انتگرال روی $(-\\infty, 0]$ و $[0, \\infty)$ با خاصیت زوج بودن',
    engineeringApplicationFa: 'مدل‌سازی پاسخ ضربه فیلترهای مرتبه اول دوجانبه و خطوط انتقال مخابراتی',
    associatedPresetId: 'two_sided_exp',
  },
  {
    id: 'cauchy_lorentz',
    nameFa: 'تابع لورنتس / کوشی (Lorentzian Profile)',
    category: 'symmetry',
    categoryFa: 'قضیه تقارن و دوگانی',
    timeFormulaLatex: 'f(x) = \\frac{1}{x^2 + a^2}',
    timeConditionLatex: 'a > 0',
    freqFormulaLatex: 'F(\\alpha) = \\frac{\\pi}{a} e^{-a|\\alpha|}',
    fZeroLatex: 'F(0) = \\frac{\\pi}{a}',
    parsevalEnergyLatex: '\\int_{-\\infty}^{\\infty} \\frac{dx}{(x^2+a^2)^2} = \\frac{\\pi}{2a^3}',
    derivationMethodFa: 'اعمال قضیه تقارن $\\mathcal{F}[F(x)] = 2\\pi f(-\\alpha)$ روی نمایی دوطرفه',
    engineeringApplicationFa: 'طیف‌سنجی فیزیک لیزر، پراکندگی فوتون و پاسخ سیستم‌های نوسانی با اتلاف انرژی',
  },
  {
    id: 'one_sided_exp',
    nameFa: 'نمایی یک‌طرفه علّی (Causal Exponential)',
    category: 'basic',
    categoryFa: 'توابع علّی و مختلط',
    timeFormulaLatex: 'f(x) = e^{-ax} u(x) = \\begin{cases} e^{-ax} & x \\ge 0 \\\\ 0 & x < 0 \\end{cases}',
    timeConditionLatex: 'a > 0',
    freqFormulaLatex: 'F(\\alpha) = \\frac{1}{a + i\\alpha} = \\frac{a - i\\alpha}{a^2 + \\alpha^2}',
    fZeroLatex: 'F(0) = \\frac{1}{a}',
    parsevalEnergyLatex: '\\int_{0}^{\\infty} e^{-2ax} dx = \\frac{1}{2a}',
    derivationMethodFa: 'انتگرال‌گیری مستقیم روی نیم‌خط مثبت $[0, \\infty)$',
    engineeringApplicationFa: 'پاسخ پله و ضربه مدارهای مقاومتی-خازنی (RC)، سیستم‌های خطی تغییرناپذیر با زمان (LTI)',
    associatedPresetId: 'one_sided_exp',
  },
  {
    id: 'odd_two_sided_exp',
    nameFa: 'نمایی دوطرفه فرد (Sign Damped Exponential)',
    category: 'basic',
    categoryFa: 'توابع فرد خالص',
    timeFormulaLatex: 'f(x) = e^{-a|x|}\\operatorname{sgn}(x) = \\begin{cases} e^{-ax} & x > 0 \\\\ -e^{ax} & x < 0 \\end{cases}',
    timeConditionLatex: 'a > 0',
    freqFormulaLatex: 'F(\\alpha) = \\frac{-2i\\alpha}{a^2 + \\alpha^2}',
    fZeroLatex: 'F(0) = 0',
    parsevalEnergyLatex: '\\int_{-\\infty}^{\\infty} e^{-2a|x|} dx = \\frac{1}{a}',
    derivationMethodFa: 'انتگرال فوریه فرد خالص (بخش حقیقی صفر و بخش موهومی سینوسی)',
    engineeringApplicationFa: 'پردازش سیگنال پالس‌های تفاضلی و سیستم‌های حساس به جهت شیب',
  },
  {
    id: 'gaussian',
    nameFa: 'تابع گاوسی (Gaussian Wavepacket / Heat Kernel)',
    category: 'basic',
    categoryFa: 'خودمتشابه (Eigenfunction)',
    timeFormulaLatex: 'f(x) = e^{-a x^2}',
    timeConditionLatex: 'a > 0',
    freqFormulaLatex: 'F(\\alpha) = \\sqrt{\\frac{\\pi}{a}}\\,e^{-\\frac{\\alpha^2}{4a}}',
    fZeroLatex: 'F(0) = \\sqrt{\\frac{\\pi}{a}}',
    parsevalEnergyLatex: '\\int_{-\\infty}^{\\infty} e^{-2ax^2} dx = \\sqrt{\\frac{\\pi}{2a}}',
    derivationMethodFa: 'تشکیل معادله دیفرانسیل مرتبه اول $F\'(\\alpha) + \\frac{\\alpha}{2a}F(\\alpha) = 0$ و حل آن',
    engineeringApplicationFa: 'حل معادله انتقال حرارت میله نامتناهی، بسته‌های موج کوانتومی و ارضای کمینه نامساوی عدم قطعیت',
    associatedPresetId: 'gaussian',
  },
  {
    id: 'triangle_pulse',
    nameFa: 'پالس مثلثی متقارن (Triangle Pulse / Bartlett)',
    category: 'basic',
    categoryFa: 'کانولوشن دو پالس',
    timeFormulaLatex: 'f(x) = \\begin{cases} 1 - \\frac{|x|}{a} & |x| < a \\\\ 0 & |x| \\ge a \\end{cases}',
    timeConditionLatex: 'a > 0',
    freqFormulaLatex: 'F(\\alpha) = a\\left[\\frac{\\sin(a\\alpha/2)}{a\\alpha/2}\\right]^2 = \\frac{2(1 - \\cos(a\\alpha))}{a\\alpha^2}',
    fZeroLatex: 'F(0) = a',
    parsevalEnergyLatex: '\\int_{-a}^{a} \\left(1 - \\frac{|x|}{a}\\right)^2 dx = \\frac{2a}{3}',
    derivationMethodFa: 'کانولوشن دو پالس مستطیلی با عرض $a$ یا انتگرال جز‌ءبه‌جزء مستقیم',
    engineeringApplicationFa: 'پنجره‌بندی بدون نشت شدید فرکانسی در پردازش طیفی و تحلیل هارمونیک',
    associatedPresetId: 'triangle_pulse',
  },
  {
    id: 'x_exp_damping',
    nameFa: 'ضرب مکان در نمایی دوطرفه (Frequency Derivative $x f(x)$)',
    category: 'frequency_derivative',
    categoryFa: 'قضیه مشتق فرکانس',
    timeFormulaLatex: 'f(x) = x e^{-a|x|}',
    timeConditionLatex: 'a > 0',
    freqFormulaLatex: 'F(\\alpha) = \\frac{-4ia\\alpha}{(a^2 + \\alpha^2)^2}',
    fZeroLatex: 'F(0) = 0',
    parsevalEnergyLatex: '\\int_{-\\infty}^{\\infty} x^2 e^{-2a|x|} dx = \\frac{1}{2a^3}',
    derivationMethodFa: 'اعمال قضیه مشتق فرکانس $\\mathcal{F}[x f(x)] = i\\frac{d}{d\\alpha}F(\\alpha)$ روی نمایی دوطرفه',
    engineeringApplicationFa: 'محاسبه گشتاورهای آماری، سیستم‌های میراشونده با ورودی شیب و ارتعاشات مکانیکی',
  },
  {
    id: 'x2_exp_damping',
    nameFa: 'ضرب مکان توان دو در نمایی دوطرفه ($x^2 f(x)$)',
    category: 'frequency_derivative',
    categoryFa: 'قضیه مشتق فرکانس',
    timeFormulaLatex: 'f(x) = x^2 e^{-a|x|}',
    timeConditionLatex: 'a > 0',
    freqFormulaLatex: 'F(\\alpha) = \\frac{4a(3\\alpha^2 - a^2)}{(a^2 + \\alpha^2)^3}',
    fZeroLatex: 'F(0) = \\frac{4}{a^3}',
    parsevalEnergyLatex: '\\int_{-\\infty}^{\\infty} x^4 e^{-2a|x|} dx = \\frac{3}{2a^5}',
    derivationMethodFa: 'دو بار اعمال قضیه مشتق فرکانس $\\mathcal{F}[x^2 f(x)] = -\\frac{d^2}{d\\alpha^2}F(\\alpha)$',
    engineeringApplicationFa: 'محاسبه واریانس و پراکندگی سیگنال‌های نوری و آکوستیک',
  },
  {
    id: 'cosine_modulation',
    nameFa: 'مدولاسیون کسینوسی نمایی (Cosine Modulation)',
    category: 'modulation',
    categoryFa: 'مدولاسیون و شیفت فرکانسی',
    timeFormulaLatex: 'f(x) = e^{-a|x|}\\cos(\\omega_0 x)',
    timeConditionLatex: 'a > 0 , \\omega_0 \\in \\mathbb{R}',
    freqFormulaLatex: 'F(\\alpha) = \\frac{a}{a^2 + (\\alpha - \\omega_0)^2} + \\frac{a}{a^2 + (\\alpha + \\omega_0)^2}',
    fZeroLatex: 'F(0) = \\frac{2a}{a^2 + \\omega_0^2}',
    parsevalEnergyLatex: '\\int_{-\\infty}^{\\infty} e^{-2a|x|}\\cos^2(\\omega_0 x) dx = \\frac{1}{2a} + \\frac{a}{2(a^2+\\omega_0^2)}',
    derivationMethodFa: 'قضیه مدولاسیون فرکانس $\\mathcal{F}[f(x)\\cos(\\omega_0 x)] = \\frac{1}{2}[F(\\alpha-\\omega_0) + F(\\alpha+\\omega_0)]$',
    engineeringApplicationFa: 'سیستم‌های مخابراتی مدولاسیون دامنه باند جانبی دوگانه (DSB-AM) و رادیو',
  },
  {
    id: 'sine_modulation',
    nameFa: 'مدولاسیون سینوسی نمایی (Sine Modulation)',
    category: 'modulation',
    categoryFa: 'مدولاسیون و شیفت فرکانسی',
    timeFormulaLatex: 'f(x) = e^{-a|x|}\\sin(\\omega_0 x)',
    timeConditionLatex: 'a > 0 , \\omega_0 \\in \\mathbb{R}',
    freqFormulaLatex: 'F(\\alpha) = \\frac{ia}{a^2 + (\\alpha + \\omega_0)^2} - \\frac{ia}{a^2 + (\\alpha - \\omega_0)^2}',
    fZeroLatex: 'F(0) = 0',
    parsevalEnergyLatex: '\\int_{-\\infty}^{\\infty} e^{-2a|x|}\\sin^2(\\omega_0 x) dx = \\frac{1}{2a} - \\frac{a}{2(a^2+\\omega_0^2)}',
    derivationMethodFa: 'قضیه مدولاسیون فرکانس با استفاده از فرمول اویلر برای سینوس $\\sin(\\omega_0 x) = \\frac{e^{i\\omega_0 x} - e^{-i\\omega_0 x}}{2i}$',
    engineeringApplicationFa: 'تولید سیگنال‌های حامل فاز متعامد (QAM) در مخابرات بی‌سیم پیشرفته',
  },
  {
    id: 'x_gaussian',
    nameFa: 'تابع ضرب مکان در گاوسی ($x e^{-ax^2}$)',
    category: 'frequency_derivative',
    categoryFa: 'قضیه مشتق فرکانس',
    timeFormulaLatex: 'f(x) = x e^{-a x^2}',
    timeConditionLatex: 'a > 0',
    freqFormulaLatex: 'F(\\alpha) = \\frac{-i\\alpha}{2a}\\sqrt{\\frac{\\pi}{a}}\\,e^{-\\frac{\\alpha^2}{4a}}',
    fZeroLatex: 'F(0) = 0',
    parsevalEnergyLatex: '\\int_{-\\infty}^{\\infty} x^2 e^{-2ax^2} dx = \\frac{1}{4a}\\sqrt{\\frac{\\pi}{2a}}',
    derivationMethodFa: 'اعمال قضیه مشتق فرکانس $\\mathcal{F}[x e^{-ax^2}] = i\\frac{d}{d\\alpha}\\left[\\sqrt{\\frac{\\pi}{a}}e^{-\\frac{\\alpha^2}{4a}}\\right]$',
    engineeringApplicationFa: 'ویولت‌های درجه اول گاوسی (Gaussian Wavelets) در تشخیص لبه‌های تصویر',
  },
  {
    id: 'exp_convolution',
    nameFa: 'کانولوشن دو تابع نمایی ($(e^{-a|x|} * e^{-a|x|})$)',
    category: 'basic',
    categoryFa: 'قضیه کانولوشن زمان',
    timeFormulaLatex: 'f(x) = \\frac{1 + a|x|}{a} e^{-a|x|}',
    timeConditionLatex: 'a > 0',
    freqFormulaLatex: 'F(\\alpha) = \\left[\\frac{2a}{a^2 + \\alpha^2}\\right]^2 = \\frac{4a^2}{(a^2 + \\alpha^2)^2}',
    fZeroLatex: 'F(0) = \\frac{4}{a^2}',
    parsevalEnergyLatex: '\\int_{-\\infty}^{\\infty} |f(x)|^2 dx = \\frac{5}{2a^3}',
    derivationMethodFa: 'قضیه کانولوشن $\\mathcal{F}[f * g] = F(\\alpha)G(\\alpha)$ و تبدیل معکوس فوریه',
    engineeringApplicationFa: 'مدل‌سازی پاسخ آبشاری فیلترهای دو مرحله‌ای متوالی',
  },
  {
    id: 'cosine_transform_exp',
    nameFa: 'تبدیل فوریه کسینوسی نمایی یک‌طرفه ($\\mathcal{F}_c[e^{-ax}]$)',
    category: 'sine_cosine',
    categoryFa: 'تبدیل‌های سینوسی و کسینوسی',
    timeFormulaLatex: 'f(x) = e^{-ax}',
    timeConditionLatex: 'x > 0 , a > 0',
    freqFormulaLatex: 'F_c(\\alpha) = \\sqrt{\\frac{2}{\\pi}} \\int_0^\\infty e^{-ax}\\cos(\\alpha x) dx = \\sqrt{\\frac{2}{\\pi}} \\frac{a}{a^2 + \\alpha^2}',
    fZeroLatex: 'F_c(0) = \\sqrt{\\frac{2}{\\pi}}\\frac{1}{a}',
    parsevalEnergyLatex: '\\int_0^\\infty e^{-2ax} dx = \\frac{1}{2a}',
    derivationMethodFa: 'انتگرال کسینوسی استاندارد نیم‌خط و فرمول تبدیل معکوس $f(x) = \\sqrt{\\frac{2}{\\pi}}\\int_0^\\infty F_c(\\alpha)\\cos(\\alpha x)d\\alpha$',
    engineeringApplicationFa: 'حل معادلات گرما و موج روی نیم‌خط $x > 0$ با شرط مرزی عایق / نیومن $u_x(0, t) = 0$',
  },
  {
    id: 'sine_transform_exp',
    nameFa: 'تبدیل فوریه سینوسی نمایی یک‌طرفه ($\\mathcal{F}_s[e^{-ax}]$)',
    category: 'sine_cosine',
    categoryFa: 'تبدیل‌های سینوسی و کسینوسی',
    timeFormulaLatex: 'f(x) = e^{-ax}',
    timeConditionLatex: 'x > 0 , a > 0',
    freqFormulaLatex: 'F_s(\\alpha) = \\sqrt{\\frac{2}{\\pi}} \\int_0^\\infty e^{-ax}\\sin(\\alpha x) dx = \\sqrt{\\frac{2}{\\pi}} \\frac{\\alpha}{a^2 + \\alpha^2}',
    fZeroLatex: 'F_s(0) = 0',
    parsevalEnergyLatex: '\\int_0^\\infty e^{-2ax} dx = \\frac{1}{2a}',
    derivationMethodFa: 'انتگرال سینوسی استاندارد نیم‌خط و فرمول تبدیل معکوس $f(x) = \\sqrt{\\frac{2}{\\pi}}\\int_0^\\infty F_s(\\alpha)\\sin(\\alpha x)d\\alpha$',
    engineeringApplicationFa: 'حل مسائل پتانسیل و حرارت روی نیم‌خط $x > 0$ با شرط مرزی دیریکله $u(0, t) = 0$',
  },
];

/**
 * Evaluate Partial Fourier Integral approximation:
 * I_Omega(x) = int_0^Omega (A(alpha) cos(alpha x) + B(alpha) sin(alpha x)) d_alpha
 */
export function evaluatePartialFourierIntegral(
  presetId: TransformPresetId,
  x: number,
  paramA: number,
  cutoffOmega: number
): number {
  const omega = Math.max(0.5, cutoffOmega);
  return integrateSimpson(
    (alpha) => {
      const pair = evaluateTransformPair(presetId, alpha, paramA, 0, 0);
      return pair.A_alpha * Math.cos(alpha * x) + pair.B_alpha * Math.sin(alpha * x);
    },
    0,
    omega,
    160
  );
}

/**
 * Lesson 5: Sturm-Liouville Standard Boundary Value Problems (Table 4, PDF Page 113)
 * Equation: y'' + lambda * y = 0 on [0, L] (or [-L, L] for periodic)
 */
export type SturmLiouvilleCaseId =
  | 'case_a_dirichlet' // y(0)=0, y(L)=0 -> lambda_n = (n pi / L)^2, y_n = sin(n pi x / L), n=1,2,...
  | 'case_b_neumann' // y'(0)=0, y'(L)=0 -> lambda_0 = 0 (y_0=1), lambda_n = (n pi / L)^2, y_n = cos(n pi x / L)
  | 'case_c_periodic' // y(-L)=y(L), y'(-L)=y'(L) -> lambda_0=0, lambda_n=(n pi/L)^2, {cos, sin}
  | 'case_d_dirichlet_neumann' // y(0)=0, y'(L)=0 -> lambda_n = ((2n-1) pi / (2L))^2, y_n = sin((2n-1) pi x / (2L))
  | 'case_e_neumann_dirichlet'; // y'(0)=0, y(L)=0 -> lambda_n = ((2n-1) pi / (2L))^2, y_n = cos((2n-1) pi x / (2L))

export interface SturmLiouvilleEigenpair {
  modeIndexN: number;
  eigenvalueLambda: number;
  alphaRoot: number;
  formulaLambdaLatex: string;
  formulaEigenfunctionLatex: string;
  boundaryDescriptionFa: string;
  evaluateEigenfunction: (x: number) => number;
}

export function solveSturmLiouvilleCase(
  caseId: SturmLiouvilleCaseId,
  L: number,
  modeN: number
): SturmLiouvilleEigenpair {
  const safeL = Math.max(0.5, L);
  const n = Math.max(1, Math.round(modeN));

  switch (caseId) {
    case 'case_a_dirichlet': {
      const alpha = (n * Math.PI) / safeL;
      return {
        modeIndexN: n,
        eigenvalueLambda: alpha * alpha,
        alphaRoot: alpha,
        formulaLambdaLatex: `\\lambda_{${n}} = \\left(\\frac{${n}\\pi}{L}\\right)^2`,
        formulaEigenfunctionLatex: `y_{${n}}(x) = \\sin\\left(\\frac{${n}\\pi x}{L}\\right)`,
        boundaryDescriptionFa: 'شرایط مرزی دیریکله همگن: y(0) = 0 و y(L) = 0',
        evaluateEigenfunction: (x: number) => Math.sin(alpha * x),
      };
    }
    case 'case_b_neumann': {
      // Allow n=0 as mode 1 if needed, or standard n=1,2,... with note about lambda_0 = 0
      const alpha = (n * Math.PI) / safeL;
      return {
        modeIndexN: n,
        eigenvalueLambda: alpha * alpha,
        alphaRoot: alpha,
        formulaLambdaLatex: `\\lambda_0 = 0,\\quad \\lambda_{${n}} = \\left(\\frac{${n}\\pi}{L}\\right)^2`,
        formulaEigenfunctionLatex: `y_0 = 1,\\quad y_{${n}}(x) = \\cos\\left(\\frac{${n}\\pi x}{L}\\right)`,
        boundaryDescriptionFa: 'شرایط مرزی نیومن (عایق): y\'(0) = 0 و y\'(L) = 0',
        evaluateEigenfunction: (x: number) => Math.cos(alpha * x),
      };
    }
    case 'case_c_periodic': {
      const alpha = (n * Math.PI) / safeL;
      return {
        modeIndexN: n,
        eigenvalueLambda: alpha * alpha,
        alphaRoot: alpha,
        formulaLambdaLatex: `\\lambda_0 = 0,\\quad \\lambda_{${n}} = \\left(\\frac{${n}\\pi}{L}\\right)^2`,
        formulaEigenfunctionLatex: `y_{${n}}(x) = c_1\\cos\\left(\\frac{${n}\\pi x}{L}\\right) + c_2\\sin\\left(\\frac{${n}\\pi x}{L}\\right)`,
        boundaryDescriptionFa: 'شرایط مرزی متناوب روی [-L, L]: y(-L)=y(L) و y\'(-L)=y\'(L)',
        evaluateEigenfunction: (x: number) =>
          0.7 * Math.cos(alpha * x) + 0.7 * Math.sin(alpha * x),
      };
    }
    case 'case_d_dirichlet_neumann': {
      const oddFactor = 2 * n - 1;
      const alpha = (oddFactor * Math.PI) / (2 * safeL);
      return {
        modeIndexN: n,
        eigenvalueLambda: alpha * alpha,
        alphaRoot: alpha,
        formulaLambdaLatex: `\\lambda_{${n}} = \\left(\\frac{${oddFactor}\\pi}{2L}\\right)^2`,
        formulaEigenfunctionLatex: `y_{${n}}(x) = \\sin\\left(\\frac{${oddFactor}\\pi x}{2L}\\right)`,
        boundaryDescriptionFa: 'شرایط مرزی مختلط (ابتدا صفر، انتها عایق): y(0) = 0 و y\'(L) = 0',
        evaluateEigenfunction: (x: number) => Math.sin(alpha * x),
      };
    }
    case 'case_e_neumann_dirichlet': {
      const oddFactor = 2 * n - 1;
      const alpha = (oddFactor * Math.PI) / (2 * safeL);
      return {
        modeIndexN: n,
        eigenvalueLambda: alpha * alpha,
        alphaRoot: alpha,
        formulaLambdaLatex: `\\lambda_{${n}} = \\left(\\frac{${oddFactor}\\pi}{2L}\\right)^2`,
        formulaEigenfunctionLatex: `y_{${n}}(x) = \\cos\\left(\\frac{${oddFactor}\\pi x}{2L}\\right)`,
        boundaryDescriptionFa: 'شرایط مرزی مختلط (ابتدا عایق، انتها صفر): y\'(0) = 0 و y(L) = 0',
        evaluateEigenfunction: (x: number) => Math.cos(alpha * x),
      };
    }
  }
}

export interface SturmLiouvilleTable4Entry {
  id: SturmLiouvilleCaseId;
  nameFa: string;
  bcFa: string;
  bcLatex: string;
  domainLatex: string;
  lambdaZeroStatusFa: string;
  eigenvaluesFormulaLatex: string;
  eigenfunctionsFormulaLatex: string;
  indexRangeFa: string;
  physicalInterpretationFa: string;
  orthogonalityNormLatex: string;
}

export const STURM_LIOUVILLE_TABLE_4: SturmLiouvilleTable4Entry[] = [
  {
    id: 'case_a_dirichlet',
    nameFa: 'حالت الف: دیریکله همگن (دو سر صفر)',
    bcFa: 'مقدار تابع در هر دو نقطه مرزی برابر صفر است',
    bcLatex: 'y(0) = 0 \\quad , \\quad y(L) = 0',
    domainLatex: '0 \\le x \\le L',
    lambdaZeroStatusFa: 'مقدار ویژه نیست (منجر به جواب بدیهی y(x) = 0 می‌شود)',
    eigenvaluesFormulaLatex: '\\lambda_n = \\left(\\frac{n\\pi}{L}\\right)^2',
    eigenfunctionsFormulaLatex: 'y_n(x) = \\sin\\left(\\frac{n\\pi x}{L}\\right)',
    indexRangeFa: 'n = 1, 2, 3, \\dots',
    physicalInterpretationFa: 'ارتعاش تار کشیده با دو انتهای ثابت، میله حرارتی با دو انتهای غوطه‌ور در یخ صفر درجه',
    orthogonalityNormLatex: '\\|y_n\\|^2 = \\int_0^L \\sin^2\\left(\\frac{n\\pi x}{L}\\right) dx = \\frac{L}{2}',
  },
  {
    id: 'case_b_neumann',
    nameFa: 'حالت ب: نیومن همگن (دو سر عایق)',
    bcFa: 'مشتق تابع در هر دو مرز برابر صفر است (شار صفر)',
    bcLatex: "y'(0) = 0 \\quad , \\quad y'(L) = 0",
    domainLatex: '0 \\le x \\le L',
    lambdaZeroStatusFa: 'مقدار ویژه معتبر است! λ₀ = 0 با تابع ویژه ثابت غیرصفر y₀ = 1',
    eigenvaluesFormulaLatex: '\\lambda_0 = 0 \\quad , \\quad \\lambda_n = \\left(\\frac{n\\pi}{L}\\right)^2',
    eigenfunctionsFormulaLatex: 'y_0(x) = 1 \\quad , \\quad y_n(x) = \\cos\\left(\\frac{n\\pi x}{L}\\right)',
    indexRangeFa: 'n = 1, 2, 3, \\dots',
    physicalInterpretationFa: 'میله انتقال حرارت با دو انتهای کاملاً عایق‌بندی‌شده، نوسان فشار در لوله صوتی دو سر بسته',
    orthogonalityNormLatex: '\\|y_0\\|^2 = L \\quad , \\quad \\|y_n\\|^2 = \\frac{L}{2} \\; (n \\ge 1)',
  },
  {
    id: 'case_c_periodic',
    nameFa: 'حالت ج: شرایط مرزی متناوب (بازه متقارن)',
    bcFa: 'مقادیر تابع و مشتق در دو مرز قرینه با یکدیگر برابرند',
    bcLatex: "y(-L) = y(L) \\quad , \\quad y'(-L) = y'(L)",
    domainLatex: '-L \\le x \\le L',
    lambdaZeroStatusFa: 'مقدار ویژه معتبر است! λ₀ = 0 با تابع ویژه ثابت y₀ = 1',
    eigenvaluesFormulaLatex: '\\lambda_0 = 0 \\quad , \\quad \\lambda_n = \\left(\\frac{n\\pi}{L}\\right)^2',
    eigenfunctionsFormulaLatex: '\\{ 1 \\} \\cup \\left\\{ \\cos\\left(\\frac{n\\pi x}{L}\\right) \\; , \\; \\sin\\left(\\frac{n\\pi x}{L}\\right) \\right\\}',
    indexRangeFa: 'n = 1, 2, 3, \\dots \\text{ (فضای ویژه ۲ بعدی / مقادیر ویژه مضاعف)}',
    physicalInterpretationFa: 'انتشار حرارت یا امواج الکترومغناطیسی در یک رینگ یا حلقه مدور بسته (Closed Ring)',
    orthogonalityNormLatex: '\\|y_0\\|^2 = 2L \\quad , \\quad \\|y_n\\|^2 = L \\; (n \\ge 1)',
  },
  {
    id: 'case_d_dirichlet_neumann',
    nameFa: 'حالت د: مختلط (ابتدا صفر، انتها عایق)',
    bcFa: 'مبدأ دارای مقدار صفر و انتهای میله عایق‌بندی‌شده است',
    bcLatex: "y(0) = 0 \\quad , \\quad y'(L) = 0",
    domainLatex: '0 \\le x \\le L',
    lambdaZeroStatusFa: 'مقدار ویژه نیست (منجر به A=0, B=0 می‌شود)',
    eigenvaluesFormulaLatex: '\\lambda_n = \\left(\\frac{(2n-1)\\pi}{2L}\\right)^2',
    eigenfunctionsFormulaLatex: 'y_n(x) = \\sin\\left(\\frac{(2n-1)\\pi x}{2L}\\right)',
    indexRangeFa: 'n = 1, 2, 3, \\dots',
    physicalInterpretationFa: 'ستون کنسول ارتعاشی گیردار در مبدأ و آزاد در انتها، میله حرارتی با مبدأ صفر و انتهای عایق',
    orthogonalityNormLatex: '\\|y_n\\|^2 = \\int_0^L \\sin^2\\left(\\frac{(2n-1)\\pi x}{2L}\\right) dx = \\frac{L}{2}',
  },
  {
    id: 'case_e_neumann_dirichlet',
    nameFa: 'حالت ه: مختلط (ابتدا عایق، انتها صفر)',
    bcFa: 'مبدأ عایق‌بندی‌شده و انتهای میله در دمای صفر نگه داشته شده است',
    bcLatex: "y'(0) = 0 \\quad , \\quad y(L) = 0",
    domainLatex: '0 \\le x \\le L',
    lambdaZeroStatusFa: 'مقدار ویژه نیست',
    eigenvaluesFormulaLatex: '\\lambda_n = \\left(\\frac{(2n-1)\\pi}{2L}\\right)^2',
    eigenfunctionsFormulaLatex: 'y_n(x) = \\cos\\left(\\frac{(2n-1)\\pi x}{2L}\\right)',
    indexRangeFa: 'n = 1, 2, 3, \\dots',
    physicalInterpretationFa: 'میله حرارتی با انتهای عایق در مبدأ و تماس با حمام صفر درجه در انتها',
    orthogonalityNormLatex: '\\|y_n\\|^2 = \\int_0^L \\cos^2\\left(\\frac{(2n-1)\\pi x}{2L}\\right) dx = \\frac{L}{2}',
  },
];

/**
 * Convert general 2nd-order linear ODE P(x)y'' + Q(x)y' + (lambda R(x) + S(x))y = 0
 * into Sturm-Liouville form [r(x)y']' + [lambda p(x) + q(x)]y = 0
 * Using integrating factor mu(x) = (1/P(x)) exp(int Q(x)/P(x) dx)
 */
export function computeSturmLiouvilleIntegratingFactorExample(
  type: 'euler' | 'legendre' | 'bessel' | 'chebyshev' | 'hermite' | 'constant'
): {
  odeLatex: string;
  integratingFactorMu: string;
  r_x: string;
  p_x: string;
  q_x: string;
  slFormLatex: string;
  orthogonalityIntervalLatex: string;
} {
  switch (type) {
    case 'euler':
      // Example 41 in PDF: x^2 y'' + 3x y' + lambda y = 0
      return {
        odeLatex: "x^2 y'' + 3x y' + \\lambda y = 0",
        integratingFactorMu: '\\mu(x) = \\frac{1}{x^2} e^{\\int \\frac{3x}{x^2}dx} = \\frac{1}{x^2} e^{3\\ln x} = x',
        r_x: 'r(x) = x^3',
        p_x: 'p(x) = x',
        q_x: 'q(x) = 0',
        slFormLatex: "[x^3 y'(x)]' + \\lambda x y(x) = 0",
        orthogonalityIntervalLatex: '\\int_1^e x\\,y_m(x)\\,y_n(x)\\,dx = 0 \\quad (m \\neq n)',
      };
    case 'legendre':
      // (1-x^2)y'' - 2xy' + lambda y = 0
      return {
        odeLatex: "(1-x^2)y'' - 2xy' + \\lambda y = 0",
        integratingFactorMu: '\\mu(x) = \\frac{1}{1-x^2} e^{\\int \\frac{-2x}{1-x^2}dx} = \\frac{1}{1-x^2}(1-x^2) = 1',
        r_x: 'r(x) = 1 - x^2',
        p_x: 'p(x) = 1',
        q_x: 'q(x) = 0',
        slFormLatex: "[(1-x^2)y'(x)]' + \\lambda y(x) = 0",
        orthogonalityIntervalLatex: '\\int_{-1}^{1} 1 \\cdot P_m(x)\\,P_n(x)\\,dx = 0 \\quad (m \\neq n)',
      };
    case 'bessel':
      // x^2 y'' + x y' + (lambda x^2 - n^2)y = 0
      return {
        odeLatex: "x^2 y'' + x y' + (\\lambda x^2 - n^2)y = 0",
        integratingFactorMu: '\\mu(x) = \\frac{1}{x^2} e^{\\int \\frac{1}{x}dx} = \\frac{1}{x}',
        r_x: 'r(x) = x',
        p_x: 'p(x) = x',
        q_x: 'q(x) = -\\frac{n^2}{x}',
        slFormLatex: "[x y'(x)]' + \\left(\\lambda x - \\frac{n^2}{x}\\right)y(x) = 0",
        orthogonalityIntervalLatex: '\\int_{0}^{R} x\\,J_n(\\alpha_{nm} x/R)\\,J_n(\\alpha_{nk} x/R)\\,dx = 0 \\quad (m \\neq k)',
      };
    case 'chebyshev':
      // (1-x^2)y'' - x y' + lambda y = 0
      return {
        odeLatex: "(1-x^2)y'' - x y' + \\lambda y = 0",
        integratingFactorMu: '\\mu(x) = \\frac{1}{1-x^2} e^{\\int \\frac{-x}{1-x^2}dx} = \\frac{1}{\\sqrt{1-x^2}}',
        r_x: 'r(x) = \\sqrt{1-x^2}',
        p_x: 'p(x) = \\frac{1}{\\sqrt{1-x^2}}',
        q_x: 'q(x) = 0',
        slFormLatex: "[\\sqrt{1-x^2}\\,y'(x)]' + \\frac{\\lambda}{\\sqrt{1-x^2}} y(x) = 0",
        orthogonalityIntervalLatex: '\\int_{-1}^{1} \\frac{1}{\\sqrt{1-x^2}}\\,T_m(x)\\,T_n(x)\\,dx = 0 \\quad (m \\neq n)',
      };
    case 'hermite':
      // y'' - 2x y' + lambda y = 0
      return {
        odeLatex: "y'' - 2x y' + \\lambda y = 0",
        integratingFactorMu: '\\mu(x) = e^{\\int (-2x) dx} = e^{-x^2}',
        r_x: 'r(x) = e^{-x^2}',
        p_x: 'p(x) = e^{-x^2}',
        q_x: 'q(x) = 0',
        slFormLatex: "[e^{-x^2} y'(x)]' + \\lambda e^{-x^2} y(x) = 0",
        orthogonalityIntervalLatex: '\\int_{-\\infty}^{\\infty} e^{-x^2}\\,H_m(x)\\,H_n(x)\\,dx = 0 \\quad (m \\neq n)',
      };
    case 'constant':
      // y'' + 4y' + lambda y = 0
      return {
        odeLatex: "y'' + 4y' + \\lambda y = 0",
        integratingFactorMu: '\\mu(x) = e^{\\int 4 dx} = e^{4x}',
        r_x: 'r(x) = e^{4x}',
        p_x: 'p(x) = e^{4x}',
        q_x: 'q(x) = 0',
        slFormLatex: "[e^{4x} y'(x)]' + \\lambda e^{4x} y(x) = 0",
        orthogonalityIntervalLatex: '\\int_{0}^{L} e^{4x}\\,y_m(x)\\,y_n(x)\\,dx = 0 \\quad (m \\neq n)',
      };
  }
}

/**
 * Computes high-density eigenfunction points for Recharts visualization,
 * node count (zeros inside the interval), and numerical weighted orthogonality.
 */
export function computeSLEigenfunctionData(
  caseId: SturmLiouvilleCaseId,
  L: number,
  modeN: number,
  samples = 140
): {
  xStart: number;
  xEnd: number;
  eigenpair: SturmLiouvilleEigenpair;
  companionPair: SturmLiouvilleEigenpair;
  points: {
    x: number;
    yMain: number;
    yNext: number;
    weightedProduct: number;
  }[];
  interiorNodesCount: number;
  numericalOrthogonalityIntegral: number;
  orthogonalityNorm: number;
} {
  const safeL = Math.max(0.5, L);
  const n = Math.max(1, Math.round(modeN));
  const eigenpair = solveSturmLiouvilleCase(caseId, safeL, n);
  const companionPair = solveSturmLiouvilleCase(caseId, safeL, n + 1);

  const xStart = caseId === 'case_c_periodic' ? -safeL : 0;
  const xEnd = safeL;
  const dx = (xEnd - xStart) / samples;

  const points: {
    x: number;
    yMain: number;
    yNext: number;
    weightedProduct: number;
  }[] = [];

  let interiorNodesCount = 0;
  let prevVal: number | null = null;
  let innerProdSum = 0;
  let normSum = 0;

  for (let i = 0; i <= samples; i++) {
    const x = xStart + i * dx;
    const yMain = eigenpair.evaluateEigenfunction(x);
    const yNext = companionPair.evaluateEigenfunction(x);
    const weightedProduct = yMain * yNext; // for p(x) = 1

    points.push({
      x: Number(x.toFixed(3)),
      yMain: Number(yMain.toFixed(4)),
      yNext: Number(yNext.toFixed(4)),
      weightedProduct: Number(weightedProduct.toFixed(4)),
    });

    // Detect zero crossings strictly inside the open interval (xStart, xEnd)
    const margin = 0.02 * (xEnd - xStart);
    if (x > xStart + margin && x < xEnd - margin && prevVal !== null) {
      if (prevVal * yMain < 0) {
        interiorNodesCount++;
      }
    }
    prevVal = yMain;

    // Numerical Riemann integration
    const weight = i === 0 || i === samples ? 0.5 : 1.0;
    innerProdSum += weightedProduct * dx * weight;
    normSum += yMain * yMain * dx * weight;
  }

  return {
    xStart,
    xEnd,
    eigenpair,
    companionPair,
    points,
    interiorNodesCount,
    numericalOrthogonalityIntegral: Number(innerProdSum.toFixed(5)),
    orthogonalityNorm: Number(normSum.toFixed(4)),
  };
}

/**
 * Lesson 6: Classify 2nd-order linear PDE:
 * A u_xx + B u_xy + C u_yy + D u_x + E u_y + F u = G
 * Discriminant Delta = B^2 - 4AC (PDF Page 119, Example 43)
 */
export function classifyPDE(
  A: number,
  B: number,
  C: number
): {
  delta: number;
  typeEn: 'hyperbolic' | 'parabolic' | 'elliptic';
  typeFa: 'هذلولوی (Hyperbolic - معادله موج)' | 'سهموی (Parabolic - معادله گرما)' | 'بیضوی (Elliptic - معادله لاپلاس)';
  canonicalExample: string;
} {
  const delta = B * B - 4 * A * C;
  if (Math.abs(delta) < 1e-9) {
    return {
      delta: 0,
      typeEn: 'parabolic',
      typeFa: 'سهموی (Parabolic - معادله گرما)',
      canonicalExample: 'u_t = k^2 u_{xx}',
    };
  } else if (delta > 0) {
    return {
      delta,
      typeEn: 'hyperbolic',
      typeFa: 'هذلولوی (Hyperbolic - معادله موج)',
      canonicalExample: 'u_{tt} = c^2 u_{xx}',
    };
  } else {
    return {
      delta,
      typeEn: 'elliptic',
      typeFa: 'بیضوی (Elliptic - معادله لاپلاس)',
      canonicalExample: 'u_{xx} + u_{yy} = 0',
    };
  }
}

/**
 * Lesson 6: 1D Heat Equation Solver u_t = k^2 u_xx on [0, L]
 * Supports:
 * - 'dirichlet_homog': u(0,t)=0, u(L,t)=0 with initial profile f(x)
 * - 'neumann_insulated': u_x(0,t)=0, u_x(L,t)=0 (Insulated ends, PDF Example 45)
 * - 'nonhomog_steady': u(0,t)=T1, u(L,t)=T2 -> u(x,t) = v_steady(x) + w(x,t) (PDF Example 49)
 */
export type HeatInitialProfileId =
  | 'single_sine' // f(x) = 100 sin(pi x / L)
  | 'two_modes' // f(x) = 70 sin(pi x / L) + 45 sin(3 pi x / L) (PDF Example 44 style)
  | 'constant_rod' // f(x) = 80 (Constant initial temperature)
  | 'tent_center' // f(x) = triangle peak at L/2
  | 'cosine_mode' // f(x) = 50 + 40 cos(2 pi x / L) (for Neumann)
  | 'parabolic_arch' // f(x) = 400 x (L - x) / L^2 (smooth zero boundaries)
  | 'step_heaviside' // f(x) = 100 for x <= L/2, 0 for x > L/2 (half hot, half cold)
  | 'localized_gaussian'; // f(x) = 100 exp(-25 ((x - L/2)/L)^2) (localized heat burst)

export interface HeatSimulationParams {
  rodLengthL: number;
  diffusivityK: number; // k in u_t = k^2 u_xx
  timeT: number;
  bcType:
    | 'dirichlet_homog'
    | 'neumann_insulated'
    | 'nonhomog_steady'
    | 'semi_infinite_sine'
    | 'infinite_heat_kernel'
    | 'internal_source';
  initialProfile: HeatInitialProfileId;
  leftTempT1?: number; // For nonhomog_steady & semi-infinite
  rightTempT2?: number; // For nonhomog_steady
  internalSourceQ?: number; // For internal_source u_t = k^2 u_xx + Q
}

/**
 * High-precision numerical approximation for the Error Function erf(x)
 * and Complementary Error Function erfc(x) (Abramowitz & Stegun 7.1.26)
 */
export function mathErf(x: number): number {
  if (x === 0) return 0;
  const sign = x >= 0 ? 1 : -1;
  const absX = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * absX);
  const y =
    1.0 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

  return sign * y;
}

export function mathErfc(x: number): number {
  if (x === 0) return 1;
  return 1 - mathErf(x);
}

export function evaluateInitialHeatProfile(
  profileId: HeatInitialProfileId,
  x: number,
  L: number
): number {
  switch (profileId) {
    case 'single_sine':
      return 100 * Math.sin((Math.PI * x) / L);
    case 'two_modes':
      return 70 * Math.sin((Math.PI * x) / L) + 45 * Math.sin((3 * Math.PI * x) / L);
    case 'constant_rod':
      return 80;
    case 'tent_center':
      return x <= L / 2 ? (200 * x) / L : (200 * (L - x)) / L;
    case 'cosine_mode':
      return 50 + 40 * Math.cos((2 * Math.PI * x) / L);
    case 'parabolic_arch':
      return (400 * x * (L - x)) / (L * L);
    case 'step_heaviside':
      return x <= L / 2 ? 100 : 0;
    case 'localized_gaussian': {
      const z = (x - L / 2) / L;
      return 100 * Math.exp(-25 * z * z);
    }
  }
}

/**
 * Evaluate exact/series solution u(x, t) of the 1D Heat Equation u_t = k^2 u_xx
 */
export function evaluateHeatEquation1D(
  params: HeatSimulationParams,
  x: number,
  numModes = 15
): {
  u_xt: number;
  steadyStateV: number;
  transientW: number;
  modeCoefficients: number[];
  fundamentalRelaxationTime: number; // tau_1 = L^2 / (pi^2 k^2)
} {
  const {
    rodLengthL: L,
    diffusivityK: k,
    timeT: t,
    bcType,
    initialProfile,
    leftTempT1 = 20,
    rightTempT2 = 90,
    internalSourceQ = 40,
  } = params;

  const safeT = Math.max(0, t);
  const kSq = Math.max(0.01, k * k);
  const fundamentalRelaxationTime = (L * L) / (Math.PI * Math.PI * kSq);

  if (bcType === 'dirichlet_homog') {
    // u(0,t)=0, u(L,t)=0 => u(x,t) = sum_{n=1}^N b_n sin(n pi x / L) exp(-(n pi k / L)^2 t)
    const coeffs: number[] = [];
    let sum = 0;
    for (let n = 1; n <= numModes; n++) {
      const alphaN = (n * Math.PI) / L;
      const bn =
        (2 / L) *
        integrateSimpson(
          (xi) => evaluateInitialHeatProfile(initialProfile, xi, L) * Math.sin(alphaN * xi),
          0,
          L,
          120
        );
      coeffs.push(bn);
      const decay = Math.exp(-kSq * alphaN * alphaN * safeT);
      sum += bn * Math.sin(alphaN * x) * decay;
    }
    return {
      u_xt: sum,
      steadyStateV: 0,
      transientW: sum,
      modeCoefficients: coeffs,
      fundamentalRelaxationTime,
    };
  }

  if (bcType === 'neumann_insulated') {
    // u_x(0,t)=0, u_x(L,t)=0 => u(x,t) = a_0/2 + sum_{n=1}^N a_n cos(n pi x / L) exp(-(n pi k / L)^2 t)
    const a0 =
      (2 / L) *
      integrateSimpson((xi) => evaluateInitialHeatProfile(initialProfile, xi, L), 0, L, 120);
    const steadyAvg = a0 / 2;
    const coeffs: number[] = [steadyAvg];
    let transient = 0;

    for (let n = 1; n <= numModes; n++) {
      const alphaN = (n * Math.PI) / L;
      const an =
        (2 / L) *
        integrateSimpson(
          (xi) => evaluateInitialHeatProfile(initialProfile, xi, L) * Math.cos(alphaN * xi),
          0,
          L,
          120
        );
      coeffs.push(an);
      const decay = Math.exp(-kSq * alphaN * alphaN * safeT);
      transient += an * Math.cos(alphaN * x) * decay;
    }

    return {
      u_xt: steadyAvg + transient,
      steadyStateV: steadyAvg,
      transientW: transient,
      modeCoefficients: coeffs,
      fundamentalRelaxationTime,
    };
  }

  if (bcType === 'nonhomog_steady') {
    // nonhomog_steady: u(0,t) = T1, u(L,t) = T2
    // Decompose u(x,t) = v(x) + w(x,t), where v(x) = T1 + ((T2 - T1)/L) * x
    const steadyStateV = leftTempT1 + ((rightTempT2 - leftTempT1) / L) * x;
    const coeffs: number[] = [];
    let transientW = 0;

    for (let n = 1; n <= numModes; n++) {
      const alphaN = (n * Math.PI) / L;
      const bn =
        (2 / L) *
        integrateSimpson(
          (xi) => {
            const fXi = evaluateInitialHeatProfile(initialProfile, xi, L);
            const vXi = leftTempT1 + ((rightTempT2 - leftTempT1) / L) * xi;
            return (fXi - vXi) * Math.sin(alphaN * xi);
          },
          0,
          L,
          120
        );
      coeffs.push(bn);
      const decay = Math.exp(-kSq * alphaN * alphaN * safeT);
      transientW += bn * Math.sin(alphaN * x) * decay;
    }

    return {
      u_xt: steadyStateV + transientW,
      steadyStateV,
      transientW,
      modeCoefficients: coeffs,
      fundamentalRelaxationTime,
    };
  }

  if (bcType === 'semi_infinite_sine') {
    // Semi-infinite rod x >= 0 with fixed surface temperature T1 at x=0
    // u(x,t) = T1 * erfc(x / (2 * k * sqrt(t)))
    const denom = 2 * k * Math.sqrt(Math.max(0.001, safeT));
    const erfcVal = safeT <= 0.0001 ? (x === 0 ? 1 : 0) : mathErfc(x / denom);
    const uVal = leftTempT1 * erfcVal;

    return {
      u_xt: uVal,
      steadyStateV: leftTempT1,
      transientW: uVal - leftTempT1,
      modeCoefficients: [leftTempT1],
      fundamentalRelaxationTime,
    };
  }

  if (bcType === 'infinite_heat_kernel') {
    // Infinite rod (-infty, infty) with Gaussian heat kernel
    // G(x, t) = (1 / sqrt(4 pi k^2 t)) * exp(-(x - x0)^2 / (4 k^2 t))
    const x0 = L / 2;
    const fourKt = 4 * kSq * Math.max(0.01, safeT);
    const amplitude = 100 / Math.sqrt(Math.PI * fourKt);
    const diff = x - x0;
    const uVal = amplitude * Math.exp(-(diff * diff) / fourKt);

    return {
      u_xt: uVal,
      steadyStateV: 0,
      transientW: uVal,
      modeCoefficients: [amplitude],
      fundamentalRelaxationTime,
    };
  }

  // internal_source: u_t = k^2 u_xx + Q with u(0,t)=0, u(L,t)=0
  // Steady state: v''(x) = -Q / k^2 => v(x) = (Q / (2 k^2)) * x * (L - x)
  const Q = internalSourceQ;
  const steadyV = (Q / (2 * kSq)) * x * (L - x);
  const coeffs: number[] = [];
  let transientW = 0;

  for (let n = 1; n <= numModes; n++) {
    const alphaN = (n * Math.PI) / L;
    const bn =
      (2 / L) *
      integrateSimpson(
        (xi) => {
          const fXi = evaluateInitialHeatProfile(initialProfile, xi, L);
          const vXi = (Q / (2 * kSq)) * xi * (L - xi);
          return (fXi - vXi) * Math.sin(alphaN * xi);
        },
        0,
        L,
        120
      );
    coeffs.push(bn);
    const decay = Math.exp(-kSq * alphaN * alphaN * safeT);
    transientW += bn * Math.sin(alphaN * x) * decay;
  }

  return {
    u_xt: steadyV + transientW,
    steadyStateV: steadyV,
    transientW,
    modeCoefficients: coeffs,
    fundamentalRelaxationTime,
  };
}

/**
 * Lesson 0 (Prerequisites): Exact Trigonometric & Parity Boundary Evaluator for integer n
 * Used to explain why sin(n*pi)=0, cos(n*pi)=(-1)^n, 1-(-1)^n, and sin((2n-1)*pi/2)=(-1)^(n-1)
 */
export interface FourierBoundaryTrigResult {
  n: number;
  isEvenN: boolean;
  sinNPi: number;
  cosNPi: number;
  oneMinusCosNPi: number;
  onePlusCosNPi: number;
  sinHalfNPi: number;
  cosHalfNPi: number;
  sinOddHalfPi: number;
}

export function evaluateFourierBoundaryTrig(rawN: number): FourierBoundaryTrigResult {
  const n = Math.max(1, Math.round(rawN));
  const isEvenN = n % 2 === 0;
  const cosNPi = isEvenN ? 1 : -1;
  const oneMinusCosNPi = 1 - cosNPi; // 0 for even, 2 for odd
  const onePlusCosNPi = 1 + cosNPi; // 2 for even, 0 for odd

  // sin(n*pi/2): cycles 1, 0, -1, 0 for n = 1, 2, 3, 4...
  const mod4 = ((n % 4) + 4) % 4;
  const sinHalfNPi = mod4 === 1 ? 1 : mod4 === 3 ? -1 : 0;
  const cosHalfNPi = mod4 === 0 ? 1 : mod4 === 2 ? -1 : 0;

  // sin((2n-1)*pi/2) = (-1)^(n-1)
  const sinOddHalfPi = n % 2 === 1 ? 1 : -1;

  return {
    n,
    isEvenN,
    sinNPi: 0,
    cosNPi,
    oneMinusCosNPi,
    onePlusCosNPi,
    sinHalfNPi,
    cosHalfNPi,
    sinOddHalfPi,
  };
}

/**
 * Lesson 0 (Prerequisites): 2nd-Order Linear Homogeneous ODE Characteristic Solver
 * Solves X'' + lambda * X = 0 across the 3 canonical cases:
 * - lambda < 0 (lambda = -p^2): Hyperbolic / Exponential (c1 cosh(px) + c2 sinh(px))
 * - lambda = 0: Linear (c1 + c2 x)
 * - lambda > 0 (lambda = p^2): Oscillatory Trigonometric (c1 cos(px) + c2 sin(px))
 */
export interface CharacteristicODEResult {
  caseType: 'negative_hyperbolic' | 'zero_linear' | 'positive_oscillatory';
  rootsLatex: string;
  generalSolutionLatex: string;
  canSatisfyTwoPointZeroBC: boolean;
  physicalMeaningFa: string;
  evaluateSampleCurve: (x: number, L: number) => number;
}

export function evaluateCharacteristicODE(lambdaVal: number): CharacteristicODEResult {
  if (Math.abs(lambdaVal) < 1e-6) {
    return {
      caseType: 'zero_linear',
      rootsLatex: 'r^2 = 0 \\implies r_1 = r_2 = 0 \\quad (\\text{ریشه مضاعف})',
      generalSolutionLatex: 'X(x) = A + Bx',
      canSatisfyTwoPointZeroBC: false,
      physicalMeaningFa:
        'جواب یک خط راست است. اگر در دو سر بازه X(0)=0 و X(L)=0 باشد، خط مجبور است کاملاً صفر شود (A=B=0)؛ اما در شرایط مرزی عایق (X\'(0)=X\'(L)=0) جواب غیربدیهی ثابت X(x)=A را تولید می‌کند.',
      evaluateSampleCurve: (x: number, L: number) => 0.25 + (0.6 * x) / Math.max(1, L),
    };
  }

  if (lambdaVal < 0) {
    const p = Math.sqrt(Math.abs(lambdaVal));
    const pStr = p.toFixed(1);
    return {
      caseType: 'negative_hyperbolic',
      rootsLatex: `r^2 - (${pStr})^2 = 0 \\implies r = \\pm ${pStr} \\quad (\\text{ریشه‌های حقیقی متمایز})`,
      generalSolutionLatex: `X(x) = c_1 e^{${pStr}x} + c_2 e^{-${pStr}x} = A \\cosh(${pStr}x) + B \\sinh(${pStr}x)`,
      canSatisfyTwoPointZeroBC: false,
      physicalMeaningFa:
        'توابع نمایی و هیپربولیک اکیداً یکنوا یا محدب هستند و نوسان نمی‌کنند؛ چون sinh(x) فقط در x=0 صفر است و cosh(x) >= 1 هیچ‌گاه صفر نمی‌شود، نمی‌توانند هم‌زمان در دو نقطه مرزی صفر شوند.',
      evaluateSampleCurve: (x: number, L: number) =>
        Math.sinh((p * x) / Math.max(1, L)) / Math.sinh(Math.max(0.5, p)),
    };
  }

  const p = Math.sqrt(lambdaVal);
  const pStr = p.toFixed(1);
  return {
    caseType: 'positive_oscillatory',
    rootsLatex: `r^2 + (${pStr})^2 = 0 \\implies r = \\pm i(${pStr}) \\quad (\\text{ریشه‌های مزدوج مختلط})`,
    generalSolutionLatex: `X(x) = A \\cos(${pStr}x) + B \\sin(${pStr}x)`,
    canSatisfyTwoPointZeroBC: true,
    physicalMeaningFa:
      'به دلیل فرمول اویلر، ریشه‌های موهومی محض جواب‌های نوسانی سینوسی و کسینوسی تولید می‌کنند که بی‌نهایت بار از محور افقی عبور کرده و شرایط مرزی دو سر میله را ارضا می‌کنند.',
    evaluateSampleCurve: (x: number, L: number) =>
      Math.sin((p * Math.PI * x) / Math.max(1, L)),
  };
}

/**
 * Lesson 0 (Prerequisites): Tabular Integration by Parts (DI Method / روش جزء‌به‌جزء جدولی)
 * Models the exact row-by-row derivatives (D), integrals (I), alternating signs (+,-,+,-),
 * diagonal multiplications (Row k of D -> Row k+1 of I), and the horizontal remainder integral
 * on the final row (\pm \int D_last * I_last dx).
 */
export type TabularDIPatternId =
  | 'x2_cos_nx'
  | 'x_cos_nx'
  | 'x3_sin_nx'
  | 'exp_cos_cyclic';

export interface TabularDIRow {
  rowIndex: number; // 1-based row number
  sign: '+' | '-';
  dLatex: string;
  iLatex: string;
  dRoleFa: string;
  iRoleFa: string;
}

export interface TabularDIDiagonalStep {
  stepNumber: number;
  fromRow: number; // 1-based row in Column D
  toRow: number; // 1-based row in Column I (always fromRow + 1)
  rowSign: '+' | '-';
  dTermLatex: string;
  iTermLatex: string;
  rawProductLatex: string;
  simplifiedTermLatex: string;
  explanationFa: string;
  badgeColor: string;
}

export interface TabularDIHorizontalRemainder {
  rowIndex: number;
  rowSign: '+' | '-';
  isZero: boolean;
  dLastLatex: string;
  iLastLatex: string;
  integralLatex: string;
  explanationFa: string;
}

export interface TabularDIModel {
  patternId: TabularDIPatternId;
  titleFa: string;
  shortLabelFa: string;
  integrandLatex: string;
  uChoiceLatex: string;
  dvChoiceLatex: string;
  liateRuleFa: string;
  whyRowOneIDoesNotMultiplyFa: string;
  rows: TabularDIRow[];
  diagonals: TabularDIDiagonalStep[];
  horizontalRemainder: TabularDIHorizontalRemainder;
  indefiniteFormulaLatex: string;
  definiteFormulaLatex: string;
}

export function buildTabularDIModel(patternId: TabularDIPatternId): TabularDIModel {
  const whyRowOneIDoesNotMultiplyFa =
    'در فرمول جزء‌به‌جزء (∫ u dv = u·v - ∫ v du)، جمله اول u·v است نه u·dv! در سطر ۱ جدول، ستون D همان u و ستون I همان dv (قبل از انتگرال‌گیری) است؛ در حالی که v (انتگرالِ dv) در سطر ۲ ستون I قرار دارد. به همین دلیل همیشه هر عنصر از سطر k ستون D به صورت قُطری (↘) در سطر بعدی (k+1) از ستون I ضرب می‌شود.';

  switch (patternId) {
    case 'x2_cos_nx':
      return {
        patternId: 'x2_cos_nx',
        titleFa: 'انتگرال دو مرحله‌ای ∫ x² cos(nx) dx (پرتکرارترین الگوی سری فوریه)',
        shortLabelFa: 'الگوی ۱: ∫ x² cos(nx) dx (جدول ۴ سطری)',
        integrandLatex: '\\int x^2 \\cos(nx)\\,dx',
        uChoiceLatex: 'u = x^2 \\quad (\\text{ستون } D)',
        dvChoiceLatex: 'dv = \\cos(nx)\\,dx \\quad (\\text{ستون } I)',
        liateRuleFa:
          'طبق قانون LIATE، چندجمله‌ای Jبری (A: Algebraic = x²) مقدم بر مثلثاتی (T: Trigonometric = cos(nx)) است؛ پس x² در ستون مشتق (D) قرار می‌گیرد تا پس از ۳ بار مشتق‌گیری به ۰ برسد.',
        whyRowOneIDoesNotMultiplyFa,
        rows: [
          {
            rowIndex: 1,
            sign: '+',
            dLatex: 'x^2',
            iLatex: '\\cos(nx)',
            dRoleFa: 'تابع اولیه u (مبدأ قطر اول ↘)',
            iRoleFa: 'تابع اولیه dv (در هیچ قطری ضرب نمی‌شود!)',
          },
          {
            rowIndex: 2,
            sign: '-',
            dLatex: '2x',
            iLatex: '\\frac{\\sin(nx)}{n}',
            dRoleFa: 'مشتق اول u\' (مبدأ قطر دوم ↘)',
            iRoleFa: 'انتگرال اول v₁ (مقصد قطر اول ↘)',
          },
          {
            rowIndex: 3,
            sign: '+',
            dLatex: '2',
            iLatex: '-\\frac{\\cos(nx)}{n^2}',
            dRoleFa: 'مشتق دوم u\'\' (مبدأ قطر سوم ↘)',
            iRoleFa: 'انتگرال دوم v₂ (مقصد قطر دوم ↘)',
          },
          {
            rowIndex: 4,
            sign: '-',
            dLatex: '0',
            iLatex: '-\\frac{\\sin(nx)}{n^3}',
            dRoleFa: 'مشتق سوم = ۰ (پایان مشتق‌گیری و توقف افقی ←)',
            iRoleFa: 'انتگرال سوم v₃ (مقصد قطر سوم ↘)',
          },
        ],
        diagonals: [
          {
            stepNumber: 1,
            fromRow: 1,
            toRow: 2,
            rowSign: '+',
            dTermLatex: 'x^2',
            iTermLatex: '\\frac{\\sin(nx)}{n}',
            rawProductLatex: '(+1)\\cdot (x^2) \\cdot \\left(\\frac{\\sin(nx)}{n}\\right)',
            simplifiedTermLatex: '+\\frac{x^2 \\sin(nx)}{n}',
            explanationFa:
              'قطر اول (↘): سطر ۱ ستون D (با علامت +) در سطر ۲ ستون I ضرب می‌شود (معادل u·v در مرحله اول).',
            badgeColor: '#0284C7',
          },
          {
            stepNumber: 2,
            fromRow: 2,
            toRow: 3,
            rowSign: '-',
            dTermLatex: '2x',
            iTermLatex: '-\\frac{\\cos(nx)}{n^2}',
            rawProductLatex: '(-1)\\cdot (2x) \\cdot \\left(-\\frac{\\cos(nx)}{n^2}\\right)',
            simplifiedTermLatex: '+\\frac{2x \\cos(nx)}{n^2}',
            explanationFa:
              'قطر دوم (↘): سطر ۲ ستون D (با علامت فرمول -) در سطر ۳ ستون I (که خودش علامت منفی دارد) ضرب می‌شود: منفی در منفی، مثبت می‌شود!',
            badgeColor: '#059669',
          },
          {
            stepNumber: 3,
            fromRow: 3,
            toRow: 4,
            rowSign: '+',
            dTermLatex: '2',
            iTermLatex: '-\\frac{\\sin(nx)}{n^3}',
            rawProductLatex: '(+1)\\cdot (2) \\cdot \\left(-\\frac{\\sin(nx)}{n^3}\\right)',
            simplifiedTermLatex: '-\\frac{2 \\sin(nx)}{n^3}',
            explanationFa:
              'قطر سوم (↘): سطر ۳ ستون D (با علامت +) در سطر ۴ ستون I ضرب می‌شود و جمله سوم را می‌سازد.',
            badgeColor: '#D97706',
          },
        ],
        horizontalRemainder: {
          rowIndex: 4,
          rowSign: '-',
          isZero: true,
          dLastLatex: '0',
          iLastLatex: '-\\frac{\\sin(nx)}{n^3}',
          integralLatex: '- \\int (0) \\cdot \\left(-\\frac{\\sin(nx)}{n^3}\\right)dx = 0',
          explanationFa:
            'قانون سطر آخر (ضرب افقی ← زیر انتگرال): در سطر ۴ حاصل‌ضرب افقی درون انتگرال قرار می‌گیرد، اما چون D₄ = 0 شده است، انتگرال باقیمانده دقیقاً صفر است و جدول متوقف می‌شود.',
        },
        indefiniteFormulaLatex:
          '\\int x^2 \\cos(nx)\\,dx = \\underbrace{+\\frac{x^2\\sin(nx)}{n}}_{\\text{قطر ۱ (سطر ۱}\\searrow\\text{۲)}} \\;\\underbrace{+\\frac{2x\\cos(nx)}{n^2}}_{\\text{قطر ۲ (سطر ۲}\\searrow\\text{۳)}} \\;\\underbrace{-\\frac{2\\sin(nx)}{n^3}}_{\\text{قطر ۳ (سطر ۳}\\searrow\\text{۴)}} + C',
        definiteFormulaLatex:
          '\\int_{-\\pi}^{\\pi} x^2 \\cos(nx)\\,dx = \\left[ \\frac{x^2\\sin(nx)}{n} + \\frac{2x\\cos(nx)}{n^2} - \\frac{2\\sin(nx)}{n^3} \\right]_{-\\pi}^{\\pi} = \\frac{4\\pi(-1)^n}{n^2}',
      };

    case 'x_cos_nx':
      return {
        patternId: 'x_cos_nx',
        titleFa: 'انتگرال تک‌مرحله‌ای ∫ x cos(nx) dx با جدول ۳ سطری',
        shortLabelFa: 'الگوی ۲: ∫ x cos(nx) dx (جدول ۳ سطری)',
        integrandLatex: '\\int x \\cos(nx)\\,dx',
        uChoiceLatex: 'u = x \\quad (\\text{ستون } D)',
        dvChoiceLatex: 'dv = \\cos(nx)\\,dx \\quad (\\text{ستون } I)',
        liateRuleFa:
          'چندجمله‌ای خطی x در ستون مشتق (D) قرار می‌گیرد و پس از ۲ بار مشتق‌گیری به ۰ می‌رسد؛ کسینوس در ستون انتگرال (I) قرار می‌گیرد.',
        whyRowOneIDoesNotMultiplyFa,
        rows: [
          {
            rowIndex: 1,
            sign: '+',
            dLatex: 'x',
            iLatex: '\\cos(nx)',
            dRoleFa: 'تابع اولیه u (مبدأ قطر اول ↘)',
            iRoleFa: 'تابع اولیه dv (ضرب نمی‌شود)',
          },
          {
            rowIndex: 2,
            sign: '-',
            dLatex: '1',
            iLatex: '\\frac{\\sin(nx)}{n}',
            dRoleFa: 'مشتق اول u\' (مبدأ قطر دوم ↘)',
            iRoleFa: 'انتگرال اول v₁ (مقصد قطر اول ↘)',
          },
          {
            rowIndex: 3,
            sign: '+',
            dLatex: '0',
            iLatex: '-\\frac{\\cos(nx)}{n^2}',
            dRoleFa: 'مشتق دوم = ۰ (توقف افقی ←)',
            iRoleFa: 'انتگرال دوم v₂ (مقصد قطر دوم ↘)',
          },
        ],
        diagonals: [
          {
            stepNumber: 1,
            fromRow: 1,
            toRow: 2,
            rowSign: '+',
            dTermLatex: 'x',
            iTermLatex: '\\frac{\\sin(nx)}{n}',
            rawProductLatex: '(+1)\\cdot (x) \\cdot \\left(\\frac{\\sin(nx)}{n}\\right)',
            simplifiedTermLatex: '+\\frac{x \\sin(nx)}{n}',
            explanationFa:
              'قطر اول (↘): سطر ۱ ستون D (با علامت +) در سطر ۲ ستون I ضرب می‌شود.',
            badgeColor: '#0284C7',
          },
          {
            stepNumber: 2,
            fromRow: 2,
            toRow: 3,
            rowSign: '-',
            dTermLatex: '1',
            iTermLatex: '-\\frac{\\cos(nx)}{n^2}',
            rawProductLatex: '(-1)\\cdot (1) \\cdot \\left(-\\frac{\\cos(nx)}{n^2}\\right)',
            simplifiedTermLatex: '+\\frac{\\cos(nx)}{n^2}',
            explanationFa:
              'قطر دوم (↘): سطر ۲ ستون D (با علامت -) در سطر ۳ ستون I ضرب می‌شود: (-1)×(-cos(nx)/n²) = +cos(nx)/n².',
            badgeColor: '#059669',
          },
        ],
        horizontalRemainder: {
          rowIndex: 3,
          rowSign: '+',
          isZero: true,
          dLastLatex: '0',
          iLastLatex: '-\\frac{\\cos(nx)}{n^2}',
          integralLatex: '+ \\int (0) \\cdot \\left(-\\frac{\\cos(nx)}{n^2}\\right)dx = 0',
          explanationFa:
            'در سطر ۳ چون مشتق به ۰ رسیده است، انتگرال افقی سطر آخر صفر شده و جواب کامل است.',
        },
        indefiniteFormulaLatex:
          '\\int x \\cos(nx)\\,dx = \\underbrace{+\\frac{x\\sin(nx)}{n}}_{\\text{قطر ۱ (سطر ۱}\\searrow\\text{۲)}} \\;\\underbrace{+\\frac{\\cos(nx)}{n^2}}_{\\text{قطر ۲ (سطر ۲}\\searrow\\text{۳)}} + C',
        definiteFormulaLatex:
          '\\int_{0}^{\\pi} x \\cos(nx)\\,dx = \\left[ \\frac{x\\sin(nx)}{n} + \\frac{\\cos(nx)}{n^2} \\right]_{0}^{\\pi} = \\frac{(-1)^n - 1}{n^2}',
      };

    case 'x3_sin_nx':
      return {
        patternId: 'x3_sin_nx',
        titleFa: 'انتگرال سه‌مرحله‌ای ∫ x³ sin(nx) dx (تسلط کامل بر ۴ قطر متوالی)',
        shortLabelFa: 'الگوی ۳: ∫ x³ sin(nx) dx (جدول ۵ سطری)',
        integrandLatex: '\\int x^3 \\sin(nx)\\,dx',
        uChoiceLatex: 'u = x^3 \\quad (\\text{ستون } D)',
        dvChoiceLatex: 'dv = \\sin(nx)\\,dx \\quad (\\text{ستون } I)',
        liateRuleFa:
          'برای توان سوم x³، روش معمولی مستلزم ۳ بار نوشتن فرمول جزء‌به‌جزء تو در تو است که احتمال خطای علامت بسیار بالایی دارد؛ اما با جدول ۵ سطری DI در چند ثانیه حل می‌شود.',
        whyRowOneIDoesNotMultiplyFa,
        rows: [
          {
            rowIndex: 1,
            sign: '+',
            dLatex: 'x^3',
            iLatex: '\\sin(nx)',
            dRoleFa: 'تابع اولیه u (مبدأ قطر اول ↘)',
            iRoleFa: 'تابع اولیه dv (ضرب نمی‌شود)',
          },
          {
            rowIndex: 2,
            sign: '-',
            dLatex: '3x^2',
            iLatex: '-\\frac{\\cos(nx)}{n}',
            dRoleFa: 'مشتق اول (مبدأ قطر دوم ↘)',
            iRoleFa: 'انتگرال اول (مقصد قطر اول ↘)',
          },
          {
            rowIndex: 3,
            sign: '+',
            dLatex: '6x',
            iLatex: '-\\frac{\\sin(nx)}{n^2}',
            dRoleFa: 'مشتق دوم (مبدأ قطر سوم ↘)',
            iRoleFa: 'انتگرال دوم (مقصد قطر دوم ↘)',
          },
          {
            rowIndex: 4,
            sign: '-',
            dLatex: '6',
            iLatex: '\\frac{\\cos(nx)}{n^3}',
            dRoleFa: 'مشتق سوم (مبدأ قطر چهارم ↘)',
            iRoleFa: 'انتگرال سوم (مقصد قطر سوم ↘)',
          },
          {
            rowIndex: 5,
            sign: '+',
            dLatex: '0',
            iLatex: '\\frac{\\sin(nx)}{n^4}',
            dRoleFa: 'مشتق چهارم = ۰ (توقف افقی ←)',
            iRoleFa: 'انتگرال چهارم (مقصد قطر چهارم ↘)',
          },
        ],
        diagonals: [
          {
            stepNumber: 1,
            fromRow: 1,
            toRow: 2,
            rowSign: '+',
            dTermLatex: 'x^3',
            iTermLatex: '-\\frac{\\cos(nx)}{n}',
            rawProductLatex: '(+1)\\cdot (x^3) \\cdot \\left(-\\frac{\\cos(nx)}{n}\\right)',
            simplifiedTermLatex: '-\\frac{x^3 \\cos(nx)}{n}',
            explanationFa: 'قطر اول (↘): سطر ۱ ستون D در سطر ۲ ستون I ضرب می‌شود.',
            badgeColor: '#0284C7',
          },
          {
            stepNumber: 2,
            fromRow: 2,
            toRow: 3,
            rowSign: '-',
            dTermLatex: '3x^2',
            iTermLatex: '-\\frac{\\sin(nx)}{n^2}',
            rawProductLatex: '(-1)\\cdot (3x^2) \\cdot \\left(-\\frac{\\sin(nx)}{n^2}\\right)',
            simplifiedTermLatex: '+\\frac{3x^2 \\sin(nx)}{n^2}',
            explanationFa: 'قطر دوم (↘): سطر ۲ ستون D (با علامت -) در سطر ۳ ستون I ضرب می‌شود.',
            badgeColor: '#059669',
          },
          {
            stepNumber: 3,
            fromRow: 3,
            toRow: 4,
            rowSign: '+',
            dTermLatex: '6x',
            iTermLatex: '\\frac{\\cos(nx)}{n^3}',
            rawProductLatex: '(+1)\\cdot (6x) \\cdot \\left(\\frac{\\cos(nx)}{n^3}\\right)',
            simplifiedTermLatex: '+\\frac{6x \\cos(nx)}{n^3}',
            explanationFa: 'قطر سوم (↘): سطر ۳ ستون D (با علامت +) در سطر ۴ ستون I ضرب می‌شود.',
            badgeColor: '#D97706',
          },
          {
            stepNumber: 4,
            fromRow: 4,
            toRow: 5,
            rowSign: '-',
            dTermLatex: '6',
            iTermLatex: '\\frac{\\sin(nx)}{n^4}',
            rawProductLatex: '(-1)\\cdot (6) \\cdot \\left(\\frac{\\sin(nx)}{n^4}\\right)',
            simplifiedTermLatex: '-\\frac{6 \\sin(nx)}{n^4}',
            explanationFa: 'قطر چهارم (↘): سطر ۴ ستون D (با علامت -) در سطر ۵ ستون I ضرب می‌شود.',
            badgeColor: '#7C3AED',
          },
        ],
        horizontalRemainder: {
          rowIndex: 5,
          rowSign: '+',
          isZero: true,
          dLastLatex: '0',
          iLastLatex: '\\frac{\\sin(nx)}{n^4}',
          integralLatex: '+ \\int (0) \\cdot \\left(\\frac{\\sin(nx)}{n^4}\\right)dx = 0',
          explanationFa: 'در سطر ۵ ستون مشتق به ۰ رسیده و انتگرال افقی باقیمانده صفر می‌شود.',
        },
        indefiniteFormulaLatex:
          '\\int x^3 \\sin(nx)\\,dx = -\\frac{x^3\\cos(nx)}{n} + \\frac{3x^2\\sin(nx)}{n^2} + \\frac{6x\\cos(nx)}{n^3} - \\frac{6\\sin(nx)}{n^4} + C',
        definiteFormulaLatex:
          '\\int_{-\\pi}^{\\pi} x^3 \\sin(nx)\\,dx = 2(-1)^{n+1}\\left(\\frac{\\pi^3}{n} - \\frac{6\\pi}{n^3}\\right)',
      };

    case 'exp_cos_cyclic':
      return {
        patternId: 'exp_cos_cyclic',
        titleFa: 'انتگرال بازگشتی ∫ e^{-ax} cos(αx) dx (قانون توقف افقی در سطر آخر!)',
        shortLabelFa: 'الگوی ۴ (بازگشتی): ∫ e^{-ax} cos(αx) dx',
        integrandLatex: 'I = \\int e^{-ax} \\cos(\\alpha x)\\,dx',
        uChoiceLatex: 'u = \\cos(\\alpha x) \\quad (\\text{ستون } D)',
        dvChoiceLatex: 'dv = e^{-ax}\\,dx \\quad (\\text{ستون } I)',
        liateRuleFa:
          'در اینجا هیچ‌یک از دو تابع با مشتق‌گیری صفر نمی‌شوند! اما پس از ۲ بار مشتق‌گیری از cos(αx)، دوباره به خودِ cos(αx) برمی‌گردیم؛ بنابراین در سطر ۳ توقف کرده و از قانون ضرب افقی زیر نماد انتگرال استفاده می‌کنیم.',
        whyRowOneIDoesNotMultiplyFa,
        rows: [
          {
            rowIndex: 1,
            sign: '+',
            dLatex: '\\cos(\\alpha x)',
            iLatex: 'e^{-ax}',
            dRoleFa: 'تابع اولیه u (مبدأ قطر اول ↘)',
            iRoleFa: 'تابع اولیه dv (ضرب نمی‌شود)',
          },
          {
            rowIndex: 2,
            sign: '-',
            dLatex: '-\\alpha\\sin(\\alpha x)',
            iLatex: '-\\frac{1}{a}e^{-ax}',
            dRoleFa: 'مشتق اول u\' (مبدأ قطر دوم ↘)',
            iRoleFa: 'انتگرال اول v₁ (مقصد قطر اول ↘)',
          },
          {
            rowIndex: 3,
            sign: '+',
            dLatex: '-\\alpha^2\\cos(\\alpha x)',
            iLatex: '\\frac{1}{a^2}e^{-ax}',
            dRoleFa: 'تکرار کسینوس! توقف و ضرب افقی (←) در سطر ۳',
            iRoleFa: 'انتگرال دوم v₂ (مقصد قطر دوم ↘ و ضرب افقی ←)',
          },
        ],
        diagonals: [
          {
            stepNumber: 1,
            fromRow: 1,
            toRow: 2,
            rowSign: '+',
            dTermLatex: '\\cos(\\alpha x)',
            iTermLatex: '-\\frac{1}{a}e^{-ax}',
            rawProductLatex: '(+1)\\cdot \\cos(\\alpha x) \\cdot \\left(-\\frac{1}{a}e^{-ax}\\right)',
            simplifiedTermLatex: '-\\frac{1}{a}e^{-ax}\\cos(\\alpha x)',
            explanationFa: 'قطر اول (↘): سطر ۱ ستون D در سطر ۲ ستون I ضرب می‌شود.',
            badgeColor: '#0284C7',
          },
          {
            stepNumber: 2,
            fromRow: 2,
            toRow: 3,
            rowSign: '-',
            dTermLatex: '-\\alpha\\sin(\\alpha x)',
            iTermLatex: '\\frac{1}{a^2}e^{-ax}',
            rawProductLatex: '(-1)\\cdot (-\\alpha\\sin(\\alpha x)) \\cdot \\left(\\frac{1}{a^2}e^{-ax}\\right)',
            simplifiedTermLatex: '+\\frac{\\alpha}{a^2}e^{-ax}\\sin(\\alpha x)',
            explanationFa: 'قطر دوم (↘): سطر ۲ ستون D (با علامت -) در سطر ۳ ستون I ضرب می‌شود.',
            badgeColor: '#059669',
          },
        ],
        horizontalRemainder: {
          rowIndex: 3,
          rowSign: '+',
          isZero: false,
          dLastLatex: '-\\alpha^2\\cos(\\alpha x)',
          iLastLatex: '\\frac{1}{a^2}e^{-ax}',
          integralLatex:
            '+ \\int \\big(-\\alpha^2\\cos(\\alpha x)\\big)\\left(\\frac{1}{a^2}e^{-ax}\\right)dx = -\\frac{\\alpha^2}{a^2} \\underbrace{\\int e^{-ax}\\cos(\\alpha x)\\,dx}_{I} = -\\frac{\\alpha^2}{a^2} I',
          explanationFa:
            'چون سطر ۳ صفر نشده اما به فرم انتگرال اولیه بازگشته است، عناصر سطر ۳ را به صورت افقی (←) در هم ضرب کرده و زیر علامت انتگرال می‌گذاریم تا معادله جبری برحسب I تشکیل شود!',
        },
        indefiniteFormulaLatex:
          'I = -\\frac{e^{-ax}\\cos(\\alpha x)}{a} + \\frac{\\alpha e^{-ax}\\sin(\\alpha x)}{a^2} - \\frac{\\alpha^2}{a^2} I \\implies I\\left(1 + \\frac{\\alpha^2}{a^2}\\right) = \\frac{e^{-ax}(\\alpha\\sin(\\alpha x) - a\\cos(\\alpha x))}{a^2}',
        definiteFormulaLatex:
          '\\int_{0}^{\\infty} e^{-ax}\\cos(\\alpha x)\\,dx = \\frac{a}{a^2 + \\alpha^2} \\quad (a > 0)',
      };
  }
}

/**
 * Lesson 2 (Fourier Series Deep Dive): Complete Symbolic Derivation, Term-by-Term Expansion,
 * Dirichlet Jump Convergence Inspector, and Parseval Series Summation for each preset function.
 */
export interface DirichletPointAnalysis {
  pointLabelFa: string;
  pointLatex: string;
  leftLimitLatex: string;
  rightLimitLatex: string;
  averageSumLatex: string;
  resultingSeriesSumLatex: string;
}

export interface AnalyticalFourierSeriesDetails {
  presetId: PresetFunctionId;
  titleFa: string;
  functionDefinitionLatex: string;
  symmetryTypeFa: string;
  symmetryReasonFa: string;
  a0DerivationLatex: string;
  anDerivationLatex: string;
  bnDerivationLatex: string;
  closedFormSeriesLatex: string;
  expandedFirstTermsLatex: string;
  dirichletConvergencePoints: DirichletPointAnalysis[];
  parsevalApplicationLatex: string;
  decayOrderNoteFa: string;
}

export function getAnalyticalFourierSeriesDetails(
  presetId: PresetFunctionId
): AnalyticalFourierSeriesDetails {
  switch (presetId) {
    case 'square':
      return {
        presetId: 'square',
        titleFa: 'موج مربعی متناوب (مثال ۱۲ جزوه - تابع پله‌ای علامت)',
        functionDefinitionLatex:
          'f(x) = \\begin{cases} -1, & -\\ell < x < 0 \\\\ +1, & 0 < x < \\ell \\end{cases}, \\quad f(x + 2\\ell) = f(x)',
        symmetryTypeFa: 'تابع فرد (Odd Function)',
        symmetryReasonFa:
          'چون در نیم‌بازه منفی مقدار $-1$ و در نیم‌بازه مثبت مقدار $+1$ دارد، رابطه $f(-x) = -f(x)$ برقرار است؛ بنابراین انتگرال‌های ضرایب زوج ($a_0$ و $a_n$) روی بازه متقارن $[-\\ell, \\ell]$ دقیقاً صفر می‌شوند و فقط ضرایب سینوسی $b_n$ باقی می‌مانند.',
        a0DerivationLatex:
          'a_0 = \\frac{1}{\\ell}\\int_{-\\ell}^{\\ell} f(x)\\,dx = \\frac{1}{\\ell}\\left[ \\int_{-\\ell}^{0} (-1)\\,dx + \\int_{0}^{\\ell} (+1)\\,dx \\right] = \\frac{1}{\\ell}\\big[ -\\ell + \\ell \\big] = 0',
        anDerivationLatex:
          'a_n = \\frac{1}{\\ell}\\int_{-\\ell}^{\\ell} \\underbrace{f(x)}_{\\text{Odd}} \\cdot \\underbrace{\\cos\\left(\\frac{n\\pi x}{\\ell}\\right)}_{\\text{Even}}\\,dx = 0 \\quad (\\forall n \\ge 1)',
        bnDerivationLatex:
          'b_n = \\frac{2}{\\ell}\\int_{0}^{\\ell} (1)\\sin\\left(\\frac{n\\pi x}{\\ell}\\right)dx = \\frac{2}{\\ell}\\left[ -\\frac{\\ell}{n\\pi}\\cos\\left(\\frac{n\\pi x}{\\ell}\\right) \\right]_{0}^{\\ell} = \\frac{2\\big(1 - (-1)^n\\big)}{n\\pi} = \\begin{cases} \\frac{4}{n\\pi}, & n=2k-1 \\\\ 0, & n=2k \\end{cases}',
        closedFormSeriesLatex:
          'f(x) \\sim \\frac{4}{\\pi} \\sum_{k=1}^{\\infty} \\frac{1}{2k-1} \\sin\\left(\\frac{(2k-1)\\pi x}{\\ell}\\right)',
        expandedFirstTermsLatex:
          'f(x) \\sim \\frac{4}{\\pi}\\left[ \\sin\\left(\\frac{\\pi x}{\\ell}\\right) + \\frac{1}{3}\\sin\\left(\\frac{3\\pi x}{\\ell}\\right) + \\frac{1}{5}\\sin\\left(\\frac{5\\pi x}{\\ell}\\right) + \\frac{1}{7}\\sin\\left(\\frac{7\\pi x}{\\ell}\\right) + \\cdots \\right]',
        dirichletConvergencePoints: [
          {
            pointLabelFa: 'نقطه پرش میانی ($x_0 = 0$)',
            pointLatex: 'x_0 = 0',
            leftLimitLatex: 'f(0^-) = -1',
            rightLimitLatex: 'f(0^+) = +1',
            averageSumLatex: 'S(0) = \\frac{f(0^+) + f(0^-)}{2} = 0',
            resultingSeriesSumLatex: '\\frac{4}{\\pi}\\sum_{k=1}^{\\infty} \\frac{\\sin(0)}{2k-1} = 0',
          },
          {
            pointLabelFa: 'نقطه پیوستگی میانی ($x_0 = \\frac{\\ell}{2}$) — استخراج فرمول لایبنیتس برای $\\frac{\\pi}{4}$',
            pointLatex: 'x_0 = \\frac{\\ell}{2}',
            leftLimitLatex: 'f(\\frac{\\ell}{2}^-) = +1',
            rightLimitLatex: 'f(\\frac{\\ell}{2}^+) = +1',
            averageSumLatex: 'S\\left(\\frac{\\ell}{2}\\right) = 1',
            resultingSeriesSumLatex:
              '1 = \\frac{4}{\\pi}\\left(1 - \\frac{1}{3} + \\frac{1}{5} - \\frac{1}{7} + \\cdots\\right) \\implies \\sum_{k=1}^{\\infty} \\frac{(-1)^{k-1}}{2k-1} = \\frac{\\pi}{4}',
          },
          {
            pointLabelFa: 'نقطه مرزی ناپیوسته ($x_0 = \\ell$)',
            pointLatex: 'x_0 = \\ell',
            leftLimitLatex: 'f(\\ell^-) = +1',
            rightLimitLatex: 'f(-\\ell^+) = -1',
            averageSumLatex: 'S(\\ell) = \\frac{1 + (-1)}{2} = 0',
            resultingSeriesSumLatex: 'S(\\ell) = 0 \\quad (\\text{Gibbs Overshoot } \\approx 9\\%)',
          },
        ],
        parsevalApplicationLatex:
          '\\begin{aligned} \\frac{1}{\\ell}\\int_{-\\ell}^{\\ell} |f(x)|^2\\,dx &= 2 = \\sum_{k=1}^{\\infty} \\left(\\frac{4}{(2k-1)\\pi}\\right)^2 \\\\ \\implies \\frac{16}{\\pi^2}\\sum_{k=1}^{\\infty}\\frac{1}{(2k-1)^2} &= 2 \\implies \\sum_{k=1}^{\\infty}\\frac{1}{(2k-1)^2} = \\frac{\\pi^2}{8} \\end{aligned}',
        decayOrderNoteFa:
          'چون تابع موج مربعی دارای پرش ناپیوستگی است، ضرایب آن با سرعت کندِ $\\mathcal{O}(1/n)$ میرا می‌شوند و در نقاط پرش پدیده گیبس مشاهده می‌شود.',
      };

    case 'abs_x':
      return {
        presetId: 'abs_x',
        titleFa: 'تابع قدرمطلق متناوب $f(x) = |x|$ (مثال ۹ و ۱۶ جزوه)',
        functionDefinitionLatex:
          'f(x) = |x| = \\begin{cases} -x, & -\\ell \\le x < 0 \\\\ x, & 0 \\le x \\le \\ell \\end{cases}, \\quad f(x + 2\\ell) = f(x)',
        symmetryTypeFa: 'تابع زوج و پیوسته (Even & Continuous)',
        symmetryReasonFa:
          'چون $|-x| = |x|$، تابع روی بازه متقارن $[-\\ell, \\ell]$ زوج است؛ لذا ضرایب سینوسی همگی صفرند ($b_n = 0$) و سری فوریه صرفاً کسینوسی است. همچنین در مرزهای تناوب $f(-\\ell) = f(\\ell) = \\ell$ پیوسته است.',
        a0DerivationLatex:
          'a_0 = \\frac{2}{\\ell}\\int_{0}^{\\ell} x\\,dx = \\frac{2}{\\ell}\\left[ \\frac{x^2}{2} \\right]_{0}^{\\ell} = \\ell \\implies \\frac{a_0}{2} = \\frac{\\ell}{2}',
        anDerivationLatex:
          'a_n = \\frac{2}{\\ell}\\int_{0}^{\\ell} x\\cos\\left(\\frac{n\\pi x}{\\ell}\\right)dx = \\frac{2\\ell\\big((-1)^n - 1\\big)}{n^2\\pi^2} = \\begin{cases} -\\frac{4\\ell}{(2k-1)^2\\pi^2}, & n=2k-1 \\\\ 0, & n=2k \\end{cases}',
        bnDerivationLatex:
          'b_n = \\frac{1}{\\ell}\\int_{-\\ell}^{\\ell} \\underbrace{|x|}_{\\text{Even}} \\cdot \\underbrace{\\sin\\left(\\frac{n\\pi x}{\\ell}\\right)}_{\\text{Odd}}\\,dx = 0 \\quad (\\forall n \\ge 1)',
        closedFormSeriesLatex:
          '|x| = \\frac{\\ell}{2} - \\frac{4\\ell}{\\pi^2} \\sum_{k=1}^{\\infty} \\frac{1}{(2k-1)^2} \\cos\\left(\\frac{(2k-1)\\pi x}{\\ell}\\right)',
        expandedFirstTermsLatex:
          '|x| = \\frac{\\ell}{2} - \\frac{4\\ell}{\\pi^2}\\left[ \\cos\\left(\\frac{\\pi x}{\\ell}\\right) + \\frac{1}{9}\\cos\\left(\\frac{3\\pi x}{\\ell}\\right) + \\frac{1}{25}\\cos\\left(\\frac{5\\pi x}{\\ell}\\right) + \\cdots \\right]',
        dirichletConvergencePoints: [
          {
            pointLabelFa: 'مبدأ مختصات ($x_0 = 0$) — استخراج مجموع $\\sum \\frac{1}{(2k-1)^2} = \\frac{\\pi^2}{8}$',
            pointLatex: 'x_0 = 0',
            leftLimitLatex: 'f(0^-) = 0',
            rightLimitLatex: 'f(0^+) = 0',
            averageSumLatex: 'S(0) = f(0) = 0',
            resultingSeriesSumLatex:
              '0 = \\frac{\\ell}{2} - \\frac{4\\ell}{\\pi^2}\\sum_{k=1}^{\\infty}\\frac{1}{(2k-1)^2} \\implies \\sum_{k=1}^{\\infty}\\frac{1}{(2k-1)^2} = \\frac{\\pi^2}{8}',
          },
          {
            pointLabelFa: 'مرز بازه ($x_0 = \\ell$)',
            pointLatex: 'x_0 = \\ell',
            leftLimitLatex: 'f(\\ell^-) = \\ell',
            rightLimitLatex: 'f(-\\ell^+) = \\ell',
            averageSumLatex: 'S(\\ell) = \\ell',
            resultingSeriesSumLatex:
              '\\ell = \\frac{\\ell}{2} + \\frac{4\\ell}{\\pi^2}\\sum_{k=1}^{\\infty}\\frac{1}{(2k-1)^2} = \\frac{\\ell}{2} + \\frac{\\ell}{2} = \\ell',
          },
        ],
        parsevalApplicationLatex:
          '\\begin{aligned} \\frac{1}{\\ell}\\int_{-\\ell}^{\\ell} x^2\\,dx &= \\frac{2\\ell^2}{3} = \\frac{\\ell^2}{2} + \\sum_{k=1}^{\\infty}\\frac{16\\ell^2}{(2k-1)^4\\pi^4} \\\\ \\implies \\frac{16}{\\pi^4}\\sum_{k=1}^{\\infty}\\frac{1}{(2k-1)^4} &= \\frac{1}{6} \\implies \\sum_{k=1}^{\\infty}\\frac{1}{(2k-1)^4} = \\frac{\\pi^4}{96} \\end{aligned}',
        decayOrderNoteFa:
          'چون خودِ تابع $f(x)=|x|$ در تمام نقاط و مرزها پیوسته است اما مشتق اول آن در $x=0$ پرش دارد، ضرایب فوریه با سرعت سریعِ $\\mathcal{O}(1/n^2)$ کاهش می‌یابند.',
      };

    case 'sawtooth':
      return {
        presetId: 'sawtooth',
        titleFa: 'موج دندان‌اره‌ای $f(x) = x/\\ell$ (مثال ۷ جزوه)',
        functionDefinitionLatex:
          'f(x) = \\frac{x}{\\ell} \\quad (-\\ell < x < \\ell), \\quad f(x + 2\\ell) = f(x)',
        symmetryTypeFa: 'تابع فرد (Odd Function)',
        symmetryReasonFa:
          'چون $f(-x) = -x/\\ell = -f(x)$، تابع روی بازه متقارن $[-\\ell, \\ell]$ فرد است؛ بنابراین تمام ضرایب کسینوسی صفر می‌شوند ($a_0 = 0$ و $a_n = 0$) و سری فوریه صرفاً سینوسی است.',
        a0DerivationLatex:
          'a_0 = \\frac{1}{\\ell}\\int_{-\\ell}^{\\ell} \\frac{x}{\\ell}\\,dx = 0',
        anDerivationLatex:
          'a_n = \\frac{1}{\\ell}\\int_{-\\ell}^{\\ell} \\underbrace{\\frac{x}{\\ell}}_{\\text{Odd}} \\cdot \\underbrace{\\cos\\left(\\frac{n\\pi x}{\\ell}\\right)}_{\\text{Even}}\\,dx = 0 \\quad (\\forall n \\ge 1)',
        bnDerivationLatex:
          'b_n = \\frac{2}{\\ell}\\int_{0}^{\\ell} \\frac{x}{\\ell}\\sin\\left(\\frac{n\\pi x}{\\ell}\\right)dx = \\frac{2}{\\ell^2}\\left[ -\\frac{\\ell x}{n\\pi}\\cos\\left(\\frac{n\\pi x}{\\ell}\\right) + \\left(\\frac{\\ell}{n\\pi}\\right)^2\\sin\\left(\\frac{n\\pi x}{\\ell}\\right) \\right]_{0}^{\\ell} = \\frac{2(-1)^{n+1}}{n\\pi}',
        closedFormSeriesLatex:
          '\\frac{x}{\\ell} \\sim \\frac{2}{\\pi} \\sum_{n=1}^{\\infty} \\frac{(-1)^{n+1}}{n} \\sin\\left(\\frac{n\\pi x}{\\ell}\\right) \\quad (-\\ell < x < \\ell)',
        expandedFirstTermsLatex:
          '\\frac{x}{\\ell} \\sim \\frac{2}{\\pi}\\left[ \\sin\\left(\\frac{\\pi x}{\\ell}\\right) - \\frac{1}{2}\\sin\\left(\\frac{2\\pi x}{\\ell}\\right) + \\frac{1}{3}\\sin\\left(\\frac{3\\pi x}{\\ell}\\right) - \\frac{1}{4}\\sin\\left(\\frac{4\\pi x}{\\ell}\\right) + \\cdots \\right]',
        dirichletConvergencePoints: [
          {
            pointLabelFa: 'نقطه میانی پیوسته ($x_0 = \\frac{\\ell}{2}$) — سری لایبنیتس $\\frac{\\pi}{4}$',
            pointLatex: 'x_0 = \\frac{\\ell}{2}',
            leftLimitLatex: 'f(\\frac{\\ell}{2}^-) = \\frac{1}{2}',
            rightLimitLatex: 'f(\\frac{\\ell}{2}^+) = \\frac{1}{2}',
            averageSumLatex: 'S\\left(\\frac{\\ell}{2}\\right) = \\frac{1}{2}',
            resultingSeriesSumLatex:
              '\\frac{1}{2} = \\frac{2}{\\pi}\\left(1 - \\frac{1}{3} + \\frac{1}{5} - \\frac{1}{7} + \\cdots\\right) \\implies 1 - \\frac{1}{3} + \\frac{1}{5} - \\cdots = \\frac{\\pi}{4}',
          },
          {
            pointLabelFa: 'نقطه مرزی پرش ($x_0 = \\pm\\ell$)',
            pointLatex: 'x_0 = \\ell',
            leftLimitLatex: 'f(\\ell^-) = +1',
            rightLimitLatex: 'f(-\\ell^+) = -1',
            averageSumLatex: 'S(\\ell) = \\frac{1 + (-1)}{2} = 0',
            resultingSeriesSumLatex:
              'S(\\pm\\ell) = \\frac{2}{\\pi}\\sum_{n=1}^{\\infty}\\frac{(-1)^{n+1}}{n}\\sin(\\pm n\\pi) = 0 \\neq f(\\ell)',
          },
        ],
        parsevalApplicationLatex:
          '\\begin{aligned} \\frac{1}{\\ell}\\int_{-\\ell}^{\\ell} \\left(\\frac{x}{\\ell}\\right)^2 dx &= \\frac{2}{3} = \\sum_{n=1}^{\\infty} b_n^2 = \\frac{4}{\\pi^2}\\sum_{n=1}^{\\infty}\\frac{1}{n^2} \\\\ \\implies \\sum_{n=1}^{\\infty}\\frac{1}{n^2} &= 1 + \\frac{1}{4} + \\frac{1}{9} + \\cdots = \\frac{\\pi^2}{6} \\end{aligned}',
        decayOrderNoteFa:
          'اگرچه تابع $f(x)=x/\\ell$ در درون بازه $(-\\ell, \\ell)$ پیوسته است، اما توسیع متناوب آن در مرزهای $x = \\pm\\ell$ دارای پرش از $+1$ به $-1$ است؛ لذا ضرایب با مرتبه $\\mathcal{O}(1/n)$ کاهش می‌یابند.',
      };

    case 'parabola':
      return {
        presetId: 'parabola',
        titleFa: 'تابع سهمی متناوب $f(x) = x^2$ (حل المسائل و اثبات مسأله بازل)',
        functionDefinitionLatex:
          'f(x) = x^2 \\quad (-\\pi \\le x \\le \\pi), \\qquad f(x + 2\\pi) = f(x)',
        symmetryTypeFa: 'تابع زوج و پیوسته در مرزها (Even & Continuous)',
        symmetryReasonFa:
          'چون $(-x)^2 = x^2$، تابع زوج است؛ لذا ضرایب سینوسی $b_n = 0$ هستند. همچنین در مرزهای تناوب $f(-\\pi) = f(\\pi) = \\pi^2$ پیوسته است و هیچ پرشی در مرز ندارد.',
        a0DerivationLatex:
          'a_0 = \\frac{2}{\\pi}\\int_{0}^{\\pi} x^2\\,dx = \\frac{2}{\\pi}\\left[ \\frac{x^3}{3} \\right]_{0}^{\\pi} = \\frac{2\\pi^2}{3} \\implies \\frac{a_0}{2} = \\frac{\\pi^2}{3}',
        anDerivationLatex:
          'a_n = \\frac{2}{\\pi}\\int_{0}^{\\pi} x^2\\cos(nx)\\,dx \\xrightarrow{\\text{Tabular DI}} \\frac{2}{\\pi}\\left[ \\frac{x^2\\sin(nx)}{n} + \\frac{2x\\cos(nx)}{n^2} - \\frac{2\\sin(nx)}{n^3} \\right]_{0}^{\\pi} = \\frac{2}{\\pi}\\left( 0 + \\frac{2\\pi\\cos(n\\pi)}{n^2} - 0 \\right) = \\frac{4(-1)^n}{n^2}',
        bnDerivationLatex:
          'b_n = \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} \\underbrace{x^2}_{\\text{Even}} \\cdot \\underbrace{\\sin(nx)}_{\\text{Odd}}\\,dx = 0 \\quad (\\forall n \\ge 1)',
        closedFormSeriesLatex:
          'x^2 = \\frac{\\pi^2}{3} + 4 \\sum_{n=1}^{\\infty} \\frac{(-1)^n}{n^2} \\cos\\left(\\frac{n\\pi x}{\\ell}\\right) \\quad (-\\ell \\le x \\le \\ell)',
        expandedFirstTermsLatex:
          'x^2 = \\frac{\\pi^2}{3} - 4\\left[ \\cos\\left(\\frac{\\pi x}{\\ell}\\right) - \\frac{1}{4}\\cos\\left(\\frac{2\\pi x}{\\ell}\\right) + \\frac{1}{9}\\cos\\left(\\frac{3\\pi x}{\\ell}\\right) - \\frac{1}{16}\\cos\\left(\\frac{4\\pi x}{\\ell}\\right) + \\cdots \\right]',
        dirichletConvergencePoints: [
          {
            pointLabelFa: 'مبدأ مختصات ($x_0 = 0$) — استخراج مجموع سری متناوب $\\sum \\frac{(-1)^{n+1}}{n^2} = \\frac{\\pi^2}{12}$',
            pointLatex: 'x_0 = 0',
            leftLimitLatex: 'f(0^-) = 0',
            rightLimitLatex: 'f(0^+) = 0',
            averageSumLatex: 'S(0) = 0',
            resultingSeriesSumLatex:
              '0 = \\frac{\\pi^2}{3} + 4\\sum_{n=1}^{\\infty}\\frac{(-1)^n}{n^2} \\implies \\sum_{n=1}^{\\infty}\\frac{(-1)^{n+1}}{n^2} = 1 - \\frac{1}{4} + \\frac{1}{9} - \\frac{1}{16} + \\cdots = \\frac{\\pi^2}{12}',
          },
          {
            pointLabelFa: 'مرز بازه ($x_0 = \\pi$) — استخراج مستقیم مسأله بازل $\\sum \\frac{1}{n^2} = \\frac{\\pi^2}{6}$',
            pointLatex: 'x_0 = \\pi',
            leftLimitLatex: 'f(\\pi^-) = \\pi^2',
            rightLimitLatex: 'f(-\\pi^+) = \\pi^2',
            averageSumLatex: 'S(\\pi) = \\frac{\\pi^2 + \\pi^2}{2} = \\pi^2',
            resultingSeriesSumLatex:
              '\\pi^2 = \\frac{\\pi^2}{3} + 4\\sum_{n=1}^{\\infty}\\frac{(-1)^n \\cos(n\\pi)}{n^2} = \\frac{\\pi^2}{3} + 4\\sum_{n=1}^{\\infty}\\frac{1}{n^2} \\implies \\sum_{n=1}^{\\infty}\\frac{1}{n^2} = \\frac{\\pi^2}{6}',
          },
        ],
        parsevalApplicationLatex:
          '\\begin{aligned} \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} x^4\\,dx &= \\frac{2\\pi^4}{5} = \\frac{a_0^2}{2} + \\sum_{n=1}^{\\infty} a_n^2 = \\frac{2\\pi^4}{9} + 16\\sum_{n=1}^{\\infty}\\frac{1}{n^4} \\\\ \\implies 16\\sum_{n=1}^{\\infty}\\frac{1}{n^4} &= \\left(\\frac{2}{5}-\\frac{2}{9}\\right)\\pi^4 = \\frac{8\\pi^4}{45} \\implies \\sum_{n=1}^{\\infty}\\frac{1}{n^4} = \\frac{\\pi^4}{90} \\end{aligned}',
        decayOrderNoteFa:
          'چون $f(-\\pi)=f(\\pi)$ پیوسته است، ضرایب از مرتبه $\\mathcal{O}(1/n^2)$ هستند و سری فوریه $x^2$ را می‌توان جمله‌به‌جمله مشتق گرفت تا سری فوریه $f\'(x)=2x$ به دست آید!',
      };

    case 'piecewise_pdf_ex6':
      return {
        presetId: 'piecewise_pdf_ex6',
        titleFa: 'تابع دوضابطه‌ای مثال ۶ جزوه (صفحه ۲۳ - نه زوج و نه فرد)',
        functionDefinitionLatex:
          'f(x) = \\begin{cases} 0, & -\\ell \\le x < 0 \\\\ \\frac{\\ell - x}{\\ell}, & 0 \\le x < \\ell \\end{cases}',
        symmetryTypeFa: 'نه زوج و نه فرد (General Asymmetric Function)',
        symmetryReasonFa:
          'چون تابع در نیم‌بازه منفی صفر و در نیم‌بازه مثبت خطی است، نه تقارن محوری دارد و نه تقارن مرکزی؛ بنابراین هر سه دسته ضرایب $a_0$، $a_n$ و $b_n$ غیرصفر هستند و انتگرال‌گیری فقط روی $[0, \\ell]$ انجام می‌شود.',
        a0DerivationLatex:
          'a_0 = \\frac{1}{\\ell}\\int_{0}^{\\ell} \\frac{\\ell - x}{\\ell}\\,dx = \\frac{1}{\\ell^2}\\left[ \\ell x - \\frac{x^2}{2} \\right]_{0}^{\\ell} = \\frac{1}{2} \\implies \\frac{a_0}{2} = \\frac{1}{4}',
        anDerivationLatex:
          'a_n = \\frac{1}{\\ell}\\int_{0}^{\\ell} \\frac{\\ell - x}{\\ell}\\cos\\left(\\frac{n\\pi x}{\\ell}\\right)dx = \\frac{1 - (-1)^n}{n^2\\pi^2} = \\begin{cases} \\frac{2}{(2k-1)^2\\pi^2}, & n=2k-1 \\\\ 0, & n=2k \\end{cases}',
        bnDerivationLatex:
          'b_n = \\frac{1}{\\ell}\\int_{0}^{\\ell} \\frac{\\ell - x}{\\ell}\\sin\\left(\\frac{n\\pi x}{\\ell}\\right)dx = \\frac{1}{n\\pi}',
        closedFormSeriesLatex:
          'f(x) \\sim \\frac{1}{4} + \\sum_{n=1}^{\\infty} \\left[ \\frac{1 - (-1)^n}{n^2\\pi^2}\\cos\\left(\\frac{n\\pi x}{\\ell}\\right) + \\frac{1}{n\\pi}\\sin\\left(\\frac{n\\pi x}{\\ell}\\right) \\right]',
        expandedFirstTermsLatex:
          'f(x) \\sim \\frac{1}{4} + \\frac{2}{\\pi^2}\\left[ \\cos\\frac{\\pi x}{\\ell} + \\frac{1}{9}\\cos\\frac{3\\pi x}{\\ell} + \\cdots \\right] + \\frac{1}{\\pi}\\left[ \\sin\\frac{\\pi x}{\\ell} + \\frac{1}{2}\\sin\\frac{2\\pi x}{\\ell} + \\cdots \\right]',
        dirichletConvergencePoints: [
          {
            pointLabelFa: 'نقطه ناپیوستگی در مبدأ ($x_0 = 0$) — استخراج $\\sum \\frac{1}{(2k-1)^2} = \\frac{\\pi^2}{8}$',
            pointLatex: 'x_0 = 0',
            leftLimitLatex: 'f(0^-) = 0',
            rightLimitLatex: 'f(0^+) = 1',
            averageSumLatex: 'S(0) = \\frac{1 + 0}{2} = \\frac{1}{2}',
            resultingSeriesSumLatex:
              '\\frac{1}{2} = \\frac{1}{4} + \\frac{2}{\\pi^2}\\sum_{k=1}^{\\infty}\\frac{1}{(2k-1)^2} \\implies \\sum_{k=1}^{\\infty}\\frac{1}{(2k-1)^2} = \\frac{\\pi^2}{8}',
          },
          {
            pointLabelFa: 'نقطه مرزی پیوسته ($x_0 = \\pm\\ell$)',
            pointLatex: 'x_0 = \\ell',
            leftLimitLatex: 'f(\\ell^-) = 0',
            rightLimitLatex: 'f(-\\ell^+) = 0',
            averageSumLatex: 'S(\\ell) = 0',
            resultingSeriesSumLatex:
              'S(\\ell) = \\frac{1}{4} - \\frac{2}{\\pi^2}\\left(\\frac{\\pi^2}{8}\\right) = 0',
          },
        ],
        parsevalApplicationLatex:
          '\\begin{aligned} \\frac{1}{\\ell}\\int_{0}^{\\ell}\\left(1 - \\frac{x}{\\ell}\\right)^2 dx &= \\frac{1}{3} = \\frac{a_0^2}{2} + \\sum_{k=1}^{\\infty}\\frac{4}{(2k-1)^4\\pi^4} + \\sum_{n=1}^{\\infty}\\frac{1}{n^2\\pi^2} \\\\ &= \\frac{1}{8} + \\frac{1}{24} + \\frac{1}{6} = \\frac{1}{3} \\end{aligned}',
        decayOrderNoteFa:
          'بخش زوجِ این تابع پیوسته است (ضرایب کسینوسی $a_n$ از مرتبه $1/n^2$ هستند)، اما بخش فردِ آن در $x=0$ پرش دارد (ضرایب سینوسی $b_n$ از مرتبه $1/n$ هستند)!',
      };

    case 'x_plus_sin':
      return {
        presetId: 'x_plus_sin',
        titleFa: 'تابع ترکیبی $f(x) = x + \\sin(x)$ (مثال ۸ جزوه - ترکیب خطی و تعامد)',
        functionDefinitionLatex:
          'f(x) = \\frac{\\pi x}{\\ell} + \\sin\\left(\\frac{\\pi x}{\\ell}\\right) \\quad (-\\ell < x < \\ell)',
        symmetryTypeFa: 'تابع فرد (Odd Function)',
        symmetryReasonFa:
          'مجموع دو تابع فرد ($x$ و $\\sin x$) یک تابع فرد است؛ بنابراین $a_0 = 0$ و $a_n = 0$. نکته کلیدی این مثال استفاده از خاصیت تعامد برای جمله $\\sin(\\pi x/\\ell)$ است که فقط در هارمونیک اول ($n=1$) ظاهر می‌شود!',
        a0DerivationLatex:
          'a_0 = \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} (x + \\sin x)\\,dx = 0 \\implies \\frac{a_0}{2} = 0',
        anDerivationLatex:
          'a_n = \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} \\underbrace{(x + \\sin x)}_{\\text{Odd}}\\cdot\\underbrace{\\cos(nx)}_{\\text{Even}}\\,dx = 0 \\quad (\\forall n \\ge 1)',
        bnDerivationLatex:
          'b_n = \\underbrace{\\frac{2}{\\pi}\\int_{0}^{\\pi} x\\sin(nx)\\,dx}_{\\frac{2(-1)^{n+1}}{n}} + \\underbrace{\\frac{2}{\\pi}\\int_{0}^{\\pi} \\sin(x)\\sin(nx)\\,dx}_{\\delta_{n,1}} = \\begin{cases} 2 + 1 = 3, & n = 1 \\\\ \\frac{2(-1)^{n+1}}{n}, & n \\ge 2 \\end{cases}',
        closedFormSeriesLatex:
          'x + \\sin(x) \\sim 3\\sin(x) + 2\\sum_{n=2}^{\\infty} \\frac{(-1)^{n+1}}{n}\\sin(nx)',
        expandedFirstTermsLatex:
          'x + \\sin(x) \\sim 3\\sin\\left(\\frac{\\pi x}{\\ell}\\right) - \\sin\\left(\\frac{2\\pi x}{\\ell}\\right) + \\frac{2}{3}\\sin\\left(\\frac{3\\pi x}{\\ell}\\right) - \\frac{1}{2}\\sin\\left(\\frac{4\\pi x}{\\ell}\\right) + \\cdots',
        dirichletConvergencePoints: [
          {
            pointLabelFa: 'مرز بازه ($x_0 = \\pi$)',
            pointLatex: 'x_0 = \\pi',
            leftLimitLatex: 'f(\\pi^-) = \\pi',
            rightLimitLatex: 'f(-\\pi^+) = -\\pi',
            averageSumLatex: 'S(\\pi) = \\frac{\\pi + (-\\pi)}{2} = 0',
            resultingSeriesSumLatex: 'S(\\pi) = 0',
          },
        ],
        parsevalApplicationLatex:
          '\\begin{aligned} \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} (x + \\sin x)^2\\,dx &= b_1^2 + \\sum_{n=2}^{\\infty} b_n^2 = 9 + 4\\sum_{n=2}^{\\infty}\\frac{1}{n^2} \\\\ &= 9 + 4\\left(\\frac{\\pi^2}{6} - 1\\right) = \\frac{2\\pi^2}{3} + 5 \\end{aligned}',
        decayOrderNoteFa:
          'چون جمله $\\sin(x)$ خودش یکی از پایه‌های متعامد فوریه است، سری فوریه آن دقیقاً خودش (تک‌جمله $n=1$) است و نیازی به انتگرال‌گیری جزء‌به‌جزء برای جمله دوم نیست.',
      };

    case 'half_rectified':
      return {
        presetId: 'half_rectified',
        titleFa: 'موج سینوسی نیم‌سوساز (Half-Wave Rectified Sine - کاربرد مهندسی برق)',
        functionDefinitionLatex:
          'f(x) = \\begin{cases} 0, & -\\ell \\le x < 0 \\\\ \\sin\\left(\\frac{\\pi x}{\\ell}\\right), & 0 \\le x \\le \\ell \\end{cases}',
        symmetryTypeFa: 'نه زوج و نه فرد، اما کاملاً پیوسته در مرزها',
        symmetryReasonFa:
          'در نیم‌تناوب منفی حذف شده و در نیم‌تناوب مثبت موج سینوسی است. به دلیل تعامد توابع مثلثاتی، در محاسبه $b_n$ حالت $n=1$ باید جداگانه از $n \\ge 2$ محاسبه شود تا مخرج صفر نگردد!',
        a0DerivationLatex:
          'a_0 = \\frac{1}{\\ell}\\int_{0}^{\\ell} \\sin\\left(\\frac{\\pi x}{\\ell}\\right)dx = \\frac{2}{\\pi} \\implies \\frac{a_0}{2} = \\frac{1}{\\pi}',
        anDerivationLatex:
          'a_n = \\frac{1}{\\pi}\\int_{0}^{\\pi} \\sin(x)\\cos(nx)\\,dx = \\begin{cases} 0, & n=2k-1 \\\\ -\\frac{2}{\\pi(n^2 - 1)}, & n=2k \\end{cases}',
        bnDerivationLatex:
          'b_1 = \\frac{1}{\\pi}\\int_{0}^{\\pi} \\sin^2(x)\\,dx = \\frac{1}{2}, \\qquad b_n = \\frac{1}{\\pi}\\int_{0}^{\\pi} \\sin(x)\\sin(nx)\\,dx = 0 \\quad (\\forall n \\ge 2)',
        closedFormSeriesLatex:
          'f(x) = \\frac{1}{\\pi} + \\frac{1}{2}\\sin\\left(\\frac{\\pi x}{\\ell}\\right) - \\frac{2}{\\pi}\\sum_{k=1}^{\\infty} \\frac{1}{4k^2 - 1}\\cos\\left(\\frac{2k\\pi x}{\\ell}\\right)',
        expandedFirstTermsLatex:
          'f(x) = \\frac{1}{\\pi} + \\frac{1}{2}\\sin\\left(\\frac{\\pi x}{\\ell}\\right) - \\frac{2}{\\pi}\\left[ \\frac{1}{3}\\cos\\left(\\frac{2\\pi x}{\\ell}\\right) + \\frac{1}{15}\\cos\\left(\\frac{4\\pi x}{\\ell}\\right) + \\frac{1}{35}\\cos\\left(\\frac{6\\pi x}{\\ell}\\right) + \\cdots \\right]',
        dirichletConvergencePoints: [
          {
            pointLabelFa: 'مبدأ مختصات ($x_0 = 0$) — سری تلسکوپی $\\sum \\frac{1}{4k^2-1} = \\frac{1}{2}$',
            pointLatex: 'x_0 = 0',
            leftLimitLatex: 'f(0^-) = 0',
            rightLimitLatex: 'f(0^+) = 0',
            averageSumLatex: 'S(0) = 0',
            resultingSeriesSumLatex:
              '0 = \\frac{1}{\\pi} - \\frac{2}{\\pi}\\sum_{k=1}^{\\infty}\\frac{1}{4k^2-1} \\implies \\sum_{k=1}^{\\infty}\\frac{1}{(2k-1)(2k+1)} = \\frac{1}{2}',
          },
        ],
        parsevalApplicationLatex:
          '\\begin{aligned} \\frac{1}{\\pi}\\int_{0}^{\\pi} \\sin^2(x)\\,dx &= \\frac{1}{2} = \\frac{2}{\\pi^2} + \\frac{1}{4} + \\frac{4}{\\pi^2}\\sum_{k=1}^{\\infty}\\frac{1}{(4k^2-1)^2} \\\\ \\implies \\sum_{k=1}^{\\infty}\\frac{1}{(4k^2-1)^2} &= \\frac{\\pi^2 - 8}{16} \\end{aligned}',
        decayOrderNoteFa:
          'هشدار مهم امتحانی: در انتگرال‌های حاوی $\\sin(x)\\sin(nx)$ یا $\\sin(x)\\cos(nx)$، همیشه ابتدا حالت $n=1$ را جداگانه حساب کنید چون برای $n=1$ مخرجِ فرمول $(n^2 - 1)$ صفر می‌شود!',
      };

    case 'triangle':
      return {
        presetId: 'triangle',
        titleFa: 'موج مثلثی متقارن $f(x) = 1 - |x|/\\ell$',
        functionDefinitionLatex:
          'f(x) = 1 - \\frac{|x|}{\\ell} \\quad (-\\ell \\le x \\le \\ell), \\quad f(x + 2\\ell) = f(x)',
        symmetryTypeFa: 'تابع زوج و کاملاً پیوسته (Even & Continuous)',
        symmetryReasonFa:
          'تابع نسبت به محور عمودی متقارن است ($f(-x)=f(x)$)، لذا تمام ضرایب سینوسی صفرند ($b_n = 0$) و سری صرفاً کسینوسی با همگرایی سریع مرتبه $\\mathcal{O}(1/n^2)$ است.',
        a0DerivationLatex:
          'a_0 = \\frac{2}{\\ell}\\int_{0}^{\\ell}\\left(1 - \\frac{x}{\\ell}\\right)dx = 1 \\implies \\frac{a_0}{2} = \\frac{1}{2}',
        anDerivationLatex:
          'a_n = \\frac{2}{\\ell}\\int_{0}^{\\ell}\\left(1 - \\frac{x}{\\ell}\\right)\\cos\\left(\\frac{n\\pi x}{\\ell}\\right)dx = \\frac{2\\big(1 - (-1)^n\\big)}{n^2\\pi^2} = \\begin{cases} \\frac{4}{(2k-1)^2\\pi^2}, & n=2k-1 \\\\ 0, & n=2k \\end{cases}',
        bnDerivationLatex:
          'b_n = \\frac{1}{\\ell}\\int_{-\\ell}^{\\ell}\\underbrace{\\left(1 - \\frac{|x|}{\\ell}\\right)}_{\\text{Even}}\\cdot\\underbrace{\\sin\\left(\\frac{n\\pi x}{\\ell}\\right)}_{\\text{Odd}}dx = 0',
        closedFormSeriesLatex:
          '1 - \\frac{|x|}{\\ell} = \\frac{1}{2} + \\frac{4}{\\pi^2}\\sum_{k=1}^{\\infty} \\frac{1}{(2k-1)^2}\\cos\\left(\\frac{(2k-1)\\pi x}{\\ell}\\right)',
        expandedFirstTermsLatex:
          '1 - \\frac{|x|}{\\ell} = \\frac{1}{2} + \\frac{4}{\\pi^2}\\left[ \\cos\\left(\\frac{\\pi x}{\\ell}\\right) + \\frac{1}{9}\\cos\\left(\\frac{3\\pi x}{\\ell}\\right) + \\frac{1}{25}\\cos\\left(\\frac{5\\pi x}{\\ell}\\right) + \\cdots \\right]',
        dirichletConvergencePoints: [
          {
            pointLabelFa: 'قله موج در مبدأ ($x_0 = 0$) — استخراج $\\sum \\frac{1}{(2k-1)^2} = \\frac{\\pi^2}{8}$',
            pointLatex: 'x_0 = 0',
            leftLimitLatex: 'f(0^-) = 1',
            rightLimitLatex: 'f(0^+) = 1',
            averageSumLatex: 'S(0) = 1',
            resultingSeriesSumLatex:
              '1 = \\frac{1}{2} + \\frac{4}{\\pi^2}\\sum_{k=1}^{\\infty}\\frac{1}{(2k-1)^2} \\implies \\sum_{k=1}^{\\infty}\\frac{1}{(2k-1)^2} = \\frac{\\pi^2}{8}',
          },
        ],
        parsevalApplicationLatex:
          '\\begin{aligned} \\frac{1}{\\ell}\\int_{-\\ell}^{\\ell}\\left(1 - \\frac{|x|}{\\ell}\\right)^2 dx &= \\frac{2}{3} = \\frac{1}{2} + \\frac{16}{\\pi^4}\\sum_{k=1}^{\\infty}\\frac{1}{(2k-1)^4} \\\\ \\implies \\sum_{k=1}^{\\infty}\\frac{1}{(2k-1)^4} &= \\frac{\\pi^4}{96} \\end{aligned}',
        decayOrderNoteFa:
          'موج مثلثی انتگرالِ موج مربعی است! با انتگرال‌گیری جمله‌به‌جمله از سری موج مربعی (که از مرتبه $1/n$ است)، سری موج مثلثی (از مرتبه $1/n^2$) بدون هیچ انتگرال جزء‌به‌جزء به دست می‌آید.',
      };
  }
}

export interface FourierTermConvergencePoint {
  n: number;
  partialSumAtProbe: number;
  dirichletTarget: number;
  absErrorAtProbe: number;
  termContributionAtProbe: number;
  an: number;
  bn: number;
  harmonicAmplitude: number;
  parsevalPartialEnergy: number;
  energyRatioPercent: number;
  residualMeanSquareError: number;
}

export interface FourierConvergenceTrajectory {
  probeX: number;
  exactLeftLimit: number;
  exactRightLimit: number;
  dirichletTargetAtProbe: number;
  totalEnergyLHS: number;
  terms: FourierTermConvergencePoint[];
}

/**
 * Computes term-by-term convergence data as harmonic count n increases from 0 to maxN.
 * Tracks both pointwise convergence S_n(x_0) -> [f(x_0^-) + f(x_0^+)] / 2
 * and Parseval energy convergence E_n -> (1/L) int_{-L}^{L} |f(x)|^2 dx.
 */
export function computeFourierConvergenceTrajectory(params: {
  presetId: PresetFunctionId;
  halfPeriodL: number;
  maxN: number;
  probeX: number;
  mode: 'full' | 'cosine_even' | 'sine_odd';
  precomputedCoeffs?: FourierCoefficients;
}): FourierConvergenceTrajectory {
  const { presetId, halfPeriodL: L, maxN, probeX, mode } = params;
  const coeffs =
    params.precomputedCoeffs && params.precomputedCoeffs.an.length >= maxN
      ? params.precomputedCoeffs
      : computeFourierSeries({
          presetId,
          halfPeriodL: L,
          numHarmonicsN: maxN,
          mode,
        });

  const delta = Math.max(1e-5, L * 1e-4);
  const exactLeftLimit = evaluatePresetFunction(presetId, probeX - delta, L, mode);
  const exactRightLimit = evaluatePresetFunction(presetId, probeX + delta, L, mode);
  const dirichletTargetAtProbe = 0.5 * (exactLeftLimit + exactRightLimit);
  const totalEnergyLHS = coeffs.parsevalLHS;

  const terms: FourierTermConvergencePoint[] = [];
  let runningSum = coeffs.a0 / 2;
  let runningEnergy = (coeffs.a0 * coeffs.a0) / 2;

  for (let n = 0; n <= maxN; n++) {
    let an = 0;
    let bn = 0;
    let termContribution = 0;

    if (n === 0) {
      an = coeffs.a0 / 2;
      bn = 0;
      termContribution = coeffs.a0 / 2;
    } else {
      an = coeffs.an[n - 1] ?? 0;
      bn = coeffs.bn[n - 1] ?? 0;
      const omegaN = (n * Math.PI) / L;
      termContribution = an * Math.cos(omegaN * probeX) + bn * Math.sin(omegaN * probeX);
      runningSum += termContribution;
      runningEnergy += an * an + bn * bn;
    }

    const harmonicAmplitude = n === 0 ? Math.abs(an) : Math.hypot(an, bn);
    const energyRatioPercent =
      totalEnergyLHS > 1e-9
        ? Math.min(100, Math.max(0, (runningEnergy / totalEnergyLHS) * 100))
        : 100;
    const residualMeanSquareError = Math.max(0, totalEnergyLHS - runningEnergy);

    terms.push({
      n,
      partialSumAtProbe: Number(runningSum.toFixed(5)),
      dirichletTarget: Number(dirichletTargetAtProbe.toFixed(5)),
      absErrorAtProbe: Number(Math.abs(runningSum - dirichletTargetAtProbe).toFixed(5)),
      termContributionAtProbe: Number(termContribution.toFixed(5)),
      an: Number(an.toFixed(5)),
      bn: Number(bn.toFixed(5)),
      harmonicAmplitude: Number(harmonicAmplitude.toFixed(5)),
      parsevalPartialEnergy: Number(runningEnergy.toFixed(5)),
      energyRatioPercent: Number(energyRatioPercent.toFixed(2)),
      residualMeanSquareError: Number(residualMeanSquareError.toFixed(5)),
    });
  }

  return {
    probeX,
    exactLeftLimit: Number(exactLeftLimit.toFixed(4)),
    exactRightLimit: Number(exactRightLimit.toFixed(4)),
    dirichletTargetAtProbe: Number(dirichletTargetAtProbe.toFixed(4)),
    totalEnergyLHS: Number(totalEnergyLHS.toFixed(5)),
    terms,
  };
}

/**
 * Fourier Integral Comprehensive Analytical Engine (Lesson 3 / Module 3)
 */
export type FourierIntegralPresetId =
  | 'rect_pulse'
  | 'two_sided_exp'
  | 'one_sided_exp'
  | 'triangle_pulse'
  | 'sign_damped'
  | 'gaussian';

export interface AnalyticalFourierIntegralDetails {
  presetId: FourierIntegralPresetId;
  titleFa: string;
  functionDefinitionLatex: string;
  symmetryTypeFa: string;
  symmetryReasonFa: string;
  A_alphaDerivationLatex: string;
  B_alphaDerivationLatex: string;
  integralRepresentationLatex: string;
  dirichletConvergencePoints: {
    pointLabelFa: string;
    pointLatex: string;
    leftLimitLatex: string;
    rightLimitLatex: string;
    averageSumLatex: string;
    resultingImproperIntegralLatex: string;
  }[];
  parsevalApplicationLatex: string;
  improperIntegralsExtracted: {
    integralLatex: string;
    valueLatex: string;
    methodNoteFa: string;
  }[];
  integralEquationConnectionFa: string;
  decayOrderNoteFa: string;
}

export function getAnalyticalFourierIntegralDetails(
  presetId: FourierIntegralPresetId,
  paramA = 1
): AnalyticalFourierIntegralDetails {
  const aStr = paramA === 1 ? '1' : paramA.toFixed(1);

  switch (presetId) {
    case 'rect_pulse':
      return {
        presetId: 'rect_pulse',
        titleFa: 'پالس مستطیلی متقارن (مثال ۱۸ جزوه دکتر طائری - صفحه ۵۹)',
        functionDefinitionLatex:
          'f(x) = \\begin{cases} 1, & |x| < a \\\\ 0, & |x| > a \\end{cases} \\qquad (a > 0)',
        symmetryTypeFa: 'تابع زوج حقیقی (Even Function)',
        symmetryReasonFa:
          'چون $f(-x) = f(x)$ است، تابع زوج بوده و ضریب سینوسی $B(\\alpha) = 0$ خواهد بود. انتگرال تبدیل تنها بر پایه کسینوس محاسبه می‌شود.',
        A_alphaDerivationLatex:
          'A(\\alpha) = \\frac{1}{\\pi}\\int_{-\\infty}^{\\infty} f(t)\\cos(\\alpha t)\\,dt = \\frac{2}{\\pi}\\int_{0}^{a} 1\\cdot\\cos(\\alpha t)\\,dt = \\frac{2}{\\pi}\\left[\\frac{\\sin(\\alpha t)}{\\alpha}\\right]_{0}^{a} = \\frac{2\\sin(a\\alpha)}{\\pi\\alpha}',
        B_alphaDerivationLatex:
          'B(\\alpha) = \\frac{1}{\\pi}\\int_{-\\infty}^{\\infty} f(t)\\sin(\\alpha t)\\,dt = 0 \\quad (\\text{انتگرال تابع فرد روی بازه متقارن صفر است})',
        integralRepresentationLatex:
          'f(x) \\simeq \\frac{2}{\\pi}\\int_{0}^{\\infty} \\frac{\\sin(a\\alpha)\\cos(\\alpha x)}{\\alpha}\\,d\\alpha',
        dirichletConvergencePoints: [
          {
            pointLabelFa: 'مبدأ مختصات ($x_0 = 0$) — استخراج انتگرال مشهور دیریکله',
            pointLatex: 'x_0 = 0',
            leftLimitLatex: 'f(0^-) = 1',
            rightLimitLatex: 'f(0^+) = 1',
            averageSumLatex: 'f(0) = 1',
            resultingImproperIntegralLatex:
              '\\int_{0}^{\\infty} \\frac{\\sin(a\\alpha)}{\\alpha}\\,d\\alpha = \\frac{\\pi}{2} \\quad (\\forall a > 0)',
          },
          {
            pointLabelFa: 'نقطه ناپیوستگی و پرش مرزی ($x_0 = a$)',
            pointLatex: 'x_0 = a',
            leftLimitLatex: 'f(a^-) = 1',
            rightLimitLatex: 'f(a^+) = 0',
            averageSumLatex: '\\frac{f(a^-)+f(a^+)}{2} = \\frac{1}{2}',
            resultingImproperIntegralLatex:
              '\\frac{2}{\\pi}\\int_{0}^{\\infty} \\frac{\\sin(a\\alpha)\\cos(a\\alpha)}{\\alpha}\\,d\\alpha = \\frac{1}{2} \\implies \\int_{0}^{\\infty} \\frac{\\sin(2a\\alpha)}{2\\alpha}\\,d\\alpha = \\frac{\\pi}{4}',
          },
          {
            pointLabelFa: 'بیرون از محدوده پالس ($x_0 > a$)',
            pointLatex: 'x_0 > a',
            leftLimitLatex: 'f(x_0^-) = 0',
            rightLimitLatex: 'f(x_0^+) = 0',
            averageSumLatex: 'f(x_0) = 0',
            resultingImproperIntegralLatex:
              '\\int_{0}^{\\infty} \\frac{\\sin(a\\alpha)\\cos(\\alpha x_0)}{\\alpha}\\,d\\alpha = 0 \\quad (|x_0| > a)',
          },
        ],
        parsevalApplicationLatex:
          '\\begin{aligned} \\frac{1}{\\pi}\\int_{-\\infty}^{\\infty} |f(x)|^2\\,dx &= \\int_{0}^{\\infty} [A^2(\\alpha) + B^2(\\alpha)]\\,d\\alpha \\\\ \\frac{1}{\\pi}\\int_{-a}^{a} 1^2\\,dx &= \\int_{0}^{\\infty} \\left(\\frac{2\\sin(a\\alpha)}{\\pi\\alpha}\\right)^2 d\\alpha = \\frac{2a}{\\pi} \\\\ &\\implies \\int_{0}^{\\infty} \\frac{\\sin^2(a\\alpha)}{\\alpha^2}\\,d\\alpha = \\frac{\\pi a}{2} \\end{aligned}',
        improperIntegralsExtracted: [
          {
            integralLatex: '\\int_{0}^{\\infty} \\frac{\\sin\\alpha}{\\alpha}\\,d\\alpha',
            valueLatex: '\\frac{\\pi}{2}',
            methodNoteFa: 'با قرار دادن $x=0$ در انتگرال دیریکله حاصل از پالس واحد ($a=1$).',
          },
          {
            integralLatex: '\\int_{0}^{\\infty} \\frac{\\sin^2\\alpha}{\\alpha^2}\\,d\\alpha',
            valueLatex: '\\frac{\\pi}{2}',
            methodNoteFa: 'با اعمال اتحاد پارسوال انتگرال فوریه روی پالس واحد.',
          },
        ],
        integralEquationConnectionFa:
          'معادله انتگرالی معکوس: اگر داشته باشیم $\\int_0^\\infty u(\\alpha)\\cos(\\alpha x)d\\alpha = \\begin{cases} 1 & |x| < a \\\\ 0 & |x| > a \\end{cases}$، بلافاصله جواب $u(\\alpha) = A(\\alpha) = \\frac{2\\sin(a\\alpha)}{\\pi\\alpha}$ است.',
        decayOrderNoteFa:
          'ضریب $A(\\alpha) = \\mathcal{O}(1/\\alpha)$ است؛ سرعت نزول کم ناشی از ناپیوستگی جهشی پالس در $x = \\pm a$ است و منجر به پدیده گیبس با فراجهش ۸.۹۵٪ در اطراف مرزها می‌شود.',
      };

    case 'two_sided_exp':
      return {
        presetId: 'two_sided_exp',
        titleFa: 'نمایی دوطرفه متقارن $f(x) = e^{-a|x|}$ (مثال ۲۵ جزوه - اثبات انتگرال‌های لاپلاس)',
        functionDefinitionLatex:
          'f(x) = e^{-a|x|} \\quad (a > 0, \\; -\\infty < x < \\infty)',
        symmetryTypeFa: 'تابع زوج حقیقی و پیوسته (Even & Continuous)',
        symmetryReasonFa:
          'چون $|-x| = |x|$ است، تابع متقارن زوج بوده و ضریب سینوسی $B(\\alpha) = 0$ است. تابع در تمام دامنه پیوسته است.',
        A_alphaDerivationLatex:
          'A(\\alpha) = \\frac{2}{\\pi}\\int_{0}^{\\infty} e^{-at}\\cos(\\alpha t)\\,dt = \\frac{2}{\\pi} \\left[ \\frac{e^{-at}}{a^2 + \\alpha^2}(-a\\cos(\\alpha t) + \\alpha\\sin(\\alpha t)) \\right]_{0}^{\\infty} = \\frac{2a}{\\pi(a^2 + \\alpha^2)}',
        B_alphaDerivationLatex:
          'B(\\alpha) = 0 \\quad (\\text{تابع زوج است})',
        integralRepresentationLatex:
          'e^{-a|x|} = \\frac{2a}{\\pi}\\int_{0}^{\\infty} \\frac{\\cos(\\alpha x)}{a^2 + \\alpha^2}\\,d\\alpha \\quad (-\\infty < x < \\infty)',
        dirichletConvergencePoints: [
          {
            pointLabelFa: 'مبدأ مختصات ($x_0 = 0$) — استخراج انتگرال ناسره کسینوسی لاپلاس',
            pointLatex: 'x_0 = 0',
            leftLimitLatex: 'f(0^-) = 1',
            rightLimitLatex: 'f(0^+) = 1',
            averageSumLatex: 'f(0) = 1',
            resultingImproperIntegralLatex:
              '\\int_{0}^{\\infty} \\frac{1}{a^2 + \\alpha^2}\\,d\\alpha = \\left[\\frac{1}{a}\\arctan\\left(\\frac{\\alpha}{a}\\right)\\right]_0^\\infty = \\frac{\\pi}{2a}',
          },
          {
            pointLabelFa: 'تمام مقادیر مثبت و منفی $x$',
            pointLatex: 'x \\in \\mathbb{R}',
            leftLimitLatex: 'e^{-a|x|}',
            rightLimitLatex: 'e^{-a|x|}',
            averageSumLatex: 'e^{-a|x|}',
            resultingImproperIntegralLatex:
              '\\int_{0}^{\\infty} \\frac{\\cos(\\alpha x)}{a^2 + \\alpha^2}\\,d\\alpha = \\frac{\\pi}{2a} e^{-a|x|}',
          },
        ],
        parsevalApplicationLatex:
          '\\begin{aligned} \\frac{1}{\\pi}\\int_{-\\infty}^{\\infty} e^{-2a|x|}\\,dx &= \\int_{0}^{\\infty} \\left(\\frac{2a}{\\pi(a^2 + \\alpha^2)}\\right)^2 d\\alpha = \\frac{2}{\\pi}\\int_0^\\infty e^{-2ax}dx = \\frac{1}{\\pi a} \\\\ &\\implies \\int_{0}^{\\infty} \\frac{1}{(a^2 + \\alpha^2)^2}\\,d\\alpha = \\frac{\\pi}{4a^3} \\end{aligned}',
        improperIntegralsExtracted: [
          {
            integralLatex: '\\int_{0}^{\\infty} \\frac{\\cos(\\alpha x)}{a^2 + \\alpha^2}\\,d\\alpha',
            valueLatex: '\\frac{\\pi}{2a}e^{-a|x|}',
            methodNoteFa: 'انتگرال مشهور کسینوسی لاپلاس با بازنویسی نمایش انتگرال فوریه.',
          },
          {
            integralLatex: '\\int_{0}^{\\infty} \\frac{1}{(a^2 + \\alpha^2)^2}\\,d\\alpha',
            valueLatex: '\\frac{\\pi}{4a^3}',
            methodNoteFa: 'محاسبه مستقیم از اتحاد پارسوال انتگرال فوریه بدون نیاز به روش مانده‌های مختلط!',
          },
        ],
        integralEquationConnectionFa:
          'حل معادله انتگرالی: جواب معادله انتگرالی $\\int_0^\\infty u(\\alpha)\\cos(\\alpha x)d\\alpha = e^{-ax}$ برابر است با $u(\\alpha) = \\frac{2a}{\\pi(a^2 + \\alpha^2)}$.',
        decayOrderNoteFa:
          'ضریب $A(\\alpha) = \\mathcal{O}(1/\\alpha^2)$ با سرعت بالایی نزول می‌کند چون تابع $e^{-a|x|}$ در تمام نقاط پیوسته است (گرچه در $x=0$ مشتق‌پذیر نیست).',
      };

    case 'one_sided_exp':
      return {
        presetId: 'one_sided_exp',
        titleFa: 'نمایی یک‌طرفه در نیم‌خط $x > 0$ (انتگرال‌های فوریه کسینوسی و سینوسی)',
        functionDefinitionLatex:
          'f(x) = e^{-ax} \\quad (x > 0, \\; a > 0)',
        symmetryTypeFa: 'توسیع زوج یا فرد به دلخواه روی $(-\\infty, \\infty)$',
        symmetryReasonFa:
          'اگر با قرینه زوج گسترش دهیم ($f(-x) = e^{-a|x|}$) به انتگرال کسینوسی، و اگر با قرینه فرد گسترش دهیم به انتگرال سینوسی تبدیل می‌شود.',
        A_alphaDerivationLatex:
          'A(\\alpha) = \\frac{2}{\\pi}\\int_{0}^{\\infty} e^{-at}\\cos(\\alpha t)\\,dt = \\frac{2a}{\\pi(a^2 + \\alpha^2)}',
        B_alphaDerivationLatex:
          'B(\\alpha) = \\frac{2}{\\pi}\\int_{0}^{\\infty} e^{-at}\\sin(\\alpha t)\\,dt = \\frac{2}{\\pi} \\left[ \\frac{e^{-at}}{a^2 + \\alpha^2}(-a\\sin(\\alpha t) - \\alpha\\cos(\\alpha t)) \\right]_{0}^{\\infty} = \\frac{2\\alpha}{\\pi(a^2 + \\alpha^2)}',
        integralRepresentationLatex:
          'e^{-ax} = \\frac{2a}{\\pi}\\int_{0}^{\\infty} \\frac{\\cos(\\alpha x)}{a^2 + \\alpha^2}\\,d\\alpha = \\frac{2}{\\pi}\\int_{0}^{\\infty} \\frac{\\alpha\\sin(\\alpha x)}{a^2 + \\alpha^2}\\,d\\alpha \\quad (x > 0)',
        dirichletConvergencePoints: [
          {
            pointLabelFa: 'نمایش سینوسی در مبدأ ($x_0 = 0$) — پدیده صفر شدن به دلیل توسیع فرد',
            pointLatex: 'x_0 = 0',
            leftLimitLatex: '-f(0^+) = -1',
            rightLimitLatex: 'f(0^+) = 1',
            averageSumLatex: 'S_{\\text{sine}}(0) = 0',
            resultingImproperIntegralLatex:
              '\\frac{2}{\\pi}\\int_{0}^{\\infty} \\frac{\\alpha\\sin(0)}{a^2 + \\alpha^2}\\,d\\alpha = 0',
          },
          {
            pointLabelFa: 'نمایش کسینوسی در مبدأ ($x_0 = 0$) — همگرایی به مقدار ۱',
            pointLatex: 'x_0 = 0',
            leftLimitLatex: '1',
            rightLimitLatex: '1',
            averageSumLatex: 'S_{\\text{cos}}(0) = 1',
            resultingImproperIntegralLatex:
              '\\frac{2a}{\\pi}\\int_{0}^{\\infty} \\frac{1}{a^2 + \\alpha^2}\\,d\\alpha = 1 \\implies \\int_{0}^{\\infty} \\frac{d\\alpha}{a^2 + \\alpha^2} = \\frac{\\pi}{2a}',
          },
        ],
        parsevalApplicationLatex:
          '\\begin{aligned} \\text{حالت سینوسی:} \\; \\frac{2}{\\pi}\\int_{0}^{\\infty} e^{-2ax}\\,dx &= \\int_{0}^{\\infty} B^2(\\alpha)\\,d\\alpha \\\\ \\frac{1}{\\pi a} &= \\frac{4}{\\pi^2}\\int_0^\\infty \\frac{\\alpha^2}{(a^2 + \\alpha^2)^2}\\,d\\alpha \\implies \\int_{0}^{\\infty} \\frac{\\alpha^2}{(a^2 + \\alpha^2)^2}\\,d\\alpha = \\frac{\\pi}{4a} \\end{aligned}',
        improperIntegralsExtracted: [
          {
            integralLatex: '\\int_{0}^{\\infty} \\frac{\\alpha\\sin(\\alpha x)}{a^2 + \\alpha^2}\\,d\\alpha',
            valueLatex: '\\frac{\\pi}{2} e^{-ax} \\quad (x > 0)',
            methodNoteFa: 'انتگرال سینوسی لاپلاس حاصل از نمایش انتگرال فوریه سینوسی.',
          },
          {
            integralLatex: '\\int_{0}^{\\infty} \\frac{\\alpha^2}{(a^2 + \\alpha^2)^2}\\,d\\alpha',
            valueLatex: '\\frac{\\pi}{4a}',
            methodNoteFa: 'حاصل از اعمال اتحاد پارسوال روی انتگرال فوریه سینوسی.',
          },
        ],
        integralEquationConnectionFa:
          'معادله انتگرالی سینوسی: جواب معادله $\\int_0^\\infty g(\\alpha)\\sin(\\alpha x)d\\alpha = e^{-ax}$ مستقیماً برابر $g(\\alpha) = B(\\alpha) = \\frac{2\\alpha}{\\pi(a^2 + \\alpha^2)}$ است.',
        decayOrderNoteFa:
          'در فرم کسینوسی ضریب $A(\\alpha) = \\mathcal{O}(1/\\alpha^2)$ است در حالی که در فرم سینوسی $B(\\alpha) = \\mathcal{O}(1/\\alpha)$ است؛ چون توسیع فرد در $x=0$ ناپیوستگی دارد.',
      };

    case 'triangle_pulse':
      return {
        presetId: 'triangle_pulse',
        titleFa: 'پالس مثلثی متقارن $f(x) = 1 - |x|/a$ (کانولوشن دو پالس مستطیلی)',
        functionDefinitionLatex:
          'f(x) = \\begin{cases} 1 - \\frac{|x|}{a}, & |x| < a \\\\ 0, & |x| \\ge a \\end{cases} \\qquad (a > 0)',
        symmetryTypeFa: 'تابع زوج و کاملاً پیوسته (Even & Continuous everywhere)',
        symmetryReasonFa:
          'تابع متقارن زوج است ($f(-x)=f(x)$) و در تمام دامنه حتی در مرزهای $x = \\pm a$ پیوسته است ($f(a)=0$). لذا $B(\\alpha) = 0$ و همگرایی یکنواخت است.',
        A_alphaDerivationLatex:
          'A(\\alpha) = \\frac{2}{\\pi}\\int_{0}^{a} \\left(1 - \\frac{t}{a}\\right)\\cos(\\alpha t)\\,dt \\xrightarrow{\\text{Tabular DI}} \\frac{2}{\\pi}\\left[ \\left(1 - \\frac{t}{a}\\right)\\frac{\\sin(\\alpha t)}{\\alpha} - \\left(-\\frac{1}{a}\\right)\\frac{-\\cos(\\alpha t)}{\\alpha^2} \\right]_{0}^{a} = \\frac{2(1 - \\cos(a\\alpha))}{\\pi a\\alpha^2} = \\frac{4\\sin^2(a\\alpha/2)}{\\pi a\\alpha^2}',
        B_alphaDerivationLatex:
          'B(\\alpha) = 0 \\quad (\\text{تابع زوج است})',
        integralRepresentationLatex:
          '1 - \\frac{|x|}{a} = \\frac{4}{\\pi a}\\int_{0}^{\\infty} \\frac{\\sin^2(a\\alpha/2)}{\\alpha^2} \\cos(\\alpha x)\\,d\\alpha \\quad (|x| < a)',
        dirichletConvergencePoints: [
          {
            pointLabelFa: 'قله پالس در مبدأ ($x_0 = 0$)',
            pointLatex: 'x_0 = 0',
            leftLimitLatex: '1',
            rightLimitLatex: '1',
            averageSumLatex: '1',
            resultingImproperIntegralLatex:
              '1 = \\frac{4}{\\pi a}\\int_{0}^{\\infty} \\frac{\\sin^2(a\\alpha/2)}{\\alpha^2}\\,d\\alpha \\xrightarrow{u = a\\alpha/2} \\int_{0}^{\\infty} \\frac{\\sin^2 u}{u^2}\\,du = \\frac{\\pi}{2}',
          },
          {
            pointLabelFa: 'مرز صفر شدن پالس ($x_0 = a$)',
            pointLatex: 'x_0 = a',
            leftLimitLatex: '0',
            rightLimitLatex: '0',
            averageSumLatex: '0',
            resultingImproperIntegralLatex:
              '\\int_{0}^{\\infty} \\frac{\\sin^2(a\\alpha/2)}{\\alpha^2} \\cos(a\\alpha)\\,d\\alpha = 0',
          },
        ],
        parsevalApplicationLatex:
          '\\begin{aligned} \\frac{1}{\\pi}\\int_{-a}^{a} \\left(1 - \\frac{|x|}{a}\\right)^2 dx &= \\frac{2a}{3\\pi} = \\int_{0}^{\\infty} A^2(\\alpha)\\,d\\alpha = \\frac{16}{\\pi^2 a^2}\\int_0^\\infty \\frac{\\sin^4(a\\alpha/2)}{\\alpha^4}\\,d\\alpha \\\\ &\\implies \\int_{0}^{\\infty} \\frac{\\sin^4 u}{u^4}\\,du = \\frac{\\pi}{3} \\end{aligned}',
        improperIntegralsExtracted: [
          {
            integralLatex: '\\int_{0}^{\\infty} \\frac{\\sin^2 u}{u^2}\\,du',
            valueLatex: '\\frac{\\pi}{2}',
            methodNoteFa: 'با قرار دادن $x=0$ در نمایش انتگرال فوریه پالس مثلثی.',
          },
          {
            integralLatex: '\\int_{0}^{\\infty} \\frac{\\sin^4 u}{u^4}\\,du',
            valueLatex: '\\frac{\\pi}{3}',
            methodNoteFa: 'حاصل از اتحاد پارسوال انتگرال فوریه روی پالس مثلثی.',
          },
        ],
        integralEquationConnectionFa:
          'معادله انتگرالی مثلثی: جواب معادله انتگرالی $\\int_0^\\infty u(\\alpha)\\cos(\\alpha x)d\\alpha = \\begin{cases} 1-|x| & |x| < 1 \\\\ 0 & |x| \\ge 1 \\end{cases}$ برابر است با $u(\\alpha) = \\frac{4\\sin^2(\\alpha/2)}{\\pi\\alpha^2}$.',
        decayOrderNoteFa:
          'پالس مثلثی به علت پیوستگی سراسری دارای ضریب با مرتبه نزول سریع $\\mathcal{O}(1/\\alpha^2)$ است و فاقد پدیده جهش گیبس می‌باشد!',
      };

    case 'sign_damped':
      return {
        presetId: 'sign_damped',
        titleFa: 'نمایی میراشونده علامت‌دار $f(x) = e^{-a|x|}\\operatorname{sgn}(x)$ (تابع فرد خالص)',
        functionDefinitionLatex:
          'f(x) = \\begin{cases} e^{-ax}, & x > 0 \\\\ 0, & x = 0 \\\\ -e^{ax}, & x < 0 \\end{cases} \\qquad (a > 0)',
        symmetryTypeFa: 'تابع فرد خالص (Odd Function)',
        symmetryReasonFa:
          'چون $f(-x) = -f(x)$ است، ضریب کسینوسی $A(\\alpha) = 0$ بوده و نمایش انتگرال فوریه منحصراً سینوسی با طیف $B(\\alpha)$ خواهد بود.',
        A_alphaDerivationLatex:
          'A(\\alpha) = 0 \\quad (\\text{انتگرال تابع فرد روی } (-\\infty, \\infty) \\text{ صفر است})',
        B_alphaDerivationLatex:
          'B(\\alpha) = \\frac{2}{\\pi}\\int_{0}^{\\infty} e^{-at}\\sin(\\alpha t)\\,dt = \\frac{2\\alpha}{\\pi(a^2 + \\alpha^2)}',
        integralRepresentationLatex:
          'f(x) \\simeq \\frac{2}{\\pi}\\int_{0}^{\\infty} \\frac{\\alpha\\sin(\\alpha x)}{a^2 + \\alpha^2}\\,d\\alpha \\quad (-\\infty < x < \\infty)',
        dirichletConvergencePoints: [
          {
            pointLabelFa: 'نقطه پرش در مبدأ مختصات ($x_0 = 0$)',
            pointLatex: 'x_0 = 0',
            leftLimitLatex: 'f(0^-) = -1',
            rightLimitLatex: 'f(0^+) = +1',
            averageSumLatex: '\\frac{-1 + 1}{2} = 0',
            resultingImproperIntegralLatex:
              '\\frac{2}{\\pi}\\int_{0}^{\\infty} \\frac{\\alpha\\sin(0)}{a^2 + \\alpha^2}\\,d\\alpha = 0',
          },
          {
            pointLabelFa: 'نقاط مثبت $x > 0$',
            pointLatex: 'x > 0',
            leftLimitLatex: 'e^{-ax}',
            rightLimitLatex: 'e^{-ax}',
            averageSumLatex: 'e^{-ax}',
            resultingImproperIntegralLatex:
              '\\int_{0}^{\\infty} \\frac{\\alpha\\sin(\\alpha x)}{a^2 + \\alpha^2}\\,d\\alpha = \\frac{\\pi}{2} e^{-ax}',
          },
        ],
        parsevalApplicationLatex:
          '\\begin{aligned} \\frac{1}{\\pi}\\int_{-\\infty}^{\\infty} |f(x)|^2\\,dx &= \\frac{2}{\\pi}\\int_{0}^{\\infty} e^{-2ax}\\,dx = \\frac{1}{\\pi a} = \\int_{0}^{\\infty} B^2(\\alpha)\\,d\\alpha \\\\ &\\implies \\int_{0}^{\\infty} \\frac{\\alpha^2}{(a^2 + \\alpha^2)^2}\\,d\\alpha = \\frac{\\pi}{4a} \\end{aligned}',
        improperIntegralsExtracted: [
          {
            integralLatex: '\\int_{0}^{\\infty} \\frac{\\alpha\\sin(\\alpha x)}{a^2 + \\alpha^2}\\,d\\alpha',
            valueLatex: '\\frac{\\pi}{2} e^{-ax} \\quad (x > 0)',
            methodNoteFa: 'انتگرال لاپلاس سینوسی از روی نمایش انتگرال فوریه فرد.',
          },
        ],
        integralEquationConnectionFa:
          'معادله انتگرالی سینوسی: حل معادله $\\int_0^\\infty u(\\alpha)\\sin(\\alpha x)d\\alpha = e^{-ax}$ به جواب $u(\\alpha) = \\frac{2\\alpha}{\\pi(a^2 + \\alpha^2)}$ می‌انجامد.',
        decayOrderNoteFa:
          'ضریب $B(\\alpha) = \\mathcal{O}(1/\\alpha)$ به دلیل پرش در مبدأ با آهنگ ملایم افت می‌کند و انتگرال جزئی پیرامون $x=0$ دارای نوسان گیبس است.',
      };

    case 'gaussian':
      return {
        presetId: 'gaussian',
        titleFa: 'تابع زنگوله‌ای گوسین $f(x) = e^{-ax^2}$ (پاسخ بنیادین معادله گرما)',
        functionDefinitionLatex:
          'f(x) = e^{-ax^2} \\quad (a > 0, \\; -\\infty < x < \\infty)',
        symmetryTypeFa: 'تابع زوج بی‌نهایت‌بار مشتق‌پذیر (Smooth & Even)',
        symmetryReasonFa:
          'تابع در تمام محور حقیقی بی‌نهایت‌بار پیوسته و مشتق‌پذیر است. بنابراین $B(\\alpha) = 0$ و تبدیل فوریه گوسین باز هم یک تابع گوسین در فرکانس است!',
        A_alphaDerivationLatex:
          'A(\\alpha) = \\frac{2}{\\pi}\\int_{0}^{\\infty} e^{-at^2}\\cos(\\alpha t)\\,dt = \\frac{1}{\\sqrt{\\pi a}} e^{-\\alpha^2 / (4a)}',
        B_alphaDerivationLatex:
          'B(\\alpha) = 0 \\quad (\\text{تابع زوج است})',
        integralRepresentationLatex:
          'e^{-ax^2} = \\frac{1}{\\sqrt{\\pi a}}\\int_{0}^{\\infty} e^{-\\alpha^2 / (4a)} \\cos(\\alpha x)\\,d\\alpha',
        dirichletConvergencePoints: [
          {
            pointLabelFa: 'مبدأ مختصات ($x_0 = 0$)',
            pointLatex: 'x_0 = 0',
            leftLimitLatex: '1',
            rightLimitLatex: '1',
            averageSumLatex: '1',
            resultingImproperIntegralLatex:
              '\\int_{0}^{\\infty} e^{-\\alpha^2 / (4a)}\\,d\\alpha = \\frac{\\sqrt{\\pi}}{2} \\sqrt{4a} = \\sqrt{\\pi a}',
          },
        ],
        parsevalApplicationLatex:
          '\\begin{aligned} \\frac{1}{\\pi}\\int_{-\\infty}^{\\infty} e^{-2ax^2}\\,dx &= \\frac{1}{\\pi}\\sqrt{\\frac{\\pi}{2a}} = \\frac{1}{\\sqrt{2\\pi a}} = \\int_0^\\infty A^2(\\alpha)\\,d\\alpha = \\frac{1}{\\pi a}\\int_0^\\infty e^{-\\alpha^2 / (2a)}\\,d\\alpha \\\\ &= \\frac{1}{\\pi a}\\frac{\\sqrt{2\\pi a}}{2} = \\frac{1}{\\sqrt{2\\pi a}} \\end{aligned}',
        improperIntegralsExtracted: [
          {
            integralLatex: '\\int_{0}^{\\infty} e^{-\\alpha^2 / (4a)} \\cos(\\alpha x)\\,d\\alpha',
            valueLatex: '\\sqrt{\\pi a} e^{-ax^2}',
            methodNoteFa: 'انتگرال مشهور پواسون-گوسین در حل معادله گرمای نامتناهی.',
          },
        ],
        integralEquationConnectionFa:
          'تابع ویژه تبدیل فوریه: تابع گوسین تابع ویژه تبدیل فوریه است، یعنی پاسخ معادله انتگرالی $\\int_0^\\infty u(\\alpha)\\cos(\\alpha x)d\\alpha = e^{-x^2/2}$ خود یک گوسین است.',
        decayOrderNoteFa:
          'ضرایب طیفی با سرعت نمایی $\\mathcal{O}(e^{-\\alpha^2/(4a)})$ افت می‌کنند که سریع‌ترین همگرایی ممکن در آنالیز فوریه است!',
      };
  }
}

export interface FourierIntegralConvergencePoint {
  omega: number;
  partialIntegralAtProbe: number;
  dirichletTarget: number;
  absErrorAtProbe: number;
  cumulativeEnergy: number;
  energyRatioPercent: number;
  spectralDensityA: number;
  spectralDensityB: number;
  spectralMagnitude: number;
}

export interface FourierIntegralConvergenceTrajectory {
  probeX: number;
  exactLeftLimit: number;
  exactRightLimit: number;
  dirichletTargetAtProbe: number;
  totalEnergyLHS: number;
  points: FourierIntegralConvergencePoint[];
}

/**
 * Computes convergence of Partial Fourier Integral I_Omega(x_0) as Omega increases from 1 to maxOmega.
 * Also tracks cumulative spectral energy int_0^Omega [A^2(alpha) + B^2(alpha)] d_alpha.
 */
export function computeFourierIntegralConvergenceTrajectory(params: {
  presetId: FourierIntegralPresetId;
  paramA: number;
  maxOmega: number;
  probeX: number;
  stepOmega?: number;
}): FourierIntegralConvergenceTrajectory {
  const { presetId, paramA, maxOmega, probeX, stepOmega = 1 } = params;
  const a = Math.max(0.2, paramA);
  const delta = 1e-4;

  const pairLeft = evaluateTransformPair(
    presetId === 'sign_damped' ? 'one_sided_exp' : (presetId as TransformPresetId),
    probeX - delta,
    a,
    0,
    0
  );
  const pairRight = evaluateTransformPair(
    presetId === 'sign_damped' ? 'one_sided_exp' : (presetId as TransformPresetId),
    probeX + delta,
    a,
    0,
    0
  );

  let exactLeftLimit = pairLeft.fx;
  let exactRightLimit = pairRight.fx;

  if (presetId === 'sign_damped') {
    exactLeftLimit = (probeX - delta) > 0 ? Math.exp(-a * (probeX - delta)) : -Math.exp(a * (probeX - delta));
    exactRightLimit = (probeX + delta) > 0 ? Math.exp(-a * (probeX + delta)) : -Math.exp(a * (probeX + delta));
  }

  const dirichletTargetAtProbe = 0.5 * (exactLeftLimit + exactRightLimit);

  // Compute total energy (1/pi) int_{-infty}^infty f(x)^2 dx
  let totalEnergyLHS = 0;
  switch (presetId) {
    case 'rect_pulse':
      totalEnergyLHS = (2 * a) / Math.PI;
      break;
    case 'two_sided_exp':
      totalEnergyLHS = 1 / (Math.PI * a);
      break;
    case 'one_sided_exp':
      totalEnergyLHS = 1 / (2 * Math.PI * a);
      break;
    case 'triangle_pulse':
      totalEnergyLHS = (2 * a) / (3 * Math.PI);
      break;
    case 'sign_damped':
      totalEnergyLHS = 1 / (Math.PI * a);
      break;
    case 'gaussian':
      totalEnergyLHS = 1 / Math.sqrt(2 * Math.PI * a);
      break;
  }

  const points: FourierIntegralConvergencePoint[] = [];
  const steps = Math.max(5, Math.floor(maxOmega / stepOmega));

  for (let i = 1; i <= steps; i++) {
    const omega = Math.min(maxOmega, i * stepOmega);

    // Compute I_Omega(probeX)
    let approxVal = 0;
    if (presetId === 'sign_damped') {
      approxVal = integrateSimpson(
        (alpha) => {
          const B = (2 * alpha) / (Math.PI * (a * a + alpha * alpha));
          return B * Math.sin(alpha * probeX);
        },
        0,
        omega,
        140
      );
    } else {
      approxVal = evaluatePartialFourierIntegral(
        presetId as TransformPresetId,
        probeX,
        a,
        omega
      );
    }

    // Cumulative energy up to omega
    let cumulativeEnergy = 0;
    if (presetId === 'sign_damped') {
      cumulativeEnergy = integrateSimpson(
        (alpha) => {
          const B = (2 * alpha) / (Math.PI * (a * a + alpha * alpha));
          return B * B;
        },
        0,
        omega,
        140
      );
    } else {
      cumulativeEnergy = integrateSimpson(
        (alpha) => {
          const pair = evaluateTransformPair(presetId as TransformPresetId, alpha, a, 0, 0);
          return pair.A_alpha * pair.A_alpha + pair.B_alpha * pair.B_alpha;
        },
        0,
        omega,
        140
      );
    }

    const energyRatioPercent =
      totalEnergyLHS > 1e-9
        ? Math.min(100, Math.max(0, (cumulativeEnergy / totalEnergyLHS) * 100))
        : 100;

    const currentPair =
      presetId === 'sign_damped'
        ? {
            A_alpha: 0,
            B_alpha: (2 * omega) / (Math.PI * (a * a + omega * omega)),
            absFAlpha: (2 * Math.PI * omega) / (a * a + omega * omega),
          }
        : evaluateTransformPair(presetId as TransformPresetId, omega, a, 0, 0);

    points.push({
      omega: Number(omega.toFixed(1)),
      partialIntegralAtProbe: Number(approxVal.toFixed(5)),
      dirichletTarget: Number(dirichletTargetAtProbe.toFixed(5)),
      absErrorAtProbe: Number(Math.abs(approxVal - dirichletTargetAtProbe).toFixed(5)),
      cumulativeEnergy: Number(cumulativeEnergy.toFixed(5)),
      energyRatioPercent: Number(energyRatioPercent.toFixed(2)),
      spectralDensityA: Number(currentPair.A_alpha.toFixed(5)),
      spectralDensityB: Number(currentPair.B_alpha.toFixed(5)),
      spectralMagnitude: Number((currentPair.absFAlpha / Math.PI).toFixed(5)),
    });
  }

  return {
    probeX,
    exactLeftLimit: Number(exactLeftLimit.toFixed(4)),
    exactRightLimit: Number(exactRightLimit.toFixed(4)),
    dirichletTargetAtProbe: Number(dirichletTargetAtProbe.toFixed(4)),
    totalEnergyLHS: Number(totalEnergyLHS.toFixed(5)),
    points,
  };
}

/**
 * Normalizes mathematical formulas and LaTeX strings:
 * - Collapses accidental double-escaped backslashes (\\Omega -> \Omega, \\Delta -> \Delta)
 * - Ensures proper KaTeX brace wrapping for subscripts (I_\Omega -> I_{\Omega}, x_0 -> x_{0})
 * - Maps Unicode math symbols (Ω, Δ, α, π, ≤, ≥, etc.) to standard LaTeX commands
 */
export function normalizeToLatex(input: string): string {
  if (!input) return '';
  // Collapse accidental double backslashes before LaTeX commands or symbols
  // (e.g., \\Omega -> \Omega, \\Delta -> \Delta, \\alpha -> \alpha, \\ge -> \ge)
  let clean = input.replace(/\\\\([a-zA-Z]+|[,\.;:!\{\}\[\]\(\)])/g, (_m, p1) => '\\' + p1);

  // Ensure subscript Omega and x_0 have braces for KaTeX
  clean = clean
    .replace(/I_\\Omega(?=[^a-zA-Z]|$)/g, 'I_{\\Omega}')
    .replace(/I_Ω(?=[^a-zA-Z]|$)/gu, 'I_{\\Omega}')
    .replace(/x_0(?=[^a-zA-Z]|$)/g, 'x_{0}')
    .replace(/x₀/g, 'x_{0}');

  return clean
    .replace(/≃/g, '\\simeq ')
    .replace(/⇒/g, '\\implies ')
    .replace(/⇔/g, '\\iff ')
    .replace(/≠/g, '\\neq ')
    .replace(/≤/g, '\\le ')
    .replace(/≥/g, '\\ge ')
    .replace(/∞/g, '\\infty ')
    .replace(/π/g, '\\pi ')
    .replace(/α/g, '\\alpha ')
    .replace(/λ/g, '\\lambda ')
    .replace(/μ/g, '\\mu ')
    .replace(/ω/g, '\\omega ')
    .replace(/Ω/g, '\\Omega ')
    .replace(/Δ/g, '\\Delta ')
    .replace(/φ/g, '\\varphi ')
    .replace(/ψ/g, '\\psi ')
    .replace(/ℓ/g, '\\ell ')
    .replace(/ℱ/g, '\\mathcal{F}')
    .replace(/∑/g, '\\sum')
    .replace(/∫/g, '\\int')
    .replace(/√\(([^)]+)\)/g, '\\sqrt{$1}')
    .replace(/√([a-zA-Z0-9\\]+)/g, '\\sqrt{$1}')
    .replace(/‖([^‖]+)‖/g, '\\left\\|$1\\right\\|')
    .replace(/⟨([^⟩]+)⟩/g, '\\left\\langle $1 \\right\\rangle ')
    .replace(/½/g, '\\frac{1}{2}')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/⁴/g, '^4')
    .replace(/₀/g, '_0')
    .replace(/₁/g, '_1')
    .replace(/₂/g, '_2');
}




