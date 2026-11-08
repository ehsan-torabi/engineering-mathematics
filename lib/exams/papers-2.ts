import type { ExamPaper } from './types.ts';

/**
 * Paper 4 — دانشگاه شهرکرد، پایان‌ترم ۹۳–۹۴، استاد احمدی دارانی (ریاضی مهندسی9111.pdf).
 * Paper 5 — دانشگاه شهرکرد، نیم‌ترم «تکمیلی» ۹۳/۹/۲۰ (ریاضی مهندسی921.pdf).
 * Paper 6 — دانشگاه شهرکرد، نیم‌ترم (ریاضی مهندسی9511.pdf).
 */

export const SK_9394_FINAL: ExamPaper = {
  id: 'sk-9394-final',
  university: 'دانشگاه شهرکرد',
  title: 'پایان‌ترم',
  semester: 'نیمسال اول ۱۳۹۳–۱۳۹۴',
  duration: '۹۰ دقیقه',
  file: '/assets/exams/ریاضی مهندسی9111.pdf',
  questions: [
    {
      id: 'sk-9394-final-q1a',
      numberLabel: '۱-الف',
      topic: 'سری فوریه',
      statement:
        'نمودار تابع در شکل (خط راست از $(-\\pi,0)$ تا $(\\pi,2\\pi)$، یعنی $f(x)=x+\\pi$ روی $(-\\pi,\\pi)$) ترسیم شده است. سری فوریه این تابع را بیابید.',
      approach: 'تفکیک بخش فرد $x$ و بخش ثابت $\\pi$؛ ضرایب یک‌جا حساب می‌شوند.',
      steps: [
        {
          title: 'ضرایب زوج',
          formula:
            'a_0=\\frac{1}{\\pi}\\int_{-\\pi}^{\\pi}(x+\\pi)\\,dx=2\\pi,\\qquad a_n=\\frac{1}{\\pi}\\int_{-\\pi}^{\\pi}(x+\\pi)\\cos(nx)\\,dx=0',
          detail: 'انتگرال $x\\cos nx$ روی بازهٔ متقارن صفر است (فرد) و انتگرال $\\cos nx$ هم صفر است.',
        },
        {
          title: 'ضریب فرد',
          formula:
            'b_n=\\frac{1}{\\pi}\\int_{-\\pi}^{\\pi}(x+\\pi)\\sin(nx)\\,dx=\\frac{1}{\\pi}\\int_{-\\pi}^{\\pi}x\\sin(nx)\\,dx=\\frac{2(\\!-\\!1)^{n+1}}{n}',
          detail: 'چون $\\int_{-\\pi}^{\\pi}x\\sin(nx)\\,dx=2\\int_0^{\\pi}x\\sin(nx)\\,dx=-2\\pi(\\!-\\!1)^n$.',
        },
        {
          title: 'سری',
          formula:
            'x+\\pi=\\pi+2\\sum_{n=1}^{\\infty}\\frac{(\\!-\\!1)^{n+1}}{n}\\sin(nx),\\qquad -\\pi<x<\\pi',
        },
      ],
      finalAnswer:
        'f(x)=\\pi+2\\sum_{n=1}^{\\infty}\\frac{(\\!-\\!1)^{n+1}}{n}\\sin(nx),\\qquad -\\pi<x<\\pi',
      notes: ['در $x=\\pm\\pi$ سری به میانگین پرش یعنی $\\pi$ میل می‌کند.'],
    },
    {
      id: 'sk-9394-final-q1b',
      numberLabel: '۱-ب',
      topic: 'سری فوریه',
      statement: 'با استفاده از قسمت اول ثابت کنید: $\\dfrac{\\pi}{4}=1-\\dfrac13+\\dfrac15-\\cdots$',
      approach: 'قرار دادن $x=\\pi/2$ در سری قسمت الف.',
      steps: [
        {
          title: 'ارزیابی در $x=\\pi/2$',
          detail:
            '$\\sin\\frac{n\\pi}{2}$ برای $n=1,3,5,\\dots$ به ترتیب $1,-1,1,-1,\\dots$ است و عامل $(\\!-\\!1)^{n+1}$ (که برای $n$ فرد $+1$ است) در آن ضرب می‌شود؛ پس جمله‌ها $+\\frac11,\\,-\\frac13,\\,+\\frac15,\\dots$ می‌شوند:',
          formula:
            'f\\!\\Big(\\frac{\\pi}{2}\\Big)=\\frac{3\\pi}{2}=\\pi+2\\Big[1-\\frac13+\\frac15-\\cdots\\Big]\\;\\Longrightarrow\\;1-\\frac13+\\frac15-\\cdots=\\frac{\\pi}{4}',
        },
      ],
      finalAnswer: '\\sum_{k=0}^{\\infty}\\frac{(\\!-\\!1)^{k}}{2k+1}=\\frac{\\pi}{4}',
    },
    {
      id: 'sk-9394-final-q2',
      numberLabel: '۲',
      topic: 'سری فوریه',
      statement:
        'سری فوریهٔ مختلط تابع $f(x)=e^{x}$ را در فاصلهٔ $[-\\pi,\\pi]$ به دست آورید و سپس ضرایب سری فوریهٔ حقیقی آن را با کمک ضرایب مختلط محاسبه کنید.',
      approach:
        '$c_n=\\frac{1}{2\\pi}\\int_{-\\pi}^{\\pi}e^{x}e^{-inx}dx$؛ سپس $a_n=c_n+c_{-n}$ و $b_n=i(c_n-c_{-n})$.',
      steps: [
        {
          title: 'محاسبهٔ $c_n$',
          formula:
            'c_n=\\frac{1}{2\\pi}\\left[\\frac{e^{(1-in)x}}{1-in}\\right]_{-\\pi}^{\\pi}=\\frac{(\\!-\\!1)^{n}\\big(e^{\\pi}-e^{-\\pi}\\big)}{2\\pi(1-in)}=\\frac{(\\!-\\!1)^{n}\\sinh\\pi}{\\pi}\\cdot\\frac{1+in}{1+n^{2}}',
          detail: 'چون $e^{-in\\pi}=(\\!-\\!1)^n$ و $e^{\\pi}-e^{-\\pi}=2\\sinh\\pi$؛ همچنین $\\frac{1}{1-in}=\\frac{1+in}{1+n^2}$.',
        },
        {
          title: 'بازسازی ضرایب حقیقی',
          formula:
            'a_n=c_n+c_{-n}=\\frac{2(\\!-\\!1)^{n}\\sinh\\pi}{\\pi(1+n^{2})},\\qquad b_n=i\\big(c_n-c_{-n}\\big)=\\frac{-2n(\\!-\\!1)^{n}\\sinh\\pi}{\\pi(1+n^{2})}',
          detail: 'و $a_0=2c_0=\\dfrac{2\\sinh\\pi}{\\pi}$ یعنی جملهٔ ثابت $\\dfrac{\\sinh\\pi}{\\pi}$.',
        },
        {
          title: 'سری حقیقی',
          formula:
            'e^{x}=\\frac{\\sinh\\pi}{\\pi}+\\frac{2\\sinh\\pi}{\\pi}\\sum_{n=1}^{\\infty}\\frac{(\\!-\\!1)^{n}}{1+n^{2}}\\big(\\cos nx-n\\sin nx\\big)',
        },
      ],
      finalAnswer:
        'c_n=\\frac{(\\!-\\!1)^{n}\\sinh\\pi}{\\pi}\\cdot\\frac{1+in}{1+n^{2}},\\qquad a_n=\\frac{2(\\!-\\!1)^{n}\\sinh\\pi}{\\pi(1+n^{2})},\\qquad b_n=-\\frac{2n(\\!-\\!1)^{n}\\sinh\\pi}{\\pi(1+n^{2})}',
    },
    {
      id: 'sk-9394-final-q3',
      numberLabel: '۳',
      topic: 'انتگرال فوریه',
      statement: 'انتگرال فوریه تابع $f(x)=e^{-|x|},\\;x\\in\\mathbb{R}$ را بیابید.',
      approach: 'تابع زوج است؛ فقط $A(\\alpha)$ دارد.',
      steps: [
        {
          title: 'ضریب کسینوسی',
          formula:
            'A(\\alpha)=\\frac{1}{\\pi}\\int_{-\\infty}^{\\infty}e^{-|t|}\\cos(\\alpha t)\\,dt=\\frac{2}{\\pi}\\int_{0}^{\\infty}e^{-t}\\cos(\\alpha t)\\,dt=\\frac{2}{\\pi(1+\\alpha^{2})}',
        },
        {
          title: 'انتگرال فوریه',
          formula:
            'e^{-|x|}=\\frac{2}{\\pi}\\int_{0}^{\\infty}\\frac{\\cos(\\alpha x)}{1+\\alpha^{2}}\\,d\\alpha',
          detail: 'این همان انتگرال معروف دیریکله است که در $x=0$ مقدار $\\int_0^\\infty\\frac{d\\alpha}{1+\\alpha^2}=\\frac{\\pi}{2}$ را می‌دهد.',
        },
      ],
      finalAnswer:
        'e^{-|x|}=\\frac{2}{\\pi}\\int_{0}^{\\infty}\\frac{\\cos(\\alpha x)}{1+\\alpha^{2}}\\,d\\alpha,\\qquad x\\in\\mathbb{R}',
    },
    {
      id: 'sk-9394-final-q4',
      numberLabel: '۴',
      topic: 'معادله گرما',
      statement: 'معادلهٔ گرما زیر را به طور کامل حل کنید:',
      statementFormula:
        'u_t=9u_{xx},\\;\\;0\\le x\\le\\pi,\\;t>0;\\qquad u(0,t)=0,\\quad u(\\pi,t)+u_x(\\pi,t)=1;\\qquad u(x,0)=1',
      approach:
        'شرط مرزی رابین غیرهمگن است: حالت پایا $v(x)$ را جدا کرده و برای $w=u-v$ مسئلهٔ همگن با توابع ویژهٔ $\\sin(\\mu_nx)$ (شرط $\\tan\\mu\\pi=-\\mu$) حل می‌کنیم.',
      steps: [
        {
          title: 'حالت پایا',
          formula:
            'v\'\'=0,\\; v(0)=0,\\; v(\\pi)+v\'(\\pi)=1\\;\\Longrightarrow\\;v(x)=Ax,\\;A(\\pi+1)=1\\;\\Rightarrow\\;v(x)=\\frac{x}{\\pi+1}',
        },
        {
          title: 'مسئلهٔ همگن برای $w=u-v$',
          formula:
            'w_t=9w_{xx};\\quad w(0,t)=0,\\;w(\\pi,t)+w_x(\\pi,t)=0;\\quad w(x,0)=1-\\frac{x}{\\pi+1}=:g(x)',
        },
        {
          title: 'مسئلهٔ مقدار ویژه',
          formula:
            "X''+\\mu^{2}X=0,\\;X(0)=0\\Rightarrow X=\\sin\\mu x;\\quad X(\\pi)+X'(\\pi)=0\\Rightarrow\\sin\\mu\\pi+\\mu\\cos\\mu\\pi=0",
          detail:
            'یعنی $\\tan(\\mu\\pi)=-\\mu$؛ ریشه‌های مثبت $\\mu_1\\approx0{.}7876$، $\\mu_2\\approx1{.}6716$، $\\mu_3\\approx2{.}6162$، $\\dots$ (هر $\\mu_n$ در بازهٔ $\\big(n-\\tfrac12,\\,n\\big)$).',
        },
        {
          title: 'ضرایب بسط',
          formula:
            'w(x,t)=\\sum_{n=1}^{\\infty}c_ne^{-9\\mu_n^{2}t}\\sin(\\mu_n x),\\qquad c_n=\\frac{\\langle g,\\sin\\mu_nx\\rangle}{\\|\\sin\\mu_nx\\|^{2}}',
          detail:
            'صورت: $\\langle g,\\sin\\mu_nx\\rangle=\\int_0^{\\pi}\\big(1-\\frac{x}{\\pi+1}\\big)\\sin(\\mu_nx)\\,dx=\\frac{1-\\cos\\mu_n\\pi}{\\mu_n}-\\frac{\\sin\\mu_n\\pi}{(\\pi+1)\\mu_n^{2}}+\\frac{\\pi\\cos\\mu_n\\pi}{(\\pi+1)\\mu_n}$؛ مخرج: $\\|\\sin\\mu_nx\\|^{2}=\\frac{\\pi}{2}-\\frac{\\sin 2\\mu_n\\pi}{4\\mu_n}$.',
        },
      ],
      finalAnswer:
        'u(x,t)=\\frac{x}{\\pi+1}+\\sum_{n=1}^{\\infty}c_n\\,e^{-9\\mu_n^{2}t}\\sin(\\mu_n x),\\qquad \\tan(\\mu_n\\pi)=-\\mu_n',
      notes: [
        'مخرج نُرم: $\\|\\sin\\mu_nx\\|^2=\\frac{\\pi}{2}-\\frac{\\sin 2\\mu_n\\pi}{4\\mu_n}$؛ صورت با انتگرال‌گیری جزء‌به‌جزء دوگانه به‌دست می‌آید. مقدارهای $\\mu_n$ از $\\tan(\\mu_n\\pi)=-\\mu_n$ عددی کنترل شده‌اند ($\\mu_1\\approx0{.}7876$).',
      ],
    },
    {
      id: 'sk-9394-final-q5a',
      numberLabel: '۵-الف',
      topic: 'معادله ارتعاش',
      statement:
        'برای معادلهٔ ارتعاش $u_{tt}-u_{xx}=xe^{-t}$ با شرایط $u_x(0,t)=2t$، $u(1,t)=t$، $u(x,0)=x$، $u_t(x,0)=1-x$: شرایط مرزی را همگن کرده و معادله را بازنویسی کنید.',
      approach:
        'تابع کمکی درجه‌دو در $x$ که فقط شرایط مرزی را برآورده می‌کند: $\\varphi=t\\,x(2-x)$.',
      steps: [
        {
          title: 'ساخت $\\varphi$',
          formula:
            '\\varphi_x(0,t)=2t,\\;\\varphi(1,t)=t\\;\\Longrightarrow\\;\\varphi(x,t)=Ax^{2}+Bx,\\;B=2t,\\;A+B=t\\Rightarrow A=-t\\;\\Longrightarrow\\;\\varphi(x,t)=-t\\,x^{2}+2tx=t\\,x(2-x)',
        },
        {
          title: 'تعویض $u=v+\\varphi$',
          formula:
            '\\varphi_{tt}-\\varphi_{xx}=0-(-2t)=2t\\;\\Longrightarrow\\;v_{tt}-v_{xx}=xe^{-t}-2t',
        },
        {
          title: 'شرایط جدید',
          formula:
            'v_x(0,t)=0,\\quad v(1,t)=0;\\qquad v(x,0)=x-\\varphi(x,0)=x,\\quad v_t(x,0)=1-x-x(2-x)=1-3x+x^{2}',
        },
      ],
      finalAnswer:
        'v_{tt}-v_{xx}=xe^{-t}-2t,\\;\\; v_x(0,t)=0,\\;v(1,t)=0;\\qquad v(x,0)=x,\\;\\;v_t(x,0)=x^{2}-3x+1',
    },
    {
      id: 'sk-9394-final-q5b',
      numberLabel: '۵-ب',
      topic: 'معادله ارتعاش',
      statement: 'توابع $X_n(x)$ مسئلهٔ بازنویسی‌شدهٔ قسمت الف را محاسبه کنید.',
      approach: 'مسئلهٔ مقدار ویژهٔ $X\'\'+\\lambda X=0$ با $X\'(0)=0$ و $X(1)=0$.',
      steps: [
        {
          title: 'حل معادلهٔ مشخصه',
          formula:
            "X=A\\cos\\mu x+B\\sin\\mu x;\\quad X'(0)=0\\Rightarrow B=0;\\quad X(1)=0\\Rightarrow\\cos\\mu=0",
        },
        {
          title: 'توابع ویژه',
          formula:
            '\\mu_n=\\frac{(2n-1)\\pi}{2},\\qquad \\lambda_n=\\frac{(2n-1)^{2}\\pi^{2}}{4},\\qquad X_n=\\cos\\frac{(2n-1)\\pi x}{2}',
        },
      ],
      finalAnswer:
        'X_n(x)=\\cos\\frac{(2n-1)\\pi x}{2},\\qquad \\lambda_n=\\frac{(2n-1)^{2}\\pi^{2}}{4},\\qquad n=1,2,\\dots',
    },
  ],
};

