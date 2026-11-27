import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractAllFormulas,
  filterFormulas,
  computeCourseProgress,
  evaluateExamResults,
  getExamQuestions,
  INITIAL_STUDY_PROGRESS,
  REQUIREMENTS_SPECIFICATION,
} from './study-engine.ts';
import {
  CURRICULUM_MODULES,
  getModuleDefaultLayout,
  LAYOUT_COMPLEXITY_CONFIG,
} from './curriculum-data.ts';
import { TEXTBOOK_NOTES } from './textbook-notes.ts';

test('extractAllFormulas aggregates formulas from all 7 curriculum modules', () => {
  const allFormulas = extractAllFormulas();
  assert.ok(allFormulas.length >= 25, `Expected at least 25 formulas, got ${allFormulas.length}`);

  const moduleIdsRepresented = new Set(allFormulas.map((f) => f.moduleId));
  assert.equal(moduleIdsRepresented.size, 7);
});

test('filterFormulas filters accurately by moduleId and Persian/LaTeX keywords', () => {
  const allFormulas = extractAllFormulas();

  const prereqOnly = filterFormulas(allFormulas, '', 'module_0_prerequisites');
  assert.ok(prereqOnly.length >= 5);
  assert.ok(prereqOnly.every((f) => f.moduleId === 'module_0_prerequisites'));

  const parsevalHits = filterFormulas(allFormulas, 'پارسوال', 'all');
  assert.ok(parsevalHits.length >= 2);
});

test('computeCourseProgress calculates mastery percentages and recommends next action', () => {
  const initialReport = computeCourseProgress(INITIAL_STUDY_PROGRESS);
  assert.equal(initialReport.overallMasteryPercent, 0);
  assert.equal(initialReport.moduleSummaries.length, 7);
  assert.equal(initialReport.recommendedNextAction.moduleId, 'module_0_prerequisites');

  const firstMod = CURRICULUM_MODULES[0];
  const populatedState = {
    completedSubtopics: firstMod.subtopics.map((s) => s.id),
    completedExamples: firstMod.workedExamples.map((e) => e.id),
    quizAnswers: Object.fromEntries(
      firstMod.practiceQuestions.map((q) => [q.id, q.correctIndex])
    ),
    moduleNotes: {
      module_0_prerequisites: 'نکته مهم: cos(n*pi) = (-1)^n',
    },
  };

  const updatedReport = computeCourseProgress(populatedState);
  assert.equal(updatedReport.moduleSummaries[0].masteryPercent, 100);
  assert.equal(updatedReport.moduleSummaries[0].statusLabel, 'تکمیل‌شده (مسلط)');
  assert.equal(updatedReport.quizAccuracyPercent, 100);
  assert.ok(updatedReport.overallMasteryPercent > 0);
});

test('evaluateExamResults scores practice questions and identifies strong and weak modules', () => {
  const allQuestions = getExamQuestions('all');
  assert.ok(allQuestions.length >= 16);

  // Answer all questions in module_0_prerequisites correctly, and module_1_definitions wrong
  const answers: Record<string, number> = {};
  for (const q of allQuestions) {
    if (q.moduleId === 'module_0_prerequisites') {
      answers[q.id] = q.correctIndex;
    } else if (q.moduleId === 'module_1_definitions') {
      answers[q.id] = (q.correctIndex + 1) % q.options.length;
    }
  }

  const evalAll = evaluateExamResults(answers, 'all');
  // Module 0 grew to 8 questions (parity, e/ln, roots, delta) — every one of
  // them is answered correctly here, so the count must track the bank size.
  assert.equal(
    evalAll.correctCount,
    allQuestions.filter((q) => q.moduleId === 'module_0_prerequisites').length
  );
  assert.ok(evalAll.strongModules.some((m) => m.includes('بخش ۰')));
  assert.ok(evalAll.weakModules.some((m) => m.includes('بخش ۱')));

  const evalPrereq = evaluateExamResults(answers, 'module_0_prerequisites');
  assert.equal(evalPrereq.scorePercent, 100);
  assert.equal(evalPrereq.gradeLabelFa, 'عالی (تسلط کامل امتحانی)');
});

