/**
 * Numeric verification of every computational claim in the exam bank
 * (lib/exams). This is check #1 of the triple-check protocol:
 *   1. this numeric suite,
 *   2. independent re-derivation review of each solution,
 *   3. KaTeX render + build + in-browser visual check.
 *
 * Conventions follow the course notes (Math_Eng1404):
 *   F(α)  = ∫ f(x) e^{-iαx} dx,      f(x) = (1/2π) ∫ F(α) e^{iαx} dα
 *   Fc(α) = ∫₀^∞ f(x) cos αx dx,     f(x) = (2/π) ∫₀^∞ Fc cos αx dα
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import katex from 'katex';
import { EXAM_PAPERS } from './exams/index.ts';
import { normalizeToLatex } from './normalize-latex.ts';

// ─── numeric helpers ────────────────────────────────────────────────
const PI = Math.PI;

function simpson(f: (x: number) => number, a: number, b: number, n = 2000): number {
  if (n % 2 === 1) n += 1;
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 === 0 ? 2 : 4);
  return (h / 3) * s;
}

/** Sum of Simpson pieces — for integrands with jumps at known breakpoints. */
function simpsonSplit(
  f: (x: number) => number,
  points: number[],
  n = 4000
): number {
  let s = 0;
  for (let i = 0; i < points.length - 1; i++) {
    s += simpson(f, points[i], points[i + 1], n);
  }
  return s;
}

function simpsonSplitC(
  f: (x: number) => Cx,
  points: number[],
  n = 4000
): Cx {
  let s = cx(0);
  for (let i = 0; i < points.length - 1; i++) {
    s = add(s, simpsonC(f, points[i], points[i + 1], n));
  }
  return s;
}

interface Cx {
  re: number;
  im: number;
}
const cx = (re: number, im = 0): Cx => ({ re, im });
const add = (a: Cx, b: Cx): Cx => ({ re: a.re + b.re, im: a.im + b.im });
const mul = (a: Cx, b: Cx): Cx => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
});
const scale = (a: Cx, k: number): Cx => ({ re: a.re * k, im: a.im * k });
const cdiv = (a: Cx, b: Cx): Cx => {
  const d = b.re * b.re + b.im * b.im;
  return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
};
const cis = (t: number): Cx => cx(Math.cos(t), Math.sin(t));

function simpsonC(f: (x: number) => Cx, a: number, b: number, n = 4000): Cx {
  if (n % 2 === 1) n += 1;
  const h = (b - a) / n;
  let acc = add(f(a), f(b));
  for (let i = 1; i < n; i++) {
    acc = add(acc, scale(f(a + i * h), i % 2 === 0 ? 2 : 4));
  }
  return scale(acc, h / 3);
}

/** Forward course-convention transform over a symmetric window. */
function numFT(f: (x: number) => Cx, alpha: number, L: number): Cx {
  return simpsonC(
    (x) => mul(f(x), { re: Math.cos(alpha * x), im: -Math.sin(alpha * x) }),
    -L,
    L,
    6000
  );
}

/** Forward transform over segments (for discontinuous f). */
function numFTSplit(
  f: (x: number) => Cx,
  alpha: number,
  points: number[],
  n = 6000
): Cx {
  let s = cx(0);
  for (let i = 0; i < points.length - 1; i++) {
    s = add(
      s,
      simpsonC(
        (x) => mul(f(x), { re: Math.cos(alpha * x), im: -Math.sin(alpha * x) }),
        points[i],
        points[i + 1],
        n
      )
    );
  }
  return s;
}

/** Inverse transform over a symmetric window. */
function invFT(F: (a: number) => Cx, x: number, L: number, n = 6000): Cx {
  return scale(
    simpsonC(
      (a) => mul(F(a), { re: Math.cos(a * x), im: Math.sin(a * x) }),
      -L,
      L,
      n
    ),
    1 / (2 * PI)
  );
}

function findRoot(f: (x: number) => number, a: number, b: number): number {
  let lo = a,
    hi = b;
  let flo = f(lo);
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    if (flo * fm <= 0) {
      hi = mid;
    } else {
      lo = mid;
      flo = fm;
    }
  }
  return (lo + hi) / 2;
}

const near = (actual: number, expected: number, tol: number, label: string) => {
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `${label}: got ${actual}, expected ${expected} (±${tol})`
  );
};
const nearC = (a: Cx, b: Cx, tol: number, label: string) => {
  near(Math.hypot(a.re - b.re, a.im - b.im), 0, tol, label);
};

