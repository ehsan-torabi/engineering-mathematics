/**
 * Pure LaTeX normalizer shared by the math renderer (components/MathFormula.tsx)
 * and the verification tests. No React/KaTeX imports here so it can run in node.
 */

export function normalizeToLatex(input: string): string {
  if (!input) return '';
  // Collapse accidental double backslashes before LaTeX commands or symbols
  // (e.g., \\Omega -> \Omega, \\Delta -> \Delta, \\alpha -> \alpha, \\ge -> \ge)
  let clean = input.replace(/\\\\([a-zA-Z]+|[,\.;:!\{\}\[\]\(\)])/g, (_m, p1) => '\\' + p1);

  // Ensure subscript Omega has braces for KaTeX: I_\Omega or I_Ω -> I_{\Omega}
  clean = clean
    .replace(/I_\\Omega(?=[^a-zA-Z]|$)/g, 'I_{\\Omega}')
    .replace(/I_Ω(?=[^a-zA-Z]|$)/gu, 'I_{\\Omega}')
    .replace(/x_0(?=[^a-zA-Z]|$)/g, 'x_{0}')
    .replace(/x₀/g, 'x_{0}');

  return clean
    .replace(/≃/g, '\\simeq ')
    .replace(/⇒/g, '\\implies ')
    .replace(/⇔/g, '\\iff ')
    .replace(/≠/g, '\\neq ')
    .replace(/≤/g, '\\le ')
    .replace(/≥/g, '\\ge ')
    .replace(/∞/g, '\\infty ')
    .replace(/π/g, '\\pi ')
    .replace(/α/g, '\\alpha ')
    .replace(/λ/g, '\\lambda ')
    .replace(/μ/g, '\\mu ')
    .replace(/ω/g, '\\omega ')
    .replace(/Ω/g, '\\Omega ')
    .replace(/Δ/g, '\\Delta ')
    .replace(/φ/g, '\\varphi ')
    .replace(/ψ/g, '\\psi ')
    .replace(/ℓ/g, '\\ell ')
    .replace(/ℱ/g, '\\mathcal{F}')
    .replace(/∑/g, '\\sum')
    .replace(/∫/g, '\\int')
    .replace(/√\(([^)]+)\)/g, '\\sqrt{$1}')
    .replace(/√([a-zA-Z0-9\\]+)/g, '\\sqrt{$1}')
    .replace(/‖([^‖]+)‖/g, '\\left\\|$1\\right\\|')
    .replace(/⟨([^⟩]+)⟩/g, '\\left\\langle $1 \\right\\rangle ')
    .replace(/½/g, '\\frac{1}{2}')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/⁴/g, '^4')
    .replace(/₀/g, '_0')
    .replace(/₁/g, '_1')
    .replace(/₂/g, '_2');
}
