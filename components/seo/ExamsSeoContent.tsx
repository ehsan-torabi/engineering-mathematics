import { EXAM_PAPERS, TOTAL_EXAM_QUESTIONS } from '@/lib/exams';

/**
 * Server-rendered exam index: every paper and its topic list is in the HTML,
 * so the content is indexable and quotable without running the client app.
 */
export default function ExamsSeoContent() {
  return (
    <section
      aria-labelledby="exam-index"
      className="mx-auto max-w-3xl px-4 pb-12 sm:px-6"
    >
      <div className="border-t border-line pt-8">
        <h2 id="exam-index" className="text-xl font-bold text-ink">
          فهرست برگه‌های امتحانی
        </h2>
        <p className="mt-2 text-sm leading-8 text-ink-2">
          {EXAM_PAPERS.length} برگهٔ میان‌ترم و پایان‌ترم ریاضیات مهندسی با{' '}
          {TOTAL_EXAM_QUESTIONS} پرسش. هر پرسش شامل صورت مسئله، راهبرد حل و
          مراحل کامل محاسبه است.
        </p>
        <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
          {EXAM_PAPERS.map((paper) => {
            const topics = Array.from(
              new Set(paper.questions.map((q) => q.topic))
            );
            return (
              <li key={paper.id} className="p-4">
                <h3 className="text-sm font-bold text-ink">
                  {paper.university} · {paper.title}، {paper.semester}
                </h3>
                <p className="mt-1 text-xs leading-6 text-ink-3">
                  {paper.questions.length} پرسش · موضوع‌ها: {topics.join('، ')}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
