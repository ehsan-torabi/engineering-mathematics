import {
  CURRICULUM_MODULES,
} from './curriculum-data.ts';
import type {
  CurriculumModule,
  ModuleId,
  PracticeQuestion,
} from './curriculum-data.ts';

export interface FormulaCatalogEntry {
  id: string;
  moduleId: ModuleId;
  moduleNumberLabel: string;
  moduleTitle: string;
  subtopicId: string;
  subtopicIndex: number;
  subtopicTitle: string;
  pdfPages: string;
  label: string;
  formula: string;
  note?: string;
}

export interface StudyProgressState {
  completedSubtopics: string[];
  completedExamples: string[];
  quizAnswers: Record<string, number>;
  moduleNotes: Partial<Record<ModuleId, string>>;
}

export const INITIAL_STUDY_PROGRESS: StudyProgressState = {
  completedSubtopics: [],
  completedExamples: [],
  quizAnswers: {},
  moduleNotes: {},
};

export interface ModuleMasterySummary {
  moduleId: ModuleId;
  numberLabel: string;
  title: string;
  totalSubtopics: number;
  completedSubtopicsCount: number;
  totalExamples: number;
  completedExamplesCount: number;
  totalQuestions: number;
  answeredQuestionsCount: number;
  correctQuestionsCount: number;
  masteryPercent: number;
  statusLabel: 'تکمیل‌شده (مسلط)' | 'در حال مطالعه' | 'شروع‌نشده';
}

export interface CourseProgressReport {
  overallMasteryPercent: number;
  totalSubtopics: number;
  completedSubtopicsCount: number;
  totalExamples: number;
  completedExamplesCount: number;
  totalQuestions: number;
  answeredQuestionsCount: number;
  correctQuestionsCount: number;
  quizAccuracyPercent: number;
  moduleSummaries: ModuleMasterySummary[];
  recommendedNextAction: {
    moduleId: ModuleId;
    moduleNumberLabel: string;
    targetType: 'subtopic' | 'example' | 'quiz';
    title: string;
    subtopicIndex?: number;
  };
}

export interface ExamEvaluationReport {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  scorePercent: number;
  gradeLabelFa: 'عالی (تسلط کامل امتحانی)' | 'خوب (آماده امتحان)' | 'متوسط (نیازمند تمرین بیشتر)' | 'نیازمند مرور پایه';
  strongModules: string[];
  weakModules: string[];
}

export interface RequirementEngineeringItem {
  id: string;
  category:
    | 'نیازمندی‌های آموزشی و سرفصل‌ها (Pedagogical)'
    | 'نیازمندی‌های محاسباتی و ریاضی (Mathematical)'
    | 'نیازمندی‌های تعاملی و شبیه‌سازی (Interactive Lab)'
    | 'نیازمندی‌های دستیار هوشمند و ابزارهای کمک‌آموزشی (AI & Study Tools)';
  title: string;
  description: string;
  acceptanceCriteria: string;
  targetComponent: string;
  priority: 'حیاتی (Must-Have)' | 'بالا (High)';
  implemented: boolean;
}

/**
 * Extract all reference formulas from all curriculum modules into a flat searchable catalog
 */
export function extractAllFormulas(
  modules: CurriculumModule[] = CURRICULUM_MODULES
): FormulaCatalogEntry[] {
  const entries: FormulaCatalogEntry[] = [];
  for (const mod of modules) {
    mod.subtopics.forEach((sub, subIdx) => {
      sub.keyFormulas.forEach((kf, fIdx) => {
        entries.push({
          id: `${mod.id}_${sub.id}_f${fIdx}`,
          moduleId: mod.id,
          moduleNumberLabel: mod.numberLabel,
          moduleTitle: mod.title,
          subtopicId: sub.id,
          subtopicIndex: subIdx,
          subtopicTitle: sub.title,
          pdfPages: sub.pdfPages,
          label: kf.label,
          formula: kf.formula,
          note: kf.note,
        });
      });
    });
  }
  return entries;
}

/**
 * Filter formula catalog by moduleId and free-text query (Persian or LaTeX keywords)
 */
export function filterFormulas(
  entries: FormulaCatalogEntry[],
  searchQuery: string,
  moduleFilter: ModuleId | 'all' = 'all'
): FormulaCatalogEntry[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return entries.filter((item) => {
    if (moduleFilter !== 'all' && item.moduleId !== moduleFilter) {
      return false;
    }
    if (!normalizedQuery) return true;

    const haystack = [
      item.label,
      item.subtopicTitle,
      item.moduleTitle,
      item.moduleNumberLabel,
      item.formula,
      item.note || '',
    ]
      .join(' ')
      .toLowerCase();

    const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
    return tokens.every((tok) => haystack.includes(tok));
  });
}

