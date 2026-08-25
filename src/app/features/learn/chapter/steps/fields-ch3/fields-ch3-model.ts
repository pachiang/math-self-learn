// Fields & Galois · Chapter 3 shared model
// 中心：加一個根 = 拿 minimal polynomial 當 modulus 做 reduction；K(α) ≅ K[x]/(m)。
// 工作符號一律用 α（避免出現 √2² 這種醜寫法）；prose 才用 √2 等。coeffs：index = power。

const SUP = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸'];

export type Coeffs = number[];

export function modp(v: number, p?: number): number {
  if (!p) return v;
  return ((v % p) + p) % p;
}

export function trimPoly(c: Coeffs): Coeffs {
  let i = c.length - 1;
  while (i > 0 && c[i] === 0) i--;
  return c.slice(0, i + 1);
}

export function powerLabel(i: number, sym = 'α'): string {
  if (i === 0) return '1';
  if (i === 1) return sym;
  return `${sym}${SUP[i] ?? '^' + i}`;
}

interface SignedTerm {
  neg: boolean;
  body: string;
}

/** 由低次到高次組成可讀字串，例如 '1 + 3α'、'−1 + α'。 */
export function formatPoly(coeffs: Coeffs, sym = 'α', p?: number): string {
  const parts: SignedTerm[] = [];
  coeffs.forEach((raw, i) => {
    const v = modp(raw, p);
    if (v === 0) return;
    const mag = Math.abs(v);
    const label = powerLabel(i, sym);
    const body = i === 0 ? `${mag}` : mag === 1 ? label : `${mag}${label}`;
    parts.push({ neg: v < 0, body });
  });
  if (!parts.length) return '0';
  return parts
    .map((t, i) => (i === 0 ? (t.neg ? `−${t.body}` : t.body) : ` ${t.neg ? '−' : '+'} ${t.body}`))
    .join('');
}

/** 由高次到低次（給 modulus/方程用），例如 'x² − 2'。 */
export function formatPolyHigh(coeffs: Coeffs, sym = 'x', p?: number): string {
  const parts: SignedTerm[] = [];
  for (let i = coeffs.length - 1; i >= 0; i--) {
    const v = modp(coeffs[i], p);
    if (v === 0) continue;
    const mag = Math.abs(v);
    const label = powerLabel(i, sym);
    const body = i === 0 ? `${mag}` : mag === 1 ? label : `${mag}${label}`;
    parts.push({ neg: v < 0, body });
  }
  if (!parts.length) return '0';
  return parts
    .map((t, i) => (i === 0 ? (t.neg ? `−${t.body}` : t.body) : ` ${t.neg ? '−' : '+'} ${t.body}`))
    .join('');
}

/** monic m（index=power、top=1）給出 α^n = R，回傳 R（長度 n）。 */
export function relationTail(m: Coeffs, p?: number): Coeffs {
  const n = m.length - 1;
  const R: Coeffs = [];
  for (let i = 0; i < n; i++) R.push(modp(-m[i], p));
  return R;
}

export function relationString(m: Coeffs, sym = 'α', p?: number): string {
  const n = m.length - 1;
  return `${powerLabel(n, sym)} = ${formatPoly(relationTail(m, p), sym, p)}`;
}

export interface ReduceStep {
  before: string;
  detail: string;
  after: string;
}

/** 還原最高一項（次數 ≥ n）；已是次數 < n 則回傳 null。 */
function reduceOnceTop(coeffs: Coeffs, m: Coeffs, sym: string, p?: number): { poly: Coeffs; detail: string } | null {
  const n = m.length - 1;
  const cur = trimPoly(coeffs.map((v) => modp(v, p)));
  const d = cur.length - 1;
  if (d < n) return null;
  const lead = cur[d];
  const R = relationTail(m, p);
  const next = cur.slice();
  next[d] = modp(next[d] - lead, p);
  for (let i = 0; i < n; i++) {
    next[d - n + i] = modp((next[d - n + i] ?? 0) + lead * R[i], p);
  }
  const shifted = powerLabel(d - n, sym);
  const detail = `${powerLabel(d, sym)} = ${d - n === 0 ? '' : shifted + '·'}(${formatPoly(R, sym, p)})`;
  return { poly: trimPoly(next), detail };
}

export interface ReduceResult {
  steps: ReduceStep[];
  result: Coeffs;
  resultStr: string;
}

/** 反覆還原到次數 < n，回傳每一步的 trace。 */
export function reduceTrace(coeffs: Coeffs, m: Coeffs, sym = 'α', p?: number): ReduceResult {
  const steps: ReduceStep[] = [];
  let cur = trimPoly(coeffs.map((v) => modp(v, p)));
  let guard = 0;
  while (guard++ < 60) {
    const before = formatPoly(cur, sym, p);
    const r = reduceOnceTop(cur, m, sym, p);
    if (!r) break;
    steps.push({ before, detail: r.detail, after: formatPoly(r.poly, sym, p) });
    cur = r.poly;
  }
  return { steps, result: cur, resultStr: formatPoly(cur, sym, p) };
}

export function polyMul(a: Coeffs, b: Coeffs, p?: number): Coeffs {
  const out = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      out[i + j] = modp(out[i + j] + a[i] * b[j], p);
    }
  }
  return trimPoly(out);
}

/** f 在 α 處為零 ⇔ m | f ⇔ reduce f mod m 得 0。 */
export function vanishesModM(f: Coeffs, m: Coeffs, p?: number): boolean {
  return reduceTrace(f, m, 'α', p).result.every((v) => modp(v, p) === 0);
}

/** 二次擴張（α² = c）中 a + bα 的逆元；回傳規範化後的分子與分母。 */
export function reciprocalQuadratic(a: number, b: number, c: number): { num: Coeffs; den: number } | null {
  let den = a * a - c * b * b;
  if (den === 0) return null;
  let num: Coeffs = [a, -b];
  if (den < 0) {
    den = -den;
    num = num.map((v) => -v);
  }
  return { num, den };
}

export function formatReciprocal(r: { num: Coeffs; den: number }): string {
  const top = formatPoly(r.num, 'α');
  return r.den === 1 ? top : `(${top}) / ${r.den}`;
}
