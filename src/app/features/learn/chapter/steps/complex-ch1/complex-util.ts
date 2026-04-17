/**
 * Shared utilities for Complex Analysis course.
 */

/** Complex number as [re, im]. */
export type C = [number, number];

/* ── Arithmetic ── */
export const cAdd = (a: C, b: C): C => [a[0] + b[0], a[1] + b[1]];
export const cSub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]];
export const cMul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
export const cConj = (a: C): C => [a[0], -a[1]];
export const cAbs = (a: C): number => Math.hypot(a[0], a[1]);
export const cArg = (a: C): number => Math.atan2(a[1], a[0]);
export const cFromPolar = (r: number, θ: number): C => [r * Math.cos(θ), r * Math.sin(θ)];
export const cScale = (a: C, s: number): C => [a[0] * s, a[1] * s];
export const cPow = (a: C, n: number): C => {
  const r = Math.pow(cAbs(a), n);
  const θ = cArg(a) * n;
  return cFromPolar(r, θ);
};

/* ── Elementary functions ── */
export const cDiv = (a: C, b: C): C => {
  const d = b[0] * b[0] + b[1] * b[1];
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
};
export const cInv = (a: C): C => cDiv([1, 0], a);
export const cExp = (a: C): C => {
  const er = Math.exp(a[0]);
  return [er * Math.cos(a[1]), er * Math.sin(a[1])];
};
export const cSin = (a: C): C => [Math.sin(a[0]) * Math.cosh(a[1]), Math.cos(a[0]) * Math.sinh(a[1])];
export const cCos = (a: C): C => [Math.cos(a[0]) * Math.cosh(a[1]), -Math.sin(a[0]) * Math.sinh(a[1])];
export const cLog = (a: C): C => [Math.log(cAbs(a)), cArg(a)];

/* ── SVG coordinate helpers for a complex-plane viewport ── */
export interface PlaneView {
  cx: number;  // center x in complex coords
  cy: number;  // center y in complex coords
  radius: number;  // half-width in complex coords
  svgW: number;
  svgH: number;
  pad: number;
}

export function toSvg(v: PlaneView, z: C): [number, number] {
  const scale = (v.svgW - 2 * v.pad) / (2 * v.radius);
  const sx = v.pad + (z[0] - v.cx + v.radius) * scale;
  const sy = v.pad + (v.cy + v.radius - z[1]) * scale; // y flipped
  return [sx, sy];
}

export function fromSvg(v: PlaneView, sx: number, sy: number): C {
  const scale = (v.svgW - 2 * v.pad) / (2 * v.radius);
  const re = (sx - v.pad) / scale + v.cx - v.radius;
  const im = v.cy + v.radius - (sy - v.pad) / scale;
  return [re, im];
}

/** Generate axis lines + tick marks as SVG path data. */
export function axesPath(v: PlaneView): string {
  const [ox, oy] = toSvg(v, [0, 0]);
  const l = v.pad, r = v.svgW - v.pad, t = v.pad, b = v.svgH - v.pad;
  let d = `M${l},${oy}L${r},${oy}M${ox},${t}L${ox},${b}`;
  const step = v.radius <= 2 ? 1 : v.radius <= 5 ? 2 : 5;
  for (let k = -Math.floor(v.radius / step) * step; k <= v.radius; k += step) {
    if (k === 0) continue;
    const [tx] = toSvg(v, [v.cx + k, 0]);
    const [, ty] = toSvg(v, [0, v.cy + k]);
    d += `M${tx},${oy - 3}L${tx},${oy + 3}`;
    d += `M${ox - 3},${ty}L${ox + 3},${ty}`;
  }
  return d;
}

/** Format a complex number as a display string. */
export function fmtC(z: C, precision = 2): string {
  const re = z[0], im = z[1];
  const rs = Math.abs(re) < 0.005 ? '' : re.toFixed(precision);
  const is = Math.abs(im) < 0.005
    ? ''
    : (im > 0 ? (rs ? ' + ' : '') : (rs ? ' − ' : '−'))
      + (Math.abs(Math.abs(im) - 1) < 0.005 ? '' : Math.abs(im).toFixed(precision))
      + 'i';
  return (rs + is) || '0';
}
