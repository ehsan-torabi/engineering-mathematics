'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sigma,
  ChevronDown,
  ChevronLeft,
  Sun,
  Moon,
  BookMarked,
  FileText,
  PenTool,
  Bot,
  Check,
} from 'lucide-react';
import { CURRICULUM_MODULES } from '@/lib/curriculum-data';
import { useStudyProgress } from '@/lib/study-progress-context';

const STORAGE_KEY_THEME = 'eng_math_theme_v1';

interface TopBarProps {
  onOpenFormulas: () => void;
  onOpenPdf: () => void;
  onToggleScratchpad: () => void;
  onOpenAI: () => void;
}

function readModuleIdFromPathname(pathname: string) {
  const match = pathname.match(/^\/module\/([^/]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Slim persistent chrome with a real breadcrumb. The brand links to the
 * course map; the breadcrumb trail is a semantic <nav>/<ol> so browser
 * history and assistive tech both agree on where you are. The current
 * chapter is also a switcher menu — choosing one pushes a route, so the
 * browser's back/forward buttons walk the exact trail you took.
 */
export default function TopBar({
  onOpenFormulas,
  onOpenPdf,
  onToggleScratchpad,
  onOpenAI,
}: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { moduleMastery } = useStudyProgress();

  const activeModuleId = readModuleIdFromPathname(pathname ?? '');
  const isModuleView = activeModuleId !== null;
  const activeModule =
    CURRICULUM_MODULES.find((m) => m.id === activeModuleId) ||
    CURRICULUM_MODULES[0];

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  // Theme: the <html> class is written by exactly two places — the blocking
  // init script in layout.tsx (before paint) and this toggle. Visible state
  // is CSS-driven via dark: variants, so no React state is needed.
  const handleToggleDarkMode = () => {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    try {
      window.localStorage.setItem(STORAGE_KEY_THEME, next ? 'dark' : 'light');
    } catch {
      // Ignore storage write error
    }
  };

  useEffect(() => {
    if (!isSwitcherOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!switcherRef.current?.contains(e.target as Node)) {
        setIsSwitcherOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSwitcherOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSwitcherOpen]);

  const toolButtonClass =
    'flex h-10 w-10 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-muted hover:text-ink';

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:px-6">
        {/* Start: brand + breadcrumb */}
        <nav aria-label="breadcrumb" className="flex min-w-0 items-center">
          <ol className="flex min-w-0 items-center gap-1">
            <li className="flex shrink-0 items-center">
              <Link
                href="/"
                aria-label="صفحه اصلی دوره"
                className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-muted"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-solid text-white">
                  <Sigma className="h-4.5 w-4.5" />
                </span>
                <span className="hidden text-sm font-bold text-ink md:inline">
                  ریاضیات مهندسی
                </span>
              </Link>
            </li>

            {isModuleView && (
              <li className="flex min-w-0 items-center gap-1">
                <ChevronLeft
                  className="h-4 w-4 shrink-0 text-ink-4"
                  aria-hidden="true"
                />
                <div ref={switcherRef} className="relative min-w-0">
                  <button
                    type="button"
                    onClick={() => setIsSwitcherOpen((prev) => !prev)}
                    aria-expanded={isSwitcherOpen}
                    aria-haspopup="listbox"
                    aria-current="page"
                    className="flex min-w-0 items-center gap-1 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted"
                  >
                    <span className="truncate text-sm font-bold text-ink">
                      {activeModule.shortTitle}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-ink-4 transition-transform ${
                        isSwitcherOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {isSwitcherOpen && (
                    <div
                      role="listbox"
                      aria-label="انتخاب فصل"
                      className="animate-overlay absolute top-full z-40 mt-2 w-72 overflow-hidden rounded-xl border border-line-strong bg-surface shadow-xl start-0"
                    >
                      {CURRICULUM_MODULES.map((mod) => {
                        const isActive = mod.id === activeModuleId;
                        const mastery = moduleMastery[mod.id] ?? 0;
                        return (
                          <button
                            key={mod.id}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            onClick={() => {
                              setIsSwitcherOpen(false);
                              router.push(`/module/${mod.id}`);
                            }}
                            className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-start transition-colors ${
                              isActive ? 'bg-accent-soft' : 'hover:bg-muted'
                            }`}
                          >
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
                                isActive
                                  ? 'bg-accent-solid text-white'
                                  : 'bg-muted text-ink-3'
                              }`}
                            >
                              {mastery >= 100 ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                mod.numberLabel
                                  .replace(/^بخش\s*/, '')
                                  .trim()
                              )}
                            </span>
                            <span
                              className={`min-w-0 flex-1 truncate text-xs ${
                                isActive
                                  ? 'font-bold text-accent-deep dark:text-accent'
                                  : 'font-medium text-ink-2'
                              }`}
                            >
                              {mod.shortTitle.replace(/^\d+\.\s*/, '')}
                            </span>
                            <span className="shrink-0 text-[11px] font-semibold tabular-nums text-ink-4">
                              {mastery}%
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </li>
            )}
          </ol>
        </nav>

        {/* End: utility tools */}
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onClick={handleToggleDarkMode}
            aria-label="تغییر حالت تاریک و روشن"
            title="حالت شب برای مطالعه در نور کم"
            data-testid="theme-toggle-button"
            className={toolButtonClass}
          >
            <Sun className="hidden h-4.5 w-4.5 text-warn dark:block" />
            <Moon className="block h-4.5 w-4.5 text-accent dark:hidden" />
          </button>

          <button
            type="button"
            onClick={onOpenFormulas}
            aria-label="بانک فرمول‌ها"
            title="بانک فرمول‌ها و قضایا"
            className={toolButtonClass}
          >
            <BookMarked className="h-4.5 w-4.5" />
          </button>

          <button
            type="button"
            onClick={onOpenPdf}
            aria-label="مشاهده جزوه PDF"
            title="جزوه اصلی (PDF)"
            className={toolButtonClass}
          >
            <FileText className="h-4.5 w-4.5" />
          </button>

          <button
            type="button"
            onClick={onToggleScratchpad}
            aria-label="تخته یادداشت"
            title="تخته یادداشت و محاسبات دستی"
            className={toolButtonClass}
          >
            <PenTool className="h-4.5 w-4.5" />
          </button>

          <button
            type="button"
            onClick={onOpenAI}
            aria-label="دستیار هوشمند"
            title="دستیار هوشمند پرسش و پاسخ"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-solid text-white transition-colors hover:bg-accent-deep"
          >
            <Bot className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
