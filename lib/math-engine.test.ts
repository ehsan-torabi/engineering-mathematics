import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  areOrthogonal,
  computeFunctionNorm,
  analyzeSymmetry,
  computeFourierSeries,
  evaluateFourierPartialSum,
  evaluateTransformPair,
  solveSturmLiouvilleCase,
  classifyPDE,
  evaluateHeatEquation1D,
  mathErf,
  mathErfc,
  evaluateFourierBoundaryTrig,
  evaluateCharacteristicODE,
  buildTabularDIModel,
  getAnalyticalFourierSeriesDetails,
  computeFourierConvergenceTrajectory,
  getAnalyticalFourierIntegralDetails,
  computeFourierIntegralConvergenceTrajectory,
  normalizeToLatex,
  MASTER_FOURIER_TRANSFORM_TABLE,
  STURM_LIOUVILLE_TABLE_4,
  computeSturmLiouvilleIntegratingFactorExample,
  computeSLEigenfunctionData,
  type PresetFunctionId,
  type FourierIntegralPresetId,
} from './math-engine.ts';
import {
  createInitialHistory,
  pushStroke,
  undoStroke,
  redoStroke,
  clearStrokes,
  createCoordinateAxisStrokes,
} from './scratchpad-utils.ts';
import {
  buildOpenAIChatCompletionsUrl,
  normalizeOpenAIBaseUrl,
  buildMathTutorSystemInstruction,
  parseMathMarkdownBlocks,
  DEFAULT_AI_SETTINGS,
} from './ai-settings.ts';

