export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function polyValue(coeffs: readonly number[], x: number): number {
  let total = 0;
  let power = 1;
  for (const coeff of coeffs) {
    total += coeff * power;
    power *= x;
  }
  return total;
}

export function polyDerivative(coeffs: readonly number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < coeffs.length; i++) {
    out.push(coeffs[i] * i);
  }
  return out;
}

export function functionPath(
  fn: (x: number) => number,
  options: {
    xMin?: number;
    xMax?: number;
    samples?: number;
    scaleX?: number;
    scaleY?: number;
  } = {},
): string {
  const {
    xMin = -1.2,
    xMax = 1.2,
    samples = 180,
    scaleX = 92,
    scaleY = 28,
  } = options;
  const points: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const x = xMin + (xMax - xMin) * t;
    const y = fn(x);
    points.push(`${(x * scaleX).toFixed(2)},${(-y * scaleY).toFixed(2)}`);
  }
  return `M ${points.join(' L ')}`;
}

export function formatPolynomial(coeffs: readonly number[], variable = 'x'): string {
  const terms: string[] = [];
  coeffs.forEach((coeff, index) => {
    if (Math.abs(coeff) < 1e-8) return;
    const abs = Math.abs(coeff);
    const coeffStr = Number.isInteger(abs) ? abs.toString() : abs.toFixed(2);
    let term = '';
    if (index === 0) {
      term = coeffStr;
    } else if (index === 1) {
      term = abs === 1 ? variable : `${coeffStr}${variable}`;
    } else {
      term = abs === 1 ? `${variable}^${index}` : `${coeffStr}${variable}^${index}`;
    }
    terms.push(`${coeff < 0 ? '-' : '+'} ${term}`);
  });

  if (terms.length === 0) return '0';
  return terms
    .join(' ')
    .replace(/^\+\s/, '')
    .replace(/\+\s-/g, '- ');
}

export function range(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i);
}

export function maxAbs(values: readonly number[]): number {
  return Math.max(1, ...values.map((value) => Math.abs(value)));
}