test('REQUIREMENTS_SPECIFICATION covers all 4 engineering categories and is marked implemented', () => {
  assert.ok(REQUIREMENTS_SPECIFICATION.length >= 9);
  assert.ok(REQUIREMENTS_SPECIFICATION.every((req) => req.implemented));
});

test('validates adaptive module complexity layout profiles across all 7 curriculum modules', () => {
  // Heat Equation must use wide_canvas for rod diffusion and spatial temperature distribution
  assert.equal(getModuleDefaultLayout('module_6_heat_pde'), 'wide_canvas');
  // Sturm-Liouville must use wide_canvas
  assert.equal(getModuleDefaultLayout('module_5_sturm_liouville'), 'wide_canvas');
  // Fourier Transform & Integral must use wide_canvas
  assert.equal(getModuleDefaultLayout('module_4_fourier_transform'), 'wide_canvas');
  assert.equal(getModuleDefaultLayout('module_3_fourier_integral'), 'wide_canvas');

  // Foundational modules must use focused_reading for ergonomic text line lengths
  assert.equal(getModuleDefaultLayout('module_0_prerequisites'), 'focused_reading');
  assert.equal(getModuleDefaultLayout('module_1_definitions'), 'focused_reading');

  // Fourier Series uses balanced_split
  assert.equal(getModuleDefaultLayout('module_2_fourier_series'), 'balanced_split');

  // Verify all CURRICULUM_MODULES have a defined layoutComplexity matching default
  for (const mod of CURRICULUM_MODULES) {
    assert.ok(mod.layoutComplexity);
    assert.equal(mod.layoutComplexity, getModuleDefaultLayout(mod.id));
    assert.ok(LAYOUT_COMPLEXITY_CONFIG[mod.layoutComplexity].labelFa.length > 0);
  }
});

test('validates Module 6 (Heat Equation & PDEs) comprehensive academic and engineering depth', () => {
  const heatMod = CURRICULUM_MODULES.find((m) => m.id === 'module_6_heat_pde');
  assert.ok(heatMod, 'Module 6 must exist');
  assert.equal(heatMod.subtopics.length, 7, 'Must have 7 comprehensive subtopics');
  assert.equal(heatMod.workedExamples.length, 7, 'Must have 7 fully expanded worked examples');
  assert.equal(heatMod.practiceQuestions.length, 8, 'Must have 8 high-level practice questions');

  // Verify all 7 worked examples have intermediate derivation steps
  for (const ex of heatMod.workedExamples) {
    assert.ok(ex.steps.length >= 4, `Example ${ex.id} must have at least 4 detailed steps`);
    assert.ok(ex.problemFormula.length > 0);
    assert.ok(ex.finalAnswerFormula.length > 0);
  }

  // Verify all subtopics have key formulas and conceptual points
  for (const sub of heatMod.subtopics) {
    assert.ok(sub.keyFormulas.length >= 2, `Subtopic ${sub.id} must have key formulas`);
    assert.ok(sub.conceptualPoints.length >= 1);
  }
});

test('validates comprehensive textbook lecture notes, common pitfalls, and engineering applications across all subtopics', () => {
  let totalSubtopicsCount = 0;
  for (const mod of CURRICULUM_MODULES) {
    for (const sub of mod.subtopics) {
      totalSubtopicsCount++;
      assert.ok(
        sub.detailedExplanation && sub.detailedExplanation.length >= 100,
        `Subtopic ${sub.id} in ${mod.id} must have a rich detailedExplanation (got ${sub.detailedExplanation?.length ?? 0} chars)`
      );
      assert.ok(
        sub.commonPitfalls && sub.commonPitfalls.length >= 2,
        `Subtopic ${sub.id} in ${mod.id} must have at least 2 common pitfalls`
      );
      assert.ok(
        sub.engineeringApplications && sub.engineeringApplications.length >= 2,
        `Subtopic ${sub.id} in ${mod.id} must have at least 2 engineering applications`
      );
    }
  }

  assert.equal(totalSubtopicsCount, 49, `Expected 49 total subtopics, found ${totalSubtopicsCount}`);
});

