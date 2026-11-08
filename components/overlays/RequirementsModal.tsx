'use client';

import React from 'react';
import { REQUIREMENTS_SPECIFICATION } from '@/lib/study-engine';
import { MathText } from '@/components/MathFormula';
import Modal from '@/components/ui/Modal';
import { ClipboardList, CheckCircle2 } from 'lucide-react';

interface RequirementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * The course design document: requirements traceability matrix. A
 * developer-facing artifact kept one click from home, out of the learner's
 * way.
 */
export default function RequirementsModal({
  isOpen,
  onClose,
}: RequirementsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="سند طراحی دوره"
      title="سند طراحی دوره"
      description="نیازمندی‌های آموزشی، محاسباتی و تعاملی همراه با نگاشت پیاده‌سازی"
      icon={<ClipboardList className="h-5 w-5" />}
      widthClass="max-w-3xl"
    >
      <div className="space-y-2.5">
        {REQUIREMENTS_SPECIFICATION.map((req) => (
          <div key={req.id} className="rounded-xl border border-line bg-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-ink-4">
                <span className="font-mono font-bold text-accent">{req.id}</span>
                <span aria-hidden="true">·</span>
                <span>{req.category}</span>
                <span aria-hidden="true">·</span>
                <span>{req.priority}</span>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-ok">
                <CheckCircle2 className="h-3.5 w-3.5" />
                پیاده‌سازی‌شده
              </span>
            </div>

            <h3 className="mt-1.5 text-[13px] font-bold text-ink">
              <MathText text={req.title} />
            </h3>
            <p className="mt-1 text-xs leading-6 text-ink-2">
              <MathText text={req.description} />
            </p>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2 text-[11px] text-ink-3">
              <span className="min-w-0">
                <span className="font-semibold text-ink">معیار پذیرش: </span>
                <MathText text={req.acceptanceCriteria} />
              </span>
              <span dir="ltr" className="shrink-0 font-mono text-accent-deep dark:text-accent">
                {req.targetComponent}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
