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
  | { t: 'eq'; l: ExprNode; r: ExprNode }
  | { t: 'not'; a: Stmt }
  /** The goal of a proof by contradiction: two givens that cannot both hold. */
  | { t: 'bot' };

export type GoalCard = 'intro' | 'assume' | 'unfoldGoal' | 'witness' | 'check' | 'exact' | 'contrapos' | 'contra';
/** flip works on a given or on the goal; it sits with the given cards and asks which. */
export type GivenCard = 'split' | 'unfold' | 'obtain' | 'lemma' | 'clash' | 'flip';
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
  | { card: 'lemma'; hs: string[]; lemma?: string }
  | { card: 'contrapos' }
  | { card: 'contra' }
  | { card: 'clash' }
  /** h is a given's id, or 'goal'. */
  | { card: 'flip'; h: string };

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

/**
 * A proved theorem used as one card. Pattern letters x, y, z stand for any expression:
 * hyps are matched against givens in order, concl is what you get.
 */
export interface Lemma {
  id: string;
  name: string;
  /** Where it was proved, drawn on the card: 「7.2 證過」. */
  chip: string;
  line: string;
  hyps: Stmt[];
  concl: Stmt;
}

export interface BoardState {
  lemmas: Lemma[];
  objs: Obj[];
  hyps: Hyp[];
  goal: Stmt | null;
  /** Earlier goals, oldest first. */
  past: Stmt[];
  nextH: number;
  log: LogEntry[];
  /** Expansion shown by the last 「代入化簡」. */
  checked?: { lSrc: string; rSrc: string; both: string };
  /** Why the last move closed the goal, when it was not a check (e.g. the contradiction found). */
  note?: string;
}

