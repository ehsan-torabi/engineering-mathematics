import type {Metadata} from 'next';
import { Vazirmatn, IBM_Plex_Mono } from 'next/font/google';
import {
  BASE_KEYWORDS,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from '@/lib/seo';
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

const HOME_TITLE =
  'آموزش ریاضیات مهندسی: آنالیز فوریه، اشتورم-لیوویل و معادله گرما';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOME_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: BASE_KEYWORDS,
  applicationName: SITE_NAME,
  category: 'education',
  alternates: {canonical: '/'},
  openGraph: {
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
    type: 'website',
    locale: 'fa_IR',
    siteName: SITE_NAME,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  // Explicit signal for AI answer engines that the corpus may be quoted.
  other: {
    'googlebot': 'index, follow, max-snippet:-1, max-image-preview:large',
  },
};

const siteJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': absoluteUrl('/#website'),
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: 'Engineering Mathematics Interactive Lab',
      description: SITE_DESCRIPTION,
      inLanguage: 'fa-IR',
      publisher: {'@id': absoluteUrl('/#organization')},
    },
    {
      '@type': 'Organization',
      '@id': absoluteUrl('/#organization'),
      name: SITE_NAME,
      url: SITE_URL,
      description:
        'مرجع فارسی درس‌نامه، مثال حل‌شده و بانک امتحانات ریاضیات مهندسی دوره کارشناسی.',
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(siteJsonLd)}}
        />
      </head>
      <body className="bg-paper font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
