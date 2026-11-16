import { ExprNode, parseExpr } from '../ch2/ch2-expr';
import { Poly, exprVars, fmtExpr, fmtPoly, padd, peq, polyToExpr, psubst, pvar, substExpr, toPoly } from './poly';

/**
 * The proof state board as data: statements are a small AST, every card is a pure
 * function from one board state to the next. A board is its start plus a list of moves,
 * so undo is "drop the last move" and a replay is the same fold.
 * Every variable ranges over ℤ (the course convention for even / odd / divides).
 */

export type Pred = 'even' | 'odd' | 'divides';

export type Stmt =
  | { t: 'forall'; vs: string[]; body: Stmt }
  | { t: 'exists'; v: string; body: Stmt }
  | { t: 'imp'; a: Stmt; b: Stmt }
  | { t: 'and'; a: Stmt; b: Stmt }
  | { t: 'pred'; p: Pred; args: ExprNode[] }
  | { t: 'eq'; l: ExprNode; r: ExprNode };

export type GoalCard = 'intro' | 'assume' | 'unfoldGoal' | 'witness' | 'check' | 'exact';
export type GivenCard = 'split' | 'unfold' | 'obtain' | 'lemma';
export type CardId = GoalCard | GivenCard;

export type Move =
  | { card: 'intro' }
  | { card: 'assume' }
  | { card: 'unfoldGoal' }
  | { card: 'witness'; src: string }
  | { card: 'check' }
  | { card: 'exact' }
  | { card: 'split'; h: string }
  | { card: 'unfold'; h: string }
  | { card: 'obtain'; h: string; name: string }
  | { card: 'lemma'; h1: string; h2: string };

/** arb: introduced by 「令任意」, the opponent's; got: taken out of an 「存在」 given; chosen: your witness. */
export interface Obj {
  name: string;
  kind: 'arb' | 'got' | 'chosen';
  from?: string;
  def?: ExprNode;
}

export interface Hyp {
  id: string;
  s: Stmt;
  /** Set once a card has used this given, e.g. 「已拆開 → H2、H3」. */
  used?: string;
}

export interface LogEntry {
  card: CardId;
  text: string;
  /** shape: the statement's form dictated this step. idea: you had to think of something. */
  tag: 'shape' | 'idea';
}

export interface BoardState {
  objs: Obj[];
  hyps: Hyp[];
  goal: Stmt | null;
  /** Earlier goals, oldest first. */
  past: Stmt[];
  nextH: number;
  log: LogEntry[];
  /** Expansion shown by the last 「代入化簡」. */
  checked?: { lSrc: string; rSrc: string; both: string };
}

export interface BoardStart {
  goal: Stmt;
  objs?: Obj[];
  hyps?: Stmt[];
}

export type MoveResult =
  | { ok: true; state: BoardState }
  | { ok: false; code: 'shape' | 'none' | 'done' | 'name' | 'clash' | 'parse' | 'div' | 'early' | 'neq'; msg: string };

// ── building statements ─────────────────────────────────────────────

const ALL = 'abcdefghijklmnopqrstuvwxyz'.split('');

/** Parse a fixed term written by the course author; throws on a typo. */
export function T(src: string): ExprNode {
  const p = parseExpr(src, ALL);
  if (!p.ok) throw new Error(`bad term ${src}: ${p.msg}`);
  return p.node;
}

export const even = (t: string): Stmt => ({ t: 'pred', p: 'even', args: [T(t)] });
export const odd = (t: string): Stmt => ({ t: 'pred', p: 'odd', args: [T(t)] });
export const divides = (d: string, n: string): Stmt => ({ t: 'pred', p: 'divides', args: [T(d), T(n)] });
export const eqn = (l: string, r: string): Stmt => ({ t: 'eq', l: T(l), r: T(r) });
export const forall = (vs: string[], body: Stmt): Stmt => ({ t: 'forall', vs, body });
export const exists = (v: string, body: Stmt): Stmt => ({ t: 'exists', v, body });
export const imp = (a: Stmt, b: Stmt): Stmt => ({ t: 'imp', a, b });
export const and = (a: Stmt, b: Stmt): Stmt => ({ t: 'and', a, b });

