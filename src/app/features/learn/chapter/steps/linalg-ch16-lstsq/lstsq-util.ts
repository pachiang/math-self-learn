export interface Pt {
  x: number;
  y: number;
}

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type Mat22 = [Vec2, Vec2];
export type Mat32 = [Vec2, Vec2, Vec2];
export type Mat23 = [Vec3, Vec3];

export const LS_DEMO_A: Mat32 = [
  [1, 0],
  [1, 1],
  [1, 2],
];

export function dot2(a: Vec2, b: Vec2): number {
  return a[0] * b[0] + a[1] * b[1];
}

export function dot3(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function scale3(v: Vec3, s: number): Vec3 {
  return [v[0] * s, v[1] * s, v[2] * s];
}

export function sub3(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function normSq3(v: Vec3): number {
  return dot3(v, v);
}

export function columns32(A: Mat32): [Vec3, Vec3] {
  return [
    [A[0][0], A[1][0], A[2][0]],
    [A[0][1], A[1][1], A[2][1]],
  ];
}

export function mat32Vec2(A: Mat32, x: Vec2): Vec3 {
  return [
    A[0][0] * x[0] + A[0][1] * x[1],
    A[1][0] * x[0] + A[1][1] * x[1],
    A[2][0] * x[0] + A[2][1] * x[1],
  ];
}

export function ata32(A: Mat32): Mat22 {
  const [c1, c2] = columns32(A);
  return [
    [dot3(c1, c1), dot3(c1, c2)],
    [dot3(c1, c2), dot3(c2, c2)],
  ];
}

export function atb32(A: Mat32, b: Vec3): Vec2 {
  const [c1, c2] = columns32(A);
  return [dot3(c1, b), dot3(c2, b)];
}

export function solve2x2(A: Mat22, b: Vec2): Vec2 {
  const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
  if (Math.abs(det) < 1e-9) return [0, 0];
  return [
    (b[0] * A[1][1] - b[1] * A[0][1]) / det,
    (A[0][0] * b[1] - A[1][0] * b[0]) / det,
  ];
}

export function inverse2x2(A: Mat22): Mat22 {
  const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
  if (Math.abs(det) < 1e-9) return [[0, 0], [0, 0]];
  return [
    [A[1][1] / det, -A[0][1] / det],
    [-A[1][0] / det, A[0][0] / det],
  ];
}

export function leastSquares32(A: Mat32, b: Vec3): {
  xHat: Vec2;
  projection: Vec3;
  residual: Vec3;
  ata: Mat22;
  atb: Vec2;
} {
  const ata = ata32(A);
  const atb = atb32(A, b);
  const xHat = solve2x2(ata, atb);
  const projection = mat32Vec2(A, xHat);
  const residual = sub3(b, projection);
  return { xHat, projection, residual, ata, atb };
}

export function qr32(A: Mat32): {
  q1: Vec3;
  q2: Vec3;
  R: Mat22;
} {
  const [a1, a2] = columns32(A);
  const r11 = Math.sqrt(normSq3(a1)) || 1;
  const q1 = scale3(a1, 1 / r11);
  const r12 = dot3(q1, a2);
  const u2 = sub3(a2, scale3(q1, r12));
  const r22 = Math.sqrt(normSq3(u2)) || 1;
  const q2 = scale3(u2, 1 / r22);

  return {
    q1,
    q2,
    R: [
      [r11, r12],
      [0, r22],
    ],
  };
}

export function qrLeastSquares32(A: Mat32, b: Vec3): {
  q1: Vec3;
  q2: Vec3;
  qtB: Vec2;
  R: Mat22;
  xHat: Vec2;
  projection: Vec3;
  residual: Vec3;
} {
  const { q1, q2, R } = qr32(A);
  const qtB: Vec2 = [dot3(q1, b), dot3(q2, b)];
  const x2 = Math.abs(R[1][1]) < 1e-9 ? 0 : qtB[1] / R[1][1];
  const x1 =
    Math.abs(R[0][0]) < 1e-9 ? 0 : (qtB[0] - R[0][1] * x2) / R[0][0];
  const xHat: Vec2 = [x1, x2];
  const projection = mat32Vec2(A, xHat);
  const residual = sub3(b, projection);
  return { q1, q2, qtB, R, xHat, projection, residual };
}

export function pseudoinverse32(A: Mat32): Mat23 {
  const ataInv = inverse2x2(ata32(A));
  const row0: Vec3 = [A[0][0], A[1][0], A[2][0]];
  const row1: Vec3 = [A[0][1], A[1][1], A[2][1]];

  return [
    [
      ataInv[0][0] * row0[0] + ataInv[0][1] * row1[0],
      ataInv[0][0] * row0[1] + ataInv[0][1] * row1[1],
      ataInv[0][0] * row0[2] + ataInv[0][1] * row1[2],
    ],
    [
      ataInv[1][0] * row0[0] + ataInv[1][1] * row1[0],
      ataInv[1][0] * row0[1] + ataInv[1][1] * row1[1],
      ataInv[1][0] * row0[2] + ataInv[1][1] * row1[2],
    ],
  ];
}

export function applyMat23(A: Mat23, b: Vec3): Vec2 {
  return [dot3(A[0], b), dot3(A[1], b)];
}

export function projectOntoDirection2(target: Vec2, direction: Vec2): {
  projection: Vec2;
  residual: Vec2;
  coeff: number;
} {
  const denom = dot2(direction, direction) || 1;
  const coeff = dot2(target, direction) / denom;
  const projection: Vec2 = [direction[0] * coeff, direction[1] * coeff];
  return {
    projection,
    residual: [target[0] - projection[0], target[1] - projection[1]],
    coeff,
  };
}

export function lineFit(points: Pt[]): {
  ata: Mat22;
  atb: Vec2;
  solution: Vec2;
  sse: number;
} {
  let xx = 0;
  let x = 0;
  let xy = 0;
  let y = 0;
  for (const pt of points) {
    xx += pt.x * pt.x;
    x += pt.x;
    xy += pt.x * pt.y;
    y += pt.y;
  }

  const ata: Mat22 = [
    [xx, x],
    [x, points.length],
  ];
  const atb: Vec2 = [xy, y];
  const solution = solve2x2(ata, atb);
  const sse = points.reduce(
    (sum, pt) => sum + (pt.y - solution[0] * pt.x - solution[1]) ** 2,
    0,
  );

  return { ata, atb, solution, sse };
}
