import type {Metadata} from 'next';
import { Vazirmatn, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-vazirmatn',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'آزمایشگاه تعاملی ریاضیات مهندسی — آنالیز فوریه و معادلات گرما',
  description: 'محیط آموزشی تعاملی و حل گام‌به‌گام مسائل ریاضیات مهندسی کارشناسی: آنالیز فوریه، سری و انتگرال فوریه، تبدیل فوریه، مسئله اشتورم-لیوویل و معادله گرما.',
  openGraph: {
    title: 'آزمایشگاه تعاملی ریاضیات مهندسی — آنالیز فوریه و معادلات گرما',
    description: 'محیط آموزشی تعاملی و حل گام‌به‌گام مسائل ریاضیات مهندسی کارشناسی: آنالیز فوریه، سری و انتگرال فوریه، تبدیل فوریه، مسئله اشتورم-لیوویل و معادله گرما.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'آزمایشگاه تعاملی ریاضیات مهندسی — آنالیز فوریه و معادلات گرما',
    description: 'محیط آموزشی تعاملی و حل گام‌به‌گام مسائل ریاضیات مهندسی کارشناسی: آنالیز فوریه، سری و انتگرال فوریه، تبدیل فوریه، مسئله اشتورم-لیوویل و معادله گرما.',
  },
};

// Applies the stored theme before first paint so a dark-mode reload never
// flashes the light theme (the class must exist on <html> before hydration).
const themeInitScript = `(function(){try{if(localStorage.getItem('eng_math_theme_v1')==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{__html: themeInitScript}} />
      </head>
      <body className="bg-paper font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