export const SK_9394_MIDTERM_TAKMILI: ExamPaper = {
  id: 'sk-9394-midterm-takmili',
  university: 'دانشگاه شهرکرد',
  title: 'نیم‌ترم (تکمیلی)',
  semester: 'نیمسال اول ۱۳۹۳–۱۳۹۴',
  examDate: '۱۳۹۳/۰۹/۲۰',
  duration: '۱۱۰ دقیقه',
  file: '/assets/exams/ریاضی مهندسی921.pdf',
  questions: [
    {
      id: 'sk-9394-takmili-q1a',
      numberLabel: '۱-الف',
      topic: 'سری فوریه',
      statement:
        'توابع $\\{2x+1,\\;6x(x+1)+1\\}$ را در نظر بگیرید. نشان دهید که در بازهٔ $[-1,0]$ متعامدند.',
      approach: 'محاسبهٔ مستقیم ضرب داخلی $\\langle v_1,v_2\\rangle=\\int_{-1}^{0}v_1v_2\\,dx$.',
      steps: [
        {
          title: 'باز کردن حاصل‌ضرب',
          formula:
            '(2x+1)(6x^{2}+6x+1)=12x^{3}+18x^{2}+8x+1',
        },
        {
          title: 'انتگرال‌گیری',
          formula:
            '\\int_{-1}^{0}\\big(12x^{3}+18x^{2}+8x+1\\big)dx=\\Big[3x^{4}+6x^{3}+4x^{2}+x\\Big]_{-1}^{0}=0-(3-6+4-1)=0\\;\\checkmark',
        },
        {
          title: 'نُرم‌ها (برای قسمت ب)',
          formula:
            '\\|2x+1\\|^{2}=\\int_{-1}^{0}(2x+1)^{2}dx=\\frac13,\\qquad \\|6x(x+1)+1\\|^{2}=\\int_{-1}^{0}(6x^{2}+6x+1)^{2}dx=\\frac15',
        },
      ],
      finalAnswer:
        '\\langle 2x+1,\\;6x(x+1)+1\\rangle_{[-1,0]}=0\\;\\Rightarrow\\;\\text{متعامد هستند}',
    },
    {
      id: 'sk-9394-takmili-q1b',
      numberLabel: '۱-ب',
      topic: 'سری فوریه',
      statement: 'بسط تابع $x^2$ را بر حسب توابع فوق بنویسید.',
      approach:
        'تصویر متعامد: $a=\\langle x^2,v_1\\rangle/\\|v_1\\|^2$ و $b=\\langle x^2,v_2\\rangle/\\|v_2\\|^2$؛ باقیمانده ثابت است چون $1$ بر هر دو عمود است.',
      steps: [
        {
          title: 'ضرب داخلی‌ها',
          formula:
            '\\langle x^{2},2x+1\\rangle=\\int_{-1}^{0}(2x^{3}+x^{2})dx=-\\frac16,\\qquad \\langle x^{2},6x^{2}+6x+1\\rangle=\\int_{-1}^{0}(6x^{4}+6x^{3}+x^{2})dx=\\frac{1}{30}',
        },
        {
          title: 'ضرایب',
          formula:
            'a=\\frac{-1/6}{1/3}=-\\frac12,\\qquad b=\\frac{1/30}{1/5}=\\frac16',
        },
        {
          title: 'بسط و باقیمانده',
          formula:
            '-\\frac12(2x+1)+\\frac16\\big(6x(x+1)+1\\big)=x^{2}-\\frac13\\;\\Longrightarrow\\;x^{2}=-\\frac12(2x+1)+\\frac16\\big(6x(x+1)+1\\big)+\\frac13',
          detail:
            'چون $\\langle 1,v_1\\rangle=\\langle 1,v_2\\rangle=0$، جملهٔ $\\tfrac13$ تنها باقیماندهٔ عمود بر فضا است و بسط بر حسب دو تابع داده‌شده دقیقاً برای $x^2-\\tfrac13$ برقرار است.',
        },
      ],
      finalAnswer:
        'x^{2}= -\\frac12(2x+1)+\\frac16\\big(6x(x+1)+1\\big)+\\frac13,\\qquad\\text{یعنی}\\quad x^{2}-\\tfrac13\\in\\mathrm{span}\\{2x+1,\\,6x(x+1)+1\\}',
      notes: [
        'دام سؤال: دو تابع داده‌شده به‌تنهایی $x^2$ را نمی‌سازند؛ مؤلفهٔ ثابت $1/3$ باید ذکر شود.',
      ],
    },
    {
      id: 'sk-9394-takmili-q2a',
      numberLabel: '۲-الف',
      topic: 'سری فوریه',
      statement: 'برای تابع زیر سری فوریه را بیابید:',
      statementFormula:
        'f(x)=\\begin{cases}0 & -\\pi\\le x<0\\\\  \\dfrac{x}{2} & 0\\le x<\\pi\\end{cases}',
      approach: 'ضرایب روی نیم‌بازهٔ $[0,\\pi]$؛ جمله‌های زوج حذف می‌شوند.',
      steps: [
        {
          title: 'ضرایب',
          formula:
            'a_0=\\frac{1}{\\pi}\\int_{0}^{\\pi}\\frac{x}{2}dx=\\frac{\\pi}{4},\\qquad a_n=\\frac{1}{\\pi}\\int_{0}^{\\pi}\\frac{x}{2}\\cos(nx)\\,dx=\\frac{(\\!-\\!1)^{n}-1}{2\\pi n^{2}},\\qquad b_n=\\frac{1}{\\pi}\\int_{0}^{\\pi}\\frac{x}{2}\\sin(nx)\\,dx=\\frac{(\\!-\\!1)^{n+1}}{2n}',
        },
        {
          title: 'سری',
          formula:
            'f(x)=\\frac{\\pi}{8}+\\sum_{n=1}^{\\infty}\\Big[\\frac{(\\!-\\!1)^{n}-1}{2\\pi n^{2}}\\cos(nx)+\\frac{(\\!-\\!1)^{n+1}}{2n}\\sin(nx)\\Big]',
          detail: 'برای $n$ فرد: $a_n=-\\frac{1}{\\pi n^2}$؛ برای $n$ زوج $a_n=0$.',
        },
      ],
      finalAnswer:
        'f(x)=\\frac{\\pi}{8}-\\frac{1}{\\pi}\\sum_{k=1}^{\\infty}\\frac{\\cos((2k-1)x)}{(2k-1)^{2}}+\\frac{1}{2}\\sum_{n=1}^{\\infty}\\frac{(\\!-\\!1)^{n+1}}{n}\\sin(nx),\\qquad -\\pi<x<\\pi',
    },
    {
      id: 'sk-9394-takmili-q2b',
      numberLabel: '۲-ب',
      topic: 'سری فوریه',
      statement:
        'با استفاده از بسط فوریهٔ فوق مقدار $1+\\dfrac{1}{3^2}+\\dfrac{1}{5^2}+\\cdots$ را محاسبه کنید.',
      approach: 'ارزیابی سری در $x=\\pi$ (میانگین حد‌های یک‌طرفهٔ پرش).',
      steps: [
        {
          title: 'ارزیابی در $x=\\pi$',
          formula:
            '\\frac{f(\\pi^-)+f(-\\pi^+)}{2}=\\frac{\\pi/4}{2}=\\frac{\\pi}{8}=\\frac{\\pi}{8}+\\sum_{k=1}^{\\infty}\\frac{(\\!-\\!1)^{2k-1}-1}{2\\pi(2k-1)^{2}}(\\!-\\!1)^{2k-1}',
          detail: 'جمله‌های سینوسی در $\\sin(n\\pi)=0$ صفر می‌شوند؛ برای $n$ فرد: $a_n\\cos n\\pi=(-\\tfrac{1}{\\pi n^2})(-1)=+\\tfrac{1}{\\pi n^2}$.',
        },
        {
          title: 'نتیجه',
          detail:
            'در $x=\\pi$ سری به میانگین حد‌های یک‌طرفه میل می‌کند: $\\frac{f(\\pi^-)+f(-\\pi^+)}{2}=\\frac{\\pi/4+0}{2}=\\frac{\\pi}{8}$.',
          formula:
            '\\frac{\\pi}{4}=\\frac{\\pi}{8}+\\sum_{k=1}^{\\infty}\\frac{1}{\\pi(2k-1)^{2}}\\;\\Longrightarrow\\;\\sum_{k=1}^{\\infty}\\frac{1}{(2k-1)^{2}}=\\frac{\\pi^{2}}{8}',
        },
      ],
      finalAnswer:
        '1+\\frac{1}{3^{2}}+\\frac{1}{5^{2}}+\\cdots=\\frac{\\pi^{2}}{8}',
    },
    {
      id: 'sk-9394-takmili-q3',
      numberLabel: '۳',
      topic: 'سری فوریه',
      statement:
        'سری فوریهٔ انتقال‌یافتهٔ $\\sin(\\pi x)$، $x\\in[0,1]$ را بنویسید.',
      approach:
        'طبق تعریف درس، سری را با دورهٔ $T=1$ مستقیماً روی $[0,1]$ می‌سازیم (فرکانس‌های $2n\\pi$).',
      steps: [
        {
          title: 'ضرایب روی $[0,1]$ با $\\ell=\\tfrac12$',
          formula:
            'a_0=\\frac{1}{\\ell}\\int_{0}^{1}\\sin\\pi x\\,dx=2\\cdot\\frac{2}{\\pi}=\\frac{4}{\\pi}\\;\\Rightarrow\\;\\frac{a_0}{2}=\\frac{2}{\\pi}',
          detail:
            'قرارداد درس: $f\\simeq\\frac{a_0}{2}+\\sum\\big[a_n\\cos\\tfrac{n\\pi x}{\\ell}+b_n\\sin\\tfrac{n\\pi x}{\\ell}\\big]$ با $\\ell=T/2=1/2$.',
        },
        {
          title: 'ضریب $a_n$',
          formula:
            'a_n=2\\int_{0}^{1}\\sin(\\pi x)\\cos(2n\\pi x)\\,dx=\\int_{0}^{1}\\big[\\sin((2n+1)\\pi x)-\\sin((2n-1)\\pi x)\\big]dx\\;\\Longrightarrow\\;a_n=\\frac{2}{(2n+1)\\pi}-\\frac{2}{(2n-1)\\pi}=-\\frac{4}{\\pi(2n-1)(2n+1)}',
          detail:
            'با $\\sin A\\cos B=\\tfrac12[\\sin(A+B)+\\sin(A-B)]$ و $\\int_0^1\\sin(m\\pi x)dx=\\frac{1-\\cos m\\pi}{m\\pi}=\\frac{2}{m\\pi}$ برای $m$ فرد:',
        },
        {
          title: 'ضریب $b_n$',
          formula:
            'b_n=2\\int_{0}^{1}\\sin(\\pi x)\\sin(2n\\pi x)\\,dx=\\int_{0}^{1}\\big[\\cos((2n-1)\\pi x)-\\cos((2n+1)\\pi x)\\big]dx=0',
          detail: 'چون $\\sin(m\\pi)=0$ برای همهٔ $m$ صحیح.',
        },
        {
          title: 'سری انتقال‌یافته',
          formula:
            '\\sin(\\pi x)=\\frac{2}{\\pi}-\\frac{4}{\\pi}\\sum_{n=1}^{\\infty}\\frac{\\cos(2n\\pi x)}{(2n-1)(2n+1)},\\qquad 0\\le x\\le1',
        },
      ],
      finalAnswer:
        '\\sin(\\pi x)=\\frac{2}{\\pi}-\\frac{4}{\\pi}\\sum_{n=1}^{\\infty}\\frac{\\cos(2\\pi n x)}{(2n-1)(2n+1)}',
      notes: [
        'کنترل: در $x=0$ و $x=1$ سری مقدار $0$ می‌دهد ($\\sum\\frac{1}{(2n-1)(2n+1)}=\\frac12$) و در $x=\\tfrac12$ مقدار $1$ ($\\sum\\frac{(\\!-\\!1)^n}{4n^2-1}=\\frac12-\\frac{\\pi}{4}$).',
      ],
    },
    {
      id: 'sk-9394-takmili-q4',
      numberLabel: '۴',
      topic: 'انتگرال فوریه',
      statement: 'ثابت کنید:',
      statementFormula:
        '\\int_{0}^{\\infty}\\frac{1-\\cos\\pi\\omega}{\\omega}\\,\\sin(\\omega x)\\,d\\omega=\\begin{cases}\\dfrac{\\pi}{2} & x\\in[0,\\pi]\\\\  0 & x>\\pi\\end{cases}',
      approach:
        'انتگرال فوریهٔ سینوسی تابع ثابت $f=1$ روی $[0,\\pi]$ دقیقاً همین هسته را تولید می‌کند.',
      steps: [
        {
          title: 'ضریب سینوسی $f=1$ روی $[0,\\pi]$',
          formula:
            'B(\\omega)=\\frac{2}{\\pi}\\int_{0}^{\\pi}\\sin(\\omega t)\\,dt=\\frac{2}{\\pi}\\cdot\\frac{1-\\cos\\pi\\omega}{\\omega}',
        },
        {
          title: 'وارون',
          formula:
            'f(x)=\\int_{0}^{\\infty}B(\\omega)\\sin(\\omega x)\\,d\\omega=\\frac{2}{\\pi}\\int_{0}^{\\infty}\\frac{1-\\cos\\pi\\omega}{\\omega}\\sin(\\omega x)\\,d\\omega',
          detail:
            'چون $f(x)=1$ برای $0<x<\\pi$ و $f(x)=0$ برای $x>\\pi$ (و در $x=\\pi$ میانگین $\\tfrac12$)، تساوی خواسته‌شده با ضرب در $\\pi/2$ به دست می‌آید.',
        },
      ],
      finalAnswer:
        '\\int_{0}^{\\infty}\\frac{1-\\cos\\pi\\omega}{\\omega}\\sin(\\omega x)\\,d\\omega=\\frac{\\pi}{2}f(x)=\\begin{cases}\\dfrac{\\pi}{2} & 0\\le x\\le\\pi\\\\ 0 & x>\\pi\\end{cases}',
    },
    {
      id: 'sk-9394-takmili-q5',
      numberLabel: '۵',
      topic: 'معادله گرما',
      statement:
        'معادلهٔ گرما زیر را به معادله‌ای با شرایط مرزی همگن تبدیل کرده و سپس بسط تابع ویژه‌ای قسمت غیرهمگن مساله را بنویسید و ضرایب مربوطه را محاسبه کنید (لازم نیست مساله کامل حل شود):',
      statementFormula:
        'u_t=16u_{xx}+xt-x+2;\\qquad u(0,t)+u_x(0,t)=t,\\quad u(1,t)+u_x(1,t)=1;\\qquad u(x,0)=2x',
      approach:
        'جابه‌جایی خطی $\\varphi=\\alpha(t)x+\\beta(t)$ شرایط رابین را همگن می‌کند؛ توابع ویژه از شرط $\\sin\\mu=0$ (یعنی $\\mu=n\\pi$) می‌آیند.',
      steps: [
        {
          title: 'انتخاب $\\varphi$',
          formula:
            '\\varphi=\\alpha x+\\beta:\\;\\;\\varphi+\\varphi_x\\big|_{0}=\\beta+\\alpha=t,\\;\\;\\varphi+\\varphi_x\\big|_{1}=\\beta+2\\alpha=1\\;\\Rightarrow\\;\\alpha=1-t,\\;\\beta=2t-1\\;\\Longrightarrow\\;\\varphi(x,t)=(1-t)x+2t-1',
        },
        {
          title: 'مسئلهٔ همگن برای $v=u-\\varphi$',
          formula:
            'v_t=16v_{xx}+xt,\\qquad v(0,t)+v_x(0,t)=0,\\;\\;v(1,t)+v_x(1,t)=0,\\qquad v(x,0)=2x-\\big(x-1\\big)=x+1',
          detail: 'چون $\\varphi_t=-x+2$ است، $xt-x+2-\\varphi_t=xt$.',
        },
        {
          title: 'توابع ویژه',
          formula:
            "X''+\\mu^{2}X=0,\\;\\;X(0)+X'(0)=0\\;\\Rightarrow\\;X=\\cos\\mu x-\\tfrac{1}{\\mu}\\sin\\mu x",
          detail:
            'از $X+X\'=0$ در $x=0$:‌ $A+\\mu B=0$ یعنی $B=-A/\\mu$. شرط در $x=1$:‌ $X(1)+X\'(1)=-A\\sin\\mu\\,\\big(\\mu+\\tfrac{1}{\\mu}\\big)=0$، پس $\\sin\\mu=0$ و $\\mu_n=n\\pi$ ($n=1,2,\\dots$)؛ بنابراین $\\lambda_n=n^2\\pi^2$ و $X_n=\\cos n\\pi x-\\frac{\\sin n\\pi x}{n\\pi}$.',
        },
        {
          title: 'بسط قسمت غیرهمگن',
          formula:
            'xt=\\sum_{n=1}^{\\infty}g_n(t)X_n(x),\\qquad g_n(t)=t\\,N_n,\\qquad N_n=\\frac{\\langle x,X_n\\rangle}{\\|X_n\\|^{2}}',
        },
        {
          title: 'محاسبهٔ $N_n$ با $\\mu_n=n\\pi$',
          formula:
            '\\langle x,X_n\\rangle=\\frac{2(\\!-\\!1)^{n}-1}{n^{2}\\pi^{2}},\\qquad \\|X_n\\|^{2}=\\frac12\\Big(1+\\frac{1}{n^{2}\\pi^{2}}\\Big)\\;\\Longrightarrow\\;N_n=\\frac{2\\big(2(\\!-\\!1)^{n}-1\\big)}{n^{2}\\pi^{2}+1}',
          detail:
            'اعداد: $N_1\\approx-0{.}552$، $N_2\\approx+0{.}0494$، $N_3\\approx-0{.}0668$ (کنترل عددی در آزمون‌های پروژه).',
        },
        {
          title: 'معادلهٔ ضرایب زمانی',
          formula:
            'v=\\sum T_n(t)X_n(x):\\quad T_n\'+16n^{2}\\pi^{2}T_n=tN_n,\\qquad T_n(0)=\\frac{\\langle x+1,X_n\\rangle}{\\|X_n\\|^{2}}=\\frac{2\\big(3(\\!-\\!1)^{n}-2\\big)}{n^{2}\\pi^{2}+1}',
          detail:
            'چون $\\langle 1,X_n\\rangle=-\\frac{1-(\\!-\\!1)^n}{n^2\\pi^2}$ و $\\langle x,X_n\\rangle=\\frac{2(\\!-\\!1)^n-1}{n^2\\pi^2}$، جمع آن‌ها $\\frac{3(\\!-\\!1)^n-2}{n^2\\pi^2}$ می‌شود.',
        },
      ],
      finalAnswer:
        'v(x,t)=\\sum_{n=1}^{\\infty}T_n(t)\\Big(\\cos n\\pi x-\\frac{\\sin n\\pi x}{n\\pi}\\Big),\\quad \\mu_n=n\\pi,\\;\\lambda_n=n^{2}\\pi^{2};\\qquad T_n\'+16n^{2}\\pi^{2}T_n=N_nt,\\quad N_n=\\frac{2\\big(2(\\!-\\!1)^{n}-1\\big)}{n^{2}\\pi^{2}+1}',
      notes: [
        'دام سؤال: هر دو شرط مرزی از نوع $u+u_x$ هستند؛ شرط ویژه $\\sin\\mu=0$ می‌دهد نه $\\tan\\mu=\\mu$ (آن حالت مربوط به ترکیب رابین–دیریکله است).',
        'همان مسئلهٔ مقدار ویژه در امتحان ۹۵۳ (سؤال ۵) فقط برای «توابع ویژه» پرسیده شده است.',
      ],
    },
  ],
};