// ── reading statements ──────────────────────────────────────────────

export function stmtText(s: Stmt, nested = false): string {
  switch (s.t) {
    case 'forall':
      return `對每個整數 ${s.vs.join('、')}，${stmtText(s.body, true)}`;
    case 'exists':
      return `存在整數 ${s.v}，使 ${stmtText(s.body, true)}`;
    case 'imp':
      return `若 ${stmtText(s.a, true)}，則 ${stmtText(s.b, true)}`;
    case 'and':
    {
      const a = stmtText(s.a, true);
      if (!nested) return `${a}，而且 ${stmtText(s.b, true)}`;
      // Keep a space between a formula and 而且: 「a ∣ b 而且 b ∣ c」, but 「a 是偶數而且 …」.
      return `${a}${/[a-z0-9)²³]$/.test(a) ? ' ' : ''}而且 ${stmtText(s.b, true)}`;
    }
    case 'pred': {
      const [x, y] = s.args.map(fmtExpr);
      if (s.p === 'divides') return `${x} ∣ ${y}`;
      return `${x} 是${s.p === 'even' ? '偶數' : '奇數'}`;
    }
    case 'eq':
      return `${fmtExpr(s.l)} = ${fmtExpr(s.r)}`;
  }
}

/** What a learner should see as the outermost layer. */
export function shapeName(s: Stmt): string {
  switch (s.t) {
    case 'forall':
      return '對每個';
    case 'exists':
      return '存在';
    case 'imp':
      return '若…則';
    case 'and':
      return '而且';
    case 'pred':
      return s.p === 'divides' ? '整除' : s.p === 'even' ? '是偶數' : '是奇數';
    case 'eq':
      return '等式';
  }
}

export interface CardInfo {
  id: CardId;
  side: 'goal' | 'given';
  name: string;
  /** The shape it applies to, as named in feedback. */
  shape: string;
  /** The same shape as drawn on the card, with the letters its line refers to. */
  chip: string;
  line: string;
}

export const CARDS: Record<CardId, CardInfo> = {
  intro: { id: 'intro', side: 'goal', name: '令任意', shape: '對每個', chip: '對每個 x', line: '令 x 為任意整數，改證裡面那句' },
  assume: { id: 'assume', side: 'goal', name: '假設前提', shape: '若…則', chip: '若 P，則 Q', line: '把 P 放進已知，改證 Q' },
  unfoldGoal: { id: 'unfoldGoal', side: 'goal', name: '展開目標', shape: '定義詞', chip: '定義詞', line: '把目標換成定義說的話' },
  witness: { id: 'witness', side: 'goal', name: '提出證人', shape: '存在', chip: '存在 m', line: '由你寫出 m 是多少' },
  check: { id: 'check', side: 'goal', name: '代入化簡', shape: '等式', chip: '等式', line: '代入已知，兩邊展開比較' },
  split: { id: 'split', side: 'given', name: '拆開而且', shape: '而且', chip: 'P，而且 Q', line: '拆成兩條已知' },
  unfold: { id: 'unfold', side: 'given', name: '展開已知', shape: '定義詞', chip: '定義詞', line: '把已知換成定義說的話' },
  obtain: { id: 'obtain', side: 'given', name: '取出命名', shape: '存在', chip: '存在 k', line: '拿出那個整數，替它取名字' },
  exact: { id: 'exact', side: 'goal', name: '對上已知', shape: '已知裡有', chip: '目標 ＝ 已知', line: '目標和某條已知一模一樣：完成' },
  lemma: { id: 'lemma', side: 'given', name: '引用定理', shape: 'x ∣ y、y ∣ z', chip: '7.2 證過', line: '已知 x ∣ y、y ∣ z：得到 x ∣ z' },
};

