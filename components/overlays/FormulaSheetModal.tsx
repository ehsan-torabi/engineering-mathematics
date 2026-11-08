'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CURRICULUM_MODULES, ModuleId } from '@/lib/curriculum-data';
import {
  extractAllFormulas,
  filterFormulas,
  FormulaCatalogEntry,
} from '@/lib/study-engine';
import MathFormula, { MathText } from '@/components/MathFormula';
import Modal from '@/components/ui/Modal';
import { BookMarked, Search, Copy, Check, ArrowUpLeft, X } from 'lucide-react';

interface FormulaSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_KEYWORDS = [
  'پارسوال',
  'جزء‌به‌جزء',
  'کانولوشن',
  'اشتورم',
  'گرما',
  'نیم‌دامنه',
  'تعامد',
  'اویلر',
];

/**
 * Searchable formula bank. Same engine as before; the surface is a single
 * search field, a filter row, and a quiet list — no nested chrome.
 */
export default function FormulaSheetModal({
  isOpen,
  onClose,
}: FormulaSheetModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<ModuleId | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allFormulas = useMemo(() => extractAllFormulas(CURRICULUM_MODULES), []);
  const filteredFormulas = useMemo(
    () => filterFormulas(allFormulas, searchQuery, selectedModule),
    [allFormulas, searchQuery, selectedModule]
  );

  const handleCopyLatex = (entry: FormulaCatalogEntry) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(entry.formula).catch(() => {});
    }
    setCopiedId(entry.id);
    setTimeout(() => {
      setCopiedId((prev) => (prev === entry.id ? null : prev));
    }, 1800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="بانک فرمول‌ها و قضایا"
      title="بانک فرمول‌ها"
      description="جستجو میان تمام روابط، اتحادها و شرایط مرزی دوره"
      icon={<BookMarked className="h-5 w-5" />}
      widthClass="max-w-3xl"
    >
      {/* Search */}
      <div className="sticky -top-4 z-10 -mx-4 bg-paper px-4 pb-3 pt-1 sm:-mx-5 sm:px-5">
        <div className="relative">
          <Search className="pointer-events-none absolute end-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو: پارسوال، کانولوشن، اشتورم، گرما..."
            aria-label="جستجوی فرمول"
            className="w-full rounded-lg border border-line-strong bg-surface py-2.5 pe-10 ps-3.5 text-sm text-ink outline-none transition-colors focus:border-accent"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="پاک کردن جستجو"
              className="absolute end-3 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Module filter row */}
        <div className="mt-2.5 flex gap-1 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedModule('all')}
            className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs font-bold transition-colors ${
              selectedModule === 'all'
                ? 'bg-ink-solid text-white'
                : 'bg-muted text-ink-3 hover:text-ink'
            }`}
          >
            همه ({allFormulas.length})
          </button>
          {CURRICULUM_MODULES.map((mod) => (
            <button
              key={mod.id}
              type="button"
              onClick={() => setSelectedModule(mod.id)}
              className={`shrink-0 rounded-md px-2.5 py-1.5 text-xs font-bold transition-colors ${
                selectedModule === mod.id
                  ? 'bg-accent-solid text-white'
                  : 'bg-muted text-ink-3 hover:text-ink'
              }`}
            >
              {mod.shortTitle}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="mb-3 text-xs text-ink-4">
        <span className="font-bold tabular-nums text-ink-2">
          {filteredFormulas.length}
        </span>{' '}
        فرمول یافت شد
      </p>

      {/* Formula list */}
      {filteredFormulas.length === 0 ? (
        <div className="rounded-xl border border-line bg-surface py-12 text-center">
          <p className="text-sm font-bold text-ink">
            فرمولی برای «{searchQuery}» پیدا نشد
          </p>
          <p className="mt-1 text-xs text-ink-4">
            کلیدواژه دیگری امتحان کن یا فیلتر فصل را روی «همه» بگذار.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedModule('all');
            }}
            className="mt-4 rounded-lg bg-accent-solid px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-accent-deep"
          >
            نمایش همه فرمول‌ها
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredFormulas.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line-strong"
            >
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink-4">
                    <span className="font-bold text-accent">
                      {entry.moduleNumberLabel}
                    </span>
                    <span aria-hidden="true">·</span>
                    <MathText text={entry.subtopicTitle} />
                  </div>
                  <h3 className="mt-1 text-[13px] font-bold text-ink">
                    <MathText text={entry.label} />
                  </h3>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopyLatex(entry)}
                    className="flex items-center gap-1 rounded-md border border-line-strong bg-panel px-2 py-1 text-[11px] font-semibold text-ink-2 transition-colors hover:border-accent hover:text-accent"
                  >
                    {copiedId === entry.id ? (
                      <>
                        <Check className="h-3 w-3 text-ok" />
                        <span className="text-ok">کپی شد</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        LaTeX
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      router.push(
                        `/module/${entry.moduleId}?phase=lesson&lesson=${entry.subtopicIndex}`
                      );
                      onClose();
                    }}
                    className="flex items-center gap-1 rounded-md bg-accent-soft px-2 py-1 text-[11px] font-bold text-accent-deep transition-colors hover:bg-accent-tint dark:text-accent"
                  >
                    درس‌نامه
                    <ArrowUpLeft className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <MathFormula formula={entry.formula} block />

              {entry.note && (
                <p className="mt-2 border-t border-line pt-2 text-xs leading-6 text-ink-3">
                  <MathText text={entry.note} />
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
