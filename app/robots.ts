import type {MetadataRoute} from 'next';
import {SITE_URL, absoluteUrl} from '@/lib/seo';
import {CURRICULUM_MODULES} from '@/lib/curriculum-data';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
      // AI answer engines and research crawlers: allowed, so the course can be
      // quoted and recommended with a link back.
      {
        userAgent: [
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'ClaudeBot',
          'Claude-SearchBot',
          'PerplexityBot',
          'Google-Extended',
          'Applebot-Extended',
          'CCBot',
        ],
        allow: ['/', '/llms.txt'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
  };
}
