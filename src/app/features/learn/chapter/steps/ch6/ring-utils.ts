/** Modular arithmetic helpers for Z_n as a ring. */

export function zAdd(a: number, b: number, n: number): number {
  return ((a + b) % n + n) % n;
}

export function zMul(a: number, b: number, n: number): number {
  return ((a * b) % n + n) % n;
}

export function zNeg(a: number, n: number): number {
  return (n - a) % n;
}

/** Multiplicative inverse in Z_n (returns -1 if not invertible). */
export function zInv(a: number, n: number): number {
  for (let i = 1; i < n; i++) {
    if (zMul(a, i, n) === 1) return i;
  }
  return -1;
}

/** Full multiplication table for Z_n. Returns n×n array of products. */
export function mulTable(n: number): number[][] {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (__, j) => zMul(i, j, n)),
  );
}

/** Find all zero divisors in Z_n (non-zero a where ∃ non-zero b: ab≡0). */
export function zeroDivisors(n: number): number[] {
  const result: number[] = [];
  for (let a = 1; a < n; a++) {
    for (let b = 1; b < n; b++) {
      if (zMul(a, b, n) === 0) {
        result.push(a);
        break;
      }
    }
  }
  return result;
}

/** Check if a subset of Z_n is an ideal: closed under + and absorbs ×. */
export function isIdeal(subset: Set<number>, n: number): {
  ok: boolean;
  addClosed: boolean;
  addCounter: string;
  absorbs: boolean;
  absorbCounter: string;
} {
  // Must contain 0
  if (!subset.has(0)) {
    return { ok: false, addClosed: false, addCounter: '0 \u2209 I', absorbs: true, absorbCounter: '' };
  }

  // Closed under addition
  for (const a of subset) {
    for (const b of subset) {
      if (!subset.has(zAdd(a, b, n))) {
        return {
          ok: false, addClosed: false,
          addCounter: `${a}+${b} = ${zAdd(a, b, n)} \u2209 I`,
          absorbs: true, absorbCounter: '',
        };
      }
    }
    // Closed under negation (needed for additive subgroup)
    if (!subset.has(zNeg(a, n))) {
      return {
        ok: false, addClosed: false,
        addCounter: `\u2212${a} = ${zNeg(a, n)} \u2209 I`,
        absorbs: true, absorbCounter: '',
      };
    }
  }

  // Absorbs multiplication from both sides
  for (const a of subset) {
    for (let r = 0; r < n; r++) {
      if (!subset.has(zMul(r, a, n))) {
        return {
          ok: false, addClosed: true, addCounter: '',
          absorbs: false,
          absorbCounter: `${r}\u00D7${a} = ${zMul(r, a, n)} \u2209 I`,
        };
      }
    }
  }

  return { ok: true, addClosed: true, addCounter: '', absorbs: true, absorbCounter: '' };
}
