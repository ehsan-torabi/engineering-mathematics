'use client';

import React, { useState, useMemo } from 'react';
import { CURRICULUM_MODULES, ModuleId } from '@/lib/curriculum-data';
import {
  extractAllFormulas,
  filterFormulas,
  FormulaCatalogEntry,
} from '@/lib/study-engine';
import MathFormula, { MathText } from '@/components/MathFormula';
import {
  BookMarked,
  Search,
  X,
  Copy,
  Check,
  ArrowUpLeft,
  Filter,
} from 'lucide-react';

interface FormulaCheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSubtopic: (moduleId: ModuleId, subtopicIndex: number) => void;
}

const QUICK_SEARCH_KEYWORDS = [
  'پارسوال',
  'جزء‌به‌جزء',
  'کانولوشن',
  'اشتورم',
  'گرما',
  'نیم‌دامنه',
  'تعامد',
  'اویلر',
];

export default function FormulaCheatSheetModal({
  isOpen,
  onClose,
  onNavigateToSubtopic,
}: FormulaCheatSheetModalProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<ModuleId | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allFormulas = useMemo(() => extractAllFormulas(CURRICULUM_MODULES), []);
  const filteredFormulas = useMemo(
    () => filterFormulas(allFormulas, searchQuery, selectedModule),
    [allFormulas, searchQuery, selectedModule]
  );

  if (!isOpen) return null;

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
    <div
      role="dialog"
      aria-modal="true"
      aria-label="بانک جامع فرمول‌ها و قضایای امتحانی"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-xs sm:p-5"
    >
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#CBD5E1] bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0284C7] text-white">
              <BookMarked className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0F172A] sm:text-lg">
                بانک جامع فرمول‌ها و قضایای امتحانی ریاضیات مهندسی
              </h2>
              <p className="text-xs text-[#475569]">
                مرجع سریع تمامی فرمول‌ها، اتحادها و شرایط مرزی (بخش ۰ تا ۶) با قابلیت جستجو و پرش مستقیم به درس‌نامه
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="بستن بانک فرمول‌ها"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#CBD5E1] bg-white text-[#475569] transition hover:border-[#0284C7] hover:text-[#0F172A]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search & Module Filter Toolbar */}
        <div className="space-y-3 border-b border-[#E2E8F0] bg-white px-5 py-3.5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی فرمول، قضیه یا کلیدواژه (مثلاً: پارسوال، کانولوشن، اشتورم، جزء‌به‌جزء، گرما)..."
                aria-label="جستجوی فرمول"
                className="w-full rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] py-2.5 pr-10 pl-9 text-xs font-medium text-[#0F172A] focus:border-[#0284C7] focus:bg-white focus:outline-none sm:text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="پاک کردن جستجو"
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2 text-xs text-[#475569]">
              <Filter className="h-3.5 w-3.5 text-[#0284C7]" />
              <span className="tabular-nums font-semibold text-[#0F172A]">
                {filteredFormulas.length}
              </span>
              <span>فرمول از {allFormulas.length} مورد</span>
            </div>
          </div>

          {/* Quick Search Keywords */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-[#64748B]">
              کلیدواژه‌های پرتکرار:
            </span>
            {QUICK_SEARCH_KEYWORDS.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() =>
                  setSearchQuery((prev) => (prev === kw ? '' : kw))
                }
                className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold transition ${
                  searchQuery === kw
                    ? 'border-[#0284C7] bg-[#0284C7] text-white'
                    : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:border-[#0284C7]'
                }`}
              >
                {kw}
              </button>
            ))}
          </div>

          {/* Module Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedModule('all')}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                selectedModule === 'all'
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
              }`}
            >
              همه فصول ({allFormulas.length})
            </button>
            {CURRICULUM_MODULES.map((mod) => (
              <button
                key={mod.id}
                type="button"
                onClick={() => setSelectedModule(mod.id)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  selectedModule === mod.id
                    ? 'bg-[#0284C7] text-white'
                    : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]'
                }`}
              >
                {mod.numberLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Formula Cards List */}
        <div className="flex-1 space-y-3 overflow-y-auto bg-[#F8FAFC] p-5">
          {filteredFormulas.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-[#E2E8F0] bg-white py-12 text-center">
              <p className="text-sm font-bold text-[#0F172A]">
                فرمولی منطبق با عبارت «{searchQuery}» یافت نشد.
              </p>
              <p className="mt-1 text-xs text-[#64748B]">
                کلیدواژه دیگری را امتحان کنید یا فیلتر فصل را روی «همه فصول» قرار دهید.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedModule('all');
                }}
                className="mt-3 rounded-lg bg-[#0284C7] px-4 py-2 text-xs font-bold text-white"
              >
                نمایش همه فرمول‌ها
              </button>
            </div>
          ) : (
            filteredFormulas.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-[#E2E8F0] bg-white p-4 transition hover:border-[#CBD5E1]"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-[#64748B]">
                      <span className="font-bold text-[#0284C7]">
                        {entry.moduleNumberLabel}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        <MathText text={entry.subtopicTitle} />
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{entry.pdfPages}</span>
                    </div>
                    <h3 className="mt-1 text-sm font-bold text-[#0F172A]">
                      <MathText text={entry.label} />
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyLatex(entry)}
                      className="flex items-center gap-1 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] px-2.5 py-1.5 text-[11px] font-semibold text-[#334155] transition hover:border-[#0284C7] hover:text-[#0284C7]"
                    >
                      {copiedId === entry.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-[#059669]" />
                          <span className="text-[#059669]">کپی شد</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>کپی LaTeX</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onNavigateToSubtopic(
                          entry.moduleId,
                          entry.subtopicIndex
                        );
                        onClose();
                      }}
                      className="flex items-center gap-1 rounded-lg bg-[#F0F9FF] px-2.5 py-1.5 text-[11px] font-bold text-[#0369A1] transition hover:bg-[#E0F2FE]"
                    >
                      <span>مشاهده در درس‌نامه</span>
                      <ArrowUpLeft className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <MathFormula formula={entry.formula} block />

                {entry.note && (
                  <p className="mt-2 text-xs leading-6 text-[#475569]">
                    <strong className="font-semibold text-[#0F172A]">
                      نکته کاربردی:{' '}
                    </strong>
                    <MathText text={entry.note} />
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
