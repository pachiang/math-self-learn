import { ExprNode, isInt, sgn } from '../ch2/ch2-expr';

/**
 * Integer-coefficient polynomials in several named integers, enough to decide
 * "both sides expand to the same thing" on the proof board without a CAS.
 * A monomial key lists variables with exponents in alphabetical order, e.g. "k2.l1"; "" is the constant.
 */
export type Poly = Map<string, number>;

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
const sup = (n: number) => String(n).replace(/\d/g, (d) => SUP[d]);

type Mono = Record<string, number>;

const keyOf = (m: Mono): string =>
  Object.keys(m)
    .filter((v) => m[v] > 0)
    .sort()
    .map((v) => `${v}${m[v]}`)
    .join('.');

const monoOf = (key: string): Mono => {
  const m: Mono = {};
  if (!key) return m;
  for (const part of key.split('.')) m[part[0]] = Number(part.slice(1));
  return m;
};

const clean = (p: Poly): Poly => {
  for (const [k, c] of p) if (c === 0) p.delete(k);
  return p;
};

export const pconst = (c: number): Poly => clean(new Map([['', c]]));
export const pvar = (v: string): Poly => new Map([[`${v}1`, 1]]);

export function padd(a: Poly, b: Poly, sign = 1): Poly {
  const r = new Map(a);
  for (const [k, c] of b) r.set(k, (r.get(k) ?? 0) + sign * c);
  return clean(r);
}

export function pmul(a: Poly, b: Poly): Poly {
  const r: Poly = new Map();
  for (const [ka, ca] of a) {
    const ma = monoOf(ka);
    for (const [kb, cb] of b) {
      const m = { ...ma };
      for (const [v, e] of Object.entries(monoOf(kb))) m[v] = (m[v] ?? 0) + e;
      const k = keyOf(m);
      r.set(k, (r.get(k) ?? 0) + ca * cb);
    }
  }
  return clean(r);
}

export const peq = (a: Poly, b: Poly): boolean => padd(a, b, -1).size === 0;

export type ToPoly = { ok: true; p: Poly } | { ok: false; why: 'div' | 'frac' };

/** Only + − × and powers: a division or a non-integer constant would hide whether the result is an integer. */
export function toPoly(n: ExprNode): ToPoly {
  switch (n.t) {
    case 'num':
      return isInt(n.v) ? { ok: true, p: pconst(n.v.n) } : { ok: false, why: 'frac' };
    case 'var':
      return { ok: true, p: pvar(n.name) };
    case 'neg': {
      const a = toPoly(n.a);
      return a.ok ? { ok: true, p: padd(new Map(), a.p, -1) } : a;
    }
    case 'pow': {
      const a = toPoly(n.a);
      if (!a.ok) return a;
      let r = pconst(1);
      for (let i = 0; i < n.e; i++) r = pmul(r, a.p);
      return { ok: true, p: r };
    }
    case 'bin': {
      if (n.op === '/') return { ok: false, why: 'div' };
      const a = toPoly(n.a);
      if (!a.ok) return a;
      const b = toPoly(n.b);
      if (!b.ok) return b;
      if (n.op === '+') return { ok: true, p: padd(a.p, b.p) };
      if (n.op === '-') return { ok: true, p: padd(a.p, b.p, -1) };
      return { ok: true, p: pmul(a.p, b.p) };
    }
  }
}

/** Replace each variable in `defs` by its polynomial, once (definitions never refer back). */
export function psubst(p: Poly, defs: Record<string, Poly>): Poly {
  let r: Poly = new Map();
  for (const [k, c] of p) {
    let term = pconst(c);
    for (const [v, e] of Object.entries(monoOf(k))) {
      const base = defs[v] ?? pvar(v);
      for (let i = 0; i < e; i++) term = pmul(term, base);
    }
    r = padd(r, term);
  }
  return r;
}

export const pvars = (p: Poly): string[] => [...new Set([...p.keys()].flatMap((k) => Object.keys(monoOf(k))))].sort();

