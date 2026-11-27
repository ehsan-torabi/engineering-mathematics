import test from 'node:test';
import assert from 'node:assert/strict';
import katex from 'katex';
import { normalizeToLatex } from './normalize-latex.ts';
import { CURRICULUM_MODULES, MODULE_ENRICHMENT } from './curriculum-data.ts';
import { TEXTBOOK_NOTES } from './textbook-notes.ts';

/**
 * Curriculum-wide renderability gate (same spirit as the exam bank's
 * KaTeX check): every display formula and every inline $...$ segment the
 * lesson reader, examples deck, quiz and formula bank show must survive
 * the exact pipeline the UI uses — normalizeToLatex → katex.renderToString.
 * The UI renders with throwOnError:false, which paints errors in red
 * instead of throwing, so both the thrown and the painted forms are caught.
 */

const DISPLAY_FORMULA_KEYS = new Set(['formula', 'problemFormula', 'finalAnswerFormula']);

function render(latex: string, label: string, display: boolean): void {
  const clean = normalizeToLatex(latex);
  assert.doesNotThrow(
    () => katex.renderToString(clean, { displayMode: display, strict: false, throwOnError: true }),
    `${label}: KaTeX threw for «${latex.slice(0, 80)}»`
  );
  const html = katex.renderToString(clean, {
    displayMode: display,
    strict: false,
    throwOnError: false,
  });
  assert.ok(!html.includes('katex-error'), `${label}: rendered as a KaTeX error «${latex.slice(0, 80)}»`);
}

/** Walks the data graph and checks every math-bearing string in place. */
function walk(node: unknown, key: string | undefined, path: string, stats: { display: number; inline: number }): void {
  if (typeof node === 'string') {
    const label = path;
    if (key && DISPLAY_FORMULA_KEYS.has(key)) {
      // Display formulas carry no $ delimiters of their own
      assert.ok(!node.includes('$'), `${label}: display formula must not contain $ delimiters`);
      render(node, label, true);
      stats.display++;
      return;
    }
    const dollars = (node.match(/\$/g) ?? []).length;
    assert.equal(dollars % 2, 0, `${label}: unbalanced $ delimiters (${dollars})`);
    if (dollars === 0) return;
    // MathText splits with (\$[^$]+\$) — a segment can never span lines
    const segments = node.match(/\$[^$]+\$/g) ?? [];
    assert.equal(segments.length, dollars / 2, `${label}: adjacent/empty $ segments`);
    for (const seg of segments) {
      assert.ok(!seg.includes('\n'), `${label}: inline math spans multiple lines «${seg.slice(0, 60)}»`);
      // normalizeToLatex collapses "\\X" → "\X": a row break glued to a letter is destroyed
      assert.ok(!/\\\\[A-Za-z]/.test(seg), `${label}: row break glued to a letter «${seg.slice(0, 60)}»`);
      render(seg.slice(1, -1), label, false);
      stats.inline++;
    }
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((child, i) => walk(child, key, `${path}[${i}]`, stats));
    return;
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      walk(v, k, path ? `${path}.${k}` : k, stats);
    }
  }
}

test('curriculum · every display formula and inline math segment renders in KaTeX', () => {
  const stats = { display: 0, inline: 0 };
  for (const mod of CURRICULUM_MODULES) {
    walk(mod, undefined, mod.id, stats);
  }
  walk(MODULE_ENRICHMENT, undefined, 'MODULE_ENRICHMENT', stats);
  for (const [id, note] of Object.entries(TEXTBOOK_NOTES)) {
    walk(note, undefined, `TEXTBOOK_NOTES.${id}`, stats);
  }
  assert.ok(stats.display > 350, `expected hundreds of display formulas, got ${stats.display}`);
  assert.ok(stats.inline > 1000, `expected thousands of inline segments, got ${stats.inline}`);
});

test('curriculum · row breaks inside display formulas are never glued to a letter', () => {
  for (const mod of CURRICULUM_MODULES) {
    for (const sub of mod.subtopics) {
      sub.keyFormulas.forEach((kf, i) => {
        assert.ok(
          !/\\\\[A-Za-z]/.test(kf.formula),
          `${mod.id}/${sub.id} keyFormulas[${i}]: "\\\\" glued to a letter is collapsed by normalizeToLatex`
        );
      });
    }
    for (const ex of mod.workedExamples) {
      [ex.problemFormula, ex.finalAnswerFormula, ...ex.steps.map((s) => s.formula)].forEach((f, i) => {
        assert.ok(!/\\\\[A-Za-z]/.test(f), `${mod.id}/${ex.id} formula[${i}]: "\\\\" glued to a letter`);
      });
    }
  }
});