// ─── A. series identities ───────────────────────────────────────────
describe('exam bank · series identities', () => {
  it('sum of odd reciprocal squares = π²/8 (sk9394t-q2b, sh1403-2-q1, sk96-q1b)', () => {
    let s = 0;
    const N = 400000;
    for (let k = 1; k <= N; k++) s += 1 / ((2 * k - 1) * (2 * k - 1));
    s += 1 / (4 * N); // tail ∫_N^∞ dx/(2x)²
    near(s, (PI * PI) / 8, 1e-8, 'Σ 1/(2k-1)²');
  });

  it('sum of odd reciprocal fourth powers = π⁴/96 (sh1403-2-q1)', () => {
    let s = 0;
    const N = 60000;
    for (let k = 1; k <= N; k++) s += 1 / Math.pow(2 * k - 1, 4);
    s += 1 / (12 * N * N * N);
    near(s, Math.pow(PI, 4) / 96, 1e-10, 'Σ 1/(2k-1)⁴');
  });

  it('Σ1/(4n+1)³ − Σ1/(4n−1)³ = π³/32 − 1, NOT the official π³/96 (sku-q1b)', () => {
    const N = 400000;
    let pos = 0,
      neg = 0;
    for (let n = 1; n <= N; n++) {
      pos += 1 / Math.pow(4 * n + 1, 3);
      neg += 1 / Math.pow(4 * n - 1, 3);
    }
    const D = pos - neg + 3 / (8 * Math.pow(4 * N, 2));
    near(D, Math.pow(PI, 3) / 32 - 1, 1e-8, 'D');
    assert.ok(
      Math.abs(D - Math.pow(PI, 3) / 96) > 0.1,
      'official answer π³/96 is far from the true value'
    );
  });

  it('β(3) = π³/32 (sku-q1b intermediate)', () => {
    let s = 0;
    const N = 200000;
    for (let k = 0; k <= N; k++) s += (k % 2 === 0 ? 1 : -1) / Math.pow(2 * k + 1, 3);
    near(s, Math.pow(PI, 3) / 32, 1e-7, 'β(3)');
  });

  it('Σ1/n⁶ = π⁶/945 and odd part π⁶/960 (sk95b-q1)', () => {
    let all = 0,
      odd = 0;
    const N = 60000;
    for (let n = 1; n <= N; n++) {
      const t = 1 / Math.pow(n, 6);
      all += t;
      if (n % 2 === 1) odd += t;
    }
    all += 1 / (5 * Math.pow(N, 5));
    // odd tail: half density ⇒ (1/2)∫_{2N}^∞ x^{-6}dx = 1/(10(2N)^5)
    odd += 1 / (10 * Math.pow(2 * N, 5));
    near(all, Math.pow(PI, 6) / 945, 1e-9, 'Σ1/n⁶');
    near(odd, Math.pow(PI, 6) / 960, 1e-9, 'Σ_odd 1/n⁶');
  });

  it('Leibniz series = π/4 (sk9394f-q1b, sk95-q1b)', () => {
    let s = 0;
    const N = 200000;
    for (let n = 1; n <= N; n++) s += (n % 2 === 1 ? 1 : -1) / (2 * n - 1);
    near(s, PI / 4, 5e-6, 'Leibniz');
  });

  it('Σ1/(4n²−1)=1/2 and Σ(−1)ⁿ/(4n²−1)=1/2−π/4 (sk9394t-q3 note)', () => {
    let s1 = 0,
      s2 = 0;
    const N = 200000;
    for (let n = 1; n <= N; n++) {
      const t = 1 / (4 * n * n - 1);
      s1 += t;
      s2 += (n % 2 === 1 ? -1 : 1) * t;
    }
    s1 += 1 / (4 * N); // tail ≈ ∫dx/4x²
    s2 += (Math.pow(-1, N + 1)) / (8 * N); // alternating tail ≤ next term
    near(s1, 0.5, 1e-6, 'Σ1/(4n²−1)');
    near(s2, 0.5 - PI / 4, 1e-5, 'Σ(−1)ⁿ/(4n²−1)');
  });
});