/** The cards chapter 6 unlocks; later chapters add to this list. */
export const CH6_CARDS: CardId[] = ['intro', 'assume', 'unfoldGoal', 'witness', 'check', 'split', 'unfold', 'obtain'];
export const CH7_CARDS: CardId[] = [...CH6_CARDS, 'exact', 'lemma'];

const fitsShape = (card: CardId, s: Stmt): boolean => {
  switch (card) {
    case 'intro':
      return s.t === 'forall';
    case 'assume':
      return s.t === 'imp';
    case 'unfoldGoal':
    case 'unfold':
      return s.t === 'pred';
    case 'witness':
    case 'obtain':
      return s.t === 'exists';
    case 'check':
      return s.t === 'eq';
    case 'split':
      return s.t === 'and';
    case 'exact':
    case 'lemma':
      return false;
  }
};

/** Does a goal card apply to the goal; which unused givens does a given card apply to. */
export function goalFits(st: BoardState, card: GoalCard): boolean {
  return !!st.goal && fitsShape(card, st.goal);
}
export function givensFor(st: BoardState, card: GivenCard): string[] {
  return st.hyps.filter((h) => !h.used && fitsShape(card, h.s)).map((h) => h.id);
}

/** The first goal card for a goal, used by the "read the outermost layer" drills. */
export function firstCard(goal: Stmt): GoalCard {
  return (['intro', 'assume', 'unfoldGoal', 'witness', 'check'] as GoalCard[]).find((c) => fitsShape(c, goal))!;
}

// ── moves ───────────────────────────────────────────────────────────

const usedNames = (st: BoardState): Set<string> => new Set(st.objs.map((o) => o.name));

const FRESH = ['m', 'j', 'p', 'q', 'r', 't', 'u'];
const fresh = (st: BoardState, prefer: string[]): string => {
  const taken = usedNames(st);
  return prefer.find((v) => !taken.has(v)) ?? ALL.find((v) => !taken.has(v))!;
};

/** Definitions in the course's words (ℤ): even ⇔ ∃k t = 2k; odd ⇔ ∃k t = 2k + 1; d ∣ n ⇔ ∃k n = dk. */
function unfoldPred(s: Extract<Stmt, { t: 'pred' }>, v: string): Stmt {
  const V: ExprNode = { t: 'var', name: v };
  const two: ExprNode = T('2');
  const [x, y] = s.args;
  if (s.p === 'even') return { t: 'exists', v, body: { t: 'eq', l: x, r: { t: 'bin', op: '*', a: two, b: V } } };
  if (s.p === 'odd')
    return { t: 'exists', v, body: { t: 'eq', l: x, r: { t: 'bin', op: '+', a: { t: 'bin', op: '*', a: two, b: V }, b: T('1') } } };
  return { t: 'exists', v, body: { t: 'eq', l: y, r: { t: 'bin', op: '*', a: x, b: V } } };
}

function substStmt(s: Stmt, v: string, by: ExprNode): Stmt {
  switch (s.t) {
    case 'forall':
      return s.vs.includes(v) ? s : { ...s, body: substStmt(s.body, v, by) };
    case 'exists':
      return s.v === v ? s : { ...s, body: substStmt(s.body, v, by) };
    case 'imp':
    case 'and':
      return { ...s, a: substStmt(s.a, v, by), b: substStmt(s.b, v, by) };
    case 'pred':
      return { ...s, args: s.args.map((a) => substExpr(a, v, by)) };
    case 'eq':
      return { ...s, l: substExpr(s.l, v, by), r: substExpr(s.r, v, by) };
  }
}

