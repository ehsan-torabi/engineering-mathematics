/**
 * Types for the exam bank (بانک امتحانات).
 * Every question of every paper in /public/assets/exams is transcribed here
 * together with a complete, triple-checked worked solution.
 * Formulas are standard LaTeX for KaTeX; Persian text mixes inline math
 * through the $...$ convention used by MathText.
 */

export interface SolutionStep {
  title: string;
  /** Display-mode LaTeX block for this step. */
  formula?: string;
  /** Persian explanation, may contain $...$ inline math. */
  detail?: string;
}

export interface ExamQuestion {
  id: string;
  /** Persian label as printed on the paper, e.g. «۱» یا «۱-الف». */
  numberLabel: string;
  /** Marks written on the paper, e.g. «۲ نمره». */
  marks?: string;
  /** Topic tag used for filtering, aligned with the course modules. */
  topic: string;
  /** Persian statement, $...$ for inline math. */
  statement: string;
  /** The main formula/branch of the statement as a display block. */
  statementFormula?: string;
  /** One-line Persian description of the attack plan. */
  approach: string;
  steps: SolutionStep[];
  /** Final boxed answer, LaTeX display block. */
  finalAnswer: string;
  /** Persian remarks: pitfalls, conventions, official-sheet errata. */
  notes?: string[];
  /** True when the original PDF already carries a (partial) solution. */
  officialSolution?: boolean;
}

export interface ExamPaper {
  id: string;
  university: string;
  /** «نیم‌ترم» یا «پایان‌ترم». */
  title: string;
  semester: string;
  examDate?: string;
  duration?: string;
  /** Public asset path of the original PDF. */
  file: string;
  /** Number of questions (computed helper kept explicit for labels). */
  questions: ExamQuestion[];
  /** True when the PDF itself ships worked solutions. */
  hasOfficialSolution?: boolean;
}

/** Topic tags (aligned with CURRICULUM_MODULES). */
export const EXAM_TOPICS = [
  'همه موضوع‌ها',
  'سری فوریه',
  'انتگرال فوریه',
  'تبدیل فوریه',
  'اشتورم–لیوویل',
  'معادله گرما',
  'معادله ارتعاش',
  'اعداد مختلط',
] as const;

export type ExamTopic = (typeof EXAM_TOPICS)[number];