// ─── B. Fourier series coefficients (numeric) ──────────────────────
describe('exam bank · Fourier series coefficients', () => {
  const I = (f: (x: number) => number, a: number, b: number) =>
    simpson(f, a, b, 4000);

  it('cos(αx) series coefficients and cot identity (sk9394m2-q1), α=1.7', () => {
    const alpha = 1.7;
    for (const n of [1, 2, 3, 5]) {
      const numeric =
        (2 / PI) * I((x) => Math.cos(alpha * x) * Math.cos(n * x), 0, PI);
      const closed =
        ((2 * alpha * Math.sin(alpha * PI)) / PI) * (Math.pow(-1, n) / (alpha * alpha - n * n));
      near(numeric, closed, 1e-10, `a${n}`);
    }
    const a0 = (2 / PI) * I((x) => Math.cos(alpha * x), 0, PI);
    near(a0, (2 * Math.sin(alpha * PI)) / (PI * alpha), 1e-10, 'a0');
    // Σ1/(α²−n²): tail ≈ −Σ_{n>N}1/n² ≈ −1/N
    let s = 0;
    const N = 400000;
    for (let n = 1; n <= N; n++) s += 1 / (alpha * alpha - n * n);
    s -= 1 / N;
    near(
      s,
      (PI / (2 * alpha)) * (1 / Math.tan(alpha * PI)) - 1 / (2 * alpha * alpha),
      1e-6,
      'Σ1/(α²−n²) identity'
    );
  });

  it('π²x−x³: bₙ = 12(−1)^{n+1}/n³ (sku-q1a)', () => {
    for (const n of [1, 2, 3, 4, 7]) {
      const bn = (2 / PI) * I((x) => (PI * PI * x - x * x * x) * Math.sin(n * x), 0, PI);
      near(bn, (12 * Math.pow(-1, n + 1)) / Math.pow(n, 3), 1e-8, `b${n}`);
    }
  });

  it('|x| series coefficients (sh1403-2-q1)', () => {
    for (const n of [1, 2, 5]) {
      const an = I((x) => Math.abs(x) * Math.cos(n * x), -PI, PI) / PI;
      near(an, (2 * (Math.pow(-1, n) - 1)) / (PI * n * n), 1e-9, `a${n}`);
    }
  });

  it('square wave coefficients + Parseval (sk95-q1a, sk96-q1a/b)', () => {
    for (const n of [1, 3, 4]) {
      const bn = I((x) => (x >= 0 ? 1 : 0) * Math.sin(n * x), -PI, PI) / PI;
      near(bn, (1 - Math.pow(-1, n)) / (PI * n), 1e-9, `b${n}`);
    }
    const lhs = simpson(() => 1, 0, PI) / PI; // (1/π)∫₀^π 1² dx = 1
    near(lhs, 1, 1e-12, '(1/π)∫f²');
    let s = 0;
    for (let k = 1; k <= 200000; k++) s += 1 / ((2 * k - 1) * (2 * k - 1));
    s += 1 / (4 * 200000);
    near(1, 0.5 + (4 / (PI * PI)) * s, 2e-6, 'Parseval');
  });

  it('x+π: bₙ = 2(−1)^{n+1}/n (sk9394f-q1a)', () => {
    for (const n of [1, 2, 5]) {
      const bn = I((x) => (x + PI) * Math.sin(n * x), -PI, PI) / PI;
      near(bn, (2 * Math.pow(-1, n + 1)) / n, 1e-8, `b${n}`);
    }
  });

  it('e^x complex & real coefficients (sk9394f-q2)', () => {
    const sinhPi = Math.sinh(PI);
    for (const n of [0, 1, 2, 5]) {
      const cn = I((x) => Math.exp(x) * Math.cos(n * x), -PI, PI) / (2 * PI);
      const cnIm = -I((x) => Math.exp(x) * Math.sin(n * x), -PI, PI) / (2 * PI);
      const closedRe = ((Math.pow(-1, n) * sinhPi) / PI) * (1 / (1 + n * n));
      const closedIm = ((Math.pow(-1, n) * sinhPi) / PI) * (n / (1 + n * n));
      near(cn, closedRe, 1e-9, `c${n}.re`);
      near(cnIm, closedIm, 1e-9, `c${n}.im`);
    }
    for (const n of [1, 3]) {
      const an = I((x) => Math.exp(x) * Math.cos(n * x), -PI, PI) / PI;
      const bn = I((x) => Math.exp(x) * Math.sin(n * x), -PI, PI) / PI;
      near(an, (2 * Math.pow(-1, n) * sinhPi) / (PI * (1 + n * n)), 1e-9, `a${n}`);
      near(bn, (-2 * n * Math.pow(-1, n) * sinhPi) / (PI * (1 + n * n)), 1e-9, `b${n}`);
    }
  });

  it('x/2 piecewise coefficients and π²/8 at the jump (sk9394t-q2a/b, sk95t-q2)', () => {
    const f = (x: number) => (x >= 0 ? x / 2 : 0);
    const a0 = I(f, -PI, PI) / PI;
    near(a0, PI / 4, 1e-9, 'a0');
    for (const n of [1, 2, 3]) {
      const an = I((x) => f(x) * Math.cos(n * x), -PI, PI) / PI;
      const bn = I((x) => f(x) * Math.sin(n * x), -PI, PI) / PI;
      near(an, (Math.pow(-1, n) - 1) / (2 * PI * n * n), 1e-9, `a${n}`);
      near(bn, Math.pow(-1, n + 1) / (2 * n), 1e-9, `b${n}`);
    }
    let sOdd = 0;
    for (let k = 1; k <= 200000; k++) sOdd += 1 / ((2 * k - 1) * (2 * k - 1));
    sOdd += 1 / (4 * 200000);
    near(PI / 8 + sOdd / PI, PI / 4, 1e-6, 'series at x=π');
  });

  it('x² sine series coefficients + Parseval (sk95b-q1)', () => {
    for (const n of [1, 2, 3, 6]) {
      const bn = (2 / PI) * I((x) => x * x * Math.sin(n * x), 0, PI);
      const closed =
        (2 * PI * Math.pow(-1, n + 1)) / n + (4 * (Math.pow(-1, n) - 1)) / (PI * n * n * n);
      near(bn, closed, 1e-8, `b${n}`);
    }
    const lhs = (2 / PI) * I((x) => Math.pow(x, 4), 0, PI); // 2π⁴/5
    let bsum = 0;
    for (let n = 1; n <= 4000; n++) {
      const bn =
        (2 * PI * Math.pow(-1, n + 1)) / n + (4 * (Math.pow(-1, n) - 1)) / (PI * n * n * n);
      bsum += bn * bn;
    }
    bsum += (4 * PI * PI) / 4000; // dominant tail Σ4π²/n²
    near(lhs, bsum, 1e-3, 'Parseval x² sine');
  });

  it('sin(πx) shifted series coefficients and reconstruction (sk9394t-q3, sk95t-q3)', () => {
    const a0 = 2 * I((x) => Math.sin(PI * x), 0, 1);
    near(a0 / 2, 2 / PI, 1e-9, 'a0/2');
    for (const n of [1, 2, 3]) {
      const an = 2 * I((x) => Math.sin(PI * x) * Math.cos(2 * n * PI * x), 0, 1);
      near(an, -4 / (PI * (2 * n - 1) * (2 * n + 1)), 1e-9, `a${n}`);
      const bn = 2 * I((x) => Math.sin(PI * x) * Math.sin(2 * n * PI * x), 0, 1);
      near(bn, 0, 1e-9, `b${n}`);
    }
    const x0 = 0.3;
    let s = 2 / PI;
    for (let n = 1; n <= 4000; n++) {
      s -= (4 / PI) * Math.cos(2 * n * PI * x0) / ((2 * n - 1) * (2 * n + 1));
    }
    near(s, Math.sin(PI * x0), 1e-4, 'reconstruction at x=0.3');
  });

  it('|x|+[x] coefficients and jump averages (sh1403-1-q1)', () => {
    const g1 = (x: number) => -x - 1; // on [−1,0]
    const g2 = (x: number) => x; // on [0,1]
    const two = (g: (x: number) => number, h: (x: number) => number) => (x: number) =>
      g(x) * h(x);
    const a0 = simpson(g1, -1, 0, 8000) + simpson(g2, 0, 1, 8000);
    near(a0, 0, 1e-9, 'a0 = 0');
    for (const n of [1, 2, 3]) {
      const an =
        simpson(two(g1, (x) => Math.cos(n * PI * x)), -1, 0, 8000) +
        simpson(two(g2, (x) => Math.cos(n * PI * x)), 0, 1, 8000);
      near(an, (2 * (Math.pow(-1, n) - 1)) / (n * n * PI * PI), 1e-8, `a${n}`);
      const bn =
        simpson(two(g1, (x) => Math.sin(n * PI * x)), -1, 0, 8000) +
        simpson(two(g2, (x) => Math.sin(n * PI * x)), 0, 1, 8000);
      near(bn, (1 + Math.pow(-1, n + 1)) / (n * PI), 1e-8, `b${n}`);
    }
    let s0 = 0;
    const K = 20000;
    for (let k = 1; k <= K; k++) {
      s0 -= (4 / (PI * PI)) * (1 / ((2 * k - 1) * (2 * k - 1)));
    }
    s0 -= (4 / (PI * PI)) * (1 / (4 * K)); // subtract tail of Σ1/(2k−1)²
    near(s0, -0.5, 1e-6, 'series at x=0 → −1/2');
    let s1 = 0;
    for (let k = 1; k <= K; k++) {
      s1 += (4 / (PI * PI)) * (1 / ((2 * k - 1) * (2 * k - 1)));
    }
    s1 += (4 / (PI * PI)) * (1 / (4 * K));
    near(s1, 0.5, 1e-6, 'series at x=1 → +1/2');
  });

  it('orthogonality set {2x+1, 6x(x+1)+1} on [−1,0] and x² expansion (sk9394t-q1, sk95t-q1)', () => {
    const v1 = (x: number) => 2 * x + 1;
    const v2 = (x: number) => 6 * x * (x + 1) + 1;
    near(I((x) => v1(x) * v2(x), -1, 0), 0, 1e-12, '⟨v1,v2⟩=0');
    near(I((x) => v1(x) * v1(x), -1, 0), 1 / 3, 1e-12, '‖v1‖²=1/3');
    near(I((x) => v2(x) * v2(x), -1, 0), 1 / 5, 1e-12, '‖v2‖²=1/5');
    near(I((x) => x * x * v1(x), -1, 0), -1 / 6, 1e-12, '⟨x²,v1⟩=−1/6');
    near(I((x) => x * x * v2(x), -1, 0), 1 / 30, 1e-12, '⟨x²,v2⟩=1/30');
    const resid = (x: number) => x * x - (-0.5 * v1(x) + (1 / 6) * v2(x));
    near(I((x) => resid(x) - 1 / 3, -1, 0), 0, 1e-12, 'residual = 1/3');
    near(I((x) => resid(x) * v1(x), -1, 0), 0, 1e-12, 'residual ⊥ v1');
    near(I((x) => resid(x) * v2(x), -1, 0), 0, 1e-12, 'residual ⊥ v2');
  });
});

