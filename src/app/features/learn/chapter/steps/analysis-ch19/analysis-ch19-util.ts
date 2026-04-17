/**
 * Utilities for Real Analysis Ch19: Differential Forms & Generalized Stokes.
 */

/** A 1-form on R² is ω = P dx + Q dy, represented by (P, Q) at each point. */
export type Form1 = (x: number, y: number) => [number, number];

/** A 2-form on R² is f dx∧dy, represented by the scalar f at each point. */
export type Form2 = (x: number, y: number) => number;

/** Exterior derivative of a 0-form (function) → 1-form: df = (∂f/∂x) dx + (∂f/∂y) dy. */
export function d0(f: (x: number, y: number) => number, x: number, y: number, h = 1e-5): [number, number] {
  return [
    (f(x + h, y) - f(x - h, y)) / (2 * h),
    (f(x, y + h) - f(x, y - h)) / (2 * h),
  ];
}

/** Exterior derivative of a 1-form → 2-form: d(P dx + Q dy) = (∂Q/∂x − ∂P/∂y) dx∧dy. */
export function d1(omega: Form1, x: number, y: number, h = 1e-5): number {
  const [, Q1] = omega(x + h, y);
  const [, Q2] = omega(x - h, y);
  const [P1] = omega(x, y + h);
  const [P2] = omega(x, y - h);
  return (Q1 - Q2) / (2 * h) - (P1 - P2) / (2 * h);
}

/** Wedge product of two 1-forms: (a dx + b dy) ∧ (c dx + d dy) = (ad − bc) dx∧dy. */
export function wedge11(
  alpha: [number, number], beta: [number, number],
): number {
  return alpha[0] * beta[1] - alpha[1] * beta[0];
}

/** Integrate a 1-form along a parameterized curve. */
export function integrateForm1(
  omega: Form1,
  r: (t: number) => [number, number],
  dr: (t: number) => [number, number],
  tRange: [number, number],
  steps = 500,
): number {
  const [t0, t1] = tRange;
  const dt = (t1 - t0) / steps;
  let sum = 0;
  for (let i = 0; i < steps; i++) {
    const t = t0 + (i + 0.5) * dt;
    const [x, y] = r(t);
    const [P, Q] = omega(x, y);
    const [dx, dy] = dr(t);
    sum += (P * dx + Q * dy) * dt;
  }
  return sum;
}

/** Integrate a 2-form over a disk of radius R centered at origin. */
export function integrateForm2Disk(
  f: Form2, R: number, nr = 50, nth = 50,
): number {
  const dr = R / nr;
  const dth = (2 * Math.PI) / nth;
  let sum = 0;
  for (let i = 0; i < nr; i++) {
    const r = (i + 0.5) * dr;
    for (let j = 0; j < nth; j++) {
      const th = (j + 0.5) * dth;
      sum += f(r * Math.cos(th), r * Math.sin(th)) * r * dr * dth;
    }
  }
  return sum;
}

/** Standard 1-forms for demos. */
export const DEMO_1FORMS: { name: string; omega: Form1; formula: string; exact: boolean }[] = [
  { name: '−y dx + x dy', omega: (_x, y) => [-y, _x = 0, _x][0] === -y ? [-y, 0] : [-y, 0], formula: 'ω = −y dx + x dy', exact: false },
  { name: 'x dx + y dy', omega: (x, y) => [x, y], formula: 'ω = x dx + y dy', exact: true },
  { name: 'y dx + x dy', omega: (x, y) => [y, x], formula: 'ω = y dx + x dy', exact: true },
  { name: '−y dx', omega: (_x, y) => [-y, 0], formula: 'ω = −y dx', exact: false },
];
// Fix the first one properly
DEMO_1FORMS[0] = { name: '−y dx + x dy', omega: (x, y) => [-y, x], formula: 'ω = −y dx + x dy', exact: false };