/** Solve the equation l = r for the letter v when v appears only as ±v (degree 1, alone); null otherwise. */
function solveFor(l: ExprNode, r: ExprNode, v: string): Poly | null {
  const pl = toPoly(l);
  const pr = toPoly(r);
  if (!pl.ok || !pr.ok) return null;
  const P = padd(pl.p, pr.p, -1);
  const lin = `${v}1`;
  const c = P.get(lin);
  if (c !== 1 && c !== -1) return null;
  for (const k of P.keys()) if (k !== lin && k.split('.').some((part) => part[0] === v)) return null;
  const rest = padd(P, pvar(v), -c);
  return c === 1 ? padd(new Map(), rest, -1) : rest;
}

export interface Def {
  v: string;
  h: string;
  node: ExprNode;
  /** True when the board had to solve the given for v (b + c = ak → b = ak − c). */
  solved: boolean;
}

/** Every way the givens let you replace the letter v. */
export function defsFor(st: BoardState, v: string): Def[] {
  const out: Def[] = [];
  for (const h of st.hyps) {
    if (h.s.t !== 'eq') continue;
    if (h.s.l.t === 'var' && h.s.l.name === v) {
      out.push({ v, h: h.id, node: h.s.r, solved: false });
      continue;
    }
    if (h.s.l.t === 'var') continue;
    const p = solveFor(h.s.l, h.s.r, v);
    if (p) out.push({ v, h: h.id, node: polyToExpr(p), solved: true });
  }
  return out;
}

/**
 * Definitions the board substitutes when checking: givens x = (…) first, then other
 * equations solved for a letter that is not yet defined (one letter per equation).
 */
function definitions(st: BoardState): Record<string, Poly> {
  const defs: Record<string, Poly> = {};
  const rest: Extract<Stmt, { t: 'eq' }>[] = [];
  for (const h of st.hyps) {
    if (h.s.t !== 'eq') continue;
    if (h.s.l.t !== 'var') {
      rest.push(h.s);
      continue;
    }
    const p = toPoly(h.s.r);
    if (p.ok) defs[h.s.l.name] = p.p;
  }
  for (const e of rest) {
    const vars = [...new Set([...exprVars(e.l), ...exprVars(e.r)])];
    for (const v of vars) {
      if (v in defs) continue;
      const p = solveFor(e.l, e.r, v);
      if (p) {
        defs[v] = p;
        break;
      }
    }
  }
  return defs;
}

function expand(n: ExprNode, defs: Record<string, Poly>): Poly | null {
  const p = toPoly(n);
  if (!p.ok) return null;
  let r = p.p;
  for (let i = 0; i < 6; i++) r = psubst(r, defs);
  return r;
}

/** Forward expansion of an expression using the givens, for the 6.5 bridge; null if nothing to substitute. */
export function forwardText(st: BoardState, n: ExprNode): string | null {
  const defs = definitions(st);
  if (!exprVars(n).some((v) => v in defs)) return null;
  const p = expand(n, defs);
  return p ? fmtPoly(p) : null;
}

const withHyp = (st: BoardState, s: Stmt): [BoardState, string] => {
  const id = `H${st.nextH}`;
  return [{ ...st, hyps: [...st.hyps, { id, s }], nextH: st.nextH + 1 }, id];
};

const markUsed = (st: BoardState, id: string, used: string): BoardState => ({
  ...st,
  hyps: st.hyps.map((h) => (h.id === id ? { ...h, used } : h)),
});

const log = (st: BoardState, card: CardId, text: string, tag: LogEntry['tag'] = 'shape'): BoardState => ({
  ...st,
  log: [...st.log, { card, text, tag }],
});

const newGoal = (st: BoardState, goal: Stmt | null): BoardState => ({
  ...st,
  past: st.goal ? [...st.past, st.goal] : st.past,
  goal,
});

export function startBoard(start: BoardStart): BoardState {
  let st: BoardState = { objs: start.objs ?? [], hyps: [], goal: start.goal, past: [], nextH: 1, log: [] };
  for (const h of start.hyps ?? []) st = withHyp(st, h)[0];
  return st;
}

