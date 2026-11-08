import type { ExamPaper } from './types.ts';

/**
 * Paper 7 — دانشگاه شهرکرد، نیم‌ترم (ریاضی مهندسی951.pdf).
 * Paper 8 — دانشگاه شهرکرد، نیم‌ترم تکمیلی ۹۵/۱۰/۱۳ (ریاضی مهندسی953.pdf).
 * Paper 9 — دانشگاه شهرکرد، نیم‌ترم ۹۶–۹۷ (ریاضی مهندسی962.pdf).
 * Paper 10 — دانشگاه شهرکرد، میان‌ترم ۱۴۰۳–۱۴۰۴ نیمسال اول (میانترم ریاضی مهندسی (1).pdf).
 */

export const SK_95_MIDTERM_B: ExamPaper = {
  id: 'sk-95-midterm-b',
  university: 'دانشگاه شهرکرد',
  title: 'نیم‌ترم',
  semester: 'نیمسال اول ۱۳۹۵–۱۳۹۶ (برگهٔ دوم)',
  duration: '۱۲۰ دقیقه',
  file: '/assets/exams/ریاضی مهندسی951.pdf',
  questions: [
    {
      id: 'sk-95-midterm-b-q1',
      numberLabel: '۱',
      topic: 'سری فوریه',
      statement:
        'ابتدا سری فوریهٔ سینوسی برای تابع $f(x)=x^2$ بر بازهٔ $[0,\\pi]$ تعریف‌شده در فاصلهٔ متناوب بیابید. با توجه به قسمت اول مقدار سری $\\sum_{n=1}^{\\infty}\\frac{1}{n^6}$ را بیابید.',
      approach:
        'بسط سینوسی روی $[0,\\pi]$؛ سپس پارسوال روی همین بسط → مجموع $\\tfrac1{n^6}$ اعداد فرد، و با رابطهٔ زوج/فرد به مجموع کل می‌رسیم.',
      steps: [
        {
          title: 'ضریب سینوسی',
          formula:
            'b_n=\\frac{2}{\\pi}\\int_{0}^{\\pi}x^{2}\\sin(nx)\\,dx=\\frac{2}{\\pi}\\Big[-\\frac{\\pi^{2}(\\!-\\!1)^{n}}{n}+\\frac{2\\big((\\!-\\!1)^{n}-1\\big)}{n^{3}}\\Big]',
          detail:
            'دو بار جزء‌به‌جزء: $\\int_0^\\pi x^2\\sin nx\\,dx=-\\frac{\\pi^2(\\!-\\!1)^n}{n}+\\frac{2((\\!-\\!1)^n-1)}{n^3}$.',
        },
        {
          title: 'بسط سینوسی',
          formula:
            'x^{2}=\\sum_{n=1}^{\\infty}\\Big[\\frac{2\\pi(\\!-\\!1)^{n+1}}{n}+\\frac{4\\big((\\!-\\!1)^{n}-1\\big)}{\\pi n^{3}}\\Big]\\sin(nx),\\qquad 0\\le x<\\pi',
          detail: 'برای $n$ زوج: $b_n=\\frac{2\\pi(\\!-\\!1)^{n+1}}{n}=-\\frac{2\\pi}{n}$؛ برای $n$ فرد: $b_n=\\frac{2\\pi}{n}-\\frac{8}{\\pi n^3}$.',
        },
        {
          title: 'پارسوال روی $[0,\\pi]$',
          formula:
            '\\frac{2}{\\pi}\\int_{0}^{\\pi}x^{4}dx=\\sum_{n=1}^{\\infty}b_n^{2}\\;\\Longrightarrow\\;\\frac{2\\pi^{4}}{5}=\\frac{2\\pi^{4}}{3}-\\frac{\\pi^{4}}{3}+\\frac{64}{\\pi^{2}}\\sum_{k=1}^{\\infty}\\frac{1}{(2k-1)^{6}}',
          detail:
            '$\\sum b_n^2=\\sum\\frac{4\\pi^2}{n^2}-16\\sum\\frac{1-(\\!-\\!1)^n}{n^4}+\\frac{16}{\\pi^2}\\sum\\frac{\\big((\\!-\\!1)^n-1\\big)^2}{n^6}$ و با مقادیر شناخته‌شدهٔ $\\sum\\frac1{n^2}=\\frac{\\pi^2}6$، $\\sum_{odd}\\frac1{n^4}=\\frac{\\pi^4}{96}$ ساده می‌شود.',
        },
        {
          title: 'مجموع اعداد فرد از توان ششم',
          formula:
            '\\sum_{k=1}^{\\infty}\\frac{1}{(2k-1)^{6}}=\\frac{\\pi^{6}}{960}',
          detail: 'چون $\\frac{64}{\\pi^2}S=\\frac{2\\pi^4}{5}-\\frac{\\pi^4}{3}=\\frac{\\pi^4}{15}$ پس $S=\\frac{\\pi^6}{15\\cdot64}=\\frac{\\pi^6}{960}$.',
        },
        {
          title: 'گذر به مجموع کل',
          formula:
            '\\sum_{n=1}^{\\infty}\\frac{1}{n^{6}}=S+\\frac{1}{64}S=\\frac{65}{64}\\cdot\\frac{\\pi^{6}}{960}=\\frac{\\pi^{6}}{945}',
          detail: 'چون $\\sum_{even}\\frac1{n^6}=\\frac{1}{64}\\sum\\frac1{n^6}$ و $\\sum_{odd}=\\frac{63}{64}\\sum_{all}$.',
        },
      ],
      finalAnswer:
        'x^{2}=\\sum_{n=1}^{\\infty}b_n\\sin(nx),\\;\\;b_n=\\frac{2\\pi(\\!-\\!1)^{n+1}}{n}+\\frac{4\\big((\\!-\\!1)^{n}-1\\big)}{\\pi n^{3}};\\qquad \\sum_{n=1}^{\\infty}\\frac{1}{n^{6}}=\\frac{\\pi^{6}}{945}',
    },
    {
      id: 'sk-95-midterm-b-q2a',
      numberLabel: '۲-الف',
      topic: 'انتگرال فوریه',
      statement: 'ثابت کنید:',
      statementFormula:
        '\\int_{0}^{\\infty}\\frac{\\sin(\\pi\\alpha)\\sin(\\alpha x)}{1-\\alpha^{2}}\\,d\\alpha=\\begin{cases}\\dfrac{\\pi}{2}\\sin x & x\\in[0,\\pi]\\\\  0 & x>\\pi\\end{cases}',
      approach:
        'همان انتگرال فوریهٔ سینوسیِ $\\sin x$ روی $[0,\\pi]$ (مشابه امتحان ۹۳–۹۴)؛ ضریب سینوسی دقیقاً هستهٔ انتگرال است.',
      steps: [
        {
          title: 'ضریب سینوسی $f=\\sin t$ روی $[0,\\pi]$',
          formula:
            '\\int_{0}^{\\pi}\\sin t\\sin(\\alpha t)\\,dt=\\frac{\\sin\\alpha\\pi}{1-\\alpha^{2}}\\;\\Rightarrow\\;B(\\alpha)=\\frac{2}{\\pi}\\cdot\\frac{\\sin\\alpha\\pi}{1-\\alpha^{2}}',
        },
        {
          title: 'وارون',
          formula:
            '\\frac{2}{\\pi}\\int_{0}^{\\infty}\\frac{\\sin\\alpha\\pi\\,\\sin\\alpha x}{1-\\alpha^{2}}\\,d\\alpha=f(x)=\\begin{cases}\\sin x & 0\\le x\\le\\pi\\\\ 0 & x>\\pi\\end{cases}',
        },
      ],
      finalAnswer:
        '\\int_{0}^{\\infty}\\frac{\\sin(\\pi\\alpha)\\sin(\\alpha x)}{1-\\alpha^{2}}\\,d\\alpha=\\begin{cases}\\dfrac{\\pi}{2}\\sin x & 0\\le x\\le\\pi\\\\ 0 & x>\\pi\\end{cases}',
    },
    {
      id: 'sk-95-midterm-b-q2b',
      numberLabel: '۲-ب',
      topic: 'انتگرال فوریه',
      statement:
        'اگر $f(x)$ زوج باشد و داشته باشیم $\\int_0^\\infty f(x)\\cos\\alpha x\\,dx=1-\\alpha$ برای $\\alpha\\in[0,1]$ و $0$ برای $\\alpha>1$، تابع $f(x)$ را بیابید.',
      approach: 'وارونِ انتگرال فوریهٔ کسینوسی با همین هسته.',
      steps: [
        {
          title: 'فرمول وارون کسینوسی',
          formula:
            'f(x)=\\frac{2}{\\pi}\\int_{0}^{\\infty}F_c(\\alpha)\\cos(\\alpha x)\\,d\\alpha=\\frac{2}{\\pi}\\int_{0}^{1}(1-\\alpha)\\cos(\\alpha x)\\,d\\alpha',
        },
        {
          title: 'انتگرال‌گیری جزء‌به‌جزء',
          formula:
            '\\int_{0}^{1}(1-\\alpha)\\cos(\\alpha x)\\,d\\alpha=\\Big[\\frac{(1-\\alpha)\\sin\\alpha x}{x}\\Big]_{0}^{1}+\\int_{0}^{1}\\frac{\\sin\\alpha x}{x}\\,d\\alpha=0+\\Big[-\\frac{\\cos\\alpha x}{x^{2}}\\Big]_{0}^{1}=\\frac{1-\\cos x}{x^{2}}',
          detail:
            'چون $\\int_0^1\\sin(\\alpha x)d\\alpha=\\frac{1-\\cos x}{x}$ است؛ علامت مثبت نهایی مهم است (دام رایج: جابه‌جا کردن $1-\\cos x$ و $\\cos x-1$).',
        },
        {
          title: 'تابع',
          formula:
            'f(x)=\\frac{2(1-\\cos x)}{\\pi x^{2}},\\qquad x>0;\\qquad f(0)=\\lim_{x\\to0}\\frac{2(1-\\cos x)}{\\pi x^{2}}=\\frac{1}{\\pi}',
        },
      ],
      finalAnswer:
        'f(x)=\\frac{2(1-\\cos x)}{\\pi x^{2}},\\qquad f(0)=\\frac{1}{\\pi}',
      notes: [
        'پس‌آزمایی عددی: $\\int_0^\\infty\\frac{(1-\\cos x)\\cos\\alpha x}{x^2}dx=\\frac{\\pi}{2}\\max(1-\\alpha,0)$ → $\\int f\\cos\\alpha x\\,dx=\\frac{2}{\\pi}\\cdot\\frac{\\pi}{2}(1-\\alpha)=1-\\alpha$ برای $0\\le\\alpha\\le1$ ✓',
      ],
    },
    {
      id: 'sk-95-midterm-b-q3a',
      numberLabel: '۳-الف',
      topic: 'تبدیل فوریه',
      statement: 'عبارت زیر را محاسبه کنید:',
      statementFormula: 'f^{-1}\\Big\\{\\frac{i\\pi\\sin\\alpha}{4+2i\\alpha};\\,t\\Big\\}',
      approach:
        '$\\sin\\alpha$ را به نمایی‌ها بشکنید؛ هر نمایی در حوزهٔ فرکانس یعنی جابه‌جایی در زمان.',
      steps: [
        {
          title: 'بازنویسی',
          formula:
            '\\frac{i\\pi\\sin\\alpha}{4+2i\\alpha}=\\frac{i\\pi}{2}\\,\\sin\\alpha\\cdot\\frac{1}{i\\alpha+2}=\\frac{i\\pi}{2}\\cdot\\frac{e^{i\\alpha}-e^{-i\\alpha}}{2i}\\cdot\\frac{1}{i\\alpha+2}',
        },
        {
          title: 'جابه‌جایی‌ها',
          formula:
            'g(t)=e^{-2t}H(t);\\qquad \\mathcal{F}^{-1}\\Big\\{\\frac{e^{i\\alpha}}{i\\alpha+2}\\Big\\}=g(t+1),\\quad \\mathcal{F}^{-1}\\Big\\{\\frac{e^{-i\\alpha}}{i\\alpha+2}\\Big\\}=g(t-1)',
          detail: 'چون $\\mathcal{F}^{-1}\\{e^{-i\\alpha c}G(\\alpha)\\}=g(t-c)$ با $c=\\mp1$.',
        },
        {
          title: 'ترکیب',
          formula:
            '\\frac{\\pi}{4}\\Big[g(t+1)-g(t-1)\\Big]=\\frac{\\pi}{4}\\Big[e^{-2(t+1)}H(t+1)-e^{-2(t-1)}H(t-1)\\Big]',
        },
      ],
      finalAnswer:
        'f^{-1}\\Big\\{\\frac{i\\pi\\sin\\alpha}{4+2i\\alpha};t\\Big\\}=\\frac{\\pi}{4}\\Big(e^{-2(t+1)}H(t+1)-e^{-2(t-1)}H(t-1)\\Big)',
      notes: [
        'نتیجه پالس‌های جابه‌جاشده حول $t=\\mp1$ است؛ در $|t|>1$ صفر و بین $-1<t<1$ مقدار $\\frac{\\pi}{4}e^{-2(t+1)}$ دارد.',
      ],
    },
    {
      id: 'sk-95-midterm-b-q3b',
      numberLabel: '۳-ب',
      topic: 'تبدیل فوریه',
      statement: 'عبارت زیر را محاسبه کنید:',
      statementFormula: 'f\\Big\\{\\frac{x\\,e^{-ix}}{x^{2}+9};\\,\\alpha\\Big\\}',
      approach:
        'تبدیل $\\tfrac{1}{x^2+9}$ از جدول؛ جابه‌جایی فرکانسی با $e^{-ix}$؛ سپس قاعدهٔ $x\\,g\\leftrightarrow iG\'$.',
      steps: [
        {
          title: 'تبدیل پایه و جابه‌جایی',
          formula:
            '\\mathcal{F}\\Big\\{\\frac{1}{x^{2}+9}\\Big\\}=\\frac{\\pi}{3}e^{-3|\\alpha|}\\;\\xrightarrow{\\;e^{-ix}\\;}\\;G(\\alpha)=\\frac{\\pi}{3}e^{-3|\\alpha+1|}',
          detail:
            'از $\\mathcal{F}\\{e^{iax}q(x)\\}=Q(\\alpha-a)$ با $a=-1$.',
        },
        {
          title: 'قاعدهٔ ضرب در $x$',
          formula:
            "\\mathcal{F}\\{x\\,g(x)\\}=iG'(\\alpha)=i\\cdot\\frac{\\pi}{3}\\cdot\\big(-3\\,\\operatorname{sgn}(\\alpha+1)\\big)e^{-3|\\alpha+1|}",
          detail: 'چون $\\frac{d}{d\\alpha}e^{-3|\\alpha+1|}=-3\\,\\operatorname{sgn}(\\alpha+1)e^{-3|\\alpha+1|}$؛ در $\\alpha=-1$ مقدار $0$ در نظر گرفته می‌شود.',
        },
      ],
      finalAnswer:
        'f\\Big\\{\\frac{x\\,e^{-ix}}{x^{2}+9};\\alpha\\Big\\}=-i\\pi\\,\\operatorname{sgn}(\\alpha+1)\\,e^{-3|\\alpha+1|}',
    },
    {
      id: 'sk-95-midterm-b-q4',
      numberLabel: '۴',
      topic: 'معادله گرما',
      statement: 'معادلهٔ گرما زیر را به طور کامل حل کنید:',
      statementFormula:
        'u_t=9u_{xx},\\;\\;t>0,\\;x\\in[0,\\pi];\\qquad u_x(0,t)=u(\\pi,t)=0,\\;\\;t>0;\\qquad u(x,0)=\\cos0.5x-\\sqrt2\\cos7.5x',
      approach:
        'شرایط مختلط (نویمن در صفر، دیریکله در $\\pi$) → توابع ویژهٔ $\\cos\\big((n+\\tfrac12)x\\big)$؛ شرط اولیه از قبل ترکیبی از آن‌هاست.',
      steps: [
        {
          title: 'مسئلهٔ مقدار ویژه',
          formula:
            "X''+\\mu^{2}X=0,\\;X'(0)=0\\Rightarrow X=\\cos\\mu x;\\quad X(\\pi)=0\\Rightarrow\\cos\\mu\\pi=0\\Rightarrow\\mu=n+\\tfrac12",
        },
        {
          title: 'بازشناسی شرط اولیه',
          formula:
            '\\cos(0.5x)=\\cos\\big((0)x+\\tfrac12x\\big),\\qquad \\cos(7.5x)=\\cos\\big(7x+\\tfrac12x\\big)=\\cos\\big((7+\\tfrac12)x\\big)',
          detail: 'یعنی $n=0$ و $n=7$؛ نیازی به محاسبهٔ ضرایب نیست.',
        },
        {
          title: 'جواب',
          formula:
            'u(x,t)=e^{-9(0.5)^{2}t}\\cos0.5x-\\sqrt2\\,e^{-9(7.5)^{2}t}\\cos7.5x',
        },
      ],
      finalAnswer:
        'u(x,t)=e^{-2.25\\,t}\\cos(0.5x)-\\sqrt2\\,e^{-506.25\\,t}\\cos(7.5x)',
    },
  ],
};

