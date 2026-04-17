/**
 * Utilities for Real Analysis Ch15: Line Integrals & Green's Theorem.
 */

/** 2D vector field type. */
export type VectorField2D = (x: number, y: number) => [number, number];

/** Standard vector fields for demos. */
export const VECTOR_FIELDS: { name: string; F: VectorField2D; formula: string; conservative: boolean }[] = [
  { name: '旋轉場', F: (x, y) => [-y, x], formula: 'F = (−y, x)', conservative: false },
  { name: '輻射場', F: (x, y) => [x, y], formula: 'F = (x, y)', conservative: true },
  { name: '梯度場', F: (x, y) => [2 * x, 2 * y], formula: 'F = ∇(x²+y²)', conservative: true },
  { name: '剪切場', F: (_x, y) => [y, 0], formula: 'F = (y, 0)', conservative: false },
];

/** Parameterized curves for demos. */
export interface Curve2D {
  name: string;
  r: (t: number) => [number, number];
  dr: (t: number) => [number, number];
  tRange: [number, number];
  closed: boolean;
}

export const CURVES: Curve2D[] = [
  {
    name: '單位圓',
    r: (t) => [Math.cos(t), Math.sin(t)],
    dr: (t) => [-Math.sin(t), Math.cos(t)],
    tRange: [0, 2 * Math.PI],
    closed: true,
  },
  {
    name: '直線 (0,0)→(1,1)',
    r: (t) => [t, t],
    dr: () => [1, 1],
    tRange: [0, 1],
    closed: false,
  },
  {
    name: '拋物線 y=x²',
    r: (t) => [t, t * t],
    dr: (t) => [1, 2 * t],
    tRange: [0, 1],
    closed: false,
  },
  {
    name: '橢圓',
    r: (t) => [1.5 * Math.cos(t), Math.sin(t)],
    dr: (t) => [-1.5 * Math.sin(t), Math.cos(t)],
    tRange: [0, 2 * Math.PI],
    closed: true,
  },
];

/** Compute line integral ∫_C F · dr numerically. */
export function lineIntegral(F: VectorField2D, curve: Curve2D, steps = 500): number {
  const [t0, t1] = curve.tRange;
  const dt = (t1 - t0) / steps;
  let sum = 0;
  for (let i = 0; i < steps; i++) {
    const t = t0 + (i + 0.5) * dt;
    const [fx, fy] = F(...curve.r(t));
    const [dx, dy] = curve.dr(t);
    sum += (fx * dx + fy * dy) * dt;
  }
  return sum;
}

/** Compute curl (scalar in 2D): ∂Q/∂x − ∂P/∂y. */
export function curl2D(F: VectorField2D, x: number, y: number, h = 1e-5): number {
  const [, Q1] = F(x + h, y);
  const [, Q2] = F(x - h, y);
  const [P1] = F(x, y + h);
  const [P2] = F(x, y - h);
  const dQdx = (Q1 - Q2) / (2 * h);
  const dPdy = (P1 - P2) / (2 * h);
  return dQdx - dPdy;
}

/** Compute divergence: ∂P/∂x + ∂Q/∂y. */
export function div2D(F: VectorField2D, x: number, y: number, h = 1e-5): number {
  const [P1] = F(x + h, y);
  const [P2] = F(x - h, y);
  const [, Q1] = F(x, y + h);
  const [, Q2] = F(x, y - h);
  return (P1 - P2) / (2 * h) + (Q1 - Q2) / (2 * h);
}

/** Compute double integral of scalar function over a disk of radius r. */
export function diskIntegral(
  f: (x: number, y: number) => number,
  cx: number, cy: number, radius: number,
  nr = 50, ntheta = 50,
): number {
  const dr = radius / nr;
  const dth = (2 * Math.PI) / ntheta;
  let sum = 0;
  for (let i = 0; i < nr; i++) {
    const r = (i + 0.5) * dr;
    for (let j = 0; j < ntheta; j++) {
      const th = (j + 0.5) * dth;
      const x = cx + r * Math.cos(th);
      const y = cy + r * Math.sin(th);
      sum += f(x, y) * r * dr * dth;
    }
  }
  return sum;
}
