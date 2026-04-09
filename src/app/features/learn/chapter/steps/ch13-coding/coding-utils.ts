/**
 * GF(2) arithmetic and coding theory utilities for 專題 D: 編碼理論
 */

// ─── GF(2) operations ────────────────────────────────────────────

export function gf2Add(a: number[], b: number[]): number[] {
  return a.map((v, i) => v ^ (b[i] ?? 0));
}

export function gf2Dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s ^= a[i] & b[i];
  return s;
}

export function gf2MatVec(M: number[][], v: number[]): number[] {
  return M.map((row) => gf2Dot(row, v));
}

// ─── Hamming distance & weight ───────────────────────────────────

export function hammingDist(a: number[], b: number[]): number {
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
}

export function hammingWeight(v: number[]): number {
  return v.filter((x) => x !== 0).length;
}

// ─── Hamming(7,4) code ───────────────────────────────────────────
// Systematic form: data bits at positions 2,4,5,6 (0-indexed)
// Parity bits at positions 0,1,3

/** Generator matrix G (4×7): message [d1,d2,d3,d4] → 7-bit codeword */
export const HAMMING_G: number[][] = [
  [1, 1, 0, 1, 0, 0, 0], // d1
  [0, 1, 1, 0, 1, 0, 0], // d2
  [1, 1, 1, 0, 0, 1, 0], // d3
  [1, 0, 1, 0, 0, 0, 1], // d4
];

/** Parity-check matrix H (3×7): H · c = 0 for valid codewords */
export const HAMMING_H: number[][] = [
  [1, 0, 1, 0, 1, 0, 1], // check 1 (bit pattern: positions with bit0=1)
  [0, 1, 1, 0, 0, 1, 1], // check 2 (positions with bit1=1)
  [0, 0, 0, 1, 1, 1, 1], // check 3 (positions with bit2=1)
];

/** Encode 4 data bits → 7-bit codeword using G. */
export function hammingEncode(msg: number[]): number[] {
  const c = new Array(7).fill(0);
  for (let j = 0; j < 7; j++) {
    let s = 0;
    for (let i = 0; i < 4; i++) s ^= msg[i] & HAMMING_G[i][j];
    c[j] = s;
  }
  return c;
}

/** Compute syndrome s = H · r (over GF(2)). */
export function syndrome(r: number[]): number[] {
  return gf2MatVec(HAMMING_H, r);
}

/** Syndrome → error position (1-indexed). 0 = no error. */
export function syndromeToPos(s: number[]): number {
  return s[0] + s[1] * 2 + s[2] * 4;
}

/** Correct single-bit error. Returns corrected codeword. */
export function hammingCorrect(r: number[]): number[] {
  const s = syndrome(r);
  const pos = syndromeToPos(s); // 1-indexed position
  const corrected = r.slice();
  if (pos > 0 && pos <= 7) {
    corrected[pos - 1] ^= 1;
  }
  return corrected;
}

/** Extract 4 data bits from a 7-bit codeword (systematic positions). */
export function hammingDecode(c: number[]): number[] {
  return [c[2], c[4], c[5], c[6]]; // data at positions 2,4,5,6 (0-indexed)
}

// ─── Noisy channel ───────────────────────────────────────────────

export function addNoise(bits: number[], errorRate: number): { output: number[]; flipped: number[] } {
  const output = bits.slice();
  const flipped: number[] = [];
  for (let i = 0; i < bits.length; i++) {
    if (Math.random() < errorRate) {
      output[i] ^= 1;
      flipped.push(i);
    }
  }
  return { output, flipped };
}
