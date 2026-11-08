'use client';

import React, { useState, useMemo } from 'react';
import {
  SturmLiouvilleCaseId,
  STURM_LIOUVILLE_TABLE_4,
  computeSturmLiouvilleIntegratingFactorExample,
  computeSLEigenfunctionData,
  solveSturmLiouvilleCase,
} from '@/lib/math-engine';
import MathFormula, { MathText } from './MathFormula';
import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  FileText,
  HelpCircle,
  Layers,
  RotateCcw,
  Sliders,
  Lightbulb,
  TrendingUp,
  Waves,
  XCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

export type SturmLiouvilleTabId =
  | 'visualizer'
  | 'table4'
  | 'integrating_factor'
  | 'step_by_step';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const SL_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'sl_q1',
    question:
      'در مسئله اشتورم-لیوویل استاندارد $[r(x)y\']\' + [\\lambda p(x) + q(x)]y = 0$، شرط تعامد دو تابع ویژه $y_m(x)$ و $y_n(x)$ با مقادیر ویژه متمایز $\\lambda_m \\neq \\lambda_n$ روی بازه $[a, b]$ با کدام تابع وزن برقرار است؟',
    options: [
      '\\int_a^b r(x)\\,y_m(x)\\,y_n(x)\\,dx = 0',
      '\\int_a^b p(x)\\,y_m(x)\\,y_n(x)\\,dx = 0',
      '\\int_a^b q(x)\\,y_m(x)\\,y_n(x)\\,dx = 0',
      '\\int_a^b [p(x) + q(x)]\\,y_m(x)\\,y_n(x)\\,dx = 0',
    ],
    correctIndex: 1,
    explanation:
      'طبق قضیه بنیادی اشتورم-لیوویل، تابع وزن تعامد $p(x)$ ضریب پارامتر مقدار ویژه $\\lambda$ است. یعنی تعامد همواره به صورت $\\langle y_m, y_n \\rangle_p = \\int_a^b p(x) y_m y_n dx = 0$ تعریف می‌شود.',
  },
  {
    id: 'sl_q2',
    question:
      'برای معادله دیفرانسیل $x^2 y\'\' + 3x y\' + \\lambda y = 0$ در بازه $[1, e]$ (مثال ۴۱ جزوه)، تابع وزن تعامد $p(x)$ و فرم خودالحاقی کدام است؟',
    options: [
      'p(x) = 1 \\quad , \\quad [x^2 y\']\' + \\lambda y = 0',
      'p(x) = x \\quad , \\quad [x^3 y\']\' + \\lambda x y = 0',
      'p(x) = x^3 \\quad , \\quad [x y\']\' + \\lambda x^3 y = 0',
      'p(x) = \\frac{1}{x} \\quad , \\quad [x y\']\' + \\frac{\\lambda}{x} y = 0',
    ],
    correctIndex: 1,
    explanation:
      'عامل انتگرال‌ساز برابر است با $\\mu(x) = \\frac{1}{x^2} \\exp\\left(\\int \\frac{3x}{x^2}dx\\right) = \\frac{x^3}{x^2} = x$. با ضرب کل معادله در $x$ به فرم $[x^3 y\']\' + \\lambda x y = 0$ می‌رسیم، بنابراین $r(x) = x^3$ و تابع وزن تعامد $p(x) = x$ است.',
  },
  {
    id: 'sl_q3',
    question:
      'در مسئله مقدار مرزی $y\'\' + \\lambda y = 0$ روی بازه $[0, L]$، در کدام شرایط مرزی مقدار $\\lambda_0 = 0$ یک مقدار ویژه معتبر با تابع ویژه ثابت غیرصفر $y_0 = 1$ است؟',
    options: [
      'y(0) = 0 \\; , \\; y(L) = 0 \\text{ (دیریکله همگن)}',
      'y\'(0) = 0 \\; , \\; y\'(L) = 0 \\text{ (نیومن همگن)}',
      'y(0) = 0 \\; , \\; y\'(L) = 0 \\text{ (مختلط ۱)}',
      'y\'(0) = 0 \\; , \\; y(L) = 0 \\text{ (مختلط ۲)}',
    ],
    correctIndex: 1,
    explanation:
      'به ازای $\\lambda = 0$ جواب کلی $y(x) = Ax + B$ و مشتق آن $y\'(x) = A$ است. در شرایط نیومن $y\'(0)=A=0$ و $y\'(L)=A=0$، مقدار $B$ دلخواه می‌ماند و $y(x) = B \\neq 0$ (یا نرمال‌شده $y_0 = 1$) یک جواب غیربدیهی معتبر است. در بقیه حالات، شرط صفر بودن خود تابع $y(0)=0$ یا $y(L)=0$ هر دو ضریب را صفر کرده و جواب فقط بدیهی $y \\equiv 0$ می‌شود.',
  },
  {
    id: 'sl_q4',
    question:
      'طبق قضیه نوسان و جداسازی ریشه‌های اشتورم (Sturm Oscillation Theorem)، تابع ویژه $n$-ام ($n \\ge 1$) در یک مسئله اشتورم-لیوویل منظم درون بازه باز مرزی $(0, L)$ دارای چند ریشه (گره) است؟',
    options: [
      'دقیقاً $n$ ریشه',
      'دقیقاً $n - 1$ ریشه',
      'دقیقاً $2n$ ریشه',
      'هیچ ریشه‌ای ندارد',
    ],
    correctIndex: 1,
    explanation:
      'قضیه نوسان اشتورم بیان می‌کند که تابع ویژه اول ($n=1$) در داخل بازه بدون ریشه است، تابع ویژه دوم ($n=2$) دقیقاً ۱ ریشه در داخل بازه دارد، و به طور کلی تابع ویژه $n$-ام دارای دقیقاً $n - 1$ ریشه در داخل بازه باز $(a, b)$ است و ریشه‌های دو تابع ویژه متوالی یکی در میان قرار می‌گیرند.',
  },
  {
    id: 'sl_q5',
    question:
      'برای شرایط مرزی مختلط $y(0) = 0$ و $y\'(L) = 0$، مقادیر ویژه $\\lambda_n$ بر حسب طول بازه $L$ چگونه بیان می‌شوند؟',
    options: [
      '\\lambda_n = \\left(\\frac{n\\pi}{L}\\right)^2',
      '\\lambda_n = \\left(\\frac{(2n-1)\\pi}{2L}\\right)^2',
      '\\lambda_n = \\left(\\frac{2n\\pi}{L}\\right)^2',
      '\\lambda_n = \\frac{(2n-1)\\pi}{L}',
    ],
    correctIndex: 1,
    explanation:
      'از شرط $y(0) = 0$ جواب به صورت $y(x) = c_2 \\sin(\\alpha x)$ محدود می‌شود. مشتق آن $y\'(x) = \\alpha c_2 \\cos(\\alpha x)$ است. با اعمال شرط $y\'(L) = 0$ داریم $\\cos(\\alpha L) = 0$ که ریشه‌های کسینوس مضارب فرد $\\pi/2$ هستند: $\\alpha_n L = \\frac{(2n-1)\\pi}{2} \\implies \\lambda_n = \\alpha_n^2 = \\left(\\frac{(2n-1)\\pi}{2L}\\right)^2$.',
  },
  {
    id: 'sl_q6',
    question:
      'تفاوت بنیادین یک مسئله اشتورم-لیوویل منظم (Regular) با مسئله غیرمنظم/تکین (Singular) مانند لژاندر یا بسل چیست؟',
    options: [
      'در مسئله منظم، مقادیر ویژه موهومی محض هستند اما در تکین حقیقی‌اند.',
      'در مسئله منظم بازه $[a, b]$ متناهی و توابع $r(x), p(x) > 0$ در کل بازه اکیداً مثبت و پیوسته‌اند؛ در حالی که در تکین بازه نامتناهی است یا $r(x)$ در نقاط انتهایی صفر می‌شود.',
      'مسئله منظم شرایط مرزی ندارد اما مسئله تکین دارد.',
      'مسئله منظم فقط با توابع نمایی حل می‌شود.',
    ],
    correctIndex: 1,
    explanation:
      'در مسئله اشتورم-لیوویل منظم، بازه متناهی $[a, b]$ است و $r(x) > 0$ و $p(x) > 0$ هیچ‌گاه صفر نمی‌شوند. در معادلات لژاندر $(1-x^2)$ و چبیشف در مرزهای $x=\\pm 1$ ضریب $r(x)$ صفر می‌شود و در معادله بسل در $x=0$ ضریب صفر می‌شود؛ لذا به این معادلات اشتورم-لیوویل تکین (Singular) می‌گویند.',
  },
];

