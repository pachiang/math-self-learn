// Fields & Galois · Chapter 2 shared model
// 主軸：擴張 = base field 上的 vector space；維度 = 需要幾個獨立方向。
// 內部乘法用「α^n = c 摺回」的 poly 引擎計算（本章只拿來算，不教；Ch3 才命名為 mod minimal polynomial）。

export interface Fraction {
  p: number;
  q: number; // q > 0
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function reduceFraction(p: number, q: number): Fraction {
  if (q === 0) return { p: 0, q: 1 };
  if (q < 0) {
    p = -p;
    q = -q;
  }
  const g = gcd(p, q) || 1;
  return { p: p / g, q: q / g };
}

export function formatFraction(f: Fraction): string {
  return f.q === 1 ? `${f.p}` : `${f.p}/${f.q}`;
}

/** 一個擴張世界：α^n = c，基底為 basisLabels（長度 n）。 */
export interface ExtWorld {
  id: string;
  rootLabel: string; // 'α' 的顯示，例如 '√2'
  n: number; // 擴張維度 = minimal polynomial 次數
  c: number; // α^n = c
  basisLabels: string[]; // 長度 n，例如 ['1','√2']
}

export const WORLD_SQRT2: ExtWorld = {
  id: 'sqrt2',
  rootLabel: '√2',
  n: 2,
  c: 2,
  basisLabels: ['1', '√2'],
};

export const WORLD_CBRT2: ExtWorld = {
  id: 'cbrt2',
  rootLabel: '∛2',
  n: 3,
  c: 2,
  basisLabels: ['1', '∛2', '∛4'],
};

/** α^0 = 1 的座標。 */
export function unitCoeffs(n: number): number[] {
  const v = new Array(n).fill(0);
  v[0] = 1;
  return v;
}

/** 乘以 α 一次，並用 α^n = c 摺回（整數係數）。 */
export function mulByAlpha(coeffs: number[], n: number, c: number): number[] {
  const out = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    if (i + 1 < n) {
      out[i + 1] += coeffs[i];
    } else {
      out[0] += coeffs[i] * c; // α^n 摺回常數
    }
  }
  return out;
}

/** 兩個元素相乘，mod (α^n = c)（整數係數）。 */
export function polyMulMod(
  a: number[],
  b: number[],
  n: number,
  c: number,
): number[] {
  const raw = new Array(2 * n - 1).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      raw[i + j] += a[i] * b[j];
    }
  }
  const out = raw.slice(0, n);
  for (let k = n; k < raw.length; k++) {
    // α^k = α^(k-n) · c
    out[k - n] += raw[k] * c;
  }
  return out;
}

/** α^k 的座標（k 可 ≥ n，會摺回）。 */
export function alphaPower(k: number, n: number, c: number): number[] {
  let v = unitCoeffs(n);
  for (let i = 0; i < k; i++) {
    v = mulByAlpha(v, n, c);
  }
  return v;
}

/** 只在 n = 2 的擴張成立：1/(a + bα)，α² = c → (a − bα)/(a² − c b²)。 */
export function reciprocalQuadratic(
  a: number,
  b: number,
  c: number,
): { coeffs: Fraction[]; denom: number } | null {
  const denom = a * a - c * b * b;
  if (denom === 0) return null; // 只有 a = b = 0 時發生（√2 irrational）
  return {
    coeffs: [reduceFraction(a, denom), reduceFraction(-b, denom)],
    denom,
  };
}

interface SignedTerm {
  neg: boolean;
  body: string;
}

function joinTerms(parts: SignedTerm[]): string {
  if (!parts.length) return '0';
  return parts
    .map((t, i) =>
      i === 0 ? (t.neg ? `−${t.body}` : t.body) : ` ${t.neg ? '−' : '+'} ${t.body}`,
    )
    .join('');
}

/** 把整數座標接上基底標籤，組成可讀字串，例如 '3 + 2·√2'、'3 − 2·√2'。 */
export function formatElement(coeffs: number[], basisLabels: string[]): string {
  const parts: SignedTerm[] = [];
  coeffs.forEach((v, i) => {
    if (v === 0) return;
    const mag = Math.abs(v);
    const label = basisLabels[i];
    const body = i === 0 ? `${mag}` : mag === 1 ? label : `${mag}·${label}`;
    parts.push({ neg: v < 0, body });
  });
  return joinTerms(parts);
}

/** Fraction 座標版的可讀字串。 */
export function formatFractionElement(
  coeffs: Fraction[],
  basisLabels: string[],
): string {
  const parts: SignedTerm[] = [];
  coeffs.forEach((f, i) => {
    if (f.p === 0) return;
    const val = formatFraction({ p: Math.abs(f.p), q: f.q });
    const label = basisLabels[i];
    const body = i === 0 ? val : val === '1' ? label : `${val}·${label}`;
    parts.push({ neg: f.p < 0, body });
  });
  return joinTerms(parts);
}