export interface BoardStart {
  goal: Stmt;
  objs?: Obj[];
  hyps?: Stmt[];
  /** Proved theorems the 「引用定理」 card may use; defaults to chapter 7's transitivity. */
  lemmas?: Lemma[];
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
export const not = (a: Stmt): Stmt => ({ t: 'not', a });
/** Negate, cancelling a double negation: 不是「不存在…」 is 「存在…」. */
export const neg = (s: Stmt): Stmt => (s.t === 'not' ? s.a : { t: 'not', a: s });

/** Chapter 7.2: x ∣ y, y ∣ z ⇒ x ∣ z. */
export const DIV_TRANS_LEMMA: Lemma = {
  id: 'div-trans',
  name: '整除會傳遞',
  chip: '7.2 證過',
  line: '已知 x ∣ y、y ∣ z：得到 x ∣ z',
  hyps: [divides('x', 'y'), divides('y', 'z')],
  concl: divides('x', 'z'),
};
/** Chapter 6.6: x odd ⇒ x² odd. */
export const ODD_SQ_LEMMA: Lemma = {
  id: 'odd-sq',
  name: '奇數的平方是奇數',
  chip: '6.6 證過',
  line: '已知 x 是奇數：得到 x² 是奇數',
  hyps: [odd('x')],
  concl: odd('x^2'),
};

// ── reading statements ──────────────────────────────────────────────

export function stmtText(s: Stmt, nested = false): string {
  switch (s.t) {
    case 'forall':
      return `對每個整數 ${s.vs.join('、')}，${stmtText(s.body, true)}`;
    case 'exists': {
      const [vs, body] = existsChain(s);
      return `存在整數 ${vs.join('、')}，使 ${stmtText(body, true)}`;
    }
    case 'not':
      return notText(s.a);
    case 'bot':
      return '矛盾（找出兩條互相衝突的已知）';
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

/** 存在 a，使 存在 b，使 … reads as 存在整數 a、b，使 …. */
function existsChain(s: Extract<Stmt, { t: 'exists' }>): [string[], Stmt] {
  const vs = [s.v];
  let body = s.body;
  while (body.t === 'exists') {
    vs.push(body.v);
    body = body.body;
  }
  return [vs, body];
}

function notText(a: Stmt): string {
  switch (a.t) {
    case 'pred': {
      const [x, y] = a.args.map(fmtExpr);
      if (a.p === 'divides') return `${x} ∤ ${y}`;
      return `${x} 不是${a.p === 'even' ? '偶數' : '奇數'}`;
    }
    case 'exists': {
      const [vs, body] = existsChain(a);
      return `不存在整數 ${vs.join('、')}，使 ${stmtText(body, true)}`;
    }
    case 'eq':
      return `${fmtExpr(a.l)} ≠ ${fmtExpr(a.r)}`;
    default:
      return `並非「${stmtText(a)}」`;
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
    case 'not':
      return s.a.t === 'exists' ? '不存在' : '不是';
    case 'bot':
      return '矛盾';
  }
}

export interface CardInfo {
  id: CardId;
  side: 'goal' | 'given' | 'both';
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
  contrapos: { id: 'contrapos', side: 'goal', name: '逆否', shape: '若…則', chip: '若 P，則 Q', line: '改證「若非 Q，則非 P」' },
  contra: { id: 'contra', side: 'goal', name: '反證', shape: '任何目標', chip: '目標 G', line: '假設 G 不成立，放進已知；改找矛盾' },
  clash: { id: 'clash', side: 'given', name: '指出矛盾', shape: '矛盾', chip: '又偶又奇', line: '兩條已知不能同時成立：完成' },
  flip: { id: 'flip', side: 'both', name: '換正面', shape: '不是偶數／不是奇數', chip: '不是偶數', line: '整數不是偶數，就是奇數' },
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
    case 'contrapos':
      return s.t === 'imp';
    case 'contra':
      return s.t !== 'bot';
    case 'flip':
      return s.t === 'not' && s.a.t === 'pred' && s.a.p !== 'divides';
    case 'exact':
    case 'lemma':
    case 'clash':
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
    case 'not':
      return { ...s, a: substStmt(s.a, v, by) };
    case 'bot':
      return s;
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
  let st: BoardState = {
    lemmas: start.lemmas ?? [DIV_TRANS_LEMMA],
    objs: start.objs ?? [],
    hyps: [],
    goal: start.goal,
    past: [],
    nextH: 1,
    log: [],
  };
  for (const h of start.hyps ?? []) st = withHyp(st, h)[0];
  return st;
}

export function wrongGoalCard(goal: Stmt, card: GoalCard): string {
  const c = CARDS[card];
  const outer = shapeName(goal);
  const inner =
    card === 'unfoldGoal' && (goal.t === 'forall' || goal.t === 'imp')
      ? '目標裡雖然有定義詞，但它包在裡面。先處理最外面一層。'
      : card === 'unfoldGoal' && fitsShape('flip', goal)
        ? '「不是偶數」沒有定義可以展開：定義只說偶數長什麼樣子，沒說「不是偶數」長什麼樣子。先用「換正面」把它換成正面的說法。'
        : card === 'contrapos' && goal.t === 'forall'
          ? '「若…則」包在「對每個」裡面，先令任意。'
          : goal.t === 'not' && goal.a.t === 'exists'
            ? '「不存在」沒有證人可以提，也沒有定義可以展開；要一組一組排除，又有無限多組。這種目標要翻過來處理。'
            : '';
  return `目標最外面一層是「${outer}」。「${c.name}」只能用在最外層是「${c.shape}」的目標上。${inner}`;
}

const PATTERN = new Set(['x', 'y', 'z']);
type Bind = Map<string, ExprNode>;

function matchExpr(p: ExprNode, e: ExprNode, b: Bind): boolean {
  if (p.t === 'var' && PATTERN.has(p.name)) {
    const had = b.get(p.name);
    if (had) return fmtExpr(had) === fmtExpr(e);
    b.set(p.name, e);
    return true;
  }
  if (p.t !== e.t) return false;
  switch (p.t) {
    case 'num':
      return p.v.n === (e as typeof p).v.n && p.v.d === (e as typeof p).v.d;
    case 'var':
      return p.name === (e as typeof p).name;
    case 'neg':
      return matchExpr(p.a, (e as typeof p).a, b);
    case 'pow':
      return p.e === (e as typeof p).e && matchExpr(p.a, (e as typeof p).a, b);
    case 'bin': {
      const f = e as typeof p;
      return p.op === f.op && matchExpr(p.a, f.a, b) && matchExpr(p.b, f.b, b);
    }
  }
}

function matchStmt(p: Stmt, s: Stmt, b: Bind): boolean {
  if (p.t !== s.t) return false;
  switch (p.t) {
    case 'pred': {
      const q = s as typeof p;
      return p.p === q.p && p.args.length === q.args.length && p.args.every((a, i) => matchExpr(a, q.args[i], b));
    }
    case 'eq': {
      const q = s as typeof p;
      return matchExpr(p.l, q.l, b) && matchExpr(p.r, q.r, b);
    }
    case 'not':
      return matchStmt(p.a, (s as typeof p).a, b);
    case 'and':
    case 'imp': {
      const q = s as typeof p;
      return matchStmt(p.a, q.a, b) && matchStmt(p.b, q.b, b);
    }
    default:
      return false;
  }
}

/** Put the bound expressions into the conclusion (renaming first, so x → y → … cannot chain). */
function instantiate(s: Stmt, b: Bind): Stmt {
  let out = s;
  for (const v of b.keys()) out = substStmt(out, v, { t: 'var', name: `#${v}` });
  for (const [v, e] of b) out = substStmt(out, `#${v}`, e);
  return out;
}

export interface LemmaUse {
  lemma: Lemma;
  hs: string[];
  out: Stmt;
}

/** Every way the givens match a proved theorem's premises, whose conclusion is not on the board yet. */
export function lemmaUses(st: BoardState): LemmaUse[] {
  const have = new Set(st.hyps.map((h) => stmtText(h.s)));
  const out: LemmaUse[] = [];
  const seen = new Set<string>();
  for (const L of st.lemmas) {
    const go = (i: number, hs: string[], b: Bind) => {
      if (i === L.hyps.length) {
        const s = instantiate(L.concl, b);
        const key = stmtText(s);
        if (!have.has(key) && !seen.has(key + hs.join())) {
          seen.add(key + hs.join());
          out.push({ lemma: L, hs, out: s });
        }
        return;
      }
      for (const h of st.hyps) {
        if (hs.includes(h.id)) continue;
        const nb: Bind = new Map(b);
        if (matchStmt(L.hyps[i], h.s, nb)) go(i + 1, [...hs, h.id], nb);
      }
    };
    go(0, [], new Map());
  }
  return out;
}

/** Chapter 7's view: pairs for the transitivity lemma. */
export function lemmaPairs(st: BoardState): { h1: string; h2: string; out: Stmt }[] {
  return lemmaUses(st)
    .filter((u) => u.lemma.id === 'div-trans')
    .map((u) => ({ h1: u.hs[0], h2: u.hs[1], out: u.out }));
}

const swapParity = (s: Stmt): Stmt => {
  const p = (s as { a: Extract<Stmt, { t: 'pred' }> }).a;
  return { t: 'pred', p: p.p === 'even' ? 'odd' : 'even', args: p.args };
};

/** Even: every coefficient even. Odd: every non-constant coefficient even, the constant odd. */
function parityOf(p: Poly): 'even' | 'odd' | null {
  for (const [k, c] of p) if (k !== '' && c % 2 !== 0) return null;
  return Math.abs(p.get('') ?? 0) % 2 === 0 ? 'even' : 'odd';
}

/** 4a + 6b → 2(2a + 3b); 4l² + 4l + 1 → 2(2l² + 2l) + 1; 2k → 2k. */
function parityForm(p: Poly): string {
  const c0 = p.get('') ?? 0;
  const rest = new Map([...p].filter(([k]) => k !== ''));
  if (!rest.size) return fmtPoly(p);
  const half = padd(new Map(), rest, 0.5);
  const hs = fmtPoly(half);
  const one = half.size === 1 && [...half.values()][0] === 1;
  const body = one ? `2${hs}` : `2(${hs})`;
  return c0 === 0 ? body : `${body} ${c0 > 0 ? '+' : '−'} ${Math.abs(c0)}`;
}

/** Two givens that cannot both hold: P and 不是 P; X even and X odd; an equation whose two sides have opposite parity. */
export function findClash(st: BoardState): { hs: string[]; text: string } | null {
  const hs = st.hyps;
  for (const a of hs)
    for (const b of hs) {
      if (a === b) continue;
      if (b.s.t === 'not' && stmtText(b.s.a) === stmtText(a.s)) {
        return { hs: [a.id, b.id], text: `${a.id} 說「${stmtText(a.s)}」，${b.id} 說「${stmtText(b.s)}」，兩條不能同時成立。` };
      }
      if (a.s.t === 'pred' && b.s.t === 'pred' && a.s.p === 'even' && b.s.p === 'odd' && fmtExpr(a.s.args[0]) === fmtExpr(b.s.args[0])) {
        const x = fmtExpr(a.s.args[0]);
        return { hs: [a.id, b.id], text: `${a.id} 說 ${x} 是偶數，${b.id} 說 ${x} 是奇數；一個整數不會又是偶數又是奇數。` };
      }
    }
  const defs = definitions(st);
  for (const h of hs) {
    if (h.s.t !== 'eq') continue;
    const l = expand(h.s.l, defs);
    const r = expand(h.s.r, defs);
    if (!l || !r) continue;
    const pl = parityOf(l);
    const pr = parityOf(r);
    if (!pl || !pr || pl === pr) continue;
    const side = (src: ExprNode, p: Poly) => {
      const parts = [fmtExpr(src), fmtPoly(p), parityForm(p)];
      return parts.filter((x, i) => parts.indexOf(x) === i).join(' = ');
    };
    const word = (x: 'even' | 'odd') => (x === 'even' ? '偶數' : '奇數');
    return {
      hs: [h.id],
      text: `${h.id}「${stmtText(h.s)}」：左邊 ${side(h.s.l, l)} 是${word(pl)}，右邊 ${side(h.s.r, r)} 是${word(pr)}；一個整數不會又是偶數又是奇數。`,
    };
  }
  return null;
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
    const use = lemmaUses(st).find((u) => u.hs.join() === mv.hs.join() && (!mv.lemma || u.lemma.id === mv.lemma));
    if (!use) {
      const msg =
        st.lemmas.length === 1 && st.lemmas[0].id === 'div-trans'
          ? '已知裡找不到一對「x ∣ y、y ∣ z」：第一條的右邊要和第二條的左邊一樣。'
          : '已知裡找不到符合證過的定理前提的句子。';
      return { ok: false, code: 'none', msg };
    }
    const [s1, id] = withHyp(st, use.out);
    const tail = st.lemmas.length > 1 || use.lemma.id !== 'div-trans' ? `（${use.lemma.chip}）` : '';
    return { ok: true, state: log(s1, 'lemma', `引用定理：${mv.hs.join('、')} ⇒ ${id}：${stmtText(use.out)}${tail}`) };
  }
  if (mv.card === 'clash') {
    if (st.goal.t !== 'bot') {
      return { ok: false, code: 'shape', msg: '「指出矛盾」只在目標是「找出矛盾」時才用得上。想走這條路，先出「反證」。' };
    }
    const c = findClash(st);
    if (!c) {
      return {
        ok: false,
        code: 'none',
        msg: '已知裡還找不到兩條互相衝突的句子。「存在」要先取出、定義詞要先展開，衝突常常要等等式出現才看得到。',
      };
    }
    return { ok: true, state: log({ ...newGoal(st, null), note: c.text }, 'clash', `指出矛盾：${c.text}`) };
  }
  if (mv.card === 'flip') {
    if (mv.h === 'goal') {
      if (!fitsShape('flip', st.goal)) return { ok: false, code: 'shape', msg: '目標不是「不是偶數」或「不是奇數」的形狀。' };
      const next = swapParity(st.goal);
      return {
        ok: true,
        state: log(newGoal(st, next), 'flip', `換正面：目標「${stmtText(st.goal)}」就是「${stmtText(next)}」`),
      };
    }
    const h = st.hyps.find((x) => x.id === mv.h);
    if (!h || h.used || !fitsShape('flip', h.s)) {
      return { ok: false, code: 'none', msg: '已知裡沒有還沒用過的「不是偶數」或「不是奇數」。' };
    }
    const next = swapParity(h.s);
    const [s1, id] = withHyp(st, next);
    return {
      ok: true,
      state: log(markUsed(s1, h.id, `已換成 → ${id}`), 'flip', `換正面：${h.id}「${stmtText(h.s)}」就是「${stmtText(next)}」，記成 ${id}`),
    };
  }

  if (c.side === 'goal') {
    const goal = st.goal;
    if (!fitsShape(mv.card, goal)) return { ok: false, code: 'shape', msg: wrongGoalCard(goal, mv.card as GoalCard) };

    switch (mv.card) {
      case 'contrapos': {
        const g = goal as Extract<Stmt, { t: 'imp' }>;
        const next: Stmt = { t: 'imp', a: neg(g.b), b: neg(g.a) };
        return { ok: true, state: log(newGoal(st, next), 'contrapos', `逆否：改證「${stmtText(next)}」`, 'idea') };
      }
      case 'contra': {
        const [s1, id] = withHyp(st, neg(goal));
        return {
          ok: true,
          state: log(newGoal(s1, { t: 'bot' }), 'contra', `反證：假設目標不成立，記成 ${id}：${stmtText(neg(goal))}；改找矛盾`, 'idea'),
        };
      }
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
        const pending = st.hyps.find((h) => !h.used && h.s.t !== 'eq' && (h.s.t !== 'not' || fitsShape('flip', h.s)));
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
    case 'not':
      return goalLetters(s.a);
    case 'bot':
      return [];
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

// ── chapter 8 ───────────────────────────────────────────────────────

/** 對每個整數 n，若 n² 是偶數，則 n 是偶數。 */
export const EVEN_SQ: BoardStart = { goal: forall(['n'], imp(even('n^2'), even('n'))) };
/** 8.1: the direct attempt, up to the bridge that cannot be crossed. */
export const EVEN_SQ_DIRECT: Move[] = [
  { card: 'intro' },
  { card: 'assume' },
  { card: 'unfold', h: 'H1' },
  { card: 'obtain', h: 'H2', name: 'k' },
  { card: 'unfoldGoal' },
];
/** 8.2: the same theorem through the contrapositive. */
export const EVEN_SQ_CONTRAPOS: Move[] = [
  { card: 'intro' },
  { card: 'contrapos' },
  { card: 'assume' },
  { card: 'flip', h: 'H1' },
  { card: 'flip', h: 'goal' },
  { card: 'unfold', h: 'H2' },
  { card: 'obtain', h: 'H3', name: 'k' },
  { card: 'unfoldGoal' },
  { card: 'witness', src: '2k^2 + 2k' },
  { card: 'check' },
];
/** 8.6: the same theorem by contradiction, citing 6.6. */
export const EVEN_SQ_BY_CONTRA: BoardStart = { ...EVEN_SQ, lemmas: [ODD_SQ_LEMMA] };
export const EVEN_SQ_CONTRA: Move[] = [
  { card: 'intro' },
  { card: 'assume' },
  { card: 'contra' },
  { card: 'flip', h: 'H2' },
  { card: 'lemma', hs: ['H3'] },
  { card: 'clash' },
];

/** 8.3: 不存在整數 a、b，使 4a + 6b = c. */
export const noSolution = (c: number): BoardStart => ({ goal: not(exists('a', exists('b', eqn('4a + 6b', String(c))))) });
export const NO_SOLUTION_MOVES: Move[] = [
  { card: 'contra' },
  { card: 'obtain', h: 'H1', name: 'a' },
  { card: 'obtain', h: 'H2', name: 'b' },
  { card: 'clash' },
];
