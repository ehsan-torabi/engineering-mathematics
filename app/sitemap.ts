import type {MetadataRoute} from 'next';
import {absoluteUrl} from '@/lib/seo';
import {CURRICULUM_MODULES} from '@/lib/curriculum-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: absoluteUrl('/'),
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('/exams'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...CURRICULUM_MODULES.map((mod) => ({
      url: absoluteUrl(`/module/${mod.id}`),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