/**
 * Compute detailed mastery & progress metrics across all 7 modules
 */
export function computeCourseProgress(
  state: StudyProgressState,
  modules: CurriculumModule[] = CURRICULUM_MODULES
): CourseProgressReport {
  const completedSubSet = new Set(state.completedSubtopics);
  const completedExSet = new Set(state.completedExamples);

  let totalSubtopics = 0;
  let completedSubtopicsCount = 0;
  let totalExamples = 0;
  let completedExamplesCount = 0;
  let totalQuestions = 0;
  let answeredQuestionsCount = 0;
  let correctQuestionsCount = 0;

  let recommendedNextAction: CourseProgressReport['recommendedNextAction'] | null =
    null;

  const moduleSummaries: ModuleMasterySummary[] = modules.map((mod) => {
    const modTotalSub = mod.subtopics.length;
    let modDoneSub = 0;
    mod.subtopics.forEach((sub, idx) => {
      if (completedSubSet.has(sub.id)) {
        modDoneSub += 1;
      } else if (!recommendedNextAction) {
        recommendedNextAction = {
          moduleId: mod.id,
          moduleNumberLabel: mod.numberLabel,
          targetType: 'subtopic',
          title: `مطالعه درس‌نامه: ${sub.title}`,
          subtopicIndex: idx,
        };
      }
    });

    const modTotalEx = mod.workedExamples.length;
    let modDoneEx = 0;
    mod.workedExamples.forEach((ex) => {
      if (completedExSet.has(ex.id)) {
        modDoneEx += 1;
      } else if (!recommendedNextAction) {
        recommendedNextAction = {
          moduleId: mod.id,
          moduleNumberLabel: mod.numberLabel,
          targetType: 'example',
          title: `حل گام‌به‌گام: ${ex.title}`,
        };
      }
    });

    const modTotalQ = mod.practiceQuestions.length;
    let modAnsweredQ = 0;
    let modCorrectQ = 0;
    mod.practiceQuestions.forEach((q) => {
      const ans = state.quizAnswers[q.id];
      if (ans !== undefined) {
        modAnsweredQ += 1;
        if (ans === q.correctIndex) {
          modCorrectQ += 1;
        }
      } else if (!recommendedNextAction) {
        recommendedNextAction = {
          moduleId: mod.id,
          moduleNumberLabel: mod.numberLabel,
          targetType: 'quiz',
          title: `پاسخ به خودآزمایی ${mod.numberLabel}`,
        };
      }
    });

    totalSubtopics += modTotalSub;
    completedSubtopicsCount += modDoneSub;
    totalExamples += modTotalEx;
    completedExamplesCount += modDoneEx;
    totalQuestions += modTotalQ;
    answeredQuestionsCount += modAnsweredQ;
    correctQuestionsCount += modCorrectQ;

    const totalItems = modTotalSub + modTotalEx + modTotalQ;
    const achievedItems = modDoneSub + modDoneEx + modCorrectQ;
    const masteryPercent =
      totalItems > 0 ? Math.round((achievedItems / totalItems) * 100) : 0;

    let statusLabel: ModuleMasterySummary['statusLabel'] = 'شروع‌نشده';
    if (masteryPercent >= 85) {
      statusLabel = 'تکمیل‌شده (مسلط)';
    } else if (modDoneSub > 0 || modDoneEx > 0 || modAnsweredQ > 0) {
      statusLabel = 'در حال مطالعه';
    }

    return {
      moduleId: mod.id,
      numberLabel: mod.numberLabel,
      title: mod.title,
      totalSubtopics: modTotalSub,
      completedSubtopicsCount: modDoneSub,
      totalExamples: modTotalEx,
      completedExamplesCount: modDoneEx,
      totalQuestions: modTotalQ,
      answeredQuestionsCount: modAnsweredQ,
      correctQuestionsCount: modCorrectQ,
      masteryPercent,
      statusLabel,
    };
  });

  const grandTotalItems = totalSubtopics + totalExamples + totalQuestions;
  const grandCompletedItems =
    completedSubtopicsCount + completedExamplesCount + correctQuestionsCount;
  const overallMasteryPercent =
    grandTotalItems > 0
      ? Math.round((grandCompletedItems / grandTotalItems) * 100)
      : 0;

  const quizAccuracyPercent =
    answeredQuestionsCount > 0
      ? Math.round((correctQuestionsCount / answeredQuestionsCount) * 100)
      : 0;

  if (!recommendedNextAction) {
    recommendedNextAction = {
      moduleId: modules[0].id,
      moduleNumberLabel: modules[0].numberLabel,
      targetType: 'quiz',
      title: 'مرور آزمون جامع پایان‌ترم تمامی فصول',
    };
  }

  return {
    overallMasteryPercent,
    totalSubtopics,
    completedSubtopicsCount,
    totalExamples,
    completedExamplesCount,
    totalQuestions,
    answeredQuestionsCount,
    correctQuestionsCount,
    quizAccuracyPercent,
    moduleSummaries,
    recommendedNextAction,
  };
}

