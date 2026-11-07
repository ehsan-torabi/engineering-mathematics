import type {Metadata} from 'next';
import { Vazirmatn, IBM_Plex_Mono, Crimson_Pro } from 'next/font/google';
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

const crimsonPro = Crimson_Pro({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-math',
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

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} ${ibmPlexMono.variable} ${crimsonPro.variable}`}>
      <body
        suppressHydrationWarning
        className="bg-[#F8FAFC] text-[#0F172A] antialiased selection:bg-[#0284C7]/15 selection:text-[#0369A1]"
        style={{ fontFamily: 'var(--font-vazirmatn), system-ui, sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}