export const SK_95_MIDTERM: ExamPaper = {
  id: 'sk-95-midterm',
  university: 'دانشگاه شهرکرد',
  title: 'نیم‌ترم',
  semester: 'نیمسال اول ۱۳۹۵–۱۳۹۶',
  duration: '۱۲۰ دقیقه',
  file: '/assets/exams/ریاضی مهندسی9511.pdf',
  questions: [
    {
      id: 'sk-95-midterm-q1a',
      numberLabel: '۱-الف',
      topic: 'سری فوریه',
      statement: 'سری فوریه این تابع را بیابید:',
      statementFormula:
        'f(x)=\\begin{cases}0 & x\\in[-\\pi,0)\\\\  1 & x\\in[0,\\pi)\\end{cases}',
      approach: 'موج مربعی متقارن؛ فقط جمله‌های سینوسی فرد.',
      steps: [
        {
          title: 'ضرایب',
          formula:
            'a_0=\\frac{1}{\\pi}\\int_{0}^{\\pi}dx=1,\\qquad a_n=\\frac{1}{\\pi}\\int_{0}^{\\pi}\\cos(nx)dx=0,\\qquad b_n=\\frac{1}{\\pi}\\int_{0}^{\\pi}\\sin(nx)dx=\\frac{1-(\\!-\\!1)^{n}}{\\pi n}',
        },
        {
          title: 'سری',
          formula:
            'f(x)=\\frac12+\\frac{2}{\\pi}\\sum_{k=1}^{\\infty}\\frac{\\sin((2k-1)x)}{2k-1},\\qquad -\\pi<x<\\pi,\\;x\\neq0',
        },
      ],
      finalAnswer:
        'f(x)=\\frac{1}{2}+\\frac{2}{\\pi}\\sum_{k=1}^{\\infty}\\frac{\\sin\\big((2k-1)x\\big)}{2k-1}',
    },
    {
      id: 'sk-95-midterm-q1b',
      numberLabel: '۱-ب',
      topic: 'سری فوریه',
      statement: 'ثابت کنید $\\displaystyle\\sum_{n=1}^{\\infty}\\frac{(\\!-\\!1)^{n+1}}{2n-1}=\\frac{\\pi}{4}$.',
      approach: 'ارزیابی در $x=\\pi/2$.',
      steps: [
        {
          title: 'ارزیابی',
          formula:
            '1=\\frac12+\\frac{2}{\\pi}\\Big[\\sin\\frac{\\pi}{2}-\\frac{1}{3}\\sin\\frac{3\\pi}{2}+\\cdots\\Big]=\\frac12+\\frac{2}{\\pi}\\sum_{n=1}^{\\infty}\\frac{(\\!-\\!1)^{n+1}}{2n-1}',
        },
        {
          title: 'نتیجه',
          formula:
            '\\sum_{n=1}^{\\infty}\\frac{(\\!-\\!1)^{n+1}}{2n-1}=\\frac{\\pi}{4}',
        },
      ],
      finalAnswer:
        '\\sum_{n=1}^{\\infty}\\frac{(\\!-\\!1)^{n+1}}{2n-1}=1-\\frac13+\\frac15-\\cdots=\\frac{\\pi}{4}',
    },
    {
      id: 'sk-95-midterm-q2',
      numberLabel: '۲',
      topic: 'انتگرال فوریه',
      statement:
        'برای تابع زیر ابتدا انتگرال فوریه بیابید و سپس ثابت کنید:',
      statementFormula:
        'f(x)=\\begin{cases}1-x^{2} & |x|<1\\\\ 0 & |x|\\ge1\\end{cases}\\qquad\\Longrightarrow\\qquad \\int_{0}^{\\infty}\\frac{\\sin\\alpha-\\alpha\\cos\\alpha}{\\alpha^{3}}\\,d\\alpha=\\frac{\\pi}{4}',
      approach:
        'تابع زوج است؛ $A(\\alpha)$ را می‌سازیم و در $x=0$ ارزیابی می‌کنیم.',
      steps: [
        {
          title: 'ضریب $A(\\alpha)$',
          formula:
            'A(\\alpha)=\\frac{2}{\\pi}\\int_{0}^{1}(1-x^{2})\\cos(\\alpha x)\\,dx=\\frac{2}{\\pi}\\Big[\\frac{2\\sin\\alpha}{\\alpha^{3}}-\\frac{2\\cos\\alpha}{\\alpha^{2}}\\Big]=\\frac{4(\\sin\\alpha-\\alpha\\cos\\alpha)}{\\pi\\alpha^{3}}',
          detail:
            'با دو بار جزء‌به‌جزء: $\\int_0^1(1-x^2)\\cos\\alpha x\\,dx=\\frac{2(\\sin\\alpha-\\alpha\\cos\\alpha)}{\\alpha^3}$.',
        },
        {
          title: 'انتگرال فوریه',
          formula:
            'f(x)=\\int_{0}^{\\infty}A(\\alpha)\\cos(\\alpha x)\\,d\\alpha=\\frac{4}{\\pi}\\int_{0}^{\\infty}\\frac{\\sin\\alpha-\\alpha\\cos\\alpha}{\\alpha^{3}}\\cos(\\alpha x)\\,d\\alpha',
        },
        {
          title: 'ارزیابی در $x=0$',
          formula:
            'f(0)=1=\\frac{4}{\\pi}\\int_{0}^{\\infty}\\frac{\\sin\\alpha-\\alpha\\cos\\alpha}{\\alpha^{3}}\\,d\\alpha\\;\\Longrightarrow\\;\\int_{0}^{\\infty}\\frac{\\sin\\alpha-\\alpha\\cos\\alpha}{\\alpha^{3}}\\,d\\alpha=\\frac{\\pi}{4}\\;\\checkmark',
        },
      ],
      finalAnswer:
        'f(x)=\\frac{4}{\\pi}\\int_{0}^{\\infty}\\frac{\\sin\\alpha-\\alpha\\cos\\alpha}{\\alpha^{3}}\\cos(\\alpha x)\\,d\\alpha,\\qquad \\int_{0}^{\\infty}\\frac{\\sin\\alpha-\\alpha\\cos\\alpha}{\\alpha^{3}}\\,d\\alpha=\\frac{\\pi}{4}',
      notes: [
        'در $x=0$ تابع پیوسته است پس سری به خود مقدار $1$ همگراست — اعتبار گذر حد.',
        'انتگرال در مبدأ حد متناهی ($\\frac{\\sin\\alpha-\\alpha\\cos\\alpha}{\\alpha^3}\\to\\frac13$) و در بی‌نهایت مطلقاً همگراست؛ عددی کنترل شده است.',
      ],
    },
    {
      id: 'sk-95-midterm-q3a',
      numberLabel: '۳-الف',
      topic: 'تبدیل فوریه',
      statement: 'عبارت زیر را محاسبه کنید:',
      statementFormula: 'f^{-1}\\Big\\{\\frac{i\\alpha+3}{(i\\alpha+4)^{2}};\\,t\\Big\\}',
      approach: 'کسر جزئی حول $(i\\alpha+4)$ و استفاده از جدول $\\tfrac{1}{(i\\alpha+a)^2}\\leftrightarrow te^{-at}H(t)$.',
      steps: [
        {
          title: 'کسر جزئی',
          formula:
            '\\frac{i\\alpha+3}{(i\\alpha+4)^{2}}=\\frac{(i\\alpha+4)-1}{(i\\alpha+4)^{2}}=\\frac{1}{i\\alpha+4}-\\frac{1}{(i\\alpha+4)^{2}}',
        },
        {
          title: 'وارون هر جمله',
          formula:
            '\\mathcal{F}^{-1}\\Big\\{\\frac{1}{i\\alpha+4}\\Big\\}=e^{-4t}H(t),\\qquad \\mathcal{F}^{-1}\\Big\\{\\frac{1}{(i\\alpha+4)^{2}}\\Big\\}=t\\,e^{-4t}H(t)',
          detail:
            'قاعدهٔ ضرب در $t$:‌ $\\mathcal{F}\\{tf\\}=iF\'(\\alpha)$ و $\\frac{d}{d\\alpha}(i\\alpha+4)^{-1}=-i(i\\alpha+4)^{-2}$ پس $\\mathcal{F}\\{te^{-4t}H\\}=\\frac{1}{(i\\alpha+4)^2}$.',
        },
      ],
      finalAnswer:
        'f^{-1}\\Big\\{\\frac{i\\alpha+3}{(i\\alpha+4)^{2}};t\\Big\\}=\\big(1-t\\big)e^{-4t}\\,H(t)',
    },
    {
      id: 'sk-95-midterm-q3b',
      numberLabel: '۳-ب',
      topic: 'تبدیل فوریه',
      statement: 'عبارت زیر را محاسبه کنید:',
      statementFormula: 'f\\Big\\{\\frac{x\\,e^{-ix}}{x^{2}+9};\\,\\alpha\\Big\\}',
      approach:
        'ابتدا تبدیل $\\tfrac{1}{x^2+9}$، جابه‌جایی با $e^{-ix}$، سپس قاعدهٔ $x\\,g\\leftrightarrow iG\'$.',
      steps: [
        {
          title: 'تبدیل پایه و جابه‌جایی',
          formula:
            '\\mathcal{F}\\Big\\{\\frac{1}{x^{2}+9}\\Big\\}=\\frac{\\pi}{3}e^{-3|\\alpha|}\\;\\xrightarrow{\\;e^{-ix}\\;}\\;G(\\alpha)=\\frac{\\pi}{3}e^{-3|\\alpha+1|}',
        },
        {
          title: 'قاعدهٔ ضرب در $x$',
          formula:
            '\\mathcal{F}\\{x\\,g(x)\\}=iG\'(\\alpha)=i\\cdot\\frac{\\pi}{3}\\cdot\\big(-3\\operatorname{sgn}(\\alpha+1)\\big)e^{-3|\\alpha+1|}',
        },
      ],
      finalAnswer:
        'f\\Big\\{\\frac{x\\,e^{-ix}}{x^{2}+9};\\alpha\\Big\\}=-i\\pi\\,\\operatorname{sgn}(\\alpha+1)\\,e^{-3|\\alpha+1|}',
    },
    {
      id: 'sk-95-midterm-q4',
      numberLabel: '۴',
      topic: 'معادله گرما',
      statement: 'معادلهٔ گرما زیر را به طور کامل حل کنید:',
      statementFormula:
        'u_t=25u_{xx},\\;\\;t>0,\\;x\\in[0,\\pi];\\qquad u_x(0,t)=u_x(\\pi,t)=0,\\;\\;t>0;\\qquad u(x,0)=\\cos5x-\\sqrt3\\cos7x',
      approach:
        'شرط اولیه از قبل ترکیبی از توابع ویژهٔ نویمن است؛ هر جمله مستقیم زوال نمایی می‌گیرد.',
      steps: [
        {
          title: 'توابع ویژه و نرخ زوال',
          formula:
            'X_n=\\cos(nx),\\;\\;\\lambda_n=n^{2};\\qquad e^{-25\\lambda_n t}',
          detail: '$\\cos5x$ و $\\cos7x$ خودشان توابع ویژه‌اند ($n=5$ و $n=7$) و نیازی به بسط نیست.',
        },
        {
          title: 'جواب',
          formula:
            'u(x,t)=e^{-25\\cdot25\\,t}\\cos5x-\\sqrt3\\,e^{-25\\cdot49\\,t}\\cos7x',
        },
      ],
      finalAnswer:
        'u(x,t)=e^{-625t}\\cos5x-\\sqrt3\\,e^{-1225t}\\cos7x',
    },
  ],
};