export function wrongGoalCard(goal: Stmt, card: GoalCard): string {
  const c = CARDS[card];
  const outer = shapeName(goal);
  const inner =
    card === 'unfoldGoal' && (goal.t === 'forall' || goal.t === 'imp')
      ? '目標裡雖然有定義詞，但它包在裡面。先處理最外面一層。'
      : '';
  return `目標最外面一層是「${outer}」。「${c.name}」只能用在最外層是「${c.shape}」的目標上。${inner}`;
}

/** Pairs of givens that match the proved lemma x ∣ y, y ∣ z ⇒ x ∣ z (and whose conclusion is not on the board yet). */
export function lemmaPairs(st: BoardState): { h1: string; h2: string; out: Stmt }[] {
  const divs = st.hyps.filter((h) => h.s.t === 'pred' && h.s.p === 'divides');
  const have = new Set(st.hyps.map((h) => stmtText(h.s)));
  const out: { h1: string; h2: string; out: Stmt }[] = [];
  for (const x of divs)
    for (const y of divs) {
      if (x === y) continue;
      const [a, b] = (x.s as Extract<Stmt, { t: 'pred' }>).args;
      const [b2, c] = (y.s as Extract<Stmt, { t: 'pred' }>).args;
      if (fmtExpr(b) !== fmtExpr(b2)) continue;
      const s: Stmt = { t: 'pred', p: 'divides', args: [a, c] };
      if (!have.has(stmtText(s))) out.push({ h1: x.id, h2: y.id, out: s });
    }
  return out;
}

