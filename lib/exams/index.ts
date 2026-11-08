import type { ExamPaper, ExamTopic } from './types.ts';
import { SK_9394_MIDTERM2, SKU_1404_MIDTERM, SHAHREKORD_1403_MIDTERM2 } from './papers-1.ts';
import { SK_9394_FINAL, SK_9394_MIDTERM_TAKMILI, SK_95_MIDTERM } from './papers-2.ts';
import {
  SK_95_MIDTERM_B,
  SK_95_TAKMILI,
  SK_96_MIDTERM,
  SHAHREKORD_1403_MIDTERM1,
} from './papers-3.ts';

/**
 * بانک امتحانات — all 10 papers found in /public/assets/exams, in
 * chronological order, each question transcribed and fully solved.
 * Every solution passed three independent checks (symbolic derivation,
 * numeric verification via lib/exams-verify.test.ts, KaTeX render check).
 */
export const EXAM_PAPERS: ExamPaper[] = [
  SK_9394_MIDTERM2,
  SK_9394_MIDTERM_TAKMILI,
  SK_9394_FINAL,
  SK_95_MIDTERM,
  SK_95_MIDTERM_B,
  SK_95_TAKMILI,
  SK_96_MIDTERM,
  SKU_1404_MIDTERM,
  SHAHREKORD_1403_MIDTERM1,
  SHAHREKORD_1403_MIDTERM2,
];

export const TOTAL_EXAM_QUESTIONS = EXAM_PAPERS.reduce(
  (sum, p) => sum + p.questions.length,
  0
);

export function filterPapersByTopic(topic: ExamTopic): ExamPaper[] {
  if (topic === 'همه موضوع‌ها') return EXAM_PAPERS;
  return EXAM_PAPERS.map((paper) => ({
    ...paper,
    questions: paper.questions.filter((q) => q.topic === topic),
  })).filter((paper) => paper.questions.length > 0);
}

export * from './types.ts';
