import Link from 'next/link';
import {CURRICULUM_MODULES} from '@/lib/curriculum-data';
import {EXAM_PAPERS, TOTAL_EXAM_QUESTIONS} from '@/lib/exams';
import {HOME_FAQ} from '@/lib/seo';

/**
 * Server-rendered course description. Everything a crawler or an AI answer
 * engine needs is in the initial HTML: what the course covers, the chapter
 * list as real links, and the FAQ. No client JavaScript required.
 */
export default function CourseSeoContent() {
  const subtopicCount = CURRICULUM_MODULES.reduce(
    (sum, mod) => sum + mod.subtopics.length,
    0
  );

  return (
    <div className="mx-auto max-w-3xl px-4 pb-12 sm:px-6">
      <section
        aria-labelledby="about-course"
        className="border-t border-line pt-8"
      >
        <h2 id="about-course" className="text-xl font-bold text-ink">
          دربارهٔ این دورهٔ ریاضیات مهندسی
        </h2>
        <p className="mt-3 text-sm leading-8 text-ink-2">
          این سایت درس‌نامهٔ فارسی ریاضیات مهندسی دورهٔ کارشناسی را به‌صورت
          تعاملی ارائه می‌کند: از پیش‌نیازهای محاسباتی مثل انتگرال جزء‌به‌جزء و
          فرمول اویلر تا آنالیز فوریه، تبدیل فوریه، مسئلهٔ اشتورم-لیوویل و حل
          معادلهٔ گرما. هر فصل شامل درس‌نامه، مثال‌های حل‌شده با تمام مراحل
          میانی، آزمون کوتاه و آزمایشگاه تعاملی است.
        </p>
        <p className="mt-2 text-sm leading-8 text-ink-2">
          مجموعاً {subtopicCount} درس و {EXAM_PAPERS.length} برگهٔ امتحان با{' '}
          {TOTAL_EXAM_QUESTIONS} پرسش حل‌شده در دسترس است. پاسخ‌ها با محاسبهٔ
          نمادین و آزمون عددی بررسی شده‌اند تا برای مطالعهٔ امتحان قابل اتکا
          باشند.
        </p>
      </section>

      <section
        aria-labelledby="course-syllabus"
        className="mt-10 border-t border-line pt-8"
      >
        <h2 id="course-syllabus" className="text-xl font-bold text-ink">
          سرفصل‌های دوره
        </h2>
        <ol className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
          {CURRICULUM_MODULES.map((mod) => (
            <li key={mod.id} className="p-4">
              <Link
                href={`/module/${mod.id}`}
                className="text-sm font-bold text-ink hover:text-accent-deep dark:hover:text-accent"
              >
                {mod.shortTitle.replace(/^\d+\.\s*/, '')} · {mod.title}
              </Link>
              <p className="mt-1 text-xs leading-6 text-ink-3">{mod.subtitle}</p>
              <p className="mt-1 text-[11px] tabular-nums text-ink-4">
                {mod.subtopics.length} درس · {mod.workedExamples.length} مثال
                حل‌شده · {mod.practiceQuestions.length} پرسش آزمون
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="course-faq"
        className="mt-10 border-t border-line pt-8"
      >
        <h2 id="course-faq" className="text-xl font-bold text-ink">
          پرسش‌های متداول
        </h2>
        <div className="mt-4 space-y-2">
          {HOME_FAQ.map((item) => (
            <details
              key={item.question}
              className="rounded-xl border border-line bg-surface px-4 py-3"
            >
              <summary className="cursor-pointer text-sm font-bold text-ink">
                {item.question}
              </summary>
              <p className="mt-2 text-sm leading-8 text-ink-2">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="mt-8 text-xs leading-6 text-ink-4">
        درس‌نامه بر پایهٔ جزوهٔ «نکات و مثال‌ها در ریاضیات مهندسی» و برگه‌های
        امتحانی دانشگاه شهرکرد تنظیم شده است.
      </p>
    </div>
  );
}
