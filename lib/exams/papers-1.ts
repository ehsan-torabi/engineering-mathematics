import type { ExamPaper } from './types.ts';

/**
 * Paper 1 — دانشگاه شهرکرد، میان‌ترم دوم ۹۳–۹۴ (فایل 4_5996715016068268742.pdf).
 * Paper 2 — امتحان نیم‌ترم Sku، ۱۴۰۴/۰۸/۲۸ (math_Eng-40401-midterm-Sku (2).pdf)
 *          — همین فایل همراهِ راه‌حلِ رسمی است؛ در سؤال ۱-ب خطای برگهٔ رسمی اصلاح شده است.
 * Paper 3 — دانشگاه شهرکرد، میان‌ترم ۱۴۰۳–۱۴۰۴ نیمسال دوم (midterm math_eng.pdf).
 */

export const SK_9394_MIDTERM2: ExamPaper = {
  id: 'sk-9394-midterm2',
  university: 'دانشگاه شهرکرد',
  title: 'میان‌ترم دوم',
  semester: 'نیمسال دوم ۱۳۹۳–۱۳۹۴',
  examDate: '۱۳۹۴/۰۲/۲۴',
  duration: '۱۰۰ دقیقه',
  file: '/assets/exams/4_5996715016068268742.pdf',
  questions: [
    {
      id: 'sk-9394-midterm2-q1',
      numberLabel: '۱',
      marks: '۲ نمره',
      topic: 'سری فوریه',
      statement:
        'سری فوریه تابع $f(x)=\\cos(\\alpha x)$ در فاصله $[-\\pi,\\pi]$ که $\\alpha$ عددی غیرصحیح است را به دست آورید و به کمک آن نشان دهید:',
      statementFormula:
        '\\sum_{n=1}^{\\infty}\\frac{1}{\\alpha^{2}-n^{2}}=\\frac{\\pi}{2\\alpha}\\cot(\\pi\\alpha)-\\frac{1}{2\\alpha^{2}}',
      approach:
        'چون $\\cos(\\alpha x)$ زوج است فقط ضرایب $a_n$ داریم؛ سری را در $x=\\pi$ جای‌گذاری می‌کنیم.',
      steps: [
        {
          title: 'محاسبهٔ $a_0$',
          formula:
            'a_0=\\frac{1}{\\pi}\\int_{-\\pi}^{\\pi}\\cos(\\alpha x)\\,dx=\\frac{2}{\\pi}\\int_{0}^{\\pi}\\cos(\\alpha x)\\,dx=\\frac{2\\sin(\\alpha\\pi)}{\\pi\\alpha}',
        },
        {
          title: 'محاسبهٔ $a_n$ با حاصل‌ضرب به مجموع کسینوس‌ها',
          formula:
            'a_n=\\frac{2}{\\pi}\\int_{0}^{\\pi}\\cos(\\alpha x)\\cos(nx)\\,dx=\\frac{1}{\\pi}\\int_{0}^{\\pi}\\big[\\cos((\\alpha-n)x)+\\cos((\\alpha+n)x)\\big]dx',
          detail:
            'چون $\\alpha$ صحیح نیست مخرج‌ها صفر نمی‌شوند و انتگرال‌ها کاملاً محدودند.',
        },
        {
          title: 'ساده‌سازی با $\\sin((\\alpha\\pm n)\\pi)=(\\!-\\!1)^n\\sin(\\alpha\\pi)$',
          formula:
            'a_n=\\frac{(\\!-\\!1)^n\\sin(\\alpha\\pi)}{\\pi}\\Big[\\frac{1}{\\alpha-n}+\\frac{1}{\\alpha+n}\\Big]=\\frac{2\\alpha\\,\\sin(\\alpha\\pi)}{\\pi}\\cdot\\frac{(\\!-\\!1)^n}{\\alpha^{2}-n^{2}}',
        },
        {
          title: 'سری فوریه',
          formula:
            '\\cos(\\alpha x)=\\frac{\\sin(\\alpha\\pi)}{\\pi\\alpha}+\\frac{2\\alpha\\sin(\\alpha\\pi)}{\\pi}\\sum_{n=1}^{\\infty}\\frac{(\\!-\\!1)^n}{\\alpha^{2}-n^{2}}\\cos(nx),\\qquad -\\pi\\le x\\le\\pi',
        },
        {
          title: 'قرار دادن $x=\\pi$ و حل برای مجموع',
          formula:
            '\\cos(\\alpha\\pi)=\\frac{\\sin(\\alpha\\pi)}{\\pi\\alpha}+\\frac{2\\alpha\\sin(\\alpha\\pi)}{\\pi}\\sum_{n=1}^{\\infty}\\frac{1}{\\alpha^{2}-n^{2}}',
          detail:
            'چون $\\cos(n\\pi)=(\\!-\\!1)^n$ است، عامل $(\\!-\\!1)^n$ سری حذف می‌شود و مجموع خواسته‌شده به دست می‌آید.',
        },
      ],
      finalAnswer:
        '\\cos(\\alpha x)=\\frac{\\sin(\\alpha\\pi)}{\\pi\\alpha}+\\frac{2\\alpha\\sin(\\alpha\\pi)}{\\pi}\\sum_{n=1}^{\\infty}\\frac{(\\!-\\!1)^n\\cos(nx)}{\\alpha^{2}-n^{2}}\\;\\Rightarrow\\;\\sum_{n=1}^{\\infty}\\frac{1}{\\alpha^{2}-n^{2}}=\\frac{\\pi}{2\\alpha}\\cot(\\pi\\alpha)-\\frac{1}{2\\alpha^{2}}',
      notes: [
        'همان کسر جزئی معروف $\\pi\\cot(\\pi\\alpha)=\\dfrac{1}{\\alpha}+2\\alpha\\sum_{n=1}^{\\infty}\\dfrac{1}{\\alpha^2-n^2}$ به دست می‌آید.',
        'در $x=\\pi$ تابع پیوستگی دارد، پس سری به خود مقدار $\\cos(\\alpha\\pi)$ همگراست.',
      ],
    },
    {
      id: 'sk-9394-midterm2-q2',
      numberLabel: '۲',
      marks: '۱ نمره',
      topic: 'انتگرال فوریه',
      statement: 'با استفاده از روش مناسب از آنالیز فوریه نشان دهید:',
      statementFormula:
        '\\int_{0}^{\\infty}\\frac{\\sin(\\pi\\alpha)\\,\\sin(\\alpha x)}{1-\\alpha^{2}}\\,d\\alpha=\\begin{cases}\\dfrac{\\pi}{2}\\sin x & 0\\le x\\le\\pi\\\\  0 & x>\\pi\\end{cases}=\\frac{\\pi}{2}H(x-\\pi)\\sin x',
      approach:
        'انتگرال فوریهٔ سینوسیِ تابع $f(x)=\\sin x$ روی $[0,\\pi]$ را می‌سازیم؛ ضریب $B(\\alpha)$ دقیقاً همین هستهٔ انتگرال را می‌دهد.',
      steps: [
        {
          title: 'تعریف انتگرال فوریهٔ سینوسی',
          formula:
            'f(x)=\\int_{0}^{\\infty}B(\\alpha)\\sin(\\alpha x)\\,d\\alpha,\\qquad B(\\alpha)=\\frac{2}{\\pi}\\int_{0}^{\\infty}f(t)\\sin(\\alpha t)\\,dt',
        },
        {
          title: 'محاسبهٔ $B(\\alpha)$ برای $f=\\sin t$ روی $[0,\\pi]$',
          formula:
            '\\int_{0}^{\\pi}\\sin t\\,\\sin(\\alpha t)\\,dt=\\frac{1}{2}\\int_{0}^{\\pi}\\big[\\cos((1-\\alpha)t)-\\cos((1+\\alpha)t)\\big]dt=\\frac{\\sin(\\alpha\\pi)}{1-\\alpha^{2}}',
          detail:
            'از $\\sin((1\\mp\\alpha)\\pi)=\\pm\\sin(\\alpha\\pi)$ استفاده می‌شود؛ یعنی $\\sin((1-\\alpha)\\pi)=\\sin(\\alpha\\pi)$ و $\\sin((1+\\alpha)\\pi)=-\\sin(\\alpha\\pi)$.',
        },
        {
          title: 'بازسازی $f$ از انتگرال',
          formula:
            'f(x)=\\frac{2}{\\pi}\\int_{0}^{\\infty}\\frac{\\sin(\\alpha\\pi)\\sin(\\alpha x)}{1-\\alpha^{2}}\\,d\\alpha',
          detail:
            'بنابر تعریف، $f(x)=\\sin x$ برای $0\\le x\\le\\pi$ و $f(x)=0$ برای $x>\\pi$ (گسترش صفر در بیرون بازه).',
        },
        {
          title: 'نتیجه‌گیری',
          detail:
            'با ضرب طرفین در $\\pi/2$، تساوی خواسته‌شده به دست می‌آید؛ در $x=\\pi$ سری به میانگین حد‌های یک‌طرفه یعنی $0$ میل می‌کند که با $\\sin\\pi=0$ سازگار است.',
        },
      ],
      finalAnswer:
        '\\int_{0}^{\\infty}\\frac{\\sin(\\pi\\alpha)\\sin(\\alpha x)}{1-\\alpha^{2}}\\,d\\alpha=\\frac{\\pi}{2}f(x)=\\begin{cases}\\dfrac{\\pi}{2}\\sin x & 0\\le x\\le\\pi\\\\ 0 & x>\\pi\\end{cases}',
    },
    {
      id: 'sk-9394-midterm2-q3',
      numberLabel: '۳',
      marks: '۱ نمره',
      topic: 'تبدیل فوریه',
      statement: 'تبدیل فوریه تابع زیر را به دست آورید (قرارداد درس: $\\mathcal{F}\\{f\\}=\\int_{-\\infty}^{\\infty}f(x)e^{-i\\alpha x}dx$):',
      statementFormula:
        'f(x)=\\begin{cases}e^{2ix} & |x|<1\\\\ 0 & |x|\\ge 1\\end{cases}',
      approach: 'انتگرال تعریف را روی بازهٔ متناهی $(-1,1)$ محاسبه می‌کنیم.',
      steps: [
        {
          title: 'نوشتن انتگرال',
          formula:
            'F(\\alpha)=\\int_{-1}^{1}e^{2ix}e^{-i\\alpha x}dx=\\int_{-1}^{1}e^{i(2-\\alpha)x}dx',
        },
        {
          title: 'محاسبهٔ انتگرال نمایی مختلط',
          formula:
            'F(\\alpha)=\\left[\\frac{e^{i(2-\\alpha)x}}{i(2-\\alpha)}\\right]_{-1}^{1}=\\frac{e^{i(2-\\alpha)}-e^{-i(2-\\alpha)}}{i(2-\\alpha)}=\\frac{2\\sin(2-\\alpha)}{2-\\alpha}',
        },
      ],
      finalAnswer:
        '\\mathcal{F}\\{f\\}(\\alpha)=\\frac{2\\sin(2-\\alpha)}{2-\\alpha}=\\frac{2\\sin(\\alpha-2)}{\\alpha-2}',
      notes: [
        'در $\\alpha=2$ حد تابع یعنی $2$ را در نظر بگیرید (فرم سینوسِ سینکر $2\\,\\mathrm{sinc}(2-\\alpha)$).',
      ],
    },
    {
      id: 'sk-9394-midterm2-q4',
      numberLabel: '۴-الف',
      marks: '۱ نمره',
      topic: 'اعداد مختلط',
      statement:
        'با بررسی معادلات کوشی–ریمان نشان دهید تابع $f(z)=|z|^2+i\\,\\mathrm{Im}(z^2)$ فقط روی محور حقیقی مشتق‌پذیر است و مقدار $f\'(-1)$ را بیابید.',
      approach:
        'با $z=x+iy$ اجزای حقیقی و موهومی را جدا کرده و معادلات کوشی–ریمان را حل می‌کنیم.',
      steps: [
        {
          title: 'جداسازی $u$ و $v$',
          formula:
            'u(x,y)=x^{2}+y^{2},\\qquad v(x,y)=2xy',
          detail:
            'چون $|z|^2=x^2+y^2$ و $\\mathrm{Im}(z^2)=\\mathrm{Im}\\big((x+iy)^2\\big)=2xy$ است.',
        },
        {
          title: 'اعمال معادلات کوشی–ریمان',
          formula:
            'u_x=2x=v_y=2x\\;\\checkmark\\qquad u_y=2y=-v_x=-2y\\;\\Rightarrow\\; y=0',
          detail:
            'معادلهٔ اول همیشه برقرار است؛ معادلهٔ دوم فقط $y=0$ را می‌دهد، یعنی محور حقیقی. چون جزئی‌ها چندجمله‌ای‌اند (پیوسته)، مشتق‌پذیری دقیقاً روی محور حقیقی برقرار است.',
        },
        {
          title: 'مقدار $f\'$ روی محور',
          formula:
            "f'(z)=u_x+i\\,v_x=2x+2iy\\;\\Rightarrow\\; f'(-1)=2(-1)+2i(0)=-2",
        },
      ],
      finalAnswer:
        "f(z)=|z|^{2}+i\\,\\mathrm{Im}(z^{2})\\;\\text{دقیقاً روی}\\;\\{y=0\\}\\;\\text{مشتق‌پذیر است}\\,;\\quad f'(-1)=-2",
      notes: [
        'در برگهٔ امتحان عبارت بدون $i$ چاپ شده است ($|z|^2+\\mathrm{Im}(z^2)=(x+y)^2$)؛ آن نسخه روی خط $y=-x$ مشتق‌پذیر است نه محور حقیقی، پس متن سؤال تنها با حضور عامل $i$ سازگار است — این نکته در پاسخ‌نامه ذکر شود.',
      ],
    },
    {
      id: 'sk-9394-midterm2-q4b',
      numberLabel: '۴-ب',
      marks: '۱ نمره',
      topic: 'اعداد مختلط',
      statement: 'در مشتق‌پذیری تابع $f(z)=(\\mathrm{Re}\\,z)^2+(\\mathrm{Im}\\,z)^2$ بحث کنید.',
      approach: 'باز هم کوشی–ریمان؛ این بار هر دو شرط هم‌زمان باید صفر شوند.',
      steps: [
        {
          title: 'شکل حقیقی تابع',
          formula: 'f(z)=x^{2}+y^{2}=|z|^{2},\\qquad u=x^{2}+y^{2},\\; v=0',
        },
        {
          title: 'کوشی–ریمان',
          formula:
            'u_x=2x=0,\\qquad u_y=2y=0\\;\\Longrightarrow\\; x=y=0',
          detail:
            'هر دو شرط فقط در مبدأ برقرارند؛ پس $f$ فقط در $z=0$ مشتق‌پذیر است و $f\'(0)=u_x(0)+iv_x(0)=0$.',
        },
        {
          title: 'جمع‌بندی تحلیلی‌بودن',
          detail:
            'چون در هیچ همسایگی‌ای از مبدأ مشتق‌پذیر نیست، $f$ هیچ‌جا تحلیلی (هولومورفیک) نیست؛ این همان مثال کلاسیک «مشتق‌پذیر نقطه‌ای اما تحلیلی‌نشده» است.',
        },
      ],
      finalAnswer:
        "f(z)=|z|^{2}\\;\\text{فقط در}\\;z=0\\;\\text{مشتق‌پذیر است}\\;(f'(0)=0)\\;\\text{و هیچ‌جا تحلیلی نیست.}",
    },
    {
      id: 'sk-9394-midterm2-q5',
      numberLabel: '۵',
      marks: '۱ نمره',
      topic: 'اعداد مختلط',
      statement: 'ریشه‌های معادلهٔ $(1+z)^5=(1-z)^5$ را به دست آورید.',
      approach:
        'تقسیم بر $(1-z)^5$ و ریشه‌یابی پنجم واحد؛ سپس بازگشت به $z$ با تبدیل موبیوس.',
      steps: [
        {
          title: 'تبدیل به ریشه‌های واحد',
          formula:
            '\\Big(\\frac{1+z}{1-z}\\Big)^{5}=1\\;\\;(z\\neq1)\\;\\Longrightarrow\\;\\frac{1+z}{1-z}=e^{2k\\pi i/5},\\quad k=0,1,2,3,4',
        },
        {
          title: 'حل معادلهٔ خطی برای $z$',
          formula:
            'z=\\frac{w-1}{w+1},\\qquad w=e^{2k\\pi i/5}',
          detail:
            'چون $w=\\mathrm{cis}\\,\\theta$ داریم $z=\\dfrac{e^{i\\theta}-1}{e^{i\\theta}+1}=i\\tan\\dfrac{\\theta}{2}$.',
        },
        {
          title: 'پنج ریشه',
          formula:
            'z_k=i\\tan\\frac{k\\pi}{5},\\quad k=0,1,2,3,4\\;\\Longrightarrow\\; z\\in\\Big\\{0,\\;\\pm i\\tan\\frac{\\pi}{5},\\;\\pm i\\tan\\frac{2\\pi}{5}\\Big\\}',
          detail:
            '$\\tan(\\pi/5)\\approx0{.}7265$ و $\\tan(2\\pi/5)\\approx3{.}0777$؛ همهٔ ریشه‌ها موهومی محض‌اند چون طرفین معادله با جای‌گذاری $z\\to-z$ جابه‌جا می‌شوند.',
        },
      ],
      finalAnswer:
        'z=0,\\;\\; z=\\pm i\\tan\\frac{\\pi}{5},\\;\\; z=\\pm i\\tan\\frac{2\\pi}{5}',
    },
    {
      id: 'sk-9394-midterm2-q6',
      numberLabel: '۶',
      marks: '۱ نمره',
      topic: 'اعداد مختلط',
      statement:
        'سری لوران تابع $f(z)=\\dfrac{1}{(z+1)(z+2)}$ را در ناحیهٔ $1<|z|<2$ به دست آورید.',
      approach: 'کسر جزئی و باز هر کسر در ناحیهٔ مناسب (یکی حول بی‌نهایت، یکی حول صفر).',
      steps: [
        {
          title: 'کسر جزئی',
          formula: '\\frac{1}{(z+1)(z+2)}=\\frac{1}{z+1}-\\frac{1}{z+2}',
        },
        {
          title: 'بسط $\\dfrac{1}{z+1}$ برای $|z|>1$',
          formula:
            '\\frac{1}{z+1}=\\frac{1}{z}\\cdot\\frac{1}{1+\\frac{1}{z}}=\\frac{1}{z}\\sum_{n=0}^{\\infty}\\frac{(\\!-\\!1)^n}{z^{n}}=\\sum_{n=1}^{\\infty}\\frac{(\\!-\\!1)^{n-1}}{z^{n}}',
        },
        {
          title: 'بسط $\\dfrac{1}{z+2}$ برای $|z|<2$',
          formula:
            '\\frac{1}{z+2}=\\frac{1}{2}\\cdot\\frac{1}{1+\\frac{z}{2}}=\\sum_{n=0}^{\\infty}\\frac{(\\!-\\!1)^n}{2^{n+1}}\\,z^{n}',
        },
      ],
      finalAnswer:
        '\\frac{1}{(z+1)(z+2)}=\\underbrace{\\sum_{n=1}^{\\infty}\\frac{(\\!-\\!1)^{n-1}}{z^{n}}}_{|z|>1}\\;-\\;\\underbrace{\\sum_{n=0}^{\\infty}\\frac{(\\!-\\!1)^{n}}{2^{n+1}}z^{n}}_{|z|<2},\\qquad 1<|z|<2',
    },
  ],
};

