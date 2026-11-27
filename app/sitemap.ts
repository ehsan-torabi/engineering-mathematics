import type {MetadataRoute} from 'next';
import {absoluteUrl} from '@/lib/seo';
import {CURRICULUM_MODULES} from '@/lib/curriculum-data';

/**
 * Every crawlable page: home, exam bank, assistant, and the five workspace
 * routes per chapter (root = first lesson, then lesson/[n], lab,
 * examples[/[n]], quiz).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const pages: MetadataRoute.Sitemap = [
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
    {
      url: absoluteUrl('/assistant'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  for (const mod of CURRICULUM_MODULES) {
    // Chapter root (first lesson) + remaining lessons
    pages.push({
      url: absoluteUrl(`/module/${mod.id}`),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
    for (let i = 1; i < mod.subtopics.length; i += 1) {
      pages.push({
        url: absoluteUrl(`/module/${mod.id}/lesson/${i + 1}`),
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }

    pages.push({
      url: absoluteUrl(`/module/${mod.id}/lab`),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    });

    pages.push({
      url: absoluteUrl(`/module/${mod.id}/examples`),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
    for (let i = 1; i < mod.workedExamples.length; i += 1) {
      pages.push({
        url: absoluteUrl(`/module/${mod.id}/examples/${i + 1}`),
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }

    pages.push({
      url: absoluteUrl(`/module/${mod.id}/quiz`),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  return pages;
}
