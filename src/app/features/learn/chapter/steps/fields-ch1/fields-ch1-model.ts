// Fields & Galois · Chapter 1 shared model
// 主軸：field-ness 一律從「每個非零元是否有乘法夥伴」讀出，不從世界外觀讀出。

export interface Fraction {
  p: number;
  q: number; // 保持 q > 0
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function mod(value: number, n: number): number {
  return ((value % n) + n) % n;
}

/** ℤ/n 中 a 的乘法反元素（0..n-1），不存在回傳 null。 */
export function modInverse(a: number, n: number): number | null {
  const am = mod(a, n);
  if (am === 0) return null;
  for (let b = 1; b < n; b++) {
    if (mod(am * b, n) === 1) return b;
  }
  return null;
}

/** a 在 ℤ/n 是否為 zero divisor（非零，卻能乘出 0）。 */
export function isZeroDivisor(a: number, n: number): boolean {
  const am = mod(a, n);
  if (am === 0) return false;
  for (let b = 1; b < n; b++) {
    if (mod(am * b, n) === 0) return true;
  }
  return false;
}

export function reduceFraction(p: number, q: number): Fraction {
  if (q < 0) {
    p = -p;
    q = -q;
  }
  const g = gcd(p, q) || 1;
  return { p: p / g, q: q / g };
}

export function fractionInverse(f: Fraction): Fraction | null {
  if (f.p === 0) return null;
  return reduceFraction(f.q, f.p);
}

export function formatFraction(f: Fraction): string {
  return f.q === 1 ? `${f.p}` : `${f.p}/${f.q}`;
}

export type EvidenceKind =
  | 'EXAMPLE'
  | 'FINITE EXHAUSTION'
  | 'GENERAL ARGUMENT';

/** 一個世界內的單一非零 element，及其乘法夥伴資訊（預先算好，template 直接讀）。 */
export interface FieldElem {
  label: string; // 顯示用
  inverseLabel: string | null; // 乘法夥伴；null = 此世界內找不到
  equation: string; // 'a · b = 1' 形式；不存在時給說明
  note?: string; // 例如 zero divisor 標註
}

/** 一個可切換的世界（ℤ、ℚ 或 ℤ/n）。 */
export interface FieldWorld {
  id: string;
  label: string;
  modulus?: number;
  evidence: EvidenceKind;
  scope: string; // scope label
  elems: FieldElem[];
}

function znElems(n: number): FieldElem[] {
  const elems: FieldElem[] = [];
  for (let a = 1; a < n; a++) {
    const inv = modInverse(a, n);
    if (inv !== null) {
      elems.push({
        label: `${a}`,
        inverseLabel: `${inv}`,
        equation: `${a} · ${inv} = ${mod(a * inv, n)} = 1（mod ${n}）`,
      });
    } else {
      elems.push({
        label: `${a}`,
        inverseLabel: null,
        equation: `找不到 b 使 ${a} · b ≡ 1（mod ${n}）`,
        note: isZeroDivisor(a, n) ? 'zero divisor' : undefined,
      });
    }
  }
  return elems;
}

function integerElems(values: number[]): FieldElem[] {
  return values.map((a) => {
    const isUnit = a === 1 || a === -1;
    return isUnit
      ? {
          label: `${a}`,
          inverseLabel: `${a}`,
          equation: `${a} · ${a} = 1`,
        }
      : {
          label: `${a}`,
          inverseLabel: null,
          equation: `${a} 在 ℤ 裡沒有整數乘法夥伴（1/${a} 不是整數）`,
        };
  });
}

function rationalElems(fracs: Fraction[]): FieldElem[] {
  return fracs.map((f) => {
    const inv = fractionInverse(f)!;
    return {
      label: formatFraction(f),
      inverseLabel: formatFraction(inv),
      equation: `${formatFraction(f)} · ${formatFraction(inv)} = 1`,
    };
  });
}

export const WORLD_Z: FieldWorld = {
  id: 'Z',
  label: 'ℤ',
  evidence: 'GENERAL ARGUMENT',
  scope: 'RING · 非 field',
  elems: integerElems([-3, -2, -1, 1, 2, 3]),
};

export const WORLD_Q: FieldWorld = {
  id: 'Q',
  label: 'ℚ',
  evidence: 'GENERAL ARGUMENT',
  scope: 'FIELD · CHAR 0',
  elems: rationalElems([
    { p: 2, q: 1 },
    { p: 3, q: 1 },
    { p: 1, q: 2 },
    { p: 2, q: 3 },
    { p: 5, q: 1 },
  ]),
};

export const WORLD_Z6: FieldWorld = {
  id: 'Z6',
  label: 'ℤ/6',
  modulus: 6,
  evidence: 'FINITE EXHAUSTION',
  scope: 'RING · 非 field',
  elems: znElems(6),
};

export const WORLD_Z5: FieldWorld = {
  id: 'Z5',
  label: 'ℤ/5',
  modulus: 5,
  evidence: 'FINITE EXHAUSTION',
  scope: 'FIELD · CHAR 5',
  elems: znElems(5),
};

export const WORLD_Z4: FieldWorld = {
  id: 'Z4',
  label: 'ℤ/4',
  modulus: 4,
  evidence: 'FINITE EXHAUSTION',
  scope: 'RING · 非 field',
  elems: znElems(4),
};

/** 世界是否為 field：每個非零元都有乘法夥伴。 */
export function isField(world: FieldWorld): boolean {
  return world.elems.every((e) => e.inverseLabel !== null);
}

/** 世界中「非零卻沒有夥伴」的 element labels（field ⇔ 此為空）。 */
export function blockedElems(world: FieldWorld): string[] {
  return world.elems.filter((e) => e.inverseLabel === null).map((e) => e.label);
}