describe('Engineering Mathematics Pure Logic Engine', () => {
  it('verifies orthogonality and norms of trigonometric and Legendre basis functions (Lesson 1)', () => {
    // sin(x) and cos(x) are orthogonal on [-pi, pi]
    const trigOrtho = areOrthogonal(Math.sin, Math.cos, -Math.PI, Math.PI);
    assert.equal(trigOrtho.orthogonal, true);
    assert.ok(Math.abs(trigOrtho.innerProduct) < 1e-6);

    // Norm of sin(x) on [-pi, pi] is sqrt(pi)
    const sinNorm = computeFunctionNorm(Math.sin, -Math.PI, Math.PI);
    assert.ok(Math.abs(sinNorm - Math.sqrt(Math.PI)) < 1e-4);

    // Legendre polynomials P1(x) = x and P2(x) = 0.5*(3x^2 - 1) are orthogonal on [-1, 1]
    const p1 = (x: number) => x;
    const p2 = (x: number) => 0.5 * (3 * x * x - 1);
    const legOrtho = areOrthogonal(p1, p2, -1, 1);
    assert.equal(legOrtho.orthogonal, true);
  });

  it('correctly identifies Even, Odd, and General functions (Lesson 1)', () => {
    const evenRes = analyzeSymmetry((x) => x * x + Math.cos(x));
    assert.equal(evenRes.isEven, true);
    assert.equal(evenRes.isOdd, false);

    const oddRes = analyzeSymmetry((x) => x * x * x + Math.sin(x));
    assert.equal(oddRes.isOdd, true);
    assert.equal(oddRes.isEven, false);

    const genRes = analyzeSymmetry((x) => x + 1);
    assert.equal(genRes.isEven, false);
    assert.equal(genRes.isOdd, false);
  });

  it('computes accurate Fourier Series coefficients and satisfies Parseval Identity approximation (Lesson 2)', () => {
    // Square wave on [-pi, pi]: f(x) = -1 for x<0, +1 for x>0
    // Theoretical: a0 = 0, a_n = 0, b_n = 4/(n*pi) for odd n, 0 for even n
    const coeffs = computeFourierSeries({
      presetId: 'square',
      halfPeriodL: Math.PI,
      numHarmonicsN: 15,
      mode: 'full',
    });

    assert.ok(Math.abs(coeffs.a0) < 1e-6);
    assert.ok(Math.abs(coeffs.an[0]) < 1e-6);
    // b_1 = 4 / pi ≈ 1.2732395
    assert.ok(Math.abs(coeffs.bn[0] - 4 / Math.PI) < 1e-3);
    // b_2 = 0
    assert.ok(Math.abs(coeffs.bn[1]) < 1e-6);
    // b_3 = 4 / (3*pi)
    assert.ok(Math.abs(coeffs.bn[2] - 4 / (3 * Math.PI)) < 1e-3);

    // At x = pi/2, partial sum should be close to 1
    const valAtHalfPi = evaluateFourierPartialSum(coeffs, Math.PI / 2, Math.PI);
    assert.ok(Math.abs(valAtHalfPi - 1) < 0.08);

    // Parseval's RHS should approach LHS (which is 2 for unit square wave on [-pi, pi])
    assert.ok(Math.abs(coeffs.parsevalLHS - 2) < 1e-3);
    assert.ok(coeffs.parsevalRHS > 1.9 && coeffs.parsevalRHS <= coeffs.parsevalLHS + 1e-3);
  });

  it('evaluates Fourier Transform pairs accurately (Lessons 3 & 4)', () => {
    // Two-sided exponential f(x) = e^{-a|x|} with a=2 at alpha=0 => F(0) = 2a / a^2 = 2/a = 1
    const pairZero = evaluateTransformPair('two_sided_exp', 0, 2);
    assert.ok(Math.abs(pairZero.absFAlpha - 1.0) < 1e-6);
    assert.ok(Math.abs(pairZero.fx - 1.0) < 1e-6);

    // Gaussian f(x) = e^{-x^2} (a=1) at alpha=0 => F(0) = sqrt(pi)
    const gaussZero = evaluateTransformPair('gaussian', 0, 1);
    assert.ok(Math.abs(gaussZero.absFAlpha - Math.sqrt(Math.PI)) < 1e-6);
  });

  it('solves Sturm-Liouville eigenvalues and boundary conditions across all 5 cases (Lesson 5)', () => {
    const L = Math.PI;
    // Case A: Dirichlet y(0)=0, y(pi)=0 => lambda_n = n^2, y_n(0)=0, y_n(pi)=0
    const caseA = solveSturmLiouvilleCase('case_a_dirichlet', L, 3);
    assert.ok(Math.abs(caseA.eigenvalueLambda - 9) < 1e-6);
    assert.ok(Math.abs(caseA.evaluateEigenfunction(0)) < 1e-9);
    assert.ok(Math.abs(caseA.evaluateEigenfunction(L)) < 1e-9);

    // Case D: Mixed y(0)=0, y'(pi)=0 => lambda_1 = (1/2)^2 = 0.25
    const caseD = solveSturmLiouvilleCase('case_d_dirichlet_neumann', L, 1);
    assert.ok(Math.abs(caseD.eigenvalueLambda - 0.25) < 1e-6);
  });

  it('classifies PDEs by discriminant and models 1D Heat Equation decay & steady-state (Lesson 6)', () => {
    // Example 43 from PDF:
    // 1) 4 u_xx - 5 u_xy + u_yy = 0 => A=4, B=-5, C=1 => Delta = 25 - 16 = 9 > 0 (Hyperbolic)
    const pde1 = classifyPDE(4, -5, 1);
    assert.equal(pde1.delta, 9);
    assert.equal(pde1.typeEn, 'hyperbolic');

    // 2) u_xx - 2 u_xy + u_yy + u_x = 0 => A=1, B=-2, C=1 => Delta = 4 - 4 = 0 (Parabolic)
    const pde2 = classifyPDE(1, -2, 1);
    assert.equal(pde2.delta, 0);
    assert.equal(pde2.typeEn, 'parabolic');

    // 3) u_xx + u_xy + 3 u_yy = 0 => A=1, B=1, C=3 => Delta = 1 - 12 = -11 < 0 (Elliptic)
    const pde3 = classifyPDE(1, 1, 3);
    assert.equal(pde3.delta, -11);
    assert.equal(pde3.typeEn, 'elliptic');

    // Heat Equation: Dirichlet homogeneous on [0, pi], k=1, f(x)=100 sin(x)
    // Exact solution: u(x,t) = 100 sin(x) e^{-t}
    const t0 = evaluateHeatEquation1D(
      {
        rodLengthL: Math.PI,
        diffusivityK: 1,
        timeT: 0,
        bcType: 'dirichlet_homog',
        initialProfile: 'single_sine',
      },
      Math.PI / 2,
      5
    );
    assert.ok(Math.abs(t0.u_xt - 100) < 0.05);

    const t1 = evaluateHeatEquation1D(
      {
        rodLengthL: Math.PI,
        diffusivityK: 1,
        timeT: 1,
        bcType: 'dirichlet_homog',
        initialProfile: 'single_sine',
      },
      Math.PI / 2,
      5
    );
    assert.ok(Math.abs(t1.u_xt - 100 * Math.exp(-1)) < 0.05);
    assert.ok(t1.fundamentalRelaxationTime > 0);

    // Verify Error Function erf & erfc
    assert.equal(mathErf(0), 0);
    assert.ok(Math.abs(mathErf(1) - 0.8427) < 0.005);
    assert.equal(mathErfc(0), 1);
    assert.ok(Math.abs(mathErf(0.5) + mathErfc(0.5) - 1.0) < 1e-6);

    // Verify Semi-infinite rod erfc diffusion: u(0,t)=T1
    const semiInf = evaluateHeatEquation1D(
      {
        rodLengthL: Math.PI,
        diffusivityK: 1,
        timeT: 1,
        bcType: 'semi_infinite_sine',
        initialProfile: 'constant_rod',
        leftTempT1: 50,
      },
      0,
      5
    );
    assert.ok(Math.abs(semiInf.u_xt - 50) < 0.1);

    // Verify Internal Source steady-state: v(L/2) = Q0 L^2 / (8 k^2)
    const intSource = evaluateHeatEquation1D(
      {
        rodLengthL: Math.PI,
        diffusivityK: 1,
        timeT: 10, // near steady state
        bcType: 'internal_source',
        initialProfile: 'constant_rod',
        internalSourceQ: 40,
      },
      Math.PI / 2,
      12
    );
    const expectedPeak = (40 * Math.PI * Math.PI) / 8;
    assert.ok(Math.abs(intSource.u_xt - expectedPeak) < 2.0);
  });

  it('manages Interactive Scratchpad stroke history, undo/redo, and axis stamps', () => {
    let history = createInitialHistory();
    assert.equal(history.present.length, 0);

    const axes = createCoordinateAxisStrokes(500, 400, 100);
    assert.equal(axes.length, 2);

    history = pushStroke(history, axes[0]);
    history = pushStroke(history, axes[1]);
    assert.equal(history.present.length, 2);

    history = undoStroke(history);
    assert.equal(history.present.length, 1);
    assert.equal(history.future.length, 1);

    history = redoStroke(history);
    assert.equal(history.present.length, 2);

    history = clearStrokes(history);
    assert.equal(history.present.length, 0);
  });

  it('normalizes OpenAI-compatible provider URLs, builds math tutor instructions, and parses LaTeX blocks', () => {
    assert.equal(
      normalizeOpenAIBaseUrl('https://api.openai.com/v1///'),
      'https://api.openai.com/v1'
    );
    assert.equal(
      buildOpenAIChatCompletionsUrl('https://api.openai.com/v1'),
      'https://api.openai.com/v1/chat/completions'
    );
    assert.equal(
      buildOpenAIChatCompletionsUrl('http://localhost:11434'),
      'http://localhost:11434/v1/chat/completions'
    );
    assert.equal(
      buildOpenAIChatCompletionsUrl('https://openrouter.ai/api/v1'),
      'https://openrouter.ai/api/v1/chat/completions'
    );

    const sysPrompt = buildMathTutorSystemInstruction(DEFAULT_AI_SETTINGS, {
      moduleTitle: 'سری فوریه',
      subtopicTitle: 'ضرایب اویلر',
    });
    assert.ok(sysPrompt.includes('سری فوریه'));
    assert.ok(sysPrompt.includes('$$...$$'));

    const blocks = parseMathMarkdownBlocks(
      'ابتدا در بازه $[-\\pi, \\pi]$ انتگرال می‌گیریم:\n$$a_0 = \\frac{1}{\\pi}\\int_{-\\pi}^{\\pi} f(x)\\,dx$$\nسپس جایگذاری می‌کنیم.'
    );
    assert.equal(blocks.length, 3);
    assert.equal(blocks[0].type, 'text_line');
    assert.equal(blocks[1].type, 'display_math');
    assert.equal(blocks[2].type, 'text_line');
  });

  it('evaluates Prerequisite Foundational Math trigonometric parity and 2nd-order ODE cases (Lesson 0)', () => {
    const oddN = evaluateFourierBoundaryTrig(3);
    assert.equal(oddN.isEvenN, false);
    assert.equal(oddN.cosNPi, -1);
    assert.equal(oddN.oneMinusCosNPi, 2);
    assert.equal(oddN.onePlusCosNPi, 0);

    const evenN = evaluateCharacteristicODE(0);
    assert.equal(evenN.caseType, 'zero_linear');
    assert.equal(evenN.canSatisfyTwoPointZeroBC, false);

    const odePos = evaluateCharacteristicODE(4);
    assert.equal(odePos.caseType, 'positive_oscillatory');
    assert.equal(odePos.canSatisfyTwoPointZeroBC, true);
  });

  it('models Tabular Integration by Parts (DI Method) diagonal pairings and horizontal remainder rules accurately', () => {
    const x2Model = buildTabularDIModel('x2_cos_nx');
    assert.equal(x2Model.rows.length, 4);
    assert.equal(x2Model.diagonals.length, 3);
    // Every diagonal must connect Row k of D to Row k+1 of I
    x2Model.diagonals.forEach((diag, idx) => {
      assert.equal(diag.fromRow, idx + 1);
      assert.equal(diag.toRow, idx + 2);
      assert.equal(diag.rowSign, x2Model.rows[idx].sign);
    });
    assert.equal(x2Model.horizontalRemainder.isZero, true);
    assert.equal(x2Model.horizontalRemainder.rowIndex, 4);

    const x3Model = buildTabularDIModel('x3_sin_nx');
    assert.equal(x3Model.rows.length, 5);
    assert.equal(x3Model.diagonals.length, 4);
    assert.equal(x3Model.horizontalRemainder.isZero, true);

    const cyclicModel = buildTabularDIModel('exp_cos_cyclic');
    assert.equal(cyclicModel.rows.length, 3);
    assert.equal(cyclicModel.diagonals.length, 2);
    assert.equal(cyclicModel.horizontalRemainder.isZero, false);
    assert.equal(cyclicModel.horizontalRemainder.rowIndex, 3);
  });

  it('provides complete symbolic derivations, expanded terms, Dirichlet points, and Parseval sums for all 8 Fourier Series presets', () => {
    const presets: PresetFunctionId[] = [
      'square',
      'abs_x',
      'sawtooth',
      'parabola',
      'piecewise_pdf_ex6',
      'x_plus_sin',
      'half_rectified',
      'triangle',
    ];
    for (const preset of presets) {
      const details = getAnalyticalFourierSeriesDetails(preset);
      assert.equal(details.presetId, preset);
      assert.ok(details.a0DerivationLatex.length > 10);
      assert.ok(details.anDerivationLatex.length > 10);
      assert.ok(details.bnDerivationLatex.length > 10);
      assert.ok(details.closedFormSeriesLatex.length > 10);
      assert.ok(details.expandedFirstTermsLatex.length > 15);
      assert.ok(details.dirichletConvergencePoints.length >= 1);
      assert.ok(details.parsevalApplicationLatex.length > 15);
    }
  });

  it('computes Fourier Series convergence trajectory across n=0..maxN for Recharts visualization', () => {
    const traj = computeFourierConvergenceTrajectory({
      presetId: 'square',
      halfPeriodL: Math.PI,
      maxN: 25,
      probeX: Math.PI / 2,
      mode: 'full',
    });

    assert.equal(traj.terms.length, 26); // n = 0 .. 25
    assert.equal(traj.dirichletTargetAtProbe, 1);
    // At n=1, S_1(pi/2) = 4/pi ≈ 1.2732
    assert.ok(Math.abs(traj.terms[1].partialSumAtProbe - 4 / Math.PI) < 0.01);
    // At n=25, S_25(pi/2) is much closer to 1 than at n=1
    assert.ok(traj.terms[25].absErrorAtProbe < traj.terms[1].absErrorAtProbe);
    // Parseval energy ratio increases monotonically with n
    for (let i = 1; i < traj.terms.length; i++) {
      assert.ok(
        traj.terms[i].energyRatioPercent >= traj.terms[i - 1].energyRatioPercent
      );
    }
    assert.ok(traj.terms[25].energyRatioPercent > 96);

    // At jump discontinuity x_0 = 0, Dirichlet target is 0.5 * (-1 + 1) = 0
    const jumpTraj = computeFourierConvergenceTrajectory({
      presetId: 'square',
      halfPeriodL: Math.PI,
      maxN: 10,
      probeX: 0,
      mode: 'full',
    });
    assert.equal(jumpTraj.exactLeftLimit, -1);
    assert.equal(jumpTraj.exactRightLimit, 1);
    assert.equal(jumpTraj.dirichletTargetAtProbe, 0);
  });

  it('provides complete analytical derivations, Dirichlet points, Parseval sums, and integral equations for all 6 Fourier Integral presets', () => {
    const presets: FourierIntegralPresetId[] = [
      'rect_pulse',
      'two_sided_exp',
      'one_sided_exp',
      'triangle_pulse',
      'sign_damped',
      'gaussian',
    ];

    for (const preset of presets) {
      const details = getAnalyticalFourierIntegralDetails(preset, 1.0);
      assert.equal(details.presetId, preset);
      assert.ok(details.titleFa.length > 5);
      assert.ok(details.functionDefinitionLatex.length > 5);
      assert.ok(details.A_alphaDerivationLatex.length > 5);
      assert.ok(details.B_alphaDerivationLatex.length > 5);
      assert.ok(details.integralRepresentationLatex.length > 5);
      assert.ok(details.dirichletConvergencePoints.length >= 1);
      assert.ok(details.parsevalApplicationLatex.length > 10);
      assert.ok(details.improperIntegralsExtracted.length >= 1);
      assert.ok(details.integralEquationConnectionFa.length > 10);
    }
  });

  it('computes Fourier Integral convergence trajectory across Omega=1..maxOmega for Recharts visualization', () => {
    const traj = computeFourierIntegralConvergenceTrajectory({
      presetId: 'rect_pulse',
      paramA: 1.0,
      maxOmega: 30,
      probeX: 0,
      stepOmega: 2,
    });

    assert.ok(traj.points.length >= 10);
    assert.equal(traj.dirichletTargetAtProbe, 1);
    // At Omega = 30, I_Omega(0) should be close to 1
    const lastPoint = traj.points[traj.points.length - 1];
    assert.ok(Math.abs(lastPoint.partialIntegralAtProbe - 1) < 0.06);
    // Parseval energy increases monotonically with Omega
    for (let i = 1; i < traj.points.length; i++) {
      assert.ok(
        traj.points[i].cumulativeEnergy >= traj.points[i - 1].cumulativeEnergy - 1e-6
      );
    }

    // At jump discontinuity x_0 = 1, Dirichlet target is (1 + 0)/2 = 0.5
    const jumpTraj = computeFourierIntegralConvergenceTrajectory({
      presetId: 'rect_pulse',
      paramA: 1.0,
      maxOmega: 20,
      probeX: 1.0,
      stepOmega: 2,
    });
    assert.equal(jumpTraj.exactLeftLimit, 1);
    assert.equal(jumpTraj.exactRightLimit, 0);
    assert.equal(jumpTraj.dirichletTargetAtProbe, 0.5);
  });

  it('correctly normalizes I_\\Omega(x_0) and Fourier uncertainty principle formulas for KaTeX', () => {
    // Single backslash in LaTeX string
    assert.equal(normalizeToLatex('I_\\Omega(x_0)'), 'I_{\\Omega}(x_{0})');
    // Double-escaped backslash from JSX string literal
    assert.equal(normalizeToLatex('I_\\\\Omega(x_0)'), 'I_{\\Omega}(x_{0})');
    // Unicode notation
    assert.equal(normalizeToLatex('I_Ω(x₀)'), 'I_{\\Omega}(x_{0})');
    // Uncertainty principle with double-escaped commands
    const normalizedUncertainty = normalizeToLatex('\\\\Delta x \\\\cdot \\\\Delta \\\\alpha \\\\ge 1/2');
    assert.equal(normalizedUncertainty, '\\Delta x \\cdot \\Delta \\alpha \\ge 1/2');
    // Unicode uncertainty principle
    const unicodeUncertainty = normalizeToLatex('Δx · Δα ≥ ½');
    assert.ok(unicodeUncertainty.includes('\\Delta'));
    assert.ok(unicodeUncertainty.includes('\\alpha'));
    assert.ok(unicodeUncertainty.includes('\\ge'));
  });

  it('validates Master Fourier Transform Table completeness, categories, and evaluateTransformPair consistency (Lesson 4)', () => {
    assert.equal(MASTER_FOURIER_TRANSFORM_TABLE.length, 16);

    const categories = new Set(MASTER_FOURIER_TRANSFORM_TABLE.map((e) => e.category));
    assert.ok(categories.has('basic'));
    assert.ok(categories.has('symmetry'));
    assert.ok(categories.has('frequency_derivative'));
    assert.ok(categories.has('modulation'));
    assert.ok(categories.has('sine_cosine'));

    // Every entry must have non-empty LaTeX formulas and applications
    for (const entry of MASTER_FOURIER_TRANSFORM_TABLE) {
      assert.ok(entry.nameFa.length > 0);
      assert.ok(entry.timeFormulaLatex.length > 0);
      assert.ok(entry.freqFormulaLatex.length > 0);
      assert.ok(entry.fZeroLatex.length > 0);
      assert.ok(entry.parsevalEnergyLatex.length > 0);
      assert.ok(entry.engineeringApplicationFa.length > 0);
    }

    // Check Gaussian transform self-duality: F(0) = sqrt(pi / a)
    const gaussPair = evaluateTransformPair('gaussian', 0, 1.0, 0, 0);
    assert.ok(Math.abs(gaussPair.absFAlpha - Math.sqrt(Math.PI)) < 1e-4);

    // Check two-sided exponential: F(0) = 2/a
    const expPair = evaluateTransformPair('two_sided_exp', 0, 2.0, 0, 0);
    assert.ok(Math.abs(expPair.absFAlpha - 1.0) < 1e-4);

    // Check rect pulse with a = 1.5: F(0) = 2a = 3.0
    const rectPair = evaluateTransformPair('rect_pulse', 0, 1.5, 0, 0);
    assert.ok(Math.abs(rectPair.absFAlpha - 3.0) < 1e-4);
  });

  it('validates Sturm-Liouville Table 4, 6 Integrating Factor ODE models, and numerical eigenfunction data (Lesson 5)', () => {
    // 1. STURM_LIOUVILLE_TABLE_4 completeness (all 5 cases)
    assert.equal(STURM_LIOUVILLE_TABLE_4.length, 5);
    const caseIds = STURM_LIOUVILLE_TABLE_4.map((c) => c.id);
    assert.ok(caseIds.includes('case_a_dirichlet'));
    assert.ok(caseIds.includes('case_b_neumann'));
    assert.ok(caseIds.includes('case_c_periodic'));
    assert.ok(caseIds.includes('case_d_dirichlet_neumann'));
    assert.ok(caseIds.includes('case_e_neumann_dirichlet'));

    // Check specific eigenvalue status
    const dirichlet = STURM_LIOUVILLE_TABLE_4.find((c) => c.id === 'case_a_dirichlet')!;
    assert.ok(dirichlet.lambdaZeroStatusFa.includes('مقدار ویژه نیست'));

    const neumann = STURM_LIOUVILLE_TABLE_4.find((c) => c.id === 'case_b_neumann')!;
    assert.ok(neumann.lambdaZeroStatusFa.includes('مقدار ویژه معتبر است'));

    // 2. Integrating factor lab: verify all 6 ODE types
    const euler = computeSturmLiouvilleIntegratingFactorExample('euler');
    assert.equal(euler.p_x, 'p(x) = x');
    assert.equal(euler.r_x, 'r(x) = x^3');

    const legendre = computeSturmLiouvilleIntegratingFactorExample('legendre');
    assert.equal(legendre.p_x, 'p(x) = 1');
    assert.equal(legendre.r_x, 'r(x) = 1 - x^2');

    const bessel = computeSturmLiouvilleIntegratingFactorExample('bessel');
    assert.equal(bessel.p_x, 'p(x) = x');

    const chebyshev = computeSturmLiouvilleIntegratingFactorExample('chebyshev');
    assert.ok(chebyshev.p_x.includes('\\sqrt{1-x^2}'));

    const hermite = computeSturmLiouvilleIntegratingFactorExample('hermite');
    assert.ok(hermite.p_x.includes('e^{-x^2}'));

    const constant = computeSturmLiouvilleIntegratingFactorExample('constant');
    assert.ok(constant.p_x.includes('e^{4x}'));

    // 3. computeSLEigenfunctionData numerical tests
    const L = 3.0;
    const modeN = 2;
    const simDirichlet = computeSLEigenfunctionData('case_a_dirichlet', L, modeN, 100);

    // Sturm oscillation theorem: mode 2 in Dirichlet has 2 - 1 = 1 interior node
    assert.equal(simDirichlet.interiorNodesCount, 1);

    // Eigenvalue for mode 2: (2 * pi / 3)^2 ≈ 4.386
    const expectedLambda = Math.pow((modeN * Math.PI) / L, 2);
    assert.ok(Math.abs(simDirichlet.eigenpair.eigenvalueLambda - expectedLambda) < 1e-4);

    // Orthogonality integral between y_2 and y_3 must be near 0
    assert.ok(Math.abs(simDirichlet.numericalOrthogonalityIntegral) < 0.05);

    // Norm squared on [0, L] for Dirichlet is L/2 = 1.5
    assert.ok(Math.abs(simDirichlet.orthogonalityNorm - 1.5) < 0.05);

    // Mode 3 should have 2 interior nodes
    const simDirichlet3 = computeSLEigenfunctionData('case_a_dirichlet', L, 3, 100);
    assert.equal(simDirichlet3.interiorNodesCount, 2);
  });
});



