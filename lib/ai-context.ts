/**
 * Knowledge-context projection for the AI tutor: turns the official
 * curriculum data of the active module/subtopic into a compact Persian
 * "درس‌نامه" block that /api/ai/chat injects into the system instruction.
 * Pure module — no React, no fetch — so it is unit-testable with node:test
 * and only ever runs on the server (route handler).
 */

import {
  CURRICULUM_MODULES,
  type CurriculumModule,
  type SubtopicItem,
} from './curriculum-data.ts';

/** Hard cap per field so a single huge topic cannot flood the system prompt */
const FORMULA_LIMIT = 500;
const TEXT_LIMIT = 400;

function clip(text: string, limit: number): string {
  const clean = text.trim();
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, limit)}…`;
}

export function findCurriculumModule(
  moduleId?: string
): CurriculumModule | undefined {
  if (!moduleId) return undefined;
  return CURRICULUM_MODULES.find((m) => m.id === moduleId);
}

/**
 * Resolves the active subtopic *within* the given module only — a subtopic
 * id from another module must never leak into the context.
 */
export function findActiveSubtopic(
  module: CurriculumModule,
  subtopicId?: string
): SubtopicItem | undefined {
  if (!subtopicId) return undefined;
  return module.subtopics.find((s) => s.id === subtopicId);
}

function formatSubtopicBlock(sub: SubtopicItem): string {
  const lines: string[] = [
    `زیرمبحث فعال: ${sub.title} (${sub.pdfPages})`,
  ];
  if (sub.summary) {
    lines.push('خلاصه رسمی درس‌نامه:', clip(sub.summary, TEXT_LIMIT));
  }
  if (sub.keyFormulas.length > 0) {
    lines.push('فرمول‌های کلیدی درس‌نامه:');
    sub.keyFormulas.forEach((kf, i) => {
      lines.push(`${i + 1}) ${kf.label}`);
      lines.push(`$$${clip(kf.formula, FORMULA_LIMIT)}$$`);
      if (kf.note) lines.push(`توضیح: ${clip(kf.note, TEXT_LIMIT)}`);
    });
  }
  const conceptPoints = [
    ...(sub.conceptualPoints ?? []),
    ...(sub.commonPitfalls ?? []),
  ];
  if (conceptPoints.length > 0) {
    lines.push('نکات مفهومی و دام‌های رایج:');
    conceptPoints.forEach((point) => lines.push(`- ${clip(point, TEXT_LIMIT)}`));
  }
  if (sub.engineeringApplications?.length) {
    lines.push('کاربردهای مهندسی:');
    sub.engineeringApplications.forEach((point) =>
      lines.push(`- ${clip(point, 300)}`)
    );
  }
  return lines.join('\n');
}

function formatModuleOutline(mod: CurriculumModule): string {
  const lines: string[] = [
    `شرح کلی: ${clip(mod.subtitle, TEXT_LIMIT)}`,
    'فهرست زیرمباحث رسمی درس‌نامه:',
    ...mod.subtopics.map((sub, i) => `${i + 1}. ${sub.title}`),
    'زیرمبحث دقیقِ فعال ارسال نشده است؛ اگر پرسش دانشجو متعلق به یکی از عناوین بالا بود، پاسخ را بر اساس همان زیرمبحث و قراردادهای درس بنویس.',
  ];
  return lines.join('\n');
}

/**
 * Builds the grounded knowledge block for the active module/subtopic.
 * Returns an empty string when the ids are unknown so the caller can
 * gracefully fall back to the title-only context.
 */
export function buildKnowledgeContext(
  moduleId?: string,
  subtopicId?: string
): string {
  const mod = findCurriculumModule(moduleId);
  if (!mod) return '';

  const subtopic = findActiveSubtopic(mod, subtopicId);
  const body = subtopic
    ? formatSubtopicBlock(subtopic)
    : formatModuleOutline(mod);

  return [`فصل: ${mod.numberLabel} — ${mod.title}`, body].join('\n');
}