export function applyMove(st: BoardState, mv: Move): MoveResult {
  const c = CARDS[mv.card];
  if (!st.goal) return { ok: false, code: 'done', msg: '目標已經清空了，證明完成。' };

  if (mv.card === 'exact') {
    const g = stmtText(st.goal);
    const h = st.hyps.find((x) => stmtText(x.s) === g);
    if (!h) return { ok: false, code: 'none', msg: '已知裡沒有和目標一模一樣的句子。' };
    return { ok: true, state: log(newGoal(st, null), 'exact', `目標就是 ${h.id}，完成`) };
  }
  if (mv.card === 'lemma') {
    const pair = lemmaPairs(st).find((p) => p.h1 === mv.h1 && p.h2 === mv.h2);
    if (!pair) return { ok: false, code: 'none', msg: '已知裡找不到一對「x ∣ y、y ∣ z」：第一條的右邊要和第二條的左邊一樣。' };
    const [s1, id] = withHyp(st, pair.out);
    return { ok: true, state: log(s1, 'lemma', `引用定理：${mv.h1}、${mv.h2} ⇒ ${id}：${stmtText(pair.out)}`) };
  }

  if (c.side === 'goal') {
    const goal = st.goal;
    if (!fitsShape(mv.card, goal)) return { ok: false, code: 'shape', msg: wrongGoalCard(goal, mv.card as GoalCard) };

    switch (mv.card) {
      case 'intro': {
        const g = goal as Extract<Stmt, { t: 'forall' }>;
        const objs = [...st.objs, ...g.vs.map((v): Obj => ({ name: v, kind: 'arb' }))];
        return { ok: true, state: log(newGoal({ ...st, objs }, g.body), 'intro', `令 ${g.vs.join('、')} 為任意整數（對手給的）`) };
      }
      case 'assume': {
        const g = goal as Extract<Stmt, { t: 'imp' }>;
        const [s1, id] = withHyp(st, g.a);
        return { ok: true, state: log(newGoal(s1, g.b), 'assume', `假設 ${stmtText(g.a)}，記成 ${id}`) };
      }
      case 'unfoldGoal': {
        const g = goal as Extract<Stmt, { t: 'pred' }>;
        const next = unfoldPred(g, fresh(st, FRESH));
        return { ok: true, state: log(newGoal(st, next), 'unfoldGoal', `展開目標：${stmtText(next)}`) };
      }
      case 'witness': {
        const g = goal as Extract<Stmt, { t: 'exists' }>;
        const pending = st.hyps.find((h) => !h.used && h.s.t !== 'eq');
        if (pending) {
          return {
            ok: false,
            code: 'early',
            msg: `${g.v} 只能用板上已有的字母寫，可是已知還沒展開完：${pending.id}「${stmtText(pending.s)}」還能再處理。先從已知拿到能用的字母，再回來選 ${g.v}。`,
          };
        }
        const names = st.objs.map((o) => o.name);
        const p = parseExpr((mv as { src: string }).src, names);
        if (!p.ok) {
          const msg = p.msg.startsWith('這裡只能用') ? `${p.msg}${g.v} 只能用板上已有的字母寫。` : p.msg;
          return { ok: false, code: 'parse', msg };
        }
        const poly = toPoly(p.node);
        if (!poly.ok) {
          return {
            ok: false,
            code: 'div',
            msg:
              poly.why === 'div'
                ? `有除法的式子，看不出 ${g.v} 是不是整數；而「是不是整數」正是這一題要證的事，不能拿來當理由。只用 +、−、× 和板上的字母寫。`
                : `式子裡有小數或分數，看不出 ${g.v} 是整數。只用整數、+、−、× 和板上的字母寫。`,
          };
        }
        const shown = fmtExpr(p.node);
        const objs = [...st.objs, { name: g.v, kind: 'chosen' as const, def: p.node }];
        const next = substStmt(g.body, g.v, p.node);
        return { ok: true, state: log(newGoal({ ...st, objs }, next), 'witness', `選 ${g.v} = ${shown}`, 'idea') };
      }
      case 'check': {
        const g = goal as Extract<Stmt, { t: 'eq' }>;
        const defs = definitions(st);
        const l = expand(g.l, defs);
        const r = expand(g.r, defs);
        if (!l || !r) return { ok: false, code: 'div', msg: '等式裡有除法，板子沒辦法比對。' };
        const lt = fmtPoly(l);
        const rt = fmtPoly(r);
        if (!peq(l, r)) {
          const w = st.objs.find((o) => o.kind === 'chosen' && o.def && !exprVars(o.def).length);
          const fixed = w ? `${w.name} = ${fmtExpr(w.def!)} 是一個固定的數，最多只對特定幾組對手的出招成立；證人要用拿到的字母寫，才能跟著對手變。` : '';
          return {
            ok: false,
            code: 'neq',
            msg: `代入已知之後，左邊 ${fmtExpr(g.l)} 展開是 ${lt}，右邊 ${fmtExpr(g.r)} 展開是 ${rt}。兩邊不一樣，所以這個證人不行。${fixed}`,
          };
        }
        const done: BoardState = { ...newGoal(st, null), checked: { lSrc: fmtExpr(g.l), rSrc: fmtExpr(g.r), both: lt } };
        return { ok: true, state: log(done, 'check', `代入化簡：兩邊都是 ${lt}，目標完成`) };
      }
    }
  }

  // Given cards.
  const h = st.hyps.find((x) => x.id === (mv as { h: string }).h);
  if (!h || h.used || !fitsShape(mv.card, h.s)) {
    return { ok: false, code: 'none', msg: `已知裡沒有還沒用過、形狀是「${c.shape}」的句子。` };
  }
  switch (mv.card) {
    case 'split': {
      const s = h.s as Extract<Stmt, { t: 'and' }>;
      const [s1, a] = withHyp(st, s.a);
      const [s2, b] = withHyp(s1, s.b);
      return { ok: true, state: log(markUsed(s2, h.id, `已拆開 → ${a}、${b}`), 'split', `拆開 ${h.id} → ${a}、${b}`) };
    }
    case 'unfold': {
      const s = h.s as Extract<Stmt, { t: 'pred' }>;
      // The definition's own letter: two unfolded givens may both say 「存在整數 k」.
      const [s1, id] = withHyp(st, unfoldPred(s, 'k'));
      return { ok: true, state: log(markUsed(s1, h.id, `已展開 → ${id}`), 'unfold', `展開 ${h.id} → ${id}`) };
    }
    case 'obtain': {
      const s = h.s as Extract<Stmt, { t: 'exists' }>;
      const name = (mv as { name: string }).name.trim().toLowerCase();
      if (!/^[a-z]$/.test(name)) return { ok: false, code: 'name', msg: '名字請用一個英文字母。' };
      const clash = st.objs.find((o) => o.name === name);
      if (clash) return { ok: false, code: 'clash', msg: clashMsg(st, clash, s, name) };
      if (st.goal && goalLetters(st.goal).includes(name)) {
        return { ok: false, code: 'clash', msg: `${name} 已經出現在目標裡，代表你等一下要選的數。換一個名字，免得兩件事混在一起。` };
      }
      const objs = [...st.objs, { name, kind: 'got' as const, from: h.id }];
      const body = substStmt(s.body, s.v, { t: 'var', name });
      const [s1, id] = withHyp({ ...st, objs }, body);
      return {
        ok: true,
        state: log(markUsed(s1, h.id, `已取出 ${name} → ${id}`), 'obtain', `從 ${h.id} 取出整數 ${name}，得到 ${id}：${stmtText(body)}`),
      };
    }
  }
  return { ok: false, code: 'none', msg: '這張卡現在用不上。' };
}