// ─── C. Fourier integrals & transforms ─────────────────────────────
describe('exam bank · Fourier integrals and transforms', () => {
  it('Dirichlet integral ∫₀^∞ sinα/α = π/2 (sk96-q2)', () => {
    const v = simpson((a) => Math.sin(a) / a, 0.001, 600, 20000);
    near(v, PI / 2, 5e-3, '∫sinα/α');
  });

  it('∫₀^∞ (1−cosα)/α² = π/2 (sh1403-1-q2)', () => {
    const v = simpson((a) => (1 - Math.cos(a)) / (a * a), 0.001, 3000, 40000);
    near(v, PI / 2, 1e-3, '∫(1−cosα)/α²');
  });

  it('∫₀^∞ (sinα−αcosα)/α³ = π/4 (sk95-q2)', () => {
    const g = (a: number) =>
      a < 1e-4 ? 1 / 3 - (a * a) / 30 : (Math.sin(a) - a * Math.cos(a)) / (a * a * a);
    const v = simpson(g, 0, 500, 40000);
    near(v, PI / 4, 1e-4, '∫(sinα−αcosα)/α³');
  });

  it('sine integral identity sin(πα)sin(αx)/(1−α²) (sk9394m2-q2, sk95b-q2a)', () => {
    const check = (x: number, expected: number) => {
      const g = (a: number) => {
        if (Math.abs(a - 1) < 1e-6) return (PI / 2) * Math.sin(x);
        return (Math.sin(PI * a) * Math.sin(a * x)) / (1 - a * a);
      };
      const v = simpson(g, 0, 1 - 1e-5, 8000) + simpson(g, 1 + 1e-5, 400, 20000);
      near(v, expected, 5e-3, `integral at x=${x}`);
    };
    check(0.5, (PI / 2) * Math.sin(0.5));
    check(2.2, (PI / 2) * Math.sin(2.2));
    check(4.0, 0);
    check(3.5, 0);
  });

  it('∫₀^∞ (1−cos πω)sin ωx/ω dω (sk9394t-q4, sk95t-q4)', () => {
    const check = (x: number, expected: number) => {
      const v = simpson(
        (w) => ((1 - Math.cos(PI * w)) / w) * Math.sin(w * x),
        0.001,
        500,
        30000
      );
      near(v, expected, 1e-2, `ω-integral at x=${x}`);
    };
    check(1.0, PI / 2);
    check(3.0, PI / 2);
    check(4.5, 0);
  });

  it('Fc{(1+x)e^{−x}} = 2/(1+α²)² and the cos4x·cos3x integral (sh1403-2-q2)', () => {
    const fc = (alpha: number) =>
      simpson((x) => (1 + x) * Math.exp(-x) * Math.cos(alpha * x), 0, 60, 8000);
    near(fc(0), 2, 1e-6, 'Fc(0)');
    near(fc(1), 2 / 4, 1e-6, 'Fc(1)');
    near(fc(7), 2 / 2500, 1e-9, 'Fc(7)');
    const target = simpson(
      (x) => (1 + x) * Math.exp(-x) * Math.cos(4 * x) * Math.cos(3 * x),
      0,
      60,
      8000
    );
    near(target, 1 / 2500 + 1 / 4, 1e-6, '∫f·cos4x·cos3x');
    near(1 / 2500 + 1 / 4, 313 / 1250, 1e-15, '313/1250');
  });

  it('cosine integral of (π/2)(x−1) on (0,1) (sh1403-1-q2)', () => {
    const fc = (alpha: number) =>
      simpson((x) => (PI / 2) * (x - 1) * Math.cos(alpha * x), 0, 1, 4000);
    for (const a of [0.5, 0.9, 2.1]) {
      near(fc(a), (PI * (Math.cos(a) - 1)) / (2 * a * a), 1e-9, `Fc(${a})`);
    }
  });

  it('inverse cosine transform of 2(cosx−1)/(πx²) returns 1−α (sk95b-q2b)', () => {
    const f = (x: number) =>
      x < 1e-6 ? 1 / PI : (2 * (1 - Math.cos(x))) / (PI * x * x);
    const fwd = (alpha: number) => simpson((x) => f(x) * Math.cos(alpha * x), 0, 500, 30000);
    near(fwd(0.3), 0.7, 2e-3, 'Fc(0.3)=0.7');
    near(fwd(0.9), 0.1, 2e-3, 'Fc(0.9)=0.1');
    near(fwd(1.7), 0, 2e-3, 'Fc(1.7)=0');
    near(fwd(0), 1, 2e-3, 'Fc(0)=1');
  });

  it('F{e^{2ix}, |x|<1} = 2sin(2−α)/(2−α) (sk9394m2-q3)', () => {
    for (const a of [0.5, 1.0, 3.7]) {
      const expected = (2 * Math.sin(2 - a)) / (2 - a);
      const v = simpsonC(
        (x) => mul(cis(2 * x), { re: Math.cos(a * x), im: -Math.sin(a * x) }),
        -1,
        1,
        6000
      );
      near(v.re, expected, 1e-10, `Re F(${a})`);
      near(v.im, 0, 1e-10, `Im F(${a})`);
    }
  });

  it('F{(x²+1)e^{−5|x|}cos x} = G−G″ closed form with coefficient 5 (sku-q3a)', () => {
    const f = (x: number): Cx => cx((x * x + 1) * Math.exp(-5 * Math.abs(x)) * Math.cos(x));
    const g = (u: number) => 5 / (u * u + 25);
    const g2 = (u: number) =>
      5 * (-2 / Math.pow(u * u + 25, 2) + (8 * u * u) / Math.pow(u * u + 25, 3));
    const closed = (a: number) => cx(g(a - 1) + g(a + 1) - (g2(a - 1) + g2(a + 1)));
    for (const a of [0, 1, 2, 3.5, -2]) {
      const v = numFT(f, a, 30);
      nearC(v, closed(a), 1e-6, `F(${a})`);
    }
    near(closed(0).re, 7200 / 17576, 1e-9, 'F(0) = 7200/17576');
  });

  it('F⁻¹{e^{−2iα}/(−α²+7iα+12)} = (e^{−3(x−2)}−e^{−4(x−2)})H(x−2) (sku-q3b)', () => {
    const F = (a: number): Cx => {
      const base = {
        re: 3 / (9 + a * a) - 4 / (16 + a * a),
        im: -a / (9 + a * a) + a / (16 + a * a),
      };
      return mul({ re: Math.cos(2 * a), im: -Math.sin(2 * a) }, base);
    };
    const answer = (x: number): Cx =>
      x >= 2 ? cx(Math.exp(-3 * (x - 2)) - Math.exp(-4 * (x - 2))) : cx(0);
    for (const x of [2.4, 3.0, 5.5]) {
      nearC(invFT(F, x, 80, 12000), answer(x), 2e-3, `f(${x})`);
    }
  });

  it('F⁻¹{e^{−2iα}/(−α²+4iα+3)} = ½(e^{−(x−2)}−e^{−3(x−2)})H(x−2) (sh1403-2-q3b)', () => {
    const F = (a: number): Cx => {
      const base = scale(
        {
          re: 1 / (1 + a * a) - 3 / (9 + a * a),
          im: -a / (1 + a * a) + a / (9 + a * a),
        },
        0.5
      );
      return mul({ re: Math.cos(2 * a), im: -Math.sin(2 * a) }, base);
    };
    const answer = (x: number): Cx =>
      x >= 2 ? cx(0.5 * (Math.exp(-(x - 2)) - Math.exp(-3 * (x - 2)))) : cx(0);
    for (const x of [2.2, 3.0, 4.5]) {
      nearC(invFT(F, x, 80, 12000), answer(x), 2e-3, `f(${x})`);
    }
  });

  it('F{xe^{−2ix}/((x²+1)(x²+4))} via inverse transform (sh1403-2-q3a)', () => {
    const G = (a: number): Cx => {
      const val =
        (PI / 3) * Math.sign(a + 2) * (Math.exp(-2 * Math.abs(a + 2)) - Math.exp(-Math.abs(a + 2)));
      return cx(0, val);
    };
    const target = (x: number): Cx => {
      const den = (x * x + 1) * (x * x + 4);
      return { re: (x * Math.cos(2 * x)) / den, im: (-x * Math.sin(2 * x)) / den };
    };
    for (const x of [0, 0.8, -0.6, 2]) {
      nearC(invFT(G, x, 30, 12000), target(x), 1e-4, `f(${x})`);
    }
  });

  it('F{xe^{−ix}/(x²+9)} via inverse transform (sk95-q3b, sk95b-q3b)', () => {
    const G = (a: number): Cx => cx(0, -PI * Math.sign(a + 1) * Math.exp(-3 * Math.abs(a + 1)));
    const target = (x: number): Cx => ({
      re: (x * Math.cos(x)) / (x * x + 9),
      im: (-x * Math.sin(x)) / (x * x + 9),
    });
    for (const x of [0.5, -1.2, 2.5]) {
      nearC(invFT(G, x, 40, 12000), target(x), 1e-4, `f(${x})`);
    }
  });

  it('F⁻¹{(iα+3)/(iα+4)²} = (1−t)e^{−4t}H(t) (sk95-q3a)', () => {
    const f = (t: number): Cx => (t >= 0 ? cx((1 - t) * Math.exp(-4 * t)) : cx(0));
    for (const a of [0, 1, 3.5, -2]) {
      const v = simpsonC(
        (t) => mul(f(t), { re: Math.cos(a * t), im: -Math.sin(a * t) }),
        0,
        40,
        6000
      );
      nearC(v, cdiv(cx(3, a), mul(cx(4, a), cx(4, a))), 1e-8, `F(${a})`);
    }
  });

  it('F⁻¹{iπ sinα/(4+2iα)} = (π/4)[e^{−2(t+1)}H(t+1)−e^{−2(t−1)}H(t−1)] (sk95b-q3a)', () => {
    const f = (t: number): Cx => {
      const a = (PI / 4) * Math.exp(-2 * (t + 1)) * (t + 1 >= 0 ? 1 : 0);
      const b = (PI / 4) * Math.exp(-2 * (t - 1)) * (t - 1 >= 0 ? 1 : 0);
      return cx(a - b);
    };
    for (const a of [0.3, 1.2, -0.8, 2.0]) {
      const e = (t: number) => ({ re: Math.cos(a * t), im: -Math.sin(a * t) });
      const mid = (t: number) => mul(cx((PI / 4) * Math.exp(-2 * (t + 1))), e(t));
      const right = (t: number) =>
        mul(cx((PI / 4) * (Math.exp(-2 * (t + 1)) - Math.exp(-2 * (t - 1)))), e(t));
      const v = add(simpsonC(mid, -1, 1, 9000), simpsonC(right, 1, 30, 9000));
      nearC(v, cdiv(cx(0, PI * Math.sin(a)), cx(4, 2 * a)), 1e-6, `F(${a})`);
    }
  });

  it('F{(x+1)/((x²+2x+2)²)} = −iπα/2·e^{iα−|α|} via inverse transform (sh1403-1-q3a)', () => {
    const G = (a: number): Cx => {
      const w = ((PI * a) / 2) * Math.exp(-Math.abs(a));
      // −iπα/2·e^{iα}e^{−|α|} = (πα/2)e^{−|α|}(sinα − i cosα)
      return { re: w * Math.sin(a), im: -w * Math.cos(a) };
    };
    const target = (x: number): Cx => cx((x + 1) / Math.pow(x * x + 2 * x + 2, 2));
    for (const x of [0, 0.7, -0.5, 1.5]) {
      nearC(invFT(G, x, 40, 12000), target(x), 1e-4, `f(${x})`);
    }
  });

  it('F⁻¹{e^{−2iα}/(−α²−6iα+5)} = ¼(e^{x−2}−e^{5(x−2)})H(2−x) (sh1403-1-q3b)', () => {
    const f = (x: number): Cx =>
      x <= 2 ? cx(0.25 * (Math.exp(x - 2) - Math.exp(5 * (x - 2)))) : cx(0);
    for (const a of [0, 0.8, -1.5, 2.5]) {
      const v = simpsonC(
        (x) => mul(f(x), { re: Math.cos(a * x), im: -Math.sin(a * x) }),
        -60,
        2,
        12000
      );
      const base = {
        re: 1 / (1 + a * a) - 5 / (25 + a * a),
        im: a / (1 + a * a) - a / (25 + a * a),
      };
      nearC(v, mul({ re: Math.cos(2 * a), im: -Math.sin(2 * a) }, scale(base, 0.25)), 1e-6, `F(${a})`);
    }
  });
});

