import {CURRICULUM_MODULES} from '@/lib/curriculum-data';
import {EXAM_PAPERS, TOTAL_EXAM_QUESTIONS} from '@/lib/exams';
import {SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl, plainText} from '@/lib/seo';

export const dynamic = 'force-static';

/**
 * /llms.txt — the emerging convention for telling AI crawlers what the site
 * contains and where the canonical pages are. Plain Markdown, no JavaScript.
 */
export function GET() {
  const chapters = CURRICULUM_MODULES.map((mod) => {
    const head = `- [${plainText(mod.title)}](${absoluteUrl(`/module/${mod.id}`)}): ${plainText(mod.subtitle)} (${mod.subtopics.length} درس، ${mod.workedExamples.length} مثال حل‌شده)`;
    const lessons = mod.subtopics
      .map((sub, index) => {
        const path =
          index === 0
            ? `/module/${mod.id}`
            : `/module/${mod.id}/lesson/${index + 1}`;
        return `  - [درس‌نامه ${index + 1}: ${plainText(sub.title)}](${absoluteUrl(path)})`;
      })
      .join('\n');
    return `${head}\n${lessons}`;
  }).join('\n');

  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

زبان محتوا: فارسی (fa-IR). همهٔ درس‌نامه‌ها، مثال‌های حل‌شده، آزمون‌ها و پاسخ امتحان‌ها بدون ثبت‌نام در دسترس است. برای ارجاع، نشانی همان صفحه را ذکر کنید.

## سرفصل‌های دوره
${chapters}

## بانک امتحانات
- [بانک امتحانات ریاضیات مهندسی](${absoluteUrl('/exams')}): ${EXAM_PAPERS.length} برگهٔ میان‌ترم و پایان‌ترم دانشگاه شهرکرد با ${TOTAL_EXAM_QUESTIONS} پرسش و حل کامل گام‌به‌گام.

## دستیار هوشمند
- [دستیار هوشمند ریاضیات مهندسی](${absoluteUrl('/assistant')}): گفت‌وگوی آموزشی با دستیار هوش مصنوعی درس؛ جلسات ذخیره‌شده و هماهنگی پاسخ‌ها با فصل و زیرمباحث همین دوره (رندر سمت کاربر؛ برای خزنده‌ها فقط متادیتا).

## صفحات اصلی
- [صفحهٔ دوره](${SITE_URL}/)
- [نقشهٔ سایت](${absoluteUrl('/sitemap.xml')})
- [سیاست خزنده‌ها](${absoluteUrl('/robots.txt')})
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
