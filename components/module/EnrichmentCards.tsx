'use client';

import React from 'react';
import {
  ExternalLink,
  Landmark,
  MousePointerClick,
  Play,
  Plus,
  BookMarked,
} from 'lucide-react';
import { ModuleEnrichment } from '@/lib/curriculum-data';

const KIND_META: Record<
  'video' | 'demo' | 'wiki' | 'blog',
  { icon: React.ReactNode; badgeFa: string; chipClass: string }
> = {
  video: {
    icon: <Play className="h-3 w-3" />,
    badgeFa: 'ویدیو',
    chipClass: 'bg-danger-soft text-danger-ink',
  },
  demo: {
    icon: <MousePointerClick className="h-3 w-3" />,
    badgeFa: 'تعاملی',
    chipClass: 'bg-ok-soft text-ok-ink',
  },
  wiki: {
    icon: <BookMarked className="h-3 w-3" />,
    badgeFa: 'ویکی',
    chipClass: 'bg-accent-tint text-accent-deep dark:text-accent',
  },
  blog: {
    icon: <BookMarked className="h-3 w-3" />,
    badgeFa: 'مقاله',
    chipClass: 'bg-warn-soft text-warn-ink',
  },
};

/**
 * Historical figures + curated external resources for the active module.
 * Rendered at the end of the lesson phase so students finish reading the
 * lesson with the human story and a next step for deeper intuition.
 */
export default function EnrichmentCards({
  enrichment,
}: {
  enrichment: ModuleEnrichment;
}) {
  const { figures, resources } = enrichment;
  if (figures.length === 0 && resources.length === 0) return null;

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* ── Historical origin ── */}
      {figures.length > 0 && (
        <section
          aria-labelledby="enrich-figures-title"
          className="rounded-xl border border-line bg-surface p-4"
        >
          <h3
            id="enrich-figures-title"
            className="mb-3 flex items-center gap-1.5 text-sm font-bold text-ink"
          >
            <Landmark className="h-4 w-4 text-accent" />
            خاستگاه تاریخی این فصل
          </h3>
          <div className="space-y-3">
            {figures.map((fig) => (
              <div key={fig.nameEn} className="flex items-start gap-3">
                <a
                  href={fig.wikiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                  title={`بایوگرافی ${fig.nameFa} در ویکی‌پدیا`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fig.portraitSrc}
                    alt={`تصویر ${fig.nameFa}`}
                    loading="lazy"
                    className="h-20 w-16 rounded-lg border border-line object-cover object-top shadow-sm"
                  />
                </a>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <a
                      href={fig.wikiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-accent-deep underline-offset-2 hover:underline dark:text-accent"
                    >
                      {fig.nameFa}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <span className="text-[10px] font-semibold tabular-nums text-ink-4">
                      {fig.years}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-5 text-ink-3">
                    {fig.bioFa}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Curated external resources ── */}
      {resources.length > 0 && (
        <section
          aria-labelledby="enrich-resources-title"
          className="rounded-xl border border-line bg-surface p-4"
        >
          <h3
            id="enrich-resources-title"
            className="mb-3 flex items-center gap-1.5 text-sm font-bold text-ink"
          >
            <Plus className="h-4 w-4 text-accent" />
            برای فهم عمیق‌تر: منابع برگزیده وب
          </h3>
          <ul className="space-y-2.5">
            {resources.map((res) => {
              const meta = KIND_META[res.kind];
              return (
                <li key={res.url}>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-2.5 rounded-lg border border-line bg-panel px-3 py-2.5 transition-colors hover:border-accent-line hover:bg-accent-soft"
                  >
                    <span
                      className={`mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${meta.chipClass}`}
                    >
                      {meta.icon}
                      {meta.badgeFa}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold leading-5 text-ink group-hover:text-accent-deep dark:group-hover:text-accent">
                        {res.labelFa}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-5 text-ink-3">
                        {res.noteFa}
                      </span>
                    </span>
                    <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-ink-4 transition-colors group-hover:text-accent" />
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