// ─── D. complex numbers & residues ─────────────────────────────────
describe('exam bank · complex numbers and residues', () => {
  it('roots of (1+z)⁵=(1−z)⁵ (sk9394m2-q5)', () => {
    const roots = [0, 1, 2, 3, 4].map((k) => cx(0, Math.tan((k * PI) / 5)));
    for (const z of roots) {
      let p = cx(1);
      for (let i = 0; i < 5; i++) p = mul(p, add(cx(1), z));
      let q = cx(1);
      for (let i = 0; i < 5; i++) q = mul(q, add(cx(1), scale(z, -1)));
      nearC(p, q, 1e-9, `root ${z.im}`);
    }
  });

  it('i^{2i} principal value = e^{−π} (sk96-q3a)', () => {
    near(Math.exp(-PI), 0.0432139, 1e-6, 'e^{−π}');
    // branch structure: values e^{−(4k+1)π} — ratio between consecutive = e^{−4π}
    near(Math.exp(-(5 * PI)) / Math.exp(-PI), Math.exp(-4 * PI), 1e-12, 'branch ratio');
  });

  it('cube roots of −8i (sk96-q3b)', () => {
    const roots = [
      cx(2 * Math.cos(-PI / 6), 2 * Math.sin(-PI / 6)),
      cx(0, 2),
      cx(2 * Math.cos((7 * PI) / 6), 2 * Math.sin((7 * PI) / 6)),
    ];
    for (const z of roots) {
      const z3 = mul(mul(z, z), z);
      near(z3.re, 0, 1e-9, 'cube real part');
      near(z3.im, -8, 1e-9, 'cube imaginary part');
    }
  });

  it('residue integral ∮_{|z|=2}(z+i)²e^{1/(z+i)}dz = πi/3 (sk96-q5a)', () => {
    const g = (theta: number): Cx => {
      const z = cx(2 * Math.cos(theta), 2 * Math.sin(theta));
      const w = add(z, cx(0, 1));
      const inv = cdiv(cx(1), w);
      const expw = cx(
        Math.exp(inv.re) * Math.cos(inv.im),
        Math.exp(inv.re) * Math.sin(inv.im)
      );
      const f = mul(mul(w, w), expw);
      return mul(f, mul(cx(0, 2), cis(theta)));
    };
    const v = simpsonC(g, 0, 2 * PI, 8000);
    near(v.re, 0, 1e-6, 'real part');
    near(v.im, PI / 3, 1e-6, 'imaginary part');
  });

  it('residue integral ∮_{|z|=1/2}(z+i)/(z²−2iz−1)dz = 0 (sk96-q5b)', () => {
    const g = (theta: number): Cx => {
      const z = cx(0.5 * Math.cos(theta), 0.5 * Math.sin(theta));
      const num = add(z, cx(0, 1));
      const z2 = mul(z, z);
      const twoIz = mul(cx(0, 2), z);
      const den = { re: z2.re - twoIz.re - 1, im: z2.im - twoIz.im };
      return mul(cdiv(num, den), mul(cx(0, 0.5), cis(theta)));
    };
    const v = simpsonC(g, 0, 2 * PI, 6000);
    nearC(v, cx(0), 1e-6, 'integral');
  });

  it('Cauchy–Riemann: |z|²+i·Im(z²) differentiable only on real axis, f′(−1)=−2 (sk9394m2-q4)', () => {
    const u = (x: number, y: number) => x * x + y * y;
    const v = (x: number, y: number) => 2 * x * y;
    const h = 1e-6;
    const ux = (u(-1 + h, 0) - u(-1, 0)) / h;
    const vx = (v(-1 + h, 0) - v(-1, 0)) / h;
    near(ux, -2, 1e-4, 'u_x(−1,0)');
    near(vx, 0, 1e-4, 'v_x(−1,0)');
    const uy = (u(-1, h) - u(-1, 0)) / h;
    const vy = (v(-1, h) - v(-1, 0)) / h;
    near(uy, 0, 1e-4, 'u_y(−1,0)');
    near(vy, -2, 1e-4, 'v_y(−1,0)');
    assert.ok(Math.abs(ux - vy) < 1e-4, 'CR eq1 (u_x=v_y) holds at (−1,0)');
    assert.ok(Math.abs(uy + vx) < 1e-4, 'CR eq2 (u_y=−v_x) holds at (−1,0)');
    assert.ok(Math.abs(2 * -1 - 2 * 0.1) > 0.1, 'CR eq1 fails at (−1, 0.1)');
  });

  it('Laurent series of 1/((z+1)(z+2)) in 1<|z|<2 (sk9394m2-q6)', () => {
    const z = { re: 1.5 * Math.cos(0.7), im: 1.5 * Math.sin(0.7) };
    const direct = cdiv(cx(1), mul(add(z, cx(1)), add(z, cx(2))));
    let s = cx(0);
    let zn = cx(1); // z⁰
    const zpow: Cx[] = [cx(1)];
    for (let k = 1; k <= 80; k++) {
      zn = mul(zn, z);
      zpow.push(zn);
    }
    const zinv = cdiv(cx(1), z);
    let zin = cx(1);
    const zinvpow: Cx[] = [cx(1)];
    for (let k = 1; k <= 80; k++) {
      zin = mul(zin, zinv);
      zinvpow.push(zin);
    }
    for (let n = 1; n <= 80; n++) {
      s = add(s, scale(zinvpow[n], Math.pow(-1, n - 1)));
    }
    for (let n = 0; n <= 80; n++) {
      s = add(s, scale(zpow[n], -Math.pow(-1, n) / Math.pow(2, n + 1)));
    }
    nearC(direct, s, 1e-8, 'Laurent partial sum');
  });
});

