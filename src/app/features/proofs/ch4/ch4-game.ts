import { Q, evalExpr, fmtQ, isInt, parseExpr, q, sgn } from '../ch2/ch2-expr';

/** Where both players pick from. The course fixes ℕ = {0, 1, 2, …}. */
export type Domain = 'Z' | 'N';
export const DOMAIN_SYM: Record<Domain, string> = { Z: 'ℤ', N: 'ℕ' };
export const DOMAIN_NAME: Record<Domain, string> = { Z: '整數', N: '自然數' };

export const inDomain = (v: Q, d: Domain): boolean => isInt(v) && (d === 'Z' || v.n >= 0);

/**
 * A rule you write for the player who moves second: given the other side's move g,
 * answer a = rule(g). The other side tries a fixed, hand-picked list of moves.
 */
export interface RuleSpec {
  /** The variable the other side picks, e.g. 'x'. */
  given: string;
  /** The variable your rule produces, e.g. 'y'. */
  answer: string;
  domain: Domain;
  /** The other side's moves, worst cases first. Deterministic, never random. */
  tests: number[];
  /** Does the answer win against this move? */
  wins: (g: Q, a: Q) => boolean;
  /** The condition with numbers filled in, e.g. "8 > 7". */
  cond: (g: Q, a: Q) => string;
  /** Why a losing row loses, when 「可是 {cond} 不成立」 would read as a double negative. */
  loseWhy?: (g: Q, a: Q) => string;
  /** The quantity that, if constant, gives a reason valid for every move, e.g. a − g. */
  key: (g: Q, a: Q) => Q;
  /** Is that constant a winning one? */
  keyOk: (c: Q) => boolean;
  /** One sentence: why this constant wins for every move. */
  reason: (c: Q) => string;
}

export interface RuleRow {
  g: number;
  a: Q | null;
  win: boolean;
  note: string;
}

export type RuleResult =
  | { kind: 'parse'; msg: string }
  | { kind: 'lose'; rows: RuleRow[]; msg: string }
  | { kind: 'example'; rows: RuleRow[] }
  | { kind: 'proof'; rows: RuleRow[]; c: Q; reason: string };

/** Extra probes for the "is the key constant?" check, beyond the opponent's moves. */
const PROBES = [1, 2, 3, 5, 11, 40, -2, -5, -37, 123];

export function checkRule(spec: RuleSpec, src: string): RuleResult {
  const p = parseExpr(src, [spec.given]);
  if (!p.ok) return { kind: 'parse', msg: p.msg };
  const at = (g: number) => evalExpr(p.node, { [spec.given]: q(g) });
  const g0 = spec.given;
  const a0 = spec.answer;
  const D = DOMAIN_SYM[spec.domain];

  const rows: RuleRow[] = [];
  for (const g of spec.tests) {
    const a = at(g);
    if (!a) {
      rows.push({ g, a: null, win: false, note: '要除以 0' });
      return { kind: 'lose', rows, msg: `${g0} = ${sgn(g)} 時，這條規則要除以 0，給不出 ${a0}。` };
    }
    if (!isInt(a)) {
      rows.push({ g, a, win: false, note: '不是整數' });
      return { kind: 'lose', rows, msg: `${g0} = ${sgn(g)} 時，${a0} = ${fmtQ(a)}，不是整數，這一招不合法。` };
    }
    if (!inDomain(a, spec.domain)) {
      rows.push({ g, a, win: false, note: `不在 ${D} 裡` });
      return { kind: 'lose', rows, msg: `${g0} = ${sgn(g)} 時，${a0} = ${fmtQ(a)}，不在 ${D} 裡，這一招不合法。` };
    }
    const win = spec.wins(q(g), a);
    rows.push({ g, a, win, note: spec.cond(q(g), a) });
    if (!win) {
      return { kind: 'lose', rows, msg: `${g0} = ${sgn(g)} 時，${a0} = ${fmtQ(a)}，${spec.loseWhy ? spec.loseWhy(q(g), a) : `可是 ${spec.cond(q(g), a)} 不成立。`}` };
    }
  }

  // Every move lost to the rule. Is there a reason that covers moves never tried?
  const keys: Q[] = [];
  for (const g of [...spec.tests, ...PROBES]) {
    if (spec.domain === 'N' && g < 0) continue;
    const a = at(g);
    if (!a) return { kind: 'example', rows };
    keys.push(spec.key(q(g), a));
  }
  const c = keys[0];
  const constant = keys.every((k) => k.n === c.n && k.d === c.d);
  if (constant && isInt(c) && spec.keyOk(c)) return { kind: 'proof', rows, c, reason: spec.reason(c) };
  return { kind: 'example', rows };
}

/** A ready-made spec for "y > x" style games with y − x as the key. */
export function gapSpec(opts: {
  given: string;
  answer: string;
  domain: Domain;
  tests: number[];
  dir: 'gt' | 'lt';
}): RuleSpec {
  const { given: g0, answer: a0, dir } = opts;
  const sym = dir === 'gt' ? '>' : '<';
  return {
    ...opts,
    wins: (g, a) => (dir === 'gt' ? cmp(a, g) > 0 : cmp(a, g) < 0),
    cond: (g, a) => `${fmtQ(a)} ${sym} ${fmtQ(g)}`,
    key: (g, a) => q(a.n * g.d - g.n * a.d, a.d * g.d),
    keyOk: (c) => (dir === 'gt' ? c.n > 0 : c.n < 0),
    reason: (c) =>
      dir === 'gt'
        ? `${a0} − ${g0} 永遠等於 ${fmtQ(c)}，不管 ${g0} 是多少，${a0} 都比 ${g0} 大。`
        : `${a0} − ${g0} 永遠等於 ${fmtQ(c)}，不管 ${g0} 是多少，${a0} 都比 ${g0} 小。`,
  };
}

/** −1, 0, 1 for a < b, a = b, a > b. */
export function cmp(a: Q, b: Q): number {
  const d = a.n * b.d - b.n * a.d;
  return d > 0 ? 1 : d < 0 ? -1 : 0;
}