function goalLetters(s: Stmt): string[] {
  switch (s.t) {
    case 'forall':
      return [...s.vs, ...goalLetters(s.body)];
    case 'exists':
      return [s.v, ...goalLetters(s.body)];
    case 'imp':
    case 'and':
      return [...goalLetters(s.a), ...goalLetters(s.b)];
    case 'pred':
      return s.args.flatMap(exprVars);
    case 'eq':
      return [...exprVars(s.l), ...exprVars(s.r)];
  }
}

function clashMsg(st: BoardState, o: Obj, s: Extract<Stmt, { t: 'exists' }>, name: string): string {
  const would = stmtText(substStmt(s.body, s.v, { t: 'var', name }));
  if (o.kind === 'got') {
    const def = st.hyps.find((h) => h.s.t === 'eq' && exprVars(h.s.r).includes(name) && h.s.l.t === 'var');
    const before = def ? `已知說 ${stmtText(def.s)}；` : '';
    const x = def && def.s.t === 'eq' && def.s.l.t === 'var' ? def.s.l.name : null;
    const y = s.body.t === 'eq' && s.body.l.t === 'var' ? s.body.l.name : null;
    const same = x && y ? ` ${x} 和 ${y} 一樣大` : '兩個數一樣大';
    return `${name} 已經是從 ${o.from} 拿到的名字。${before}這裡如果也叫 ${name}，就變成 ${would}，等於偷偷假設${same}。換一個名字。`;
  }
  if (o.kind === 'arb') return `${name} 是對手給的整數。從 ${s.v === name ? '這條已知' : '這裡'}拿到的是另一個數，要另取名字。`;
  return `${name} 是你選的數，已經有它的式子了。換一個名字。`;
}

/** Apply a scripted list of moves; throws if the script is wrong (author error). */
export function replay(start: BoardStart, moves: Move[]): BoardState {
  let st = startBoard(start);
  for (const mv of moves) {
    const r = applyMove(st, mv);
    if (!r.ok) throw new Error(`script move ${mv.card} failed: ${r.msg}`);
    st = r.state;
  }
  return st;
}

// ── the chapter's theorems ──────────────────────────────────────────

/** 對每個整數 a、b，若 a 是偶數而且 b 是偶數，則 a + b 是偶數。 */
export const EVEN_SUM: BoardStart = { goal: forall(['a', 'b'], imp(and(even('a'), even('b')), even('a + b'))) };

