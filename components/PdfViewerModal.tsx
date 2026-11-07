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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="مشاهده فایل اصلی جزوه ریاضیات مهندسی"
    >
      <div className="flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#CBD5E1] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-[#0284C7]" />
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                فایل مرجع: نکات و مثال‌ها در ریاضیات مهندسی (دکتر طائری / احمدی دارانی / رئیسی)
              </h3>
              {pageRangeLabel && (
                <p className="text-xs text-[#475569]">
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
              className="flex items-center gap-1.5 rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] hover:bg-[#F1F5F9]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              باز کردن فایل PDF
            </a>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#CBD5E1] bg-white p-1.5 text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
              aria-label="بستن پنجره جزوه"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-[#F1F5F9]">
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