export const SKU_1404_MIDTERM: ExamPaper = {
  id: 'sku-1404-midterm',
  university: 'دانشگاه شهرکرد (SKU)',
  title: 'نیم‌ترم',
  semester: 'نیمسال اول ۱۴۰۴–۱۴۰۵',
  examDate: '۱۴۰۴/۰۸/۲۸',
  duration: '۱۰۰ دقیقه',
  file: '/assets/exams/math_Eng-40401-midterm-Sku (2).pdf',
  hasOfficialSolution: true,
  questions: [
    {
      id: 'sku-1404-midterm-q1a',
      numberLabel: '۱-الف',
      topic: 'سری فوریه',
      statement: 'با استفاده از سری فوریه ثابت کنید:',
      statementFormula:
        '\\pi^{2}x-x^{3}=12\\sum_{n=1}^{\\infty}\\frac{(\\!-\\!1)^{n+1}}{n^{3}}\\sin(nx)',
      approach:
        '$\\pi^2x-x^3$ فرد است؛ فقط $b_n$ حساب می‌شود (سه‌بار جزء‌به‌جزء).',
      officialSolution: true,
      steps: [
        {
          title: 'انتگرال‌های پایه',
          formula:
            '\\int_{0}^{\\pi}x\\sin(nx)\\,dx=\\frac{-\\pi(\\!-\\!1)^{n}}{n},\\qquad \\int_{0}^{\\pi}x^{3}\\sin(nx)\\,dx=\\frac{-\\pi^{3}(\\!-\\!1)^{n}}{n}+\\frac{6\\pi(\\!-\\!1)^{n}}{n^{3}}',
        },
        {
          title: 'ترکیب',
          formula:
            '\\int_{0}^{\\pi}(\\pi^{2}x-x^{3})\\sin(nx)\\,dx=\\pi^{2}\\!\\cdot\\!\\frac{-\\pi(\\!-\\!1)^n}{n}-\\Big[\\frac{-\\pi^{3}(\\!-\\!1)^n}{n}+\\frac{6\\pi(\\!-\\!1)^n}{n^{3}}\\Big]=\\frac{-6\\pi(\\!-\\!1)^{n}}{n^{3}}',
        },
        {
          title: 'ضریب سینوسی',
          formula:
            'b_n=\\frac{2}{\\pi}\\cdot\\frac{-6\\pi(\\!-\\!1)^{n}}{n^{3}}=\\frac{12(\\!-\\!1)^{n+1}}{n^{3}},\\qquad a_0=a_n=0',
        },
      ],
      finalAnswer:
        '\\pi^{2}x-x^{3}=12\\sum_{n=1}^{\\infty}\\frac{(\\!-\\!1)^{n+1}}{n^{3}}\\sin(nx),\\qquad -\\pi<x<\\pi',
    },
    {
      id: 'sku-1404-midterm-q1b',
      numberLabel: '۱-ب',
      topic: 'سری فوریه',
      statement: 'به کمک قسمت قبل حاصل سری زیر را به دست آورید:',
      statementFormula:
        '\\sum_{n=1}^{\\infty}\\frac{1}{(4n+1)^{3}}-\\sum_{n=1}^{\\infty}\\frac{1}{(4n-1)^{3}}',
      approach:
        'سری را در $x=\\pi/2$ ارزیابی می‌کنیم؛ دقت کنید جملهٔ $n=1$ سینوسی (یعنی $1/1^3$) جزء دو مجموع خواسته‌شده نیست و باید جدا شود.',
      officialSolution: true,
      steps: [
        {
          title: 'قرار دادن $x=\\dfrac{\\pi}{2}$',
          formula:
            '\\pi^{2}\\!\\cdot\\!\\frac{\\pi}{2}-\\Big(\\frac{\\pi}{2}\\Big)^{3}=\\frac{3\\pi^{3}}{8}=12\\Big[\\sin\\frac{\\pi}{2}-\\frac{1}{3^{3}}\\sin\\frac{3\\pi}{2}+\\frac{1}{5^{3}}\\sin\\frac{5\\pi}{2}-\\cdots\\Big]=12\\Big[1-\\frac{1}{27}+\\frac{1}{125}-\\frac{1}{343}+\\cdots\\Big]',
        },
        {
          title: 'تشخیص تابع بتای دیریکله',
          formula:
            '\\beta(3):=\\sum_{k=0}^{\\infty}\\frac{(\\!-\\!1)^{k}}{(2k+1)^{3}}=1-\\frac{1}{3^{3}}+\\frac{1}{5^{3}}-\\cdots=\\frac{3\\pi^{3}}{8\\cdot12}=\\frac{\\pi^{3}}{32}',
        },
        {
          title: 'تفکیک جملهٔ اول',
          detail:
            'جملهٔ $1=1/1^{3}$ مربوط به $k=0$ یعنی فرکانس $4\\cdot0+1$ است؛ پس با دو مجموع خواسته‌شده (که از $n=1$ شروع می‌شوند و معادل $1/5^3+1/9^3+\\cdots$ و $1/3^3+1/7^3+\\cdots$ هستند) به‌صورت زیر جدا می‌شود:',
          formula:
            '\\beta(3)=1+\\underbrace{\\sum_{n=1}^{\\infty}\\frac{1}{(4n+1)^{3}}-\\sum_{n=1}^{\\infty}\\frac{1}{(4n-1)^{3}}}_{D}\\;\\Longrightarrow\\; D=\\frac{\\pi^{3}}{32}-1',
        },
        {
          title: 'کنترل عددی',
          detail:
            '$D=\\big(\\tfrac{1}{125}+\\tfrac{1}{729}+\\cdots\\big)-\\big(\\tfrac{1}{27}+\\tfrac{1}{343}+\\cdots\\big)\\approx0{.}0099-0{.}0407=-0{.}0308$ و $\\pi^3/32-1\\approx-0{.}0308$ ✓',
        },
      ],
      finalAnswer:
        '\\sum_{n=1}^{\\infty}\\frac{1}{(4n+1)^{3}}-\\sum_{n=1}^{\\infty}\\frac{1}{(4n-1)^{3}}=\\frac{\\pi^{3}}{32}-1',
      notes: [
        '⚠️ خطای پاسخ‌نامهٔ رسمی: برگهٔ امتحان با حذف جملهٔ $1$ و خطای محاسبهٔ $\\pi^3/2-\\pi^3/8$، پاسخ را $\\pi^3/96$ نوشته است؛ پاسخ صحیح $\\pi^3/32-1$ است (خود برگه با پیام قرمز «به نظر می‌رسد خطایی رخ داده باشد» به این تردید اشاره کرده است).',
      ],
    },
    {
      id: 'sku-1404-midterm-q2',
      numberLabel: '۲',
      topic: 'انتگرال فوریه',
      statement: 'در معادلهٔ انتگرالی زیر مقدار $g(\\alpha)$ را به دست آورید:',
      statementFormula:
        '\\int_{0}^{\\infty}g(\\alpha)\\sin(\\alpha x)\\,d\\alpha=\\begin{cases}1 & 0\\le x<1\\\\ 2 & 1\\le x<2\\\\ 0 & x\\ge 2\\end{cases}',
      approach:
        'سمت راست، وارونِ انتگرال فوریهٔ سینوسی است؛ پس $g=B(\\alpha)=\\frac{2}{\\pi}\\int f\\sin$ و روی دو بازه انتگرال می‌گیریم.',
      officialSolution: true,
      steps: [
        {
          title: 'نوشتن $B(\\alpha)$',
          formula:
            'g(\\alpha)=B(\\alpha)=\\frac{2}{\\pi}\\Big[\\int_{0}^{1}\\sin(\\alpha x)\\,dx+\\int_{1}^{2}2\\sin(\\alpha x)\\,dx\\Big]',
        },
        {
          title: 'انتگرال‌گیری',
          formula:
            'g(\\alpha)=-\\frac{2}{\\pi}\\Big[\\frac{\\cos\\alpha x}{\\alpha}\\Big]_{0}^{1}-\\frac{4}{\\pi}\\Big[\\frac{\\cos\\alpha x}{\\alpha}\\Big]_{1}^{2}=\\frac{2(1-\\cos\\alpha)}{\\pi\\alpha}+\\frac{4(\\cos\\alpha-\\cos2\\alpha)}{\\pi\\alpha}',
        },
      ],
      finalAnswer:
        'g(\\alpha)=\\frac{2+2\\cos\\alpha-4\\cos 2\\alpha}{\\pi\\alpha}',
    },
    {
      id: 'sku-1404-midterm-q3a',
      numberLabel: '۳-الف',
      topic: 'تبدیل فوریه',
      statement: 'تبدیل فوریه زیر را به دست آورید:',
      statementFormula: '\\mathcal{F}\\big\\{(x^{2}+1)\\,e^{-5|x|}\\cos x\\big\\}',
      approach:
        'ابتدا $G=\\mathcal{F}\\{e^{-5|x|}\\cos x\\}$ با ویژگی جابه‌جایی؛ سپس ضرب در $x^2+1$ یعنی $-G\'\'+G$.',
      officialSolution: true,
      steps: [
        {
          title: 'تبدیل پایه',
          formula:
            '\\mathcal{F}\\{e^{-5|x|}\\}=\\frac{10}{\\alpha^{2}+25},\\qquad \\mathcal{F}\\{e^{-5|x|}\\cos x\\}=\\frac{1}{2}\\Big[\\frac{10}{(\\alpha-1)^{2}+25}+\\frac{10}{(\\alpha+1)^{2}+25}\\Big]=:G(\\alpha)',
          detail: 'از $\\cos x=\\frac{e^{ix}+e^{-ix}}{2}$ و ویژگی $e^{iax}f(x)\\leftrightarrow F(\\alpha-a)$.',
        },
        {
          title: 'اعمال مشتق‌گیری در حوزهٔ فرکانس',
          formula:
            '\\mathcal{F}\\{x^{2}g\\}=-G\'\'(\\alpha)\\;\\Longrightarrow\\;\\mathcal{F}\\{(x^{2}+1)g\\}=G(\\alpha)-G\'\'(\\alpha)',
        },
        {
          title: 'فرم بستهٔ نهایی',
          formula:
            'G-G\'\'=5\\sum_{\\pm}\\frac{(\\alpha\\mp1)^{4}+44(\\alpha\\mp1)^{2}+675}{\\big[(\\alpha\\mp1)^{2}+25\\big]^{3}}',
          detail:
            'با قرار دادن $u=\\alpha\\mp1$:‌ $5\\big[(u^2+25)^{-1}+2(u^2+25)^{-2}-8u^2(u^2+25)^{-3}\\big]$ روی مخرج مشترک ساده می‌شود (کنترل عددی: مقدار در $\\alpha=0$ برابر $7200/17576\\approx0{.}4097$ است).',
        },
      ],
      finalAnswer:
        '\\mathcal{F}\\big\\{(x^{2}+1)e^{-5|x|}\\cos x\\big\\}(\\alpha)=5\\left[\\frac{(\\alpha-1)^{4}+44(\\alpha-1)^{2}+675}{\\big((\\alpha-1)^{2}+25\\big)^{3}}+\\frac{(\\alpha+1)^{4}+44(\\alpha+1)^{2}+675}{\\big((\\alpha+1)^{2}+25\\big)^{3}}\\right]',
    },
    {
      id: 'sku-1404-midterm-q3b',
      numberLabel: '۳-ب',
      topic: 'تبدیل فوریه',
      statement: 'تبدیل فوریهٔ وارون زیر را محاسبه کنید:',
      statementFormula:
        '\\mathcal{F}^{-1}\\left\\{\\frac{e^{-2i\\alpha}}{-\\alpha^{2}+7i\\alpha+12}\\right\\}',
      approach:
        'تجزیهٔ مخرج به $(i\\alpha+3)(i\\alpha+4)$، وارونِ هر عامل با جدول درس، و جابه‌جایی $x\\to x-2$ به علت $e^{-2i\\alpha}$.',
      officialSolution: true,
      steps: [
        {
          title: 'کسر جزئی',
          formula:
            '-\\alpha^{2}+7i\\alpha+12=-(\\alpha-4i)(\\alpha-3i)\\;\\Longrightarrow\\;\\frac{1}{-\\alpha^{2}+7i\\alpha+12}=\\frac{1}{i\\alpha+3}-\\frac{1}{i\\alpha+4}',
        },
        {
          title: 'وارون هر جمله (جدول درس)',
          formula:
            '\\mathcal{F}^{-1}\\Big\\{\\frac{1}{i\\alpha+a}\\Big\\}=e^{-ax}H(x)\\;\\Longrightarrow\\;\\mathcal{F}^{-1}\\Big\\{\\frac{1}{i\\alpha+3}-\\frac{1}{i\\alpha+4}\\Big\\}=\\big(e^{-3x}-e^{-4x}\\big)H(x)',
        },
        {
          title: 'جابه‌جایی زمانی',
          formula:
            '\\mathcal{F}^{-1}\\{e^{-2i\\alpha}F(\\alpha)\\}=f(x-2)',
        },
      ],
      finalAnswer:
        '\\mathcal{F}^{-1}\\left\\{\\frac{e^{-2i\\alpha}}{-\\alpha^{2}+7i\\alpha+12}\\right\\}=\\Big(e^{-3(x-2)}-e^{-4(x-2)}\\Big)H(x-2)',
    },
    {
      id: 'sku-1404-midterm-q4a',
      numberLabel: '۴-الف',
      topic: 'اشتورم–لیوویل',
      statement: 'مقادیر ویژه و توابع ویژه مسئلهٔ اشتورم–لیوویل زیر را به دست آورید:',
      statementFormula:
        "y''+\\lambda y=0,\\quad 0<x<L,\\qquad y'(0)=0,\\quad y(L)=0",
      approach: 'سه حالت $\\lambda=0$، $\\lambda<0$ و $\\lambda>0$ بررسی می‌شود.',
      officialSolution: true,
      steps: [
        {
          title: 'حالت‌های $\\lambda=0$ و $\\lambda=-\\mu^2<0$',
          detail:
            'در هر دو حالت شرایط مرزی فقط جواب بدیهی $y\\equiv0$ را می‌دهند (برای حالت دوم $c_1=c_2=0$ از $y\'(0)=0$ و $y(L)=0$).',
        },
        {
          title: 'حالت $\\lambda=\\mu^2>0$',
          formula:
            "y=c_1\\sin\\mu x+c_2\\cos\\mu x;\\quad y'(0)=0\\Rightarrow c_1=0;\\quad y(L)=0\\Rightarrow\\cos\\mu L=0",
        },
        {
          title: 'مقادیر ویژه',
          formula:
            '\\mu_{n}=\\frac{(2n-1)\\pi}{2L},\\qquad \\lambda_{n}=\\Big(\\frac{(2n-1)\\pi}{2L}\\Big)^{2},\\qquad y_{n}=\\cos\\frac{(2n-1)\\pi x}{2L},\\quad n=1,2,\\dots',
        },
      ],
      finalAnswer:
        '\\lambda_{n}=\\Big(\\frac{(2n-1)\\pi}{2L}\\Big)^{2},\\qquad y_{n}(x)=\\cos\\frac{(2n-1)\\pi x}{2L}',
    },
    {
      id: 'sku-1404-midterm-q4b',
      numberLabel: '۴-ب',
      topic: 'معادله ارتعاش',
      statement: 'معادلهٔ با مشتقات جزئی زیر را حل کنید:',
      statementFormula:
        'u_{tt}=4u_{xx},\\quad 0<x<4,\\ t>0;\\qquad u_x(0,t)=0,\\quad u(4,t)=0;\\qquad u(x,0)=\\sin\\pi x,\\quad u_t(x,0)=0',
      approach:
        'تفکیک متغیرها با توابع ویژهٔ قسمت الف ($L=4$) و بسط شرط اولیه؛ ضریب‌ها با تصویرگیری محاسبه می‌شوند.',
      officialSolution: true,
      steps: [
        {
          title: 'تفکیک متغیرها',
          formula:
            'u=X(x)T(t):\\quad \\frac{T\'\'}{4T}=\\frac{X\'\'}{X}=K\\;\\Rightarrow\\; X\'\'+\\mu^{2}X=0,\\;\\; X\'(0)=0,\\;X(4)=0;\\quad T\'\'+4\\mu^{2}T=0',
        },
        {
          title: 'فرکانس‌های ویژه',
          formula:
            '\\mu_n=\\frac{(2n-1)\\pi}{8},\\qquad X_n=\\cos\\mu_n x,\\qquad T_n=a_n\\cos(2\\mu_n t)+b_n\\sin(2\\mu_n t)',
        },
        {
          title: 'اعمال $u_t(x,0)=0$',
          detail: 'مشتق زمانی در $t=0$ می‌دهد $b_n=0$؛ پس همهٔ نوسان‌ها کسینوسی‌اند.',
        },
        {
          title: 'بسط شرط اولیه $u(x,0)=\\sin\\pi x$',
          formula:
            '\\sin\\pi x=\\sum_{n=1}^{\\infty}a_n\\cos\\mu_n x,\\qquad a_n=\\frac{2}{4}\\int_{0}^{4}\\sin(\\pi x)\\cos(\\mu_n x)\\,dx',
          detail:
            'نُرم توابع $\\cos\\mu_nx$ روی $[0,4]$ برابر $2$ است ($\\int_0^4\\cos^2\\mu_nx\\,dx=2$).',
        },
        {
          title: 'محاسبهٔ $a_n$',
          formula:
            '\\int_{0}^{4}\\sin(\\pi x)\\cos(\\mu_n x)\\,dx=\\frac{1}{2}\\Big[\\frac{1-\\cos 4(\\pi+\\mu_n)}{\\pi+\\mu_n}+\\frac{1-\\cos 4(\\pi-\\mu_n)}{\\pi-\\mu_n}\\Big]=\\frac{1}{2}\\Big[\\frac{1}{\\pi+\\mu_n}+\\frac{1}{\\pi-\\mu_n}\\Big]',
          detail:
            'چون $4\\mu_n=\\frac{(2n-1)\\pi}{2}$، کسینوس‌ها صفر می‌شوند: $\\cos(4\\pi\\pm4\\mu_n)=\\cos\\big(\\pm\\tfrac{(2n-1)\\pi}{2}\\big)=0$.',
        },
        {
          title: 'سری جواب',
          formula:
            'u(x,t)=\\frac{\\pi}{2}\\sum_{n=1}^{\\infty}\\frac{\\cos(2\\mu_n t)\\,\\cos(\\mu_n x)}{\\pi^{2}-\\mu_n^{2}},\\qquad \\mu_n=\\frac{(2n-1)\\pi}{8}',
        },
      ],
      finalAnswer:
        'u(x,t)=\\frac{\\pi}{2}\\sum_{n=1}^{\\infty}\\frac{\\cos\\big(\\frac{(2n-1)\\pi t}{4}\\big)\\cos\\big(\\frac{(2n-1)\\pi x}{8}\\big)}{\\pi^{2}-\\big(\\frac{(2n-1)\\pi}{8}\\big)^{2}}',
      notes: [
        'عبارت $\\sin\\pi x$ تابع ویژه نیست و باید حتماً بسط داده شود — دام اصلی این سؤال.',
      ],
    },
  ],
};

