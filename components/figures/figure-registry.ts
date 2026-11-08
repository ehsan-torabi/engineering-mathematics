import React from 'react';
import {
  EulerCircleFigure,
  EvenOddSymmetryFigure,
  HalfRangeExtensionFigure,
  HeatRodFigure,
  RectSincPairFigure,
  SpectrumContinuumFigure,
  SturmModesFigure,
  TabularDIFigure,
} from './ConceptFigures';

export interface SubtopicFigure {
  Figure: React.ComponentType;
  captionFa: string;
}

/**
 * Concept figures keyed by subtopic id. Rendered inside LessonReader
 * after the detailed explanation. A subtopic id without an entry simply
 * renders no figure.
 */
export const SUBTOPIC_FIGURES: Record<string, SubtopicFigure> = {
  p0_ibp_tabular: {
    Figure: TabularDIFigure,
    captionFa:
      'جدول DI برای ∫x²cos(nx)dx: هر فلش آبی قُطری (↘) یک ضرب است و فلش قرمز، ضرب افقی سطر آخر داخل انتگرال — همان قانونی که درس‌نامه توضیح می‌دهد.',
  },
  p0_euler_hyperbolic: {
    Figure: EulerCircleFigure,
    captionFa:
      'هندسه فرمول اویلر روی دایره واحد: تصویر افقی نقطه e^(iθ) کسینوس و تصویر عمودی آن سینوس است؛ همین نگاه، تبدیل فوریه را قابل لمس می‌کند.',
  },
  m1_even_odd: {
    Figure: EvenOddSymmetryFigure,
    captionFa:
      'سه رفتار قرینه: تابع زوج نسبت به محور y آینه است، تابع فرد با چرخش ۱۸۰ درجه حول مبدأ بر خودش می‌افتد و بدون تقارن، هر دو مؤلفه سری را خواهد داشت.',
  },
  m2_4_sine_cosine_halfrange: {
    Figure: HalfRangeExtensionFigure,
    captionFa:
      'توسیع نیم‌دامنه: یک تابع روی [0, ℓ] با قرینه زوج به سری کسینوسی و با قرینه فرد به سری سینوسی می‌رسد — دو جواب متفاوت برای یک تابع.',
  },
  m3_2_fourier_integral_def: {
    Figure: SpectrumContinuumFigure,
    captionFa:
      'گذار از طیف گسسته به پیوسته: با بزرگ شدن ℓ فاصله هارمونیک‌ها Δα = π/ℓ کم می‌شود و در حد ℓ → ∞ خطوط مجزا به چگالی طیفی پیوسته می‌ریزند.',
  },
  m4_1_definition_inversion: {
    Figure: RectSincPairFigure,
    captionFa:
      'مشهورترین جفت تبدیل: پالس مستطیلی در حوزه مکان، سینک نوسانی در حوزه فرکانس است — پهنای بیشتر در مکان یعنی طیف تنگ‌تر (اصل عدم قطعیت).',
  },
  m5_5_eigenvalues_properties_table4: {
    Figure: SturmModesFigure,
    captionFa:
      'توابع ویژه مسئله دیریکله: مود nام دقیقاً n نیم‌موج و n−1 گره داخلی دارد و ویژه‌مقدار آن (nπ/L)² است؛ همین شکل‌ها در آزمایشگاه گرما هم دوباره ظاهر می‌شوند.',
  },
  m6_heat_homog_separation: {
    Figure: HeatRodFigure,
    captionFa:
      'میرایی حرارتی: هر هارمونیک سینوسی پروفایل دما با گذشت زمان بدون تغییر شکل، فقط کوچک‌تر می‌شود — و هارمونیک‌های با فرکانس بالاتر سریع‌تر خاموش می‌شوند.',
  },
};
