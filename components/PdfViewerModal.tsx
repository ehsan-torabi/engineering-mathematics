'use client';

import React from 'react';
import { X, FileText, ExternalLink } from 'lucide-react';

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageRangeLabel?: string;
}

export default function PdfViewerModal({
  isOpen,
  onClose,
  pageRangeLabel,
}: PdfViewerModalProps) {
  if (!isOpen) return null;

  const pdfPath = '/assets/aistudio/Math_Eng1404_92b5e87e.pdf';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-solid/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="مشاهده فایل اصلی جزوه ریاضیات مهندسی"
    >
      <div className="flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-line-strong bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-line bg-panel px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-accent" />
            <div>
              <h3 className="text-sm font-bold text-ink">
                فایل مرجع: نکات و مثال‌ها در ریاضیات مهندسی (دکتر طائری / احمدی دارانی / رئیسی)
              </h3>
              {pageRangeLabel && (
                <p className="text-xs text-ink-3">
                  بخش مرتبط با درس فعلی: {pageRangeLabel}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={pdfPath}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:bg-muted"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              باز کردن فایل PDF
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-line-strong bg-surface p-1.5 text-ink-3 hover:bg-muted hover:text-ink"
              aria-label="بستن پنجره جزوه"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-muted">
          <iframe
            src={pdfPath}
            title="جزوه ریاضیات مهندسی"
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
