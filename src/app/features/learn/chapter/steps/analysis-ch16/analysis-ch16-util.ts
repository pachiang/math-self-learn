/**
 * Utilities for Real Analysis Ch16: Surface Integrals & Stokes / Divergence Theorem.
 */

/** 3D vector field type. */
export type VectorField3D = (x: number, y: number, z: number) => [number, number, number];

/** Parametric surface: (u,v) → (x,y,z). */
export interface Surface {
  name: string;
  r: (u: number, v: number) => [number, number, number];
  uRange: [number, number];
  vRange: [number, number];
}

/** Cross product. */
export function cross(a: [number, number, number], b: [number, number, number]): [number, number, number] {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

/** Vector length. */
export function vecLen(v: [number, number, number]): number {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

/** Dot product. */
export function dot(a: [number, number, number], b: [number, number, number]): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/** Compute surface normal via finite differences at (u,v). */
export function surfaceNormal(
  S: Surface, u: number, v: number, h = 1e-5,
): [number, number, number] {
  const r = S.r;
  const ru: [number, number, number] = [
    (r(u + h, v)[0] - r(u - h, v)[0]) / (2 * h),
    (r(u + h, v)[1] - r(u - h, v)[1]) / (2 * h),
    (r(u + h, v)[2] - r(u - h, v)[2]) / (2 * h),
  ];
  const rv: [number, number, number] = [
    (r(u, v + h)[0] - r(u, v - h)[0]) / (2 * h),
    (r(u, v + h)[1] - r(u, v - h)[1]) / (2 * h),
    (r(u, v + h)[2] - r(u, v - h)[2]) / (2 * h),
  ];
  return cross(ru, rv);
}

/** Surface area via numerical integration. */
export function surfaceArea(S: Surface, nu = 80, nv = 80): number {
  const [u0, u1] = S.uRange;
  const [v0, v1] = S.vRange;
  const du = (u1 - u0) / nu;
  const dv = (v1 - v0) / nv;
  let area = 0;
  for (let i = 0; i < nu; i++) {
    const u = u0 + (i + 0.5) * du;
    for (let j = 0; j < nv; j++) {
      const v = v0 + (j + 0.5) * dv;
      area += vecLen(surfaceNormal(S, u, v)) * du * dv;
    }
  }
  return area;
}

/** Surface integral of scalar function: ∬_S f dS. */
export function surfaceIntegralScalar(
  f: (x: number, y: number, z: number) => number,
  S: Surface, nu = 60, nv = 60,
): number {
  const [u0, u1] = S.uRange;
  const [v0, v1] = S.vRange;
  const du = (u1 - u0) / nu;
  const dv = (v1 - v0) / nv;
  let sum = 0;
  for (let i = 0; i < nu; i++) {
    const u = u0 + (i + 0.5) * du;
    for (let j = 0; j < nv; j++) {
      const v = v0 + (j + 0.5) * dv;
      const [x, y, z] = S.r(u, v);
      sum += f(x, y, z) * vecLen(surfaceNormal(S, u, v)) * du * dv;
    }
  }
  return sum;
}

/** Flux integral: ∬_S F · dS = ∬_S F · n dS. */
export function fluxIntegral(
  F: VectorField3D, S: Surface, nu = 60, nv = 60,
): number {
  const [u0, u1] = S.uRange;
  const [v0, v1] = S.vRange;
  const du = (u1 - u0) / nu;
  const dv = (v1 - v0) / nv;
  let sum = 0;
  for (let i = 0; i < nu; i++) {
    const u = u0 + (i + 0.5) * du;
    for (let j = 0; j < nv; j++) {
      const v = v0 + (j + 0.5) * dv;
      const [x, y, z] = S.r(u, v);
      const n = surfaceNormal(S, u, v);
      const fv = F(x, y, z);
      sum += dot(fv, n) * du * dv;
    }
  }
  return sum;
}

/** 3D divergence: ∂P/∂x + ∂Q/∂y + ∂R/∂z. */
export function div3D(F: VectorField3D, x: number, y: number, z: number, h = 1e-5): number {
  return (F(x + h, y, z)[0] - F(x - h, y, z)[0]) / (2 * h)
       + (F(x, y + h, z)[1] - F(x, y - h, z)[1]) / (2 * h)
       + (F(x, y, z + h)[2] - F(x, y, z - h)[2]) / (2 * h);
}

/** 3D curl: ∇ × F. */
export function curl3D(F: VectorField3D, x: number, y: number, z: number, h = 1e-5): [number, number, number] {
  const dRdy = (F(x, y + h, z)[2] - F(x, y - h, z)[2]) / (2 * h);
  const dQdz = (F(x, y, z + h)[1] - F(x, y, z - h)[1]) / (2 * h);
  const dPdz = (F(x, y, z + h)[0] - F(x, y, z - h)[0]) / (2 * h);
  const dRdx = (F(x + h, y, z)[2] - F(x - h, y, z)[2]) / (2 * h);
  const dQdx = (F(x + h, y, z)[1] - F(x - h, y, z)[1]) / (2 * h);
  const dPdy = (F(x, y + h, z)[0] - F(x, y - h, z)[0]) / (2 * h);
  return [dRdy - dQdz, dPdz - dRdx, dQdx - dPdy];
}

/** Volume integral over a ball of radius R. */
export function ballIntegral(
  f: (x: number, y: number, z: number) => number,
  R: number, n = 30,
): number {
  const dr = R / n;
  const dth = Math.PI / n;
  const dphi = (2 * Math.PI) / (2 * n);
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const r = (i + 0.5) * dr;
    for (let j = 0; j < n; j++) {
      const theta = (j + 0.5) * dth;
      for (let k = 0; k < 2 * n; k++) {
        const phi = (k + 0.5) * dphi;
        const x = r * Math.sin(theta) * Math.cos(phi);
        const y = r * Math.sin(theta) * Math.sin(phi);
        const z = r * Math.cos(theta);
        sum += f(x, y, z) * r * r * Math.sin(theta) * dr * dth * dphi;
      }
    }
  }
  return sum;
}

/** Standard 3D vector fields. */
export const FIELDS_3D: { name: string; F: VectorField3D; formula: string; divFormula: string }[] = [
  { name: '輻射場', F: (x, y, z) => [x, y, z], formula: 'F = (x, y, z)', divFormula: 'div F = 3' },
  { name: '旋轉場', F: (x, y, _z) => [-y, x, 0], formula: 'F = (−y, x, 0)', divFormula: 'div F = 0' },
  { name: '平方場', F: (x, y, z) => [x * x, y * y, z * z], formula: 'F = (x², y², z²)', divFormula: 'div F = 2(x+y+z)' },
  { name: '常數場', F: () => [0, 0, 1] as [number, number, number], formula: 'F = (0, 0, 1)', divFormula: 'div F = 0' },
];

/** Standard surfaces. */
export const SURFACES: Surface[] = [
  {
    name: '上半球',
    r: (u, v) => [Math.sin(u) * Math.cos(v), Math.sin(u) * Math.sin(v), Math.cos(u)],
    uRange: [0, Math.PI / 2],
    vRange: [0, 2 * Math.PI],
  },
  {
    name: '全球面',
    r: (u, v) => [Math.sin(u) * Math.cos(v), Math.sin(u) * Math.sin(v), Math.cos(u)],
    uRange: [0, Math.PI],
    vRange: [0, 2 * Math.PI],
  },
  {
    name: '拋物面',
    r: (u, v) => [u * Math.cos(v), u * Math.sin(v), 1 - u * u],
    uRange: [0, 1],
    vRange: [0, 2 * Math.PI],
  },
  {
    name: '圓柱側面',
    r: (u, v) => [Math.cos(v), Math.sin(v), u],
    uRange: [0, 1],
    vRange: [0, 2 * Math.PI],
  },
];