export const SHAHREKORD_1403_MIDTERM2: ExamPaper = {
  id: 'shahrekord-1403-midterm2',
  university: 'دانشگاه شهرکرد',
  title: 'میان‌ترم',
  semester: 'نیمسال دوم ۱۴۰۳–۱۴۰۴',
  file: '/assets/exams/midterm math_eng.pdf',
  questions: [
    {
      id: 'shahrekord-1403-midterm2-q1',
      numberLabel: '۱',
      marks: '۲ نمره',
      topic: 'سری فوریه',
      statement:
        'سری فوریه تابع $f(x)=|x|$ را بر بازهٔ $[-\\pi,\\pi]$ محاسبه نموده و با استفاده از آن مجموع سری‌های $\\sum_{n=0}^{\\infty}\\frac{1}{(2n+1)^2}$ و $\\sum_{n=0}^{\\infty}\\frac{1}{(2n+1)^4}$ را به دست آورید.',
      approach:
        'توسعهٔ زوج؛ $x=0$ مجموع توان دوم و پارسوال مجموع توان چهارم را می‌دهد.',
      steps: [
        {
          title: 'ضرایب کسینوسی',
          formula:
            'a_0=\\frac{2}{\\pi}\\int_{0}^{\\pi}x\\,dx=\\pi,\\qquad a_n=\\frac{2}{\\pi}\\int_{0}^{\\pi}x\\cos(nx)\\,dx=\\frac{2}{\\pi}\\cdot\\frac{(\\!-\\!1)^{n}-1}{n^{2}}',
          detail: 'بنابراین $a_n=0$ برای $n$ زوج و $a_n=-\\frac{4}{\\pi n^2}$ برای $n$ فرد.',
        },
        {
          title: 'سری فوریه',
          formula:
            '|x|=\\frac{\\pi}{2}-\\frac{4}{\\pi}\\sum_{k=1}^{\\infty}\\frac{\\cos((2k-1)x)}{(2k-1)^{2}},\\qquad -\\pi\\le x\\le\\pi',
        },
        {
          title: 'مجموع توان دوم: $x=0$',
          formula:
            '0=\\frac{\\pi}{2}-\\frac{4}{\\pi}\\sum_{k=1}^{\\infty}\\frac{1}{(2k-1)^{2}}\\;\\Longrightarrow\\;\\sum_{k=1}^{\\infty}\\frac{1}{(2k-1)^{2}}=\\frac{\\pi^{2}}{8}',
        },
        {
          title: 'مجموع توان چهارم: پارسوال',
          formula:
            '\\frac{1}{\\pi}\\int_{-\\pi}^{\\pi}x^{2}dx=\\frac{a_0^{2}}{2}+\\sum_{n=1}^{\\infty}a_n^{2}\\;\\Longrightarrow\\;\\frac{2\\pi^{2}}{3}=\\frac{\\pi^{2}}{2}+\\frac{16}{\\pi^{2}}\\sum_{k=1}^{\\infty}\\frac{1}{(2k-1)^{4}}',
        },
        {
          title: 'حل برای مجموع توان چهارم',
          formula:
            '\\sum_{k=1}^{\\infty}\\frac{1}{(2k-1)^{4}}=\\frac{\\pi^{2}}{16}\\Big(\\frac{2\\pi^{2}}{3}-\\frac{\\pi^{2}}{2}\\Big)=\\frac{\\pi^{2}}{16}\\cdot\\frac{\\pi^{2}}{6}=\\frac{\\pi^{4}}{96}',
        },
      ],
      finalAnswer:
        '\\sum_{n=0}^{\\infty}\\frac{1}{(2n+1)^{2}}=\\frac{\\pi^{2}}{8},\\qquad \\sum_{n=0}^{\\infty}\\frac{1}{(2n+1)^{4}}=\\frac{\\pi^{4}}{96}',
    },
    {
      id: 'shahrekord-1403-midterm2-q2',
      numberLabel: '۲',
      marks: '۲ نمره',
      topic: 'تبدیل فوریه',
      statement:
        'انتگرال فوریهٔ کسینوسی تابع $f(x)=(1+x)e^{-x}$ را برای $x\\ge0$ بیابید و سپس به کمک آن مقدار انتگرال ناسرهٔ زیر را محاسبه کنید:',
      statementFormula:
        '\\int_{0}^{\\infty}f(x)\\cos 4x\\,\\cos 3x\\,dx',
      approach:
        '$F_c(\\alpha)=\\int_0^\\infty f\\cos\\alpha x\\,dx$ را حساب می‌کنیم و از $\\cos4x\\cos3x=\\tfrac12[\\cos7x+\\cos x]$ استفاده می‌کنیم.',
      steps: [
        {
          title: 'دو انتگرال پایهٔ لابلاسی',
          formula:
            '\\int_{0}^{\\infty}e^{-x}\\cos(\\alpha x)\\,dx=\\frac{1}{1+\\alpha^{2}},\\qquad \\int_{0}^{\\infty}xe^{-x}\\cos(\\alpha x)\\,dx=\\frac{1-\\alpha^{2}}{(1+\\alpha^{2})^{2}}',
        },
        {
          title: 'ترکیب برای $f$',
          formula:
            'F_c(\\alpha)=\\frac{1}{1+\\alpha^{2}}+\\frac{1-\\alpha^{2}}{(1+\\alpha^{2})^{2}}=\\frac{(1+\\alpha^{2})+(1-\\alpha^{2})}{(1+\\alpha^{2})^{2}}=\\frac{2}{(1+\\alpha^{2})^{2}}',
        },
        {
          title: 'تجزیهٔ حاصل‌ضرب کسینوس‌ها',
          formula:
            '\\int_{0}^{\\infty}f(x)\\cos4x\\cos3x\\,dx=\\frac{1}{2}\\big[F_c(7)+F_c(1)\\Big]=\\frac{1}{2}\\Big[\\frac{2}{50^{2}}+\\frac{2}{4}\\Big]',
        },
      ],
      finalAnswer:
        'F_c(\\alpha)=\\frac{2}{(1+\\alpha^{2})^{2}},\\qquad \\int_{0}^{\\infty}(1+x)e^{-x}\\cos4x\\cos3x\\,dx=\\frac{1}{2500}+\\frac{1}{4}=\\frac{313}{1250}\\approx0{.}2504',
    },
    {
      id: 'shahrekord-1403-midterm2-q3a',
      numberLabel: '۳-الف',
      marks: '۲ نمره',
      topic: 'تبدیل فوریه',
      statement: 'تبدیل فوریهٔ زیر را به دست آورید:',
      statementFormula:
        '\\mathcal{F}\\left\\{\\frac{x\\,e^{-2ix}}{(x^{2}+1)(x^{2}+4)}\\right\\}',
      approach:
        'کسر جزئی، تبدیل $\\tfrac{1}{(x^2+1)(x^2+4)}$، جابه‌جایی $\\alpha\\to\\alpha+2$ و سپس قاعدهٔ $x\\,g(x)\\leftrightarrow iG\'(\\alpha)$.',
      steps: [
        {
          title: 'کسر جزئی و تبدیل پایه',
          formula:
            '\\frac{1}{(x^{2}+1)(x^{2}+4)}=\\frac{1}{3}\\Big[\\frac{1}{x^{2}+1}-\\frac{1}{x^{2}+4}\\Big]\\;\\overset{\\mathcal{F}}{\\longleftrightarrow}\\;\\frac{\\pi}{3}e^{-|\\alpha|}-\\frac{\\pi}{6}e^{-2|\\alpha|}=:H(\\alpha)',
          detail: 'با جدول درس: $\\mathcal{F}\\{\\tfrac{1}{x^2+a^2}\\}=\\tfrac{\\pi}{a}e^{-a|\\alpha|}$.',
        },
        {
          title: 'جابه‌جایی فرکانسی با $e^{-2ix}$',
          formula:
            '\\mathcal{F}\\{e^{-2ix}q(x)\\}=Q(\\alpha+2)\\;\\Rightarrow\\;G(\\alpha)=\\frac{\\pi}{3}e^{-|\\alpha+2|}-\\frac{\\pi}{6}e^{-2|\\alpha+2|}',
        },
        {
          title: 'قاعدهٔ ضرب در $x$',
          formula:
            '\\mathcal{F}\\{x\\,g(x)\\}=iG\'(\\alpha)=\\frac{i\\pi}{3}\\operatorname{sgn}(\\alpha+2)\\big[e^{-2|\\alpha+2|}-e^{-|\\alpha+2|}\\big]',
          detail:
            'مشتق $\\frac{d}{d\\alpha}e^{-c|\\alpha+2|}=-c\\,\\operatorname{sgn}(\\alpha+2)e^{-c|\\alpha+2|}$؛ در $\\alpha=-2$ مقدار تابع را $0$ بگیرید.',
        },
      ],
      finalAnswer:
        '\\mathcal{F}\\left\\{\\frac{x\\,e^{-2ix}}{(x^{2}+1)(x^{2}+4)}\\right\\}(\\alpha)=\\frac{i\\pi}{3}\\operatorname{sgn}(\\alpha+2)\\Big(e^{-2|\\alpha+2|}-e^{-|\\alpha+2|}\\Big)',
    },
    {
      id: 'shahrekord-1403-midterm2-q3b',
      numberLabel: '۳-ب',
      marks: '۲ نمره',
      topic: 'تبدیل فوریه',
      statement: 'تبدیل فوریهٔ وارون زیر را محاسبه کنید:',
      statementFormula:
        '\\mathcal{F}^{-1}\\left\\{\\frac{e^{-2i\\alpha}}{-\\alpha^{2}+4i\\alpha+3}\\right\\}',
      approach:
        'تجزیه به $(i\\alpha+1)$ و $(i\\alpha+3)$ و همان الگوی جدول + جابه‌جایی.',
      steps: [
        {
          title: 'کسر جزئی',
          formula:
            '-\\alpha^{2}+4i\\alpha+3=-(\\alpha-3i)(\\alpha-i)\\;\\Longrightarrow\\;\\frac{1}{-\\alpha^{2}+4i\\alpha+3}=\\frac{1}{2}\\Big[\\frac{1}{i\\alpha+1}-\\frac{1}{i\\alpha+3}\\Big]',
        },
        {
          title: 'وارون و جابه‌جایی',
          formula:
            '\\mathcal{F}^{-1}\\Big\\{\\frac{1}{i\\alpha+1}-\\frac{1}{i\\alpha+3}\\Big\\}=\\big(e^{-x}-e^{-3x}\\big)H(x)\\;\\xrightarrow{\\;\\times e^{-2i\\alpha}\\;}\\;\\frac{1}{2}\\big(e^{-(x-2)}-e^{-3(x-2)}\\big)H(x-2)',
        },
      ],
      finalAnswer:
        '\\mathcal{F}^{-1}\\left\\{\\frac{e^{-2i\\alpha}}{-\\alpha^{2}+4i\\alpha+3}\\right\\}=\\frac{1}{2}\\Big(e^{-(x-2)}-e^{-3(x-2)}\\Big)H(x-2)',
    },
    {
      id: 'shahrekord-1403-midterm2-q4',
      numberLabel: '۴',
      marks: '۲ نمره',
      topic: 'معادله گرما',
      statement: 'مسئلهٔ مشتقات جزئی زیر را حل کنید:',
      statementFormula:
        'u_t=u_{xx},\\;\\;0<x<1,\\;t\\ge0;\\qquad u_x(0,t)=0,\\quad u_x(1,t)=0;\\qquad u(x,0)=f(x)=\\begin{cases}1 & 0<x<\\tfrac14\\\\ 0 & \\tfrac14<x<1\\end{cases}',
      approach: 'شرط مرزی نویمن؛ بسط کسینوسی شرط اولیه روی $[0,1]$.',
      steps: [
        {
          title: 'توابع ویژهٔ نویمن',
          formula:
            'X_n=\\cos(n\\pi x),\\qquad \\lambda_n=n^{2}\\pi^{2},\\qquad u=\\frac{a_0}{2}+\\sum_{n=1}^{\\infty}a_ne^{-n^{2}\\pi^{2}t}\\cos(n\\pi x)',
        },
        {
          title: 'ضرایب شرط اولیه',
          formula:
            'a_0=2\\int_{0}^{1/4}dx=\\frac{1}{2},\\qquad a_n=2\\int_{0}^{1/4}\\cos(n\\pi x)\\,dx=\\frac{2\\sin(n\\pi/4)}{n\\pi}',
        },
        {
          title: 'جواب نهایی',
          formula:
            'u(x,t)=\\frac14+\\sum_{n=1}^{\\infty}\\frac{2\\sin(n\\pi/4)}{n\\pi}\\,e^{-n^{2}\\pi^{2}t}\\cos(n\\pi x)',
          detail:
            'با نزدیک شدن $t$ به بی‌نهایت دما به مقدار متوسط $\\tfrac14$ میل می‌کند — سازگار با $a_0/2$.',
        },
      ],
      finalAnswer:
        'u(x,t)=\\frac{1}{4}+\\frac{2}{\\pi}\\sum_{n=1}^{\\infty}\\frac{\\sin\\left(\\frac{n\\pi}{4}\\right)}{n}\\,e^{-n^{2}\\pi^{2}t}\\cos(n\\pi x)',
    },
  ],
};