/**
 * Collect practice questions for comprehensive exam simulator
 */
export function getExamQuestions(
  moduleFilter: ModuleId | 'all' = 'all',
  modules: CurriculumModule[] = CURRICULUM_MODULES
): Array<
  PracticeQuestion & {
    moduleId: ModuleId;
    moduleNumberLabel: string;
    moduleTitle: string;
  }
> {
  const list: Array<
    PracticeQuestion & {
      moduleId: ModuleId;
      moduleNumberLabel: string;
      moduleTitle: string;
    }
  > = [];

  for (const mod of modules) {
    if (moduleFilter !== 'all' && mod.id !== moduleFilter) continue;
    for (const q of mod.practiceQuestions) {
      list.push({
        ...q,
        moduleId: mod.id,
        moduleNumberLabel: mod.numberLabel,
        moduleTitle: mod.title,
      });
    }
  }
  return list;
}

/**
 * Evaluate comprehensive exam results and diagnose strong/weak modules
 */
export function evaluateExamResults(
  quizAnswers: Record<string, number>,
  moduleFilter: ModuleId | 'all' = 'all',
  modules: CurriculumModule[] = CURRICULUM_MODULES
): ExamEvaluationReport {
  const questions = getExamQuestions(moduleFilter, modules);
  const totalQuestions = questions.length;
  let answeredCount = 0;
  let correctCount = 0;
  let wrongCount = 0;

  const perModuleStats = new Map<
    ModuleId,
    { label: string; total: number; correct: number; answered: number }
  >();

  for (const q of questions) {
    const entry = perModuleStats.get(q.moduleId) || {
      label: q.moduleNumberLabel,
      total: 0,
      correct: 0,
      answered: 0,
    };
    entry.total += 1;

    const choice = quizAnswers[q.id];
    if (choice !== undefined) {
      answeredCount += 1;
      entry.answered += 1;
      if (choice === q.correctIndex) {
        correctCount += 1;
        entry.correct += 1;
      } else {
        wrongCount += 1;
      }
    }
    perModuleStats.set(q.moduleId, entry);
  }

  const unansweredCount = totalQuestions - answeredCount;
  const scorePercent =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  let gradeLabelFa: ExamEvaluationReport['gradeLabelFa'] = 'نیازمند مرور پایه';
  if (scorePercent >= 85) {
    gradeLabelFa = 'عالی (تسلط کامل امتحانی)';
  } else if (scorePercent >= 65) {
    gradeLabelFa = 'خوب (آماده امتحان)';
  } else if (scorePercent >= 40) {
    gradeLabelFa = 'متوسط (نیازمند تمرین بیشتر)';
  }

  const strongModules: string[] = [];
  const weakModules: string[] = [];

  perModuleStats.forEach((stat) => {
    if (stat.answered === 0) {
      weakModules.push(`${stat.label} (بدون پاسخ)`);
    } else if (stat.correct === stat.total) {
      strongModules.push(stat.label);
    } else if (stat.correct / stat.total < 0.6) {
      weakModules.push(stat.label);
    } else {
      strongModules.push(stat.label);
    }
  });

  return {
    totalQuestions,
    answeredCount,
    correctCount,
    wrongCount,
    unansweredCount,
    scorePercent,
    gradeLabelFa,
    strongModules,
    weakModules,
  };
}

/**
 * Formal Requirements Engineering Specification for the Engineering Mathematics Platform
 */
