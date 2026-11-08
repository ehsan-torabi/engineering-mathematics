'use client';

import React from 'react';
import { FlaskConical } from 'lucide-react';
import { CurriculumModule } from '@/lib/curriculum-data';
import FourierInteractiveStage from '@/components/FourierInteractiveStage';
import FourierIntegralStage from '@/components/FourierIntegralStage';
import FourierTransformStage from '@/components/FourierTransformStage';
import SturmLiouvilleStage from '@/components/SturmLiouvilleStage';
import HeatEquationStage from '@/components/HeatEquationStage';
import PrerequisiteStage from '@/components/PrerequisiteStage';

interface LabPanelProps {
  module: CurriculumModule;
}

const LAB_HINTS: Record<string, string> = {
  prerequisites_foundation:
    'ابزارهای پایه را دستی ورودی بده و نتیجه را ببین — پیش از ورود به فوریه.',
  symmetry_orthogonality:
    'توابع را ترکیب کن تا تقارن و تعامد را به‌جای حفظ کردن، ببینی.',
  fourier_series:
    'هارمونیک‌ها را اضافه یا کم کن تا همگرایی سری فوریه را حس کنی.',
  fourier_integral:
    'پریود را به بی‌نهایت برسان تا گذار سری به انتگرال فوریه را ببینی.',
  fourier_transform:
    'پالس‌ها را جابه‌جا کن و جفت زمان-فرکانس را به‌صورت زنده تحلیل کن.',
  sturm_liouville:
    'پارامترهای مسئله مقدار مرزی را تغییر بده تا مقادیر ویژه تغییر کنند.',
  heat_pde:
    'شرایط اولیه و مرزی میله را تنظیم کن و پخش گرما را در زمان ببین.',
};

/**
 * The interactive simulator zone. A thin shell around the domain-specific
 * stage components — the lab owns the full main column width.
 */
export default function LabPanel({ module }: LabPanelProps) {
  const hint = LAB_HINTS[module.simulatorType];

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-xs text-ink-3">
        <FlaskConical className="h-4 w-4 shrink-0 text-accent" />
        <span>{hint ?? 'آزمایشگاه تعاملی مفاهیم این فصل.'}</span>
      </div>

      {module.simulatorType === 'prerequisites_foundation' && <PrerequisiteStage />}
      {(module.simulatorType === 'symmetry_orthogonality' ||
        module.simulatorType === 'fourier_series') && (
        <FourierInteractiveStage mode={module.simulatorType} />
      )}
      {module.simulatorType === 'fourier_integral' && <FourierIntegralStage />}
      {module.simulatorType === 'fourier_transform' && <FourierTransformStage />}
      {module.simulatorType === 'sturm_liouville' && <SturmLiouvilleStage />}
      {module.simulatorType === 'heat_pde' && <HeatEquationStage />}
    </div>
  );
}