export const SK_95_TAKMILI: ExamPaper = {
  id: 'sk-95-takmili',
  university: 'دانشگاه شهرکرد',
  title: 'نیم‌ترم (تکمیلی)',
  semester: 'نیمسال اول ۱۳۹۵–۱۳۹۶',
  examDate: '۱۳۹۵/۱۰/۱۳',
  duration: '۱۱۰ دقیقه',
  file: '/assets/exams/ریاضی مهندسی953.pdf',
  questions: [
    {
      id: 'sk-95-takmili-q1',
      numberLabel: '۱',
      topic: 'سری فوریه',
      statement:
        'توابع $\\{2x+1,\\,6x(x+1)+1\\}$ را در نظر بگیرید. الف) نشان دهید در بازهٔ $[-1,0]$ متعامدند. ب) بسط تابع $x^2$ را بر حسب توابع فوق بنویسید.',
      approach: 'مشابه امتحان ۹۳/۹/۲۰ — ضرب داخلی صفر و تصویر متعامد با باقیماندهٔ ثابت.',
      steps: [
        {
          title: 'الف) ضرب داخلی',
          formula:
            '\\int_{-1}^{0}(2x+1)(6x^{2}+6x+1)\\,dx=\\Big[3x^{4}+6x^{3}+4x^{2}+x\\Big]_{-1}^{0}=0',
        },
        {
          title: 'ب) ضرایب تصویر',
          formula:
            '\\|2x+1\\|^{2}=\\frac13,\\;\\;\\|6x(x+1)+1\\|^{2}=\\frac15;\\quad \\langle x^{2},2x+1\\rangle=-\\frac16,\\;\\;\\langle x^{2},6x(x+1)+1\\rangle=\\frac{1}{30}',
        },
        {
          title: 'بسط',
          formula:
            'a=-\\frac12,\\;\\;b=\\frac16\\;\\Longrightarrow\\;x^{2}-\\frac13=-\\frac12(2x+1)+\\frac16\\big(6x(x+1)+1\\big)',
          detail:
            'جملهٔ $\\tfrac13$ بر هر دو تابع عمود است، پس این دقیق‌ترین بسط روی فضای حاصل است.',
        },
      ],
      finalAnswer:
        '\\langle v_1,v_2\\rangle=0;\\qquad x^{2}= -\\frac12(2x+1)+\\frac16\\big(6x(x+1)+1\\big)+\\frac13',
    },
    {
      id: 'sk-95-takmili-q2',
      numberLabel: '۲',
      topic: 'سری فوریه',
      statement:
        'برای تابع $f(x)=0$ روی $[-\\pi,0)$ و $f(x)=x/2$ روی $[0,\\pi)$:‌ الف) سری فوریه را بیابید. ب) مقدار $1+\\frac{1}{3^2}+\\frac{1}{5^2}+\\cdots$ را محاسبه کنید.',
      approach: 'مشابه امتحان ۹۳/۹/۲۰ سؤال ۲ — ارزیابی در $x=\\pi$.',
      steps: [
        {
          title: 'الف) ضرایب',
          formula:
            '\\frac{a_0}{2}=\\frac{\\pi}{8},\\qquad a_n=\\frac{(\\!-\\!1)^{n}-1}{2\\pi n^{2}},\\qquad b_n=\\frac{(\\!-\\!1)^{n+1}}{2n}',
        },
        {
          title: 'ب) ارزیابی در $x=\\pi$',
          formula:
            '\\frac{\\pi}{4}=\\frac{\\pi}{8}+\\frac{1}{\\pi}\\sum_{k=1}^{\\infty}\\frac{1}{(2k-1)^{2}}\\;\\Longrightarrow\\;1+\\frac19+\\frac{1}{25}+\\cdots=\\frac{\\pi^{2}}{8}',
        },
      ],
      finalAnswer:
        'f(x)=\\frac{\\pi}{8}-\\frac{1}{\\pi}\\sum_{k=1}^{\\infty}\\frac{\\cos((2k-1)x)}{(2k-1)^{2}}+\\frac12\\sum_{n=1}^{\\infty}\\frac{(\\!-\\!1)^{n+1}}{n}\\sin(nx);\\qquad \\sum_{odd}\\frac{1}{n^{2}}=\\frac{\\pi^{2}}{8}',
    },
    {
      id: 'sk-95-takmili-q3',
      numberLabel: '۳',
      topic: 'سری فوریه',
      statement: 'سری فوریهٔ انتقال‌یافتهٔ $\\sin(\\pi x)$، $x\\in[0,1]$ را بنویسید.',
      approach: 'سری با دورهٔ $T=1$ (فرکانس $2\\pi n$) روی خود بازه.',
      steps: [
        {
          title: 'ضرایب',
          formula:
            '\\frac{a_0}{2}=\\frac{2}{\\pi},\\qquad a_n=-\\frac{4}{\\pi(2n-1)(2n+1)},\\qquad b_n=0',
        },
        {
          title: 'سری',
          formula:
            '\\sin(\\pi x)=\\frac{2}{\\pi}-\\frac{4}{\\pi}\\sum_{n=1}^{\\infty}\\frac{\\cos(2\\pi n x)}{(2n-1)(2n+1)},\\qquad 0\\le x\\le1',
        },
      ],
      finalAnswer:
        '\\sin(\\pi x)=\\frac{2}{\\pi}-\\frac{4}{\\pi}\\sum_{n=1}^{\\infty}\\frac{\\cos(2\\pi nx)}{(2n-1)(2n+1)}',
    },
    {
      id: 'sk-95-takmili-q4',
      numberLabel: '۴',
      topic: 'انتگرال فوریه',
      statement: 'ثابت کنید:',
      statementFormula:
        '\\int_{0}^{\\infty}\\frac{1-\\cos\\pi\\omega}{\\omega}\\,\\sin(\\omega x)\\,d\\omega=\\begin{cases}\\dfrac{\\pi}{2} & x\\in[0,\\pi]\\\\  0 & x>\\pi\\end{cases}',
      approach: 'انتگرال فوریهٔ سینوسی تابع $1$ روی $[0,\\pi]$.',
      steps: [
        {
          title: 'ضریب و وارون',
          formula:
            'B(\\omega)=\\frac{2}{\\pi}\\cdot\\frac{1-\\cos\\pi\\omega}{\\omega}\\;\\Longrightarrow\\;\\int_{0}^{\\infty}\\frac{1-\\cos\\pi\\omega}{\\omega}\\sin(\\omega x)\\,d\\omega=\\frac{\\pi}{2}f(x)',
          detail: 'با $f=1$ روی $(0,\\pi)$ و $f=0$ در بیرون (میانگین $\\tfrac12$ در $x=\\pi$).',
        },
      ],
      finalAnswer:
        '\\int_{0}^{\\infty}\\frac{1-\\cos\\pi\\omega}{\\omega}\\sin(\\omega x)\\,d\\omega=\\begin{cases}\\dfrac{\\pi}{2} & 0\\le x\\le\\pi\\\\ 0 & x>\\pi\\end{cases}',
    },
    {
      id: 'sk-95-takmili-q5',
      numberLabel: '۵',
      topic: 'اشتورم–لیوویل',
      statement:
        'فقط توابع ویژهٔ متناظر با معادلهٔ گرما زیر را محاسبه کنید (لازم نیست همهٔ معادله حل شود):',
      statementFormula:
        'u_t=16u_{xx};\\qquad u(0,t)+u_x(0,t)=0,\\quad u(1,t)+u_x(1,t)=0;\\qquad u(x,0)=2x',
      approach:
        'مسئلهٔ مقدار ویژهٔ رابین–رابین؛ از $X+X\'=0$ در $x=1$ شرط ویژه $\\sin\\mu=0$ (یعنی $\\mu_n=n\\pi$) به دست می‌آید.',
      steps: [
        {
          title: 'حالت‌های بدیهی',
          detail:
            'برای $\\lambda=0$ داریم $X=Ax+B$؛ شرط $X+X\'$ در $0$ یعنی $B+A=0$ و در $1$ یعنی $A+B+A=0$؛ این دو فقط $A=B=0$ می‌دهند، پس $\\lambda=0$ مقدار ویژه نیست. حالت $\\lambda=-\\mu^2<0$ نیز فقط جواب بدیهی دارد.',
        },
        {
          title: 'حالت $\\lambda=\\mu^2>0$؛ شرط در $x=0$',
          formula:
            "X=A\\cos\\mu x+B\\sin\\mu x,\\;\\;X(0)+X'(0)=A+\\mu B=0\\;\\Rightarrow\\;X=\\cos\\mu x-\\frac{1}{\\mu}\\sin\\mu x",
        },
        {
          title: 'شرط در $x=1$',
          formula:
            "X(1)+X'(1)=-\\sin\\mu\\,\\Big(\\mu+\\frac{1}{\\mu}\\Big)=0\\;\\Longrightarrow\\;\\sin\\mu=0\\;\\Longrightarrow\\;\\mu_n=n\\pi",
          detail:
            'چون $\\mu+\\tfrac{1}{\\mu}$ هرگز صفر نمی‌شود، شرط ویژه $\\sin\\mu=0$ است؛ یعنی $\\lambda_n=n^2\\pi^2$ و توابع ویژه $X_n=\\cos n\\pi x-\\frac{\\sin n\\pi x}{n\\pi}$ (استانداردشده: $\\pi X_n$ نیز قابل قبول است).',
        },
      ],
      finalAnswer:
        'X_n(x)=\\cos(n\\pi x)-\\frac{\\sin(n\\pi x)}{n\\pi},\\qquad \\lambda_n=n^{2}\\pi^{2},\\quad n=1,2,\\dots',
      notes: [
        'دام سؤال: چون هر دو شرط از نوع $u+u_x$ هستند، شرط ویژه $\\sin\\mu=0$ می‌دهد نه $\\tan\\mu=\\mu$.',
      ],
    },
  ],
};