export const EVEN_SUM_OPENING: Move[] = [{ card: 'intro' }, { card: 'assume' }, { card: 'unfoldGoal' }];
export const EVEN_SUM_GIVENS: Move[] = [
  { card: 'split', h: 'H1' },
  { card: 'unfold', h: 'H2' },
  { card: 'obtain', h: 'H4', name: 'k' },
  { card: 'unfold', h: 'H3' },
  { card: 'obtain', h: 'H6', name: 'l' },
];
export const EVEN_SUM_FULL: Move[] = [
  ...EVEN_SUM_OPENING,
  ...EVEN_SUM_GIVENS,
  { card: 'witness', src: 'k + l' },
  { card: 'check' },
];

/** 對每個整數 n，若 n 是奇數，則 n² 是奇數。 */
export const ODD_SQUARE: BoardStart = { goal: forall(['n'], imp(odd('n'), odd('n^2'))) };

/** The 6.5 bridge for a goal 「存在 v，使 L = R(v)」: L, R with v left as □, and L expanded forward from the givens. */
export interface Bridge {
  v: string;
  left: string;
  back: string;
  fwd: string | null;
}
export function bridgeOf(st: BoardState): Bridge | null {
  const g = st.goal;
  if (!g || g.t !== 'exists' || g.body.t !== 'eq') return null;
  const blank: ExprNode = { t: 'var', name: '□' };
  return {
    v: g.v,
    left: fmtExpr(g.body.l),
    back: fmtExpr(substExpr(g.body.r, g.v, blank)),
    fwd: forwardText(st, g.body.l),
  };
}

/** 對每個整數 a、b、c，若 a ∣ b 而且 b ∣ c，則 a ∣ c。 */
export const DIV_TRANS: BoardStart = { goal: forall(['a', 'b', 'c'], imp(and(divides('a', 'b'), divides('b', 'c')), divides('a', 'c'))) };
export const DIV_TRANS_OPENING: Move[] = [
  { card: 'intro' },
  { card: 'assume' },
  { card: 'split', h: 'H1' },
  { card: 'unfold', h: 'H2' },
  { card: 'obtain', h: 'H4', name: 'k' },
  { card: 'unfold', h: 'H3' },
  { card: 'obtain', h: 'H6', name: 'l' },
  { card: 'unfoldGoal' },
];

/** The false claim of 7.3: 若 a ∣ b + c，則 a ∣ b。 */
export const DIV_SUM_FALSE: BoardStart = { goal: forall(['a', 'b', 'c'], imp(divides('a', 'b + c'), divides('a', 'b'))) };
/** Its repair in 7.4: 若 a ∣ b + c 而且 a ∣ c，則 a ∣ b。 */
export const DIV_SUM_FIXED: BoardStart = {
  goal: forall(['a', 'b', 'c'], imp(and(divides('a', 'b + c'), divides('a', 'c')), divides('a', 'b'))),
};

/** 7.5: 若 a ∣ b、b ∣ c、c ∣ d，則 a ∣ d。 */
export const DIV_CHAIN: BoardStart = {
  goal: forall(['a', 'b', 'c', 'd'], imp(and(and(divides('a', 'b'), divides('b', 'c')), divides('c', 'd')), divides('a', 'd'))),
};
/** The same proof without the lemma: every letter taken out by hand. */
export const DIV_CHAIN_BY_HAND: Move[] = [
  { card: 'intro' },
  { card: 'assume' },
  { card: 'split', h: 'H1' },
  { card: 'split', h: 'H2' },
  { card: 'unfold', h: 'H4' },
  { card: 'obtain', h: 'H6', name: 'k' },
  { card: 'unfold', h: 'H5' },
  { card: 'obtain', h: 'H8', name: 'l' },
  { card: 'unfold', h: 'H3' },
  { card: 'obtain', h: 'H10', name: 'j' },
  { card: 'unfoldGoal' },
  { card: 'witness', src: 'klj' },
  { card: 'check' },
];
