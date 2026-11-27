import type {CurriculumModule, PracticeQuestion} from '@/lib/curriculum-data';
import {absoluteUrl, plainText} from '@/lib/seo';
import {stripLessonNumber} from './persian-digits';

/**
 * JSON-LD builders for the module workspace routes. Pure functions so they
 * are trivially testable and identical between build-time SSR output and
 * future dynamic renders. All objects carry `inLanguage: 'fa-IR'` and
 * absolute URLs.
 */

function breadcrumb(mod: CurriculumModule, leafName?: string, leafPath?: string) {
  const items = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'صفحهٔ دوره',
      item: absoluteUrl('/'),
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: mod.shortTitle,
      item: absoluteUrl(`/module/${mod.id}`),
    },
  ];
  if (leafName && leafPath) {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: leafName,
      item: absoluteUrl(leafPath),
    });
  }
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

function courseRef() {
  return {
    '@type': 'Course',
    name: 'ریاضیات مهندسی · آنالیز فوریه و معادلات دیفرانسیل جزئی',
    url: absoluteUrl('/'),
  };
}

/** Lesson route: LearningResource for one subtopic + its breadcrumb trail. */
export function buildLessonJsonLd(
  mod: CurriculumModule,
  lessonIndex: number
) {
  const sub = mod.subtopics[lessonIndex] || mod.subtopics[0];
  const path = `/module/${mod.id}/lesson/${lessonIndex + 1}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumb(mod, plainText(stripLessonNumber(sub.title)), path),
      {
        '@type': 'LearningResource',
        '@id': absoluteUrl(`${path}#lesson`),
        name: plainText(stripLessonNumber(sub.title)),
        description: plainText(sub.summary),
        url: absoluteUrl(path),
        inLanguage: 'fa-IR',
        learningResourceType: 'درس‌نامه',
        educationalLevel: 'کارشناسی',
        isAccessibleForFree: true,
        isPartOf: courseRef(),
        teaches: sub.conceptualPoints
          .slice(0, 4)
          .map((point) => plainText(point))
          .filter(Boolean),
        position: lessonIndex + 1,
      },
    ],
  };
}

/** Lab route: the interactive simulator as a LearningResource. */
export function buildLabJsonLd(mod: CurriculumModule) {
  const path = `/module/${mod.id}/lab`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumb(mod, 'آزمایشگاه تعاملی', path),
      {
        '@type': 'LearningResource',
        '@id': absoluteUrl(`${path}#lab`),
        name: `آزمایشگاه تعاملی ${plainText(mod.title)}`,
        description: plainText(mod.subtitle),
        url: absoluteUrl(path),
        inLanguage: 'fa-IR',
        learningResourceType: 'آزمایشگاه شبیه‌سازی',
        educationalLevel: 'کارشناسی',
        isAccessibleForFree: true,
        isPartOf: courseRef(),
        teaches: mod.subtopics.map((s) => plainText(s.title)),
      },
    ],
  };
}

/** Examples route: worked problems as a collection of solved examples. */
export function buildExamplesJsonLd(
  mod: CurriculumModule,
  exampleIndex: number
) {
  const ex = mod.workedExamples[exampleIndex] || mod.workedExamples[0];
  const path =
    exampleIndex > 0
      ? `/module/${mod.id}/examples/${exampleIndex + 1}`
      : `/module/${mod.id}/examples`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumb(mod, plainText(ex?.title || 'مسائل حل‌شده'), path),
      {
        '@type': 'LearningResource',
        '@id': absoluteUrl(`${path}#example`),
        name: plainText(ex?.title || 'مسائل حل‌شده'),
        description: plainText(ex?.problemStatement || mod.subtitle),
        url: absoluteUrl(path),
        inLanguage: 'fa-IR',
        learningResourceType: 'مسئله حل‌شده',
        educationalLevel: 'کارشناسی',
        isAccessibleForFree: true,
        isPartOf: courseRef(),
        position: exampleIndex + 1,
      },
    ],
  };
}

function quizQuestion(q: PracticeQuestion) {
  return {
    '@type': 'Question',
    name: plainText(q.question),
    acceptedAnswer: {
      '@type': 'Answer',
      text: plainText(q.options[q.correctIndex] ?? ''),
    },
    suggestedAnswer: q.options.map((opt) => ({
      '@type': 'Answer',
      text: plainText(opt),
    })),
  };
}

/** Quiz route: Quiz schema with every multiple-choice question. */
export function buildQuizJsonLd(mod: CurriculumModule) {
  const path = `/module/${mod.id}/quiz`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumb(mod, 'خودآزمایی', path),
      {
        '@type': 'Quiz',
        '@id': absoluteUrl(`${path}#quiz`),
        name: `خودآزمایی ${plainText(mod.title)}`,
        description: plainText(mod.subtitle),
        url: absoluteUrl(path),
        inLanguage: 'fa-IR',
        educationalLevel: 'کارشناسی',
        isAccessibleForFree: true,
        isPartOf: courseRef(),
        hasPart: mod.practiceQuestions.map(quizQuestion),
      },
    ],
  };
}
