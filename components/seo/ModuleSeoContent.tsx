import Link from 'next/link';
import type {CurriculumModule} from '@/lib/curriculum-data';
import {plainText} from '@/lib/seo';

/**
 * Plain-text chapter overview. Math in the source is LaTeX inside $...$;
 * crawlers and screen readers get the surrounding Persian prose instead of
 * raw markup, while the interactive lesson keeps the rendered formulas.
 */
export default function ModuleSeoContent({module}: {module: CurriculumModule}) {
  return (
    <section
      aria-labelledby="chapter-overview"
      className="mx-auto max-w-3xl px-4 pb-12 sm:px-6"
    >
      <div className="border-t border-line pt-8">
        <h2 id="chapter-overview" className="text-xl font-bold text-ink">
          این فصل در یک نگاه
        </h2>
        <p className="mt-2 text-sm leading-8 text-ink-2">{module.subtitle}</p>

        <ol className="mt-5 space-y-5">
          {module.subtopics.map((subtopic, index) => (
            <li key={subtopic.id}>
              <h3 className="text-sm font-bold text-ink">
                <Link
                  href={`/module/${module.id}?lesson=${index}`}
                  className="hover:text-accent-deep dark:hover:text-accent"
                >
                  {subtopic.title}
                </Link>
              </h3>
              <p className="mt-1 text-sm leading-8 text-ink-2">
                {plainText(subtopic.summary)}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
