import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildKnowledgeContext,
  findCurriculumModule,
  findActiveSubtopic,
} from './ai-context.ts';
import { CURRICULUM_MODULES } from './curriculum-data.ts';
import { buildMathTutorSystemInstruction } from './ai-settings.ts';

test('buildKnowledgeContext resolves the active subtopic with its official content', () => {
  const context = buildKnowledgeContext(
    'module_0_prerequisites',
    'p0_parity_product'
  );

  assert.ok(context.includes('فصل:'), 'module header expected');
  assert.ok(
    context.includes('ضرب توابع زوج و فرد'),
    'subtopic title expected'
  );
  assert.ok(context.includes('فرمول‌های کلیدی درس‌نامه:'));
  assert.ok(context.includes('$$'), 'LaTeX formula block expected');
  assert.ok(context.includes('جدول تقارن حاصل‌ضرب'), 'key formula label');
  assert.ok(context.includes('نکات مفهومی و دام‌های رایج:'));
});

test('buildKnowledgeContext falls back to the module outline without a subtopic id', () => {
  const context = buildKnowledgeContext('module_0_prerequisites');

  assert.ok(context.includes('فهرست زیرمباحث رسمی درس‌نامه:'));
  // Every subtopic title of the module appears in the outline
  const mod = findCurriculumModule('module_0_prerequisites')!;
  for (const sub of mod.subtopics) {
    assert.ok(context.includes(sub.title));
  }
  // And no subtopic of another module leaks in
  assert.ok(!context.includes('تعریف تابع زوج، تابع فرد'));
});

test('buildKnowledgeContext returns an empty string for unknown or missing ids', () => {
  assert.equal(buildKnowledgeContext(), '');
  assert.equal(buildKnowledgeContext(undefined, 'p0_parity_product'), '');
  assert.equal(buildKnowledgeContext('module_unknown_xx', 'p0_parity_product'), '');
  // A subtopic id from another module never leaks: falls back to the
  // module outline of module_0 instead.
  const mismatched = buildKnowledgeContext('module_0_prerequisites', 'm1_even_odd');
  assert.ok(mismatched.includes('فهرست زیرمباحث رسمی درس‌نامه:'));
  assert.ok(!mismatched.includes('تعریف تابع متناوب'));
});

test('findActiveSubtopic only matches subtopics of its own module', () => {
  const mod = findCurriculumModule('module_0_prerequisites')!;
  assert.equal(findActiveSubtopic(mod, 'p0_parity_integral')?.id, 'p0_parity_integral');
  assert.equal(findActiveSubtopic(mod, 'm1_periodic'), undefined);
  assert.equal(findActiveSubtopic(mod), undefined);
});

test('every curriculum module produces a non-empty knowledge context', () => {
  for (const mod of CURRICULUM_MODULES) {
    const context = buildKnowledgeContext(mod.id);
    assert.ok(context.length > 100, `context for ${mod.id} is too short`);
  }
});

test('new prerequisite topics exist with key formulas and practice coverage', () => {
  const mod = findCurriculumModule('module_0_prerequisites')!;
  const newIds = [
    'p0_parity_product',
    'p0_parity_integral',
    'p0_exp_ln',
    'p0_equation_roots',
    'p0_discriminant',
    'p0_partial_fractions',
  ];
  for (const id of newIds) {
    const sub = mod.subtopics.find((s) => s.id === id);
    assert.ok(sub, `missing new prerequisite subtopic ${id}`);
    assert.ok(sub.keyFormulas.length >= 3, `${id} needs at least 3 key formulas`);
    assert.ok(sub.summary.length > 80, `${id} needs a real summary`);
    const context = buildKnowledgeContext(mod.id, id);
    assert.ok(context.includes(sub.title));
  }

  // Trig special-angle table + hyperbolic values are part of prerequisites
  const trig = mod.subtopics.find((s) => s.id === 'p0_trig_identities')!;
  assert.ok(
    trig.keyFormulas.some((kf) => kf.label.includes('جدول مقادیر مهم سینوس و کسینوس')),
    'special-angle table expected in trig identities topic'
  );
  const hyperbolic = mod.subtopics.find((s) => s.id === 'p0_euler_hyperbolic')!;
  assert.ok(
    hyperbolic.keyFormulas.some((kf) => kf.label.includes('مقادیر مهم، اتحادهای مضاعف')),
    'sinh/cosh values topic expected'
  );

  // New worked example + practice questions
  assert.ok(
    mod.workedExamples.some((ex) => ex.id === 'ex_prereq_4'),
    'worked example ex_prereq_4 expected'
  );
  const questionIds = mod.practiceQuestions.map((q) => q.id);
  for (const qid of ['q5_m0', 'q6_m0', 'q7_m0', 'q8_m0']) {
    assert.ok(questionIds.includes(qid), `practice question ${qid} expected`);
  }
  for (const q of mod.practiceQuestions) {
    assert.ok(
      q.correctIndex >= 0 && q.correctIndex < q.options.length,
      `${q.id} has an out-of-range correctIndex`
    );
  }
});

test('buildMathTutorSystemInstruction embeds the knowledge block only when context is enabled', () => {
  const context = buildKnowledgeContext(
    'module_0_prerequisites',
    'p0_discriminant'
  );
  assert.ok(context.length > 0);

  const withContext = buildMathTutorSystemInstruction(
    { detailLevel: 'full_step_by_step', customSystemPrompt: '', includeModuleContext: true },
    {
      moduleTitle: 'ریاضیات پایه و پیش‌نیاز',
      subtopicTitle: 'محاسبه دلتا',
      knowledgeContext: context,
    }
  );
  assert.ok(withContext.includes('مبنای پاسخ‌دهی'), 'knowledge block header expected');
  assert.ok(withContext.includes('b^2 - 4ac'), 'delta formula from the lesson expected');
  assert.ok(withContext.includes('مبحث فعلی دانشجو در اپلیکیشن:'));

  const withoutContext = buildMathTutorSystemInstruction(
    { detailLevel: 'full_step_by_step', customSystemPrompt: '', includeModuleContext: false },
    {
      moduleTitle: 'ریاضیات پایه و پیش‌نیاز',
      subtopicTitle: 'محاسبه دلتا',
      knowledgeContext: context,
    }
  );
  assert.ok(!withoutContext.includes('مبنای پاسخ‌دهی'));
  assert.ok(!withoutContext.includes('b^2 - 4ac'));
});