/** Higher degree first, then alphabetical: 4k² + 4k + 1, 2k + 2l. */
export function fmtPoly(p: Poly): string {
  if (p.size === 0) return '0';
  const deg = (k: string) => Object.values(monoOf(k)).reduce((s, e) => s + e, 0);
  const keys = [...p.keys()].sort((x, y) => deg(y) - deg(x) || (x < y ? -1 : x > y ? 1 : 0));
  let out = '';
  keys.forEach((k, i) => {
    const c = p.get(k)!;
    const m = monoOf(k);
    const vars = Object.keys(m)
      .sort()
      .map((v) => v + (m[v] > 1 ? sup(m[v]) : ''))
      .join('');
    const abs = Math.abs(c);
    const body = vars ? (abs === 1 ? vars : `${abs}${vars}`) : String(abs);
    if (i === 0) out = c < 0 ? `−${body}` : body;
    else out += c < 0 ? ` − ${body}` : ` + ${body}`;
  });
  return out;
}

/** Display an expression tree the way it would be written by hand: 2m, 2(k + l), n², 2k + 1. */
export function fmtExpr(n: ExprNode): string {
  return show(n, 0);
}

// Precedence: 0 sum, 1 product, 2 unary, 3 power/atom.
function show(n: ExprNode, ctx: number): string {
  const wrap = (s: string, prec: number) => (prec < ctx ? `(${s})` : s);
  switch (n.t) {
    case 'num':
      return n.v.d === 1 ? (n.v.n < 0 ? wrap(sgn(n.v.n), 2) : String(n.v.n)) : wrap(`${sgn(n.v.n)}/${n.v.d}`, 1);
    case 'var':
      return n.name;
    case 'neg':
      return wrap(`−${show(n.a, 2)}`, 2);
    case 'pow':
      return `${show(n.a, 3)}${sup(n.e)}`;
    case 'bin': {
      if (n.op === '+' || n.op === '-') {
        const right = n.b.t === 'neg' ? `(${show(n.b, 0)})` : show(n.b, n.op === '-' ? 1 : 0);
        return wrap(`${show(n.a, 0)} ${n.op === '+' ? '+' : '−'} ${right}`, 0);
      }
      if (n.op === '/') return wrap(`${show(n.a, 1)} / ${show(n.b, 2)}`, 1);
      // Juxtapose a leading number with a letter, power or bracket: 2m, 2k², 2(k + l); otherwise ×.
      const a = show(n.a, 1);
      const b = show(n.b, 2);
      const leadNum = n.a.t === 'num' && n.a.v.n >= 0 && n.a.v.d === 1;
      const bLetter = (n.b.t === 'var' && n.b.name !== '□') || n.b.t === 'pow' || b.startsWith('(');
      const letters = n.a.t === 'var' && n.b.t === 'var';
      if ((leadNum && bLetter) || letters) return wrap(a + b, 1);
      return wrap(`${a} × ${b}`, 1);
    }
  }
}

/** Substitute an expression for a variable inside a tree. */
export function substExpr(n: ExprNode, v: string, by: ExprNode): ExprNode {
  switch (n.t) {
    case 'num':
      return n;
    case 'var':
      return n.name === v ? by : n;
    case 'neg':
      return { t: 'neg', a: substExpr(n.a, v, by) };
    case 'pow':
      return { t: 'pow', a: substExpr(n.a, v, by), e: n.e };
    case 'bin':
      return { t: 'bin', op: n.op, a: substExpr(n.a, v, by), b: substExpr(n.b, v, by) };
  }
}

export function exprVars(n: ExprNode): string[] {
  const out = new Set<string>();
  const walk = (m: ExprNode) => {
    if (m.t === 'var') out.add(m.name);
    else if (m.t === 'neg' || m.t === 'pow') walk(m.a);
    else if (m.t === 'bin') {
      walk(m.a);
      walk(m.b);
    }
  };
  walk(n);
  return [...out].sort();
}