export const REQUIREMENTS_SPECIFICATION: RequirementEngineeringItem[] = [
  {
    id: 'REQ-PED-01',
    category: 'نیازمندی‌های آموزشی و سرفصل‌ها (Pedagogical)',
    title: 'پوشش کامل مباحث ریاضیات پایه و پیش‌نیاز (بخش ۰)',
    description:
      'آموزش گام‌به‌گام انتگرال‌گیری جزء‌به‌جزء و جدول DI، اتحادهای مثلثاتی مرزی فوریه $(-1)^n$، فرمول اویلر، توابع هذلولوی و معادله مشخصه مرتبه دوم.',
    acceptanceCriteria:
      'دارای ۳ زیرآزمایشگاه بصری (دایره واحد، جدول DI، شبیه‌ساز ODE)، ۵ زیرمبحث، ۳ مثال ۵ گامی و ۴ تست خودآزمایی.',
    targetComponent: 'PrerequisiteStage.tsx + module_0_prerequisites',
    priority: 'حیاتی (Must-Have)',
    implemented: true,
  },
  {
    id: 'REQ-PED-02',
    category: 'نیازمندی‌های آموزشی و سرفصل‌ها (Pedagogical)',
    title: 'پوشش کامل ۶ سرفصل اصلی جزوه ریاضیات مهندسی (بخش‌های ۱ تا ۶)',
    description:
      'پوشش کامل تعاریف زوج/فرد/متناوب/متعامد، سری فوریه و پارسوال، انتگرال فوریه، تبدیل فوریه و کانولوشن، مسئله اشتورم-لیوویل و معادله گرمای PDE.',
    acceptanceCriteria:
      'تمامی عناوین و زیرعناوین جزوه دکتر طائری به همراه ارجاع دقیق به صفحات PDF و فرمول‌های مرجع پیاده‌سازی شده‌اند.',
    targetComponent: 'curriculum-data.ts + PdfViewerModal.tsx',
    priority: 'حیاتی (Must-Have)',
    implemented: true,
  },
  {
    id: 'REQ-MATH-01',
    category: 'نیازمندی‌های محاسباتی و ریاضی (Mathematical)',
    title: 'بسط کامل تمام مراحل حل تشریحی بدون حذف محاسبات پایه',
    description:
      'نمایش جزء‌به‌جزء انتخاب $u$ و $dv$، انتگرال‌گیری صریح، جایگذاری حدود بالا و پایین و ساده‌سازی جبری $\\cos(n\\pi)=(-1)^n$ در تمام مثال‌ها.',
    acceptanceCriteria:
      'موتور ExamplesDeck دارای مرور تک‌گام، نمایش کامل، نکات مفهومی (Why Hint) و ۵ خانواده حل‌گر پارامتریک پویا.',
    targetComponent: 'ExamplesDeck.tsx + example-generator.ts',
    priority: 'حیاتی (Must-Have)',
    implemented: true,
  },
  {
    id: 'REQ-MATH-02',
    category: 'نیازمندی‌های محاسباتی و ریاضی (Mathematical)',
    title: 'رندر استاندارد فرمول‌های ریاضی KaTeX با ایزولاسیون جهت LTR در متن فارسی RTL',
    description:
      'جلوگیری از به‌هم‌ریختگی پرانتزها، علامت منفی و حدود انتگرال هنگامی که فرمول ریاضی در کنار متن فارسی قرار می‌گیرد.',
    acceptanceCriteria:
      'کامپوننت‌های MathFormula و MathText تمام عبارات درون‌خطی $...$ و بلوکی را در контейنر ایزوله dir="ltr" با فونت KaTeX رندر می‌کنند.',
    targetComponent: 'MathFormula.tsx',
    priority: 'حیاتی (Must-Have)',
    implemented: true,
  },
  {
    id: 'REQ-SIM-01',
    category: 'نیازمندی‌های تعاملی و شبیه‌سازی (Interactive Lab)',
    title: 'آزمایشگاه‌های شبیه‌سازی زنده برای تمام فصول درس',
    description:
      'شبیه‌ساز تعامد و تقارن، سنتزگر هارمونیک‌های سری فوریه و پدیده گیبس، طیف تبدیل فوریه، ویژه-توابع اشتورم-لیوویل و پروفایل زمانی-مکانی معادله گرما.',
    acceptanceCriteria:
      'محاسبه عددی زنده به روش سیمپسون در math-engine.ts همراه با تست‌های واحد خودکار (node:test).',
    targetComponent: 'FourierInteractiveStage / TransformAndSLStage / HeatEquationStage',
    priority: 'حیاتی (Must-Have)',
    implemented: true,
  },
  {
    id: 'REQ-TOOL-01',
    category: 'نیازمندی‌های دستیار هوشمند و ابزارهای کمک‌آموزشی (AI & Study Tools)',
    title: 'دستیار هوشمند AI با پشتیبانی از Google Gemini و ارائه‌دهندگان OpenAI-Compatible',
    description:
      'قابلیت پرسش و پاسخ تشریحی ریاضی، ارسال مستقیم هر گام از حل معادلات به دستیار AI و تنظیم Base URL و مدل سفارشی (OpenRouter, Groq, DeepSeek, Ollama).',
    acceptanceCriteria:
      'مسیر سرور /api/ai/chat و کشوی AIAssistantDrawer با پشتیبانی کامل از تگ‌های <think> و رندر فرمول‌های پاسخ.',
    targetComponent: 'AIAssistantDrawer.tsx + /api/ai/chat/route.ts',
    priority: 'حیاتی (Must-Have)',
    implemented: true,
  },
  {
    id: 'REQ-TOOL-02',
    category: 'نیازمندی‌های دستیار هوشمند و ابزارهای کمک‌آموزشی (AI & Study Tools)',
    title: 'تخته یادداشت و چرک‌نویس تعاملی روی صفحه (Interactive Scratchpad)',
    description:
      'امکان نوشتن دستی فرمول‌ها با ماوس یا لمس روی صفحه فعلی، تغییر رنگ و ضخامت قلم، پاک‌کن، Undo/Redo، شبکه شطرنجی و ذخیره تصویر PNG.',
    acceptanceCriteria:
      'کامپوننت شناور InteractiveScratchpad مبتنی بر Canvas API با پشتیبانی از Pointer Events.',
    targetComponent: 'InteractiveScratchpad.tsx',
    priority: 'بالا (High)',
    implemented: true,
  },
  {
    id: 'REQ-TOOL-03',
    category: 'نیازمندی‌های دستیار هوشمند و ابزارهای کمک‌آموزشی (AI & Study Tools)',
    title: 'بانک جامع فرمول‌ها و قضایای امتحانی با قابلیت جستجو و پرش سریع',
    description:
      'تجمیع تمام فرمول‌های کلیدی هر ۷ فصل در یک مرجع قابل جستجو با امکان فیلتر فصل، کپی کد LaTeX و پرش مستقیم به زیرمبحث مربوطه.',
    acceptanceCriteria:
      'پنجره FormulaSheetModal متصل به موتور جستجوی study-engine.ts.',
    targetComponent: 'FormulaSheetModal.tsx + study-engine.ts',
    priority: 'حیاتی (Must-Have)',
    implemented: true,
  },
  {
    id: 'REQ-TOOL-04',
    category: 'نیازمندی‌های دستیار هوشمند و ابزارهای کمک‌آموزشی (AI & Study Tools)',
    title: 'ردیابی پیشرفت تحصیلی، یادداشت‌های شخصی هر فصل و شبیه‌ساز آزمون جامع',
    description:
      'ذخیره پایدار وضعیت مطالعه زیرمباحث، تسلط بر مثال‌های حل‌شده، یادداشت‌های شخصی دانشجو و کارنامه تحلیلی آزمون جامع در localStorage.',
    acceptanceCriteria:
      'نقشه دوره در CourseHome، آزمون جامع در ExamModal و ماتریس نیازمندی‌ها در RequirementsModal.',
    targetComponent: 'CourseHome.tsx + ExamModal.tsx + study-engine.ts',
    priority: 'حیاتی (Must-Have)',
    implemented: true,
  },
  {
    id: 'REQ-TOOL-05',
    category: 'نیازمندی‌های دستیار هوشمند و ابزارهای کمک‌آموزشی (AI & Study Tools)',
    title: 'زمینه‌سازی علمی هوشمند: ارسال محتوای رسمی زیرمبحث فعال به مدل',
    description:
      'به‌جای ارسال صرف عنوان فصل، شناسه فصل و زیرمبحث فعال به مسیر /api/ai/chat ارسال می‌شود و سرور با ساخت بلوک «محتوای رسمی درس‌نامه» (خلاصه، فرمول‌های کلیدی، نکات مفهومی و دام‌های رایج همان زیرمبحث) از داده‌های درس‌نامه، پاسخ دستیار را به نمادگذاری و قراردادهای درس متصل می‌کند — شامل مباحث پیش‌نیاز ضرب و انتگرال توابع زوج و فرد، قواعد e و ln، گرفتن و بررسی ریشه معادله و محاسبه دلتا.',
    acceptanceCriteria:
      'تابع خالص buildKnowledgeContext در lib/ai-context.ts با تست واحد node:test و اتصال آن به buildMathTutorSystemInstruction از طریق /api/ai/chat.',
    targetComponent: 'lib/ai-context.ts + /api/ai/chat/route.ts + AIAssistantDrawer.tsx',
    priority: 'حیاتی (Must-Have)',
    implemented: true,
  },
];