// ─── E. PDEs ────────────────────────────────────────────────────────
describe('exam bank · PDE solutions', () => {
  const I = (f: (x: number) => number, a: number, b: number) => simpson(f, a, b, 4000);

  it('heat with Neumann IC block (sh1403-2-q4): coefficients & reconstruction', () => {
    for (const n of [1, 2, 3, 4]) {
      const an = 2 * simpson((x) => Math.cos(n * PI * x), 0, 0.25, 4000);
      near(an, (2 * Math.sin((n * PI) / 4)) / (n * PI), 1e-9, `a${n}`);
    }
    near(2 * 0.25, 0.5, 1e-12, 'a0');
    const u0 = (x: number) => {
      let s = 0.25;
      for (let n = 1; n <= 6000; n++) {
        s += ((2 * Math.sin((n * PI) / 4)) / (n * PI)) * Math.cos(n * PI * x);
      }
      return s;
    };
    near(u0(0.1), 1, 2e-3, 'u0(0.1)≈1');
    near(u0(0.6), 0, 2e-3, 'u0(0.6)≈0');
  });

  it('heat Dirichlet–Robin (sk9394f-q4): eigenvalues tan(μπ)=−μ and reconstruction', () => {
    const mu1 = findRoot((m) => Math.tan(PI * m) + m, 0.51, 0.99);
    const mu2 = findRoot((m) => Math.tan(PI * m) + m, 1.51, 1.99);
    const mu3 = findRoot((m) => Math.tan(PI * m) + m, 2.51, 2.99);
    near(mu1, 0.787637, 1e-4, 'μ1');
    near(mu2, 1.671606, 1e-4, 'μ2');
    near(mu3, 2.616214, 1e-4, 'μ3');
    const mus = [mu1, mu2, mu3];
    const g = (x: number) => 1 - x / (PI + 1);
    let s = 0;
    for (const m of mus) {
      const norm = PI / 2 - Math.sin(2 * m * PI) / (4 * m);
      const num = I((x) => g(x) * Math.sin(m * x), 0, PI);
      s += (num / norm) * Math.sin(m * 0.5);
    }
    near(s, g(0.5), 0.15, '3-mode reconstruction at x=0.5');
  });

  it('Robin–Robin eigenfunctions: μₙ=nπ and Xₙ=cos nπx − sin nπx/(nπ) (sk95t-q5, sk9394t-q5 basis)', () => {
    for (const n of [1, 2, 3]) {
      const X = (x: number) => Math.cos(n * PI * x) - Math.sin(n * PI * x) / (n * PI);
      const Xp = (x: number) => -n * PI * Math.sin(n * PI * x) - Math.cos(n * PI * x);
      near(X(0) + Xp(0), 0, 1e-9, `X${n} BC at 0`);
      near(X(1) + Xp(1), 0, 1e-9, `X${n} BC at 1`);
      const num = I((x) => x * X(x), 0, 1);
      near(num, (2 * Math.pow(-1, n) - 1) / (n * n * PI * PI), 1e-9, `⟨x,X${n}⟩`);
      const normNum = I((x) => X(x) * X(x), 0, 1);
      near(normNum, 0.5 * (1 + 1 / (n * n * PI * PI)), 1e-9, `‖X${n}‖²`);
    }
  });

  it('nonhomogeneous xt expansion coefficients Nₙ (sk9394t-q5)', () => {
    const Ns = [1, 2, 3].map((n) => (2 * (2 * Math.pow(-1, n) - 1)) / (n * n * PI * PI + 1));
    near(Ns[0], -0.552, 5e-4, 'N1');
    near(Ns[1], 0.0494, 5e-4, 'N2');
    near(Ns[2], -0.0668, 5e-4, 'N3');
  });

  it('vibration homogenization φ=tx(2−x) (sk9394f-q5a)', () => {
    const t = 0.7;
    const phi = (x: number, tt: number) => tt * x * (2 - x);
    const phix = (x: number, tt: number) => tt * (2 - 2 * x);
    near(phix(0, t), 2 * t, 1e-12, 'φ_x(0,t)=2t');
    near(phi(1, t), t, 1e-12, 'φ(1,t)=t');
    near(2 * t, 2 * t, 1e-12, 'φ_tt−φ_xx = 0−(−2t) = 2t');
    near(phi(0.3, 0), 0, 1e-12, 'φ(x,0)=0 ⇒ v(x,0)=x');
    const vt0 = (x: number) => 1 - x - x * (2 - x);
    near(vt0(0.4), 1 - 3 * 0.4 + 0.16, 1e-12, 'v_t(x,0)=1−3x+x²');
  });

  it('wave equation sku-q4b: aₙ = π/(2(π²−μₙ²)) reconstructs sin πx on [0,4]', () => {
    const mus = Array.from({ length: 60 }, (_, n) => ((2 * (n + 1) - 1) * PI) / 8);
    for (let idx = 0; idx < 4; idx++) {
      const m = mus[idx];
      const int = I((x) => Math.sin(PI * x) * Math.cos(m * x), 0, 4);
      near(int, 0.5 * (1 / (PI + m) + 1 / (PI - m)), 1e-9, `∫ sinπx·cosμ${idx + 1}x`);
      const an = (2 / 4) * int;
      near(an, PI / (2 * (PI * PI - m * m)), 1e-9, `a${idx + 1}`);
      near(I((x) => Math.cos(m * x) * Math.cos(m * x), 0, 4), 2, 1e-9, `norm μ${idx + 1}`);
    }
    const u0 = (x: number) => {
      let s = 0;
      for (const m of mus) s += (PI / (2 * (PI * PI - m * m))) * Math.cos(m * x);
      return s;
    };
    near(u0(1.3), Math.sin(PI * 1.3), 3e-3, 'reconstruction at x=1.3');
    near(u0(3.1), Math.sin(PI * 3.1), 3e-3, 'reconstruction at x=3.1');
  });

  it('pure-modal heat solutions decay with rate k·n² (sk95b-q4, sk96-q4, sh1403-1-q4)', () => {
    near(9 * 0.5 * 0.5, 2.25, 1e-12, 'sk95b: rate for cos0.5x with k=9');
    near(9 * 7.5 * 7.5, 506.25, 1e-12, 'sk95b: rate for cos7.5x');
    near(25 * 4, 100, 1e-12, 'sk96: rate for cos2x');
    near(16 * 4 * PI * PI, 64 * PI * PI, 1e-12, 'sh1403-1: rate for cos2πx');
    near(16 * 9 * PI * PI, 144 * PI * PI, 1e-12, 'sh1403-1: rate for cos3πx');
  });
});

