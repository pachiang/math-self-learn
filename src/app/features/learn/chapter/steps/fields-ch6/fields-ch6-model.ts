// Fields & Galois · Chapter 6 shared model
// 主視覺：複平面上的「根家族」。點亮＝在該擴張裡（field 成員關係，非平面區域）。

export interface CRoot {
  label: string;
  re: number;
  im: number;
}

export const PLANE = { cx: 150, cy: 150, s: 62 };

export function planeX(re: number): number {
  return PLANE.cx + re * PLANE.s;
}
export function planeY(im: number): number {
  return PLANE.cy - im * PLANE.s; // SVG y 向下，翻轉
}

const CBRT2 = Math.cbrt(2); // ≈ 1.2599
const SQRT2 = Math.SQRT2; // ≈ 1.4142

/** x³ − 2 的三根，成 120° 星形。 */
export const ROOTS_X3_2: CRoot[] = [
  { label: '∛2', re: CBRT2, im: 0 },
  { label: 'ω∛2', re: CBRT2 * Math.cos((2 * Math.PI) / 3), im: CBRT2 * Math.sin((2 * Math.PI) / 3) },
  { label: 'ω²∛2', re: CBRT2 * Math.cos((4 * Math.PI) / 3), im: CBRT2 * Math.sin((4 * Math.PI) / 3) },
];

/** x² − 2 的兩根（都在實軸）。 */
export const ROOTS_X2_2: CRoot[] = [
  { label: '√2', re: SQRT2, im: 0 },
  { label: '−√2', re: -SQRT2, im: 0 },
];

/** x² + 1 的兩根（i、−i）。 */
export const ROOTS_X2_1: CRoot[] = [
  { label: 'i', re: 0, im: 1 },
  { label: '−i', re: 0, im: -1 },
];