export const SK_96_MIDTERM: ExamPaper = {
  id: 'sk-96-midterm',
  university: 'دانشگاه شهرکرد',
  title: 'نیم‌ترم',
  semester: 'نیمسال اول ۱۳۹۶–۱۳۹۷',
  duration: '۱۲۰ دقیقه',
  file: '/assets/exams/ریاضی مهندسی962.pdf',
  questions: [
    {
      id: 'sk-96-midterm-q1a',
      numberLabel: '۱-الف',
      topic: 'سری فوریه',
      statement: 'سری فوریه این تابع را بیابید:',
      statementFormula:
        'f(x)=\\begin{cases}0 & x\\in[-\\pi,0)\\\\  1 & x\\in[0,\\pi)\\end{cases}',
      approach: 'موج مربعی — مشابه امتحان ۹۵.',
      steps: [
        {
          title: 'ضرایب',
          formula:
            'a_0=1,\\qquad a_n=0,\\qquad b_n=\\frac{1-(\\!-\\!1)^n}{\\pi n}=\\frac{2}{\\pi n}\\;(n\\;\\text{فرد})',
        },
        {
          title: 'سری',
          formula:
            'f(x)=\\frac12+\\frac{2}{\\pi}\\sum_{k=1}^{\\infty}\\frac{\\sin((2k-1)x)}{2k-1}',
        },
      ],
      finalAnswer:
        'f(x)=\\frac{1}{2}+\\frac{2}{\\pi}\\sum_{k=1}^{\\infty}\\frac{\\sin\\big((2k-1)x\\big)}{2k-1}',
    },
    {
      id: 'sk-96-midterm-q1b',
      numberLabel: '۱-ب',
      topic: 'سری فوریه',
      statement: 'به کمک تساوی پارسوال ثابت کنید $\\displaystyle\\sum_{n=1}^{\\infty}\\frac{1}{(2n-1)^2}=\\frac{\\pi^2}{8}$.',
      approach: 'پارسوال روی موج مربعی.',
      steps: [
        {
          title: 'پارسوال',
          formula:
            '\\frac{1}{\\pi}\\int_{-\\pi}^{\\pi}f^{2}dx=\\frac{a_0^{2}}{2}+\\sum_{n=1}^{\\infty}\\big(a_n^{2}+b_n^{2}\\big)\\;\\Longrightarrow\\;1=\\frac12+\\sum_{k=1}^{\\infty}\\frac{4}{\\pi^{2}(2k-1)^{2}}',
        },
        {
          title: 'نتیجه',
          formula:
            '\\sum_{k=1}^{\\infty}\\frac{1}{(2k-1)^{2}}=\\frac{\\pi^{2}}{8}',
        },
      ],
      finalAnswer:
        '\\sum_{n=1}^{\\infty}\\frac{1}{(2n-1)^{2}}=\\frac{1}{2}\\cdot\\frac{\\pi^{2}}{4}=\\frac{\\pi^{2}}{8}',
    },
    {
      id: 'sk-96-midterm-q2',
      numberLabel: '۲',
      topic: 'انتگرال فوریه',
      statement:
        'برای تابع $f(x)=1$ ($|x|<1$) و $f(x)=0$ ($|x|\\ge1$) ابتدا انتگرال فوریه بیابید و سپس مقدار $\\int_0^\\infty\\frac{\\sin\\alpha}{\\alpha}\\,d\\alpha$ را محاسبه کنید.',
      approach: 'تابع زوج؛ در $x=0$ (نقطهٔ پیوستگی) وارون را ارزیابی می‌کنیم.',
      steps: [
        {
          title: 'ضریب $A(\\alpha)$',
          formula:
            'A(\\alpha)=\\frac{1}{\\pi}\\int_{-1}^{1}\\cos(\\alpha t)\\,dt=\\frac{2\\sin\\alpha}{\\pi\\alpha},\\qquad B(\\alpha)=0',
        },
        {
          title: 'انتگرال فوریه',
          formula:
            'f(x)=\\frac{2}{\\pi}\\int_{0}^{\\infty}\\frac{\\sin\\alpha\\,\\cos\\alpha x}{\\alpha}\\,d\\alpha',
        },
        {
          title: 'ارزیابی در $x=0$',
          formula:
            '1=\\frac{2}{\\pi}\\int_{0}^{\\infty}\\frac{\\sin\\alpha}{\\alpha}\\,d\\alpha\\;\\Longrightarrow\\;\\int_{0}^{\\infty}\\frac{\\sin\\alpha}{\\alpha}\\,d\\alpha=\\frac{\\pi}{2}\\;\\checkmark',
          detail:
            'در $x=0$ تابع پیوسته است (مقدار $1$) پس گذر حد مجاز است — همان انتگرال دیریکله.',
        },
      ],
      finalAnswer:
        'f(x)=\\frac{2}{\\pi}\\int_{0}^{\\infty}\\frac{\\sin\\alpha\\,\\cos(\\alpha x)}{\\alpha}\\,d\\alpha,\\qquad \\int_{0}^{\\infty}\\frac{\\sin\\alpha}{\\alpha}\\,d\\alpha=\\frac{\\pi}{2}',
    },
    {
      id: 'sk-96-midterm-q3',
      numberLabel: '۳',
      topic: 'اعداد مختلط',
      statement: 'عبارت‌های زیر را محاسبه کنید: الف) $i^{2i}$؛ ب) $\\sqrt[3]{-8i}$؛ ج) $\\mathrm{Arg}(1-i)$.',
      approach: 'لگاریتم مختلط میراثی، ریشه‌های سوم و آرگومان اصلی.',
      steps: [
        {
          title: 'الف) $i^{2i}$',
          formula:
            'i=e^{i(\\frac{\\pi}{2}+2k\\pi)}\\;\\Rightarrow\\;i^{2i}=e^{2i\\ln i}=e^{2i\\cdot i(\\frac{\\pi}{2}+2k\\pi)}=e^{-(4k+1)\\pi}',
          detail: 'مقدار اصلی ($k=0$):‌ $e^{-\\pi}\\approx0{.}0432$.',
        },
        {
          title: 'ب) ریشه‌های سوم $-8i$',
          formula:
            '-8i=8e^{i(-\\frac{\\pi}{2}+2k\\pi)}\\;\\Rightarrow\\;z_k=2e^{i(-\\frac{\\pi}{6}+\\frac{2k\\pi}{3})},\\quad k=0,1,2\\;\\Longrightarrow\\;z\\in\\Big\\{\\sqrt3-i,\\;\\;2i,\\;\\;-\\sqrt3-i\\Big\\}',
        },
        {
          title: 'ج) آرگومان اصلی',
          formula:
            '1-i=\\sqrt2\\,e^{-i\\pi/4}\\;\\Rightarrow\\;\\mathrm{Arg}(1-i)=-\\frac{\\pi}{4}',
        },
      ],
      finalAnswer:
        'i^{2i}=e^{-\\pi}\\;(\\text{اصلی});\\qquad \\sqrt[3]{-8i}\\in\\{\\sqrt3-i,\\;2i,\\;-\\sqrt3-i\\};\\qquad \\mathrm{Arg}(1-i)=-\\frac{\\pi}{4}',
    },
    {
      id: 'sk-96-midterm-q4',
      numberLabel: '۴',
      topic: 'معادله گرما',
      statement: 'معادلهٔ گرما زیر را به طور کامل حل کنید:',
      statementFormula:
        'u_t=25u_{xx},\\;\\;t>0,\\;x\\in[0,\\pi];\\qquad u_x(0,t)=u_x(\\pi,t)=0;\\qquad u(x,0)=-\\cos2x-\\sqrt2\\cos x',
      approach: 'شرط اولیه ترکیبی از توابع ویژهٔ نویمن؛ زوال نمایی مستقیم.',
      steps: [
        {
          title: 'توابع ویژه',
          formula:
            'X_n=\\cos(nx),\\;\\lambda_n=n^2;\\qquad \\cos2x\\,(n=2),\\;\\cos x\\,(n=1)',
        },
        {
          title: 'جواب',
          formula:
            'u(x,t)=-e^{-25\\cdot4\\,t}\\cos2x-\\sqrt2\\,e^{-25t}\\cos x',
        },
      ],
      finalAnswer:
        'u(x,t)=-e^{-100t}\\cos(2x)-\\sqrt2\\,e^{-25t}\\cos(x)',
    },
    {
      id: 'sk-96-midterm-q5a',
      numberLabel: '۵-الف',
      topic: 'اعداد مختلط',
      statement:
        'با استفاده از سری لوران و مفهوم مانده‌ها انتگرال زیر را بیابید:',
      statementFormula:
        '\\oint_{|z|=2}(z+i)^{2}\\,e^{\\frac{1}{z+i}}\\,d\\alpha',
      approach:
        'قطب اساسی در $z=-i$ (داخل $|z|=2$)؛ مانده = ضریب $(z+i)^{-1}$ در بسط لوران.',
      steps: [
        {
          title: 'بسط لوران',
          formula:
            '(z+i)^{2}e^{\\frac{1}{z+i}}=(z+i)^{2}\\sum_{m=0}^{\\infty}\\frac{1}{m!\\,(z+i)^{m}}=(z+i)^{2}+(z+i)+\\frac12+\\frac{1}{6(z+i)}+\\cdots',
        },
        {
          title: 'مانده و انتگرال',
          formula:
            '\\mathrm{Res}_{z=-i}=\\frac{1}{6}\\;\\Longrightarrow\\;\\oint_{|z|=2}=2\\pi i\\cdot\\frac{1}{6}=\\frac{\\pi i}{3}',
        },
      ],
      finalAnswer:
        '\\oint_{|z|=2}(z+i)^{2}e^{\\frac{1}{z+i}}\\,dz=\\frac{\\pi i}{3}',
    },
    {
      id: 'sk-96-midterm-q5b',
      numberLabel: '۵-ب',
      topic: 'اعداد مختلط',
      statement: 'انتگرال زیر را بیابید:',
      statementFormula:
        '\\oint_{|z|=\\frac12}\\frac{z+i}{z^{2}-2iz-1}\\,d\\alpha',
      approach:
        'مخرج $(z-i)^2$ است؛ نقطهٔ تکینگی $z=i$ با $|i|=1$ بیرون $|z|=\\tfrac12$ است.',
      steps: [
        {
          title: 'تجزیهٔ مخرج',
          formula: 'z^{2}-2iz-1=(z-i)^{2}',
        },
        {
          title: 'بررسی ناحیه',
          detail:
            'تنها تکینگی $z=i$ است که $|i|=1>\\tfrac12$؛ پس در داخل مسیر تابع تحلیلی است و با قضیهٔ کوشی انتگرال صفر است.',
          formula:
            '\\oint_{|z|=1/2}\\frac{z+i}{(z-i)^{2}}\\,dz=0',
        },
      ],
      finalAnswer:
        '\\oint_{|z|=\\frac12}\\frac{z+i}{z^{2}-2iz-1}\\,dz=0',
      notes: [
        'دام سؤال:‌ ظاهر انتگرال مانده‌محور است اما باید اول محل تکینگی‌ها را نسبت به مسیر کنترل کرد.',
      ],
    },
  ],
};

