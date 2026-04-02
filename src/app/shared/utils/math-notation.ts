const SUPERSCRIPTS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const SUBSCRIPTS = '₀₁₂₃₄₅₆₇₈₉';

export function superscript(n: number): string {
  return String(n)
    .split('')
    .map((d) => SUPERSCRIPTS[parseInt(d)])
    .join('');
}

export function subscript(n: number): string {
  return String(n)
    .split('')
    .map((d) => SUBSCRIPTS[parseInt(d)])
    .join('');
}
