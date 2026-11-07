'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Eye,
  Lightbulb,
  CheckCircle2,
  Sliders,
  BookOpen,
  Bot,
} from 'lucide-react';
import { WorkedExample } from '@/lib/curriculum-data';
import MathFormula, { MathText } from './MathFormula';

interface StepByStepSolverProps {
  examples: WorkedExample[];
  moduleTitle: string;
  completedExamples?: string[];
  onToggleExampleMastery?: (exampleId: string) => void;
  onAskAIAboutStep?: (promptText: string) => void;
}

/**
 * Interactive Step-by-Step Equation Derivation & Custom Parameter Solver
 * Uses KaTeX (MathFormula & MathText) for standard mathematical typesetting
 * and shows every intermediate calculus & algebraic step without skipping.
 */
export default function StepByStepSolver({
  examples,
  moduleTitle,
  completedExamples = [],
  onToggleExampleMastery,
  onAskAIAboutStep,
}: StepByStepSolverProps) {
  const [selectedExampleIdx, setSelectedExampleIdx] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [showAllSteps, setShowAllSteps] = useState(true);
  const [showWhyHint, setShowWhyHint] = useState<Record<number, boolean>>({});
  const [solverMode, setSolverMode] = useState<'curated' | 'custom_generator'>('curated');

  // Custom interactive equation generator state
  const [customSolverType, setCustomSolverType] = useState<
    | 'heat_1d'
    | 'sturm_liouville'
    | 'fourier_half_range'
    | 'fourier_full_cosine'
    | 'fourier_transform_pulse'
  >('heat_1d');
  const [customLengthL, setCustomLengthL] = useState<number>(3);
  const [customDiffusivityK, setCustomDiffusivityK] = useState<number>(2);
  const [customModeN, setCustomModeN] = useState<number>(2);
  const [customAmplitudeA, setCustomAmplitudeA] = useState<number>(5);
  const [customGenStep, setCustomGenStep] = useState<number>(5);

  const activeExample = examples[selectedExampleIdx] || examples[0];
  const totalSteps = activeExample ? activeExample.steps.length : 1;

  const handleSelectExample = (idx: number) => {
    setSelectedExampleIdx(idx);
    setCurrentStep(1);
    setShowAllSteps(true);
  };

  const visibleSteps = showAllSteps
    ? activeExample.steps
    : activeExample.steps.slice(0, currentStep);

  // Fully expanded 5-step derivations for the custom parameter equation solver
  const customGeneratedSteps = (() => {
    const L = customLengthL;
    const k = customDiffusivityK;
    const n = customModeN;
    const A = customAmplitudeA;
    const kSq = k * k;

    if (customSolverType === 'heat_1d') {
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

    if (customSolverType === 'sturm_liouville') {
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

    if (customSolverType === 'fourier_full_cosine') {
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

    if (customSolverType === 'fourier_transform_pulse') {
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
  })();

  const isCurrentExampleMastered =
    activeExample && completedExamples.includes(activeExample.id);

  return (
    <section
      aria-label="حل گام‌به‌گام تعاملی معادلات"
      className="rounded-xl border border-[#E2E8F0] bg-white shadow-xs"
    >
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0284C7] text-white">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">
              موتور حل تشریحی و گام‌به‌گام معادلات (<MathText text={moduleTitle} />)
            </h3>
            <p className="text-xs text-[#475569]">
              تمامی مراحل انتگرال‌گیری جزء به جزء، جایگذاری حدود و ساده‌سازی‌های مثلثاتی به صورت کامل و استاندارد نمایش داده شده‌اند
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white p-1">
          <button
            type="button"
            onClick={() => setSolverMode('curated')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              solverMode === 'curated'
                ? 'bg-[#0284C7] text-white'
                : 'text-[#475569] hover:bg-[#F1F5F9]'
            }`}
          >
            مثال‌های تشریحی جزوه ({examples.length})
          </button>
          <button
            type="button"
            onClick={() => setSolverMode('custom_generator')}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              solverMode === 'custom_generator'
                ? 'bg-[#0284C7] text-white'
                : 'text-[#475569] hover:bg-[#F1F5F9]'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            حل‌گر پارامتریک دلخواه
          </button>
        </div>
      </div>

      {solverMode === 'curated' ? (
        <div className="p-5">
          {/* Example Selector Tabs */}
          <div className="mb-4 flex flex-wrap gap-2">
            {examples.map((ex, idx) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => handleSelectExample(idx)}
                className={`rounded-lg border px-3.5 py-2.5 text-right text-xs font-medium transition-all ${
                  selectedExampleIdx === idx
                    ? 'border-[#0284C7] bg-[#F0F9FF] text-[#0369A1] shadow-2xs'
                    : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:border-[#CBD5E1]'
                }`}
              >
                <span className="block font-bold">
                  <MathText text={ex.title} />
                </span>
                <span className="mt-1 block text-[11px] opacity-80">
                  {ex.pdfReference} • سطح: {ex.difficulty} • ({ex.steps.length} گام کامل)
                </span>
              </button>
            ))}
          </div>

          {/* Problem Statement Box */}
          <div className="mb-5 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-[#0369A1]">
                صورت مسئله ({activeExample.pdfReference}):
              </span>
              <div className="flex items-center gap-2">
                {onToggleExampleMastery && (
                  <button
                    type="button"
                    onClick={() => onToggleExampleMastery(activeExample.id)}
                    className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
                      isCurrentExampleMastered
                        ? 'border-[#059669] bg-[#ECFDF5] text-[#065F46]'
                        : 'border-[#CBD5E1] bg-white text-[#475569] hover:border-[#0284C7] hover:text-[#0284C7]'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>
                      {isCurrentExampleMastered
                        ? 'تسلط بر این مثال ثبت شد'
                        : 'ثبت تسلط بر این مثال'}
                    </span>
                  </button>
                )}
                <span className="text-xs font-medium text-[#64748B]">
                  نمایش گام {showAllSteps ? totalSteps : currentStep} از {totalSteps}
                </span>
              </div>
            </div>
            <p className="mb-3 text-sm leading-7 text-[#0F172A]">
              <MathText text={activeExample.problemStatement} />
            </p>
            <MathFormula formula={activeExample.problemFormula} block />
          </div>

          {/* Step-by-Step Controls Bar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!showAllSteps && currentStep <= 1}
                onClick={() => {
                  setShowAllSteps(false);
                  setCurrentStep((s) => Math.max(1, s - 1));
                }}
                className="flex items-center gap-1 rounded-md border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] transition hover:bg-[#F1F5F9] disabled:opacity-40"
              >
                <ChevronRight className="h-3.5 w-3.5" />
                گام قبلی
              </button>

              <button
                type="button"
                disabled={!showAllSteps && currentStep >= totalSteps}
                onClick={() => {
                  if (showAllSteps) {
                    setShowAllSteps(false);
                    setCurrentStep(1);
                  } else {
                    setCurrentStep((s) => Math.min(totalSteps, s + 1));
                  }
                }}
                className="flex items-center gap-1 rounded-md bg-[#0284C7] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0369A1] disabled:opacity-40"
              >
                گام بعدی
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAllSteps(false);
                  setCurrentStep(1);
                }}
                className="flex items-center gap-1 rounded-md border border-[#CBD5E1] bg-white px-2.5 py-1.5 text-xs font-medium text-[#475569] hover:bg-[#F1F5F9]"
                title="شروع از گام اول"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                شروع از گام ۱
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowAllSteps((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-md border border-[#0284C7]/30 bg-[#F0F9FF] px-3 py-1.5 text-xs font-semibold text-[#0369A1] hover:bg-[#E0F2FE]"
            >
              <Eye className="h-3.5 w-3.5" />
              {showAllSteps ? 'حالت مرور تک‌گام' : 'نمایش کامل تمام گام‌ها'}
            </button>
          </div>

          {/* Step Cards */}
          <div className="space-y-3.5">
            {visibleSteps.map((step, idx) => {
              const isLatest = idx === visibleSteps.length - 1;
              return (
                <div
                  key={step.stepNumber}
                  className={`rounded-xl border p-4 transition-all ${
                    isLatest
                      ? 'border-[#0284C7] bg-white shadow-xs'
                      : 'border-[#E2E8F0] bg-[#F8FAFC]/80'
                  }`}
                >
                  <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                          isLatest
                            ? 'bg-[#0284C7] text-white'
                            : 'bg-[#E2E8F0] text-[#475569]'
                        }`}
                      >
                        {step.stepNumber}
                      </span>
                      <h4 className="text-sm font-bold text-[#0F172A]">
                        <MathText text={step.title} />
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {step.whyHint && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowWhyHint((prev) => ({
                              ...prev,
                              [step.stepNumber]: !prev[step.stepNumber],
                            }))
                          }
                          className="flex items-center gap-1 rounded-md border border-[#D97706]/30 bg-[#FEF3C7]/60 px-2.5 py-1 text-[11px] font-semibold text-[#B45309] hover:bg-[#FEF3C7]"
                        >
                          <Lightbulb className="h-3 w-3" />
                          توضیح مفهومی و پایه
                        </button>
                      )}

                      {onAskAIAboutStep && (
                        <button
                          type="button"
                          onClick={() =>
                            onAskAIAboutStep(
                              `در مثال «${activeExample.title}»، لطفاً گام ${step.stepNumber} (${step.title}) و نحوه رسیدن به رابطه $$${step.formula}$$ را با جزئیات کامل ریاضی توضیح بده.`
                            )
                          }
                          className="flex items-center gap-1 rounded-md border border-[#0284C7]/30 bg-[#F0F9FF] px-2.5 py-1 text-[11px] font-semibold text-[#0369A1] hover:bg-[#E0F2FE]"
                        >
                          <Bot className="h-3 w-3" />
                          پرسش از AI درباره این گام
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="mb-2.5 text-sm leading-7 text-[#334155]">
                    <MathText text={step.explanation} />
                  </p>

                  <MathFormula formula={step.formula} block highlight={isLatest} />

                  {step.whyHint && showWhyHint[step.stepNumber] && (
                    <div className="mt-2.5 rounded-lg border border-[#F59E0B]/40 bg-[#FFFBEB] px-3.5 py-2.5 text-xs leading-6 text-[#92400E]">
                      <strong className="font-bold">توضیح پایه: </strong>
                      <MathText text={step.whyHint} />
                    </div>
                  )}

                  {step.highlightNote && (
                    <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-[#059669]/30 bg-[#ECFDF5] px-3.5 py-2.5 text-xs leading-6 text-[#065F46]">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#059669]" />
                      <MathText text={step.highlightNote} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Final Answer Banner when all steps reached */}
          {(showAllSteps || currentStep === totalSteps) && (
            <div className="mt-4 rounded-xl border border-[#059669]/40 bg-[#ECFDF5]/80 p-4">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-bold text-[#065F46]">
                <CheckCircle2 className="h-4 w-4 text-[#059669]" />
                جواب نهایی استخراج‌شده:
              </div>
              <MathFormula formula={activeExample.finalAnswerFormula} block />
            </div>
          )}
        </div>
      ) : (
        /* Custom Parametric Equation Solver */
        <div className="p-5">
          <div className="mb-4 grid grid-cols-1 gap-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-[#334155]">
                نوع مسئله مهندسی:
              </label>
              <select
                value={customSolverType}
                onChange={(e) =>
                  setCustomSolverType(
                    e.target.value as
                      | 'heat_1d'
                      | 'sturm_liouville'
                      | 'fourier_half_range'
                      | 'fourier_full_cosine'
                      | 'fourier_transform_pulse'
                  )
                }
                aria-label="نوع مسئله مهندسی"
                className="w-full rounded-lg border border-[#CBD5E1] bg-white px-2.5 py-2 text-xs font-medium text-[#0F172A]"
              >
                <option value="heat_1d">۱. معادله گرمای همگن میله (PDE)</option>
                <option value="sturm_liouville">۲. مسئله اشتورم-لیوویل اولر-کوشی</option>
                <option value="fourier_half_range">۳. سری فوریه سینوسی نیم‌دامنه</option>
                <option value="fourier_full_cosine">۴. سری فوریه کسینوسی زوج و پارسوال</option>
                <option value="fourier_transform_pulse">۵. تبدیل فوریه نمایی دوطرفه و پارسوال</option>
              </select>
            </div>

            <div>
              <label className="mb-1 flex justify-between text-xs font-bold text-[#334155]">
                <span>طول دامنه ($L$):</span>
                <span dir="ltr" className="font-mono text-[#0284C7]">
                  L = {customLengthL}
                </span>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={customLengthL}
                onChange={(e) => setCustomLengthL(Number(e.target.value))}
                className="w-full accent-[#0284C7]"
              />
            </div>

            <div>
              <label className="mb-1 flex justify-between text-xs font-bold text-[#334155]">
                <span>شماره مد / پارامتر ($n$):</span>
                <span dir="ltr" className="font-mono text-[#0284C7]">
                  n = {customModeN}
                </span>
              </label>
              <input
                type="range"
                min={1}
                max={6}
                step={1}
                value={customModeN}
                onChange={(e) => setCustomModeN(Number(e.target.value))}
                className="w-full accent-[#0284C7]"
              />
            </div>

            <div>
              <label className="mb-1 flex justify-between text-xs font-bold text-[#334155]">
                <span>ضریب پخش و دامنه ($k, A$):</span>
                <span dir="ltr" className="font-mono text-[#0284C7]">
                  k={customDiffusivityK}, A={customAmplitudeA}
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={customDiffusivityK}
                  onChange={(e) => setCustomDiffusivityK(Number(e.target.value))}
                  className="w-1/2 accent-[#0284C7]"
                  aria-label="ضریب k"
                />
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={customAmplitudeA}
                  onChange={(e) => setCustomAmplitudeA(Number(e.target.value))}
                  className="w-1/2 accent-[#059669]"
                  aria-label="دامنه A"
                />
              </div>
            </div>
          </div>

          <div className="mb-4 rounded-xl border border-[#0284C7]/30 bg-[#F0F9FF] p-3.5">
            <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-[#0369A1]">
              <span>معادله تولیدشده بر اساس پارامترهای انتخابی شما:</span>
              <div className="flex items-center gap-1.5">
                <span>نمایش تا گام:</span>
                {[1, 2, 3, 4, 5].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setCustomGenStep(st)}
                    className={`rounded px-2 py-0.5 text-xs ${
                      customGenStep >= st
                        ? 'bg-[#0284C7] text-white'
                        : 'bg-white text-[#475569]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
            <MathFormula formula={customGeneratedSteps.problemHeader} block highlight />
          </div>

          <div className="space-y-3.5">
            {customGeneratedSteps.steps.slice(0, customGenStep).map((st) => (
              <div
                key={st.stepNumber}
                className="rounded-xl border border-[#E2E8F0] bg-white p-4 shadow-2xs"
              >
                <h4 className="mb-1.5 text-sm font-bold text-[#0F172A]">
                  <MathText text={st.title} />
                </h4>
                <p className="mb-2 text-xs leading-6 text-[#475569]">
                  <MathText text={st.explanation} />
                </p>
                <MathFormula formula={st.formula} block />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