test('Parseval Fourier-integral identities hold numerically and lesson data carries correct constants', () => {
  // ── Numeric layer: exact Lorentzian identities via α = tan θ substitution ──
  // ∫₀^∞ dα/(a²+α²) = (1/a)∫₀^{π/2} cos²... ; general substitution α = a·tan θ
  const integrate = (g: (t: number) => number, n = 200000) => {
    // Simpson on [0, π/2]
    const h = Math.PI / 2 / n;
    let s = g(0) + g(Math.PI / 2);
    for (let i = 1; i < n; i++) s += g(i * h) * (i % 2 ? 4 : 2);
    return (s * h) / 3;
  };
  const forA = (a: number, weight: (sin2: number, cos2: number) => number) =>
    integrate((t) => weight(Math.sin(t) ** 2, Math.cos(t) ** 2)) / a;

  assert.ok(
    Math.abs(forA(2, () => 1) - Math.PI / 4) < 1e-9,
    '∫₀^∞ dα/(a²+α²) must equal π/(2a) — a=2 gives π/4 (α = a·tanθ makes the integrand constant)'
  );
  assert.ok(
    Math.abs(forA(1, (_s, c) => c) - Math.PI / 4) < 1e-9,
    '∫₀^∞ dα/(1+α²)² must equal π/4 (a=1; the substituted integrand is cos²θ)'
  );
  assert.ok(
    Math.abs(forA(2, (s) => s) - Math.PI / 8) < 1e-9,
    '∫₀^∞ α²dα/(a²+α²)² must equal π/(4a) — a=2 gives π/8'
  );

  // ── Data layer: the lesson must state the correct Parseval constants ──
  const mod3 = CURRICULUM_MODULES.find((m) => m.id === 'module_3_fourier_integral')!;
  const parseval = mod3.subtopics.find((s) => s.id === 'm3_5_parseval_fourier_integral')!;

  // general form: 1/π on the LHS, A²+B² on the right
  assert.ok(
    parseval.keyFormulas.some((kf) =>
      kf.formula.includes('\\frac{1}{\\pi} \\int_{-\\infty}^{\\infty} |f(x)|^2') &&
      kf.formula.includes('A^2(\\alpha) + B^2(\\alpha)')
    ),
    'general Parseval form (1/π)∫f² = ∫(A²+B²) must be present'
  );
  // Plancherel / transform form present
  assert.ok(
    parseval.keyFormulas.some((kf) => kf.formula.includes('\\frac{1}{2\\pi}')),
    'transform-form Parseval (1/2π)∫|F|² must be present'
  );
  // Lorentzian quartic integrals present with the verified values
  assert.ok(
    parseval.keyFormulas.some((kf) => kf.formula.includes('\\frac{\\pi}{4a^3}')),
    '∫dα/(a²+α²)² = π/(4a³) must be stated'
  );

  // The textbook note must carry the corrected constants (no wrong "dx = 1/π∫…")
  const note = TEXTBOOK_NOTES['m3_5_parseval_fourier_integral'];
  assert.ok(note, 'textbook note for m3_5 must exist');
  assert.ok(
    note.detailedExplanation.includes('\\int f^2 dx = \\pi\\int'),
    'note must state ∫f² = π∫(A²+B²) (correct π factor)'
  );
  assert.ok(
    !note.detailedExplanation.includes('dx = \\frac{1}{\\pi}\\int'),
    'the wrong constant (∫f² = (1/π)∫(A²+B²)) must not reappear'
  );
});