export const SHAHREKORD_1403_MIDTERM1: ExamPaper = {
  id: 'shahrekord-1403-midterm1',
  university: 'دانشگاه شهرکرد',
  title: 'میان‌ترم',
  semester: 'نیمسال اول ۱۴۰۳–۱۴۰۴',
  file: '/assets/exams/میانترم ریاضی مهندسی (1).pdf',
  questions: [
    {
      id: 'shahrekord-1403-midterm1-q1',
      numberLabel: '۱',
      topic: 'سری فوریه',
      statement:
        'سری فوریه تابع متناوب $f(x)=|x|+[x]$ با دورهٔ تناوب $T=2$ بر بازهٔ $(-1,1)$ بنویسید و وضعیت همگرایی آن را بررسی کنید.',
      approach:
        'روی $(-1,0)$ و $(0,1)$ بازنویسی می‌کنیم ($[x]$ جزء صحیح است)، سپس ضرایب را حساب می‌کنیم.',
      steps: [
        {
          title: 'بازنویسی تابع',
          formula:
            'f(x)=\\begin{cases}-x-1 & -1\\le x<0\\\\  x & 0\\le x<1\\end{cases}',
          detail:
            'چون $[x]=-1$ برای $-1\\le x<0$ و $[x]=0$ برای $0\\le x<1$ است؛ توجه کنید $f$ روی $(-1,0)$ منفی است.',
        },
        {
          title: 'ضریب $a_0$',
          formula:
            'a_0=\\int_{-1}^{1}f\\,dx=\\int_{-1}^{0}(-x-1)dx+\\int_{0}^{1}x\\,dx=-\\frac12+\\frac12=0',
          detail:
            'به بیان زوج/فرد:‌ $f=(|x|-\\tfrac12)+\\tfrac12\\,\\mathrm{sgn}(x)$؛ بخش زوج $|x|-\\tfrac12$ نُرم صفر دارد ($a_0=0$) و بخش فرد $\\tfrac12\\mathrm{sgn}(x)$ فقط جمله‌های سینوسی می‌سازد. قرارداد درس: $f\\simeq\\frac{a_0}{2}+\\sum\\big[a_n\\cos\\frac{n\\pi x}{\\ell}+b_n\\sin\\frac{n\\pi x}{\\ell}\\big]$ با $\\ell=1$.',
        },
        {
          title: 'ضریب $a_n$',
          formula:
            'a_n=\\int_{-1}^{1}f\\cos(n\\pi x)dx=\\int_{0}^{1}x\\cos(n\\pi x)dx+\\int_{-1}^{0}(-x-1)\\cos(n\\pi x)dx=\\frac{2\\big((\\!-\\!1)^{n}-1\\big)}{n^{2}\\pi^{2}}',
          detail:
            'با تغییر متغیر $u=-x$ در انتگرال اول: $\\int_{-1}^{0}(-x-1)\\cos(n\\pi x)dx=\\int_0^1(u-1)\\cos(n\\pi u)du$؛ جمع دو انتگرال = $2\\int_0^1(x-\\tfrac12)\\cos(n\\pi x)dx=2\\frac{(\\!-\\!1)^n-1}{n^2\\pi^2}$.',
        },
        {
          title: 'ضریب $b_n$',
          formula:
            'b_n=\\int_{-1}^{1}f\\sin(n\\pi x)dx=\\int_{0}^{1}x\\sin(n\\pi x)dx+\\int_{0}^{1}(1-u)\\sin(n\\pi u)du=\\int_{0}^{1}\\sin(n\\pi x)\\,dx=\\frac{1-(\\!-\\!1)^{n}}{n\\pi}',
          detail:
            'با تغییر متغیر $u=-x$ در انتگرال روی $[-1,0]$ و جمع دو قطعه، همه چیز جز $1$ ساده می‌شود؛ یعنی $b_n=\\frac{2}{n\\pi}$ برای $n$ فرد و $b_n=0$ برای $n$ زوج (سازگار با بسط بخش فرد $\\tfrac12\\,\\mathrm{sgn}(x)$).',
        },
        {
          title: 'سری فوریه',
          formula:
            'f(x)\\simeq-\\frac{4}{\\pi^{2}}\\sum_{k=1}^{\\infty}\\frac{\\cos\\big((2k-1)\\pi x\\big)}{(2k-1)^{2}}+\\frac{2}{\\pi}\\sum_{k=1}^{\\infty}\\frac{\\sin\\big((2k-1)\\pi x\\big)}{2k-1}',
        },
        {
          title: 'وضعیت همگرایی',
          detail:
            '$f$ در $x=0$ پرش از $-1$ به $0$ دارد و در $x=\\pm1$ پرش از $1$ به $0$ (به‌صورت دوره‌ای). سری در نقاط پیوستگی به $f$ و در نقاط پرش به میانگین حد‌های یک‌طرفه همگراست: در $x=0$ مقدار $-\\tfrac12$ و در $x=\\pm1$ مقدار $\\tfrac12$. (پدیدهٔ گیبس نزدیک پرش‌ها دیده می‌شود.)',
        },
      ],
      finalAnswer:
        'f(x)\\simeq-\\frac{4}{\\pi^{2}}\\sum_{k=1}^{\\infty}\\frac{\\cos\\big((2k-1)\\pi x\\big)}{(2k-1)^{2}}+\\frac{2}{\\pi}\\sum_{k=1}^{\\infty}\\frac{\\sin\\big((2k-1)\\pi x\\big)}{2k-1}',
    },
    {
      id: 'shahrekord-1403-midterm1-q2',
      numberLabel: '۲',
      topic: 'انتگرال فوریه',
      statement:
        'انتگرال کسینوسی فوریه تابع زیر را بیابید و سپس به کمک آن مقدار انتگرال ناسرهٔ حقیقی $\\int_0^\\infty\\frac{1-\\cos\\alpha}{\\alpha^{2}}\\,d\\alpha$ را محاسبه کنید.',
      statementFormula:
        'f(x)=\\begin{cases}\\dfrac{\\pi}{2}(x-1) & 0<x<1\\\\  0 & x>1\\end{cases}',
      approach:
        '$F_c(\\alpha)$ را حساب می‌کنیم؛ وارون در $x=0$ (نقطهٔ پیوستگی $f$) مستقیماً انتگرال خواسته‌شده را می‌دهد.',
      steps: [
        {
          title: 'تبدیل کسینوسی',
          formula:
            'F_c(\\alpha)=\\int_{0}^{1}\\frac{\\pi}{2}(x-1)\\cos(\\alpha x)\\,dx=\\frac{\\pi}{2}\\Big[\\frac{(x-1)\\sin\\alpha x}{\\alpha}+\\frac{\\cos\\alpha x}{\\alpha^{2}}\\Big]_{0}^{1}=\\frac{\\pi(\\cos\\alpha-1)}{2\\alpha^{2}}',
        },
        {
          title: 'وارون',
          formula:
            'f(x)=\\frac{2}{\\pi}\\int_{0}^{\\infty}F_c(\\alpha)\\cos(\\alpha x)\\,d\\alpha=\\int_{0}^{\\infty}\\frac{(\\cos\\alpha-1)\\cos\\alpha x}{\\alpha^{2}}\\,d\\alpha',
        },
        {
          title: 'ارزیابی در $x=0$',
          formula:
            '-\\frac{\\pi}{2}=\\int_{0}^{\\infty}\\frac{\\cos\\alpha-1}{\\alpha^{2}}\\,d\\alpha\\;\\Longrightarrow\\;\\int_{0}^{\\infty}\\frac{1-\\cos\\alpha}{\\alpha^{2}}\\,d\\alpha=\\frac{\\pi}{2}\\;\\checkmark',
          detail:
            'در $x=0$ مقدار $f(0)=-\\frac{\\pi}{2}$ (تابع در $x=0$ پیوسته است چون حد $x\\to0^+$ برابر $-\\frac{\\pi}{2}$).',
        },
      ],
      finalAnswer:
        'F_c(\\alpha)=\\frac{\\pi(\\cos\\alpha-1)}{2\\alpha^{2}},\\qquad \\int_{0}^{\\infty}\\frac{1-\\cos\\alpha}{\\alpha^{2}}\\,d\\alpha=\\frac{\\pi}{2}',
      notes: [
        'بررسی همگرایی انتگرال در مبدأ: $\\frac{1-\\cos\\alpha}{\\alpha^2}\\to\\frac12$ و در بی‌نهایت $\\sim\\frac{1}{\\alpha^2}$ — کاملاً همگرا.',
      ],
    },
    {
      id: 'shahrekord-1403-midterm1-q3a',
      numberLabel: '۳-الف',
      topic: 'تبدیل فوریه',
      statement: 'تبدیل فوریهٔ زیر را به دست آورید:',
      statementFormula: '\\mathcal{F}\\Big\\{\\frac{x+1}{\\big(x^{2}+2x+2\\big)^{2}}\\Big\\}',
      approach:
        '$x^2+2x+2=(x+1)^2+1$؛ با مشتق‌گیری نسبت به $x$ و جابه‌جایی $\\alpha$.',
      steps: [
        {
          title: 'بازنویسی به‌صورت مشتق',
          formula:
            '\\frac{d}{dx}\\Big[\\frac{1}{(x+1)^{2}+1}\\Big]=\\frac{-2(x+1)}{\\big((x+1)^{2}+1\\big)^{2}}\\;\\Longrightarrow\\;\\frac{x+1}{\\big(x^{2}+2x+2\\big)^{2}}=-\\frac12\\,h\'(x),\\;\\;h(x)=\\frac{1}{(x+1)^{2}+1}',
        },
        {
          title: 'تبدیل $h$ با جابه‌جایی',
          formula:
            '\\mathcal{F}\\Big\\{\\frac{1}{x^{2}+1}\\Big\\}=\\pi e^{-|\\alpha|}\\;\\xrightarrow{\\;x\\to x+1\\;}\\;H(\\alpha)=\\pi e^{i\\alpha}e^{-|\\alpha|}',
        },
        {
          title: 'قاعدهٔ مشتق',
          formula:
            "\\mathcal{F}\\{h'\\}=i\\alpha H(\\alpha)\\;\\Longrightarrow\\;\\mathcal{F}\\Big\\{\\frac{x+1}{(x^{2}+2x+2)^{2}}\\Big\\}=-\\frac{i\\pi\\alpha}{2}\\,e^{i\\alpha}e^{-|\\alpha|}",
        },
      ],
      finalAnswer:
        '\\mathcal{F}\\Big\\{\\frac{x+1}{(x^{2}+2x+2)^{2}}\\Big\\}(\\alpha)=-\\frac{i\\pi\\alpha}{2}\\,e^{i\\alpha-|\\alpha|}',
    },
    {
      id: 'shahrekord-1403-midterm1-q3b',
      numberLabel: '۳-ب',
      topic: 'تبدیل فوریه',
      statement: 'تبدیل فوریهٔ وارون زیر را محاسبه کنید:',
      statementFormula:
        '\\mathcal{F}^{-1}\\left\\{\\frac{e^{-2i\\alpha}}{-\\alpha^{2}-6i\\alpha+5}\\right\\}',
      approach:
        'ریشه‌های مخرج $\\alpha=-i,-5i$؛ کسر جزئی در قالب $\\frac{1}{a-i\\alpha}$ (پشتیبانی نیم‌خط منفی) و جابه‌جایی $x\\to x-2$.',
      steps: [
        {
          title: 'کسر جزئی',
          formula:
            '-\\alpha^{2}-6i\\alpha+5=-(\\alpha+i)(\\alpha+5i)\\;\\Longrightarrow\\;\\frac{1}{-\\alpha^{2}-6i\\alpha+5}=\\frac14\\Big[\\frac{1}{1-i\\alpha}-\\frac{1}{5-i\\alpha}\\Big]',
        },
        {
          title: 'وارون در قالب نیم‌خط',
          formula:
            '\\mathcal{F}^{-1}\\Big\\{\\frac{1}{a-i\\alpha}\\Big\\}=e^{ax}H(-x)\\;\\Longrightarrow\\;\\frac14\\Big[e^{x}-e^{5x}\\Big]H(-x)',
          detail:
            'چون $\\int_{-\\infty}^{0}e^{ax}e^{-i\\alpha x}dx=\\frac{1}{a-i\\alpha}$ برای $a>0$ است (بدون ضریب اضافی).',
        },
        {
          title: 'جابه‌جایی با $e^{-2i\\alpha}$',
          formula:
            '\\frac14\\Big[e^{x-2}-e^{5(x-2)}\\Big]H\\big(2-x\\big)',
        },
      ],
      finalAnswer:
        '\\mathcal{F}^{-1}\\left\\{\\frac{e^{-2i\\alpha}}{-\\alpha^{2}-6i\\alpha+5}\\right\\}=\\frac14\\Big(e^{x-2}-e^{5x-10}\\Big)H(2-x)',
      notes: [
        'کنترل عددی: در $\\alpha=0$ مقدار عبارت اصلی $\\frac15$ است و انتگرال وارون $\\int_{-\\infty}^{2}\\frac14(e^{x-2}-e^{5(x-2)})dx=\\frac14\\big(1-\\frac15\\big)=\\frac15$ همان مقدار را می‌دهد ✓',
      ],
    },
    {
      id: 'shahrekord-1403-midterm1-q4',
      numberLabel: '۴',
      topic: 'معادله گرما',
      statement: 'مسئلهٔ مشتقات جزئی زیر را حل کنید:',
      statementFormula:
        'u_t=16u_{xx},\\;\\;0\\le x\\le1,\\;t\\ge0;\\qquad u_x(0,t)=0,\\quad u_x(1,t)=0;\\qquad u(x,0)=-\\tfrac12\\cos(2\\pi x)+\\sqrt3\\cos(3\\pi x)',
      approach: 'نویمن دوطرفه؛ شرط اولیه از قبل ترکیبی از $\\cos(n\\pi x)$ است.',
      steps: [
        {
          title: 'توابع ویژه',
          formula:
            'X_n=\\cos(n\\pi x),\\qquad \\lambda_n=n^{2}\\pi^{2},\\qquad u=\\frac{a_0}{2}+\\sum a_ne^{-16n^{2}\\pi^{2}t}\\cos(n\\pi x)',
        },
        {
          title: 'شناسایی جمله‌ها',
          formula:
            '-\\tfrac12\\cos(2\\pi x)\\;(n=2),\\qquad \\sqrt3\\cos(3\\pi x)\\;(n=3),\\qquad a_0=0',
        },
        {
          title: 'جواب',
          formula:
            'u(x,t)=-\\frac12\\,e^{-64\\pi^{2}t}\\cos(2\\pi x)+\\sqrt3\\,e^{-144\\pi^{2}t}\\cos(3\\pi x)',
        },
      ],
      finalAnswer:
        'u(x,t)=-\\frac{1}{2}e^{-64\\pi^{2}t}\\cos(2\\pi x)+\\sqrt3\\,e^{-144\\pi^{2}t}\\cos(3\\pi x)',
    },
  ],
};
