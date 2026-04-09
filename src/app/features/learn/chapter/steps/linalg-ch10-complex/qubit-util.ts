/**
 * Utilities for qubit / Bloch sphere computations.
 *
 * A pure qubit state is |ψ⟩ = α|0⟩ + β|1⟩ with α, β ∈ ℂ and |α|² + |β|² = 1.
 *
 * Modulo a global phase, every state can be written as
 *   |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ) sin(θ/2)|1⟩
 * with θ ∈ [0, π] and φ ∈ [0, 2π).
 *
 * The Bloch vector (x, y, z) of the state is
 *   x = sin(θ) cos(φ)
 *   y = sin(θ) sin(φ)
 *   z = cos(θ)
 *
 * |0⟩ → (0, 0, 1)   north pole
 * |1⟩ → (0, 0, -1)  south pole
 * |+⟩ = (|0⟩+|1⟩)/√2 → (1, 0, 0)
 * |-⟩ = (|0⟩-|1⟩)/√2 → (-1, 0, 0)
 * |+i⟩ = (|0⟩+i|1⟩)/√2 → (0, 1, 0)
 * |-i⟩ = (|0⟩-i|1⟩)/√2 → (0, -1, 0)
 */

/** Complex number as [real, imag]. */
export type C = [number, number];

export const ZERO: C = [0, 0];
export const ONE: C = [1, 0];
export const I: C = [0, 1];

export function cAdd(a: C, b: C): C { return [a[0] + b[0], a[1] + b[1]]; }
export function cSub(a: C, b: C): C { return [a[0] - b[0], a[1] - b[1]]; }
export function cMul(a: C, b: C): C { return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]; }
export function cConj(a: C): C { return [a[0], -a[1]]; }
export function cAbs(a: C): number { return Math.hypot(a[0], a[1]); }
export function cAbsSq(a: C): number { return a[0] * a[0] + a[1] * a[1]; }
export function cScale(a: C, s: number): C { return [a[0] * s, a[1] * s]; }

/** Format a complex number for display. */
export function cFormat(a: C, digits = 2): string {
  const re = +a[0].toFixed(digits);
  const im = +a[1].toFixed(digits);
  if (Math.abs(im) < 1e-9) return `${re}`;
  if (Math.abs(re) < 1e-9) {
    if (im === 1) return 'i';
    if (im === -1) return '-i';
    return `${im}i`;
  }
  const sign = im >= 0 ? '+' : '-';
  const aim = Math.abs(im);
  return `${re} ${sign} ${aim === 1 ? '' : aim}i`;
}

/** A qubit state as two complex amplitudes. */
export interface Qubit { alpha: C; beta: C; }

/** Build a qubit from (θ, φ) on the Bloch sphere. */
export function qubitFromBloch(theta: number, phi: number): Qubit {
  const c = Math.cos(theta / 2);
  const s = Math.sin(theta / 2);
  return {
    alpha: [c, 0],
    beta: [s * Math.cos(phi), s * Math.sin(phi)],
  };
}

/** Convert a qubit to its Bloch sphere (x, y, z) point. */
export function qubitToBloch(q: Qubit): [number, number, number] {
  // Bloch vector: <σ_x>, <σ_y>, <σ_z>
  // <σ_x> = 2 Re(α* β)
  // <σ_y> = 2 Im(α* β)
  // <σ_z> = |α|² - |β|²
  const aStarB = cMul(cConj(q.alpha), q.beta);
  return [
    2 * aStarB[0],
    2 * aStarB[1],
    cAbsSq(q.alpha) - cAbsSq(q.beta),
  ];
}

/** Apply a 2x2 complex matrix M to a qubit. */
export function applyGate(M: C[][], q: Qubit): Qubit {
  return {
    alpha: cAdd(cMul(M[0][0], q.alpha), cMul(M[0][1], q.beta)),
    beta: cAdd(cMul(M[1][0], q.alpha), cMul(M[1][1], q.beta)),
  };
}

/** The standard 1-qubit gates as 2x2 complex matrices. */
export const GATES = {
  // Pauli X (NOT)
  X: [
    [[0, 0], [1, 0]],
    [[1, 0], [0, 0]],
  ] as C[][],
  // Pauli Y
  Y: [
    [[0, 0], [0, -1]],
    [[0, 1], [0, 0]],
  ] as C[][],
  // Pauli Z
  Z: [
    [[1, 0], [0, 0]],
    [[0, 0], [-1, 0]],
  ] as C[][],
  // Hadamard
  H: [
    [[1 / Math.sqrt(2), 0], [1 / Math.sqrt(2), 0]],
    [[1 / Math.sqrt(2), 0], [-1 / Math.sqrt(2), 0]],
  ] as C[][],
  // S gate (phase)
  S: [
    [[1, 0], [0, 0]],
    [[0, 0], [0, 1]],
  ] as C[][],
  // T gate (π/8)
  T: [
    [[1, 0], [0, 0]],
    [[0, 0], [Math.cos(Math.PI / 4), Math.sin(Math.PI / 4)]],
  ] as C[][],
};

/** The six special "cardinal" states of the Bloch sphere. */
export const BLOCH_PRESETS = [
  { name: '|0\u27E9', q: { alpha: [1, 0] as C, beta: [0, 0] as C }, point: [0, 0, 1] as [number, number, number] },
  { name: '|1\u27E9', q: { alpha: [0, 0] as C, beta: [1, 0] as C }, point: [0, 0, -1] as [number, number, number] },
  { name: '|+\u27E9', q: { alpha: [1 / Math.sqrt(2), 0] as C, beta: [1 / Math.sqrt(2), 0] as C }, point: [1, 0, 0] as [number, number, number] },
  { name: '|\u2212\u27E9', q: { alpha: [1 / Math.sqrt(2), 0] as C, beta: [-1 / Math.sqrt(2), 0] as C }, point: [-1, 0, 0] as [number, number, number] },
  { name: '|+i\u27E9', q: { alpha: [1 / Math.sqrt(2), 0] as C, beta: [0, 1 / Math.sqrt(2)] as C }, point: [0, 1, 0] as [number, number, number] },
  { name: '|\u2212i\u27E9', q: { alpha: [1 / Math.sqrt(2), 0] as C, beta: [0, -1 / Math.sqrt(2)] as C }, point: [0, -1, 0] as [number, number, number] },
];