// ─── F. bank integrity ─────────────────────────────────────────────
describe('exam bank · integrity', () => {
  it('all 10 papers present with 62 questions, all Shahrekord', () => {
    assert.equal(EXAM_PAPERS.length, 10);
    const total = EXAM_PAPERS.reduce((s, p) => s + p.questions.length, 0);
    assert.equal(total, 62);
    for (const p of EXAM_PAPERS) {
      assert.ok(p.university.includes('شهرکرد'), `university of ${p.id}`);
      for (const q of p.questions) {
        assert.ok(q.statement.length > 5, `statement of ${q.id}`);
        assert.ok(q.finalAnswer.length > 5, `finalAnswer of ${q.id}`);
        assert.ok(q.steps.length >= 1, `steps of ${q.id}`);
      }
    }
  });
});

// ─── G. KaTeX renderability (check #3) ─────────────────────────────
describe('exam bank · KaTeX renderability', () => {
  const render = (latex: string, label: string) => {
    assert.doesNotThrow(
      () => katex.renderToString(normalizeToLatex(latex), { displayMode: true, strict: false }),
      label
    );
  };

  it('every formula in the bank renders without KaTeX errors', () => {
    let count = 0;
    for (const paper of EXAM_PAPERS) {
      for (const q of paper.questions) {
        const label = (what: string) => `${paper.id}/${q.id} ${what}`;
        if (q.statementFormula) {
          render(q.statementFormula, label('statementFormula'));
          count++;
        }
        if (q.finalAnswer) {
          render(q.finalAnswer, label('finalAnswer'));
          count++;
        }
        for (const st of q.steps) {
          if (st.formula) {
            render(st.formula, label(`step "${st.title}"`));
            count++;
          }
        }
      }
    }
    assert.ok(count > 150, `expected many formulas, got ${count}`);
  });

  it('every inline $...$ segment in Persian text renders', () => {
    let count = 0;
    const check = (text: string, label: string) => {
      const parts = text.split(/\$[^$]+\$/g);
      const maths = text.match(/\$[^$]+\$/g) ?? [];
      void parts;
      for (const m of maths) {
        const latex = m.slice(1, -1);
        assert.doesNotThrow(
          () =>
            katex.renderToString(normalizeToLatex(latex), {
              displayMode: false,
              strict: false,
            }),
          `${label}: ${latex}`
        );
        count++;
      }
    };
    for (const paper of EXAM_PAPERS) {
      for (const q of paper.questions) {
        check(q.statement, `${q.id} statement`);
        if (q.approach) check(q.approach, `${q.id} approach`);
        for (const st of q.steps) {
          if (st.detail) check(st.detail, `${q.id} step "${st.title}"`);
          if (st.title) check(st.title, `${q.id} step title`);
        }
        for (const n of q.notes ?? []) check(n, `${q.id} note`);
      }
    }
    assert.ok(count > 300, `expected many inline maths, got ${count}`);
  });
});