export default function SturmLiouvilleStage() {
  const [activeTab, setActiveTab] = useState<SturmLiouvilleTabId>('visualizer');
  const [selectedCaseId, setSelectedCaseId] =
    useState<SturmLiouvilleCaseId>('case_a_dirichlet');
  const [domainLengthL, setDomainLengthL] = useState<number>(3.0);
  const [modeN, setModeN] = useState<number>(2);
  const [showCompanionMode, setShowCompanionMode] = useState<boolean>(true);
  const [showWeightedProduct, setShowWeightedProduct] = useState<boolean>(true);

  // Integrating factor lab selected ODE
  const [selectedOdeType, setSelectedOdeType] = useState<
    'euler' | 'legendre' | 'bessel' | 'chebyshev' | 'hermite' | 'constant'
  >('euler');

  // Quiz interactive state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Compute live eigenfunction simulation data
  const simData = useMemo(() => {
    return computeSLEigenfunctionData(
      selectedCaseId,
      domainLengthL,
      modeN,
      130
    );
  }, [selectedCaseId, domainLengthL, modeN]);

  // Current Table 4 entry
  const currentTableEntry = useMemo(() => {
    return (
      STURM_LIOUVILLE_TABLE_4.find((c) => c.id === selectedCaseId) ||
      STURM_LIOUVILLE_TABLE_4[0]
    );
  }, [selectedCaseId]);

  // Current Integrating Factor ODE computation
  const integratingFactorData = useMemo(() => {
    return computeSturmLiouvilleIntegratingFactorExample(selectedOdeType);
  }, [selectedOdeType]);

  const handleSelectQuizOption = (qId: string, optIdx: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
  };

  const quizScore = useMemo(() => {
    let correct = 0;
    SL_QUIZ_QUESTIONS.forEach((q) => {
      if (quizAnswers[q.id] === q.correctIndex) correct++;
    });
    return correct;
  }, [quizAnswers]);

  return (
    <div className="bg-surface border border-line rounded-xl overflow-hidden text-ink transition-colors">
      {/* Stage Header */}
      <div className="border-b border-line bg-panel px-6 py-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-solid text-white flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent-tint text-accent-deep">
                  بخش ۵: مسئله اشتورم-لیوویل (Sturm-Liouville)
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-ok-tint text-ok-ink">
                  جدول ۴ جزوه و فرم خودالحاقی
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black mt-1 text-ink">
                پایگاه جامع آموزش و شبیه‌سازی مقادیر ویژه و تعامد اشتورم-لیوویل
              </h2>
            </div>
          </div>

          {/* Quick Stats or Domain badge */}
          <div className="flex items-center gap-2 text-xs">
            <div className="bg-surface/80 dark:bg-muted/80 backdrop-blur px-3 py-1.5 rounded-lg border border-line">
              <span className="text-ink-4">فرمول خودالحاقی: </span>
              <span className="font-mono font-bold text-accent">
                [r(x)y&apos;]&apos; + [λp(x)+q(x)]y = 0
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setActiveTab('visualizer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 ${
              activeTab === 'visualizer'
                ? 'bg-accent-solid text-white shadow-md'
                : 'bg-surface text-ink-2 hover:bg-muted border border-line'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>۱. شبیه‌ساز مقادیر و توابع ویژه (Visualizer)</span>
          </button>

          <button
            onClick={() => setActiveTab('table4')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 ${
              activeTab === 'table4'
                ? 'bg-accent-solid text-white shadow-md'
                : 'bg-surface text-ink-2 hover:bg-muted border border-line'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>۲. جدول ۴ جامع جزوه (۵ حالت مرزی)</span>
          </button>

          <button
            onClick={() => setActiveTab('integrating_factor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 ${
              activeTab === 'integrating_factor'
                ? 'bg-accent-solid text-white shadow-md'
                : 'bg-surface text-ink-2 hover:bg-muted border border-line'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>۳. آزمایشگاه فرم خودالحاقی و عامل انتگرال‌ساز μ(x)</span>
          </button>

          <button
            onClick={() => setActiveTab('step_by_step')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 ${
              activeTab === 'step_by_step'
                ? 'bg-accent-solid text-white shadow-md'
                : 'bg-surface text-ink-2 hover:bg-muted border border-line'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>۴. تحلیل ۳ حالته علامت λ و آزمونک مفهومی</span>
          </button>
        </div>
      </div>

      {/* Main Tab Contents */}
      <div className="p-6">
        {/* ========================================================================= */}
        {/* TAB 1: VISUALIZER */}
        {/* ========================================================================= */}
        {activeTab === 'visualizer' && (
          <div className="space-y-6">
            {/* Top Config Grid: Case Picker + Sliders */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Case Picker (4 cols) */}
              <div className="lg:col-span-5 bg-panel rounded-xl p-4 border border-line flex flex-col justify-between">
                <div>
                  <label className="block text-xs font-bold text-ink-4 mb-2">
                    انتخاب مسئله مقدار مرزی (از جدول ۴ جزوه):
                  </label>
                  <div className="space-y-1.5">
                    {STURM_LIOUVILLE_TABLE_4.map((c) => {
                      const isSelected = c.id === selectedCaseId;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setSelectedCaseId(c.id)}
                          className={`w-full text-right px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between border ${
                            isSelected
                              ? 'bg-accent-solid text-white border-accent shadow-sm font-bold'
                              : 'bg-surface text-ink-2 border-line hover:bg-muted'
                          }`}
                        >
                          <span className="truncate">{c.nameFa}</span>
                          <span
                            className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                              isSelected
                                ? 'bg-accent-solid text-white'
                                : 'bg-muted text-ink-4'
                            }`}
                          >
                            {c.id === 'case_a_dirichlet'
                              ? 'y(0)=y(L)=0'
                              : c.id === 'case_b_neumann'
                              ? "y'(0)=y'(L)=0"
                              : c.id === 'case_c_periodic'
                              ? 'Periodic'
                              : c.id === 'case_d_dirichlet_neumann'
                              ? "y(0)=y'(L)=0"
                              : "y'(0)=y(L)=0"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-line text-[11px] text-ink-4">
                  <span className="font-semibold text-ink-2">وضعیت λ₀ = 0: </span>
                  {currentTableEntry.lambdaZeroStatusFa}
                </div>
              </div>

              {/* Sliders & Toggles (7 cols) */}
              <div className="lg:col-span-7 bg-panel rounded-xl p-4 border border-line flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Length L slider */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                      <span className="text-ink-2">
                        طول دامنه مرزی (L):
                      </span>
                      <span className="font-mono text-accent text-sm">
                        L = {domainLengthL.toFixed(2)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={6}
                      step={0.25}
                      value={domainLengthL}
                      onChange={(e) => setDomainLengthL(parseFloat(e.target.value))}
                      className="w-full accent-accent h-2 bg-muted rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-ink-4 mt-0.5">
                      <span>L = ۱.۰</span>
                      <span>L = ۳.۰ (پیش‌فرض)</span>
                      <span>L = ۶.۰</span>
                    </div>
                  </div>

                  {/* Mode n slider */}
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                      <span className="text-ink-2">
                        شماره مد ویژه (n):
                      </span>
                      <span className="font-mono text-accent text-sm">
                        n = {modeN}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={8}
                      step={1}
                      value={modeN}
                      onChange={(e) => setModeN(parseInt(e.target.value))}
                      className="w-full accent-accent h-2 bg-muted rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-ink-4 mt-0.5">
                      <span>n = ۱ (مد پایه / فوندامنتال)</span>
                      <span>n = ۴</span>
                      <span>n = ۸ (فرکانس بالا)</span>
                    </div>
                  </div>

                  {/* Visualization Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <label className="flex items-center gap-2 p-2.5 rounded-lg bg-surface border border-line cursor-pointer select-none text-xs">
                      <input
                        type="checkbox"
                        checked={showCompanionMode}
                        onChange={(e) => setShowCompanionMode(e.target.checked)}
                        className="rounded text-ok focus:ring-ok w-4 h-4"
                      />
                      <span className="text-ink-2 font-medium">
                        نمایش تابع ویژه بعدی y<sub>{modeN + 1}</sub>(x)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-lg bg-surface border border-line cursor-pointer select-none text-xs">
                      <input
                        type="checkbox"
                        checked={showWeightedProduct}
                        onChange={(e) => setShowWeightedProduct(e.target.checked)}
                        className="rounded text-warn focus:ring-warn w-4 h-4"
                      />
                      <span className="text-ink-2 font-medium">
                        نمایش حاصل‌ضرب تعامد p·y<sub>n</sub>·y<sub>n+1</sub>
                      </span>
                    </label>
                  </div>
                </div>

                {/* Analytical Formula Display */}
                <div className="mt-4 pt-3 border-t border-line bg-surface/60 dark:bg-panel/40 p-3 rounded-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-ink-4 block text-[11px]">
                        فرمول تحلیلی مقدار ویژه λ<sub>n</sub>:
                      </span>
                      <MathFormula
                        formula={currentTableEntry.eigenvaluesFormulaLatex}
                        className="text-xs font-bold text-accent-deep"
                      />
                    </div>
                    <div>
                      <span className="text-ink-4 block text-[11px]">
                        فرمول تحلیلی تابع ویژه y<sub>n</sub>(x):
                      </span>
                      <MathFormula
                        formula={currentTableEntry.eigenfunctionsFormulaLatex}
                        className="text-xs font-bold text-accent-deep"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Engineering Indicators Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Card 1: Eigenvalue Numerical */}
              <div className="bg-accent-soft/60 dark:bg-accent-soft/30 border border-accent-line rounded-xl p-3.5">
                <span className="text-[11px] font-bold text-accent-deep block">
                  مقدار ویژه عددی (λ<sub>{modeN}</sub>):
                </span>
                <div className="font-mono text-lg font-black text-accent-deep mt-0.5">
                  {simData.eigenpair.eigenvalueLambda.toFixed(4)}
                </div>
                <span className="text-[10px] text-accent block">
                  α<sub>{modeN}</sub> = √λ ≈ {simData.eigenpair.alphaRoot.toFixed(4)} rad/m
                </span>
              </div>

              {/* Card 2: Sturm Oscillation Nodes */}
              <div className="bg-accent-soft/60 dark:bg-accent-soft/30 border border-accent-line rounded-xl p-3.5">
                <span className="text-[11px] font-bold text-accent-deep block">
                  تعداد گره‌های داخلی (ریشه‌ها):
                </span>
                <div className="font-mono text-lg font-black text-accent-deep mt-0.5 flex items-baseline gap-1.5">
                  <span>{simData.interiorNodesCount}</span>
                  <span className="text-xs font-sans font-normal text-accent">
                    (قضیه نوسان: n - ۱)
                  </span>
                </div>
                <span className="text-[10px] text-accent block">
                  درون بازه باز (۰, L)
                </span>
              </div>

              {/* Card 3: Numerical Orthogonality Integral */}
              <div className="bg-ok-soft/60 dark:bg-ok-soft/30 border border-ok-line rounded-xl p-3.5">
                <span className="text-[11px] font-bold text-ok-ink block">
                  انتگرال ضرب داخلی تعامد ⟨y<sub>n</sub>, y<sub>n+1</sub>⟩:
                </span>
                <div className="font-mono text-lg font-black text-ok-ink mt-0.5">
                  {Math.abs(simData.numericalOrthogonalityIntegral) < 0.001
                    ? '۰.۰۰۰۰ ≈ ۰'
                    : simData.numericalOrthogonalityIntegral.toFixed(4)}
                </div>
                <span className="text-[10px] text-ok block">
                  ∫ p(x) y<sub>n</sub> y<sub>n+1</sub> dx = 0
                </span>
              </div>

              {/* Card 4: Norm Squared */}
              <div className="bg-accent-soft/60 dark:bg-accent-soft/30 border border-accent-line rounded-xl p-3.5">
                <span className="text-[11px] font-bold text-accent-deep block">
                  مربع نرم تابع ویژه (||y<sub>n</sub>||²):
                </span>
                <div className="font-mono text-lg font-black text-accent-deep mt-0.5">
                  {simData.orthogonalityNorm.toFixed(3)}
                </div>
                <span className="text-[10px] text-accent block">
                  {selectedCaseId === 'case_c_periodic' ? 'برابر L' : 'برابر L / ۲'}
                </span>
              </div>
            </div>

            {/* Recharts Simulation Canvas */}
            <div className="bg-surface border border-line rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent-solid"></div>
                  <h3 className="text-sm font-bold text-ink">
                    نمودار پاسخ توابع ویژه و بررسی تعامد هندسی
                  </h3>
                </div>
                <div className="text-xs text-ink-4 flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-accent-solid inline-block"></span>
                    y<sub>{modeN}</sub>(x) (مد جاری)
                  </span>
                  {showCompanionMode && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 bg-ok-solid inline-block border-b border-dashed border-ok"></span>
                      y<sub>{modeN + 1}</sub>(x) (مد متعامد)
                    </span>
                  )}
                  {showWeightedProduct && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-2 bg-warn-solid/40 inline-block rounded-xs"></span>
                      مساحت ضرب داخلی
                    </span>
                  )}
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={simData.points}
                    margin={{ top: 10, right: 15, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--chart-muted)"
                      opacity={0.25}
                    />
                    <XAxis
                      dataKey="x"
                      type="number"
                      domain={[simData.xStart, simData.xEnd]}
                      tickFormatter={(val) => val.toFixed(1)}
                      stroke="var(--chart-axis)"
                      fontSize={11}
                    />
                    <YAxis
                      domain={[-1.25, 1.25]}
                      tickFormatter={(val) => val.toFixed(1)}
                      stroke="var(--chart-axis)"
                      fontSize={11}
                    />
                    <Tooltip
                      formatter={(val: any, name: any) => {
                        const num = typeof val === 'number' ? val : Number(val);
                        const label =
                          name === 'yMain'
                            ? `y_${modeN}(x)`
                            : name === 'yNext'
                            ? `y_${modeN + 1}(x)`
                            : 'p(x)·y_n·y_{n+1}';
                        return [isNaN(num) ? '-' : num.toFixed(3), label];
                      }}
                      labelFormatter={(label) => `x = ${Number(label).toFixed(2)}`}
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderColor: 'var(--chart-axis)',
                        borderRadius: '8px',
                        color: '#f8fafc',
                        fontSize: '12px',
                        direction: 'ltr',
                      }}
                    />
                    <ReferenceLine y={0} stroke="var(--chart-axis)" strokeWidth={1.2} />

                    {/* Shaded Area for Weighted Product (Orthogonality Integral Visualizer) */}
                    {showWeightedProduct && (
                      <Area
                        type="monotone"
                        dataKey="weightedProduct"
                        fill="var(--chart-warn)"
                        stroke="var(--chart-warn)"
                        fillOpacity={0.25}
                        strokeWidth={1}
                        name="weightedProduct"
                      />
                    )}

                    {/* Companion Mode y_{n+1} */}
                    {showCompanionMode && (
                      <Line
                        type="monotone"
                        dataKey="yNext"
                        stroke="var(--chart-ok)"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={false}
                        name="yNext"
                      />
                    )}

                    {/* Main Mode y_n */}
                    <Line
                      type="monotone"
                      dataKey="yMain"
                      stroke="var(--chart-accent)"
                      strokeWidth={2.5}
                      dot={false}
                      name="yMain"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Graphical Interpretation Footer */}
              <div className="mt-3 p-3 bg-panel rounded-lg text-xs leading-relaxed text-ink-3 flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 text-warn shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-ink">
                    تفسیر شهودی تعامد و تفکیک ریشه‌ها (قضیه اشتورم):
                  </span>{' '}
                  <MathText text="به مساحت‌های زرد رنگ زیر منحنی حاصل‌ضرب $p(x) y_n y_{n+1}$ نگاه کنید. قسمت‌های بالای محور صفر دقیقاً با قسمت‌های زیر محور قرینه و برابرند، به گونه‌ای که برآیند کل انتگرال در بازه مرزی دقیقاً برابر صفر (تعامد کامل) می‌شود. همچنین ریشه‌های تابع آبی ($y_n$) دقیقاً بین ریشه‌های تابع سبز ($y_{n+1}$) تفکیک شده‌اند." />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TABLE 4 MASTER REFERENCE */}
        {/* ========================================================================= */}
        {activeTab === 'table4' && (
          <div className="space-y-6">
            <div className="bg-accent-soft/70 dark:bg-accent-soft/30 p-4 rounded-xl border border-accent-line flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-ink-2">
                <h4 className="font-bold text-sm text-accent-deep mb-1">
                  مرجع جامع جدول ۴ جزوه ریاضی مهندسی (صفحات ۱۰۹ تا ۱۱۵)
                </h4>
                <MathText text="معادله استاندارد $y'' + \lambda y = 0$ سنگ‌بنای روش جداسازی متغیرها در معادلات گرمای میله، ارتعاش تار و پتانسیل لاپلاس است. بسته به اینکه شرایط مرزی در دو سر بازه دیریکله (مقدار صفر)، نیومن (شار صفر / مشتق صفر) یا مختلط باشند، ۵ ساختار جواب ایجاد می‌شود." />
              </div>
            </div>

            {/* Table Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STURM_LIOUVILLE_TABLE_4.map((entry, idx) => {
                const isSelected = entry.id === selectedCaseId;
                return (
                  <div
                    key={entry.id}
                    className={`rounded-xl border p-5 transition-all relative ${
                      isSelected
                        ? 'border-accent bg-accent-soft/30 dark:bg-accent-soft/20 ring-2 ring-accent/20 shadow-md'
                        : 'border-line bg-surface hover:border-line-strong shadow-sm'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-accent-tint text-accent-deep text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <h3 className="font-bold text-ink text-sm">
                            {entry.nameFa}
                          </h3>
                        </div>
                        <p className="text-[11px] text-ink-4 mt-1">
                          {entry.bcFa}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCaseId(entry.id);
                          setActiveTab('visualizer');
                        }}
                        className="text-xs px-2.5 py-1 rounded-md bg-accent-soft text-accent-deep font-medium hover:bg-accent-tint border border-accent-line shrink-0"
                      >
                        شبیه‌سازی این حالت ←
                      </button>
                    </div>

                    {/* Equations Block */}
                    <div className="space-y-2.5 bg-panel/90 dark:bg-panel/60 p-3.5 rounded-lg border border-line/80 dark:border-line-strong/60 text-xs">
                      <div>
                        <span className="text-[10px] text-ink-4 block mb-0.5">
                          <MathText text={`شرط مرزی در بازه $${entry.domainLatex}$:`} />
                        </span>
                        <MathFormula formula={entry.bcLatex} className="font-bold text-ink" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-line">
                        <div>
                          <span className="text-[10px] text-ink-4 block mb-0.5">
                            <MathText text="مقادیر ویژه $\lambda_n$:" />
                          </span>
                          <MathFormula
                            formula={entry.eigenvaluesFormulaLatex}
                            className="font-bold text-accent-deep"
                          />
                        </div>

                        <div>
                          <span className="text-[10px] text-ink-4 block mb-0.5">
                            <MathText text="توابع ویژه $y_n(x)$:" />
                          </span>
                          <MathFormula
                            formula={entry.eigenfunctionsFormulaLatex}
                            className="font-bold text-accent-deep"
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-line">
                        <span className="text-[10px] text-ink-4 block mb-0.5">
                          <MathText text="نرم توابع ویژه $\|y_n\|^2$:" />
                        </span>
                        <MathFormula
                          formula={entry.orthogonalityNormLatex}
                          className="font-bold text-accent-deep text-xs"
                        />
                      </div>
                    </div>

                    {/* Details: Lambda zero + Physical application */}
                    <div className="mt-3 space-y-1.5 text-[11px]">
                      <div className="flex items-start gap-1.5">
                        <span className="font-bold text-warn shrink-0">
                          <MathText text="وضعیت $\lambda = 0$:" />
                        </span>
                        <span className="text-ink-3">
                          {entry.lambdaZeroStatusFa}
                        </span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <span className="font-bold text-ok shrink-0">
                          کاربرد فیزیکی:
                        </span>
                        <span className="text-ink-3">
                          {entry.physicalInterpretationFa}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SELF-ADJOINT INTEGRATING FACTOR LAB */}
        {/* ========================================================================= */}
        {activeTab === 'integrating_factor' && (
          <div className="space-y-6">
            <div className="bg-accent-soft/70 dark:bg-accent-soft/30 p-4 rounded-xl border border-accent-line flex items-start gap-3">
              <Sliders className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed text-ink-2">
                <h4 className="font-bold text-sm text-accent-deep mb-1">
                  دستورالعمل جامع تبدیل معادله خطی مرتبه دوم به فرم خودالحاقی اشتورم-لیوویل
                </h4>
                <div className="mt-1">
                  <MathText text="هر معادله دیفرانسیل خطی مرتبه دوم عمومی به صورت $P(x)y'' + Q(x)y' + [\lambda R(x) + S(x)]y = 0$ را می‌توان با ضرب در عامل انتگرال‌ساز $\mu(x) = \frac{1}{P(x)} \exp\left(\int \frac{Q(x)}{P(x)}dx\right)$ به فرم خودالحاقی $[r(x)y']' + [\lambda p(x) + q(x)]y = 0$ تبدیل کرد تا تابع وزن تعامد $p(x) = \mu(x) R(x)$ مشخص گردد." />
                </div>
              </div>
            </div>

            {/* Selector for 6 famous ODEs */}
            <div>
              <label className="block text-xs font-bold text-ink-3 mb-2">
                یک معادله معروف را برای مشاهده تبدیل گام‌به‌گام به فرم خودالحاقی انتخاب کنید:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { id: 'euler', label: '۱. اولر-کوشی (مثال ۴۱)' },
                  { id: 'legendre', label: '۲. چندجمله‌ای لژاندر' },
                  { id: 'bessel', label: '۳. تابع بسل استوانه‌ای' },
                  { id: 'chebyshev', label: '۴. چندجمله‌ای چبیشف' },
                  { id: 'hermite', label: '۵. چندجمله‌ای هرمیت' },
                  { id: 'constant', label: '۶. ضریب ثابت میرام' },
                ].map((item) => {
                  const isSelected = selectedOdeType === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() =>
                        setSelectedOdeType(
                          item.id as
                            | 'euler'
                            | 'legendre'
                            | 'bessel'
                            | 'chebyshev'
                            | 'hermite'
                            | 'constant'
                        )
                      }
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                        isSelected
                          ? 'bg-accent-solid text-white border-accent shadow-md'
                          : 'bg-surface text-ink-2 border-line hover:bg-muted'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Derivation Step-by-Step Card */}
            <div className="bg-surface border border-line rounded-xl p-5 shadow-sm space-y-5">
              {/* Step 1: Given ODE */}
              <div className="p-3.5 bg-panel rounded-xl border border-line">
                <span className="text-xs font-bold text-ink-4 block mb-1">
                  گام ۱: صورت معادله دیفرانسیل اولیه:
                </span>
                <MathFormula
                  formula={integratingFactorData.odeLatex}
                  className="text-base font-black text-ink"
                />
              </div>

              {/* Step 2: Integrating Factor Calculation */}
              <div className="p-3.5 bg-accent-soft/60 dark:bg-accent-soft/20 rounded-xl border border-accent-line">
                <span className="text-xs font-bold text-accent-deep block mb-1">
                  <MathText text="گام ۲: محاسبه عامل انتگرال‌ساز $\mu(x)$:" />
                </span>
                <MathFormula
                  formula={integratingFactorData.integratingFactorMu}
                  className="text-sm font-bold text-accent"
                />
                <div className="text-[11px] text-accent mt-2">
                  <MathText text="ضریب مشتق دوم $P(x)$ و ضریب مشتق اول $Q(x)$ است. انتگرال $\int \frac{Q}{P}dx$ را حساب کرده و در رابطه عامل انتگرال‌ساز جایگذاری می‌کنیم." />
                </div>
              </div>

              {/* Step 3: Identification of SL coefficients */}
              <div className="p-3.5 bg-ok-soft/60 dark:bg-ok-soft/20 rounded-xl border border-ok-line">
                <span className="text-xs font-bold text-ok-ink block mb-2">
                  <MathText text="گام ۳: ضرایب اشتورم-لیوویل پس از ضرب در $\mu(x)$:" />
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-surface p-2.5 rounded-lg border border-ok-line">
                    <span className="text-[10px] text-ink-4 block">
                      <MathText text="تابع هدایت $r(x) = \mu(x)P(x)$:" />
                    </span>
                    <MathFormula formula={integratingFactorData.r_x} className="font-bold text-ok-ink" />
                  </div>
                  <div className="bg-surface p-2.5 rounded-lg border border-ok-line">
                    <span className="text-[10px] text-ink-4 block">
                      <MathText text="تابع وزن تعامد $p(x) = \mu(x)R(x)$:" />
                    </span>
                    <MathFormula formula={integratingFactorData.p_x} className="font-bold text-ok-ink" />
                  </div>
                  <div className="bg-surface p-2.5 rounded-lg border border-ok-line">
                    <span className="text-[10px] text-ink-4 block">
                      <MathText text="پتانسیل کمکی $q(x) = \mu(x)S(x)$:" />
                    </span>
                    <MathFormula formula={integratingFactorData.q_x} className="font-bold text-ok-ink" />
                  </div>
                </div>
              </div>

              {/* Step 4: Self-Adjoint Form */}
              <div className="p-3.5 bg-accent-soft/60 dark:bg-accent-soft/20 rounded-xl border border-accent-line">
                <span className="text-xs font-bold text-accent-deep block mb-1">
                  گام ۴: فرم استاندارد خودالحاقی (Self-Adjoint Form):
                </span>
                <MathFormula
                  formula={integratingFactorData.slFormLatex}
                  className="text-base font-black text-accent-deep"
                />
              </div>

              {/* Step 5: Weighted Orthogonality */}
              <div className="p-3.5 bg-accent-soft/60 dark:bg-accent-soft/20 rounded-xl border border-accent-line">
                <span className="text-xs font-bold text-accent-deep block mb-1">
                  گام ۵: رابطه تعامد وزن‌دار توابع ویژه:
                </span>
                <MathFormula
                  formula={integratingFactorData.orthogonalityIntervalLatex}
                  className="text-sm font-bold text-accent-deep"
                />
                <div className="text-[11px] text-accent mt-2">
                  <MathText text="دقت کنید که تابع وزن $p(x)$ زیر انتگرال قرار می‌گیرد و ضامن استقلال و تعامد پایه‌های بسط فوریه تعمیم‌یافته است." />
                </div>
              </div>
            </div>

            {/* Note on Regular vs Singular SL */}
            <div className="bg-panel p-4 rounded-xl border border-line text-xs leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-bold text-ink">
                <Activity className="w-4 h-4 text-accent" />
                <span>نکته کنکوری: تمایز مسئله اشتورم-لیوویل منظم و تکین</span>
              </div>
              <div className="text-ink-3">
                <MathText text="۱. **مسئله منظم (Regular):** بازه $[a, b]$ متناهی است و توابع $r(x) > 0$ و $p(x) > 0$ در تمام طول بازه پیوسته و اکیداً مثبت‌اند. (مانند معادله اولر در بازه $[1, e]$ یا معادله با ضرایب ثابت)." />
              </div>
              <div className="text-ink-3">
                <MathText text="۲. **مسئله تکین (Singular):** ضریب $r(x)$ در یک یا هر دو نقطه انتهایی بازه صفر می‌شود (مانند معادله لژاندر در $x = \pm 1$ که $r(x) = 1-x^2 = 0$ است، یا معادله بسل در $x=0$ که $r(x)=x=0$) یا بازه نامتناهی است (مانند چندجمله‌ای‌های هرمیت در $(-\infty, \infty)$). در این مسائل شرط کرانداری فیزیکی جواب در مرز تکین جایگزین شرط مرزی جبری معمولی می‌شود." />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: STEP-BY-STEP 3-CASE ANALYSIS & QUIZ */}
        {/* ========================================================================= */}
        {activeTab === 'step_by_step' && (
          <div className="space-y-6">
            {/* Theoretical Walkthrough: Why 3 Cases */}
            <div className="bg-surface border border-line rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent-tint text-accent flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-ink text-base">
                    <MathText text="چرا حل مسئله مقدار مرزی اشتورم-لیوویل به ۳ حالت علامت $\lambda$ تقسیم می‌شود؟" />
                  </h3>
                  <div className="text-xs text-ink-4">
                    <MathText text="الگوریتم قطعی حل معادله $y'' + \lambda y = 0$ با شرایط مرزی در امتحانات دانشگاهی" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* Case 1: Lambda < 0 */}
                <div className="p-4 rounded-xl border border-danger bg-danger-soft/40 dark:bg-danger-soft/20 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-danger-ink">
                      <MathText text="حالت اول: $\lambda = -\alpha^2 < 0$" />
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-danger-tint text-danger-ink font-bold">
                      بدون جواب غیربدیهی
                    </span>
                  </div>
                  <MathFormula
                    formula="y(x) = c_1 \cosh(\\alpha x) + c_2 \sinh(\\alpha x)"
                    className="font-bold text-danger-ink mb-2"
                  />
                  <div className="text-ink-3 text-[11px] leading-relaxed">
                    <MathText text="چون توابع هذلولوی نوسانی نیستند و $\sinh(\alpha x)$ فقط در مبدأ $x=0$ صفر می‌شود، در مرز دوم $x=L$ مقدار $\sinh(\alpha L) \neq 0$ است؛ بنابراین ضریب $c_2 = 0$ شده و تنها جواب بدیهی $y(x) \equiv 0$ به دست می‌آید. لذا $\lambda < 0$ هیچ مقدار ویژه‌ای ندارد." />
                  </div>
                </div>

                {/* Case 2: Lambda = 0 */}
                <div className="p-4 rounded-xl border border-warn-line bg-warn-soft/40 dark:bg-warn-soft/20 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-warn">
                      <MathText text="حالت دوم: $\lambda = 0$" />
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-warn-tint text-warn-ink font-bold">
                      فقط در نیومن/متناوب
                    </span>
                  </div>
                  <MathFormula
                    formula="y(x) = A x + B \quad , \quad y'(x) = A"
                    className="font-bold text-warn-ink mb-2"
                  />
                  <div className="text-ink-3 text-[11px] leading-relaxed">
                    <MathText text="معادله به $y'' = 0$ تقلیل می‌یابد. اگر شرایط مرزی شامل مقدار خود تابع ($y(0)=0$ یا $y(L)=0$) باشد، $B=0$ و $A=0$ شده و مقدار ویژه نخواهد بود. اما در شرایط مشتق محض (نیومن $y'(0)=0, y'(L)=0$)، $A=0$ شده ولی $B$ دلخواه می‌ماند و $\lambda_0 = 0$ با تابع ثابت $y_0 = 1$ مقدار ویژه معتبر است!" />
                  </div>
                </div>

                {/* Case 3: Lambda > 0 */}
                <div className="p-4 rounded-xl border border-ok-line bg-ok-soft/40 dark:bg-ok-soft/20 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-ok-ink">
                      <MathText text="حالت سوم: $\lambda = \alpha^2 > 0$" />
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-ok-tint text-ok-ink font-bold">
                      منشأ مقادیر ویژه کوانتیده
                    </span>
                  </div>
                  <MathFormula
                    formula="y(x) = c_1 \cos(\\alpha x) + c_2 \sin(\\alpha x)"
                    className="font-bold text-ok-ink mb-2"
                  />
                  <div className="text-ink-3 text-[11px] leading-relaxed">
                    <MathText text="توابع مثلثاتی متناوب و نوسانی‌اند. اعمال شرایط مرزی در مرز دوم منجر به معادلات مشخصه مثلثاتی نظیر $\sin(\alpha L) = 0$ یا $\cos(\alpha L) = 0$ می‌شود که ریشه‌های گسسته $\alpha_n$ و در نتیجه مقادیر ویژه نامتناهی $\lambda_n = \alpha_n^2$ تولید می‌کنند." />
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Concept Quiz */}
            <div className="bg-panel border border-line rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-warn" />
                  <h3 className="font-bold text-ink text-sm">
                    آزمونک سنجش تسلط مفهومی اشتورم-لیوویل (۶ سوال امتحانی و کنکوری)
                  </h3>
                </div>

                {quizSubmitted ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-ink-2">
                      امتیاز شما: {quizScore} از {SL_QUIZ_QUESTIONS.length}
                    </span>
                    <button
                      onClick={handleResetQuiz}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-accent-solid text-white hover:bg-accent-solid transition-colors flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      آزمون مجدد
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setQuizSubmitted(true)}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-accent-solid text-white hover:bg-accent-solid transition-colors shadow-sm"
                  >
                    ثبت پاسخ‌ها و مشاهده کارنامه و تحلیل
                  </button>
                )}
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {SL_QUIZ_QUESTIONS.map((q, qIdx) => {
                  const selectedOpt = quizAnswers[q.id];
                  const isCorrect = selectedOpt === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-xl border transition-all ${
                        quizSubmitted
                          ? isCorrect
                            ? 'bg-ok-soft/50 dark:bg-ok-soft/20 border-ok-line'
                            : 'bg-danger-soft/50 dark:bg-danger-soft/20 border-danger'
                          : 'bg-surface border-line'
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-3">
                        <span className="w-5 h-5 rounded-full bg-muted text-ink-2 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {qIdx + 1}
                        </span>
                        <div className="text-xs font-bold text-ink leading-relaxed">
                          <MathText text={q.question} />
                        </div>
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => {
                          const isOptionSelected = selectedOpt === oIdx;
                          let optStyle =
                            'bg-panel border-line text-ink-2';

                          if (quizSubmitted) {
                            if (oIdx === q.correctIndex) {
                              optStyle =
                                'bg-ok-tint border-ok text-ok-ink font-bold';
                            } else if (isOptionSelected && !isCorrect) {
                              optStyle =
                                'bg-danger-tint border-danger text-danger-ink line-through';
                            }
                          } else if (isOptionSelected) {
                            optStyle =
                              'bg-accent-soft border-accent text-accent-deep font-bold ring-1 ring-accent';
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={quizSubmitted}
                              onClick={() => handleSelectQuizOption(q.id, oIdx)}
                              className={`p-2.5 rounded-lg border text-right text-xs transition-all flex items-center justify-between ${optStyle}`}
                            >
                              <MathFormula formula={opt} className="text-xs" />
                              {quizSubmitted && oIdx === q.correctIndex && (
                                <CheckCircle2 className="w-4 h-4 text-ok shrink-0" />
                              )}
                              {quizSubmitted && isOptionSelected && !isCorrect && (
                                <XCircle className="w-4 h-4 text-danger-ink shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation shown after submit */}
                      {quizSubmitted && (
                        <div className="mt-3 p-3 bg-surface/80 dark:bg-panel/80 rounded-lg text-xs leading-relaxed text-ink-3 border border-line flex items-start gap-2">
                          <HelpCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-ink">
                              تحلیل پاسخ تشریحی:
                            </span>{' '}
                            <MathText text={q.explanation} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
