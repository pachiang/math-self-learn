/**
 * Tiny exact-arithmetic reader for what learners type as witnesses:
 * numbers (3.5, −2), and expressions in a few named integers (k + 3, 2k², p / (2q)).
 * Exact rationals, so "3.5 is not an integer" is decided without floating-point noise.
 */

export interface Q {
  n: number;
  d: number;
}

const gcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
};

export function q(n: number, d = 1): Q {
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = gcd(n, d);
  return { n: n / g + 0, d: d / g };
}

export const add = (a: Q, b: Q): Q => q(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a: Q, b: Q): Q => q(a.n * b.d - b.n * a.d, a.d * b.d);
export const mul = (a: Q, b: Q): Q => q(a.n * b.n, a.d * b.d);
export const div = (a: Q, b: Q): Q | null => (b.n === 0 ? null : q(a.n * b.d, a.d * b.n));
export const eq = (a: Q, b: Q): boolean => a.n === b.n && a.d === b.d;
export const isInt = (a: Q): boolean => a.d === 1;

/** Signed integer with a real minus sign. */
export function sgn(v: number): string {
  return v < 0 ? `−${Math.abs(v)}` : String(v);
}

/** 7/2 → 3.5, 1/3 → 1/3, −4 → −4. */
export function fmtQ(a: Q): string {
  if (a.d === 1) return sgn(a.n);
  let t = a.d;
  while (t % 2 === 0) t /= 2;
  while (t % 5 === 0) t /= 5;
  if (t === 1) {
    const s = String(Math.abs(a.n / a.d));
    return a.n < 0 ? `−${s}` : s;
  }
  return `${sgn(a.n)}/${a.d}`;
}

/** Wrap negatives and slash fractions in parentheses when they follow "×". */
export function paren(a: Q): string {
  const s = fmtQ(a);
  return a.n < 0 || s.includes('/') ? `(${s})` : s;
}

export type ExprNode =
  | { t: 'num'; v: Q }
  | { t: 'var'; name: string }
  | { t: 'neg'; a: ExprNode }
  | { t: 'bin'; op: '+' | '-' | '*' | '/'; a: ExprNode; b: ExprNode }
  | { t: 'pow'; a: ExprNode; e: number };

export type Parsed = { ok: true; node: ExprNode; vars: string[] } | { ok: false; msg: string };

class ParseFail extends Error {}

export function normalizeExpr(src: string): string {
  return src
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .normalize('NFKC')
    .replace(/[−–—]/g, '-')
    .replace(/[×·∙⋅]/g, '*')
    .replace(/÷/g, '/')
    .replace(/,/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

/** Single-letter variables; implicit multiplication (2k, 3(k+1), km); powers 0–6. */
export function parseExpr(src: string, allowed: readonly string[]): Parsed {
  const s = normalizeExpr(src);
  if (!s) return { ok: false, msg: '還沒有填。' };
  let i = 0;
  const vars = new Set<string>();
  const fail = (msg: string): never => {
    throw new ParseFail(msg);
  };
  const peek = (): string | undefined => s[i];
  const isDigit = (c?: string) => !!c && c >= '0' && c <= '9';
  const isLetter = (c?: string) => !!c && c >= 'a' && c <= 'z';

  const expr = (): ExprNode => {
    let node = term();
    while (peek() === '+' || peek() === '-') {
      const op = s[i++] as '+' | '-';
      node = { t: 'bin', op, a: node, b: term() };
    }
    return node;
  };
  const term = (): ExprNode => {
    let node = unary();
    for (;;) {
      const c = peek();
      if (c === '*' || c === '/') {
        i++;
        node = { t: 'bin', op: c, a: node, b: unary() };
      } else if (isDigit(c) || isLetter(c) || c === '(' || c === '.') {
        node = { t: 'bin', op: '*', a: node, b: power() };
      } else {
        return node;
      }
    }
  };
  const unary = (): ExprNode => {
    if (peek() === '-') {
      i++;
      return { t: 'neg', a: unary() };
    }
    if (peek() === '+') {
      i++;
      return unary();
    }
    return power();
  };
  const power = (): ExprNode => {
    const base = primary();
    if (peek() !== '^') return base;
    i++;
    const e = evalExpr(unary(), {});
    if (!e || !isInt(e) || e.n < 0 || e.n > 6) return fail('次方只能是 0 到 6 的整數。');
    return { t: 'pow', a: base, e: e.n };
  };
  const primary = (): ExprNode => {
    const c = peek();
    if (c === undefined) return fail('式子還沒寫完。');
    if (c === '(') {
      i++;
      const node = expr();
      if (peek() !== ')') return fail('括號沒有配對。');
      i++;
      return node;
    }
    if (isDigit(c) || c === '.') {
      const start = i;
      while (isDigit(peek())) i++;
      if (peek() === '.') {
        i++;
        while (isDigit(peek())) i++;
      }
      const text = s.slice(start, i);
      const [whole, frac = ''] = text.split('.');
      if (text === '.') return fail('看不懂「.」。');
      if (frac.length > 6 || whole.length > 9) return fail('數字太長了。');
      return { t: 'num', v: q(Number((whole || '0') + frac), 10 ** frac.length) };
    }
    if (isLetter(c)) {
      i++;
      if (!allowed.includes(c)) {
        return fail(allowed.length ? `這裡只能用 ${allowed.join('、')}。` : '這裡請填一個數，不需要字母。');
      }
      vars.add(c);
      return { t: 'var', name: c };
    }
    return fail(`看不懂「${c}」。`);
  };

  try {
    const node = expr();
    if (i < s.length) return { ok: false, msg: s[i] === ')' ? '括號沒有配對。' : `看不懂「${s.slice(i)}」。` };
    return { ok: true, node, vars: [...vars] };
  } catch (e) {
    if (e instanceof ParseFail) return { ok: false, msg: e.message };
    throw e;
  }
}

/** null when a variable is missing or something divides by zero. */
export function evalExpr(node: ExprNode, env: Record<string, Q>): Q | null {
  switch (node.t) {
    case 'num':
      return node.v;
    case 'var':
      return env[node.name] ?? null;
    case 'neg': {
      const a = evalExpr(node.a, env);
      return a && q(-a.n, a.d);
    }
    case 'pow': {
      const a = evalExpr(node.a, env);
      if (!a) return null;
      let r = q(1);
      for (let j = 0; j < node.e; j++) r = mul(r, a);
      return r;
    }
    case 'bin': {
      const a = evalExpr(node.a, env);
      const b = evalExpr(node.b, env);
      if (!a || !b) return null;
      if (node.op === '+') return add(a, b);
      if (node.op === '-') return sub(a, b);
      if (node.op === '*') return mul(a, b);
      return div(a, b);
    }
  }
}

/** A typed constant such as "3.5", "−4" or "1/4". */
export function readNumber(src: string): { ok: true; v: Q } | { ok: false; msg: string } {
  const p = parseExpr(src, []);
  if (!p.ok) return p;
  const v = evalExpr(p.node, {});
  return v ? { ok: true, v } : { ok: false, msg: '這個式子要除以 0。' };
}
