'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Accessible dialog label (visually hidden if the header already has a title) */
  ariaLabel: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  /** Max width class for the dialog panel, e.g. "max-w-3xl" */
  widthClass?: string;
  children: React.ReactNode;
}

/**
 * Shared modal shell — one dialog primitive for every overlay in the app.
 * Backdrop dims, panel scales from 0.97 with a 200ms ease-out (modals keep
 * transform-origin: center — they are not anchored to a trigger). Escape
 * and backdrop click close; body scroll locks while open.
 */
export default function Modal({
  isOpen,
  onClose,
  ariaLabel,
  title,
  description,
  icon,
  widthClass = 'max-w-3xl',
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="بستن پنجره"
        onClick={onClose}
        className="animate-backdrop absolute inset-0 cursor-default bg-ink/45 backdrop-blur-xs"
        tabIndex={-1}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`animate-overlay relative flex max-h-[88vh] w-full ${widthClass} flex-col overflow-hidden rounded-xl border border-line-strong bg-surface shadow-2xl outline-none`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-deep dark:text-accent">
                {icon}
              </div>
            )}
            <div>
              <h2 className="text-base font-bold leading-7 text-ink">{title}</h2>
              {description && (
                <p className="mt-0.5 text-xs leading-6 text-ink-3">
                  {description}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-muted hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-paper p-4 sm:p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
